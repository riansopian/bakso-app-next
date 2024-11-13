import React from 'react';
import styles from './style.module.scss';
import { LatLngTuple } from 'leaflet';

interface Waypoint {
  name: string;
  hint: string;
  distance: number;
  location: LatLngTuple;
}

interface WaypointsBoxProps {
  waypoints: Waypoint[];
}

const WaypointsBox: React.FC<WaypointsBoxProps> = ({ waypoints }) => {

  return (
    <div className={styles['direction-box']}>
      <h3 className="text-lg font-semibold font-tsel-batik mb-2 text-gray-800">Alamat</h3>
      {waypoints.map((waypoint, index) => (
        <div className={`${styles['direction-step']} font-poppins text-gray-600`} key={waypoint.hint}>
          <span>{index === 0 ? 'Dari: ' : 'Ke: '}</span><span>&nbsp;{waypoint.name}</span>
        </div>
      ))}
    </div>
  );
};

export default WaypointsBox;
