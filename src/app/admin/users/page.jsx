"use client";

import { useEffect, useState } from "react";
import { Users, Search, Calendar, Mail, UserX, UserCheck, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      const res = await fetch("/api/admin/users", {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
      });
      const result = await res.json();

      if (res.ok && result.success) {
        setUsers(result.data || []);
      } else {
        toast.error("Failed to load customers");
      }
    } catch (error) {
      toast.error("An error occurred while fetching customers");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (userId, currentBlocked) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ blocked: !currentBlocked })
      });

      const result = await res.json();

      if (res.ok && result.success) {
        toast.success(result.message || "Customer status updated");
        // Update local state dynamically
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, blocked: !currentBlocked } : u));
      } else {
        toast.error(result.error || "Failed to update customer status");
      }
    } catch (error) {
      toast.error("An error occurred while saving customer status");
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const filteredUsers = users.filter((u) =>
    u.role !== 'admin' && (
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalCustomers = users.filter(u => u.role !== 'admin').length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-[#1a1d1f]">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#1a1d1f]">Customers</h2>
          <p className="text-xs text-[#6d7175] mt-0.5">View and manage registered customer profiles, including account status.</p>
        </div>
        <div className="bg-[#e4e6e7] text-[#1a1d1f] px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold text-xs border border-[#e1e3e5] shadow-xs">
          <Users size={14} />
          Total Customers: {totalCustomers}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-[#e1e3e5] rounded-xl shadow-xs overflow-hidden">
        
        {/* Search Header Bar */}
        <div className="p-4 border-b border-[#e1e3e5] bg-[#f6f6f7]/50 flex justify-end">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7175]" size={15} />
            <input
              type="text"
              placeholder="Search customers..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#babfc3] rounded-lg text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all text-[#1a1d1f]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Index Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f6f6f7] text-[#6d7175] border-b border-[#e1e3e5] uppercase font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3.5 font-bold">Customer Name</th>
                <th className="px-5 py-3.5 font-bold">Email Address</th>
                <th className="px-5 py-3.5 font-bold">Status</th>
                <th className="px-5 py-3.5 font-bold">Joined Date</th>
                <th className="px-5 py-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1e3e5]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-[#6d7175]">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-accent" size={20} />
                      <p className="font-semibold text-xs">Loading customers...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-[#6d7175] font-semibold">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isBlocked = !!user.blocked;
                  const isUpdating = !!actionLoading[user.id];

                  return (
                    <tr key={user.id} className="hover:bg-[#f6f6f7]/50 transition-colors">
                      {/* Name */}
                      <td className="px-5 py-3">
                        <div className="font-bold text-[#1a1d1f] flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#f1f2f4] border border-[#e1e3e5] text-[#1a1d1f] flex items-center justify-center font-bold text-xs">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          {user.name}
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5 text-[#6d7175] font-semibold">
                          <Mail size={13} />
                          {user.email}
                        </div>
                      </td>

                      {/* Status Badges */}
                      <td className="px-5 py-3">
                        <span className={isBlocked ? 'badge-danger' : 'badge-success'}>
                          {isBlocked ? <UserX size={12} /> : <UserCheck size={12} />}
                          {isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="px-5 py-3 text-[#6d7175]">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <Calendar size={13} />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Action buttons (Block/Unblock) */}
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleToggleBlock(user.id, isBlocked)}
                          disabled={isUpdating}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-[10px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            isBlocked
                              ? 'bg-[#008060] hover:bg-[#006e52] text-white shadow-xs'
                              : 'bg-white border border-[#babfc3] text-red-600 hover:bg-[#fff0f0] hover:border-red-300'
                          }`}
                        >
                          {isUpdating ? (
                            <>
                              <Loader2 size={11} className="animate-spin" />
                              Updating...
                            </>
                          ) : isBlocked ? (
                            <>
                              <UserCheck size={11} />
                              Unblock
                            </>
                          ) : (
                            <>
                              <UserX size={11} />
                              Block Account
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
