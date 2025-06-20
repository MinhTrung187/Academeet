import React, { useState, useEffect } from 'react';
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
import * as signalR from '@microsoft/signalr';

interface Friend {
  id: string;
  name: string;
  avatar: string;
  chatId: number; // thêm nếu backend dùng chatId để join nhóm SignalR
  lastMessage: string;
  timestamp: string;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
  isDeleted?: boolean;
}

const ChatScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const route: any = useRoute();
  const { friend } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  // TODO: Replace this with your actual user ID retrieval logic
  const currentUserId = 'your_current_user_id'; // e.g., from context, redux, or props

  // Fetch message history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://192.168.10.233:7187/api/Chat/recipient/${friend.id}/messages`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setMessages(data.map(msg => ({
            id: msg.id || Date.now().toString(),
            text: msg.text || '',
            senderId: msg.senderId || 'friend',
            timestamp: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          })));
        }
      } catch (err) {
        console.error('Fetch messages error:', err);
      }
    };
    fetchMessages();
  }, [friend.id]);

  // Setup SignalR
  useEffect(() => {
    let conn: signalR.HubConnection;

    const startConnection = async () => {
      conn = new signalR.HubConnectionBuilder()
        .withUrl(`http://192.168.10.233:7187/hubs/chat?chatIds=${friend.chatId ?? friend.id}`)
        .withAutomaticReconnect()
        .build();

      conn.on("ReceiveMessage", (message: Message) => {
        console.log("📩 Nhận tin nhắn:");
        console.log("Người gửi:", message.senderId);
        console.log("Người nhận:", friend.id); // vì bạn đang chat với friend
        setMessages(prev => [...prev, message]);
      });

      conn.on("MessageDeleted", ({ messageId, deletedFor, userId }) => {
        setMessages(prev =>
          deletedFor === 'everyone'
            ? prev.map(m => m.id === messageId ? { ...m, isDeleted: true } : m)
            : prev.filter(m => m.id !== messageId)
        );
      });

      try {
        await conn.start();
        console.log("SignalR connected.");
        setConnection(conn);
      } catch (err) {
        console.error("SignalR connection error:", err);
      }
    };

    startConnection();

    return () => {
      conn?.stop();
    };
  }, [friend.chatId]);


  const handleSendMessage = async () => {
    if (newMessage.trim() && !loading) {
      setLoading(true);
      try {
        console.log("📤 Gửi tin nhắn:");
        console.log("Người gửi:", currentUserId);
        console.log("Người nhận:", friend.id);

        const formData = new FormData();
        formData.append('content', newMessage);

        const response = await fetch(`http://192.168.10.233:7187/api/Chat/message/${friend.id}/send`, {
          method: 'POST',
          headers: {
            'accept': '*/*',
          },
          credentials: 'include', // 💥 thêm dòng này để gửi cookie đăng nhập kèm
          body: formData,
        });


        if (response.ok) {
          setNewMessage('');
          // Không cần setMessages ở đây vì message sẽ được gửi qua SignalR
        }
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.isDeleted) {
      return (
        <View style={[styles.messageContainer, styles.friendMessage]}>
          <Text style={[styles.messageText, { fontStyle: 'italic', color: '#94A3B8' }]}>This message was deleted</Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.messageContainer,
          item.senderId === currentUserId ? styles.userMessage : styles.friendMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.messageTimestamp}>{item.timestamp}</Text>
      </View>
    );
  };

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
    <LinearGradient colors={['#E0F2FE', '#F0F9FF', '#F8FAFC']} style={styles.container}>
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
            editable={!loading}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage} disabled={loading}>
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
  // giữ nguyên phần styles như bạn gửi trước đó
  container: { flex: 1 },
  safeArea: { flex: 1, marginTop: StatusBar.currentHeight || 0 },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#3B82F6',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: { marginRight: 12 },
  chatAvatar: { width: 40, height: 40, borderRadius: 20, marginHorizontal: 12 },
  chatFriendName: { fontSize: 18, fontWeight: '700', color: '#fff', fontFamily: 'Poppins-Bold' },
  messageListContent: { paddingBottom: 60, flexGrow: 1 },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
    marginHorizontal: 8,
  },
  userMessage: { backgroundColor: '#3B82F6', alignSelf: 'flex-end' },
  friendMessage: { backgroundColor: '#E5E7EB', alignSelf: 'flex-start' },
  messageText: { fontSize: 14, color: '#fff', fontFamily: 'Poppins-Regular' },
  messageTimestamp: { fontSize: 10, color: '#F0F9FF', textAlign: 'right', marginTop: 4, fontFamily: 'Poppins-Regular' },
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
    bottom: 60,
    left: 16,
    right: 16,
  },
  messageInput: { flex: 1, fontSize: 14, color: '#1E293B', fontFamily: 'Poppins-Regular' },
  sendButton: { backgroundColor: '#3B82F6', padding: 12, borderRadius: 20 },
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
