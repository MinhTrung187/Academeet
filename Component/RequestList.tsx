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
        <View style={styles.noRequestsContainer}>
          <Text style={styles.noRequestsText}>No friend requests yet.</Text>
        </View>
      ) : (
        requests.map((request) => (
          <View key={request.$id || request.senderId} style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <Image source={{ uri: `https://api.adorable.io/avatars/50/${request.senderId}` }} style={styles.requestAvatar} />
              <View style={styles.requestInfo}>
                <Text style={styles.requestName}>{request.senderName}</Text>
                <Text style={styles.requestTime}>
                  {new Date(request.sentAt + 'Z').toLocaleString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    timeZone: 'Asia/Ho_Chi_Minh', // Chuyển đổi sang giờ Việt Nam
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
  requestContainer: {
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: 8,
    marginTop: 50,
    marginVertical: 16,
    fontFamily: 'Poppins-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  requestCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  requestInfo: {
    marginLeft: 12,
    flex: 1,
  },
  requestName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Poppins-SemiBold',
  },
  requestTime: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    marginTop: 4,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  actionButton: {
    backgroundColor: '#34D399',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  requestStatus: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    textAlign: 'right',
    marginTop: 8,
  },
  noRequestsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
  },
  noRequestsText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default RequestList;