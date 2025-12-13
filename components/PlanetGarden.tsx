import { useApp } from '@/context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { Canvas, useFrame } from '@react-three/fiber';
import { useAudioPlayer } from 'expo-audio';
import { Audio } from 'expo-av';
import { usePathname } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, PanResponder, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

const getFibonacciPosition = (index: number, total: number) => {
  const phi = Math.acos(1 - 2 * (index + 0.5) / total);
  const theta = Math.PI * (1 + Math.sqrt(5)) * index;
  return getPositionOnSphere(1.93, phi, theta);
};

function BGMPlayer() {
  // Using a reliable direct MP3 link for royalty-free ambient music
  // Source: Kevin MacLeod - "Music for Manatees" (incompetech.com)
  // Licensed under Creative Commons: By Attribution 4.0 License
  const player = useAudioPlayer('https://incompetech.com/music/royalty-free/mp3-royaltyfree/Music%20for%20Manatees.mp3');
  const pathname = usePathname();
  const isFocused = pathname === '/planet';
  const [shouldPlay, setShouldPlay] = useState(true);

  useEffect(() => {
    if (player) {
        player.loop = true;
        player.volume = 0.3;
        
        if (isFocused && shouldPlay) {
            player.play();
        } else {
            player.pause();
        }
    }
  }, [player, isFocused, shouldPlay]);

  const toggleSound = () => {
      setShouldPlay(prev => !prev);
  };

  return (
      <TouchableOpacity 
        style={styles.bgmButton} 
        onPress={toggleSound}
      >
          <Ionicons name={shouldPlay ? "volume-high" : "volume-mute"} size={20} color="#FFF" />
      </TouchableOpacity>
  );
}

// 木（Private用）
function PlanetTree({ position, rotation, color }: { position: [number, number, number], rotation: [number, number, number], color: string }) {
  return (
    <group position={position} rotation={rotation} scale={[0.7, 0.7, 0.7]}>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 0.4, 5]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <dodecahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

// 工場（Work用）
function Factory({ position, rotation, color }: { position: [number, number, number], rotation: [number, number, number], color: string }) {
  const roofShape = useMemo(() => {
    const s = new THREE.Shape();
    const w = 0.1; // 屋根1つの幅
    const h = 0.08; // 屋根の高さ
    
    s.moveTo(-0.15, 0); // 左端からスタート
    
    // 1つ目の山
    s.lineTo(-0.15, h);
    s.lineTo(-0.05, 0);
    
    // 2つ目の山
    s.lineTo(-0.05, h);
    s.lineTo(0.05, 0);
    
    // 3つ目の山
    s.lineTo(0.05, h);
    s.lineTo(0.15, 0);
    
    s.lineTo(-0.15, 0); // 閉じる
    return s;
  }, []);

  const extrudeSettings = useMemo(() => ({
    depth: 0.2,
    bevelEnabled: false
  }), []);

  return (
    <group position={position} rotation={rotation} scale={[0.6, 0.6, 0.6]}>
      {/* 土台（本体） */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.3, 0.2, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* のこぎり屋根 */}
      <mesh position={[0, 0.2, -0.1]}>
         <extrudeGeometry args={[roofShape, extrudeSettings]} />
         <meshStandardMaterial color={color} />
      </mesh>

      {/* 煙突 */}
      <mesh position={[0.1, 0.35, -0.05]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      {/* 煙（簡易的） */}
      <mesh position={[0.12, 0.52, -0.05]}>
         <dodecahedronGeometry args={[0.03, 0]} />
         <meshStandardMaterial color="#CBD5E1" transparent opacity={0.8} />
      </mesh>

      {/* 窓 */}
      <mesh position={[-0.08, 0.1, 0.105]}>
         <planeGeometry args={[0.05, 0.08]} />
         <meshStandardMaterial color="#FDE047" emissive="#FDE047" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.08, 0.1, 0.105]}>
         <planeGeometry args={[0.05, 0.08]} />
         <meshStandardMaterial color="#FDE047" emissive="#FDE047" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

// 家（Private用）
function House({ position, rotation, color }: { position: [number, number, number], rotation: [number, number, number], color: string }) {
  return (
    <group position={position} rotation={rotation} scale={[0.6, 0.6, 0.6]}>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.18, 0.2, 0.18]} />
        <meshStandardMaterial color="#FDE68A" />
      </mesh>
      <mesh position={[0, 0.3, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.2, 0.15, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

// 花（Private用）
function Flower({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation} scale={[0.6, 0.6, 0.6]}>
      {/* 茎 */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 5]} />
        <meshStandardMaterial color="#4ADE80" />
      </mesh>
      {/* 中心 */}
      <mesh position={[0, 0.27, 0]}>
        <icosahedronGeometry args={[0.06, 0]} />
        <meshStandardMaterial color="#FDE047" />
      </mesh>
      {/* 花びら */}
      {[...Array(5)].map((_, i) => (
         <mesh key={i} position={[Math.sin(i/5 * Math.PI*2)*0.08, 0.25, Math.cos(i/5 * Math.PI*2)*0.08]} rotation={[0.5, i/5 * Math.PI*2, 0]}>
            <dodecahedronGeometry args={[0.05, 0]} />
            <meshStandardMaterial color="#F472B6" />
         </mesh>
      ))}
    </group>
  );
}

// キノコ（Private用）
function Mushroom({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation} scale={[0.7, 0.7, 0.7]}>
      {/* 柄 */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.2, 6]} />
        <meshStandardMaterial color="#F1F5F9" />
      </mesh>
      {/* かさ */}
      <mesh position={[0, 0.3, 0]}>
        <coneGeometry args={[0.18, 0.15, 8]} />
        <meshStandardMaterial color="#EF4444" />
      </mesh>
      {/* 水玉模様 */}
      {[...Array(4)].map((_, i) => (
         <mesh key={i} position={[Math.sin(i/4 * Math.PI*2)*0.08, 0.32, Math.cos(i/4 * Math.PI*2)*0.08]}>
            <dodecahedronGeometry args={[0.03, 0]} />
            <meshStandardMaterial color="#F1F5F9" />
         </mesh>
      ))}
    </group>
  );
}

