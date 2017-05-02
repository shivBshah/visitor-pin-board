"use strict";

let DBConnection = require('./scripts/dbconnection.js');
let MarkerClusterer = require('./scripts/marker-clusterer.js');
let fs = require('fs');

//when was the last time someone was using the map
let lastActiveTime;

//running state of the map
//Is it sitting idle or being used?
let idleState= true;

//variables related to google map
let map;
let marker;
let geocodeResults;
let geocoder;
let autocomplete;
let x = true;


//create database connection
let conn = (function() {
    let db = new DBConnection();
    return db.connect();
})();

//get the number for next visitor
let visitor_num = 0;
(function(){
    conn.query("SELECT visitor_id FROM visitors ORDER BY visitor_id DESC", (err,results,field)=>{
      if (err) throw err;
      visitor_num = results[0].visitor_id + 1;
      console.log(results[0]);
      addListeners();
      // return results[0].count + 1;
    });
})();

// let mapActiveListener = (function(){
//       setTimeout(function activeCheck(){
//         if(!isAppActive){
//           setTimeout(()=>{
//             reloadWindow();
//           }, 6000);
//         }
//         else{
//           setTimeout(activeCheck, 1000);
//         }
//       },1000);
// })();

function initMap() {
   //read initial map style data from file

    let styledata = fs.readFileSync('google-maps-style.json');

    //create map with that style
    createMap(JSON.parse(styledata));

    google.maps.event.addListener(map, 'click', function( event ){
        if(x==true)
        {
            $("#welcome").slideUp();
            $('.box-wrapper').each(function(index, element) {
            setTimeout(function(){
                element.classList.remove('loading');
            }, index * 500);
        });
            x=false;
            setTimeout(function(){ storeFinalInfo(); }, 1200000);
        }
        else
        {
        let latlng = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
        reverseGeocode(geocoder, map, latlng);
        }
    });

    document.getElementById('submit').addEventListener('click', (e) => {
      e.preventDefault();

      geocodeAddress(geocoder, map);
    });

    document.getElementById('myBtn').addEventListener('click', ()=>{
        saveMarker();
    });

    console.log(visitor_num);

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
      document.getElementById("show-first").style.display = "none";
      document.getElementById("show-second").style.display = "block";
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
           document.getElementById("show-first").style.display = "none";
           document.getElementById("show-second").style.display = "block";
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
  conn.query("select * from map_settings", (err,results,fields)=>{
      if (err) return err;
      let pinCount = results[0].value;
      let pinDuration = results[1].value;
      let query = "SELECT marker_id, lat ,lng FROM markers";

      if (pinDuration != -1){
        query += ` WHERE TIMESTAMPDIFF(MONTH, timestamp, CURDATE()) <= ${pinDuration}`;
      }
      if(pinCount != -1) {
        query += ` ORDER BY marker_id DESC`;
        query += ` LIMIT ${pinCount}`;
      }

      console.log(query);
      conn.query(query, (error, results, fields) => {
          if (error){
            return console.log("An error occured: " + error);
          }
          results.forEach((item)=>{
              locations.push({lat: item.lat, lng: item.lng});
          });
          // console.log(results[results.length-1].marker_id);
          for (let i=0; i<locations.length; i++){
              markers[i]= new google.maps.Marker({
                  position: locations[i],
                  icon: "./assets/images/pin/new red.png"
              });
          }
          callback(markers);
      });
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
  let parsedAddress = getCityStateZip();
  conn.query(`SELECT metro_area FROM metropolitan WHERE city = "${parsedAddress[0]}" AND state = "${parsedAddress[1]}"`, (err,results,fields)=>{
      if(err) throw err;
      let metro = "";
      if (results[0] != null && results[0] != '')
         metro = results[0].metro_area;
      let values = [date,'',parsedAddress[0],parsedAddress[1], parsedAddress[2], parsedAddress[3], '','','1','','',metro];
      console.log(metro);
      conn.query("INSERT INTO visitors(date_visited, email, home_city, home_state, zip_code, country, destination, travel_reason, number, advertisement, hotel_stay, metro_area) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",values,(error,results,fields)=>{
        if (error) {
          return console.log("An error occurred while saving visitor information", error);
        }
        console.log('Visitor stored in the database.');
      });
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
  //listeners for buttons on first page
  for(let pages of firstPage){
    let column = "";
    if(pages.id == "visit-reason")
       column = "travel_reason";
    else if(pages.id=="info-source")
       column = "advertisement";
    else if(pages.id=="hotelStay")
       column = "hotel_stay";

    console.log(column);
      for(let page of pages.childNodes){
          if (page.nodeType != 3){
            page.onclick = ()=>{
              let clicked = "clicked" in page.classList;
              let value = page.textContent.trim();
              console.log(visitor_num);
                conn.query(`UPDATE visitors SET ${column} = ? WHERE visitor_id="${visitor_num}"`,value,(err,results,fields)=>{
                    if (err) throw err;
                    console.log('record updated successfully');
                });
            };
         }

      }
  }

  //listeners for done and cancel button
  document.getElementById('done-button').addEventListener('click', ()=>{
      let modal = document.querySelector('#myModal');
      modal.style.display = "none";
      let bigmodal = document.querySelector('#lastModal');
      bigmodal.style.display="block";
      storeFinalInfo();

  });


   document.getElementById('byebye').addEventListener('click', ()=>{
      setTimeout(reloadWindow(), 1000);
  });

}

function storeFinalInfo(){
  let inputs = document.querySelectorAll("#second-content input");
  let values = [];
  let fields = [];
  for(let input of inputs){
    values.push(input.value)
    fields.push(input.id);
    console.log(input.value);
  }
  conn.query(`UPDATE visitors SET ${fields[0]}=?,${fields[1]}=?, ${fields[2]}=? WHERE visitor_id=${visitor_num}`, values,(err,results,fields)=>{
      if(err) throw err;
      console.log("second contents were saved");
//     setTimeout(reloadWindow(), 1000);
  });
}

function reloadWindow(){
  const remote = require('electron').remote;
  remote.getCurrentWindow().webContents.reload();
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
