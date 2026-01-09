import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  StatusBar,
  Platform,
} from 'react-native';
import axios from 'axios';
import DropDownPicker from 'react-native-dropdown-picker';

interface Subject {
  id: number;
  name: string;
}

const CreateGroupScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [requestToJoin, setRequestToJoin] = useState(true);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<{ label: string; value: number }[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);

  const [openDropdown, setOpenDropdown] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get<Subject[]>(
          'https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Subject'
        );
        setSubjects(res.data);
        const dropdownItems = res.data.map((sub) => ({
          label: sub.name,
          value: sub.id,
        }));
        setSubjectOptions(dropdownItems);
        setSelectedSubjectId(dropdownItems[0]?.value ?? null);
      } catch (err) {
        console.error('Error fetching subjects:', err);
        Alert.alert('Error', 'Failed to load subjects');
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleCreateGroup = async () => {
    if (!name || !description || !selectedSubjectId) {
      Alert.alert('Validation', 'Please fill all fields');
      return;
    }

    try {
      await axios.post(
        'https://academeet-ezathxd9h0cdb9cd.southeastasia-01.azurewebsites.net/api/Group',
        {
          name,
          description,
          isPrivate,
          requestToJoin,
          subjectId: selectedSubjectId,
        }
      );
      Alert.alert('Success', 'Group created successfully');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to create group');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Group Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Description</Text>
        <TextInput style={styles.input} value={description} onChangeText={setDescription} />

        <Text style={styles.label}>Subject</Text>
        {!loadingSubjects && (
          <View style={{ marginTop: 8 }}>
            <DropDownPicker
              open={openDropdown}
              value={selectedSubjectId}
              items={subjectOptions}
              setOpen={setOpenDropdown}
              setValue={setSelectedSubjectId}
              setItems={setSubjectOptions}
              placeholder="Select a subject"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              searchable={true}
              searchPlaceholder="Search subject..."
              listMode="SCROLLVIEW"
            />
          </View>

        )}


        <View style={styles.switchRow}>
          <Text>Private Group</Text>
          <Switch value={isPrivate} onValueChange={setIsPrivate} />
        </View>

        <View style={styles.switchRow}>
          <Text>Require Join Request</Text>
          <Switch value={requestToJoin} onValueChange={setRequestToJoin} />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleCreateGroup}>
          <Text style={styles.buttonText}>Create</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateGroupScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    paddingBottom: 40,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  dropdown: {
    marginTop: 8,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  dropdownContainer: {
    borderColor: '#ddd',
    borderRadius: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    alignItems: 'center',
  },
  button: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
