import React, { useState } from 'react';
import axios from 'axios';
import { X, ShieldAlert, CheckCircle } from 'lucide-react';

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
    const [interactionResult, setInteractionResult] = useState(null);
    const [checking, setChecking] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === 'medication') setInteractionResult(null);
    };

    const checkInteractions = async () => {
        if (!formData.medication) return;
        setChecking(true);
        try {
            const res = await axios.post('/api/prescriptions/check_interaction/', {
                patient_id: patientId,
                medication: formData.medication
            });
            setInteractionResult(res.data);
        } catch (error) {
            console.error('Interaction check failed', error);
        } finally {
            setChecking(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (interactionResult && !interactionResult.safe && !window.confirm("Drug interaction detected. Proceed anyway?")) return;

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 w-full max-w-md relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-6">New Prescription</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name</label>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                name="medication"
                                required
                                onChange={handleChange}
                                className="flex-1 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Search medication..."
                            />
                            <button
                                type="button"
                                onClick={checkInteractions}
                                disabled={checking || !formData.medication}
                                className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-xs font-bold hover:bg-indigo-200 disabled:opacity-50"
                            >
                                {checking ? '...' : 'Check'}
                            </button>
                        </div>
                    </div>

                    {interactionResult && (
                        <div className={`p-3 rounded-lg flex items-start space-x-3 text-sm ${interactionResult.safe ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {interactionResult.safe ? <CheckCircle size={18} /> : <ShieldAlert size={18} />}
                            <div>
                                <p className="font-bold">{interactionResult.safe ? 'Safe' : 'Interaction Alert!'}</p>
                                {interactionResult.interactions.map((i, idx) => (
                                    <p key={idx} className="text-xs mt-1">Found with: {i.medications.join(' & ')}. {i.note}</p>
                                ))}
                                {interactionResult.safe && <p className="text-xs">No known interactions with current medications.</p>}
                            </div>
                        </div>
                    )}

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
                    <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition font-bold mt-4 shadow-md active:scale-95">
                        Issue Prescription
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddPrescriptionModal;
