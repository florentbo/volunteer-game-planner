import React from 'react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  render as rtlRender,
  screen,
  waitFor,
  fireEvent,
  within,
} from '@testing-library/react';

// Create a theme for testing
const theme = createTheme();

// Custom render function that includes ThemeProvider
function render(ui: React.ReactElement, options = {}) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  );
  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

// Re-export specific functions from testing-library
export {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
};
