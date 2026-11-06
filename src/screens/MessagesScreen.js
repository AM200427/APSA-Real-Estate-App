// src/screens/MessagesScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import Text from '../components/AccessibleText';

export default function MessagesScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { showInfo, showSuccess } = useToast();
  
  const {
    user, // 🔥 Added this so the agent badge works
    isLoggedIn,
    conversations,
    messagesLoading,
    loadConversations,
    deleteConversation,
    archiveConversation,
    unarchiveConversation,
    markConversationRead,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Long Press Menu State
  const [selectedChat, setSelectedChat] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(false);

  // 🔥 Archive Modal State
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  const styles = getStyles(colors, isDark);

  useEffect(() => {
    if (isLoggedIn) loadConversations();
  }, [isLoggedIn, loadConversations]);

  // 🔥 Split conversations
  const activeChats = (conversations || []).filter(c => !c.isArchived);
  const archivedChats = (conversations || []).filter(c => c.isArchived);

  const filteredChats = activeChats.filter((chat) => {
    const q = searchQuery.toLowerCase();
    return (
      (chat.name || '').toLowerCase().includes(q) ||
      (chat.lastMessage || '').toLowerCase().includes(q)
    );
  });

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadConversations();
    } finally {
      setIsRefreshing(false);
    }
  }, [loadConversations]);

  const handleLongPress = (chat) => {
    setSelectedChat(chat);
    setShowActionMenu(true);
  };

  const handleAction = async (action) => {
    if (!selectedChat) return;
    setShowActionMenu(false);

    try {
      if (action === 'delete') {
        if (deleteConversation) await deleteConversation(selectedChat.id);
        showSuccess('Deleted', 'Conversation removed.');
      } 
      else if (action === 'archive') {
        if (selectedChat.isArchived) {
          if (unarchiveConversation) await unarchiveConversation(selectedChat.id);
          showInfo('Restored', 'Conversation moved to inbox.');
        } else {
          if (archiveConversation) await archiveConversation(selectedChat.id);
          showInfo('Archived', 'Conversation moved to archive.');
        }
      } 
      else if (action === 'read') {
        if (markConversationRead) await markConversationRead(selectedChat.id);
        showInfo('Marked as Read', 'No new messages.');
      }
    } catch (error) {
      console.log('Action error:', error);
    } finally {
      setSelectedChat(null);
    }
  };

  const navigateToLogin = () => {
    try {
      navigation.resetRoot({ index: 0, routes: [{ name: 'Login' }] });
    } catch (e) {
      const parent = navigation.getParent();
      if (parent) parent.navigate('Login');
      else navigation.navigate('Login');
    }
  };

  // Reusable Chat Row
  const renderChatItem = ({ item }) => {
    // 🛡️ Safe checks to prevent crashes
    const hasUnread = (item?.unreadCount || 0) > 0;
    const isAgent = user?.role?.toLowerCase() === 'agent'; 
    const isArchived = item?.isArchived || false;

    return (
      <TouchableOpacity
        style={[styles.chatItem, hasUnread && styles.chatItemUnread]}
        onPress={() => {
          if (showArchiveModal) setShowArchiveModal(false); // Close modal if navigating
          navigation.navigate('ChatDetail', { 
            chatId: item.id, 
            userName: item.name,
            propertyTitle: item.propertyTitle 
          });
        }}
        onLongPress={() => handleLongPress(item)}
        delayLongPress={300}
        activeOpacity={0.7}
      >
        <View style={styles.avatarWrap}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarFallbackText}>
                {(item.name || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {item.isOnline && !isArchived && <View style={styles.onlineDot} />}
        </View>

        <View style={styles.chatContent}>
          
          {/* 🔥 THE LEAD BADGE */}
          {isAgent && item.propertyTitle && (
            <View style={styles.leadBadge}>
              <Ionicons name="home" size={10} color="#FFF" />
              <Text style={styles.leadBadgeText} numberOfLines={1}>
                {item.propertyTitle}
              </Text>
            </View>
          )}

          <View style={styles.topRow}>
            <Text style={[styles.name, hasUnread && !isArchived && styles.nameUnread]} numberOfLines={1}>
              {item.name}
            </Text>
            {item.time ? (
              <Text style={[styles.time, hasUnread && !isArchived && styles.timeUnread]}>
                {item.time}
              </Text>
            ) : null}
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.messagePreview}>
  <Text style={[styles.lastMessage, hasUnread && !isArchived && styles.lastMessageUnread]} numberOfLines={1}>
    {(() => {
      const msg = item.lastMessage || '';
      // Check if the message looks like an image URL or data string
      const isImage = 
        msg.startsWith('data:image') || 
        msg.startsWith('file://') || 
        msg.match(/\.(jpeg|jpg|gif|png)$/i) ||
        msg.includes('/uploads/'); // For your backend uploaded images

      if (isImage) return '📷 1 image sent';
      return msg || 'Start a conversation';
    })()}
  </Text>
</View>

            {hasUnread && !isArchived && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{item.unreadCount > 9 ? '9+' : item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}><Text style={styles.headerTitle}>Messages</Text></View>
        <View style={styles.loginPrompt}>
          <View style={styles.loginPromptIconWrap}><Ionicons name="chatbubbles-outline" size={48} color={colors.primary} /></View>
          <Text style={styles.loginPromptTitle}>Your messages</Text>
          <Text style={styles.loginPromptText}>Log in to chat with hosts and manage your conversations</Text>
          <TouchableOpacity style={styles.loginButton} onPress={navigateToLogin}><Text style={styles.loginButtonText}>Log In</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}><Text style={styles.headerTitle}>Messages</Text></View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={colors.secondaryText} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor={colors.secondaryText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
        )}
      </View>

      {/* 🔥 ARCHIVED WIDGET */}
      {archivedChats.length > 0 && (
        <TouchableOpacity 
          style={styles.archiveWidget} 
          onPress={() => setShowArchiveModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.archiveWidgetLeft}>
            <Ionicons name="archive" size={20} color={colors.primary} />
            <Text style={styles.archiveWidgetText}>Archived</Text>
          </View>
          <View style={styles.archiveWidgetRight}>
            <Text style={styles.archiveCountText}>{archivedChats.length}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.secondaryText} />
          </View>
        </TouchableOpacity>
      )}

      {/* Active Chat List */}
      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={[styles.listContent, filteredChats.length === 0 && { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name={searchQuery ? "search-outline" : "chatbubble-ellipses-outline"} size={40} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>{searchQuery ? 'No matches found' : 'No messages yet'}</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? `Nothing matches "${searchQuery}"` : 'When you contact a host, conversations will appear here.'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('Home')}>
                <Ionicons name="search" size={20} color="#FFFFFF" />
                <Text style={styles.ctaButtonText}>Find Properties</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      />

      {/* 🔥 LONG PRESS ACTION MENU */}
      <Modal visible={showActionMenu} transparent animationType="fade" onRequestClose={() => setShowActionMenu(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowActionMenu(false)}>
          <View style={styles.actionMenuContainer}>
            <View style={styles.actionMenuHandle} />
            <Text style={styles.actionMenuTitle} numberOfLines={1}>{selectedChat?.name}</Text>

            <TouchableOpacity style={styles.actionItem} onPress={() => handleAction('read')}>
              <Ionicons name="mail-open-outline" size={22} color={colors.text} />
              <Text style={styles.actionText}>Mark as Read</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => handleAction('archive')}>
              <Ionicons name={selectedChat?.isArchived ? "arrow-undo-outline" : "archive-outline"} size={22} color={colors.text} />
              <Text style={styles.actionText}>{selectedChat?.isArchived ? 'Unarchive' : 'Archive Chat'}</Text>
            </TouchableOpacity>

            <View style={styles.divider} />
            <TouchableOpacity style={styles.actionItem} onPress={() => handleAction('delete')}>
              <Ionicons name="trash-outline" size={22} color="#FF3B30" />
              <Text style={[styles.actionText, { color: '#FF3B30' }]}>Delete Chat</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 🔥 ARCHIVE VIEW MODAL */}
      <Modal visible={showArchiveModal} animationType="slide" onRequestClose={() => setShowArchiveModal(false)}>
        <SafeAreaView style={styles.container}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowArchiveModal(false)} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Archived</Text>
            <View style={{ width: 40 }} />
          </View>
          
          <FlatList
            data={archivedChats}
            keyExtractor={(item) => item.id}
            renderItem={renderChatItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Ionicons name="archive-outline" size={48} color={colors.secondaryText} />
                <Text style={styles.emptyTitle}>No archived chats</Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
    
    searchContainer: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
      marginHorizontal: 24, marginTop: 8, marginBottom: 12, paddingHorizontal: 14, paddingVertical: 10,
      borderRadius: 14, borderWidth: 1, borderColor: colors.border,
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: 0 },
    clearButton: { padding: 2 },

    // 🔥 Archive Widget Styles
    archiveWidget: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: colors.card, marginHorizontal: 24, marginBottom: 16, paddingHorizontal: 16,
      paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border,
    },
    archiveWidgetLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    archiveWidgetText: { fontSize: 16, fontWeight: '600', color: colors.text },
    archiveWidgetRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    archiveCountText: { fontSize: 14, fontWeight: '700', color: colors.secondaryText },

    listContent: { paddingBottom: 40 },
    
    // Chat List
    chatItem: {
      flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24,
      paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
    },
    chatItemUnread: { backgroundColor: isDark ? 'rgba(10, 132, 255, 0.06)' : 'rgba(0, 122, 255, 0.04)' },
    avatarWrap: { position: 'relative' },
    avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.inputBackground },
    avatarFallback: { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary },
    avatarFallbackText: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
    onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: '#34C759', borderWidth: 2.5, borderColor: colors.background },
    chatContent: { flex: 1, marginLeft: 14 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    name: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.text, marginRight: 8 },
    nameUnread: { fontWeight: '800' },
    time: { fontSize: 12, color: colors.secondaryText, fontWeight: '500' },
    timeUnread: { color: colors.primary, fontWeight: '700' },
    bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    messagePreview: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 8 },
    previewIcon: { marginRight: 4 },
    lastMessage: { flex: 1, fontSize: 14, color: colors.secondaryText, fontWeight: '400' },
    lastMessageUnread: { color: colors.text, fontWeight: '600' },
    unreadBadge: { minWidth: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
    unreadBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },

    // Empty State & CTA
    emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingTop: 60 },
    emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: isDark ? '#0A2A50' : '#F0F7FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 6 },
    emptySubtitle: { fontSize: 14, color: colors.secondaryText, textAlign: 'center', lineHeight: 20, marginTop: 8 },
    ctaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, marginTop: 24 },
    ctaButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

    // Login Prompt
    loginPrompt: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, marginTop: -40 },
    loginPromptIconWrap: { width: 96, height: 96, borderRadius: 48, backgroundColor: isDark ? '#0A2A50' : '#F0F7FF', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    loginPromptTitle: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 8 },
    loginPromptText: { fontSize: 15, color: colors.secondaryText, marginBottom: 24, textAlign: 'center', lineHeight: 22 },
    loginButton: { backgroundColor: colors.primary, paddingHorizontal: 44, paddingVertical: 14, borderRadius: 14 },
    loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

    // Modal styles (Action Menu)
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    actionMenuContainer: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12 },
    actionMenuHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 16 },
    actionMenuTitle: { fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 20 },
    actionItem: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16, paddingHorizontal: 8 },
    actionText: { fontSize: 16, fontWeight: '500', color: colors.text },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },

    // Modal styles (Archive Screen)
    modalHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 0.5, borderBottomColor: colors.border,
    },
    backButton: { padding: 4 },
    modalHeaderTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
    
    // 🔥 Lead Badge Styles
    leadBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      alignSelf: 'flex-start',
      marginBottom: 4,
      gap: 4,
      maxWidth: '90%',
    },
    leadBadgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
    },
  });