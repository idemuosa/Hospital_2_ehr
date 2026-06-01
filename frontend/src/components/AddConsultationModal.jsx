import React, { useState } from 'react';
import axios from 'axios';
import { X, Sparkles } from 'lucide-react';

const AddConsultationModal = ({ isOpen, onClose, patientId, onNoteAdded }) => {
    const [formData, setFormData] = useState({
        patient: patientId,
        author_id: 'DOC-123',
        author_name: 'Dr. Admin',
        type: 'Consultation',
        content: ''
    });
    const [suggestions, setSuggestions] = useState([]);

    const analyzeText = (text) => {
        if (text.length < 10) {
            setSuggestions([]);
            return;
        }
        const knowledge = [
            {diagnosis: "Diabetes", keywords: ["sugar", "insulin", "thirst"]},
            {diagnosis: "Malaria", keywords: ["fever", "chills", "rigor"]},
            {diagnosis: "Hypertension", keywords: ["high bp", "headache", "pressure"]},
            {diagnosis: "UTI", keywords: ["burning", "urination", "frequency"]},
        ];
        const lower = text.toLowerCase();
        const found = knowledge.filter(d => d.keywords.some(k => lower.includes(k)));
        setSuggestions(found);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === 'content') analyzeText(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/notes/', formData);
            onNoteAdded(response.data);
            onClose();
        } catch (error) {
            console.error('Error adding note:', error);
            alert('Failed to save consultation note.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 w-full max-w-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-6">New Consultation Note</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Note Type</label>
                        <select name="type" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                            <option value="Consultation">Consultation</option>
                            <option value="Follow-up">Follow-up</option>
                            <option value="Emergency">Emergency</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Clinical Findings & Diagnosis</label>
                        <textarea
                            name="content"
                            required
                            rows="8"
                            onChange={handleChange}
                            placeholder="Describe patient symptoms..."
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 font-sans"
                        ></textarea>
                    </div>

                    {suggestions.length > 0 && (
                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                            <h4 className="text-xs font-bold text-indigo-700 uppercase flex items-center mb-2">
                                <Sparkles size={14} className="mr-1" /> AI Diagnostic Suggestions
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map((s, i) => (
                                    <span key={i} className="text-xs bg-white text-indigo-600 px-3 py-1 rounded-full border border-indigo-200 font-bold">
                                        Possible: {s.diagnosis}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition font-bold text-lg">
                        Complete Consultation
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddConsultationModal;
