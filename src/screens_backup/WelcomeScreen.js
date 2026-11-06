import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  Image, 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const { setHasSeenWelcome } = useAppStore();
  

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleExplore = () => {
    setHasSeenWelcome(true);
    navigation.replace('MainTabs');
  };

  const handleLogin = () => {
    setHasSeenWelcome(true);
    navigation.replace('Login');
  };

  const handleSignUp = () => {
    setHasSeenWelcome(true);
    navigation.replace('SignUp');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <LinearGradient
        colors={['#1A73E8', '#D4E6FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          
          {/* Top Section with MASSIVE Circular Image Logo */}
          <Animated.View style={[styles.topSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/icon.png')} 
                style={styles.logo} 
              />
            </View>
            
            <Text style={styles.appName}>APSA</Text>
            <Text style={styles.tagline}>Find your perfect space.</Text>
          </Animated.View>

          {/* Bottom Section */}
          <Animated.View style={[styles.bottomSection, { opacity: fadeAnim }]}>
            
            <View style={styles.buttonCard}>
              
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleExplore}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Explore Now</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Log In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.tertiaryButton]}
                onPress={handleSignUp}
                activeOpacity={0.8}
              >
                <Text style={styles.tertiaryButtonText}>Create Account</Text>
              </TouchableOpacity>

            </View>

            <Text style={styles.footerText}>By continuing, you agree to our Terms & Privacy Policy</Text>
          </Animated.View>

        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  safeArea: { 
    flex: 1, 
    justifyContent: 'space-between', 
    paddingVertical: 20,
    paddingHorizontal: 0,
  },
  topSection: { 
    alignItems: 'center', 
    marginTop: height * 0.06,
  },
  // CIRCULAR CONTAINER IS NOW MUCH BIGGER
   logoContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,     // Forces it to be a perfect circle
    overflow: 'hidden',   // CRUCIAL: Cuts off any jagged edges so it's a perfect circle
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 24,
  },
  // THE ACTUAL IMAGE IS NOW MASSIVE
  logo: {
    width: 140,  // Increased massively from 95 to 140
    height: 140, // Increased massively from 95 to 140
    resizeMode: 'contain', 
  },
  appName: {
    fontSize: 64, // Reduced slightly so the big image and the text are balanced
    fontWeight: '800',
    color: '#003A75',
    letterSpacing: 2,
    marginBottom: 10,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    color: '#004080', 
    fontWeight: '400',
    letterSpacing: 1,
  },
  bottomSection: { 
    paddingHorizontal: 30, 
    paddingBottom: 40, 
  },
  buttonCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)', 
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 24,
  },
  button: {
    width: '100%',
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 14,
  },
  primaryButton: {
    backgroundColor: '#1A73E8',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB', 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    color: '#1A73E8',
    fontSize: 17,
    fontWeight: '600',
  },
  tertiaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2, 
    borderColor: '#1A73E8',
    marginBottom: 0, 
  },
  tertiaryButtonText: {
    color: '#1A73E8',
    fontSize: 17,
    fontWeight: '700',
  },
  footerText: {
    color: 'rgba(0, 0, 0, 0.4)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
  },
});