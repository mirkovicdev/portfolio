'use client';

import { ReactNode } from 'react';
import { PyodideProvider } from '@/lib/pyodide';

interface PyodideWrapperProps {
  children: ReactNode;
}

export function PyodideWrapper({ children }: PyodideWrapperProps) {
  return <PyodideProvider>{children}</PyodideProvider>;
}
