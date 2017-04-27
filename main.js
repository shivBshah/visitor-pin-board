"use strict";

let DBConnection = require('./scripts/dbconnection.js');
let MarkerClusterer = require('./scripts/marker-clusterer.js');
let fs = require('fs');

let map;
let marker;
let geocodeResults;
let geocoder;
let autocomplete;

//create database connection
let conn = (function() {
    let db = new DBConnection();
    return db.connect();
})();
  

function initMap() {
   //read initial map style data from file
    let styledata = fs.readFileSync('google-maps-style.json');

    //create map with that style
    createMap(JSON.parse(styledata));

    google.maps.event.addListener(map, 'click', function( event ){
        let latlng = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
        reverseGeocode(geocoder, map, latlng);
    });

    document.getElementById('submit').addEventListener('click', (e) => {
      e.preventDefault();
      geocodeAddress(geocoder, map);
      
    });

    addListeners();
}

function createMap(styledata) {
   let mark = new google.maps.LatLng(37.0902,-95.7129); //location of united states

    map = new google.maps.Map(document.getElementById('map'), {
          center: mark,
          zoom: 5,
          minZoom: 3,
          styles: styledata,
          streetViewControl: false,
          zoomControl: false,
          mapTypeControlOptions: { mapTypeIds: []}
    });
    
    marker = new google.maps.Marker( {position: null, map: map, draggable:true, animation: google.maps.Animation.DROP} );
    marker.setIcon("./assets/images/pin/new_pin.png");
    
    geocoder = new google.maps.Geocoder();

    autocomplete = new google.maps.places.Autocomplete(
                  (document.getElementById('address')),
                  { types: ['geocode'] });
              google.maps.event.addListener(autocomplete, 'place_changed', function() {
              });
  //load initial markers from the database
    loadMarkers((markers)=>{
        let markerCluster = new MarkerClusterer(map, markers, {imagePath: './assets/images/clusters/m'});       
    });
    
   google.maps.event.addListener(marker, "dragstart", function (event) {
        marker.setAnimation(3); // raise
    });

    google.maps.event.addListener(marker, "dragend", function (event) {
        marker.setAnimation(4); // fall
        let latlng = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
        reverseGeocode(geocoder, map, latlng);
        //marker.setPosition(latlng);
    });
}

function geocodeAddress(geocoder, resultsMap) {
  let address = document.getElementById('address').value;
  geocoder.geocode({'address': address}, (results, status) => {
    if (status === 'OK') {
      resultsMap.setCenter(results[0].geometry.location);
      if(resultsMap.getZoom() < 7)
          resultsMap.setZoom(7);
      geocodeResults = results;
      
      
      document.getElementById("homeAddress").innerHTML = getDisplayAddress().join(",");
      marker.setPosition(results[0].geometry.location);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

function getDisplayAddress(){
  let display = [];
  let add = getCityStateZip();
  for (let i = 0; i < add.length; i++){
    if(add[i] != "" && i != 2){
      display.push(add[i]);
    }
  }
  return display;
}

function reverseGeocode (geocode, resultsMap, latlng){
    geocoder.geocode({'latLng': latlng}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          geocodeResults = results;
           document.getElementById("homeAddress").innerHTML = getDisplayAddress().join(",");
          marker.setPosition(latlng);

          if (map.getZoom() < 7){
            map.setCenter(latlng);
            map.setZoom(7);
          }
        }
    });
}

//logic to get markers locations from the database
function loadMarkers(callback){
  /*const remote = require('electron').remote;
  remote.getCurrentWindow().webContents.reload();*/
  let locations = [];
  let markers=[];
  
  map.setZoom(5);
  conn.query("SELECT lat,lng FROM markers", (error, results, fields) => {
      if (error){
        return console.log("An error occured: " + error);
      }
      results.forEach((item)=>{
          locations.push({lat: item.lat, lng: item.lng});
      });
      
      for (let i=0; i<locations.length; i++){
          markers[i]= new google.maps.Marker({
              position: locations[i],
              icon: "./assets/images/pin/new_pin.png"
          });
      }
      callback(markers);
  });

}

function saveMarker() {
  let address = geocodeResults[0].formatted_address;
  let lat = geocodeResults[0].geometry.location.lat();
  let long = geocodeResults[0].geometry.location.lng();
  let date = (new Date()).toISOString().substring(0, 10);
  
  conn.query("INSERT INTO markers(lat, lng, timestamp) VALUES(?,?,?)",[lat,long,date], (error, results, fields) => {
    if (error) {
      return console.log("An error occurred with the query", error);
    }
    console.log('Marker stored in the database.');
  });
  let values = getCityStateZip();
  values.unshift(date);
  console.log(values);
  conn.query("INSERT INTO visitors(date_visited, home_city, home_state, zip_code, country) VALUES(?,?,?,?,?)",values,(error,results,fields)=>{
    if (error) {
      return console.log("An error occurred while saving visitor information", error);
    }
    console.log('Visitor stored in the database.');
  });
  // loadMarkers();
}

function getCityStateZip(){
  let components = geocodeResults[0].address_components;
  let city = "";
  let state = "";
  let zip = "";
  let country = "";

  for(let c of components){
    if (c.types[0] == "locality")
      city = c.long_name;

    if (c.types[0] == "administrative_area_level_1")
      state = c.long_name;

    if (c.types[0] == "postal_code")
      zip = c.long_name;
    
    if (c.types[0] == "country")
      country = c.long_name;
  }
  return [city,state,zip,country];
}

function addListeners(){
  let firstPage = document.querySelectorAll("#first-content .btn-toolbar");

  for(let pages of firstPage){
    let column = "";
    if(pages.id == "visit-reason")
       column = "travel_reason";
    else if(pages.id=="info-source")
       column = "advertisement";
    else if(pages.id=="hoteStay")
       column = "hotel_stay";

    console.log(pages.length);
      for(let page of pages.childNodes){
          if (page.nodeType != 3){
            
            page.onclick = ()=>{
              let clicked = "clicked" in page.classList;
              let value = page.textContent;
              if (!clicked){
                page.classList.add("clicked");
                conn.query(`UPDATE visitors SET ${column} = ? WHERE visitor_id=`,value,(err,results,fields)=>{
                    if (err) throw err;
                      console.log('record updated successfully');
                });

              }else {
                page.classList.toggle("clicked");
              }
              console.log(clicked);
              //conn.query("")
            };
        }
        
      }
  }
}


function zoomOut()
{
    map.setZoom(map.getZoom()-1);
}

function zoomIn()
{
    map.setZoom(map.getZoom()+1);
}

module.exports = saveMarker;