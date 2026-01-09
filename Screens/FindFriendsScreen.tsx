import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import HeaderComponent from '../Component/HeaderComponent';
import BottomNavbar from '../Component/BottomNavbar';
import axios, { AxiosResponse, CancelTokenSource } from 'axios';
import CardStack from '../Component/CardStack';
import RequestList from '../Component/RequestList';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FriendRequest {
  $id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  sentAt: string;
  status: string;
  senderAvatarUrl?: string;
}

interface User {
  id: string;
  name: string;
  age: number;
  bio?: string;
  occupation?: string;
  genderIdentity?: string;
  educationLevel?: string;
  studyPreferences: string[] | { $values: string[] };
  subjects: string[] | { $values: string[] };
  avatarUrl: string;
}

const API_BASE_URL = 'https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api';
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

const { width, height } = Dimensions.get('window');

const FindFriendsScreen = () => {
  const [activeTab, setActiveTab] = useState<'find' | 'requests'>('find');
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const cancelTokenSourceRef = useRef<CancelTokenSource | null>(null);

  const fetchCurrentUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (cancelTokenSourceRef.current) cancelTokenSourceRef.current.cancel('New request initiated');
      cancelTokenSourceRef.current = axios.CancelToken.source();
      const response: AxiosResponse<User> = await axiosInstance.get('/User/current-user', {
        cancelToken: cancelTokenSourceRef.current.token,
      });
      setCurrentUser(response.data);
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error('Error fetching current user:', err);
      setError('Failed to load current user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFriendRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (cancelTokenSourceRef.current) cancelTokenSourceRef.current.cancel('New request initiated');
      cancelTokenSourceRef.current = axios.CancelToken.source();
      const response: AxiosResponse<any> = await axiosInstance.get('/FriendRequest/received', {
        cancelToken: cancelTokenSourceRef.current.token,
      });

      // Xử lý response mới
      const requests: FriendRequest[] = Array.isArray(response.data) ? response.data.map((item: any) => ({
        $id: item.sender.id, // Sử dụng sender.id làm $id vì response không có $id
        senderId: item.sender.id,
        senderName: item.sender.name,
        recipientId: item.recipient.id,
        recipientName: item.recipient.name,
        sentAt: item.sentAt,
        status: 'Pending', // API mới không trả về status, giả định mặc định là Pending
        senderAvatarUrl: item.sender.avatarUrl,
      })) : [];

      setFriendRequests(requests);
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error('Error fetching friend requests:', err);
      setError('Failed to load friend requests. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (cancelTokenSourceRef.current)
        cancelTokenSourceRef.current.cancel('New request initiated');

      cancelTokenSourceRef.current = axios.CancelToken.source();

      const response = await axiosInstance.get('/User/feed', {
        cancelToken: cancelTokenSourceRef.current.token,
        params: {
          includeFriends: false,
          pageIndex: 1,
        },
      });

      const allUsers = Array.isArray(response.data?.items)
        ? response.data.items
        : [];

      const validUsers = allUsers.filter((user: User) =>
        user && user.id && user.age > 0 && user.age < 150
      );

      const filteredUsers = currentUser
        ? validUsers.filter(
          (user: User) =>
            user.id !== currentUser.id &&
            user.name !== 'Academeet Admin'
        )
        : validUsers.filter((user: User) => user.name !== 'Academeet Admin');

      setUsers(filteredUsers);
      console.log('Fetched users:', filteredUsers);

      if (filteredUsers.length === 0) {
        setTimeout(() => fetchUsers(), 5000);
      }
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const handleSwipeRight = useCallback(
    async (user: User) => {
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append('recipientId', user.id);
        await axiosInstance.post('/FriendRequest/send', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Alert.alert('Success', 'Friend request sent successfully!');
        setUsers((prev) => {
          const newUsers = prev.filter((u) => u.id !== user.id);
          if (newUsers.length === 0) {
            fetchUsers();
          }
          return newUsers;
        });
      } catch (error: any) {
        let userMessage = 'Failed to send friend request. Please try again.';
        if (error.response?.status === 400 && error.response.data?.detail === 'Friend request already exists.') {
          userMessage = 'Friend request already sent.';
        }
        Alert.alert('Error', userMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchUsers]
  );

  const handleSwipeLeft = useCallback(
    (user: User) => {
      console.log(`Skipped user: ${user.name}`);
      setUsers((prev) => {
        const newUsers = prev.filter((u) => u.id !== user.id);
        if (newUsers.length === 0) {
          fetchUsers();
        }
        return newUsers;
      });
    },
    [fetchUsers]
  );

  const handleRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      let response;
      if (action === 'accept') {
        const formData = new FormData();
        formData.append('senderId', requestId);
        response = await axiosInstance.post('/FriendRequest/accept', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await axiosInstance.post('/FriendRequest/reject', { requestId });
      }
      setFriendRequests((prev) =>
        prev.map((r) => (r.$id === requestId ? { ...r, status: action === 'accept' ? 'Accepted' : 'Rejected' } : r))
      );
      Alert.alert('Success', `Friend request ${action}ed successfully!`);
    } catch (error) {
      console.error(`Error ${action}ing friend request:`, error);
      Alert.alert('Error', `Failed to ${action} friend request. Please try again.`);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (activeTab === 'requests') {
      fetchFriendRequests().then(() => setRefreshing(false));
    } else {
      const fetchPromises = currentUser ? [fetchUsers()] : [fetchCurrentUser(), fetchUsers()];
      Promise.all(fetchPromises).then(() => setRefreshing(false));
    }
  }, [activeTab, fetchFriendRequests, fetchCurrentUser, fetchUsers, currentUser]);

  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused, activeTab:', activeTab, 'users length:', users.length);
      if (activeTab === 'find' && users.length === 0) {
        fetchUsers();
      }
    }, [activeTab, fetchUsers, users.length])
  );

  useEffect(() => {
    console.log('useEffect triggered, activeTab:', activeTab, 'currentUser:', currentUser, 'users.length:', users.length);
    const showInitialGuide = async () => {
      const hasShown = await AsyncStorage.getItem('hasShownGuide');
      if (!hasShown) {
        Alert.alert(
          'Find Study Friends',
          'This is where you can make friends.\n\nSwipe right to send a friend request.\nSwipe left to skip.',
          [{ text: 'Got it!' }]
        );
        await AsyncStorage.setItem('hasShownGuide', 'true');
      }
    };

    const fetchData = async () => {
      console.log('fetchData started');
      if (cancelTokenSourceRef.current) cancelTokenSourceRef.current.cancel('New request initiated');
      cancelTokenSourceRef.current = axios.CancelToken.source();
      setIsLoading(true);
      setError(null);
      try {
        showInitialGuide();
        if (activeTab === 'requests') {
          console.log('Fetching friend requests');
          await fetchFriendRequests();
        } else {
          if (!currentUser) {
            console.log('Fetching current user');
            await fetchCurrentUser();
          }
          if (users.length === 0) {
            console.log('Fetching users');
            await fetchUsers();
          }
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error('fetchData error:', err);
          setError('Failed to load data. Please try again.');
        }
      } finally {
        console.log('fetchData finished, setting isLoading to false');
        setIsLoading(false);
      }
    };
    fetchData();
    return () => {
      console.log('Cleaning up useEffect');
      if (cancelTokenSourceRef.current) cancelTokenSourceRef.current.cancel('Component unmounted');
    };
  }, [activeTab, fetchFriendRequests, fetchCurrentUser, fetchUsers, currentUser, users.length]);

  return (
    <LinearGradient colors={['#A3BFFA', '#E6F0FA']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <HeaderComponent />
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'find' && styles.activeTab]}
            onPress={() => setActiveTab('find')}
          >
            <Text style={[styles.tabText, activeTab === 'find' && styles.activeTabText]}>Find Friends</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
            onPress={() => setActiveTab('requests')}
          >
            <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>Friend Requests</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4A90E2" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => (activeTab === 'requests' ? fetchFriendRequests() : fetchUsers())}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : activeTab === 'find' ? (
            users.length === 0 ? (
              <View style={styles.errorContainer}>
                <Text style={styles.noDataText}>No users found.</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchUsers}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <CardStack users={users} onSwipeRight={handleSwipeRight} onSwipeLeft={handleSwipeLeft} />
            )
          ) : (
            <RequestList
              requests={friendRequests}
              onRefresh={onRefresh}
              refreshing={refreshing}
              onAction={handleRequestAction}
            />
          )}
        </View>
      </SafeAreaView>
      <BottomNavbar />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: -50,
  },
  tab: { paddingVertical: 8, paddingHorizontal: 20 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#4A90E2' },
  tabText: { fontSize: 16, color: '#6B7280', fontFamily: 'Poppins-Regular' },
  activeTabText: { color: '#4A90E2', fontWeight: '600', fontFamily: 'Poppins-SemiBold' },
  content: { flex: 1, padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#4A90E2', fontFamily: 'Poppins-Regular' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  errorText: { fontSize: 16, color: '#EF4444', textAlign: 'center', marginBottom: 20, fontFamily: 'Poppins-Regular' },
  retryButton: { paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#4A90E2', borderRadius: 8 },
  retryButtonText: { color: '#FFF', fontSize: 16, fontFamily: 'Poppins-Medium' },
  noDataText: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginTop: 20, fontFamily: 'Poppins-Regular' },
});

export default FindFriendsScreen;