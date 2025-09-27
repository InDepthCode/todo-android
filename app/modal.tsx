import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DAILY_TASKS_KEY } from './index';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

const EditModal: React.FC = () => {
  const { id, title } = useLocalSearchParams<{ id?: string; title?: string }>();
  const [taskTitle, setTaskTitle] = useState(() => title || '');
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    // If there's no ID, we can't edit anything.
    // It's better to navigate back immediately.
    if (!id) {
      console.error('EditModal opened without a task ID.');
      router.back();
    }
  }, [id, router]);

  const handleSaveChanges = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // If the ID is missing or the title is empty, just navigate back without saving.
    if (!id || !taskTitle.trim()) {
      router.back();
      return;
    }

    try {
      const storedTasks = await AsyncStorage.getItem(DAILY_TASKS_KEY);
      const tasks: Task[] = storedTasks ? JSON.parse(storedTasks) : [];

      const updatedTasks = tasks.map(task =>
        task?.id === id ? { ...task, title: taskTitle.trim() } : task
      );

      await AsyncStorage.setItem(DAILY_TASKS_KEY, JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Failed to save changes', error);
    } finally {
      // Ensure we always navigate back after the save attempt.
      router.back();
    }
  };

  // Render a loading/empty state until we confirm we have an ID
  if (!id) {
    return null;
  }

  return (
    <Pressable style={styles.backdrop} onPress={router.back}>
      <SafeAreaView style={styles.wrapper}>
        {/* This Pressable stops the card from closing when tapped inside */}
        <Pressable style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <TextInput
            style={[
              styles.input,
              { color: theme.colors.text, borderColor: theme.colors.border },
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
        </Pressable>
      </SafeAreaView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  card: {
    margin: 24,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    minHeight: 100,
    fontSize: 20,
    padding: 12,
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
