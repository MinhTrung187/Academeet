import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  Image,
  StatusBar,
  Modal, // Import Modal for friend selection
  Pressable, // Import Pressable for modal background
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import BottomNavbar from '../Component/BottomNavbar';

// Interface for a bookmarked location item from the API
interface Bookmark {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  // Assuming there might be an image URL for bookmarks, add if your API provides it
  // imageUrl?: string;
}

// Interface for a friend from the API
interface Friend {
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  chat?: {
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

const ViewBookmarksScreen: React.FC = () => {
  const navigation = useNavigation();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFriendModal, setShowFriendModal] = useState<boolean>(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedLocationToSend, setSelectedLocationToSend] = useState<Bookmark | null>(null);
  const [isSendingLocation, setIsSendingLocation] = useState<boolean>(false);


  const fetchBookmarks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<{ items: Bookmark[] }>(
        'https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Location/all',
        { withCredentials: true }
      );
      setBookmarks(response.data.items || []);
    } catch (err: any) {
      console.error('Error fetching bookmarks:', err);
      setError('Failed to load bookmarks. Please try again.');
      Alert.alert('Error', 'Failed to load bookmarks. Please check your internet connection or try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    fetchBookmarks();
  }, [fetchBookmarks]);

  const handleOpenInGoogleMaps = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url).catch(err => {
      console.error("Failed to open Google Maps:", err);
      Alert.alert('Error', 'Could not open Google Maps. Please ensure you have the app installed.');
    });
  };

  const handleDeleteBookmark = (locationId: number) => {
    Alert.alert(
      "Delete Bookmark",
      "Are you sure you want to delete this bookmark?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await axios.delete(
                `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Location/${locationId}`,
                { withCredentials: true }
              );
              Alert.alert("Success", "Bookmark deleted successfully!");
              fetchBookmarks(); // Refresh the list
            } catch (err: any) {
              console.error("Error deleting bookmark:", err);
              Alert.alert("Error", `Failed to delete bookmark: ${err.response?.data?.message || err.message}`);
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const handleSendLocationToFriend = async (recipientId: string) => {
    if (!selectedLocationToSend) {
      Alert.alert('Error', 'No location selected to send.');
      return;
    }

    setIsSendingLocation(true);
    try {
      const formData = new FormData();
      formData.append('Content', `Check out this location:`);
      formData.append('LocationId', selectedLocationToSend.id.toString());

      await axios.post(
        `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/chat/message/${recipientId}/send`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data', // Important for FormData
          },
          withCredentials: true,
        }
      );
      Alert.alert('Success', `Location sent to friend!`);
      setShowFriendModal(false);
      setSelectedLocationToSend(null);
    } catch (error: any) {
      console.error('Error sending location:', error);
      Alert.alert('Error', `Failed to send location: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSendingLocation(false);
    }
  };

  const openFriendSelectionModal = (location: Bookmark) => {
    setSelectedLocationToSend(location);
    fetchFriends(); // Fetch friends every time the modal is opened
    setShowFriendModal(true);
  };

  const renderFriendItemForSelection = ({ item }: { item: Friend }) => (
    <TouchableOpacity
      style={styles.modalFriendItem}
      onPress={() => handleSendLocationToFriend(item.user.id)}
      disabled={isSendingLocation}
    >
      <Image
        source={{ uri: item.user.avatarUrl || `https://placehold.co/40x40/aabbcc/ffffff?text=${item.user.name.charAt(0)}` }}
        style={styles.modalFriendAvatar}
      />
      <Text style={styles.modalFriendName}>{item.user.name}</Text>
      {isSendingLocation && <ActivityIndicator size="small" color="#4A90E2" />}
    </TouchableOpacity>
  );


  const renderBookmarkItem = ({ item }: { item: Bookmark }) => (
    <View style={styles.bookmarkCard}>
      {/* You might want to add an image here if your bookmarks API returns one */}
      {/* <Image source={{ uri: item.imageUrl || 'https://placehold.co/80x80/aabbcc/ffffff?text=Cafe' }} style={styles.bookmarkImage} /> */}
      <View style={styles.bookmarkInfo}>
        <Text style={styles.bookmarkName}>{item.name}</Text>
        <Text style={styles.bookmarkAddress}>
          <Ionicons name="location-outline" size={14} color="#7D7D7D" /> {item.address}
        </Text>
        <Text style={styles.bookmarkCoordinates}>
          Lat: {item.latitude.toFixed(6)}, Lng: {item.longitude.toFixed(6)}
        </Text>
      </View>
      <View style={styles.bookmarkActions}>
        <TouchableOpacity
          style={styles.openMapButton}
          onPress={() => handleOpenInGoogleMaps(item.latitude, item.longitude)}
        >
          <Ionicons name="map-outline" size={20} color="#FFFFFF" />
          <Text style={styles.openMapButtonText}>Open Map</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sendToButton}
          onPress={() => openFriendSelectionModal(item)}
        >
          <Ionicons name="send-outline" size={20} color="#FFFFFF" />
          <Text style={styles.sendToButtonText}>Send To</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteBookmark(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#E6F0FA', '#F6F8FC']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Bookmarks</Text>
          <View style={{ width: 24 }} /> {/* Spacer */}
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Loading bookmarks...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : bookmarks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={80} color="#9CA3AF" />
            <Text style={styles.emptyText}>You haven't bookmarked any locations yet.</Text>
          </View>
        ) : (
          <FlatList
            data={bookmarks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderBookmarkItem}
            contentContainerStyle={styles.flatListContent}
          />
        )}
      </SafeAreaView>
      <BottomNavbar />

      {/* Friend Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFriendModal}
        onRequestClose={() => setShowFriendModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowFriendModal(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={(event) => true}>
            <Text style={styles.modalTitle}>Send Location to Friend</Text>
            {friends.length === 0 ? (
              <Text style={styles.modalEmptyText}>No friends available to send location.</Text>
            ) : (
              <FlatList
                data={friends}
                keyExtractor={(item) => item.user.id}
                renderItem={renderFriendItemForSelection}
                style={styles.modalFriendList}
              />
            )}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowFriendModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#4F46E5',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 16,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4A90E2',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 10,
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  bookmarkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookmarkImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  bookmarkInfo: {
    flex: 1,
    marginBottom: 10, // Space between info and action buttons
  },
  bookmarkName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  bookmarkAddress: {
    fontSize: 14,
    color: '#7D7D7D',
    marginBottom: 2,
  },
  bookmarkCoordinates: {
    fontSize: 12,
    color: '#999',
  },
  bookmarkActions: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Distribute buttons evenly
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F4FF',
    paddingTop: 10,
  },
  openMapButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1, // Take equal space
    marginHorizontal: 4,
  },
  openMapButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  sendToButton: {
    backgroundColor: '#27AE60', // Green color
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  sendToButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  deleteButton: {
    backgroundColor: '#EF4444', // Red color
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  // Styles for the Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#2C3E50',
  },
  modalFriendList: {
    maxHeight: 300, // Limit height for scrollability
    marginBottom: 15,
  },
  modalFriendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalFriendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  modalFriendName: {
    fontSize: 16,
    color: '#4A4A4A',
    flex: 1,
  },
  modalEmptyText: {
    textAlign: 'center',
    color: '#7D7D7D',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  modalCloseButton: {
    backgroundColor: '#F0F4FF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCloseButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ViewBookmarksScreen;
