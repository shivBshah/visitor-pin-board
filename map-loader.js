"use strict";
var fs = require('fs');
var map;
var conn;
var marker;
var geocodeResults;
var styledata ;
var geocoder;
var markers=[];
var locations=[];

function initMap() {
    fs.readFile('google-maps-styler.json', 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
          styledata = JSON.parse(data);
          createMap();
    });
}    

function createMap() {
  var mark = new google.maps.LatLng(37.0902,-95.7129);
  
  map = new google.maps.Map(document.getElementById('map'), {
        center: mark,
        zoom: 5,
        styles: styledata,
  });

    marker = new google.maps.Marker( {position: null, map: map} );
    geocoder = new google.maps.Geocoder();
  
  conn = dbConnection();
  connectToDatabase();
  //load initial markers from the database
  loadMarkers(()=>{
      var markerCluster = new MarkerClusterer(map, markers, {imagePath: './images/m'});
  });


   for (var i=0; i<markers.length; i++){
        markerCluster.addMarker(markers[i]);
    }

    google.maps.event.addListener(map, 'click', function( event ){
        var latlng = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
        reverseGeocode(geocoder, map, latlng);
        marker.setPosition(latlng);
    });
  
  document.getElementById('submit').addEventListener('click', () => geocodeAddress(geocoder, map));
  document.getElementById('next').addEventListener('click', () => saveMarker());    
}

function geocodeAddress(geocoder, resultsMap) {
  let address = document.getElementById('address').value;
  geocoder.geocode({'address': address}, (results, status) => {
    if (status === 'OK') {
      resultsMap.setCenter(results[0].geometry.location);

      geocodeResults = results;
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
        } 
    }); 
}

function connectToDatabase(){
  conn.connect((err) => {
    if(err){
      console.log(err);
    }else{
      console.log('Database connection successful');
    }
  });
}

//logic to get markers locations from the database
function loadMarkers(callback){

  conn.query("SELECT lat,lng FROM markers", (error, results, fields) => {
    if (error){
      return console.log("An error occured: " + error);
    }
    results.forEach((item)=>{
        locations.push({lat: item.lat, lng: item.lng});
    });
    
    var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

     /*markers = locations.map(function(location, i) {
            return new google.maps.Marker({
            position: location,
            label: labels[i % labels.length]
          });
        });
    */
    for (var i=0; i<locations.length; i++){
        markers[i]= new google.maps.Marker({
            position: locations[i],
        });
        
    }
    console.log(locations);
    console.log(markers);
    callback();
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
  loadMarkers();
}


