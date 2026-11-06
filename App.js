// App.js – Complete with RootNavigator + ThemeProvider
console.log('🔥 App.js loaded');
import React, { useEffect, useRef } from 'react';
import {
  StatusBar,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';

// Error Handling System
import { LoadingProvider } from './src/context/LoadingContext';
import { ToastProvider } from './src/context/ToastContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';
import { useToast } from './src/context/ToastContext';
import { toastConfig } from './src/components/CustomToast';

// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import HomeScreen from './src/screens/HomeScreen';
import MapViewScreen from './src/screens/MapViewScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import WishlistScreen from './src/screens/WishlistScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import AddPropertyScreen from './src/screens/AddPropertyScreen';
import MyListingsScreen from './src/screens/MyListingsScreen';
import PropertyDetailScreen from './src/screens/PropertyDetailScreen';
import BookingFormScreen from './src/screens/BookingFormScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ChatDetailScreen from './src/screens/ChatDetailScreen';
import BookingDetailScreen from './src/screens/BookingDetailScreen';
import CityPropertiesScreen from './src/screens/CityPropertiesScreen';
import EmailNotificationsScreen from './src/screens/EmailNotificationsScreen';
import BillingHistoryScreen from './src/screens/BillingHistoryScreen';
import { AccessibilityProvider } from './src/context/AccessibilityContext';
import AgentSignUpScreen from './src/screens/AgentSignUpScreen';
import AgentProfileScreen from './src/screens/AgentProfileScreen';
import AllReviewsScreen from './src/screens/AllReviewsScreen';
import PublicProfileScreen from './src/screens/PublicProfileScreen';

// Settings screens
import AccountSettingsScreen from './src/screens/AccountSettingsScreen';
import PersonalInfoScreen from './src/screens/PersonalInfoScreen';
import LoginSecurityScreen from './src/screens/LoginSecurityScreen';
import PrivacyScreen from './src/screens/PrivacyScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import PaymentsScreen from './src/screens/PaymentsScreen';
import AccessibilityScreen from './src/screens/AccessibilityScreen';
import ViewProfileScreen from './src/screens/ViewProfileScreen';
import HelpSupportScreen from './src/screens/HelpSupportScreen';
import MyBookingsScreen from './src/screens/MyBookingsScreen';

// Store
import { useAppStore } from './store/useAppStore';
import { ErrorBoundary } from './ErrorBoundary';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Navigation themes
const lightNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F2F2F7',
    card: '#FFFFFF',
    text: '#1C1C1E',
    border: '#E5E5EA',
    primary: '#007AFF',
  },
};

const darkNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0F0F12',
    card: '#1C1C1E',
    text: '#FFFFFF',
    border: '#2C2C2E',
    primary: '#0A84FF',
  },
};

// ============ NETWORK STATUS CHECKER ============
const NetworkStatusChecker = ({ children }) => {
  const { isConnected } = useNetworkStatus();
  const { showWarning, showSuccess } = useToast();
  const wasOffline = useRef(false);

  useEffect(() => {
    if (isConnected) {
      if (wasOffline.current) {
        showSuccess('✅ Back online!', 2000);
        wasOffline.current = false;
      }
    } else {
      wasOffline.current = true;
      showWarning('📶 You are offline. Please check your connection.', 4000);
    }
  }, [isConnected]);

  return children;
};

// ============ ROOT NAVIGATOR ============
function RootNavigator({ initialRoute }) {
  return (
    <Stack.Navigator
      id="Root"
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      {/* Auth & Welcome */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />

      {/* Main App */}
      <Stack.Screen name="MainTabs" component={MainTabs} />

      {/* Property Screens */}
      <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
      <Stack.Screen name="AddProperty" component={AddPropertyScreen} />
      <Stack.Screen name="MyListings" component={MyListingsScreen} />
      <Stack.Screen name="BookingForm" component={BookingFormScreen} />
      <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
      <Stack.Screen name="CityProperties" component={CityPropertiesScreen} />
      <Stack.Screen name="EmailNotifications" component={EmailNotificationsScreen} />
      <Stack.Screen name="BillingHistory" component={BillingHistoryScreen} />
      <Stack.Screen name="AgentSignUp" component={AgentSignUpScreen} />
      <Stack.Screen name="AgentProfile" component={AgentProfileScreen} />
      <Stack.Screen name="AllReviews" component={AllReviewsScreen} />
      <Stack.Screen name="PublicProfile" component={PublicProfileScreen} />

      {/* Settings */}
      <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="LoginSecurity" component={LoginSecurityScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Payments" component={PaymentsScreen} />
      <Stack.Screen name="Accessibility" component={AccessibilityScreen} />
      <Stack.Screen name="ViewProfile" component={ViewProfileScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

// ============ MAIN TABS ============
function MainTabs() {
  const { user } = useAppStore();
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Map') iconName = focused ? 'map' : 'map-outline';
          else if (route.name === 'Messages') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'Wishlist') iconName = focused ? 'heart' : 'heart-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} initialParams={{ user }} />
      <Tab.Screen name="Map" component={MapViewScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ============ APP CONTENT ============
function AppContent() {
  const { 
    loadProperties, 
    loadFeaturedProperties, 
    loadPreferences,     // ✅ Added to destructuring
    hasSeenWelcome, 
    isLoggedIn 
  } = useAppStore();
  
  const { theme, isDark, colors } = useTheme();

  useEffect(() => {
    loadProperties();
    loadFeaturedProperties();
    loadPreferences();   // ✅ Only called once
  }, []);

  const getInitialRoute = () => {
    if (isLoggedIn) return 'MainTabs';
    if (!hasSeenWelcome) return 'Welcome';
    return 'Login';
  };

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <NavigationContainer theme={isDark ? darkNavigationTheme : lightNavigationTheme}>
        <RootNavigator initialRoute={getInitialRoute()} />
        <Toast config={toastConfig} />
      </NavigationContainer>
    </>
  );
}

// ============ APP ============
export default function App() {
  return (
    <ThemeProvider>
      <AccessibilityProvider>
        <LoadingProvider>
          <ToastProvider>
            <NetworkStatusChecker>
              
              <ErrorBoundary>
                <AppContent />
              </ErrorBoundary>

            </NetworkStatusChecker>
          </ToastProvider>
        </LoadingProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  );
}