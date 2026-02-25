import { useEffect, useState } from 'react';
import { getMigrationPaths, updateMigrationPath } from '../api.js';
import ClassificationBadge from './ClassificationBadge.jsx';
import { ALL_TIERS } from '../config/tiers.js';
import styles from './MigrationPaths.module.css';

function MigrationPathRow({ path, onToast }) {
  const [text, setText] = useState(path.guidance_text);
  const [saved, setSaved] = useState(path.guidance_text);
  const [saving, setSaving] = useState(false);
  const isDirty = text !== saved;

  async function handleSave() {
    setSaving(true);
    try {
      await updateMigrationPath(path.id, text);
      setSaved(text);
      onToast('success', 'Guidance updated.');
    } catch (err) {
      const msg =
        err.status === 404
          ? 'Entry not found — refresh the page.'
          : err.status >= 500
            ? 'Server error — please try again.'
            : err.message;
      onToast('error', msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.row}>
      <div className={styles.rowBadge}>
        <ClassificationBadge tier={path.classification_tier} />
      </div>
      <div className={styles.rowContent}>
        <textarea
          className={styles.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          aria-label={`Migration path for ${path.classification_tier}`}
        />
        {isDirty && (
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        )}
      </div>
    </div>
  );
}

function MigrationPaths({ onToast }) {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getMigrationPaths();
        // Sort by ALL_TIERS order so rows match the classification order
        const sorted = ALL_TIERS
          .map((tier) => data.find((p) => p.classification_tier === tier))
          .filter(Boolean);
        // Include any rows not in ALL_TIERS at the end (os_family-specific rows)
        const extra = data.filter((p) => !ALL_TIERS.includes(p.classification_tier));
        setPaths([...sorted, ...extra]);
      } catch (err) {
        onToast('error', err.message || 'Failed to load migration paths.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [onToast]);

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Migration Path Guidance</h2>
        <p className={styles.sectionDesc}>
          This text appears in the Migration Path column of every generated report.
        </p>
      </div>

      {loading ? (
        <div className={styles.loading} role="status">
          <span className={styles.spinner} />
          <span>Loading…</span>
        </div>
      ) : (
        <div className={styles.list}>
          {paths.map((path) => (
            <MigrationPathRow key={path.id} path={path} onToast={onToast} />
          ))}
        </div>
      )}
    </section>
  );
}

export default MigrationPaths;
