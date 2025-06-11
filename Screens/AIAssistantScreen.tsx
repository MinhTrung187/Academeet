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
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import BottomNavbar from '../Component/BottomNavbar';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const AIAssistantScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const [messages, setMessages] = useState<{ id: number; text: string; isUser: boolean }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const newMessage = { id: messages.length + 1, text: inputText, isUser: true };
      setMessages([...messages, newMessage]);
      setInputText('');
      setIsTyping(true);

      setTimeout(() => {
        const aiResponse = {
          id: messages.length + 2,
          text: `AI Response: Analyzing "${inputText}"... Here's a sample response.`,
          isUser: false,
        };
        setMessages((prev) => [...prev, aiResponse]);
        setIsTyping(false);
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 1000);
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
        const newMessage = {
          id: messages.length + 1,
          text: `Uploaded document: ${file.name}`,
          isUser: true,
        };
        setMessages([...messages, newMessage]);
        setIsTyping(true);

        setTimeout(() => {
          const aiResponse = {
            id: messages.length + 2,
            text: `AI Analysis: Document "${file.name}" has been analyzed. Summary: [Sample summary].`,
            isUser: false,
          };
          setMessages((prev) => [...prev, aiResponse]);
          setIsTyping(false);
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 1500);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  const handleQuickAction = (action: string) => {
    const newMessage = {
      id: messages.length + 1,
      text: `Quick Action: ${action}`,
      isUser: true,
    };
    setMessages([...messages, newMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = {
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
    <LinearGradient
      colors={['#E0F2FE', '#F0F9FF', '#F8FAFC']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Fixed Header */}
        <LinearGradient
          colors={['#60A5FA', '#3B82F6', '#1D4ED8']}
          style={styles.header}
        >
          <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
            <Text style={styles.headerText}>AI Assistant 🤖</Text>
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
              key={message.id}
              style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
          ))}
          {isTyping && (
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text style={styles.typingText}>AI is typing...</Text>
            </View>
          )}
        </ScrollView>

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
            style={[styles.sendButton, { transform: [{ scale: fadeAnim }] }]}
            onPress={handleSendMessage}
          >
            <FontAwesome name="paper-plane" size={24} color="#fff" />
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
    paddingTop: 80, // Offset for header
    paddingBottom: 150,
  },
  messageBubble: {
    maxWidth: width * 0.7,
    padding: 14,
    borderRadius: 20,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  userBubble: {
    backgroundColor: '#3B82F6',
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: '#E5E7EB',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color:  '#fff' ,
    fontFamily: 'Poppins-Regular',
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
});

export default AIAssistantScreen;