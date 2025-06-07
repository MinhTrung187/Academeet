import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import BottomNavbar from '../Component/BottomNavbar';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

const ProfileScreen: React.FC = () => {
  const scaleAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <LinearGradient
      colors={['#E0F2FE', '#F0F9FF', '#F8FAFC']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Avatar */}
        <Animated.View style={[styles.avatarWrapper, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient
            colors={['#3B82F6', '#1D4ED8']}
            style={styles.avatarBorder}
          >
            <Image
              source={{
                uri: 'https://preview.redd.it/alright-men-whats-your-thoughts-on-ishowspeed-v0-h62uj8viu3cd1.jpeg?auto=webp&s=28f772427d2b9127531a1d463856bf210496fb66',
              }}
              style={styles.avatar}
            />
          </LinearGradient>
        </Animated.View>

        {/* Profile Card */}
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC']}
          style={styles.card}
        >
          <View style={styles.header}>
            <Text style={styles.name}>Nguyen Minh Trung</Text>
            <Text style={styles.jobTitle}>Software Engineer · Entry Level</Text>
            <Text style={styles.location}>20, Ho Chi Minh City</Text>
          </View>

          <Text style={styles.description}>
            Hi! I'm looking for a study partner to stay motivated and learn more
            effectively. I enjoy sharing knowledge and helping each other improve.
            Let's connect and study together!
          </Text>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            {[
              { icon: 'clock-o', text: 'Evening', color: '#3B82F6' },
              { icon: 'calendar', text: 'Everyday', color: '#10B981' },
              { icon: 'line-chart', text: 'Beginner', color: '#F59E0B' },
              { icon: 'user', text: 'Solo', color: '#EC4899' },
            ].map((tag, index) => (
              <TouchableOpacity key={index} style={[styles.tag, { backgroundColor: `${tag.color}22` }]}>
                <FontAwesome name={tag.icon as any} size={16} color={tag.color} style={styles.tagIcon} />
                <Text style={[styles.tagText, { color: tag.color }]}>{tag.text}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Update Button */}
          <TouchableOpacity
            onPress={() => console.log('Update Profile')}
            activeOpacity={0.85}
            style={styles.updateButton}
          >
            <LinearGradient
              colors={['#3B82F6', '#1D4ED8']}
              style={styles.buttonGradient}
            >
              <Text style={styles.updateButtonText}>Update Profile</Text>
              <View style={styles.iconCircle}>
                <FontAwesome name="pencil" size={16} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

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
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'absolute',
    top: 48,
    zIndex: 2,
    alignSelf: 'center',
    marginTop:70

  },
  avatarBorder: {
    borderRadius: 70,
    padding: 4,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: '#fff',
  },
  card: {
    marginTop: 180,
    width: CARD_WIDTH,
    borderRadius: 24,
    paddingTop: 80,
    paddingBottom: 32,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E3A8A',
    fontFamily: 'Poppins-Bold', // Replace with your font
    marginBottom: 6,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
  },
  description: {
    fontSize: 15,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: 'Poppins-Regular',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 6,
  },
  tagIcon: {
    marginRight: 8,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  updateButton: {
    alignSelf: 'center',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 28,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    marginRight: 12,
  },
  iconCircle: {
    backgroundColor: 'rgba(255,255,255,0.3)',
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

export default ProfileScreen;