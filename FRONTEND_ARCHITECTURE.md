# Frontend Architecture Documentation

## 1. Introduction

This document describes the technical architecture of the frontend application, focusing on layer separation, responsibilities, and key architectural decisions. It provides a high-level overview of the system's structure and design principles.

### Technology Stack

- **React**: 18.2.0
- **Build Tool**: react-scripts 5.0.1 (Create React App)
- **HTTP Client**: Axios 1.6.0 (prepared for API integration)
- **Utilities**: XLSX 0.18.5 (for Excel import/export functionality)

### Architecture Pattern

The application follows a **Layered Architecture** pattern with clear separation of concerns across four primary layers:

1. **Presentation Layer** - UI components and rendering
2. **Business Logic Layer** - Application logic and state management
3. **Data/Service Layer** - API communication and data operations
4. **Infrastructure Layer** - Application foundation, routing, and theming

This layered approach enables maintainability, testability, and allows for future enhancements without major refactoring.

---

## 2. Layer Architecture

### 2.1 Presentation Layer

**Location**: 
- `src/pages/` - Page-level components (EventsPage, EventManagement, Playground, SchedulePage, CreateEventPage, CoreMembersPage, TemplatesPage, MyTasksPage)
- `src/components/ui/` - Reusable UI primitives (Button, Card, Modal, Input, Badge, Tabs, EmptyState, StatCard, Toast, ToastContainer, Header, Menu)
- `src/components/events/` - Event domain components (EventList, EventWizard, CreateEventForm, ScheduleTable)
- `src/components/schedule/` - Schedule domain components (ScheduleList, CreateScheduleForm)
- `src/components/members/` - Member management components (ExecutionMembers)

**Responsibilities**:
- Rendering UI and handling user interactions
- Component composition and layout management
- Visual presentation and styling
- Theme application and consistency

**Key Patterns**:
- **Component Composition**: UI primitives are composed into feature components, which are then used in page components
- **Props-based Communication**: Unidirectional data flow from parent to child components via props
- **Separation of Concerns**: Clear distinction between UI primitives (reusable) and domain components (feature-specific)
- **Presentational Components**: Components focus on presentation with minimal business logic

**Design Principles**:
- All components are built using React.js with custom implementation
- No external UI framework dependencies (Material-UI, Ant Design, etc. are explicitly excluded)
- Components follow consistent prop interfaces and styling patterns
- Theme-aware components that adapt to CSS variable-based theming system

---

### 2.2 Business Logic Layer

**Location**: 
- `src/hooks/` - Custom React hooks (useToast for notification state management)
- `src/contexts/` - React Context providers (NavigationContext - prepared but minimal usage)
- Business logic embedded within page and feature components

**Responsibilities**:
- Application state management (currently local component state)
- Business rules and validation logic
- Event handling and user interaction logic
- Reusable logic extraction via custom hooks

**Key Patterns**:
- **Custom Hooks**: Reusable logic extracted into custom hooks (e.g., useToast for notification management)
- **Local State Management**: Component-level state using useState/useReducer hooks
- **Context API**: Prepared for cross-cutting concerns (NavigationContext exists but routing handled in App.js)
- **Co-located Logic**: Business logic is currently co-located with components (no separate business logic layer yet)

**Current State**:
- State management is primarily local to components
- Custom hooks pattern established for shared logic
- Context API infrastructure prepared but not extensively used
- No global state management library (Redux, Zustand, etc.) currently implemented

---

### 2.3 Data/Service Layer

**Location**: `src/services/` (directory exists but currently empty)

**Responsibilities** (Future):
- API communication and HTTP request handling
- Data transformation and normalization
- Error handling for external data operations
- Caching and data persistence strategies

**Current State**: 
- Services directory structure is prepared but not yet implemented
- Axios dependency is installed and ready for use
- Proxy configured in `package.json` pointing to `http://localhost:8000`
- Data is currently managed entirely in local component state
- No API integration yet - application operates with mock/local data

