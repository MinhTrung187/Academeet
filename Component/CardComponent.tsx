import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';

interface User {
  id: string;
  name: string;
  age: number;
  bio?: string;
  occupation?: string;
  genderIdentity?: string;
  educationLevel?: string;
  studyPreferences: string[] | { $values: string[] };
  subjects: string[] | { $values: string[] };
  avatarUrl: string;
}

interface CardComponentProps {
  user: User;
  pan: Animated.ValueXY;
  panResponder: any;
  index: number;
}
const { width, height } = Dimensions.get('window');

const CARD_WIDTH = Math.min(width * 0.9, 360); // Giới hạn tối đa 360px
const CARD_HEIGHT = Math.min(height * 0.65, 600);

const CardComponent: React.FC<CardComponentProps> = ({ user, pan, panResponder, index }) => {
  const getSafeArray = (
    array: string[] | { $values: string[] } | undefined,
    defaultValue = 'No info'
  ) => (Array.isArray(array) ? array : array?.$values || [defaultValue]);

  const avatarUrl = user.avatarUrl
    ? user.avatarUrl
    : 'https://randomuser.me/api/portraits/men/1.jpg';


  const rotate = pan.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const scale = pan.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: [0.92, 1, 0.92],
    extrapolate: 'clamp',
  });

  const skipOpacity = pan.x.interpolate({
    inputRange: [-width / 2, -width / 4, 0],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });
  const bioLength = user.bio?.length || 0;
  const bioFontSize =
    bioLength > 220 ? 12 :
      bioLength > 150 ? 13 :
        bioLength > 100 ? 14 :
          15;


  const connectOpacity = pan.x.interpolate({
    inputRange: [0, width / 4, width / 2],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const animatedStyle = {
    transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }, { scale }],
    zIndex: 3 - index,
    opacity: 1 - index * 0.1,
  };
  // Tính toán số lượng chip để điều chỉnh kích thước font và padding động
  const subjects = getSafeArray(user.subjects);
  const preferences = getSafeArray(user.studyPreferences);
  const totalChips = subjects.length + preferences.length;
  const dynamicFontSize = totalChips > 8 ? 12 : totalChips > 5 ? 13 : 14;
  const dynamicChipPadding = totalChips > 8 ? 6 : 8;


  return (
    <Animated.View style={[styles.card, animatedStyle]} {...panResponder.panHandlers}>
      <LinearGradient
        colors={['#FFFFFF', '#F0F4FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardInner}
      >
        {/* Labels */}
        <Animated.View style={[styles.labelContainer, styles.skipLabel, { opacity: skipOpacity }]}>
          <FontAwesome name="times-circle" size={22} color="#EF4444" />
          <Text style={styles.labelText}>Skip</Text>
        </Animated.View>

        <Animated.View style={[styles.labelContainer, styles.connectLabel, { opacity: connectOpacity }]}>
          <FontAwesome name="check-circle" size={22} color="#10B981" />
          <Text style={styles.labelText}>Connect</Text>
        </Animated.View>

        {/* Avatar Gradient */}
        <LinearGradient colors={['#60A5FA', '#A78BFA']} style={styles.avatarGradient}>
          <View style={styles.avatarBorder}>
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          </View>
        </LinearGradient>

        <View style={styles.onlineIndicator} />

        {/* Name - dòng riêng */}
        <Text style={styles.nameText}>
          {user.name || 'Unnamed User'}
        </Text>

        {/* Age + Gender - dòng riêng */}
        <View style={styles.ageGenderRow}>
          <Text style={styles.ageText}>
            {user.age ? `${user.age} years old` : 'Unknown age'}
          </Text>
          {user.genderIdentity && (
            <View style={styles.genderTag}>
              <FontAwesome
                name={
                  user.genderIdentity.toLowerCase() === 'male'
                    ? 'mars'
                    : user.genderIdentity.toLowerCase() === 'female'
                      ? 'venus'
                      : 'genderless'
                }
                size={14}
                color={
                  user.genderIdentity.toLowerCase() === 'male'
                    ? '#3B82F6'
                    : user.genderIdentity.toLowerCase() === 'female'
                      ? '#EC4899'
                      : '#10B981'
                }
              />
              <Text
                style={[
                  styles.genderText,
                  {
                    color:
                      user.genderIdentity.toLowerCase() === 'male'
                        ? '#3B82F6'
                        : user.genderIdentity.toLowerCase() === 'female'
                          ? '#EC4899'
                          : '#10B981',
                  },
                ]}
              >
                {'  '}
                {user.genderIdentity}
              </Text>
            </View>
          )}
        </View>


        {/* Occupation */}
        <View style={styles.detailRow}>
          <FontAwesome name="briefcase" size={16} color="#3B82F6" />
          <Text style={styles.detailText}>{user.occupation || 'Student'}</Text>
        </View>

        {/* Subjects */}
        <View style={styles.detailRow}>
          <FontAwesome name="book" size={16} color="#6366F1" />
          <Text style={styles.detailLabel}>Subjects</Text>
        </View>
        <View style={styles.chipContainer}>
          {getSafeArray(user.subjects).map((subj, i) => (
            <View key={i} style={styles.chip}>
              <Text style={styles.chipText}>{subj.trim()}</Text>
            </View>
          ))}
        </View>

        {/* Study Preferences */}
        <View style={styles.detailRow}>
          <FontAwesome name="lightbulb-o" size={16} color="#F59E0B" />
          <Text style={styles.detailLabel}>Study Style</Text>
        </View>
        <View style={styles.chipContainer}>
          {getSafeArray(user.studyPreferences).map((pref, i) => (
            <View key={i} style={[styles.chip, { backgroundColor: '#FEF3C7' }]}>
              <Text style={[styles.chipText, { color: '#92400E' }]}>{pref.trim()}</Text>
            </View>
          ))}
        </View>

        {/* Bio */}
        <View style={styles.bioContainer}>
          <FontAwesome name="quote-left" size={12} color="#6B7280" style={styles.quoteIcon} />
          <Text style={[styles.bio, { fontSize: bioFontSize }]}>{user.bio || 'No bio available'}</Text>
          <FontAwesome name="quote-right" size={12} color="#6B7280" style={styles.quoteIcon} />
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT, // Thêm height cố định
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    backgroundColor: '#fff',

  },
  cardInner: {
    flex: 1,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  avatarGradient: {
    width: 108,
    height: 108,
    borderRadius: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  onlineIndicator: {
    position: 'absolute',
    top: 120,
    right: width * 0.36,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34D399',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cardName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  detailText: {
    fontSize: 15,
    color: '#374151',
    marginLeft: 10,
    fontFamily: 'Poppins-Regular',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    fontFamily: 'Poppins-Medium',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  chip: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 6,
  },
  chipText: {
    fontSize: 13,
    color: '#0369A1',
    fontFamily: 'Poppins-Medium',
  },
  bioContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderLeftWidth: 3,
    borderLeftColor: '#60A5FA',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#4B5563',
    fontFamily: 'Poppins-Light',
    flex: 1,
    textAlign: 'left',
    lineHeight: 20,
  },
  quoteIcon: {
    marginHorizontal: 6,
    marginTop: 2,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Poppins-SemiBold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 4,
  },

  ageGenderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 12,
  },

  ageText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },

  genderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  genderText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },

  labelContainer: {
    position: 'absolute',
    top: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },

  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 6,
  },

  skipLabel: {
    left: 16,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  connectLabel: {
    right: 16,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  labelText: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
    fontFamily: 'Poppins-SemiBold',
    color: '#1F2937',
  },
});

export default CardComponent;
