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
import FindLocation from './Screens/FindLocationScreen';
import LocationDetail from './Screens/LocationDetail';
import PremiumScreen from './Screens/PremiumScreen';
import StudyToolScreen from './Screens/StudyToolScreen';
import AIAssistantScreen from './Screens/AIAssistantScreen';
import ChatScreen from './Screens/ChatScreen';
import FriendListScreen from './Screens/FriendListScreen';

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
        <Stack.Screen name="FindLocation" component={FindLocation} />
        <Stack.Screen name="LocationDetail" component={LocationDetail} />
        <Stack.Screen name="Premium" component={PremiumScreen} />
        <Stack.Screen name="StudyTool" component={StudyToolScreen} />
        <Stack.Screen name="AIScreen" component={AIAssistantScreen}/>
        <Stack.Screen name="Chat" component={ChatScreen}/>
        <Stack.Screen name="FriendList" component={FriendListScreen}/>




      </Stack.Navigator>
    </NavigationContainer>
  );
}
