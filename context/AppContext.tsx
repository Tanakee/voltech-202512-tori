import * as Location from 'expo-location';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type Mode = 'work' | 'private';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  type: Mode;
}

interface AppContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
  tasks: Task[];
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  workLocation: Location.LocationObject | null;
  setWorkLocation: (loc: Location.LocationObject) => void;
  homeLocation: Location.LocationObject | null;
  setHomeLocation: (loc: Location.LocationObject) => void;
  checkLocation: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<Mode>('private');
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: '夕食の買い物', completed: false, type: 'private' },
    { id: '2', title: '週報の作成', completed: false, type: 'work' },
    { id: '3', title: 'ジムに行く', completed: false, type: 'private' },
    { id: '4', title: 'クライアントへのメール返信', completed: false, type: 'work' },
  ]);
  const [workLocation, setWorkLocation] = useState<Location.LocationObject | null>(null);
  const [homeLocation, setHomeLocation] = useState<Location.LocationObject | null>(null);

  const addTask = (title: string) => {
    setTasks([...tasks, { id: Date.now().toString(), title, completed: false, type: mode }]);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
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

  useEffect(() => {
    checkLocation();
  }, []);

  return (
    <AppContext.Provider value={{
      mode, setMode,
      tasks, addTask, toggleTask, deleteTask,
      workLocation, setWorkLocation,
      homeLocation, setHomeLocation,
      checkLocation
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
