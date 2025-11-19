// Fix for recharts ResponsiveContainer React 18 type compatibility
// This is a known issue: https://github.com/recharts/recharts/issues/2791
// Root cause: recharts expects ReactElement with key: string | null, but React 18 uses Key | null (Key = string | number)

import * as React from 'react';

declare module 'recharts' {
  // Override ResponsiveContainerProps to accept React 18 compatible children
  export interface ResponsiveContainerProps {
    width?: string | number;
    height?: string | number;
    aspect?: number;
    minHeight?: number;
    minWidth?: number;
    debounce?: number;
    // Accept any valid React children to bypass the strict key type requirement
    // Using ReactNode allows ReactElement with any key type (string | number | null)
    children?: React.ReactNode;
  }
  
  // Override ResponsiveContainer with a type that's fully compatible with React 18
  // This type accepts ReactNode which includes ReactElement with Key | null (not just string | null)
  export const ResponsiveContainer: React.FC<ResponsiveContainerProps>;
}

