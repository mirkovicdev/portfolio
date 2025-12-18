'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import Script from 'next/script';

// Extend Window interface for Pyodide
declare global {
  interface Window {
    loadPyodide: ((config: { indexURL: string }) => Promise<PyodideInstance>) | undefined;
  }
}

// Pyodide instance type (simplified)
interface PyodideInstance {
  runPythonAsync: (code: string) => Promise<any>;
  loadPackage: (packages: string[]) => Promise<void>;
  globals: {
    get: (name: string) => any;
    set: (name: string, value: any) => void;
  };
}

interface PyodideContextValue {
  pyodide: PyodideInstance | null;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  runPython: (code: string) => Promise<any>;
  loadPackages: (packages: string[]) => Promise<void>;
}

const PyodideContext = createContext<PyodideContextValue | null>(null);

// Track loaded packages globally to avoid re-loading
const loadedPackages = new Set<string>();

// Singleton promise to prevent multiple simultaneous initializations
let initializationPromise: Promise<PyodideInstance> | null = null;
let globalPyodideInstance: PyodideInstance | null = null;

const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/';
const DEFAULT_PACKAGES = ['numpy', 'pandas'];

interface PyodideProviderProps {
  children: ReactNode;
}

export function PyodideProvider({ children }: PyodideProviderProps) {
  const [pyodide, setPyodide] = useState<PyodideInstance | null>(globalPyodideInstance);
  const [isReady, setIsReady] = useState(!!globalPyodideInstance);
  const [isLoading, setIsLoading] = useState(!globalPyodideInstance);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(!!window?.loadPyodide);
  const initStarted = useRef(false);

  // Initialize Pyodide (singleton pattern)
  const initializePyodide = useCallback(async (): Promise<PyodideInstance> => {
    // Return existing instance if available
    if (globalPyodideInstance) {
      return globalPyodideInstance;
    }

    // Return existing initialization promise if in progress
    if (initializationPromise) {
      return initializationPromise;
    }

    // Start new initialization
    initializationPromise = (async () => {
      // Wait for script to be available
      let attempts = 0;
      const maxAttempts = 100; // 10 seconds max

      while (!window.loadPyodide && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      if (!window.loadPyodide) {
        throw new Error('Pyodide script failed to load');
      }

      console.log('[Pyodide] Initializing runtime...');
      const instance = await window.loadPyodide({
        indexURL: PYODIDE_CDN,
      });

      // Pre-load default packages
      console.log('[Pyodide] Loading default packages (numpy, pandas)...');
      await instance.loadPackage(DEFAULT_PACKAGES);
      DEFAULT_PACKAGES.forEach((pkg) => loadedPackages.add(pkg));

      console.log('[Pyodide] Ready!');
      globalPyodideInstance = instance;
      return instance;
    })();

    try {
      return await initializationPromise;
    } catch (err) {
      initializationPromise = null; // Reset on failure to allow retry
      throw err;
    }
  }, []);

  // Run Python code with error handling
  const runPython = useCallback(
    async (code: string): Promise<any> => {
      if (!pyodide) {
        throw new Error('Pyodide is not ready');
      }
      return pyodide.runPythonAsync(code);
    },
    [pyodide]
  );

  // Load additional packages on demand
  const loadPackages = useCallback(
    async (packages: string[]): Promise<void> => {
      if (!pyodide) {
        throw new Error('Pyodide is not ready');
      }

      const newPackages = packages.filter((pkg) => !loadedPackages.has(pkg));
      if (newPackages.length > 0) {
        console.log('[Pyodide] Loading additional packages:', newPackages);
        await pyodide.loadPackage(newPackages);
        newPackages.forEach((pkg) => loadedPackages.add(pkg));
      }
    },
    [pyodide]
  );

  // Initialize when script is loaded
  useEffect(() => {
    if (!scriptLoaded || initStarted.current) return;
    initStarted.current = true;

    setIsLoading(true);
    initializePyodide()
      .then((instance) => {
        setPyodide(instance);
        setIsReady(true);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('[Pyodide] Initialization failed:', err);
        setError(err.message || 'Failed to initialize Pyodide');
        setIsLoading(false);
        initStarted.current = false; // Allow retry
      });
  }, [scriptLoaded, initializePyodide]);

  // Handle script load event
  const handleScriptLoad = useCallback(() => {
    console.log('[Pyodide] Script loaded');
    setScriptLoaded(true);
  }, []);

  const handleScriptError = useCallback(() => {
    console.error('[Pyodide] Script failed to load');
    setError('Failed to load Pyodide script');
    setIsLoading(false);
  }, []);

  const contextValue: PyodideContextValue = {
    pyodide,
    isReady,
    isLoading,
    error,
    runPython,
    loadPackages,
  };

  return (
    <PyodideContext.Provider value={contextValue}>
      {/* Only load script if not already available */}
      {!window?.loadPyodide && (
        <Script
          src={`${PYODIDE_CDN}pyodide.js`}
          strategy="lazyOnload"
          onLoad={handleScriptLoad}
          onError={handleScriptError}
        />
      )}
      {children}
    </PyodideContext.Provider>
  );
}

// Hook to use Pyodide
export function usePyodide(): PyodideContextValue {
  const context = useContext(PyodideContext);
  if (!context) {
    throw new Error('usePyodide must be used within a PyodideProvider');
  }
  return context;
}

// Optional: Hook that doesn't throw if outside provider (for conditional usage)
export function usePyodideOptional(): PyodideContextValue | null {
  return useContext(PyodideContext);
}
