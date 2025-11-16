import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Step2Details } from './Step2Details';
import { api } from '../../services/api';

vi.mock('../../services/api', () => ({
  api: {
    createBasicInfo: vi.fn(),
    createDetails: vi.fn(),
    searchLocations: vi.fn(),
  },
}));

vi.mock('../../utils/helpers', () => ({
  delay: vi.fn().mockResolvedValue(undefined),
  fileToBase64: vi.fn().mockResolvedValue('data:image/png;base64,mockBase64String'),
}));

describe('Step2Details Submit Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show progress indicator during submission and complete successfully', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    const mockSearchLocations = vi.fn().mockResolvedValue([
      { id: 1, name: 'New York Office' },
    ]);

    (api.searchLocations as ReturnType<typeof vi.fn>).mockImplementation(mockSearchLocations);
    (api.createBasicInfo as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    (api.createDetails as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });

    const basicInfo = {
      fullName: 'John Doe',
      email: 'john@example.com',
      employeeId: 'EMP001',
      department: 'Engineering',
      role: 'Engineer' as const,
    };

    render(
      <Step2Details
        onSubmit={mockOnSubmit}
        onChange={vi.fn()}
        initialData={{}}
        basicInfo={basicInfo}
        showBackButton={true}
      />
    );

    const fileInputs = document.querySelectorAll('input[type="file"]');
    const photoFileInput = fileInputs[0] as HTMLInputElement;
    const file = new File(['dummy content'], 'photo.png', { type: 'image/png' });

    await user.upload(photoFileInput, file);

    await waitFor(() => {
      expect(screen.queryByText('Uploading...')).not.toBeInTheDocument();
    });

    const employmentSelect = screen.getByRole('combobox');
    await user.selectOptions(employmentSelect, 'Full-time');

    const locationInput = screen.getByPlaceholderText(/search location/i);
    await user.type(locationInput, 'New York');

    await waitFor(() => {
      expect(screen.getByText('New York Office')).toBeInTheDocument();
    });

    await user.click(screen.getByText('New York Office'));

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/all data processed successfully/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/basicinfo saved/i)).toBeInTheDocument();
    expect(screen.getByText(/details saved/i)).toBeInTheDocument();

    expect(api.createBasicInfo).toHaveBeenCalledWith(basicInfo);
    expect(api.createDetails).toHaveBeenCalledWith(
      expect.objectContaining({
        employmentType: 'Full-time',
        officeLocation: 'New York Office',
      })
    );

    await waitFor(
      () => {
        expect(mockOnSubmit).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );
  });

  it('should show error message when submission fails', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    const mockSearchLocations = vi.fn().mockResolvedValue([
      { id: 1, name: 'San Francisco Office' },
    ]);

    (api.searchLocations as ReturnType<typeof vi.fn>).mockImplementation(mockSearchLocations);
    (api.createBasicInfo as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error')
    );

    const basicInfo = {
      fullName: 'Jane Smith',
      email: 'jane@example.com',
      employeeId: 'EMP002',
      department: 'Finance',
      role: 'Finance' as const,
    };

    render(
      <Step2Details
        onSubmit={mockOnSubmit}
        onChange={vi.fn()}
        initialData={{}}
        basicInfo={basicInfo}
        showBackButton={true}
      />
    );

    const fileInputs = document.querySelectorAll('input[type="file"]');
    const photoFileInput = fileInputs[0] as HTMLInputElement;
    const file = new File(['dummy content'], 'photo.png', { type: 'image/png' });
    await user.upload(photoFileInput, file);

    await waitFor(() => {
      expect(screen.queryByText('Uploading...')).not.toBeInTheDocument();
    });

    const employmentSelect = screen.getByRole('combobox');
    await user.selectOptions(employmentSelect, 'Contract');

    const locationInput = screen.getByPlaceholderText(/search location/i);
    await user.type(locationInput, 'San Francisco');

    await waitFor(() => {
      expect(screen.getByText('San Francisco Office')).toBeInTheDocument();
    });

    await user.click(screen.getByText('San Francisco Office'));

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should validate required fields before submission', async () => {
    const mockOnSubmit = vi.fn();

    render(
      <Step2Details
        onSubmit={mockOnSubmit}
        onChange={vi.fn()}
        initialData={{}}
        showBackButton={true}
      />
    );

    const submitButton = screen.getByRole('button', { name: /submit/i });

    expect(submitButton).toBeDisabled();

    expect(api.createDetails).not.toHaveBeenCalled();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
