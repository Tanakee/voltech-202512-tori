import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import React, { createContext, useContext, useEffect, useState } from 'react';
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
  deleteCompletedTasks: () => void;
  clearAllTasks: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const TASKS_STORAGE_KEY = 'voltech_tasks_v1';
const HOME_LOC_KEY = 'voltech_home_loc_v1';
const WORK_LOC_KEY = 'voltech_work_loc_v1';

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180)
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<Mode>('private');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workLocation, setWorkLocation] = useState<Location.LocationObject | null>(null);
  const [homeLocation, setHomeLocation] = useState<Location.LocationObject | null>(null);
  const [isLowEnergyMode, setLowEnergyMode] = useState(false);

  // Load tasks and locations
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
        if (storedTasks) setTasks(JSON.parse(storedTasks));

        const storedHome = await AsyncStorage.getItem(HOME_LOC_KEY);
        if (storedHome) setHomeLocation(JSON.parse(storedHome));

        const storedWork = await AsyncStorage.getItem(WORK_LOC_KEY);
        if (storedWork) setWorkLocation(JSON.parse(storedWork));
      } catch (e) {
        console.error('Failed to load data', e);
      }
    };
    loadData();
  }, []);

  // Save tasks
  useEffect(() => {
    if (tasks.length > 0) {
        AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks)).catch(e => console.error(e));
    }
  }, [tasks]);

  // Save locations
  useEffect(() => {
      if (homeLocation) AsyncStorage.setItem(HOME_LOC_KEY, JSON.stringify(homeLocation)).catch(e => console.error(e));
      if (workLocation) AsyncStorage.setItem(WORK_LOC_KEY, JSON.stringify(workLocation)).catch(e => console.error(e));
  }, [homeLocation, workLocation]);

  const addTask = (title: string, size: TaskSize) => {
    setTasks(prev => [...prev, { 
      id: Date.now().toString(), 
      title, 
      completed: false, 
      type: mode,
      elapsedTime: 0,
      isRunning: false,
      size,
      subTasks: []
    }]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const deleteCompletedTasks = () => {
      setTasks(prev => prev.filter(t => !t.completed));
  };

  const addSubTask = (taskId: string, title: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const newSubTask: SubTask = {
          id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
          title,
          completed: false
        };
        return { ...t, subTasks: [...(t.subTasks || []), newSubTask] };
      }
      return t;
    }));
  };

  const toggleSubTask = (taskId: string, subTaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subTasks: t.subTasks?.map(st => 
            st.id === subTaskId ? { ...st, completed: !st.completed } : st
          )
        };
      }
      return t;
    }));
  };

  const deleteSubTask = (taskId: string, subTaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subTasks: t.subTasks?.filter(st => st.id !== subTaskId)
        };
      }
      return t;
    }));
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

  const registerLocation = async (type: 'home' | 'work') => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
          Alert.alert('権限エラー', '位置情報の使用を許可してください。');
          return;
      }
      
      try {
        const loc = await Location.getCurrentPositionAsync({});
        if (type === 'home') {
            setHomeLocation(loc);
            Alert.alert('完了', '現在地を「自宅」として登録しました。');
        } else {
            setWorkLocation(loc);
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
      setTasks([]);
      try {
          await AsyncStorage.removeItem(TASKS_STORAGE_KEY);
      } catch (e) {
          console.error('Failed to clear tasks', e);
      }
  };

  useEffect(() => {
    checkLocation();
  }, [homeLocation, workLocation]);

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
      clearAllTasks
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
