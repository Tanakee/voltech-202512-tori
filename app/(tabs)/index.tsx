import ModeSwitcher from '@/components/ModeSwitcher';
import TaskItem from '@/components/TaskItem';
import { Colors } from '@/constants/theme';
import { TaskSize, useApp } from '@/context/AppContext';
import { useRouter } from 'expo-router';
import { Battery, BatteryCharging, ChevronDown, ClipboardList, Plus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, Keyboard, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const { mode, tasks, addTask, toggleTask, deleteTask, toggleTaskTimer, isLowEnergyMode, setLowEnergyMode } = useApp();
  const [newTask, setNewTask] = useState('');
  const [selectedSize, setSelectedSize] = useState<TaskSize>('M');
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
  
  // Filter logic: Mode filter AND Low Energy filter AND Not Completed
  const filteredTasks = tasks.filter(t => {
      const modeMatch = t.type === mode;
      const energyMatch = isLowEnergyMode ? t.size === 'S' : true;
      return modeMatch && energyMatch && !t.completed;
  }).sort((a, b) => {
      // Sort logic (can be simplified since all are not completed)
      return 0;
  });
  
  const isAnyTaskRunning = tasks.some(t => t.isRunning);

  const handleAddTask = () => {
    if (newTask.trim()) {
      addTask(newTask.trim(), selectedSize);
      setNewTask('');
      setSelectedSize('M'); // Reset to default
    }
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
              
              <View style={styles.filterContainer}>
                  <TouchableOpacity 
                    style={styles.historyBtn} 
                    onPress={() => router.push('/completed')}
                  >
                      <ClipboardList color={theme.text} size={20} />
                      <Text style={[styles.historyBtnText, { color: theme.text }]}>チェック済み</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.energyBtn, isLowEnergyMode && styles.energyBtnActive]} 
                    onPress={() => setLowEnergyMode(!isLowEnergyMode)}
                  >
                      {isLowEnergyMode ? (
                          <Battery color="#FFF" size={20} />
                      ) : (
                          <BatteryCharging color={theme.text} size={20} />
                      )}
                      <Text style={[styles.energyBtnText, isLowEnergyMode && { color: '#FFF' }]}>
                          {isLowEnergyMode ? 'やる気でないモード中...' : 'やる気でない...'}
                      </Text>
                  </TouchableOpacity>


              </View>
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



          <View style={styles.inputWrapper}>
            {/* Size Selector */}
            {isKeyboardVisible && (
              <View style={styles.sizeSelector}>
                  {(['S', 'M', 'L'] as TaskSize[]).map((size) => (
                      <TouchableOpacity 
                          key={size} 
                          style={[
                              styles.sizeOption, 
                              selectedSize === size && { backgroundColor: getSizeColor(size), borderColor: getSizeColor(size) }
                          ]}
                          onPress={() => setSelectedSize(size)}
                      >
                          <Text style={[styles.sizeOptionText, selectedSize === size && { color: '#FFF' }]}>{size}</Text>
                      </TouchableOpacity>
                  ))}
              </View>
            )}

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
  inputWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  sizeSelector: {
      flexDirection: 'row',
      marginBottom: 10,
      justifyContent: 'flex-start',
  },
  sizeOption: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: '#DDD',
      backgroundColor: '#FFF',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
  },
  sizeOptionText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#666',
  },
  inputContainer: {
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
  filterContainer: {
      paddingHorizontal: 20,
      marginBottom: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  historyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
  },
  historyBtnText: {
      marginLeft: 6,
      fontSize: 12,
      fontWeight: '600',
  },
  energyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#DDD',
  },
  energyBtnActive: {
      backgroundColor: '#60A5FA', // Light blue or specific color for low energy
      borderColor: '#60A5FA',
  },
  energyBtnText: {
      marginLeft: 6,
      fontSize: 12,
      fontWeight: '600',
      color: '#666',
  }
});
