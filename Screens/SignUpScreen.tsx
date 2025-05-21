import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome, Feather } from '@expo/vector-icons';

const SignUpScreen = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      {/* Social icons */}
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

      {/* Email input */}
      <View style={styles.inputBox}>
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} placeholder="Enter your email" />
      </View>

      {/* Password input */}
      <View style={styles.inputBox}>
        <Text style={styles.label}>Create Password</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Enter password"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Confirm password */}
      <View style={styles.inputBox}>
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          secureTextEntry
        />
      </View>

      {/* Sign Up button */}
      <TouchableOpacity style={styles.signUpButton}>
        <Text style={styles.signUpText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Already have account */}
      <View style={styles.footer}>
        <Text style={{ color: '#000' }}>Already have an account?</Text>
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginText}>Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B7C7E3', // giống màu nền hình bạn gửi
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    elevation: 2,
  },
  loginText: {
    fontWeight: 'bold',
    color: '#000',
  },
});
