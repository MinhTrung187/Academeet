import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const logo = require('../assets/WhiteLogo.png');

const GroupListScreen: React.FC = () => {
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigation = useNavigation<any>();

  const dummyGroups: {
    name: string;
    members: number;
    description: string;
    icon: React.ComponentProps<typeof FontAwesome>['name'];
  }[] = [
    { name: 'Marketing Group', members: 12, description: 'Discuss campaigns', icon: 'bullhorn' },
    { name: 'UX Study Group', members: 8, description: 'Design Sprint', icon: 'paint-brush' },
    { name: 'Dev Hangout', members: 20, description: 'Coding and coffee ☕', icon: 'laptop' },
    { name: 'Data Science Club', members: 15, description: 'Machine Learning projects', icon: 'line-chart' },
    { name: 'Product Management', members: 10, description: 'Agile methodologies', icon: 'briefcase' },
  ];

  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get<{ name: string }>(
          'https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/User/current-user'
        );
        if (isMounted) {
          setUserName(response.data.name);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (isMounted) setUserName('User');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchUserData();
    return () => {
      isMounted = false;
    };
  }, []);

  const SkeletonLoader = () => (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonAvatar} />
      <View style={styles.skeletonTextContainer}>
        <View style={styles.skeletonTextLine} />
        <View style={[styles.skeletonTextLine, { width: '60%' }]} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#6B46C1', '#3B82F6']}
        style={styles.headerContainer}
      >
        <View style={styles.headerContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Your Groups</Text>
            <Text style={styles.userName}>
              {isLoading ? 'Loading...' : userName}
            </Text>
          </View>
          <Image source={logo} style={styles.logo} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.groupList}>
          {isLoading ? (
            <>
              <SkeletonLoader />
              <SkeletonLoader />
              <SkeletonLoader />
              <SkeletonLoader />
              <SkeletonLoader />
            </>
          ) : (
            dummyGroups.map((group, index) => (
              <TouchableOpacity key={index} style={styles.groupCard}>
                <LinearGradient
                  colors={['#3B82F6', '#7C3AED']}
                  style={styles.groupCardBorder}
                >
                  <View style={styles.groupCardContent}>
                    <View style={styles.groupLeft}>
                      <FontAwesome name={group.icon} size={28} color="#3B82F6" />
                      <View style={{ marginLeft: 12 }}>
                        <Text style={styles.groupName}>{group.name}</Text>
                        <Text style={styles.groupSubtitle}>
                          {group.members} members · {group.description}
                        </Text>
                      </View>
                    </View>
                    <FontAwesome name="angle-right" size={24} color="#94A3B8" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GroupListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    marginVertical: 6,
  },
  userName: {
    fontSize: 18,
    color: '#E0F2FE',
    fontFamily: 'Poppins-Regular',
  },
  logo: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    marginLeft: 12,
  },
  groupList: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  groupCard: {
    marginBottom: 12,
  },
  groupCardBorder: {
    borderRadius: 16,
    padding: 2,
  },
  groupCardContent: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  groupLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1E293B',
  },
  groupSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
    marginTop: 4,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  skeletonAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E5E7EB',
  },
  skeletonTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  skeletonTextLine: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginBottom: 8,
    width: '80%',
  },
});