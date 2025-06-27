import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import BottomNavbar from '../Component/BottomNavbar';

const { width } = Dimensions.get('window');
const FRIEND_ITEM_WIDTH = width > 600 ? width * 0.3 : width * 0.9;

interface Friend {
  id: string;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  name: string;
  avatarUrl?: string;
  lastMessage?: string;
  timestamp?: string;
}

const FriendItem: React.FC<{ friend: Friend; onPress: () => void }> = ({ friend, onPress }) => {
  return (
    <TouchableOpacity style={styles.friendItem} onPress={onPress}>
      <Image
        source={{ uri: friend.avatarUrl || 'https://placekitten.com/200/200' }}
        style={styles.friendAvatar}
      />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{friend.user?.name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {friend.lastMessage || 'No message'}
        </Text>
      </View>
      <Text style={styles.timestamp}>{friend.timestamp || 'N/A'}</Text>
    </TouchableOpacity>
  );
};

const FriendListScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch('https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Relationship/friends', {
          method: 'GET',
          headers: {
            accept: '*/*',
          },
        });
        const data = await response.json();
        console.log('API Response:', data); // Kiểm tra dữ liệu API
        if (data && Array.isArray(data)) {
          const processedData = data.map((item, index) => ({
            ...item,
            id: item.id || `temp-id-${index}`, // Đảm bảo id duy nhất
            avatarUrl: item.avatarUrl || 'https://placekitten.com/200/200', // Đặt URL mặc định
          }));
          setFriends(processedData);
        } else {
          setFriends([]);
        }
      } catch (error) {
        console.error('Error fetching friends:', error);
        setFriends([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <FriendItem friend={item} onPress={() => navigation.navigate('Chat', { friend: item })} />
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <>
      <LinearGradient
        colors={['#E0F2FE', '#F0F9FF', '#F8FAFC']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Trò chuyện</Text>
          </View>
          <View style={styles.friendListContainer}>
            {friends.length > 0 ? (
              <FlatList
                data={friends}
                renderItem={renderFriendItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.friendListContent}
              />
            ) : (
              <Text style={styles.noFriendsText}>Không có bạn bè nào</Text>
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
    marginTop: StatusBar.currentHeight || 0,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#3B82F6',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  friendListContainer: {
    flex: 1,
    width: FRIEND_ITEM_WIDTH,
    padding: 16,
    alignSelf: 'center',
    marginBottom: 50,
  },
  friendListContent: {
    paddingBottom: 16,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#E2E8F0',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Poppins-SemiBold',
  },
  lastMessage: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
  },
  timestamp: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'Poppins-Regular',
  },
  noFriendsText: {
    textAlign: 'center',
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
  },
  loadingText: {
    textAlign: 'center',
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
    marginTop: 20,
  },
});

export default FriendListScreen;