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

// ---------------------------------------------------------------------------
// Admin API helpers
// ---------------------------------------------------------------------------

async function adminFetch(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, options);
  } catch {
    throw new APIError('NETWORK_ERROR', 'Connection failed — check if the server is running.', 0);
  }

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

  // 204 No Content — no body to parse
  if (response.status === 204) return null;

  return response.json();
}

/**
 * GET /api/admin/matrix — fetch all VME matrix entries.
 * @returns {Array} list of matrix entries
 */
export function getMatrix() {
  return adminFetch('/api/admin/matrix');
}

/**
 * POST /api/admin/matrix — create a new matrix entry.
 * @param {{ os_vendor, os_family, os_versions, classification_tier, notes? }} entry
 */
export function createMatrixEntry(entry) {
  return adminFetch('/api/admin/matrix', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
}

/**
 * PUT /api/admin/matrix/{id} — update an existing matrix entry.
 * @param {number} id
 * @param {object} entry - partial or full entry fields
 */
export function updateMatrixEntry(id, entry) {
  return adminFetch(`/api/admin/matrix/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
}

/**
 * DELETE /api/admin/matrix/{id} — delete a matrix entry.
 * @param {number} id
 */
export function deleteMatrixEntry(id) {
  return adminFetch(`/api/admin/matrix/${id}`, { method: 'DELETE' });
}

/**
 * GET /api/admin/migration-paths — fetch all migration path entries.
 * @returns {Array} list of migration path entries
 */
export function getMigrationPaths() {
  return adminFetch('/api/admin/migration-paths');
}

/**
 * PUT /api/admin/migration-paths/{id} — update guidance_text for a migration path.
 * @param {number} id
 * @param {string} guidanceText
 */
export function updateMigrationPath(id, guidanceText) {
  return adminFetch(`/api/admin/migration-paths/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guidance_text: guidanceText }),
  });
}

// ---------------------------------------------------------------------------

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
