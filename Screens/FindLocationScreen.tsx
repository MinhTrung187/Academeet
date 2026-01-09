import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert, // Added Alert for error messages
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import BottomNavbar from '../Component/BottomNavbar';
import CafeDataFetcher from '../Component/CafeDataFetcher';
import axios from 'axios'; // Import axios
import * as SecureStore from 'expo-secure-store';

interface Location {
  id: string;
  name: string;
  distanceFromYou: string;
  distanceFromPartner: string;
  time: string;
  image: string;
  details: string;
  coordinates: [number, number];
  openingHours?: string;
  address?: string;
  cuisine?: string;
}

// Updated Friend interface to match API response structure
interface Friend {
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  chat?: { // Optional, as it's not directly used for location finding
    id: number;
    lastMessage?: {
      id: number;
      senderId: string;
      senderName: string;
      content: string;
      sentAt: string;
    };
  };
}

interface RouteParams {
  userAddress?: string;
  coordinates?: { latitude: number; longitude: number };
}

const FindLocation: React.FC = () => {
  const route = useRoute();
  const { userAddress, coordinates } = route.params as RouteParams;

  const [mode, setMode] = useState<'you' | 'friends' | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // State for current user's ID
  const [friends, setFriends] = useState<Friend[]>([]); // State for friends fetched from API
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]); // Changed to selectedFriendIds
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [showLocations, setShowLocations] = useState(false);
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [halfwayCoordinates, setHalfwayCoordinates] = useState<{ latitude: number; longitude: number } | null>(null); // New state for halfway coordinates
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  const navigation = useNavigation<any>();

  // Function to fetch current user data
  const fetchUserData = useCallback(async () => {
    try {
      const response = await axios.get<{ id: string; name: string }>(
        'https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/User/current-user',
        { withCredentials: true }
      );
      setCurrentUserId(response.data.id);
    } catch (error) {
      console.error('Error fetching current user data:', error);
      Alert.alert('Error', 'Failed to get current user info.');
      setCurrentUserId(null);
    }
  }, []);

  // Function to fetch friends from API
  const fetchFriends = useCallback(async () => {
    try {
      const response = await axios.get<Friend[]>(
        'https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Relationship/friends',
        { withCredentials: true }
      );
      setFriends(response.data || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
      Alert.alert('Error', 'Failed to load friend list.');
      setFriends([]);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
    fetchFriends();
  }, [fetchUserData, fetchFriends]);

  const handleCafesFetched = (cafes: Location[]) => {
    setLocations(cafes);
    setIsLoading(false);
    setShowLocations(true);
    setHasFetched(true);
  };
  useEffect(() => {
    const loadSubscription = async () => {
      const sub = await SecureStore.getItemAsync('subscription');
      setSubscriptionId(sub || 'freemium');
      console.log('Loaded subscription:', sub);
    };
    loadSubscription();
  }, []);

  const handleFindLocations = async () => {
    if (mode === 'you') {
      setIsLoading(true);
      setShowLocations(true);
      setHasFetched(false); // Ensure fetch for 'you' mode
      // CafeDataFetcher will be triggered by `coordinates` from route params
    } else if (mode === 'friends') {
      if (!currentUserId) {
        Alert.alert('Error', 'Current user ID not available. Cannot find halfway location.');
        return;
      }
      if (selectedFriendIds.length === 0) {
        Alert.alert('Selection Required', 'Please select at least one friend to find a halfway location.');
        return;
      }

      setIsLoading(true);
      setShowLocations(false); // Reset locations display
      setHalfwayCoordinates(null); // Reset halfway coordinates

      try {
  const allUserIds = [currentUserId, ...selectedFriendIds];
  const queryParams = new URLSearchParams();
  allUserIds.forEach(id => queryParams.append('userIds', id));
  queryParams.append("subscriptionId", subscriptionId ?? "freemium");

  const url = `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Location/halfway/userids?${queryParams.toString()}`;

  const response = await axios.get<{ latitude: number; longitude: number }>(
    url,
    { withCredentials: true }
  );

  if (
    response.data &&
    typeof response.data.latitude === 'number' &&
    typeof response.data.longitude === 'number'
  ) {
    setHalfwayCoordinates(response.data);
    setShowLocations(true);
    setHasFetched(false);
  } else {
    Alert.alert('Error', 'Invalid halfway coordinates received.');
    setIsLoading(false);
  }

} catch (error: any) {
  if (axios.isAxiosError(error)) {
    if (
      error.response?.status === 403 &&
      error.response?.data?.toString().includes("Feature limit reached")
    ) {
      Alert.alert(
        "Feature Limit Reached",
        "You’ve used all your location searches for the current plan. Upgrade to continue.",
        [
          { text: "Maybe Later", style: "cancel" },
          {
            text: "Upgrade Now",
            onPress: () => navigation.navigate("Premium"),
          },
        ]
      );
      return;
    }
  }

  console.error('Error fetching halfway location:', error);
  Alert.alert(
    'Error',
    `Failed to find halfway location: ${error.response?.data?.message || error.message}`
  );
  setIsLoading(false);
}
    }
  };

  const renderLocationItem = ({ item }: { item: Location }) => (
    <TouchableOpacity
      style={styles.locationCard}
      onPress={() => navigation.navigate('LocationDetail', { location: item })}
    >
      <Image source={{ uri: item.image }} style={styles.locationImage} />
      <View style={styles.locationInfo}>
        <Text style={styles.locationName}>{item.name}</Text>
        <Text style={styles.locationDetail}>
          <Ionicons name="location-outline" size={14} color="#7D7D7D" /> {item.distanceFromYou} from you
        </Text>
        {item.distanceFromPartner && ( // Only show if available
          <Text style={styles.locationDetail}>
            <Ionicons name="people-outline" size={14} color="#7D7D7D" /> {item.distanceFromPartner} from friends
          </Text>
        )}
        <Text style={styles.locationTime}>
          <Ionicons name="time-outline" size={14} color="#27AE60" /> {item.time}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderFriendItem = ({ item }: { item: Friend }) => {
    const isSelected = selectedFriendIds.includes(item.user.id);
    return (
      <View style={styles.friendItem}>
        <Image source={{ uri: item.user.avatarUrl || `https://placehold.co/50x50/aabbcc/ffffff?text=${item.user.name.charAt(0)}` }} style={styles.friendAvatar} />
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.user.name}</Text>
          {/* You might not have distance for friends directly from this API, adjust as needed */}
          {/* <Text style={styles.friendDistance}>
            <Ionicons name="navigate-outline" size={14} color="#7D7D7D" /> {item.distance}
          </Text> */}
        </View>
        <TouchableOpacity
          style={[styles.customToggle, isSelected && styles.customToggleSelected]}
          onPress={() =>
            setSelectedFriendIds((prev) =>
              isSelected ? prev.filter((id) => id !== item.user.id) : [...prev, item.user.id]
            )
          }
        >
          {isSelected && <Ionicons name="checkmark-circle" size={20} color="#4A90E2" />}
        </TouchableOpacity>
      </View>
    );
  };

  const renderLocationsSection = () => {
    const currentLocations = locations; // Use 'locations' state directly
    const visibleLocations = showAllLocations ? currentLocations : currentLocations.slice(0, 3);

    if (isLoading) {
      return <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 20 }} />;
    }

    if (showLocations && currentLocations.length > 0) {
      return (
        <>
          {visibleLocations.map((item) => (
            <View key={item.id}>{renderLocationItem({ item })}</View>
          ))}

          {!showAllLocations && currentLocations.length > 3 && (
            <TouchableOpacity style={styles.findMoreButton} onPress={() => setShowAllLocations(true)}>
              <Text style={styles.findMoreButtonText}>Find more</Text>
            </TouchableOpacity>
          )}
        </>
      );
    }

    if (showLocations && currentLocations.length === 0 && hasFetched) {
      return <Text style={styles.noResult}>No suitable location found.</Text>;
    }

    return null; // Don't show anything until locations are explicitly requested/fetched
  };


  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isLoading) {
      timeoutId = setTimeout(() => {
        // Only set isLoading to false if still loading after timeout and no data fetched yet
        if (!hasFetched) {
          setIsLoading(false);
          Alert.alert('Timeout', 'Failed to load locations within expected time. Please try again.');
        }
      }, 15000); // Increased timeout to 15 seconds
    }
    return () => clearTimeout(timeoutId);
  }, [isLoading, hasFetched]);

  return (
    <LinearGradient colors={['#E6F0FA', '#F6F8FC']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        {/* CafeDataFetcher for 'you' mode */}
        {mode === 'you' && coordinates && isLoading && !hasFetched && (
          <CafeDataFetcher
            latitude={coordinates.latitude}
            longitude={coordinates.longitude}
            onCafesFetched={handleCafesFetched}
          />
        )}
        {/* CafeDataFetcher for 'friends' mode */}
        {mode === 'friends' && halfwayCoordinates && isLoading && !hasFetched && (
          <CafeDataFetcher
            latitude={halfwayCoordinates.latitude}
            longitude={halfwayCoordinates.longitude}
            onCafesFetched={handleCafesFetched}
          />
        )}

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {userAddress && (
            <View style={styles.addressBox}>
              <Text style={styles.addressTitle}>Your current location:</Text>
              <Text style={styles.addressText}>
                <Ionicons name="location-outline" size={16} color="#4A90E2" /> {userAddress}
              </Text>
              {coordinates && (
                <>
                  <Text style={styles.addressTitle}>Latitude:</Text>
                  <Text style={styles.addressText}>{coordinates.latitude}</Text>
                  <Text style={styles.addressTitle}>Longitude:</Text>
                  <Text style={styles.addressText}>{coordinates.longitude}</Text>
                </>
              )}
            </View>
          )}


          {!mode ? (
            <View style={styles.modeSelector}>
              <Image
                source={{ uri: 'https://ouch-cdn2.icons8.com/LoKjEX6A3r9I9aQ1LfMg3HzD4X1NjOWQYXv6xCTAbf0/rs:fit:368:395/czM6Ly9pY29uczgvZXNzZW50aWFscy1vbmJvYXJkaW5nLnBuZw.png' }}
                style={styles.illustration}
              />
              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: '#4A90E2' }]}
                onPress={() => {
                  setMode('you');
                  setIsLoading(true);
                  setShowLocations(true);
                  setHasFetched(false); // Ensure fetch for 'you' mode
                  setLocations([]); // Clear previous locations
                  setHalfwayCoordinates(null); // Clear halfway coordinates
                }}
              >
                <Ionicons name="person-outline" size={20} color="white" />
                <Text style={styles.optionText}>Only me</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: '#50C878' }]}
                onPress={() => {
                  setMode('friends');
                  setShowLocations(false); // Hide locations until friends are selected and found
                  setLocations([]); // Clear previous locations
                  setHalfwayCoordinates(null); // Clear halfway coordinates
                }}
              >
                <Ionicons name="people-outline" size={20} color="white" />
                <Text style={styles.optionText}>Me & Friends</Text>
              </TouchableOpacity>
            </View>
          ) : mode === 'you' ? (
            <>
              <Text style={styles.sectionTitle}>Cafes near you</Text>
              {renderLocationsSection()}
            </>
          ) : ( // mode === 'friends'
            <>
              <Text style={styles.sectionTitle}>Select friends</Text>
              {friends.length === 0 && !isLoading ? (
                <Text style={styles.noResult}>No friends found. Add friends to use this feature.</Text>
              ) : (
                <FlatList
                  data={friends}
                  renderItem={renderFriendItem}
                  keyExtractor={(item) => item.user.id}
                  scrollEnabled={false}
                />
              )}

              <TouchableOpacity
                style={[
                  styles.findButton,
                  (selectedFriendIds.length === 0 || isLoading) && { backgroundColor: '#CCC' },
                ]}
                onPress={handleFindLocations}
                disabled={selectedFriendIds.length === 0 || isLoading}
              >
                <Ionicons name="search-outline" size={20} color="#FFF" />
                <Text style={styles.findButtonText}>Find locations</Text>
              </TouchableOpacity>

              {halfwayCoordinates && (
                <View style={styles.addressBox}>
                  <Text style={styles.addressTitle}>Halfway point:</Text>
                  <Text style={styles.addressText}>
                    <Ionicons name="location-outline" size={16} color="#4A90E2" /> Lat: {halfwayCoordinates.latitude.toFixed(6)}, Lng: {halfwayCoordinates.longitude.toFixed(6)}
                  </Text>
                </View>
              )}

              {renderLocationsSection()}
            </>
          )}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Bookmarks</Text>

          </View>
          <TouchableOpacity
            style={styles.viewBookmarksButton}
            onPress={() => navigation.navigate('ViewBookmarksScreen')}
          >
            <Ionicons name="bookmarks-outline" size={24} color="#FFFFFF" />
            <Text style={styles.viewBookmarksButtonText}>View All Bookmarked Locations</Text>
            <Ionicons name="arrow-forward-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
      <BottomNavbar />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  addressBox: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    marginBottom: 10,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  addressText: { fontSize: 14, color: '#4A90E2' },
  modeSelector: { alignItems: 'center' },
  illustration: {
    width: 250,
    height: 250,
    marginVertical: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  optionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  locationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 12,
    marginVertical: 8,
    borderRadius: 15,
    elevation: 3,
  },
  locationImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  locationInfo: {
    marginLeft: 12,
    flex: 1,
    justifyContent: 'center',
  },
  locationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
  },
  locationDetail: {
    fontSize: 13,
    color: '#7D7D7D',
  },
  locationTime: {
    fontSize: 13,
    color: '#27AE60',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginVertical: 12,
  },
  findButton: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    padding: 14,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  findButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  findMoreButton: {
    alignSelf: 'center',
    backgroundColor: '#50C878',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 10,
  },
  findMoreButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  friendItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    marginVertical: 6,
    alignItems: 'center',
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
  },
  friendDistance: {
    fontSize: 13,
    color: '#7D7D7D',
  },
  customToggle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customToggleSelected: {
    backgroundColor: '#E6F0FA',
    borderColor: '#4A90E2',
  },
  noResult: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginVertical: 20,
  },
  sectionHeader: { // Re-added for "Your Bookmarks" section
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  seeAllText: { // Re-added for "View all" button
    fontSize: 14,
    color: '#3B82F6',
    fontFamily: 'Poppins-Medium',
    padding: 8,
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
  },
  viewBookmarksButton: {
    flexDirection: 'row',
    backgroundColor: '#6B46C1', // A nice purple color
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'space-between', // Distribute items
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  viewBookmarksButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10, // Space from icon
    flex: 1, // Take available space
  },
});

export default FindLocation;
