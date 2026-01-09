import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import BottomNavbar from '../Component/BottomNavbar';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';


const { width } = Dimensions.get('window');

interface Group {
  id: number;
  name: string;
  description: string;
  isPrivate: boolean;
  requestToJoin: boolean;
  memberCount: number;
  subjectName: string;
  isMyGroup: boolean;
  createdAt: string;
  avatarUrl?: string;
}

interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface CommentAPIResponse {
  id: number;
  content: string;
  user: User;
  postId: number;
  createdAt: string;
  likesCount: number;
  dislikesCount: number;
}

interface Post {
  id: number;
  title: string;
  content: string;
  user: User; // The creator of the post
  createdAt: string;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number; // Now a required number
  isLiked: boolean; // From API response
  isDisliked: boolean; // From API response
  updatedAt?: string; // Add if present in API response
}


const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning �';
  if (hour < 18) return 'Good afternoon ☀️';
  return 'Good evening 🌙';
};

const logo = require('../assets/WhiteLogo.png');

const GroupForumScreen: React.FC = () => {
  const [userName, setUserName] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // Added currentUserId state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigation = useNavigation<any>();
  const [friends, setFriends] = useState<any[]>([]);
  const [emptyFriendMessage, setEmptyFriendMessage] = useState<string>('');
  const [isTokenSent, setIsTokenSent] = useState(false);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [posts, setPosts] = useState<Post[]>([]); // State for actual posts


  const sendFcmTokenToBackend = async () => {
    try {
      const fcmToken = await SecureStore.getItemAsync('fcmToken');
      if (!fcmToken || typeof fcmToken !== 'string') {
        console.warn('No valid FCM token found in SecureStore');
        return;
      }

      const response = await fetch(
        'https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/user/current-device-token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fcmToken }),
        }
      );

      if (response.ok) {
        console.log('✅ FCM token sent to backend successfully');
      } else {
        const errorData = await response.text(); // Hoặc response.json() nếu backend trả lỗi JSON
        console.error('❌ Failed to send FCM token to backend:', response.status, errorData);
      }
    } catch (error) {
      console.error('❌ Error sending FCM token to backend:', error);
    }
  };

  // Helper to format date for display using toLocaleString
  const formatDate = (dateString: string) => {
    try {
      // Append 'Z' to ensure it's parsed as UTC if it's not already
      const date = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Ho_Chi_Minh', // Specify the desired timezone
      });
    } catch (e) {
      console.error("Error parsing or formatting date:", dateString, e);
      return dateString; // Return original if parsing/formatting fails
    }
  };

  // Function to fetch comment count for a specific post
  const fetchCommentCount = useCallback(async (postId: number): Promise<number> => {
    try {
      const response = await axios.get<CommentAPIResponse[]>( // Expecting an array directly
        `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Post/${postId}/comments`,
        { withCredentials: true }
      );
      return response.data ? response.data.length : 0;
    } catch (error) {
      console.error(`Error fetching comment count for post ${postId}:`, error);
      return 0; // Return 0 on error
    }
  }, []);

  // Function to fetch all posts and their comment status
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<{ items: Post[] }>(
        'https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Post',
        { withCredentials: true }
      );
      const fetchedPosts = response.data.items || [];

      // Fetch comment count for each post concurrently
      const postsWithCommentCounts = await Promise.all(
        fetchedPosts.map(async (post) => {
          const commentsCount = await fetchCommentCount(post.id);
          return { ...post, commentsCount: commentsCount };
        })
      );

      const sortedPosts = postsWithCommentCounts.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setPosts(sortedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Alert.alert('Error', 'Failed to load posts. Please try again.'); // Avoid alert on main screen load
    } finally {
      setIsLoading(false);
    }
  }, [fetchCommentCount]);


  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      try {
        const response = await axios.get<{ id: string; name: string }>( // Get ID as well
          'https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/User/current-user'
        );
        if (isMounted) {
          setUserName(response.data.name);
          setCurrentUserId(response.data.id); // Set current user ID
          if (!isTokenSent) {
            await sendFcmTokenToBackend(); // Chỉ gửi nếu chưa gửi
            setIsTokenSent(true);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (isMounted) {
          setUserName('User');
          setCurrentUserId(null);
        }
      }
    };
    const fetchMyGroups = async () => {
      try {
        const res = await axios.get<{ items: Group[] }>(
          'https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Group',
          { params: { IncludeMyGroups: true }, withCredentials: true } // Ensure withCredentials
        );
        setMyGroups(res.data.items.filter(g => g.isMyGroup));
      } catch (err) {
        console.error('Error fetching my groups:', err);
      }
    };


    const fetchFriends = async () => {
      try {
        const response = await axios.get(
          'https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Relationship/friends',
          { withCredentials: true } // Ensure withCredentials
        );

        const data = Array.isArray(response.data) ? response.data : [];

        if (data.length === 0) {
          setEmptyFriendMessage('You have no friends yet!');
          setFriends([]);
        } else {
          const formattedFriends = data.map((item: any) => ({
            id: item.user.id,
            name: item.user.name,
            avatarUrl: item.user.avatarUrl,
          }));
          setFriends(formattedFriends);
          setEmptyFriendMessage('');
        }
      } catch (error) {
        console.error('Error fetching friends:', error);
        setEmptyFriendMessage('Unable to load friend list. Please try again later.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchUserData();
    fetchFriends();
    fetchMyGroups();
    fetchPosts(); // Fetch posts here

    return () => {
      isMounted = false;
    };
  }, [isTokenSent, fetchPosts]); // Add fetchPosts to dependencies


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
          <View style={{ flex: 1, maxWidth: '72%' }}>
            <Text style={styles.greeting} numberOfLines={1} ellipsizeMode="tail">
              {getGreeting()}
            </Text>
            <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
              {isLoading ? 'Loading...' : userName}
            </Text>
            <Text style={styles.subGreeting} numberOfLines={1} ellipsizeMode="tail">
              Welcome to Academeet 🎓
            </Text>
          </View>


          <Image source={logo} style={styles.logo} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Friends Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Friends</Text>
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
            friends.length === 0 ? (
              <Text style={{ paddingHorizontal: 24, fontStyle: 'italic', color: '#64748B' }}>
                {emptyFriendMessage}
              </Text>
            ) : (
              friends.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  style={styles.friendItem}
                  onPress={() =>
                    navigation.navigate('Chat', {
                      friend: {
                        user: {
                          id: friend.id,
                          name: friend.name,
                          avatarUrl: friend.avatarUrl,
                        },
                        chat: {
                          id: null,
                        },
                      },
                    })
                  }
                >
                  <LinearGradient colors={['#3B82F6', '#7C3AED']} style={styles.avatarBorder}>
                    {friend.avatarUrl ? (
                      <Image source={{ uri: friend.avatarUrl }} style={styles.avatar} />
                    ) : (
                      <View
                        style={[
                          styles.avatar,
                          {
                            backgroundColor: '#E0E7FF',
                            justifyContent: 'center',
                            alignItems: 'center',
                          },
                        ]}
                      >
                        <FontAwesome name="user" size={28} color="#6366F1" />
                      </View>
                    )}
                  </LinearGradient>
                  <Text style={styles.friendName} numberOfLines={1}>
                    {friend.name}
                  </Text>
                </TouchableOpacity>

              ))
            )

          )}
        </ScrollView>

        {/* Group List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Groups</Text>
          <TouchableOpacity onPress={() => navigation.navigate('GroupListScreen')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.groupList}>
          {isLoading ? (
            <>
              <SkeletonLoader />
              <SkeletonLoader />
            </>
          ) : myGroups.length === 0 ? (
            <Text style={{ paddingHorizontal: 24, fontStyle: 'italic', color: '#64748B' }}>
              You haven't joined any groups yet.
            </Text>
          ) : (
            myGroups.slice(0, 3).map((group, index) => (
              <TouchableOpacity
                key={group.id}
                style={styles.groupCard}
                onPress={() =>
                  navigation.navigate('GroupDetail', {
                    groupId: group.id,
                    name: group.name,
                    memberCount: group.memberCount,
                    description: group.description,
                    subjectName: group.subjectName,
                    isPrivate: group.isPrivate,
                  })
                }
              >
                <LinearGradient colors={['#3B82F6', '#7C3AED']} style={styles.groupCardBorder}>
                  <View style={styles.groupCardContent}>
                    <View style={styles.groupLeft}>
                      {group.avatarUrl ? (
                        <Image source={{ uri: group.avatarUrl }} style={styles.groupAvatar} />
                      ) : (
                        <FontAwesome name="users" size={28} color="#3B82F6" />
                      )}
                      <View style={{ marginLeft: 12 }}>
                        <Text style={styles.groupName}>{group.name}</Text>
                        <Text style={styles.groupSubtitle}>
                          {group.memberCount} members · {group.subjectName}
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
          ) : posts.length === 0 ? (
            <Text style={{ paddingHorizontal: 24, fontStyle: 'italic', color: '#64748B' }}>
              No posts available. Be the first to create one!
            </Text>
          ) : (
            posts.slice(0, 3).map((item, index) => ( // Use 'item' for consistency
              <TouchableOpacity
                key={item.id} // Use actual post ID as key
                style={styles.postCard}
                onPress={() => navigation.navigate('PostDetail', { postId: item.id, currentUserId })}
              >
                <LinearGradient
                  colors={['#3B82F6', '#7C3AED']}
                  style={styles.postCardBorder}
                >
                  <View style={styles.postCardContent}>
                    <View style={styles.postHeader}>
                      <Image
                        source={{ uri: item.user.avatarUrl || `https://placehold.co/40x40/aabbcc/ffffff?text=${item.user.name.charAt(0)}` }}
                        style={styles.postAvatar}
                      />
                      <View style={styles.postAuthorInfo}>
                        <Text style={styles.postAuthor}>{item.user.name}</Text>
                        <Text style={styles.postTime}>
                          {formatDate(item.createdAt)}
                        </Text>
                      </View>
                      {currentUserId === item.user.id && ( // Only show edit/delete buttons if current user is the author
                        <View style={styles.postActions}>
                          <TouchableOpacity
                            style={styles.editPostButton}
                            onPress={(e) => {
                              e.stopPropagation(); // Prevent opening PostDetailScreen
                              // handleEditPost(item); // Implement if needed for preview
                              Alert.alert('Info', 'Edit functionality is available on the full Forum screen.');
                            }}
                          >
                            <FontAwesome name="pencil" size={18} color="#64748B" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.deletePostButton}
                            onPress={(e) => {
                              e.stopPropagation(); // Prevent opening PostDetailScreen
                              // handleDeletePost(item.id); // Implement if needed for preview
                              Alert.alert('Info', 'Delete functionality is available on the full Forum screen.');
                            }}
                          >
                            <FontAwesome name="trash" size={18} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                    <Text style={styles.postTitle}>{item.title}</Text>
                    <Text style={styles.postContent} numberOfLines={3}>
                      {item.content}
                    </Text>
                    <View style={styles.interactionRow}>
                      <View style={styles.interactionButton}>
                        <FontAwesome
                          name={item.isLiked ? 'heart' : 'heart-o'}
                          size={18}
                          color={item.isLiked ? '#EF4444' : '#64748B'}
                        />
                        <Text style={styles.interactionText}>{item.likesCount}</Text>
                      </View>
                      <View style={styles.interactionButton}>
                        <FontAwesome
                          name={item.isDisliked ? 'thumbs-down' : 'thumbs-o-down'}
                          size={18}
                          color={item.isDisliked ? '#6B7280' : '#64748B'}
                        />
                        <Text style={styles.interactionText}>{item.dislikesCount}</Text>
                      </View>
                      <View style={styles.interactionButton}>
                        <FontAwesome name="comment-o" size={18} color="#3B82F6" />
                        <Text style={styles.interactionText}>{item.commentsCount}</Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))
          )}
        </View>
        {/* Task Management Section */}
        {/* <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Task Management</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TaskManagementScreen')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View> */}

        {/* <View style={styles.taskManagementContainer}>
          <TouchableOpacity
            style={styles.taskManagementCard}
            onPress={() => navigation.navigate('TaskManagementScreen')}
          >
            <LinearGradient
              colors={['#5f28b6ff', '#342bb4ff']}
              style={styles.taskManagementCardGradient}
            >
              <FontAwesome name="tasks" size={32} color="#fff" />
              <Text style={styles.taskManagementCardText}>Manage Your Tasks</Text>
              <FontAwesome name="angle-right" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View> */}
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
    backgroundColor: '#F3F4F6',
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
    minHeight: 120,
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
    marginTop: 28,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1E3A8A', // Xanh navy
    backgroundColor: '#DBEAFE', // Xanh nhạt
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },

  seeAllText: {
    fontSize: 14,
    color: '#2563EB', // xanh đẹp hơn
    fontFamily: 'Poppins-Medium',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#DBEAFE', // nền xanh nhạt hơn, nhẹ mắt hơn
    borderRadius: 16,
    overflow: 'hidden',
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
  groupAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
  },

  taskManagementContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  taskManagementCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  taskManagementCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
  },
  taskManagementCardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 15,
    flex: 1,
  },
  // New styles for post actions within the preview (if needed)
  postAvatar: { // Re-added for the post preview in GroupForumScreen
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  postAuthorInfo: { // Re-added for the post preview in GroupForumScreen
    flex: 1,
  },
  postAuthor: { // Re-added for the post preview in GroupForumScreen
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#1E293B',
  },
  postTime: { // Re-added for the post preview in GroupForumScreen
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  postActions: { // Re-added for the post preview in GroupForumScreen
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  editPostButton: { // Re-added for the post preview in GroupForumScreen
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
  },
  deletePostButton: { // Re-added for the post preview in GroupForumScreen
    padding: 5,
    borderRadius: 5,
  },
  interactionRow: { // Re-added for the post preview in GroupForumScreen
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
    marginTop: 4,
  },
  interactionButton: { // Re-added for the post preview in GroupForumScreen
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  interactionText: { // Re-added for the post preview in GroupForumScreen
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
  },
});
