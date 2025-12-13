import { useApp } from '@/context/AppContext';
import { OrbitControls } from '@react-three/drei/native';
import { Canvas, useFrame } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as THREE from 'three';

function CrystalMesh({ workRatio }: { workRatio: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  
  // Interpolate color: 0 (Private/Orange) -> 1 (Work/Blue)
  const color = useMemo(() => {
    const colorPrivate = new THREE.Color('#F97316'); // Orange
    const colorWork = new THREE.Color('#3B82F6');    // Blue
    return colorPrivate.clone().lerp(colorWork, workRatio);
  }, [workRatio]);

  useFrame((state, delta) => {
    if (mesh.current) {
      // Slowly rotate
      mesh.current.rotation.x += delta * 0.2;
      mesh.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <mesh ref={mesh} position={[0, 0, 0]} scale={1.8}>
      <octahedronGeometry args={[1, 0]} />
      <meshPhysicalMaterial 
        color={color}
        roughness={0.1}
        metalness={0.1}
        transmission={0.6} // Glass-like transparency
        thickness={1}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </mesh>
  );
}

export default function BalanceCrystal() {
  const { tasks } = useApp();
  const [now, setNow] = useState(Date.now());

  // Update timer for smooth animation if tasks are running
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { workRatio, balanceText } = useMemo(() => {
    let workTime = 0;
    let privateTime = 0;
    
    tasks.forEach(t => {
        const time = t.elapsedTime + (t.isRunning && t.startTime ? (now - t.startTime) / 1000 : 0);
        if (t.type === 'work') workTime += time;
        else privateTime += time;
    });

    const total = workTime + privateTime;
    const ratio = total === 0 ? 0.5 : workTime / total;
    
    let text = 'Perfectly Balanced';
    if (ratio > 0.6) text = 'Work Heavy';
    if (ratio > 0.8) text = 'Work Overload';
    if (ratio < 0.4) text = 'Private Heavy';
    if (ratio < 0.2) text = 'Private Overload';

    return { workRatio: ratio, balanceText: text };
  }, [tasks, now]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Life Balance Crystal</Text>
        <Text style={styles.subtitle}>{balanceText}</Text>
      </View>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={1} color="#FFF" />
        
        <CrystalMesh workRatio={workRatio} />
        
        <OrbitControls enableZoom={false} />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    overflow: 'hidden',
  },
  header: {
      position: 'absolute',
      top: 40,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 10,
  },
  title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#334155',
  },
  subtitle: {
      fontSize: 16,
      color: '#64748B',
      marginTop: 4,
      fontWeight: '500',
  }
});
