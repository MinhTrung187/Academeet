import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import BottomNavbar from '../Component/BottomNavbar';
import HeaderComponent from '../Component/HeaderComponent';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';

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
      friend: { id: string };
    };
  },
  'UserDetail'
>;

const UserDetail: React.FC = () => {
  const route = useRoute<UserDetailRouteProp>();
  const { friend } = route.params;
  const [user, setUser] = useState<Friend | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/User/users/${friend.id}`
        );
        const data = response.data;
        setUser({
          id: data.id,
          name: data.name,
          age: data.age,
          bio: data.bio,
          field: `${data.genderIdentity} · ${data.occupation}`,
          avatar: data.avatarUrl,
          online: false, // API doesn't provide online status
          time: undefined, // API doesn't provide time
          activity: undefined, // API doesn't provide activity
          level: data.educationLevel,
          group: undefined, // API doesn't provide group
          subjects: data.subjects,
          studyPreferences: data.studyPreferences,
        });
      } catch (error) {
        console.error('Failed to fetch user data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [friend.id]);

  const getSafeValue = (value: string | undefined, defaultValue = 'Not specified') =>
    value || defaultValue;

  const getSafeArray = (array: string[] | undefined, defaultValue = 'No info') =>
    array && array.length > 0 ? array.join(', ') : defaultValue;

  if (loading || !user) {
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#3B82F6" />;
  }

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
          <View style={styles.card}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: user.avatar || 'https://via.placeholder.com/150' }}
                style={styles.avatar}
              />
              {user.online && <View style={styles.onlineIndicator} />}
            </View>
            <Text style={styles.name}>{getSafeValue(user.name)}</Text>
            <Text style={styles.info}>{user.age} yrs · {getSafeValue(user.field)}</Text>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.label}>Level</Text>
              <Text style={styles.value}>{getSafeValue(user.level)}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Subjects</Text>
              <Text style={styles.value}>{getSafeArray(user.subjects)}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Study Preferences</Text>
              <Text style={styles.value}>{getSafeArray(user.studyPreferences)}</Text>
            </View>

            <View style={styles.bioContainer}>
              <FontAwesome name="quote-left" size={16} color="#6B7280" style={{ marginRight: 6 }} />
              <Text style={styles.bio}>{getSafeValue(user.bio, 'No bio available')}</Text>
              <FontAwesome name="quote-right" size={16} color="#6B7280" style={{ marginLeft: 6 }} />
            </View>
          </View>
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
    paddingBottom: 120,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarWrapper: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#34D399',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
  },
  info: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  section: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    color: '#1F2937',
  },
  bioContainer: {
    backgroundColor: '#F9FAFB',
    borderLeftWidth: 4,
    borderColor: '#60A5FA',
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bio: {
    fontSize: 14,
    color: '#4B5563',
    fontStyle: 'italic',
    flex: 1,
  },
});

export default UserDetail;