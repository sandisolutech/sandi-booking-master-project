# Booking Registration Page - Test Suite

This directory contains comprehensive test cases for the booking registration page functionality. The tests are organized into different categories to ensure thorough coverage of all features.

## Test Structure

### 1. Business Logic Tests (`booking-logic.test.ts`)
Tests core business logic functions that can be extracted and tested independently:
- **Date Validation Logic**: Tests for valid date ranges (today to +30 days)
- **Form Validation Logic**: Tests for required field validation, email/phone validation
- **Booking Submission Logic**: Tests for data preparation and validation
- **UI State Logic**: Tests for submit button enable/disable logic
- **Data Filtering Logic**: Tests for filtering active rooms and time slots
- **Link Validation Logic**: Tests for booking link validity checks
- **Error Message Logic**: Tests for appropriate error message generation

### 2. Form Components Tests (`form-components.test.ts`)
Tests individual form component behaviors:
- **Room Selection Component**: Tests room selection and highlighting logic
- **Time Slot Selection Component**: Tests time slot selection and formatting
- **Custom Field Component**: Tests custom field validation (text, email, phone)
- **Company Selection Component**: Tests linked vs. selectable company logic
- **Terms and Conditions Component**: Tests terms agreement validation
- **Date Picker Component**: Tests date selection and disabled date logic
- **Form Submission Component**: Tests submission states and button text
- **LINE Integration Component**: Tests LIFF button states and messaging

### 3. API Actions Tests (`api-actions.test.ts`)
Tests server action functions and their expected behaviors:
- **createBooking Action**: Tests booking creation with validation
- **getBookingLinkByUuid Action**: Tests booking link retrieval
- **isOneTimeLinkUsed Action**: Tests one-time link usage checking
- **incrementClickCount Action**: Tests click count tracking
- **getAllRooms Action**: Tests room data retrieval
- **getAllTimeRounds Action**: Tests time round data retrieval
- **getActiveCustomFields Action**: Tests custom field retrieval
- **Error Handling**: Tests graceful error handling

### 4. LINE Integration Tests (`line-integration.test.ts`)
Tests all LINE login scenarios and platform compatibility:
- **LINE Client Detection**: Tests detection of LINE app vs. web browser
- **LINE Login State Management**: Tests logged in, not logged in, and loading states
- **Registration Form Access**: Ensures registration is available in all LINE states
- **Booking Submission with LINE**: Tests booking creation across LINE scenarios
- **LINE Message Integration**: Tests message sending capabilities
- **UI Elements by LINE State**: Tests UI visibility based on login status
- **Cross-Platform Compatibility**: Tests from desktop, mobile, and LINE app
- **Route Access**: Ensures registration works from all routes regardless of LINE state

### 5. Integration Tests (`booking-integration.test.ts`)
Tests integration between different parts of the system:
- **Server Actions Integration**: Verifies correct server function calls
- **Data Validation Tests**: Tests data structure validation
- **Error Handling Tests**: Tests error scenarios (invalid links, etc.)
- **Business Logic Tests**: Tests complex business rules
- **Form Submission Logic Tests**: Tests end-to-end form submission
- **Date Validation Tests**: Tests date range validation rules

### 6. Simple Component Tests (`booking-page-simple.test.tsx`)
Basic React component rendering tests:
- **Page Rendering**: Tests basic page structure rendering
- **Form Interactions**: Tests user interactions with form elements
- **Accessibility**: Tests proper labels, roles, and ARIA attributes
- **Form Validation**: Tests client-side validation indicators

## Test Categories

### LINE Integration Testing
- ✅ LINE client detection (in app vs browser)
- ✅ LINE login state management (logged in, not logged in, loading)
- ✅ Registration availability in all LINE states
- ✅ Cross-platform compatibility (desktop, mobile, LINE app)
- ✅ UI element visibility based on LINE state
- ✅ Message sending capabilities
- ✅ Route access regardless of LINE login status
- ✅ Enhanced features when logged in (profile prefill, message confirmation)

### Functional Testing
- ✅ Form field validation
- ✅ Date range validation
- ✅ Room and time slot selection
- ✅ Custom field handling
- ✅ Terms and conditions agreement
- ✅ Company selection logic
- ✅ Booking submission workflow

### Integration Testing
- ✅ Server action integration
- ✅ Data flow between components
- ✅ Error handling across the application
- ✅ State management validation

### UI/UX Testing
- ✅ Form accessibility
- ✅ Button states and interactions
- ✅ Loading states
- ✅ Error message display
- ✅ Mobile responsiveness considerations

### Business Logic Testing
- ✅ Booking link validation
- ✅ One-time link usage tracking
- ✅ Date availability rules
- ✅ Required field enforcement
- ✅ Company linking logic

### Error Handling Testing
- ✅ Invalid booking links
- ✅ Expired links
- ✅ Used one-time links
- ✅ Network errors
- ✅ Validation errors

## Running Tests

### Run All Tests
\`\`\`bash
pnpm test
\`\`\`

### Run Tests in Watch Mode
\`\`\`bash
pnpm test:watch
\`\`\`

### Run Tests with Coverage
\`\`\`bash
pnpm test:coverage
\`\`\`

### Run Specific Test Files
\`\`\`bash
pnpm test booking-logic
pnpm test form-components
pnpm test api-actions
pnpm test booking-integration
\`\`\`

## Test Data

The tests use mock data that represents realistic booking scenarios:

### Sample Booking Link
- Valid active normal link
- Inactive link
- One-time link (used/unused)

### Sample Rooms
- Meeting Room A (6 capacity, basic equipment)
- Conference Room B (12 capacity, advanced equipment)
- Disabled rooms for testing filtering

### Sample Time Rounds
- Morning (09:00 - 12:00)
- Afternoon (13:00 - 17:00)
- Evening (18:00 - 21:00, inactive)

### Sample Custom Fields
- Full Name (text, required)
- Email (email, required with validation)
- Phone (phone, optional with validation)
- Department (select, with predefined options)

### Sample Companies
- Test Company (linked)
- Multiple companies for selection

## Test Coverage Goals

- **Business Logic**: 100% coverage of pure functions
- **Component Behavior**: All user interactions tested
- **API Integration**: All server actions tested
- **Error Scenarios**: All error paths covered
- **Accessibility**: WCAG compliance verified
- **Mobile Compatibility**: Touch interactions tested

## Continuous Integration

These tests are designed to run in CI/CD pipelines with:
- Fast execution time
- Reliable test data
- Clear error reporting
- Coverage metrics
- No external dependencies

## Best Practices Used

1. **Isolation**: Each test is independent and can run in any order
2. **Clarity**: Test names clearly describe what is being tested
3. **Maintainability**: Tests use shared mock data and helper functions
4. **Coverage**: Both happy path and error scenarios are covered
5. **Performance**: Tests run quickly without unnecessary complexity
6. **Real-world Scenarios**: Test data reflects actual usage patterns

## Future Enhancements

- Add performance testing for large datasets
- Add visual regression testing
- Add end-to-end testing with Playwright
- Add load testing for concurrent booking scenarios
- Add internationalization testing for multiple languages
