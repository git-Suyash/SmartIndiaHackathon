import React, { useRef,useEffect } from 'react';
import { useBox } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';

const Character = () => {
  const [ref, api] = useBox(() => ({
    mass: 1,
    position: [0, 0.5, 0],
    args: [0.5, 1, 0.5],
  }));

  const velocity = useRef([0, 0, 0]);
  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), []);

  const moveSpeed = 5;
  const keysPressed = useRef({});

  useEffect(() => {
    const handleKeyDown = (event) => {
      keysPressed.current[event.key.toLowerCase()] = true;
    };

    const handleKeyUp = (event) => {
      keysPressed.current[event.key.toLowerCase()] = false;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    const direction = new Vector3();
    if (keysPressed.current['w']) direction.z -= 1;
    if (keysPressed.current['s']) direction.z += 1;
    if (keysPressed.current['a']) direction.x -= 1;
    if (keysPressed.current['d']) direction.x += 1;

    direction.normalize().multiplyScalar(moveSpeed);
    api.velocity.set(direction.x, velocity.current[1], direction.z);
  });

  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={[0.5, 1, 0.5]} />
      <meshPhongMaterial color="red" />
    </mesh>
  );
};

export default Character;
