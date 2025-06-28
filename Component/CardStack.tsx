import React, { useEffect, useState } from 'react';
import { View, Dimensions, Animated, PanResponder, StyleSheet } from 'react-native';
import CardComponent from './CardComponent';

interface User {
  id: string;
  name: string;
  age: number;
  bio?: string;
  occupation?: string;
  educationLevel?: string;
  studyPreferences: string[] | { $values: string[] };
  subjects: string[] | { $values: string[] };
  avatarUrl: string;
}

interface CardStackProps {
  users: User[];
  onSwipeRight: (user: User) => void;
  onSwipeLeft: (user: User) => void;
}

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80; // Lowered threshold for quicker response
const SWIPE_OUT_DURATION = 250; // Faster swipe-out animation
const DECAY_VELOCITY_FACTOR = 0.3; // Smoother decay effect

const CardStack: React.FC<CardStackProps> = ({ users, onSwipeRight, onSwipeLeft }) => {
  const [pans, setPans] = useState<Animated.ValueXY[]>([]);
  const [panResponders, setPanResponders] = useState<any[]>([]);

  useEffect(() => {
    console.log('CardStack useEffect triggered, users:', users);
    const maxCards = Math.min(users.length, 3);

    const newPans: Animated.ValueXY[] = [];
    const newPanResponders: any[] = [];

    for (let i = 0; i < maxCards; i++) {
      newPans[i] = new Animated.ValueXY();
      newPanResponders[i] = PanResponder.create({
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          // Only respond to gestures if moved more than 5 pixels to avoid accidental taps
          return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
        },
        onPanResponderMove: Animated.event(
          [null, { dx: newPans[i].x, dy: newPans[i].y }],
          { useNativeDriver: false } // Set to false due to rotation/scale limitations
        ),
        onPanResponderRelease: (e, gesture) => {
          console.log('PanResponderRelease, dx:', gesture.dx, 'vx:', gesture.vx, 'for user:', users[i]?.name);
          if (!users[i]) return;

          if (gesture.dx > SWIPE_THRESHOLD || gesture.vx > 0.3) {
            // Swipe right with decay
            Animated.decay(newPans[i], {
              velocity: { x: gesture.vx * DECAY_VELOCITY_FACTOR, y: gesture.vy * DECAY_VELOCITY_FACTOR },
              deceleration: 0.995,
              useNativeDriver: false,
            }).start(() => {
              onSwipeRight(users[i]);
              newPans[i].setValue({ x: 0, y: 0 });
            });
          } else if (gesture.dx < -SWIPE_THRESHOLD || gesture.vx < -0.3) {
            // Swipe left with decay
            Animated.decay(newPans[i], {
              velocity: { x: gesture.vx * DECAY_VELOCITY_FACTOR, y: gesture.vy * DECAY_VELOCITY_FACTOR },
              deceleration: 0.995,
              useNativeDriver: false,
            }).start(() => {
              onSwipeLeft(users[i]);
              newPans[i].setValue({ x: 0, y: 0 });
            });
          } else {
            // Return to center with smooth spring
            Animated.spring(newPans[i], {
              toValue: { x: 0, y: 0 },
              friction: 7, // Lower friction for smoother return
              tension: 40, // Higher tension for quicker snap-back
              useNativeDriver: false,
            }).start();
          }
        },
      });
    }

    setPans(newPans);
    setPanResponders(newPanResponders);
  }, [users, onSwipeRight, onSwipeLeft]);

  return (
    <View style={styles.cardContainer}>
      {users.slice(0, 3).map((user, index) => (
        <CardComponent
          key={user.id}
          user={user}
          pan={pans[index] || new Animated.ValueXY()}
          panResponder={panResponders[index] || PanResponder.create({})}
          index={index}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});

export default CardStack;