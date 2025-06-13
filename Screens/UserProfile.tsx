import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
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
  bio?: string;
  field?: string;
  avatar?: string;
  online: boolean;
  time?: string;
  activity?: string;
  level?: string;
  group?: string;
  subjects?: string[];
  studyPreferences?: string[];
};

type UserDetailRouteProp = RouteProp<
  {
    UserDetail: {
      friend: Friend;
      onAccept: () => void;
      onReject: () => void;
      onGoBack: () => void;
    };
  },
  'UserDetail'
>;

const UserDetail: React.FC = () => {
  const route = useRoute<UserDetailRouteProp>();
  const { friend, onAccept, onReject, onGoBack } = route.params;

  const getSafeValue = (value: string | undefined, defaultValue = 'Not specified') =>
    value || defaultValue;

  const getSafeArray = (array: string[] | undefined, defaultValue = 'No info') =>
    array && array.length > 0 ? array.join(', ') : defaultValue;

  return (
    <LinearGradient
      colors={['#E0ECFF', '#F0F4FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <HeaderComponent />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarGlow}>
              <Image
                source={{ uri: friend.avatar || 'https://via.placeholder.com/150' }}
                style={styles.avatar}
              />
              {friend.online && <View style={styles.onlineIndicator} />}
            </View>
            <Text style={styles.name}>{getSafeValue(friend.name)}</Text>
            <Text style={styles.info}>{friend.age} years old · {getSafeValue(friend.field)}</Text>
          </View>

          {/* Badges */}
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <FontAwesome name="graduation-cap" size={14} color="#2563EB" />
              <Text style={styles.badgeText}> {getSafeValue(friend.field)}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#D1FAE5' }]}>
              <FontAwesome name="star" size={14} color="#10B981" />
              <Text style={styles.badgeText}> {getSafeValue(friend.level)}</Text>
            </View>
          </View>

          {/* Detail Sections */}
          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>Subjects</Text>
            <View style={styles.detailRow}>
              <FontAwesome name="book" size={18} color="#4A90E2" />
              <Text style={styles.detailText}>{getSafeArray(friend.subjects)}</Text>
            </View>

            <Text style={styles.detailLabel}>Study Preferences</Text>
            <View style={styles.detailRow}>
              <FontAwesome name="lightbulb-o" size={18} color="#9B59B6" />
              <Text style={styles.detailText}>{getSafeArray(friend.studyPreferences)}</Text>
            </View>
          </View>

          {/* Bio */}
          <View style={styles.bioContainer}>
            <FontAwesome name="quote-left" size={14} color="#6B7280" style={{ marginRight: 6 }} />
            <Text style={styles.bio}> {getSafeValue(friend.bio, 'No bio available')}</Text>
            <FontAwesome name="quote-right" size={14} color="#6B7280" style={{ marginLeft: 6 }} />
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
              <FontAwesome name="times" size={20} color="#FFF" />
              <Text style={styles.buttonLabel}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
              <FontAwesome name="check" size={20} color="#FFF" />
              <Text style={styles.buttonLabel}>Accept</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
      <BottomNavbar />
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
  content: {
    padding: 20,
    alignItems: 'center',
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarGlow: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: '#93C5FD',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#60A5FA',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#34D399',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  info: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  badge: {
    flexDirection: 'row',
    backgroundColor: '#DBEAFE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  detailBlock: {
    width: '100%',
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 10,
    marginBottom: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 15,
    color: '#374151',
    marginLeft: 8,
    flexShrink: 1,
  },
  bioContainer: {
    backgroundColor: '#F0F4FF',
    borderLeftWidth: 4,
    borderColor: '#60A5FA',
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bio: {
    fontSize: 14,
    color: '#4B5563',
    fontStyle: 'italic',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 20,
  },
  rejectButton: {
    backgroundColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  acceptButton: {
    backgroundColor: 'lightgreen',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: 'lightgreen',
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonLabel: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderColor: '#CBD5E0',
    borderWidth: 1,
    marginBottom: 10,
  },
  backText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default UserDetail;
