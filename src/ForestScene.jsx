import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const ForestScene = () => {
  const mountRef = useRef(null);
  const [isGameStarted, setIsGameStarted] = useState(false);

  // Load the Bush model only once
  const bushModel = useLoader(GLTFLoader, "./Assets/Bush.glb");
  const baseTreeModel = useLoader(GLTFLoader, "./Assets/base_Tree1.glb");
  const baseTreeModel2 = useLoader(GLTFLoader, "./Assets/base_tree2.glb");
  const grassPatchModel = useLoader(GLTFLoader, "./Assets/better_grass_part2.glb");
  const FloraModel = useLoader(GLTFLoader,"./Assets/GeoNodes3.gltf");

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
        exponent: { value: 0.6 },
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
      side: THREE.BackSide,
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);

    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    // grassPatchModel.scene.scale.set(100,100);
    // grassPatchModel.scene.rotation.x = -Math.PI/2;
    // scene.add(grassPatchModel.scene);

    // Function to create a bush
    const createBush = (x, z) => {
      const bush = new THREE.Group();
      bush.add(bushModel.scene.clone()); // Add the loaded model to the bush
      bush.position.set(x, 1.5, z);
      return bush;
    };

    const createFlora = (x, z) => {
      const flora = new THREE.Group();
      flora.add(FloraModel.scene.clone()); // Add the loaded model to the bush
      flora.position.set(x, 1.5, z);
      return flora;
    };

    // Add bushs to the scene
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 80 - 40;
      const z = Math.random() * 80 - 40;
      const bush = createBush(x, z);
      scene.add(bush);
    }

    for (let i = 0; i < 15; i++) {
      const x = Math.random() * 80 - 40;
      const z = Math.random() * 80 - 40;
      const flora = createFlora(x, z);
      scene.add(flora);
    }
    //gltf bush model

    baseTreeModel.scene.position.set(-5, 0.5, 1);
    baseTreeModel.scene.scale.set(0.5, 0.5, 0.5);
    scene.add(baseTreeModel.scene);

    baseTreeModel2.scene.position.set(5, 0.5, 1);
    baseTreeModel2.scene.scale.set(0.5, 0.5, 0.5);
    scene.add(baseTreeModel2.scene);

    // Create character
    const characterGeometry = new THREE.BoxGeometry(0.75, 1, 0.5);
    const characterMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const character = new THREE.Mesh(characterGeometry, characterMaterial);
    character.position.y = 1.75; // Position torso so its bottom sits on the ground

    // Create head (sphere) and add it on top of the torso
    const headGeometry = new THREE.SphereGeometry(0.25, 32, 32); // Radius 0.25 units
    const headMaterial = new THREE.MeshPhongMaterial({ color: 0xffcc00 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = .75; // Position head on top of the torso

    // Create left leg and add it below the torso
    const legGeometry = new THREE.BoxGeometry(0.2, 0.5, 0.2); // Narrower rectangle for the leg
    const legMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.15, 0.2, 0); // Position left leg slightly left and below the torso

    // Create right leg and add it below the torso
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.15, 0.2, 0); // Position right leg slightly right and below the torso

    // Group all parts together
    const characterGroup = new THREE.Group();
    characterGroup.add(character); // Add torso
    character.add(head); // Add head to torso
    character.add(leftLeg); // Add left leg to torso
    character.add(rightLeg); // Add right leg to torso

    // Add the group to the scene so it moves as a single entity
    scene.add(characterGroup);


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
  }, [isGameStarted, bushModel]);

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
