import React, { useRef } from "react";
import { Autocomplete } from "@react-google-maps/api";

function MapSearchBar({ mapRef, userLocation, onPlaceSelected }) {
    const autocompleteRef = useRef(null);
  
    const handlePlaceChanged = (place) => {
        if (!place.geometry) return; // ensure the place has coordinates
      
        const location = {
          name: place.name,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address || "",
          openTime: place.opening_hours?.weekday_text || "",
        };
      
        setSelectedLocation(location);
        setShowDetails(true);
        mapRef.current.panTo({ lat: location.lat, lng: location.lng });
        mapRef.current.setZoom(16);
      };
  
    return (
      <Autocomplete
        onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
        onPlaceChanged={handlePlaceChanged}
        options={{
          types: ["establishment"],
          bounds: userLocation
            ? new window.google.maps.LatLngBounds(
                { lat: userLocation.lat - 0.05, lng: userLocation.lng - 0.05 },
                { lat: userLocation.lat + 0.05, lng: userLocation.lng + 0.05 }
              )
            : undefined,
          strictBounds: false,
        }}
      >
        <input
          type="text"
          placeholder="Search nearby places..."
          className="top-4 left-4 z-50 w-80 px-4 py-2 bg-white rounded-2xl shadow-lg outline-none focus:ring-2 focus:ring-blue-400"
        />
      </Autocomplete>
    );
  }
export default MapSearchBar;