import { useApp } from '@/context/AppContext';
import { OrbitControls } from '@react-three/drei/native';
import { Canvas } from '@react-three/fiber';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as THREE from 'three';

// 球面上の位置と回転を計算するヘルパー
const getPositionOnSphere = (r: number, phi: number, theta: number) => {
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);

  const position = new THREE.Vector3(x, y, z);
  const up = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(up, position.clone().normalize());
  const euler = new THREE.Euler().setFromQuaternion(quaternion);

  return {
    position: [x, y, z] as [number, number, number],
    rotation: [euler.x, euler.y, euler.z] as [number, number, number],
  };
};

function PlanetTree({ position, rotation, color, type }: { position: [number, number, number], rotation: [number, number, number], color: string, type: 'work' | 'private' }) {
  return (
    <group position={position} rotation={rotation}>
      {/* 幹: 少し埋めるためにy位置を調整 */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 0.4, 5]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* 葉っぱ */}
      <mesh position={[0, 0.5, 0]}>
        {type === 'work' ? (
          <coneGeometry args={[0.25, 0.6, 3]} />
        ) : (
          <dodecahedronGeometry args={[0.25, 0]} />
        )}
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function Rock({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  return (
    <mesh position={position} rotation={rotation}>
      {/* 少し埋める */}
      <dodecahedronGeometry args={[0.15, 0]} />
      <meshStandardMaterial color="#64748B" flatShading />
    </mesh>
  );
}

function Pond({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 32]} />
        <meshStandardMaterial color="#38BDF8" opacity={0.8} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function PlanetGarden() {
  const { tasks } = useApp();

  const completedTasks = useMemo(() => {
    return tasks
      .filter(t => t.completed)
      .slice(-50);
  }, [tasks]);

  const trees = useMemo(() => {
    const count = completedTasks.length;
    return completedTasks.map((task, index) => {
      const phi = Math.acos(1 - 2 * (index + 0.5) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (index + 0.5);
      // 半径を少し小さくして(1.95)、木が浮かないようにする
      return {
        id: task.id,
        ...getPositionOnSphere(1.95, phi, theta),
        color: task.type === 'work' ? '#3B82F6' : '#F97316',
        type: task.type
      };
    });
  }, [completedTasks]);

  // 固定の装飾（池と岩）
  const decorations = useMemo(() => {
    const items = [];
    
    // 池 (2つ) - 半径を2.05にして少し浮かせる
    items.push({ type: 'pond', ...getPositionOnSphere(2.05, Math.PI / 4, 0) });
    items.push({ type: 'pond', ...getPositionOnSphere(2.05, Math.PI / 1.5, Math.PI) });

    // 岩 (5つ)
    for (let i = 0; i < 5; i++) {
        items.push({ 
            type: 'rock', 
            ...getPositionOnSphere(1.95, Math.random() * Math.PI, Math.random() * Math.PI * 2) 
        });
    }
    return items;
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Planet</Text>
        <Text style={styles.subtitle}>{completedTasks.length} trees planted</Text>
      </View>
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 2]}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#FFF" />
        
        {/* 惑星本体 */}
        <mesh>
          <icosahedronGeometry args={[2, 1]} />
          <meshStandardMaterial color="#4ADE80" flatShading />
        </mesh>

        {/* 装飾（池・岩） */}
        {decorations.map((item, index) => (
            item.type === 'pond' ? (
                <Pond key={`pond-${index}`} position={item.position} rotation={item.rotation} />
            ) : (
                <Rock key={`rock-${index}`} position={item.position} rotation={item.rotation} />
            )
        ))}

        {/* 木々 */}
        {trees.map(tree => (
          <PlanetTree 
            key={tree.id} 
            position={tree.position} 
            rotation={tree.rotation} 
            color={tree.color} 
            type={tree.type} 
          />
        ))}

        <OrbitControls 
            enableZoom={false} 
            autoRotate 
            autoRotateSpeed={0.5}
            minPolarAngle={0}
            maxPolarAngle={Math.PI}
            enablePan={false}
        />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E293B',
  },
  header: {
      position: 'absolute',
      top: 50,
      left: 20,
      zIndex: 10,
  },
  title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFF',
  },
  subtitle: {
      fontSize: 16,
      color: '#94A3B8',
      marginTop: 4,
  }
});
