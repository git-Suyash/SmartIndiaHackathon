import React from 'react';
import { useBox } from '@react-three/cannon';

const Tree = ({ position }) => {
  const [ref] = useBox(() => ({
    position: [position[0], 1, position[2]],
    args: [1, 2, 1],
    type: 'Static',
  }));

  return (
    <group ref={ref}>
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 2, 8]} />
        <meshPhongMaterial color="saddlebrown" />
      </mesh>
      <mesh position={[0, 3, 0]}>
        <coneGeometry args={[1, 2, 8]} />
        <meshPhongMaterial color="forestgreen" />
      </mesh>
    </group>
  );
};

export default Tree;
