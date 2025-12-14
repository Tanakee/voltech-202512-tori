import { useApp } from '@/context/AppContext';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    cancelAnimation,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function Mascot() {
  const { tasks } = useApp();
  const runningTask = tasks.find(t => t.isRunning);
  
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Reset animations and values
    cancelAnimation(translateY);
    cancelAnimation(translateX);
    cancelAnimation(rotate);
    cancelAnimation(scale);

    translateY.value = 0;
    translateX.value = 0;
    rotate.value = 0;
    scale.value = 1;

    if (!runningTask) {
      // Idle animation: slight breathing
      scale.value = withRepeat(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      return;
    }

    // Active animation based on task size
    switch (runningTask.size) {
      case 'S':
        // Fast flying
        translateY.value = withRepeat(
          withSequence(
            withTiming(-10, { duration: 300 }),
            withTiming(0, { duration: 300 })
          ),
          -1,
          true
        );
        translateX.value = withRepeat(
            withSequence(
                withTiming(-15, { duration: 400 }),
                withTiming(15, { duration: 400 })
            ),
            -1,
            true
        );
        break;

      case 'M':
        // Steady flying
        translateY.value = withRepeat(
          withSequence(
            withTiming(-5, { duration: 1000 }),
            withTiming(0, { duration: 1000 })
          ),
          -1,
          true
        );
        translateX.value = withRepeat(
            withSequence(
                withTiming(-5, { duration: 2000 }),
                withTiming(5, { duration: 2000 })
            ),
            -1,
            true
        );
        break;

      case 'L':
        // Heavy lifting (vertical only)
        translateY.value = withRepeat(
            withSequence(
              withTiming(5, { duration: 1500 }),
              withTiming(0, { duration: 1000 })
            ),
            -1,
            true
          );
        scale.value = withRepeat(
            withSequence(
                withTiming(0.95, { duration: 1500 }),
                withTiming(1.0, { duration: 1000 })
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
        { translateX: translateX.value },
        { rotate: `${rotate.value}deg` },
        { scale: scale.value }
      ],
    };
  });

  const getMascotEmoji = () => {
    if (!runningTask) return '⛄'; // Idle snowman
    
    switch (runningTask.size) {
      case 'S': return '⛄'; // Fast snowman
      case 'M': return '⛄'; // Steady snowman
      case 'L': return '⛄'; // Heavy snowman
    }
    return '⛄';
  };

  const getStatusText = () => {
      if (!runningTask) return 'Zzz...';
      switch (runningTask.size) {
          case 'S': return 'ビューン！';
          case 'M': return '順調です';
          case 'L': return '重い...';
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
    top: 60, // Move to top
    right: 20,
    alignItems: 'center',
    zIndex: 10,
    pointerEvents: 'none',
  },
  mascot: {
    fontSize: 50,
  },
  bubble: {
      position: 'absolute',
      top: -35,
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
