import { X } from 'lucide-react-native';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LocationMapModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function LocationMapModal({ visible, onClose }: LocationMapModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>登録地点マップ</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X color="#333" size={24} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
            <Text style={styles.message}>Web版ではマップ機能をご利用いただけません。</Text>
            <Text style={styles.subMessage}>アプリ版をご利用ください。</Text>
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
  content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
  },
  message: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'center',
  },
  subMessage: {
      fontSize: 14,
      color: '#666',
      textAlign: 'center',
  }
});
