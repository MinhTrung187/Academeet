import React, { useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;


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
  const navigation: any = useNavigation();
  const features: FeatureItem[] = [
    {
      name: 'FIND FRIEND',
      icon: 'user-plus',
      backgroundColor: '#3B82F6',
      onPress: () => navigation.navigate('FindFriends'),

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
      onPress: () => navigation.navigate('Premium'),
    },
    {
      name: 'AI ASSISTANT',
      icon: 'cogs',
      backgroundColor: '#8B5CF6',
      onPress: () => navigation.navigate('AIScreen'),
    },
    {
      name: 'FIND LOCATION',
      icon: 'map-marker',
      backgroundColor: '#EF4444',
      // onPress: () => console.log('Find Location'),
      onPress: () => navigation.navigate('FindLocation'),

    },
  ];
  const fadeAnim = new Animated.Value(0);
  const scaleAnims = features.map(() => new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      ...scaleAnims.map((anim, index) =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          delay: index * 100,
          useNativeDriver: true,
        })
      ),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={['#E0F2FE', '#F0F9FF', '#F8FAFC']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Header */}
          <LinearGradient
            colors={['#60A5FA', '#3B82F6', '#1D4ED8']}
            style={styles.headerContainer}
          >
            <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.greeting}>Hello 👋</Text>
                <Text style={styles.userName}>Nguyen Minh Trung</Text>
                <Text style={styles.subGreeting}>Welcome to AcadeMEETT 🎓</Text>
              </View>
              <Animated.View style={{ transform: [{ scale: fadeAnim }] }}>
                <Image
                  source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
                  style={styles.avatar}
                />
              </Animated.View>
            </Animated.View>
          </LinearGradient>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.featureWrapper,
                  { transform: [{ scale: scaleAnims[index] }] },
                ]}
              >
                <LinearGradient
                  colors={[
                    shadeColor(feature.backgroundColor, 0.2),
                    feature.backgroundColor,
                    shadeColor(feature.backgroundColor, -0.2),
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.featureCard}
                >
                  <TouchableOpacity
                    onPress={feature.onPress}
                    activeOpacity={0.85}
                    style={styles.featureButton}
                  >
                    <FontAwesome
                      name={feature.icon}
                      size={40}
                      color="#fff"
                      style={styles.icon}
                    />
                    <Text style={styles.featureText}>{feature.name}</Text>
                    <View style={styles.arrowCircle}>
                      <FontAwesome name="arrow-right" size={16} color="#fff" />
                    </View>
                  </TouchableOpacity>
                </LinearGradient>
              </Animated.View>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Navbar */}
        <View style={styles.bottomNavbarContainer}>
          <BottomNavbar />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingVertical: 48,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 20,
    color: '#F0F9FF',
    fontWeight: '500',
    fontFamily: 'Poppins-Regular', // Replace with your font
  },
  userName: {
    fontSize: 30,
    color: '#fff',
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    marginVertical: 6,
  },
  subGreeting: {
    fontSize: 16,
    color: '#E0F2FE',
    fontFamily: 'Poppins-Regular',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
    marginLeft: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  featureWrapper: {
    width: CARD_WIDTH,
    marginBottom: 24,
  },
  featureCard: {
    flex: 1,
    height: 180,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  featureButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  icon: {
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
    marginBottom: 16,
  },
  arrowCircle: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    padding: 8,
    borderRadius: 20,
  },
  bottomNavbarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
});

export default HomeScreen;