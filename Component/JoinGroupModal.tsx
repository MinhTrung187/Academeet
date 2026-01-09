import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';

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
}

interface Props {
  visible: boolean;
  onClose: () => void;
  group: Group | null;
  onJoined: (group: Group) => void;
}

const JoinGroupModal: React.FC<Props> = ({ visible, onClose, group, onJoined }) => {
  const [loading, setLoading] = useState(false);
  const [requestContent, setRequestContent] = useState('');

  if (!group) return null; // tránh crash nếu group chưa được set

  const handleSendRequest = async () => {
    if (!requestContent.trim()) {
      Alert.alert('Please enter a message');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Group/${group.id}/requests`,
        { content: requestContent }
      );
      Alert.alert('Request sent', 'Your request to join the group has been submitted.');
      onClose();
    } catch (err) {
      Alert.alert('Error', 'Failed to send join request.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    setLoading(true);
    try {
      await axios.post(
        `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Group/${group.id}/join`
      );
      Alert.alert('Success', `You have joined ${group.name}`);
      onClose();
      onJoined(group); // trả lại nguyên group để navigate
    } catch (err) {
      Alert.alert('Error', 'Failed to join the group.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{group.name}</Text>
          {group.requestToJoin ? (
            <>
              <Text style={styles.message}>
                This is a request-only group. Send a request or get an invite to join.
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Write your message..."
                value={requestContent}
                onChangeText={setRequestContent}
                multiline
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSendRequest} style={styles.confirmButton}>
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Send Request</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.message}>
                This is a public group. You can join without request. Do you want to join?
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleJoinGroup} style={styles.confirmButton}>
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Join Now</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default JoinGroupModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1E293B',
  },
  message: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: 8,
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: '#CBD5E1',
  },
  confirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
