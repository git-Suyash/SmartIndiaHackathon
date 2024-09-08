import React from 'react';
import { usePlane } from '@react-three/cannon';

const Ground = () => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    material: { friction: 0.6 }
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshPhongMaterial color="forestgreen" />
    </mesh>
  );
};

export default Ground;
