import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
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
  const theme = useTheme();

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
    <SafeAreaView style={[styles.wrapper, { backgroundColor: theme.colors.background }]}>
      <View style={styles.container}>
        <TextInput
          style={[
            styles.input,
            { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.card },
          ]}
          value={taskTitle}
          onChangeText={setTaskTitle}
          autoFocus
          multiline
        />
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSaveChanges}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    flex: 1,
    fontSize: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default EditModal;
