import { Colors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import React, { Suspense } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Lazy load the heavy 3D component
const PlanetGarden = React.lazy(() => import('@/components/PlanetGarden'));

export default function GardenScreen() {
  const { mode } = useApp();
  const theme = mode === 'work' ? Colors.work : Colors.private;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#000000' }]}>
      <Suspense fallback={
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      }>
        <PlanetGarden />
      </Suspense>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
