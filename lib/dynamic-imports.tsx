import dynamic from 'next/dynamic';
import React from 'react';

const LoadingPlaceholder = () => {
  return React.createElement('div', {
    className: "animate-pulse bg-gray-200 rounded-lg h-64"
  });
};

// UI Components
export const DynamicQRScanner = dynamic(
  () => import('@/components/qr/QRScanner'),
  {
    loading: LoadingPlaceholder,
    ssr: false
  }
);

export const DynamicQRGenerator = dynamic(
  () => import('@/components/qr/QRGenerator'),
  {
    loading: LoadingPlaceholder,
    ssr: false
  }
);

// Charts
export const DynamicAttendanceChart = dynamic(
  () => import('@/components/charts/AttendanceChart'),
  {
    loading: LoadingPlaceholder,
    ssr: false
  }
);

export const DynamicDepartmentChart = dynamic(
  () => import('@/components/charts/DepartmentChart'),
  {
    loading: LoadingPlaceholder,
    ssr: false
  }
);