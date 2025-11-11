import { format } from 'date-fns';

type ExportFormat = 'csv' | 'excel' | 'json' | 'pdf';

interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  format?: ExportFormat;
  columns?: string[];
}

const defaultOptions: Required<ExportOptions> = {
  filename: 'export',
  includeHeaders: true,
  format: 'csv',
  columns: [],
};

export function exportData<T extends Record<string, any>>(
  data: T[], 
  options: ExportOptions = {}
) {
  const { filename, includeHeaders, format, columns } = { ...defaultOptions, ...options };
  const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
  const actualFilename = `${filename}-${timestamp}`;
  
  // If specific columns are provided, filter the data to only include those columns
  const processedData = columns.length > 0 
    ? data.map(item => {
        const filteredItem: Record<string, any> = {};
        columns.forEach(key => {
          if (key in item) {
            filteredItem[key] = item[key];
          }
        });
        return filteredItem;
      })
    : data;

  // Handle different export formats
  if (format === 'csv') {
    exportToCSV(processedData, actualFilename, includeHeaders);
  } else if (format === 'excel') {
    exportToExcel(processedData, actualFilename, includeHeaders);
  } else if (format === 'pdf') {
    exportToPDF(processedData, actualFilename, includeHeaders);
  } else {
    // Default to JSON
    exportToJSON(processedData, actualFilename);
  }
}

function convertToCSV(
  data: Record<string, any>[], 
  includeHeaders: boolean
): string {
  if (data.length === 0) return '';
  
  // Get all unique keys from all objects
  const allKeys = new Set<string>();
  data.forEach(item => {
    Object.keys(item).forEach(key => allKeys.add(key));
  });
  
  const headers = Array.from(allKeys);
  const csvRows: string[] = [];
  
  // Add headers if needed
  if (includeHeaders) {
    csvRows.push(headers.join(','));
  }
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes if the value contains commas, newlines, or quotes
      const escaped = ('' + (value !== null && value !== undefined ? value : ''))
        .replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

function exportToCSV(
  data: Record<string, any>[], 
  filename: string, 
  includeHeaders: boolean
) {
  const csvContent = convertToCSV(data, includeHeaders);
  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

function exportToExcel(
  data: Record<string, any>[], 
  filename: string, 
  includeHeaders: boolean
) {
  // For Excel, we can use the CSV format with a .xls extension for simplicity
  // In a real app, you might want to use a library like 'xlsx' for proper Excel file generation
  const csvContent = convertToCSV(data, includeHeaders);
  downloadFile(csvContent, `${filename}.xls`, 'application/vnd.ms-excel');
}

function exportToPDF(
  data: Record<string, any>[], 
  filename: string, 
  includeHeaders: boolean
) {
  // In a real app, you would use a PDF generation library like jsPDF or pdf-lib
  // This is a simplified version that just creates a text representation
  const headers = data.length > 0 ? Object.keys(data[0]) : [];
  let pdfContent = `%PDF-1.4\n`; // Simplified PDF header
  
  if (includeHeaders && headers.length > 0) {
    pdfContent += headers.join('\t') + '\n';
  }
  
  for (const row of data) {
    const rowValues = headers.map(header => row[header] || '');
    pdfContent += rowValues.join('\t') + '\n';
  }
  
  downloadFile(pdfContent, `${filename}.pdf`, 'application/pdf');
}

function exportToJSON(data: any, filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// User-specific export function
export function exportUsers(
  users: any[], 
  selectedUserIds: string[] = [], 
  options: Omit<ExportOptions, 'filename'> = {}
) {
  // If specific users are selected, filter the list
  const dataToExport = selectedUserIds.length > 0
    ? users.filter(user => selectedUserIds.includes(user.id))
    : users;
  
  // Define the columns to include in the export
  const columns = [
    'id',
    'name',
    'email',
    'username',
    'role',
    'status',
    'lastLogin',
    'createdAt',
    'studentId',
    'employeeId',
    'department',
    'phoneNumber'
  ];
  
  // Format the data for export
  const formattedData = dataToExport.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    status: user.status,
    lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never',
    createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
    studentId: user.studentId || 'N/A',
    employeeId: user.employeeId || 'N/A',
    department: user.department || 'N/A',
    phoneNumber: user.phoneNumber || 'N/A',
  }));
  
  // Perform the export
  return exportData(formattedData, {
    ...options,
    filename: selectedUserIds.length > 0 ? 'selected-users' : 'all-users',
    columns,
  });
}
