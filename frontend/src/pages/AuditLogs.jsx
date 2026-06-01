import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Search, Download, Filter } from 'lucide-react';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await axios.get(`/api/audit/?search=${searchTerm}`);
                setLogs(res.data.results || res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching audit logs:', err);
                setLoading(false);
            }
        };
        fetchLogs();
    }, [searchTerm]);

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <ShieldAlert className="mr-2 text-red-600" /> Security & Audit Logs
                </h2>
                <button className="bg-white border border-gray-300 px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-gray-50 transition shadow-sm">
                    <Download size={18} />
                    <span>Export Logs (CSV)</span>
                </button>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <Search size={18} />
                    </span>
                    <input
                        type="text"
                        placeholder="Filter by user or action..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource ID</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-4 text-center">Loading audit records...</td></tr>
                        ) : logs.length > 0 ? logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-semibold text-gray-900">{log.user_name}</div>
                                    <div className="text-xs text-gray-400">UID: {log.user_id}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                    {log.action}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {log.resource_type || 'System'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs font-sans text-gray-400">
                                    {log.resource_id || 'N/A'}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500 italic">No audit records found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLogs;
