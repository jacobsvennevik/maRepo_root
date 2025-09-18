/**
 * Form Testing Patterns
 * 
 * Reusable patterns for testing form functionality, validation,
 * user interactions, and accessibility across different components.
 */

import React from 'react';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../setup/shared-setup';
import { testFactories } from '../../factories';
import { standardMocks } from '../../mocks';

// ============================================================================
// Form Test Patterns
// ============================================================================

export interface FormTestConfig {
  component: React.ComponentType<any>;
  props?: any;
  fields: FormField[];
  validationRules?: ValidationRule[];
}

export interface FormField {
  name: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'textarea';
  label: string;
  required?: boolean;
  placeholder?: string;
}

export interface ValidationRule {
  field: string;
  rule: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern';
  value?: any;
  message: string;
}

// ============================================================================
// Form Rendering Testing Pattern
// ============================================================================

export const createFormRenderingTest = (config: FormTestConfig) => {
  return {
    testFormRenders() {
      renderWithProviders(React.createElement(config.component, config.props));
      
      config.fields.forEach(field => {
        if (field.type === 'checkbox') {
          expect(screen.getByRole('checkbox', { name: field.label })).toBeInTheDocument();
        } else if (field.type === 'select') {
          expect(screen.getByRole('combobox', { name: field.label })).toBeInTheDocument();
        } else {
          expect(screen.getByLabelText(field.label)).toBeInTheDocument();
        }
      });
    },

    testFormAccessibility() {
      renderWithProviders(React.createElement(config.component, config.props));
      
      config.fields.forEach(field => {
        const element = field.type === 'checkbox' 
          ? screen.getByRole('checkbox', { name: field.label })
          : screen.getByLabelText(field.label);
        
        expect(element).toBeInTheDocument();
        
        if (field.required) {
          expect(element).toHaveAttribute('required');
        }
      });
    },

    testFormStructure() {
      renderWithProviders(React.createElement(config.component, config.props));
      
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
      
      const submitButton = screen.getByRole('button', { name: /submit|save|create/i });
      expect(submitButton).toBeInTheDocument();
    }
  };
};

// ============================================================================
// Form Validation Testing Pattern
// ============================================================================

export const createFormValidationTest = (config: FormTestConfig) => {
  return {
    async testRequiredFieldValidation() {
      const user = userEvent.setup();
      renderWithProviders(React.createElement(config.component, config.props));

      const submitButton = screen.getByRole('button', { name: /submit|save|create/i });
      await user.click(submitButton);

      config.fields
        .filter(field => field.required)
        .forEach(field => {
          expect(screen.getByText(new RegExp(`${field.label}.*required`, 'i'))).toBeInTheDocument();
        });
    },

    async testFieldValidation() {
      const user = userEvent.setup();
      
      if (!config.validationRules) return;

      for (const rule of config.validationRules) {
        renderWithProviders(React.createElement(config.component, config.props));

        const field = config.fields.find(f => f.name === rule.field);
        if (!field) continue;

        const fieldElement = screen.getByLabelText(field.label);

        switch (rule.rule) {
          case 'email':
            await user.type(fieldElement, 'invalid-email');
            break;
          case 'minLength':
            await user.type(fieldElement, 'a'.repeat((rule.value || 8) - 1));
            break;
          case 'maxLength':
            await user.type(fieldElement, 'a'.repeat((rule.value || 100) + 1));
            break;
          case 'pattern':
            await user.type(fieldElement, 'invalid-pattern');
            break;
        }

        await user.tab(); // Trigger validation

        await waitFor(() => {
          expect(screen.getByText(rule.message)).toBeInTheDocument();
        });

        jest.clearAllMocks();
      }
    },

    async testRealTimeValidation() {
      const user = userEvent.setup();
      renderWithProviders(React.createElement(config.component, config.props));

      const emailField = config.fields.find(f => f.type === 'email');
      if (emailField) {
        const fieldElement = screen.getByLabelText(emailField.label);
        
        await user.type(fieldElement, 'invalid');
        await user.blur(fieldElement);

        await waitFor(() => {
          expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
        });
      }
    }
  };
};

// ============================================================================
// Form Interaction Testing Pattern
// ============================================================================

