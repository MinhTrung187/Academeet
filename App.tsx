import React, { useEffect } from 'react';
import { enableScreens } from 'react-native-screens';
enableScreens();
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';



import WelcomeScreen from './Screens/WelcomeScreen';
import SignUpScreen from './Screens/SignUpScreen';
import LoginScreen from './Screens/LoginScreen';
import BasicInfoScreen from './Screens/BasicInfoScreen';
import FinishedInfo from './Screens/FinishedInfo';
const HomeScreen = React.lazy(() => import('./Screens/HomeScreen'));
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
import FCMProvider from './Component/FCMContext';
import GroupDetailScreen from './Screens/GroupDetailScreen';
import CreateGroupScreen from './Screens/CreateGroupScreen';
import GroupInfoScreen from './Screens/GroupInfoScreen';
import TaskManagementScreen from './Screens/TaskManagementScreen';
import GroupTaskManagementScreen from './Screens/GroupTaskManagementScreen';
import PostDetailScreen from './Screens/PostDetailScreen';
import ViewBookmarksScreen from './Screens/ViewBookmarksScreen';


const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    const key = 'key'; 

    const configurePurchases = async () => {
      try {
        await Purchases.configure({ apiKey: key });
        console.debug('✅ Purchases configured successfully on Android');
      } catch (error) {
        console.error('❌ Failed to configure Purchases:', error);
      }
    };

    configurePurchases();
  }, []);


  return (
    <SafeAreaProvider>
      <PaperProvider
        settings={{
          icon: (props) => <MaterialCommunityIcons {...props} />,
        }}
      >
        <FCMProvider>
          <React.Suspense fallback={null}>
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
                <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
                <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
                <Stack.Screen name="GroupInfoScreen" component={GroupInfoScreen} />
                <Stack.Screen name="TaskManagementScreen" component={TaskManagementScreen} />
                <Stack.Screen name="GroupTaskManagement" component={GroupTaskManagementScreen} />
                <Stack.Screen name="PostDetail" component={PostDetailScreen} />
                <Stack.Screen name="ViewBookmarksScreen" component={ViewBookmarksScreen} />

              </Stack.Navigator>
            </NavigationContainer>
          </React.Suspense>
          <Toast />
        </FCMProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}