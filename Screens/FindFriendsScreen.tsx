import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const FindFriendsScreen = () => {
  const friends = [
    {
      id: '1',
      name: 'Le Thanh Hong Khanh',
      age: 20,
      city: 'Ho Chi Minh City',
      field: 'Graphic Designer',
      avatar: 'https://example.com/avatar1.png',
      online: true,
      availability: 'Online',
    },
    {
      id: '2',
      name: 'Nguyen Phuoc Duy',
      age: 24,
      city: 'Ho Chi Minh City',
      field: 'Software Developer',
      avatar: 'https://example.com/avatar2.png',
      online: false,
      availability: 'Offline',
    },
    {
      id: '3',
      name: 'Nguyen Thi Khanh Vy',
      age: 20,
      city: 'Ho Chi Minh City',
      field: 'Graphic Designer',
      avatar: 'https://example.com/avatar3.png',
      online: true,
      availability: 'Online',
    },
  ];

  const filters = ['Near me', 'Related Field', 'Hobbies', 'Study'];

  return (
    <LinearGradient colors={['#E0F2FE', '#F0F9FF', '#F8FAFC']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Nguyen Minh Trung</Text>
            <Text style={styles.title}>Find your studymate</Text>
          </View>
          <TextInput
            style={styles.searchBar}
            placeholder="Search..."
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.filterContainer}>
          {filters.map((filter, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.filterButton, filter === 'Near me' && styles.activeFilter]}
              onPress={() => console.log(`Filter by ${filter}`)}
            >
              <Text style={styles.filterText}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.cardContainer}>
          {friends.map((friend) => (
            <View key={friend.id} style={styles.card}>
              <Image source={{ uri: friend.avatar }} style={styles.avatar} />
              <View style={styles.cardContent}>
                <Text style={styles.cardName}>{friend.name}</Text>
                <Text style={styles.cardDetails}>
                  {friend.age}, {friend.city}
                </Text>
                <Text style={styles.cardField}>{friend.field}</Text>
                <View style={styles.statusRow}>
                  <FontAwesome name="gift" size={12} color="#F59E0B" />
                  <Text style={styles.statusText}>{friend.availability}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
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
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  searchBar: {
    width: '100%',
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
  },
  activeFilter: {
    backgroundColor: '#FCD34D',
  },
  filterText: {
    fontSize: 14,
    color: '#4B5563',
  },
  cardContainer: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  cardDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginVertical: 2,
  },
  cardField: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 4,
  },
});

export default FindFriendsScreen;