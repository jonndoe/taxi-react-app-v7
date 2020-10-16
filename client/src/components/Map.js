
import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

function Map ({ lat, lng, zoom }) {
  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}
    >
      <GoogleMap
        center={{
          lat,
          lng
        }}
        mapContainerStyle={{
          width: '100%',
          height: '300px',
          marginBottom: '10px'
        }}
        zoom={zoom}
      >
        <Marker
          label='A'
          position={{
            lat,
            lng
          }}
        >
        </Marker>
      </GoogleMap>
    </LoadScript>
  );
}

export default Map;