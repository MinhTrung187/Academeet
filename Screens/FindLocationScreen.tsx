import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native'; // Thêm useRoute
import HeaderComponent from '../Component/HeaderComponent';
import BottomNavbar from '../Component/BottomNavbar';

// Define types
interface Location {
  id: string;
  name: string;
  distanceFromYou: string;
  distanceFromPartner: string;
  time: string;
  image: string;
  details?: string;
}

interface Friend {
  id: string;
  name: string;
  avatar: string;
  distance: string;
}

interface RouteParams {
  userAddress?: string;
  coordinates?: { latitude: number; longitude: number };
}

const FindLocation: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute(); // Lấy tham số từ route
  const { userAddress, coordinates } = route.params as RouteParams; // Truy cập userAddress và coordinates

  const [mode, setMode] = useState<'you' | 'friends' | null>(null);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [showLocations, setShowLocations] = useState(false);

  const locations: Location[] = [
    {
      id: '1',
      name: 'Katal Coffee',
      distanceFromYou: '2.4',
      distanceFromPartner: '8.7',
      time: '24h',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      details: 'A cozy coffee shop with great ambiance and free Wi-Fi.',
    },
    {
      id: '2',
      name: 'Loxa Library',
      distanceFromYou: '4.2',
      distanceFromPartner: '7',
      time: '24h',
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
      details: 'Quiet library with a vast collection of books.',
    },
    {
      id: '3',
      name: 'The Coffee House',
      distanceFromYou: '7.8',
      distanceFromPartner: '8.7',
      time: '7am - 10pm',
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
      details: 'Popular spot with affordable drinks and outdoor seating.',
    },
  ];

  const friends: Friend[] = [
    {
      id: '1',
      name: 'Le Thanh Hong Khan',
      avatar: 'https://randomuser.me/api/portraits/women/79.jpg',
      distance: '2.1 km',
    },
    {
      id: '2',
      name: 'Nguyen Minh Trung',
      avatar: 'https://randomuser.me/api/portraits/men/34.jpg',
      distance: '3.5 km',
    },
    {
      id: '3',
      name: 'Tran Thi My Linh',
      avatar: 'https://randomuser.me/api/portraits/women/48.jpg',
      distance: '4.8 km',
    },
  ];

  const renderLocationItem = ({ item }: { item: Location }) => (
    <TouchableOpacity
      style={styles.locationCard}
      // @ts-ignore
      onPress={() => navigation.navigate('LocationDetail', { location: item })}
    >
      <Image source={{ uri: item.image }} style={styles.locationImage} />
      <View style={styles.locationInfo}>
        <Text style={styles.locationName}>{item.name}</Text>
        <Text style={styles.locationDetail}>
          <Ionicons name="location-outline" size={14} color="#7D7D7D" /> {item.distanceFromYou} km from you
        </Text>
        <Text style={styles.locationDetail}>
          <Ionicons name="location-outline" size={14} color="#7D7D7D" /> {item.distanceFromPartner} km from partner
        </Text>
        <Text style={styles.locationTime}>
          <Ionicons name="time-outline" size={14} color="#27AE60" /> {item.time}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderFriendItem = ({ item }: { item: Friend }) => {
    const isSelected = selectedFriends.includes(item.id);
    return (
      <View style={styles.friendItem}>
        <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.name}</Text>
          <Text style={styles.friendDistance}>
            <Ionicons name="navigate-outline" size={14} color="#7D7D7D" /> {item.distance}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.customToggle, isSelected && styles.customToggleSelected]}
          onPress={() =>
            setSelectedFriends((prev) =>
              isSelected ? prev.filter((id) => id !== item.id) : [...prev, item.id]
            )
          }
        >
          {isSelected && <Ionicons name="checkmark-circle" size={20} color="#4A90E2" />}
        </TouchableOpacity>
      </View>
    );
  };

  const calculateAverageDistance = () => {
    return locations.map((location) => {
      const totalDistance = parseFloat(location.distanceFromYou) + parseFloat(location.distanceFromPartner);
      const avgDistance = totalDistance / 2;
      return { ...location, avgDistance };
    }).sort((a, b) => (a.avgDistance ?? 0) - (b.avgDistance ?? 0));
  };

  const handleFindLocations = () => {
    if (selectedFriends.length > 0) {
      setShowLocations(true);
    }
  };

  return (
    <LinearGradient colors={['#E6F0FA', '#F6F8FC']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <HeaderComponent />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
          {/* Hiển thị địa chỉ người dùng */}
          {userAddress && (
            <View style={styles.addressContainer}>
              <Text style={styles.addressTitle}>Your Current Location:</Text>
              <Text style={styles.addressText}>
                <Ionicons name="location-outline" size={16} color="#4A90E2" /> {userAddress}
              </Text>
              {coordinates && (
                <Text style={styles.coordinatesText}>
                  <Ionicons name="map-outline" size={16} color="#4A90E2" /> Coordinates: {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
                </Text>
              )}
            </View>
          )}

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Find Location For</Text>
          </View>
          {!mode ? (
            <>
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: 'https://media.tenor.com/57TRBE6D9C8AAAAe/location-graphics.png' }}
                  style={styles.placeholderImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.optionContainer}>
                <TouchableOpacity
                  style={[styles.optionButton, { backgroundColor: '#4A90E2' }]}
                  onPress={() => setMode('you')}
                >
                  <Ionicons name="person-outline" size={24} color="#FFFFFF" />
                  <Text style={styles.optionText}>Just You</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionButton, { backgroundColor: '#50C878' }]}
                  onPress={() => setMode('friends')}
                >
                  <Ionicons name="people-outline" size={24} color="#FFFFFF" />
                  <Text style={styles.optionText}>You & Friends</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : mode === 'you' ? (
            <FlatList
              data={locations}
              renderItem={renderLocationItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.friendsContainer}>
              <Text style={styles.sectionTitle}>Select Friends</Text>
              <FlatList
                data={friends}
                renderItem={renderFriendItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                scrollEnabled={false}
              />
              <TouchableOpacity
                style={[styles.findButton, selectedFriends.length === 0 && styles.findButtonDisabled]}
                onPress={handleFindLocations}
                disabled={selectedFriends.length === 0}
              >
                <Ionicons name="search-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.findButtonText}>Find Locations</Text>
              </TouchableOpacity>
              {showLocations && selectedFriends.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Suggested Locations</Text>
                  <FlatList
                    data={calculateAverageDistance()}
                    renderItem={renderLocationItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    scrollEnabled={false}
                  />
                </>
              )}
            </View>
          )}
          {mode && (
            <TouchableOpacity style={styles.moreButton}>
              <Ionicons name="compass-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.moreButtonText}>Find More</Text>
            </TouchableOpacity>
          )}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
      <BottomNavbar />
    </LinearGradient>
  );
};

