import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { FontAwesome, Feather } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Modal, Pressable } from 'react-native';


const SignUpScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const navigation: any = useNavigation();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateDate = (date: string) => {
    const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    if (!regex.test(date)) return false;
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return (
      dateObj.getFullYear() === year &&
      dateObj.getMonth() === month - 1 &&
      dateObj.getDate() === day
    );
  };

  const handleSignUp = async () => {
    if (!firstName || !lastName || !dateOfBirth || !email || !password || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 3) { 
      Alert.alert('Invalid Password', 'Password must be at least 3 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (!validateDate(dateOfBirth)) {
      Alert.alert('Invalid Date', 'Please enter a valid date in YYYY-MM-DD format.');
      return;
    }

    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    if (age < 12) { 
        Alert.alert('Age Restriction', 'You must be at least 12 years old to register.'); // Updated message
        return;
    }

    try {
      const response = await axios.post(
        'https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Authentication/register',
        {
          email,
          password,
          confirmPassword,
          firstName,
          lastName,
          dateOfBirth,
        }
      );

      Alert.alert('Success', 'Registered successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('OtpScreen', { email }) },
      ]);
    } catch (error: any) {
      let errorMessage = 'Registration failed. Please try again.'; // Default error message

      if (error.response && error.response.data) {
        const errorData = error.response.data;

        // Case 1: Array of errors (e.g., PasswordTooShort)
        if (Array.isArray(errorData) && errorData.length > 0 && errorData[0].description) {
          errorMessage = errorData.map((err: any) => err.description).join('\n');
        }
        // Case 2: Validation errors object (e.g., "errors": {"DateOfBirth": ["Invalid date of birth"]})
        else if (errorData.errors) {
          errorMessage = Object.values(errorData.errors)
            .flatMap((messages: any) => messages)
            .join('\n');
        }
        // Case 3: General error messages (title, detail, message)
        else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.title) {
          errorMessage = errorData.title;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Sign Up</Text>

        {/* Social Icons */}
        <View style={styles.socialContainer}>
          <TouchableOpacity style={[styles.socialBox, { backgroundColor: '#E6E6FA' }]}>
            <FontAwesome name="facebook" size={20} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialBox, { backgroundColor: '#B0E0E6' }]}>
            <FontAwesome name="linkedin" size={20} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialBox, { backgroundColor: '#FFDAB9' }]}>
            <FontAwesome name="google" size={20} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialBox, { backgroundColor: '#F8C8DC' }]}>
            <FontAwesome name="instagram" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Inputs */}
        <View style={styles.inputBox}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your first name"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        <View style={styles.inputBox}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your last name"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        <View style={styles.inputBox}>
          <Text style={styles.label}>Date of Birth</Text>
          <Pressable onPress={() => setShowDatePicker(true)}>
            <TextInput
              style={[styles.input, { color: dateOfBirth ? '#333' : '#888' }]}
              value={dateOfBirth}
              placeholder="Select your birth date"
              editable={false}
              pointerEvents="none"
            />
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth ? new Date(dateOfBirth) : new Date(2000, 0, 1)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  const isoString = selectedDate.toISOString().split('T')[0];
                  setDateOfBirth(isoString);
                }
              }}
            />
          )}
        </View>


        <View style={styles.inputBox}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputBox}>
          <Text style={styles.label}>Create Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputBox}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#B7C7E3',
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 24,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  socialBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputBox: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000',
  },
  input: {
    fontSize: 14,
    color: '#333',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signUpButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  signUpText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
