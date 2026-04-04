/**
 * @license
 * Copyright 2024 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
async function init() {
  await customElements.whenDefined('gmp-map');

  const map = document.querySelector("gmp-map");
  const marker = document.getElementById("marker");
  const strictBoundsInputElement = document.getElementById("use-strict-bounds");
  const placePicker = document.getElementById("place-picker");
  const infowindowContent = document.getElementById("infowindow-content");
  const infowindow = new google.maps.InfoWindow();

  map.innerMap.setOptions({mapTypeControl: false});
  infowindow.setContent(infowindowContent);

  placePicker.addEventListener('gmpx-placechange', () => {
    const place = placePicker.value;

    if (!place.location) {
      window.alert(
        "No details available for input: '" + place.name + "'"
      );
      infowindow.close();
      marker.position = null;
      return;
    }

    if (place.viewport) {
      map.innerMap.fitBounds(place.viewport);
    } else {
      map.center = place.location;
      map.zoom = 17;
    }

    marker.position = place.location;
    infowindowContent.children["place-name"].textContent = place.displayName;
    infowindowContent.children["place-address"].textContent = place.formattedAddress;
    infowindow.open(map.innerMap, marker);
  });

  // Sets a listener on a radio button to change the filter type on the place picker
  function setupClickListener(id, type) {
    const radioButton = document.getElementById(id);
    radioButton.addEventListener("click", () => {
      placePicker.type = type;
    });
  }
  setupClickListener("changetype-all", "");
  setupClickListener("changetype-address", "address");
  setupClickListener("changetype-establishment", "establishment");
  setupClickListener("changetype-geocode", "geocode");
  setupClickListener("changetype-cities", "(cities)");
  setupClickListener("changetype-regions", "(regions)");

  strictBoundsInputElement.addEventListener("change", () => {
    placePicker.strictBounds = strictBoundsInputElement.checked;
  });
}

document.addEventListener('DOMContentLoaded', init);
map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 28.6139, lng: 77.2090 }, // Default location
    zoom: 12
});
const searchInput = document.getElementById("search-input");
const autocomplete = new google.maps.places.Autocomplete(searchInput);
// जब यूजर सर्च में कोई जगह सेलेक्ट करे, तो मैप वहां चला जायेगा
autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    map.setCenter(place.geometry.location); 
    // marker update
});
function getUserLocation() {
    navigator.geolocation.getCurrentPosition( (position) => {
        const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
        map.setCenter(pos);
        geocodeLatLng(pos); // Location Code for proper address
    });
}
function geocodeLatLng(latlng) {
    geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === "OK" && results[0]) {
            let properAddressName = results[0].formatted_address;
            console.log("GPS Location Name: ", properAddressName); 
        }
    });
}
