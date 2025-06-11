import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import BottomNavbar from '../Component/BottomNavbar';

const { width } = Dimensions.get('window');
const FRIEND_ITEM_WIDTH = width > 600 ? width * 0.3 : width * 0.9;

interface Friend {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
}

const sampleFriends: Friend[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    avatar: 'https://randomuser.me/api/portraits/men/11.jpg',
    lastMessage: 'Chào bạn, hôm nay thế nào?',
    timestamp: '10:30 sáng',
  },
  {
    id: '2',
    name: 'Trần Thị B',
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    lastMessage: 'Chiều gặp nhé!',
    timestamp: 'Hôm qua',
  },
  {
    id: '3',
    name: 'Lê Văn C',
    avatar: 'https://randomuser.me/api/portraits/men/13.jpg',
    lastMessage: 'Xem thử link này nè!',
    timestamp: '2 ngày trước',
  },
  {
    id: '4',
    name: 'Phạm Thị Dung',
    avatar: 'https://randomuser.me/api/portraits/women/14.jpg',
    lastMessage: 'Làm bài xong chưa?',
    timestamp: '5 phút trước',
  },
  {
    id: '5',
    name: 'Hoàng Minh',
    avatar: 'https://randomuser.me/api/portraits/men/15.jpg',
    lastMessage: 'Tối nay chơi game không?',
    timestamp: '1 giờ trước',
  },
  {
    id: '6',
    name: 'Ngô Thảo',
    avatar: 'https://randomuser.me/api/portraits/women/16.jpg',
    lastMessage: 'Nhớ họp nhóm nha!',
    timestamp: '3 giờ trước',
  },
  {
    id: '7',
    name: 'Đặng Quang Huy',
    avatar: 'https://randomuser.me/api/portraits/men/17.jpg',
    lastMessage: 'Gửi mình tài liệu với!',
    timestamp: '8 giờ trước',
  },
  {
    id: '8',
    name: 'Lý Thu Hằng',
    avatar: 'https://randomuser.me/api/portraits/women/18.jpg',
    lastMessage: 'Mai có kiểm tra đó!',
    timestamp: 'Hôm qua',
  },
  {
    id: '9',
    name: 'Bùi Tiến Dũng',
    avatar: 'https://randomuser.me/api/portraits/men/19.jpg',
    lastMessage: 'Chơi Liên Quân không?',
    timestamp: '2 phút trước',
  },
  {
    id: '10',
    name: 'Vũ Diệu Linh',
    avatar: 'https://randomuser.me/api/portraits/women/20.jpg',
    lastMessage: 'Ăn trưa chưa đó?',
    timestamp: '12:00 trưa',
  },
];


const FriendListScreen: React.FC = () => {
  const navigation: any = useNavigation();

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => navigation.navigate('Chat', { friend: item })}
    >
      <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#E0F2FE', '#F0F9FF', '#F8FAFC']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chats</Text>
        </View>
        <View style={styles.friendListContainer}>
          {sampleFriends.length > 0 ? (
            <FlatList
              data={sampleFriends}
              renderItem={renderFriendItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.friendListContent}
            />
          ) : (
            <Text style={styles.noFriendsText}>No friends available</Text>
          )}
        </View>
      </SafeAreaView>
      <BottomNavbar/>
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
    marginBottom:50
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
});

export default FriendListScreen;