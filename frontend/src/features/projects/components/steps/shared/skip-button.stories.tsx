import type { Meta, StoryObj } from '@storybook/react';
import { SkipButton } from './skip-button';

const meta: Meta<typeof SkipButton> = {
  title: 'Components/Steps/Shared/SkipButton',
  component: SkipButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A reusable skip button component for wizard steps. Features red styling and customizable text.',
      },
    },
  },
  argTypes: {
    onSkip: { action: 'skipped' },
    text: {
      control: 'text',
      description: 'Custom text for the skip button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSkip: () => console.log('Skip clicked'),
    text: 'Skip',
  },
};

export const CustomText: Story = {
  args: {
    onSkip: () => console.log('Skip clicked'),
    text: "Skip - I don't have a syllabus",
  },
};

export const Disabled: Story = {
  args: {
    onSkip: () => console.log('Skip clicked'),
    text: 'Skip',
    disabled: true,
  },
};

export const LongText: Story = {
  args: {
    onSkip: () => console.log('Skip clicked'),
    text: "Skip - I don't have any course materials to upload at this time",
  },
};

export const WithCustomClass: Story = {
  args: {
    onSkip: () => console.log('Skip clicked'),
    text: 'Skip',
    className: 'w-full max-w-xs',
  },
};

export const AllVariations: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Default</h3>
        <SkipButton onSkip={() => console.log('Default skip')} />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Custom Text</h3>
        <SkipButton 
          onSkip={() => console.log('Custom skip')} 
          text="Skip - I don't have materials" 
        />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Disabled</h3>
        <SkipButton 
          onSkip={() => console.log('Disabled skip')} 
          text="Skip" 
          disabled={true} 
        />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Long Text</h3>
        <SkipButton 
          onSkip={() => console.log('Long text skip')} 
          text="Skip - I don't have any course materials to upload at this time" 
        />
      </div>
    </div>
  ),
};

export const InWizardContext: Story = {
  render: () => (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 rounded-lg">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Upload Syllabus</h2>
            <p className="text-gray-600">Upload your course syllabus for AI analysis</p>
          </div>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <p className="text-gray-500">Drag and drop your syllabus here or click to browse</p>
            </div>
            
            <div className="flex justify-between pt-4">
              <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Previous
              </button>
              <div className="flex gap-2">
                <SkipButton 
                  onSkip={() => console.log('Skip syllabus upload')} 
                  text="Skip - I don't have a syllabus" 
                />
                <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
}; 