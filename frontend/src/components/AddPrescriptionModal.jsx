import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const AddPrescriptionModal = ({ isOpen, onClose, patientId, onPrescriptionAdded }) => {
    const [formData, setFormData] = useState({
        patient: patientId,
        author_id: 'DOC-123',
        author_name: 'Dr. Admin',
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        status: 'active'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/prescriptions/', formData);
            onPrescriptionAdded(response.data);
            onClose();
        } catch (error) {
            console.error('Error adding prescription:', error);
            alert('Failed to save prescription.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-6">New Prescription</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Medication Name</label>
                        <input type="text" name="medication" required onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Dosage</label>
                            <input type="text" name="dosage" placeholder="e.g. 500mg" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Frequency</label>
                            <input type="text" name="frequency" placeholder="e.g. twice daily" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Duration</label>
                        <input type="text" name="duration" placeholder="e.g. 7 days" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition font-bold mt-4">
                        Issue Prescription
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddPrescriptionModal;
