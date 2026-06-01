import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Activity, FileText, Calendar, Plus, Pill, Printer, ShoppingCart, Share2, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Skeleton from '../components/Skeleton';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import AddVitalsModal from '../components/AddVitalsModal';
import AddConsultationModal from '../components/AddConsultationModal';
import AddPrescriptionModal from '../components/AddPrescriptionModal';
import FileUploadModal from '../components/FileUploadModal';

const PatientDetails = () => {
    const { id } = useParams();
    const { user: currentUser } = useContext(AuthContext);
    const [patient, setPatient] = useState(null);
    const [vitals, setVitals] = useState([]);
    const [notes, setNotes] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [investigations, setInvestigations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('History');

    const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
    const [isFileModalOpen, setIsFileModalOpen] = useState(false);

    const fetchPatientData = async () => {
        try {
            const [patientRes, vitalsRes, notesRes, presRes, invRes] = await Promise.all([
                axios.get(`/api/patients/${id}/`),
                axios.get(`/api/vitals/?patient=${id}&ordering=-created_at`),
                axios.get(`/api/notes/?patient=${id}&ordering=-created_at`),
                axios.get(`/api/prescriptions/?patient=${id}&ordering=-created_at`),
                axios.get(`/api/investigations/?patient=${id}&ordering=-created_at`)
            ]);
            setPatient(patientRes.data);
            setVitals(vitalsRes.data.results || vitalsRes.data);
            setNotes(notesRes.data.results || notesRes.data);
            setPrescriptions(presRes.data.results || presRes.data);
            setInvestigations(invRes.data.results || invRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatientData();
    }, [id]);

    const handleVitalsAdded = (newVital) => setVitals([newVital, ...vitals]);
    const handleNoteAdded = (newNote) => setNotes([newNote, ...notes]);
    const handlePrescriptionAdded = (newPres) => setPrescriptions([newPres, ...prescriptions]);

    const handleDispense = async (prescriptionId) => {
        if (!window.confirm('Are you sure you want to dispense this medication? This will update inventory and bill the patient.')) return;
        try {
            const res = await axios.post(`/api/pharmacy/dispense/${prescriptionId}/`);
            alert(res.data.message);
            // Refresh prescriptions and other data
            fetchPatientData();
        } catch (err) {
            alert(err.response?.data?.error || 'Dispensing failed');
        }
    };
    const handleFileUploaded = (newFile) => setInvestigations([newFile, ...investigations]);

    const updateWorkflowStatus = async (newStatus) => {
        try {
            await axios.patch(`/api/patients/${id}/`, { workflow_status: newStatus });
            setPatient({ ...patient, workflow_status: newStatus });
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const exportToFHIR = async () => {
        try {
            const res = await axios.get(`/api/interop/fhir/Patient/${id}/`);
            const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `FHIR_Patient_${id}.json`;
            a.click();
        } catch (err) {
            alert('Export failed');
        }
    };

    const exportToHL7 = async () => {
        try {
            const res = await axios.get(`/api/interop/hl7/Patient/${id}/`);
            const blob = new Blob([res.data.hl7_message], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `HL7_Patient_${id}.hl7`;
            a.click();
        } catch (err) {
            alert('Export failed');
        }
    };

    const generateMedicalReport = () => {
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.text("HOSPITAL EHR - MEDICAL CASE FILE", 105, 15, { align: "center" });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Report Generated: ${new Date().toLocaleString()}`, 200, 10, { align: "right" });

        // Patient Info
        doc.autoTable({
            startY: 25,
            head: [['Patient Information', 'Value']],
            body: [
                ['Full Name', patient.name],
                ['Gender', patient.gender],
                ['Date of Birth', new Date(patient.dob).toLocaleDateString()],
                ['Phone', patient.phone],
                ['Blood Group', patient.blood_group || 'N/A'],
                ['Address', patient.address || 'N/A'],
            ],
        });

        // Latest Vitals
        if (vitals.length > 0) {
            doc.text("Latest Vital Signs", 14, doc.lastAutoTable.finalY + 10);
            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 15,
                head: [['Date', 'BP', 'Pulse', 'Temp', 'SpO2']],
                body: vitals.slice(0, 5).map(v => [
                    new Date(v.created_at).toLocaleDateString(),
                    v.bp,
                    v.pulse,
                    v.temp,
                    v.spo2
                ]),
            });
        }

        // Prescriptions
        if (prescriptions.length > 0) {
            doc.text("Active Prescriptions", 14, doc.lastAutoTable.finalY + 10);
            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 15,
                head: [['Medication', 'Dosage', 'Frequency', 'Duration']],
                body: prescriptions.map(p => [
                    p.medication,
                    p.dosage,
                    p.frequency,
                    p.duration
                ]),
            });
        }

        doc.save(`Medical_Report_${patient.name.replace(/\s+/g, '_')}.pdf`);
    };

    if (loading) {
        return (
            <div className="p-8 max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="w-16 h-16 rounded-full" />
                        <div>
                            <Skeleton className="w-48 h-8 mb-2" />
                            <Skeleton className="w-32 h-4" />
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <Skeleton className="w-32 h-10" />
                        <Skeleton className="w-32 h-10" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <Skeleton className="w-32 h-6 mb-4" />
                        <div className="space-y-3">
                            <Skeleton className="w-full h-4" />
                            <Skeleton className="w-full h-4" />
                            <Skeleton className="w-full h-4" />
                            <Skeleton className="w-full h-4" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 col-span-2">
                        <Skeleton className="w-48 h-6 mb-4" />
                        <div className="space-y-3">
                            <Skeleton className="w-full h-24" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 col-span-3">
                        <div className="flex space-x-6 border-b mb-6">
                            <Skeleton className="w-32 h-10" />
                            <Skeleton className="w-32 h-10" />
                            <Skeleton className="w-32 h-10" />
                        </div>
                        <div className="space-y-6">
                            <Skeleton className="w-full h-32" />
                            <Skeleton className="w-full h-32" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    if (!patient) return <div className="p-8 text-center text-red-500">Patient not found.</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
                        <User size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
                        <div className="flex items-center space-x-2 mt-1">
                            <p className="text-gray-500 text-sm">ID: {patient.id}</p>
                            <span className="text-gray-300">|</span>
                            <select
                                value={patient.workflow_status}
                                onChange={(e) => updateWorkflowStatus(e.target.value)}
                                className="text-xs bg-indigo-50 text-indigo-700 font-bold border-none rounded p-1 outline-none"
                            >
                                <option value="registered">Registered</option>
                                <option value="triage">Triage</option>
                                <option value="consulting">Consulting</option>
                                <option value="surgery">Surgery</option>
                                <option value="recovery">Recovery</option>
                                <option value="discharged">Discharged</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <div className="flex bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
                        <button onClick={exportToFHIR} className="px-3 py-2 hover:bg-gray-50 text-xs font-bold border-r">Export FHIR</button>
                        <button onClick={exportToHL7} className="px-3 py-2 hover:bg-gray-50 text-xs font-bold">Export HL7</button>
                    </div>
                    <button
                        onClick={generateMedicalReport}
                        className="bg-white border border-gray-300 px-4 py-2 rounded shadow-sm hover:bg-gray-50 flex items-center space-x-2"
                    >
                        <Printer size={18} />
                        <span>Print Case File</span>
                    </button>
                    <button className="bg-white border border-gray-300 px-4 py-2 rounded shadow-sm hover:bg-gray-50">Edit Profile</button>
                    <button
                        onClick={() => setIsNoteModalOpen(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded shadow-sm hover:bg-indigo-700 font-bold"
                    >
                        Start Consultation
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Info Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                        <User size={18} className="mr-2 text-indigo-500" /> Basic Information
                    </h3>
                    <div className="space-y-3 text-sm">
                        <p><span className="text-gray-500">Gender:</span> {patient.gender}</p>
                        <p><span className="text-gray-500">DOB:</span> {new Date(patient.dob).toLocaleDateString()}</p>
                        <p><span className="text-gray-500">Blood Group:</span> {patient.blood_group || 'Not recorded'}</p>
                        <p><span className="text-gray-500">Phone:</span> {patient.phone}</p>
                        <p><span className="text-gray-500">Email:</span> {patient.email}</p>
                        <p><span className="text-gray-500">Address:</span> {patient.address}</p>
                    </div>
                </div>

                {/* Vitals Summary */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg flex items-center">
                            <Activity size={18} className="mr-2 text-red-500" /> Latest Vital Signs
                        </h3>
                        <button
                            onClick={() => setIsVitalsModalOpen(true)}
                            className="text-xs text-indigo-600 font-medium hover:underline flex items-center"
                        >
                            <Plus size={14} className="mr-1" /> Add Vitals
                        </button>
                    </div>
                    {vitals.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="text-gray-500 border-b">
                                        <th className="py-2 text-left">Date</th>
                                        <th className="py-2 text-left">BP</th>
                                        <th className="py-2 text-left">Temp</th>
                                        <th className="py-2 text-left">Pulse</th>
                                        <th className="py-2 text-left">Weight</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vitals.map(v => (
                                        <React.Fragment key={v.id}>
                                            <tr className="border-b">
                                                <td className="py-3">{new Date(v.created_at).toLocaleDateString()}</td>
                                                <td className="py-3 font-medium">{v.bp}</td>
                                                <td className="py-3">{v.temp}°C</td>
                                                <td className="py-3">{v.pulse} bpm</td>
                                                <td className="py-3">{v.weight} kg</td>
                                            </tr>
                                            {v.ai_alerts && v.ai_alerts.length > 0 && (
                                                <tr>
                                                    <td colSpan="5" className="py-2 px-2 bg-red-50 border-b">
                                                        <div className="flex flex-wrap gap-2">
                                                            {v.ai_alerts.map((alert, idx) => (
                                                                <span key={idx} className="flex items-center text-[10px] font-bold text-red-700 bg-white border border-red-200 px-2 py-0.5 rounded-full uppercase">
                                                                    <AlertCircle size={10} className="mr-1" /> {alert.message}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-400 italic text-center py-8">No vital signs recorded yet.</p>
                    )}
                </div>

                {/* Clinical History, Prescriptions & Documents */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 col-span-3">
                    <div className="flex border-b mb-6">
                        <button
                            onClick={() => setActiveTab('History')}
                            className={`px-6 py-2 border-b-2 font-bold transition ${activeTab === 'History' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-indigo-600'}`}
                        >
                            Clinical History
                        </button>
                        <button
                            onClick={() => setActiveTab('Prescriptions')}
                            className={`px-6 py-2 border-b-2 font-bold transition ${activeTab === 'Prescriptions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-indigo-600'}`}
                        >
                            Prescriptions
                        </button>
                        <button
                            onClick={() => setActiveTab('Documents')}
                            className={`px-6 py-2 border-b-2 font-bold transition ${activeTab === 'Documents' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-indigo-600'}`}
                        >
                            Documents
                        </button>
                    </div>

                    {activeTab === 'History' && (
                        <div className="space-y-6">
                            {notes.length > 0 ? notes.map(note => (
                                <div key={note.id} className="p-4 bg-gray-50 rounded-lg border">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded">
                                            {note.type}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(note.created_at).toLocaleString()} | {note.author_name}
                                        </span>
                                    </div>
                                    <div className="text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                                        {note.content}
                                    </div>
                                </div>
                            )) : (
                                <div className="p-8 text-center text-gray-400 italic">No clinical notes recorded for this patient.</div>
                            )}
                        </div>
                    )}

                    {activeTab === 'Prescriptions' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-lg flex items-center">
                                    <Pill size={18} className="mr-2 text-green-500" /> Active Prescriptions
                                </h3>
                                <button
                                    onClick={() => setIsPrescriptionModalOpen(true)}
                                    className="text-sm bg-green-50 text-green-600 px-3 py-1 rounded-full font-bold hover:bg-green-100 flex items-center"
                                >
                                    <Plus size={16} className="mr-1" /> New Prescription
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {prescriptions.map(p => (
                                    <div key={p.id} className="p-4 border rounded-lg hover:shadow-md transition">
                                        <h4 className="font-bold text-gray-900">{p.medication}</h4>
                                        <p className="text-sm text-gray-600">{p.dosage} - {p.frequency}</p>
                                        <div className="mt-2 flex justify-between items-center">
                                            <span className="text-xs text-gray-400">Duration: {p.duration}</span>
                                            <div className="flex items-center space-x-2">
                                                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${p.status === 'dispensed' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                    {p.status}
                                                </span>
                                                {(currentUser?.role === 'pharmacist' || currentUser?.role === 'admin') && p.status !== 'dispensed' && (
                                                    <button
                                                        onClick={() => handleDispense(p.id)}
                                                        className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 flex items-center"
                                                    >
                                                        <ShoppingCart size={12} className="mr-1" /> Dispense
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'Documents' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-lg flex items-center">
                                    <FileText size={18} className="mr-2 text-indigo-500" /> Medical Documents & Imaging
                                </h3>
                                <button
                                    onClick={() => setIsFileModalOpen(true)}
                                    className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-bold hover:bg-indigo-100 flex items-center"
                                >
                                    <Plus size={16} className="mr-1" /> Upload Document
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {investigations.length > 0 ? investigations.map(inv => (
                                    <div key={inv.id} className="p-4 border rounded-lg hover:shadow-md transition flex flex-col">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="bg-gray-100 p-2 rounded">
                                                <FileText size={20} className="text-gray-600" />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <h4 className="font-bold text-gray-900 truncate" title={inv.test_name}>{inv.test_name}</h4>
                                                <p className="text-xs text-gray-500">{inv.category}</p>
                                            </div>
                                        </div>
                                        <div className="mt-auto flex justify-between items-center">
                                            <span className="text-xs text-gray-400">{new Date(inv.created_at).toLocaleDateString()}</span>
                                            {inv.file ? (
                                                <a href={inv.file} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-600 hover:underline">
                                                    View File
                                                </a>
                                            ) : (
                                                <span className="text-xs text-gray-400">No file attached</span>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-3 p-8 text-center text-gray-400 italic">No documents uploaded for this patient.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <AddVitalsModal
                isOpen={isVitalsModalOpen}
                onClose={() => setIsVitalsModalOpen(false)}
                patientId={id}
                onVitalsAdded={handleVitalsAdded}
            />
            <AddConsultationModal
                isOpen={isNoteModalOpen}
                onClose={() => setIsNoteModalOpen(false)}
                patientId={id}
                onNoteAdded={handleNoteAdded}
            />
            <AddPrescriptionModal
                isOpen={isPrescriptionModalOpen}
                onClose={() => setIsPrescriptionModalOpen(false)}
                patientId={id}
                onPrescriptionAdded={handlePrescriptionAdded}
            />
            <FileUploadModal
                isOpen={isFileModalOpen}
                onClose={() => setIsFileModalOpen(false)}
                patientId={id}
                onFileUploaded={handleFileUploaded}
            />
        </div>
    );
};

export default PatientDetails;