// オブジェクトの出し分け
function PlanetObject({ position, rotation, type, id }: { position: [number, number, number], rotation: [number, number, number], type: 'work' | 'private', id: string }) {
  const variant = useMemo(() => {
    const charCode = id.charCodeAt(id.length - 1);
    return charCode; 
  }, [id]);

  if (type === 'work') {
    // Work: 工場(50%) or 家(50%)
    if (variant % 2 === 0) {
      return <Factory position={position} rotation={rotation} color="#60A5FA" />;
    } else {
      return <House position={position} rotation={rotation} color="#F97316" />;
    }
  } else {
    // Private: 木, 花, キノコ
    const natureVariant = variant % 3;
    if (natureVariant === 0) {
      return <PlanetTree position={position} rotation={rotation} color="#4ADE80" />;
    } else if (natureVariant === 1) {
      return <Flower position={position} rotation={rotation} />;
    } else {
      return <Mushroom position={position} rotation={rotation} />;
    }
  }
}

// 岩（Rock）コンポーネント（onClick追加）
function Rock({ position, rotation, onClick }: { position: [number, number, number], rotation: [number, number, number], onClick: () => void }) {
  return (
    <group position={position} rotation={rotation} scale={[0.5, 0.5, 0.5]} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Hitbox */}
      <mesh visible={false}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <dodecahedronGeometry args={[0.15, 0]} />
        <meshStandardMaterial color="#64748B" flatShading />
      </mesh>
    </group>
  );
}

