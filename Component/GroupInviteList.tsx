import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const GroupInviteList = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Invite list will be available soon.</Text>
    </View>
  );
};

export default GroupInviteList;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  placeholder: {
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
