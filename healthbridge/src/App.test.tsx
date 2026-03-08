import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App'; // Ensure App.tsx exists or create a dummy one

test('renders Home page', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  expect(screen.getByText(/welcome/i)).toBeInTheDocument(); // Adjust based on HomePage content
});