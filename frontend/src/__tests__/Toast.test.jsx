import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import Toast, { ToastContainer } from '../components/Toast.jsx';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the message', () => {
    render(<Toast id={1} variant="info" message="Test notification" onDismiss={vi.fn()} />);
    expect(screen.getByText('Test notification')).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(<Toast id={1} variant="success" message="Done" onDismiss={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Dismiss notification' })).toBeInTheDocument();
  });

  it('calls onDismiss when close button is clicked', () => {
    const onDismiss = vi.fn();
    render(<Toast id={42} variant="error" message="Error" onDismiss={onDismiss} />);
    screen.getByRole('button', { name: 'Dismiss notification' }).click();
    expect(onDismiss).toHaveBeenCalledWith(42);
  });

  it('auto-dismisses after 5 seconds', () => {
    const onDismiss = vi.fn();
    render(<Toast id={7} variant="success" message="Auto dismiss" onDismiss={onDismiss} />);

    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onDismiss).toHaveBeenCalledWith(7);
  });

  it('does not auto-dismiss before 5 seconds', () => {
    const onDismiss = vi.fn();
    render(<Toast id={3} variant="warning" message="Hold on" onDismiss={onDismiss} />);

    act(() => {
      vi.advanceTimersByTime(4999);
    });

    expect(onDismiss).not.toHaveBeenCalled();
  });
});

describe('ToastContainer', () => {
  it('renders nothing when toasts array is empty', () => {
    const { container } = render(<ToastContainer toasts={[]} onDismiss={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when toasts is undefined', () => {
    const { container } = render(<ToastContainer toasts={undefined} onDismiss={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders all toasts', () => {
    vi.useFakeTimers();
    const toasts = [
      { id: 1, variant: 'success', message: 'First toast' },
      { id: 2, variant: 'error', message: 'Second toast' },
    ];
    render(<ToastContainer toasts={toasts} onDismiss={vi.fn()} />);
    expect(screen.getByText('First toast')).toBeInTheDocument();
    expect(screen.getByText('Second toast')).toBeInTheDocument();
    vi.useRealTimers();
  });
});
