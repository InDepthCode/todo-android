import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  SafeAreaView,
  Text,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TASKS_STORAGE_KEY } from './index';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

const EditModal: React.FC = () => {
  const { id, title } = useLocalSearchParams<{ id: string; title: string }>();
  const [taskTitle, setTaskTitle] = useState(title || '');
  const router = useRouter();

  const handleSaveChanges = async () => {
    if (!id || !taskTitle.trim()) {
      return;
    }

    try {
      const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (storedTasks !== null) {
        const tasks: Task[] = JSON.parse(storedTasks);
        const updatedTasks = tasks.map(task =>
          task.id === id ? { ...task, title: taskTitle.trim() } : task
        );
        await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
        router.back();
      }
    } catch (error) {
      console.error('Failed to save changes', error);
    }
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.header}>Edit Task</Text>
        <TextInput
          style={styles.input}
          value={taskTitle}
          onChangeText={setTaskTitle}
          autoFocus
        />
        <Button title="Save Changes" onPress={handleSaveChanges} color="#4A4A4A" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F8F8F0', // Off-white paper color
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontFamily: 'IndieFlower-Regular',
    fontSize: 32,
    color: '#4A4A4A',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 24,
    fontFamily: 'IndieFlower-Regular',
    fontSize: 24,
    color: '#4A4A4A',
    backgroundColor: 'transparent',
    textAlignVertical: 'top',
  },
});

export default EditModal;
