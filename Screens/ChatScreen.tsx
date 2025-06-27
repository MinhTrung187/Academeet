import React, { useState, useEffect, useRef } from 'react';
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
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import BottomNavbar from '../Component/BottomNavbar';
import * as signalR from '@microsoft/signalr';
import UserMessage from '../Component/UserMessage';
import FriendMessage from '../Component/FriendMessage';

interface Friend {
  id: string;
  name: string;
  avatar: string;
  chatId: number;
  lastMessage: string;
  timestamp: string;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
  isDeleted?: boolean;
  attachmentUrls?: string[];

}

const ChatScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const flatListRef = useRef<FlatList>(null);

  const route: any = useRoute();
  const { friend } = route.params;
  const [chatId, setChatId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [currentUserId, setCurrentUserId] = useState('');
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch('https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/User/current-user', {
          credentials: 'include',
        });
        const data = await res.json();
        setCurrentUserId(data.id);
      } catch (err) {
        console.error('❌ Lỗi lấy current user:', err);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    console.log('friend:', friend);

    if (!friend?.user?.id) {
      console.error('❌ friend.user.id không hợp lệ hoặc không tồn tại');
      Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng. Vui lòng thử lại.');
      setLoadingMessages(false);
      return;
    }

    if (friend?.chat?.id) {
      setChatId(friend.chat.id); // Sử dụng chatId từ route.params
    }

    const initializeChat = async () => {
      try {
        console.log('📞 Khởi tạo cuộc trò chuyện với:', friend.user.id);
        const res = await fetch(
          `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Chat/start/${friend.user.id}`,
          {
            method: 'POST',
            credentials: 'include',
          }
        );
        if (res.ok) {
          const data = await res.json();
          setChatId(data.chatId); // Giả định server trả về chatId
          console.log('✅ Khởi tạo cuộc trò chuyện thành công, chatId:', data.chatId);
        } else {
          throw new Error(`Lỗi khởi tạo cuộc trò chuyện: ${res.status} ${res.statusText}`);
        }
      } catch (err) {
        console.error('❌ Lỗi khởi tạo cuộc trò chuyện:', err);
      }
    };

    const fetchMessagesAndChatId = async () => {
      setLoadingMessages(true);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        console.log('📥 Tải tin nhắn cho:', friend.user.id);
        const res = await fetch(
          `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Chat/recipient/${friend.user.id}/messages`,
          {
            credentials: 'include',
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!res.ok) {
          if (res.status === 404) {
            console.log('⚠️ Không tìm thấy cuộc trò chuyện, thử khởi tạo...');
            await initializeChat();
            Alert.alert('Thông báo', 'Chưa có cuộc trò chuyện với người dùng này.');
            return;
          }
          throw new Error(`Lỗi fetch chat history: ${res.status} ${res.statusText}`);
        }

        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Phản hồi từ server không phải JSON');
        }

        const data = await res.json();

        if (data?.messages?.length > 0) {
          setChatId(data.messages[0].chatId);
          const mappedMessages = data.messages.map((msg: any) => ({
            id: msg.id.toString(),
            text: msg.content || '',
            senderId: msg.senderId,
            timestamp: new Date(msg.sentAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            isDeleted: !!msg.deletedAt && msg.deletedAt !== '0001-01-01T00:00:00',
            attachmentUrls: msg.attachmentUrls || [],
          }));
          setMessages(mappedMessages);
        } else {
          console.warn('Không có tin nhắn nào.');
        }
      } catch (err) {
        console.error('❌ Lỗi khi fetch tin nhắn:', {
          message: err,
          friendId: friend.user.id,
        });
        Alert.alert('Lỗi', 'Không thể tải tin nhắn. Vui lòng kiểm tra kết nối hoặc thử lại.');
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessagesAndChatId();
  }, [friend?.user?.id]);
  const pickFile = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const file = result.assets[0];
      setSelectedFile({
        uri: file.uri,
        name: file.fileName || 'photo.jpg',
        type: file.type || 'image/jpeg',
      });
    }
  };
  useEffect(() => {
    if (!chatId) return;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(`https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/hubs/chat?chatIds=${chatId}`, {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    conn.on('ReceiveMessage', (msg) => {
      console.log('📬 Nhận tin nhắn từ SignalR:', msg);
      const mapped: Message = {
        id: msg.id.toString(),
        text: msg.content || '',
        senderId: msg.senderId,
        timestamp: new Date(msg.sentAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isDeleted: !!msg.deletedAt && msg.deletedAt !== '0001-01-01T00:00:00',
      };
      setMessages(prev => [...prev, mapped]);
    });

    conn.on('MessageDeleted', ({ messageId, deletedFor }) => {
      setMessages(prev =>
        deletedFor === 'everyone'
          ? prev.map(m => (m.id === messageId ? { ...m, isDeleted: true } : m))
          : prev.filter(m => m.id !== messageId)
      );
    });

    conn
      .start()
      .then(() => {
        conn.invoke('JoinChatGroup', chatId);
        setConnection(conn);
        console.log('✅ SignalR connected with chatId:', chatId);
      })
      .catch(err => {
        console.error('❌ SignalR connection error:', err);
      });

    return () => {
      conn?.stop();
    };
  }, [chatId]);
  const handleSendMessage = async () => {
    console.log('📤 Bắt đầu gửi tin nhắn:', { newMessage, selectedFile, chatId });
    if ((newMessage.trim() || selectedFile) && !loading) {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('content', newMessage);

        if (selectedFile) {
          formData.append('files', {
            uri: selectedFile.uri,
            name: selectedFile.name,
            type: selectedFile.type,
          } as any);
        }

        const response = await fetch(
          `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Chat/message/${friend.user.id}/send`,
          {
            method: 'POST',
            headers: {
              accept: '*/*',
              'Content-Type': 'multipart/form-data',
            },
            credentials: 'include',
            body: formData,
          }
        );

        if (response.ok) {
          const responseData = await response.json();
          console.log('✅ Gửi tin nhắn thành công:', responseData);

          const newMsg: Message = {
            id: responseData.id?.toString() || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: newMessage,
            senderId: currentUserId,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            isDeleted: false,
            attachmentUrls: responseData.attachmentUrls || [],
          };

          setNewMessage('');
          setSelectedFile(null);
        } else {
          throw new Error(`Lỗi gửi tin nhắn: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error('❌ Lỗi gửi tin nhắn:', error);
        Alert.alert('Lỗi', 'Không thể gửi tin nhắn. Vui lòng thử lại.');
      } finally {
        console.log('🔄 Kết thúc gửi tin nhắn, loading:', false);
        setLoading(false);
      }
    } else {
      console.log('🚫 Không gửi tin nhắn vì không thỏa mãn điều kiện:', { newMessage, selectedFile, loading });
    }
  };


const renderMessage = ({ item }: { item: Message }) => {
  const isMe = item.senderId === currentUserId;

  return isMe ? (
    <UserMessage
      text={item.text}
      timestamp={item.timestamp}
      isDeleted={item.isDeleted}
      attachmentUrls={item.attachmentUrls}
    />
  ) : (
    <FriendMessage
      text={item.text}
      timestamp={item.timestamp}
      isDeleted={item.isDeleted}
      attachmentUrls={item.attachmentUrls}
    />
  );
};



  const renderStickyHeader = () => (
    <View style={styles.chatHeader}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <FontAwesome name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>
      <Image source={{ uri: friend.avatar }} style={styles.chatAvatar} />
      <Text style={styles.chatFriendName}>{friend.user.name}</Text>
    </View>
  );

  return (
    <LinearGradient colors={['#E0F2FE', '#F0F9FF', '#F8FAFC']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
          <View style={{ flex: 1 }}>
            {loadingMessages ? (
              <ActivityIndicator size="large" color="#3B82F6" />
            ) : (
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                ListHeaderComponent={renderStickyHeader}
                contentContainerStyle={styles.messageListContent}
                stickyHeaderIndices={[0]}
                extraData={messages}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
              />
            )}
          </View>

          <View style={styles.inputContainer}>
            <TouchableOpacity onPress={pickFile} style={styles.attachButton}>
              <FontAwesome name="paperclip" size={20} color="#2563EB" />
            </TouchableOpacity>

            <TextInput
              style={styles.messageInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor="#94A3B8"
              editable={!loading}
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => {
                console.log('🖱️ Nút gửi được bấm');
                handleSendMessage();
              }}
              disabled={loading}
            >
              <FontAwesome name="paper-plane" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.bottomNavbarContainer}>
            <BottomNavbar />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // màu nền nhẹ nhàng
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  safeArea: {
    flex: 1,

  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2563EB',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    marginRight: 12,
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: '#fff',
  },
  chatFriendName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  messageListContent: {
    paddingBottom: 100,
    paddingHorizontal: 8,
    flexGrow: 1,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 10,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 16,
  },
  userMessage: {
    backgroundColor: '#2563EB',
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
  },
  friendMessage: {
    backgroundColor: '#E2E8F0',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
  },
  messageText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  messageTimestamp: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'right',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    marginHorizontal: 12,
    marginBottom: 70,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  attachmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#E0F2FE',
    borderRadius: 8,
  },
  attachmentText: {
    marginLeft: 8,
    color: '#1E3A8A',
    fontSize: 13,
    maxWidth: 180,
  },

  messageInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    fontFamily: 'Poppins-Regular',
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: '#2563EB',
    padding: 10,
    borderRadius: 20,
    marginLeft: 8,
  },
  attachButton: {
    padding: 8,
    marginRight: 4,
  },

  bottomNavbarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 5,
  },
});


export default ChatScreen;