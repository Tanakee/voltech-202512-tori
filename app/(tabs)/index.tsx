import BalanceGauge from '@/components/BalanceGauge';
import ModeSwitcher from '@/components/ModeSwitcher';
import TaskItem from '@/components/TaskItem';
import { Colors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { ChevronDown, Plus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { mode, tasks, addTask, toggleTask, deleteTask, toggleTaskTimer } = useApp();
  const [newTask, setNewTask] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const theme = mode === 'work' ? Colors.work : Colors.private;
  const filteredTasks = tasks.filter(t => t.type === mode);
  const isAnyTaskRunning = tasks.some(t => t.isRunning);

  const handleAddTask = () => {
    if (newTask.trim()) {
      addTask(newTask.trim());
      setNewTask('');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.content}>
          {!isKeyboardVisible ? (
            <>
              <ModeSwitcher />
              <BalanceGauge />
            </>
          ) : (
            <View style={styles.keyboardHeader}>
              <TouchableOpacity onPress={() => Keyboard.dismiss()} style={styles.closeBtn}>
                <ChevronDown color={theme.text} size={24} />
                <Text style={[styles.closeText, { color: theme.text }]}>ホームに戻る</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.listContainer}>
            <FlatList
              data={filteredTasks}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TaskItem 
                  task={item} 
                  onToggle={toggleTask} 
                  onDelete={deleteTask} 
                  onToggleTimer={toggleTaskTimer}
                  mode={mode}
                  isAnyTaskRunning={isAnyTaskRunning}
                />
              )}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="新しいタスクを追加..."
              placeholderTextColor="#999"
              value={newTask}
              onChangeText={setNewTask}
              onSubmitEditing={handleAddTask}
            />
            <TouchableOpacity 
              style={[styles.addBtn, { backgroundColor: theme.primary }]} 
              onPress={handleAddTask}
            >
              <Plus color="#FFF" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 100,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  keyboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  closeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  closeText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '600',
  },
});
