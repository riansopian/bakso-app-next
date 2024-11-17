'use client';

import { useCallback, useEffect, useState } from 'react';
import { LatLngTuple } from 'leaflet';
import { useRouter } from 'next/navigation';
import { ref, onValue, update } from 'firebase/database';
import { toast } from 'react-toastify';
import useLocalStorage from '../hooks/useLocalStorage';
import { realtimeDb } from '../lib/firebase';

interface MarkerData {
  id: string;
  position: LatLngTuple;
  popupText: string;
}

interface User {
  name: string;
  role: string;
  docId: string;
}

const useMapLogic = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [position, setPosition] = useState<LatLngTuple | null>(null);
  const [vendorMarkers, setVendorMarkers] = useState<MarkerData[]>([]);
  const [userMarkers, setUserMarkers] = useState<MarkerData[]>([]);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [gpsError, setGpsError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const [user, setUser] = useLocalStorage<User>('user', { name: '', role: '', docId: '' });

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
    [user]
  );

  useEffect(() => {
    if (!user?.docId) {
      return;
    }

    const usersRef = ref(realtimeDb, 'users');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const newUserMarkers: MarkerData[] = [];
      const newVendorMarkers: MarkerData[] = [];

      const createMarker = (id: string, latitude: number, longitude: number, name: string): MarkerData => ({
        id,
        position: [latitude, longitude],
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
            if (user.role === 'customer') {newVendorMarkers.push(marker);}
            else {newUserMarkers.push(marker);}
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
              toast.error('Failed to get location due to unavailable GPS. Please try again later.');
            }
          }
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.docId) {router.push('/verification');}
    else {requestLocationAccess();}
  }, [user]);

  const handleRetry = () => {
    setPermissionDenied(false);
    setIsDrawerOpen(false);
  };

  const handleConfirm = async () => {
    if (!user?.docId) {return;}

    try {
      const userRef = ref(realtimeDb, `users/${user.docId}`);
      await update(userRef, { status: 'inactive' });
      toast.info(
        `You have ${
          user.role === 'vendor' ? 'deactivated your vendor status' : 'logged out from the map'
        }.`
      );
      setUser({ name: '', role: '', docId: '' });
      router.push('/verification');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating user status: ', error);
    }
    setIsDrawerOpen(false);
  };

  return {
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
  };
};

export default useMapLogic;
