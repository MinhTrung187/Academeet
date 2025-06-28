import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, ScrollView, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Define interfaces for data from API
interface Item {
    $id?: string;
    id: number;
    name: string;
}

interface ApiResponse {
    $id?: string;
    $values?: Item[];
}

interface Option {
    label: string;
    value: string;
    icon: string;
}

interface CurrentUser {
    name: string;
    middleName: string;
    dateOfBirth: string;
}

const iconMapping: Record<string, string> = {
    Student: 'graduation-cap',
    'Software Engineer': 'code',
    'Data Analyst': 'line-chart',
    Teacher: 'book',
    Researcher: 'flask',
    Freelancer: 'laptop',
    'Business Owner': 'briefcase',
    'Marketing Specialist': 'bullhorn',
    Designer: 'paint-brush',
    Unemployed: 'user',
    Other: 'question-circle',
    Solo: 'user',
    'Small Group': 'users',
    'Large Group': 'group',
    Beginner: 'graduation-cap',
    Intermediate: 'book',
    Advanced: 'certificate',
};

const fetchOptions = async (url: string): Promise<Option[]> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        let items: Item[] = [];
        if (Array.isArray(data)) {
            items = data;
        } else if (data.$values && Array.isArray(data.$values)) {
            items = data.$values;
        } else {
            console.error(`Unexpected response format for ${url}:`, data);
            return [];
        }

        return items
            .filter((item): item is Item => item && typeof item.id === 'number' && typeof item.name === 'string')
            .map((item: Item) => ({
                label: item.name,
                value: item.id.toString(),
                icon: iconMapping[item.name] ?? 'question',
            }));
    } catch (error) {
        console.error(`Error fetching from ${url}:`, error);
        return [];
    }
};

