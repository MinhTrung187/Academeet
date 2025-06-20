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
  avatars: string[] | { $values: string[] };
}

interface CardStackProps {
  users: User[];
  onSwipeRight: (user: User) => void;
  onSwipeLeft: (user: User) => void;
}

const { width, height } = Dimensions.get('window');

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
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event([null, { dx: newPans[i].x, dy: newPans[i].y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (e, gesture) => {
          console.log('PanResponderRelease, dx:', gesture.dx, 'for user:', users[i]?.name);
          if (gesture.dx > 120 && users[i]) {
            Animated.spring(newPans[i], {
              toValue: { x: width + 100, y: gesture.dy },
              useNativeDriver: false,
            }).start(() => {
              onSwipeRight(users[i]);
              newPans[i].setValue({ x: 0, y: 0 });
            });
          } else if (gesture.dx < -120 && users[i]) {
            Animated.spring(newPans[i], {
              toValue: { x: -width - 100, y: gesture.dy },
              useNativeDriver: false,
            }).start(() => {
              onSwipeLeft(users[i]);
              newPans[i].setValue({ x: 0, y: 0 });
            });
          } else {
            Animated.spring(newPans[i], {
              toValue: { x: 0, y: 0 },
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
  cardContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default CardStack;