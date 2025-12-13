import { Colors } from '@/constants/theme';
import { Task, TaskSize, useApp } from '@/context/AppContext';
import * as Haptics from 'expo-haptics';
import { Check, Edit, Pause, Play, Plus, Trash2, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, LayoutAnimation, Modal, Platform, Animated as RNAnimated, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, UIManager, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleTimer: (id: string) => void;
  mode: 'work' | 'private';
  isAnyTaskRunning: boolean;
}

export default function TaskItem({ task, onToggle, onDelete, onToggleTimer, mode, isAnyTaskRunning }: TaskItemProps) {
  const { addSubTask, toggleSubTask, deleteSubTask, updateTask } = useApp();
  const theme = task.type === 'work' ? Colors.work : Colors.private;
  const [displayTime, setDisplayTime] = useState(task.elapsedTime);
  
  // Animation Values
  const fadeAnim = useRef(new RNAnimated.Value(1)).current;
  const scaleAnim = useRef(new RNAnimated.Value(1)).current;
  
  // Edit Modal State
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editSize, setEditSize] = useState<TaskSize>(task.size);
  
  // Modal SubTask State
  const [isModalSubTaskInputVisible, setModalSubTaskInputVisible] = useState(false);
  const [modalNewSubTaskTitle, setModalNewSubTaskTitle] = useState('');

  const swipeableRef = useRef<Swipeable>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setDisplayTime(task.elapsedTime);
  }, [task.elapsedTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (task.isRunning) {
      interval = setInterval(() => {
        const now = Date.now();
        const currentElapsed = task.elapsedTime + (task.startTime ? (now - task.startTime) / 1000 : 0);
        setDisplayTime(currentElapsed);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [task.isRunning, task.startTime, task.elapsedTime]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const handleToggle = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      RNAnimated.parallel([
          RNAnimated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
          }),
          RNAnimated.timing(scaleAnim, {
              toValue: 0.95,
              duration: 300,
              useNativeDriver: true,
          })
      ]).start(() => {
          if (Platform.OS !== 'web') {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          }
          onToggle(task.id);
      });
  };

  const handleAddSubTaskInModal = () => {
    if (modalNewSubTaskTitle.trim()) {
      addSubTask(task.id, modalNewSubTaskTitle.trim());
      setModalNewSubTaskTitle('');
    }
  };

  const openEditModal = () => {
      setEditTitle(task.title);
      setEditSize(task.size);
      setEditModalVisible(true);
      swipeableRef.current?.close();
  };

  const handleSaveEdit = () => {
      updateTask(task.id, {
          title: editTitle,
          size: editSize
      });
      setEditModalVisible(false);
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "タスクの削除",
      "本当にこのタスクを削除しますか？",
      [
        {
          text: "キャンセル",
          style: "cancel"
        },
        {
          text: "削除",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onDelete(task.id);
          }
        }
      ]
    );
  };

  const isFocusMode = isAnyTaskRunning && !task.isRunning;

  const renderRightActions = (progress: RNAnimated.AnimatedInterpolation<number>, dragX: RNAnimated.AnimatedInterpolation<number>) => {
    const trans = dragX.interpolate({
      inputRange: [-150, 0],
      outputRange: [0, 150],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.rightActionContainer}>
        <RNAnimated.View style={[styles.rightActionsWrapper, { transform: [{ translateX: trans }] }]}>
           <TouchableOpacity 
             style={[styles.actionBtnBase, styles.editActionBtn]} 
             onPress={openEditModal}
           >
             <Edit color="#FFF" size={24} />
             <Text style={styles.actionText}>編集</Text>
           </TouchableOpacity>
           <TouchableOpacity 
             style={[styles.actionBtnBase, styles.deleteActionBtn]} 
             onPress={handleDelete}
           >
             <Trash2 color="#FFF" size={24} />
             <Text style={styles.actionText}>削除</Text>
           </TouchableOpacity>
        </RNAnimated.View>
      </View>
    );
  };

  const onSwipeableOpen = () => {
  };

  const getSizeColor = (size: string) => {
      switch(size) {
          case 'S': return '#4ADE80'; // Green
          case 'M': return '#FACC15'; // Yellow
          case 'L': return '#F87171'; // Red
          default: return '#CCC';
      }
  };

  return (
    <>
    <RNAnimated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      onSwipeableOpen={onSwipeableOpen}
      containerStyle={styles.swipeableContainer}
      overshootRight={false}
    >
        <View style={[
        styles.container, 
        { borderLeftColor: theme.primary },
        isFocusMode && styles.dimmed
        ]}>
            <View style={styles.mainContent}>
                <TouchableOpacity 
                    style={[styles.checkCircle, task.completed && { backgroundColor: theme.primary, borderColor: theme.primary }]} 
                    onPress={handleToggle}
                >
                    {task.completed && <Check color="#FFF" size={16} />}
                </TouchableOpacity>
                
                <View style={styles.contentContainer}>
                    <View style={styles.titleRow}>
                        <View style={[styles.sizeBadge, { backgroundColor: getSizeColor(task.size) }]}>
                            <Text style={styles.sizeText}>{task.size}</Text>
                        </View>
                        <Text style={[styles.title, task.completed && styles.completedText]} numberOfLines={1}>
                            {task.title}
                        </Text>
                    </View>
                    {task.elapsedTime > 0 || task.isRunning ? (
                    <Text style={[styles.timerText, { color: theme.text }]}>
                        {task.isRunning ? 'Running: ' : 'Total: '}{formatTime(displayTime)}
                    </Text>
                    ) : null}
                </View>

                <TouchableOpacity onPress={() => onToggleTimer(task.id)} style={styles.actionBtn}>
                    {task.isRunning ? (
                    <Pause color={theme.primary} size={20} fill={theme.primary} />
                    ) : (
                    <Play color={theme.primary} size={20} />
                    )}
                </TouchableOpacity>
            </View>

            {/* SubTasks Display Only (No Add Button Here) */}
            {task.subTasks && task.subTasks.length > 0 && (
                <View style={styles.subTaskSection}>
                    {task.subTasks.map(subTask => (
                        <TouchableOpacity 
                            key={subTask.id} 
                            style={styles.subTaskItem}
                            onPress={() => toggleSubTask(task.id, subTask.id)}
                        >
                            <View 
                                style={[styles.subTaskCheck, subTask.completed && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                            >
                                {subTask.completed && <Check color="#FFF" size={10} />}
                            </View>
                            <Text style={[styles.subTaskTitle, subTask.completed && styles.completedText]}>
                                {subTask.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    </Swipeable>
    </RNAnimated.View>

    {/* Edit Modal */}
    <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
    >
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
        >
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>タスク編集</Text>
                    <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                        <X color="#333" size={24} />
                    </TouchableOpacity>
                </View>

                <ScrollView 
                    ref={scrollViewRef}
                    style={styles.modalBody} 
                    keyboardShouldPersistTaps="handled"
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    <Text style={styles.inputLabel}>タスク名</Text>
                    <TextInput
                        style={styles.modalInput}
                        value={editTitle}
                        onChangeText={setEditTitle}
                        placeholder="タスク名を入力"
                    />

                    <Text style={styles.inputLabel}>サイズ</Text>
                    <View style={styles.sizeSelector}>
                        {(['S', 'M', 'L'] as TaskSize[]).map((size) => (
                            <TouchableOpacity 
                                key={size} 
                                style={[
                                    styles.sizeOption, 
                                    editSize === size && { backgroundColor: getSizeColor(size), borderColor: getSizeColor(size) }
                                ]}
                                onPress={() => setEditSize(size)}
                            >
                                <Text style={[styles.sizeOptionText, editSize === size && { color: '#FFF' }]}>{size}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.inputLabel}>サブタスク管理</Text>
                    <View style={styles.modalSubTaskList}>
                         {task.subTasks && task.subTasks.map(subTask => (
                            <View key={subTask.id} style={styles.modalSubTaskItem}>
                                <TouchableOpacity 
                                    style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                                    onPress={() => toggleSubTask(task.id, subTask.id)}
                                >
                                    <View style={[styles.subTaskCheck, subTask.completed && { backgroundColor: theme.primary, borderColor: theme.primary }]}>
                                        {subTask.completed && <Check color="#FFF" size={10} />}
                                    </View>
                                    <Text style={[styles.modalSubTaskTitle, subTask.completed && styles.completedText, { marginLeft: 8 }]}>{subTask.title}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => deleteSubTask(task.id, subTask.id)} style={{ padding: 8 }}>
                                    <Trash2 color="#EF4444" size={18} />
                                </TouchableOpacity>
                            </View>
                        ))}

                        {isModalSubTaskInputVisible ? (
                            <View style={styles.subTaskInputContainer}>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="サブタスクを入力..."
                                    value={modalNewSubTaskTitle}
                                    onChangeText={setModalNewSubTaskTitle}
                                    onSubmitEditing={handleAddSubTaskInModal}
                                    autoFocus
                                    blurOnSubmit={false}
                                />
                                <TouchableOpacity onPress={handleAddSubTaskInModal} style={styles.subTaskAddConfirm}>
                                    <Check color={theme.primary} size={18} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setModalSubTaskInputVisible(false)} style={styles.subTaskAddCancel}>
                                    <X color="#999" size={18} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity 
                                style={styles.modalAddSubTaskBtn}
                                onPress={() => setModalSubTaskInputVisible(true)}
                            >
                                <Plus color={theme.primary} size={16} />
                                <Text style={[styles.modalAddSubTaskText, { color: theme.primary }]}>新しいサブタスクを追加</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                </ScrollView>

                <View style={styles.modalFooter}>
                    <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setEditModalVisible(false)}>
                        <Text style={styles.cancelBtnText}>キャンセル</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalBtn, styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSaveEdit}>
                        <Text style={styles.saveBtnText}>保存</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  swipeableContainer: {
      marginBottom: 12,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: 'transparent', // Important for shadow
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
  },
  container: {
    backgroundColor: '#FFF',
    padding: 16,
    borderLeftWidth: 4,
    // Removed fixed height to allow expansion
  },
  mainContent: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  dimmed: {
    opacity: 0.4,
    backgroundColor: '#F5F5F5',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  sizeBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      marginRight: 8,
  },
  sizeText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#FFF',
  },
  title: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  timerText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#AAA',
  },
  actionBtn: {
    padding: 8,
    marginLeft: 4,
  },
  rightActionContainer: {
      width: 150, // Increased width for 2 buttons
      flexDirection: 'row',
  },
  rightActionsWrapper: {
      flexDirection: 'row',
      width: 150,
      height: '100%',
  },
  actionBtnBase: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  editActionBtn: {
      backgroundColor: '#3B82F6', // Blue
  },
  deleteActionBtn: {
      backgroundColor: '#EF4444', // Red
  },
  actionText: {
      color: '#FFF',
      fontSize: 12,
      fontWeight: 'bold',
      marginTop: 4,
  },
  subTaskSection: {
      marginTop: 10,
      paddingLeft: 36, // Indent to align with text
      width: '100%',
  },
  subTaskItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
  },
  subTaskCheck: {
      width: 16,
      height: 16,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: '#DDD',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
  },
  subTaskTitle: {
      fontSize: 14,
      color: '#555',
      flex: 1,
  },
  subTaskDelete: {
      padding: 4,
  },
  addSubTaskBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
  },
  addSubTaskText: {
      fontSize: 12,
      color: '#999',
      marginLeft: 4,
  },
  subTaskInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
  },
  subTaskInput: {
      flex: 1,
      fontSize: 14,
      borderBottomWidth: 1,
      borderBottomColor: '#DDD',
      paddingVertical: 2,
      marginRight: 8,
  },
  subTaskAddConfirm: {
      padding: 4,
  },
  subTaskAddCancel: {
      padding: 4,
  },
  // Modal Styles
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
  },
  modalContent: {
      backgroundColor: '#FFF',
      borderRadius: 16,
      width: '100%',
      maxHeight: '80%',
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
  },
  modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
  },
  modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333',
  },
  modalBody: {
      marginBottom: 20,
  },
  inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: '#666',
      marginBottom: 8,
      marginTop: 10,
  },
  modalInput: {
      borderWidth: 1,
      borderColor: '#DDD',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: '#333',
  },
  sizeSelector: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
  },
  sizeOption: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#DDD',
      backgroundColor: '#FFF',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
  },
  sizeOptionText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#666',
  },
  modalSubTaskList: {
      marginTop: 10,
  },
  modalSubTaskItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
  },
  modalSubTaskTitle: {
      fontSize: 14,
      color: '#333',
  },
  modalAddSubTaskBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 15,
      paddingVertical: 8,
  },
  modalAddSubTaskText: {
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
  },
  modalFooter: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
  },
  modalBtn: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
  },
  cancelBtn: {
      backgroundColor: '#F3F4F6',
  },
  saveBtn: {
      // Background color set dynamically
  },
  cancelBtnText: {
      color: '#666',
      fontWeight: '600',
  },
  saveBtnText: {
      color: '#FFF',
      fontWeight: '600',
  }
});
