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
import BottomNavbar from '../Component/BottomNavbar';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning 🌞';
  if (hour < 18) return 'Good afternoon ☀️';
  return 'Good evening 🌙';
};

const logo = require('../assets/WhiteLogo.png');

const GroupForumScreen: React.FC = () => {
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigation = useNavigation<any>();

  const friends = [
    { id: 1, name: 'Anna', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, name: 'Ben', avatar: 'https://i.pravatar.cc/150?img=2' },
    { id: 3, name: 'Cindy', avatar: 'https://i.pravatar.cc/150?img=3' },
  ];

  const dummyPosts: {
    title: string;
    content: string;
    author: string;
    icon: React.ComponentProps<typeof FontAwesome>['name'];
  }[] = [
    {
      title: 'Làm sao để học hiệu quả hơn?',
      content: 'Mọi người có tips gì để học đều các môn không? Mình đang bị lệch...',
      author: 'Minh Trung',
      icon: 'book',
    },
    {
      title: 'Chia sẻ tài liệu IELTS Writing',
      content: 'Mình có tổng hợp 50 đề mẫu writing band 8+, ai cần để lại mail nhé!',
      author: 'Lan Anh',
      icon: 'file-text',
    },
    {
      title: 'Cần tìm bạn học nhóm React Native',
      content: 'Mình đang học làm app với Expo, cần bạn học chung hoặc hỗ trợ nhau...',
      author: 'Khoa Nguyễn',
      icon: 'code',
    },
  ];

  const dummyGroups: {
    name: string;
    members: number;
    description: string;
    icon: React.ComponentProps<typeof FontAwesome>['name'];
  }[] = [
    { name: 'Marketing Group', members: 12, description: 'Discuss campaigns', icon: 'bullhorn' },
    { name: 'UX Study Group', members: 8, description: 'Design Sprint', icon: 'paint-brush' },
    { name: 'Dev Hangout', members: 20, description: 'Coding and coffee ☕', icon: 'laptop' },
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

  // Skeleton loading component
  const SkeletonLoader = () => (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonAvatar} />
      <View style={styles.skeletonTextContainer}>
        <View style={styles.skeletonTextLine} />
        <View style={[styles.skeletonTextLine, { width: '60%' }]} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#6B46C1', '#3B82F6']}
        style={styles.headerContainer}
      >
        <View style={styles.headerContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>
              {isLoading ? 'Loading...' : userName}
            </Text>
            <Text style={styles.subGreeting}>Welcome to AcadeMEETT 🎓</Text>
          </View>
          <Image source={logo} style={styles.logo} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Friends Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Friends</Text>
          <TouchableOpacity onPress={() => navigation.navigate('FriendList')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.friendsRow}
        >
          {isLoading ? (
            <>
              <SkeletonLoader />
              <SkeletonLoader />
              <SkeletonLoader />
            </>
          ) : (
            friends.map((friend) => (
              <TouchableOpacity key={friend.id} style={styles.friendItem}>
                <LinearGradient
                  colors={['#3B82F6', '#7C3AED']}
                  style={styles.avatarBorder}
                >
                  <Image source={{ uri: friend.avatar }} style={styles.avatar} />
                </LinearGradient>
                <Text style={styles.friendName}>{friend.name}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Group List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Groups</Text>
          <TouchableOpacity onPress={() => navigation.navigate('GroupListScreen')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.groupList}>
          {isLoading ? (
            <>
              <SkeletonLoader />
              <SkeletonLoader />
              <SkeletonLoader />
            </>
          ) : (
            dummyGroups.slice(0, 3).map((group, index) => (
              <TouchableOpacity key={index} style={styles.groupCard}>
                <LinearGradient
                  colors={['#3B82F6', '#7C3AED']}
                  style={styles.groupCardBorder}
                >
                  <View style={styles.groupCardContent}>
                    <View style={styles.groupLeft}>
                      <FontAwesome name={group.icon} size={28} color="#3B82F6" />
                      <View style={{ marginLeft: 12 }}>
                        <Text style={styles.groupName}>{group.name}</Text>
                        <Text style={styles.groupSubtitle}>
                          {group.members} members · {group.description}
                        </Text>
                      </View>
                    </View>
                    <FontAwesome name="angle-right" size={24} color="#94A3B8" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Group Forum Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Forum</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ForumScreen')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.postList}>
          {isLoading ? (
            <>
              <SkeletonLoader />
              <SkeletonLoader />
              <SkeletonLoader />
            </>
          ) : (
            dummyPosts.slice(0, 3).map((post, index) => (
              <TouchableOpacity key={index} style={styles.postCard}>
                <LinearGradient
                  colors={['#3B82F6', '#7C3AED']}
                  style={styles.postCardBorder}
                >
                  <View style={styles.postCardContent}>
                    <View style={styles.postHeader}>
                      <FontAwesome name={post.icon} size={20} color="#3B82F6" />
                      <Text style={styles.postTitle}>{post.title}</Text>
                    </View>
                    <Text style={styles.postContent}>{post.content}</Text>
                    <Text style={styles.postAuthor}>Posted by {post.author}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom Navbar */}
      <View style={styles.bottomNavbarContainer}>
        <BottomNavbar />
      </View>
    </SafeAreaView>
  );
};

export default GroupForumScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Màu nền nhẹ nhàng hơn
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    marginLeft: 12,
  },
  greeting: {
    fontSize: 16,
    color: '#E0F2FE',
    fontFamily: 'Poppins-Regular',
  },
  userName: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    marginVertical: 6,
  },
  subGreeting: {
    fontSize: 14,
    color: '#E0F2FE',
    fontFamily: 'Poppins-Regular',
  },
  bottomNavbarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#1E293B',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontFamily: 'Poppins-Medium',
    padding: 8,
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
  },
  friendsRow: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  friendItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  avatarBorder: {
    borderRadius: 40,
    padding: 3,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#fff',
  },
  friendName: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#1E293B',
    textAlign: 'center',
  },
  groupList: {
    paddingHorizontal: 24,
  },
  groupCard: {
    marginBottom: 12,
  },
  groupCardBorder: {
    borderRadius: 16,
    padding: 2,
  },
  groupCardContent: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  groupLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1E293B',
  },
  groupSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
    marginTop: 4,
  },
  postList: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  postCard: {
    marginBottom: 12,
  },
  postCardBorder: {
    borderRadius: 16,
    padding: 2,
  },
  postCardContent: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1E293B',
    marginLeft: 8,
  },
  postContent: {
    fontSize: 14,
    color: '#475569',
    fontFamily: 'Poppins-Regular',
    lineHeight: 22,
  },
  postAuthor: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins-Italic',
    marginTop: 8,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  skeletonAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E5E7EB',
  },
  skeletonTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  skeletonTextLine: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginBottom: 8,
    width: '80%',
  },
});