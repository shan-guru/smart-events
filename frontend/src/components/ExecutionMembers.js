import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import './ExecutionMembers.css';

const ExecutionMembers = ({ members, setMembers }) => {
  // Use props if provided, otherwise use local state (for backward compatibility)
  const [localMembers, setLocalMembers] = useState([]);
  const membersList = setMembers ? members : localMembers;
  const setMembersList = setMembers || setLocalMembers;
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importMode, setImportMode] = useState('file'); // 'file' or 'paste'
  const [pastedData, setPastedData] = useState('');
  const [importError, setImportError] = useState(null);
  const [importSuccess, setImportSuccess] = useState(null);
  const fileInputRef = useRef(null);
  const [memberType, setMemberType] = useState('person');
  const [formData, setFormData] = useState({
    // Person fields
    firstName: '',
    lastName: '',
    // Entity fields
    name: '',
    offline: false,
    // Common fields
    specializedIn: '',
    experience: '',
    address: '',
    phone: '',
    whatsapp: '',
    usePhoneForWhatsApp: false,
    email: '',
  });

  const handleTypeChange = (type) => {
    setMemberType(type);
    // Reset form when switching types
    setFormData({
      firstName: '',
      lastName: '',
      name: '',
      offline: false,
      specializedIn: '',
      experience: '',
      address: '',
      phone: '',
      whatsapp: '',
      usePhoneForWhatsApp: false,
      email: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      // Auto-fill WhatsApp if checkbox is checked
      whatsapp: name === 'usePhoneForWhatsApp' && checked ? prev.phone : 
                name === 'phone' && prev.usePhoneForWhatsApp ? value : prev.whatsapp,
    }));
  };

  const handlePhoneChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      phone: value,
      whatsapp: prev.usePhoneForWhatsApp ? value : prev.whatsapp,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (memberType === 'person') {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        alert('Please fill in all required fields (First Name, Last Name, Email)');
        return;
      }
    } else {
      if (!formData.name || !formData.email) {
        alert('Please fill in all required fields (Name, Email)');
        return;
      }
    }

    const newMember = {
      id: Date.now(),
      type: memberType,
      ...(memberType === 'person'
        ? {
            firstName: formData.firstName,
            lastName: formData.lastName,
          }
        : {
            name: formData.name,
            offline: formData.offline || false,
          }),
      specializedIn: formData.specializedIn,
      experience: formData.experience || '',
      address: formData.address,
      phone: formData.phone,
      whatsapp: formData.usePhoneForWhatsApp ? formData.phone : (formData.whatsapp || ''),
      email: formData.email,
    };

    setMembersList([...membersList, newMember]);
    setShowForm(false);
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      name: '',
      offline: false,
      specializedIn: '',
      experience: '',
      address: '',
      phone: '',
      whatsapp: '',
      usePhoneForWhatsApp: false,
      email: '',
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      setMembersList(membersList.filter((m) => m.id !== id));
    }
  };

  const handleEdit = (member) => {
    setMemberType(member.type);
    setFormData({
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      name: member.name || '',
      offline: member.offline || false,
      specializedIn: member.specializedIn || '',
      experience: member.experience || '',
      address: member.address || '',
      phone: member.phone || '',
      whatsapp: member.whatsapp || '',
      usePhoneForWhatsApp: member.phone === member.whatsapp && member.whatsapp,
      email: member.email || '',
    });
    setShowForm(true);
    // Remove from list (will be re-added on save)
    setMembersList(membersList.filter((m) => m.id !== member.id));
  };

  // Map imported data to member structure
  const mapToMember = (row, index) => {
    // Determine type - check for 'type' field or infer from available fields
    let type = (row.type || row.memberType || '').toLowerCase();
    if (!type || (type !== 'person' && type !== 'entity')) {
      // Infer type: if firstName/lastName exist, it's a person; if name exists, it's an entity
      if ((row.firstName || row.first_name || row['First Name']) && (row.lastName || row.last_name || row['Last Name'])) {
        type = 'person';
      } else if (row.name || row.entityName || row['Entity Name'] || row['Name']) {
        type = 'entity';
      } else {
        type = 'person'; // Default to person
      }
    }

    const member = {
      id: Date.now() + index,
      type: type,
    };

    if (type === 'person') {
      member.firstName = row.firstName || row.first_name || row['First Name'] || row['First'] || '';
      member.lastName = row.lastName || row.last_name || row['Last Name'] || row['Last'] || '';
    } else {
      member.name = row.name || row.entityName || row['Entity Name'] || row['Name'] || '';
      // Check for offline status (various formats)
      const offlineValue = row.offline || row.isOffline || row['Offline'] || row['Is Offline'] || '';
      member.offline = offlineValue === true || offlineValue === 'true' || offlineValue === 'yes' || offlineValue === '1' || offlineValue === 'Yes' || offlineValue === 'True';
    }

    // Common fields - try multiple column name variations
    member.specializedIn = row.specializedIn || row.specialized_in || row['Specialized In'] || row.specialization || row['Specialization'] || '';
    member.experience = row.experience || row['Experience'] || row.experienceYears || row['Experience Years'] || row['Experience (Years)'] || '';
    member.address = row.address || row['Address'] || '';
    member.phone = row.phone || row['Phone'] || row.phoneNumber || row['Phone Number'] || '';
    // WhatsApp is optional - only set if provided, don't default to phone
    member.whatsapp = row.whatsapp || row['WhatsApp'] || row.whatsApp || row['Whats App'] || '';
    member.email = row.email || row['Email'] || row.emailAddress || row['Email Address'] || '';

    return member;
  };

  // Parse JSON file
  const parseJSON = (text) => {
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
      // Handle both array and object with array property
      const membersArray = Array.isArray(data) ? data : (data.members || data.data || []);
      return membersArray.map((row, index) => mapToMember(row, index));
    } catch (error) {
      throw new Error(`Invalid JSON format: ${error.message}. Please ensure your JSON is valid and doesn't contain extra text or markdown code blocks.`);
    }
  };

  // Parse CSV file with proper handling of quoted values
  const parseCSV = (text) => {
    try {
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length === 0) {
        throw new Error('CSV file is empty');
      }

      // Helper function to parse CSV line with quoted values
      const parseCSVLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              // Escaped quote
              current += '"';
              i++;
            } else {
              // Toggle quote state
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            // End of field
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        
        // Add last field
        result.push(current.trim());
        return result;
      };

      // Parse header
      const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, ''));
      
      // Parse rows
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]).map(v => v.replace(/^"|"$/g, ''));
        if (values.some(v => v)) { // Skip empty rows
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          rows.push(row);
        }
      }

      return rows.map((row, index) => mapToMember(row, index));
    } catch (error) {
      throw new Error(`Error parsing CSV: ${error.message}`);
    }
  };

  // Parse Excel file
  const parseExcel = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get first sheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          if (jsonData.length === 0) {
            throw new Error('Excel file is empty or has no data');
          }

          const members = jsonData.map((row, index) => mapToMember(row, index));
          resolve(members);
        } catch (error) {
          reject(new Error(`Error parsing Excel file: ${error.message}`));
        }
      };
      reader.onerror = () => reject(new Error('Error reading Excel file'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Validate file format
  const validateFileFormat = (file) => {
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop();
    const validExtensions = ['json', 'csv', 'xlsx', 'xls'];
    
    if (!validExtensions.includes(fileExtension)) {
      throw new Error(`Invalid file format. Supported formats: ${validExtensions.join(', ').toUpperCase()}`);
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit. Please use a smaller file.');
    }

    return fileExtension;
  };

  // Validate member data
  const validateMember = (member, index) => {
    const errors = [];

    // Validate type
    if (!member.type || (member.type !== 'person' && member.type !== 'entity')) {
      errors.push(`Row ${index + 1}: Invalid type. Must be "person" or "entity"`);
    }

    // Validate person fields
    if (member.type === 'person') {
      if (!member.firstName && !member.lastName && !member.email) {
        errors.push(`Row ${index + 1}: Person must have at least firstName, lastName, or email`);
      }
    }

    // Validate entity fields
    if (member.type === 'entity') {
      if (!member.name && !member.email) {
        errors.push(`Row ${index + 1}: Entity must have at least name or email`);
      }
    }

    // Validate email format if provided
    if (member.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
      errors.push(`Row ${index + 1}: Invalid email format: ${member.email}`);
    }

    // Validate phone format if provided (basic validation)
    if (member.phone && !/^[\d\s\-\+\(\)]+$/.test(member.phone)) {
      errors.push(`Row ${index + 1}: Invalid phone format: ${member.phone}`);
    }

    return errors;
  };

  // Handle file import
  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(null);

    try {
      // Validate file format first
      const fileExtension = validateFileFormat(file);

      let importedMembers = [];
      let rawData = [];

      if (fileExtension === 'json') {
        const text = await file.text();
        rawData = parseJSON(text);
      } else if (fileExtension === 'csv') {
        const text = await file.text();
        rawData = parseCSV(text);
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        rawData = await parseExcel(file);
      }

      if (rawData.length === 0) {
        throw new Error('No data found in the file.');
      }

      // Validate each member
      const validationErrors = [];
      const validMembers = [];

      rawData.forEach((member, index) => {
        const errors = validateMember(member, index);
        if (errors.length > 0) {
          validationErrors.push(...errors);
        } else {
          validMembers.push(member);
        }
      });

      if (validMembers.length === 0) {
        const errorMsg = validationErrors.length > 0
          ? `Validation failed:\n${validationErrors.slice(0, 10).join('\n')}${validationErrors.length > 10 ? `\n... and ${validationErrors.length - 10} more errors` : ''}`
          : 'No valid members found after validation.';
        throw new Error(errorMsg);
      }

      // Show warnings if there were validation errors
      if (validationErrors.length > 0) {
        const warningMsg = `${validationErrors.length} validation error(s) found. ${validMembers.length} valid member(s) will be imported.\n\nFirst few errors:\n${validationErrors.slice(0, 5).join('\n')}`;
        if (!window.confirm(warningMsg + '\n\nContinue with import?')) {
          return;
        }
      }

      // Add imported members to existing list
      setMembersList([...membersList, ...validMembers]);
      setImportSuccess(`Successfully imported ${validMembers.length} member(s).${validationErrors.length > 0 ? ` (${validationErrors.length} error(s) were skipped)` : ''}`);
      setShowImport(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setImportError(error.message || 'Failed to import file. Please check the file format.');
    }
  };

  // Handle pasted data import
  const handlePasteImport = async () => {
    if (!pastedData.trim()) {
      setImportError('Please paste some data first.');
      return;
    }

    setImportError(null);
    setImportSuccess(null);

    try {
      let rawData = [];
      const trimmedData = pastedData.trim();

      // Try to detect format - JSON starts with [ or {, CSV doesn't
      if (trimmedData.startsWith('[') || trimmedData.startsWith('{')) {
        // JSON format
        rawData = parseJSON(trimmedData);
      } else {
        // Assume CSV format
        rawData = parseCSV(trimmedData);
      }

      if (rawData.length === 0) {
        throw new Error('No data found in the pasted content.');
      }

      // Validate each member
      const validationErrors = [];
      const validMembers = [];

      rawData.forEach((member, index) => {
        const errors = validateMember(member, index);
        if (errors.length > 0) {
          validationErrors.push(...errors);
        } else {
          validMembers.push(member);
        }
      });

      if (validMembers.length === 0) {
        const errorMsg = validationErrors.length > 0
          ? `Validation failed:\n${validationErrors.slice(0, 10).join('\n')}${validationErrors.length > 10 ? `\n... and ${validationErrors.length - 10} more errors` : ''}`
          : 'No valid members found after validation.';
        throw new Error(errorMsg);
      }

      // Show warnings if there were validation errors
      if (validationErrors.length > 0) {
        const warningMsg = `${validationErrors.length} validation error(s) found. ${validMembers.length} valid member(s) will be imported.\n\nFirst few errors:\n${validationErrors.slice(0, 5).join('\n')}`;
        if (!window.confirm(warningMsg + '\n\nContinue with import?')) {
          return;
        }
      }

      // Add imported members to existing list
      setMembersList([...membersList, ...validMembers]);
      setImportSuccess(`Successfully imported ${validMembers.length} member(s).${validationErrors.length > 0 ? ` (${validationErrors.length} error(s) were skipped)` : ''}`);
      setPastedData('');
      setShowImport(false);
    } catch (error) {
      setImportError(error.message || 'Failed to import pasted data. Please check the format.');
    }
  };

  return (
    <div className="execution-members-container">
      <div className="members-header">
        <div className="header-content">
          <div className="header-title-section">
            <h2>Execution Members</h2>
            <span className="member-count-badge">{membersList.length}</span>
          </div>
          <div className="header-actions">
            <button
              onClick={() => {
                setShowImport(!showImport);
                setImportMode('file');
                setImportError(null);
                setImportSuccess(null);
                setPastedData('');
                if (showImport && fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="btn btn-secondary btn-import"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              {showImport ? 'Cancel Import' : 'Import'}
            </button>
            <button
              onClick={() => {
                setShowForm(!showForm);
                if (showForm) {
                  // Reset form when closing
                  setFormData({
                    firstName: '',
                    lastName: '',
                    name: '',
                    specializedIn: '',
                    address: '',
                    phone: '',
                    whatsapp: '',
                    usePhoneForWhatsApp: false,
                    email: '',
                  });
                }
              }}
              className="btn btn-primary btn-add"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              {showForm ? 'Cancel' : 'Add Member'}
            </button>
          </div>
        </div>
      </div>

      {showImport && (
        <div className="import-section">
          <div className="import-header">
            <h3>Import Members</h3>
            <p className="import-hint">
              Import members from a file or paste data directly
            </p>
          </div>

          <div className="import-mode-tabs">
            <button
              type="button"
              className={`import-tab ${importMode === 'file' ? 'active' : ''}`}
              onClick={() => {
                setImportMode('file');
                setImportError(null);
                setImportSuccess(null);
                setPastedData('');
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
              className={`import-tab ${importMode === 'paste' ? 'active' : ''}`}
              onClick={() => {
                setImportMode('paste');
                setImportError(null);
                setImportSuccess(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
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

          {importMode === 'file' ? (
            <>
              <div className="file-upload-area">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv,.xlsx,.xls"
              onChange={handleFileImport}
              className="file-input"
              id="file-import-input"
            />
            <label htmlFor="file-import-input" className="file-upload-label">
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
            </>
          ) : (
            <div className="paste-data-area">
              <div className="paste-header">
                <label htmlFor="paste-data-input">Paste JSON or CSV Data</label>
                <p className="paste-hint">
                  Paste your data here. The system will automatically detect JSON or CSV format.
                </p>
              </div>
              <textarea
                id="paste-data-input"
                value={pastedData}
                onChange={(e) => setPastedData(e.target.value)}
                placeholder={`Paste JSON data:
[
  {
    "type": "person",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
]

Or paste CSV data:
Type,First Name,Last Name,Email
person,John,Doe,john@example.com`}
                className="paste-textarea"
                rows="12"
              />
              <div className="paste-actions">
                <button
                  type="button"
                  onClick={handlePasteImport}
                  disabled={!pastedData.trim()}
                  className="btn btn-primary"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Import Pasted Data
                </button>
                <button
                  type="button"
                  onClick={() => setPastedData('')}
                  className="btn btn-secondary"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          <div className="import-format-info">
            <h4>Expected File Formats:</h4>
            <div className="format-examples">
              <div className="format-example">
                <strong>JSON:</strong>
                <pre>{`[
  {
    "type": "person",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "whatsapp": "+1234567890",
    "specializedIn": "Project Management",
    "experience": "5-10",
    "address": "123 Main St, City"
  },
  {
    "type": "entity",
    "name": "Acme Corporation",
    "email": "contact@acme.com",
    "phone": "+1234567891",
    "specializedIn": "Logistics",
    "experience": "10-20",
    "address": "456 Business Ave",
    "offline": true
  }
]`}</pre>
              </div>
              <div className="format-example">
                <strong>CSV/Excel:</strong>
                <pre>{`Type,First Name,Last Name,Name,Email,Phone,WhatsApp,Specialized In,Experience,Offline
person,John,Doe,,john@example.com,+1234567890,+1234567890,Project Management,5-10,
entity,,,Acme Corp,contact@acme.com,+1234567891,,Logistics,10-20,true`}</pre>
              </div>
            </div>
            <p className="format-note">
              <strong>Note:</strong> Column names are flexible. The system will recognize variations like "First Name", "firstName", "first_name", etc. 
              For entities, you can include an "offline" field (true/false) to mark them as offline entities. WhatsApp is optional for all members.
            </p>
          </div>

          {importError && (
            <div className="import-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {importError}
            </div>
          )}

          {importSuccess && (
            <div className="import-success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              {importSuccess}
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="member-form-container">
          <form onSubmit={handleSubmit} className="member-form">
            <div className="form-section">
              <label className="section-label">Member Type *</label>
              <div className="type-selector">
                <button
                  type="button"
                  className={`type-option ${memberType === 'person' ? 'active' : ''}`}
                  onClick={() => handleTypeChange('person')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Person
                </button>
                <button
                  type="button"
                  className={`type-option ${memberType === 'entity' ? 'active' : ''}`}
                  onClick={() => handleTypeChange('entity')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  Entity
                </button>
              </div>
            </div>

            {memberType === 'person' ? (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name *</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name *</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      required
                      className="form-input"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="name">Entity Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Company Name"
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="offline"
                      checked={formData.offline}
                      onChange={handleInputChange}
                      className="checkbox-input"
                    />
                    <span>Mark as Offline Entity</span>
                  </label>
                  <small className="checkbox-hint">
                    Tasks for offline entities will be updated by Crew Admin
                  </small>
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="specializedIn">Specialized In</label>
              <input
                type="text"
                id="specializedIn"
                name="specializedIn"
                value={formData.specializedIn}
                onChange={handleInputChange}
                placeholder="e.g., Project Management, Logistics"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="experience">Experience (in years)</label>
              <div className="experience-input-group">
                <input
                  type="text"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="e.g., 5-10"
                  className="form-input experience-input"
                />
                <div className="experience-suggestions">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, experience: '0' })}
                    className="experience-suggestion-btn"
                    title="0 years"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, experience: '1-5' })}
                    className="experience-suggestion-btn"
                    title="1-5 years"
                  >
                    1-5
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, experience: '5-10' })}
                    className="experience-suggestion-btn"
                    title="5-10 years"
                  >
                    5-10
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, experience: '10-20' })}
                    className="experience-suggestion-btn"
                    title="10-20 years"
                  >
                    10-20
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, experience: '20+' })}
                    className="experience-suggestion-btn"
                    title="20+ years"
                  >
                    20+
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Street address, City, State, ZIP"
                rows="3"
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="+1 234 567 8900"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="whatsapp">WhatsApp</label>
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="+1 234 567 8900"
                  disabled={formData.usePhoneForWhatsApp}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="usePhoneForWhatsApp"
                  checked={formData.usePhoneForWhatsApp}
                  onChange={handleInputChange}
                  className="checkbox-input"
                />
                <span>Use same number for WhatsApp</span>
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@example.com"
                required
                className="form-input"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Add Member
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    firstName: '',
                    lastName: '',
                    name: '',
                    offline: false,
                    specializedIn: '',
                    address: '',
                    phone: '',
                    whatsapp: '',
                    usePhoneForWhatsApp: false,
                    email: '',
                  });
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {membersList.length === 0 && !showForm ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <p>No execution members added yet.</p>
          <p className="empty-hint">Click "Add Member" to get started.</p>
        </div>
      ) : (
        <div className="members-grid">
          {membersList.map((member) => (
            <div key={member.id} className="member-card">
              <div className="member-header">
                <div className="member-type-badge">
                  {member.type === 'person' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    </svg>
                  )}
                  <span>{member.type === 'person' ? 'Person' : 'Entity'}</span>
                </div>
                <div className="member-actions">
                  <button
                    onClick={() => handleEdit(member)}
                    className="btn-icon btn-edit"
                    title="Edit"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="btn-icon btn-delete"
                    title="Delete"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="member-content">
                <div className="member-name-row">
                  <h3 className="member-name">
                    {member.type === 'person'
                      ? `${member.firstName} ${member.lastName}`
                      : member.name}
                  </h3>
                  {member.type === 'entity' && member.offline && (
                    <span className="offline-badge" title="Tasks for this entity will be updated by Crew Admin">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      Offline
                    </span>
                  )}
                </div>
                {member.specializedIn && (
                  <p className="member-specialization">
                    <strong>Specialized in:</strong> {member.specializedIn}
                  </p>
                )}
                {member.experience && (
                  <p className="member-experience">
                    <strong>Experience:</strong> {member.experience} years
                  </p>
                )}
                {member.type === 'entity' && member.offline && (
                  <p className="offline-hint">
                    <small>Tasks will be updated by Crew Admin</small>
                  </p>
                )}
                <div className="member-details">
                  {member.address && (
                    <div className="detail-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>{member.address}</span>
                    </div>
                  )}
                  {member.phone && (
                    <div className="detail-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                      <span>{member.phone}</span>
                    </div>
                  )}
                  {member.whatsapp && (
                    <div className="detail-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      <span>{member.whatsapp}</span>
                    </div>
                  )}
                  {member.email && (
                    <div className="detail-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                      <span>{member.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExecutionMembers;

