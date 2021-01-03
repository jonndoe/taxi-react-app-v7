import React, { createRef, useState, Component } from 'react';
import { Map as LeafletMap, TileLayer, Marker, Popup } from 'react-leaflet';
import {latLng} from "leaflet/dist/leaflet-src.esm";


function MapOSM (props) {
  const [response, setResponse] = useState(null);

  const [lat, setLat ] = useState(null);
  const [lng, setLng ] = useState(null);

  const hasTwoAddresses = (
    props.pickUpAddress !== '' &&
    props.dropOffAddress !== ''
  );

  const directionsCallback = (response) => {
    if (response !== null && response.status === 'OK') {
      setResponse(response);
    }
  };

  const position = [51.505, -0.09];

  const handleClick = (e) => {
    const { lat, lng } = e.latlng;
    console.log(lat, lng);
    setLat(lat);
    setLng(lng);
  };

  return (


      <LeafletMap
        center={[54, 20.4]}
        zoom={6}
        maxZoom={10}
        attributionControl={true}
        zoomControl={true}
        doubleClickZoom={true}
        scrollWheelZoom={true}
        dragging={true}
        animate={true}
        easeLinearity={0.35}
        onclick={handleClick}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[50, 10]}>
          <Popup>
            The position you clicked is { lat }-----{ lng }
          </Popup>
        </Marker>

      </LeafletMap>
  );
}

export default MapOSM;

//url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"





