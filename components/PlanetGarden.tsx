import { useApp } from '@/context/AppContext';
import { Canvas, useFrame } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
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
      {/* 幹 */}
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
      <dodecahedronGeometry args={[0.15, 0]} />
      <meshStandardMaterial color="#64748B" flatShading />
    </mesh>
  );
}

// 光るクリスタルの鉱脈
function CrystalCluster({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* メインのクリスタル */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0, 0.15, 0.8, 4]} />
        <meshStandardMaterial color="#A78BFA" emissive="#7C3AED" emissiveIntensity={0.5} roughness={0.1} />
      </mesh>
      {/* サブのクリスタル1 */}
      <mesh position={[0.15, 0.2, 0.1]} rotation={[0.2, 0, 0.2]}>
        <cylinderGeometry args={[0, 0.1, 0.5, 4]} />
        <meshStandardMaterial color="#A78BFA" emissive="#7C3AED" emissiveIntensity={0.5} roughness={0.1} />
      </mesh>
      {/* サブのクリスタル2 */}
      <mesh position={[-0.1, 0.25, -0.1]} rotation={[-0.2, 0, -0.1]}>
        <cylinderGeometry args={[0, 0.12, 0.6, 4]} />
        <meshStandardMaterial color="#A78BFA" emissive="#7C3AED" emissiveIntensity={0.5} roughness={0.1} />
      </mesh>
      
      {/* 光源 */}
      <pointLight color="#A78BFA" intensity={1.5} distance={3} decay={2} position={[0, 0.5, 0]} />
    </group>
  );
}

// 自動回転＆慣性コンポーネント
function AutoRotator({ groupRef, isDragging, velocity }: { 
  groupRef: React.RefObject<THREE.Group>, 
  isDragging: React.MutableRefObject<boolean>,
  velocity: React.MutableRefObject<{ x: number, y: number }>
}) {
  useFrame(() => {
    if (groupRef.current) {
      if (!isDragging.current) {
        // 慣性回転
        if (Math.abs(velocity.current.x) > 0.0001 || Math.abs(velocity.current.y) > 0.0001) {
          groupRef.current.rotation.y += velocity.current.x;
          groupRef.current.rotation.x += velocity.current.y;
          
          // 減衰 (摩擦)
          velocity.current.x *= 0.95;
          velocity.current.y *= 0.95;
        } else {
          // 完全に止まったら自動回転（Y軸のみ）
          groupRef.current.rotation.y += 0.002;
        }
      }
    }
  });
  return null;
}

export default function PlanetGarden() {
  const { tasks } = useApp();
  const groupRef = useRef<THREE.Group>(null);
  const rotationRef = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const velocity = useRef({ x: 0, y: 0 });

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
      return {
        id: task.id,
        ...getPositionOnSphere(1.95, phi, theta),
        color: task.type === 'work' ? '#3B82F6' : '#F97316',
        type: task.type
      };
    });
  }, [completedTasks]);

  const decorations = useMemo(() => {
    const items = [];
    items.push({ type: 'crystal', ...getPositionOnSphere(1.9, Math.PI / 4, 0) });
    items.push({ type: 'crystal', ...getPositionOnSphere(1.9, Math.PI / 1.5, Math.PI) });
    for (let i = 0; i < 5; i++) {
        items.push({ 
            type: 'rock', 
            ...getPositionOnSphere(1.95, Math.random() * Math.PI, Math.random() * Math.PI * 2) 
        });
    }
    return items;
  }, []);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      isDragging.current = true;
      velocity.current = { x: 0, y: 0 }; // タッチしたら慣性ストップ
      if (groupRef.current) {
        rotationRef.current = {
          x: groupRef.current.rotation.x,
          y: groupRef.current.rotation.y
        };
      }
    },
    onPanResponderMove: (_, gestureState) => {
      if (groupRef.current) {
        groupRef.current.rotation.y = rotationRef.current.y + gestureState.dx * 0.005;
        groupRef.current.rotation.x = rotationRef.current.x + gestureState.dy * 0.005;
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      isDragging.current = false;
      // 離した瞬間の速度をセット（慣性用）
      velocity.current = { 
        x: gestureState.vx * 0.015, 
        y: gestureState.vy * 0.015 
      };
    },
    onPanResponderTerminate: () => {
      isDragging.current = false;
    },
  }), []);

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Planet</Text>
        <Text style={styles.subtitle}>{completedTasks.length} trees planted</Text>
      </View>
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 2]}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <pointLight position={[-10, -10, -5]} intensity={0.3} color="#FFF" />
        
        <group ref={groupRef}>
          {/* 惑星本体 */}
          <mesh>
            <icosahedronGeometry args={[2, 1]} />
            <meshStandardMaterial color="#4ADE80" flatShading roughness={0.8} />
          </mesh>

          {/* 装飾 */}
          {decorations.map((item, index) => (
              item.type === 'crystal' ? (
                  <CrystalCluster key={`crystal-${index}`} position={item.position} rotation={item.rotation} />
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
        </group>

        <AutoRotator groupRef={groupRef} isDragging={isDragging} velocity={velocity} />
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
