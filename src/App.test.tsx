import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('HEYDUDE app', () => {
  it('renders the owner-only command center', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'HEYDUDE' })).toBeInTheDocument();
    expect(screen.getByText('mr.jwswain@gmail.com')).toBeInTheDocument();
    expect(screen.getByLabelText('HEYDUDE chat')).toBeInTheDocument();
  });
});