// 雑草（Weed）コンポーネント
function Weed({ position, rotation, onClick }: { position: [number, number, number], rotation: [number, number, number], onClick: () => void }) {
  return (
    <group position={position} rotation={rotation} scale={[0.5, 0.5, 0.5]} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Hitbox */}
      <mesh visible={false} position={[0, 0.15, 0]}>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshBasicMaterial transparent opacity={0} />
      </mesh>
      {[...Array(3)].map((_, i) => (
         <mesh key={i} position={[0, 0.1, 0]} rotation={[0, (i * Math.PI * 2) / 3, Math.PI / 6]}>
            <planeGeometry args={[0.1, 0.3]} />
            <meshStandardMaterial color="#86EFAC" side={THREE.DoubleSide} />
         </mesh>
      ))}
    </group>
  );
}

function CrystalCluster({ position, rotation, onClick }: { position: [number, number, number], rotation: [number, number, number], onClick?: () => void }) {
  return (
    <group position={position} rotation={rotation} scale={[0.6, 0.6, 0.6]} onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      {/* Hitbox */}
      <mesh visible={false} position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.8, 8]} />
          <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0, 0.15, 0.8, 4]} />
        <meshStandardMaterial color="#A78BFA" emissive="#7C3AED" emissiveIntensity={0.5} roughness={0.1} />
      </mesh>
      <mesh position={[0.15, 0.2, 0.1]} rotation={[0.2, 0, 0.2]}>
        <cylinderGeometry args={[0, 0.1, 0.5, 4]} />
        <meshStandardMaterial color="#A78BFA" emissive="#7C3AED" emissiveIntensity={0.5} roughness={0.1} />
      </mesh>
      <mesh position={[-0.1, 0.25, -0.1]} rotation={[-0.2, 0, -0.1]}>
        <cylinderGeometry args={[0, 0.12, 0.6, 4]} />
        <meshStandardMaterial color="#A78BFA" emissive="#7C3AED" emissiveIntensity={0.5} roughness={0.1} />
      </mesh>
      <pointLight color="#A78BFA" intensity={1.5} distance={3} decay={2} position={[0, 0.5, 0]} />
    </group>
  );
}

function AutoRotator({ groupRef, isDragging, velocity }: { 
  groupRef: React.RefObject<THREE.Group>, 
  isDragging: React.MutableRefObject<boolean>,
  velocity: React.MutableRefObject<{ x: number, y: number }>
}) {
  useFrame(() => {
    if (groupRef.current) {
      if (!isDragging.current) {
        if (Math.abs(velocity.current.x) > 0.0001 || Math.abs(velocity.current.y) > 0.0001) {
          groupRef.current.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), velocity.current.x);
          groupRef.current.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), velocity.current.y);
          velocity.current.x *= 0.95;
          velocity.current.y *= 0.95;
        } else {
          groupRef.current.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), 0.002);
        }
      }
    }
  });
  return null;
}

function SelectionMarker({ position }: { position: [number, number, number] }) {
    const ref = useRef<THREE.Mesh>(null);
    
    const posVec = useMemo(() => new THREE.Vector3(...position), [position]);
    const direction = useMemo(() => posVec.clone().normalize(), [posVec]);

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y += 0.05;
            
            // Bobbing effect along the normal vector
            const offset = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
            ref.current.position.copy(posVec).add(direction.clone().multiplyScalar(offset));
            
            // Align with surface normal
            ref.current.lookAt(new THREE.Vector3(0,0,0));
        }
    });
    return (
        <mesh ref={ref}>
            <octahedronGeometry args={[0.1, 0]} />
            <meshStandardMaterial color="#FDE047" emissive="#FDE047" emissiveIntensity={0.5} />
        </mesh>
    );
}

function StarField() {
  const stars = useMemo(() => {
    const positions = [];
    for(let i=0; i<800; i++) {
      const r = 10 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      positions.push(x, y, z);
    }
    return new Float32Array(positions);
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={stars.length / 3}
          array={stars}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.15} color="#FFF" sizeAttenuation transparent opacity={0.8} />
    </points>
  );
}

