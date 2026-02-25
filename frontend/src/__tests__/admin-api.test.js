import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMatrix, deleteMatrixEntry, APIError } from '../api.js';

describe('getMatrix', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('returns entries array from mocked fetch', async () => {
    const mockEntries = [
      {
        id: 1,
        os_vendor: 'Microsoft',
        os_family: 'Windows Server',
        os_versions: '2022,2019',
        classification_tier: 'officially_supported',
        notes: null,
        updated_at: '2025-01-01T00:00:00',
      },
    ];

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockEntries,
    });

    const result = await getMatrix();
    expect(result).toEqual(mockEntries);
    expect(fetch).toHaveBeenCalledWith('/api/admin/matrix', {});
  });

  it('throws APIError on 500 response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ code: 'INTERNAL_ERROR', message: 'Server error.' }),
    });

    await expect(getMatrix()).rejects.toBeInstanceOf(APIError);
  });
});

describe('deleteMatrixEntry', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('calls DELETE on the correct endpoint', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    await deleteMatrixEntry(42);
    expect(fetch).toHaveBeenCalledWith('/api/admin/matrix/42', { method: 'DELETE' });
  });

  it('throws APIError on 404 response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ code: 'NOT_FOUND', message: 'Matrix entry with id 42 not found.' }),
    });

    try {
      await deleteMatrixEntry(42);
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(APIError);
      expect(err.status).toBe(404);
      expect(err.code).toBe('NOT_FOUND');
    }
  });

  it('throws NETWORK_ERROR on fetch failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('Failed to fetch'));

    try {
      await deleteMatrixEntry(1);
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(APIError);
      expect(err.code).toBe('NETWORK_ERROR');
    }
  });
});
