$(document).foundation();

const loc = {lat: 43.6453473, lng: -79.4296353}
let currentInfoWindow = null
let bike_rack = null
let myRating = 0;

$('#submitReview').click(function() {
    comment = $('#comment').val()

    commentObj = {
        BikerackId: bike_rack.id,
        comment: comment
    }

    ratingObj = {
        BikerackId: bike_rack.id,
        Rating: myRating
    }

    $.post("/api/comments", commentObj, function(comment_resp) {
        bike_rack.Comments.push(comment_resp)

        $.post("/api/rating", ratingObj, function(ratings_resp) {
            bike_rack.Ratings.push(ratings_resp)

            $('#comment').val('');
            myRating = 3;
            $('.edit-star').eq(2).trigger('mouseover')
            $('#close-modal').trigger('click')

            currentInfoWindow.setContent(getContentString(bike_rack))
        })
    })
});

// Modal Functions
function populateModal(id){
    bike_rack = search_results.filter(result => result.id == id)[0]
    myRating = 3
    $('#modal-title').text(`Enter Review for ${bike_rack.address}`)
}

$('.edit-star').mouseover(function() {
    event.preventDefault()
    const selectedRating = $(this).data('rating')
    myRating = parseInt(selectedRating)

    $('.edit-star').each(function(){
        let star = $(this)
        let rating = $(this).data('rating')
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

function renderStars(rating){

    if(rating == null)
        return 'No Ratings'

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

function getContentString(bikeRack){

    let rating = null

    // Generate random rating for testing
    if(bikeRack.Ratings.length > 0)
        rating = bikeRack.Ratings.map(r => parseInt(r.Rating)).reduce(sum)/bikeRack.Ratings.length

    const comment_count = bikeRack.Comments.length

    return `<div class='info-container'>
        <h5 class="info-address">${bikeRack.address}</h5>
        <span class="display-inline-block">
            ${renderStars(rating)}
            ${comment_count > 0 ?
            `<span class="display-inline-block">
                <a class="info-comments" data-toggle="off-canvas">
                    <i class="far fa-comment"></i>
                    ${comment_count}
                </a>
            </span>` : ''
            }
        <span>
        <p class="info-capacity">Capacity: ${bikeRack.bike_capacity}</p>
        <p><button class="button small" data-open="commentsModal" onclick="populateModal(${bikeRack.id});">Add Review</button><p>
        </div>`
}

let search_results = []

function sum(total, value){
   return total + value
}

function renderComments(result){

    $('#comments-title').text(result.address + ' Reviews')

    commentsContainer = $('#comments-list')
    commentsContainer.empty()

    let i = 0
    result.Comments.forEach(comment => {
        console.log(comment)
        rating = result.Ratings[i]
        commentsContainer.append(renderComment(rating, comment))
        i++
    })
}

function renderComment(rating, comment){

return `<div class="review-card">
  <div class="card-divider review-header">
    <span class="display-inline-block">
        User ID:
        ${comment.UserId}
        ${renderStars(parseInt(rating.Rating))}
    </span>
  </div>
  <div class="card-section review-body">
    <p>${comment.comment}</p>
  </div>
</div>`

}

function addResults(map, markers, searched_location, bounds){

    translated_location = {
        latitude: searched_location.lat(),
        longitude: searched_location.lng()
    }

  $.get("/api/search_results", translated_location)
    .then(function(results) {

        // Make all markers share a single InfoWindow
        const infowindow = new google.maps.InfoWindow()
        search_results = results

        // Create a marker for each parking spot.
        results.forEach(result => {

            // Add map market and info window for each spot
            let marker = new google.maps.Marker({
                position: new google.maps.LatLng(result.lat, result.lng),
                map: map,
                title: result.address
              });

             markers.push(marker)

              // Generate marker
              marker.addListener('click', function() {
                renderComments(result)
                currentInfoWindow = infowindow
                infowindow.setContent(
                getContentString(result))
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

  let markers = [];
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

    markers = []

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
    addResults(map, markers, place.geometry.location, bounds)
    map.fitBounds(bounds);
  });
}


function submitComment(data){
  $.post("/api/comments", data, function() {    
    })
      $.post("/api/rating", data, function() {
        })
};
