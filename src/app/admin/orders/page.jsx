"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import ExcelDropzoneModal from "@/components/admin/ExcelDropzoneModal";
import ExportModal from "@/components/admin/ExportModal";

export default function AdminOrdersPage() {
  const [soldItems, setSoldItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterOrderId, setFilterOrderId] = useState("");
  const [filterTotalPrice, setFilterTotalPrice] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders", { headers: { 'Cache-Control': 'no-cache' } });
      const result = await res.json();

      const data = result.data || result;
      if (Array.isArray(data)) {
        let items = [];
        data.forEach(order => {
          if (order.orderItems) {
            order.orderItems.forEach(item => {
              items.push({
                ...item,
                orderId: order.id,
                date: order.createdAt || order.date,
              });
            });
          }
        });

        // Sort newest first
        items.sort((a, b) => new Date(b.date) - new Date(a.date));
        setSoldItems(items);
      }
    } catch (error) {
      toast.error("Failed to fetch sales history");
    } finally {
      setLoading(false);
    }
  };

  const handleExportWithFilters = async ({ startDate, endDate }) => {
    try {
      setIsExportModalOpen(false);
      setIsExporting(true);
      toast.loading("Querying AWS and exporting data...", { id: 'export' });

      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      // Gather all UI filters
      const queryParams = new URLSearchParams();
      queryParams.append('startDate', startDate);
      queryParams.append('endDate', endDate);
      if (filterOrderId) queryParams.append('orderId', filterOrderId);
      if (search) queryParams.append('productName', search);
      if (filterTotalPrice) queryParams.append('totalPrice', filterTotalPrice);

      const queryString = queryParams.toString();
      const fetchUrl = `/api/admin/orders/export?${queryString}`;

      const res = await fetch(fetchUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorResult = await res.json();
        throw new Error(errorResult.message || 'Export failed from backend');
      }

      const result = await res.json();
      const { telemetry, csvData } = result.data || result;

      toast.success(`Export complete: ${telemetry.success} rows exported successfully!`, { id: 'export', duration: 5000 });

      if (csvData) {
        const workbook = XLSX.read(csvData, { type: 'string' });
        XLSX.writeFile(workbook, `orders-export-${startDate}-to-${endDate}.xlsx`);
      }

    } catch (error) {
      console.error("Export failed:", error);
      toast.error(error.message || "Failed to generate Excel file", { id: 'export' });
    } finally {
      setIsExporting(false);
    }
  };

  const filteredItems = soldItems.filter((item) => {
    const searchTarget = item.name || "";
    const orderIdTarget = item.orderId || "";
    const matchesProduct = searchTarget.toLowerCase().includes(search.toLowerCase());
    const matchesOrder = filterOrderId ? orderIdTarget.toLowerCase().includes(filterOrderId.toLowerCase()) : true;

    const itemTotalValue = Number(item.price) * Number(item.qty);
    const matchesPrice = filterTotalPrice ? itemTotalValue === Number(filterTotalPrice) : true;

    return matchesProduct && matchesOrder && matchesPrice;
  });

  // Prevent scrolling from changing number inputs
  useEffect(() => {
    const handleWheel = (e) => {
      if (document.activeElement === e.target && e.target.type === 'number') {
        e.target.blur();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-[#1a1d1f]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#1a1d1f]">Orders</h2>
          <p className="text-xs text-[#6d7175] mt-0.5">Track and view sold items, quantities, and spreadsheet records.</p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="btn-outline flex items-center gap-2 justify-center py-2 px-3 text-xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
            Import Spreadsheet
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            disabled={isExporting}
            className="btn-primary flex items-center gap-2 justify-center py-2 px-3 text-xs disabled:opacity-50"
          >
            {isExporting ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
            )}
            {isExporting ? "Exporting..." : "Export Data"}
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-[#e1e3e5] rounded-xl shadow-xs overflow-hidden">
        
        {/* Filters and Search Bar */}
        <div className="p-4 border-b border-[#e1e3e5] bg-[#f6f6f7]/50 flex flex-col md:flex-row items-stretch gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7175]" size={15} />
            <input
              type="text"
              placeholder="Search by product name..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#babfc3] rounded-lg text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all text-[#1a1d1f]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Order ID Filter */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Filter by Order ID..."
              className="w-full px-3 py-1.5 bg-white border border-[#babfc3] rounded-lg text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all text-[#1a1d1f]"
              value={filterOrderId}
              onChange={(e) => setFilterOrderId(e.target.value)}
            />
          </div>
          {/* Total Price Filter */}
          <div className="relative flex-1">
            <input
              type="number"
              placeholder="Filter by Total Price..."
              className="w-full px-3 py-1.5 bg-white border border-[#babfc3] rounded-lg text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all text-[#1a1d1f] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
              value={filterTotalPrice}
              onChange={(e) => setFilterTotalPrice(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                  e.preventDefault();
                }
              }}
            />
          </div>
        </div>

        {/* Index Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f6f6f7] text-[#6d7175] border-b border-[#e1e3e5] uppercase font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3.5 font-bold">Product Name</th>
                <th className="px-5 py-3.5 font-bold">Date Sold</th>
                <th className="px-5 py-3.5 font-bold">Price (per item)</th>
                <th className="px-5 py-3.5 font-bold">Quantity</th>
                <th className="px-5 py-3.5 font-bold">Total Value</th>
                <th className="px-5 py-3.5 font-bold">Order ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1e3e5]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-[#6d7175]">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                      <p className="font-semibold text-xs">Loading sales...</p>
                    </div>
                  </td>
                </tr>
              ) : soldItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-[#6d7175] text-sm font-semibold">
                    No orders recorded yet.
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-[#6d7175] font-semibold">
                    No orders matching your filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => (
                  <tr key={`${item.orderId}-${index}`} className="hover:bg-[#f6f6f7]/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-7 h-7 rounded border border-[#e1e3e5] object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-7 h-7 rounded border border-[#e1e3e5] bg-[#f1f2f4] flex items-center justify-center font-bold text-[#6d7175] flex-shrink-0">
                            {(item.name || "P").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-bold text-[#1a1d1f] text-sm">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#6d7175] font-medium">
                      {new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-3 font-semibold text-[#1a1d1f]">${Number(item.price).toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 bg-[#e4e6e7] text-[#1a1d1f] rounded text-[10px] font-bold">
                        {item.qty}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-bold text-[#1a1d1f]">
                      ${(Number(item.price) * Number(item.qty)).toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-[10px] text-[#6d7175] uppercase tracking-wider font-semibold">
                      #{item.orderId?.split('-').pop() || item.orderId}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ExcelDropzoneModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => fetchOrders()}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onConfirm={handleExportWithFilters}
      />
    </div>
  );
}
