import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Autocomplete } from './Autocomplete';

describe('Autocomplete', () => {
  it('should display suggestions when user types and allow selection', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    const mockOnSearch = vi.fn().mockResolvedValue([
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
    ]);

    render(
      <Autocomplete
        label="Employee"
        value=""
        onChange={mockOnChange}
        onSearch={mockOnSearch}
        placeholder="Search employees..."
      />
    );

    const input = screen.getByPlaceholderText('Search employees...');
    await user.type(input, 'John');

    expect(mockOnSearch).toHaveBeenCalledWith('John');

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    await user.click(screen.getByText('John Doe'));

    expect(mockOnChange).toHaveBeenCalledWith('John Doe');

    await waitFor(() => {
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  it('should call onSearch when user types', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    const mockOnSearch = vi.fn().mockResolvedValue([
      { id: 1, name: 'Test User' },
    ]);

    render(
      <Autocomplete
        label="Employee"
        value=""
        onChange={mockOnChange}
        onSearch={mockOnSearch}
        placeholder="Search..."
      />
    );

    const input = screen.getByPlaceholderText('Search...');
    await user.type(input, 'Test');

    expect(mockOnSearch).toHaveBeenCalledWith('Test');

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  it('should show "No results found" when search returns empty array', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    const mockOnSearch = vi.fn().mockResolvedValue([]);

    render(
      <Autocomplete
        label="Employee"
        value=""
        onChange={mockOnChange}
        onSearch={mockOnSearch}
        placeholder="Search..."
      />
    );

    const input = screen.getByPlaceholderText('Search...');
    await user.type(input, 'NonExistent');

    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });
  });

  it('should display error message when error prop is provided', () => {
    const mockOnChange = vi.fn();
    const mockOnSearch = vi.fn();

    render(
      <Autocomplete
        label="Employee"
        value=""
        onChange={mockOnChange}
        onSearch={mockOnSearch}
        error="This field is required"
      />
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });
});
