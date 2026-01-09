import React from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface FriendRequest {
  id: string;
  content: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
    age?: number;
    bio?: string;
    field?: string;
    online?: boolean;
    level?: string;
    subjects?: string[];
    studyPreferences?: string[];
  };
  requestedAt: string;
}

interface Props {
  groupId: number;
  requests: FriendRequest[];
  onRefresh: () => void;
  refreshing: boolean;
  onAction: (requestId: string, action: 'accept' | 'reject') => Promise<void>;
}

const GroupRequestList: React.FC<Props> = ({ groupId, requests, onRefresh, refreshing, onAction }) => {
  const navigation = useNavigation<any>();

  const handleUserPress = (user: FriendRequest['user']) => {
    navigation.navigate('UserDetail', {
      friend: {
        id: user.id,
        name: user.name,
        avatar: user.avatarUrl,
        age: user.age || 0,
        bio: user.bio,
        field: user.field,
        online: user.online || false,
        level: user.level,
        subjects: user.subjects,
        studyPreferences: user.studyPreferences,
      },
    });
  };

  if (refreshing) {
    return <ActivityIndicator size="large" color="#3B82F6" />;
  }

  if (requests.length === 0) {
    return <Text style={styles.empty}>No join requests found.</Text>;
  }

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item.id.toString()}
      refreshing={refreshing}
      onRefresh={onRefresh}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <TouchableOpacity onPress={() => handleUserPress(item.user)} style={styles.userInfo}>
            <Image
              source={{ uri: item.user.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
              style={styles.avatar}
            />
            <View style={styles.content}>
              <Text style={styles.name}>{item.user.name}</Text>
              <Text style={styles.message}>{item.content}</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.approveButton]}
              onPress={() => onAction(item.id, 'accept')}
            >
              <Text style={styles.buttonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={() => onAction(item.id, 'reject')}
            >
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
};

export default GroupRequestList;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontWeight: '600',
    fontSize: 14,
    color: '#1E293B',
  },
  message: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  empty: {
    textAlign: 'center',
    marginVertical: 16,
    fontStyle: 'italic',
    color: '#94A3B8',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: '#22C55E', // Green
  },
  rejectButton: {
    backgroundColor: '#EF4444', // Red
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
});