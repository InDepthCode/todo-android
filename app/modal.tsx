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
        <Button title="Save Changes" onPress={handleSaveChanges} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 24,
    backgroundColor: 'white',
    fontSize: 16,
  },
});

export default EditModal;
