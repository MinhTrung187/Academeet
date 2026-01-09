import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    TextInput,
    Alert,
    FlatList,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import BottomNavbar from '../Component/BottomNavbar';

interface User {
    id: string;
    name: string;
    avatarUrl?: string;
}

interface Post {
    id: number;
    title: string;
    content: string;
    user: User;
    createdAt: string;
    likesCount: number;
    dislikesCount: number;
    isLiked: boolean; // Added
    isDisliked: boolean; // Added
}

interface Comment {
    id: number;
    content: string;
    user: User;
    createdAt: string;
    postId: number;
    likesCount: number;
    dislikesCount: number;
    isLiked: boolean; // Added
    isDisliked: boolean; // Added
}

const PostDetailScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { postId, currentUserId } = route.params as { postId: number; currentUserId: string | null };

    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [newCommentContent, setNewCommentContent] = useState<string>('');
    const [editingComment, setEditingComment] = useState<Comment | null>(null);

    // Helper to format date for display
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Ho_Chi_Minh',
            });
        } catch (e) {
            console.error("Error parsing or formatting date:", dateString, e);
            return dateString;
        }
    };

    // Function to check if current user has liked a specific comment
    const checkIfCommentLiked = useCallback(async (commentId: number): Promise<boolean> => {
        try {
            const response = await axios.get<{ items: any[] }>(
                `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Comment/${commentId}/liked`, // Assuming this endpoint
                { withCredentials: true }
            );
            return response.data.items && response.data.items.length > 0;
        } catch (error) {
            console.error(`Error checking like status for comment ${commentId}:`, error);
            return false; // Assume not liked on error
        }
    }, []);

    // Function to check if current user has disliked a specific comment
    const checkIfCommentDisliked = useCallback(async (commentId: number): Promise<boolean> => {
        try {
            const response = await axios.get<{ items: any[] }>(
                `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Comment/${commentId}/disliked`, // Assuming this endpoint
                { withCredentials: true }
            );
            return response.data.items && response.data.items.length > 0;
        } catch (error) {
            console.error(`Error checking dislike status for comment ${commentId}:`, error);
            return false; // Assume not disliked on error
        }
    }, []);


    const fetchPostAndComments = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch post details
            const postResponse = await axios.get<Post>(
                `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Post/${postId}`,
                { withCredentials: true }
            );
            setPost(postResponse.data);

            // Fetch comments for the post
            const commentsResponse = await axios.get<Comment[]>(
                `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Post/${postId}/comments`,
                { withCredentials: true }
            );
            const fetchedComments = commentsResponse.data || [];

            // Fetch like/dislike status for each comment concurrently
            const commentsWithStatus = await Promise.all(
                fetchedComments.map(async (comment) => {
                    const isLiked = await checkIfCommentLiked(comment.id);
                    const isDisliked = await checkIfCommentDisliked(comment.id);
                    return { ...comment, isLiked, isDisliked };
                })
            );

            const sortedComments = commentsWithStatus.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            setComments(sortedComments);
        } catch (error) {
            console.error('Error fetching post or comments:', error);
            Alert.alert('Error', 'Failed to load post details or comments. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [postId, checkIfCommentLiked, checkIfCommentDisliked]); // Add comment status checks to dependencies

    useEffect(() => {
        fetchPostAndComments();
    }, [fetchPostAndComments]);

    const handleAddComment = async () => {
        if (!newCommentContent.trim()) {
            Alert.alert('Error', 'Comment cannot be empty.');
            return;
        }

        try {
            const commentData = { content: newCommentContent };
            await axios.post(
                `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Post/${postId}/comments`,
                commentData,
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
            );
            setNewCommentContent('');
            fetchPostAndComments(); // Refresh comments
        } catch (error: any) {
            console.error('Error adding comment:', error);
            Alert.alert('Error', `Failed to add comment: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleEditComment = async () => {
        if (!editingComment || !newCommentContent.trim()) {
            Alert.alert('Error', 'Comment cannot be empty.');
            return;
        }

        try {
            const commentData = { content: newCommentContent };
            await axios.put(
                `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Post/${postId}/comments/${editingComment.id}`,
                commentData,
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
            );
            setNewCommentContent('');
            setEditingComment(null);
            fetchPostAndComments(); 
        } catch (error: any) {
            console.error('Error editing comment:', error);
            Alert.alert('Error', `Failed to edit comment: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDeleteComment = (commentId: number) => {
        Alert.alert(
            'Confirm Deletion',
            'Are you sure you want to delete this comment?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            await axios.delete(
                                `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Post/${postId}/comments/${commentId}`,
                                { withCredentials: true }
                            );
                            Alert.alert('Success', 'Comment deleted.');
                            fetchPostAndComments(); // Refresh comments
                        } catch (error: any) {
                            console.error('Error deleting comment:', error);
                            Alert.alert('Error', `Failed to delete comment: ${error.response?.data?.message || error.message}`);
                        }
                    },
                    style: 'destructive',
                },
            ],
            { cancelable: true }
        );
    };

    // Handle liking/unliking a post (ALWAYS send POST, server handles toggle)
    const handleLikePost = async (isCurrentlyLiked: boolean, isCurrentlyDisliked: boolean) => {
        const previousPost = post; // Save current state for rollback
        if (!post) return;

        try {
            setPost(prevPost => {
                if (!prevPost) return null;
                let newLikesCount = isCurrentlyLiked ? prevPost.likesCount - 1 : prevPost.likesCount + 1;
                let newIsLiked = !isCurrentlyLiked;
                let newDislikesCount = prevPost.dislikesCount;
                let newIsDisliked = prevPost.isDisliked;

                // If liking and currently disliked, remove dislike
                if (!isCurrentlyLiked && isCurrentlyDisliked) {
                    newDislikesCount = prevPost.dislikesCount - 1;
                    newIsDisliked = false;
                }

                return {
                    ...prevPost,
                    likesCount: newLikesCount,
                    isLiked: newIsLiked,
                    dislikesCount: newDislikesCount,
                    isDisliked: newIsDisliked,
                };
            });

            await axios.post(
                `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Post/${postId}/like`,
                null,
                { withCredentials: true }
            );
        } catch (error: any) {
            setPost(previousPost); // Rollback on error
            console.error('Error toggling post like status:', error);
            Alert.alert('Error', `Failed to toggle post like status: ${error.response?.data?.message || error.message}`);
        }
    };

    // Handle disliking/undisliking a post (ALWAYS send POST, server handles toggle)
    const handleDislikePost = async (isCurrentlyDisliked: boolean, isCurrentlyLiked: boolean) => {
        const previousPost = post; // Save current state for rollback
        if (!post) return;

        try {
            setPost(prevPost => {
                if (!prevPost) return null;
                let newDislikesCount = isCurrentlyDisliked ? prevPost.dislikesCount - 1 : prevPost.dislikesCount + 1;
                let newIsDisliked = !isCurrentlyDisliked;
                let newLikesCount = prevPost.likesCount;
                let newIsLiked = prevPost.isLiked;

                // If disliking and currently liked, remove like
                if (!isCurrentlyDisliked && isCurrentlyLiked) {
                    newLikesCount = prevPost.likesCount - 1;
                    newIsLiked = false;
                }

                return {
                    ...prevPost,
                    dislikesCount: newDislikesCount,
                    isDisliked: newIsDisliked,
                    likesCount: newLikesCount,
                    isLiked: newIsLiked,
                };
            });

            await axios.post(
                `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Post/${postId}/dislike`,
                null,
                { withCredentials: true }
            );
        } catch (error: any) {
            setPost(previousPost); // Rollback on error
            console.error('Error toggling post dislike status:', error);
            Alert.alert('Error', `Failed to toggle post dislike status: ${error.response?.data?.message || error.message}`);
        }
    };

    // Handle liking/unliking a comment
    const handleLikeComment = async (commentId: number, isCurrentlyLiked: boolean, isCurrentlyDisliked: boolean) => {
        const previousComments = [...comments]; // Save current state for rollback

        try {
            setComments(prevComments =>
                prevComments.map(comment => {
                    if (comment.id === commentId) {
                        let newLikesCount = isCurrentlyLiked ? comment.likesCount - 1 : comment.likesCount + 1;
                        let newIsLiked = !isCurrentlyLiked;
                        let newDislikesCount = comment.dislikesCount;
                        let newIsDisliked = comment.isDisliked;

                        if (!isCurrentlyLiked && isCurrentlyDisliked) {
                            newDislikesCount = comment.dislikesCount - 1;
                            newIsDisliked = false;
                        }

                        return {
                            ...comment,
                            likesCount: newLikesCount,
                            isLiked: newIsLiked,
                            dislikesCount: newDislikesCount,
                            isDisliked: newIsDisliked,
                        };
                    }
                    return comment;
                })
            );

            await axios.post(
                `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/Post/${postId}/comments/${commentId}/like`,
                null,
                { withCredentials: true }
            );
        } catch (error: any) {
            setComments(previousComments); // Rollback on error
            console.error('Error toggling comment like status:', error);
            Alert.alert('Error', `Failed to toggle comment like status: ${error.response?.data?.message || error.message}`);
        }
    };

    // Handle disliking/undisliking a comment
    const handleDislikeComment = async (commentId: number, isCurrentlyDisliked: boolean, isCurrentlyLiked: boolean) => {
        const previousComments = [...comments]; // Save current state for rollback

        try {
            setComments(prevComments =>
                prevComments.map(comment => {
                    if (comment.id === commentId) {
                        let newDislikesCount = isCurrentlyDisliked ? comment.dislikesCount - 1 : comment.dislikesCount + 1;
                        let newIsDisliked = !isCurrentlyDisliked;
                        let newLikesCount = comment.likesCount;
                        let newIsLiked = comment.isLiked;

                        if (!isCurrentlyDisliked && isCurrentlyLiked) {
                            newLikesCount = comment.likesCount - 1;
                            newIsLiked = false;
                        }

                        return {
                            ...comment,
                            dislikesCount: newDislikesCount,
                            isDisliked: newIsDisliked,
                            likesCount: newLikesCount,
                            isLiked: newIsLiked,
                        };
                    }
                    return comment;
                })
            );

            await axios.post(
                `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/Post/${postId}/comments/${commentId}/dislike`, 
                null,
                { withCredentials: true }
            );
        } catch (error: any) {
            setComments(previousComments); // Rollback on error
            console.error('Error toggling comment dislike status:', error);
            Alert.alert('Error', `Failed to toggle comment dislike status: ${error.response?.data?.message || error.message}`);
        }
    };


    const renderCommentItem = ({ item }: { item: Comment }) => (
        <View style={styles.commentCard}>
            <View style={styles.commentHeader}>
                <Image
                    source={{ uri: item.user.avatarUrl || `https://placehold.co/30x30/aabbcc/ffffff?text=${item.user.name.charAt(0)}` }}
                    style={styles.commentAvatar}
                />
                <View style={styles.commentAuthorInfo}>
                    <Text style={styles.commentAuthor}>{item.user.name}</Text>
                    <Text style={styles.commentTime}>
                        {formatDate(item.createdAt)}
                    </Text>
                </View>
                {currentUserId === item.user.id && ( // Only show edit/delete for owner
                    <View style={styles.commentActions}>
                        <TouchableOpacity onPress={() => {
                            setEditingComment(item);
                            setNewCommentContent(item.content);
                        }}>
                            <FontAwesome name="pencil" size={16} color="#64748B" style={{ marginRight: 10 }} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteComment(item.id)}>
                            <FontAwesome name="trash" size={16} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            <Text style={styles.commentContentText}>{item.content}</Text>
        </View>
    );

    if (isLoading || !post) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading post...</Text>
            </SafeAreaView>
        );
    }

    return (
        <>

            <SafeAreaView style={styles.container}>
                <LinearGradient
                    colors={['#6B46C1', '#3B82F6']}
                    style={styles.headerContainer}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <FontAwesome name="arrow-left" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Post Details</Text>
                        <View style={{ width: 24 }} /> {/* Placeholder for alignment */}
                    </View>
                </LinearGradient>

                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    {/* Post Details */}
                    <View style={styles.postDetailCard}>
                        <View style={styles.postHeader}>
                            <Image
                                source={{ uri: post.user.avatarUrl || `https://placehold.co/40x40/aabbcc/ffffff?text=${post.user.name.charAt(0)}` }}
                                style={styles.postAvatar}
                            />
                            <View style={styles.postAuthorInfo}>
                                <Text style={styles.postAuthor}>{post.user.name}</Text>
                                <Text style={styles.postTime}>
                                    {formatDate(post.createdAt)}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.postDetailTitle}>{post.title}</Text>
                        <Text style={styles.postDetailContent}>{post.content}</Text>
                        <View style={styles.interactionRow}>
                            <TouchableOpacity
                                style={styles.interactionButton}
                                onPress={() => handleLikePost(post.isLiked, post.isDisliked)}
                            >
                                <FontAwesome
                                    name={post.isLiked ? 'heart' : 'heart-o'}
                                    size={18}
                                    color={post.isLiked ? '#EF4444' : '#64748B'}
                                />
                                <Text style={styles.interactionText}>{post.likesCount}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.interactionButton}
                                onPress={() => handleDislikePost(post.isDisliked, post.isLiked)}
                            >
                                <FontAwesome
                                    name={post.isDisliked ? 'thumbs-down' : 'thumbs-o-down'}
                                    size={18}
                                    color={post.isDisliked ? '#6B7280' : '#64748B'}
                                />
                                <Text style={styles.interactionText}>{post.dislikesCount}</Text>
                            </TouchableOpacity>
                            <View style={styles.interactionButton}>
                                <FontAwesome name="comment" size={18} color="#3B82F6" />
                                <Text style={styles.interactionText}>{comments.length}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Comments Section */}
                    <View style={styles.commentsSection}>
                        <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>
                        <FlatList
                            data={comments}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderCommentItem}
                            ListEmptyComponent={() => (
                                <Text style={styles.emptyCommentsText}>No comments yet. Be the first to comment!</Text>
                            )}
                            scrollEnabled={false}
                        />

                        {/* Add/Edit Comment Input */}
                        <View style={styles.commentInputContainer}>
                            <TextInput
                                style={styles.commentInput}
                                placeholder={editingComment ? "Edit Comment..." : "Write your comment..."}
                                placeholderTextColor="#9CA3AF"
                                multiline
                                value={newCommentContent}
                                onChangeText={setNewCommentContent}
                            />
                            <TouchableOpacity
                                style={styles.sendCommentButton}
                                onPress={editingComment ? handleEditComment : handleAddComment}
                            >
                                <FontAwesome name={editingComment ? "check" : "send"} size={20} color="#fff" />
                            </TouchableOpacity>
                            {editingComment && (
                                <TouchableOpacity
                                    style={styles.cancelEditButton}
                                    onPress={() => {
                                        setEditingComment(null);
                                        setNewCommentContent('');
                                    }}
                                >
                                    <FontAwesome name="times" size={20} color="#EF4444" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
            <BottomNavbar />
        </>
    );
};

