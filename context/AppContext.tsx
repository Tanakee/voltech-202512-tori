import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type Mode = 'work' | 'private';
export type TaskSize = 'S' | 'M' | 'L';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  type: Mode;
  elapsedTime: number; // in seconds
  isRunning: boolean;
  startTime?: number;
  size: TaskSize;
}

interface AppContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
  tasks: Task[];
  addTask: (title: string, size: TaskSize) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  toggleTaskTimer: (id: string) => void;
  workLocation: Location.LocationObject | null;
  setWorkLocation: (loc: Location.LocationObject) => void;
  homeLocation: Location.LocationObject | null;
  setHomeLocation: (loc: Location.LocationObject) => void;
  checkLocation: () => Promise<void>;
  isLowEnergyMode: boolean;
  setLowEnergyMode: (enabled: boolean) => void;
  clearAllTasks: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const TASKS_STORAGE_KEY = 'voltech_tasks_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<Mode>('private');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workLocation, setWorkLocation] = useState<Location.LocationObject | null>(null);
  const [homeLocation, setHomeLocation] = useState<Location.LocationObject | null>(null);
  const [isLowEnergyMode, setLowEnergyMode] = useState(false);

  // Load tasks from storage
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        }
      } catch (e) {
        console.error('Failed to load tasks', e);
      }
    };
    loadTasks();
  }, []);

  // Save tasks to storage whenever they change
  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
      } catch (e) {
        console.error('Failed to save tasks', e);
      }
    };
    // Debounce saving slightly or just save on every change (fine for small data)
    if (tasks.length > 0) {
        saveTasks();
    }
  }, [tasks]);

  const addTask = (title: string, size: TaskSize) => {
    setTasks(prev => [...prev, { 
      id: Date.now().toString(), 
      title, 
      completed: false, 
      type: mode,
      elapsedTime: 0,
      isRunning: false,
      size
    }]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTaskTimer = (id: string) => {
    setTasks(prevTasks => {
      // If starting a task, stop all other tasks first (optional, but good for focus)
      // For now, let's allow only one task running at a time for "Focus Mode" simplicity
      const targetTask = prevTasks.find(t => t.id === id);
      if (!targetTask) return prevTasks;

      const isStarting = !targetTask.isRunning;
      const now = Date.now();

      return prevTasks.map(t => {
        if (t.id === id) {
          if (isStarting) {
            return { ...t, isRunning: true, startTime: now };
          } else {
            // Stopping
            const addedTime = t.startTime ? (now - t.startTime) / 1000 : 0;
            return { ...t, isRunning: false, startTime: undefined, elapsedTime: t.elapsedTime + addedTime };
          }
        } else {
          // If we want to stop others when one starts:
          if (isStarting && t.isRunning) {
             const addedTime = t.startTime ? (now - t.startTime) / 1000 : 0;
             return { ...t, isRunning: false, startTime: undefined, elapsedTime: t.elapsedTime + addedTime };
          }
          return t;
        }
      });
    });
  };

  const checkLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      // Here we would implement distance checking against workLocation and homeLocation
      // For now, we'll just log it.
      console.log('Current location:', location);
    } catch (e) {
      console.log('Error getting location', e);
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
  }, []);

  return (
    <AppContext.Provider value={{
      mode, setMode,
      tasks, addTask, toggleTask, deleteTask, toggleTaskTimer,
      workLocation, setWorkLocation,
      homeLocation, setHomeLocation,
      checkLocation,
      isLowEnergyMode, setLowEnergyMode,
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
