import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import { LatLngTuple } from 'leaflet';
import { ref, onValue, update } from 'firebase/database';
import { realtimeDb } from '../lib/firebase';

interface User {
  name: string;
  role: string;
  docId: string;
}

interface Marker {
  id: string;
  position: LatLngTuple;
  popupText: string;
}

export const useUserLocation = (
  user: User | null,
  setPosition: Dispatch<SetStateAction<LatLngTuple | null>>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setPermissionDenied: Dispatch<SetStateAction<boolean>>,
  setGpsError: Dispatch<SetStateAction<boolean>>,
  setIsDrawerOpen: Dispatch<SetStateAction<boolean>>
) => {
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const updateUserLocation = useCallback((latitude: number, longitude: number) => {
    if (!user?.docId) {
      return;
    }
    const userRef = ref(realtimeDb, `users/${user.docId}`);
    update(userRef, { location: { latitude, longitude }, status: 'active' });
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
            }
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 5000,
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.docId) {
      return;
    }
    requestLocationAccess();
  }, [user, retryCount]);

  return { updateUserLocation, requestLocationAccess };
};

export const useMarkers = (
  user: User | null,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setVendorMarkers: Dispatch<SetStateAction<Marker[]>>,
  setUserMarkers: Dispatch<SetStateAction<Marker[]>>
) => {
  useEffect(() => {
    if (!user?.docId) {
      return;
    }
    const usersRef = ref(realtimeDb, 'users');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const newUserMarkers: Marker[] = [];
      const newVendorMarkers: Marker[] = [];

      const createMarker = (id: string, latitude: number, longitude: number, name: string): Marker => ({
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

  }, [user, setLoading, setVendorMarkers, setUserMarkers]);

  return { setVendorMarkers, setUserMarkers };
};
