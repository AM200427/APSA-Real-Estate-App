// src/screens/ChatDetailScreen.js
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  Keyboard,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useAppStore } from '../../store/useAppStore';
import ProfileModal from '../components/ProfileModal';

// ---------- ALL EMOJIS ----------
const ALL_EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😂', '🤣', '😊', '😍', '🥰',
  '😘', '😗', '😙', '😚', '☺️', '🙂', '🤗', '🤩', '🤔', '🤨',
  '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯',
  '😪', '😫', '😴', '😌', '😛', '😜', '😝', '🤤', '😒', '😓',
  '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖', '😞', '😟',
  '😤', '😢', '😭', '😦', '😧', '😨', '😩', '🤯', '😬', '😰',
  '😱', '🥵', '🥶', '😳', '🤪', '😵', '😡', '😠', '🤬', '😷',
  '🤒', '🤕', '🤢', '🤮', '🤧', '🥴', '🥺', '🤠', '🥳', '🤡',
  '💯', '💢', '💥', '💫', '💦', '💨', '❤️', '🧡', '💛', '💚',
  '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '💕', '💞', '💓',
  '👋', '🤚', '✋', '🖐️', '🖖', '👌', '🤌', '🤏', '✌️', '🤞',
  '🤟', '🤘', '👈', '👉', '👆', '👇', '☝️', '👍', '👎', '✊',
  '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️',
  '💪', '🦾', '🦵', '🦶', '👂', '👃', '🧠', '🦷', '🦴', '👀',
  '👁️', '👅', '👄', '👶', '🧒', '👦', '👧', '🧑', '👨', '👩',
  '🧔', '👮', '👷', '💂', '💃', '🕺', '🧍', '🧎', '🏃', '👯',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐸', '🐵', '🐒', '🐔', '🐧', '🐦', '🐤',
  '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛',
  '🦋', '🐌', '🐞', '🐜', '🕷️', '🦂', '🐢', '🐍', '🦎', '🐙',
  '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋',
  '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🐘', '🦏', '🐪', '🐫',
  '🦒', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🐐', '🦌',
  '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑',
  '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🌽',
  '🥕', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🍜', '🍝',
  '🍣', '🍤', '🍦', '🍩', '🍪', '🎂', '🍰', '🍫', '🍬', '🍭',
  '☕', '🍵', '🥤', '🧋', '🍺', '🍻', '🍷', '🥂', '🥃', '🍸',
  '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸',
  '🥊', '🎯', '🎮', '🎲', '🎰', '🎸', '🎹', '🎤', '🎧', '🎬',
  '📱', '💻', '⌚', '📷', '🎥', '📺', '📻', '💡', '🔑', '🔒',
  '💎', '💰', '💸', '💳', '📦', '📫', '📮', '✉️', '📝', '📌',
  '✂️', '🔨', '🛠️', '⚙️', '🔧', '🔩', '🔬', '🔭', '🧪', '🧬',
  '💊', '💉', '🌡️', '🩺', '🚑', '🚒', '🚓', '🚔', '🚕', '🚗',
  '🚙', '🚌', '🚎', '🏎️', '🚐', '🚚', '🚛',
  '✈️', '🚀', '🛸', '🚁', '⛵', '🚤', '🛥️', '🚢', '🏠', '🏡',
  '🏢', '🏥', '🏦', '🏨', '🏫', '🏭', '🏰', '⛪', '🕌', '🗼',
  '🌍', '🌎', '🌏', '🌕', '🌙', '⭐', '🌟', '✨', '⚡', '🔥',
  '💧', '🌊', '🌈', '☀️', '⛅', '☁️', '🌧️', '⛈️', '🌨️', '❄️',
  '🌹', '🌸', '🌺', '🌻', '🌷', '🌼', '🍀', '🍁', '🍂', '🍃',
  '🎉', '🎊', '🎁', '🎈', '🎄', '🎃', '🎆', '🎇', '🎐',
  '✅', '❌', '❓', '❗', '⚠️', '🚫', '♻️', '🔴', '🟠',
  '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🔔', '🔕', '📢', '📣',
];

