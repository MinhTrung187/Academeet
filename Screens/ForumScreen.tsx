import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import PostFormModal from '../Component/PostFormModal';
import BottomNavbar from '../Component/BottomNavbar';

const { width } = Dimensions.get('window');

const logo = require('../assets/WhiteLogo.png'); // Assuming this path is correct

// Define navigation param list
type RootStackParamList = {
  PostDetail: { postId: number; currentUserId: string | null };
  Forum: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Define types for API response
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
  isLiked: boolean; // Updated property name
  isDisliked: boolean; // Updated property name
}

const ForumScreen: React.FC = () => {
  const [userName, setUserName] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // Store current user's ID
  const [posts, setPosts] = useState<Post[]>([]); // State for real posts
  const [isLoading, setIsLoading] = useState<boolean>(true); // Only for initial data fetch
  const [isPostModalVisible, setIsPostModalVisible] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null); // For editing existing posts

  const navigation = useNavigation<NavigationProp>();

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

  // Function to fetch current user data
  const fetchUserData = useCallback(async () => {
    try {
      const response = await axios.get<User>(
        'https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/User/current-user',
        { withCredentials: true } // Ensure cookies are sent
      );
      setUserName(response.data.name);
      setCurrentUserId(response.data.id); // Set current user ID
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserName('Guest'); // Fallback name
      setCurrentUserId(null); // No user ID if fetch fails
    }
  }, []);

  // Function to fetch all posts and their like/dislike/comment status
  const fetchPosts = useCallback(async () => {
    setIsLoading(true); // Start loading for posts
    try {
      const response = await axios.get<{ items: Post[] }>(
        'https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Post',
        { withCredentials: true } // Ensure cookies are sent
      );
      const fetchedPosts = response.data.items || [];

      // Only fetch comment count for each post
      const postsWithCommentCounts = await Promise.all(
        fetchedPosts.map(async (post) => {
          const commentsCount = await fetchCommentCount(post.id); // Fetch comment count
          return { ...post, commentsCount: commentsCount };
        })
      );

      // Sort posts by creation date, newest first
      const sortedPosts = postsWithCommentCounts.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setPosts(sortedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      Alert.alert('Error', 'Failed to load posts. Please try again.');
    } finally {
      setIsLoading(false); // End loading for posts
    }
  }, [fetchCommentCount]); // Only fetchCommentCount is a dependency now

  // Fetch data on component mount
  useEffect(() => {
    fetchUserData();
    fetchPosts();
  }, [fetchUserData, fetchPosts]);

  // Handle post saving (create/edit)
  const handleSavePost = async (postData: { title: string; content: string }) => {
    try {
      if (editingPost) {
        // Update existing post
        await axios.put(
          `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Post/${editingPost.id}`,
          postData,
          { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
        );
        Alert.alert('Success', 'Post updated successfully!');
      } else {
        // Create new post
        await axios.post(
          'https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Post',
          postData,
          { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
        );
        Alert.alert('Success', 'New post created successfully!');
      }
      setIsPostModalVisible(false);
      setEditingPost(null); // Clear editing state
      fetchPosts(); // Refresh posts
    } catch (error: any) {
      console.error('Error saving post:', error);
      Alert.alert('Error', `Failed to save post: ${error.response?.data?.message || error.message}`);
    }
  };

  // Handle liking/unliking a post (ALWAYS send POST, server handles toggle)
  const handleLikePost = async (postId: number, isCurrentlyLiked: boolean, isCurrentlyDisliked: boolean) => {
    const previousPosts = [...posts]; // Save current state for rollback
    try {
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id === postId) {
            let newLikesCount = isCurrentlyLiked ? post.likesCount - 1 : post.likesCount + 1;
            let newIsLiked = !isCurrentlyLiked;
            let newDislikesCount = post.dislikesCount;
            let newIsDisliked = post.isDisliked;

            // If liking and currently disliked, remove dislike
            if (!isCurrentlyLiked && isCurrentlyDisliked) {
              newDislikesCount = post.dislikesCount - 1;
              newIsDisliked = false;
            }

            return {
              ...post,
              likesCount: newLikesCount,
              isLiked: newIsLiked,
              dislikesCount: newDislikesCount,
              isDisliked: newIsDisliked,
            };
          }
          return post;
        })
      );

      // Always send POST request, server will toggle the like status
      await axios.post(
        `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Post/${postId}/like`,
        null, // No body needed for like API
        { withCredentials: true }
      );
    } catch (error: any) {
      setPosts(previousPosts); // Rollback on error
      console.error('Error toggling like status:', error);
      Alert.alert('Error', `Failed to toggle like status: ${error.response?.data?.message || error.message}`);
    }
  };

  // Handle disliking/undisliking a post (ALWAYS send POST, server handles toggle)
  const handleDislikePost = async (postId: number, isCurrentlyDisliked: boolean, isCurrentlyLiked: boolean) => {
    const previousPosts = [...posts]; // Save current state for rollback
    try {
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id === postId) {
            let newDislikesCount = isCurrentlyDisliked ? post.dislikesCount - 1 : post.dislikesCount + 1;
            let newIsDisliked = !isCurrentlyDisliked;
            let newLikesCount = post.likesCount;
            let newIsLiked = post.isLiked;

            // If disliking and currently liked, remove like
            if (!isCurrentlyDisliked && isCurrentlyLiked) {
              newLikesCount = post.likesCount - 1;
              newIsLiked = false;
            }

            return {
              ...post,
              dislikesCount: newDislikesCount,
              isDisliked: newIsDisliked,
              likesCount: newLikesCount,
              isLiked: newIsLiked,
            };
          }
          return post;
        })
      );

      // Always send POST request, server will toggle the dislike status
      await axios.post(
        `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Post/${postId}/dislike`,
        null, // No body needed for dislike API
        { withCredentials: true }
      );
    } catch (error: any) {
      setPosts(previousPosts); // Rollback on error
      console.error('Error toggling dislike status:', error);
      Alert.alert('Error', `Failed to toggle dislike status: ${error.response?.data?.message || error.message}`);
    }
  };

  // Handle deleting a post
  const handleDeletePost = (postId: number) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await axios.delete(
                `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Post/${postId}`,
                { withCredentials: true }
              );
              Alert.alert('Success', 'Post deleted successfully!');
              fetchPosts(); // Refresh posts after deletion
            } catch (error: any) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', `Failed to delete post: ${error.response?.data?.message || error.message}`);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  // Handle opening post for editing
  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setIsPostModalVisible(true);
  };

  // Skeleton Loader Component (remains the same)
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
    <>
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#6B46C1', '#3B82F6']}
        style={styles.headerContainer}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Forum</Text>
            <Text style={styles.userName}>
              Hello, {isLoading ? 'Loading...' : userName}!
            </Text>
          </View>
          <Image source={logo} style={styles.logo} accessibilityLabel="App logo" />
        </View>
      </LinearGradient>

      <TouchableOpacity
        style={styles.createPostButton}
        onPress={() => {
          setEditingPost(null); // Clear editing state for new post
          setIsPostModalVisible(true);
        }}
        accessibilityLabel="Create a new post"
        accessibilityRole="button"
      >
        <FontAwesome name="plus-circle" size={20} color="#fff" />
        <Text style={styles.createPostButtonText}>Create New Post</Text>
      </TouchableOpacity>

      <FlatList
        data={isLoading ? Array(3).fill({}) : posts} // Show 3 skeleton loaders if loading
        keyExtractor={(item, index) => (isLoading ? `skeleton-${index}` : item.id.toString())}
        renderItem={({ item, index }) =>
          isLoading ? (
            <SkeletonLoader />
          ) : (
            <TouchableOpacity
              style={styles.postCard}
              onPress={() => navigation.navigate('PostDetail', { postId: item.id, currentUserId })}
              accessibilityLabel={`View post by ${item.user.name}`}
              accessibilityRole="button"
            >
              <LinearGradient colors={['#3B82F6', '#7C3AED']} style={styles.postCardBorder}>
                <View style={styles.postCardContent}>
                  <View style={styles.postHeader}>
                    <Image
                      source={{ uri: item.user.avatarUrl || `https://placehold.co/40x40/aabbcc/ffffff?text=${item.user.name.charAt(0)}` }}
                      style={styles.postAvatar}
                      accessibilityLabel={`Avatar of ${item.user.name}`}
                    />
                    <View style={styles.postAuthorInfo}>
                      <Text style={styles.postAuthor}>{item.user.name}</Text>
                      <Text style={styles.postTime}>
                        {formatDate(item.createdAt)}
                      </Text>
                    </View>
                    {currentUserId === item.user.id && ( // Only show edit/delete buttons if current user is the author
                      <View style={styles.postActions}> {/* New container for action buttons */}
                        <TouchableOpacity
                          style={styles.editPostButton}
                          onPress={(e) => {
                            e.stopPropagation(); // Prevent opening PostDetailScreen
                            handleEditPost(item);
                          }}
                          accessibilityLabel="Edit this post"
                          accessibilityRole="button"
                        >
                          <FontAwesome name="pencil" size={18} color="#64748B" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deletePostButton} // New style for delete button
                          onPress={(e) => {
                            e.stopPropagation(); // Prevent opening PostDetailScreen
                            handleDeletePost(item.id);
                          }}
                          accessibilityLabel="Delete this post"
                          accessibilityRole="button"
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
                    <TouchableOpacity
                      style={styles.interactionButton}
                      onPress={(e) => {
                        e.stopPropagation(); // Prevent opening PostDetailScreen
                        handleLikePost(item.id, item.isLiked, item.isDisliked); // Pass isLiked and isDisliked
                      }}
                      accessibilityLabel="Like this post"
                      accessibilityRole="button"
                    >
                      <FontAwesome
                        name={item.isLiked ? 'heart' : 'heart-o'} // Change icon based on like status
                        size={18}
                        color={item.isLiked ? '#EF4444' : '#64748B'} // Red heart for liked, gray for unliked
                      />
                      <Text style={styles.interactionText}>{item.likesCount}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.interactionButton}
                      onPress={(e) => {
                        e.stopPropagation(); // Prevent opening PostDetailScreen
                        handleDislikePost(item.id, item.isDisliked, item.isLiked); // Pass isDisliked and isLiked
                      }}
                      accessibilityLabel="Dislike this post"
                      accessibilityRole="button"
                    >
                      <FontAwesome
                        name={item.isDisliked ? 'thumbs-down' : 'thumbs-o-down'} // Change icon based on dislike status
                        size={18}
                        color={item.isDisliked ? '#6B7280' : '#64748B'} // Dark gray for disliked, gray for undisliked
                      />
                      <Text style={styles.interactionText}>{item.dislikesCount}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.interactionButton}
                      onPress={(e) => {
                        e.stopPropagation(); // Prevent opening PostDetailScreen
                        navigation.navigate('PostDetail', { postId: item.id, currentUserId });
                      }}
                      accessibilityLabel="View comments"
                      accessibilityRole="button"
                    >
                      <FontAwesome name="comment-o" size={18} color="#3B82F6" />
                      <Text style={styles.interactionText}>{item.commentsCount}</Text> {/* Display actual comment count */}
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )
        }
        contentContainerStyle={styles.flatListContentContainer} // Use contentContainerStyle for FlatList
      />

      {/* Post Form Modal */}
      <PostFormModal
        isVisible={isPostModalVisible}
        onClose={() => setIsPostModalVisible(false)}
        onSave={handleSavePost}
        initialPost={editingPost}
      />
    </SafeAreaView>
    <BottomNavbar />
    </>

  );
};

export default ForumScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 80, // Space for bottom navbar
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
  createPostButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  createPostButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 8,
  },
  flatListContentContainer: { // New style for FlatList content
    paddingBottom: 24,
    paddingHorizontal: 0, // Reset horizontal padding as it's applied to postCard
    paddingTop: 16,
  },
  postCard: {
    marginBottom: 16,
    marginHorizontal: 16, // Apply horizontal margin here
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
    marginBottom: 8,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  postAuthorInfo: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#1E293B',
  },
  postTime: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  postActions: { // New style for action buttons container
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10, // Add some space from author info
  },
  editPostButton: {
    padding: 5,
    borderRadius: 5,
    marginRight: 5, // Space between edit and delete
  },
  deletePostButton: { // New style for delete button
    padding: 5,
    borderRadius: 5,
  },
  postTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1E293B',
    marginBottom: 6,
  },
  postContent: {
    fontSize: 14,
    color: '#475569',
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
    marginBottom: 10,
  },
  interactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
    marginTop: 4,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  interactionText: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
  },
  skeletonCardBorder: {
    borderRadius: 12,
    padding: 2,
    marginBottom: 12,
    marginHorizontal: 16,
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
