import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import Sky from './Sky';
import Ground from './Ground';
import Tree from './Tree';
import Character from './Character';
import HUD from './HUD';
import PhysicsWorld from './WorldPhysics';

const ForestScene = () => {
  const [isGameStarted, setIsGameStarted] = useState(false);

  const handleLogin = async () => {
    try {
      console.log("Login function called");
      setIsGameStarted(true);
    } catch (error) {
      console.error("Login failed: ", error);
      alert("Login failed. Please try again.");
    }
  };

  const handlePlayAsGuest = async () => {
    try {
      console.log("Play as Guest function called");
      setIsGameStarted(true);
    } catch (error) {
      console.error("Guest login failed: ", error);
      alert("Unable to play as guest. Please try again.");
    }
  };

  return (
    <div className="w-full h-screen">
      {!isGameStarted && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-8">Welcome to Forest Explorer</h1>
            <button onClick={handleLogin} className="btn-green">Login</button>
            <button onClick={handlePlayAsGuest} className="btn-blue">Play as Guest</button>
          </div>
        </div>
      )}
      {isGameStarted && (
        <>
          <Canvas>
            <PhysicsWorld>
              <Sky />
              <Ground />
              <Character />
              {[...Array(50)].map((_, i) => (
                <Tree key={i} position={[Math.random() * 80 - 40, 0, Math.random() * 80 - 40]} />
              ))}
            </PhysicsWorld>
          </Canvas>
          <HUD />
        </>
      )}
    </div>
  );
};

export default ForestScene;
