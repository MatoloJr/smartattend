import dynamic from 'next/dynamic';
import React from 'react';

const LoadingPlaceholder: React.FC = () => {
  return React.createElement('div', {
    className: "animate-pulse bg-gray-200 rounded-lg h-64"
  });
};

// UI Components
export const DynamicQRScanner = dynamic(
  () => import('@/components/qr/QRScanner').then((mod) => mod.default),
  {
    loading: LoadingPlaceholder,
    ssr: false
  }
);

export const DynamicQRGenerator = dynamic(
  () => import('@/components/qr/QRGenerator').then((mod) => mod.default),
  {
    loading: LoadingPlaceholder,
    ssr: false
  }
);

// Charts
export const DynamicAttendanceChart = dynamic(
  () => import('@/components/charts/AttendanceChart').then((mod) => mod.default),
  {
    loading: LoadingPlaceholder,
    ssr: false
  }
);

export const DynamicDepartmentChart = dynamic(
  () => import('@/components/charts/DepartmentChart').then((mod) => mod.default),
  {
    loading: LoadingPlaceholder,
    ssr: false
  }
);