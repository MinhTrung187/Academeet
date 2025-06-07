import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import BottomNavbar from '../Component/BottomNavbar';
import HeaderComponent from '../Component/HeaderComponent';

type Friend = {
  id: string;
  name: string;
  age: number;
  city: string;
  field: string;
  avatar: string;
  online: boolean;
  bio: string;
  time: string;
  activity: string;
  level: string;
  group: string;
};

type UserDetailRouteProp = RouteProp<{ UserDetail: { friend: Friend; onAccept: () => void; onReject: () => void; onGoBack: () => void } }, 'UserDetail'>;

const UserDetail: React.FC = () => {
  const route = useRoute<UserDetailRouteProp>();
  const { friend, onAccept, onReject, onGoBack } = route.params;
  const { width } = Dimensions.get('window');

  return (
    <>
    <SafeAreaView style={styles.safeArea}>
      <HeaderComponent/>
      <View style={styles.container}>
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: friend.avatar }} style={styles.avatar} />
          {friend.online && <View style={styles.onlineIndicator} />}
        </View>
        <Text style={styles.name}>{friend.name}</Text>
        <Text style={styles.info}>{friend.age}, {friend.city}</Text>
        <View style={styles.badgeContainer}>
          <TouchableOpacity style={[styles.badge, styles.rejectBadge]}>
            <Text style={styles.badgeText}>{friend.field}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.badge, styles.acceptBadge]}>
            <Text style={styles.badgeText}>{friend.level}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.bio}>{friend.bio}</Text>
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <FontAwesome name="clock-o" size={16} color="#FF6F61" />
            <Text style={styles.detailText}>{friend.time}</Text>
          </View>
          <View style={styles.detailItem}>
            <FontAwesome name="heartbeat" size={16} color="#4CAF50" />
            <Text style={styles.detailText}>{friend.activity}</Text>
          </View>
          <View style={styles.detailItem}>
            <FontAwesome name="users" size={16} color="#FFC107" />
            <Text style={styles.detailText}>{friend.group}</Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
            <FontAwesome name="times" size={40} color="#FF6F61" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
            <FontAwesome name="check" size={40} color="#4CAF50" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    <BottomNavbar/>
    </>
    
  );
};

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 20,
    alignItems: 'center',
    marginTop: 20, // Added to prevent overlap with header
  },
  avatarWrapper: {
    position: 'relative',
    marginTop: 0, // Removed negative margin to avoid overlap
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFDAB9',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  info: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '60%',
    marginBottom: 20,
  },
  badge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: '#fff', // Matching the image's badge style
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  rejectBadge: {
    backgroundColor: '#FFE4E1',
  },
  acceptBadge: {
    backgroundColor: '#E8F5E9',
  },
  badgeText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  bio: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 30,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '50%',
    marginBottom: 20,
  },
  rejectButton: {
    padding: 15,
    borderRadius: 50,
    backgroundColor: '#FFE4E1',
  },
  acceptButton: {
    padding: 15,
    borderRadius: 50,
    backgroundColor: '#E8F5E9',
  },
  backButton: {
    padding: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default UserDetail;