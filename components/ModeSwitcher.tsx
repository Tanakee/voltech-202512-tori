import { Colors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { Briefcase, Home } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

export default function ModeSwitcher() {
  const { mode, setMode } = useApp();
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  const theme = mode === 'work' ? Colors.work : Colors.private;

  const handleToggle = () => {
    const newMode = mode === 'work' ? 'private' : 'work';
    setMode(newMode);
  };

  useEffect(() => {
    // Animation trigger on mode change
    scale.value = withSequence(
      withTiming(1.1, { duration: 100 }),
      withSpring(1, { damping: 12 })
    );
  }, [mode]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <View style={[styles.container]}>
      <TouchableOpacity onPress={handleToggle} activeOpacity={0.9}>
        <Animated.View style={[styles.card, { backgroundColor: theme.primary }, animatedStyle]}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              {mode === 'work' ? (
                <Briefcase color="#FFF" size={28} />
              ) : (
                <Home color="#FFF" size={28} />
              )}
            </View>
            <View>
              <Text style={styles.modeText}>
                {mode === 'work' ? 'WORK MODE' : 'PRIVATE MODE'}
              </Text>
              <Text style={styles.subText}>
                {mode === 'work' ? '集中して業務に取り組みましょう' : 'リラックスして自分時間を大切に'}
              </Text>
            </View>
          </View>
          
          <View style={styles.punchHole} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    width: '100%',
  },
  card: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  modeText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  subText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 2,
  },
  punchHole: {
    position: 'absolute',
    top: -10,
    right: 30,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F2F2F2', // Match background usually, but here hardcoded for now
  }
});
