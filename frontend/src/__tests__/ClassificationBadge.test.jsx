import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ClassificationBadge from '../components/ClassificationBadge.jsx';
import { TIER_CONFIG, ALL_TIERS } from '../config/tiers.js';

describe('ClassificationBadge', () => {
  it.each(ALL_TIERS)('renders correct label for tier: %s', (tier) => {
    render(<ClassificationBadge tier={tier} />);
    expect(screen.getByText(TIER_CONFIG[tier].label)).toBeInTheDocument();
  });

  it('renders correctly for officially_supported', () => {
    render(<ClassificationBadge tier="officially_supported" />);
    expect(screen.getByText('Officially Supported')).toBeInTheDocument();
  });

  it('renders correctly for not_supported', () => {
    render(<ClassificationBadge tier="not_supported" />);
    expect(screen.getByText('Not Supported')).toBeInTheDocument();
  });

  it('renders correctly for needs_review', () => {
    render(<ClassificationBadge tier="needs_review" />);
    expect(screen.getByText('Needs Review with Customer')).toBeInTheDocument();
  });

  it('renders correctly for needs_info', () => {
    render(<ClassificationBadge tier="needs_info" />);
    expect(screen.getByText('Needs Additional Info')).toBeInTheDocument();
  });

  it('renders correctly for unofficially_supported', () => {
    render(<ClassificationBadge tier="unofficially_supported" />);
    expect(screen.getByText('Unofficially Supported')).toBeInTheDocument();
  });

  it('renders correctly for supported_vdi', () => {
    render(<ClassificationBadge tier="supported_vdi" />);
    expect(screen.getByText('Supported VDI VM')).toBeInTheDocument();
  });

  it('renders an icon for each tier', () => {
    ALL_TIERS.forEach((tier) => {
      const { container, unmount } = render(<ClassificationBadge tier={tier} />);
      // SVG icon should be present (aria-hidden)
      const icon = container.querySelector('svg[aria-hidden="true"]');
      expect(icon).not.toBeNull();
      unmount();
    });
  });

  it('renders fallback text for unknown tier', () => {
    render(<ClassificationBadge tier="unknown_tier" />);
    expect(screen.getByText('unknown_tier')).toBeInTheDocument();
  });
});
