import { Colors } from '@/constants/theme';
import { Task } from '@/context/AppContext';
import { Check, Trash2 } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  mode: 'work' | 'private';
}

export default function TaskItem({ task, onToggle, onDelete, mode }: TaskItemProps) {
  const theme = mode === 'work' ? Colors.work : Colors.private;

  return (
    <View style={[styles.container, { borderLeftColor: theme.primary }]}>
      <TouchableOpacity 
        style={[styles.checkCircle, task.completed && { backgroundColor: theme.primary, borderColor: theme.primary }]} 
        onPress={() => onToggle(task.id)}
      >
        {task.completed && <Check color="#FFF" size={16} />}
      </TouchableOpacity>
      
      <Text style={[styles.title, task.completed && styles.completedText]}>
        {task.title}
      </Text>

      <TouchableOpacity onPress={() => onDelete(task.id)} style={styles.deleteBtn}>
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
  title: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#AAA',
  },
  deleteBtn: {
    padding: 8,
  }
});
