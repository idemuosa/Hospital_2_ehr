import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const AddVitalsModal = ({ isOpen, onClose, patientId, onVitalsAdded }) => {
    const [formData, setFormData] = useState({
        patient: patientId,
        bp: '',
        pulse: '',
        temp: '',
        resp: '',
        spo2: '',
        weight: '',
        taken_by: 'Doctor/Nurse' // Ideally from logged in user
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/vitals/', formData);
            onVitalsAdded(response.data);
            onClose();
        } catch (error) {
            console.error('Error adding vitals:', error);
            alert('Failed to add vitals.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-6">Record Vital Signs</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Blood Pressure (e.g. 120/80)</label>
                        <input type="text" name="bp" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Pulse (bpm)</label>
                        <input type="number" name="pulse" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Temp (°C)</label>
                        <input type="number" step="0.1" name="temp" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Resp Rate</label>
                        <input type="number" name="resp" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">SpO2 (%)</label>
                        <input type="number" name="spo2" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                        <input type="number" step="0.1" name="weight" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <button type="submit" className="col-span-2 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition font-bold mt-4">
                        Save Vitals
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddVitalsModal;
