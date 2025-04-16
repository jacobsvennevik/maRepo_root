import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
        'ocean',
        'ocean-outline',
        'solid-blue',
        'outline-blue',
        'custom-aqua',
      ],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'xl', 'icon'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Button',
    variant: 'default',
    size: 'default',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Button',
    variant: 'secondary',
  },
};

export const Large: Story = {
  args: {
    children: 'Button',
    size: 'lg',
  },
};

export const Small: Story = {
  args: {
    children: 'Button',
    size: 'sm',
  },
};

export const Ocean: Story = {
  args: {
    children: 'Ocean Button',
    variant: 'ocean',
  },
};

export const OceanOutline: Story = {
  args: {
    children: 'Ocean Outline',
    variant: 'ocean-outline',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
}; 