import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from './Screens/WelcomeScreen';
import SignUpScreen from './Screens/SignUpScreen';
import LoginScreen from './Screens/LoginScreen';
import BasicInfoScreen from './Screens/BasicInfoScreen';
import FinishedInfo from './Screens/FinishedInfo';
import HomeScreen from './Screens/HomeScreen';
import ProfileScreen from './Screens/MyProfile';
import FindFriendsScreen from './Screens/FindFriendsScreen';
import UserDetail from './Screens/UserProfile';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MyProfile"
        screenOptions={{ headerShown: false, animation: 'none' }}

      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="LogIn" component={LoginScreen} />
        <Stack.Screen name="BasicInfo" component={BasicInfoScreen} />
        <Stack.Screen name="FinishedInfo" component={FinishedInfo} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="MyProfile" component={ProfileScreen} />
        <Stack.Screen name="FindFriends" component={FindFriendsScreen} />
        <Stack.Screen name="UserDetail" component={UserDetail} />






      </Stack.Navigator>
    </NavigationContainer>
  );
}
