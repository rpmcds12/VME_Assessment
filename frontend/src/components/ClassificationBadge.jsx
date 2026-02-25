import {
  CheckCircle,
  ShieldQuestion,
  Monitor,
  AlertTriangle,
  Info,
  XCircle,
} from 'lucide-react';
import { TIER_CONFIG } from '../config/tiers.js';
import styles from './ClassificationBadge.module.css';

const TIER_ICONS = {
  officially_supported: CheckCircle,
  unofficially_supported: ShieldQuestion,
  supported_vdi: Monitor,
  needs_review: AlertTriangle,
  needs_info: Info,
  not_supported: XCircle,
};

function ClassificationBadge({ tier }) {
  const config = TIER_CONFIG[tier];
  const Icon = TIER_ICONS[tier];

  if (!config || !Icon) {
    return <span className={styles.badge}>{tier}</span>;
  }

  return (
    <span
      className={styles.badge}
      style={{
        color: config.color,
        backgroundColor: config.bgColor,
        borderColor: config.color,
      }}
    >
      <Icon size={16} aria-hidden="true" />
      <span className={styles.label}>{config.label}</span>
    </span>
  );
}

export default ClassificationBadge;
