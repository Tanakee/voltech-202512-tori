import { Colors } from '@/constants/theme';
import { Task } from '@/context/AppContext';
import * as Haptics from 'expo-haptics';
import { Check, Pause, Play, Trash2 } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated as RNAnimated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleTimer: (id: string) => void;
  mode: 'work' | 'private';
  isAnyTaskRunning: boolean;
}

export default function TaskItem({ task, onToggle, onDelete, onToggleTimer, mode, isAnyTaskRunning }: TaskItemProps) {
  const theme = mode === 'work' ? Colors.work : Colors.private;
  const [displayTime, setDisplayTime] = useState(task.elapsedTime);
  const swipeableRef = useRef<Swipeable>(null);

  useEffect(() => {
    setDisplayTime(task.elapsedTime);
  }, [task.elapsedTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (task.isRunning) {
      interval = setInterval(() => {
        const now = Date.now();
        const currentElapsed = task.elapsedTime + (task.startTime ? (now - task.startTime) / 1000 : 0);
        setDisplayTime(currentElapsed);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [task.isRunning, task.startTime, task.elapsedTime]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const isFocusMode = isAnyTaskRunning && !task.isRunning;

  const renderRightActions = (progress: RNAnimated.AnimatedInterpolation<number>, dragX: RNAnimated.AnimatedInterpolation<number>) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.rightActionContainer}>
        <RNAnimated.View style={[styles.rightAction, { transform: [{ translateX: trans }] }]}>
           <TouchableOpacity 
             style={styles.deleteActionBtn} 
             onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onDelete(task.id);
             }}
           >
             <Trash2 color="#FFF" size={24} />
             <Text style={styles.actionText}>削除</Text>
           </TouchableOpacity>
        </RNAnimated.View>
      </View>
    );
  };

  const onSwipeableOpen = () => {
      // Optional: Auto-complete on swipe could be implemented here instead of delete
      // For now, let's keep delete as the swipe action based on "Swipe to delete/explode"
  };

  const getSizeColor = (size: string) => {
      switch(size) {
          case 'S': return '#4ADE80'; // Green
          case 'M': return '#FACC15'; // Yellow
          case 'L': return '#F87171'; // Red
          default: return '#CCC';
      }
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      onSwipeableOpen={onSwipeableOpen}
      containerStyle={styles.swipeableContainer}
    >
        <View style={[
        styles.container, 
        { borderLeftColor: theme.primary },
        isFocusMode && styles.dimmed
        ]}>
        <TouchableOpacity 
            style={[styles.checkCircle, task.completed && { backgroundColor: theme.primary, borderColor: theme.primary }]} 
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onToggle(task.id);
            }}
        >
            {task.completed && <Check color="#FFF" size={16} />}
        </TouchableOpacity>
        
        <View style={styles.contentContainer}>
            <View style={styles.titleRow}>
                <View style={[styles.sizeBadge, { backgroundColor: getSizeColor(task.size) }]}>
                    <Text style={styles.sizeText}>{task.size}</Text>
                </View>
                <Text style={[styles.title, task.completed && styles.completedText]} numberOfLines={1}>
                    {task.title}
                </Text>
            </View>
            {task.elapsedTime > 0 || task.isRunning ? (
            <Text style={[styles.timerText, { color: theme.text }]}>
                {task.isRunning ? 'Running: ' : 'Total: '}{formatTime(displayTime)}
            </Text>
            ) : null}
        </View>

        <TouchableOpacity onPress={() => onToggleTimer(task.id)} style={styles.actionBtn}>
            {task.isRunning ? (
            <Pause color={theme.primary} size={20} fill={theme.primary} />
            ) : (
            <Play color={theme.primary} size={20} />
            )}
        </TouchableOpacity>
        </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  swipeableContainer: {
      marginBottom: 12,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: 'transparent', // Important for shadow
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderLeftWidth: 4,
    height: 80, // Fixed height for smoother swipe
  },
  dimmed: {
    opacity: 0.4,
    backgroundColor: '#F5F5F5',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  sizeBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      marginRight: 8,
  },
  sizeText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#FFF',
  },
  title: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  timerText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#AAA',
  },
  actionBtn: {
    padding: 8,
    marginLeft: 4,
  },
  rightActionContainer: {
      width: 100,
      backgroundColor: '#EF4444',
      justifyContent: 'center',
      alignItems: 'flex-end',
  },
  rightAction: {
      width: 100,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
  },
  deleteActionBtn: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
  },
  actionText: {
      color: '#FFF',
      fontSize: 12,
      fontWeight: 'bold',
      marginTop: 4,
  }
});
