import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Định nghĩa interface cho dữ liệu từ API
interface Item {
    $id?: string; // Optional, as some APIs might not return $id
    id: number;
    name: string;
}

interface ApiResponse {
    $id?: string;
    $values?: Item[];
}

// Định nghĩa interface cho options
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
    Teacher: 'chalkboard-teacher',
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

// Hàm lấy dữ liệu từ API với xử lý lỗi cải tiến
const fetchOptions = async (url: string): Promise<Option[]> => {
    try {
        const response = await fetch(url);
        console.log(`Response status for ${url}:`, response.status, response.statusText); // Log status
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}, Status Text: ${response.statusText}`);
        }
        const data = await response.json();
        console.log(`Response data for ${url}:`, JSON.stringify(data, null, 2)); // Log raw response

        let items: Item[] = [];
        if (Array.isArray(data)) {
            // Handle flat array response
            items = data;
        } else if (data.$values && Array.isArray(data.$values)) {
            // Handle $values structure
            items = data.$values;
        } else {
            console.error(`Unexpected response format for ${url}:`, data);
            return [];
        }

        // Validate items
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
    const [selected, setSelected] = useState<string | null>(null); // Occupation
    const [name, setName] = useState<string>(''); // Gender Identity
    const [age, setAge] = useState<string>(''); // Not used in current code
    const [occupation, setOccupation] = useState<string>(''); // Bio
    const [studyStyle, setStudyStyle] = useState<string | null>(null); // Not used
    const [experience, setExperience] = useState<string | null>(null); // Not used
    const [studyPreferences, setStudyPreferences] = useState<Option[]>([]);
    const [educationLevels, setEducationLevels] = useState<Option[]>([]);
    const [selectedPreference, setSelectedPreference] = useState<string | null>(null); // Not used
    const [selectedEducationLevel, setSelectedEducationLevel] = useState<string | null>(null);
    const [studyPreferencesSelected, setStudyPreferencesSelected] = useState<string[]>([]);
    const [subjectExperiences, setSubjectExperiences] = useState<{ subject: string; level: string }[]>([]);
    const [newSubject, setNewSubject] = useState(''); // Not used
    const [newLevel, setNewLevel] = useState(''); // Not used
    const [options, setOptions] = useState<Option[]>([]); // Occupations
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

    // Fetch data on component mount
    useEffect(() => {
        setLoading(true);
        setErrors({
            genderOptions: null,
            studyPreferences: null,
            educationLevels: null,
            subjectOptions: null,
            occupationOptions: null,
            currentUser: null,
        });

        Promise.all([
            fetchOptions('http://192.168.88.147:7187/api/StudyPreference')
                .then(setStudyPreferences)
                .catch((err) => setErrors((prev) => ({ ...prev, studyPreferences: err.message }))),
            fetchOptions('http://192.168.88.147:7187/api/EducationLevel')
                .then(setEducationLevels)
                .catch((err) => setErrors((prev) => ({ ...prev, educationLevels: err.message }))),
            fetchOptions('http://192.168.88.147:7187/api/GenderIdentity')
                .then(setGenderOptions)
                .catch((err) => setErrors((prev) => ({ ...prev, genderOptions: err.message }))),
            fetchOptions('http://192.168.88.147:7187/api/Subject')
                .then(setSubjectOptions)
                .catch((err) => setErrors((prev) => ({ ...prev, subjectOptions: err.message }))),
            fetchOptions('http://192.168.88.147:7187/api/Occupation')
                .then(setOptions)
                .catch((err) => setErrors((prev) => ({ ...prev, occupationOptions: err.message }))),
            fetch('http://192.168.88.147:7187/api/User/current-user')
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

        console.log('Sending user data:', userData);

        try {
            const response = await fetch('http://192.168.88.147:7187/api/user', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // Add Authorization header if needed
                    // 'Authorization': `Bearer ${yourToken}`,
                },
                body: JSON.stringify(userData),
            });

            const responseData = await response.text();
            if (response.ok) {
                console.log('User information updated successfully:', userData);
                navigation.navigate('FinishedInfo');
            } else {
                console.error('Failed to update user information:', {
                    status: response.status,
                    statusText: response.statusText,
                    responseData,
                });
            }
        } catch (error) {
            console.error('Error updating user information:', error);
        }
    };

    const handleNext = () => {
        if (step === 2) {
            if (studyPreferencesSelected.length === 0 || !selectedEducationLevel) {
                alert('Please select at least one study preference and an education level.');
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
                        style={[styles.progressDot, { backgroundColor: step >= dot ? '#4CAF50' : '#ccc' }]}
                    />
                ))}
            </View>
        );
    };

    return (
        <>
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
                            {loading ? (
                                <Text style={styles.title}>Loading...</Text>
                            ) : errors.occupationOptions ? (
                                <Text style={styles.title}>Error: {errors.occupationOptions}</Text>
                            ) : (
                                options.map((opt) => (
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
                                ))
                            )}
                            <TouchableOpacity
                                style={[styles.nextBtn, { backgroundColor: !selected ? '#ccc' : '#4CAF50' }]}
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
                            <Text style={styles.title}>Select Your Study Preference{'\n'}and Education Level</Text>
                            <Text style={styles.arrow}>----------------------------------➤</Text>
                            {loading ? (
                                <Text style={styles.title}>Loading...</Text>
                            ) : errors.studyPreferences || errors.educationLevels ? (
                                <Text style={styles.title}>
                                    Error: {errors.studyPreferences || errors.educationLevels}
                                </Text>
                            ) : (
                                <>
                                    <Text style={[styles.optionText, { fontWeight: 'bold', marginBottom: 10 }]}>
                                        Study Preferences (You can choose more than 1):
                                    </Text>
                                    {studyPreferences.map((pref) => (
                                        <TouchableOpacity
                                            key={pref.value}
                                            style={styles.optionRow}
                                            onPress={() => {
                                                if (studyPreferencesSelected.includes(pref.value)) {
                                                    setStudyPreferencesSelected(
                                                        studyPreferencesSelected.filter((p) => p !== pref.value)
                                                    );
                                                } else {
                                                    setStudyPreferencesSelected([...studyPreferencesSelected, pref.value]);
                                                }
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.checkbox}>
                                                {studyPreferencesSelected.includes(pref.value) && (
                                                    <FontAwesome name="check" size={16} color="#000" />
                                                )}
                                            </View>
                                            <Text style={styles.optionText}>{pref.label}</Text>
                                        </TouchableOpacity>
                                    ))}

                                    <Text style={[styles.optionText, { fontWeight: 'bold', marginTop: 20, marginBottom: 10 }]}>
                                        Education Level:
                                    </Text>
                                    {educationLevels.map((level) => (
                                        <TouchableOpacity
                                            key={level.value}
                                            style={styles.optionRow}
                                            onPress={() => setSelectedEducationLevel(level.value)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.checkbox}>
                                                {selectedEducationLevel === level.value && (
                                                    <FontAwesome name="check" size={16} color="#000" />
                                                )}
                                            </View>
                                            <Text style={styles.optionText}>{level.label}</Text>
                                        </TouchableOpacity>
                                    ))}

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
                                                {
                                                    backgroundColor:
                                                        studyPreferencesSelected.length === 0 || !selectedEducationLevel
                                                            ? '#ccc'
                                                            : '#4CAF50',
                                                },
                                            ]}
                                            onPress={handleNext}
                                            disabled={studyPreferencesSelected.length === 0 || !selectedEducationLevel}
                                            activeOpacity={0.7}
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
                            <Text style={styles.arrow}>----------------------------------➤</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    placeholder="Write a short bio about yourself"
                                    value={occupation}
                                    onChangeText={setOccupation}
                                    style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                                    multiline={true}
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
                            <Text style={styles.title}>Select Your Gender Identity</Text>
                            <Text style={styles.arrow}>----------------------------------➤</Text>
                            {loading ? (
                                <Text style={styles.title}>Loading...</Text>
                            ) : errors.genderOptions ? (
                                <Text style={styles.title}>Error: {errors.genderOptions}</Text>
                            ) : (
                                <>
                                    {genderOptions.map((opt) => (
                                        <TouchableOpacity
                                            key={opt.value}
                                            style={styles.optionRow}
                                            onPress={() => setName(opt.value)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.checkbox}>
                                                {name === opt.value && <FontAwesome name="check" size={16} color="#000" />}
                                            </View>
                                            <Text style={styles.optionText}>{opt.label}</Text>
                                        </TouchableOpacity>
                                    ))}
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
                                </>
                            )}
                        </View>
                    )}

                    {step === 5 && (
                        <View style={styles.card}>
                            <Text style={styles.title}>Select Your Subjects</Text>
                            <Text style={styles.arrow}>----------------------------------➤</Text>
                            {loading ? (
                                <Text style={styles.title}>Loading...</Text>
                            ) : errors.subjectOptions ? (
                                <Text style={styles.title}>Error: {errors.subjectOptions}</Text>
                            ) : (
                                <>
                                    {subjectOptions.map((opt) => (
                                        <TouchableOpacity
                                            key={opt.value}
                                            style={styles.optionRow}
                                            onPress={() => {
                                                if (subjectExperiences.some((item) => item.subject === opt.value)) {
                                                    setSubjectExperiences(
                                                        subjectExperiences.filter((item) => item.subject !== opt.value)
                                                    );
                                                } else {
                                                    setSubjectExperiences([...subjectExperiences, { subject: opt.value, level: '' }]);
                                                }
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.checkbox}>
                                                {subjectExperiences.some((item) => item.subject === opt.value) && (
                                                    <FontAwesome name="check" size={16} color="#000" />
                                                )}
                                            </View>
                                            <Text style={styles.optionText}>{opt.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                    <View style={styles.row}>
                                        <TouchableOpacity
                                            style={[styles.nextBtn, { backgroundColor: '#757575' }]}
                                            onPress={handleBack}
                                        >
                                            <Text style={styles.nextText}>Back</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.nextBtn,
                                                {
                                                    backgroundColor: subjectExperiences.length > 0 ? '#4CAF50' : '#ccc',
                                                },
                                            ]}
                                            disabled={subjectExperiences.length === 0}
                                            onPress={HandleFinish}
                                        >
                                            <Text style={styles.nextText}>Done!</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </View>
                    )}
                </ScrollView>
            </View>
        </>
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
        left: (width - 300) / 2,
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
        width: 300,
        alignItems: 'center',
        marginTop: 40,
    },
    headerText: {
        fontWeight: '700',
        fontSize: 16,
        color: '#000',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    background: {
        flex: 1,
        backgroundColor: '#B7C7E3',
        alignItems: 'center',
        paddingTop: 40,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        marginTop: 40,
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