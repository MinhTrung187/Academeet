import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  Animated,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavbar from '../Component/BottomNavbar';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

type FeatureIconName =
  | 'user-plus'
  | 'users'
  | 'pencil-square-o'
  | 'cogs'
  | 'map-marker';

type FeatureItem = {
  name: string;
  icon: FeatureIconName;
  backgroundColor: string;
  onPress: () => void;
};

const features: FeatureItem[] = [
  {
    name: 'FIND FRIEND',
    icon: 'user-plus',
    backgroundColor: '#3B82F6',
    onPress: () => console.log('Find Friend'),
  },
  {
    name: 'GROUP & FORUM',
    icon: 'users',
    backgroundColor: '#F59E0B',
    onPress: () => console.log('Group & Forum'),
  },
  {
    name: 'STUDY TOOLS',
    icon: 'pencil-square-o',
    backgroundColor: '#10B981',
    onPress: () => console.log('Study Tools'),
  },
  {
    name: 'AI ASSISTANT',
    icon: 'cogs',
    backgroundColor: '#8B5CF6',
    onPress: () => console.log('AI Assistant'),
  },
  {
    name: 'FIND LOCATION',
    icon: 'map-marker',
    backgroundColor: '#EF4444',
    onPress: () => console.log('Find Location'),
  },
];
const shadeColor = (color: string, percent: number) => {
  const f = parseInt(color.slice(1), 16);
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent);
  const R = f >> 16;
  const G = (f >> 8) & 0x00FF;
  const B = f & 0x0000FF;
  return (
    '#' +
    (
      0x1000000 +
      (Math.round((t - R) * p) + R) * 0x10000 +
      (Math.round((t - G) * p) + G) * 0x100 +
      (Math.round((t - B) * p) + B)
    )
      .toString(16)
      .slice(1)
  );
};


const HomeScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Header */}
          <LinearGradient colors={['#60A5FA', '#3B82F6']} style={styles.headerContainer}>
            <View style={styles.headerContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.greeting}>Hello 👋</Text>
                <Text style={styles.userName}>Nguyen Minh Trung</Text>
                <Text style={styles.subGreeting}>Welcome to AcadeMEETT🎓</Text>
              </View>
              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
                style={styles.avatar}
              />
            </View>
          </LinearGradient>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View style={styles.featureWrapper} key={index}>
                <LinearGradient
                  colors={[
                    shadeColor(feature.backgroundColor, 0.1),
                    feature.backgroundColor,
                    shadeColor(feature.backgroundColor, -0.3),
                  ]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.featureCard}
                >
                  <TouchableOpacity
                    onPress={feature.onPress}
                    activeOpacity={0.9}
                    style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' }}
                  >
                    <FontAwesome name={feature.icon} size={36} color="#fff" style={styles.icon} />
                    <Text style={styles.featureText}>{feature.name}</Text>
                    <View style={styles.arrowCircle}>
                      <FontAwesome name="arrow-right" size={16} color="#fff" />
                    </View>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            ))}
          </View>
        </ScrollView>
        <BottomNavbar />
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: 18,
    color: '#F0F9FF',
    fontWeight: '500',
  },
  userName: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 4,
  },
  subGreeting: {
    fontSize: 14,
    color: '#E0F2FE',
    marginTop: 4,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#fff',
    marginLeft: 12,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  featureWrapper: {
    width: CARD_WIDTH,
    marginBottom: 20,
  },
  featureCard: {
    flex: 1,
    height: 160,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },
  icon: {
    marginBottom: 10,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  arrowCircle: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 6,
    borderRadius: 20,
  },
});

export default HomeScreen;
