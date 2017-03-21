"use strict";

var map;
var conn;
var marker;
var geocodeResults;
var geocoder;

function initMap() {
  var mark = {lat: 37.0902, lng: -95.7129};
  map = new google.maps.Map(document.getElementById('map'), {
    center: mark,
    zoom: 5
  });
  geocoder = new google.maps.Geocoder();
  conn = dbConnection();
  connectToDatabase();
  //load initial markers from the database
  loadMarkers();

  //document.querySelector("#submit").addEventListener('click', () => geocodeAddress(geocoder, map));
  document.getElementById('next').addEventListener('click', () => saveMarker());
}

function geocode() {
  geocodeAddress(geocoder, map);
}

function geocodeAddress(geocoder, resultsMap) {
  let address = document.getElementById('address').value;
  geocoder.geocode({'address': address}, (results, status) => {
    if (status === 'OK') {
      resultsMap.setCenter(results[0].geometry.location);

      geocodeResults = results;
      marker = new google.maps.Marker({
        map: resultsMap,
        position: results[0].geometry.location
      });

    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

function connectToDatabase(){
  conn.connect((err) => {
    if(err){
      console.log('Database connection error');
    }else{
      console.log('Database connection successful');
    }
  });
}

//logic to get markers locations from the database
function loadMarkers(){
  conn.query("SELECT lat,lng FROM markers", (error, results, fields) => {
    if (error){
      return console.log("An error occured: " + error);
    }
    results.forEach((item)=>{
      marker = new google.maps.Marker({
        map:map,
        position: {lat: item.lat, lng: item.lng}
      });
    });
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
  conn.end((err)=> {
    if (!err) {
        console.log("database closed");
    }
  });
}
