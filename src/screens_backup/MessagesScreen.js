// src/screens/MessagesScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../context/ThemeContext'; // ✅ Theme hook
import Text from '../components/AccessibleText';

// --- MOCK CHAT DATA (Demo Inbox) ---
const MOCK_CHATS = [
  {
    id: '1',
    name: 'Sarah Mwamba',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    lastMessage: 'Is the luxury apartment still available?',
    time: '10:23 AM',
    unread: true,
  },
  {
    id: '2',
    name: 'David Mulenga',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    lastMessage: 'I would like to book the property.',
    time: 'Yesterday',
    unread: false,
  },
  {
    id: '3',
    name: 'Grace Tembo',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    lastMessage: 'Thank you! I will let you know.',
    time: 'Yesterday',
    unread: false,
  },
  {
    id: '4',
    name: 'Peter Banda',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    lastMessage: 'When can I view the house?',
    time: '2 days ago',
    unread: true,
  },
];

export default function MessagesScreen({ navigation }) {
  const { colors, isDark } = useTheme(); // ✅ Get theme
  const { isLoggedIn } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  const styles = getStyles(colors); // ✅ Generate themed styles

  const navigateToLogin = () => {
    try {
      navigation.resetRoot({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (e) {
      const parent = navigation.getParent();
      if (parent) {
        parent.navigate('Login');
      } else {
        navigation.navigate('Login');
      }
    }
  };

  // 🔒 If not logged in, show login prompt
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <View style={styles.loginPrompt}>
          <Ionicons name="chatbubbles-outline" size={60} color={colors.secondaryText} />
          <Text style={styles.loginPromptText}>Log in to see your messages</Text>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={navigateToLogin}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => {
        navigation.navigate('ChatDetail', { chatId: item.id, userName: item.name });
      }}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.chatContent}>
        <View style={styles.topRow}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
          {item.unread && <View style={styles.unreadBadge} />}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity>
          <Ionicons name="create-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={colors.secondaryText} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          placeholderTextColor={colors.secondaryText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Chat List */}
      <FlatList
        data={MOCK_CHATS}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// ✅ Styles generated from theme colors
const getStyles = (colors) =>
  StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: colors.background 
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 10,
      paddingBottom: 10,
    },
    headerTitle: { 
      fontSize: 26, 
      fontWeight: '700', 
      color: colors.text 
    },

    // Search
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      marginHorizontal: 24,
      marginBottom: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchIcon: { marginRight: 12 },
    searchInput: { 
      flex: 1, 
      fontSize: 16, 
      color: colors.text 
    },

    // Chat list
    listContent: { paddingBottom: 40 },
    chatItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    avatar: { 
      width: 56, 
      height: 56, 
      borderRadius: 28, 
      backgroundColor: colors.inputBackground 
    },
    chatContent: { flex: 1, marginLeft: 16 },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    name: { 
      fontSize: 16, 
      fontWeight: '600', 
      color: colors.text 
    },
    time: { 
      fontSize: 12, 
      color: colors.secondaryText 
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    lastMessage: { 
      flex: 1, 
      fontSize: 14, 
      color: colors.secondaryText, 
      marginRight: 8 
    },
    unreadBadge: { 
      width: 8, 
      height: 8, 
      borderRadius: 4, 
      backgroundColor: colors.primary 
    },

    // Login prompt
    loginPrompt: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
      marginTop: -40,
    },
    loginPromptText: {
      fontSize: 18,
      color: colors.secondaryText,
      marginTop: 16,
      marginBottom: 24,
      textAlign: 'center',
    },
    loginButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 40,
      paddingVertical: 14,
      borderRadius: 12,
    },
    loginButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });