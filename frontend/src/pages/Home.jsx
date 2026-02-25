import { useCallback, useRef, useState } from 'react';
import { analyzeFile, APIError } from '../api.js';
import UploadForm from '../components/UploadForm.jsx';
import ResultsPreview from '../components/ResultsPreview.jsx';
import { ToastContainer } from '../components/Toast.jsx';
import styles from './Home.module.css';

const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'The file exceeds the 10 MB size limit. Please upload a smaller file.',
  UNRECOGNIZED_FORMAT:
    'File format not recognized. Upload an RVTools or CloudPhysics .xlsx export.',
  MISSING_COLUMNS: 'Required columns are missing from the file.',
  PROCESSING_ERROR: 'An unexpected error occurred during processing. Please try again.',
};

let toastIdCounter = 0;

function Home() {
  // State: 'idle' | 'processing' | 'results' | 'error'
  const [phase, setPhase] = useState('idle');
  const [toasts, setToasts] = useState([]);
  const [results, setResults] = useState(null);
  const currentFileNameRef = useRef('VME-Analysis.xlsx');
  const currentCustomerRef = useRef('');

  function addToast(variant, message) {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, variant, message }]);
  }

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  async function handleSubmit(file, customerName) {
    setPhase('processing');
    currentCustomerRef.current = customerName;

    try {
      const { blob, summary } = await analyzeFile(file, customerName);
      const filename = `VME-Analysis${customerName ? `-${customerName.replace(/[^a-zA-Z0-9]/g, '-')}` : ''}.xlsx`;
      currentFileNameRef.current = filename;

      setResults({ blob, summary, filename, customerName });
      setPhase('results');
      addToast('success', `Analysis complete — ${summary?.total ?? 0} VMs classified`);
    } catch (err) {
      setPhase('idle');
      const message =
        err instanceof APIError
          ? (ERROR_MESSAGES[err.code] ?? err.message)
          : 'An unexpected error occurred. Please try again.';
      addToast('error', message);
    }
  }

  function handleNewAnalysis() {
    setPhase('idle');
    setResults(null);
  }

  return (
    <main className={styles.main}>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {phase !== 'results' && (
        <section className={styles.uploadSection}>
          <div className={styles.hero}>
            <h1 className={styles.heroTitle}>VME Compatibility Analyzer</h1>
            <p className={styles.heroSubtitle}>
              Upload an RVTools or CloudPhysics export to classify VMs against the
              HPE VM Essentials compatibility matrix.
            </p>
          </div>
          <UploadForm onSubmit={handleSubmit} isProcessing={phase === 'processing'} />
        </section>
      )}

      {phase === 'results' && results && (
        <section className={styles.resultsSection}>
          <div className={styles.resultsHeader}>
            <h2 className={styles.resultsTitle}>
              Analysis Complete
              {results.customerName && (
                <span className={styles.customerName}> — {results.customerName}</span>
              )}
            </h2>
          </div>
          <ResultsPreview
            summary={results.summary}
            blob={results.blob}
            filename={results.filename}
            customerName={results.customerName}
            onNewAnalysis={handleNewAnalysis}
          />
        </section>
      )}
    </main>
  );
}

export default Home;
