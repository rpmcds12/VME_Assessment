import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import styles from './Toast.module.css';

const AUTO_DISMISS_MS = 5000;

function Toast({ id, variant = 'info', message, onDismiss }) {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onDismiss(id);
    }, AUTO_DISMISS_MS);

    return () => clearTimeout(timerRef.current);
  }, [id, onDismiss]);

  return (
    <div
      className={`${styles.toast} ${styles[variant]}`}
      role="alert"
      aria-live="polite"
    >
      <span className={styles.message}>{message}</span>
      <button
        className={styles.closeBtn}
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
      <div className={styles.timerBar} />
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className={styles.container} aria-label="Notifications">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export default Toast;
