import React, { useEffect, useState } from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

const RootLayout: React.FC = () => {
  const colorScheme = useColorScheme();
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    const loadFont = async () => {
      await Font.loadAsync({
        'IndieFlower-Regular': require('../assets/fonts/IndieFlower-Regular.ttf'),
      });
      setFontLoaded(true);
    };

    loadFont();
  }, []);

  if (!fontLoaded) {
    return null; // Or a loading indicator
  }

  return (
    <ImageBackground
      source={require('../assets/images/paper-texture.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: 'transparent' },
            headerTitleStyle: { fontFamily: 'IndieFlower-Regular', fontSize: 24 },
            headerTintColor: '#4A4A4A',
          }}
        >
          <Stack.Screen name="index" options={{ title: 'My To-Do List' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Edit Task' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});

export default RootLayout;
