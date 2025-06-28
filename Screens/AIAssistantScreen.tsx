import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import BottomNavbar from '../Component/BottomNavbar';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

type Message = {
  id: number;
  text: string;
  isUser: boolean;
};

const AIAssistantScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<any>(null); // Lưu thông tin file đã upload
  const [requestForFile, setRequestForFile] = useState(''); // Yêu cầu xử lý file
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSendMessage = async () => {
    if (inputText.trim()) {
      const newMessage: Message = { id: messages.length + 1, text: inputText, isUser: true };
      setMessages([...messages, newMessage]);
      setInputText('');
      setIsTyping(true);

      try {
        const formData = new FormData();
        formData.append('SessionId', sessionId || '');
        formData.append('Prompt', inputText);

        const response = await fetch('https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/AIChat/send-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        const data = await response.json();
        if (response.ok) {
          const cleanedText = (data.reply || 'Không có phản hồi từ AI')
            .replace(/[\r\n]+$/g, '') 
            .trim();
          const aiResponse: Message = {
            id: messages.length + 2,
            text: cleanedText,
            isUser: false,
          };
          setMessages((prev) => [...prev, aiResponse]);
          setSessionId(data.sessionId || '');
        } else {
          const aiResponse: Message = {
            id: messages.length + 2,
            text: 'Lỗi khi gọi API: ' + (data.message || 'Không xác định'),
            isUser: false,
          };
          setMessages((prev) => [...prev, aiResponse]);
        }
      } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        const aiResponse: Message = {
          id: messages.length + 2,
          text: 'Lỗi kết nối: Vui lòng thử lại sau',
          isUser: false,
        };
        setMessages((prev) => [...prev, aiResponse]);
      } finally {
        setIsTyping(false);
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    }
  };

  const handleDocumentUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setUploadedFile(file); // Lưu thông tin file
        const newMessage: Message = {
          id: messages.length + 1,
          text: `Uploaded document: ${file.name}. Vui lòng nhập yêu cầu xử lý (ví dụ: tóm tắt, phân tích, dịch).`,
          isUser: true,
        };
        setMessages([...messages, newMessage]);
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  const handleSendRequestForFile = async () => {
    if (uploadedFile && requestForFile.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: `Yêu cầu: ${requestForFile} cho file ${uploadedFile.name}`,
        isUser: true,
      };
      setMessages([...messages, newMessage]);
      setRequestForFile('');
      setIsTyping(true);

      try {
        const formData = new FormData();
        formData.append('SessionId', sessionId || '');
        formData.append('Prompt', requestForFile);
        formData.append('File', {
          uri: uploadedFile.uri,
          name: uploadedFile.name,
          type: uploadedFile.mimeType || 'application/octet-stream',
        } as any);

        const response = await fetch('https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/AIChat/send-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        const data = await response.json();
        if (response.ok) {
          const aiResponse: Message = {
            id: messages.length + 2,
            text: data.reply || 'Không có phản hồi từ AI cho file',
            isUser: false,
          };
          setMessages((prev) => [...prev, aiResponse]);
          setSessionId(data.sessionId || '');
        } else {
          const aiResponse: Message = {
            id: messages.length + 2,
            text: 'Lỗi khi xử lý file: ' + (data.message || 'Không xác định'),
            isUser: false,
          };
          setMessages((prev) => [...prev, aiResponse]);
        }
      } catch (error) {
        console.error('Lỗi khi gọi API với file:', error);
        const aiResponse: Message = {
          id: messages.length + 2,
          text: 'Lỗi kết nối: Vui lòng thử lại sau',
          isUser: false,
        };
        setMessages((prev) => [...prev, aiResponse]);
      } finally {
        setIsTyping(false);
        setUploadedFile(null); // Reset file sau khi xử lý
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    }
  };

  const handleQuickAction = (action: string) => {
    const newMessage: Message = {
      id: messages.length + 1,
      text: `Quick Action: ${action}`,
      isUser: true,
    };
    setMessages([...messages, newMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        text: `AI Response: Performing ${action.toLowerCase()}... Here's a sample result.`,
        isUser: false,
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 1000);
  };

  return (
    <>
      <SafeAreaView style={styles.safeArea}>

        <LinearGradient
          colors={['#E0F2FE', '#F0F9FF', '#F8FAFC']}
          style={styles.container}
        >
          <LinearGradient
            colors={['#60A5FA', '#3B82F6', '#1D4ED8']}
            style={styles.header}
          >
            <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
              <Text style={styles.headerText}>AI bot chat  🤖</Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <FontAwesome name="arrow-left" size={24} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          </LinearGradient>

          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.chatContainer}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <View
                key={message.id.toString()}
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.isUser && styles.userText, // 👈 chỉ áp dụng nếu là user
                  ]}
                >
                  {message.text}
                </Text>
              </View>
            ))}

            {isTyping && (
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text style={styles.typingText}>AI is typing...</Text>
              </View>
            )}
          </ScrollView>

          {uploadedFile && (
            <View style={styles.fileRequestContainer}>
              <TextInput
                style={styles.input}
                value={requestForFile}
                onChangeText={setRequestForFile}
                placeholder="Nhập yêu cầu cho file (tóm tắt, phân tích, dịch...)"
                placeholderTextColor="#94A3B8"
                multiline
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendRequestForFile}
              >
                <FontAwesome name="paper-plane" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => handleQuickAction('Summarize Document')}
            >
              <Text style={styles.quickActionText}>Summarize</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => handleQuickAction('Explain Concept')}
            >
              <Text style={styles.quickActionText}>Explain</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => handleQuickAction('Generate Ideas')}
            >
              <Text style={styles.quickActionText}>Ideas</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.iconButton} onPress={handleDocumentUpload}>
              <FontAwesome name="paperclip" size={24} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <FontAwesome name="microphone" size={24} color="#3B82F6" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor="#94A3B8"
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, { opacity: inputText.trim() ? 1 : 0.5 }]}
              onPress={handleSendMessage}
              disabled={!inputText.trim()}
            >
              <FontAwesome name="paper-plane" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.bottomNavbarContainer}>
          </View>
        </LinearGradient>
      </SafeAreaView>
      <BottomNavbar />

    </>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,

  },
  safeArea: {
    flex: 1,

  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,

  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#2563EB',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  chatContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingTop: 80,
    paddingBottom: 150,
  },
  userText: {
    color: '#FFFFFF', // hoặc màu khác tùy ý như '#FACC15' cho vàng, '#E0F2FE' cho xanh nhạt
    fontWeight: '600',
  },

  messageBubble: {
    maxWidth: width * 0.75,
    padding: 12,
    borderRadius: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  userBubble: {
    backgroundColor: '#4F46E5', // Deeper blue for user messages
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: '#F3F4F6', // Lighter gray for AI messages
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: '#1F2937', // Darker text for better readability
    fontFamily: 'Poppins-Regular',
    lineHeight: 22, // Improved line spacing
    textAlign: 'left', // Ensure text wraps neatly
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginVertical: 8,
    backgroundColor: '#E5E7EB',
    padding: 10,
    borderRadius: 15,
  },
  typingText: {
    fontSize: 14,
    color: '#3B82F6',
    marginLeft: 8,
    fontFamily: 'Poppins-Regular',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 15,
    marginHorizontal: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  quickActionButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'Poppins-Bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 25,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 60,
  },
  iconButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    fontFamily: 'Poppins-Regular',
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 20,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
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
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  fileRequestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 25,
    marginHorizontal: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
});

export default AIAssistantScreen;