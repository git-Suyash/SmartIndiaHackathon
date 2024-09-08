import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const ForestScene = () => {
  const mountRef = useRef(null);
  const [isGameStarted, setIsGameStarted] = useState(false); // State to manage game start

  useEffect(() => {
    if (!isGameStarted) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Create sky
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    const skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x0077ff) },
        bottomColor: { value: new THREE.Color(0xffffff) },
        offset: { value: 33 },
        exponent: { value: 0.6 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
      side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);

    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Function to create a tree
    const createTree = (x, z) => {
      const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 8);
      const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);

      const leavesGeometry = new THREE.ConeGeometry(1, 2, 8);
      const leavesMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
      const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
      leaves.position.y = 2;

      const tree = new THREE.Group();
      tree.add(trunk);
      tree.add(leaves);
      tree.position.set(x, 1, z);
      return tree;
    };

    // Add trees to the scene
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 80 - 40;
      const z = Math.random() * 80 - 40;
      const tree = createTree(x, z);
      scene.add(tree);
    }

    // Create character
    const characterGeometry = new THREE.BoxGeometry(0.5, 1, 0.5);
    const characterMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const character = new THREE.Mesh(characterGeometry, characterMaterial);
    character.position.y = 0.5;
    scene.add(character);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Add directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Camera setup
    const cameraOffset = new THREE.Vector3(0, 2, 5);
    camera.position.copy(character.position).add(cameraOffset);
    camera.lookAt(character.position);

    // Character and camera movement
    const moveSpeed = 0.1;
    const turnSpeed = 0.02;
    const keysPressed = {};
    let mouseX = 0;

    document.addEventListener('keydown', (event) => {
      keysPressed[event.key.toLowerCase()] = true;
    });

    document.addEventListener('keyup', (event) => {
      keysPressed[event.key.toLowerCase()] = false;
    });

    document.addEventListener('mousemove', (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    });

    const moveCharacter = () => {
      const direction = new THREE.Vector3();

      if (keysPressed['w']) direction.z -= 1;
      if (keysPressed['s']) direction.z += 1;
      if (keysPressed['a']) direction.x -= 1;
      if (keysPressed['d']) direction.x += 1;

      direction.normalize().multiplyScalar(moveSpeed);

      // Rotate direction based on character rotation
      direction.applyQuaternion(character.quaternion);

      character.position.add(direction);

      // Rotate character based on mouse movement
      character.rotation.y -= mouseX * turnSpeed;

      // Update camera position
      const idealOffset = cameraOffset.clone().applyQuaternion(character.quaternion);
      const idealLookat = new THREE.Vector3(0, 1, -3).applyQuaternion(character.quaternion);

      const t = 0.1; // Smoothing factor
      camera.position.lerp(character.position.clone().add(idealOffset), t);
      const targetLookAt = character.position.clone().add(idealLookat);
      camera.lookAt(targetLookAt);
    };

    const clock = new THREE.Clock(); // Clock to track time
    let lastTime = 0; // Track the last time the animation was rendered
    const targetFPS = 60;
    const frameInterval = 1 / targetFPS;

    const animate = () => {
      requestAnimationFrame(animate);

      // Calculate time elapsed
      const elapsedTime = clock.getElapsedTime();
      const deltaTime = elapsedTime - lastTime;

      if (deltaTime >= frameInterval) {
        // Update the last time
        lastTime = elapsedTime - (deltaTime % frameInterval);

        // Move the character and render the scene
        moveCharacter();
        renderer.render(scene, camera);
      }
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [isGameStarted]);

  const handleLogin = async () => {
    try {
      // Add login logic here
      console.log("Login function called");
      // Simulate success
      setIsGameStarted(true);
    } catch (error) {
      console.error("Login failed: ", error);
      alert("Login failed. Please try again.");
    }
  };

  const handlePlayAsGuest = async () => {
    try {
      // Add guest login logic here
      console.log("Play as Guest function called");
      // Simulate success
      setIsGameStarted(true);
    } catch (error) {
      console.error("Guest login failed: ", error);
      alert("Unable to play as guest. Please try again.");
    }
  };

  return (
    <div className="w-full h-screen" ref={mountRef}>
      {!isGameStarted && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-8">Welcome to Forest Explorer</h1>
            <button
              onClick={handleLogin}
              className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 rounded-lg px-6 py-3 m-2"
              style={{
                transform: 'perspective(500px) rotateX(10deg)',
                boxShadow: '0px 4px 20px rgba(0, 128, 0, 0.5)',
                transition: 'transform 0.3s ease'
              }}
            >
              Login
            </button>
            <button
              onClick={handlePlayAsGuest}
              className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 rounded-lg px-6 py-3 m-2"
              style={{
                transform: 'perspective(500px) rotateX(10deg)',
                boxShadow: '0px 4px 20px rgba(0, 0, 128, 0.5)',
                transition: 'transform 0.3s ease'
              }}
            >
              Play as Guest
            </button>
          </div>
        </div>
      )}
      {isGameStarted && (
        <div className="absolute top-4 left-4 bg-white bg-opacity-75 p-4 rounded-lg">
          <h1 className="text-2xl font-bold text-green-800">Forest Explorer</h1>
          <p className="text-sm text-gray-600">Use W, A, S, D keys to move</p>
          <p className="text-sm text-gray-600">Move mouse left/right to turn</p>
        </div>
      )}
    </div>
  );
};

export default ForestScene;
