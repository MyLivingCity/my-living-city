import React, { useState } from "react";
import GoogleMapReact from "google-map-react";
import Marker from "../map/Marker";
import { MAP_KEY } from "../../lib/constants";
const DEFAULTGEO = { lat: 48.4284, lng: -123.3656 };
var markers: any = {
  home: { lat: null, lon: null },
  work: { lat: null, lon: null },
  school: { lat: null, lon: null },
};
const SimpleMap = (props: any) => {
  var [center, setCenter]: any = useState(DEFAULTGEO);
  const [zoom, setZoom] = useState(12);
  var [marker, setMarker]: any = useState({ lat: null, lon: null });
  return (
    <div style={{ height: "40vh", width: "100%" }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: MAP_KEY }}
        center={center}
        defaultZoom={zoom}
        onClick={(obj: any) => {
          setMarker((marker = { lat: obj.lat, lon: obj.lng }));
          props.sendData(markers);
          setCenter((center = { lat: obj.lat, lng: obj.lng }));
          markers[props.iconName] = marker;
        }}
      >
        <Marker lat={markers.home.lat} lng={markers.home.lon} icon={"home"} />
        <Marker lat={markers.work.lat} lng={markers.work.lon} icon={"work"} />
        <Marker
          lat={markers.school.lat}
          lng={markers.school.lon}
          icon={"school"}
        />
      </GoogleMapReact>
    </div>
  );
};

export default SimpleMap;
