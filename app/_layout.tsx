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

// Custom Header Component
const CustomHeader = (props: StackHeaderProps) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { options, route } = props;
  const title = options.title !== undefined ? options.title : route.name;

  return (
    <View style={{ backgroundColor: theme.colors.card, paddingTop: insets.top }}>
      <View style={[styles.headerContainer, { borderBottomColor: theme.colors.border }]}>
        <View style={styles.headerSide} />
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{title}</Text>
        <View style={styles.headerSide}>
          {options.headerRight && options.headerRight({ tintColor: theme.colors.primary })}
        </View>
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
      primary: '#00E0FF', // Electric Cyan
      background: '#16161D', // Deep Charcoal
      card: '#1E1E28', // Lighter Charcoal for cards
      text: '#E1E1E6', // Soft white/light gray
      border: '#2D2D3A', // Subtle border
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
              title: 'Today\'s Priorities',
              header: (props) => <CustomHeader {...props} />,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  headerSide: {
    width: 60,
    alignItems: 'flex-end',
  },
});

export default RootLayout;
