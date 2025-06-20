import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

type BottomNavbarProps = {
    currentScreen?: 'Home' | 'Chat' | 'Profile';
};

type RootStackParamList = {
    Home: undefined;
    Chat: undefined;
    Profile: undefined;
};

const BottomNavbar: React.FC<BottomNavbarProps> = ({ currentScreen }) => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const route = useRoute();
    const currentRouteName = route.name as 'Home' | 'Chat' | 'Profile';

    const activeScreen = currentScreen || currentRouteName;

    const tabs = [
        { name: 'Home', icon: 'home', iconLib: 'Feather' },
        { name: 'FriendList', icon: 'message-circle', iconLib: 'Feather' },
        { name: 'MyProfile', icon: 'user', iconLib: 'Feather' },
    ];

    return (
        <LinearGradient
            colors={['#634fee', '#1553f6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.container}
        >
            {tabs.map((tab) => {
                const isActive = activeScreen === tab.name;
                const IconComponent = tab.iconLib === 'Feather' ? Feather : FontAwesome5;

                return (
                    <TouchableOpacity
                        key={tab.name}
                        style={[styles.tab, isActive && styles.tabActive]}
                        onPress={() => {
                            if (!isActive) {
                                navigation.navigate(tab.name as keyof RootStackParamList);
                            }
                        }}
                        disabled={isActive}
                        activeOpacity={0.7}
                    >
                        <IconComponent
                            name={tab.icon}
                            size={tab.name === 'Chat' ? 20 : 22} // Giảm kích thước icon
                            color={isActive ? '#FFFFFF' : '#D1D5DB'}
                        />
        
                        {isActive && <View style={styles.activeIndicator} />}
                    </TouchableOpacity>
                );
            })}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 8,
        paddingBottom: 16,
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(255, 255, 255, 0.3)',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        position: 'absolute',
        bottom: 0,
        width: '100%',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
    },
    tab: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 10,
    },
    tabActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    label: {
        fontSize: 10,
        fontWeight: '500',
        marginTop: 2,
    },
    activeIndicator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#FFFFFF',
        marginTop: 4,
    },
});

export default BottomNavbar;