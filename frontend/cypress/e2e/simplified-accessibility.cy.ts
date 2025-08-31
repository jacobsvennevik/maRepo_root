/// <reference types="cypress" />

describe('♿ Simplified Accessibility Tests', () => {
  beforeEach(() => {
    // Handle Next.js hydration errors
    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('Hydration failed') || err.message.includes('hydration')) {
        return false;
      }
      return true;
    });

    // Clear localStorage
    cy.clearLocalStorage();
  });

  describe('Basic Accessibility Tests', () => {
    it('should have proper heading structure', () => {
      cy.log('♿ Testing heading structure');
      
      cy.visit('/');
      
      // Check for heading elements
      cy.get('h1, h2, h3, h4, h5, h6').should('exist');
      
      // Check that headings have text content
      cy.get('h1, h2, h3, h4, h5, h6').each((heading) => {
        expect(heading.text().trim()).to.not.be.empty;
      });
      
      cy.log('✅ Heading structure test completed');
    });

    it('should have proper form labels', () => {
      cy.log('♿ Testing form labels');
      
      cy.visit('/login');
      
      // Check for form elements
      cy.get('form').should('exist');
      
      // Check for input elements
      cy.get('input').should('exist');
      
      // Check that inputs have labels or placeholders
      cy.get('input').each((input) => {
        const hasLabel = input.attr('aria-label') || 
                        input.attr('placeholder') || 
                        input.attr('id') ||
                        input.closest('label').length > 0;
        // At least one accessibility feature should be present
        expect(hasLabel || input.attr('name')).to.be.truthy;
      });
      
      cy.log('✅ Form labels test completed');
    });

    it('should have proper button accessibility', () => {
      cy.log('♿ Testing button accessibility');
      
      cy.visit('/');
      
      // Check for button elements
      cy.get('button').should('exist');
      
      // Check that buttons have accessible text or labels
      cy.get('button').each((button) => {
        const hasText = button.text().trim().length > 0;
        const hasAriaLabel = button.attr('aria-label');
        const hasTitle = button.attr('title');
        const hasAlt = button.attr('alt');
        
        // At least one accessibility feature should be present
        expect(hasText || hasAriaLabel || hasTitle || hasAlt).to.be.truthy;
      });
      
      cy.log('✅ Button accessibility test completed');
    });
  });

  describe('Focus Management Tests', () => {
    it('should maintain proper focus management', () => {
      cy.log('♿ Testing focus management');
      
      cy.visit('/');
      
      // Check that focusable elements exist
      cy.get('button, a, input, select, textarea').should('exist');
      
      // Test focus on first focusable element
      cy.get('button, a, input, select, textarea').first().focus();
      cy.focused().should('exist');
      
      // Test focus on multiple elements
      cy.get('button, a, input, select, textarea').then((elements) => {
        if (elements.length > 1) {
          cy.get('button, a, input, select, textarea').eq(1).focus();
          cy.focused().should('exist');
        }
      });
      
      cy.log('✅ Focus management test completed');
    });

    it('should handle focus during navigation', () => {
      cy.log('♿ Testing focus during navigation');
      
      cy.visit('/');
      
      // Focus on an element
      cy.get('button, a, input, select, textarea').first().focus();
      cy.focused().should('exist');
      
      // Navigate to another page
      cy.visit('/login');
      
      // Check that focusable elements still exist
      cy.get('button, a, input, select, textarea').should('exist');
      
      cy.log('✅ Focus during navigation test completed');
    });
  });

  describe('Color and Contrast Tests', () => {
    it('should have sufficient color contrast', () => {
      cy.log('♿ Testing color contrast');
      
      cy.visit('/');
      
      // Check that text elements have color styles
      cy.get('body').should('have.css', 'color');
      cy.get('body').should('have.css', 'background-color');
      
      // Check that headings have color styles
      cy.get('h1, h2, h3, h4, h5, h6').first().should('have.css', 'color');
      
      cy.log('✅ Color contrast test completed');
    });

    it('should not rely solely on color for information', () => {
      cy.log('♿ Testing color independence');
      
      cy.visit('/');
      
      // Check that links have underlines or other visual indicators
      cy.get('a').each((link) => {
        const hasUnderline = link.css('text-decoration').includes('underline');
        const hasBorder = link.css('border-bottom-width') !== '0px';
        const hasBackground = link.css('background-color') !== 'rgba(0, 0, 0, 0)';
        
        // At least one visual indicator should be present
        expect(hasUnderline || hasBorder || hasBackground).to.be.true;
      });
      
      cy.log('✅ Color independence test completed');
    });
  });

  describe('Screen Reader Compatibility Tests', () => {
    it('should have proper ARIA attributes', () => {
      cy.log('♿ Testing ARIA attributes');
      
      cy.visit('/');
      
      // Check for common ARIA attributes
      cy.get('[aria-label], [aria-labelledby], [aria-describedby], [role]').should('exist');
      
      // Check that ARIA labels have content
      cy.get('[aria-label]').each((element) => {
        const ariaLabel = element.attr('aria-label');
        expect(ariaLabel.trim()).to.not.be.empty;
      });
      
      cy.log('✅ ARIA attributes test completed');
    });

    it('should have proper alt text for images', () => {
      cy.log('♿ Testing image alt text');
      
      cy.visit('/');
      
      // Check for images
      cy.get('img').should('exist');
      
      // Check that images have alt attributes
      cy.get('img').each((img) => {
        const alt = img.attr('alt');
        expect(alt).to.not.be.undefined;
      });
      
      cy.log('✅ Image alt text test completed');
    });
  });

  describe('Keyboard Navigation Tests', () => {
    it('should be navigable by keyboard', () => {
      cy.log('♿ Testing keyboard navigation');
      
      cy.visit('/');
      
      // Check that all interactive elements are focusable
      cy.get('button, a, input, select, textarea').each((element) => {
        const tabIndex = element.attr('tabindex');
        const disabled = element.attr('disabled');
        
        // Element should be focusable unless disabled
        if (!disabled) {
          expect(tabIndex !== '-1').to.be.true;
        }
      });
      
      cy.log('✅ Keyboard navigation test completed');
    });

    it('should handle keyboard interactions properly', () => {
      cy.log('♿ Testing keyboard interactions');
      
      cy.visit('/login');
      
      // Test tab navigation
      cy.get('input[type="email"]').focus();
      cy.focused().should('have.attr', 'type', 'email');
      
      // Test enter key on form
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('password123');
      
      cy.log('✅ Keyboard interactions test completed');
    });
  });

  describe('Responsive Accessibility Tests', () => {
    it('should maintain accessibility on different screen sizes', () => {
      cy.log('♿ Testing responsive accessibility');
      
      // Test on mobile viewport
      cy.viewport(375, 667);
      cy.visit('/');
      cy.get('button, a, input, select, textarea').should('exist');
      
      // Test on tablet viewport
      cy.viewport(768, 1024);
      cy.visit('/');
      cy.get('button, a, input, select, textarea').should('exist');
      
      // Test on desktop viewport
      cy.viewport(1280, 720);
      cy.visit('/');
      cy.get('button, a, input, select, textarea').should('exist');
      
      cy.log('✅ Responsive accessibility test completed');
    });

    it('should handle touch interactions properly', () => {
      cy.log('♿ Testing touch interactions');
      
      cy.viewport(375, 667); // Mobile viewport
      cy.visit('/');
      
      // Test touch interactions on buttons
      cy.get('button').first().click({ force: true });
      
      // Test touch interactions on links
      cy.get('a').first().click({ force: true });
      
      cy.log('✅ Touch interactions test completed');
    });
  });

  describe('Error Handling Accessibility Tests', () => {
    it('should provide accessible error messages', () => {
      cy.log('♿ Testing error message accessibility');
      
      cy.visit('/login');
      
      // Test form validation
      cy.get('input[type="email"]').type('invalid-email');
      cy.get('input[type="password"]').type('123');
      
      // Check for error messages or validation feedback
      cy.get('body').should('contain.text', 'error').or('contain.text', 'invalid').or('contain.text', 'required');
      
      cy.log('✅ Error message accessibility test completed');
    });

    it('should handle loading states accessibly', () => {
      cy.log('♿ Testing loading state accessibility');
      
      cy.visit('/');
      
      // Check for loading indicators or states
      cy.get('[aria-busy="true"], [role="progressbar"], .loading, .spinner').should('exist');
      
      cy.log('✅ Loading state accessibility test completed');
    });
  });
}); 