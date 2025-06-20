import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import BottomNavbar from '../Component/BottomNavbar';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import axios from 'axios';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

type RootStackParamList = {
  Welcome: undefined;
  // add other screens here if needed
};

const ProfileScreen: React.FC = () => {
  const scaleAnim = new Animated.Value(0);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const handleAvatarPress = () => {
    Alert.alert(
      'Change Avatar',
      'Do you want to change your avatar?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: handleChangeAvatar },
      ],
      { cancelable: true }
    );
  };

  const handleChangeAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const image = result.assets[0];

      const formData = new FormData();
      formData.append('file', {
        uri: image.uri,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      } as any);

      try {
        const response = await axios.post('http://192.168.10.233:7187/api/User/avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Nếu API trả về link ảnh mới (giả sử response.data = newAvatarUrl)
        const newAvatarUrl = response.data?.url || image.uri;

        // Cập nhật avatar ngay không cần reload
        setUserData(prev => ({
          ...prev,
          avatars: { $values: [newAvatarUrl] },
        }));

        alert('Avatar updated successfully');
      } catch (error) {
        console.error('Upload avatar error:', error);
        alert('Failed to upload avatar');
      }
    }
  };


  const [userData, setUserData] = useState<{
    name: string;
    age: number;
    bio: string;
    occupation: string;
    educationLevel: string;
    studyPreferences: { $values: string[] };
    subjects: { $values: string[] };
    avatars: { $values: any[] };
  }>({
    name: '',
    age: 0,
    bio: '',
    occupation: '',
    educationLevel: '',
    studyPreferences: { $values: [] },
    subjects: { $values: [] },
    avatars: { $values: [] },
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://192.168.10.233:7187/api/User/current-user');
        console.log('API Response:', response.data);
        setUserData({
          name: response.data.name || 'User',
          age: response.data.age || 0,
          bio: response.data.bio || 'No bio available',
          occupation: response.data.occupation || 'Not specified',
          educationLevel: response.data.educationLevel || 'Not specified',
          studyPreferences: { $values: response.data.studyPreferences || [] }, // Đảm bảo là object với $values
          subjects: { $values: response.data.subjects || [] }, // Đảm bảo là object với $values
          avatars: { $values: response.data.avatars || [] },
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData({
          name: 'User',
          age: 0,
          bio: 'No bio available',
          occupation: 'Not specified',
          educationLevel: 'Not specified',
          studyPreferences: { $values: [] },
          subjects: { $values: [] },
          avatars: { $values: [] },
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading]);

  const avatarUrl =
    userData.avatars && userData.avatars.$values && userData.avatars.$values.length > 0
      ? userData.avatars.$values[0]
      : 'https://randomuser.me/api/portraits/men/1.jpg';

  const tagConfigs = [
    ...(userData.studyPreferences.$values || []).map((pref: string, index: number) => ({
      key: `studyPreference_${index}`,
      value: pref,
      icon: 'book',
      color: '#F97316',
    })),
    ...(userData.studyPreferences.$values?.length === 0 || !userData.studyPreferences
      ? [{
        key: 'studyPreference',
        value: 'No info',
        icon: 'info-circle',
        color: '#F59E0B',
      }]
      : []),
    ...(userData.subjects.$values || []).map((subject: string, index: number) => ({
      key: `subject_${index}`,
      value: subject,
      icon: 'pencil',
      color: '#10B981',
    })),
    ...(userData.subjects.$values?.length === 0 || !userData.subjects
      ? [{
        key: 'subject',
        value: 'No info',
        icon: 'info-circle',
        color: '#EC4899',
      }]
      : []),
  ];

  return (
    <LinearGradient
      colors={['#E0F2FE', '#F0F9FF', '#F8FAFC']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.avatarWrapper, { transform: [{ scale: isLoading ? 0 : scaleAnim }] }]}>
            <TouchableOpacity onPress={handleAvatarPress}>
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                style={styles.avatarBorder}
              >
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatar}
                />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>


          <LinearGradient
            colors={['#FFFFFF', '#F8FAFC']}
            style={styles.card}
          >
            <View style={styles.header}>
              <Text style={styles.name}>{isLoading ? 'Loading...' : userData.name}</Text>
              <Text style={styles.jobTitle}>
                {isLoading ? 'Loading...' : `${userData.occupation || 'Not specified'} · ${userData.educationLevel || 'Not specified'}`}
              </Text>
              <Text style={styles.location}>{isLoading ? 'Loading...' : `${userData.age}, Ho Chi Minh City`}</Text>
            </View>

            <Text style={styles.description}>
              {isLoading ? 'Loading...' : userData.bio}
            </Text>

            <View style={styles.tagsContainer}>
              {isLoading ? null : tagConfigs.map((tag) => (
                <TouchableOpacity
                  key={tag.key}
                  style={[styles.tag, { backgroundColor: `${tag.color}22` }]}
                >
                  <FontAwesome name={tag.icon as any} size={16} color={tag.color} style={styles.tagIcon} />
                  <Text style={[styles.tagText, { color: tag.color }]}>{tag.value}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => console.log('Update Profile')}
              activeOpacity={0.85}
              style={styles.updateButton}
            >
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                style={styles.buttonGradient}
              >
                <Text style={styles.updateButtonText}>Update Profile</Text>
                <View style={styles.iconCircle}>
                  <FontAwesome name="pencil" size={16} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>


            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
              activeOpacity={0.85}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </LinearGradient>
        </ScrollView>

        <View style={styles.bottomNavbarContainer}>
          <BottomNavbar />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 100,
  },
  avatarWrapper: {
    position: 'absolute',
    top: 48,
    zIndex: 2,
    alignSelf: 'center',
    marginTop: -20,
  },
  avatarBorder: {
    borderRadius: 70,
    padding: 4,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: '#fff',
  },
  card: {
    marginTop: 100,
    width: CARD_WIDTH,
    borderRadius: 24,
    paddingTop: 80,
    paddingBottom: 32,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E3A8A',
    fontFamily: 'Poppins-Bold',
    marginBottom: 6,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
  },
  description: {
    fontSize: 15,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: 'Poppins-Regular',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 6,
  },
  changeAvatarButton: {
    marginTop: 10,
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#1D4ED8',
  },
  changeAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },

  tagIcon: {
    marginRight: 8,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  updateButton: {
    alignSelf: 'center',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 28,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    marginRight: 12,
  },
  iconCircle: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    padding: 8,
    borderRadius: 20,
  },
  bottomNavbarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  logoutButton: {
    marginTop: 16,
    alignSelf: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});

export default ProfileScreen;