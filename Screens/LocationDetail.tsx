import React, { useState } from 'react'; // Added useState
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Linking, Alert } from 'react-native'; // Added Alert
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import HeaderComponent from '../Component/HeaderComponent'; // Assuming this is used elsewhere or will be removed
import BottomNavbar from '../Component/BottomNavbar';
import axios from 'axios'; // Import axios

interface Location {
  id: string;
  name: string;
  distanceFromYou: string;
  distanceFromPartner?: string; // Made optional as it might not always be present
  time: string;
  image: string;
  details?: string;
  coordinates: [number, number]; // [longitude, latitude]
  openingHours?: string;
  address?: string;
  cuisine?: string;
}

const LocationDetail = () => {
  const route = useRoute();
  const { location } = route.params as { location: Location };

  // State to track if the location is bookmarked
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleNavigateToGoogleMaps = () => {
    const [lng, lat] = location.coordinates;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url);
  };

  const handleBookmarkToggle = async () => {
    // If already bookmarked, maybe show an info message or do nothing for now
    if (isBookmarked) {
      Alert.alert('Info', 'This location is already in your bookmarks!');
      return;
    }

    try {
      const [longitude, latitude] = location.coordinates; // Ensure correct order for payload

      const bookmarkPayload = {
        name: location.name,
        address: location.address || 'N/A', // Provide a fallback if address is optional
        latitude: latitude,
        longitude: longitude,
      };

      const response = await axios.post(
        'https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Location/bookmark',
        bookmarkPayload,
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      if (response.status === 200 || response.status === 201) {
        Alert.alert('Success', `${location.name} added to bookmarks!`);
        setIsBookmarked(true); 
      } else {
        Alert.alert('Error', 'Failed to add to bookmarks. Please try again.');
      }
    } catch (error: any) {
      console.error('Error adding to bookmark:', error);
      Alert.alert('Error', `Failed to add to bookmarks: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    }
  };

  return (
    <LinearGradient colors={['#D9E7FF', '#F0F4FF']} style={styles.gradient}>
      {/* HeaderComponent is typically placed here if it's a common header */}
      {/* <HeaderComponent title="Location Details" /> */} 
      <ScrollView style={styles.container}>
        <Image source={{ uri: location.image }} style={styles.detailImage} />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{location.name}</Text>
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Location Details</Text>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={20} color="#4A90E2" />
              <Text style={styles.detail}>
                Distance from you: {location.distanceFromYou}
              </Text>
            </View>
            {location.distanceFromPartner && (
              <View style={styles.detailRow}>
                <Ionicons name="people-outline" size={20} color="#4A90E2" />
                <Text style={styles.detail}>
                  Distance from partner: {location.distanceFromPartner}
                </Text>
              </View>
            )}
            {location.openingHours && (
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={20} color="#27AE60" />
                <Text style={styles.detail}>
                  Opening hours: {location.openingHours}
                </Text>
              </View>
            )}
            {location.address && (
              <View style={styles.detailRow}>
                <Ionicons name="home-outline" size={20} color="#4A90E2" />
                <Text style={styles.detail}>
                  Address: {location.address}
                </Text>
              </View>
            )}
            {location.cuisine && (
              <View style={styles.detailRow}>
                <Ionicons name="cafe-outline" size={20} color="#4A90E2" />
                <Text style={styles.detail}>
                  Cuisine: {location.cuisine}
                </Text>
              </View>
            )}
            {location.details && (
              <View style={styles.detailRow}>
                <Ionicons name="information-circle-outline" size={20} color="#4A90E2" />
                <Text style={styles.description}>{location.details}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.mapButton}
            onPress={handleNavigateToGoogleMaps}
            activeOpacity={0.7}
          >
            <Ionicons name="map-outline" size={22} color="#FFFFFF" style={styles.mapButtonIcon} />
            <Text style={styles.mapButtonText}>Open in Google Maps</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bookmarkButton, isBookmarked && styles.bookmarkButtonBookmarked]}
            onPress={handleBookmarkToggle}
            activeOpacity={0.7}
            disabled={isBookmarked} // Disable if already bookmarked
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={22}
              color={isBookmarked ? "#FFFFFF" : "#4A90E2"}
              style={styles.bookmarkButtonIcon}
            />
            <Text style={[styles.bookmarkButtonText, isBookmarked && styles.bookmarkButtonTextBookmarked]}>
              {isBookmarked ? "Bookmarked" : "Add to Bookmark"}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
      <BottomNavbar />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  container: {
    flex: 1,
  },
  detailImage: {
    width: '100%',
    height: 250,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  infoContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  detailSection: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  detail: {
    fontSize: 16,
    color: '#4A4A4A',
    marginLeft: 8,
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#4A4A4A',
    marginLeft: 8,
    lineHeight: 22,
    flex: 1,
  },
  mapButton: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mapButtonIcon: {
    marginRight: 8,
  },
  mapButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // New styles for the Bookmark button
  bookmarkButton: {
    flexDirection: 'row',
    backgroundColor: '#E6F0FA', // Light blue background for unbookmarked state
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10, // Space from the map button
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1, // Add a border
    borderColor: '#4A90E2', // Border color
  },
  bookmarkButtonBookmarked: {
    backgroundColor: '#27AE60', // Green background when bookmarked
    borderColor: '#27AE60', // Green border
  },
  bookmarkButtonIcon: {
    marginRight: 8,
  },
  bookmarkButtonText: {
    color: '#4A90E2', // Blue text for unbookmarked state
    fontSize: 16,
    fontWeight: '600',
  },
  bookmarkButtonTextBookmarked: {
    color: '#FFFFFF', // White text when bookmarked
  },
});

export default LocationDetail;
