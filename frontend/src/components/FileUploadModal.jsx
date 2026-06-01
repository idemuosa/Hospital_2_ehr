import React, { useState } from 'react';
import axios from 'axios';
import { X, Upload, File } from 'lucide-react';

const FileUploadModal = ({ isOpen, onClose, patientId, onFileUploaded }) => {
    const [file, setFile] = useState(null);
    const [category, setCategory] = useState('Lab Result');
    const [testName, setTestName] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('patient', patientId);
        formData.append('category', category);
        formData.append('test_name', testName || file.name);
        formData.append('type', file.type);
        formData.append('status', 'Completed');
        formData.append('priority', 'Normal');
        formData.append('requested_by', 'Doctor');

        try {
            const response = await axios.post('/api/investigations/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onFileUploaded(response.data);
            onClose();
            setFile(null);
            setTestName('');
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload file.');
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-6">Upload Medical Document</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Test Name / Description</label>
                        <input
                            type="text"
                            value={testName}
                            onChange={(e) => setTestName(e.target.value)}
                            placeholder="e.g. Chest X-Ray, Blood Work"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                            <option value="Lab Result">Lab Result</option>
                            <option value="Imaging">Imaging (X-Ray/MRI)</option>
                            <option value="Prescription Scan">Prescription Scan</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                            <span className="text-sm text-gray-600">
                                {file ? file.name : "Click to select a file (PDF, JPG, PNG)"}
                            </span>
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={!file || uploading}
                        className={`w-full py-2 rounded-md transition font-bold ${
                            !file || uploading ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                    >
                        {uploading ? "Uploading..." : "Upload Document"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FileUploadModal;
