import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import BottomNavbar from '../Component/BottomNavbar';

interface Friend {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
}

const ChatScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const route: any = useRoute();
  const { friend } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg: Message = {
        id: Date.now().toString(),
        text: newMessage,
        senderId: 'user',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit' }),
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.senderId === 'user' ? styles.userMessage : styles.friendMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.messageTimestamp}>{item.timestamp}</Text>
    </View>
  );

  const renderStickyHeader = () => (
    <View style={styles.chatHeader}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <FontAwesome name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>
      <Image source={{ uri: friend.avatar }} style={styles.chatAvatar} />
      <Text style={styles.chatFriendName}>{friend.name}</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#E0F2FE', '#F0F9FF', '#F8FAFC']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderStickyHeader}
          contentContainerStyle={styles.messageListContent}
          stickyHeaderIndices={[0]}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.messageInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor="#94A3B8"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <FontAwesome name="paper-plane" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.bottomNavbarContainer}>
          <BottomNavbar />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0, // Adjust for status bar height
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#3B82F6',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    marginRight: 12, // Thêm khoảng cách để dễ nhấn
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 12,
  },
  chatFriendName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  messageListContent: {
    paddingBottom: 60, // Đảm bảo không gian cho input
    flexGrow: 1,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
    marginHorizontal: 8,
  },
  userMessage: {
    backgroundColor: '#3B82F6',
    alignSelf: 'flex-end',
  },
  friendMessage: {
    backgroundColor: '#E5E7EB',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Poppins-Regular',
  },
  messageTimestamp: {
    fontSize: 10,
    color: '#F0F9FF',
    textAlign: 'right',
    marginTop: 4,
    fontFamily: 'Poppins-Regular',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'absolute',
    bottom: 60, // Đặt dưới navbar
    left: 16,
    right: 16,
  },
  messageInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    fontFamily: 'Poppins-Regular',
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 20,
  },
  bottomNavbarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
});

export default ChatScreen;