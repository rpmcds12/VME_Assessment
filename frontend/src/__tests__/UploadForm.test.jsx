import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UploadForm from '../components/UploadForm.jsx';

describe('UploadForm', () => {
  it('renders idle state correctly', () => {
    render(<UploadForm onSubmit={vi.fn()} isProcessing={false} />);
    expect(screen.getByText('Drop .xlsx or .csv file here or click to browse')).toBeInTheDocument();
    expect(screen.getByText('RVTools or CloudPhysics export')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Analyze' })).toBeInTheDocument();
  });

  it('Analyze button is disabled when no file selected', () => {
    render(<UploadForm onSubmit={vi.fn()} isProcessing={false} />);
    expect(screen.getByRole('button', { name: 'Analyze' })).toBeDisabled();
  });

  it('shows error message for wrong file type', () => {
    render(<UploadForm onSubmit={vi.fn()} isProcessing={false} />);

    const input = document.querySelector('input[type="file"]');
    const badFile = new File(['data'], 'inventory.xls', { type: 'application/vnd.ms-excel' });

    // Use fireEvent to bypass accept attribute validation in userEvent
    Object.defineProperty(input, 'files', {
      value: [badFile],
      configurable: true,
    });
    fireEvent.change(input);

    expect(
      screen.getByText(/Only \.xlsx and \.csv files are accepted/),
    ).toBeInTheDocument();
  });

  it('accepts a .csv file without showing an error', async () => {
    render(<UploadForm onSubmit={vi.fn()} isProcessing={false} />);

    const input = document.querySelector('input[type="file"]');
    const csvFile = new File(['VM Name,Guest OS\nvm1,Windows\n'], 'export.csv', { type: 'text/csv' });

    await userEvent.upload(input, csvFile);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Analyze' })).toBeEnabled();
  });

  it('enables Analyze button after valid file is selected', async () => {
    render(<UploadForm onSubmit={vi.fn()} isProcessing={false} />);

    const input = document.querySelector('input[type="file"]');
    const xlsxFile = new File(['data'], 'inventory.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    await userEvent.upload(input, xlsxFile);

    expect(screen.getByRole('button', { name: 'Analyze' })).toBeEnabled();
  });

  it('shows filename after valid file is selected', async () => {
    render(<UploadForm onSubmit={vi.fn()} isProcessing={false} />);

    const input = document.querySelector('input[type="file"]');
    const xlsxFile = new File(['data'], 'my-inventory.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    await userEvent.upload(input, xlsxFile);

    expect(screen.getByText('my-inventory.xlsx')).toBeInTheDocument();
  });

  it('drag-over applies dragOver CSS class to zone', () => {
    render(<UploadForm onSubmit={vi.fn()} isProcessing={false} />);
    const zone = screen.getByRole('button', { name: 'File upload zone' });

    fireEvent.dragOver(zone);

    // The zone should have the dragOver-related class applied
    // (CSS module class names are hashed so we check the class list)
    expect(zone.className).toMatch(/zoneDragOver/);
  });

  it('removes dragOver class on drag leave', () => {
    render(<UploadForm onSubmit={vi.fn()} isProcessing={false} />);
    const zone = screen.getByRole('button', { name: 'File upload zone' });

    fireEvent.dragOver(zone);
    fireEvent.dragLeave(zone);

    expect(zone.className).not.toMatch(/zoneDragOver/);
  });

  it('shows Processing state while isProcessing is true', () => {
    render(<UploadForm onSubmit={vi.fn()} isProcessing={true} />);
    expect(screen.getByText('Processing…')).toBeInTheDocument();
  });

  it('calls onSubmit with file and customer name', async () => {
    const onSubmit = vi.fn();
    render(<UploadForm onSubmit={onSubmit} isProcessing={false} />);

    const input = document.querySelector('input[type="file"]');
    const xlsxFile = new File(['data'], 'rvtools.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    await userEvent.upload(input, xlsxFile);

    const customerInput = screen.getByPlaceholderText('Customer Name (optional)');
    await userEvent.type(customerInput, 'Acme Corp');

    await userEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    expect(onSubmit).toHaveBeenCalledWith(xlsxFile, 'Acme Corp');
  });
});
