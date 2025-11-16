import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import Tabs from '../ui/Tabs';

const ExecutionMembers = ({ members, setMembers }) => {
  // Use props if provided, otherwise use local state
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

  const handleTypeChange = (type) => {
    setMemberType(type);
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
    setMembersList(membersList.filter((m) => m.id !== member.id));
  };

  // Map imported data to member structure
  const mapToMember = (row, index) => {
    let type = (row.type || row.memberType || '').toLowerCase();
    if (!type || (type !== 'person' && type !== 'entity')) {
      if ((row.firstName || row.first_name || row['First Name']) && (row.lastName || row.last_name || row['Last Name'])) {
        type = 'person';
      } else if (row.name || row.entityName || row['Entity Name'] || row['Name']) {
        type = 'entity';
      } else {
        type = 'person';
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
      const offlineValue = row.offline || row.isOffline || row['Offline'] || row['Is Offline'] || '';
      member.offline = offlineValue === true || offlineValue === 'true' || offlineValue === 'yes' || offlineValue === '1' || offlineValue === 'Yes' || offlineValue === 'True';
    }

    member.specializedIn = row.specializedIn || row.specialized_in || row['Specialized In'] || row.specialization || row['Specialization'] || '';
    member.experience = row.experience || row['Experience'] || row.experienceYears || row['Experience Years'] || row['Experience (Years)'] || '';
    member.address = row.address || row['Address'] || '';
    member.phone = row.phone || row['Phone'] || row.phoneNumber || row['Phone Number'] || '';
    member.whatsapp = row.whatsapp || row['WhatsApp'] || row.whatsApp || row['Whats App'] || '';
    member.email = row.email || row['Email'] || row.emailAddress || row['Email Address'] || '';

    return member;
  };

  // Parse JSON file
  const parseJSON = (text) => {
    try {
      let cleanedText = text.trim();
      cleanedText = cleanedText.replace(/^```(?:json)?\s*\n?/i, '');
      cleanedText = cleanedText.replace(/\n?```\s*$/i, '');
      
      const firstBrace = cleanedText.indexOf('{');
      const firstBracket = cleanedText.indexOf('[');
      
      let jsonStart = -1;
      let jsonEnd = -1;
      
      if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
        jsonStart = firstBracket;
        jsonEnd = cleanedText.lastIndexOf(']');
      } else if (firstBrace !== -1) {
        jsonStart = firstBrace;
        jsonEnd = cleanedText.lastIndexOf('}');
      }
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
      }
      
      const data = JSON.parse(cleanedText);
      const membersArray = Array.isArray(data) ? data : (data.members || data.data || []);
      return membersArray.map((row, index) => mapToMember(row, index));
    } catch (error) {
      throw new Error(`Invalid JSON format: ${error.message}`);
    }
  };

  // Parse CSV file
  const parseCSV = (text) => {
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
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
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

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit. Please use a smaller file.');
    }

    return fileExtension;
  };

  // Validate member data
  const validateMember = (member, index) => {
    const errors = [];

    if (!member.type || (member.type !== 'person' && member.type !== 'entity')) {
      errors.push(`Row ${index + 1}: Invalid type. Must be "person" or "entity"`);
    }

    if (member.type === 'person') {
      if (!member.firstName && !member.lastName && !member.email) {
        errors.push(`Row ${index + 1}: Person must have at least firstName, lastName, or email`);
      }
    }

    if (member.type === 'entity') {
      if (!member.name && !member.email) {
        errors.push(`Row ${index + 1}: Entity must have at least name or email`);
      }
    }

    if (member.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
      errors.push(`Row ${index + 1}: Invalid email format: ${member.email}`);
    }

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
      const fileExtension = validateFileFormat(file);
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

      if (validationErrors.length > 0) {
        const warningMsg = `${validationErrors.length} validation error(s) found. ${validMembers.length} valid member(s) will be imported.\n\nFirst few errors:\n${validationErrors.slice(0, 5).join('\n')}`;
        if (!window.confirm(warningMsg + '\n\nContinue with import?')) {
          return;
        }
      }

      setMembersList([...membersList, ...validMembers]);
      setImportSuccess(`Successfully imported ${validMembers.length} member(s).${validationErrors.length > 0 ? ` (${validationErrors.length} error(s) were skipped)` : ''}`);
      setShowImport(false);
      
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
      
      // Try JSON first
      try {
        rawData = parseJSON(pastedData);
      } catch (jsonError) {
        // If JSON fails, try CSV
        try {
          rawData = parseCSV(pastedData);
        } catch (csvError) {
          throw new Error('Unable to parse pasted data. Please ensure it is valid JSON or CSV format.');
        }
      }

      if (rawData.length === 0) {
        throw new Error('No data found in pasted content.');
      }

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

      if (validationErrors.length > 0) {
        const warningMsg = `${validationErrors.length} validation error(s) found. ${validMembers.length} valid member(s) will be imported.\n\nFirst few errors:\n${validationErrors.slice(0, 5).join('\n')}`;
        if (!window.confirm(warningMsg + '\n\nContinue with import?')) {
          return;
        }
      }

      setMembersList([...membersList, ...validMembers]);
      setImportSuccess(`Successfully imported ${validMembers.length} member(s).${validationErrors.length > 0 ? ` (${validationErrors.length} error(s) were skipped)` : ''}`);
      setPastedData('');
      setShowImport(false);
    } catch (error) {
      setImportError(error.message || 'Failed to import pasted data. Please check the format.');
    }
  };

  const experienceSuggestions = ['0', '1-5', '5-10', '10-20', '20+'];

  return (
    <div>
      {/* Header Section */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="section-title">Core Members</div>
            <Badge variant="primary">{membersList.length}</Badge>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
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
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              {showImport ? 'Cancel Import' : 'Import'}
            </Button>
            <Button
              onClick={() => {
                setShowForm(!showForm);
                if (showForm) {
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
                }
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem' }}>
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              {showForm ? 'Cancel' : '+ Add Member'}
            </Button>
          </div>
        </div>

        {/* Import Section */}
        {showImport && (
          <Card style={{ marginBottom: '1.5rem', background: 'var(--bg-secondary)' }}>
            <div className="section-title" style={{ marginBottom: '1rem' }}>Import Members</div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Import members from a file or paste data directly
            </p>

            <Tabs
              tabs={[
                { id: 'file', label: 'Upload File' },
                { id: 'paste', label: 'Paste Data' },
              ]}
              activeTab={importMode}
              onTabChange={(tab) => {
                setImportMode(tab);
                setImportError(null);
                setImportSuccess(null);
                if (tab === 'file' && fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
                if (tab === 'paste') {
                  setPastedData('');
                }
              }}
            />

            {importMode === 'file' ? (
              <div style={{ marginTop: '1.5rem' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv,.xlsx,.xls"
                  onChange={handleFileImport}
                  style={{ display: 'none' }}
                  id="file-import-input"
                />
                <label
                  htmlFor="file-import-input"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '3rem 2rem',
                    border: '2px dashed var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: 'var(--bg-primary)',
                    textAlign: 'center',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-color)';
                    e.currentTarget.style.background = 'var(--bg-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.background = 'var(--bg-primary)';
                  }}
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <strong style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Click to upload</strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>JSON, CSV, or Excel files</span>
                </label>
              </div>
            ) : (
              <div style={{ marginTop: '1.5rem' }}>
                <Input
                  type="textarea"
                  label="Paste JSON or CSV Data"
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
                  value={pastedData}
                  onChange={(e) => setPastedData(e.target.value)}
                  style={{ marginBottom: '1rem' }}
                />
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <Button
                    onClick={handlePasteImport}
                    disabled={!pastedData.trim()}
                  >
                    Import Pasted Data
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setPastedData('')}
                  >
                    Clear
                  </Button>
                </div>

                {/* Format Information */}
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1.5rem',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <h4 style={{
                    margin: '0 0 1rem 0',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    fontWeight: '600',
                  }}>
                    Expected File Formats:
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '1rem',
                  }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>JSON:</strong>
                      <pre style={{
                        margin: 0,
                        padding: '1rem',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'auto',
                        fontSize: '0.8125rem',
                        color: 'var(--text-primary)',
                        lineHeight: '1.5',
                      }}>{`[
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
                    <div>
                      <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>CSV/Excel:</strong>
                      <pre style={{
                        margin: 0,
                        padding: '1rem',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'auto',
                        fontSize: '0.8125rem',
                        color: 'var(--text-primary)',
                        lineHeight: '1.5',
                      }}>{`Type,First Name,Last Name,Name,Email,Phone,WhatsApp,Specialized In,Experience,Offline
person,John,Doe,,john@example.com,+1234567890,+1234567890,Project Management,5-10,
entity,,,Acme Corp,contact@acme.com,+1234567891,,Logistics,10-20,true`}</pre>
                    </div>
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5',
                  }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Note:</strong> Column names are flexible. The system will recognize variations like "First Name", "firstName", "first_name", etc. 
                    For entities, you can include an "offline" field (true/false) to mark them as offline entities. WhatsApp is optional for all members.
                  </p>
                </div>
              </div>
            )}

            {importError && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid var(--error)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--error)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {importError}
              </div>
            )}

            {importSuccess && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid var(--success)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                {importSuccess}
              </div>
            )}
          </Card>
        )}

        {/* Add Member Form */}
        {showForm && (
          <Card style={{ marginBottom: '1.5rem', background: 'var(--bg-secondary)' }}>
            <form onSubmit={handleSubmit}>
              <div className="section-title" style={{ marginBottom: '1.5rem' }}>Add Member</div>

              {/* Member Type Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                }}>
                  Member Type *
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('person')}
                    style={{
                      flex: 1,
                      minWidth: '150px',
                      padding: '0.875rem 1.5rem',
                      border: `2px solid ${memberType === 'person' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-md)',
                      background: memberType === 'person' ? 'var(--primary-gradient)' : 'var(--bg-primary)',
                      color: memberType === 'person' ? 'white' : 'var(--text-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontWeight: '600',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Person
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('entity')}
                    style={{
                      flex: 1,
                      minWidth: '150px',
                      padding: '0.875rem 1.5rem',
                      border: `2px solid ${memberType === 'entity' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-md)',
                      background: memberType === 'entity' ? 'var(--primary-gradient)' : 'var(--bg-primary)',
                      color: memberType === 'entity' ? 'white' : 'var(--text-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontWeight: '600',
                    }}
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

              {/* Person Fields */}
              {memberType === 'person' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <Input
                    type="text"
                    label="First Name *"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    required
                  />
                  <Input
                    type="text"
                    label="Last Name *"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    required
                  />
                </div>
              ) : (
                <>
                  <Input
                    type="text"
                    label="Entity Name *"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Company Name"
                    required
                    style={{ marginBottom: '1rem' }}
                  />
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                    }}>
                      <input
                        type="checkbox"
                        name="offline"
                        checked={formData.offline}
                        onChange={handleInputChange}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span>Mark as Offline Entity</span>
                    </label>
                    {formData.offline && (
                      <small style={{ display: 'block', marginTop: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Tasks for offline entities will be updated by Crew Admin
                      </small>
                    )}
                  </div>
                </>
              )}

              {/* Common Fields */}
              <Input
                type="text"
                label="Specialized In"
                name="specializedIn"
                value={formData.specializedIn}
                onChange={handleInputChange}
                placeholder="e.g., Project Management, Logistics"
                style={{ marginBottom: '1rem' }}
              />

              {/* Experience Field */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                }}>
                  Experience (in years)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <Input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="e.g., 5-10"
                    style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {experienceSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setFormData({ ...formData, experience: suggestion })}
                        style={{
                          padding: '0.5rem 1rem',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--primary-color)';
                          e.currentTarget.style.background = 'var(--bg-secondary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-color)';
                          e.currentTarget.style.background = 'var(--bg-primary)';
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Input
                type="textarea"
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Street address, City, State, ZIP"
                style={{ marginBottom: '1rem' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <Input
                  type="tel"
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="+1 234 567 8900"
                />
                <Input
                  type="tel"
                  label="WhatsApp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="+1 234 567 8900"
                  disabled={formData.usePhoneForWhatsApp}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                }}>
                  <input
                    type="checkbox"
                    name="usePhoneForWhatsApp"
                    checked={formData.usePhoneForWhatsApp}
                    onChange={handleInputChange}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Use same number for WhatsApp</span>
                </label>
              </div>

              <Input
                type="email"
                label="Email *"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@example.com"
                required
                style={{ marginBottom: '1.5rem' }}
              />

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <Button type="submit">Add Member</Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setShowForm(false);
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
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}
      </Card>

      {/* Members List */}
      {membersList.length === 0 && !showForm ? (
        <Card style={{ marginTop: '1.5rem' }}>
          <EmptyState
            icon="👥"
            title="No Core Members Yet"
            description="Start by adding your first member or importing from a file"
            actionLabel="Add Member"
            onAction={() => setShowForm(true)}
          />
        </Card>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginTop: '1.5rem',
        }}>
          {membersList.map((member) => (
            <Card key={member.id} style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <Badge variant={member.type === 'person' ? 'primary' : 'success'}>
                  {member.type === 'person' ? 'Person' : 'Entity'}
                </Badge>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleEdit(member)}
                    style={{
                      padding: '0.5rem',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-secondary)';
                      e.currentTarget.style.color = 'var(--primary-color)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                    title="Edit"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    style={{
                      padding: '0.5rem',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                      e.currentTarget.style.color = 'var(--error)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                    title="Delete"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <h3 style={{ 
                margin: '0 0 1rem 0', 
                color: 'var(--text-primary)',
                fontSize: '1.25rem',
                fontWeight: '600',
              }}>
                {member.type === 'person'
                  ? `${member.firstName} ${member.lastName}`
                  : member.name}
              </h3>

              {member.type === 'entity' && member.offline && (
                <Badge variant="warning" style={{ marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  Offline
                </Badge>
              )}

              {member.specializedIn && (
                <p style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  <strong>Specialized in:</strong> {member.specializedIn}
                </p>
              )}

              {member.experience && (
                <p style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  <strong>Experience:</strong> {member.experience} years
                </p>
              )}

              {member.type === 'entity' && member.offline && (
                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.8125rem', fontStyle: 'italic' }}>
                  Tasks will be updated by Crew Admin
                </p>
              )}

              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {member.address && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{member.address}</span>
                  </div>
                )}
                {member.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span>{member.phone}</span>
                  </div>
                )}
                {member.whatsapp && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span>{member.whatsapp}</span>
                  </div>
                )}
                {member.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <span>{member.email}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExecutionMembers;

