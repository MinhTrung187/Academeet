import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
import OtpScreen from './Screens/OtpScreen';
import GroupForumScreen from './Screens/GroupForumScreen';
import MapScreen from './Screens/MapScreen';
import GroupListScreen from './Screens/GroupListScreen';
import ForumScreen from './Screens/ForumScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider
        settings={{
          icon: (props) => <MaterialCommunityIcons {...props} />,
        }}
      >
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{ headerShown: false, animation: 'none' }}
          >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="LogIn" component={LoginScreen} />
            <Stack.Screen name="BasicInfo" component={BasicInfoScreen} />
            <Stack.Screen name="FinishedInfo" component={FinishedInfo} />
            <Stack.Screen name="Homes" component={HomeScreen} />
            <Stack.Screen name="MyProfile" component={ProfileScreen} />
            <Stack.Screen name="FindFriend" component={FindFriendsScreen} />
            <Stack.Screen name="UserDetail" component={UserDetail} />
            <Stack.Screen name="FindLocation" component={FindLocation} />
            <Stack.Screen name="LocationDetail" component={LocationDetail} />
            <Stack.Screen name="Premium" component={PremiumScreen} />
            <Stack.Screen name="StudyTool" component={StudyToolScreen} />
            <Stack.Screen name="AIScreen" component={AIAssistantScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="FriendList" component={FriendListScreen} />
            <Stack.Screen name="OtpScreen" component={OtpScreen} />
            <Stack.Screen name="Home" component={GroupForumScreen} />
            <Stack.Screen name="Map" component={MapScreen} />
            <Stack.Screen name="GroupListScreen" component={GroupListScreen} />
            <Stack.Screen name="ForumScreen" component={ForumScreen} />



          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
