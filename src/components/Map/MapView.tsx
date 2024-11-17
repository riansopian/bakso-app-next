'use client';

import { MapContainer, TileLayer } from 'react-leaflet';
import LocationMarker from '../LocationMarker/LocationMarker';
import ConfirmationDrawer from '../ConfirmationDrawer/ConfirmationDrawer';

interface MapViewProps {
  loading: boolean;
  position: [number, number] | null;
  vendorMarkers: any[];
  userMarkers: any[];
  isDrawerOpen: boolean;
  permissionDenied: boolean;
  gpsError: boolean;
  handleRetry: () => void;
  handleConfirm: () => void;
  setIsDrawerOpen: (open: boolean) => void;
}

const MapView: React.FC<MapViewProps> = ({
  loading,
  position,
  vendorMarkers,
  userMarkers,
  isDrawerOpen,
  permissionDenied,
  gpsError,
  handleRetry,
  handleConfirm,
  setIsDrawerOpen,
}) => {
  return (
    <div className="relative">
      <button
        className="absolute top-4 right-4 z-20 p-2 bg-white rounded-full shadow-xl hover:bg-gray-200 transition duration-200"
        onClick={() => setIsDrawerOpen(true)}>
        <svg
          className="h-6 w-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M6 18L18 6M6 6l12 12"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </button>

      <MapContainer
        center={position || [106.818162, -6.2306454]}
        className="h-screen w-full"
        style={{ opacity: loading ? 0.5 : 1 }}
        zoom={20}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {vendorMarkers.map((marker) => (
          <LocationMarker key={marker.id} popupText={marker.popupText} position={marker.position} />
        ))}
        {userMarkers.map((marker) => (
          <LocationMarker key={marker.id} popupText={marker.popupText} position={marker.position} />
        ))}
      </MapContainer>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin" />
        </div>
      )}

      <ConfirmationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onConfirm={permissionDenied || gpsError ? handleRetry : handleConfirm}>
        {permissionDenied ? (
          <p>Permission denied! Please enable GPS location services and retry.</p>
        ) : gpsError ? (
          <p>GPS error detected! Ensure you have a good signal and retry.</p>
        ) : (
          <p>Closing this will deactivate tracking.</p>
        )}
      </ConfirmationDrawer>
    </div>
  );
};

export default MapView;
