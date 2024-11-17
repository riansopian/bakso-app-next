// pages/MapComponent.js
'use client';
import { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useCallback, useEffect, useState } from 'react';
import LocationMarker from '../LocationMarker/LocationMarker';
import useLocalStorage from '../../hooks/useLocalStorage';
import { realtimeDb } from '../../lib/firebase';
import { ref, onValue, update } from 'firebase/database';
import { useRouter } from 'next/navigation';
import ConfirmationDrawer from '@components/ConfirmationDrawer/ConfirmationDrawer';
import { toast } from 'react-toastify';

const ContentConfirmation = ({
  permissionDenied,
  gpsError,
  user,
}: {
  permissionDenied: boolean;
  gpsError: boolean;
  user: { role: string };
}) => {
  const renderPermissionDenied = () => (
    <>
      <p className="font-semibold">Akses lokasi ditolak</p>
      <p className="text-sm text-gray-500 mt-4">
        Mohon mengaktifkan layanan lokasi di pengaturan browser kamu dan coba lagi.
      </p>
    </>
  );

  const renderGpsError = () => (
    <>
      <p className="font-semibold">Sinyal GPS lemah</p>
      <p className="text-sm text-gray-500 mt-4">
        Mohon pastikan kamu berada di tempat dengan sinyal GPS yang baik dan coba lagi.
      </p>
    </>
  );

  const renderDefault = () => (
    <p>{`Dengan menutup halaman ini, kamu akan keluar dari pantauan ${user.role === 'customer' ? 'Tukang Bakso' : 'Customer'}`}</p>
  );

  if (permissionDenied) {
    return renderPermissionDenied();
  } else if (gpsError) {
    return renderGpsError();
  } else {
    return renderDefault();
  }
};

const MapComponent = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [position, setPosition] = useState<LatLngTuple | null>(null);

  const [vendorMarkers, setVendorMarkers] = useState<
    {
      id: string;
      position: LatLngTuple;
      popupText: string;
    }[]
  >([]);
  const [userMarkers, setUserMarkers] = useState<
    {
      id: string;
      position: LatLngTuple;
      popupText: string;
    }[]
  >([]);
  const [user, setUser] = useLocalStorage<{
    name: string;
    role: string;
    docId: string;
  }>('user', { name: '', role: '', docId: '' });

  const [permissionDenied, setPermissionDenied] = useState(false);
  const [gpsError, setGpsError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const MAX_RETRIES = 3;

  useEffect(() => {
    if (!user?.docId) {
      router.push('/verification');
    }
  }, [user, router]);

  const updateUserLocation = useCallback(
    (latitude: number, longitude: number) => {
      if (!user?.docId) {
        return;
      }
      const userRef = ref(realtimeDb, `users/${user.docId}`);

      update(userRef, {
        location: { latitude, longitude },
        status: 'active',
      });
    },
    [user],
  );

  useEffect(() => {
    if (!user?.docId) {
      return;
    }

    const usersRef = ref(realtimeDb, 'users');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const newUserMarkers = [];
      const newVendorMarkers = [];

      const createMarker = (id: string, latitude: number, longitude: number, name: string) => ({
        id,
        position: [latitude, longitude] as LatLngTuple,
        popupText: name,
      });

      const isMatchingRole = (userRole: string, dataRole: string) =>
        (userRole === 'customer' && dataRole === 'vendor') ||
        (userRole === 'vendor' && dataRole === 'customer');

      for (const id in data) {
        const userData = data[id];
        const { location, status, name, role } = userData;

        if (location && status === 'active') {
          const marker = createMarker(id, location.latitude, location.longitude, name);

          if (isMatchingRole(user.role, role)) {
            if (user.role === 'customer') {
              newVendorMarkers.push(marker);
            } else {
              newUserMarkers.push(marker);
            }
          }

          if (id === user.docId) {
            (user.role === 'customer' ? newUserMarkers : newVendorMarkers).push(marker);
          }
        }
      }

      setUserMarkers(newUserMarkers);
      setVendorMarkers(newVendorMarkers);
      setLoading(false);
    });
  }, [user]);

  const requestLocationAccess = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          updateUserLocation(latitude, longitude);
          setLoading(false);
          setGpsError(false);
          setIsDrawerOpen(false);
        },
        (error) => {
          setLoading(false);
          if (error.code === error.PERMISSION_DENIED) {
            setPermissionDenied(true);
            setIsDrawerOpen(true);
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            setGpsError(true);
            setIsDrawerOpen(true);
            if (retryCount < MAX_RETRIES) {
              setTimeout(() => {
                setRetryCount(retryCount + 1);
                requestLocationAccess();
              }, 5000);
            } else {
              toast.error(
                'Gagal mendapatkan lokasi karena GPS tidak tersedia. Mohon coba lagi nanti.',
              );
            }
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 5000,
        },
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.docId) {
      router.push('/verification');
    } else {
      requestLocationAccess();
    }
  }, [user]);

  const handleCloseClick = () => {
    setIsDrawerOpen(true);
  };

  const handleConfirm = async () => {
    if (!user?.docId) {
      return;
    }

    try {
      const userRef = ref(realtimeDb, `users/${user.docId}`);
      await update(userRef, { status: 'inactive' });
      let message;
      if (user.role === 'vendor') {
        message = 'Kamu telah menonaktifkan status Tukang Bakso';
      } else if (user.role === 'customer') {
        message = 'Kamu telah keluar dari pantauan Tukang Bakso';
      } else {
        message = 'Status kamu telah diperbarui.';
      }
      toast.info(message);
      setUser({
        name: '',
        role: '',
        docId: '',
      });
      router.push('/verification');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating user status: ', error);
    }
    setIsDrawerOpen(false);
  };

  const handleRetry = () => {
    setPermissionDenied(false);
    setIsDrawerOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="absolute top-4 right-4 z-20 p-2 bg-white rounded-full shadow-xl hover:bg-gray-200 transition duration-200"
        onClick={handleCloseClick}>
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
      <div className="h-screen w-full md:h-screen md:w-screen">
        <MapContainer
          attributionControl={false}
          center={position || [106.818162, -6.2306454]}
          className="h-full w-full transition-opacity duration-300 z-10"
          key={loading ? 'loading' : 'loaded'}
          style={{ opacity: loading ? 0.5 : 1 }}
          zoom={20}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {vendorMarkers.map((marker) => (
            <LocationMarker
              key={marker.id}
              popupText={marker.popupText}
              position={marker.position}
              userPosition={position}
            />
          ))}
          {userMarkers.map((marker) => (
            <LocationMarker
              iconUrl="/images/user.png"
              key={marker.id}
              popupText={marker.popupText}
              position={marker.position}
              userPosition={position}
            />
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
          <ContentConfirmation
            gpsError={gpsError}
            permissionDenied={permissionDenied}
            user={user}
          />
        </ConfirmationDrawer>
      </div>
    </div>
  );
};

export default MapComponent;
