# 🧪 Cypress E2E Test Suite - School Project Wizard

This directory contains comprehensive end-to-end tests for the School Project Creation Wizard in OceanLearn.

## 📁 Test Structure

```
cypress/
├── e2e/
│   ├── school-wizard-core.cy.ts        # Steps 1-6 (Core form flow)
│   ├── school-wizard-uploads.cy.ts     # Steps 7-12 (Uploads & AI)
│   ├── school-wizard-negative.cy.ts    # Error handling & edge cases
│   └── school-wizard-complete.cy.ts    # Complete E2E flow
├── fixtures/
│   ├── syllabus-small.pdf             # Small test PDF (17 bytes)
│   ├── syllabus-large.pdf             # Large test PDF (429KB)
│   ├── syllabus-extraction.json       # Mock AI extraction response
│   ├── project-creation-response.json # Mock project creation response
│   └── projects-v2.json              # Mock projects list
└── support/
    └── commands.ts                    # Custom Cypress commands
```

## 🚀 Quick Start

### Prerequisites
- OceanLearn website running on `http://localhost:3000`
- Backend API running on `http://localhost:8000`
- Test user account: `test@example.com` / `testpass123`

### Running Tests

```bash
# Run all wizard tests
cd frontend
npm run cypress:run

# Run specific test file
npm run cypress:run -- --spec "cypress/e2e/school-wizard-core.cy.ts"

# Open Cypress UI
npm run cypress:open

# Run tests in parallel (CI mode)
npm run cypress:run -- --parallel --record
```

## 🧪 Test Categories

### 1. Core Flow Tests (`school-wizard-core.cy.ts`)
**Duration**: ~2-3 minutes
- **Steps 1-6**: Project name, purpose, education level, syllabus upload, review, course content
- **Focus**: Basic form functionality, validation, navigation
- **Performance**: Fast execution, minimal file uploads

### 2. Upload & AI Tests (`school-wizard-uploads.cy.ts`)
**Duration**: ~3-4 minutes
- **Steps 7-12**: Test materials, learning preferences, timeline, goals, frequency, collaboration
- **Focus**: File uploads, AI analysis, complex form interactions
- **Performance**: Includes large file uploads, AI processing simulation

### 3. Negative Scenarios (`school-wizard-negative.cy.ts`)
**Duration**: ~2-3 minutes
- **Focus**: Error handling, network failures, validation errors
- **Coverage**: Network timeouts, file upload errors, authentication issues
- **Recovery**: Retry mechanisms, fallback options

### 4. Complete E2E (`school-wizard-complete.cy.ts`)
**Duration**: ~4-5 minutes
- **Focus**: Full wizard flow, data persistence, accessibility
- **Features**: Screenshots, performance tracking, accessibility testing
- **Use Case**: Integration testing, regression testing

## 🎯 Test Features

### ✅ **Comprehensive Coverage**
- **12-step wizard flow** with all variations
- **File upload scenarios** (small, large, multiple, invalid)
- **AI analysis integration** with mock responses
- **Error handling** for network, validation, and browser issues
- **Accessibility testing** with axe-core
- **Performance monitoring** with Web Performance API

### 🔧 **Smart Mocking Strategy**
- **Fixture-based responses** for consistent testing
- **Network error simulation** for resilience testing
- **File upload mocking** for fast execution
- **Authentication handling** with JWT tokens

### 📊 **Performance & Observability**
- **Execution time tracking** for each major step
- **AI analysis performance** monitoring
- **File upload timing** measurements
- **Memory usage** tracking (where applicable)

### 🎨 **Visual Regression Testing**
- **Screenshots at key steps** for visual comparison
- **Responsive design testing** across viewport sizes
- **UI state validation** for each wizard step

## 🛠 Custom Commands

The test suite includes custom Cypress commands for common wizard interactions:

```typescript
// Navigation
cy.startSchoolProjectCreation()
cy.goToNextStep()
cy.goToPreviousStep()

// Form interactions
cy.fillProjectName('Project Name')
cy.selectPurpose('good-grades')
cy.selectEducationLevel('university')
cy.setGoal('Study goal description')

// File uploads
cy.uploadSyllabus('filename.pdf')
cy.uploadCourseContent(['file1.pdf', 'file2.pdf'])
cy.uploadTestMaterials(['test1.pdf'])

// AI interactions
cy.waitForAIAnalysis()
cy.confirmExtractedInfo()

// Validation
cy.verifyProjectCreated()
```

## 🔍 Debugging Tips

### Common Issues
1. **Hydration Errors**: Tests handle Next.js hydration gracefully
2. **File Upload Timeouts**: Large files have extended timeouts (30s)
3. **Network Delays**: AI analysis includes realistic delays
4. **Authentication**: Tests automatically handle login/logout

### Debug Commands
```bash
# Run with debug output
DEBUG=cypress:* npm run cypress:run

# Run specific test with video
npm run cypress:run -- --spec "school-wizard-core.cy.ts" --video

# Open browser dev tools
npm run cypress:open -- --headed
```

## 📈 CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Cypress Tests
  uses: cypress-io/github-action@v6
  with:
    start: npm run dev
    wait-on: 'http://localhost:3000'
    spec: cypress/e2e/school-wizard-*.cy.ts
    record: true
    parallel: true
```

### Performance Thresholds
- **Total wizard time**: < 60 seconds
- **AI analysis time**: < 10 seconds
- **File upload time**: < 30 seconds
- **Page load time**: < 3 seconds

## 🎯 Best Practices

### Test Organization
- **Parallel execution** for faster CI runs
- **Isolated test data** with beforeEach cleanup
- **Meaningful test names** that describe the scenario
- **Focused test scope** with single responsibility

### Maintenance
- **Regular fixture updates** to match API changes
- **Performance monitoring** to catch regressions
- **Accessibility compliance** checking
- **Visual regression** review for UI changes

## 🚨 Troubleshooting

### Test Failures
1. **Check website status**: Ensure both frontend and backend are running
2. **Verify test user**: Confirm `test@example.com` exists and is active
3. **Check file fixtures**: Ensure PDF files exist in fixtures directory
4. **Review network mocks**: Verify API endpoints match current implementation

### Performance Issues
1. **Increase timeouts** for slow environments
2. **Use smaller test files** for faster feedback
3. **Skip visual tests** in CI if not needed
4. **Optimize file sizes** in fixtures directory

## 📚 Additional Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Accessibility Testing with axe-core](https://github.com/component-driven/cypress-axe)
- [Visual Regression Testing](https://docs.cypress.io/guides/tooling/visual-testing) 