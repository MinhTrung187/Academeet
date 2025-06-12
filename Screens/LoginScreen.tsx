import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { FontAwesome, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const LoginScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation: any = useNavigation();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://172.16.1.107:7187/api/Authentication/login', {
        email,
        password,
      });

      console.log('✅ Login Success:', response.data);


      navigation.navigate('Home');
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Unknown server error';

        console.log(`❌ HTTP ${status} - ${message}`);

        if (status === 400) {
          Alert.alert('Login Failed', 'Email hoặc mật khẩu không hợp lệ.');
        } else if (status === 401) {
          Alert.alert('Unauthorized', 'Email hoặc mật khẩu không hợp lệ.');
        } else if (status === 500) {
          Alert.alert('Server Error', 'Lỗi hệ thống, vui lòng thử lại sau.');
        } else {
          Alert.alert('Error', message);
        }

      } else if (error.request) {
        console.log('❌ No response received from server.');
        Alert.alert('Network Error', 'Không thể kết nối tới server. Kiểm tra mạng hoặc API.');
      } else {
        console.log('❌ Unexpected Error:', error.message);
        Alert.alert('Unexpected Error', error.message || 'Đã xảy ra lỗi không xác định.');
      }
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>

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

      {/* Email input */}
      <View style={styles.inputBox}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Password input */}
      <View style={styles.inputBox}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Log In button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin} >
        <Text style={styles.loginText}>Log In</Text>
      </TouchableOpacity>

      {/* Forgot Password */}
      <TouchableOpacity>
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity>

      {/* Sign Up link */}
      <View style={styles.footer}>
        <Text style={{ color: '#000' }}>New here? Create account</Text>
        <TouchableOpacity style={styles.signUpButton} onPress={() => navigation.navigate('SignUp')} >
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;

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
  loginButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  loginText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  forgotText: {
    marginTop: 12,
    color: '#000',
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  signUpButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    elevation: 2,
  },
  signUpText: {
    fontWeight: 'bold',
    color: '#000',
  },
});
