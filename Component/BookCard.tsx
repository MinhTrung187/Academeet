import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons'; 

const BookCard = () => {
  return (
    <View style={styles.card}>
      <Feather name="book-open" size={64} color="#000" />
      <Text style={styles.title}>
        Find your <Text style={styles.bold}>Study Mate</Text>
      </Text>
      <Text>matching now</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 250,
    height: 300,
    backgroundColor: 'white',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default BookCard;
