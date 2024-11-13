import { useEffect, useState } from 'react';
import { Marker, Polyline, Popup, Tooltip, useMap } from 'react-leaflet';
import { icon, LatLngTuple } from 'leaflet';
import DirectionBox from '@components/DirectionBox/DirectionBox';
interface LocationMarkerProps {
  position: LatLngTuple;
  popupText?: string;
  iconUrl?: string;
  userPosition?: LatLngTuple | null;
}

interface Step {
  direction: string;
  description: string;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ position, popupText, iconUrl }) => {
  const [route, setRoute] = useState<LatLngTuple[] | null>(null);
  const [showRoute, setShowRoute] = useState<boolean>(false);
  const [steps, setSteps] = useState<Step[]>([]);

  const map = useMap();

  const customIcon = icon({
    iconUrl: iconUrl ?? '/images/cart.png',
    iconSize: [40, 40],
    iconAnchor: [12, 41],
    popupAnchor: [0, -30],
    shadowUrl: '/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [12, 41],
  });

  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  const handlePopupClose = () => {
    setShowRoute(false);
    setRoute(null);
    setSteps([]);
  };

  return (
    <>
      <Marker
        eventHandlers={{
          popupclose: handlePopupClose,
        }}
        icon={customIcon}
        position={position}>
        <Popup>
          <div className="font-medium">
            <p className="text-lg font-tsel-batik font-semibold">{popupText}</p>
          </div>
        </Popup>
        <Tooltip direction="right" offset={[25, -25]} opacity={1} permanent>
          <span className="font-poppins">{popupText}</span>
        </Tooltip>
      </Marker>

      {showRoute && route && <Polyline color="blue" opacity={0.6} positions={route} weight={4} />}

      {showRoute && steps.length > 0 && <DirectionBox steps={steps} />}
    </>
  );
};

export default LocationMarker;
