import React from 'react';

const HUD = () => {
  return (
    <div className="absolute top-4 left-4 bg-white bg-opacity-75 p-4 rounded-lg">
      <h1 className="text-2xl font-bold text-green-800">Forest Explorer</h1>
      <p className="text-sm text-gray-600">Use W, A, S, D keys to move</p>
      <p className="text-sm text-gray-600">Move mouse left/right to turn</p>
    </div>
  );
};

export default HUD;
