import React from 'react';
import { View, Text, Image, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';

interface User {
  id: string;
  name: string;
  age: number;
  bio?: string;
  occupation?: string;
  educationLevel?: string;
  studyPreferences: string[] | { $values: string[] };
  subjects: string[] | { $values: string[] };
  avatars: string[] | { $values: string[] };
}

interface CardComponentProps {
  user: User;
  pan: Animated.ValueXY;
  panResponder: any;
  index: number;
}

const { width } = Dimensions.get('window');

const CardComponent: React.FC<CardComponentProps> = ({ user, pan, panResponder, index }) => {
  console.log('Rendering CardComponent for user:', user.name, 'at index:', index);

  const getSafeArray = (array: string[] | { $values: string[] } | undefined, defaultValue = 'No info') =>
    Array.isArray(array) ? array.join(', ') : array?.$values?.join(', ') || defaultValue;

  // Hiệu ứng xoay khi kéo
  const rotate = pan.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-8deg', '0deg', '8deg'],
    extrapolate: 'clamp',
  });

  // Hiệu ứng scale khi kéo
  const scale = pan.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: [0.95, 1, 0.95],
    extrapolate: 'clamp',
  });

  // Opacity cho nhãn "Skip" và "Connect"
  const skipOpacity = pan.x.interpolate({
    inputRange: [-width / 2, -width / 4, 0],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const connectOpacity = pan.x.interpolate({
    inputRange: [0, width / 4, width / 2],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const animatedStyle = {
    transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }, { scale }],
    zIndex: 3 - index,
    opacity: 1 - index * 0.15,
  };

  return (
    <Animated.View style={[styles.card, animatedStyle]} {...panResponder.panHandlers}>
      <LinearGradient
        colors={['#E6F0FA', '#F0F4FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardInner}
      >
        {/* Nhãn "Skip" (quẹt trái) */}
        <Animated.View style={[styles.labelContainer, styles.skipLabel, { opacity: skipOpacity }]}>
          <FontAwesome name="times-circle" size={32} color="#EF4444" />
          <Text style={styles.labelText}>Skip</Text>
        </Animated.View>

        {/* Nhãn "Connect" (quẹt phải) */}
        <Animated.View style={[styles.labelContainer, styles.connectLabel, { opacity: connectOpacity }]}>
          <FontAwesome name="check-circle" size={32} color="#34D399" />
          <Text style={styles.labelText}>Connect</Text>
        </Animated.View>

        {/* Avatar */}
        <Image
          source={{
            uri:
              Array.isArray(user.avatars)
                ? user.avatars[0] || 'https://randomuser.me/api/portraits/lego/1.jpg'
                : user.avatars?.$values?.[0] || 'https://randomuser.me/api/portraits/lego/1.jpg',
          }}
          style={styles.avatar}
        />
        <View style={styles.onlineIndicator} />

        {/* Thông tin người dùng */}
        <Text style={styles.cardName}>{user.name || 'Unnamed User'}</Text>
        <Text style={styles.cardSub}>{user.age ? `${user.age} years old` : 'Unknown age'}</Text>

        <View style={styles.detailContainer}>
          <View style={styles.detailRow}>
            <FontAwesome name="graduation-cap" size={14} color="#2563EB" />
            <Text style={styles.detailText}>{user.occupation || 'Unknown'}</Text>
          </View>
          <View style={styles.detailRow}>
            <FontAwesome name="book" size={14} color="#4A90E2" />
            <Text style={styles.detailText}>{getSafeArray(user.subjects)}</Text>
          </View>
          <View style={styles.detailRow}>
            <FontAwesome name="lightbulb-o" size={14} color="#9B59B6" />
            <Text style={styles.detailText}>{getSafeArray(user.studyPreferences)}</Text>
          </View>
        </View>

        {/* Bio */}
        <View style={styles.bioContainer}>
          <FontAwesome name="quote-left" size={10} color="#6B7280" style={styles.quoteIcon} />
          <Text style={styles.bio}>{user.bio || 'No bio available'}</Text>
          <FontAwesome name="quote-right" size={10} color="#6B7280" style={styles.quoteIcon} />
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: width * 0.9,
    height: 520,
    borderRadius: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  cardInner: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#93C5FD',
    marginBottom: 12,
  },
  onlineIndicator: {
    position: 'absolute',
    top: 110,
    right: width * 0.4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#34D399',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  cardName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    marginBottom: 12,
  },
  detailContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    fontFamily: 'Poppins-Medium',
    flexShrink: 1,
  },
  bioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    minHeight: 60,
  },
  bio: {
    fontSize: 13,
    color: '#4B5563',
    fontStyle: 'italic',
    fontFamily: 'Poppins-Regular',
    flex: 1,
    textAlign: 'center',
  },
  quoteIcon: {
    marginHorizontal: 6,
  },
  labelContainer: {
    position: 'absolute',
    top: 20,
    padding: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skipLabel: {
    left: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  connectLabel: {
    right: 20,
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    borderWidth: 1,
    borderColor: '#34D399',
  },
  labelText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default CardComponent;