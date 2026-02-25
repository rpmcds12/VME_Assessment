const API_BASE = import.meta.env.VITE_API_URL || '';

export class APIError extends Error {
  constructor(code, message, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

/**
 * POST /api/analyze — upload an .xlsx file, receive classified xlsx report.
 *
 * @param {File} file - The .xlsx file to analyze
 * @param {string} [customerName] - Optional customer name for the report
 * @returns {{ blob: Blob, summary: object|null }}
 * @throws {APIError} on non-200 responses
 */
export async function analyzeFile(file, customerName) {
  const formData = new FormData();
  formData.append('file', file);
  if (customerName) formData.append('customer_name', customerName);

  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorBody;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = { code: 'UNKNOWN_ERROR', message: 'An unexpected error occurred.' };
    }
    throw new APIError(
      errorBody.code || 'UNKNOWN_ERROR',
      errorBody.message || 'An unexpected error occurred.',
      response.status,
    );
  }

  const summaryHeader = response.headers.get('X-Analysis-Summary');
  const summary = summaryHeader ? JSON.parse(summaryHeader) : null;
  const blob = await response.blob();

  return { blob, summary };
}

/**
 * Trigger a file download in the browser.
 *
 * @param {Blob} blob - The file contents
 * @param {string} filename - Suggested filename
 */
export function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
