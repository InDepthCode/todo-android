import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Interfaces ---
interface Task { id: string; title: string; completed: boolean; }
interface Streak { count: number; lastCompletedDate: string | null; }
interface ActivityData { [date: string]: number; }
interface HistoricalData { [date: string]: string[]; }
interface WeeklyReportData { weekOf: string; completionRate: number; busiestDay: string; }

// --- Storage Keys ---
export const DAILY_TASKS_KEY = 'DAILY_TASKS';
const LAST_OPENED_KEY = 'LAST_OPENED_DATE';
const STREAK_STORAGE_KEY = 'STREAK_DATA';
const ACTIVITY_STORAGE_KEY = 'ACTIVITY_DATA';
const HISTORICAL_DATA_KEY = 'HISTORICAL_DATA';

// --- Helper ---
const getTodayDateString = () => new Date().toISOString().split('T')[0];

// --- Main Component ---
const HomeScreen: React.FC = () => {
  // --- State ---
  const [dailyTasks, setDailyTasks] = useState<(Task | null)[]>([null, null, null]);
  const [addingToSlot, setAddingToSlot] = useState<number | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [streak, setStreak] = useState<Streak>({ count: 0, lastCompletedDate: null });
  const [activityData, setActivityData] = useState<ActivityData>({});
  const [historicalData, setHistoricalData] = useState<HistoricalData>({});
  const [selectedDay, setSelectedDay] = useState<{ date: string; tasks: string[] } | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReportData | null>(null);

  // --- Hooks ---
  const theme = useTheme();
  const navigation = useNavigation();
  const router = useRouter();

  // --- Data Loading & Daily Reset ---
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const today = getTodayDateString();
        const lastOpened = await AsyncStorage.getItem(LAST_OPENED_KEY);

        if (lastOpened !== today) {
          setDailyTasks([null, null, null]);
          await AsyncStorage.setItem(DAILY_TASKS_KEY, JSON.stringify([null, null, null]));
          await AsyncStorage.setItem(LAST_OPENED_KEY, today);
        } else {
          const storedTasks = await AsyncStorage.getItem(DAILY_TASKS_KEY);
          if (storedTasks) setDailyTasks(JSON.parse(storedTasks));
        }

        const storedStreak = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
        if (storedStreak) setStreak(JSON.parse(storedStreak));

        const storedActivity = await AsyncStorage.getItem(ACTIVITY_STORAGE_KEY);
        if (storedActivity) setActivityData(JSON.parse(storedActivity));

        const storedHistory = await AsyncStorage.getItem(HISTORICAL_DATA_KEY);
        if (storedHistory) setHistoricalData(JSON.parse(storedHistory));
      };

      loadData();
    }, [])
  );

  // --- Data Saving ---
  const saveData = async (key: string, data: any) => {
    try { await AsyncStorage.setItem(key, JSON.stringify(data)); } catch (e) { console.error('Failed to save data', e); }
  };

  // --- Header UI ---
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.streakContainer}>
          <Ionicons name="flame" size={22} color={streak.count > 0 ? '#FF9500' : theme.colors.border} />
          <Text style={[styles.streakCount, { color: streak.count > 0 ? '#FF9500' : theme.colors.border }]}>
            {streak.count}
          </Text>
        </View>
      ),
    });
  }, [navigation, streak, theme]);

  // --- Handlers ---
  const handleAddTask = () => {
    if (taskTitle.trim() && addingToSlot !== null) {
      const newTask: Task = { id: `${addingToSlot}-${Date.now()}`, title: taskTitle.trim(), completed: false };
      const updatedTasks = [...dailyTasks];
      updatedTasks[addingToSlot] = newTask;
      
      if (!selectedDay && !weeklyReport) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      setDailyTasks(updatedTasks);
      saveData(DAILY_TASKS_KEY, updatedTasks);
      setTaskTitle('');
      setAddingToSlot(null);
      Keyboard.dismiss();
    }
  };

  const handleToggleCompletion = (index: number) => {
    const task = dailyTasks[index];
    if (!task) return;

    const isCompleting = !task.completed;
    const updatedTasks = [...dailyTasks];
    updatedTasks[index] = { ...task, completed: isCompleting };

    if (!selectedDay && !weeklyReport) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setDailyTasks(updatedTasks);
    saveData(DAILY_TASKS_KEY, updatedTasks);

    const todayStr = getTodayDateString();
    const completedToday = updatedTasks.filter(t => t?.completed).map(t => t!.title);
    const newHistoricalData = { ...historicalData, [todayStr]: completedToday };
    setHistoricalData(newHistoricalData);
    saveData(HISTORICAL_DATA_KEY, newHistoricalData);

    const newActivityData = { ...activityData, [todayStr]: completedToday.length };
    setActivityData(newActivityData);
    saveData(ACTIVITY_STORAGE_KEY, newActivityData);

    if (isCompleting && streak.lastCompletedDate !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      const newStreak = { count: streak.lastCompletedDate === yesterdayStr ? streak.count + 1 : 1, lastCompletedDate: todayStr };
      setStreak(newStreak);
      saveData(STREAK_STORAGE_KEY, newStreak);
    }
  };

  const handleSlotPress = (index: number) => {
    if (dailyTasks[index]) {
      handleToggleCompletion(index);
    } else {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setAddingToSlot(index);
    }
  };

  const handleDayPress = (day: string) => {
    const tasksForDay = historicalData[day] || [];
    if (tasksForDay.length > 0) {
      setSelectedDay({ date: day, tasks: tasksForDay });
    }
  };

  const handleDayLongPress = (day: string) => {
    const date = new Date(day);
    const dayOfWeek = date.getDay();
    const startDate = new Date(date);
    startDate.setDate(date.getDate() - dayOfWeek);

    let totalCompleted = 0;
    let busiestDay = { date: '', count: 0 };

    for (let i = 0; i < 7; i++) {
      const weekDay = new Date(startDate);
      weekDay.setDate(startDate.getDate() + i);
      const dayStr = weekDay.toISOString().split('T')[0];
      const count = activityData[dayStr] || 0;
      totalCompleted += count;
      if (count > busiestDay.count) {
        busiestDay = { date: dayStr, count };
      }
    }

    const completionRate = Math.round((totalCompleted / (7 * 3)) * 100);
    const busiestDayName = busiestDay.date ? new Date(busiestDay.date).toLocaleDateString(undefined, { weekday: 'long' }) : 'N/A';

    setWeeklyReport({
      weekOf: startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      completionRate,
      busiestDay: busiestDayName,
    });
  };

  // --- Render ---
  return (
    <SafeAreaView style={[styles.wrapper, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container} keyboardVerticalOffset={100}>
        <ScrollView style={{flex: 1}} contentContainerStyle={styles.scrollContent}>
            <Text style={[styles.greeting, { color: theme.colors.text }]}>Today's Priorities</Text>
            <View style={styles.slotsContainer}>
              {dailyTasks.map((task, index) => {
                const isCompleted = task?.completed ?? false;
                return (
                  <TouchableOpacity 
                    key={index} 
                    style={[
                      styles.slot,
                      { backgroundColor: theme.colors.card },
                      isCompleted && { opacity: 0.5 },
                      !task && { borderStyle: 'dashed', borderWidth: 2, borderColor: theme.colors.border, backgroundColor: 'transparent' }
                    ]}
                    onPress={() => handleSlotPress(index)}
                    activeOpacity={0.7}
                  >
                    {task ? (
                      <View style={styles.taskContent}>
                        <View style={[styles.checkbox, { borderColor: theme.colors.primary, backgroundColor: isCompleted ? theme.colors.primary : 'transparent'}]}>
                          {isCompleted && <Ionicons name="checkmark" size={20} color={theme.colors.card} />}
                        </View>
                        <Text style={[styles.taskTitle, { color: theme.colors.text }, isCompleted && styles.completedTask]}>{task.title}</Text>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => {
                            router.push({ pathname: '/modal', params: { id: task.id, title: task.title } });
                          }}
                        >
                          <Ionicons name="create-outline" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.emptySlotContent}>
                        <Ionicons name="add-circle-outline" size={32} color={theme.colors.border} />
                        <Text style={[styles.emptySlotText, { color: theme.colors.border }]}>Set Priority #{index + 1}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              )}
            </View>
            <ActivityGraph data={activityData} onDayPress={handleDayPress} onDayLongPress={handleDayLongPress} />
        </ScrollView>

        {addingToSlot !== null && (
          <View style={[styles.inputContainer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder={`What is priority #${addingToSlot + 1}?`}
              placeholderTextColor="#9CA3AF"
              value={taskTitle}
              onChangeText={setTaskTitle}
              onSubmitEditing={handleAddTask}
              autoFocus={true}
            />
            <TouchableOpacity onPress={handleAddTask} style={styles.addButton}>
              <Ionicons name="arrow-up-circle" size={36} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      <DailyRewindPopup selectedDay={selectedDay} onClose={() => setSelectedDay(null)} />
      <WeeklyReportCard report={weeklyReport} onClose={() => setWeeklyReport(null)} />

    </SafeAreaView>
  );
};

// --- Child Components ---
const ActivityGraph = ({ data, onDayPress, onDayLongPress }: { data: ActivityData, onDayPress: (day: string) => void, onDayLongPress: (day: string) => void }) => {
  const theme = useTheme();
  const getColorForCount = (count: number) => {
    if (count === 0) return theme.colors.border;
    if (count === 1) return '#006d32';
    if (count === 2) return '#00a64a';
    if (count >= 3) return '#00ff6b';
    return theme.colors.border;
  };

  const days = useMemo(() => {
    const dateArray = [];
    const today = new Date();
    for (let i = 0; i < 105; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dateArray.unshift(date.toISOString().split('T')[0]);
    }
    return dateArray;
  }, []);

  return (
    <View style={styles.graphContainer}>
      <Text style={[styles.graphTitle, {color: theme.colors.text}]}>Recent Activity</Text>
      <View style={styles.graphGrid}>
        {days.map(day => (
          <TouchableOpacity key={day} onPress={() => onDayPress(day)} onLongPress={() => onDayLongPress(day)}>
            <View style={[styles.graphDay, { backgroundColor: getColorForCount(data[day] || 0) }]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const DailyRewindPopup = ({ selectedDay, onClose }: { selectedDay: { date: string; tasks: string[] } | null; onClose: () => void; }) => {
  const theme = useTheme();
  if (!selectedDay) return null;

  const formattedDate = new Date(selectedDay.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Modal transparent={true} visible={true} animationType="fade">
      <Pressable style={styles.popupBackdrop} onPress={onClose}>
        <View style={[styles.popupContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.popupDate, { color: theme.colors.text }]}>{formattedDate}</Text>
          {selectedDay.tasks.map((task, index) => (
            <View key={index} style={styles.popupTaskItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
              <Text style={[styles.popupTaskText, { color: theme.colors.text }]}>{task}</Text>
            </View>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
};

const WeeklyReportCard = ({ report, onClose }: { report: WeeklyReportData | null; onClose: () => void; }) => {
  const theme = useTheme();
  if (!report) return null;

  return (
    <Modal transparent={true} visible={true} animationType="slide">
      <View style={[styles.reportContainer, { backgroundColor: theme.colors.background }]}>
        <SafeAreaView style={{flex: 1}}>
          <View style={styles.reportHeader}>
            <Text style={[styles.reportTitle, { color: theme.colors.text }]}>Weekly Report</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={32} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.reportBody}>
            <Text style={[styles.reportWeekText, { color: theme.colors.text }]}>Week of {report.weekOf}</Text>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>{report.completionRate}%</Text>
              <Text style={[styles.statLabel, { color: theme.colors.text }]}>Completion Rate</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>{report.busiestDay}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.text }]}>Busiest Day</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 30 },
  greeting: { fontSize: 28, fontWeight: 'bold', paddingHorizontal: 24, marginTop: 24, marginBottom: 16 },
  slotsContainer: { paddingHorizontal: 16 },
  slot: { minHeight: 90, borderRadius: 20, padding: 20, marginBottom: 16, justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  emptySlotContent: { alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  emptySlotText: { marginLeft: 12, fontSize: 16, fontWeight: '500' },
  taskContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  taskTitle: { fontSize: 18, fontWeight: '600', flex: 1, marginLeft: 16, marginRight: 30 },
  completedTask: { textDecorationLine: 'line-through', opacity: 0.7 },
  checkbox: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  editButton: { position: 'absolute', right: 0, top: 0, bottom: 0, justifyContent: 'center', paddingHorizontal: 5 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 16, borderTopWidth: 1 },
  input: { flex: 1, fontSize: 18, paddingVertical: 10 },
  modalInput: { marginBottom: 20, padding: 16, borderRadius: 10, borderWidth: 1 },
  saveButton: { padding: 16, borderRadius: 10, alignItems: 'center' },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  addButton: { marginLeft: 12 },
  streakContainer: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  streakCount: { fontSize: 16, fontWeight: '600', marginLeft: 4 },
  graphContainer: { marginTop: 32, paddingHorizontal: 16 },
  graphTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, paddingLeft: 2 },
  graphGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  graphDay: { width: 12, height: 12, borderRadius: 3, margin: 2 },
  popupBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  popupContainer: { width: '85%', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  popupDate: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  popupTaskItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  popupTaskText: { fontSize: 16, marginLeft: 8 },
  reportContainer: { flex: 1 },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  reportTitle: { fontSize: 24, fontWeight: 'bold' },
  reportBody: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  reportWeekText: { fontSize: 20, marginBottom: 40 },
  statBox: { alignItems: 'center', marginVertical: 20 },
  statValue: { fontSize: 48, fontWeight: 'bold' },
  statLabel: { fontSize: 18, marginTop: 4 },
});

export default HomeScreen;
