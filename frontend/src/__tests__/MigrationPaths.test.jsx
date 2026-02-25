import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MigrationPaths from '../components/MigrationPaths.jsx';

vi.mock('../api.js', () => ({
  getMigrationPaths: vi.fn(),
  updateMigrationPath: vi.fn(),
}));

import { getMigrationPaths, updateMigrationPath } from '../api.js';

const mockPaths = [
  {
    id: 1,
    classification_tier: 'officially_supported',
    os_family: null,
    guidance_text: 'VM is HPE-validated and ready for migration.',
    updated_at: '2025-01-01T00:00:00',
  },
  {
    id: 2,
    classification_tier: 'unofficially_supported',
    os_family: null,
    guidance_text: 'OS is KVM-compatible but not HPE-validated.',
    updated_at: '2025-01-01T00:00:00',
  },
  {
    id: 3,
    classification_tier: 'supported_vdi',
    os_family: null,
    guidance_text: 'VM is running a validated VDI workload.',
    updated_at: '2025-01-01T00:00:00',
  },
  {
    id: 4,
    classification_tier: 'needs_review',
    os_family: null,
    guidance_text: 'Review with customer before proceeding.',
    updated_at: '2025-01-01T00:00:00',
  },
  {
    id: 5,
    classification_tier: 'needs_info',
    os_family: null,
    guidance_text: 'Gather more information from the customer.',
    updated_at: '2025-01-01T00:00:00',
  },
  {
    id: 6,
    classification_tier: 'not_supported',
    os_family: null,
    guidance_text: 'OS is not compatible with KVM.',
    updated_at: '2025-01-01T00:00:00',
  },
];

describe('MigrationPaths', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders all 6 tiers with text from API', async () => {
    getMigrationPaths.mockResolvedValueOnce(mockPaths);

    render(<MigrationPaths onToast={vi.fn()} />);

    await waitFor(() => {
      expect(
        screen.getByDisplayValue('VM is HPE-validated and ready for migration.'),
      ).toBeInTheDocument();
    });

    // All tier badges should be visible
    expect(screen.getByText('Officially Supported')).toBeInTheDocument();
    expect(screen.getByText('Not Supported')).toBeInTheDocument();
    expect(screen.getByText('Needs Additional Info')).toBeInTheDocument();
  });

  it('Save button is not visible when text is unchanged', async () => {
    getMigrationPaths.mockResolvedValueOnce(mockPaths);

    render(<MigrationPaths onToast={vi.fn()} />);

    await waitFor(() => screen.getByDisplayValue('VM is HPE-validated and ready for migration.'));

    // No Save button should be visible initially
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
  });

  it('Save button appears when text is changed', async () => {
    getMigrationPaths.mockResolvedValueOnce(mockPaths);

    render(<MigrationPaths onToast={vi.fn()} />);

    await waitFor(() => screen.getByDisplayValue('VM is HPE-validated and ready for migration.'));

    const textarea = screen.getByDisplayValue('VM is HPE-validated and ready for migration.');
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'Updated guidance text.');

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('calls updateMigrationPath on save', async () => {
    getMigrationPaths.mockResolvedValueOnce(mockPaths);
    updateMigrationPath.mockResolvedValueOnce({ ...mockPaths[0], guidance_text: 'New text.' });
    const onToast = vi.fn();

    render(<MigrationPaths onToast={onToast} />);

    await waitFor(() => screen.getByDisplayValue('VM is HPE-validated and ready for migration.'));

    const textarea = screen.getByDisplayValue('VM is HPE-validated and ready for migration.');
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'New text.');

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(updateMigrationPath).toHaveBeenCalledWith(1, 'New text.');
    expect(onToast).toHaveBeenCalledWith('success', 'Guidance updated.');
  });

  it('shows loading state initially', () => {
    getMigrationPaths.mockReturnValueOnce(new Promise(() => {}));

    render(<MigrationPaths onToast={vi.fn()} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
