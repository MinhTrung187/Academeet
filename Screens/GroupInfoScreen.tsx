import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    FlatList,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import GroupRequestList from '../Component/GroupRequestList';
import GroupInviteList from '../Component/GroupInviteList';
import BottomNavbar from '../Component/BottomNavbar';
import axios from 'axios';
import FriendInviteList from '../Component/FriendInviteList';
import { Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

interface Member {
    user: { id: string; name: string; avatarUrl?: string };
    groupRole: string;
    joinedAt: string;
}

interface FriendRequest {
    id: string;
    content: string;
    user: {
        id: string;
        name: string;
        avatarUrl?: string;
        age?: number;
        bio?: string;
        field?: string;
        online?: boolean;
        level?: string;
        subjects?: string[];
        studyPreferences?: string[];
    };
    requestedAt: string;
}

interface GroupDetail {
    id: number;
    name: string;
    description: string;
    subjectName: string;
    isPrivate: boolean;
    requestToJoin: boolean;
    memberCount: number;
    createdAt: string;
    avatarUrl?: string;
    members: Member[];
}

const GroupInfoScreen = () => {
    const { params } = useRoute<any>();
    const { groupId } = params;
    const [group, setGroup] = useState<GroupDetail | null>(null);
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showRequests, setShowRequests] = useState(false);
    const [showInvites, setShowInvites] = useState(false);
    const [hasRequestPermission, setHasRequestPermission] = useState(true);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [showMemberOptions, setShowMemberOptions] = useState(false);

    const navigation = useNavigation<any>();


    useEffect(() => {
        console.log('📦 GroupInfoScreen params:', params);
        console.log('🆔 groupId:', groupId);

        const fetchGroupDetail = async () => {
            try {
                const groupUrl = `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Group/${groupId}`;
                const groupRes = await axios.get<GroupDetail>(groupUrl, { withCredentials: true });
                console.log('✅ Group detail:', groupRes.data);
                setGroup(groupRes.data);
            } catch (err) {
                console.error('❌ Failed to fetch group detail', err);
                Alert.alert('Error', 'Failed to load group information. Please try again later.');
            }

            try {
                const requestUrl = `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Group/${groupId}/requests`;
                const requestsRes = await axios.get<FriendRequest[]>(requestUrl, { withCredentials: true });
                console.log('✅ Join requests:', requestsRes.data);
                setRequests(requestsRes.data);
            } catch (err: any) {
                if (axios.isAxiosError(err) && err.response?.status === 403) {
                    setHasRequestPermission(false);

                } else {
                    console.error('⚠️ Failed to fetch join requests', err);
                }
            } finally {
                setLoading(false);
            }
        }

        fetchGroupDetail();
    }, [groupId]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const res = await axios.get<FriendRequest[]>(
                `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Group/${groupId}/requests`,
                { withCredentials: true }
            );
            setRequests(res.data);
        } catch (err: any) {
            if (axios.isAxiosError(err) && err.response?.status === 403) {
            } else {
                console.error('❌ Failed to refresh requests', err);
            }
        } finally {
            setRefreshing(false);
        }
    };

    const handleAction = async (requestId: string, action: 'accept' | 'reject') => {
        try {
            const endpoint =
                action === 'accept'
                    ? `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Group/${groupId}/requests/${requestId}/approve`
                    : `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Group/${groupId}/requests/${requestId}/reject`;
            await axios.post(endpoint, null, { withCredentials: true });
            setRequests((prev) => prev.filter((req) => req.id !== requestId));
            Alert.alert('Success', action === 'accept' ? 'Request accepted' : 'Request rejected');
        } catch (err) {
            console.error(`❌ Failed to ${action} request`, err);
            Alert.alert('Error', `Failed to ${action === 'accept' ? 'accept' : 'reject'} request`);
        }
    };
    const handleChangeAvatar = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets.length > 0) {
                const asset = result.assets[0];

                const formData = new FormData();
                formData.append('file', {
                    uri: asset.uri,
                    name: 'avatar.jpg',
                    type: 'image/jpeg',
                } as any);

                const uploadUrl = `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Group/${group?.id}/avatar`;
                await axios.put(uploadUrl, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true,
                });

                Alert.alert('Success', 'Avatar updated successfully!');
                setGroup(prev => prev ? { ...prev, avatarUrl: asset.uri } : prev);
            }
        } catch (error) {
            console.error('Error changing avatar:', error);
            Alert.alert('Error', 'Failed to update avatar');
        }
    };
    const handleLeaveGroup = () => {
        Alert.alert(
            "Leave Group",
            "Are you sure you want to leave this group? You will no longer be a member.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Leave",
                    onPress: async () => {
                        try {
                            await axios.post(
                                `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Group/${groupId}/members/leave`,
                                null,
                                { withCredentials: true }
                            );
                            Alert.alert("Success", "You have successfully left the group.");
                            navigation.navigate('Home'); 
                        } catch (err: any) {
                            console.error("Error leaving group:", err);
                            const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Unknown error';
                            Alert.alert("Error", `Failed to leave group: ${errorMessage}`);
                        }
                    },
                    style: "destructive",
                },
            ],
            { cancelable: true }
        );
    };

    const handleAvatarPress = () => {
        Alert.alert(
            'Change Avatar',
            'Do you want to change your avatar?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Yes', onPress: handleChangeAvatar },
            ],
            { cancelable: true }
        );
    };


    const renderMember = ({ item }: { item: Member }) => (

        <TouchableOpacity onPress={() => {
            setSelectedMember(item);
            setShowMemberOptions(true);
        }}>
            <View style={styles.memberItem}>
                <Image
                    source={{ uri: item.user.avatarUrl || `https://source.unsplash.com/random/100x100?sig=${item.user.id}` }}
                    style={styles.memberAvatar}
                />
                <View>
                    <Text style={styles.memberName}>{item.user.name}</Text>
                    <Text style={styles.memberRole}>{item.groupRole}</Text>
                </View>
            </View>
        </TouchableOpacity>

    );

    if (loading || !group) {
        return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#3B82F6" />;
    }

    return (
        <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} style={styles.container}>
                {/* Header */}
                <LinearGradient colors={['#6B46C1', '#3B82F6']} style={styles.header}>
                    <TouchableOpacity onPress={handleAvatarPress}>
                        <Image
                            source={{
                                uri: group.avatarUrl || `https://source.unsplash.com/random/100x100?sig=${group.id}`,
                            }}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>

                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupDescription}>{group.description}</Text>
                </LinearGradient>

                {/* Info Cards */}
                <View style={styles.card}>
                    <Text style={styles.cardLabel}>Subject</Text>
                    <Text style={styles.cardContent}>{group.subjectName}</Text>
                </View>
                <View style={styles.card}>
                    <Text style={styles.cardLabel}>Privacy</Text>
                    <Text style={styles.cardContent}>{group.isPrivate ? 'Private' : 'Public'}</Text>
                </View>
                <View style={styles.card}>
                    <Text style={styles.cardLabel}>Created</Text>
                    <Text style={styles.cardContent}>{new Date(group.createdAt).toLocaleDateString()}</Text>
                </View>
                <View style={styles.card}>
                    <Text style={styles.cardLabel}>Members</Text>
                    <Text style={styles.cardContent}>{group.memberCount}</Text>
                </View>

                {/* Members List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Members</Text>
                    <FlatList
                        data={group.members}
                        renderItem={renderMember}
                        keyExtractor={(item) => item.user.id}
                    />
                </View>

                {/* Buttons */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionBtn, !hasRequestPermission && { backgroundColor: '#ccc' }]}
                        disabled={!hasRequestPermission}
                        onPress={() => setShowRequests((prev) => !prev)}
                    >
                        <FontAwesome name="user-plus" size={18} color="#fff" />
                        <Text style={styles.btnText}>
                            {showRequests ? 'Hide Requests' : 'View Requests'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionBtn, !hasRequestPermission && { backgroundColor: '#ccc' }]}
                        disabled={!hasRequestPermission}
                        onPress={() => setShowInvites((prev) => !prev)}
                    >
                        <FontAwesome name="paper-plane" size={18} color="#fff" />
                        <Text style={styles.btnText}>
                            {showInvites ? 'Hide Invite' : 'Invite Members'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => navigation.navigate('GroupTaskManagement', { groupId: group.id })}
                    >
                        <FontAwesome name="tasks" size={18} color="#fff" />
                        <Text style={styles.btnText}>View Group Tasks</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.leaveGroupButton]} // Apply specific style for leave button
                        onPress={handleLeaveGroup}
                    >
                        <Ionicons name="log-out-outline" size={18} color="#fff" />
                        <Text style={styles.btnText}>Leave Group</Text>
                    </TouchableOpacity>


                </View>

                {/* Expandable Sections */}
                {showRequests && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Join Requests</Text>
                        <GroupRequestList
                            groupId={group.id}
                            requests={requests}
                            onRefresh={handleRefresh}
                            refreshing={refreshing}
                            onAction={handleAction}
                        />
                    </View>
                )}

                {showInvites && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Invite People</Text>
                        <FriendInviteList groupId={group.id} />
                    </View>
                )}
                {selectedMember && (
                    <Modal visible={showMemberOptions} transparent animationType="slide">
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContainer}>
                                <Text style={styles.modalTitle}>{selectedMember.user.name}</Text>

                                <TouchableOpacity
                                    style={styles.modalOption}
                                    onPress={() => {
                                        setShowMemberOptions(false);
                                        const user = selectedMember.user;
                                        navigation.navigate('UserDetail', {
                                            friend: {
                                                id: user.id,
                                                name: user.name,
                                                avatar: user.avatarUrl,
                                                age: 0,
                                                bio: '',
                                                field: '',
                                                online: false,
                                                level: '',
                                                subjects: [],
                                                studyPreferences: [],
                                            },
                                        });
                                    }}

                                >
                                    <Text style={styles.modalOptionText}>👤 View Profile</Text>
                                </TouchableOpacity>

                                {group.members.find(m => m.user.id === selectedMember.user.id)?.groupRole !== 'Owner' && (
                                    <TouchableOpacity
                                        style={[styles.modalOption, { backgroundColor: '#fee2e2' }]}
                                        onPress={async () => {
                                            try {
                                                console.log('Removing member:', selectedMember.user.id);
                                                const res = await axios.delete(
                                                    `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Group/${group.id}/members/${selectedMember.user.id}/remove`,
                                                    { withCredentials: true }
                                                );
                                                console.log('Remove response:', res.data);
                                                Alert.alert('Success', 'Member removed');
                                                setGroup(prev => ({
                                                    ...prev!,
                                                    members: prev!.members.filter(m => m.user.id !== selectedMember.user.id),
                                                }));
                                                setShowMemberOptions(false);
                                            } catch (err: any) {
                                                console.log('Remove member error:', err.response?.data || err.message || err);
                                                Alert.alert('Error', 'Failed to remove member');
                                            }
                                        }}>
                                        <Text style={[styles.modalOptionText, { color: '#b91c1c' }]}>🗑 Kick Member</Text>
                                    </TouchableOpacity>
                                )}


                                <TouchableOpacity onPress={() => setShowMemberOptions(false)}>
                                    <Text style={{ marginTop: 12, color: '#3B82F6', textAlign: 'center' }}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                )}

            </ScrollView>

            <BottomNavbar />
        </View>

    );

};

export default GroupInfoScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        alignItems: 'center',
        paddingVertical: 24,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: '#fff',
        marginBottom: 10,
    },
    groupName: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    groupDescription: {
        fontSize: 13,
        color: '#E0F2FE',
        marginTop: 4,
        paddingHorizontal: 20,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
        marginHorizontal: 16,
        marginTop: 10,
    },
    cardLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 4,
    },
    cardContent: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1E293B',
    },
    section: {
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 8,
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    memberAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
    },
    memberName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1E293B',
    },
    memberRole: {
        fontSize: 12,
        color: '#64748B',
    },
    actions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginVertical: 20,
        paddingHorizontal: 16,
        gap: 12,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3B82F6',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        flex: 1,
        minWidth: '48%',
        justifyContent: 'center',
    },
    btnText: {
        color: '#fff',
        fontWeight: '600',
        marginLeft: 6,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    modalOption: {
        width: '100%',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
        backgroundColor: '#f1f5f9',
    },
    modalOptionText: {
        textAlign: 'center',
        fontSize: 16,
    },
    leaveGroupButton: { 
        backgroundColor: '#EF4444', 
        marginTop: 12, 
        width: '100%', 
    },

});