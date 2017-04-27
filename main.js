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
        marker.setPosition(latlng);
        
        if (map.getZoom() != 7){
          map.setCenter(latlng);
        }
        map.setZoom(7);

    });

    document.getElementById('submit').addEventListener('click', (e) => {
      e.preventDefault();
      geocodeAddress(geocoder, map);
        
    });
    document.getElementById('next').addEventListener('click', () => saveMarker());

}

function createMap(styledata) {
   let mark = new google.maps.LatLng(37.0902,-95.7129);

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
      /*for (let i=0; i<markers.length; i++){
              markerCluster.addMarker(markers[i]);
      }*/
    });
    
      google.maps.event.addListener(marker, "dragstart", function (event) {
   marker.setAnimation(3); // raise
    });

    google.maps.event.addListener(marker, "dragend", function (event) {
        marker.setAnimation(4); // fall
        let latlng = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
        reverseGeocode(geocoder, map, latlng);
        marker.setPosition(latlng);
    });
}

function geocodeAddress(geocoder, resultsMap) {
  let address = document.getElementById('address').value;
  geocoder.geocode({'address': address}, (results, status) => {
    if (status === 'OK') {
      resultsMap.setCenter(results[0].geometry.location);
      resultsMap.setZoom(7);
      geocodeResults = results;
      document.getElementById("homeAddress").innerHTML=geocodeResults[0].formatted_address;
      marker.setPosition(results[0].geometry.location);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

function reverseGeocode (geocode, resultsMap, latlng){
    geocoder.geocode({'latLng': latlng}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          geocodeResults = results;
          document.getElementById("homeAddress").innerHTML=geocodeResults[0].formatted_address;
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
          });
      }
      callback(markers);
  });

}

function saveMarker() {
  let address = geocodeResults[0].formatted_address;
  let lat = geocodeResults[0].geometry.location.lat();
  let long = geocodeResults[0].geometry.location.lng();

  conn.query("INSERT INTO markers(address, lat, lng) VALUES(?,?,?)",[address,lat,long], (error, results, fields) => {
    if (error) {
      return console.log("An error occurred with the query", error);
    }
    console.log('Marker stored in the database.');
  });
  // loadMarkers();
}

function zoomOut()
{
    map.setZoom(map.getZoom()-1);
}

function zoomIn()
{
    map.setZoom(map.getZoom()+1);
}
