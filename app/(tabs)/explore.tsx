import { Colors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import * as Location from 'expo-location';
import { MapPin } from 'lucide-react-native';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const { mode, setWorkLocation, setHomeLocation, workLocation, homeLocation } = useApp();
  const theme = mode === 'work' ? Colors.work : Colors.private;

  const handleSetWork = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({});
      setWorkLocation(location);
      Alert.alert('成功', '現在地を職場として設定しました！');
    } catch (e) {
      Alert.alert('エラー', '位置情報を取得できませんでした。');
    }
  };

  const handleSetHome = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({});
      setHomeLocation(location);
      Alert.alert('成功', '現在地を自宅として設定しました！');
    } catch (e) {
      Alert.alert('エラー', '位置情報を取得できませんでした。');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>設定</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>位置情報設定</Text>
        <Text style={styles.description}>
          現在の位置を「職場」または「自宅」として登録すると、自動でモードが切り替わります。
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <MapPin color={Colors.work.primary} size={24} />
            <View style={styles.info}>
              <Text style={styles.label}>職場の場所</Text>
              <Text style={styles.value}>
                {workLocation ? `${workLocation.coords.latitude.toFixed(4)}, ${workLocation.coords.longitude.toFixed(4)}` : '未設定'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.button, { backgroundColor: Colors.work.primary }]} onPress={handleSetWork}>
            <Text style={styles.buttonText}>現在地を職場に設定</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <MapPin color={Colors.private.primary} size={24} />
            <View style={styles.info}>
              <Text style={styles.label}>自宅の場所</Text>
              <Text style={styles.value}>
                {homeLocation ? `${homeLocation.coords.latitude.toFixed(4)}, ${homeLocation.coords.longitude.toFixed(4)}` : '未設定'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.button, { backgroundColor: Colors.private.primary }]} onPress={handleSetHome}>
            <Text style={styles.buttonText}>現在地を自宅に設定</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  info: {
    marginLeft: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
