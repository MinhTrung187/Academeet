import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import HeaderComponent from '../Component/HeaderComponent';
import BottomNavbar from '../Component/BottomNavbar';

interface Location {
  id: string;
  name: string;
  distanceFromYou: string;
  distanceFromPartner: string;
  time: string;
  image: string;
  details?: string;
  coordinates: [number, number];
  openingHours?: string;
  address?: string;
  cuisine?: string;
}

const LocationDetail = () => {
  const route = useRoute();
  const { location } = route.params as { location: Location };

  const handleNavigateToGoogleMaps = () => {
    const [lng, lat] = location.coordinates;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url);
  };

  return (
    <LinearGradient colors={['#D9E7FF', '#F0F4FF']} style={styles.gradient}>
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
});

export default LocationDetail;