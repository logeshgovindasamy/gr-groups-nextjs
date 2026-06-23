import React, { useState, useRef } from 'react';
import { UploadCloud, X, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExcelDropzoneModal({ isOpen, onClose, onSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (file) => {
    if (!file) return;
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error('Please upload a valid Excel or CSV file.', { id: 'import' });
      return;
    }

    setIsUploading(true);
    setMetrics(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      const res = await fetch('/api/admin/orders/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await res.json();

      if (res.ok) {
        setMetrics(result.telemetry);
        toast.success(`Successfully imported ${result.telemetry.savedRows} rows!`, { id: 'import' });
        if (onSuccess) onSuccess();
      } else {
        toast.error(`Import failed: ${result.error || result.message}`, { id: 'import' });
      }
    } catch (error) {
      console.error(error);
      toast.error('Network error during upload', { id: 'import' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    setMetrics(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <FileSpreadsheet className="text-blue-500" />
            Import Spreadsheet
          </h3>
          <button onClick={handleClose} disabled={isUploading} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {metrics ? (
            <div className="space-y-6 animate-in slide-in-from-bottom-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-green-700 dark:text-green-400">Import Successful</h4>
                <p className="text-sm text-green-600 dark:text-green-500 mt-1">Your data has been verified and saved to AWS.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                  <div className="text-3xl font-bold text-blue-600">{metrics.totalRows}</div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Total Parsed Rows</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                  <div className="text-3xl font-bold text-green-600">{metrics.savedRows}</div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Successfully Saved</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                  <div className="text-3xl font-bold text-red-500">{metrics.errors}</div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Failed Rows</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                  <div className="text-3xl font-bold text-purple-600">${metrics.totalRevenue.toFixed(2)}</div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Gross Revenue</div>
                </div>
              </div>

              {metrics.errorLogs && metrics.errorLogs.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800 text-sm max-h-32 overflow-y-auto">
                  <h5 className="font-bold text-red-600 flex items-center gap-1 mb-2"><AlertCircle size={16} /> Error Alerts</h5>
                  <ul className="list-disc pl-5 text-red-500 space-y-1">
                    {metrics.errorLogs.map((log, i) => <li key={i}>{log}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200
                ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'}
                ${isUploading ? 'opacity-70 pointer-events-none border-blue-400' : ''}
              `}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileSelect}
              />

              {isUploading ? (
                <div className="flex flex-col items-center py-6">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">Verifying and uploading rows to AWS...</h4>
                  <p className="text-sm text-gray-500 mt-2">This might take a moment.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className={`p-4 rounded-full mb-4 ${isDragging ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                    <UploadCloud size={32} />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    {isDragging ? 'Drop your spreadsheet here' : 'Drag and drop your .xlsx file here'}
                  </h4>
                  <p className="text-sm text-gray-500 mt-2">or click to browse from your computer</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