export const createFormInteractionTest = (config: FormTestConfig) => {
  return {
    async testFormSubmission() {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn();
      
      renderWithProviders(React.createElement(config.component, { ...config.props, onSubmit: mockOnSubmit }));

      // Fill all required fields
      for (const field of config.fields.filter(f => f.required)) {
        const fieldElement = screen.getByLabelText(field.label);
        
        switch (field.type) {
          case 'text':
          case 'email':
          case 'password':
            await user.type(fieldElement, `test-${field.name}`);
            break;
          case 'number':
            await user.type(fieldElement, '123');
            break;
          case 'checkbox':
            await user.click(fieldElement);
            break;
          case 'select':
            await user.selectOptions(fieldElement, fieldElement.querySelector('option')?.value || '');
            break;
        }
      }

      const submitButton = screen.getByRole('button', { name: /submit|save|create/i });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalled();
    },

    async testKeyboardNavigation() {
      const user = userEvent.setup();
      renderWithProviders(React.createElement(config.component, config.props));

      // Tab through all fields
      for (const field of config.fields) {
        await user.tab();
        
        const fieldElement = field.type === 'checkbox' 
          ? screen.getByRole('checkbox', { name: field.label })
          : screen.getByLabelText(field.label);
        
        expect(fieldElement).toHaveFocus();
      }
    },

    async testFormReset() {
      const user = userEvent.setup();
      renderWithProviders(React.createElement(config.component, config.props));

      // Fill some fields
      const firstField = config.fields[0];
      if (firstField) {
        const fieldElement = screen.getByLabelText(firstField.label);
        await user.type(fieldElement, 'test value');
        expect(fieldElement).toHaveValue('test value');
      }

      // Reset form
      const resetButton = screen.getByRole('button', { name: /reset|clear/i });
      await user.click(resetButton);

      // Verify fields are cleared
      for (const field of config.fields) {
        const fieldElement = field.type === 'checkbox' 
          ? screen.getByRole('checkbox', { name: field.label })
          : screen.getByLabelText(field.label);
        
        if (field.type === 'checkbox') {
          expect(fieldElement).not.toBeChecked();
        } else {
          expect(fieldElement).toHaveValue('');
        }
      }
    },

    async testRapidSubmission() {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn();
      
      renderWithProviders(React.createElement(config.component, { ...config.props, onSubmit: mockOnSubmit }));

      const submitButton = screen.getByRole('button', { name: /submit|save|create/i });
      
      // Rapid clicks should be handled gracefully
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      // Should only submit once or handle multiple submissions appropriately
      expect(mockOnSubmit).toHaveBeenCalled();
    }
  };
};

// ============================================================================
// Form State Testing Pattern
// ============================================================================

export const createFormStateTest = (config: FormTestConfig) => {
  return {
    testInitialState() {
      renderWithProviders(React.createElement(config.component, config.props));

      config.fields.forEach(field => {
        const fieldElement = field.type === 'checkbox' 
          ? screen.getByRole('checkbox', { name: field.label })
          : screen.getByLabelText(field.label);
        
        if (field.type === 'checkbox') {
          expect(fieldElement).not.toBeChecked();
        } else {
          expect(fieldElement).toHaveValue('');
        }
      });
    },

    testLoadingState() {
      renderWithProviders(React.createElement(config.component, { ...config.props, loading: true }));

      const submitButton = screen.getByRole('button', { name: /submit|save|create/i });
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    },

    testDisabledState() {
      renderWithProviders(React.createElement(config.component, { ...config.props, disabled: true }));

      config.fields.forEach(field => {
        const fieldElement = field.type === 'checkbox' 
          ? screen.getByRole('checkbox', { name: field.label })
          : screen.getByLabelText(field.label);
        
        expect(fieldElement).toBeDisabled();
      });

      const submitButton = screen.getByRole('button', { name: /submit|save|create/i });
      expect(submitButton).toBeDisabled();
    },

    testErrorState() {
      const errorMessage = 'Form submission failed';
      renderWithProviders(React.createElement(config.component, { ...config.props, error: errorMessage }));

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    }
  };
};

// ============================================================================
// Form Accessibility Testing Pattern
// ============================================================================

export const createFormAccessibilityTest = (config: FormTestConfig) => {
  return {
    testARIALabels() {
      renderWithProviders(React.createElement(config.component, config.props));

      config.fields.forEach(field => {
        const fieldElement = field.type === 'checkbox' 
          ? screen.getByRole('checkbox', { name: field.label })
          : screen.getByLabelText(field.label);
        
        expect(fieldElement).toBeInTheDocument();
      });
    },

    testErrorAnnouncements() {
      const user = userEvent.setup();
      renderWithProviders(React.createElement(config.component, config.props));

      const submitButton = screen.getByRole('button', { name: /submit|save|create/i });
      await user.click(submitButton);

      // Check for error announcements
      const errorElements = screen.getAllByRole('alert');
      expect(errorElements.length).toBeGreaterThan(0);
    },

    testScreenReaderSupport() {
      renderWithProviders(React.createElement(config.component, config.props));

      // Check for proper form structure
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();

      // Check for field descriptions
      config.fields.forEach(field => {
        if (field.placeholder) {
          const fieldElement = screen.getByLabelText(field.label);
          expect(fieldElement).toHaveAttribute('placeholder', field.placeholder);
        }
      });
    }
  };
};

// ============================================================================
// Form Performance Testing Pattern
// ============================================================================

export const createFormPerformanceTest = (config: FormTestConfig) => {
  return {
    testRenderPerformance() {
      const startTime = performance.now();
      renderWithProviders(React.createElement(config.component, config.props));
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should render in < 100ms
    },

    async testTypingPerformance() {
      const user = userEvent.setup();
      renderWithProviders(React.createElement(config.component, config.props));

      const textField = config.fields.find(f => f.type === 'text');
      if (!textField) return;

      const fieldElement = screen.getByLabelText(textField.label);
      const largeText = 'x'.repeat(1000);
      
      const startTime = performance.now();
      await user.type(fieldElement, largeText);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(2000); // Should handle in < 2s
    },

    async testValidationPerformance() {
      const user = userEvent.setup();
      renderWithProviders(React.createElement(config.component, config.props));

      const startTime = performance.now();
      
      // Rapid validation triggers
      for (let i = 0; i < 10; i++) {
        const field = config.fields[i % config.fields.length];
        const fieldElement = screen.getByLabelText(field.label);
        await user.type(fieldElement, 'test');
        await user.clear(fieldElement);
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should handle in < 1s
    }
  };
};
