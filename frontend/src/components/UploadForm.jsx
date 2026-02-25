import { useRef, useState } from 'react';
import { CloudUpload, File, X } from 'lucide-react';
import styles from './UploadForm.module.css';

const ACCEPTED_MIME = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'application/csv',
].join(',');

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadForm({ onSubmit, isProcessing }) {
  const [customerName, setCustomerName] = useState('');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState('');
  const inputRef = useRef(null);

  function handleFile(incoming) {
    if (!incoming) return;
    if (!incoming.name.endsWith('.xlsx') && !incoming.name.endsWith('.csv')) {
      setFileError('Only .xlsx and .csv files are accepted. Please select a valid RVTools or CloudPhysics export.');
      setFile(null);
      return;
    }
    setFileError('');
    setFile(incoming);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    if (isProcessing) return;
    const dropped = e.dataTransfer.files[0];
    handleFile(dropped);
  }

  function handleDragOver(e) {
    e.preventDefault();
    if (!isProcessing) setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleInputChange(e) {
    handleFile(e.target.files[0]);
    e.target.value = '';
  }

  function handleZoneClick() {
    if (!isProcessing) inputRef.current?.click();
  }

  function handleZoneKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleZoneClick();
    }
  }

  function removeFile(e) {
    e.stopPropagation();
    setFile(null);
    setFileError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!file || isProcessing) return;
    onSubmit(file, customerName.trim());
  }

  const zoneClass = [
    styles.zone,
    dragOver ? styles.zoneDragOver : '',
    file ? styles.zoneFileSelected : '',
    fileError ? styles.zoneError : '',
    isProcessing ? styles.zoneDisabled : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="customer-name" className={styles.label}>
          Customer Name (optional)
        </label>
        <input
          id="customer-name"
          type="text"
          className={styles.textInput}
          placeholder="Customer Name (optional)"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          disabled={isProcessing}
        />
      </div>

      <div
        className={zoneClass}
        role="button"
        tabIndex={isProcessing ? -1 : 0}
        aria-label="File upload zone"
        onClick={handleZoneClick}
        onKeyDown={handleZoneKeyDown}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_MIME}
          className={styles.hiddenInput}
          onChange={handleInputChange}
          tabIndex={-1}
          aria-hidden="true"
        />

        {file ? (
          <div className={styles.fileInfo}>
            <File size={24} className={styles.fileIcon} aria-hidden="true" />
            <div className={styles.fileMeta}>
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileSize}>{formatBytes(file.size)}</span>
            </div>
            {!isProcessing && (
              <button
                type="button"
                className={styles.removeBtn}
                onClick={removeFile}
                aria-label="Remove file"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ) : (
          <div className={styles.zoneContent}>
            <CloudUpload size={32} className={styles.uploadIcon} aria-hidden="true" />
            <span className={styles.zoneLabel}>Drop .xlsx or .csv file here or click to browse</span>
            <span className={styles.zoneSubtext}>RVTools or CloudPhysics export</span>
          </div>
        )}
      </div>

      {fileError && (
        <p className={styles.errorMsg} role="alert">
          {fileError}
        </p>
      )}

      <button
        type="submit"
        className={styles.analyzeBtn}
        disabled={!file || isProcessing}
      >
        {isProcessing ? (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            Processing…
          </>
        ) : (
          'Analyze'
        )}
      </button>

      {isProcessing && <div className={styles.progressBar} aria-label="Processing" />}
    </form>
  );
}

export default UploadForm;
