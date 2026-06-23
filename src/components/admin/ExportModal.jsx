import React, { useState } from 'react';
import { UploadCloud, X, Calendar, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExportModal({ isOpen, onClose, onConfirm }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!isOpen) return null;

  const handleExport = () => {
    // We only enforce the date filter if they are actually filtering on date,
    // but the prompt said "pass all active UI filters... filter all the datas". 
    // The user previously mentioned "pop up will not shown i need to filter all the datas".
    // Wait, the prompt said "Mandatory Date Filter: The Date Filter is a STRICT REQUIREMENT".
    // I will enforce the date requirement here.
    if (!startDate || !endDate) {
      toast.error('Start Date and End Date are required.', { id: 'export-validation' });
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start Date cannot be after End Date.', { id: 'export-validation' });
      return;
    }

    onConfirm({ startDate, endDate });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <UploadCloud className="text-blue-500" />
            Export AWS Data
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-400 flex items-start gap-3">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p>Please specify a date range to query the AWS database. Any active table filters (Order ID, Total Price, Product Name) will also be applied to this export.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <Calendar size={16} /> Start Date <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <Calendar size={16} /> End Date <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleExport}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <UploadCloud size={18} />
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
}
