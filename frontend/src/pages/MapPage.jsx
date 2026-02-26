import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { GoogleMap, Marker, useJsApiLoader, DirectionsRenderer, Autocomplete } from "@react-google-maps/api";
import MapSearchBar from '../components/MapSearchBar';

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 1.4927,
  lng: 103.7414, // Johor Bahru
};

const googleMapsConfig = {
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
};

// const locations = [
//     { id: 1, name: "Johor Recycling Hub", type: "recycle", lat: 1.4927, lng: 103.7414, distance: "0.5km", address: "12 Jalan Skudai, Johor Bahru, Johor", openTime: "8:00 AM - 6:00 PM" },
//     { id: 2, name: "City Orphanage Donation", type: "clothes", lat: 1.5027, lng: 103.7514, distance: "1.2km" },
//     { id: 3, name: "E-Waste Collection Point", type: "electric", lat: 1.4827, lng: 103.7314, distance: "2.5km" },
//     { id: 4, name: "Penang Orphanage Donation", type: "clothes", lat: 5.4027, lng: 100.4014, distance: "1.2km" },
//     { id: 5, name: "E-Waste Penang Collection Point", type: "electric", lat: 5.4327, lng: 100.3914, distance: "2.5km" },
//     { id: 1, name: "Bintulu Recycling Hub", type: "recycle", lat: 3.1927, lng: 113.0914, distance: "0.5km", address: "12 Jalan Skudai, Johor Bahru, Johor", openTime: "8:00 AM - 6:00 PM" }
// ];

const MapPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const { state } = location || {};
    const wasteType = state?.wasteType; // this is the type passed from another page

    const [loading, setLoading] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [places, setPlaces] = useState([]);
    // const [filteredLocations, setFilteredLocations] = useState(locations);

    const [drivingDistance, setDrivingDistance] = useState(null);
    const [drivingDuration, setDrivingDuration] = useState(null);
    const [directions, setDirections] = useState(null);

    const mapRef = useRef(null);
    const circleRef = useRef(null);
    const dotRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!navigator.geolocation) return;
      
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            setUserLocation(prev => {
                const newLat = position.coords.latitude;
                const newLng = position.coords.longitude;
              
                if (
                  prev &&
                  Math.abs(prev.lat - newLat) < 0.00001 &&
                  Math.abs(prev.lng - newLng) < 0.00001
                ) {
                  return prev; // no significant change
                }
              
                return { lat: newLat, lng: newLng };
              });
          },
          (error) => console.error(error),
          { enableHighAccuracy: true }
        );
      
        return () => navigator.geolocation.clearWatch(watchId);
      }, []);
    
    useEffect(() => {
        if (!userLocation || !mapRef.current || !window.google) return;
      
        const map = mapRef.current;
      
        // Accuracy Circle (big faded one)
        if (!circleRef.current) {
          circleRef.current = new window.google.maps.Circle({
            map,
            center: userLocation,
            radius: 100,
            fillColor: "#4285F4",
            fillOpacity: 0.2,
            strokeOpacity: 0,
            clickable: false,
          });
        } else {
          circleRef.current.setCenter(userLocation);
        }
      
        // Blue Dot (small solid one)
        if (!dotRef.current) {
            dotRef.current = new window.google.maps.Marker({
              map,
              position: userLocation,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 6, // pixel size (stays constant)
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              },
              clickable: false,
            });
        } else {
            dotRef.current.setPosition(userLocation);
        }
      
    }, [userLocation]);
    
    useEffect(() => {
        return () => {
          if (circleRef.current) {
            circleRef.current.setMap(null);
          }
          if (dotRef.current) {
            dotRef.current.setMap(null);
          }
        };
    }, []);

    useEffect(() => {
        if (!userLocation || !selectedLocation || !window.google) return;
      
        const directionsService = new window.google.maps.DirectionsService();
      
        directionsService.route(
          {
            origin: userLocation,
            destination: {
              lat: selectedLocation.lat,
              lng: selectedLocation.lng,
            },
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === "OK" && result.routes.length > 0) {
              const leg = result.routes[0].legs[0];
      
              setDrivingDistance(leg.distance.text);   // e.g. "2.8 km"
              setDrivingDuration(leg.duration.text);   // e.g. "6 mins"
            }
          }
        );
    }, [userLocation, selectedLocation]);

    useEffect(() => {
        if (!userLocation || !mapRef.current) return;
      
        // Only auto-center once (first load)
        if (!mapRef.current.__centeredOnce) {
          mapRef.current.panTo(userLocation);
          mapRef.current.setZoom(16);
          mapRef.current.__centeredOnce = true;
        }
    }, [userLocation]);

    // useEffect(() => {
    //     setFilteredLocations(locations);
    // }, []);

    const handlePresetSearch = (query) => {
        if (!mapRef.current || !window.google || !userLocation) return;
        // Clear previous places
        setPlaces([]);
        setSelectedLocation(null);
        const service = new window.google.maps.places.PlacesService(mapRef.current);
    
        service.textSearch(
            {
                query,
                location: new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
                radius: 5000, // 5 km
            },
            (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
                    setPlaces(results); // store all results
    
                    // Find the nearest place to userLocation
                    let nearest = results[0];
                    let minDistance = Number.MAX_VALUE;
    
                    results.forEach((place) => {
                        const latDiff = place.geometry.location.lat() - userLocation.lat;
                        const lngDiff = place.geometry.location.lng() - userLocation.lng;
                        const dist = Math.sqrt(latDiff ** 2 + lngDiff ** 2);
                        if (dist < minDistance) {
                            minDistance = dist;
                            nearest = place;
                        }
                    });
    
                    // Pan to the nearest place
                    mapRef.current.panTo(nearest.geometry.location);
                    mapRef.current.setZoom(15);
    
                    // Optional: select the nearest place automatically
                    handlePlaceSelected(nearest);
                }
            }
        );
    };

    const { isLoaded } = useJsApiLoader(googleMapsConfig);

    useEffect(() => {
        // Only trigger if:
        // - user location is ready
        // - Google Maps API is loaded
        // - wasteType is provided via redirect
        if (!userLocation || !isLoaded) return;

        if (!wasteType) return;
    
        const typeQueryMap = {
            plastic: "recycling center",
            metal: "recycling center",
            paper: "recycling center",
            glass: "recycling center",
            food_waste: "compost",
            clothes: "clothes donation",
            electronics: "e-waste",
            general_waste: "trash collector"
        };
    
        const query = typeQueryMap[wasteType] || wasteType;
    
        handlePresetSearch(query);
    }, [userLocation, isLoaded, wasteType]);

    const goToUserLocation = () => {
        if (userLocation && mapRef.current) {
          mapRef.current.panTo(userLocation);
          mapRef.current.setZoom(16);
        }
      };
    
    const showRouteInGoogleMaps = () => {
        if (!userLocation || !selectedLocation) return;
      
        const origin = `${userLocation.lat},${userLocation.lng}`;
        const destination = `${selectedLocation.lat},${selectedLocation.lng}`;
      
        const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
        
        if (window.confirm("Open in Google Maps for navigation?")) {
            window.location.href = url;
        }
    };

    const handlePlaceSelected = (place) => {
        const selected = {
            name: place.name,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address,
            openTime: place.opening_hours?.weekday_text?.join(", ") || "Not available",
        };
        setSelectedLocation(selected);

        if (mapRef.current) {
            const map = mapRef.current;
            const target = new window.google.maps.LatLng(selected.lat, selected.lng);

            // Smooth pan to target
            map.panTo(target);
            // Optional: offset vertically so bottom info card doesn't cover the marker
        

            // Zoom in slightly if needed
            if(map.getZoom() != 16){
                map.setZoom(Math.max(map.getZoom(), 16));
            }
            
        }
    };

    return (
        <div className="h-screen w-full bg-black relative flex flex-col">
            <div className="absolute inset-0 z-0">
                {isLoaded ? (
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={14}
                        options={{fullscreenControl: false}}
                        onLoad={(map) => {
                            mapRef.current = map;
                        }}

                    >
                        {/* <MapSearchBar mapRef={mapRef} userLocation={userLocation} onPlaceSelected={handlePlaceSelected}  /> */}
                        {places.map((place) => (
                            <Marker
                                key={place.place_id}
                                position={{
                                    lat: place.geometry.location.lat(),
                                    lng: place.geometry.location.lng(),
                                }}
                                onClick={() => handlePlaceSelected(place)}
                            />
                        ))}

                        {selectedLocation && (
                            <Marker
                                position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                            />
                        )}
                        
                        {directions && (
                            <DirectionsRenderer
                                directions={directions}
                                options={{
                                suppressMarkers: false,
                                polylineOptions: {
                                    strokeColor: "#10B981", // your primary color
                                    strokeWeight: 5,
                                },
                                }}
                            />
                        )}
                    </GoogleMap>
                ) : (
                    <div className="flex items-center justify-center h-full text-white">
                    Loading Map...
                    </div>
                )}
            </div>

            {/* Top Bar */}
            <div className="absolute top-8 left-0 right-0 z-40 p-6 pointer-events-none">

                {/* Back Button (Left) */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="absolute left-6 bg-white/10 backdrop-blur-md text-white w-10 h-10 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/20 transition-all pointer-events-auto cursor-pointer"
                >
                    <span className="material-icons-round">arrow_back</span>
                </button>

                {/* Center Stack */}
                <div className="flex flex-col items-center gap-4 pointer-events-auto px-6">

                    {/* Search Bar */}
                    {isLoaded && (
                        <MapSearchBar
                            mapRef={mapRef}
                            userLocation={userLocation}
                            onPlaceSelected={handlePlaceSelected}
                        />
                    )}

                    {/* Preset Buttons */}
                    <div className="flex gap-3 flex-wrap justify-center">
                    {["Recycling Centre", "Clothes Donation", "E-Waste"].map((type) => (
                        <button
                            key={type}
                            onClick={() => userLocation && handlePresetSearch(type)}
                            className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full border border-white/10 hover:bg-white/20 transition-all text-sm"
                        >
                            {type}
                        </button>
                    ))}
                    </div>

                </div>

            </div>

            {/* <div className="absolute top-20 left-4 right-4 z-50 flex gap-3 overflow-x-auto pointer-events-auto">
                {["recycle center", "clothes donation", "e-waste"].map((type) => (
                    <button
                    key={type}
                    onClick={() => handlePresetSearch(type)}
                    className="px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-full border border-white/20 hover:bg-white/20 transition"
                    >
                    {type === "recycle center" && "♻️ Recycling"}
                    {type === "clothes donation" && "👕 Clothes Donation"}
                    {type === "e-waste" && "💻 E-Waste"}
                    </button>
                ))}
            </div> */}

            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center p-6 bg-white/10 rounded-2xl border border-white/10">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <span className="text-white font-bold">Locating Centers...</span>
                    </div>
                </div>
            )}

            {/*Locate User button*/}
            <div className="absolute bottom-38 right-2 z-30">
            <button
                onClick={goToUserLocation}
                className="w-10.5 h-10.5 flex items-center justify-center bg-white shadow-lg rounded-full hover:scale-105 transition"
            >
                <span className="material-icons-round text-blue-600">
                my_location
                </span>
            </button>
            </div>

            {/* Bottom Actions */}
            <div className="absolute bottom-0 left-0 right-20 p-8 z-40">
                <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                            <span className="material-icons-round text-2xl">near_me</span>
                        </div>
                        <div>
                            {selectedLocation ? (
                                <>
                                    <h3 className="text-white font-bold text-lg">
                                        {selectedLocation.name}
                                    </h3>
                                    <p className="text-white/60 text-sm">
                                        {drivingDistance
                                            ? `${drivingDistance} • ${drivingDuration}`
                                            : "Calculating route..."}
                                    </p>
                                </>
                                ) : (
                                <>
                                    <h3 className="text-white font-bold text-lg">
                                        Select a location
                                    </h3>
                                    <p className="text-white/60 text-sm">
                                        Tap a marker to see details
                                    </p>
                                </>
                            )}
                        </div>
                        {/* Side Details Button */}
                        {selectedLocation && (
                            <button
                                onClick={() => setShowDetails(true)}
                                className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg hover:scale-105 transition"
                            >
                            <span className="material-icons-round text-white text-xl">
                                info
                            </span>
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-primary text-emerald-950 font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer"
                    >
                        Navigate & Earn Points
                    </button>
                </div>
            </div>
            {showDetails && selectedLocation && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
                    
                    <div className="w-full bg-white rounded-t-3xl p-6 animate-slideUp">
                    
                    {/* Close Button */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold">
                            {selectedLocation.name}
                        </h2>
                        <button
                            onClick={() => setShowDetails(false)}
                            className="text-gray-500"
                        >
                        ✕
                        </button>
                    </div>

                    {/* Address */}
                    <div className="mb-4">
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{selectedLocation.address}</p>
                    </div>

                    {/* Opening Hours */}
                    <div className="mb-6">
                        <p className="text-sm text-gray-500">Opening Hours</p>
                        <p className="font-medium">{selectedLocation.openTime}</p>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={() => {
                                setShowDetails(false); 
                                showRouteInGoogleMaps();
                            }
                        }
                        className="w-full bg-primary text-emerald-950 font-bold py-3 rounded-xl"
                    >
                        Start Navigation
                    </button>

                    </div>
                </div>
            )}
        </div>
    );
};

export default MapPage;
