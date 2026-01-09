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
    ScrollView,
    Animated, // For potential future animations, keeping it here
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import BottomNavbar from '../Component/BottomNavbar';
import { useNavigation } from '@react-navigation/native';


// Define types for API response
interface Creator {
    id: string;
    name: string;
    avatarUrl?: string;
}

interface UserTask {
    id: number;
    title: string;
    description: string;
    startDate: string;
    dueDate: string;
    status: 'NotStarted' | 'InProgress' | 'Completed' | 'Cancelled';
    creator: Creator;
    createdAt: string;
}

// Map status to specific colors for better visual distinction
const TaskStatusColors: any = {
    NotStarted: '#94A3B8', // Slate gray
    InProgress: '#F59E0B', // Amber
    Completed: '#10B981',  // Emerald green
    Cancelled: '#EF4444',  // Red
};

const TaskManagementScreen: React.FC = () => {
    const [tasks, setTasks] = useState<UserTask[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(true);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [editingTask, setEditingTask] = useState<UserTask | null>(null);
    const navigation = useNavigation<any>();
    // Form states for new/editing task
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [dueDate, setDueDate] = useState<Date>(new Date());
    const [status, setStatus] = useState<UserTask['status']>('NotStarted');
    const [showStartDatePicker, setShowStartDatePicker] = useState<boolean>(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState<boolean>(false);
    const [showDueDatePicker, setShowDueDatePicker] = useState<boolean>(false);
    const [showDueTimePicker, setShowDueTimePicker] = useState<boolean>(false);

    // Function to fetch all user tasks
    const fetchTasks = useCallback(async () => {
        setIsLoadingTasks(true);
        try {
            const response = await axios.get<UserTask[]>(
                'https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/UserTask'
            );
            // Sort tasks by creation date, newest first
            const sortedTasks = response.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setTasks(sortedTasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            Alert.alert('Error', 'Failed to load tasks. Please try again.');
        } finally {
            setIsLoadingTasks(false);
        }
    }, []);

    // Fetch tasks on component mount
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Reset form fields when modal is closed or opened for new task
    const resetForm = () => {
        setTitle('');
        setDescription('');
        setStartDate(new Date());
        setDueDate(new Date());
        setStatus('NotStarted');
        setEditingTask(null);
    };

    // Handle opening modal for creating a new task
    const handleCreateNewTask = () => {
        resetForm();
        setIsModalVisible(true);
    };

    // Handle opening modal for editing an existing task
    const handleEditTask = (task: UserTask) => {
        setEditingTask(task);
        setTitle(task.title);
        setDescription(task.description);
        // Ensure dates are parsed correctly, handling potential timezone issues if needed
        setStartDate(new Date(task.startDate + 'Z'));
        setDueDate(new Date(task.dueDate + 'Z'));

        setStatus(task.status);
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
            const formData = new FormData();
            formData.append('Title', title);
            formData.append('Description', description);
            formData.append('StartDate', startDate.toISOString());
            formData.append('DueDate', dueDate.toISOString());
            formData.append('Status', status);

            if (editingTask) {
                // --- UPDATE EXISTING TASK ---
                const response = await axios.put(
                    `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/UserTask/${editingTask.id}`,
                    formData, // Send FormData
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data', // Explicitly set content type
                        },
                    }
                );
                console.log('Task updated successfully:', response.data);
                Alert.alert('Success', 'Task updated successfully!');
            } else {
                // --- CREATE NEW TASK ---
                const response = await axios.post(
                    'https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/UserTask',
                    formData, // Send FormData
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data', // Explicitly set content type
                        },
                    }
                );
                console.log('Task created successfully:', response.data);
                Alert.alert('Success', 'New task created successfully!');
            }
            setIsModalVisible(false);
            resetForm();
            fetchTasks(); // Re-fetch tasks to get the latest data from the backend
        } catch (error) {
            console.error('Error saving task:', error);
            Alert.alert('Error', 'Failed to save task. Please try again.');
        } finally {
            setIsLoadingTasks(false);
        }
    };
    // Handle deleting a task
    const handleDeleteTask = (taskId: number) => {
        Alert.alert(
            'Confirm Deletion',
            'Are you sure you want to delete this task? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    onPress: async () => {
                        setIsLoadingTasks(true);
                        try {
                            const response = await axios.delete(
                                `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/UserTask/${taskId}/soft-delete`
                            );
                            console.log('Task deleted successfully:', response.data);
                            Alert.alert('Success', 'Task deleted successfully!');
                            fetchTasks(); // Re-fetch tasks to update the list
                        } catch (error) {
                            console.error('Error deleting task:', error);
                            Alert.alert('Error', 'Failed to delete task. Please try again.');
                        } finally {
                            setIsLoadingTasks(false);
                        }
                    },
                    style: 'destructive', // Make the delete button red
                },
            ],
            { cancelable: true }
        );
    };


    // DatePicker handlers
    // DatePicker handlers for Start Date
    const onChangeStartDate = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || startDate;
        setShowStartDatePicker(Platform.OS === 'ios'); // Hide picker on iOS after selection
        setStartDate(currentDate);
    };

    // TimePicker handlers for Start Time
    const onChangeStartTime = (event: any, selectedTime?: Date) => {
        const currentTime = selectedTime || startDate;
        setShowStartTimePicker(Platform.OS === 'ios'); // Hide picker on iOS after selection
        setStartDate(currentTime); // Update startDate with new time
    };

    // DatePicker handlers for Due Date
    const onChangeDueDate = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || dueDate;
        setShowDueDatePicker(Platform.OS === 'ios'); // Hide picker on iOS after selection
        setDueDate(currentDate);
    };

    // TimePicker handlers for Due Time
    const onChangeDueTime = (event: any, selectedTime?: Date) => {
        const currentTime = selectedTime || dueDate;
        setShowDueTimePicker(Platform.OS === 'ios'); // Hide picker on iOS after selection
        setDueDate(currentTime); // Update dueDate with new time
    };

    // Render individual task item
    const renderTaskItem = ({ item }: { item: UserTask }) => (
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
                            size={22} // Slightly larger icon
                            color={TaskStatusColors[item.status]} // Dynamic color based on status
                            style={{ marginRight: 12 }} // Increased margin
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
                    </View>
                    <View style={styles.taskFooter}> {/* New View for Creator and Delete Button */}
                        <Text style={styles.taskCreator}>Created by: {item.creator.name}</Text>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={(e) => {
                                e.stopPropagation(); // Prevent opening edit modal when pressing delete
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
                    colors={['#4F46E5', '#3B82F6']} // Deeper blue/indigo gradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.headerContainer}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <FontAwesome name="arrow-left" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Task Management</Text>
                        <TouchableOpacity onPress={handleCreateNewTask} style={styles.addTaskButton}>
                            <FontAwesome name="plus-circle" size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* Task List */}
                {isLoadingTasks ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#3B82F6" />
                        <Text style={styles.loadingText}>Loading tasks...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={tasks}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderTaskItem}
                        contentContainerStyle={styles.taskList}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyListContainer}>
                                <Text style={styles.emptyListText}>You don't have any tasks yet.</Text>
                                <TouchableOpacity style={styles.createTaskButtonEmpty} onPress={handleCreateNewTask}>
                                    <FontAwesome name="plus" size={18} color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={styles.createTaskButtonText}>Create your first task</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                )}

                {/* Create/Edit Task Modal */}
                <Modal
                    animationType="fade" // Smoother fade animation
                    transparent={true}
                    visible={isModalVisible}
                    onRequestClose={() => setIsModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                                <Text style={styles.modalTitle}>
                                    {editingTask ? 'Edit Task' : 'Create New Task'}
                                </Text>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Title"
                                    placeholderTextColor="#9CA3AF"
                                    value={title}
                                    onChangeText={setTitle}
                                />
                                <TextInput
                                    style={[styles.input, { height: 100, textAlignVertical: 'top' }]} // Larger description field
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


                                {/* Status Picker (using custom buttons for better styling) */}
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
                                                onPress={() => setStatus(s as UserTask['status'])}
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

                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveButton} onPress={handleSaveTask}>
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                            </ScrollView>
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
        backgroundColor: '#F3F4F6', // Light gray background
        marginBottom: 50, // Space for bottom navbar
    },
    headerContainer: {
        paddingHorizontal: 24,
        paddingVertical: 20, // Increased padding
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, // More pronounced shadow
        shadowRadius: 8,
        elevation: 8,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24, // Larger title
        fontWeight: 'bold',
        color: '#fff',
        fontFamily: 'Poppins-Bold',
    },
    addTaskButton: {
        padding: 5, // Make touch target larger
    },
      scrollViewContent: {
        flexGrow: 1, 
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
        paddingHorizontal: 20, // Slightly less padding
        paddingVertical: 20,
    },
    taskCard: {
        marginBottom: 16, // Increased margin
        borderRadius: 18, // More rounded corners
        overflow: 'hidden', // Ensure gradient respects border radius
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, // More pronounced shadow
        shadowRadius: 8,
        elevation: 6,
    },
    taskCardGradient: {
        // This gradient will be the background of the card itself
        flex: 1,
        padding: 2, // Small padding to create a subtle border effect with the content
        borderRadius: 18,
    },
    taskCardContent: {
        backgroundColor: '#fff', // Inner content is white
        padding: 20, // Increased padding
        borderRadius: 16, // Consistent with border
        flex: 1,
    },
    taskHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10, // Increased margin
    },
    taskTitle: {
        fontSize: 20, // Larger title
        fontWeight: 'bold',
        color: '#1E293B',
        fontFamily: 'Poppins-SemiBold',
        marginLeft: 12, // Increased margin
        flexShrink: 1,
    },
    taskDescription: {
        fontSize: 15, // Slightly larger
        color: '#475569',
        fontFamily: 'Poppins-Regular',
        lineHeight: 22, // Better line height
        marginBottom: 12,
    },
    taskDetails: {
        marginBottom: 10,
    },
    taskDate: {
        fontSize: 13, // Slightly larger
        color: '#64748B',
        fontFamily: 'Poppins-Regular',
        marginBottom: 6,
    },
    taskStatus: {
        fontSize: 13, // Slightly larger
        fontWeight: 'bold',
        fontFamily: 'Poppins-Medium',
        marginTop: 4,
    },
    taskCreator: {
        fontSize: 13,
        color: '#64748B',
        fontFamily: 'Poppins-Italic',
        marginTop: 8,
        textAlign: 'right', // Align creator to the right
    },
    emptyListContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        marginTop: 50, // Push down from header
    },
    emptyListText: {
        fontSize: 18, // Larger text
        color: '#64748B',
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        marginBottom: 25, // Increased margin
    },
    createTaskButtonEmpty: {
        backgroundColor: '#3B82F6',
        paddingVertical: 14, // Larger button
        paddingHorizontal: 25,
        borderRadius: 30, // More rounded
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25, // More pronounced shadow
        shadowRadius: 8,
        elevation: 6,
    },
    createTaskButtonText: {
        color: '#fff',
        fontSize: 17, // Larger text
        fontWeight: 'bold',
        fontFamily: 'Poppins-Bold',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)', // Darker overlay
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 25, // More rounded
        padding: 30, // Increased padding
        width: '90%',
        maxHeight: '90%', // Allow more height
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4, // More pronounced shadow
        shadowRadius: 15,
        elevation: 15,
    },
    modalTitle: {
        fontSize: 26, // Larger title
        fontWeight: 'bold',
        color: '#1E293B',
        fontFamily: 'Poppins-Bold',
        marginBottom: 25, // Increased margin
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#CBD5E1', // Lighter border color
        borderRadius: 15, // More rounded
        padding: 15, // Increased padding
        marginBottom: 18, // Increased margin
        fontSize: 17, // Larger font
        fontFamily: 'Poppins-Regular',
        color: '#1E293B',
        backgroundColor: '#F8FAFC',
    },
    dateTimePickerButton: { // Renamed for clarity
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 15,
        padding: 15,
        marginBottom: 18,
        backgroundColor: '#F8FAFC',
    },
    dateTimePickerText: { // Renamed for clarity
        marginLeft: 12,
        fontSize: 17,
        color: '#1E293B',
        fontFamily: 'Poppins-Regular',
    },
    statusPickerContainer: {
        flexDirection: 'column', // Stack label and buttons vertically
        marginBottom: 25,
    },
    statusLabel: {
        fontSize: 17,
        color: '#1E293B',
        fontFamily: 'Poppins-Medium',
        marginBottom: 10, // Space between label and buttons
    },
    statusButtonsGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Allow buttons to wrap to next line
        justifyContent: 'flex-start', // Align buttons to start
    },
    statusSelectButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginRight: 8, // Space between buttons
        marginBottom: 8, // Space for wrapped buttons
    },
    statusSelectButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'Poppins-SemiBold',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
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
});

export default TaskManagementScreen;
