// import { useRef } from "react";
// import { useFrame } from '@react-three/fiber';

// export const Mesh = () => {
//   const meshRef = useRef();

//   // Rotate the mesh every frame
//   useFrame(() => {
//     if (meshRef.current) {
//       meshRef.current.rotation.x += 0.01;
//       meshRef.current.rotation.y += 0.01;
//     }
//   });

//   return (
//     <mesh ref={meshRef}>
//       <boxGeometry args={[1, 1, 1]} />
//       <meshStandardMaterial color={'orange'} />
//     </mesh>
//   );
// };
