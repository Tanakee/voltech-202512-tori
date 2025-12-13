import TaskItem from '@/components/TaskItem';
import { Colors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Trash2 } from 'lucide-react-native';
import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CompletedTasksScreen() {
  const { mode, tasks, toggleTask, deleteTask, toggleTaskTimer, deleteCompletedTasks } = useApp();
  const theme = mode === 'work' ? Colors.work : Colors.private;
  const router = useRouter();

  // Filter only completed tasks
  const completedTasks = tasks.filter(t => t.completed).sort((a, b) => {
      // Sort by completion time or creation time if available, otherwise just keep order
      return 0; 
  });

  const isAnyTaskRunning = tasks.some(t => t.isRunning);

  const handleDeleteAll = () => {
    if (completedTasks.length === 0) return;

    Alert.alert(
        "完了タスクの削除",
        "完了したタスクをすべて削除しますか？",
        [
            { text: "キャンセル", style: "cancel" },
            { 
                text: "削除", 
                style: "destructive", 
                onPress: () => {
                    deleteCompletedTasks();
                }
            }
        ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ 
          title: '完了したタスク', 
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTitleStyle: { color: theme.text, fontWeight: 'bold' },
          headerLeft: () => (
            <TouchableOpacity 
                onPress={() => router.back()} 
                style={{ flexDirection: 'row', alignItems: 'center', marginLeft: -8 }}
            >
                <ChevronLeft color={theme.text} size={24} />
                <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600' }}>戻る</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
                onPress={handleDeleteAll} 
                disabled={completedTasks.length === 0}
                style={{ flexDirection: 'row', alignItems: 'center', opacity: completedTasks.length === 0 ? 0.3 : 1 }}
            >
              <Trash2 color="#EF4444" size={20} />
              <Text style={{ color: '#EF4444', fontWeight: 'bold', marginLeft: 4 }}>全削除</Text>
            </TouchableOpacity>
          )
      }} />
      
      <View style={styles.listContainer}>
        <FlatList
          data={completedTasks}
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
          ListEmptyComponent={
              <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>完了したタスクはありません</Text>
              </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 50,
  },
  emptyText: {
      color: '#999',
      fontSize: 16,
  }
});
