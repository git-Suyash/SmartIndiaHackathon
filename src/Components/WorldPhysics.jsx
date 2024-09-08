import React from 'react';
import { Physics } from '@react-three/cannon';

const PhysicsWorld = ({ children }) => {
  return (
    <Physics gravity={[0, -9.8, 0]} allowSleep={false}>
      {children}
    </Physics>
  );
};

export default PhysicsWorld;
