import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import HeaderComponent from '../Component/HeaderComponent';
import BottomNavbar from '../Component/BottomNavbar';


const { width } = Dimensions.get('window');

const tools = [
    { name: 'FLASHCARD', backgroundColor: '#FFB6C1', icon: '📚' },
    { name: 'POMODORO TIMER', backgroundColor: '#D8BFD8', icon: '⏰' },
    { name: 'NOTE-TAKING', backgroundColor: '#B0C4DE', icon: '📝' },
    { name: 'CALENDAR', backgroundColor: '#DDA0DD', icon: '📅' },
    { name: 'AI ASSISTANT', backgroundColor: '#FFFACD', icon: '🤖' },
    { name: 'AI DOCUMENT ANALYSIS', backgroundColor: '#F0E68C', icon: '📄' },
];

const StudyToolScreen = () => {
    const fadeAnim = new Animated.Value(0);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <LinearGradient colors={['#E6F0FA', '#F5F7FA', '#FFFFFF']} style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <HeaderComponent />
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
                        <Text style={styles.headerText}>Study tool</Text>
                    </Animated.View>
                    <View style={styles.toolsContainer}>
                        {tools.map((tool, index) => (
                            <Animated.View key={index} style={[styles.toolCard, { opacity: fadeAnim }]}>
                                <LinearGradient
                                    colors={[shadeColor(tool.backgroundColor, 0.2), tool.backgroundColor, shadeColor(tool.backgroundColor, -0.2)]}
                                    style={styles.toolGradient}
                                >
                                    <TouchableOpacity style={styles.toolButton} activeOpacity={0.7}>
                                        <Text style={styles.toolIcon}>{tool.icon}</Text>
                                        <Text style={styles.toolName}>{tool.name}</Text>
                                        <View style={styles.arrowCircle}>
                                            <Text style={styles.arrow}>→</Text>
                                        </View>
                                    </TouchableOpacity>
                                </LinearGradient>
                            </Animated.View>
                        ))}
                    </View>
                </ScrollView>
                <BottomNavbar />
            </SafeAreaView>

        </LinearGradient>
    );
};

// Hàm tạo màu shade (tương tự HomeScreen)
const shadeColor = (color: any, percent: any) => {
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: StatusBar.currentHeight || 0, // Adjust for status bar height

    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        marginTop: 20
    },
    header: {
        marginBottom: 20,
    },
    headerText: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1E3A8A',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    toolsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: width - 32,
    },
    toolCard: {
        width: (width - 48) / 2,
        marginBottom: 16,
    },
    toolGradient: {
        height: 120,
        borderRadius: 15,
        padding: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    toolButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toolIcon: {
        fontSize: 30,
        marginBottom: 8,
    },
    toolName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E3A8A',
        textAlign: 'center',
    },
    arrowCircle: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(30, 58, 138, 0.2)',
        padding: 4,
        borderRadius: 12,
    },
    arrow: {
        fontSize: 14,
        color: '#1E3A8A',
    },
});

export default StudyToolScreen;