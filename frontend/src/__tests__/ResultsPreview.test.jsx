import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResultsPreview from '../components/ResultsPreview.jsx';

vi.mock('../api.js', () => ({
  triggerDownload: vi.fn(),
}));

const mockSummary = {
  total: 150,
  officially_supported: 80,
  unofficially_supported: 30,
  supported_vdi: 12,
  needs_review: 15,
  needs_info: 8,
  not_supported: 5,
};

describe('ResultsPreview', () => {
  it('renders correct count in each summary card', () => {
    render(
      <ResultsPreview
        summary={mockSummary}
        blob={new Blob()}
        filename="VME-Analysis.xlsx"
        customerName=""
        onNewAnalysis={vi.fn()}
      />,
    );

    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders VM total count', () => {
    render(
      <ResultsPreview
        summary={mockSummary}
        blob={new Blob()}
        filename="VME-Analysis.xlsx"
        customerName=""
        onNewAnalysis={vi.fn()}
      />,
    );

    expect(screen.getByText('150 VMs analyzed')).toBeInTheDocument();
  });

  it('renders Download Report button', () => {
    render(
      <ResultsPreview
        summary={mockSummary}
        blob={new Blob()}
        filename="VME-Analysis.xlsx"
        customerName=""
        onNewAnalysis={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /Download Report/i })).toBeInTheDocument();
  });

  it('renders New Analysis button', () => {
    render(
      <ResultsPreview
        summary={mockSummary}
        blob={new Blob()}
        filename="VME-Analysis.xlsx"
        customerName=""
        onNewAnalysis={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /New Analysis/i })).toBeInTheDocument();
  });

  it('calls onNewAnalysis when New Analysis is clicked', async () => {
    const onNewAnalysis = vi.fn();
    const { getByRole } = render(
      <ResultsPreview
        summary={mockSummary}
        blob={new Blob()}
        filename="VME-Analysis.xlsx"
        customerName=""
        onNewAnalysis={onNewAnalysis}
      />,
    );

    getByRole('button', { name: /New Analysis/i }).click();
    expect(onNewAnalysis).toHaveBeenCalled();
  });

  it('renders all 6 tier badges', () => {
    render(
      <ResultsPreview
        summary={mockSummary}
        blob={new Blob()}
        filename="VME-Analysis.xlsx"
        customerName=""
        onNewAnalysis={vi.fn()}
      />,
    );

    expect(screen.getByText('Officially Supported')).toBeInTheDocument();
    expect(screen.getByText('Unofficially Supported')).toBeInTheDocument();
    expect(screen.getByText('Supported VDI VM')).toBeInTheDocument();
    expect(screen.getByText('Needs Review with Customer')).toBeInTheDocument();
    expect(screen.getByText('Needs Additional Info')).toBeInTheDocument();
    expect(screen.getByText('Not Supported')).toBeInTheDocument();
  });

  it('handles zero counts gracefully', () => {
    const zeroSummary = {
      total: 0,
      officially_supported: 0,
      unofficially_supported: 0,
      supported_vdi: 0,
      needs_review: 0,
      needs_info: 0,
      not_supported: 0,
    };
    render(
      <ResultsPreview
        summary={zeroSummary}
        blob={new Blob()}
        filename="VME-Analysis.xlsx"
        customerName=""
        onNewAnalysis={vi.fn()}
      />,
    );

    expect(screen.getByText('0 VMs analyzed')).toBeInTheDocument();
  });
});
