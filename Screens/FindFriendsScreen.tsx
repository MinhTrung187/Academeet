import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavbar from '../Component/BottomNavbar';
import { useNavigation } from '@react-navigation/native';
import HeaderComponent from '../Component/HeaderComponent';
import axios from 'axios';

const FindFriendsScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState('Near me');
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'find' | 'requests'>('find');
  const [friendRequests, setFriendRequests] = useState<
    Array<{
      $id: string;
      senderId: string;
      senderName: string;
      recipientId: string;
      recipientName: string;
      sentAt: string;
      status: string;
    }>
  >([]);
  const [users, setUsers] = useState<
    Array<{
      id: string;
      name: string;
      age: number;
      bio?: string;
      occupation?: string;
      educationLevel?: string;
      studyPreferences: { $values: string[] };
      subjects: { $values: string[] };
      avatars: { $values: string[] };
    }>
  >([]);

  const handleRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      await axios.post(`/api/FriendRequest/${action}`, { requestId });
      setFriendRequests((prev) =>
        prev.map((r) =>
          r.$id === requestId ? { ...r, status: action === 'accept' ? 'Accepted' : 'Rejected' } : r
        )
      );
    } catch (error) {
      console.error(`Error ${action}ing friend request:`, error);
    }
  };

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const response = await axios.get('http://172.16.1.117:7187/api/FriendRequest/received');
        if (response.data.$values) {
          setFriendRequests(response.data.$values);
        }
      } catch (error) {
        console.error('Error fetching friend requests:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://172.16.1.117:7187/api/User/users');
        if (response.data.$values) {
          setUsers(response.data.$values);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (activeTab === 'requests') {
      fetchFriendRequests();
    } else {
      fetchUsers();
    }
  }, [activeTab]);

  const filters = ['Near me', 'Related Field', 'Hobbies', 'Study'];

