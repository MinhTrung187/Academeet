import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { FontAwesome, Feather } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const SignUpScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState(''); // Changed from Date object to string
  const navigation: any = useNavigation();

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateDate = (date: string) => {
    const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/; // YYYY-MM-DD format
    if (!regex.test(date)) return false;
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.getFullYear() === year && dateObj.getMonth() === month - 1 && dateObj.getDate() === day;
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

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    if (!validateDate(dateOfBirth)) {
      Alert.alert('Invalid Date', 'Please enter a valid date in YYYY-MM-DD format.');
      return;
    }

    try {
      const response = await axios.post('http://192.168.88.147:7187/api/Authentication/register', {
        email,
        password,
        confirmPassword,
        firstName,
        lastName,
        dateOfBirth,
      });
      console.log('Response:', response.data);

      Alert.alert('Success', 'Registered successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('OtpScreen', { email }) },
      ]);
    } catch (error: any) {
      console.log('Registration Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        error.response?.data?.errors?.[0] ||
        'Registration failed';

      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
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
        <TextInput
          style={styles.input}
          placeholder="Enter your birth date (YYYY-MM-DD)"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          keyboardType="numeric"
          maxLength={10} // Limits input to YYYY-MM-DD length
        />
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
    </View>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B7C7E3',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
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