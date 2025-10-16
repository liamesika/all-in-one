import type { Meta, StoryObj } from '@storybook/react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { ThemeProvider } from '../../lib/theme/ThemeProvider';

const meta: Meta<typeof ThemeSwitcher> = {
  title: 'Shared/ThemeSwitcher',
  component: ThemeSwitcher,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ThemeSwitcher>;

export const Default: Story = {};

export const InLightMode: Story = {
  parameters: {
    backgrounds: { default: 'light' },
  },
};

export const InDarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="dark">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};
