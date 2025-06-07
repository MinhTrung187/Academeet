import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavbar from '../Component/BottomNavbar';
import { useNavigation } from '@react-navigation/native';
import HeaderComponent from '../Component/HeaderComponent';

const { width } = Dimensions.get('window');

const FindFriendsScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState('Near me');
  const navigation = useNavigation();

const friends = [
  {
    id: '1',
    name: 'Le Thanh Hong Khanh',
    age: 20,
    city: 'Ho Chi Minh City',
    field: 'Graphic Designer',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    online: true,
    bio: 'Hello! I love learning and collaborating with others to study methods. Open to exchange knowledge. Let’s learn together!',
    time: 'Morning',
    activity: 'Everyday',
    level: 'Junior',
    group: 'Solo'
  },
  {
    id: '2',
    name: 'Nguyen Phuoc Duy',
    age: 24,
    city: 'Ho Chi Minh City',
    field: 'Software Developer',
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    online: false,
    bio: 'Hi! Passionate about coding and problem-solving. Always eager to learn new tech stacks. Let’s code together!',
    time: 'Afternoon',
    activity: 'Weekends',
    level: 'Senior',
    group: 'Team'
  },
  {
    id: '3',
    name: 'Nguyen Thi Khanh Vy',
    age: 20,
    city: 'Ho Chi Minh City',
    field: 'Graphic Designer',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    online: true,
    bio: 'Hello! Creative soul who loves designing and sharing ideas. Open to collaborate on art projects!',
    time: 'Morning',
    activity: 'Everyday',
    level: 'Junior',
    group: 'Solo'
  },
  {
    id: '4',
    name: 'Pham Minh Tuan',
    age: 22,
    city: 'Da Nang',
    field: 'Web Developer',
    avatar: 'https://randomuser.me/api/portraits/men/51.jpg',
    online: true,
    bio: 'Hey! Enthusiastic about web development and UI design. Let’s build awesome websites together!',
    time: 'Afternoon',
    activity: 'Weekdays',
    level: 'Intermediate',
    group: 'Team'
  },
  {
    id: '5',
    name: 'Tran Bao Ngoc',
    age: 19,
    city: 'Ha Noi',
    field: 'UI/UX Designer',
    avatar: 'https://randomuser.me/api/portraits/women/48.jpg',
    online: false,
    bio: 'Hi! I enjoy creating user-friendly designs. Open to learning UX research techniques. Let’s design together!',
    time: 'Evening',
    activity: 'Everyday',
    level: 'Junior',
    group: 'Solo'
  },
  {
    id: '6',
    name: 'Le Van Hieu',
    age: 23,
    city: 'Hue',
    field: 'Mobile Developer',
    avatar: 'https://randomuser.me/api/portraits/men/19.jpg',
    online: true,
    bio: 'Hello! Passionate about mobile apps. Always ready to share coding tips. Let’s develop together!',
    time: 'Morning',
    activity: 'Weekends',
    level: 'Intermediate',
    group: 'Team'
  },
  {
    id: '7',
    name: 'Doan Thi Mai',
    age: 21,
    city: 'Ho Chi Minh City',
    field: 'Digital Marketer',
    avatar: 'https://randomuser.me/api/portraits/women/29.jpg',
    online: false,
    bio: 'Hi! Love exploring digital trends and strategies. Open to collaborate on marketing campaigns!',
    time: 'Afternoon',
    activity: 'Weekdays',
    level: 'Junior',
    group: 'Solo'
  },
  {
    id: '8',
    name: 'Nguyen Quang Duy',
    age: 24,
    city: 'Can Tho',
    field: 'Data Analyst',
    avatar: 'https://randomuser.me/api/portraits/men/88.jpg',
    online: true,
    bio: 'Hey! Data enthusiast who loves analyzing trends. Let’s work on data projects together!',
    time: 'Evening',
    activity: 'Everyday',
    level: 'Senior',
    group: 'Team'
  },
  {
    id: '9',
    name: 'Bui Thi Kim Ngan',
    age: 20,
    city: 'Da Nang',
    field: 'Marketing Student',
    avatar: 'https://randomuser.me/api/portraits/women/25.jpg',
    online: true,
    bio: 'Hello! Excited about marketing and branding. Open to learning from experienced peers!',
    time: 'Morning',
    activity: 'Weekends',
    level: 'Junior',
    group: 'Solo'
  },
  {
    id: '10',
    name: 'Tran Van Linh',
    age: 22,
    city: 'Ha Noi',
    field: 'Cybersecurity',
    avatar: 'https://randomuser.me/api/portraits/men/33.jpg',
    online: false,
    bio: 'Hi! Passionate about securing systems. Let’s discuss cybersecurity best practices!',
    time: 'Afternoon',
    activity: 'Weekdays',
    level: 'Intermediate',
    group: 'Team'
  },
  {
    id: '11',
    name: 'Nguyen Hoang Anh',
    age: 23,
    city: 'Ho Chi Minh City',
    field: 'AI Engineer',
    avatar: 'https://randomuser.me/api/portraits/men/43.jpg',
    online: true,
    bio: 'Hey! AI lover who enjoys machine learning. Open to collaborate on AI projects!',
    time: 'Evening',
    activity: 'Everyday',
    level: 'Senior',
    group: 'Solo'
  },
  {
    id: '12',
    name: 'Le My Duyen',
    age: 21,
    city: 'Da Lat',
    field: 'Psychology Student',
    avatar: 'https://randomuser.me/api/portraits/women/17.jpg',
    online: false,
    bio: 'Hello! Interested in human behavior and psychology. Let’s study together!',
    time: 'Morning',
    activity: 'Weekends',
    level: 'Junior',
    group: 'Solo'
  },
  {
    id: '13',
    name: 'Nguyen Dinh Khoa',
    age: 24,
    city: 'Vung Tau',
    field: 'Backend Developer',
    avatar: 'https://randomuser.me/api/portraits/men/61.jpg',
    online: true,
    bio: 'Hi! Backend coding is my passion. Open to sharing server-side knowledge!',
    time: 'Afternoon',
    activity: 'Weekdays',
    level: 'Intermediate',
    group: 'Team'
  },
  {
    id: '14',
    name: 'Phan Thi Thao',
    age: 22,
    city: 'Nha Trang',
    field: 'Finance Student',
    avatar: 'https://randomuser.me/api/portraits/women/54.jpg',
    online: false,
    bio: 'Hey! Love learning about finance and investments. Let’s exchange ideas!',
    time: 'Evening',
    activity: 'Everyday',
    level: 'Junior',
    group: 'Solo'
  },
  {
    id: '15',
    name: 'Tran Quoc Huy',
    age: 23,
    city: 'Hue',
    field: 'Game Developer',
    avatar: 'https://randomuser.me/api/portraits/men/27.jpg',
    online: true,
    bio: 'Hello! Game development is my dream. Open to collaborate on game ideas!',
    time: 'Morning',
    activity: 'Weekends',
    level: 'Intermediate',
    group: 'Team'
  },
];


  const filters = ['Near me', 'Related Field', 'Hobbies', 'Study'];

