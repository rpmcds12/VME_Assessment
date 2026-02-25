import { Download, RefreshCw } from 'lucide-react';
import ClassificationBadge from './ClassificationBadge.jsx';
import { TIER_CONFIG, ALL_TIERS } from '../config/tiers.js';
import { triggerDownload } from '../api.js';
import styles from './ResultsPreview.module.css';

function ResultsPreview({ summary, blob, filename, customerName, onNewAnalysis }) {
  function handleDownload() {
    if (blob) {
      triggerDownload(blob, filename || 'VME-Analysis.xlsx');
    }
  }

  const total = summary?.total ?? 0;

  return (
    <div className={styles.container}>
      <div className={styles.summaryCards} role="list" aria-label="Classification summary">
        {ALL_TIERS.map((tier, index) => {
          const config = TIER_CONFIG[tier];
          const count = summary?.[tier] ?? 0;
          return (
            <div
              key={tier}
              className={styles.card}
              role="listitem"
              style={{ '--card-color': config.color, '--card-delay': `${index * 60}ms` }}
            >
              <div className={styles.cardAccent} />
              <div className={styles.cardBody}>
                <span className={styles.cardCount}>{count.toLocaleString()}</span>
                <ClassificationBadge tier={tier} />
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <span className={styles.vmCount}>
            {total.toLocaleString()} VM{total !== 1 ? 's' : ''} analyzed
          </span>
          <p className={styles.tableNote}>
            Full VM details are in the downloaded report.
          </p>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.downloadBtn}
          onClick={handleDownload}
          title={customerName ? `Download report for ${customerName}` : undefined}
        >
          <Download size={18} aria-hidden="true" />
          Download Report
        </button>
        <button className={styles.newBtn} onClick={onNewAnalysis}>
          <RefreshCw size={16} aria-hidden="true" />
          New Analysis
        </button>
      </div>
    </div>
  );
}

export default ResultsPreview;
