import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface Props {
  text?: string;
  timestamp: string;
  isDeleted?: boolean;
  attachmentUrls?: string[];
}

const FriendMessage: React.FC<Props> = ({ text, timestamp, isDeleted, attachmentUrls }) => {
  if (isDeleted) {
    return (
      <View style={[styles.container, styles.deleted]}>
        <Text style={styles.deletedText}>This message was deleted</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {text ? <Text style={styles.text}>{text}</Text> : null}

      {(attachmentUrls || []).map((url, index) => (
        <TouchableOpacity key={index} onPress={() => Linking.openURL(url)} style={styles.attachment}>
          <FontAwesome name="file" size={16} color="#1E3A8A" />
          <Text style={styles.attachmentText} numberOfLines={1}>
            {url.split('/').pop()}
          </Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.timestamp}>{timestamp}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E2E8F0',
    alignSelf: 'flex-start',
    padding: 10,
    margin: 6,
    borderRadius: 16,
    borderTopLeftRadius: 0,
    maxWidth: '80%',
  },
  text: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'right',
    marginTop: 4,
  },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  attachmentText: {
    marginLeft: 6,
    color: '#1E3A8A',
    fontSize: 13,
  },
  deleted: {
    backgroundColor: '#CBD5E1',
    alignSelf: 'flex-start',
  },
  deletedText: {
    fontStyle: 'italic',
    color: '#475569',
  },
});

export default FriendMessage;
