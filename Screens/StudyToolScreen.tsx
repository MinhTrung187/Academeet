import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HeaderComponent from '../Component/HeaderComponent';
import BottomNavbar from '../Component/BottomNavbar';

const { width } = Dimensions.get('window');

const StudyToolScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<any>();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderComponent />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Text style={styles.headerText}>Study Tool</Text>
        </Animated.View>

        <TouchableOpacity
          style={styles.toolCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('TaskManagementScreen')}
        >
          <MaterialCommunityIcons
            name="clipboard-check-outline"
            size={50}
            color="#4F46E5"
            style={styles.toolIcon}
          />
          <Text style={styles.toolName}>Task Management</Text>
          <Text style={styles.toolDescription}>
            Organize your study tasks, track progress, and stay productive.
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomNavbar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 80,
    alignItems: 'center',
  },
  header: {
    marginTop: 20,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    textAlign: 'center',
  },
  toolCard: {
    backgroundColor: '#FFFFFF',
    width: width - 40,
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  toolIcon: {
    marginBottom: 15,
  },
  toolName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  toolDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default StudyToolScreen;
