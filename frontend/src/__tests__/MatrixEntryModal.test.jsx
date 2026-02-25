import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MatrixEntryModal from '../components/MatrixEntryModal.jsx';

vi.mock('../api.js', () => ({
  createMatrixEntry: vi.fn(),
  updateMatrixEntry: vi.fn(),
}));

import { createMatrixEntry, updateMatrixEntry } from '../api.js';

const mockEntry = {
  id: 5,
  os_vendor: 'Canonical',
  os_family: 'Ubuntu',
  os_versions: '20.04,22.04',
  classification_tier: 'unofficially_supported',
  notes: '',
};

describe('MatrixEntryModal', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders add form when no entry provided', () => {
    render(<MatrixEntryModal onClose={vi.fn()} onSaved={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: 'Add OS Entry' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Entry' })).toBeInTheDocument();
  });

  it('renders edit form when entry provided', () => {
    render(<MatrixEntryModal entry={mockEntry} onClose={vi.fn()} onSaved={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: 'Edit OS Entry' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
  });

  it('shows validation errors when required fields are empty', async () => {
    render(<MatrixEntryModal onClose={vi.fn()} onSaved={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Add Entry' }));

    expect(screen.getByText('OS Vendor is required.')).toBeInTheDocument();
    expect(screen.getByText('OS Family is required.')).toBeInTheDocument();
    expect(screen.getByText('OS Versions is required.')).toBeInTheDocument();
  });

  it('calls createMatrixEntry on save for new entry', async () => {
    createMatrixEntry.mockResolvedValueOnce({ id: 99 });
    const onSaved = vi.fn();

    render(<MatrixEntryModal onClose={vi.fn()} onSaved={onSaved} />);

    await userEvent.type(screen.getByLabelText(/OS Vendor/), 'Oracle');
    await userEvent.type(screen.getByLabelText(/OS Family/), 'Oracle Linux');
    await userEvent.type(screen.getByLabelText(/OS Versions/), '8,9');

    await userEvent.click(screen.getByRole('button', { name: 'Add Entry' }));

    expect(createMatrixEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        os_vendor: 'Oracle',
        os_family: 'Oracle Linux',
        os_versions: '8,9',
      }),
    );
    expect(onSaved).toHaveBeenCalledWith('Entry added successfully.');
  });

  it('calls updateMatrixEntry on save for edit', async () => {
    updateMatrixEntry.mockResolvedValueOnce({ ...mockEntry });
    const onSaved = vi.fn();

    render(<MatrixEntryModal entry={mockEntry} onClose={vi.fn()} onSaved={onSaved} />);

    // Change vendor
    const vendorInput = screen.getByDisplayValue('Canonical');
    await userEvent.clear(vendorInput);
    await userEvent.type(vendorInput, 'Canonical Ltd');

    await userEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(updateMatrixEntry).toHaveBeenCalledWith(
      5,
      expect.objectContaining({ os_vendor: 'Canonical Ltd' }),
    );
    expect(onSaved).toHaveBeenCalledWith('Entry updated successfully.');
  });

  it('closes on Escape key', async () => {
    const onClose = vi.fn();
    render(<MatrixEntryModal onClose={onClose} onSaved={vi.fn()} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalled();
  });

  it('closes when Cancel button is clicked', async () => {
    const onClose = vi.fn();
    render(<MatrixEntryModal onClose={onClose} onSaved={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('shows all 6 tier options in the select', () => {
    render(<MatrixEntryModal onClose={vi.fn()} onSaved={vi.fn()} />);
    const select = screen.getByLabelText('Classification');
    const options = Array.from(select.options).map((o) => o.text);
    expect(options).toContain('Officially Supported');
    expect(options).toContain('Not Supported');
    expect(options).toHaveLength(6);
  });
});
