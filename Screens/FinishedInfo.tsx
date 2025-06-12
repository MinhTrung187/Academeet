import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';


const { width } = Dimensions.get('window');

const FinishedInfo: React.FC = () => {
      const navigation:any = useNavigation();

  return (
    <View style={styles.container}>
      <Animatable.Text
        animation="fadeInDown"
        duration={1000}
        style={styles.header}
      >
        Let's get to know you
      </Animatable.Text>
      <Animatable.View
        animation="zoomIn"
        duration={1200}
        style={styles.card}
      >
        <FontAwesome name="user-circle" size={60} color="#4A4A4A" style={styles.icon} />
        <Text style={styles.title}>Thank You for sharing about yourself!</Text>
        <Text style={styles.subtitle}>Let's see what your profile now looks like!</Text>
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={2000}
          style={styles.buttonContainer}
        >
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <View style={styles.gradientBtn}>
              <Text style={styles.startText}>Let's get started</Text>
              <FontAwesome name="arrow-right" size={16} color="#fff" style={styles.arrowIcon} />
            </View>
          </TouchableOpacity>
        </Animatable.View>
      </Animatable.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#B7C7E3', 
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: width * 0.9,
    borderWidth: 2,
    borderColor: '#A084CA',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
    elevation: 6,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
  buttonContainer: {
    marginTop: 10,
  },
  startBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientBtn: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A084CA', 
  },
  startText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginRight: 8,
  },
  arrowIcon: {
    marginLeft: 5,
  },
});

export default FinishedInfo;