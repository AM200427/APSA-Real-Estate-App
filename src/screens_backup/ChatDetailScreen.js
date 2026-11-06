// src/screens/ChatDetailScreen.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ScrollView,
  Keyboard,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext'; // ✅ Global theme
import Text from '../components/AccessibleText';

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
  '🤥', '🤫', '🤭', '🧐', '🤓', '😈', '👿', '👹', '👺', '💀',
  '☠️', '👻', '👽', '👾', '🤖', '💩', '😺', '😸', '😹', '😻',
  '😼', '😽', '🙀', '😿', '😾', '🙈', '🙉', '🙊', '💋', '💌',
  '💘', '💝', '💖', '💗', '💓', '💞', '💕', '💟', '❣️', '❤️',
  '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥',
  '❤️‍🩹', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💣', '💬',
  '💭', '🗯️', '💤', '👋', '🤚', '✋', '🖐️', '🖖', '👌', '🤌',
  '🤏', '✌️', '🤞', '🤟', '🤘', '👈', '👉', '👆', '🖕', '👇',
  '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐',
  '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦶',
  '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄',
  '🩸', '👶', '🧒', '👦', '👧', '🧑', '👨', '👩', '🧔', '👨‍🦰',
  '👩‍🦰', '👨‍🦱', '👩‍🦱', '👨‍🦳', '👩‍🦳', '👨‍🦲', '👩‍🦲', '🧑‍🦰', '🧑‍🦱', '🧑‍🦳',
  '🧑‍🦲', '👮', '👷', '💂', '🕵️', '🧑‍⚕️', '👨‍⚕️', '👩‍⚕️', '🧑‍🏫', '👨‍🏫',
  '👩‍🏫', '🧑‍⚖️', '👨‍⚖️', '👩‍⚖️', '🧑‍🌾', '👨‍🌾', '👩‍🌾', '🧑‍🍳', '👨‍🍳', '👩‍🍳',
  '🧑‍🔧', '👨‍🔧', '👩‍🔧', '🧑‍🏭', '👨‍🏭', '👩‍🏭', '🧑‍💼', '👨‍💼', '👩‍💼', '🧑‍🔬',
  '👨‍🔬', '👩‍🔬', '🧑‍💻', '👨‍💻', '👩‍💻', '🧑‍🎤', '👨‍🎤', '👩‍🎤', '🧑‍🎨', '👨‍🎨',
  '👩‍🎨', '🧑‍✈️', '👨‍✈️', '👩‍✈️', '🧑‍🚀', '👨‍🚀', '👩‍🚀', '🧑‍🚒', '👨‍🚒', '👩‍🚒',
  '💃', '🕺', '🕴️', '🧍', '🧎', '🏃', '👯', '🧖', '🧗', '🏇',
  '⛷️', '🏂', '🏌️', '🏄', '🚣', '🏊', '⛹️', '🏋️', '🚴', '🚵',
  '🤸', '🤼', '🤽', '🤾', '🧘', '🧗‍♀️', '🧗‍♂️', '🧘‍♀️', '🧘‍♂️', '🏋️‍♀️',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒',
  '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇',
  '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜',
  '🪰', '🪲', '🪳', '🦟', '🦗', '🐙', '🦑', '🐬', '🐳', '🐋',
  '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛',
  '🦏', '🐪', '🐫', '🦒', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏',
  '🐑', '🐐', '🦌', '🐕', '🐩', '🐈', '🐓', '🦃', '🐇', '🐁',
  '🐀', '🐿️', '🦔', '🦥', '🦦', '🦨', '🦘', '🦡', '🐾', '🪱',
  '🪸', '🐚', '🐲', '🐉', '🐢', '🦎', '🐍', '🐡', '🐠', '🐟',
  '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈',
  '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🫒',
  '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🧄', '🧅', '🥔',
  '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈',
  '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟',
  '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘',
  '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍤', '🍥', '🥮',
  '🍡', '🍢', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮',
  '🍭', '🍬', '🍫', '🍿', '🧂', '🍩', '🍪', '🌰', '🥜', '🍯',
  '🥛', '🍼', '🫗', '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺',
  '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🍾', '🧊', '🥄', '🍴',
  '🍽️', '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏',
  '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '⛳', '🪁',
  '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️',
  '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤾',
  '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴',
  '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🎗️', '🎀', '🎁', '🎂',
  '🎈', '🎉', '🎊', '🎍', '🎎', '🎏', '🎐', '🎑', '🎃', '🎄',
  '🎅', '🧑‍🎄', '🦌', '☃️', '⛄', '🌨️', '🎇', '🎆', '🧨', '✨',
  '🎋', '🎓', '🧑‍🎓', '👨‍🎓', '👩‍🎓', '🚗', '🚕', '🚙', '🚌', '🚎',
  '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️',
  '🛵', '🚲', '🛴', '🛹', '🛼', '🚁', '✈️', '🛩️', '🛫', '🛬',
  '💺', '🚀', '🛸', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊',
  '🚝', '🚞', '🚋', '🚍', '🛶', '⛵', '🛥️', '🚤', '🛳️', '⛴️',
  '🛟', '🚢', '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨',
  '🏩', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '💒', '🗼', '🗽',
  '⛪', '🕌', '🕍', '🛕', '⛩️', '🕋', '⛲', '🌊', '🌋', '🏔️',
  '🗻', '🏕️', '🏖️', '🏜️', '🏝️', '⛺', '🏗️', '🧱', '🪨', '🪵',
  '🏘️', '🏚️', '🛖', '🌆', '🌃', '🌉', '🌁', '🎡', '🎢', '🎠',
  '🌌', '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️',
  '🕹️', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟',
  '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏰', '⏳', '⌛',
  '🕰️', '🔑', '🗝️', '🔒', '🔓', '🔐', '🔏', '🪤', '🪣', '🪥',
  '🪒', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '⚱️', '🏺', '🔮',
  '🪄', '🧿', '🪬', '🪙', '💰', '💴', '💵', '💶', '💷', '💸',
  '💳', '🧾', '💹', '✉️', '📧', '📨', '📩', '📤', '📥', '📦',
  '📫', '📪', '📬', '📭', '📮', '🗳️', '✏️', '✒️', '🖋️', '🖊️',
  '🖌️', '🖍️', '📝', '📒', '📓', '📔', '📕', '📖', '📗', '📘',
  '📙', '📚', '📑', '📄', '📃', '📜', '📊', '📈', '📉', '🧮',
  '📏', '📐', '✂️', '🗂️', '📁', '📂', '🗄️', '📅', '📆', '🗓️',
  '🖇️', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '❣️',
  '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️',
  '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎',
  '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑',
  '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶',
];

