import React, { createContext, useContext, useEffect, useState } from 'react';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';


interface FCMContextType {
  fcmToken: string | null;
  notification: FirebaseMessagingTypes.RemoteMessage | null;
}
const FCMContext = createContext<FCMContextType>({
  fcmToken: null,
  notification: null,
});

const FCMProvider = ({ children }: { children: React.ReactNode }) => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<FirebaseMessagingTypes.RemoteMessage | null>(null);

  const requestUserPermission = async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        const token = await messaging().getToken();
        setFcmToken(token);
        await SecureStore.setItemAsync('fcmToken', token);
        console.log('Authorization status:', authStatus);
        console.log('FCM Token:', token);
      } else {
        console.log('User denied notification permissions');
      }
    } catch (error) {
      console.error('Error requesting permission or getting token:', error);
    }
  };

  const handleNotification = (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    const { data } = remoteMessage;
    const type = data?.type as string;

    switch (type) {
      case 'chat':
        Toast.show({
          type: 'info',
          text1: `${data?.senderName} sent a message`,
          text2: typeof data?.message === 'string' ? data.message : 'Open the app to view it',
          visibilityTime: 4000,
          onPress: () => {
            console.log('Open chat screen');
          },
        });
        break;

      case 'friend_request':
        Toast.show({
          type: 'success',
          text1: 'New Friend Request',
          text2: `${data?.senderName} sent you a friend request`,
        });
        break;

      case 'friend_accepted':
        Toast.show({
          type: 'success',
          text1: 'Request Accepted',
          text2: `${data?.senderName} accepted your request!`,
        });
        break;
      case 'group_request':
        Toast.show({
          type: 'info',
          text1: 'New Group Join Request',
          text2: `${data?.userName} has requested to join your group`,
          visibilityTime: 5000,
          onPress: () => {
            console.log(`Navigate to group request screen of user ${data?.userId}`);
          },
        });
        break;
      case 'group_chat':
        Toast.show({
          type: 'info',
          text1: `New message in group ${data?.groupName}`,
          text2: `${data?.senderName}: ${data?.message || '[Attachment]'}`,
          visibilityTime: 4000,
          onPress: () => {
            console.log(`Open group chat screen for group ${data?.groupId}`);
          },
        });
        break;
      case 'group_invite':
        Toast.show({
          type: 'info',
          text1: '📥 Group Invitation',
          text2: `You've been invited to join "${data?.groupName}"`,
          visibilityTime: 5000,
          onPress: () => {
            console.log(`Navigate to group invite screen for group ${data?.groupId}`)
          },
        });
        break;
      case 'group_request_approved':
        Toast.show({
          type: 'success',
          text1: '✅ Join Request Approved',
          text2: `You've been approved to join "${data?.groupName}"`,
          visibilityTime: 5000,
          onPress: () => {
            console.log(`Navigate to group detail screen for group ${data?.groupId}`);
          },
        });
        break;

      case 'group_request_rejected':
        Toast.show({
          type: 'error',
          text1: '❌ Join Request Rejected',
          text2: `Your request to join "${data?.groupName}" was rejected.`,
          visibilityTime: 5000,
        });
        break;
      case 'post_comment':
        Toast.show({
          type: 'info',
          text1: `New comment on your post`,
          text2: `${data?.userName}: ${data?.comment}`,
          visibilityTime: 5000,
          onPress: () => {
            console.log(`Navigate to post detail screen for post ${data?.postId}`);
            // TODO: Implement navigation to PostDetail screen with postId
          },
        });
        break;

      case 'post_like':
        Toast.show({
          type: 'success',
          text1: `New like on your post`,
          text2: `${data?.userName} liked your post.`,
          visibilityTime: 4000,
          onPress: () => {
            console.log(`Navigate to post detail screen for post ${data?.postId}`);
            // TODO: Implement navigation to PostDetail screen with postId
          },
        });
        break;

      case 'post_dislike':
        Toast.show({
          type: 'error', // Typically error or info for dislikes
          text1: `New dislike on your post`,
          text2: `${data?.userName} disliked your post.`,
          visibilityTime: 4000,
          onPress: () => {
            console.log(`Navigate to post detail screen for post ${data?.postId}`);
            // TODO: Implement navigation to PostDetail screen with postId
          },
        });
        break;

      case 'comment_reply':
        Toast.show({
          type: 'info',
          text1: `New reply to your comment`,
          text2: `${data?.userName}: ${data?.comment}`,
          visibilityTime: 5000,
          onPress: () => {
            console.log(`Navigate to post detail screen for post ${data?.postId} and highlight comment`);
            // TODO: Implement navigation to PostDetail screen and potentially scroll to/highlight comment
          },
        });
        break;

      case 'comment_like':
        Toast.show({
          type: 'success',
          text1: `New like on your comment`,
          text2: `${data?.userName} liked your comment.`,
          visibilityTime: 4000,
          onPress: () => {
            console.log(`Navigate to comment's post detail screen for comment ${data?.commentId}`);
            // TODO: Implement navigation to PostDetail screen and potentially scroll to/highlight comment
          },
        });
        break;

      case 'comment_dislike':
        Toast.show({
          type: 'error', // Typically error or info for dislikes
          text1: `New dislike on your comment`,
          text2: `${data?.userName} disliked your comment.`,
          visibilityTime: 4000,
          onPress: () => {
            console.log(`Navigate to comment's post detail screen for comment ${data?.commentId}`);
            // TODO: Implement navigation to PostDetail screen and potentially scroll to/highlight comment
          },
        });
        break;
      default:
        Toast.show({
          type: 'info',
          text1: 'New Notification',
          text2: 'You have a new update!',
        });
    }
  };

  useEffect(() => {
    const initializeFCM = async () => {
      const storedToken = await SecureStore.getItemAsync('fcmToken');
      if (storedToken) {
        setFcmToken(storedToken);
      } else {
        await requestUserPermission();
      }
    };

    initializeFCM();

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          setNotification(remoteMessage);
          handleNotification(remoteMessage);
        }
      });

    const unsubscribeOnNotificationOpenedApp = messaging().onNotificationOpenedApp(
      (remoteMessage) => {
        setNotification(remoteMessage);
        handleNotification(remoteMessage);
      }
    );

    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Message handled in the background!', remoteMessage);
    });

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      setNotification(remoteMessage);
      handleNotification(remoteMessage);
    });

    const unsubscribeOnTokenRefresh = messaging().onTokenRefresh(async (token) => {
      setFcmToken(token);
      await SecureStore.setItemAsync('fcmToken', token);
      console.log('New FCM Token:', token);
    });

    return () => {
      unsubscribe();
      unsubscribeOnNotificationOpenedApp();
      unsubscribeOnTokenRefresh();
    };
  }, []);

  return (
    <FCMContext.Provider value={{ fcmToken, notification }}>
      {children}
    </FCMContext.Provider>
  );
};

export const useFCM = () => useContext(FCMContext);

export default FCMProvider;