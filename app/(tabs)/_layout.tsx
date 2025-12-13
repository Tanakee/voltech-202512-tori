import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

export default function TabLayout() {
  const { mode } = useApp();
  const theme = mode === 'work' ? Colors.work : Colors.private;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
            backgroundColor: '#FFF',
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: '設定',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}
