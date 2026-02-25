import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { TIER_CONFIG, ALL_TIERS } from '../config/tiers.js';
import { createMatrixEntry, updateMatrixEntry } from '../api.js';
import styles from './MatrixEntryModal.module.css';

const EMPTY_FORM = {
  os_vendor: '',
  os_family: '',
  os_versions: '',
  classification_tier: 'officially_supported',
  notes: '',
};

function validate(fields) {
  const errors = {};
  if (!fields.os_vendor.trim()) errors.os_vendor = 'OS Vendor is required.';
  if (!fields.os_family.trim()) errors.os_family = 'OS Family is required.';
  if (!fields.os_versions.trim()) errors.os_versions = 'OS Versions is required.';
  return errors;
}

function MatrixEntryModal({ entry, onClose, onSaved }) {
  const isEdit = !!entry;
  const [fields, setFields] = useState(
    entry
      ? {
          os_vendor: entry.os_vendor ?? '',
          os_family: entry.os_family ?? '',
          os_versions: entry.os_versions ?? '',
          classification_tier: entry.classification_tier ?? 'officially_supported',
          notes: entry.notes ?? '',
        }
      : { ...EMPTY_FORM },
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const firstInputRef = useRef(null);
  const modalRef = useRef(null);

  // Focus first input on open
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  // Escape key closes modal
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Focus trap
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    function handleFocusTrap(e) {
      if (e.key !== 'Tab') return;
      const focusable = modal.querySelectorAll(
        'input, select, textarea, button, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    modal.addEventListener('keydown', handleFocusTrap);
    return () => modal.removeEventListener('keydown', handleFocusTrap);
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    setSaveError('');

    const payload = {
      os_vendor: fields.os_vendor.trim(),
      os_family: fields.os_family.trim(),
      os_versions: fields.os_versions.trim(),
      classification_tier: fields.classification_tier,
      notes: fields.notes.trim() || null,
    };

    try {
      if (isEdit) {
        await updateMatrixEntry(entry.id, payload);
        onSaved('Entry updated successfully.');
      } else {
        await createMatrixEntry(payload);
        onSaved('Entry added successfully.');
      }
    } catch (err) {
      setSaveError(err.message || 'An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Edit OS Entry' : 'Add OS Entry'}
    >
      <div className={styles.modal} ref={modalRef}>
        <div className={styles.header}>
          <h2 className={styles.title}>{isEdit ? 'Edit OS Entry' : 'Add OS Entry'}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.body}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="modal-os-vendor">
                OS Vendor <span className={styles.required}>*</span>
              </label>
              <input
                ref={firstInputRef}
                id="modal-os-vendor"
                name="os_vendor"
                type="text"
                className={`${styles.input} ${errors.os_vendor ? styles.inputError : ''}`}
                value={fields.os_vendor}
                onChange={handleChange}
                placeholder="e.g. Microsoft"
              />
              {errors.os_vendor && (
                <span className={styles.fieldError}>{errors.os_vendor}</span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="modal-os-family">
                OS Family <span className={styles.required}>*</span>
              </label>
              <input
                id="modal-os-family"
                name="os_family"
                type="text"
                className={`${styles.input} ${errors.os_family ? styles.inputError : ''}`}
                value={fields.os_family}
                onChange={handleChange}
                placeholder="e.g. Windows Server"
              />
              {errors.os_family && (
                <span className={styles.fieldError}>{errors.os_family}</span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="modal-os-versions">
                OS Versions <span className={styles.required}>*</span>
              </label>
              <input
                id="modal-os-versions"
                name="os_versions"
                type="text"
                className={`${styles.input} ${errors.os_versions ? styles.inputError : ''}`}
                value={fields.os_versions}
                onChange={handleChange}
                placeholder="e.g. 2016,2019,2022,2025 or 'any'"
              />
              {errors.os_versions && (
                <span className={styles.fieldError}>{errors.os_versions}</span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="modal-tier">
                Classification
              </label>
              <select
                id="modal-tier"
                name="classification_tier"
                className={styles.select}
                value={fields.classification_tier}
                onChange={handleChange}
              >
                {ALL_TIERS.map((tier) => (
                  <option key={tier} value={tier}>
                    {TIER_CONFIG[tier].label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="modal-notes">
                Notes <span className={styles.optional}>(optional)</span>
              </label>
              <textarea
                id="modal-notes"
                name="notes"
                className={styles.textarea}
                value={fields.notes}
                onChange={handleChange}
                rows={3}
                placeholder="e.g. HPE validated"
              />
            </div>

            {saveError && (
              <p className={styles.saveError} role="alert">
                {saveError}
              </p>
            )}
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? (isEdit ? 'Saving…' : 'Adding…') : isEdit ? 'Save Changes' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MatrixEntryModal;
