import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import HeaderComponent from '../Component/HeaderComponent';
import BottomNavbar from '../Component/BottomNavbar';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const featureList = [
  'Flash card library',
  'Pomodoro timer',
  'Note taking system',
  'AI Document Analysis',
  'AI Study Assistant',
  'Calendar',
  'Unlimited group creation',
  'AI Personalized',
  'Unlimited post creation',
  'Up to 100+ members group creation',
  'Up to 100 tasks create',
  'Mark as "Contributor"',
];

const PremiumScreen = () => {
  const navigation: any = useNavigation();
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <>
      <SafeAreaView style={styles.safeArea}>

        <LinearGradient colors={['#E6F0FA', '#F5F7FA', '#FFFFFF']} style={styles.container}>
          <HeaderComponent />

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
              <Text style={styles.title}>Premium NOW!</Text>
              <TouchableOpacity style={styles.closeButton}>
                <Text style={styles.closeText}>×</Text>
              </TouchableOpacity>
              <View style={styles.featureList}>
                {featureList.map((feature, index) => (
                  <Animated.View key={index} style={{ opacity: fadeAnim }}>
                    <Text style={styles.feature}>✔ {feature}</Text>
                  </Animated.View>
                ))}
              </View>
              <Text style={styles.trialText}>FREE 1 MONTH TRIAL AND THEN</Text>
              <View style={styles.plansContainer}>
                <View style={styles.planCard}>
                  <LinearGradient colors={['#FFCC00', '#FF9900']} style={styles.planGradient}>
                    <Text style={styles.planTitle}>MONTHLY PLAN</Text>
                    <Text style={styles.price}>49K* for edu plan</Text>
                    <Text style={styles.price}>69K for normal plan</Text>
                    <TouchableOpacity style={styles.tryButton} activeOpacity={0.7} onPress={() => navigation.navigate('StudyTool')}>
                      <Text style={styles.tryText}>Try it</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
                <View style={styles.planCard}>
                  <LinearGradient colors={['#FF6B9A', '#FF1493']} style={styles.planGradient}>
                    <Text style={styles.planTitle}>YEARLY PLAN</Text>
                    <Text style={styles.price}>499K* for edu plan</Text>
                    <Text style={styles.price}>699K for normal plan</Text>
                    <TouchableOpacity style={styles.tryButton} activeOpacity={0.7} onPress={() => navigation.navigate('StudyTool')}>
                      <Text style={styles.tryText}>Try it</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
      <BottomNavbar />
    </>


  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0, // Adjust for status bar height

  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 10, // Reduced padding since SafeAreaView handles status bar
    paddingBottom: 100, // Ensure enough space for BottomNavbar
    alignItems: 'center',
  },
  card: {
    width: width - 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E3A8A',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
  },
  closeText: {
    fontSize: 24,
    color: '#1E3A8A',
    fontWeight: 'bold',
  },
  featureList: {
    marginVertical: 20,
    paddingHorizontal: 12,
  },
  feature: {
    fontSize: 16,
    color: '#2D3748',
    marginBottom: 12,
    fontWeight: '500',
    lineHeight: 24,
  },
  trialText: {
    fontSize: 18,
    color: '#4A5568',
    marginVertical: 20,
    fontWeight: '600',
  },
  plansContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  planCard: {
    width: '48%',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  planGradient: {
    padding: 20,
    alignItems: 'center',
  },
  planTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  price: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
    fontWeight: '600',
  },
  tryButton: {
    backgroundColor: '#38B2AC',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  tryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default PremiumScreen;