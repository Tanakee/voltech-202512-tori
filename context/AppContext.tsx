import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { db } from '../config/firebase';
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export type Mode = 'work' | 'private';
export type TaskSize = 'S' | 'M' | 'L';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  type: Mode;
  elapsedTime: number; // in seconds
  isRunning: boolean;
  startTime?: number;
  size: TaskSize;
  subTasks?: SubTask[];
}

interface AppContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
  tasks: Task[];
  updateTask: (id: string, updates: Partial<Task>) => void;
  addTask: (title: string, size: TaskSize) => void;
  addSubTask: (taskId: string, title: string) => void;
  toggleSubTask: (taskId: string, subTaskId: string) => void;
  deleteSubTask: (taskId: string, subTaskId: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  toggleTaskTimer: (id: string) => void;
  workLocation: Location.LocationObject | null;
  setWorkLocation: (loc: Location.LocationObject) => void;
  homeLocation: Location.LocationObject | null;
  setHomeLocation: (loc: Location.LocationObject) => void;
  checkLocation: () => Promise<void>;
  registerLocation: (type: 'home' | 'work') => Promise<void>;
  isLowEnergyMode: boolean;
  setLowEnergyMode: (enabled: boolean) => void;
  shovels: number;
  pickaxes: number;
  items: Record<string, number>;
  useTool: (tool: 'shovel' | 'pickaxe', decorationId: string, targetType?: string) => { success: boolean; droppedItem: string | null };
  removedDecorationIds: string[];
  restoreDecoration: (id: string) => void;
  debugRemoveDecoration: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const TASKS_STORAGE_KEY = 'voltech_tasks_v1';
const USER_DOC_ID = 'demo-user'; // Hardcoded for data sharing demonstration

// ... (helper functions)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<Mode>('private');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workLocation, setWorkLocation] = useState<Location.LocationObject | null>(null);
  const [homeLocation, setHomeLocation] = useState<Location.LocationObject | null>(null);
  const [isLowEnergyMode, setLowEnergyMode] = useState(false);

  // Garden State
  const [shovels, setShovels] = useState(0);
  const [pickaxes, setPickaxes] = useState(0);
  const [items, setItems] = useState<Record<string, number>>({});
  const [dailyShovelCount, setDailyShovelCount] = useState(0);
  const [lastShovelDate, setLastShovelDate] = useState('');
  const restoreDecoration = (id: string) => {
    const newRemovedIds = removedDecorationIds.filter(dId => dId !== id);
    saveData({ 
        garden: { 
            shovels, pickaxes, items, dailyShovelCount, lastShovelDate, 
            removedDecorationIds: newRemovedIds 
        } 
    });
  };

  // Load tasks, locations, and garden data
  // Sync with Firebase Firestore
  useEffect(() => {
    const docRef = doc(db, 'users', USER_DOC_ID);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Update local state from Firestore data
        setTasks(data.tasks || []);
        setHomeLocation(data.homeLocation || null);
        setWorkLocation(data.workLocation || null);
        setLowEnergyMode(data.isLowEnergyMode || false);
        
        const garden = data.garden || {};
        setShovels(garden.shovels || 0);
        setPickaxes(garden.pickaxes || 0);
        setItems(garden.items || {});
        setDailyShovelCount(garden.dailyShovelCount || 0);
        setLastShovelDate(garden.lastShovelDate || '');
        setRemovedDecorationIds(garden.removedDecorationIds || []);
      } else {
        // Create initial document if it doesn't exist
        setDoc(docRef, {
            tasks: [],
            garden: { shovels: 0, pickaxes: 0, items: {}, dailyShovelCount: 0, removedDecorationIds: [] }
        }, { merge: true });
      }
    }, (error) => {
        console.error("Firestore sync error:", error);
    });

    return () => unsubscribe();
  }, []);

  // Helper to save data to Firestore
  const saveData = async (updates: any) => {
      const docRef = doc(db, 'users', USER_DOC_ID);
      try {
          await setDoc(docRef, updates, { merge: true });
      } catch (e) {
          console.error("Error saving data:", e);
      }
  };

  const addTask = (title: string, size: TaskSize) => {
    const newTask: Task = { 
      id: Date.now().toString(), 
      title, 
      completed: false, 
      type: mode,
      elapsedTime: 0,
      isRunning: false,
      size,
      subTasks: []
    };
    saveData({ tasks: [...tasks, newTask] });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const newTasks = tasks.map(t => t.id === id ? { ...t, ...updates } : t);
    saveData({ tasks: newTasks });
  };

  const toggleTask = (id: string) => {
    let newShovels = shovels;
    let newPickaxes = pickaxes;
    let newDailyCount = dailyShovelCount;
    let newLastDate = lastShovelDate;

    const newTasks = tasks.map(t => {
        if (t.id === id) {
            const isCompleting = !t.completed;
            
            // Tool Grant Logic
            if (isCompleting) {
                const today = new Date().toDateString();
                
                // Reset daily count if date changed
                if (newLastDate !== today) {
                    newDailyCount = 0;
                    newLastDate = today;
                }

                // Grant Shovel (Daily limit 3)
                if (newDailyCount < 3) {
                    newShovels++;
                    newDailyCount++;
                    
                    // Grant Pickaxe (Rare: 5% chance or if task size is 'L')
                    const isLucky = Math.random() < 0.05;
                    const isLarge = t.size === 'L';
                    
                    if (isLarge || isLucky) {
                        newPickaxes++;
                        Alert.alert('報酬獲得！', 'シャベルとピッケルを手に入れました！');
                    } else {
                        Alert.alert('シャベル獲得！', 'タスク完了報酬としてシャベルを手に入れました。');
                    }
                }
            }

            return { ...t, completed: !t.completed };
        }
        return t;
    });

    saveData({
        tasks: newTasks,
        garden: {
            shovels: newShovels,
            pickaxes: newPickaxes,
            items: items,
            dailyShovelCount: newDailyCount,
            lastShovelDate: newLastDate,
            removedDecorationIds: removedDecorationIds
        }
    });
  };

  const useTool = (tool: 'shovel' | 'pickaxe', decorationId: string, targetType?: string) => {
      let success = false;
      let newShovels = shovels;
      let newPickaxes = pickaxes;
      let newRemovedIds = [...removedDecorationIds];
      let droppedItem: string | null = null;
      let newItems = { ...items };

      if (tool === 'shovel') {
          if (newShovels > 0) {
              newShovels--;
              newRemovedIds.push(decorationId);
              success = true;
          }
      } else if (tool === 'pickaxe') {
          if (newPickaxes > 0) {
              newPickaxes--;
              newRemovedIds.push(decorationId);
              success = true;

              // Drop Logic
              if (targetType === 'crystal' || targetType === 'rock') {
                   // Simple random drop chance
                  const dropRand = Math.random();
                  if (dropRand < 0.3) {
                      droppedItem = Math.random() < 0.5 ? 'rusty_watch' : 'broken_machine';
                      newItems[droppedItem] = (newItems[droppedItem] || 0) + 1;
                  }
              }
          }
      }

      if (success) {
          saveData({
              garden: {
                  shovels: newShovels,
                  pickaxes: newPickaxes,
                  items: newItems,
                  dailyShovelCount: dailyShovelCount,
                  lastShovelDate: lastShovelDate,
                  removedDecorationIds: newRemovedIds
              }
          });
      }
      return { success, droppedItem };
  };

  // ... (existing functions: deleteTask, deleteCompletedTasks, etc.)

  const deleteTask = (id: string) => {
    const newTasks = tasks.filter(t => t.id !== id);
    saveData({ tasks: newTasks });
  };

  const deleteCompletedTasks = () => {
      const newTasks = tasks.filter(t => !t.completed);
      saveData({ tasks: newTasks });
  };

  const addSubTask = (taskId: string, title: string) => {
    const newTasks = tasks.map(t => {
      if (t.id === taskId) {
        const newSubTask: SubTask = {
          id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
          title,
          completed: false
        };
        return { ...t, subTasks: [...(t.subTasks || []), newSubTask] };
      }
      return t;
    });
    saveData({ tasks: newTasks });
  };

  const toggleSubTask = (taskId: string, subTaskId: string) => {
  const toggleSubTask = (taskId: string, subTaskId: string) => {
    const newTasks = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subTasks: t.subTasks?.map(st => 
            st.id === subTaskId ? { ...st, completed: !st.completed } : st
          )
        };
      }
      return t;
    });
    saveData({ tasks: newTasks });
  };

  const deleteSubTask = (taskId: string, subTaskId: string) => {
    const newTasks = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subTasks: t.subTasks?.filter(st => st.id !== subTaskId)
        };
      }
      return t;
    });
    saveData({ tasks: newTasks });
  };

  const toggleTaskTimer = (id: string) => {
    setTasks(prevTasks => {
      const targetTask = prevTasks.find(t => t.id === id);
      if (!targetTask) return prevTasks;

      const isStarting = !targetTask.isRunning;
      const now = Date.now();

      return prevTasks.map(t => {
        if (t.id === id) {
          if (isStarting) {
            return { ...t, isRunning: true, startTime: now };
          } else {
            const addedTime = t.startTime ? (now - t.startTime) / 1000 : 0;
            return { ...t, isRunning: false, startTime: undefined, elapsedTime: t.elapsedTime + addedTime };
          }
        } else {
          if (isStarting && t.isRunning) {
             const addedTime = t.startTime ? (now - t.startTime) / 1000 : 0;
             return { ...t, isRunning: false, startTime: undefined, elapsedTime: t.elapsedTime + addedTime };
          }
          return t;
        }
      });
    });
  };

  // ... (location functions)

  const registerLocation = async (type: 'home' | 'work') => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
          Alert.alert('権限エラー', '位置情報の使用を許可してください。');
          return;
      }
      
      try {
        const loc = await Location.getCurrentPositionAsync({});
        if (type === 'home') {
            saveData({ homeLocation: loc });
            Alert.alert('完了', '現在地を「自宅」として登録しました。');
        } else {
            saveData({ workLocation: loc });
            Alert.alert('完了', '現在地を「職場」として登録しました。');
        }
      } catch (e) {
          Alert.alert('エラー', '位置情報の取得に失敗しました。');
      }
  };

  const checkLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let currentLoc = await Location.getCurrentPositionAsync({});
      
      // Check Home
      if (homeLocation) {
          const dist = getDistanceFromLatLonInKm(
              currentLoc.coords.latitude, currentLoc.coords.longitude,
              homeLocation.coords.latitude, homeLocation.coords.longitude
          );
          // If within 100m (0.1km)
          if (dist < 0.1 && mode === 'work') {
              Alert.alert(
                  'おかえりなさい',
                  '自宅付近にいます。プライベートモードに切り替えますか？',
                  [
                      { text: 'いいえ', style: 'cancel' },
                      { text: 'はい', onPress: () => setMode('private') }
                  ]
              );
              return;
          }
      }

      // Check Work
      if (workLocation) {
          const dist = getDistanceFromLatLonInKm(
              currentLoc.coords.latitude, currentLoc.coords.longitude,
              workLocation.coords.latitude, workLocation.coords.longitude
          );
          // If within 100m (0.1km)
          if (dist < 0.1 && mode === 'private') {
              Alert.alert(
                  'お仕事モード',
                  '職場付近にいます。仕事モードに切り替えますか？',
                  [
                      { text: 'いいえ', style: 'cancel' },
                      { text: 'はい', onPress: () => setMode('work') }
                  ]
              );
          }
      }

    } catch (e) {
      console.log('Error checking location', e);
    }
  };

  const clearAllTasks = async () => {
      saveData({ tasks: [] });
  };

  useEffect(() => {
    checkLocation();
  }, [homeLocation, workLocation]);



  const debugRemoveDecoration = (id: string) => {
    const newRemovedIds = [...removedDecorationIds, id];
    saveData({ 
        garden: { 
            shovels, pickaxes, items, dailyShovelCount, lastShovelDate, 
            removedDecorationIds: newRemovedIds 
        } 
    });
  };

  return (
    <AppContext.Provider value={{
      mode, setMode,
      tasks, addTask, updateTask, toggleTask, deleteTask, toggleTaskTimer,
      addSubTask, toggleSubTask, deleteSubTask,
      workLocation, setWorkLocation,
      homeLocation, setHomeLocation,
      checkLocation,
      registerLocation,
      isLowEnergyMode, setLowEnergyMode,
      deleteCompletedTasks,
      clearAllTasks,
      shovels, pickaxes, items, useTool, removedDecorationIds, restoreDecoration, debugRemoveDecoration
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