**Future Implementation**:
- API client abstraction layer
- Request/response interceptors
- Centralized error handling patterns
- Data caching strategies
- Request cancellation and retry logic

---

### 2.4 Infrastructure Layer

**Location**: 
- `src/themes/` - Theme definitions (Theme1.css, Theme2.css, Theme3.css)
- `src/index.js` - Application entry point
- `src/App.js` - Root component with routing logic
- `src/App.css`, `src/index.css` - Global styles
- Build configuration (`package.json`, react-scripts)

**Responsibilities**:
- Application initialization and bootstrap
- Routing and navigation (state-based routing in App.js)
- Theme system management (CSS variable-based)
- Build, bundling, and deployment configuration
- Global styling and CSS architecture

**Key Decisions**:
- **CSS Variable-based Theming**: Three themes (Theme1, Theme2, Theme3) using CSS custom properties for consistent styling
- **Simple State-based Routing**: No React Router - uses conditional rendering in App.js based on state
- **Create React App**: Zero-config build tooling for rapid development
- **CSS Architecture**: Semantic class names with theme-aware CSS variables
- **Proxy Configuration**: Development proxy configured for seamless API communication

**Theme System**:
- Themes defined using CSS custom properties (variables)
- Consistent variable naming across themes (--primary-color, --bg-primary, etc.)
- Theme switching via CSS class application
- Supports multiple themes simultaneously

---

## 3. Layer Interactions & Data Flow

### Dependency Direction

The layers follow a strict dependency hierarchy:

```
Presentation Layer
    ↓ depends on
Business Logic Layer
    ↓ depends on
Data/Service Layer
    ↑ supports all layers
Infrastructure Layer
```

### Communication Patterns

1. **Props Drilling**: Component communication primarily through props passed from parent to child
2. **Custom Hooks**: Shared logic accessed via custom hooks (e.g., useToast)
3. **Context API**: Prepared for cross-cutting concerns (NavigationContext available but routing handled directly)
4. **Direct Function Calls**: Navigation handled via function props (navigate prop passed to pages)

### Data Flow

- **Unidirectional**: Data flows from parent to child components via props
- **State Updates**: State changes triggered by callbacks passed as props
- **Local State**: State management occurs at component level using React hooks
- **No Global State**: Currently no global state management - all state is local to components

---

## 4. Key Architectural Decisions

### 4.1 Layered Architecture Choice

**Decision**: Implement layered architecture with clear separation between presentation, business logic, and data concerns.

**Rationale**:
- Enables maintainability through clear boundaries
- Improves testability by isolating concerns
- Allows for future service layer implementation without major refactoring
- Supports team collaboration through clear module boundaries

**Trade-offs**:
- Some business logic currently co-located with components (acceptable for current scale)
- Service layer prepared but not yet implemented (allows incremental adoption)

---

### 4.2 State Management Strategy

**Current Approach**: Local component state with React hooks (useState, useReducer)

**Rationale**:
- Sufficient for current application scope and complexity
- No external dependencies required
- Simple and straightforward for team to understand
- Aligns with React's recommended patterns

**Future Consideration**: 
- May need global state management solution (Redux, Zustand, Context API expansion) if:
  - Application complexity increases significantly
  - Shared state across many components becomes necessary
  - Performance optimization requires centralized state

---

### 4.3 Routing Strategy

**Current Approach**: State-based routing in App.js with conditional rendering

**Implementation**: 
- Single state variable (`currentPage`) in App.js
- Conditional rendering based on state value
- Navigation via `navigate` function prop passed to pages

**Rationale**:
- Simple and lightweight - no external dependencies
- Sufficient for current navigation requirements
- Easy to understand and maintain
- No URL-based routing overhead

**Trade-offs**:
- Less feature-rich than React Router (no URL-based routing, no browser history integration)
- No deep linking or bookmarking support
- Acceptable trade-off for current application needs

**Future Consideration**: 
- Consider React Router if navigation requirements grow
- URL-based routing for bookmarking and deep linking
- Browser history integration

---

### 4.4 Theming Approach

**Decision**: CSS variable-based theming with semantic class names

