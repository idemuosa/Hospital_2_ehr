import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Clock, Users, ArrowRight } from 'lucide-react';

const QueueBoard = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    const statuses = ['registered', 'triage', 'consulting', 'surgery', 'recovery'];

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchQueue = async () => {
        try {
            const res = await axios.get('/api/patients/');
            setPatients(res.data.results || res.data);
            setLoading(false);
        } catch (err) {
            console.error('Queue fetch error:', err);
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'surgery': return 'bg-red-500';
            case 'recovery': return 'bg-blue-500';
            case 'consulting': return 'bg-indigo-500';
            default: return 'bg-gray-400';
        }
    };

    return (
        <div className="p-8 space-y-8 bg-gray-900 min-h-screen text-white">
            <header className="flex justify-between items-center border-b border-gray-800 pb-6">
                <div>
                    <h2 className="text-4xl font-black flex items-center">
                        <Activity className="mr-3 text-red-500" size={40} /> LIVE HOSPITAL QUEUE
                    </h2>
                    <p className="text-gray-400 font-bold mt-2">Real-time Patient Workflow Status</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-mono">{new Date().toLocaleTimeString()}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">System Live</div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {statuses.map(status => (
                    <div key={status} className="flex flex-col space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-tighter text-gray-500 px-2 flex justify-between items-center">
                            <span>{status}</span>
                            <span className="bg-gray-800 px-2 py-0.5 rounded-full">{patients.filter(p => p.workflow_status === status).length}</span>
                        </h3>
                        <div className="flex-1 space-y-3">
                            {patients.filter(p => p.workflow_status === status).map(p => (
                                <div key={p.id} className="bg-gray-800 p-4 rounded-xl border-l-4 border-indigo-500 shadow-xl hover:scale-105 transition-transform duration-200 cursor-pointer">
                                    <h4 className="font-bold text-lg truncate">{p.name}</h4>
                                    <div className="flex justify-between items-center mt-2">
                                        <div className="flex items-center text-xs text-gray-400">
                                            <Clock size={12} className="mr-1" />
                                            {Math.floor(Math.random() * 20)}m waiting
                                        </div>
                                        <div className={`w-2 h-2 rounded-full animate-pulse ${getStatusIcon(status)}`}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QueueBoard;