export default function ChatDetailScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
    const { userName = 'Client', chatId, propertyTitle } = route.params || {};
  const { showSuccess, showInfo, showWarning } = useToast();

  const {
    messages,
    sendMessage: sendMessageToStore,
    loadMessages,
    markConversationRead,
    clearChat,
    conversations,
    user,
  } = useAppStore();

  const styles = getStyles(colors, isDark);

  const chatMessages = useMemo(
    () => messages?.[chatId] || [],
    [messages, chatId]
  );

  const conversationMeta = useMemo(
    () => conversations?.find((c) => c.id === chatId),
    [conversations, chatId]
  );

  const displayName = userName || conversationMeta?.name || 'Chat';

  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);
  const searchInputRef = useRef(null);

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const [isAttachmentRowVisible, setIsAttachmentRowVisible] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState('');
  const [recentEmojis, setRecentEmojis] = useState([
    '😀', '😂', '😊', '❤️', '👍', '🔥', '😍', '😘', '🥰', '💯',
  ]);

  const [isBlocked, setIsBlocked] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [confirmState, setConfirmState] = useState(null);

  const AVATAR_URI =
    conversationMeta?.avatar || 'https://i.pravatar.cc/150?img=1';
  const CONTACT_KEY = chatId || `user_${userName}`;
  const CONTACT_PHONE = '+260971234567';

  // Load messages on mount + mark read
  useEffect(() => {
    if (chatId) {
      loadMessages(chatId);
      markConversationRead(chatId);
    }
  }, [chatId]);

  // Load moderation state
  useEffect(() => {
    (async () => {
      try {
        const [blocked, reported, muted] = await Promise.all([
          AsyncStorage.getItem(`blocked:${CONTACT_KEY}`),
          AsyncStorage.getItem(`reported:${CONTACT_KEY}`),
          AsyncStorage.getItem(`muted:${CONTACT_KEY}`),
        ]);
        setIsBlocked(blocked === '1');
        setHasReported(reported === '1');
        setIsMuted(muted === '1');
      } catch (e) {
        console.log('Failed to load moderation state:', e);
      }
    })();
  }, [CONTACT_KEY]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (chatMessages.length > 0 && !isSearchMode) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages, isSearchMode]);

  const displayedMessages =
    isSearchMode && searchQuery.trim().length > 0
      ? chatMessages.filter((m) =>
          m.text.toLowerCase().includes(searchQuery.trim().toLowerCase())
        )
      : chatMessages;

  const searchResultCount = isSearchMode
    ? searchQuery.trim().length > 0
      ? displayedMessages.length
      : chatMessages.length
    : 0;

  const closeConfirm = () => setConfirmState(null);

  // --- SEND ---
  const handleSend = async () => {
    if (isBlocked) return;
    if (inputText.trim().length === 0) return;

    const text = inputText;
    setInputText('');

    try {
      await sendMessageToStore(chatId, text);
    } catch (e) {
      console.log('sendMessage failed:', e);
      showWarning('Message not sent', 'Could not save your message.', 2500);
    }
  };

  // --- HEADER / DROPDOWN ---
  const toggleDropdown = () => setIsDropdownVisible(!isDropdownVisible);
  const closeDropdown = () => setIsDropdownVisible(false);
  const openProfile = () => {
    closeDropdown();
    setIsProfileModalVisible(true);
  };

  // --- CALL ---
  const handleCall = () => {
    if (isBlocked) {
      showWarning('User blocked', 'Unblock to call this user.', 3000);
      return;
    }
    setConfirmState({
      icon: 'call',
      iconColor: colors.primary,
      iconBg: isDark ? '#0A2A50' : '#E8F0FE',
      title: `Call ${displayName}?`,
      message: `Start a voice call at ${CONTACT_PHONE}? This will open your phone's dialer.`,
      confirmLabel: 'Call',
      confirmColor: colors.primary,
      onConfirm: async () => {
        closeConfirm();
        const url = `tel:${CONTACT_PHONE}`;
        try {
          const supported = await Linking.canOpenURL(url);
          if (supported) {
            await Linking.openURL(url);
          } else {
            showWarning('Unable to call', 'Calling is not available on this device.', 3000);
          }
        } catch (e) {
          console.log('Call error:', e);
          showWarning('Unable to call', 'Something went wrong opening the dialer.', 3000);
        }
      },
    });
  };

  // --- MUTE ---
  const handleMuteToggle = async () => {
    closeDropdown();
    const newState = !isMuted;
    setIsMuted(newState);
    try {
      if (newState) {
        await AsyncStorage.setItem(`muted:${CONTACT_KEY}`, '1');
        showInfo('Muted', `Notifications from ${displayName} are off.`, 3000);
      } else {
        await AsyncStorage.removeItem(`muted:${CONTACT_KEY}`);
        showSuccess('Unmuted', `Notifications from ${displayName} are back on.`, 3000);
      }
    } catch (e) {
      console.log('Mute toggle save failed:', e);
    }
  };

  // --- SEARCH ---
  const openSearch = () => {
    closeDropdown();
    setIsSearchMode(true);
    setSearchQuery('');
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const closeSearch = () => {
    setIsSearchMode(false);
    setSearchQuery('');
    Keyboard.dismiss();
  };

  const clearSearchQuery = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  // --- MODERATION ---
  const handleReport = () => {
    if (hasReported) return;
    setIsProfileModalVisible(false);
    setConfirmState({
      icon: 'flag-outline',
      iconColor: '#FF9500',
      iconBg: isDark ? '#2A2010' : '#FFF4E5',
      title: 'Report user?',
      message: `Report ${displayName} for inappropriate behavior? Our team will review this report.`,
      confirmLabel: 'Report',
      confirmColor: '#FF9500',
      onConfirm: async () => {
        closeConfirm();
        setHasReported(true);
        try {
          await AsyncStorage.setItem(`reported:${CONTACT_KEY}`, '1');
        } catch (e) {
          console.log('Failed to save report:', e);
        }
        showSuccess('Report submitted', 'Thanks — our team will review this.', 3000);
      },
    });
  };

  const handleBlock = () => {
    setIsProfileModalVisible(false);
    setConfirmState({
      icon: 'ban-outline',
      iconColor: '#FF3B30',
      iconBg: isDark ? '#2A1010' : '#FFEBEB',
      title: 'Block user?',
      message: `${displayName} won't be able to message or call you. You can unblock them anytime.`,
      confirmLabel: 'Block',
      confirmColor: '#FF3B30',
      onConfirm: async () => {
        closeConfirm();
        setIsBlocked(true);
        try {
          await AsyncStorage.setItem(`blocked:${CONTACT_KEY}`, '1');
        } catch (e) {
          console.log('Failed to save block:', e);
        }
        showInfo('User blocked', `${displayName} has been blocked.`, 3000);
      },
    });
  };

  const handleUnblock = () => {
    setIsProfileModalVisible(false);
    setConfirmState({
      icon: 'lock-open-outline',
      iconColor: colors.primary,
      iconBg: isDark ? '#0A2A50' : '#E8F0FE',
      title: 'Unblock user?',
      message: `Allow ${displayName} to message and call you again?`,
      confirmLabel: 'Unblock',
      confirmColor: colors.primary,
      onConfirm: async () => {
        closeConfirm();
        setIsBlocked(false);
        try {
          await AsyncStorage.removeItem(`blocked:${CONTACT_KEY}`);
        } catch (e) {
          console.log('Failed to unblock:', e);
        }
        showSuccess('Unblocked', `${displayName} can message you again.`, 3000);
      },
    });
  };

  const handleClearChat = () => {
    closeDropdown();
    setConfirmState({
      icon: 'trash-outline',
      iconColor: '#FF3B30',
      iconBg: isDark ? '#2A1010' : '#FFEBEB',
      title: 'Clear chat?',
      message:
        'All messages in this conversation will be permanently removed. This cannot be undone.',
      confirmLabel: 'Clear',
      confirmColor: '#FF3B30',
      onConfirm: () => {
        closeConfirm();
        clearChat(chatId);
        showInfo('Chat cleared', 'All messages have been removed.', 3000);
      },
    });
  };

  // --- EMOJI ---
  const toggleEmojiPicker = () => {
    if (isAttachmentRowVisible) setIsAttachmentRowVisible(false);
    if (isEmojiPickerVisible) {
      setIsEmojiPickerVisible(false);
      setEmojiSearch('');
    } else {
      Keyboard.dismiss();
      setIsEmojiPickerVisible(true);
      setEmojiSearch('');
    }
  };

  const handleEmojiSelect = (emoji) => {
    setInputText((prev) => prev + emoji);
    setRecentEmojis((prev) => {
      const filtered = prev.filter((e) => e !== emoji);
      return [emoji, ...filtered].slice(0, 20);
    });
  };

  const closeEmojiPicker = () => {
    setIsEmojiPickerVisible(false);
    setEmojiSearch('');
  };

  // --- ATTACHMENTS ---
  const toggleAttachmentRow = () => {
    if (isEmojiPickerVisible) setIsEmojiPickerVisible(false);
    setIsAttachmentRowVisible((v) => !v);
  };

    const sendImageMessage = async (pickerResult) => {
    try {
      // If the user cancelled, just stop
      if (pickerResult.canceled) return;

      // Make sure we actually have an image file
      if (!pickerResult.assets || pickerResult.assets.length === 0) {
        showWarning('No image', 'Could not find the selected image.');
        return;
      }

      const imageUri = pickerResult.assets[0].uri;
      console.log('📸 Sending image URI:', imageUri);

      // Send the message to the store (we are prepending an emoji so it's visible)
      await sendMessageToStore(chatId, `📸 [Image] ${imageUri}`);
      
      showSuccess('Image sent', 'Your photo was added to the chat.', 2000);
    } catch (error) {
      console.log('🔥 sendImageMessage failed:', error);
      showWarning('Upload failed', 'Could not send the image.');
    }
  };

    const handleGalleryPress = async () => {
    setIsAttachmentRowVisible(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showWarning('Permission needed', 'Please allow access to your gallery.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,      // 🔥 Changed to false
        quality: 0.5,              // 🔥 Lower quality
        exif: false,               // 🔥 Don't read EXIF
        base64: false,             // 🔥 Don't load as base64
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        await sendImageMessage(result);
      }
    } catch (error) {
      console.log('Gallery error:', error);
    }
  };

    const handleCameraPress = async () => {
    setIsAttachmentRowVisible(false);
    console.log('📸 1. Camera button pressed');

    try {
      // 1. Check permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      console.log('📸 2. Permission status:', status);

      if (status !== 'granted') {
        showWarning('Permission needed', 'Please allow access to your camera.');
        return;
      }

      // 2. Launch camera with safer options
      console.log('📸 3. Launching camera...');
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,     // 🔥 Disable editing first (saves memory)
        quality: 0.5,             // 🔥 Lower quality (smaller file = less memory)
        exif: false,              // 🔥 Don't read EXIF data (prevent crashes on some Android phones)
        base64: false,            // 🔥 Make sure we don't load it as base64
      });

      console.log('📸 4. Camera result:', JSON.stringify(result));

      // 3. Check if the result is valid before sending
      if (result.canceled === true) {
        console.log('📸 User cancelled the camera.');
        return;
      }

      if (!result.assets || result.assets.length === 0) {
        console.log('📸 Camera returned no assets.');
        showWarning('Camera issue', 'No image was captured.');
        return;
      }

      console.log('📸 5. Sending image message...');
      await sendImageMessage(result);
      console.log('📸 6. Image message sent successfully.');
    } catch (error) {
      console.log('🔥 Camera error:', error);
      showWarning('Camera Error', 'Something went wrong opening the camera.');
    }
  };

  // 🔥 --- RENDER MESSAGE (iMessage / WhatsApp Style) ---
   const renderMessage = ({ item, index }) => {
    const isMe = item.sender === 'me';
    const prev = displayedMessages[index - 1];
    const next = displayedMessages[index + 1];

    const isFirstInGroup = isSearchMode || !prev || prev.sender !== item.sender;
    const isLastInGroup = isSearchMode || !next || next.sender !== item.sender;
    const showDateSeparator =
      !isSearchMode && (!prev || prev.date !== item.date);

    // The magic: sharp corner on the bottom right/left to create the "tail"
    const meRadius = {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: isLastInGroup ? 4 : 20, 
    };
    const themRadius = {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderBottomLeftRadius: isLastInGroup ? 4 : 20,
      borderBottomRightRadius: 20,
    };

    // 🔥 Check if this is an image message
    const isImage = item.text.startsWith('📸 [Image] ');
    const imageUri = isImage ? item.text.replace('📸 [Image] ', '') : null;

    return (
      <View>
        {showDateSeparator && (
          <View style={styles.dateSeparatorWrap}>
            <View style={styles.dateSeparator}>
              <Text style={styles.dateSeparatorText}>{item.date}</Text>
            </View>
          </View>
        )}

        <View
          style={[
            styles.messageRow,
            isMe ? styles.myMessageRow : styles.theirMessageRow,
            isFirstInGroup && styles.firstInGroup,
          ]}
        >
          {!isMe && (
            <View style={styles.avatarContainer}>
              {isLastInGroup ? (
                <Image source={{ uri: AVATAR_URI }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder} />
              )}
            </View>
          )}

          <View
            style={[
              styles.messageBubble,
              isMe ? [styles.myBubble, meRadius] : [styles.theirBubble, themRadius],
              // 🔥 If it's an image, remove padding so the image fills the bubble
              isImage && { padding: 0, overflow: 'hidden' }
            ]}
          >
            {/* 🔥 CONDITIONALLY RENDER IMAGE OR TEXT */}
            {isImage ? (
              <Image 
                source={{ uri: imageUri }} 
                style={{ 
                  width: 220, 
                  height: 220, 
                  backgroundColor: '#000',
                  borderRadius: 16
                }} 
                resizeMode="cover"
              />
            ) : (
              <Text
                style={[
                  styles.messageText, 
                  isMe ? styles.myText : styles.theirText,
                  // If there's a tail, add bottom padding
                  !isLastInGroup && { marginBottom: 0 }
                ]}
              >
                {item.text}
              </Text>
            )}

            {isLastInGroup && (
              <View style={[
                styles.metaRow, 
                // 🔥 If it's an image, add a small overlay background for the time
                isImage && { 
                  position: 'absolute', 
                  bottom: 6, 
                  right: 8, 
                  backgroundColor: 'rgba(0,0,0,0.5)', 
                  paddingHorizontal: 6, 
                  paddingVertical: 2, 
                  borderRadius: 8 
                }
              ]}>
                <Text
                  style={[
                    styles.timeText, 
                    isMe ? styles.myTime : styles.theirTime,
                    isImage && { color: '#FFFFFF' } // White text on dark overlay
                  ]}
                >
                  {item.time}
                </Text>
                {isMe && (
                  <Ionicons
                    name={item.seen ? 'checkmark-done' : 'checkmark'}
                    size={14}
                    color={item.seen ? '#7DD3FC' : '#FFFFFF'}
                    style={styles.receiptIcon}
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  // --- ATTACHMENT ROW ---
  const renderAttachmentRow = () => {
    const attachments = [
      { icon: 'images-outline', label: 'Gallery', onPress: handleGalleryPress, color: '#1A73E8' },
      { icon: 'camera-outline', label: 'Camera', onPress: handleCameraPress, color: '#FD7E14' },
      { icon: 'location-outline', label: 'Location', onPress: () => comingSoon('Location'), color: '#28A745' },
      { icon: 'document-text-outline', label: 'Document', onPress: () => comingSoon('Document'), color: '#8B5CF6' },
      { icon: 'person-outline', label: 'Contact', onPress: () => comingSoon('Contact'), color: '#E91E63' },
      { icon: 'stats-chart-outline', label: 'Poll', onPress: () => comingSoon('Poll'), color: '#FF6B35' },
      { icon: 'calendar-outline', label: 'Event', onPress: () => comingSoon('Event'), color: '#9C27B0' },
    ];

    return (
      <View style={styles.pickerRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.attachmentRowContent}
          keyboardShouldPersistTaps="handled"
        >
          {attachments.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              style={styles.attachmentItem}
            >
              <View
                style={[
                  styles.attachmentIconCircle,
                  { backgroundColor: item.color + '18' },
                ]}
              >
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <Text style={styles.attachmentLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // --- EMOJI PICKER ---
  const renderEmojiPicker = () => {
    const allEmojisWithRecent = [...recentEmojis, ...ALL_EMOJIS];
    const uniqueEmojis = Array.from(new Set(allEmojisWithRecent));
    const filteredEmojis = uniqueEmojis.filter(
      (e) => emojiSearch === '' || e.includes(emojiSearch)
    );

    return (
      <View style={styles.emojiPickerContainer}>
        <View style={styles.emojiPickerHeader}>
          <Text style={styles.emojiPickerTitle}>Emojis</Text>
          <TouchableOpacity
            onPress={closeEmojiPicker}
            style={styles.emojiPickerClose}
          >
            <Ionicons name="close" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.emojiSearchInput}
          placeholder="Search..."
          placeholderTextColor={colors.secondaryText}
          value={emojiSearch}
          onChangeText={setEmojiSearch}
        />

        <FlatList
          data={filteredEmojis}
          numColumns={8}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.emojiItemGrid}
              onPress={() => handleEmojiSelect(item)}
              activeOpacity={0.6}
            >
              <Text style={styles.emojiTextGrid}>{item}</Text>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.emojiSectionContent}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    );
  };

  // --- SEARCH HEADER ---
  const renderSearchHeader = () => (
    <View style={styles.searchHeaderWrap}>
      <View style={styles.searchHeader}>
        <TouchableOpacity onPress={closeSearch} style={styles.searchBackBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.searchInputWrap}>
          <Ionicons name="search" size={16} color={colors.secondaryText} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search messages..."
            placeholderTextColor={colors.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearchQuery} hitSlop={8}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.secondaryText}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.searchResultText}>
        {searchQuery.trim().length === 0
          ? `${chatMessages.length} messages`
          : `${searchResultCount} ${searchResultCount === 1 ? 'result' : 'results'}`}
      </Text>
    </View>
  );

  // --- CONFIRM SHEET ---
  const renderConfirmSheet = () => {
    if (!confirmState) return null;
    const c = confirmState;

    return (
      <Modal visible transparent animationType="fade" onRequestClose={closeConfirm}>
        <TouchableOpacity
          style={styles.confirmOverlay}
          activeOpacity={1}
          onPress={closeConfirm}
        >
          <TouchableOpacity activeOpacity={1} style={styles.confirmCard}>
            <View style={[styles.confirmIconWrap, { backgroundColor: c.iconBg }]}>
              <Ionicons name={c.icon} size={28} color={c.iconColor} />
            </View>

            <Text style={styles.confirmTitle}>{c.title}</Text>
            <Text style={styles.confirmMessage}>{c.message}</Text>

            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={closeConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmActionBtn,
                  { backgroundColor: c.confirmColor },
                ]}
                onPress={c.onConfirm}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmActionText}>{c.confirmLabel}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  // --- PROFILE MODAL ---
  const renderProfileModal = () => (
    <ProfileModal
      visible={isProfileModalVisible}
      onClose={() => setIsProfileModalVisible(false)}
      profile={{
        name: displayName,
        avatar: AVATAR_URI,
        role: 'Agent',
        verified: true,
        bio: 'Property specialist with over 8 years of experience in Lusaka. I help clients find their perfect home — from luxury apartments to family houses.',
        location: 'Lusaka, Zambia',
        phone: CONTACT_PHONE,
        email: 'contact@apsa.zm',
        memberSince: 'Mar 2023',
        responseTime: '< 1 hr',
        listings: 24,
        rating: 4.9,
        reviewsCount: 47,
        sharedMedia: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200',
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=200',
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=200',
        ],
      }}
      isMuted={isMuted}
      isBlocked={isBlocked}
      hasReported={hasReported}
      onCall={() => {
        setIsProfileModalVisible(false);
        handleCall();
      }}
      onMessage={() => setIsProfileModalVisible(false)}
      onMuteToggle={() => {
        setIsProfileModalVisible(false);
        handleMuteToggle();
      }}
      onReport={handleReport}
      onBlockToggle={isBlocked ? handleUnblock : handleBlock}
    />
  );

  // --- MAIN RENDER ---
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {isSearchMode ? (
          renderSearchHeader()
        ) : (
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={26} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity onPress={openProfile} activeOpacity={0.7}>
              <Image source={{ uri: AVATAR_URI }} style={styles.headerAvatar} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerInfo}
              onPress={openProfile}
              activeOpacity={0.7}
            >
              <View style={styles.headerNameRow}>
                <Text style={styles.headerName} numberOfLines={1}>
                  {displayName}
                </Text>
                {isMuted && (
                  <Ionicons
                    name="notifications-off"
                    size={14}
                    color={colors.secondaryText}
                    style={styles.mutedIcon}
                  />
                )}
              </View>
                            <View style={styles.headerStatusRow}>
                {propertyTitle ? (
                  <>
                    <Ionicons name="home" size={12} color={colors.primary} />
                    <Text style={[styles.headerStatus, { color: colors.primary, marginLeft: 4 }]} numberOfLines={1}>
                      {propertyTitle}
                    </Text>
                  </>
                ) : (
                  <>
                    <View
                      style={[
                        styles.onlineDot,
                        isBlocked && { backgroundColor: '#FF3B30' },
                      ]}
                    />
                    <Text
                      style={[
                        styles.headerStatus,
                        isBlocked && { color: '#FF3B30' },
                      ]}
                    >
                      {isBlocked ? 'Blocked' : 'Online'}
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.rightHeaderActions}>
              <TouchableOpacity style={styles.iconButton} onPress={handleCall}>
                <Ionicons name="call-outline" size={22} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={toggleDropdown}
              >
                <Ionicons
                  name="ellipsis-vertical"
                  size={22}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isDropdownVisible && (
          <TouchableOpacity
            activeOpacity={1}
            onPress={closeDropdown}
            style={styles.dropdownOverlay}
          >
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={handleMuteToggle}
              >
                <Ionicons
                  name={
                    isMuted
                      ? 'notifications-outline'
                      : 'notifications-off-outline'
                  }
                  size={20}
                  color={colors.text}
                />
                <Text style={styles.dropdownText}>
                  {isMuted ? 'Unmute' : 'Mute'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.dropdownItem} onPress={openSearch}>
                <Ionicons name="search-outline" size={20} color={colors.text} />
                <Text style={styles.dropdownText}>Search</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.dropdownItem} onPress={openProfile}>
                <Ionicons name="person-outline" size={20} color={colors.text} />
                <Text style={styles.dropdownText}>Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={handleClearChat}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                <Text style={[styles.dropdownText, { color: '#FF3B30' }]}>
                  Clear Chat
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

        <FlatList
          ref={flatListRef}
          data={displayedMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={
            displayedMessages.length === 0
              ? styles.messagesListEmpty
              : styles.messagesList
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            isSearchMode ? (
              <View style={styles.emptySearch}>
                <View style={styles.emptySearchIconWrap}>
                  <Ionicons
                    name="search-outline"
                    size={40}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.emptySearchTitle}>
                  {searchQuery.trim().length === 0
                    ? 'Search this conversation'
                    : 'No messages found'}
                </Text>
                <Text style={styles.emptySearchSubtitle}>
                  {searchQuery.trim().length === 0
                    ? 'Type to find messages by keyword'
                    : `Nothing matches "${searchQuery}"`}
                </Text>
              </View>
            ) : (
              <View style={styles.emptyChat}>
                <View style={styles.emptyChatIconWrap}>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={40}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.emptyChatTitle}>Start the conversation</Text>
                <Text style={styles.emptyChatSubtitle}>
                  Send a message to {displayName}. They'll be notified right away.
                </Text>
              </View>
            )
          }
        />

        {isAttachmentRowVisible && !isBlocked && renderAttachmentRow()}

        {isBlocked ? (
          <View style={styles.blockedBanner}>
            <Ionicons name="ban" size={16} color="#FF3B30" />
            <Text style={styles.blockedBannerText}>
              You blocked {displayName}
            </Text>
            <TouchableOpacity onPress={handleUnblock} hitSlop={8}>
              <Text style={styles.blockedBannerAction}>Unblock</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.inputIcon}
              onPress={toggleEmojiPicker}
            >
              <Ionicons
                name="happy-outline"
                size={24}
                color={colors.secondaryText}
              />
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              placeholder="Message"
              placeholderTextColor={colors.secondaryText}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />

            <TouchableOpacity
              style={styles.inputIcon}
              onPress={toggleAttachmentRow}
            >
              <Ionicons name="attach" size={24} color={colors.secondaryText} />
            </TouchableOpacity>

            {inputText.trim().length > 0 ? (
              <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.sendButtonMuted}
                onPress={handleCameraPress}
              >
                <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {isEmojiPickerVisible && !isBlocked && renderEmojiPicker()}

        {renderProfileModal()}
        {renderConfirmSheet()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    keyboardView: { flex: 1 },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
      zIndex: 10,
    },
    backButton: { padding: 4, marginRight: 4 },
    headerAvatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.inputBackground,
      marginRight: 10,
    },
    headerInfo: { flex: 1 },
    headerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    headerName: { fontSize: 16, fontWeight: '700', color: colors.text },
    mutedIcon: { marginTop: 1 },
    headerStatusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 1 },
    onlineDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: '#34C759',
      marginRight: 5,
    },
    headerStatus: { fontSize: 12, color: '#34C759', fontWeight: '500' },
    rightHeaderActions: { flexDirection: 'row', alignItems: 'center' },
    iconButton: { padding: 8, marginLeft: 2 },

    searchHeaderWrap: {
      backgroundColor: colors.card,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 6,
    },
    searchHeader: { flexDirection: 'row', alignItems: 'center' },
    searchBackBtn: { padding: 4, marginRight: 8 },
    searchInputWrap: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
      paddingVertical: 0,
    },
    searchResultText: {
      fontSize: 12,
      color: colors.secondaryText,
      fontWeight: '500',
      marginTop: 8,
      marginLeft: 4,
    },

    dropdownOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 20,
    },
    dropdownContainer: {
      position: 'absolute',
      top: 62,
      right: 12,
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingVertical: 6,
      minWidth: 210,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.4 : 0.15,
      shadowRadius: 16,
      elevation: 12,
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    dropdownText: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.text,
      marginLeft: 12,
    },

    messagesList: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 12 },
    messagesListEmpty: { flexGrow: 1, paddingHorizontal: 12 },

    dateSeparatorWrap: { alignItems: 'center', marginVertical: 12 },
    dateSeparator: {
      backgroundColor: colors.inputBackground,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    dateSeparatorText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.secondaryText,
    },

    messageRow: { flexDirection: 'row', marginBottom: 4 },
    firstInGroup: { marginTop: 10 },
    myMessageRow: { justifyContent: 'flex-end' },
    theirMessageRow: { justifyContent: 'flex-start' },
    avatarContainer: { width: 32, marginRight: 8, justifyContent: 'flex-end' },
    avatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.inputBackground,
    },
    avatarPlaceholder: { width: 28, height: 28 },

    messageBubble: { maxWidth: '78%', paddingHorizontal: 14, paddingVertical: 9 },
    myBubble: { backgroundColor: colors.primary },
    theirBubble: { backgroundColor: colors.inputBackground },
    messageText: { fontSize: 16, lineHeight: 21 },
    myText: { color: '#FFFFFF' },
    theirText: { color: colors.text },

    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: 3,
    },
    timeText: { fontSize: 11, fontWeight: '500' },
    myTime: { color: 'rgba(255,255,255,0.85)' },
    theirTime: { color: colors.secondaryText },
    receiptIcon: { marginLeft: 3 },

    emptySearch: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
    },
    emptySearchIconWrap: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDark ? '#0A2A50' : '#F0F7FF',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    emptySearchTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
    },
    emptySearchSubtitle: {
      fontSize: 14,
      color: colors.secondaryText,
      textAlign: 'center',
      lineHeight: 20,
    },

    emptyChat: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
    },
    emptyChatIconWrap: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDark ? '#0A2A50' : '#F0F7FF',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    emptyChatTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
    },
    emptyChatSubtitle: {
      fontSize: 14,
      color: colors.secondaryText,
      textAlign: 'center',
      lineHeight: 20,
    },

    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 8,
      paddingVertical: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      backgroundColor: colors.card,
    },
    inputIcon: { padding: 8, marginHorizontal: 0 },
    textInput: {
      flex: 1,
      backgroundColor: colors.inputBackground,
      borderRadius: 22,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 16,
      maxHeight: 110,
      color: colors.text,
      marginHorizontal: 4,
      minHeight: 40,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 2,
    },
    sendButtonMuted: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 2,
    },

    blockedBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: isDark ? '#2A1010' : '#FFF5F5',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: isDark ? '#4A1E1E' : '#FFE0E0',
    },
    blockedBannerText: {
      fontSize: 14,
      color: '#FF3B30',
      fontWeight: '500',
    },
    blockedBannerAction: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '700',
      marginLeft: 4,
    },

    pickerRow: {
      backgroundColor: isDark ? '#1A1A1E' : '#FAFAFA',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      paddingVertical: 12,
    },
    attachmentRowContent: { paddingHorizontal: 12, alignItems: 'center' },
    attachmentItem: { alignItems: 'center', marginHorizontal: 8, width: 60 },
    attachmentIconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 4,
    },
    attachmentLabel: {
      fontSize: 11,
      color: colors.secondaryText,
      textAlign: 'center',
      fontWeight: '500',
    },

    emojiPickerContainer: {
      backgroundColor: colors.card,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      paddingHorizontal: 8,
      paddingVertical: 8,
      height: 380,
    },
    emojiPickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
      paddingHorizontal: 4,
    },
    emojiPickerTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
    emojiPickerClose: { padding: 4 },
    emojiSearchInput: {
      backgroundColor: colors.inputBackground,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 15,
      marginBottom: 8,
      color: colors.text,
    },
    emojiSectionContent: { paddingBottom: 20 },
    emojiItemGrid: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 2,
      height: 42,
    },
    emojiTextGrid: { fontSize: 30 },

    confirmOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    confirmCard: {
      width: '100%',
      maxWidth: 340,
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 24,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: isDark ? 0.6 : 0.25,
      shadowRadius: 40,
      elevation: 20,
    },
    confirmIconWrap: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    confirmTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    confirmMessage: {
      fontSize: 14,
      color: colors.secondaryText,
      textAlign: 'center',
      lineHeight: 21,
      marginBottom: 24,
    },
    confirmActions: { flexDirection: 'row', gap: 10, width: '100%' },
    confirmCancelBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: colors.inputBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmCancelText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    confirmActionBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmActionText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });