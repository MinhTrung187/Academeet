import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const options = [
    { label: "I'm Secondary & High School Students (Ages 12-18)", value: 'highschool', icon: 'graduation-cap' },
    { label: "I'm College & University Students (Ages 18-25)", value: 'university', icon: 'university' },
    { label: "I'm Young Professionals (Ages 25-35)", value: 'youngpro', icon: 'briefcase' },
];

const BasicInfoScreen: React.FC = () => {
    const [step, setStep] = useState<number>(1);
    const [selected, setSelected] = useState<string | null>(null);
    const [name, setName] = useState<string>('');
    const [age, setAge] = useState<string>('');
    const [occupation, setOccupation] = useState<string>('');
    const [studyStyle, setStudyStyle] = useState<string | null>(null);
    const [experience, setExperience] = useState<string | null>(null);
    const [studyPreferences, setStudyPreferences] = useState<string[]>([]);
    const [subjectExperiences, setSubjectExperiences] = useState<{ subject: string; level: string }[]>([]);
    const [newSubject, setNewSubject] = useState('');
    const [newLevel, setNewLevel] = useState('');
    const navigation:any = useNavigation();

    const handleNext = () => {
        if (step === 2) {
            const ageNumber = parseInt(age);
            if (isNaN(ageNumber) || ageNumber <= 0 || ageNumber > 120) {
                alert('Please enter a valid age.');
                return;
            }
        }
        if (step < 5) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const renderProgressDots = () => {
        return (
            <View style={styles.progressContainer}>
                {[1, 2, 3, 4, 5].map((dot) => (
                    <View
                        key={dot}
                        style={[
                            styles.progressDot,
                            { backgroundColor: step >= dot ? '#4CAF50' : '#ccc' },
                        ]}
                    />
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerBox}>
                <Text style={styles.headerText}>BASIC INFORMATION</Text>
            </View>
            <View style={styles.background}>
                {renderProgressDots()}

                <ScrollView contentContainerStyle={styles.cardContainer} showsVerticalScrollIndicator={false}>
                    {step === 1 && (
                        <View style={styles.card}>
                            <Text style={styles.title}>Which one of{'\n'}these are you?</Text>
                            <Text style={styles.arrow}>----------------------------------➤</Text>
                            {options.map((opt) => (
                                <TouchableOpacity
                                    key={opt.value}
                                    style={styles.optionRow}
                                    onPress={() => setSelected(opt.value)}
                                    activeOpacity={0.7}
                                >
                                    <FontAwesome name={opt.icon as any} size={20} color="#000" style={styles.optionIcon} />
                                    <View style={styles.checkbox}>
                                        {selected === opt.value && <FontAwesome name="check" size={16} color="#000" />}
                                    </View>
                                    <Text style={styles.optionText}>{opt.label}</Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity
                                style={[
                                    styles.nextBtn,
                                    { backgroundColor: !selected ? '#ccc' : '#4CAF50' },
                                ]}
                                onPress={handleNext}
                                disabled={!selected}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.nextText}>Next</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {step === 2 && (
                        <View style={styles.card}>
                            <Text style={styles.title}>Your age</Text>
                            <Text style={styles.arrow}>----------------------------------➤</Text>
                            <View style={styles.inputContainer}>
                                <FontAwesome name="calendar" size={20} color="#000" style={styles.inputIcon} />
                                <TextInput
                                    placeholder="Enter your age"
                                    value={age}
                                    onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ''))}
                                    style={styles.input}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.row}>
                                <TouchableOpacity
                                    style={[styles.nextBtn, { backgroundColor: '#757575' }]}
                                    onPress={handleBack}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.nextText}>Back</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.nextBtn,
                                        { backgroundColor: age.trim() === '' ? '#ccc' : '#4CAF50' },
                                    ]}
                                    onPress={handleNext}
                                    disabled={age.trim() === ''}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.nextText}>Next</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {step === 3 && (
                        <View style={styles.card}>
                            <Text style={styles.title}>Your occupation{'\n'}/ Education</Text>
                            <Text style={styles.arrow}>----------------------------------➤</Text>
                            <View style={styles.inputContainer}>
                                <FontAwesome name="briefcase" size={20} color="#000" style={styles.inputIcon} />
                                <TextInput
                                    placeholder="Enter occupation / education"
                                    value={occupation}
                                    onChangeText={setOccupation}
                                    style={styles.input}
                                />
                            </View>
                            <View style={styles.row}>
                                <TouchableOpacity
                                    style={[styles.nextBtn, { backgroundColor: '#757575' }]}
                                    onPress={handleBack}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.nextText}>Back</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.nextBtn,
                                        { backgroundColor: occupation.trim() === '' ? '#ccc' : '#4CAF50' },
                                    ]}
                                    onPress={handleNext}
                                    disabled={occupation.trim() === ''}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.nextText}>Next</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {step === 4 && (
                        <View style={styles.card}>
                            <Text style={styles.title}>Your name</Text>
                            <Text style={styles.arrow}>----------------------------------➤</Text>
                            <View style={styles.inputContainer}>
                                <FontAwesome name="user" size={20} color="#000" style={styles.inputIcon} />
                                <TextInput
                                    placeholder="Enter your name"
                                    value={name}
                                    onChangeText={setName}
                                    style={styles.input}
                                />
                            </View>
                            <View style={styles.row}>
                                <TouchableOpacity
                                    style={[styles.nextBtn, { backgroundColor: '#757575' }]}
                                    onPress={handleBack}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.nextText}>Back</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.nextBtn,
                                        { backgroundColor: name.trim() === '' ? '#ccc' : '#4CAF50' },
                                    ]}
                                    onPress={handleNext}
                                    disabled={name.trim() === ''}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.nextText}>Next</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    {step === 5 && (
                        <View style={styles.card}>
                            <Text style={styles.title}>Study Preferences</Text>
                            <Text style={styles.arrow}>----------------------------------➤</Text>

                            <Text style={{ fontSize: 20, color: 'black', fontWeight: '900', marginBottom: 8 }}>Select your study preferences</Text>
                            {["Solo", "Small Group", "Large Group", "Serious & Focused", "Friendly & Chill", "Flexible & Creative"].map((pref) => (
                                <TouchableOpacity
                                    key={pref}
                                    style={styles.optionRow}
                                    onPress={() => {
                                        if (studyPreferences.includes(pref)) {
                                            setStudyPreferences(studyPreferences.filter(p => p !== pref));
                                        } else {
                                            setStudyPreferences([...studyPreferences, pref]);
                                        }
                                    }}
                                >
                                    <View style={styles.checkbox}>
                                        {studyPreferences.includes(pref) && <FontAwesome name="check" size={16} color="#000" />}
                                    </View>
                                    <Text style={styles.optionText}>{pref}</Text>
                                </TouchableOpacity>
                            ))}

                            <Text style={{ fontSize: 20, color: 'black', fontWeight: '900', marginTop: 16, marginBottom: 10 }}>Subject Experience</Text>

                            <View style={styles.inputContainer}>
                                <FontAwesome name="book" size={20} color="#000" style={styles.inputIcon} />
                                <TextInput
                                    placeholder="Enter subject (e.g., English)"
                                    value={newSubject}
                                    onChangeText={setNewSubject}
                                    style={styles.input}
                                />
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 }}>
                                {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                                    <TouchableOpacity
                                        key={level}
                                        style={{
                                            flex: 1,
                                            marginHorizontal: 4,
                                            padding: 10,
                                            borderRadius: 8,
                                            backgroundColor: newLevel === level ? '#4CAF50' : '#e0e0e0',
                                            alignItems: 'center'
                                        }}
                                        onPress={() => setNewLevel(level)}
                                    >
                                        <Text style={{ color: newLevel === level ? '#fff' : '#000' }}>{level}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>


                            <TouchableOpacity
                                style={[
                                    styles.nextBtn,
                                    {
                                        backgroundColor: newSubject && newLevel ? '#4CAF50' : '#ccc',
                                        alignSelf: 'flex-start',
                                        marginTop: 10,
                                    }
                                ]}
                                onPress={() => {
                                    if (newSubject && newLevel) {
                                        setSubjectExperiences([...subjectExperiences, { subject: newSubject, level: newLevel }]);
                                        setNewSubject('');
                                        setNewLevel('');
                                    }
                                }}
                            >
                                <Text style={styles.nextText}>Add Subject</Text>
                            </TouchableOpacity>

                            {/* Display list of added subjects */}
                            {subjectExperiences.map((item, idx) => (
                                <View key={idx} style={styles.optionRow}>
                                    <FontAwesome name="bookmark" size={20} color="#000" style={styles.optionIcon} />
                                    <Text style={styles.optionText}>{item.subject} - {item.level}</Text>
                                </View>
                            ))}

                            <View style={styles.row}>
                                <TouchableOpacity
                                    style={[styles.nextBtn, { backgroundColor: '#757575' }]}
                                    onPress={handleBack}
                                >
                                    <Text style={styles.nextText}>Back</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.nextBtn, { backgroundColor: studyPreferences.length > 0 && subjectExperiences.length > 0 ? '#4CAF50' : '#ccc' }]}
                                    disabled={studyPreferences.length === 0 || subjectExperiences.length === 0}
                                    onPress={() => {
                                        // alert(
                                        //     `✅ Submitted:\n\n` +
                                        //     `👤 Name: ${name}\n` +
                                        //     `🎂 Age: ${age}\n` +
                                        //     `🎓 Occupation: ${occupation}\n` +
                                        //     `📚 Group: ${selected}\n` +
                                        //     `📖 Study Preferences: ${studyPreferences.join(', ')}\n` +
                                        //     `💡 Subject Experience:\n` + subjectExperiences.map(s => `- ${s.subject}: ${s.level}`).join('\n')
                                        // );
                                        navigation.navigate('FinishedInfo'); 
                                        
                                    }}
                                >
                                    <Text style={styles.nextText}>Done!</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                </ScrollView>
            </View>
        </SafeAreaView >
    );
};

