import BalanceCrystal from '@/components/BalanceCrystal';
import { Colors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BalanceScreen() {
  const { mode } = useApp();
  const theme = mode === 'work' ? Colors.work : Colors.private;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <BalanceCrystal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