const handleCardPress = (friendId: string) => {
  const friend = friends.find(f => f.id === friendId);
  if (friend) {
    //@ts-ignore
    navigation.navigate('UserDetail', {
      friend,
      onAccept: () => {
        console.log('Accepted:', friend.name);
        navigation.goBack();
      },
      onReject: () => {
        console.log('Rejected:', friend.name);
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
          {/* Header */}
          <HeaderComponent/>

          {/* Body */}
          <View style={{ flex: 1 }}>
            {/* Filters */}
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

            {/* Friend Cards */}
            <ScrollView style={styles.cardContainer} contentContainerStyle={{ paddingBottom: 20 }}>
              {friends.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  style={styles.card}
                  onPress={() => handleCardPress(friend.id)}
                >
                  <View style={[styles.cardInner, {
                    backgroundColor: friend.online ? '#F9FEFF' : '#F5F5F5'
                  }]}>
                    {/* Avatar trong khung nền màu */}
                    <View style={styles.avatarContainer}>
                      <View style={styles.avatarBox}>
                        <Image source={{ uri: friend.avatar }} style={styles.avatar} />
                      </View>
                    </View>

                    {/* Info */}
                    <View style={styles.infoContainer}>
                      <Text style={styles.cardName}>{friend.name}</Text>
                      <Text style={styles.cardSub}>{friend.age}, {friend.city}</Text>

                      <View style={styles.row}>
                        <FontAwesome name="gift" size={14} color="#EF5DA8" style={{ marginRight: 6 }} />
                        <Text style={styles.cardField}>{friend.field}</Text>
                      </View>

                      <View style={styles.row}>
                        <FontAwesome name={friend.online ? 'eye' : 'eye-slash'} size={14} color={friend.online ? '#10B981' : '#EF4444'} style={{ marginRight: 6 }} />
                        <Text style={[styles.statusText, { color: friend.online ? '#10B981' : '#EF4444' }]}>
                          {friend.online ? 'Online' : 'Offline'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

              ))}
            </ScrollView>
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
  header: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  title: {
    fontSize: 18,
    color: '#F0F4FF',
    fontFamily: 'Poppins-Regular',
  },
  avatarLarge: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    borderWidth: 3,
    borderColor: '#fff',
  },
  searchIcon: {
    marginLeft: 10,
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
    marginBottom:60
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
  cardGradient: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#D6EEFF',
  },
  // avatar: {
  //   width: 60,
  //   height: 60,
  //   borderRadius: 30,
  //   borderWidth: 2,
  //   borderColor: '#fff',
  //   shadowColor: '#000',
  //   shadowOpacity: 0.1,
  //   shadowRadius: 5,
  // },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 12,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Poppins-Bold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  cardDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 5,
    fontFamily: 'Poppins-Regular',
  },
  cardField: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4B5563',
    fontFamily: 'Poppins-Medium',
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
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
  backgroundColor: '#FFEDD5', // Bạn có thể random màu theo người
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

});

export default FindFriendsScreen;