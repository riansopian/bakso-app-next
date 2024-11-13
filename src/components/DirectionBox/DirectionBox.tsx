import React from 'react';
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon } from '@heroicons/react/24/outline';
import styles from './style.module.scss';

interface Step {
  direction: string;
  description: string;
}

interface DirectionsProps {
  steps: Step[];
}

const DirectionBox: React.FC<DirectionsProps> = ({ steps }) => {
  const getIcon = (direction: string) => {
    switch (direction) {
      case 'right':
        return <ArrowRightIcon />;
      case 'left':
        return <ArrowLeftIcon />;
      case 'straight':
        return <ArrowUpIcon />;
      default:
        return null;
    }
  };


  return (
    <div className={styles['direction-box']}>
      <h3>Directions</h3>
      {steps.map((step) => (
        <div className={styles['direction-step']} key={step.description}>
          {getIcon(step.direction)}
          <span>{step.description}</span>
        </div>
      ))}
    </div>
  );
};

export default DirectionBox;
