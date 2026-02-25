import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminMatrix from '../components/AdminMatrix.jsx';

vi.mock('../api.js', () => ({
  getMatrix: vi.fn(),
  deleteMatrixEntry: vi.fn(),
  createMatrixEntry: vi.fn(),
  updateMatrixEntry: vi.fn(),
}));

import { getMatrix } from '../api.js';

const mockEntries = [
  {
    id: 1,
    os_vendor: 'Microsoft',
    os_family: 'Windows Server',
    os_versions: '2019,2022',
    classification_tier: 'officially_supported',
    notes: 'HPE validated',
    updated_at: '2025-01-01T00:00:00',
  },
  {
    id: 2,
    os_vendor: 'Red Hat',
    os_family: 'RHEL',
    os_versions: '8,9',
    classification_tier: 'unofficially_supported',
    notes: null,
    updated_at: '2025-01-01T00:00:00',
  },
];

describe('AdminMatrix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders entries from mocked API response', async () => {
    getMatrix.mockResolvedValueOnce(mockEntries);

    render(<AdminMatrix onToast={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Windows Server')).toBeInTheDocument();
      expect(screen.getByText('RHEL')).toBeInTheDocument();
    });
  });

  it('shows empty state when no entries', async () => {
    getMatrix.mockResolvedValueOnce([]);

    render(<AdminMatrix onToast={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('No matrix entries yet.')).toBeInTheDocument();
    });
  });

  it('shows loading indicator initially', () => {
    getMatrix.mockReturnValueOnce(new Promise(() => {})); // never resolves

    render(<AdminMatrix onToast={vi.fn()} />);

    expect(screen.getByRole('status', { name: 'Loading matrix entries' })).toBeInTheDocument();
  });

  it('clicking Add opens the modal', async () => {
    getMatrix.mockResolvedValueOnce([]);

    render(<AdminMatrix onToast={vi.fn()} />);

    await waitFor(() => screen.getByText('No matrix entries yet.'));

    await userEvent.click(screen.getByRole('button', { name: 'Add OS Entry' }));

    expect(screen.getByRole('dialog', { name: 'Add OS Entry' })).toBeInTheDocument();
  });

  it('clicking Edit opens modal pre-filled with entry data', async () => {
    getMatrix.mockResolvedValueOnce(mockEntries);

    render(<AdminMatrix onToast={vi.fn()} />);

    await waitFor(() => screen.getByText('Windows Server'));

    await userEvent.click(screen.getByRole('button', { name: 'Edit Windows Server' }));

    const dialog = screen.getByRole('dialog', { name: 'Edit OS Entry' });
    expect(dialog).toBeInTheDocument();

    // Modal should be pre-filled
    expect(screen.getByDisplayValue('Microsoft')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Windows Server')).toBeInTheDocument();
  });

  it('shows column headers', async () => {
    getMatrix.mockResolvedValueOnce(mockEntries);

    render(<AdminMatrix onToast={vi.fn()} />);

    await waitFor(() => screen.getByText('Windows Server'));

    expect(screen.getByText('OS Vendor')).toBeInTheDocument();
    expect(screen.getByText('OS Family')).toBeInTheDocument();
    expect(screen.getByText('Versions')).toBeInTheDocument();
    expect(screen.getByText('Classification')).toBeInTheDocument();
  });
});
