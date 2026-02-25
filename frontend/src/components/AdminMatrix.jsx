import { useCallback, useEffect, useRef, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { getMatrix, deleteMatrixEntry } from '../api.js';
import ClassificationBadge from './ClassificationBadge.jsx';
import MatrixEntryModal from './MatrixEntryModal.jsx';
import styles from './AdminMatrix.module.css';

const CONFIRM_TIMEOUT_MS = 3000;

function DeleteButton({ onConfirm }) {
  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef(null);

  function startConfirm() {
    setConfirming(true);
    timerRef.current = setTimeout(() => setConfirming(false), CONFIRM_TIMEOUT_MS);
  }

  function cancel() {
    clearTimeout(timerRef.current);
    setConfirming(false);
  }

  function confirm() {
    clearTimeout(timerRef.current);
    setConfirming(false);
    onConfirm();
  }

  useEffect(() => () => clearTimeout(timerRef.current), []);

  if (confirming) {
    return (
      <span className={styles.confirmGroup}>
        <button className={styles.confirmDeleteBtn} onClick={confirm}>
          Confirm Delete
        </button>
        <button className={styles.cancelConfirmBtn} onClick={cancel}>
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      className={styles.deleteBtn}
      onClick={startConfirm}
      aria-label="Delete entry"
      title="Delete"
    >
      <Trash2 size={16} />
    </button>
  );
}

function AdminMatrix({ onToast }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState(null); // null | { mode: 'add' } | { mode: 'edit', entry }

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMatrix();
      setEntries(data);
    } catch (err) {
      onToast('error', err.message || 'Failed to load matrix entries.');
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  async function handleDelete(id) {
    try {
      await deleteMatrixEntry(id);
      onToast('success', 'Entry deleted.');
      loadEntries();
    } catch (err) {
      const msg =
        err.status === 404
          ? 'Entry not found — refresh the page.'
          : err.status >= 500
            ? 'Server error — please try again.'
            : err.message;
      onToast('error', msg);
    }
  }

  function handleSaved(message) {
    setModalState(null);
    onToast('success', message);
    loadEntries();
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>OS Compatibility Matrix</h2>
        <button
          className={styles.addBtn}
          onClick={() => setModalState({ mode: 'add' })}
        >
          Add OS Entry
        </button>
      </div>

      {loading ? (
        <div className={styles.loading} role="status" aria-label="Loading matrix entries">
          <span className={styles.spinner} />
          <span>Loading…</span>
        </div>
      ) : entries.length === 0 ? (
        <div className={styles.empty}>
          <p>No matrix entries yet.</p>
          <p className={styles.emptyHint}>Click "Add OS Entry" to add the first entry.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>OS Vendor</th>
                <th className={styles.th}>OS Family</th>
                <th className={styles.th}>Versions</th>
                <th className={styles.th}>Classification</th>
                <th className={styles.th}>Notes</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr key={entry.id} className={idx % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                  <td className={styles.td}>{entry.os_vendor}</td>
                  <td className={styles.td}>{entry.os_family}</td>
                  <td className={`${styles.td} ${styles.mono}`}>{entry.os_versions}</td>
                  <td className={styles.td}>
                    <ClassificationBadge tier={entry.classification_tier} />
                  </td>
                  <td className={`${styles.td} ${styles.notes}`}>
                    {entry.notes ?? <span className={styles.empty}>—</span>}
                  </td>
                  <td className={styles.td}>
                    <span className={styles.actions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => setModalState({ mode: 'edit', entry })}
                        aria-label={`Edit ${entry.os_family}`}
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <DeleteButton onConfirm={() => handleDelete(entry.id)} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalState && (
        <MatrixEntryModal
          entry={modalState.mode === 'edit' ? modalState.entry : null}
          onClose={() => setModalState(null)}
          onSaved={handleSaved}
        />
      )}
    </section>
  );
}

export default AdminMatrix;
