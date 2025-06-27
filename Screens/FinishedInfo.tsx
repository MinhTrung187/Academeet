import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const FinishedInfo: React.FC = () => {
    const navigation: any = useNavigation();

    return (
        <View style={styles.container}>
            <Animatable.Text
                animation="fadeInDown"
                duration={800}
                style={styles.header}
            >
                Let's Get to Know You
            </Animatable.Text>
            <Animatable.View
                animation="fadeInUp"
                duration={1000}
                style={styles.card}
            >
                <Animatable.View animation="bounceIn" duration={1200}>
                    <FontAwesome name="user-circle" size={70} color="#3C51F2" style={styles.icon} />
                </Animatable.View>
                <Text style={styles.title}>Thank You for Sharing!</Text>
                <Text style={styles.subtitle}>Your profile is ready! Let's explore what you can do next.</Text>
                <Animatable.View
                    animation="pulse"
                    iterationCount="infinite"
                    duration={2000}
                    style={styles.buttonContainer}
                >
                    <TouchableOpacity
                        style={styles.startBtn}
                        onPress={() => navigation.navigate('Home')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.gradientBtn}>
                            <Text style={styles.startText}>Get Started</Text>
                            <FontAwesome name="arrow-right" size={18} color="#fff" style={styles.arrowIcon} />
                        </View>
                    </TouchableOpacity>
                </Animatable.View>
            </Animatable.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#ffffff', // Light purple-blue to complement gradient
    },
    header: {
        fontSize: 22,
        fontWeight: '700',
        color: '#263238',
        marginBottom: 30,
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 5,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        width: width * 0.9,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 4,
    },
    icon: {
        marginBottom: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#263238',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#546E7A',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    buttonContainer: {
        marginTop: 16,
    },
    startBtn: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    gradientBtn: {
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3C51F2', // Midpoint of gradient #634FEE to #1553F6
        // Note: React Native doesn't support CSS linear gradients natively.
        // For true gradient, consider using 'react-native-linear-gradient' package.
        // Current style uses a solid color as fallback.
    },
    startText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 18,
        marginRight: 10,
    },
    arrowIcon: {
        marginLeft: 5,
    },
});

export default FinishedInfo;