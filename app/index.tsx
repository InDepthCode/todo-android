import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Button,
  FlatList,
  Switch,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useFocusEffect } from 'expo-router';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export const TASKS_STORAGE_KEY = 'TASKS';

const HomeScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

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
      setTasks(prevTasks => [...prevTasks, newTask]);
      setNewTaskTitle('');
    }
  };

  const handleToggleCompletion = (id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  const renderItem = ({ item }: { item: Task }) => (
    <View style={styles.taskCard}>
      <Switch
        value={item.completed}
        onValueChange={() => handleToggleCompletion(item.id)}
        thumbColor={item.completed ? '#A9A9A9' : '#4A4A4A'}
        trackColor={{ false: '#E0E0E0', true: '#C8C8C8' }}
      />
      <Link href={{ pathname: '/modal', params: { id: item.id, title: item.title } }} asChild>
        <TouchableOpacity style={styles.taskTitleContainer}>
          <Text style={[styles.taskTitle, item.completed && styles.completedTask]}>
            {item.title}
          </Text>
        </TouchableOpacity>
      </Link>
      <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
        <Text style={styles.deleteButton}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add a new task..."
            placeholderTextColor="#A9A9A9"
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
          />
          <Button title="Add" onPress={handleAddTask} color="#4A4A4A" />
        </View>
        <FlatList
          data={tasks}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={<Text style={styles.placeholder}>Your to-do list is empty.</Text>}
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
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    fontFamily: 'IndieFlower-Regular',
    fontSize: 18,
    color: '#4A4A4A',
    backgroundColor: 'transparent',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  taskTitleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  taskTitle: {
    fontFamily: 'IndieFlower-Regular',
    fontSize: 20,
    color: '#4A4A4A',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#A9A9A9',
  },
  deleteButton: {
    fontFamily: 'IndieFlower-Regular',
    fontSize: 16,
    color: '#EF4444',
  },
  placeholder: {
    fontFamily: 'IndieFlower-Regular',
    fontSize: 18,
    color: '#A9A9A9',
    textAlign: 'center',
    marginTop: 32,
  },
});

export default HomeScreen;
