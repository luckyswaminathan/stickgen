import React from 'react';
import { render, screen } from '@testing-library/react';
import ImageUploadApp from './App';

test('renders learn react link', () => {
  render(<ImageUploadApp />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
