import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, User, Box, AlertCircle } from 'lucide-react';

const WardMap = () => {
    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWardMap();
    }, []);

    const fetchWardMap = async () => {
        try {
            const res = await axios.get('/api/wards/map/');
            setWards(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching ward map:', err);
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center italic">Loading Ward Map...</div>;

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Layout className="mr-2 text-indigo-600" /> Ward & Bed Management
                </h2>
                <div className="flex space-x-4 text-sm">
                    <span className="flex items-center"><span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span> Occupied</span>
                    <span className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span> Vacant</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {wards.map(ward => (
                    <div key={ward.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{ward.name}</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">{ward.type}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-semibold">{ward.occupied} / {ward.capacity} Beds</span>
                                <div className="w-32 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500"
                                        style={{ width: `${(ward.occupied / ward.capacity) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {ward.beds.map(bed => (
                                <div
                                    key={bed.id}
                                    className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center transition cursor-pointer ${
                                        bed.status === 'occupied'
                                        ? 'border-red-100 bg-red-50 text-red-700'
                                        : 'border-green-100 bg-green-50 text-green-700 hover:border-green-300'
                                    }`}
                                >
                                    <Box size={20} className="mb-1" />
                                    <span className="text-xs font-bold">Bed {bed.number}</span>
                                    {bed.patient ? (
                                        <span className="text-[10px] truncate w-full text-center mt-1" title={bed.patient.name}>
                                            {bed.patient.name}
                                        </span>
                                    ) : (
                                        <span className="text-[10px] opacity-60">Vacant</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WardMap;
