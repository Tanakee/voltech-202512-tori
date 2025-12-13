import { Colors } from '@/constants/theme';
import { Task } from '@/context/AppContext';
import { Check, Pause, Play, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

  return (
    <View style={[
      styles.container, 
      { borderLeftColor: theme.primary },
      isFocusMode && styles.dimmed
    ]}>
      <TouchableOpacity 
        style={[styles.checkCircle, task.completed && { backgroundColor: theme.primary, borderColor: theme.primary }]} 
        onPress={() => onToggle(task.id)}
      >
        {task.completed && <Check color="#FFF" size={16} />}
      </TouchableOpacity>
      
      <View style={styles.contentContainer}>
        <Text style={[styles.title, task.completed && styles.completedText]}>
          {task.title}
        </Text>
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

      <TouchableOpacity onPress={() => onDelete(task.id)} style={styles.actionBtn}>
        <Trash2 color="#CCC" size={20} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  },
  title: {
    fontSize: 16,
    color: '#333',
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
  }
});
