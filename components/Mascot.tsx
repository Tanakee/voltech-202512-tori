import { useApp } from '@/context/AppContext';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    cancelAnimation,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

export default function Mascot() {
  const { tasks } = useApp();
  const runningTask = tasks.find(t => t.isRunning);
  
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Reset animations
    cancelAnimation(translateY);
    cancelAnimation(rotate);
    cancelAnimation(scale);

    if (!runningTask) {
      // Idle animation: slight breathing
      scale.value = withRepeat(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      translateY.value = 0;
      rotate.value = 0;
      return;
    }

    // Active animation based on task size
    switch (runningTask.size) {
      case 'S':
        // Fast, light bouncing
        translateY.value = withRepeat(
          withSequence(
            withTiming(-10, { duration: 150, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 150, easing: Easing.in(Easing.quad) })
          ),
          -1,
          false
        );
        rotate.value = withRepeat(
            withSequence(
                withTiming(-5, { duration: 150 }),
                withTiming(5, { duration: 150 })
            ),
            -1,
            true
        );
        scale.value = 1;
        break;

      case 'M':
        // Normal steady work
        translateY.value = withRepeat(
          withSequence(
            withTiming(-5, { duration: 500, easing: Easing.inOut(Easing.ease) }),
            withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        rotate.value = 0;
        scale.value = 1;
        break;

      case 'L':
        // Heavy, slow lifting
        translateY.value = withRepeat(
          withSequence(
            withTiming(5, { duration: 1000, easing: Easing.out(Easing.cubic) }), // Squat down
            withTiming(0, { duration: 800, easing: Easing.in(Easing.cubic) })   // Stand up
          ),
          -1,
          true
        );
        scale.value = withRepeat(
            withSequence(
                withTiming(0.95, { duration: 1000 }), // Compress
                withTiming(1.0, { duration: 800 })
            ),
            -1,
            true
        );
        break;
    }
  }, [runningTask?.id, runningTask?.size]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
        { scale: scale.value }
      ],
    };
  });

  const getMascotEmoji = () => {
    if (!runningTask) return '🐦'; // Idle bird
    
    switch (runningTask.size) {
      case 'S': return '🐥'; // Chick for small tasks (fast)
      case 'M': return '🦅'; // Eagle for medium (steady)
      case 'L': return '🦉'; // Owl for large (heavy/wise) or maybe something sweating
    }
    return '🐦';
  };

  const getStatusText = () => {
      if (!runningTask) return 'Zzz...';
      switch (runningTask.size) {
          case 'S': return 'サクサク♪';
          case 'M': return 'フムフム...';
          case 'L': return 'ヨイショ...';
      }
  };

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.mascot, animatedStyle]}>
        {getMascotEmoji()}
      </Animated.Text>
      <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{getStatusText()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90, // Above the input area
    right: 20,
    alignItems: 'center',
    zIndex: 10,
    pointerEvents: 'none', // Let touches pass through if needed, or remove if interactive
  },
  mascot: {
    fontSize: 50,
  },
  bubble: {
      position: 'absolute',
      top: -30,
      right: 40,
      backgroundColor: '#FFF',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      borderBottomRightRadius: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 3,
  },
  bubbleText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#333',
  }
});