export default PostDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        marginBottom: Platform.OS === 'android' ? 56 : 0,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#64748B',
        fontFamily: 'Poppins-Regular',
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
    scrollViewContent: {
        paddingBottom: 20,
    },
    postDetailCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        margin: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    postAvatar: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    postAuthorInfo: {
        flex: 1,
    },
    postAuthor: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: '#1E293B',
    },
    postTime: {
        fontSize: 13,
        color: '#64748B',
        fontFamily: 'Poppins-Regular',
        marginTop: 2,
    },
    postDetailTitle: {
        fontSize: 22,
        fontFamily: 'Poppins-Bold',
        color: '#1E293B',
        marginBottom: 10,
    },
    postDetailContent: {
        fontSize: 16,
        color: '#475569',
        fontFamily: 'Poppins-Regular',
        lineHeight: 24,
        marginBottom: 15,
    },
    interactionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 12,
        marginTop: 8,
    },
    interactionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
    },
    interactionText: {
        fontSize: 14,
        color: '#64748B',
        fontFamily: 'Poppins-Regular',
    },
    commentsSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    commentsTitle: {
        fontSize: 18,
        fontFamily: 'Poppins-Bold',
        color: '#1E293B',
        marginBottom: 15,
    },
    commentCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    commentAvatar: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    commentAuthorInfo: {
        flex: 1,
    },
    commentAuthor: {
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        color: '#1E293B',
    },
    commentTime: {
        fontSize: 11,
        color: '#64748B',
        fontFamily: 'Poppins-Regular',
        marginTop: 2,
    },
    commentContentText: {
        fontSize: 14,
        color: '#475569',
        fontFamily: 'Poppins-Regular',
        lineHeight: 20,
    },
    commentActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingTop: 15,
    },
    commentInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: Platform.OS === 'ios' ? 12 : 8,
        marginRight: 10,
        fontSize: 15,
        fontFamily: 'Poppins-Regular',
        color: '#1E293B',
        backgroundColor: '#F8FAFC',
        maxHeight: 100,
    },
    sendCommentButton: {
        backgroundColor: '#3B82F6',
        borderRadius: 25,
        width: 45,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    cancelEditButton: {
        marginLeft: 10,
        padding: 5,
    },
    emptyCommentsText: {
        textAlign: 'center',
        color: '#9CA3AF',
        fontFamily: 'Poppins-Regular',
        marginTop: 10,
    },
    commentInteractionRow: { // New style for comment interaction row
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        gap: 15, // Space between like and dislike buttons
    },
});
