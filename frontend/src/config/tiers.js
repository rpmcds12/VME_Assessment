/**
 * Tier configuration — mirrors backend constants.
 * Colors reference CSS custom properties from index.css.
 */
export const TIER_CONFIG = {
  officially_supported: {
    label: 'Officially Supported',
    color: 'var(--color-tier-official)',
    bgColor: 'var(--color-tier-official-bg)',
  },
  unofficially_supported: {
    label: 'Unofficially Supported',
    color: 'var(--color-tier-unofficial)',
    bgColor: 'var(--color-tier-unofficial-bg)',
  },
  supported_vdi: {
    label: 'Supported VDI VM',
    color: 'var(--color-tier-vdi)',
    bgColor: 'var(--color-tier-vdi-bg)',
  },
  needs_review: {
    label: 'Needs Review with Customer',
    color: 'var(--color-tier-review)',
    bgColor: 'var(--color-tier-review-bg)',
  },
  needs_info: {
    label: 'Needs Additional Info',
    color: 'var(--color-tier-info)',
    bgColor: 'var(--color-tier-info-bg)',
  },
  not_supported: {
    label: 'Not Supported',
    color: 'var(--color-tier-unsupported)',
    bgColor: 'var(--color-tier-unsupported-bg)',
  },
};

export const ALL_TIERS = [
  'officially_supported',
  'unofficially_supported',
  'supported_vdi',
  'needs_review',
  'needs_info',
  'not_supported',
];
