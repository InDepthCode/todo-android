import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useFocusEffect } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export const TASKS_STORAGE_KEY = 'TASKS';

const HomeScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const theme = useTheme();

  const loadTasks = useCallback(async () => {
    try {
      const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (storedTasks !== null) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error('Failed to load tasks from storage', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
      } catch (error) {
        console.error('Failed to save tasks to storage', error);
      }
    };

    saveTasks();
  }, [tasks]);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        completed: false,
      };
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setTasks(prevTasks => [newTask, ...prevTasks]);
      setNewTaskTitle('');
    }
  };

  const handleToggleCompletion = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  const renderItem = ({ item }: { item: Task }) => (
    <Animated.View entering={FadeIn} exiting={FadeOut}>
      <View style={[styles.taskCard, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity
          onPress={() => handleToggleCompletion(item.id)}
          style={styles.checkbox}
        >
          {item.completed && (
            <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
        <Link href={{ pathname: '/modal', params: { id: item.id, title: item.title } }} asChild>
          <TouchableOpacity style={styles.taskTitleContainer}>
            <Text
              style={[
                styles.taskTitle,
                { color: theme.colors.text },
                item.completed && styles.completedTask,
              ]}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        </Link>
        <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
          <Ionicons name="trash-outline" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.wrapper, { backgroundColor: theme.colors.background }]} edges={['bottom', 'left', 'right']}>
      <View style={styles.container}>
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Add a new task..."
            placeholderTextColor="#9CA3AF"
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            onSubmitEditing={handleAddTask}
          />
          <TouchableOpacity onPress={handleAddTask} style={styles.addButton}>
            <Ionicons name="add" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={tasks}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingTop: 16 }}
          ListEmptyComponent={
            <View style={styles.placeholderContainer}>
              <Text style={[styles.placeholder, { color: '#9CA3AF' }]}>
                Your to-do list is empty.
              </Text>
            </View>
          }
        />
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
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D1D6',
  },
  input: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 8,
  },
  addButton: {
    marginLeft: 12,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  taskTitleContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '500',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  placeholder: {
    fontSize: 16,
  },
});

export default HomeScreen;