// Cập nhật styles để thêm giao diện cho phần địa chỉ
const styles = StyleSheet.create({
  gradient: {
    
    flex: 1,
  },
  container: {
    
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  addressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 16,
    color: '#4A90E2',
    marginVertical: 2,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#4A90E2',
    marginVertical: 2,
  },
  titleContainer: {
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
    letterSpacing: 0.5,
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderImage: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 60,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    width: '48%',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  friendsContainer: {
    paddingHorizontal: 16,
  },
  list: {
    paddingBottom: 20,
  },
  locationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 12,
    marginVertical: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationImage: {
    width: 100,
    height: 100,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  locationName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  locationDetail: {
    fontSize: 14,
    color: '#7D7D7D',
    marginVertical: 2,
  },
  locationTime: {
    fontSize: 14,
    color: '#27AE60',
    fontWeight: '500',
    marginTop: 2,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 12,
    marginVertical: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  friendDistance: {
    fontSize: 14,
    color: '#7D7D7D',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginVertical: 12,
    textAlign: 'left',
  },
  customToggle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#BDC3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customToggleSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#E6F0FA',
  },
  findButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#4A90E2',
    borderRadius: 30,
    justifyContent: 'center',
    marginVertical: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  findButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  findButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#50C878',
    borderRadius: 30,
    justifyContent: 'center',
    marginVertical: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginHorizontal: 16,
  },
  moreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  bottomSpacer: {
    height: 80,
  },
});

export default FindLocation;