export default function PlanetGarden() {
  const { tasks, shovels, pickaxes, items, useTool, removedDecorationIds, restoreDecoration, debugRemoveDecoration } = useApp();
  const groupRef = useRef<THREE.Group>(null);
  const isDragging = useRef(false);
  const velocity = useRef({ x: 0, y: 0 });
  const lastGesture = useRef({ dx: 0, dy: 0 });
  
  const [selectedDecoration, setSelectedDecoration] = useState<{ id: string, type: string, position: [number, number, number] } | null>(null);
  const [showInventory, setShowInventory] = useState(false);

  // ... (existing code)

  const handleRemove = () => {
      if (!selectedDecoration) return;

      const { id, type } = selectedDecoration;
      
      // DEBUG: Force remove without tools
      const debugMode = true;

      if (debugMode) {
          playSE(type);
          setSelectedDecoration(null);
          debugRemoveDecoration(id);
          return;
      }
      
      let toolType: 'shovel' | 'pickaxe' = 'shovel';
      if (type === 'rock' || type === 'crystal') {
          toolType = 'pickaxe';
      }

      const result = useTool(toolType, id, type);
      
      if (result.success) {
          playSE(type); // Play Sound Effect
          setSelectedDecoration(null);
          if (result.droppedItem) {
              const itemName = result.droppedItem === 'rusty_watch' ? '錆びた時計' : '壊れた機械';
              Alert.alert('アイテム獲得！', `「${itemName}」を手に入れました！`);
          }
      } else {
          if (toolType === 'pickaxe') {
              Alert.alert('ピッケルが足りません', '大きなタスクを完了するか、運が良いと手に入ります。');
          } else {
              Alert.alert('シャベルが足りません', 'タスクを完了してシャベルを手に入れましょう（1日3回まで）。');
          }
      }
  };

  // デコレーションの自動生成（復活）ロジック
  // 雑草(70%) > 岩(25%) > クリスタル(5%)
  useEffect(() => {
    const interval = setInterval(() => {
      // 削除済みのアイテムを取得
      const removedItems = decorations.filter(d => removedDecorationIds.includes(d.id));
      
      if (removedItems.length === 0) return;

      // 確率に基づいて復活させるタイプを決定
      const rand = Math.random();
      let targetType = 'weed';
      if (rand > 0.95) {
          targetType = 'crystal'; // 5%
      } else if (rand > 0.7) {
          targetType = 'rock'; // 25%
      } else {
          targetType = 'weed'; // 70%
      }

      // ターゲットタイプの削除済みアイテム候補
      const candidates = removedItems.filter(d => d.type === targetType);

      if (candidates.length > 0) {
        // ランダムに1つ選んで復活
        const toRestore = candidates[Math.floor(Math.random() * candidates.length)];
        restoreDecoration(toRestore.id);
      }
    }, 28800000); // 8時間ごとに判定

    return () => clearInterval(interval);
  }, [removedDecorationIds, restoreDecoration]);

  const completedTasks = useMemo(() => {
    return tasks
      .filter(t => t.completed)
      .slice(-50);
  }, [tasks]);

  // Slot allocation for non-overlapping placement
  const { decorationSlots, taskSlots } = useMemo(() => {
    const total = 150;
    const decCount = 40; 
    const allSlots = Array.from({ length: total }, (_, i) => i);
    
    // Seeded shuffle
    let seed = 999;
    const random = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    for (let i = allSlots.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [allSlots[i], allSlots[j]] = [allSlots[j], allSlots[i]];
    }

    return {
        decorationSlots: allSlots.slice(0, decCount),
        taskSlots: allSlots.slice(decCount)
    };
  }, []);

  const decorations = useMemo(() => {
    return decorationSlots.map((slotIndex) => {
        const { position, rotation } = getFibonacciPosition(slotIndex, 150);
        
        // Determine type based on slotIndex (pseudo-random)
        const typeRand = (slotIndex * 123.45) % 1; 
        let type = 'weed';
        if (typeRand > 0.9) type = 'crystal';
        else if (typeRand > 0.6) type = 'rock';
        
        return {
            id: `dec-${slotIndex}`,
            position,
            rotation,
            type
        };
    });
  }, [decorationSlots]);

  const objects = useMemo(() => {
    return completedTasks.map((task, i) => {
      const slotIndex = taskSlots[i % taskSlots.length];
      return {
        id: task.id,
        ...getFibonacciPosition(slotIndex, 150),
        type: task.type
      };
    });
  }, [completedTasks, taskSlots]);

  // 削除されたものを除外
  const visibleDecorations = useMemo(() => {
      return decorations.filter(d => !removedDecorationIds.includes(d.id));
  }, [decorations, removedDecorationIds]);

  // Sound Effects
  const [soundEffect, setSoundEffect] = useState<Audio.Sound | null>(null);

  useEffect(() => {
      async function loadSound() {
          try {
              // Pre-load the single reliable sound file
              const { sound } = await Audio.Sound.createAsync(
                  { uri: 'https://actions.google.com/sounds/v1/impacts/crash.ogg' }
              );
              setSoundEffect(sound);
          } catch (e) {
              console.log('Error loading SE', e);
          }
      }
      loadSound();

      return () => {
          soundEffect?.unloadAsync();
      };
  }, []);

  const playSE = async (type: string) => {
      if (!soundEffect) return;

      let rate = 1.0;
      let volume = 1.0;

      // Adjust pitch/rate to simulate different materials
      // This is a fallback strategy to ensure reliable playback
      if (type === 'weed') {
          rate = 0.5; // Lower pitch for digging
          volume = 0.8;
      } else if (type === 'rock') {
          rate = 1.0; // Normal pitch
          volume = 1.0;
      } else if (type === 'crystal') {
          rate = 2.0; // Higher pitch for glass
          volume = 0.6;
      }

      try {
          // Reset and play immediately with new settings
          await soundEffect.stopAsync();
          await soundEffect.setRateAsync(rate, true);
          await soundEffect.setVolumeAsync(volume);
          await soundEffect.replayAsync();
      } catch (e) {
          console.log('Error playing SE', e);
      }
  };

  const handleDecorationClick = (id: string, type: string, position: [number, number, number]) => {
      setSelectedDecoration({ id, type, position });
  };



  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      isDragging.current = true;
      velocity.current = { x: 0, y: 0 };
      lastGesture.current = { dx: 0, dy: 0 };
    },
    onPanResponderMove: (_, gestureState) => {
      if (groupRef.current) {
        const deltaX = gestureState.dx - lastGesture.current.dx;
        const deltaY = gestureState.dy - lastGesture.current.dy;
        
        groupRef.current.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), deltaX * 0.005);
        groupRef.current.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), deltaY * 0.005);

        lastGesture.current = { dx: gestureState.dx, dy: gestureState.dy };
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      isDragging.current = false;
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
      <BGMPlayer />
      <View style={styles.header}>
        <Text style={styles.title}>Your Planet</Text>
        <Text style={styles.subtitle}>{completedTasks.length} objects built</Text>
        <View style={styles.statsContainer}>
            <View style={styles.toolContainer}>
                <Text style={styles.toolText}>Shovels: {shovels}</Text>
                <Text style={styles.toolText}>Pickaxes: {pickaxes}</Text>
            </View>
            <TouchableOpacity onPress={() => setShowInventory(true)} style={styles.inventoryButton}>
                <Ionicons name="briefcase" size={20} color="#FFF" />
            </TouchableOpacity>
        </View>
      </View>
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 2]}>
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <pointLight position={[-10, -10, -5]} intensity={0.3} color="#FFF" />
        
        <StarField />
        
        <group ref={groupRef}>
          <mesh>
            <icosahedronGeometry args={[2, 3]} />
            <meshStandardMaterial color="#4ADE80" flatShading roughness={0.8} />
          </mesh>

          {visibleDecorations.map((item) => {
              if (item.type === 'crystal') {
                  return <CrystalCluster key={item.id} position={item.position} rotation={item.rotation} onClick={() => handleDecorationClick(item.id, 'crystal', item.position)} />;
              } else if (item.type === 'rock') {
                  return <Rock key={item.id} position={item.position} rotation={item.rotation} onClick={() => handleDecorationClick(item.id, 'rock', item.position)} />;
              } else if (item.type === 'weed') {
                  return <Weed key={item.id} position={item.position} rotation={item.rotation} onClick={() => handleDecorationClick(item.id, 'weed', item.position)} />;
              }
              return null;
          })}

          {selectedDecoration && (
              <SelectionMarker position={selectedDecoration.position} />
          )}

          {objects.map(obj => (
            <PlanetObject 
              key={obj.id} 
              id={obj.id}
              position={obj.position} 
              rotation={obj.rotation} 
              type={obj.type} 
            />
          ))}
        </group>

        <AutoRotator groupRef={groupRef} isDragging={isDragging} velocity={velocity} />
      </Canvas>

      {selectedDecoration && (
          <View style={styles.selectionFooter}>
              <Text style={styles.selectionText}>
                  {selectedDecoration.type === 'crystal' ? 'クリスタル' : selectedDecoration.type === 'rock' ? '岩' : '雑草'}
              </Text>
              <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
                  <Text style={styles.removeButtonText}>
                      削除 ({selectedDecoration.type === 'weed' ? 'シャベル' : 'ピッケル'})
                  </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setSelectedDecoration(null)}>
                  <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
          </View>
      )}

      <Modal visible={showInventory} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>持ち物</Text>
                  <ScrollView style={styles.inventoryList}>
                      {Object.keys(items).length === 0 ? (
                          <Text style={styles.emptyText}>アイテムを持っていません</Text>
                      ) : (
                          Object.entries(items).map(([key, count]) => (
                              <View key={key} style={styles.inventoryItem}>
                                  <Text style={styles.itemIcon}>
                                      {key === 'rusty_watch' ? '🕰️' : key === 'broken_machine' ? '📱' : '❓'}
                                  </Text>
                                  <View style={styles.itemInfo}>
                                      <Text style={styles.itemName}>
                                          {key === 'rusty_watch' ? '錆びた時計' : key === 'broken_machine' ? '壊れた機械' : key}
                                      </Text>
                                      <Text style={styles.itemCount}>x{count}</Text>
                                  </View>
                              </View>
                          ))
                      )}
                  </ScrollView>
                  <TouchableOpacity style={styles.closeButton} onPress={() => setShowInventory(false)}>
                      <Text style={styles.closeButtonText}>閉じる</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  bgmButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  header: {
      position: 'absolute',
      top: 50,
      left: 20,
      right: 20,
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
  },
  statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
  },
  toolContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      flexDirection: 'row',
      gap: 10,
  },
  toolText: {
      color: '#FDE047', // Yellow
      fontWeight: 'bold',
  },
  inventoryButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      padding: 8,
      borderRadius: 20,
  },
  selectionFooter: {
      position: 'absolute',
      bottom: 30,
      left: 20,
      right: 20,
      backgroundColor: 'rgba(30, 41, 59, 0.9)',
      padding: 16,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: '#475569',
  },
  selectionText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: 'bold',
  },
  removeButton: {
      backgroundColor: '#EF4444',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      marginRight: 8,
  },
  removeButtonText: {
      color: '#FFF',
      fontWeight: 'bold',
  },
  cancelButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
  },
  cancelButtonText: {
      color: '#94A3B8',
  },
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  modalContent: {
      width: '80%',
      backgroundColor: '#1E293B',
      borderRadius: 16,
      padding: 20,
      maxHeight: '60%',
  },
  modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#FFF',
      marginBottom: 16,
      textAlign: 'center',
  },
  inventoryList: {
      marginBottom: 16,
  },
  emptyText: {
      color: '#94A3B8',
      textAlign: 'center',
      marginTop: 20,
  },
  inventoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
  },
  itemIcon: {
      fontSize: 24,
      marginRight: 12,
  },
  itemInfo: {
      flex: 1,
  },
  itemName: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: 'bold',
  },
  itemCount: {
      color: '#94A3B8',
      fontSize: 14,
  },
  closeButton: {
      backgroundColor: '#3B82F6',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
  },
  closeButtonText: {
      color: '#FFF',
      fontWeight: 'bold',
  }
});
