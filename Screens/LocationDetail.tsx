import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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
}

const LocationDetail = () => {
  const route = useRoute();
  const { location } = route.params as { location: Location }; 

  const handleNavigateToGoogleMaps = () => {
    console.log('Navigate to Google Maps');
  };

  return (
    <LinearGradient colors={['#E6F0FA', '#F6F8FC']} style={styles.gradient}>
      <HeaderComponent/>
      <ScrollView style={styles.container}>
        <Image source={{ uri: location.image }} style={styles.detailImage} />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{location.name}</Text>
          <Text style={styles.detail}>
            <Ionicons name="location-outline" size={16} color="#7D7D7D" /> {location.distanceFromYou} km from you
          </Text>
          <Text style={styles.detail}>
            <Ionicons name="location-outline" size={16} color="#7D7D7D" /> {location.distanceFromPartner} km from partner
          </Text>
          <Image
            source={{ uri: 'https://cdn.prod.website-files.com/5c29380b1110ec92a203aa84/66e5ce469b48938aa34d8684_Google%20Maps%20-%20Compressed.jpg' }}
            style={styles.mapImage}
          />
          <Text style={styles.time}>
            <Ionicons name="time-outline" size={16} color="#27AE60" /> {location.time}
          </Text>
          <Text style={styles.description}>{location.details}</Text>
          <TouchableOpacity style={styles.mapButton} onPress={handleNavigateToGoogleMaps}>
            <Text style={styles.mapButtonText}>Open in Google Maps</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomNavbar/>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  detailImage: { width: '100%', height: 200, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  infoContainer: { padding: 16 },
  name: { fontSize: 24, fontWeight: '700', color: '#2C3E50', marginBottom: 8 },
  detail: { fontSize: 16, color: '#7D7D7D', marginVertical: 4 },
  time: { fontSize: 16, color: '#27AE60', fontWeight: '500', marginVertical: 4 },
  description: { fontSize: 14, color: '#4A4A4A', marginVertical: 8, lineHeight: 20 },
  mapImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginVertical: 12,
  },
  mapButton: {
    backgroundColor: '#4285F4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  mapButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LocationDetail;