export default BasicInfoScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerBox: {
        position: 'absolute',
        top: 30,
        left: (width - 300) / 2, // Center the header box
        right: (width - 300) / 2,
        zIndex: 10,
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 4,
        width: 300, // Fixed width as previously set
        alignItems: 'center',
        marginTop: 40
    },
    headerText: {
        fontWeight: '700',
        fontSize: 16,
        color: '#000',
        textAlign: 'center',
        letterSpacing: 0.5, // Slight letter spacing for better readability
    },
    background: {
        flex: 1,
        backgroundColor: '#B7C7E3',
        alignItems: 'center',
        paddingTop: 40, // Space for header
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        marginTop: 40
    },
    progressDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginHorizontal: 6,
        marginTop: 90,

    },
    cardContainer: {
        width: width * 0.9,
        alignSelf: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        minHeight: 200,
        flexShrink: 0,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 8,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#000',
        marginBottom: 8,
        textAlign: 'center',
    },
    arrow: {
        fontSize: 16,
        marginBottom: 24,
        color: '#555',
        textAlign: 'center',
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingVertical: 8,
    },
    optionIcon: {
        marginRight: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    optionText: {
        flex: 1,
        fontSize: 16,
        color: '#000',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 12,
        marginBottom: 20,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        color: '#000',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    nextBtn: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        minWidth: 100,
        alignItems: 'center',
    },
    nextText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});