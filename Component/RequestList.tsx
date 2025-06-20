import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface FriendRequest {
  $id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  sentAt: string;
  status: string;
}

interface RequestListProps {
  requests: FriendRequest[];
  onRefresh: () => void;
  refreshing: boolean;
  onAction: (requestId: string, action: 'accept' | 'reject') => void;
}

const RequestList: React.FC<RequestListProps> = ({ requests, onRefresh, refreshing, onAction }) => {
  return (
    <ScrollView contentContainerStyle={styles.requestContainer} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={styles.sectionTitle}>Friend Requests</Text>
      {requests.length === 0 ? (
        <Text>No friend requests found.</Text>
      ) : (
        requests.map((request) => (
          <View key={request.$id || request.senderId} style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <Image source={{ uri: `https://api.adorable.io/avatars/50/${request.senderId}` }} style={styles.requestAvatar} />
              <View style={styles.requestInfo}>
                <Text style={styles.requestName}>{request.senderName}</Text>
                <Text style={styles.requestTime}>
                  {new Date(request.sentAt).toLocaleString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>
            {request.status === 'Pending' && (
              <View style={styles.requestActions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => onAction(request.$id, 'accept')}>
                  <Text style={styles.actionText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={() => onAction(request.$id, 'reject')}>
                  <Text style={styles.actionText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
            {request.status !== 'Pending' && <Text style={styles.requestStatus}>{request.status}</Text>}
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  requestContainer: { paddingBottom: 20 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    paddingHorizontal: 15,
    marginVertical: 10,
    fontFamily: 'Poppins-Bold',
  },
  requestCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 12,
    marginHorizontal: 15,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  requestHeader: { flexDirection: 'row', alignItems: 'center' },
  requestAvatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#E0E0E0' },
  requestInfo: { marginLeft: 12, flex: 1 },
  requestName: { fontSize: 16, fontWeight: '600', color: '#1E293B', fontFamily: 'Poppins-SemiBold' },
  requestTime: { fontSize: 12, color: '#6B7280', fontFamily: 'Poppins-Regular' },
  requestActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  actionButton: {
    backgroundColor: '#EF4444',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  rejectButton: { backgroundColor: '#EF4444' },
  actionText: { color: '#FFF', fontSize: 14, fontWeight: '500', fontFamily: 'Poppins-Medium' },
  requestStatus: { fontSize: 14, color: '#6B7280', fontFamily: 'Poppins-Regular', textAlign: 'right' },
});

export default RequestList;