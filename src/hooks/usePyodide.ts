'use client';

/**
 * Loads Pyodide (real CPython compiled to WebAssembly) from the jsDelivr CDN
 * on first use and reuses the same interpreter after — no bundling a ~10MB
 * runtime into the app, no server execution, no per-run cost. This is the
 * whole engine behind challenge-type tasks (docs/PRODUCT.md §4).
 */
import { useCallback } from 'react';

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
}

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

const PYODIDE_VERSION = '0.26.4';
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodidePromise: Promise<PyodideInterface> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not reach the Python runtime (network blocked?)'));
    document.head.appendChild(script);
  });
}

function getPyodide(): Promise<PyodideInterface> {
  pyodidePromise ??= (async () => {
    await loadScript(`${PYODIDE_CDN}pyodide.js`);
    if (!window.loadPyodide) throw new Error('Python runtime failed to initialize');
    return window.loadPyodide({ indexURL: PYODIDE_CDN });
  })();
  return pyodidePromise;
}

export type ChallengeOutcome = { passed: true } | { passed: false; error: string };

export function usePyodide() {
  const run = useCallback(async (userCode: string, testCode: string): Promise<ChallengeOutcome> => {
    let pyodide: PyodideInterface;
    try {
      pyodide = await getPyodide();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { passed: false, error: `Failed to load the Python runtime: ${message}` };
    }

    try {
      await pyodide.runPythonAsync(userCode);
      await pyodide.runPythonAsync(testCode);
      return { passed: true };
    } catch (err) {
      return { passed: false, error: err instanceof Error ? err.message : String(err) };
    }
  }, []);

  return { run };
}
