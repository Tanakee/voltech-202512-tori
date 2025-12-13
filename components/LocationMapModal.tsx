import { useApp } from '@/context/AppContext';
import { X } from 'lucide-react-native';
import React from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';

interface LocationMapModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function LocationMapModal({ visible, onClose }: LocationMapModalProps) {
  const { homeLocation, workLocation } = useApp();

  const initialRegion = workLocation ? {
    latitude: workLocation.coords.latitude,
    longitude: workLocation.coords.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  } : homeLocation ? {
    latitude: homeLocation.coords.latitude,
    longitude: homeLocation.coords.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  } : {
    // Default to Tokyo Station if nothing set
    latitude: 35.681236,
    longitude: 139.767125,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>登録地点マップ</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X color="#333" size={24} />
          </TouchableOpacity>
        </View>
        
        <MapView style={styles.map} initialRegion={initialRegion}>
          {homeLocation && (
            <>
                <Marker 
                    coordinate={{
                        latitude: homeLocation.coords.latitude,
                        longitude: homeLocation.coords.longitude
                    }}
                    title="自宅"
                    description="プライベートモードへの切り替え地点"
                    pinColor="green"
                />
                <Circle 
                    center={{
                        latitude: homeLocation.coords.latitude,
                        longitude: homeLocation.coords.longitude
                    }}
                    radius={100}
                    fillColor="rgba(74, 222, 128, 0.2)"
                    strokeColor="rgba(74, 222, 128, 0.5)"
                />
            </>
          )}
          {workLocation && (
            <>
                <Marker 
                    coordinate={{
                        latitude: workLocation.coords.latitude,
                        longitude: workLocation.coords.longitude
                    }}
                    title="職場"
                    description="仕事モードへの切り替え地点"
                    pinColor="blue"
                />
                <Circle 
                    center={{
                        latitude: workLocation.coords.latitude,
                        longitude: workLocation.coords.longitude
                    }}
                    radius={100}
                    fillColor="rgba(96, 165, 250, 0.2)"
                    strokeColor="rgba(96, 165, 250, 0.5)"
                />
            </>
          )}
        </MapView>

        <View style={styles.footer}>
            <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: 'green' }]} />
                <Text>自宅 (半径100m)</Text>
            </View>
            <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: 'blue' }]} />
                <Text>職場 (半径100m)</Text>
            </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFF',
    zIndex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 5,
  },
  map: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  footer: {
      position: 'absolute',
      bottom: 40,
      left: 20,
      right: 20,
      backgroundColor: 'rgba(255,255,255,0.9)',
      padding: 15,
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'space-around',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
  },
  legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  dot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
  }
});
