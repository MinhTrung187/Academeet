import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import axios from 'axios';

interface Invitation {
    id: number;
    group: {
        id: number;
        name: string;
        description: string;
        avatarUrl?: string;
    };
    inviter: {
        id: string;
        name: string;
        avatarUrl?: string;
    };
    invitedAt: string;
}

const InvitationList = () => {
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvites = async () => {
            try {
                const res = await axios.get<Invitation[]>(
                    'https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Group/invites/received',
                    { withCredentials: true }
                );
                setInvitations(res.data);
            } catch (err) {
                console.error('❌ Lỗi lấy lời mời:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchInvites();
    }, []);

    const handleAction = async (inviteId: number, groupId: number, action: 'accept' | 'decline') => {
        const url = `https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Group/${groupId}/invites/${inviteId}/${action}`;
        try {
            await axios.post(url, null, { withCredentials: true });
            setInvitations(prev => prev.filter(inv => inv.id !== inviteId));
            Alert.alert('Success', `You have ${action === 'accept' ? 'accepted' : 'declined'} the invitation.`);
        } catch (err) {
            console.error(`❌ ${action} failed`, err);
            Alert.alert('Error', `Failed to ${action === 'accept' ? 'accept' : 'decline'} the invitation.`);
        }
    };

    const renderItem = ({ item }: { item: Invitation }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.group.avatarUrl || 'https://via.placeholder.com/60' }} style={styles.avatar} />
            <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.groupName}>{item.group.name}</Text>
                <Text style={styles.inviterName}>Invited By {item.inviter.name}</Text>
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#10B981' }]}
                        onPress={() => handleAction(item.id, item.group.id, 'accept')}
                    >
                        <Text style={styles.buttonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#EF4444' }]}
                        onPress={() => handleAction(item.id, item.group.id, 'decline')}
                    >
                        <Text style={styles.buttonText}>Decline</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    if (loading) return <ActivityIndicator size="small" color="#3B82F6" />;

    if (invitations.length === 0) return <Text style={{ fontStyle: 'italic', color: '#64748B' }}>No invitations found.</Text>;

    return (
        <FlatList
            data={invitations}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
        />
    );
};

export default InvitationList;

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#E2E8F0',
    },
    groupName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1E293B',
    },
    inviterName: {
        fontSize: 12,
        color: '#64748B',
        marginVertical: 4,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 6,
    },
    button: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },
});
