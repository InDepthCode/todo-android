import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemeProvider, DarkTheme, DefaultTheme, useTheme } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StackHeaderProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Custom Header Component for the main screen
const CustomHeader = (props: StackHeaderProps) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { options, route } = props;
  const title = options.title !== undefined ? options.title : route.name;

  return (
    <View style={{ backgroundColor: theme.colors.card, paddingTop: insets.top }}>
      <View style={[styles.headerContainer, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{title}</Text>
      </View>
    </View>
  );
};

// Custom Header for the Modal screen with a close button
const CustomModalHeader = (props: StackHeaderProps) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const { options } = props;

  return (
    <View style={{ backgroundColor: theme.colors.card, paddingTop: insets.top }}>
      <View style={[styles.headerContainer, { justifyContent: 'center' }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{options.title}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const RootLayout: React.FC = () => {
  const colorScheme = useColorScheme();

  const AppTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#007AFF',
      background: '#F2F2F7',
      card: 'white',
      text: '#1C1C1E',
      border: '#E5E5EA',
    },
  };

  const AppDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: '#0A84FF',
      background: '#000000',
      card: '#1C1C1E',
      text: '#FFFFFF',
      border: '#38383A',
    },
  };

  const theme = colorScheme === 'dark' ? AppDarkTheme : AppTheme;

  return (
    <SafeAreaProvider>
      <ThemeProvider value={theme}>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: 'My To-Do List',
              header: (props) => <CustomHeader {...props} />,
            }}
          />
          <Stack.Screen
            name="modal"
            options={{
              presentation: 'modal',
              title: 'Edit Task',
              header: (props) => <CustomModalHeader {...props} />,
            }}
          />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
  },
});

export default RootLayout;
