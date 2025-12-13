import { Colors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function BalanceGauge() {
  const { tasks } = useApp();
  const [workTime, setWorkTime] = useState(0);
  const [privateTime, setPrivateTime] = useState(0);

  const calculateTotalTime = () => {
    const now = Date.now();
    let wTime = 0;
    let pTime = 0;

    tasks.forEach(t => {
      let time = t.elapsedTime;
      if (t.isRunning && t.startTime) {
        time += (now - t.startTime) / 1000;
      }
      
      if (t.type === 'work') wTime += time;
      else pTime += time;
    });

    setWorkTime(wTime);
    setPrivateTime(pTime);
  };

  useEffect(() => {
    calculateTotalTime(); // Initial calculation

    const isAnyRunning = tasks.some(t => t.isRunning);
    let interval: NodeJS.Timeout;

    if (isAnyRunning) {
      interval = setInterval(calculateTotalTime, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [tasks]);

  const totalTime = workTime + privateTime;
  const workProgress = totalTime > 0 ? workTime / totalTime : 0;
  const privateProgress = totalTime > 0 ? privateTime / totalTime : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Life Balance (Time Based)</Text>
      
      <View style={styles.row}>
        <Text style={[styles.label, { color: Colors.work.text }]}>Work</Text>
        <View style={styles.barContainer}>
          <View style={[styles.bar, { width: `${workProgress * 100}%`, backgroundColor: Colors.work.primary }]} />
        </View>
        <Text style={styles.percent}>{Math.round(workProgress * 100)}%</Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: Colors.private.text }]}>Private</Text>
        <View style={styles.barContainer}>
          <View style={[styles.bar, { width: `${privateProgress * 100}%`, backgroundColor: Colors.private.primary }]} />
        </View>
        <Text style={styles.percent}>{Math.round(privateProgress * 100)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    width: 60,
    fontWeight: '600',
    fontSize: 14,
  },
  barContainer: {
    flex: 1,
    height: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 5,
  },
  percent: {
    width: 40,
    textAlign: 'right',
    fontSize: 12,
    color: '#666',
  }
});
