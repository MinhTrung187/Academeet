import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const logo = require('../assets/WhiteLogo.png');

const ForumScreen: React.FC = () => {
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigation = useNavigation<any>();

  const dummyPosts: {
    title: string;
    content: string;
    author: string;
    likes: number;
    comments: number;
  }[] = [
    {
      title: 'Làm sao để học hiệu quả hơn?',
      content: 'Mọi người có tips gì để học đều các môn không? Mình đang bị lệch...',
      author: 'Minh Trung',
      likes: 42,
      comments: 15,
    },
    {
      title: 'Chia sẻ tài liệu IELTS Writing',
      content: 'Mình có tổng hợp 50 đề mẫu writing band 8+, ai cần để lại mail nhé!',
      author: 'Lan Anh',
      likes: 87,
      comments: 23,
    },
    {
      title: 'Cần tìm bạn học nhóm React Native',
      content: 'Mình đang học làm app với Expo, cần bạn học chung hoặc hỗ trợ nhau...',
      author: 'Khoa Nguyễn',
      likes: 31,
      comments: 9,
    },
    {
      title: 'Cách chuẩn bị phỏng vấn tech',
      content: 'Chia sẻ kinh nghiệm phỏng vấn ở các công ty công nghệ lớn, ai muốn nghe kể không? 😄',
      author: 'Hoàng Nam',
      likes: 65,
      comments: 18,
    },
    {
      title: 'Hỏi về cách debug trong VSCode',
      content: 'Mình mới dùng VSCode, mọi người hay debug thế nào, có plugin nào xịn không?',
      author: 'Mai Linh',
      likes: 28,
      comments: 12,
    },
  ];

  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get<{ name: string }>(
          'https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/User/current-user'
        );
        if (isMounted) {
          setUserName(response.data.name);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (isMounted) setUserName('User');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchUserData();
    return () => {
      isMounted = false;
    };
  }, []);

  const SkeletonLoader = () => (
    <LinearGradient
      colors={['#3B82F6', '#7C3AED']}
      style={styles.skeletonCardBorder}
    >
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonAvatar} />
        <View style={styles.skeletonTextContainer}>
          <View style={styles.skeletonTextLine} />
          <View style={[styles.skeletonTextLine, { width: '60%' }]} />
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#6B46C1', '#3B82F6']}
        style={styles.headerContainer}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Forum</Text>
            <Text style={styles.userName}>
              {isLoading ? 'Đang tải...' : userName}
            </Text>
          </View>
          <Image source={logo} style={styles.logo} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.postList}>
          {isLoading ? (
            <>
              <SkeletonLoader />
              <SkeletonLoader />
              <SkeletonLoader />
            </>
          ) : (
            dummyPosts.map((post, index) => (
              <TouchableOpacity key={index} style={styles.postCard}>
                <LinearGradient
                  colors={['#3B82F6', '#7C3AED']}
                  style={styles.postCardBorder}
                >
                  <View style={styles.postCardContent}>
                    <View style={styles.postHeader}>
                      <Text style={styles.postAuthor}>{post.author}</Text>
                      <Text style={styles.postTime}> · 2 giờ trước</Text>
                    </View>
                    <Text style={styles.postTitle}>{post.title}</Text>
                    <Text style={styles.postContent}>{post.content}</Text>
                    <View style={styles.interactionRow}>
                      <TouchableOpacity style={styles.interactionButton}>
                        <FontAwesome name="heart-o" size={18} color="#3B82F6" />
                        <Text style={styles.interactionText}>{post.likes}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.interactionButton}>
                        <FontAwesome name="comment-o" size={18} color="#3B82F6" />
                        <Text style={styles.interactionText}>{post.comments}</Text>
                      </TouchableOpacity>

                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ForumScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  userName: {
    fontSize: 14,
    color: '#E0F2FE',
    fontFamily: 'Poppins-Regular',
    marginTop: 4,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  postList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  postCard: {
    marginBottom: 16,
  },
  postCardBorder: {
    borderRadius: 12,
    padding: 2,
  },
  postCardContent: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  postAuthor: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#1E293B',
  },
  postTime: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
  },
  postTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  postContent: {
    fontSize: 14,
    color: '#475569',
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
    marginBottom: 8,
  },
  interactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  interactionText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
  },
  skeletonCardBorder: {
    borderRadius: 12,
    padding: 2,
    marginBottom: 12,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  skeletonTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  skeletonTextLine: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 6,
    width: '80%',
  },
});