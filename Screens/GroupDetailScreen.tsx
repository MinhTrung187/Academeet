import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
  FlatList,
  ScrollView,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomNavbar from '../Component/BottomNavbar';
import UserMessage from '../Component/UserMessage';
import * as signalR from '@microsoft/signalr';

interface Message {
  id: string;
  text: string;
  senderId: string;
  sender?: SenderInfo | null;
  timestamp: string;
  isDeleted?: boolean;
  attachmentUrls?: string[];
}
interface SenderInfo {
  id: string;
  name: string;
  avatarUrl?: string;
}

const GroupDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const { groupId, name, memberCount, description, subjectName, isPrivate } = route.params;
  const [userCache, setUserCache] = useState<Record<string, SenderInfo>>({});

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const navigation = useNavigation<any>();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(
          'https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/User/current-user',
          { credentials: 'include' }
        );
        const data = await res.json();
        setCurrentUserId(data.id);
      } catch (err) {
        console.error('❌ Lỗi lấy current user:', err);
      }
    };
    fetchCurrentUser();
  }, []);
// Helper function to format time
  const formatMessageTime = (dateString: string): string => {
    try {
      // Ensure date string ends with 'Z' for UTC interpretation if it's not already
      const date = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Ho_Chi_Minh', // Explicitly set timezone to Vietnam
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return dateString; // Return original string if formatting fails
    }
  };
  const fetchUserInfo = async (userId: string): Promise<SenderInfo | null> => {
    if (userCache[userId]) return userCache[userId];
    try {
      const res = await fetch(
        `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/User/users/${userId}`,
        {
          credentials: 'include',
        }
      );
      const data = await res.json();
      const user: SenderInfo = {
        id: data.id,
        name: data.name,
        avatarUrl: data.avatarUrl,
      };
      setUserCache(prev => ({ ...prev, [userId]: user }));
      return user;
    } catch (err) {
      console.error('❌ Lỗi lấy user info:', err);
      return null;
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Group/${groupId}/messages`,
          { credentials: 'include' }
        );
        if (!res.ok) throw new Error('Lỗi khi lấy tin nhắn nhóm');

        const data = await res.json();
        const mapped = await Promise.all(
          data.map(async (msg: any) => {
            const sender = await fetchUserInfo(msg.senderId) ?? undefined;
            return {
              id: msg.id,
              text: msg.content,
              senderId: msg.senderId,
              sender,
             timestamp: formatMessageTime(msg.sentAt),
              isDeleted: !!msg.deletedAt && msg.deletedAt !== '0001-01-01T00:00:00',
              attachmentUrls: msg.attachmentUrls || [],
            };
          })
        );

        setMessages(mapped);
      } catch (err) {
        console.error('❌ Lỗi tải tin nhắn:', err);
      }
    };
    fetchMessages();
  }, [groupId, fetchUserInfo]);

  useEffect(() => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl(`https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/hubs/chat?groupIds=${groupId}`, {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    conn.on('ReceiveMessage', async (msg) => {
      const sender = await fetchUserInfo(msg.senderId ?? undefined);
      const mapped: Message = {
        id: msg.id.toString(),
        text: msg.content || '',
        senderId: msg.senderId,
        sender,
        timestamp: formatMessageTime(msg.sentAt),
        isDeleted: !!msg.deletedAt && msg.deletedAt !== '0001-01-01T00:00:00',
        attachmentUrls: msg.attachmentUrls || [],
      };
      setMessages(prev => [...prev, mapped]);
    });

    conn.start()
      .then(() => {
        conn.invoke('JoinChatGroup', `group_${groupId}`);
        console.log('✅ SignalR joined group', `group_${groupId}`);
      })
      .catch(err => console.error('❌ Lỗi SignalR:', err));

    return () => {
      conn.stop();
    };
  }, [groupId]);

  const handleSend = async () => {
    if (inputText.trim() === '') return;
    try {
      const formData = new FormData();
      formData.append('content', inputText);

      const res = await fetch(
        `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Group/${groupId}/messages`,
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        }
      );

      if (!res.ok) throw new Error('Gửi thất bại');
      setInputText('');
    } catch (err) {
      console.error('❌ Gửi tin nhắn thất bại:', err);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === currentUserId;

    if (isMe) {
      return (
        <UserMessage
          text={item.text}
          timestamp={item.timestamp}
          isDeleted={item.isDeleted}
          attachmentUrls={item.attachmentUrls}
        />
      );
    }

    return (
      <View style={styles.friendMessageContainer}>
        <Image
          source={{ uri: item.sender?.avatarUrl || 'https://via.placeholder.com/40' }}
          style={styles.avatar}
        />
        <View style={styles.friendMessageBubble}>
          <Text style={styles.senderName}>{item.sender?.name || 'Người dùng'}</Text>
          <Text>{item.isDeleted ? '(đã thu hồi)' : item.text}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
      </View>
    );
  };

  return (
    <>
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <TouchableOpacity style={styles.header} onPress={() => navigation.navigate('GroupInfoScreen', { groupId })}>
        <View>
          <Text style={styles.headerTitle}>{name}</Text>
          <Text style={styles.headerSubtitle}>{memberCount} members</Text>
        </View>
        <FontAwesome name="info-circle" size={20} color="#E0F2FE" style={{ marginLeft: 8 }} />
      </TouchableOpacity>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
      />

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom }]}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>


      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContainer}>
            <Text style={styles.modalTitle}>Group Info</Text>
            <Text style={styles.modalItem}><Text style={styles.bold}>Name:</Text> {name}</Text>
            <Text style={styles.modalItem}><Text style={styles.bold}>Description:</Text> {description}</Text>
            <Text style={styles.modalItem}><Text style={styles.bold}>Subject:</Text> {subjectName}</Text>
            <Text style={styles.modalItem}><Text style={styles.bold}>Privacy:</Text> {isPrivate ? 'Private' : 'Public'}</Text>
            <Text style={styles.modalItem}><Text style={styles.bold}>Members:</Text> {memberCount}</Text>

            <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
    <BottomNavbar />
    </>
  );
};

export default GroupDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    marginBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#E0F2FE',
    fontSize: 14,
  },
  messageList: {
    padding: 16,
    paddingBottom: 100,
  },
  inputContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    fontSize: 14,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sendText: {
    color: '#fff',
    fontWeight: '600',
  },
  friendMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  friendMessageBubble: {
    backgroundColor: '#E5E7EB',
    padding: 10,
    borderRadius: 12,
    maxWidth: '75%',
  },
  senderName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1E293B',
  },
  modalItem: {
    fontSize: 14,
    marginVertical: 4,
    color: '#334155',
  },
  bold: {
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontWeight: '600',
  },
});
