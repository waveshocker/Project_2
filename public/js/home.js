$(document).ready(function() {
  // This file just does a GET request to figure out which user is logged in
  // and updates the HTML on the page
  $.get("/api/user_data").then(function(data) {
    $(".member-name").text(data.email);
  });
});


const loc = {lat: 43.6453473, lng: -79.4296353}

function setCurrentPosition(position) {
  loc.lat = position.coords.latitude;
  loc.lng = position.coords.longitude;
}

function getCurrentPosition() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(setCurrentPosition);
  } 
}

// Initialize and add the map
function initMap() {

  getCurrentPosition();
  // The map, centered at Uluru
  const map = new google.maps.Map(
      document.getElementById('map'), {zoom: 14, center:loc});
}