import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { FontAwesome, Feather } from '@expo/vector-icons';
import axios from 'axios';
import { DatePickerModal } from 'react-native-paper-dates';

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const SignUpScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [open, setOpen] = useState(false);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSignUp = async () => {
    const dateOfBirth = date ? formatDate(date) : '';

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

    try {
      const response = await axios.post('http://172.16.1.107:7187/api/Authentication/register', {
        email,
        password,
        confirmPassword,
        firstName,
        lastName,
        dateOfBirth,
      })
      console.log('Response:', response.data);

      ;

      Alert.alert('Success', 'Registered successfully!');
    } catch (error: any) {
      // Ghi chi tiết lỗi vào console
      console.log('Registration Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      // Hiển thị lỗi cụ thể cho người dùng (nếu có)
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title || // nếu backend trả về kiểu ASP.NET Identity
        error.response?.data?.errors?.[0] || // nếu lỗi dạng array
        'Registration failed';

      Alert.alert('Error', errorMessage);
    }
  }

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
        <TouchableOpacity
          onPress={() => setOpen(true)}
          style={{
            padding: 12,
            backgroundColor: '#f0f0f0',
            borderRadius: 8,
          }}
        >
          <Text>
            {date ? formatDate(date) : 'Select your birth date'}
          </Text>
        </TouchableOpacity>
      </View>

      <DatePickerModal
        locale="en"
        mode="single"
        visible={open}
        onDismiss={() => setOpen(false)}
        date={date}
        onConfirm={({ date }) => {
          setOpen(false);
          setDate(date);
        }}
        validRange={{ endDate: new Date() }}
        saveLabel="Save"
        label="Select date of birth"
        animationType="slide"
      />

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
