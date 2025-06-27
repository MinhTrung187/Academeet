
import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import BottomNavbar from '../Component/BottomNavbar';
import CafeDataFetcher from '../Component/CafeDataFetcher';

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
  const route = useRoute();
  const { userAddress, coordinates } = route.params as RouteParams;

  const [mode, setMode] = useState<'you' | 'friends' | null>(null);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false); // ✅ new
  const [showLocations, setShowLocations] = useState(false);
  const [showAllLocations, setShowAllLocations] = useState(false);
  const navigation = useNavigation<any>();
  const friends: Friend[] = [/* same as before */];

  const handleCafesFetched = (cafes: Location[]) => {
    setLocations(cafes);
    setIsLoading(false);
    setShowLocations(true);
    setHasFetched(true); // ✅ prevent re-fetch
  };

  const handleFindLocations = () => {
    if (selectedFriends.length > 0) {
      setIsLoading(true);
      setShowLocations(true);
      setHasFetched(false); // ensure fetch
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

  const renderLocations = () => {
    const visibleLocations = showAllLocations ? locations : locations.slice(0, 3);
    return (
      <>
        {visibleLocations.map((item) => (
          <View key={item.id}>{renderLocationItem({ item })}</View>
        ))}

        {!showAllLocations && locations.length > 3 && (
          <TouchableOpacity style={styles.findMoreButton} onPress={() => setShowAllLocations(true)}>
            <Text style={styles.findMoreButtonText}>Find more</Text>
          </TouchableOpacity>
        )}
      </>
    );
  };


  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isLoading) {
      timeoutId = setTimeout(() => {
        setIsLoading(false);
      }, 10000);
    }
    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  return (
    <LinearGradient colors={['#E6F0FA', '#F6F8FC']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        {coordinates && isLoading && !hasFetched && (
          <CafeDataFetcher
            latitude={coordinates.latitude}
            longitude={coordinates.longitude}
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
              <Text style={styles.addressTitle}>Latitude:</Text>
              <Text style={styles.addressText}>{coordinates?.latitude}</Text>
              <Text style={styles.addressTitle}>Longitude:</Text>

              <Text style={styles.addressText}>{coordinates?.longitude}</Text>
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
                  setHasFetched(false);
                }}
              >
                <Ionicons name="person-outline" size={20} color="white" />
                <Text style={styles.optionText}>Only me</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: '#50C878' }]}
                onPress={() => setMode('friends')}
              >
                <Ionicons name="people-outline" size={20} color="white" />
                <Text style={styles.optionText}>Me & Friends</Text>
              </TouchableOpacity>
            </View>
          ) : mode === 'you' ? (
            <>
              {isLoading ? (
                <ActivityIndicator size="large" color="#4A90E2" />
              ) : showLocations && locations.length > 0 ? (
                renderLocations()
              ) : (
                <Text style={styles.noResult}>No cafes found.</Text>
              )}
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Select friends</Text>
              <FlatList
                data={friends}
                renderItem={renderFriendItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
              <TouchableOpacity
                style={[
                  styles.findButton,
                  (selectedFriends.length === 0 || isLoading) && { backgroundColor: '#CCC' },
                ]}
                onPress={handleFindLocations}
                disabled={selectedFriends.length === 0 || isLoading}
              >
                <Ionicons name="search-outline" size={20} color="#FFF" />
                <Text style={styles.findButtonText}>Find locations</Text>
              </TouchableOpacity>

              {isLoading ? (
                <ActivityIndicator size="large" color="#4A90E2" />
              ) : showLocations && locations.length > 0 ? (
                renderLocations()
              ) : (
                showLocations && <Text style={styles.noResult}>No suitable location found.</Text>
              )}
            </>
          )}
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
});

export default FindLocation;
