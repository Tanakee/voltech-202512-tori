import LocationMapModal from '@/components/LocationMapModal';
import { Colors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { Briefcase, Home, Map as MapIcon, MapPin } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { mode, registerLocation, homeLocation, workLocation } = useApp();
  const [showMap, setShowMap] = useState(false);
  const theme = mode === 'work' ? Colors.work : Colors.private;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>設定</Text>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>位置情報の自動切り替え</Text>
            <Text style={styles.sectionDesc}>
                自宅や職場の場所を登録すると、近くにいるときにモード切り替えを提案します。
            </Text>

            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Home color={theme.primary} size={24} />
                    <Text style={styles.cardTitle}>自宅の場所</Text>
                </View>
                <Text style={[styles.statusText, homeLocation ? styles.statusSet : styles.statusUnset]}>
                    {homeLocation ? '設定済み' : '未設定'}
                </Text>
                <TouchableOpacity 
                    style={[styles.button, { backgroundColor: theme.primary }]}
                    onPress={() => registerLocation('home')}
                >
                    <MapPin color="#FFF" size={18} />
                    <Text style={styles.buttonText}>現在地を自宅として登録</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Briefcase color={theme.primary} size={24} />
                    <Text style={styles.cardTitle}>職場の場所</Text>
                </View>
                <Text style={[styles.statusText, workLocation ? styles.statusSet : styles.statusUnset]}>
                    {workLocation ? '設定済み' : '未設定'}
                </Text>
                <TouchableOpacity 
                    style={[styles.button, { backgroundColor: theme.primary }]}
                    onPress={() => registerLocation('work')}
                >
                    <MapPin color="#FFF" size={18} />
                    <Text style={styles.buttonText}>現在地を職場として登録</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity 
                style={[styles.mapCheckButton, { borderColor: theme.primary }]}
                onPress={() => setShowMap(true)}
            >
                <MapIcon color={theme.primary} size={20} />
                <Text style={[styles.mapCheckButtonText, { color: theme.primary }]}>登録地点をマップで確認</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>

      <LocationMapModal visible={showMap} onClose={() => setShowMap(false)} />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  statusSet: {
      color: '#4ADE80', // Green
  },
  statusUnset: {
      color: '#999', // Gray
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 14,
  },
  mapCheckButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
    backgroundColor: '#FFF',
  },
  mapCheckButtonText: {
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  }
});
