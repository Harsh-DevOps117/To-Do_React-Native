import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { showMessage } from 'react-native-flash-message';
import FlashMessage from 'react-native-flash-message';

const { width } = Dimensions.get('window');

interface Task {
  todo: string;
  date: string;
  importance: 'Chill' | 'Normal' | 'Urgent';
}

const App = () => {
  const [task, setTask] = useState<string>('');
  const [importance, setImportance] = useState<'Chill' | 'Normal' | 'Urgent'>(
    'Chill',
  );
  const [date, setDate] = useState<Date>(new Date());
  const [showDate, setShowDate] = useState(false);
  const [list, setList] = useState<Task[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const saveTasks = async (tasksToSave: Task[]) => {
    try {
      const json = JSON.stringify(tasksToSave);
      await AsyncStorage.setItem('TASKS', json);
      console.log('Tasks saved successfully!');
    } catch (error) {
      console.error('Failed to save tasks:', error);
      Alert.alert('Error', 'Failed to save tasks. Please try again.');
    }
  };

  const loadTasks = async () => {
    try {
      const json = await AsyncStorage.getItem('TASKS');
      if (json !== null) {
        const savedList: Task[] = JSON.parse(json);
        setList(savedList);
        console.log('Tasks loaded successfully!', savedList); // For debugging
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      Alert.alert('Error', 'Failed to load tasks. Please restart the app.');
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (list.length > 0 || (list.length === 0 && editIndex === null)) {
      saveTasks(list);
    }
  }, [list]);

  const handleClick = () => {
    if (task.trim() === '') {
      Alert.alert('Oops!', 'Task cannot be empty!');
      return;
    }

    const formattedDate = date.toLocaleDateString();
    const newTask: Task = { todo: task, date: formattedDate, importance };

    if (editIndex !== null) {
      const updatedList = [...list];
      updatedList[editIndex] = newTask;
      setList(updatedList);
      setEditIndex(null);
    } else {
      setList(prev => [...prev, newTask]);
    }

    setTask('');
    setImportance('Chill');
    setDate(new Date());
  };

  const handleEdit = (index: number) => {
    const task = list[index];
    setTask(task.todo);
    setImportance(task.importance);
    setDate(new Date(task.date));
    setEditIndex(index);

    showMessage({
      message: 'Edit Mode! ✏️',
      description: 'Make your changes and click Update',
      type: 'info',
      backgroundColor: '#1A1A1A',
      color: '#FFFFFF',
      titleStyle: { fontSize: 16, fontWeight: 'bold' },
      textStyle: { fontSize: 14, color: '#CCCCCC' },
      duration: 2000,
      floating: true,
      icon: 'info',
    });
  };

  const handleDelete = (index: number) => {
    const taskToDelete = list[index];
    const updated = list.filter((_, i) => i !== index);
    setList(updated);
    setEditIndex(null);

    showMessage({
      message: 'Task Deleted! 🗑️',
      description: `"${taskToDelete.todo}" has been removed`,
      type: 'danger',
      backgroundColor: '#1A1A1A',
      color: '#FFFFFF',
      titleStyle: { fontSize: 16, fontWeight: 'bold' },
      textStyle: { fontSize: 14, color: '#CCCCCC' },
      duration: 2500,
      floating: true,
      icon: 'danger',
    });
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'Urgent':
        return '#000000';
      case 'Normal':
        return '#666666';
      case 'Chill':
        return '#999999';
      default:
        return '#333333';
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'Urgent':
        return '🔥';
      case 'Normal':
        return '⚡';
      case 'Chill':
        return '🌱';
      default:
        return '📝';
    }
  };

  return (
    <ScrollView style={styles.wrapper} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Daily Habit Tracker</Text>
        <Text style={styles.subheading}>
          Build better habits, one day at a time
        </Text>
      </View>

      {/* Form Card */}
      <View style={styles.formCard}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>
            {editIndex !== null ? '✏️ Edit Task' : '➕ Add New Task'}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Task Description</Text>
            <TextInput
              placeholder="What do you want to accomplish?"
              placeholderTextColor="#666666"
              value={task}
              onChangeText={text => setTask(text)}
              style={styles.input}
              multiline
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Due Date</Text>
            <TouchableOpacity
              style={styles.datePicker}
              onPress={() => setShowDate(true)}
            >
              <Text style={styles.dateText}>
                📅 {date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>

          {showDate && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDate(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Priority Level</Text>
            <View style={styles.importanceBox}>
              {['Chill', 'Normal', 'Urgent'].map(level => (
                <TouchableOpacity
                  key={level}
                  onPress={() =>
                    setImportance(level as 'Chill' | 'Normal' | 'Urgent')
                  }
                  style={[
                    styles.importanceBtn,
                    importance === level && styles.activeImportanceBtn,
                  ]}
                >
                  <Text style={styles.importanceIcon}>
                    {getImportanceIcon(level)}
                  </Text>
                  <Text
                    style={[
                      styles.importanceText,
                      importance === level && styles.activeText,
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.addBtn} onPress={handleClick}>
            <Text style={styles.addBtnText}>
              {editIndex !== null ? '🔄 Update Task' : '➕ Add Task'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Task List */}
      <View style={styles.taskListContainer}>
        <Text style={styles.taskListTitle}>📋 Your Tasks ({list.length})</Text>

        <View style={styles.taskList}>
          {list.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🎯</Text>
              <Text style={styles.emptyStateText}>No tasks yet!</Text>
              <Text style={styles.emptyStateSubtext}>
                Add your first task to get started
              </Text>
            </View>
          ) : (
            list.map((item, index) => (
              <View key={index} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <View style={styles.taskTitleContainer}>
                    <Text style={styles.taskTitle}>{item.todo}</Text>
                  </View>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: getImportanceColor(item.importance) },
                    ]}
                  >
                    <Text style={styles.priorityText}>
                      {getImportanceIcon(item.importance)} {item.importance}
                    </Text>
                  </View>
                </View>

                <View style={styles.taskMeta}>
                  <Text style={styles.metaText}>📅 {item.date}</Text>
                </View>

                <View style={styles.actionBox}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => handleEdit(index)}
                  >
                    <Text style={styles.btnText}>✏️ Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(index)}
                  >
                    <Text style={styles.btnText}>🗑️ Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Flash Message Component */}
      <FlashMessage
        position="top"
        style={styles.flashMessage}
        titleStyle={styles.flashTitle}
        textStyle={styles.flashText}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#1A1A1A',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heading: {
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subheading: {
    textAlign: 'center',
    fontSize: 16,
    color: '#CCCCCC',
    fontWeight: '400',
  },
  formCard: {
    backgroundColor: '#1A1A1A',
    margin: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  formHeader: {
    backgroundColor: '#000000',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#333333',
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 50,
  },
  datePicker: {
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333333',
    alignItems: 'center',
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  importanceBox: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  importanceBtn: {
    padding: 16,
    backgroundColor: '#000000',
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333333',
  },
  activeImportanceBtn: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  importanceIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  importanceText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  activeText: {
    color: '#000000',
  },
  addBtn: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addBtnText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskListContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  taskListTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  taskList: {
    // No flex or height restrictions to allow natural expansion
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyStateIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  taskCard: {
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#333333',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskTitleContainer: {
    flex: 1,
    marginRight: 10,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  taskMeta: {
    marginBottom: 15,
  },
  metaText: {
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  actionBox: {
    flexDirection: 'row',
    gap: 10,
  },
  editBtn: {
    backgroundColor: '#666666',
    padding: 12,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#333333',
  },
  deleteBtn: {
    backgroundColor: '#000000',
    padding: 12,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#333333',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  flashMessage: {
    borderRadius: 12,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  flashTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  flashText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
});

export default App;
