import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, AlertTriangle, Search } from 'lucide-react';

const Inventory = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const res = await axios.get(`/api/inventory/?search=${searchTerm}`);
                setItems(res.data.results || res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchInventory();
    }, [searchTerm]);

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Package className="mr-2" /> Pharmacy & Supplies Inventory
                </h2>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-indigo-700">
                    <Plus size={18} />
                    <span>Add New Item</span>
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-100">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <Search size={18} />
                    </span>
                    <input
                        type="text"
                        placeholder="Search inventory..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <p className="text-gray-500 text-sm">Total Items</p>
                    <p className="text-2xl font-bold">{items.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <p className="text-gray-500 text-sm">Low Stock Items</p>
                    <p className="text-2xl font-bold text-red-600">
                        {items.filter(i => i.stock_level <= i.min_stock_level).length}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Level</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : items.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-gray-900">{item.name}</div>
                                    <div className="text-xs text-gray-500">Batch: {item.batch_number || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <span className={`font-bold ${item.stock_level <= item.min_stock_level ? 'text-red-600' : 'text-gray-900'}`}>
                                            {item.stock_level}
                                        </span>
                                        <span className="ml-1 text-gray-400 text-xs">/ {item.unit}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.price}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    {item.stock_level <= item.min_stock_level ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            <AlertTriangle size={12} className="mr-1" /> Reorder
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Healthy
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Inventory;
