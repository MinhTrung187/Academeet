import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios'; // Giả sử bạn đã cài đặt axios

const HeaderComponent = () => {
  const { width } = Dimensions.get('window');
  const [userName, setUserName] = useState<string>(''); // State cho tên người dùng
  const [avatarUrl, setAvatarUrl] = useState<string>(''); // State cho avatar người dùng

  const [isLoading, setIsLoading] = useState<boolean>(true); // Thêm trạng thái loading

  // Fetch dữ liệu người dùng
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true); // Bắt đầu loading
      try {
        const response = await axios.get<{ name: string, avatarUrl: string }>('https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/User/current-user');
        setUserName(response.data.name);
        setAvatarUrl(response.data.avatarUrl || 'https://randomuser.me/api/portraits/men/1.jpg');
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserName('User'); // Giá trị mặc định nếu API thất bại
      } finally {
        setIsLoading(false); // Kết thúc loading
      }
    };
    fetchUserData();
  }, []);

  return (
    <LinearGradient
      colors={['#634fee', '#1553f6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <View style={styles.userInfo}>
        <Image
          source={{ uri: avatarUrl }}
          style={styles.avatarLarge}
        />
        <View style={styles.userTextContainer}>
          <Text style={styles.userName}>{isLoading ? 'Loading...' : userName}</Text>
          <Text style={styles.title}>Find your study mate 🎓</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
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
});

export default HeaderComponent;