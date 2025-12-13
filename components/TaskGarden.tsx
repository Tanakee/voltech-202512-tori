import { useApp } from '@/context/AppContext';
import { OrbitControls } from '@react-three/drei/native';
import { Canvas } from '@react-three/fiber';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

// シンプルな木のコンポーネント
function Tree({ position, color, type }: { position: [number, number, number], color: string, type: 'work' | 'private' }) {
  return (
    <group position={position}>
      {/* 幹 */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 1, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* 葉っぱ */}
      <mesh position={[0, 1.2, 0]}>
        {type === 'work' ? (
          // Work: 角ばった円錐（針葉樹風）
          <coneGeometry args={[0.6, 1.5, 4]} />
        ) : (
          // Private: 丸い球体（広葉樹風）
          <dodecahedronGeometry args={[0.6, 0]} />
        )}
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

export default function TaskGarden() {
  const { tasks } = useApp();

  // 完了したタスクのみを抽出
  const completedTasks = tasks.filter(t => t.completed);

  // タスクに基づいて木の位置とプロパティを生成
  const trees = useMemo(() => {
    return completedTasks.map((task, index) => {
      // 黄金角で配置（自然な分布）
      const angle = index * 137.5; 
      // 中心から少しずつ広がる
      const radius = 0.6 * Math.sqrt(index);
      const x = radius * Math.cos(angle * Math.PI / 180);
      const z = radius * Math.sin(angle * Math.PI / 180);
      
      return {
        id: task.id,
        position: [x, -1, z] as [number, number, number], 
        color: task.type === 'work' ? '#3B82F6' : '#F97316', // Work: 青, Private: オレンジ
        type: task.type
      };
    });
  }, [completedTasks]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Task Garden</Text>
        <Text style={styles.subtitle}>{completedTasks.length} plants grown</Text>
      </View>
      <Canvas camera={{ position: [0, 4, 6], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#FFD700" />
        
        {/* 地面 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
          <circleGeometry args={[10, 32]} />
          <meshStandardMaterial color="#86EFAC" />
        </mesh>

        {/* 木々 */}
        {trees.map(tree => (
          <Tree key={tree.id} position={tree.position} color={tree.color} type={tree.type} />
        ))}

        {/* カメラ操作 */}
        <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            minPolarAngle={Math.PI / 4} 
            maxPolarAngle={Math.PI / 2.5}
        />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 240,
    width: '100%',
    backgroundColor: '#E0F2FE', 
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  header: {
      position: 'absolute',
      top: 16,
      left: 16,
      zIndex: 10,
  },
  title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#0369A1',
  },
  subtitle: {
      fontSize: 12,
      color: '#0EA5E9',
      fontWeight: '600',
  }
});
