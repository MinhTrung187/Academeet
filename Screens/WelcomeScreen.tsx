import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import BookCard from "../Component/BookCard";
import { useNavigation } from '@react-navigation/native';


const { width, height } = Dimensions.get("window");


const WelcomeScreen = () => {
    const navigation:any = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <BookCard />
      </View>

      <Text style={styles.title}>Welcome to{"\n"}AcadeMeet</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SignUp')} >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.loginButton]} onPress={() => navigation.navigate('LogIn')}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#CDE1F9",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 40,
  },
  cardContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 20,
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  loginButton: {
    backgroundColor: "#fff",
  },
  buttonText: {
    color: "#1A1A1A",
    fontWeight: "600",
    fontSize: 16,
  },
});
