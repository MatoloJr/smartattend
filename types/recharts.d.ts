// Fix for recharts ResponsiveContainer React 18 type compatibility
// This is a known issue: https://github.com/recharts/recharts/issues/2791
// Workaround: Use a more permissive type to bypass React 18 type strictness

import * as React from 'react';

declare module 'recharts' {
  export interface ResponsiveContainerProps {
    width?: string | number;
    height?: string | number;
    aspect?: number;
    minHeight?: number;
    minWidth?: number;
    debounce?: number;
    children?: React.ReactNode;
  }
  
  // Override to fix React 18 type compatibility issue
  // Using a function type that's compatible with React 18
  export const ResponsiveContainer: (props: ResponsiveContainerProps) => JSX.Element;
}

