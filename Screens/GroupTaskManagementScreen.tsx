import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
  Alert,
  ScrollView, // Used for member selection in modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import BottomNavbar from '../Component/BottomNavbar';

// Define types for API response
interface Creator {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface GroupTask {
  id: number;
  title: string;
  description: string;
  startDate: string;
  dueDate: string;
  status: 'NotStarted' | 'InProgress' | 'Completed' | 'Cancelled';
  creator: Creator;
  createdAt: string;
  assignedUsers: Creator[]; // Assigned users are similar to Creator
}

interface GroupMember {
  user: Creator; // Reusing Creator interface for user info in member
  groupRole: string;
  joinedAt: string;
}

// Map status to specific colors for better visual distinction
const TaskStatusColors: { [key: string]: string } = {
  NotStarted: '#94A3B8', // Slate gray
  InProgress: '#F59E0B', // Amber
  Completed: '#10B981',  // Emerald green
  Cancelled: '#EF4444',  // Red
};

const GroupTaskManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId } = route.params as { groupId: number }; // Get groupId from route params

  const [groupTasks, setGroupTasks] = useState<GroupTask[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]); // To select assigned users
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<GroupTask | null>(null);

  // Form states for new/editing task
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [status, setStatus] = useState<GroupTask['status']>('NotStarted');
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]); // Array of user IDs for assignment

  const [showStartDatePicker, setShowStartDatePicker] = useState<boolean>(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState<boolean>(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState<boolean>(false);
  const [showDueTimePicker, setShowDueTimePicker] = useState<boolean>(false);

  // Function to fetch all group tasks
  const fetchGroupTasks = useCallback(async () => {
    setIsLoadingTasks(true);
    try {
      const response = await axios.get<GroupTask[]>(
        `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Group/${groupId}/tasks`,
        { withCredentials: true } 
      );
      const sortedTasks = response.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setGroupTasks(sortedTasks);
    } catch (error) {
      console.error('Error fetching group tasks:', error);
      Alert.alert('Error', 'Failed to load group tasks. Please try again.');
    } finally {
      setIsLoadingTasks(false);
    }
  }, [groupId]);

  const fetchGroupMembers = useCallback(async () => {
    setIsLoadingMembers(true);
    try {
      // Assuming this API returns group details including members
      const response = await axios.get<{ members: GroupMember[] }>(
        `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Group/${groupId}`
      );
      setGroupMembers(response.data.members);
    } catch (error) {
      console.error('Error fetching group members:', error);
      Alert.alert('Error', 'Failed to load group members for assignment.');
    } finally {
      setIsLoadingMembers(false);
    }
  }, [groupId]);

  // Fetch tasks and members on component mount
  useEffect(() => {
    fetchGroupTasks();
    fetchGroupMembers();
  }, [fetchGroupTasks, fetchGroupMembers]);

  // Reset form fields when modal is closed or opened for new task
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartDate(new Date());
    setDueDate(new Date());
    setStatus('NotStarted');
    setAssignedUserIds([]);
    setEditingTask(null);
  };

  // Handle opening modal for creating a new task
  const handleCreateNewTask = () => {
    resetForm();
    setIsModalVisible(true);
  };

  // Handle opening modal for editing an existing task
  const handleEditTask = (task: GroupTask) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    // Ensure dates are parsed as UTC by appending 'Z'
    setStartDate(new Date(task.startDate + 'Z'));
    setDueDate(new Date(task.dueDate + 'Z'));
    setStatus(task.status);
    setAssignedUserIds(task.assignedUsers.map(user => user.id)); // Set pre-selected assigned users
    setIsModalVisible(true);
  };

  // Handle saving (creating or updating) a task
   const handleSaveTask = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Title and description cannot be empty.');
      return;
    }

    // Validate DueDate is not before StartDate
    if (dueDate.getTime() < startDate.getTime()) {
      Alert.alert('Validation Error', 'Due Date cannot be before Start Date.');
      return;
    }

    setIsLoadingTasks(true); // Show loading while saving
    try {
      // Prepare data as a JSON object
      const taskData = {
        title: title,
        description: description,
        startDate: startDate.toISOString(), // Send as ISO string (UTC)
        dueDate: dueDate.toISOString(),     // Send as ISO string (UTC)
        status: status,
        assignedUserIds: assignedUserIds, // Send as an array of strings
      };

      if (editingTask) {
        // --- UPDATE EXISTING TASK ---
        const response = await axios.put(
          `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Group/${groupId}/tasks/${editingTask.id}`,
          taskData,
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true, // <--- ADD THIS LINE
          }
        );
        console.log('Group task updated successfully:', response.data);
        Alert.alert('Success', 'Group task updated successfully!');
      } else {
        // --- CREATE NEW TASK ---
        const response = await axios.post(
          `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Group/${groupId}/tasks`,
          taskData,
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true, // <--- ADD THIS LINE
          }
        );
        console.log('Group task created successfully:', response.data);
        Alert.alert('Success', 'New group task created successfully!');
      }
      setIsModalVisible(false);
      resetForm();
      fetchGroupTasks(); // Re-fetch tasks to get the latest data from the backend
    } catch (error: any) { // <--- Changed error type to 'any' for easier access to response
      console.error('Error saving group task:', error);
      // Log more details about the error response
      if (error.response) {
        console.error('Server responded with:', error.response.data);
        console.error('Status code:', error.response.status);
        console.error('Headers:', error.response.headers);
        Alert.alert('Error', `Failed to save group task: you don't have permission to update this task.`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        Alert.alert('Error', 'Failed to save group task: you don\'t have permission to update this task.');
      } else {
        console.error('Error setting up request:', error.message);
        Alert.alert('Error', `Failed to save group task: you don't have permission to update this task.`);
      }
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // Handle deleting a task
  const handleDeleteTask = (taskId: number) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this group task? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            setIsLoadingTasks(true);
            try {
              await axios.delete(
                `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Group/${groupId}/tasks/${taskId}`,
              );
              console.log('Group task deleted successfully.');
              Alert.alert('Success', 'Group task deleted successfully!');
              fetchGroupTasks(); // Re-fetch tasks to update the list
            } catch (error: any) { // <--- Changed error type to 'any' for easier access to response
              console.error('Error deleting group task:', error);
              if (error.response) {
                console.error('Server responded with:', error.response.data);
                console.error('Status code:', error.response.status);
                Alert.alert('Error', `Failed to delete group task: You don't have permission to delete this task.`);
              } else if (error.request) {
                console.error('No response received:', error.request);
                Alert.alert('Error', 'Failed to delete group task: You don\'t have permission to delete this task.');
              } else {
                console.error('Error setting up request:', error.message);
                Alert.alert('Error', `Failed to delete group task: you don't have permission to delete this task.`);
              }
            } finally {
              setIsLoadingTasks(false);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };
  // DatePicker handlers
  const onChangeStartDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(Platform.OS === 'ios');
    setStartDate(currentDate);
  };

  const onChangeStartTime = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || startDate;
    setShowStartTimePicker(Platform.OS === 'ios');
    setStartDate(currentTime);
  };

  const onChangeDueDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dueDate;
    setShowDueDatePicker(Platform.OS === 'ios');
    setDueDate(currentDate);
  };

  const onChangeDueTime = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || dueDate;
    setShowDueTimePicker(Platform.OS === 'ios');
    setDueDate(currentTime);
  };

  // Toggle assigned user for task
  const toggleAssignedUser = (userId: string) => {
    setAssignedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Render individual task item
  const renderGroupTaskItem = ({ item }: { item: GroupTask }) => (
    <TouchableOpacity style={styles.taskCard} onPress={() => handleEditTask(item)}>
      <LinearGradient
        colors={['#A78BFA', '#8B5CF6']} // Purple gradient for card background
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.taskCardGradient}
      >
        <View style={styles.taskCardContent}>
          <View style={styles.taskHeader}>
            <FontAwesome
              name={
                item.status === 'Completed'
                  ? 'check-circle'
                  : item.status === 'InProgress'
                  ? 'spinner'
                  : 'circle-o'
              }
              size={22}
              color={TaskStatusColors[item.status]}
              style={{ marginRight: 12 }}
            />
            <Text style={styles.taskTitle}>{item.title}</Text>
          </View>
          <Text style={styles.taskDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.taskDetails}>
            <Text style={styles.taskDate}>
              Start Date: {new Date(item.startDate + 'Z').toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })}
            </Text>
            <Text style={styles.taskDate}>
              Due Date: {new Date(item.dueDate + 'Z').toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })}
            </Text>
            <Text style={[styles.taskStatus, { color: TaskStatusColors[item.status] }]}>
              Status: {item.status}
            </Text>
            {item.assignedUsers && item.assignedUsers.length > 0 && (
              <Text style={styles.assignedUsersText}>
                Assigned to: {item.assignedUsers.map(u => u.name).join(', ')}
              </Text>
            )}
          </View>
          <View style={styles.taskFooter}>
            <Text style={styles.taskCreator}>Created by: {item.creator.name}</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={(e) => {
                e.stopPropagation();
                handleDeleteTask(item.id);
              }}
            >
              <FontAwesome name="trash" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <>
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#4F46E5', '#3B82F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerContainer}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FontAwesome name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Group Tasks</Text>
          <TouchableOpacity onPress={handleCreateNewTask} style={styles.addTaskButton}>
            <FontAwesome name="plus-circle" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Task List */}
      {isLoadingTasks || isLoadingMembers ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading group tasks and members...</Text>
        </View>
      ) : (
        <FlatList
          data={groupTasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderGroupTaskItem}
          contentContainerStyle={styles.taskList}
          ListEmptyComponent={() => (
            <View style={styles.emptyListContainer}>
              <Text style={styles.emptyListText}>No tasks found for this group.</Text>
              <TouchableOpacity style={styles.createTaskButtonEmpty} onPress={handleCreateNewTask}>
                <FontAwesome name="plus" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.createTaskButtonText}>Create the first group task</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Create/Edit Task Modal */}
           {/* Create/Edit Task Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingTask ? 'Edit Group Task' : 'Create New Group Task'}
            </Text>

            {/* Wrap form content in ScrollView */}
            <ScrollView style={styles.modalScrollView} contentContainerStyle={styles.modalScrollContent}>
              <TextInput
                style={styles.input}
                placeholder="Title"
                placeholderTextColor="#9CA3AF"
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                placeholder="Description"
                placeholderTextColor="#9CA3AF"
                multiline
                value={description}
                onChangeText={setDescription}
              />

              {/* Start Date Picker */}
              <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.dateTimePickerButton}>
                <FontAwesome name="calendar" size={20} color="#3B82F6" />
                <Text style={styles.dateTimePickerText}>
                  Start Date: {startDate.toLocaleString('en-US', { dateStyle: 'medium', timeZone: 'Asia/Ho_Chi_Minh' })}
                </Text>
              </TouchableOpacity>
              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  onChange={onChangeStartDate}
                />
              )}

              {/* Start Time Picker */}
              <TouchableOpacity onPress={() => setShowStartTimePicker(true)} style={styles.dateTimePickerButton}>
                <FontAwesome name="clock-o" size={20} color="#3B82F6" />
                <Text style={styles.dateTimePickerText}>
                  Start Time: {startDate.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })}
                </Text>
              </TouchableOpacity>
              {showStartTimePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="time"
                  display="default"
                  onChange={onChangeStartTime}
                />
              )}

              {/* Due Date Picker */}
              <TouchableOpacity onPress={() => setShowDueDatePicker(true)} style={styles.dateTimePickerButton}>
                <FontAwesome name="calendar-check-o" size={20} color="#3B82F6" />
                <Text style={styles.dateTimePickerText}>
                  Due Date: {dueDate.toLocaleString('en-US', { dateStyle: 'medium', timeZone: 'Asia/Ho_Chi_Minh' })}
                </Text>
              </TouchableOpacity>
              {showDueDatePicker && (
                <DateTimePicker
                  value={dueDate}
                  mode="date"
                  display="default"
                  onChange={onChangeDueDate}
                />
              )}

              {/* Due Time Picker */}
              <TouchableOpacity onPress={() => setShowDueTimePicker(true)} style={styles.dateTimePickerButton}>
                <FontAwesome name="hourglass-end" size={20} color="#3B82F6" />
                <Text style={styles.dateTimePickerText}>
                  Due Time: {dueDate.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })}
                </Text>
              </TouchableOpacity>
              {showDueTimePicker && (
                <DateTimePicker
                  value={dueDate}
                  mode="time"
                  display="default"
                  onChange={onChangeDueTime}
                />
              )}

              {/* Status Picker */}
              <View style={styles.statusPickerContainer}>
                <Text style={styles.statusLabel}>Status:</Text>
                <View style={styles.statusButtonsGroup}>
                  {['NotStarted', 'InProgress', 'Completed', 'Cancelled'].map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.statusSelectButton,
                        { backgroundColor: s === status ? TaskStatusColors[s] : '#E0F2FE' },
                        { borderColor: TaskStatusColors[s], borderWidth: 1 }
                      ]}
                      onPress={() => setStatus(s as GroupTask['status'])}
                    >
                      <Text style={[
                        styles.statusSelectButtonText,
                        { color: s === status ? '#fff' : TaskStatusColors[s] }
                      ]}>
                        {s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Assigned Users Selector */}
              <View style={styles.assignedUsersContainer}>
                <Text style={styles.statusLabel}>Assigned Users:</Text>
                {/* Keep this inner ScrollView for the member list itself */}
                <ScrollView style={styles.assignedUsersScroll}>
                  {groupMembers.map(member => (
                    <TouchableOpacity
                      key={member.user.id}
                      style={styles.memberSelectionItem}
                      onPress={() => toggleAssignedUser(member.user.id)}
                    >
                      <FontAwesome
                        name={assignedUserIds.includes(member.user.id) ? 'check-square-o' : 'square-o'}
                        size={20}
                        color={assignedUserIds.includes(member.user.id) ? '#3B82F6' : '#64748B'}
                        style={{ marginRight: 10 }}
                      />
                      <Text style={styles.memberSelectionText}>{member.user.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </ScrollView> {/* End of ScrollView for form content */}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveTask}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
    <BottomNavbar />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 80, 
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  addTaskButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
  },
  taskList: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  taskCard: {
    marginBottom: 16,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  taskCardGradient: {
    flex: 1,
    padding: 2,
    borderRadius: 18,
  },
  taskCardContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 12,
    flexShrink: 1,
  },
  taskDescription: {
    fontSize: 15,
    color: '#475569',
    fontFamily: 'Poppins-Regular',
    lineHeight: 22,
    marginBottom: 12,
  },
  taskDetails: {
    marginBottom: 10,
  },
  taskDate: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
    marginBottom: 6,
  },
  taskStatus: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Medium',
    marginTop: 4,
  },
  assignedUsersText: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
    marginTop: 6,
    fontStyle: 'italic',
  },
  taskCreator: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Poppins-Italic',
    marginTop: 8,
    textAlign: 'right',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyListText: {
    fontSize: 18,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: 25,
  },
  createTaskButtonEmpty: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  createTaskButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: 'Poppins-Bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 15,
    padding: 15,
    marginBottom: 18,
    fontSize: 17,
    fontFamily: 'Poppins-Regular',
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
  },
  dateTimePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 15,
    padding: 15,
    marginBottom: 18,
    backgroundColor: '#F8FAFC',
  },
  dateTimePickerText: {
    marginLeft: 12,
    fontSize: 17,
    color: '#1E293B',
    fontFamily: 'Poppins-Regular',
  },
  statusPickerContainer: {
    flexDirection: 'column',
    marginBottom: 25,
  },
  statusLabel: {
    fontSize: 17,
    color: '#1E293B',
    fontFamily: 'Poppins-Medium',
    marginBottom: 10,
  },
  statusButtonsGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  statusSelectButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  statusSelectButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Poppins-SemiBold',
  },
  assignedUsersContainer: {
    marginBottom: 25,
  },
  assignedUsersScroll: {
    maxHeight: 150, // Limit height for scrollability
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 15,
    padding: 10,
    backgroundColor: '#F8FAFC',
  },
  memberSelectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  memberSelectionText: {
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'Poppins-Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
    modalContent: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 30,
    width: '90%',
    maxHeight: '90%', // Keep this to limit modal height
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 15,
    justifyContent: 'space-between', // Distribute space between scrollable content and buttons
  },
  modalScrollView: {
    flexGrow: 1, // Allow ScrollView to grow and take available space
    marginBottom: 20, // Add some space above the buttons
  },
  modalScrollContent: {
    paddingBottom: 10, // Add padding at the bottom of the scrollable content
  },
});

export default GroupTaskManagementScreen;
