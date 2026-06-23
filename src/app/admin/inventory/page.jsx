"use client";

import { useEffect, useState } from "react";
import { Users, Search, Calendar, Mail, ShieldAlert, ShieldCheck, Eye, X, Clock, Package } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminInventoryPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

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
        toast.error("Failed to load users");
      }
    } catch (error) {
      toast.error("An error occurred while fetching users");
    } finally {
      setLoading(false);
    }
  };

  const openUserModal = async (user) => {
    setSelectedUser(user);
    setLoadingOrders(true);
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      const res = await fetch(`/api/admin/users/${user.id}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();

      if (res.ok && result.success) {
        setUserOrders(result.data || []);
      } else {
        toast.error("Failed to load customer orders");
        setUserOrders([]);
      }
    } catch (error) {
      toast.error("An error occurred while fetching orders");
      setUserOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setUserOrders([]);
  };

  const filteredUsers = users.filter((u) =>
    u.role !== 'admin' && (
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalCustomers = users.filter(u => u.role !== 'admin').length;

  // Helper to format time ago
  const timeSince = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-[#1a1d1f]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#1a1d1f]">Customer Activity</h2>
          <p className="text-xs text-[#6d7175] mt-0.5">Monitor lifetime spend, login frequency, and transaction history.</p>
        </div>
        <div className="bg-[#e4e6e7] text-[#1a1d1f] px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold text-xs border border-[#e1e3e5] shadow-xs">
          <Users size={14} />
          Total Customers: {totalCustomers}
        </div>
      </div>

      {/* Main Table/Grid Card */}
      <div className="bg-white border border-[#e1e3e5] rounded-xl shadow-xs overflow-hidden">
        
        {/* Search header bar */}
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

        {/* Customer Cards Grid */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 bg-[#f6f6f7]/20">
          {loading ? (
            <div className="col-span-full py-12 flex flex-col items-center gap-2 text-[#6d7175]">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
              <p className="font-semibold text-xs">Loading customers...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="col-span-full py-12 text-center text-[#6d7175] font-semibold text-xs">
              No customers found matching your search.
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div 
                key={user.id} 
                className="bg-white border border-[#e1e3e5] rounded-xl p-5 shadow-xs flex flex-col justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f1f2f4] border border-[#e1e3e5] text-[#1a1d1f] flex items-center justify-center text-sm font-bold shadow-xs">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a1d1f] text-sm">{user.name}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-[#6d7175] font-bold mt-0.5 uppercase tracking-wide">
                      <Calendar size={11} />
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="pt-3.5 border-t border-[#e1e3e5] mt-2">
                  <button 
                    onClick={() => openUserModal(user)}
                    className="btn-outline w-full flex items-center justify-center gap-1.5 py-1.5 text-xs"
                  >
                    <Eye size={14} /> View Activity
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Customer Activity Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1d1f]/45 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#e1e3e5] rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col text-[#1a1d1f]">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#e1e3e5] flex justify-between items-start">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#f1f2f4] border border-[#e1e3e5] text-[#1a1d1f] flex items-center justify-center text-base font-bold">
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1a1d1f]">{selectedUser.name}</h3>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#6d7175] font-semibold mt-0.5">
                    <span className="flex items-center gap-1"><Mail size={12} /> {selectedUser.email}</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> Joined {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <button onClick={closeModal} className="p-1.5 text-[#6d7175] hover:text-[#1a1d1f] hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 bg-[#f6f6f7]/40">
              
              {/* Session / Login Info */}
              <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-[#e1e3e5] shadow-xs flex items-center gap-3.5">
                  <div className="p-2.5 bg-gray-100 border border-[#e1e3e5] text-[#1a1d1f] rounded-lg">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#6d7175] uppercase tracking-wider">Session Status</p>
                    {selectedUser.lastLoginAt ? (
                      <p className="text-sm font-bold text-[#1a1d1f] mt-0.5">
                        Logged in <span className="text-[#008060]">{timeSince(selectedUser.lastLoginAt)}</span>
                      </p>
                    ) : (
                      <p className="text-sm font-bold text-[#6d7175] mt-0.5">No recent login</p>
                    )}
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-[#e1e3e5] shadow-xs flex items-center gap-3.5">
                  <div className="p-2.5 bg-gray-100 border border-[#e1e3e5] text-[#1a1d1f] rounded-lg">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#6d7175] uppercase tracking-wider">Lifetime Spend</p>
                    <p className="text-sm font-bold text-[#1a1d1f] mt-0.5">
                      ${userOrders.reduce((acc, item) => acc + (Number(item.price) * Number(item.qty)), 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Purchase Activity */}
              <h4 className="text-xs font-bold text-[#6d7175] uppercase tracking-wider mb-2.5">Purchase Activity ({userOrders.length} items)</h4>
              
              <div className="bg-white rounded-xl shadow-xs border border-[#e1e3e5] overflow-hidden">
                {loadingOrders ? (
                  <div className="p-12 flex flex-col items-center justify-center text-[#6d7175]">
                    <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin mb-2.5"></div>
                    <p className="text-xs font-semibold">Loading purchase history...</p>
                  </div>
                ) : userOrders.length === 0 ? (
                  <div className="p-12 text-center text-[#6d7175]">
                    <Package size={36} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-xs font-bold text-[#1a1d1f]">No purchase history found</p>
                    <p className="text-xs text-[#6d7175] mt-0.5">This customer has not placed any orders.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f6f6f7] text-[#6d7175] border-b border-[#e1e3e5] uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-5 py-3 font-bold">Product</th>
                        <th className="px-5 py-3 text-right font-bold">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e1e3e5]">
                      {userOrders.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#f6f6f7]/50">
                          <td className="px-5 py-2.5">
                            <div className="flex items-center gap-2.5">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-7 h-7 rounded border border-[#e1e3e5] object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-7 h-7 rounded border border-[#e1e3e5] bg-[#f1f2f4] flex items-center justify-center font-bold text-[#6d7175]">
                                  {(item.name || "P").charAt(0)}
                                </div>
                              )}
                              <span className="font-bold text-[#1a1d1f] text-sm">{item.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-2.5 text-right font-bold text-[#1a1d1f]">
                            ${(Number(item.price) * Number(item.qty)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
