$(document).foundation();

let bike_rack = null
let myRating = 0;

$('#submitReview').click(function() {
    comment = $('#comment').val()
    console.log(bike_rack._id, myRating, comment)

    commentObj = {

    }

    $.post("/api/comments", commentObj, function() {
    })

    $.post("/api/rating", ratingObj, function() {
    })
});


// Modal Functions
function populateModal(id){
    bike_rack = search_results.filter(result => result._id == id)[0]
    console.log(bike_rack)
    myRating = 3
    $('#modal-title').text(`Enter Review for ${bike_rack.address}`)
}

$('.edit-star').mouseover(function() {
    event.preventDefault()
    const selectedRating = $(this).data('rating')

    $('.edit-star').each(function(){
        let star = $(this)
        let rating = $(this).data('rating')
        myRating = parseInt(rating)
        let classNames = $(this).attr('class').split(' ')

        if(rating <= selectedRating && classNames.includes('far')){
        // if star has a lower rating than the selected star and is
        // an empty star icon, swap to full
            $(this).removeClass('far')
            $(this).addClass('fas')
        } else if (rating > selectedRating && classNames.includes('fas')){
            $(this).removeClass('fas')
            $(this).addClass('far')
        }
    })
});


// Map Functions
const loc = {lat: 43.6453473, lng: -79.4296353}

function renderStars(rating){
    const fullStar = '<i class="fas fa-star"></i>'
    const halfStar = '<i class="fas fa-star-half-alt"></i>'
    const emptyStar = '<i class="far fa-star"></i>'

    let fullStars = Math.floor(rating,0)
    let halfStars = Math.round(2*(rating-fullStars))

    if(halfStars === 2){
        halfStars = 0;
        fullStars++
    }

    stars = ''
    for(i = 1; i <= rating; i++)
        stars += fullStar

    if(halfStars === 1)
        stars += halfStar

    for(i = fullStars + halfStars; i< 5; i++)
        stars += emptyStar

    return stars;
}


function setCurrentPosition(position) {
  loc.lat = position.coords.latitude;
  loc.lng = position.coords.longitude;
}

function getCurrentPosition() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(setCurrentPosition);
  } 
}

function getContentString(id, address, bike_capacity, rating, comment_count){

  return `<div class='content'>
    <h5 class="info-address">${address}</h5>
    <span class="display-inline-block">
        ${renderStars(rating)}
    <span>
    <p>Capacity: ${bike_capacity}</p>
    <p>Comments: ${comment_count}</p>
    <p><button class="button small" data-open="commentsModal" onclick="populateModal(${id});">Add Review</button><p>
  </div>`
}

let search_results = []

function addBikeRackMarkers(map, markets, searched_location, bounds){

    translated_location = {
        latitude: searched_location.lat(),
        longitude: searched_location.lng()
    }

  $.get("/api/search_results", translated_location)
    .then(function(results) {

        // Make all markers share a single InfoWindow
        const infowindow = new google.maps.InfoWindow()

        // Create a marker for each parking spot.
        results.forEach(result => {

            search_results = results

            // Generate random rating for testing
            let rating = 4*Math.random()+1

            // Add map market and info window for each spot
            let marker = new google.maps.Marker({
                position: new google.maps.LatLng(result.lat, result.lng),
                map: map,
                title: result.address
              });

              // Generate marker
              marker.addListener('click', function() {

                infowindow.setContent(getContentString(result._id, result.address,8,rating,15))
                // Attach marker to marker
                infowindow.open(map, marker);
              });
         })
    })
  }

function initMap() {
  
  getCurrentPosition();

  // Initialize map
  var map = new google.maps.Map(document.getElementById('map'), {
    center: loc,
    zoom: 14,
    mapTypeId: 'roadmap',
    disableDefaultUI: true
  });

  // Create the search box and link it to the UI element.
  const input = document.getElementById('pac-input');
  const searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  const markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    let places = searchBox.getPlaces();
    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });

    // For each place, get the icon, name and location.
    const bounds = new google.maps.LatLngBounds();

    // Limit to one result
    place = places[0];
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

  // Create a marker for each place.
  markers.push(new google.maps.Marker({
    map: map,
    icon: icon,
    title: place.name,
    position: place.geometry.location
  }));

  if (place.geometry.viewport) {
    // Only geocodes have viewport.
    bounds.union(place.geometry.viewport);
  } else {
    bounds.extend(place.geometry.location);
  }

    // Add custom markets
    addBikeRackMarkers(map, markers, place.geometry.location, bounds)

    map.fitBounds(bounds);
  });
}

//Sample on how to search by longitude and latitude
var sampleLocation = {
  longitude: -79.3811,
  latitude: 43.6591
};

submitLocation(sampleLocation);

function submitLocation(data) {
  $.get("/api/search_results", data)
    .then(function(results) {
      console.log(results)
    })
};
//Sample on how to post comment

var sampleComment = {
  comment: "It's Okay",
  BikerackId: 2  
};

// submitComment(sampleComment);

function submitComment(data){
  $.post("/api/comments", data, function() {    
    })
      $.post("/api/rating", data, function() {
        })
};

//Sample on how to post rating

var sampleRating = {
  Rating: 3,
  BikerackId: 2
};

submitRating(sampleRating);

function submitRating(data){
  $.post("/api/rating", data, function() {    
    })
};

var sampleBikeID = {
  BikerackId: 2
};

//pull data for bike parking location

// pullBikeRating(sampleBikeID);

function pullBikeRating(data){
  $.get("/api/parkinglocation", data)
  .then(function(results){
    console.log(results)
  });
}
