import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';

interface Friend {
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

interface Props {
  groupId: number;
}

const FriendInviteList: React.FC<Props> = ({ groupId }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [invitingIds, setInvitingIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await axios.get<Friend[]>(
          'https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Relationship/friends',
          { withCredentials: true }
        );
        setFriends(res.data);
      } catch (err) {
        console.error('❌ Lỗi khi tải danh sách bạn bè:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const handleInvite = async (userId: string) => {
    if (invitingIds.includes(userId)) return;
    setInvitingIds((prev) => [...prev, userId]);

    try {
      await axios.post(
        `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Group/${groupId}/invites`,
        { inviteeId: userId },
        { withCredentials: true }
      );
      Alert.alert('Success', 'Invitation sent');
    } catch (err) {
      console.error('❌ Sending invitation failed:', err);
      Alert.alert('Sending Invitation Failed:', 'This user has already been invited, is in the group, or has been blocked');
    } finally {
      setInvitingIds((prev) => prev.filter((id) => id !== userId));
    }
  };

  const renderItem = ({ item }: { item: Friend }) => (
    <View style={styles.item}>
      <Image
        source={{ uri: item.user.avatarUrl || 'https://via.placeholder.com/40' }}
        style={styles.avatar}
      />
      <Text style={styles.name}>{item.user.name}</Text>
      <TouchableOpacity
        style={styles.inviteButton}
        onPress={() => handleInvite(item.user.id)}
        disabled={invitingIds.includes(item.user.id)}
      >
        <Text style={styles.inviteText}>
          {invitingIds.includes(item.user.id) ? 'Inviting...' : 'Invite'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) return <ActivityIndicator size="small" color="#3B82F6" />;

  return (
    <FlatList
      data={friends}
      keyExtractor={(item) => item.user.id}
      renderItem={renderItem}
      contentContainerStyle={{ paddingVertical: 8 }}
    />
  );
};

export default FriendInviteList;

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  inviteButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  inviteText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});
