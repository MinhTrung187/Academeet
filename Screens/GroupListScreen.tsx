import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import BottomNavbar from '../Component/BottomNavbar';
import JoinGroupModal from '../Component/JoinGroupModal';
import InvitationList from '../Component/InvitationList';

const { width } = Dimensions.get('window');
const logo = require('../assets/WhiteLogo.png');

interface Group {
  id: number;
  name: string;
  description: string;
  isPrivate: boolean;
  requestToJoin: boolean;
  memberCount: number;
  subjectName: string;
  isMyGroup: boolean;
  createdAt: string;
  avatarUrl?: string;
}

const GroupListScreen: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [publicGroups, setPublicGroups] = useState<Group[]>([]);
  const navigation = useNavigation<any>();

  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      try {
        const res = await axios.get<{ name: string }>(
          'https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/User/current-user'
        );
        if (isMounted) setUserName(res.data.name);
      } catch {
        if (isMounted) setUserName('User');
      }
    };

    const fetchGroups = async () => {
      try {
        const [myRes, publicRes] = await Promise.all([
          axios.get<{ items: Group[] }>(
            'https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Group',
            { params: { IncludeMyGroups: true } }
          ),
          axios.get<{ items: Group[] }>(
            'https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Group',
            { params: { IncludeMyGroups: false, IsDeleted: false } }
          ),
        ]);

        if (isMounted) {
          setMyGroups(myRes.data.items.filter(group => group.isMyGroup));
          setPublicGroups(publicRes.data.items);
        }
      } catch (err) {
        console.error('Error fetching groups:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchUserData();
    fetchGroups();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleJoinGroup = (group: Group) => {
    setSelectedGroup(group);
    setShowJoinModal(true);
  };

  const renderGroupCard = (group: Group) => (
    <TouchableOpacity
      key={group.id}
      style={styles.groupCard}
      onPress={() => {
        if (group.isMyGroup) {
          navigation.navigate('GroupDetail', {
            groupId: group.id,
            name: group.name,
            memberCount: group.memberCount,
            description: group.description,
            subjectName: group.subjectName,
            isPrivate: group.isPrivate,
          });
        } else {
          handleJoinGroup(group);
        }
      }}
    >
      <LinearGradient colors={['#3B82F6', '#7C3AED']} style={styles.groupCardBorder}>
        <View style={styles.groupCardContent}>
          <View style={styles.groupLeft}>
            {
              group.avatarUrl ? (
                <Image source={{ uri: group.avatarUrl }} style={styles.groupAvatar} />
              ) : (
                <FontAwesome name="users" size={28} color="#3B82F6" />
              )
            }
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.groupName}>{group.name}</Text>
              <Text style={styles.groupDescription} numberOfLines={2} ellipsizeMode="tail">
                {group.description}
              </Text>
              <Text style={styles.groupSubtitle}>
                {group.memberCount} members · {group.subjectName}
              </Text>
            </View>

          </View>
          <FontAwesome name="angle-right" size={24} color="#94A3B8" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );


  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#6B46C1', '#3B82F6']} style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Your Groups</Text>
            <Text style={styles.userName}>{isLoading ? 'Loading...' : userName}</Text>
          </View>
          <Image source={logo} style={styles.logo} />
        </View>
      </LinearGradient>

      {isLoading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <View style={styles.groupList}>
            <Text style={styles.sectionTitle}>My Groups</Text>
            {myGroups.length === 0 ? (
              <Text style={styles.emptyText}>You haven't joined any groups yet.</Text>
            ) : (
              myGroups.map(renderGroupCard)
            )}

            <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Public Groups</Text>
            {publicGroups.length === 0 ? (
              <Text style={styles.emptyText}>No public groups found.</Text>
            ) : (
              publicGroups.map(renderGroupCard)

            )}
            <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Invitations</Text>
            <InvitationList />
          </View>


        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateGroup')}
      >
        <FontAwesome name="plus" size={20} color="#fff" />
      </TouchableOpacity>

      <JoinGroupModal
        visible={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        group={selectedGroup}
        onJoined={(group: any) => {
          navigation.navigate('GroupDetail', {
            groupId: group.id,
            name: group.name,
            memberCount: group.memberCount,
            description: group.description,
            subjectName: group.subjectName,
            isPrivate: group.isPrivate,
          });
        }}
      />

      <BottomNavbar />
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1E293B',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 16,
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
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 24,
    backgroundColor: '#6B46C1',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
    marginBottom: 40,
  },
  groupAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
  },
  groupDescription: {
    fontSize: 12,
    color: '#475569',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
    lineHeight: 16,
    maxWidth: '95%',
  },


});
