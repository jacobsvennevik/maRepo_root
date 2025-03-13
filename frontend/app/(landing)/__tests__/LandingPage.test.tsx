// app/(landing)/__tests__/LandingPage.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import LandingPage from '../page';

describe('LandingPage', () => {
  beforeEach(() => {
    render(<LandingPage />);
  });

  test('renders header with StudyWhale branding and proper styles', () => {
    // Verify that the header is present and has a fixed position class.
    const header = document.querySelector('header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('fixed');

    // Check that the branding text is present
    const branding = screen.getByText(/StudyWhale/i);
    expect(branding).toBeInTheDocument();
  });

  test('renders hero section with correct headline and subheading styles', () => {
    // The headline should have the appropriate text and Tailwind classes.
    const headline = screen.getByRole('heading', { name: /Study Smarter with AI—Dive into Better Learning\./i });
    expect(headline).toBeInTheDocument();
    expect(headline).toHaveClass('text-4xl', 'md:text-6xl', 'font-extrabold', 'text-gray-800');

    // Verify the subheading text and classes.
    const subheading = screen.getByText(/Generate flashcards, mind maps, and quizzes from your notes in seconds\./i);
    expect(subheading).toBeInTheDocument();
    expect(subheading).toHaveClass('text-lg', 'md:text-2xl', 'text-gray-600');
  });

  test('renders features section with three feature cards', () => {
    // Verify that the features section contains the three expected cards.
    expect(screen.getByText(/Flashcards/i)).toBeInTheDocument();
    expect(screen.getByText(/Mind Maps/i)).toBeInTheDocument();
    expect(screen.getByText(/Summaries & Quizzes/i)).toBeInTheDocument();

    // Optionally, check that each feature card has hover and transform classes.
    const featureCards = document.querySelectorAll('div[class*="hover:-translate-y-1"]');
    expect(featureCards.length).toBe(3);
  });

  test('demo section generates flashcards on button click', async () => {
    // Simulate user entering text and clicking the generate button.
    const user = userEvent.setup();
    const generateButton = screen.getByRole('button', { name: /Generate Flashcards/i });
    expect(generateButton).toBeInTheDocument();

    await user.click(generateButton);

    // Verify that the placeholder flashcards appear.
    const flashcard = await screen.findByText(/Flashcard 1: Placeholder content\./i);
    expect(flashcard).toBeInTheDocument();
  });

  test('renders footer with navigation links', () => {
    // Verify that the footer is present.
    const footer = document.querySelector('footer');
    expect(footer).toBeInTheDocument();

    // Check for the presence of navigation links
    expect(screen.getByText(/About/i)).toBeInTheDocument();
    expect(screen.getByText(/Features/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
  });
});
