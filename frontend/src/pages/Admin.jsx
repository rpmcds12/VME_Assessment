import { useCallback, useState } from 'react';
import AdminMatrix from '../components/AdminMatrix.jsx';
import MigrationPaths from '../components/MigrationPaths.jsx';
import { ToastContainer } from '../components/Toast.jsx';
import styles from './Admin.module.css';

let toastIdCounter = 0;

function Admin() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((variant, message) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, variant, message }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <main className={styles.main}>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Matrix Management</h1>
        <p className={styles.pageDesc}>
          Manage the HPE VM Essentials compatibility matrix used for all analyses.
        </p>
      </div>

      <div className={styles.sections}>
        <AdminMatrix onToast={addToast} />
        <MigrationPaths onToast={addToast} />
      </div>
    </main>
  );
}

export default Admin;
