import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity, Text, StyleSheet, View, Platform } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';

// Add web-specific styles
if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    html, body, #root {
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
  `;
  document.head.appendChild(style);
}

const Stack = createNativeStackNavigator();

export default function App() {
  const [isFirstTime, setIsFirstTime] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    checkFirstTime();
  }, []);

  const checkFirstTime = async () => {
    try {
      const hasLoggedIn = await AsyncStorage.getItem('hasLoggedIn');
      const savedUserType = await AsyncStorage.getItem('userType');

      if (hasLoggedIn && savedUserType) {
        setIsFirstTime(false);
        setUserType(savedUserType);
      } else {
        setIsFirstTime(true);
      }
    } catch (error) {
      console.error('Error checking first time:', error);
      setIsFirstTime(true);
    }
  };

  const handleLogin = async (type) => {
    try {
      await AsyncStorage.setItem('hasLoggedIn', 'true');
      await AsyncStorage.setItem('userType', type);
      setUserType(type);
      setIsFirstTime(false);
    } catch (error) {
      console.error('Error saving login:', error);
    }
  };

  const handleReset = async (navigation) => {
    try {
      await AsyncStorage.clear();
      setIsFirstTime(true);
      setUserType(null);

      // Reload the page for a fresh start
      if (typeof window !== 'undefined') {
        window.location.reload();
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } catch (error) {
      console.error('Error resetting:', error);
    }
  };

  if (isFirstTime === null) {
    return null; // Loading state
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={isFirstTime ? "Login" : "Home"}
          screenOptions={{
            headerShown: false,
            headerStyle: {
              backgroundColor: '#2196F3',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="Login"
            options={{ title: 'AI Vision Narrator' }}
          >
            {props => <LoginScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            initialParams={{ userType }}
            options={({ navigation }) => ({
              title: 'AI Vision Narrator',
              headerRight: () => (
                <TouchableOpacity
                  onPress={() => handleReset(navigation)}
                  style={styles.resetButton}
                >
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
              ),
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  resetButton: {
    marginRight: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