const BasicInfoScreen: React.FC = () => {
    const [step, setStep] = useState<number>(1);
    const [selected, setSelected] = useState<string | null>(null);
    const [name, setName] = useState<string>('');
    const [occupation, setOccupation] = useState<string>('');
    const [studyPreferences, setStudyPreferences] = useState<Option[]>([]);
    const [educationLevels, setEducationLevels] = useState<Option[]>([]);
    const [selectedEducationLevel, setSelectedEducationLevel] = useState<string | null>(null);
    const [studyPreferencesSelected, setStudyPreferencesSelected] = useState<string[]>([]);
    const [subjectExperiences, setSubjectExperiences] = useState<{ subject: string; level: string }[]>([]);
    const [options, setOptions] = useState<Option[]>([]);
    const [genderOptions, setGenderOptions] = useState<Option[]>([]);
    const [subjectOptions, setSubjectOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [errors, setErrors] = useState<Record<string, string | null>>({
        genderOptions: null,
        studyPreferences: null,
        educationLevels: null,
        subjectOptions: null,
        occupationOptions: null,
        currentUser: null,
    });
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const navigation = useNavigation<any>();
    const fadeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();

        setLoading(true);
        Promise.all([
            fetchOptions('https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/StudyPreference')
                .then(setStudyPreferences)
                .catch((err) => setErrors((prev) => ({ ...prev, studyPreferences: err.message }))),
            fetchOptions('https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/EducationLevel')
                .then(setEducationLevels)
                .catch((err) => setErrors((prev) => ({ ...prev, educationLevels: err.message }))),
            fetchOptions('https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/GenderIdentity')
                .then(setGenderOptions)
                .catch((err) => setErrors((prev) => ({ ...prev, genderOptions: err.message }))),
            fetchOptions('https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Subject')
                .then(setSubjectOptions)
                .catch((err) => setErrors((prev) => ({ ...prev, subjectOptions: err.message }))),
            fetchOptions('https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Occupation')
                .then(setOptions)
                .catch((err) => setErrors((prev) => ({ ...prev, occupationOptions: err.message }))),
            fetch('https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/User/current-user')
                .then((res) => res.json())
                .then(setCurrentUser)
                .catch((err) => setErrors((prev) => ({ ...prev, currentUser: err.message }))),
        ]).finally(() => setLoading(false));
    }, []);

    const getIdFromValue = (value: string, options: Option[]): number => {
        const option = options.find((opt) => opt.value === value);
        return option ? parseInt(option.value) : 0;
    };

    const HandleFinish = async () => {
        if (!currentUser) {
            console.error('Current user data not loaded');
            return;
        }

        const nameParts = currentUser.name.split(' ');
        const userData = {
            firstName: nameParts[0] || '',
            lastName: nameParts[nameParts.length - 1] || '',
            middleName: nameParts.slice(1, -1).join(' ') || '',
            dateOfBirth: currentUser.dateOfBirth || '2003-06-12',
            bio: occupation || '',
            occupationId: getIdFromValue(selected || '', options),
            genderIdentityId: getIdFromValue(name || '', genderOptions),
            educationLevelId: getIdFromValue(selectedEducationLevel || '', educationLevels),
            studyPreferenceIds: studyPreferencesSelected.map((pref) => getIdFromValue(pref, studyPreferences)),
            subjectIds: subjectExperiences.map((item) => getIdFromValue(item.subject, subjectOptions)),
        };

        try {
            const response = await fetch('https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                navigation.navigate('FinishedInfo');
            } else {
                console.error('Failed to update user information:', await response.text());
            }
        } catch (error) {
            console.error('Error updating user information:', error);
        }
    };

    const handleNext = () => {
        if (step === 2 && (studyPreferencesSelected.length === 0 || !selectedEducationLevel)) {
            alert('Please select at least one study preference and an education level.');
            return;
        }
        if (step < 5) {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                setStep(step + 1);
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }).start();
            });
        }
    };

    const handleBack = () => {
        if (step > 1) {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                setStep(step - 1);
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }).start();
            });
        }
    };

    const renderProgressDots = () => {
        return (
            <View style={styles.progressContainer}>
                {[1, 2, 3, 4, 5].map((dot) => (
                    <Animated.View
                        key={dot}
                        style={[
                            styles.progressDot,
                            {
                                backgroundColor: step >= dot ? '#634FEE' : '#E0E0E0',
                                transform: [
                                    {
                                        scale: step === dot ? 1.2 : 1,
                                    },
                                ],
                            },
                        ]}
                    />
                ))}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerBox}>
                <Text style={styles.headerText}>Basic Information</Text>
            </View>
            <View style={styles.background}>
                {renderProgressDots()}
                <ScrollView contentContainerStyle={styles.cardContainer} showsVerticalScrollIndicator={false}>
                    <Animated.View style={{ opacity: fadeAnim }}>
                        {step === 1 && (
                            <View style={styles.card}>
                                <Text style={styles.title}>Who Are You?</Text>
                                <Text style={styles.subtitle}>Select your occupation</Text>
                                {loading ? (
                                    <Text style={styles.subtitle}>Loading...</Text>
                                ) : errors.occupationOptions ? (
                                    <Text style={styles.errorText}>Error: {errors.occupationOptions}</Text>
                                ) : (
                                    options.map((opt) => (
                                        <TouchableOpacity
                                            key={opt.value}
                                            style={[
                                                styles.optionRow,
                                                selected === opt.value && styles.optionRowSelected,
                                            ]}
                                            onPress={() => setSelected(opt.value)}
                                            activeOpacity={0.8}
                                        >
                                            <FontAwesome name={opt.icon as any} size={24} color={selected === opt.value ? '#634FEE' : '#333'} />
                                            <Text style={[styles.optionText, selected === opt.value && styles.optionTextSelected]}>
                                                {opt.label}
                                            </Text>
                                            {selected === opt.value && (
                                                <FontAwesome name="check-circle" size={24} color="#634FEE" />
                                            )}
                                        </TouchableOpacity>
                                    ))
                                )}
                                <TouchableOpacity
                                    style={[styles.nextBtn, { backgroundColor: selected ? '#634FEE' : '#B0BEC5' }]}
                                    onPress={handleNext}
                                    disabled={!selected}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.nextText}>Next</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {step === 2 && (
                            <View style={styles.card}>
                                <Text style={styles.title}>Your Study Preferences</Text>
                                <Text style={styles.subtitle}>Choose your preferences and education level</Text>
                                {loading ? (
                                    <Text style={styles.subtitle}>Loading...</Text>
                                ) : errors.studyPreferences || errors.educationLevels ? (
                                    <Text style={styles.errorText}>
                                        Error: {errors.studyPreferences || errors.educationLevels}
                                    </Text>
                                ) : (
                                    <>
                                        <Text style={styles.sectionTitle}>Study Preferences</Text>
                                        {studyPreferences.map((pref) => (
                                            <TouchableOpacity
                                                key={pref.value}
                                                style={[
                                                    styles.optionRow,
                                                    studyPreferencesSelected.includes(pref.value) && styles.optionRowSelected,
                                                ]}
                                                onPress={() => {
                                                    setStudyPreferencesSelected(
                                                        studyPreferencesSelected.includes(pref.value)
                                                            ? studyPreferencesSelected.filter((p) => p !== pref.value)
                                                            : [...studyPreferencesSelected, pref.value]
                                                    );
                                                }}
                                                activeOpacity={0.8}
                                            >

                                                <Text
                                                    style={[
                                                        styles.optionText,
                                                        studyPreferencesSelected.includes(pref.value) && styles.optionTextSelected,
                                                    ]}
                                                >
                                                    {pref.label}
                                                </Text>
                                                {studyPreferencesSelected.includes(pref.value) && (
                                                    <FontAwesome name="check-circle" size={24} color="#634FEE" />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Education Level</Text>
                                        {educationLevels.map((level) => (
                                            <TouchableOpacity
                                                key={level.value}
                                                style={[
                                                    styles.optionRow,
                                                    selectedEducationLevel === level.value && styles.optionRowSelected,
                                                ]}
                                                onPress={() => setSelectedEducationLevel(level.value)}
                                                activeOpacity={0.8}
                                            >

                                                <Text
                                                    style={[
                                                        styles.optionText,
                                                        selectedEducationLevel === level.value && styles.optionTextSelected,
                                                    ]}
                                                >
                                                    {level.label}
                                                </Text>
                                                {selectedEducationLevel === level.value && (
                                                    <FontAwesome name="check-circle" size={24} color="#634FEE" />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                        <View style={styles.row}>
                                            <TouchableOpacity
                                                style={styles.backBtn}
                                                onPress={handleBack}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={styles.nextText}>Back</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[
                                                    styles.nextBtn,
                                                    {
                                                        backgroundColor:
                                                            studyPreferencesSelected.length === 0 || !selectedEducationLevel
                                                                ? '#B0BEC5'
                                                                : '#634FEE',
                                                    },
                                                ]}
                                                onPress={handleNext}
                                                disabled={studyPreferencesSelected.length === 0 || !selectedEducationLevel}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={styles.nextText}>Next</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                )}
                            </View>
                        )}

                        {step === 3 && (
                            <View style={styles.card}>
                                <Text style={styles.title}>Your Bio</Text>
                                <Text style={styles.subtitle}>Tell us about yourself</Text>

                                <TextInput
                                    placeholder="Write a short bio about yourself"
                                    value={occupation}
                                    onChangeText={setOccupation}
                                    style={styles.input}
                                    multiline
                                    numberOfLines={4}
                                    placeholderTextColor="#78909C"
                                />

                                {/* Hiển thị cảnh báo nếu bio quá dài */}
                                {occupation.length > 255 && (
                                    <Text style={styles.warningText}>
                                        Bio is too long. Maximum 255 characters allowed.
                                    </Text>
                                )}

                                <View style={styles.row}>
                                    <TouchableOpacity
                                        style={styles.backBtn}
                                        onPress={handleBack}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.nextText}>Back</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.nextBtn,
                                            {
                                                backgroundColor:
                                                    occupation.trim() && occupation.length <= 255
                                                        ? '#634FEE'
                                                        : '#B0BEC5',
                                            },
                                        ]}
                                        onPress={handleNext}
                                        disabled={!occupation.trim() || occupation.length > 255}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.nextText}>Next</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}


                        {step === 4 && (
                            <View style={styles.card}>
                                <Text style={styles.title}>Gender Identity</Text>
                                <Text style={styles.subtitle}>Select your gender identity</Text>
                                {loading ? (
                                    <Text style={styles.subtitle}>Loading...</Text>
                                ) : errors.genderOptions ? (
                                    <Text style={styles.errorText}>Error: {errors.genderOptions}</Text>
                                ) : (
                                    <>
                                        {genderOptions.map((opt) => (
                                            <TouchableOpacity
                                                key={opt.value}
                                                style={[styles.optionRow, name === opt.value && styles.optionRowSelected]}
                                                onPress={() => setName(opt.value)}
                                                activeOpacity={0.8}
                                            >

                                                <Text
                                                    style={[styles.optionText, name === opt.value && styles.optionTextSelected]}
                                                >
                                                    {opt.label}
                                                </Text>
                                                {name === opt.value && (
                                                    <FontAwesome name="check-circle" size={24} color="#634FEE" />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                        <View style={styles.row}>
                                            <TouchableOpacity
                                                style={styles.backBtn}
                                                onPress={handleBack}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={styles.nextText}>Back</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[
                                                    styles.nextBtn,
                                                    { backgroundColor: name.trim() ? '#634FEE' : '#B0BEC5' },
                                                ]}
                                                onPress={handleNext}
                                                disabled={!name.trim()}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={styles.nextText}>Next</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                )}
                            </View>
                        )}

                        {step === 5 && (
                            <View style={styles.card}>
                                <Text style={styles.title}>Your Subjects</Text>
                                <Text style={styles.subtitle}>Select subjects you're interested in</Text>
                                {loading ? (
                                    <Text style={styles.subtitle}>Loading...</Text>
                                ) : errors.subjectOptions ? (
                                    <Text style={styles.errorText}>Error: {errors.subjectOptions}</Text>
                                ) : (
                                    <>
                                        {subjectOptions.map((opt) => (
                                            <TouchableOpacity
                                                key={opt.value}
                                                style={[
                                                    styles.optionRow,
                                                    subjectExperiences.some((item) => item.subject === opt.value) &&
                                                    styles.optionRowSelected,
                                                ]}
                                                onPress={() => {
                                                    setSubjectExperiences(
                                                        subjectExperiences.some((item) => item.subject === opt.value)
                                                            ? subjectExperiences.filter((item) => item.subject !== opt.value)
                                                            : [...subjectExperiences, { subject: opt.value, level: '' }]
                                                    );
                                                }}
                                                activeOpacity={0.8}
                                            >

                                                <Text
                                                    style={[
                                                        styles.optionText,
                                                        subjectExperiences.some((item) => item.subject === opt.value) &&
                                                        styles.optionTextSelected,
                                                    ]}
                                                >
                                                    {opt.label}
                                                </Text>
                                                {subjectExperiences.some((item) => item.subject === opt.value) && (
                                                    <FontAwesome name="check-circle" size={24} color="#634FEE" />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                        <View style={styles.row}>
                                            <TouchableOpacity
                                                style={styles.backBtn}
                                                onPress={handleBack}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={styles.nextText}>Back</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[
                                                    styles.nextBtn,
                                                    {
                                                        backgroundColor: subjectExperiences.length > 0 ? '#634FEE' : '#B0BEC5',
                                                    },
                                                ]}
                                                disabled={subjectExperiences.length === 0}
                                                onPress={HandleFinish}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={styles.nextText}>Done!</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                )}
                            </View>
                        )}
                    </Animated.View>
                </ScrollView>
            </View>
        </View>
    );
};

export default BasicInfoScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    headerBox: {
        position: 'absolute',
        top: 40,
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 5,
        zIndex: 10,
    },
    headerText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#263238',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    background: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        paddingTop: 80,
        alignItems: 'center',
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 20,
    },
    progressDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 8,
        backgroundColor: '#634FEE',
    },
    cardContainer: {
        width: width * 0.9,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#263238',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#546E7A',
        textAlign: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#263238',
        marginBottom: 12,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        marginBottom: 8,
    },
    optionRowSelected: {
        backgroundColor: '#E0E7FF',
        borderWidth: 1,
        borderColor: '#634FEE',
    },
    optionText: {
        flex: 1,
        fontSize: 16,
        color: '#263238',
        marginLeft: 12,
    },
    warningText: {
        color: '#EF4444',
        marginTop: 6,
        fontSize: 13,
        fontFamily: 'Poppins-Medium',
    },

    optionTextSelected: {
        color: '#634FEE',
        fontWeight: '600',
    },
    errorText: {
        fontSize: 16,
        color: '#D32F2F',
        textAlign: 'center',
        marginVertical: 16,
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#263238',
        borderWidth: 1,
        borderColor: '#CFD8DC',
        marginBottom: 20,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    nextBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginLeft: 8,
    },
    backBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#78909C',
        marginRight: 8,
    },
    nextText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});