const handleCardPress = (userId: string) => {
  const user = users.find((u) => u.id === userId);
  if (user) {
    //@ts-ignore
    navigation.navigate('UserDetail', {
      friend: {
        id: user.id,
        name: user.name,
        age: user.age,
        bio: user.bio || 'No bio available',
        field: user.occupation || 'Unknown',
        avatar: user.avatars.$values[0] || 'https://randomuser.me/api/portraits/lego/1.jpg',
        online: true, // API does not provide online status, default to true
        time: user.studyPreferences?.$values[0] || 'Unknown',
        activity: user.studyPreferences?.$values[1] || 'Unknown',
        level: user.educationLevel || 'Unknown',
        group: user.studyPreferences?.$values.includes('Discussion-based') ? 'Team' : 'Solo',
        studyPreferences: user.studyPreferences?.$values || [], // Ensure array
        subjects: user.subjects?.$values || [], // Ensure array
      },
      onAccept: () => {
        console.log('Accepted:', user.name);
        navigation.goBack();
      },
      onReject: () => {
        console.log('Rejected:', user.name);
        navigation.goBack();
      },
      onGoBack: () => navigation.goBack(),
    });
  }
};

  return (
    <>
      <LinearGradient colors={['#E6F0FA', '#C1E0FC', '#A3BFFA']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <HeaderComponent />
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'find' && styles.activeTab]}
              onPress={() => setActiveTab('find')}
            >
              <Text style={[styles.tabText, activeTab === 'find' && styles.activeTabText]}>
                Find Friends
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
              onPress={() => setActiveTab('requests')}
            >
              <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
                Friend Requests
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            {activeTab === 'find' ? (
              <>
                <View style={styles.filterContainer}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 10 }}
                  >
                    {filters.map((filter, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.filterButton,
                          selectedFilter === filter && styles.activeFilter,
                        ]}
                        onPress={() => setSelectedFilter(filter)}
                      >
                        <Text
                          style={[
                            styles.filterText,
                            selectedFilter === filter && styles.activeFilterText,
                          ]}
                        >
                          {filter}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <ScrollView style={styles.cardContainer} contentContainerStyle={{ paddingBottom: 20 }}>
                  {users.map((user) => (
                    <TouchableOpacity
                      key={user.id}
                      style={styles.card}
                      onPress={() => handleCardPress(user.id)}
                    >
                      <View style={[styles.cardInner, { backgroundColor: '#F9FEFF' }]}>
                        <View style={styles.avatarContainer}>
                          <View style={styles.avatarBox}>
                            <Image
                              source={{
                                uri: user.avatars.$values[0] || 'https://randomuser.me/api/portraits/lego/1.jpg',
                              }}
                              style={styles.avatar}
                            />
                          </View>
                        </View>
                        <View style={styles.infoContainer}>
                          <Text style={styles.cardName}>{user.name}</Text>
                          <Text style={styles.cardSub}>{user.age}, "12km from you"</Text>
                          <View style={styles.row}>
                            <FontAwesome name="gift" size={14} color="#EF5DA8" style={{ marginRight: 6 }} />
                            <Text style={styles.cardField}>{user.occupation || 'Unknown'}</Text>
                          </View>
                          <View style={styles.row}>
                            <FontAwesome name="eye" size={14} color="#10B981" style={{ marginRight: 6 }} />
                            <Text style={[styles.statusText, { color: '#10B981' }]}>Online</Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            ) : (
              <ScrollView style={styles.cardContainer} contentContainerStyle={{ paddingBottom: 20 }}>
                <Text style={styles.sectionTitle}>Friend Requests</Text>
                {friendRequests.map((request) => (
                  <View key={request.$id} style={styles.requestCard}>
                    <View style={styles.requestHeader}>
                      <Image
                        source={{ uri: `https://api.adorable.io/avatars/50/${request.senderId}` }}
                        style={styles.requestAvatar}
                      />
                      <View style={styles.requestInfo}>
                        <Text style={styles.requestName}>{request.senderName}</Text>
                        <Text style={styles.requestTime}>
                          {new Date(request.sentAt).toLocaleString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.requestActions}>
                      {request.status === 'Pending' && (
                        <>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleRequestAction(request.$id, 'accept')}
                          >
                            <Text style={styles.actionText}>Accept</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.rejectButton]}
                            onPress={() => handleRequestAction(request.$id, 'reject')}
                          >
                            <Text style={styles.actionText}>Reject</Text>
                          </TouchableOpacity>
                        </>
                      )}
                      {request.status !== 'Pending' && (
                        <Text style={styles.requestStatus}>{request.status}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
      <BottomNavbar />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4A90E2',
  },
  tabText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  activeTabText: {
    color: '#4A90E2',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  filterContainer: {
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  filterButton: {
    height: 38,
    paddingHorizontal: 18,
    borderRadius: 19,
    backgroundColor: '#F5F7FA',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  activeFilter: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  filterText: {
    fontSize: 15,
    color: '#374151',
    fontFamily: 'Poppins-Regular',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  cardContainer: {
    paddingHorizontal: 15,
    marginBottom: 60,
  },
  card: {
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#E1F3FF',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardInner: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  avatarContainer: {
    padding: 6,
  },
  avatarBox: {
    width: 80,
    height: 80,
    backgroundColor: '#FFEDD5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Poppins-Bold',
  },
  cardSub: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Poppins-Regular',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  cardField: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4B5563',
    fontFamily: 'Poppins-Medium',
  },
  statusText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    paddingHorizontal: 15,
    marginVertical: 10,
    fontFamily: 'Poppins-Bold',
  },
  requestCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 12,
    marginHorizontal: 15,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  requestInfo: {
    marginLeft: 12,
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Poppins-SemiBold',
  },
  requestTime: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    marginLeft: 10,
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  actionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  requestStatus: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    textAlign: 'right',
  },
});

export default FindFriendsScreen;