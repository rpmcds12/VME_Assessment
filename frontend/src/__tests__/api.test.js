import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeFile, APIError } from '../api.js';

describe('analyzeFile', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('parses X-Analysis-Summary header correctly', async () => {
    const summary = {
      total: 10,
      officially_supported: 5,
      unofficially_supported: 2,
      supported_vdi: 0,
      needs_review: 1,
      needs_info: 1,
      not_supported: 1,
    };

    const mockBlob = new Blob(['fake xlsx'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const mockHeaders = new Map([['X-Analysis-Summary', JSON.stringify(summary)]]);
    const mockResponse = {
      ok: true,
      headers: {
        get: (key) => mockHeaders.get(key) ?? null,
      },
      blob: async () => mockBlob,
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(mockResponse);

    const file = new File(['data'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const result = await analyzeFile(file, 'Acme Corp');
    expect(result.summary).toEqual(summary);
    expect(result.blob).toBe(mockBlob);
  });

  it('returns null summary when header is missing', async () => {
    const mockBlob = new Blob(['fake xlsx']);
    const mockResponse = {
      ok: true,
      headers: { get: () => null },
      blob: async () => mockBlob,
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(mockResponse);

    const file = new File(['data'], 'test.xlsx');
    const result = await analyzeFile(file);
    expect(result.summary).toBeNull();
  });

  it('throws APIError on 400 response', async () => {
    const errorBody = {
      error: true,
      code: 'UNRECOGNIZED_FORMAT',
      message: 'File format not recognized.',
    };
    const mockResponse = {
      ok: false,
      status: 400,
      json: async () => errorBody,
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(mockResponse);

    const file = new File(['data'], 'bad.xlsx');
    await expect(analyzeFile(file)).rejects.toThrow(APIError);
  });

  it('throws APIError with correct code and status', async () => {
    const errorBody = {
      error: true,
      code: 'FILE_TOO_LARGE',
      message: 'File exceeds the 10 MB limit.',
    };
    const mockResponse = {
      ok: false,
      status: 413,
      json: async () => errorBody,
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(mockResponse);

    const file = new File(['data'], 'big.xlsx');
    try {
      await analyzeFile(file);
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(APIError);
      expect(err.code).toBe('FILE_TOO_LARGE');
      expect(err.status).toBe(413);
    }
  });

  it('throws APIError on 500 response', async () => {
    const errorBody = {
      error: true,
      code: 'PROCESSING_ERROR',
      message: 'An unexpected error occurred.',
    };
    const mockResponse = {
      ok: false,
      status: 500,
      json: async () => errorBody,
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(mockResponse);

    const file = new File(['data'], 'test.xlsx');
    await expect(analyzeFile(file)).rejects.toThrow(APIError);
  });
});
