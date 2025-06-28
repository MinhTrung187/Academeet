import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import axios from 'axios';
import { Dimensions } from 'react-native';


type BottomNavbarProps = {
  currentScreen?: 'Home' | 'FindFriend' | 'StudyTool' | 'AIScreen' | 'FindLocation';
};

type RootStackParamList = {
  Home: undefined;
  FindFriend: undefined;
  StudyTool: undefined;
  AIScreen: undefined;
  FindLocation: { userAddress?: string; coordinates?: { latitude: number; longitude: number } };
  BasicInfo: undefined;
  MyProfile: undefined;
  Premium: undefined;
};

const { width } = Dimensions.get('window');
const isSmallDevice = width < 360;
const tabWidth = width / 6.5; // responsive chia 6.5 phần (số tab = 6)

const BottomNavbar: React.FC<BottomNavbarProps> = ({ currentScreen }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const currentRouteName = route.name as keyof RootStackParamList;
  const activeScreen = currentScreen || currentRouteName;

  const tabs = [
    { name: 'Home', icon: 'home', iconLib: 'Feather', symbol: 'Home' },
    { name: 'FindFriend', icon: 'user-plus', iconLib: 'FontAwesome', symbol: 'Friend' },
    { name: 'StudyTool', icon: 'pencil-square-o', iconLib: 'FontAwesome', symbol: 'StudyTool' },
    { name: 'AIScreen', icon: 'cogs', iconLib: 'FontAwesome', symbol: 'AIChat' },
    { name: 'FindLocation', icon: 'map-marker', iconLib: 'FontAwesome', symbol: 'Location' },
    { name: 'MyProfile', icon: 'user-circle', iconLib: 'FontAwesome', symbol: 'Profile' }, // 👈 thêm dòng này

  ];

  const handleFindFriendPress = async () => {
    try {
      const response = await axios.get('https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/User/current-user');
      const user = response.data;

      if (user.bio && user.bio.trim() !== '') {
        navigation.navigate('FindFriend');
      } else {
        navigation.navigate('BasicInfo');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      navigation.navigate('BasicInfo');
    }
  };

  const handleFindLocationPress = async () => {
    try {
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const permissionResponse = await Location.requestForegroundPermissionsAsync();
        status = permissionResponse.status;
        if (status !== 'granted') {
          alert('Permission to access location was denied');
          return;
        }
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      let addressResponse = await Location.reverseGeocodeAsync({ latitude, longitude });
      const address = addressResponse[0];
      const fullAddress = `${address.street || ''}, ${address.city || ''}, ${address.region || ''}, ${address.country || ''}`;

      navigation.navigate('FindLocation', { userAddress: fullAddress, coordinates: { latitude, longitude } });
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Could not fetch location. Please try again.');
    }
  };

  return (
    <LinearGradient
      colors={['#634fee', '#1553f6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      {tabs.map((tab) => {
        const isActive = activeScreen === tab.name;
        const IconComponent = tab.iconLib === 'Feather' ? Feather : FontAwesome;

        return (
          <TouchableOpacity
            key={tab.name}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => {
              if (!isActive) {
                if (tab.name === 'FindFriend') {
                  handleFindFriendPress();
                } else if (tab.name === 'FindLocation') {
                  handleFindLocationPress();
                } else if (tab.name === 'StudyTool') {
                  navigation.navigate('Premium');
                } else if (tab.name === 'AIScreen') {
                  navigation.navigate('AIScreen');
                } else {
                  navigation.navigate(tab.name as any);
                }
              }
            }}
            disabled={isActive}
            activeOpacity={0.7}
          >
            <IconComponent
              name={tab.icon as any}
              size={isSmallDevice ? 18 : 22} // 👈 responsive icon
              color={isActive ? '#FFFFFF' : '#D1D5DB'}
            />

            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.symbol}
            </Text>
            {isActive && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingBottom: 14,
    backgroundColor: 'transparent',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    width: tabWidth, // 👈 điều chỉnh chiều rộng tab
    paddingVertical: isSmallDevice ? 4 : 6,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabLabel: {
    fontSize: isSmallDevice ? 10 : 12,
    color: '#D1D5DB',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    marginTop: 4,
  },
});

export default BottomNavbar;