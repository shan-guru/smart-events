# UI Components Documentation

This document provides comprehensive documentation for all reusable UI components in the `frontend_v2` application. All components follow the "Modern Gradient" theme (Theme 1) and are designed to be responsive, accessible, and consistent.

## Table of Contents

### UI Components
1. [Button](#button)
2. [Card](#card)
3. [Modal](#modal)
4. [Input](#input)
5. [Badge](#badge)
6. [Tabs](#tabs)
7. [EmptyState](#emptystate)
8. [StatCard](#statcard)
9. [Header](#header)
10. [Menu](#menu)
11. [Toast](#toast)
12. [ToastContainer](#toastcontainer)

### Event Components
13. [EventWizard](#eventwizard)
14. [EventList](#eventlist)
15. [CreateEventForm](#createeventform)
16. [ScheduleTable](#scheduletable)

### Schedule Components
17. [ScheduleList](#schedulelist)
18. [CreateScheduleForm](#createscheduleform)

### Member Components
19. [ExecutionMembers](#executionmembers)

### Additional
20. [Theme System](#theme-system)
21. [Usage Examples](#usage-examples)

---

## Button

A versatile button component with primary and secondary variants, supporting icons and disabled states.

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `children` | `node` | - | ✅ | Button label/content |
| `variant` | `'primary' \| 'secondary'` | `'primary'` | ❌ | Button style variant |
| `onClick` | `function` | - | ❌ | Click handler function |
| `disabled` | `boolean` | `false` | ❌ | Disable button interaction |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | ❌ | HTML button type |
| `icon` | `node` | - | ❌ | Icon element to display before text |
| `className` | `string` | `''` | ❌ | Additional CSS classes |

### Variants

- **Primary**: Gradient background with white text (default)
- **Secondary**: Transparent background with colored border

### Example

```jsx
import Button from './components/ui/Button';

// Primary button
<Button onClick={handleClick}>Click Me</Button>

// Secondary button
<Button variant="secondary" onClick={handleCancel}>Cancel</Button>

// Button with icon
<Button icon={<span>➕</span>} onClick={handleAdd}>Add Item</Button>

// Disabled button
<Button disabled onClick={handleSubmit}>Submit</Button>

// Submit button
<Button type="submit">Submit Form</Button>
```

### Styling

- Uses CSS classes: `button-primary`, `button-secondary`
- Inherits from Theme 1 CSS variables
- Hover effects and transitions included
- Fully responsive

---

## Card

A container component for grouping related content with hover effects and shadows.

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `children` | `node` | - | ✅ | Card content |
| `className` | `string` | `''` | ❌ | Additional CSS classes |
| `onClick` | `function` | - | ❌ | Click handler (makes card clickable) |

### Features

- Hover effects (shadow and transform)
- Rounded corners
- Background styling from theme
- Optional click handler with cursor pointer

### Example

```jsx
import Card from './components/ui/Card';

// Basic card
<Card>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

// Clickable card
<Card onClick={handleCardClick}>
  <h3>Clickable Card</h3>
  <p>This card is clickable</p>
</Card>

// Card with custom class
<Card className="custom-card">
  <h3>Custom Styled Card</h3>
</Card>
```

### Styling

- Uses CSS class: `card`
- Inherits from Theme 1 CSS variables
- Hover effects: shadow and slight transform
- Fully responsive

---

## Modal

A modal dialog component with overlay, header, body, and optional footer sections.

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `isOpen` | `boolean` | - | ✅ | Controls modal visibility |
| `onClose` | `function` | - | ✅ | Function to close modal |
| `title` | `string` | - | ✅ | Modal header title |
| `children` | `node` | - | ✅ | Modal body content |
| `footer` | `node` | - | ❌ | Footer content (buttons, etc.) |
| `className` | `string` | `''` | ❌ | Additional CSS classes |

### Features

- Overlay backdrop (click to close)
- Header with gradient background and close button
- Body section with proper width constraints
- Optional footer section
- Prevents body scroll when open
- Responsive design (mobile-friendly)

### Example

```jsx
import Modal from './components/ui/Modal';
import Button from './components/ui/Button';

const [isOpen, setIsOpen] = useState(false);

// Basic modal
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
>
  <p>Modal content goes here</p>
</Modal>

// Modal with footer
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  footer={
    <>
      <Button variant="secondary" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleConfirm}>Confirm</Button>
    </>
  }
>
  <p>Are you sure you want to proceed?</p>
</Modal>
```

### Styling

- Uses CSS classes: `modal-overlay`, `modal-content`, `modal-header`, `modal-body`
- Max width: 550px (responsive)
- Inherits from Theme 1 CSS variables
- Fully responsive with mobile breakpoints

---

## Input

A flexible input component supporting multiple input types with labels, validation, and error messages.

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `type` | `'text' \| 'number' \| 'date' \| 'email' \| 'tel' \| 'textarea'` | `'text'` | ❌ | Input type |
| `label` | `string` | - | ❌ | Label text |
| `placeholder` | `string` | - | ❌ | Placeholder text |
| `value` | `string \| number` | - | ✅ | Input value (controlled) |
| `onChange` | `function` | - | ✅ | Change handler |
| `error` | `string` | - | ❌ | Error message to display |
| `required` | `boolean` | `false` | ❌ | Mark field as required |
| `className` | `string` | `''` | ❌ | Additional CSS classes |
| `style` | `object` | - | ❌ | Inline styles (applied to input) |

### Features

- Multiple input types (text, number, date, email, tel, textarea)
- Optional label with required indicator
- Error message display
- Placeholder support
- Controlled component pattern
- Proper accessibility (label-input association)
- Width: 100% with box-sizing

### Example

```jsx
import Input from './components/ui/Input';

const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [description, setDescription] = useState('');
const [error, setError] = useState('');

// Text input with label
<Input
  type="text"
  label="Name"
  placeholder="Enter your name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  required
/>

// Email input with error
<Input
  type="email"
  label="Email"
  placeholder="email@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={error}
  required
/>

// Textarea
<Input
  type="textarea"
  label="Description"
  placeholder="Enter description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
/>

// Number input
<Input
  type="number"
  label="Quantity"
  value={quantity}
  onChange={(e) => setQuantity(e.target.value)}
  min="0"
/>

// Date input
<Input
  type="date"
  label="Start Date"
  value={startDate}
  onChange={(e) => setStartDate(e.target.value)}
  required
/>

// Input with custom style
<Input
  type="text"
  label="Custom Input"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  style={{ marginBottom: 0 }}
/>
```

### Styling

- Uses CSS class: `input-field`
- Inherits from Theme 1 CSS variables
- Text color: `var(--text-primary)`
- Placeholder color: `var(--text-light)`
- Error color: `var(--error)`
- Fully responsive

---

## Badge

A small badge component for displaying status, labels, or tags with color variants.

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `children` | `node` | - | ✅ | Badge content |
| `variant` | `'primary' \| 'success' \| 'warning' \| 'danger'` | `'primary'` | ❌ | Badge color variant |
| `className` | `string` | `''` | ❌ | Additional CSS classes |

### Variants

- **Primary**: Purple/blue gradient (default)
- **Success**: Green (for positive states)
- **Warning**: Yellow/orange (for caution)
- **Danger**: Red (for errors/urgent)

### Example

```jsx
import Badge from './components/ui/Badge';

// Primary badge
<Badge>New</Badge>

// Success badge
<Badge variant="success">Active</Badge>

// Warning badge
<Badge variant="warning">Pending</Badge>

// Danger badge
<Badge variant="danger">Urgent</Badge>

// In context
<div>
  <h3>Task Name</h3>
  <Badge variant="high">High Priority</Badge>
</div>
```

### Styling

- Uses CSS classes: `badge`, `badge-primary`, `badge-success`, `badge-warning`, `badge-danger`
- Inherits from Theme 1 CSS variables
- Rounded corners
- Padding and font sizing from theme

---

## Tabs

A tab navigation component for switching between different views or sections.

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `tabs` | `array` | - | ✅ | Array of tab objects |
| `activeTab` | `string` | - | ✅ | ID of currently active tab |
| `onTabChange` | `function` | - | ✅ | Function called when tab is clicked |
| `className` | `string` | `''` | ❌ | Additional CSS classes |

### Tab Object Structure

```javascript
{
  id: 'string',    // Unique identifier
  label: 'string'  // Display text
}
```

### Example

```jsx
import Tabs from './components/ui/Tabs';

const [activeTab, setActiveTab] = useState('tab1');

const tabs = [
  { id: 'tab1', label: 'Overview' },
  { id: 'tab2', label: 'Details' },
  { id: 'tab3', label: 'Settings' },
];

<Tabs
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>

// With conditional rendering
{activeTab === 'tab1' && <OverviewContent />}
{activeTab === 'tab2' && <DetailsContent />}
{activeTab === 'tab3' && <SettingsContent />}
```

### Styling

- Uses CSS classes: `tabs`, `tab`, `tab.active`
- Inherits from Theme 1 CSS variables
- Active tab has gradient background
- Smooth transitions
- Fully responsive

---

## EmptyState

A component for displaying empty states with optional icon, title, description, and action button.

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `icon` | `node` | - | ❌ | Icon element (emoji, SVG, etc.) |
| `title` | `string` | - | ❌ | Main title text |
| `description` | `string` | - | ❌ | Descriptive text |
| `actionLabel` | `string` | - | ❌ | Label for action button |
| `onAction` | `function` | - | ❌ | Action button click handler |
| `className` | `string` | `''` | ❌ | Additional CSS classes |

### Example

```jsx
import EmptyState from './components/ui/EmptyState';

// Basic empty state
<EmptyState
  icon="📋"
  title="No tasks yet"
  description="Get started by creating your first task"
/>

// With action button
<EmptyState
  icon="📝"
  title="No events found"
  description="Create your first event to get started"
  actionLabel="Create Event"
  onAction={() => setShowForm(true)}
/>

// Minimal empty state
<EmptyState description="No items to display" />
```

### Styling

- Uses CSS classes: `empty-state`, `empty-state-icon`, `empty-state-title`, `empty-state-description`
- Inherits from Theme 1 CSS variables
- Centered layout
- Fully responsive

---

## StatCard

A card component for displaying statistics with label, value, and optional icon.

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `label` | `string` | - | ✅ | Stat label text |
| `value` | `string \| number` | - | ✅ | Stat value to display |
| `icon` | `node` | - | ❌ | Icon element |
| `className` | `string` | `''` | ❌ | Additional CSS classes |

### Example

```jsx
import StatCard from './components/ui/StatCard';

// Basic stat card
<StatCard
  label="Total Events"
  value={42}
/>

// With icon
<StatCard
  label="Active Tasks"
  value={15}
  icon={<span>✅</span>}
/>

// Multiple stat cards in grid
<div className="grid-layout">
  <StatCard label="Events" value={10} />
  <StatCard label="Tasks" value={25} />
  <StatCard label="Members" value={8} />
</div>
```

### Styling

- Uses CSS classes: `stat-card`, `stat-label`, `stat-value`
- Inherits from Theme 1 CSS variables
- Gradient background
- Hover effects
- Fully responsive

---

## EventWizard

A multi-step wizard component for creating events with step-by-step navigation. Includes visual step indicators, progress tracking, and dynamic content rendering for each step.

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `onComplete` | `function` | - | ❌ | Callback when wizard is completed |
| `onCancel` | `function` | - | ❌ | Callback when wizard is cancelled |

### Steps

The wizard includes 5 steps:
1. **Event Details** - Basic event information (uses CreateEventForm)
2. **Add Tasks** - Task management (placeholder)
3. **Assign Members** - Member assignment (placeholder)
4. **Arrive Schedule** - Schedule table for tasks (uses ScheduleTable)
5. **Finalize Plan** - Review and finalize event

### Features

- Visual step indicators with icons
- Progress tracking (completed, current, pending states)
- Clickable step navigation
- Previous/Next navigation buttons
- Dynamic content rendering per step
- Step completion tracking
- Event summary in final step

### Example

```jsx
import EventWizard from './components/events/EventWizard';

const [showWizard, setShowWizard] = useState(false);

// Basic usage
<EventWizard
  onComplete={(eventData) => {
    console.log('Event created:', eventData);
    setShowWizard(false);
  }}
  onCancel={() => setShowWizard(false)}
/>

// Conditional rendering
{showWizard && (
  <EventWizard
    onComplete={handleEventComplete}
    onCancel={() => setShowWizard(false)}
  />
)}
```

### Step Navigation

Users can:
- Click on any step to navigate directly
- Use Previous/Next buttons for sequential navigation
- See visual feedback for completed, current, and pending steps
- View checkmarks on completed steps

### Styling

- Uses CSS classes: `wizard-steps`, `section-title`
- Inherits from Theme 1 CSS variables
- Gradient backgrounds for active/completed steps
- Responsive step indicators
- Smooth transitions

---

## EventList

A component for displaying a list of events in a table format with status badges, date formatting, and action buttons.

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `events` | `array` | `[]` | ❌ | Array of event objects |
| `onEdit` | `function` | - | ❌ | Callback when edit button is clicked |
| `onDelete` | `function` | - | ❌ | Callback when delete button is clicked |
| `onCreateNew` | `function` | - | ❌ | Callback when create button is clicked |

### Event Object Structure

```javascript
{
  id: string | number,
  eventName: string,      // or 'name'
  startDate: string,       // ISO date string
  endDate: string          // ISO date string
}
```

### Features

- Table layout with responsive design
- Status badges (Planning, Upcoming, Active, Completed)
- Date formatting (locale-aware)
- Edit and delete action buttons
- Empty state with create button
- Automatic status calculation based on dates

### Status Badges

- **Planning**: No dates set
- **Upcoming**: Current date < start date
- **Active**: Current date between start and end dates
- **Completed**: Current date > end date

### Example

```jsx
import EventList from './components/events/EventList';

const events = [
  {
    id: 1,
    eventName: 'Product Launch',
    startDate: '2025-11-15',
    endDate: '2025-11-17',
  },
  {
    id: 2,
    eventName: 'Annual Conference',
    startDate: '2025-12-20',
    endDate: '2025-12-22',
  },
];

<EventList
  events={events}
  onEdit={(event) => console.log('Edit:', event)}
  onDelete={(event) => console.log('Delete:', event)}
  onCreateNew={() => setShowForm(true)}
/>
```

### Styling

- Uses CSS classes: `table-container`, `table-header`, `table-row`, `icon-button`
- Inherits from Theme 1 CSS variables
- Responsive table layout
- Hover effects on rows
- Icon buttons with SVG icons

---

## CreateEventForm

A form component for creating or editing events with validation and error handling.

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `onSubmit` | `function` | - | ✅ | Callback when form is submitted |
| `onCancel` | `function` | - | ❌ | Callback when form is cancelled |
| `initialData` | `object` | `{}` | ❌ | Initial form data for editing |

### Form Fields

- **Event Name** (required) - Text input
- **Event Info** (required) - Textarea
- **Start Date** (required) - Date input
- **End Date** (required) - Date input
- **Event Date** (optional) - Date input

### Validation

- Event name is required
- Event info is required
- Start date is required
- End date is required
- End date must be after start date

### Example

```jsx
import CreateEventForm from './components/events/CreateEventForm';

<CreateEventForm
  onSubmit={(formData) => {
    console.log('Event data:', formData);
    // Save event
  }}
  onCancel={() => setShowForm(false)}
  initialData={{
    eventName: 'Existing Event',
    eventInfo: 'Event description',
    startDate: '2025-11-15',
    endDate: '2025-11-17',
  }}
/>
```

### Styling

- Uses CSS classes: `section-title`
- Inherits from Theme 1 CSS variables
- Grid layout for date fields
- Error message display
- Responsive form layout

---

## ScheduleList

A component for displaying schedules in a table format with drag-and-drop reordering, priority badges, owner avatars, and date/time formatting.

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `schedules` | `array` | `[]` | ❌ | Array of schedule objects |
| `onEdit` | `function` | - | ❌ | Callback when edit button is clicked |
| `onDelete` | `function` | - | ❌ | Callback when delete button is clicked |
| `onCreateNew` | `function` | - | ❌ | Callback when create button is clicked |
| `onReorder` | `function` | - | ❌ | Callback when schedules are reordered via drag-and-drop |

### Schedule Object Structure

```javascript
{
  id: string | number,
  taskTitle: string,           // or 'scheduleName' or 'name'
  priority: 'low' | 'medium' | 'high',
  durationQuantity: string | number,
  durationUnit: string,         // e.g., 'hours', 'days', 'minutes'
  owners: array<string | object>, // Array of owner names or objects with 'name'
  startDate: string,           // ISO date string
  startHour: string,            // Hour (1-12)
  startAMPM: 'AM' | 'PM',
  endDate: string,             // ISO date string
  endHour: string,              // Hour (1-12)
  endAMPM: 'AM' | 'PM'
}
```

### Features

- Drag-and-drop reordering
- Desktop table view with grid layout
- Mobile card view (responsive)
- Priority badges with color coding
- Owner avatars with initials
- Date and time formatting
- Duration display
- Edit functionality
- Empty state with create button

### Priority Badge Colors

- **High**: Danger (red)
- **Medium**: Warning (yellow/orange)
- **Low**: Success (green)

### Example

```jsx
import ScheduleList from './components/schedule/ScheduleList';

const schedules = [
  {
    id: 1,
    taskTitle: 'Morning Meeting',
    priority: 'high',
    durationQuantity: '1',
    durationUnit: 'hour',
    owners: ['John Doe', 'Jane Smith'],
    startDate: '2025-11-15',
    startHour: '9',
    startAMPM: 'AM',
    endDate: '2025-11-15',
    endHour: '10',
    endAMPM: 'AM',
  },
];

<ScheduleList
  schedules={schedules}
  onEdit={(schedule) => console.log('Edit:', schedule)}
  onDelete={(schedule) => console.log('Delete:', schedule)}
  onCreateNew={() => setShowForm(true)}
  onReorder={(newSchedules) => setSchedules(newSchedules)}
/>
```

### Drag and Drop

- Drag handle icon on each row
- Visual feedback during drag (opacity change)
- Drop zones between rows
- Automatic reordering callback

### Responsive Design

- **Desktop**: Full table with all columns
- **Tablet**: Adjusted column widths, horizontal scroll
- **Mobile**: Card layout with stacked information

### Styling

- Uses CSS classes: `schedule-table-header`, `schedule-table-row`, `desktop-view`, `mobile-view`
- Inherits from Theme 1 CSS variables
- Gradient header background
- Hover effects on rows
- Responsive grid layout
- Mobile-specific styles

---

## ScheduleTable

A table component for displaying and editing scheduled tasks. Used in the "Arrive Schedule" step of the EventWizard. Includes drag-and-drop reordering, inline editing via modal, and comprehensive task information display.

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `tasks` | `array` | `[]` | ❌ | Array of task objects |
| `onUpdateTasks` | `function` | - | ❌ | Callback when tasks are updated |

### Task Object Structure

```javascript
{
  taskTitle: string,
  priority: 'low' | 'medium' | 'high',
  durationQuantity: string | number,
  durationUnit: 'hours' | 'days',
  owners: array<string>,
  startDate: string,           // ISO date string
  startHour: string,            // Hour (1-12)
  startAMPM: 'AM' | 'PM',
  endDate: string,             // ISO date string
  endHour: string,              // Hour (1-12)
  endAMPM: 'AM' | 'PM'
}
```

### Features

- Drag-and-drop reordering
- Edit modal with comprehensive form
- Add new tasks
- Priority badges
- Owner avatars with initials
- Date and time formatting
- Duration display
- Empty state with add button
- Responsive design (desktop table, mobile cards)

### Edit Modal

The edit modal includes:
- Task Title input
- Priority dropdown (low, medium, high)
- Duration (quantity + unit)
- Owners (comma-separated input)
- Start Date & Time (date, hour, AM/PM)
- End Date & Time (date, hour, AM/PM)

### Example

```jsx
import ScheduleTable from './components/events/ScheduleTable';

const [tasks, setTasks] = useState([
  {
    taskTitle: 'Setup Event Venue',
    priority: 'high',
    durationQuantity: '4',
    durationUnit: 'hours',
    owners: ['John Doe', 'Jane Smith'],
    startDate: '2025-11-20',
    startHour: '9',
    startAMPM: 'AM',
    endDate: '2025-11-20',
    endHour: '1',
    endAMPM: 'PM',
  },
]);

<ScheduleTable
  tasks={tasks}
  onUpdateTasks={setTasks}
/>
```

### Usage in EventWizard

The ScheduleTable is used in step 4 (Arrive Schedule) of the EventWizard:

```jsx
case 4:
  return (
    <ScheduleTable
      tasks={scheduledTasks}
      onUpdateTasks={setScheduledTasks}
    />
  );
```

### Styling

- Uses CSS classes: `schedule-table-header`, `schedule-table-row`, `schedule-form-grid-2`, `schedule-form-grid-3`, `mobile-label`
- Includes `ScheduleTable.css` for responsive styles
- Inherits from Theme 1 CSS variables
- Gradient header background
- Hover effects on rows
- Modal styling for edit form
- Mobile-responsive with card layout

---

## CreateScheduleForm

A form component for creating or editing schedules with validation and error handling.

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `onSubmit` | `function` | - | ✅ | Callback when form is submitted |
| `onCancel` | `function` | - | ❌ | Callback when form is cancelled |
| `initialData` | `object` | `{}` | ❌ | Initial form data for editing |

### Form Fields

- **Schedule Name** (required) - Text input
- **Schedule Info** (required) - Textarea
- **Start Date** (required) - Date input
- **End Date** (required) - Date input
- **Schedule Date** (optional) - Date input

### Validation

- Schedule name is required
- Schedule info is required
- Start date is required
- End date is required
- End date must be after start date

### Example

```jsx
import CreateScheduleForm from './components/schedule/CreateScheduleForm';

<CreateScheduleForm
  onSubmit={(formData) => {
    console.log('Schedule data:', formData);
    // Save schedule
  }}
  onCancel={() => setShowForm(false)}
  initialData={{
    scheduleName: 'Existing Schedule',
    scheduleInfo: 'Schedule description',
    startDate: '2025-11-15',
    endDate: '2025-11-17',
  }}
/>
```

### Styling

- Uses CSS classes: `section-title`
- Inherits from Theme 1 CSS variables
- Grid layout for date fields
- Error message display
- Responsive form layout

---

## Header

A comprehensive header component with logo, title, navigation items, action buttons, and user avatar/menu. Used across all pages for consistent navigation.

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `logo` | `string \| node` | - | ❌ | Logo image URL or React node |
| `title` | `string` | - | ❌ | Header title text |
| `subtitle` | `string` | - | ❌ | Header subtitle text |
| `userAvatar` | `string \| node` | - | ❌ | User avatar image URL or React node (Menu component) |
| `userName` | `string` | - | ❌ | User name to display |
| `onLogoClick` | `function` | - | ❌ | Click handler for logo |
| `navigationItems` | `array` | `[]` | ❌ | Array of navigation items |
| `actions` | `array` | `[]` | ❌ | Array of action buttons |

### Navigation Item Structure

```javascript
{
  label: string,        // Required: Display text
  icon: node,          // Optional: Icon element (emoji, SVG, etc.)
  onClick: function,   // Optional: Click handler
  href: string,        // Optional: Link URL
  active: boolean      // Optional: Active state
}
```

### Action Structure

```javascript
{
  label: string,       // Optional: Button label
  icon: node,         // Optional: Icon element
  onClick: function,  // Required: Click handler
  variant: string,    // Optional: 'primary' or 'default'
  title: string       // Optional: Tooltip text
}
```

### Features

- Three-section layout (left: logo/title, center: navigation, right: actions/user)
- Logo fallback to placeholder SVG if image fails
- User avatar fallback to initials if image fails
- Active navigation state highlighting
- Responsive design (navigation hidden on mobile)
- Sticky positioning
- Gradient active state for navigation items

### Example

```jsx
import Header from './components/ui/Header';
import Menu from './components/ui/Menu';

const userMenuItems = [
  {
    label: 'My Profile',
    icon: <ProfileIcon />,
    onClick: () => navigate('profile'),
  },
  { divider: true },
  {
    label: 'Sign Out',
    icon: <SignOutIcon />,
    onClick: () => handleSignOut(),
    danger: true,
  },
];

<Header
  logo="/path/to/logo.png"
  title="Event Management"
  subtitle="Manage your events and tasks"
  userAvatar={
    <Menu
      trigger={<UserAvatar />}
      items={userMenuItems}
      placement="bottom-right"
    />
  }
  userName="John Doe"
  navigationItems={[
    { 
      label: 'Events', 
      icon: '📅',
      onClick: () => navigate('events'),
      active: true
    },
    { 
      label: 'Templates', 
      icon: '📋',
      onClick: () => navigate('templates')
    },
    { 
      label: 'My Tasks', 
      icon: <ClipboardIcon />,
      onClick: () => navigate('my-tasks')
    },
  ]}
  actions={[
    {
      label: 'Notifications',
      icon: <BellIcon />,
      onClick: () => openNotifications(),
    },
    {
      label: 'Settings',
      icon: <SettingsIcon />,
      onClick: () => navigate('settings'),
    },
  ]}
/>
```

### Styling

- Uses CSS classes: `app-header`, `header-container`, `header-navigation`, `nav-item`, `header-action`
- Includes `Header.css` for styling
- Inherits from Theme 1 CSS variables
- Sticky positioning with z-index: 100
- Responsive breakpoints for mobile

---

## Menu

A dropdown menu component with customizable placement, dividers, icons, and danger states. Commonly used for user menus and context menus.

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `trigger` | `node` | - | ✅ | Element that triggers the menu |
| `items` | `array` | `[]` | ❌ | Array of menu items |
| `placement` | `string` | `'bottom-right'` | ❌ | Menu placement position |

### Placement Options

- `'bottom-right'` (default)
- `'bottom-left'`
- `'top-right'`
- `'top-left'`

### Menu Item Structure

```javascript
{
  label: string,        // Required: Display text
  icon: node,          // Optional: Icon element
  onClick: function,    // Optional: Click handler
  danger: boolean,     // Optional: Danger styling (red)
  disabled: boolean, // Optional: Disabled state
  badge: node,        // Optional: Badge element
  divider: boolean    // Optional: Render as divider
}
```

### Features

- Click outside to close
- Overlay backdrop
- Multiple placement options
- Divider support
- Icon support
- Danger state styling
- Disabled state
- Badge support
- Smooth animations

### Example

```jsx
import Menu from './components/ui/Menu';

const menuItems = [
  {
    label: 'My Profile',
    icon: <ProfileIcon />,
    onClick: () => navigate('profile'),
  },
  {
    label: 'Settings',
    icon: <SettingsIcon />,
    onClick: () => navigate('settings'),
  },
  { divider: true },
  {
    label: 'Sign Out',
    icon: <SignOutIcon />,
    onClick: () => handleSignOut(),
    danger: true,
  },
];

<Menu
  trigger={
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <img src="/avatar.jpg" alt="User" />
      <span>John Doe</span>
    </div>
  }
  items={menuItems}
  placement="bottom-right"
/>
```

### Styling

- Uses CSS classes: `menu-wrapper`, `menu-trigger`, `menu-dropdown`, `menu-item`, `menu-item-danger`, `menu-divider`
- Includes `Menu.css` for styling
- Inherits from Theme 1 CSS variables
- Smooth transitions and animations
- Responsive positioning

---

## Toast

A notification toast component for displaying temporary messages with different types (success, error, warning, info).

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `id` | `string \| number` | - | ✅ | Unique identifier |
| `message` | `string` | - | ✅ | Toast message text |
| `type` | `'success' \| 'error' \| 'warning' \| 'info'` | `'info'` | ❌ | Toast type |
| `duration` | `number` | `5000` | ❌ | Auto-close duration in ms (0 = no auto-close) |
| `onClose` | `function` | - | ✅ | Callback when toast is closed |

### Types

- **Success**: Green border, checkmark icon
- **Error**: Red border, error icon
- **Warning**: Yellow/orange border, warning icon
- **Info**: Blue border, info icon (default)

### Features

- Auto-dismiss after duration
- Manual close button
- Slide-in animation
- Type-specific icons and colors
- Accessible close button

### Example

```jsx
import Toast from './components/ui/Toast';

<Toast
  id={1}
  message="Event created successfully!"
  type="success"
  duration={5000}
  onClose={(id) => removeToast(id)}
/>

<Toast
  id={2}
  message="Failed to save changes"
  type="error"
  duration={0}
  onClose={(id) => removeToast(id)}
/>
```

### Styling

- Inline styles with Theme 1 CSS variables
- Slide-in animation from right
- Type-specific border colors
- Shadow and border radius from theme
- Fixed positioning support

---

## ToastContainer

A container component for managing multiple toast notifications. Displays toasts in a stacked layout.

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `toasts` | `array` | - | ❌ | Array of toast objects |
| `onClose` | `function` | - | ✅ | Callback when any toast is closed |

### Toast Object Structure

```javascript
{
  id: string | number,     // Required: Unique identifier
  message: string,          // Required: Toast message
  type: string,            // Optional: 'success', 'error', 'warning', 'info'
  duration: number         // Optional: Auto-close duration in ms
}
```

### Features

- Fixed positioning (top-right)
- Stacked layout with gap
- Auto-manages multiple toasts
- Pointer events handling
- Max width constraint

### Example

```jsx
import ToastContainer from './components/ui/ToastContainer';

const [toasts, setToasts] = useState([]);

const addToast = (message, type = 'info') => {
  const newToast = {
    id: Date.now(),
    message,
    type,
    duration: 5000,
  };
  setToasts([...toasts, newToast]);
};

const removeToast = (id) => {
  setToasts(toasts.filter(t => t.id !== id));
};

<ToastContainer
  toasts={toasts}
  onClose={removeToast}
/>
```

### Usage Pattern

```jsx
// In your component
const [toasts, setToasts] = useState([]);

// Add toast
const showSuccess = (message) => {
  setToasts([...toasts, {
    id: Date.now(),
    message,
    type: 'success',
    duration: 5000,
  }]);
};

// Remove toast
const handleClose = (id) => {
  setToasts(toasts.filter(t => t.id !== id));
};

// Render
return (
  <>
    <YourComponent onAction={showSuccess} />
    <ToastContainer toasts={toasts} onClose={handleClose} />
  </>
);
```

### Styling

- Fixed positioning: top-right corner
- Z-index: 9999
- Flex column layout with gap
- Max width: 400px
- Pointer events management

---

## ExecutionMembers

A comprehensive component for managing execution members (persons and entities) with manual entry, file import (JSON, CSV, Excel), and paste data import.

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `members` | `array` | - | ❌ | Array of member objects (controlled) |
| `setMembers` | `function` | - | ❌ | State setter function (for controlled mode) |

### Member Object Structure

```javascript
{
  id: number | string,
  type: 'person' | 'entity',
  // For person:
  firstName: string,
  lastName: string,
  // For entity:
  name: string,
  offline: boolean,  // Optional: Mark as offline entity
  // Common fields:
  specializedIn: string,
  experience: string,  // e.g., "5-10", "10-20"
  address: string,
  phone: string,
  whatsapp: string,   // Optional
  email: string
}
```

### Features

- **Member Types**: Person and Entity support
- **Manual Entry**: Form-based member creation
- **File Import**: JSON, CSV, Excel file support
- **Paste Import**: Direct JSON/CSV paste
- **Format Validation**: File format and data validation
- **Row-level Validation**: Individual row error reporting
- **Experience Suggestions**: Quick-select buttons (0, 1-5, 5-10, 10-20, 20+)
- **Offline Entities**: Mark entities as offline (tasks updated by Crew Admin)
- **WhatsApp Optional**: Optional WhatsApp field with "use phone" option
- **Member Cards**: Grid display with edit/delete actions
- **Empty State**: Helpful empty state with action button

### Import Formats

#### JSON Format
```json
[
  {
    "type": "person",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "specializedIn": "Project Management",
    "experience": "5-10",
    "address": "123 Main St"
  },
  {
    "type": "entity",
    "name": "Acme Corporation",
    "email": "contact@acme.com",
    "offline": true
  }
]
```

#### CSV/Excel Format
```csv
Type,First Name,Last Name,Name,Email,Phone,Specialized In,Experience,Offline
person,John,Doe,,john@example.com,+1234567890,Project Management,5-10,
entity,,,Acme Corp,contact@acme.com,+1234567891,Logistics,10-20,true
```

### Validation

- **Type Validation**: Must be "person" or "entity"
- **Required Fields**: 
  - Person: firstName, lastName, email
  - Entity: name, email
- **Email Format**: Valid email format validation
- **Phone Format**: Basic phone format validation
- **File Size**: Max 10MB limit
- **File Format**: JSON, CSV, XLSX, XLS only

### Example

```jsx
import ExecutionMembers from './components/members/ExecutionMembers';

const [members, setMembers] = useState([
  {
    id: 1,
    type: 'person',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    specializedIn: 'Event Planning',
    experience: '5-10',
  },
]);

<ExecutionMembers
  members={members}
  setMembers={setMembers}
/>
```

### Form Fields

**Person Type:**
- First Name (required)
- Last Name (required)
- Specialized In
- Experience (with suggestions)
- Address
- Phone
- WhatsApp (optional, can use phone)
- Email (required)

**Entity Type:**
- Entity Name (required)
- Offline Entity (checkbox)
- Specialized In
- Experience (with suggestions)
- Address
- Phone
- WhatsApp (optional)
- Email (required)

### Member Card Display

Each member card shows:
- Type badge (Person/Entity)
- Name (full name for person, entity name for entity)
- Offline badge (if entity is offline)
- Specialized In
- Experience
- Contact information (address, phone, WhatsApp, email)
- Edit and Delete buttons

### Styling

- Uses Theme 1 CSS variables
- Responsive grid layout for member cards
- Card-based design with hover effects
- Form styling with grid layouts
- Import section with file upload area
- Format examples display

---

## Theme System

All components use CSS variables from Theme 1 (Modern Gradient theme) for consistent styling.

### CSS Variables

```css
/* Gradients */
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
--accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

/* Colors */
--primary-color: #667eea;
--primary-hover: #5568d3;
--secondary-color: #764ba2;
--accent-color: #f093fb;

/* Backgrounds */
--bg-primary: #ffffff;
--bg-secondary: #f8fafc;
--bg-tertiary: #f1f5f9;

/* Text Colors */
--text-primary: #1e293b;
--text-secondary: #64748b;
--text-light: #94a3b8;

/* Borders & Shadows */
--border-color: #e2e8f0;
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

/* Border Radius */
--radius-sm: 0.375rem;
--radius-md: 0.5rem;
--radius-lg: 0.75rem;
--radius-xl: 1rem;

/* Status Colors */
--error: #ef4444;
--success: #10b981;
--warning: #f59e0b;
--info: #3b82f6;
```

### Applying Theme

All components automatically use Theme 1 when wrapped in a container with the `theme-1` class:

```jsx
<div className="theme-1">
  <Button>Click Me</Button>
  <Card>Content</Card>
</div>
```

---

## Usage Examples

### Complete Form Example

```jsx
import React, { useState } from 'react';
import Card from './components/ui/Card';
import Input from './components/ui/Input';
import Button from './components/ui/Button';
import Modal from './components/ui/Modal';

const EventForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = () => {
    // Validation logic
    if (!formData.name) {
      setErrors({ name: 'Name is required' });
      return;
    }
    // Submit logic
    setIsOpen(false);
  };

  return (
    <div className="theme-1">
      <Card>
        <h2>Create Event</h2>
        <Input
          type="text"
          label="Event Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          required
        />
        <Input
          type="email"
          label="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
        />
        <Input
          type="textarea"
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </Card>
    </div>
  );
};
```

### Tabbed Interface Example

```jsx
import React, { useState } from 'react';
import Tabs from './components/ui/Tabs';
import Card from './components/ui/Card';
import EmptyState from './components/ui/EmptyState';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('events');

  const tabs = [
    { id: 'events', label: 'Events' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'members', label: 'Members' },
  ];

  return (
    <div className="theme-1">
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <Card>
        {activeTab === 'events' && (
          <EmptyState
            icon="📅"
            title="No events"
            description="Create your first event"
            actionLabel="Create Event"
            onAction={() => console.log('Create event')}
          />
        )}
        {activeTab === 'tasks' && <TasksList />}
        {activeTab === 'members' && <MembersList />}
      </Card>
    </div>
  );
};
```

### Statistics Dashboard Example

```jsx
import React from 'react';
import StatCard from './components/ui/StatCard';
import Card from './components/ui/Card';

const Dashboard = ({ stats }) => {
  return (
    <div className="theme-1">
      <div className="grid-layout">
        <StatCard
          label="Total Events"
          value={stats.events}
          icon={<span>📅</span>}
        />
        <StatCard
          label="Active Tasks"
          value={stats.tasks}
          icon={<span>✅</span>}
        />
        <StatCard
          label="Team Members"
          value={stats.members}
          icon={<span>👥</span>}
        />
      </div>
    </div>
  );
};
```

### Event Management Example

```jsx
import React, { useState } from 'react';
import EventList from './components/events/EventList';
import EventWizard from './components/events/EventWizard';
import Button from './components/ui/Button';

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [showWizard, setShowWizard] = useState(false);

  const handleEventComplete = (eventData) => {
    setEvents([...events, { ...eventData, id: Date.now() }]);
    setShowWizard(false);
  };

  const handleEdit = (event) => {
    console.log('Edit event:', event);
  };

  const handleDelete = (event) => {
    setEvents(events.filter(e => e.id !== event.id));
  };

  return (
    <div className="theme-1">
      {showWizard ? (
        <EventWizard
          onComplete={handleEventComplete}
          onCancel={() => setShowWizard(false)}
        />
      ) : (
        <EventList
          events={events}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreateNew={() => setShowWizard(true)}
        />
      )}
    </div>
  );
};
```

### Schedule Management Example

```jsx
import React, { useState } from 'react';
import ScheduleList from './components/schedule/ScheduleList';
import CreateScheduleForm from './components/schedule/CreateScheduleForm';
import Modal from './components/ui/Modal';

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const handleCreate = (formData) => {
    setSchedules([...schedules, { ...formData, id: Date.now() }]);
    setShowForm(false);
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setShowForm(true);
  };

  const handleReorder = (newSchedules) => {
    setSchedules(newSchedules);
  };

  return (
    <div className="theme-1">
      <ScheduleList
        schedules={schedules}
        onEdit={handleEdit}
        onCreateNew={() => {
          setEditingSchedule(null);
          setShowForm(true);
        }}
        onReorder={handleReorder}
      />
      
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingSchedule(null);
        }}
        title={editingSchedule ? 'Edit Schedule' : 'Create Schedule'}
      >
        <CreateScheduleForm
          onSubmit={handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingSchedule(null);
          }}
          initialData={editingSchedule || {}}
        />
      </Modal>
    </div>
  );
};
```

### Event Wizard with Schedule Table Example

```jsx
import React, { useState } from 'react';
import EventWizard from './components/events/EventWizard';

const CreateEventPage = () => {
  const [showWizard, setShowWizard] = useState(false);

  const handleComplete = (eventData) => {
    console.log('Event created with data:', eventData);
    // The eventData includes:
    // - eventDetails (from step 1)
    // - scheduledTasks (from step 4 - Arrive Schedule)
    // - Other step data when implemented
    setShowWizard(false);
  };

  return (
    <div className="theme-1">
      {showWizard && (
        <EventWizard
          onComplete={handleComplete}
          onCancel={() => setShowWizard(false)}
        />
      )}
      <button onClick={() => setShowWizard(true)}>
        Create New Event
      </button>
    </div>
  );
};
```

---

## Best Practices

1. **Always wrap components in `theme-1` class** for proper styling
2. **Use controlled components** for inputs (value + onChange)
3. **Provide proper labels** for accessibility
4. **Handle errors** with the error prop in Input components
5. **Use appropriate variants** for visual hierarchy
6. **Keep modal content concise** for better UX
7. **Use EmptyState** when lists are empty
8. **Group related stats** using grid-layout with StatCard
9. **Handle drag-and-drop reordering** in ScheduleList and ScheduleTable with proper state management
10. **Validate form data** before submission in CreateEventForm and CreateScheduleForm
11. **Use EventWizard** for multi-step event creation workflows
12. **Display status badges** appropriately based on date calculations in EventList
13. **Format dates consistently** using the built-in formatting functions
14. **Handle empty states** in all list components (EventList, ScheduleList)
15. **Provide callback functions** for all interactive actions (onEdit, onDelete, onCreateNew)

---

## Accessibility

All components follow accessibility best practices:

- Proper label-input associations
- ARIA labels where needed
- Keyboard navigation support
- Focus states
- Semantic HTML elements
- Screen reader friendly

---

## Responsive Design

All components are fully responsive:

- **Desktop**: Full width and spacing
- **Tablet** (≤1200px): Adjusted spacing and font sizes
- **Mobile** (≤768px): Stacked layouts, card views
- **Small Mobile** (≤480px): Compact spacing, full-width modals

---

## File Structure

```
frontend_v2/src/
├── components/
│   ├── ui/
│   │   ├── Button.js
│   │   ├── Card.js
│   │   ├── Modal.js
│   │   ├── Input.js
│   │   ├── Badge.js
│   │   ├── Tabs.js
│   │   ├── EmptyState.js
│   │   ├── StatCard.js
│   │   ├── Header.js
│   │   ├── Header.css
│   │   ├── Menu.js
│   │   ├── Menu.css
│   │   ├── Toast.js
│   │   └── ToastContainer.js
│   ├── events/
│   │   ├── EventWizard.js
│   │   ├── EventList.js
│   │   ├── CreateEventForm.js
│   │   ├── ScheduleTable.js
│   │   └── ScheduleTable.css
│   ├── schedule/
│   │   ├── ScheduleList.js
│   │   └── CreateScheduleForm.js
│   └── members/
│       └── ExecutionMembers.js
├── pages/
│   ├── EventsPage.js
│   ├── CreateEventPage.js
│   ├── CoreMembersPage.js
│   ├── TemplatesPage.js
│   ├── TemplatesPage.css
│   ├── MyTasksPage.js
│   ├── SchedulePage.js
│   ├── EventManagement.js
│   └── Playground.js
├── themes/
│   ├── Theme1.css
│   ├── Theme2.css
│   └── Theme3.css
└── ...
```

---

## Version

**Version**: 2.1.0  
**Last Updated**: 2025-01-27  
**Theme**: Modern Gradient (Theme 1)

### Changelog

**v2.1.0** (2025-01-27)
- Added Header component documentation
- Added Menu component documentation
- Added Toast component documentation
- Added ToastContainer component documentation
- Added ExecutionMembers component documentation
- Updated file structure to include all new components and pages
- Added comprehensive examples for new components
- Expanded best practices section

**v2.0.0** (2025-01-27)
- Added EventWizard component documentation
- Added EventList component documentation
- Added CreateEventForm component documentation
- Added ScheduleList component documentation
- Added ScheduleTable component documentation (used in Arrive Schedule step)
- Added CreateScheduleForm component documentation
- Updated file structure to include all components
- Added comprehensive usage examples for new components
- Expanded best practices section

**v1.0.0** (2025-01-17)
- Initial documentation for UI components (Button, Card, Modal, Input, Badge, Tabs, EmptyState, StatCard)

