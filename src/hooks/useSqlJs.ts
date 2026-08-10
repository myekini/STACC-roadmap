'use client';

/**
 * Loads sql.js (SQLite compiled to WebAssembly) from the jsDelivr CDN on
 * first use — the SQL-challenge counterpart to usePyodide. Same reasoning:
 * no bundling a WASM runtime into the app, no server execution.
 */
import { useCallback } from 'react';
import type { SqlChallengePayload } from '@/lib/database.types';

interface SqlJsDatabase {
  run: (sql: string) => void;
  exec: (sql: string) => { columns: string[]; values: unknown[][] }[];
}

interface SqlJsStatic {
  Database: new () => SqlJsDatabase;
}

declare global {
  interface Window {
    initSqlJs?: (opts: { locateFile: (file: string) => string }) => Promise<SqlJsStatic>;
  }
}

const SQLJS_VERSION = '1.10.3';
const SQLJS_CDN = `https://cdn.jsdelivr.net/npm/sql.js@${SQLJS_VERSION}/dist/`;

let sqlJsPromise: Promise<SqlJsStatic> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not reach the SQL runtime (network blocked?)'));
    document.head.appendChild(script);
  });
}

function getSqlJs(): Promise<SqlJsStatic> {
  sqlJsPromise ??= (async () => {
    await loadScript(`${SQLJS_CDN}sql-wasm.js`);
    if (!window.initSqlJs) throw new Error('SQL runtime failed to initialize');
    return window.initSqlJs({ locateFile: (file) => `${SQLJS_CDN}${file}` });
  })();
  return sqlJsPromise;
}

export type SqlChallengeOutcome = { passed: true } | { passed: false; error: string };

export function useSqlJs() {
  const run = useCallback(async (challenge: SqlChallengePayload, userQuery: string): Promise<SqlChallengeOutcome> => {
    let SQL: SqlJsStatic;
    try {
      SQL = await getSqlJs();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { passed: false, error: `Failed to load the SQL runtime: ${message}` };
    }

    try {
      const db = new SQL.Database();
      db.run(challenge.setupSql);
      const result = db.exec(userQuery);
      const actual: Record<string, unknown>[] = result.length
        ? result[0].values.map((row) => Object.fromEntries(result[0].columns.map((col, i) => [col, row[i]])))
        : [];

      const normalize = (rows: Record<string, unknown>[]) => JSON.stringify(rows);
      if (normalize(actual) !== normalize(challenge.expectedRows)) {
        return {
          passed: false,
          error: `Expected ${challenge.expectedRows.length} row(s):\n${JSON.stringify(challenge.expectedRows, null, 2)}\n\nGot ${actual.length} row(s):\n${JSON.stringify(actual, null, 2)}`,
        };
      }
      return { passed: true };
    } catch (err) {
      return { passed: false, error: err instanceof Error ? err.message : String(err) };
    }
  }, []);

  return { run };
}
