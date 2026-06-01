import { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AddPatientModal from '../components/AddPatientModal';

export default function Patients() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchPatients = () => {
        setLoading(true);
        let url = `/api/patients/?search=${searchTerm}`;
        if (statusFilter) url += `&status=${statusFilter}`;

        axios.get(url)
            .then(res => {
                setPatients(res.data.results || res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchPatients();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, statusFilter]);

    const handlePatientAdded = (newPatient) => {
        setPatients([newPatient, ...patients]);
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Patient Directory</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-indigo-700"
                >
                    <Plus size={18} />
                    <span>Add New Patient</span>
                </button>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <Search size={18} />
                    </span>
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                </div>
                <div className="w-48 relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <Filter size={18} />
                    </span>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none bg-white"
                    >
                        <option value="">All Status</option>
                        <option value="inpatient">Inpatient</option>
                        <option value="outpatient">Outpatient</option>
                        <option value="discharged">Discharged</option>
                    </select>
                </div>
            </div>

            <AddPatientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onPatientAdded={handlePatientAdded}
            />

            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DOB</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : patients.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-gray-900">{p.name}</div>
                                    <div className="text-xs text-gray-500">ID: {p.id.substring(0, 8)}...</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.gender}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {p.dob ? new Date(p.dob).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{p.phone || 'N/A'}</div>
                                    <div className="text-xs text-gray-500">{p.email || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/patients/${p.id}`} className="text-indigo-600 hover:text-indigo-900">
                                        View File
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {!loading && patients.length === 0 && (
                            <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No patients found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
