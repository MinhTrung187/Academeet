import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface Props {
  text?: string;
  timestamp: string;
  isDeleted?: boolean;
  attachmentUrls?: string[];
}

const UserMessage: React.FC<Props> = ({ text, timestamp, isDeleted, attachmentUrls }) => {
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
          <FontAwesome name="file" size={16} color="#fff" />
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
    backgroundColor: '#2563EB',
    alignSelf: 'flex-end',
    padding: 10,
    margin: 6,
    borderRadius: 16,
    borderTopRightRadius: 0,
    maxWidth: '80%',
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 11,
    color: '#D1D5DB',
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
    color: '#fff',
    fontSize: 13,
  },
  deleted: {
    backgroundColor: '#CBD5E1',
    alignSelf: 'flex-end',
  },
  deletedText: {
    fontStyle: 'italic',
    color: '#475569',
  },
});

export default UserMessage;