// ---------- MOCK MESSAGES ----------
const MOCK_HISTORY = [
  { id: '1', text: 'Hi there! Is the luxury apartment still available?', sender: 'them', time: '10:23 AM' },
  { id: '2', text: 'Yes, it is available for the upcoming month!', sender: 'me', time: '10:24 AM' },
  { id: '3', text: 'That sounds great. What is the price per night?', sender: 'them', time: '10:25 AM' },
  { id: '4', text: 'It is ZMW 8500 per month. We also offer weekly rates.', sender: 'me', time: '10:26 AM' },
  { id: '5', text: 'Perfect! I would like to book it for next week.', sender: 'them', time: '10:28 AM' },
];

const MessageBubble = React.memo(({ item, styles }) => {
  const isMe = item.sender === 'me';
  return (
    <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.theirMessageRow]}>
      {!isMe && (
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' }}
            style={styles.avatar}
          />
        </View>
      )}
      <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
        <Text style={[styles.messageText, isMe ? styles.myText : styles.theirText]}>{item.text}</Text>
        <Text style={[styles.timeText, isMe ? styles.myTime : styles.theirTime]}>{item.time}</Text>
      </View>
    </View>
  );
});

export default function ChatDetailScreen({ navigation, route }) {
  const { colors, isDark } = useTheme(); // ✅ Global theme
console.log('🎨 ChatDetail theme:', isDark ? 'DARK' : 'LIGHT', colors.background);
  const { userName = 'Client', chatId } = route.params || {};

  const [messages, setMessages] = useState(MOCK_HISTORY);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);
  const inputRef = useRef(null);

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const [isAttachmentRowVisible, setIsAttachmentRowVisible] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState('');
  const [recentEmojis, setRecentEmojis] = useState(['😀', '😂', '😊', '❤️', '👍', '🔥', '😍', '😘', '🥰', '💯']);

  const styles = getStyles(colors, isDark); // ✅ Themed styles

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim().length === 0) return;
    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
    setTimeout(() => {
      const response = {
        id: (Date.now() + 1).toString(),
        text: 'Thanks! I will get back to you shortly with the booking details.',
        sender: 'them',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, response]);
    }, 1500);
  };

  const toggleDropdown = () => setIsDropdownVisible(!isDropdownVisible);
  const closeDropdown = () => setIsDropdownVisible(false);
  const handleCall = () => Alert.alert('Call', `Calling ${userName}...`);

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

  const toggleAttachmentRow = () => {
    if (isEmojiPickerVisible) setIsEmojiPickerVisible(false);
    setIsAttachmentRowVisible((prev) => !prev);
  };

  const sendImageMessage = async (pickerResult) => {
    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      const newMessage = {
        id: Date.now().toString(),
        text: '📸 Shared an image',
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, newMessage]);
      setTimeout(() => {
        const response = {
          id: (Date.now() + 1).toString(),
          text: 'Nice! Thanks for sharing.',
          sender: 'them',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, response]);
      }, 1500);
    }
  };

  const handleGalleryPress = async () => {
    setIsAttachmentRowVisible(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    await sendImageMessage(result);
  };

  const handleCameraPress = async () => {
    setIsAttachmentRowVisible(false);
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    await sendImageMessage(result);
  };

  const handleLocation = () => { setIsAttachmentRowVisible(false); Alert.alert('Location', 'Coming soon!'); };
  const handleDocument = () => { setIsAttachmentRowVisible(false); Alert.alert('Document', 'Coming soon!'); };
  const handleContact = () => { setIsAttachmentRowVisible(false); Alert.alert('Contact', 'Coming soon!'); };
  const handlePoll = () => { setIsAttachmentRowVisible(false); Alert.alert('Poll', 'Coming soon!'); };
  const handleEvent = () => { setIsAttachmentRowVisible(false); Alert.alert('Event', 'Coming soon!'); };

  const renderMessage = useCallback(
    ({ item }) => <MessageBubble item={item} styles={styles} />,
    [styles]
  );

  const renderAttachmentRow = () => {
    const attachments = [
      { icon: 'images-outline', label: 'Gallery', onPress: handleGalleryPress, color: colors.primary },
      { icon: 'camera-outline', label: 'Camera', onPress: handleCameraPress, color: '#FD7E14' },
      { icon: 'location-outline', label: 'Location', onPress: handleLocation, color: '#28A745' },
      { icon: 'document-text-outline', label: 'Document', onPress: handleDocument, color: '#8B5CF6' },
      { icon: 'person-outline', label: 'Contact', onPress: handleContact, color: '#E91E63' },
      { icon: 'stats-chart-outline', label: 'Poll', onPress: handlePoll, color: '#FF6B35' },
      { icon: 'calendar-outline', label: 'Event', onPress: handleEvent, color: '#9C27B0' },
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
            <TouchableOpacity key={index} onPress={item.onPress} style={styles.attachmentItem}>
              <View style={[styles.attachmentIconCircle, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={styles.attachmentLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderEmojiPicker = () => {
    const allEmojisWithRecent = [...recentEmojis, ...ALL_EMOJIS];
    const uniqueEmojis = Array.from(new Set(allEmojisWithRecent));
    const filteredEmojis = uniqueEmojis.filter(
      (e) => e.includes(emojiSearch) || emojiSearch === ''
    );

    return (
      <View style={styles.emojiPickerContainer}>
        <View style={styles.emojiPickerHeader}>
          <Text style={styles.emojiPickerTitle}>Emojis</Text>
          <TouchableOpacity onPress={closeEmojiPicker} style={styles.emojiPickerClose}>
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

  return (
  <SafeAreaView key={isDark ? 'dark' : 'light'} style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{userName}</Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
          <View style={styles.rightHeaderActions}>
            <TouchableOpacity style={styles.iconButton} onPress={handleCall}>
              <Ionicons name="call-outline" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={toggleDropdown}>
              <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dropdown */}
        {isDropdownVisible && (
          <TouchableOpacity activeOpacity={1} onPress={closeDropdown} style={styles.dropdownOverlay}>
            <View style={styles.dropdownContainer}>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => { closeDropdown(); Alert.alert('Muted', `Muted ${userName}`); }}>
                <Ionicons name="notifications-off-outline" size={20} color={colors.text} />
                <Text style={styles.dropdownText}>Mute</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => { closeDropdown(); Alert.alert('Search', 'Search messages'); }}>
                <Ionicons name="search-outline" size={20} color={colors.text} />
                <Text style={styles.dropdownText}>Search</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => { closeDropdown(); Alert.alert('Profile', `View ${userName}'s profile`); }}>
                <Ionicons name="person-outline" size={20} color={colors.text} />
                <Text style={styles.dropdownText}>Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => { closeDropdown(); Alert.alert('Clear Chat', 'Are you sure?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => setMessages([]) }]); }}>
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                <Text style={[styles.dropdownText, { color: '#FF3B30' }]}>Clear Chat</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {/* Attachment Row */}
        {isAttachmentRowVisible && renderAttachmentRow()}

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.inputIcon} onPress={toggleEmojiPicker}>
            <Ionicons name="happy-outline" size={24} color={colors.text} />
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder="Message"
            placeholderTextColor={colors.secondaryText}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity style={styles.inputIcon} onPress={toggleAttachmentRow}>
            <Ionicons name="attach-outline" size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.inputIcon} onPress={handleCameraPress}>
            <Ionicons name="camera-outline" size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Emoji Picker */}
        {isEmojiPickerVisible && renderEmojiPicker()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ✅ Styles generated from theme colors
const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    keyboardView: { flex: 1 },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.headerBackground,
      zIndex: 10,
    },
    backButton: { padding: 4 },
    headerInfo: { flex: 1, marginLeft: 12 },
    headerName: { fontSize: 18, fontWeight: '700', color: colors.text },
    headerStatus: { fontSize: 12, color: '#28A745', fontWeight: '500' },
    rightHeaderActions: { flexDirection: 'row', alignItems: 'center' },
    iconButton: { padding: 8, marginLeft: 4 },

    // Dropdown
    dropdownOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20 },
    dropdownContainer: {
      position: 'absolute',
      top: 70,
      right: 16,
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingVertical: 8,
      minWidth: 200,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 10,
    },
    dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
    dropdownText: { fontSize: 16, fontWeight: '500', color: colors.text, marginLeft: 12 },

    // Messages
    messagesList: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, flexGrow: 1 },
    messageRow: { flexDirection: 'row', marginBottom: 16 },
    myMessageRow: { justifyContent: 'flex-end' },
    theirMessageRow: { justifyContent: 'flex-start' },
    avatarContainer: { marginRight: 8, justifyContent: 'flex-end' },
    avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.inputBackground },
    messageBubble: { maxWidth: '75%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
    myBubble: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
    theirBubble: { backgroundColor: colors.inputBackground, borderBottomLeftRadius: 4 },
    messageText: { fontSize: 16, lineHeight: 22 },
    myText: { color: '#FFFFFF' },
    theirText: { color: colors.text },
    timeText: { fontSize: 11, marginTop: 4, alignSelf: 'flex-end' },
    myTime: { color: 'rgba(255, 255, 255, 0.7)' },
    theirTime: { color: colors.secondaryText },

    // Input Bar
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.card,
    },
    inputIcon: { padding: 6, marginHorizontal: 2 },
    textInput: {
      flex: 1,
      backgroundColor: colors.inputBackground,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      fontSize: 16,
      maxHeight: 100,
      color: colors.text,
      marginHorizontal: 6,
    },
    sendButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 4,
    },
    sendButtonDisabled: { backgroundColor: colors.secondaryText },

    // Attachment Row
    pickerRow: {
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingVertical: 6,
      paddingHorizontal: 4,
    },
    attachmentRowContent: { paddingHorizontal: 8, alignItems: 'center', flexDirection: 'row' },
    attachmentItem: { alignItems: 'center', marginHorizontal: 6, width: 56 },
    attachmentIconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 2,
    },
    attachmentLabel: { fontSize: 10, color: colors.secondaryText, textAlign: 'center' },

    // Emoji Picker
    emojiPickerContainer: {
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingHorizontal: 8,
      paddingVertical: 6,
      height: 400,
    },
    emojiPickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
      paddingHorizontal: 4,
    },
    emojiPickerTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
    emojiPickerClose: { padding: 4 },
    emojiSearchInput: {
      backgroundColor: colors.inputBackground,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      fontSize: 15,
      marginBottom: 6,
      color: colors.text,
    },
    emojiSectionContent: { paddingBottom: 20 },
    emojiItemGrid: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 2, height: 40 },
    emojiTextGrid: { fontSize: 32 },
  });