**Implementation**:
- Three themes defined (Theme1: Modern Gradient, Theme2: Professional Corporate, Theme3: Minimalist Dark)
- CSS custom properties (variables) for all theme values
- Theme switching via CSS class application
- Consistent variable naming across themes

**Rationale**:
- **Performance**: No runtime CSS-in-JS overhead
- **Maintainability**: Easy to update theme values in one place
- **Scalability**: Simple to add new themes
- **Flexibility**: Supports multiple themes simultaneously
- **Browser Support**: Native CSS features, no JavaScript required for theming

**Alternative Considered**: CSS-in-JS (styled-components, emotion) - rejected due to runtime overhead and complexity

---

### 4.5 Component Organization

**Decision**: Hybrid approach - type-based for UI primitives, feature-based for domain components

**Structure**:
- `components/ui/` - Type-based organization (all UI primitives together)
- `components/events/` - Feature-based organization (event-related components)
- `components/schedule/` - Feature-based organization (schedule-related components)
- `components/members/` - Feature-based organization (member-related components)

**Rationale**:
- **UI Primitives**: Type-based organization makes it easy to find reusable components
- **Domain Components**: Feature-based organization groups related functionality together
- **Balance**: Provides both reusability (UI) and domain clarity (features)

---

### 4.6 Build Tooling

**Decision**: Create React App (react-scripts)

**Rationale**:
- Zero-configuration setup
- Industry standard and well-maintained
- Handles webpack, Babel, ESLint configuration automatically
- Easy to upgrade and maintain
- Sufficient for current application needs

**Future Consideration**: 
- May need to eject or migrate to custom webpack config if advanced features required
- Code splitting and lazy loading can be added without ejecting

---

### 4.7 UI Framework Decision (LOCKED)

**Decision**: Custom React component library - **NO external UI frameworks**

**Explicitly Excluded**:
- Material-UI (MUI)
- Ant Design
- Chakra UI
- Tailwind CSS
- Any other external UI framework or component library

**Rationale**:
- **Full Design Control**: Complete ownership of component design and behavior
- **Custom Theming**: Existing CSS variable-based theming system works seamlessly
- **No Dependencies**: Avoids external framework dependencies and bundle size overhead
- **Component Ownership**: All components already built and working
- **Flexibility**: Easy to customize and extend without framework constraints

**Current State**: 
- Complete custom component library implemented
- All UI primitives built in-house
- Components documented and tested
- Theming system fully integrated

**This is a locked architectural decision** - external UI frameworks will not be adopted.

---

### 4.8 Internationalization (i18n) Readiness (REQUIREMENT)

**Requirement**: All user-facing text must be externalized

**Rationale**:
- **Localization Support**: Enables future multi-language support without major refactoring
- **Centralized Management**: All text in one place for easier updates and consistency
- **Maintenance**: Easier to maintain and update terminology
- **i18n Library Ready**: Prepared for integration with i18n libraries (react-i18next, etc.)

**Implementation Approach**:
- Create centralized labels/strings configuration file or module
- Organize labels by feature/domain for better organization
- All hardcoded text in components should reference externalized labels
- Structure should be ready for future i18n library integration

**Current State**: 
- Labels are currently hardcoded in components
- **Needs refactoring** to externalize all user-facing text
- Infrastructure prepared but not yet implemented

**Future Implementation**:
- Integrate i18n library (react-i18next recommended)
- Create translation files structure
- Implement label externalization across all components
- Support for multiple languages

**This is a required architectural standard** - all new components must externalize labels.

---

## 5. Technology Stack

### Core Dependencies

- **React**: 18.2.0 - UI library and component framework
- **react-dom**: 18.2.0 - React DOM rendering
- **react-scripts**: 5.0.1 - Build tooling and development server

### Supporting Libraries

- **axios**: 1.6.0 - HTTP client (prepared for API integration)
- **xlsx**: 0.18.5 - Excel file import/export functionality

### Development Tools

- **ESLint**: Configured via react-scripts
- **Babel**: Configured via react-scripts
- **Webpack**: Configured via react-scripts

### Build Configuration

- **Proxy**: Configured to `http://localhost:8000` for API communication
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari latest versions)

---

## 6. Current Architecture State

### Maturity Level

**Early Stage** - Core architecture structure is in place, but several layers are not yet fully implemented.

### Implementation Status

- ✅ **Presentation Layer**: Fully implemented with custom component library
- ✅ **Infrastructure Layer**: Fully implemented (routing, theming, build)
- ⚠️ **Business Logic Layer**: Partially implemented (custom hooks, but logic co-located with components)
- ⚠️ **Data/Service Layer**: Prepared but not implemented (directory exists, axios ready)
- ⚠️ **i18n Readiness**: Requirement defined but not yet implemented (labels need externalization)

### Current Limitations

1. **Service Layer**: Not yet implemented - all data in local component state
2. **API Integration**: No API calls currently - application uses mock/local data
3. **Global State**: No global state management - all state is local
4. **Label Externalization**: Labels are hardcoded - needs refactoring for i18n
5. **Routing**: Basic state-based routing - no URL routing or browser history

### Strengths

1. **Component Library**: Complete custom component library with full design control
2. **Theming System**: Robust CSS variable-based theming with multiple themes
3. **Layer Structure**: Clear layer separation prepared for future growth
4. **Build System**: Stable and well-configured build tooling

---

## 7. Future Architectural Considerations

### Service Layer Implementation

**Priority**: High

**Considerations**:
- API client abstraction layer
- Request/response interceptors for authentication, error handling
- Centralized error handling patterns
- Data caching strategies
- Request cancellation and retry logic

### State Management Evolution

**Priority**: Medium

**Considerations**:
- Evaluate global state solution if complexity increases
- Options: Context API expansion, Redux, Zustand, Jotai
- Consider state management library if shared state becomes complex
- Performance optimization through centralized state

### Routing Enhancement

**Priority**: Low (current solution sufficient)

**Considerations**:
- React Router integration if URL-based routing needed
- Browser history integration
- Deep linking and bookmarking support
- Route-based code splitting

### Internationalization Implementation

**Priority**: High (architectural requirement)

**Considerations**:
- Integrate i18n library (react-i18next recommended)
- Implement label externalization across all components
- Create translation files structure
- Support for multiple languages
- Language detection and switching

### Performance Optimization

**Priority**: Medium

**Considerations**:
- Code splitting and lazy loading for routes/components
- Memoization strategies (React.memo, useMemo, useCallback)
- Bundle size optimization
- Image optimization and lazy loading
- Virtual scrolling for large lists

### Testing Strategy

**Priority**: Medium

**Considerations**:
- Unit testing for components and hooks
- Integration testing for feature workflows
- E2E testing for critical user paths
- Testing framework selection (Jest, React Testing Library, Cypress)

---

## 8. Architectural Standards & Guidelines

### Component Development

- All UI components must be built using React.js
- No external UI framework dependencies
- Components must use CSS variables for theming
- Components must be documented with PropTypes
- Components should follow consistent prop interfaces

### Label Externalization

- **Requirement**: All user-facing text must be externalized
- Labels should be organized by feature/domain
- Centralized labels configuration
- Ready for i18n library integration

### Code Organization

- Follow established layer structure
- Feature-based organization for domain components
- Type-based organization for UI primitives
- Clear separation of concerns

### Styling Standards

- Use CSS variables for all theme values
- Semantic class names
- Responsive design patterns
- Consistent spacing and typography

---

## Conclusion

This architecture provides a solid foundation for the frontend application with clear layer separation, custom component library, and preparation for future enhancements. The locked decisions (custom components, i18n-ready labels) ensure consistency and maintainability as the application grows.

The architecture is designed to be:
- **Maintainable**: Clear layer separation and organization
- **Scalable**: Prepared for service layer, global state, and i18n
- **Flexible**: Allows incremental adoption of new patterns
- **Controlled**: Full ownership of components and design decisions

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-27  
**Maintained By**: Development Team

