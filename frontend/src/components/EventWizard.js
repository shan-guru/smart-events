import React, { useState, useRef, useEffect } from 'react';
import { generateTasks, saveWizardData, getWizardData, generateSchedule } from '../services/api';
import * as XLSX from 'xlsx';
import './EventWizard.css';

const EventWizard = ({ executionMembers = [] }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  
  // Event Details State
  const [eventDetails, setEventDetails] = useState({
    eventName: '',
    eventInfo: '',
    startDate: '',
    endDate: '',
    eventDate: '',
  });

  // Tasks State
  const [tasks, setTasks] = useState([]);
  const [taskMode, setTaskMode] = useState(null); // 'manual' or 'ai'
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskError, setTaskError] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTask, setEditTask] = useState({});
  
  // Task Import State
  const [showTaskImport, setShowTaskImport] = useState(false);
  const [taskImportMode, setTaskImportMode] = useState('file'); // 'file' or 'paste'
  const [pastedTaskData, setPastedTaskData] = useState('');
  const [taskImportError, setTaskImportError] = useState(null);
  const [taskImportSuccess, setTaskImportSuccess] = useState(null);
  const taskFileInputRef = useRef(null);

  // Assigned Members State
  const [assignedMembers, setAssignedMembers] = useState([]);
  
  // Scheduling State
  const [schedulingMode, setSchedulingMode] = useState(null); // 'ai' or 'manual'
  const [scheduledTasks, setScheduledTasks] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState(null);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [editSchedule, setEditSchedule] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);
  
  // Loading state for saved data
  const [loadingSavedData, setLoadingSavedData] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const previousEventNameRef = useRef('');

  // Load saved wizard data when event name changes (only if user manually changes it)
  useEffect(() => {
    const currentEventName = eventDetails.eventName || '';
    
    // Only load if event name changed and it's not empty, and we haven't loaded for this name yet
    if (currentEventName && 
        currentEventName.trim() !== '' && 
        currentEventName !== previousEventNameRef.current &&
        !hasLoadedData) {
      
      const loadSavedData = async () => {
        setLoadingSavedData(true);
        try {
          const savedData = await getWizardData(currentEventName);
          if (savedData) {
            // Restore saved data
            setEventDetails(prev => ({
              ...prev,
              eventName: savedData.event_name || prev.eventName,
              eventInfo: savedData.event_info || prev.eventInfo,
              startDate: savedData.start_date || prev.startDate,
              endDate: savedData.end_date || prev.endDate,
              eventDate: savedData.event_date || prev.eventDate,
            }));
            setTasks(savedData.tasks || []);
            setAssignedMembers(savedData.assigned_members || []);
            setCurrentStep(savedData.current_step || 1);
            setCompletedSteps(savedData.completed_steps || []);
            
            // Set task mode if tasks exist
            if (savedData.tasks && savedData.tasks.length > 0) {
              setTaskMode('manual'); // Assume manual if tasks exist
            }
            
            setHasLoadedData(true);
            previousEventNameRef.current = currentEventName;
          }
        } catch (error) {
          console.error('Failed to load saved wizard data:', error);
          // Don't show error to user - just continue with empty form
        } finally {
          setLoadingSavedData(false);
        }
      };
      
      // Debounce the load to avoid too many API calls
      const timeoutId = setTimeout(loadSavedData, 500);
      return () => clearTimeout(timeoutId);
    }
    
    // Update ref when event name changes
    if (currentEventName !== previousEventNameRef.current) {
      previousEventNameRef.current = currentEventName;
      setHasLoadedData(false); // Reset flag when event name changes
    }
  }, [eventDetails.eventName, hasLoadedData]);

  const steps = [
    { id: 1, title: 'Event Details', icon: '📋' },
    { id: 2, title: 'Add Tasks', icon: '✅' },
    { id: 3, title: 'Assign Members', icon: '👥' },
    { id: 4, title: 'Arrive Schedule', icon: '📅' },
    { id: 5, title: 'Finalize Plan', icon: '🎯' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const normalizeTask = (task) => {
    // Handle duration - can be object {quantity, unit} or legacy string format
    let duration = null;
    if (task.estimated_duration) {
      if (typeof task.estimated_duration === 'object' && task.estimated_duration !== null) {
        // Already in new format
        duration = {
          quantity: task.estimated_duration.quantity || null,
          unit: task.estimated_duration.unit || null,
        };
      } else if (typeof task.estimated_duration === 'string') {
        // Legacy string format - try to parse
        const match = task.estimated_duration.match(/(\d+(?:\.\d+)?)\s*(hours?|days?|hrs?|d)/i);
        if (match) {
          duration = {
            quantity: parseFloat(match[1]),
            unit: match[2].toLowerCase().includes('hour') || match[2].toLowerCase().includes('hr') ? 'hours' : 'days',
          };
        }
      }
    }

    return {
      task: task.task || '',
      description: task.description || task.task || '',
      priority: (task.priority || 'medium').toLowerCase(),
      estimated_duration: duration,
    };
  };

  const handleGenerateAITasks = async (replace = false) => {
    if (!eventDetails.eventName || !eventDetails.eventInfo) {
      alert('Please complete Event Details (Step 1) first');
      return;
    }

    setLoadingTasks(true);
    setTaskError(null);

    try {
      const response = await generateTasks(eventDetails.eventName, eventDetails.eventInfo);
      const normalizedTasks = (response.tasks || []).map((task, index) => ({
        id: Date.now() + index,
        ...normalizeTask(task),
      }));
      
      if (replace) {
        setTasks(normalizedTasks);
      } else {
        // Add to existing tasks
        setTasks([...tasks, ...normalizedTasks]);
      }
      setTaskMode('ai');
    } catch (err) {
      setTaskError(err.message || 'Failed to generate tasks. Please try again.');
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleSwitchToManual = () => {
    setTaskMode('manual');
  };

  const handleSwitchToAI = () => {
    // If already in AI mode, do nothing (user can use Regenerate button)
    if (taskMode === 'ai') {
      return;
    }
    // Always add to existing tasks when switching to AI mode
    // Use "Regenerate" button to replace
    handleGenerateAITasks(false);
  };

  const handleAddManualTask = () => {
    const newTask = {
      id: Date.now(),
      task: '',
      description: '',
      priority: 'medium',
      estimated_duration: {
        quantity: null,
        unit: 'hours',
      },
    };
    setTasks([...tasks, newTask]);
    setEditingTaskId(newTask.id);
    setEditTask(newTask);
    setTaskMode('manual');
  };

  const handleSaveTask = (taskId) => {
    // Normalize duration
    let duration = null;
    if (editTask.estimated_duration) {
      if (typeof editTask.estimated_duration === 'object' && editTask.estimated_duration !== null) {
        if (editTask.estimated_duration.quantity && editTask.estimated_duration.unit) {
          duration = {
            quantity: parseFloat(editTask.estimated_duration.quantity) || null,
            unit: editTask.estimated_duration.unit || 'hours',
          };
        }
      }
    }

    const updatedTasks = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            task: editTask.task || '',
            description: editTask.description || '',
            priority: (editTask.priority || 'medium').toLowerCase(),
            estimated_duration: duration,
          }
        : t
    );
    setTasks(updatedTasks);
    setEditingTaskId(null);
    setEditTask({});
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter((t) => t.id !== taskId));
    }
  };

  // Map imported data to task structure
  const mapToTask = (row, index) => {
    const task = {
      id: Date.now() + index,
      task: row.task || row['Task'] || row.title || row['Title'] || row.name || row['Name'] || '',
      description: row.description || row['Description'] || row.desc || row['Desc'] || row.task || row['Task'] || '',
      priority: (row.priority || row['Priority'] || 'medium').toLowerCase(),
      estimated_duration: null,
    };

    // Validate priority
    if (task.priority !== 'high' && task.priority !== 'medium' && task.priority !== 'low') {
      task.priority = 'medium';
    }

    // Parse duration - can be object, string, or separate quantity/unit fields
    let duration = null;
    const durationData = row.estimated_duration || row['Estimated Duration'] || row.duration || row['Duration'] || row.time || row['Time'];
    const quantityField = row.quantity || row['Quantity'] || row.duration_quantity || row['Duration Quantity'];
    const unitField = row.unit || row['Unit'] || row.duration_unit || row['Duration Unit'];

    if (durationData) {
      if (typeof durationData === 'object' && durationData !== null) {
        // Already in object format
        if (durationData.quantity && durationData.unit) {
          duration = {
            quantity: parseFloat(durationData.quantity) || null,
            unit: durationData.unit.toLowerCase() === 'hours' || durationData.unit.toLowerCase() === 'days' 
              ? durationData.unit.toLowerCase() 
              : 'hours',
          };
        }
      } else if (typeof durationData === 'string') {
        // Try to parse string format like "2 days", "4 hours"
        const match = durationData.match(/(\d+(?:\.\d+)?)\s*(hours?|days?|hrs?|d)/i);
        if (match) {
          duration = {
            quantity: parseFloat(match[1]),
            unit: match[2].toLowerCase().includes('hour') || match[2].toLowerCase().includes('hr') ? 'hours' : 'days',
          };
        }
      }
    } else if (quantityField && unitField) {
      // Separate quantity and unit fields
      duration = {
        quantity: parseFloat(quantityField) || null,
        unit: unitField.toLowerCase() === 'hours' || unitField.toLowerCase() === 'days' 
          ? unitField.toLowerCase() 
          : 'hours',
      };
    }

    task.estimated_duration = duration;

    return task;
  };

  // Validate task data
  const validateTask = (task, index) => {
    const errors = [];

    if (!task.task || !task.task.trim()) {
      errors.push(`Row ${index + 1}: Task name is required`);
    }

    if (!task.description || !task.description.trim()) {
      errors.push(`Row ${index + 1}: Task description is required`);
    }

    if (task.priority && task.priority !== 'high' && task.priority !== 'medium' && task.priority !== 'low') {
      errors.push(`Row ${index + 1}: Invalid priority. Must be "high", "medium", or "low"`);
    }

    return errors;
  };

  // Parse JSON file for tasks
  const parseTaskJSON = (text) => {
    try {
      // Clean and extract JSON from text
      let cleanedText = text.trim();
      
      // Remove markdown code blocks if present
      cleanedText = cleanedText.replace(/^```(?:json)?\s*\n?/i, '');
      cleanedText = cleanedText.replace(/\n?```\s*$/i, '');
      
      // Try to find JSON object/array in the text
      // Look for first { or [ and last } or ]
      const firstBrace = cleanedText.indexOf('{');
      const firstBracket = cleanedText.indexOf('[');
      
      let jsonStart = -1;
      let jsonEnd = -1;
      
      if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
        // Array starts first
        jsonStart = firstBracket;
        jsonEnd = cleanedText.lastIndexOf(']');
      } else if (firstBrace !== -1) {
        // Object starts first
        jsonStart = firstBrace;
        jsonEnd = cleanedText.lastIndexOf('}');
      }
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
      }
      
      // Parse the cleaned JSON
      const data = JSON.parse(cleanedText);
      const tasksArray = Array.isArray(data) ? data : (data.tasks || data.data || []);
      return tasksArray.map((row, index) => mapToTask(row, index));
    } catch (error) {
      throw new Error(`Invalid JSON format: ${error.message}. Please ensure your JSON is valid and doesn't contain extra text or markdown code blocks.`);
    }
  };

  // Parse CSV file for tasks
  const parseTaskCSV = (text) => {
    try {
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length === 0) {
        throw new Error('CSV file is empty');
      }

      const parseCSVLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              current += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        
        result.push(current.trim());
        return result;
      };

      const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, ''));
      const rows = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]).map(v => v.replace(/^"|"$/g, ''));
        if (values.some(v => v)) {
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          rows.push(row);
        }
      }

      return rows.map((row, index) => mapToTask(row, index));
    } catch (error) {
      throw new Error(`Error parsing CSV: ${error.message}`);
    }
  };

  // Parse Excel file for tasks
  const parseTaskExcel = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          if (jsonData.length === 0) {
            throw new Error('Excel file is empty or has no data');
          }

          const tasks = jsonData.map((row, index) => mapToTask(row, index));
          resolve(tasks);
        } catch (error) {
          reject(new Error(`Error parsing Excel file: ${error.message}`));
        }
      };
      reader.onerror = () => reject(new Error('Error reading Excel file'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Validate file format for tasks
  const validateTaskFileFormat = (file) => {
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop();
    const validExtensions = ['json', 'csv', 'xlsx', 'xls'];
    
    if (!validExtensions.includes(fileExtension)) {
      throw new Error(`Invalid file format. Supported formats: ${validExtensions.join(', ').toUpperCase()}`);
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit. Please use a smaller file.');
    }

    return fileExtension;
  };

  // Handle task file import
  const handleTaskFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setTaskImportError(null);
    setTaskImportSuccess(null);

    try {
      const fileExtension = validateTaskFileFormat(file);
      let rawTasks = [];

      if (fileExtension === 'json') {
        const text = await file.text();
        rawTasks = parseTaskJSON(text);
      } else if (fileExtension === 'csv') {
        const text = await file.text();
        rawTasks = parseTaskCSV(text);
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        rawTasks = await parseTaskExcel(file);
      }

      if (rawTasks.length === 0) {
        throw new Error('No data found in the file.');
      }

      // Validate each task
      const validationErrors = [];
      const validTasks = [];

      rawTasks.forEach((task, index) => {
        const errors = validateTask(task, index);
        if (errors.length > 0) {
          validationErrors.push(...errors);
        } else {
          validTasks.push(task);
        }
      });

      if (validTasks.length === 0) {
        const errorMsg = validationErrors.length > 0
          ? `Validation failed:\n${validationErrors.slice(0, 10).join('\n')}${validationErrors.length > 10 ? `\n... and ${validationErrors.length - 10} more errors` : ''}`
          : 'No valid tasks found after validation.';
        throw new Error(errorMsg);
      }

      // Show warnings if there were validation errors
      if (validationErrors.length > 0) {
        const warningMsg = `${validationErrors.length} validation error(s) found. ${validTasks.length} valid task(s) will be imported.\n\nFirst few errors:\n${validationErrors.slice(0, 5).join('\n')}`;
        if (!window.confirm(warningMsg + '\n\nContinue with import?')) {
          return;
        }
      }

      // Add imported tasks to existing list
      setTasks([...tasks, ...validTasks]);
      setTaskMode('manual');
      setTaskImportSuccess(`Successfully imported ${validTasks.length} task(s).${validationErrors.length > 0 ? ` (${validationErrors.length} error(s) were skipped)` : ''}`);
      setShowTaskImport(false);
      
      if (taskFileInputRef.current) {
        taskFileInputRef.current.value = '';
      }
    } catch (error) {
      setTaskImportError(error.message || 'Failed to import file. Please check the file format.');
    }
  };

  // Handle pasted task data import
  const handleTaskPasteImport = async () => {
    if (!pastedTaskData.trim()) {
      setTaskImportError('Please paste some data first.');
      return;
    }

    setTaskImportError(null);
    setTaskImportSuccess(null);

    try {
      let rawTasks = [];
      const trimmedData = pastedTaskData.trim();

      // Try to detect format
      if (trimmedData.startsWith('[') || trimmedData.startsWith('{')) {
        rawTasks = parseTaskJSON(trimmedData);
      } else {
        rawTasks = parseTaskCSV(trimmedData);
      }

      if (rawTasks.length === 0) {
        throw new Error('No data found in the pasted content.');
      }

      // Validate each task
      const validationErrors = [];
      const validTasks = [];

      rawTasks.forEach((task, index) => {
        const errors = validateTask(task, index);
        if (errors.length > 0) {
          validationErrors.push(...errors);
        } else {
          validTasks.push(task);
        }
      });

      if (validTasks.length === 0) {
        const errorMsg = validationErrors.length > 0
          ? `Validation failed:\n${validationErrors.slice(0, 10).join('\n')}${validationErrors.length > 10 ? `\n... and ${validationErrors.length - 10} more errors` : ''}`
          : 'No valid tasks found after validation.';
        throw new Error(errorMsg);
      }

      // Show warnings if there were validation errors
      if (validationErrors.length > 0) {
        const warningMsg = `${validationErrors.length} validation error(s) found. ${validTasks.length} valid task(s) will be imported.\n\nFirst few errors:\n${validationErrors.slice(0, 5).join('\n')}`;
        if (!window.confirm(warningMsg + '\n\nContinue with import?')) {
          return;
        }
      }

      // Add imported tasks to existing list
      setTasks([...tasks, ...validTasks]);
      setTaskMode('manual');
      setTaskImportSuccess(`Successfully imported ${validTasks.length} task(s).${validationErrors.length > 0 ? ` (${validationErrors.length} error(s) were skipped)` : ''}`);
      setPastedTaskData('');
      setShowTaskImport(false);
    } catch (error) {
      setTaskImportError(error.message || 'Failed to import pasted data. Please check the format.');
    }
  };

  const validateCurrentStep = () => {
    if (currentStep === 1) {
      // Validate Event Details
      if (!eventDetails.eventName || !eventDetails.eventInfo) {
        alert('Please fill in Event Name and Event Info');
        return false;
      }
    } else if (currentStep === 2) {
      // Validate Tasks
      if (tasks.length === 0) {
        alert('Please add at least one task');
        return false;
      }
      // Check if any task is being edited
      if (editingTaskId !== null) {
        alert('Please save or cancel the task you are editing');
        return false;
      }
    } else if (currentStep === 3) {
      // Validate Assigned Members
      if (executionMembers.length === 0) {
        alert('Please add execution members first. Go to the "Execution Members" tab to add members.');
        return false;
      }
      if (assignedMembers.length === 0) {
        alert('Please select at least one member to assign to this event');
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) {
      return;
    }
    
    // Save wizard data before moving to next step
    if (eventDetails.eventName && eventDetails.eventName.trim() !== '') {
      try {
        await saveWizardData({
          event_name: eventDetails.eventName,
          event_info: eventDetails.eventInfo,
          start_date: eventDetails.startDate,
          end_date: eventDetails.endDate,
          event_date: eventDetails.eventDate,
          tasks: tasks,
          assigned_members: assignedMembers,
          current_step: currentStep + 1, // Save the next step we're moving to
          completed_steps: [...completedSteps, currentStep],
        });
      } catch (error) {
        console.error('Failed to save wizard data:', error);
        // Continue even if save fails - don't block user progress
      }
    }
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle AI scheduling
  const handleGenerateAISchedule = async () => {
    if (tasks.length === 0) {
      alert('Please add tasks first (Step 2)');
      return;
    }
    if (assignedMembers.length === 0) {
      alert('Please assign members first');
      return;
    }

    setLoadingSchedule(true);
    setScheduleError(null);

    try {
      console.log('Generating schedule with:', {
        event_name: eventDetails.eventName,
        event_info: eventDetails.eventInfo,
        event_start_date: eventDetails.startDate,
        event_end_date: eventDetails.endDate,
        tasks_count: tasks.length,
        members_count: assignedMembers.length,
      });

      const scheduleData = await generateSchedule({
        event_name: eventDetails.eventName || 'Event',
        event_info: eventDetails.eventInfo || '',
        event_start_date: eventDetails.startDate || eventDetails.eventDate || '',
        event_end_date: eventDetails.endDate || eventDetails.eventDate || '',
        tasks: tasks,
        members: assignedMembers,
      });

      console.log('Schedule data received:', scheduleData);

      if (!scheduleData || !scheduleData.scheduled_tasks) {
        throw new Error('Invalid response from server. No scheduled tasks received.');
      }

      // Add IDs to scheduled tasks if they don't have them
      const tasksWithIds = (scheduleData.scheduled_tasks || []).map((task, idx) => ({
        ...task,
        id: task.id || Date.now() + idx,
      }));
      
      if (tasksWithIds.length === 0) {
        throw new Error('No tasks were scheduled. Please try again.');
      }

      setScheduledTasks(tasksWithIds);
      setSchedulingMode('ai');
      setScheduleError(null);
    } catch (error) {
      console.error('Failed to generate schedule:', error);
      const errorMessage = error.message || 'Failed to generate schedule. Please try again.';
      setScheduleError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoadingSchedule(false);
    }
  };

  // Handle manual scheduling - initialize with tasks from Step 2
  // Helper functions for schedule table
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'Not set';
    try {
      const date = new Date(dateTimeStr);
      const dateStr = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric'
      });
      let hour = date.getHours();
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12;
      return `${dateStr}, ${hour} ${ampm}`;
    } catch {
      return dateTimeStr;
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const parseDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return { date: '', hour: '', ampm: 'AM' };
    try {
      const date = new Date(dateTimeStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      let hour = date.getHours();
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12;
      return { date: dateStr, hour: hour.toString(), ampm };
    } catch {
      return { date: '', hour: '', ampm: 'AM' };
    }
  };

  const combineDateTime = (date, hour, ampm) => {
    if (!date || !hour) return '';
    try {
      let hour24 = parseInt(hour);
      if (ampm === 'PM' && hour24 !== 12) {
        hour24 += 12;
      } else if (ampm === 'AM' && hour24 === 12) {
        hour24 = 0;
      }
      return `${date}T${hour24.toString().padStart(2, '0')}:00:00`;
    } catch {
      return '';
    }
  };

  const moveScheduleRow = (fromIndex, toIndex) => {
    setScheduledTasks((prevTasks) => {
      const newTasks = [...prevTasks];
      const [moved] = newTasks.splice(fromIndex, 1);
      newTasks.splice(toIndex, 0, moved);
      // Update order
      return newTasks.map((task, idx) => ({ ...task, order: idx + 1 }));
    });
  };

  const handleManualSchedule = () => {
    if (tasks.length === 0) {
      alert('Please add tasks first in Step 2');
      return;
    }
    
    // Convert tasks from Step 2 to scheduled tasks format
    const scheduledFromTasks = tasks.map((task, index) => ({
      id: task.id || Date.now() + index,
      task_title: task.task || task.description || '',
      priority: task.priority || 'medium',
      duration: task.estimated_duration || { quantity: null, unit: 'hours' },
      owners: [],
      start_date_time: '',
      end_date_time: '',
      order: index + 1,
      originalTaskId: task.id, // Keep reference to original task
    }));
    
    setScheduledTasks(scheduledFromTasks);
    setSchedulingMode('manual');
  };



  // Handle save scheduled task
  const handleSaveSchedule = (scheduleId) => {
    let duration = null;
    if (editSchedule.duration) {
      if (typeof editSchedule.duration === 'object' && editSchedule.duration !== null) {
        if (editSchedule.duration.quantity && editSchedule.duration.unit) {
          duration = {
            quantity: parseFloat(editSchedule.duration.quantity) || null,
            unit: editSchedule.duration.unit || 'hours',
          };
        }
      }
    }

    const updatedSchedules = scheduledTasks.map((s) =>
      s.id === scheduleId
        ? {
            ...s,
            task_title: editSchedule.task_title || '',
            priority: (editSchedule.priority || 'medium').toLowerCase(),
            duration: duration,
            owners: editSchedule.owners || [],
            start_date_time: editSchedule.start_date_time || '',
            end_date_time: editSchedule.end_date_time || '',
          }
        : s
    );
    setScheduledTasks(updatedSchedules);
    setEditingScheduleId(null);
    setEditSchedule({});
  };

  // Handle delete scheduled task
  const handleDeleteSchedule = (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this scheduled task?')) {
      const updated = scheduledTasks
        .filter((s) => s.id !== scheduleId)
        .map((s, idx) => ({ ...s, order: idx + 1 }));
      setScheduledTasks(updated);
    }
  };

  // Handle drag and drop
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === dropIndex) {
      setDraggedItem(null);
      return;
    }

    const items = [...scheduledTasks];
    const draggedItemData = items[draggedItem];
    items.splice(draggedItem, 1);
    items.splice(dropIndex, 0, draggedItemData);
    
    // Update order
    const reordered = items.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));
    
    setScheduledTasks(reordered);
    setDraggedItem(null);
  };

  const handleStepClick = (stepId) => {
    // Allow navigation to completed steps or next step
    if (completedSteps.includes(stepId) || stepId === currentStep + 1) {
      setCurrentStep(stepId);
    }
  };

  const isStepCompleted = (stepId) => completedSteps.includes(stepId);
  const isStepActive = (stepId) => currentStep === stepId;
  const isStepAccessible = (stepId) => 
    isStepCompleted(stepId) || stepId === currentStep || stepId === currentStep + 1;

  const getStepStatus = (stepId) => {
    if (isStepCompleted(stepId)) return 'completed';
    if (isStepActive(stepId)) return 'active';
    if (stepId < currentStep) return 'completed';
    return 'pending';
  };

  return (
    <div className="event-wizard-container">
      <div className="wizard-header">
        <h2>Create New Event</h2>
        <p>Follow the steps below to create your event plan</p>
      </div>

      <div className="wizard-steps">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isAccessible = isStepAccessible(step.id);
          
          return (
            <React.Fragment key={step.id}>
              <div
                className={`step-item ${status} ${isAccessible ? 'accessible' : ''}`}
                onClick={() => isAccessible && handleStepClick(step.id)}
              >
                <div className="step-icon-wrapper">
                  <div className={`step-icon ${status}`}>
                    {status === 'completed' ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <span className="step-icon-text">{step.icon}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`step-connector ${status === 'completed' ? 'completed' : ''}`}></div>
                  )}
                </div>
                <div className="step-content">
                  <div className="step-number">Step {step.id}</div>
                  <div className="step-title">{step.title}</div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="wizard-body">
        <div className="step-header">
          <div className="step-header-left">
            <span className="current-step-icon">{steps[currentStep - 1].icon}</span>
            <div>
              <div className="current-step-number">Step {currentStep} of {steps.length}</div>
              <div className="current-step-title">{steps[currentStep - 1].title}</div>
            </div>
          </div>
          <div className="step-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              ></div>
            </div>
            <span className="progress-text">{Math.round((currentStep / steps.length) * 100)}%</span>
          </div>
        </div>

        <div className="step-content-area">
          {currentStep === 1 && (
            <div className="event-details-form">
              <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                <div className="form-group">
                  <label htmlFor="eventName">Event Name *</label>
                  <input
                    type="text"
                    id="eventName"
                    name="eventName"
                    value={eventDetails.eventName}
                    onChange={handleInputChange}
                    placeholder="e.g., Product Launch, Conference, Wedding"
                    required
                    className="wizard-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="eventInfo">Event Information *</label>
                  <textarea
                    id="eventInfo"
                    name="eventInfo"
                    value={eventDetails.eventInfo}
                    onChange={handleInputChange}
                    placeholder="Provide details about your event: timeline, target audience, budget, location, special requirements, etc."
                    rows="5"
                    required
                    className="wizard-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="startDate">Start Date</label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={eventDetails.startDate}
                      onChange={handleInputChange}
                      className="wizard-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="endDate">End Date</label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={eventDetails.endDate}
                      onChange={handleInputChange}
                      min={eventDetails.startDate}
                      className="wizard-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="eventDate">Event Date</label>
                  <input
                    type="date"
                    id="eventDate"
                    name="eventDate"
                    value={eventDetails.eventDate}
                    onChange={handleInputChange}
                    className="wizard-input"
                  />
                  <small className="form-hint">
                    Main event date (if different from start/end dates)
                  </small>
                </div>
              </form>
            </div>
          )}

          {currentStep === 2 && (
            <div className="add-tasks-step">
              <div className="task-mode-switcher">
                <h3>Add Tasks</h3>
                <div className="mode-toggle-buttons">
                  <button
                    type="button"
                    onClick={handleSwitchToManual}
                    className={`mode-toggle ${taskMode === 'manual' ? 'active' : ''}`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    I have my own tasks
                  </button>
                  <button
                    type="button"
                    onClick={handleSwitchToAI}
                    disabled={loadingTasks || !eventDetails.eventName || !eventDetails.eventInfo}
                    className={`mode-toggle ${taskMode === 'ai' ? 'active' : ''}`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                      <path d="M2 17l10 5 10-5"></path>
                      <path d="M2 12l10 5 10-5"></path>
                    </svg>
                    Generate tasks with AI
                    {loadingTasks && (
                      <span className="spinner-small"></span>
                    )}
                  </button>
                </div>
                {!eventDetails.eventName || !eventDetails.eventInfo ? (
                  <div className="mode-warning">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    Complete Event Details (Step 1) to use AI generation
                  </div>
                ) : null}
              </div>

              {tasks.length === 0 && !taskMode ? (
                <div className="task-mode-selector">
                  <div className="mode-options">
                    <button
                      type="button"
                      onClick={handleAddManualTask}
                      className="mode-option"
                    >
                      <div className="mode-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </div>
                      <h4>I have my own tasks</h4>
                      <p>Manually create and manage your task list</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerateAITasks(false)}
                      disabled={loadingTasks || !eventDetails.eventName || !eventDetails.eventInfo}
                      className="mode-option"
                    >
                      <div className="mode-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                          <path d="M2 17l10 5 10-5"></path>
                          <path d="M2 12l10 5 10-5"></path>
                        </svg>
                      </div>
                      <h4>Generate tasks with AI</h4>
                      <p>Use AI to generate optimal tasks from event details</p>
                      {loadingTasks && (
                        <div className="loading-indicator">
                          <span className="spinner-small"></span>
                          Generating...
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="tasks-management">
                  <div className="tasks-header">
                    <div className="tasks-header-left">
                      <h3>Tasks ({tasks.length})</h3>
                      {taskMode === 'ai' && (
                        <span className="mode-badge">AI Generated</span>
                      )}
                      {taskMode === 'manual' && (
                        <span className="mode-badge mode-badge-manual">Manual</span>
                      )}
                    </div>
                    <div className="tasks-header-actions">
                      {taskMode === 'manual' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setShowTaskImport(!showTaskImport);
                              setTaskImportMode('file');
                              setTaskImportError(null);
                              setTaskImportSuccess(null);
                              setPastedTaskData('');
                              if (showTaskImport && taskFileInputRef.current) {
                                taskFileInputRef.current.value = '';
                              }
                            }}
                            className="btn btn-secondary btn-sm"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="17 8 12 3 7 8"></polyline>
                              <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            {showTaskImport ? 'Cancel Import' : 'Import Tasks'}
                          </button>
                          <button
                            type="button"
                            onClick={handleAddManualTask}
                            className="btn btn-secondary btn-sm"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="12" y1="5" x2="12" y2="19"></line>
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Add Task
                          </button>
                        </>
                      )}
                      {taskMode === 'ai' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleGenerateAITasks(false)}
                            disabled={loadingTasks}
                            className="btn btn-secondary btn-sm"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="12" y1="5" x2="12" y2="19"></line>
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Add More
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Replace all current tasks with new AI-generated tasks?')) {
                                handleGenerateAITasks(true);
                              }
                            }}
                            disabled={loadingTasks}
                            className="btn btn-secondary btn-sm"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                              <path d="M2 17l10 5 10-5"></path>
                              <path d="M2 12l10 5 10-5"></path>
                            </svg>
                            {loadingTasks ? 'Generating...' : 'Regenerate'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {taskError && (
                    <div className="error-message">
                      <span>⚠️</span> {taskError}
                    </div>
                  )}

                  {showTaskImport && taskMode === 'manual' && (
                    <div className="task-import-section">
                      <div className="import-mode-tabs">
                        <button
                          type="button"
                          className={`import-tab ${taskImportMode === 'file' ? 'active' : ''}`}
                          onClick={() => {
                            setTaskImportMode('file');
                            setTaskImportError(null);
                            setTaskImportSuccess(null);
                            setPastedTaskData('');
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                          </svg>
                          Upload File
                        </button>
                        <button
                          type="button"
                          className={`import-tab ${taskImportMode === 'paste' ? 'active' : ''}`}
                          onClick={() => {
                            setTaskImportMode('paste');
                            setTaskImportError(null);
                            setTaskImportSuccess(null);
                            if (taskFileInputRef.current) {
                              taskFileInputRef.current.value = '';
                            }
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                          Paste Data
                        </button>
                      </div>

                      {taskImportMode === 'file' ? (
                        <div className="file-upload-area">
                          <input
                            ref={taskFileInputRef}
                            type="file"
                            accept=".json,.csv,.xlsx,.xls"
                            onChange={handleTaskFileImport}
                            className="file-input"
                            id="task-file-import-input"
                          />
                          <label htmlFor="task-file-import-input" className="file-upload-label">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="17 8 12 3 7 8"></polyline>
                              <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            <span className="upload-text">
                              <strong>Click to upload</strong> or drag and drop
                            </span>
                            <span className="upload-formats">JSON, CSV, or Excel files</span>
                          </label>
                        </div>
                      ) : (
                        <div className="paste-data-area">
                          <div className="paste-header">
                            <label htmlFor="paste-task-data-input">Paste JSON or CSV Data</label>
                            <p className="paste-hint">
                              Paste your task data here. The system will automatically detect JSON or CSV format.
                            </p>
                          </div>
                          <textarea
                            id="paste-task-data-input"
                            value={pastedTaskData}
                            onChange={(e) => setPastedTaskData(e.target.value)}
                            placeholder={`Paste JSON data:
[
  {
    "task": "Setup venue",
    "description": "Arrange tables and chairs",
    "priority": "high",
    "estimated_duration": {
      "quantity": 2,
      "unit": "hours"
    }
  }
]

Or paste CSV data:
Task,Description,Priority,Quantity,Unit
Setup venue,Arrange tables and chairs,high,2,hours`}
                            className="paste-textarea"
                            rows="12"
                          />
                          <div className="paste-actions">
                            <button
                              type="button"
                              onClick={handleTaskPasteImport}
                              disabled={!pastedTaskData.trim()}
                              className="btn btn-primary"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              Import Pasted Data
                            </button>
                            <button
                              type="button"
                              onClick={() => setPastedTaskData('')}
                              className="btn btn-secondary"
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="import-format-info">
                        <h4>Expected Task Formats:</h4>
                        <div className="format-examples">
                          <div className="format-example">
                            <strong>JSON:</strong>
                            <pre>{`[
  {
    "task": "Setup venue",
    "description": "Arrange tables and chairs",
    "priority": "high",
    "estimated_duration": {
      "quantity": 2,
      "unit": "hours"
    }
  },
  {
    "task": "Prepare catering",
    "description": "Order food and beverages",
    "priority": "medium",
    "estimated_duration": {
      "quantity": 1,
      "unit": "days"
    }
  }
]`}</pre>
                          </div>
                          <div className="format-example">
                            <strong>CSV/Excel:</strong>
                            <pre>{`Task,Description,Priority,Quantity,Unit
Setup venue,Arrange tables and chairs,high,2,hours
Prepare catering,Order food and beverages,medium,1,days`}</pre>
                          </div>
                        </div>
                        <p className="format-note">
                          <strong>Note:</strong> Column names are flexible. Required fields: Task and Description. Priority must be "high", "medium", or "low". Duration can be specified as separate Quantity and Unit columns, or as a single "Estimated Duration" column (e.g., "2 hours", "1 day").
                        </p>
                      </div>

                      {taskImportError && (
                        <div className="import-error">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                          </svg>
                          {taskImportError}
                        </div>
                      )}

                      {taskImportSuccess && (
                        <div className="import-success">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          {taskImportSuccess}
                        </div>
                      )}
                    </div>
                  )}

                  {tasks.length > 0 && (
                    <div className="wizard-tasks-grid">
                      {tasks.map((task) => (
                        <div key={task.id} className="wizard-task-card">
                          {editingTaskId === task.id ? (
                            <div className="task-edit-form">
                              <input
                                type="text"
                                value={editTask.task || ''}
                                onChange={(e) => setEditTask({ ...editTask, task: e.target.value })}
                                placeholder="Task name/title"
                                className="wizard-input"
                              />
                              <textarea
                                value={editTask.description || ''}
                                onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                                placeholder="Task description"
                                rows="3"
                                className="wizard-input"
                              />
                              <div className="form-row">
                                <select
                                  value={editTask.priority || 'medium'}
                                  onChange={(e) => setEditTask({ ...editTask, priority: e.target.value })}
                                  className="wizard-input"
                                >
                                  <option value="high">High</option>
                                  <option value="medium">Medium</option>
                                  <option value="low">Low</option>
                                </select>
                                <div className="duration-input-group">
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    value={editTask.estimated_duration?.quantity || ''}
                                    onChange={(e) => setEditTask({
                                      ...editTask,
                                      estimated_duration: {
                                        ...(editTask.estimated_duration || { unit: 'hours' }),
                                        quantity: e.target.value ? parseFloat(e.target.value) : null,
                                      },
                                    })}
                                    placeholder="Quantity"
                                    className="wizard-input duration-quantity"
                                  />
                                  <input
                                    type="text"
                                    value={editTask.estimated_duration?.unit || ''}
                                    onChange={(e) => setEditTask({
                                      ...editTask,
                                      estimated_duration: {
                                        ...(editTask.estimated_duration || { quantity: null }),
                                        unit: e.target.value,
                                      },
                                    })}
                                    placeholder="Unit (hours/days)"
                                    className="wizard-input duration-unit"
                                  />
                                </div>
                              </div>
                              <div className="form-actions">
                                <button
                                  type="button"
                                  onClick={() => handleSaveTask(task.id)}
                                  className="btn btn-primary btn-sm"
                                  disabled={!editTask.task?.trim() || !editTask.description?.trim()}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingTaskId(null);
                                    setEditTask({});
                                  }}
                                  className="btn btn-secondary btn-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="task-content">
                                <h4 className="task-title">{task.task}</h4>
                                <p className="task-description">{task.description}</p>
                                <div className="task-meta">
                                  <span className={`priority-badge priority-${task.priority}`}>
                                    {task.priority}
                                  </span>
                                  {task.estimated_duration && task.estimated_duration.quantity && task.estimated_duration.unit && (
                                    <span className="time-badge">
                                      ⏱ {task.estimated_duration.quantity} {task.estimated_duration.unit}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="task-actions">
                                <button
                                  onClick={() => {
                                    setEditingTaskId(task.id);
                                    setEditTask({ ...task });
                                  }}
                                  className="btn-icon btn-edit"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="btn-icon btn-delete"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                  </svg>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="assign-members-step">
              <div className="members-selection-header">
                <h3>Assign Members to Event</h3>
                <p className="selection-hint">
                  Select members from your Execution Members list to assign to this event
                </p>
              </div>

              {executionMembers.length === 0 ? (
                <div className="no-members-message">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <h4>No Execution Members Available</h4>
                  <p>Go to the "Execution Members" tab to add members first.</p>
                </div>
              ) : (
                <>
                  <div className="selected-members-summary">
                    <span className="summary-text">
                      {assignedMembers.length} of {executionMembers.length} members selected
                    </span>
                    {assignedMembers.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setAssignedMembers([])}
                        className="btn btn-secondary btn-sm"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="members-selection-grid">
                    {executionMembers.map((member) => {
                      const isSelected = assignedMembers.some((m) => m.id === member.id);
                      return (
                        <div
                          key={member.id}
                          className={`member-selection-card member-type-${member.type} ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            if (isSelected) {
                              setAssignedMembers(assignedMembers.filter((m) => m.id !== member.id));
                            } else {
                              setAssignedMembers([...assignedMembers, member]);
                            }
                          }}
                        >
                          <div className="member-selection-checkbox">
                            {isSelected ? (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            ) : (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                              </svg>
                            )}
                          </div>
                          <div className="member-selection-content">
                            <div className="member-selection-header">
                              <h4>
                                {member.type === 'person'
                                  ? `${member.firstName} ${member.lastName}`
                                  : member.name}
                              </h4>
                              <div className="member-header-right">
                                {member.experience && (
                                  <span className={`member-experience-badge member-experience-${member.type}`}>
                                    {member.experience} yrs
                                  </span>
                                )}
                                <span className="member-type-tag">
                                  {member.type === 'person' ? 'Person' : 'Entity'}
                                </span>
                              </div>
                            </div>
                            {member.specializedIn && (
                              <p className="member-specialization">
                                {member.specializedIn}
                              </p>
                            )}
                            <div className="member-contact-info">
                              {member.email && (
                                <span className="contact-item">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                  </svg>
                                  {member.email}
                                </span>
                              )}
                              {member.phone && (
                                <span className="contact-item">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                  </svg>
                                  {member.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="arrive-schedule-step">
              {/* Arrive Schedule - Content will be added here */}
            </div>
          )}

          {currentStep !== 1 && currentStep !== 2 && currentStep !== 3 && currentStep !== 4 && (
            <div className="step-placeholder">
              <div className="placeholder-icon">
                {steps[currentStep - 1].icon}
              </div>
              <h3>{steps[currentStep - 1].title}</h3>
              <p>Content for this step will be added here</p>
            </div>
          )}
        </div>

        <div className="wizard-actions">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="btn btn-secondary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Previous
          </button>
          
          <div className="step-indicators">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`step-dot ${isStepActive(step.id) ? 'active' : ''} ${isStepCompleted(step.id) ? 'completed' : ''}`}
              ></div>
            ))}
          </div>

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn btn-primary"
            >
              Next
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (!completedSteps.includes(currentStep)) {
                  setCompletedSteps([...completedSteps, currentStep]);
                }
                alert('Event plan finalized!');
              }}
              className="btn btn-primary btn-finalize"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Finalize Plan
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

// Schedule Edit Modal Component
const ScheduleEditModal = ({ task, assignedMembers, onClose, onSave }) => {
  const [formData, setFormData] = useState(() => {
    const startParsed = task.startDate ? { date: task.startDate, hour: task.startHour || '9', ampm: task.startAMPM || 'AM' } : { date: '', hour: '9', ampm: 'AM' };
    const endParsed = task.endDate ? { date: task.endDate, hour: task.endHour || '5', ampm: task.endAMPM || 'PM' } : { date: '', hour: '5', ampm: 'PM' };
    
    return {
      ...task,
      startDate: startParsed.date,
      startHour: startParsed.hour,
      startAMPM: startParsed.ampm,
      endDate: endParsed.date,
      endHour: endParsed.hour,
      endAMPM: endParsed.ampm,
      owners: task.owners || [],
    };
  });

  const [ownerInput, setOwnerInput] = useState('');

  const PRIORITY_OPTIONS = [
    { value: 'high', label: 'High', class: 'priority-high' },
    { value: 'medium', label: 'Medium', class: 'priority-medium' },
    { value: 'low', label: 'Low', class: 'priority-low' },
  ];

  const handleOwnerToggle = (member) => {
    const currentOwners = formData.owners || [];
    const isSelected = currentOwners.some((o) => o.id === member.id);
    
    if (isSelected) {
      setFormData({
        ...formData,
        owners: currentOwners.filter((o) => o.id !== member.id),
      });
    } else {
      setFormData({
        ...formData,
        owners: [
          ...currentOwners,
          {
            id: member.id,
            type: member.type,
            name: member.type === 'person'
              ? `${member.firstName} ${member.lastName}`
              : member.name,
          },
        ],
      });
    }
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content rounded-xl max-w-lg w-full max-h-screen overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-gradient flex justify-between items-center px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Edit Task</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600 rounded-md p-1 transition-colors"
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-gray-50">
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
              <input
                type="text"
                value={formData.task_title || ''}
                onChange={(e) => setFormData({ ...formData, task_title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority || 'medium'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {PRIORITY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.duration?.quantity || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      duration: {
                        ...(formData.duration || { unit: 'hours' }),
                        quantity: e.target.value ? parseFloat(e.target.value) : null,
                      },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    style={{ WebkitAppearance: 'textfield', MozAppearance: 'textfield' }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Unit</label>
                  <select
                    value={formData.duration?.unit || 'hours'}
                    onChange={(e) => setFormData({
                      ...formData,
                      duration: {
                        ...(formData.duration || { quantity: null }),
                        unit: e.target.value,
                      },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="hours">hours</option>
                    <option value="days">days</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owners</label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                {assignedMembers.map((member) => {
                  const memberName = member.type === 'person'
                    ? `${member.firstName} ${member.lastName}`
                    : member.name;
                  const isSelected = (formData.owners || []).some((o) => o.id === member.id);
                  
                  return (
                    <div
                      key={member.id}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-all ${isSelected ? 'bg-blue-50' : 'bg-white hover:bg-gray-100'}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleOwnerToggle(member)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="text-sm text-gray-900">{memberName}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.startDate || ''}
                      onChange={(e) => {
                        const dateValue = e.target.value ? e.target.value.split('T')[0].split(' ')[0] : '';
                        setFormData({ ...formData, startDate: dateValue });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Hour</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.startHour || ''}
                      onChange={(e) => setFormData({ ...formData, startHour: e.target.value })}
                      placeholder="Hour"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      style={{ WebkitAppearance: 'textfield', MozAppearance: 'textfield' }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">AM/PM</label>
                    <select
                      value={formData.startAMPM || 'AM'}
                      onChange={(e) => setFormData({ ...formData, startAMPM: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.endDate || ''}
                      onChange={(e) => {
                        const dateValue = e.target.value ? e.target.value.split('T')[0].split(' ')[0] : '';
                        setFormData({ ...formData, endDate: dateValue });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Hour</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.endHour || ''}
                      onChange={(e) => setFormData({ ...formData, endHour: e.target.value })}
                      placeholder="Hour"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      style={{ WebkitAppearance: 'textfield', MozAppearance: 'textfield' }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">AM/PM</label>
                    <select
                      value={formData.endAMPM || 'AM'}
                      onChange={(e) => setFormData({ ...formData, endAMPM: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-r from-primary to-purple-600 text-white rounded-md hover:from-primary-hover hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// Owners List Modal Component
const OwnersListModal = ({ owners, onClose }) => {
  if (!owners || owners.length === 0) return null;

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-content rounded-xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-gradient flex justify-between items-center px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Task Owners</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600 rounded-md p-1 transition-colors"
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-3 bg-gradient-to-b from-white to-gray-50">
          {owners.map((owner, index) => (
            <div
              key={index}
              className="owners-list-item flex items-center gap-3 p-4 rounded-lg"
            >
              <span className={`owner-initial ${index === 0 ? 'bg-blue-600' : index === 1 ? 'bg-green-600' : 'bg-purple-600'}`}>
                {getInitials(owner)}
              </span>
              <span className="text-gray-900 font-medium text-base">{owner}</span>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-primary to-purple-600 text-white rounded-md hover:from-primary-hover hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventWizard;

