import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Search, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Consultations = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const res = await axios.get(`/api/notes/?search=${searchTerm}&ordering=-created_at`);
                setNotes(res.data.results || res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching clinical notes:', err);
                setLoading(false);
            }
        };
        fetchNotes();
    }, [searchTerm]);

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <MessageSquare className="mr-2 text-indigo-600" /> Clinical Consultations
                </h2>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-100">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <Search size={18} />
                    </span>
                    <input
                        type="text"
                        placeholder="Search by patient name, doctor, or diagnosis..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-10 text-gray-500 italic">Loading consultation history...</div>
                ) : notes.length > 0 ? notes.map((note) => (
                    <div key={note.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-300 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{note.patient_name || 'Patient record'}</h4>
                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                        <Calendar size={12} className="mr-1" />
                                        {new Date(note.created_at).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase">
                                {note.type}
                            </span>
                        </div>
                        <div className="text-gray-700 line-clamp-3 mb-4 italic font-sans">
                            "{note.content}"
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t">
                            <span className="text-sm text-gray-500">
                                Recorded by <span className="font-semibold">{note.author_name}</span>
                            </span>
                            <Link
                                to={`/patients/${note.patient}`}
                                className="text-indigo-600 hover:text-indigo-800 text-sm font-bold"
                            >
                                View Full Case File →
                            </Link>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-10 text-gray-500 italic bg-white rounded-xl border border-dashed border-gray-300">
                        No consultation records found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Consultations;
