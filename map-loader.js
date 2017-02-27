var map;
var geocoder;
function initMap() {
  var mark = {lat: 37.0902, lng: -95.7129};
  map = new google.maps.Map(document.getElementById('map'), {
    center: mark,
    zoom: 4
  });
    geocoder = new google.maps.Geocoder();
}

function geocodeAddress(geocoder, resultsMap) {
  var address = document.getElementById('address').value;
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === 'OK') {
      resultsMap.setCenter(results[0].geometry.location);
      var address = results[0].formatted_address;
      var lat = results[0].geometry.location.lat();
      var long = results[0].geometry.location.lng();
      console.log(address + "\n" + lat + "\n" + long);

      var marker = new google.maps.Marker({
        map: resultsMap,
        position: results[0].geometry.location
      });
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

document.getElementById('submit').addEventListener('click', function() {
  geocodeAddress(geocoder, map);
});
