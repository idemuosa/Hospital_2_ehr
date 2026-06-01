import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { User, Activity, FileText, Calendar, DollarSign, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PatientPortal = () => {
    const { user } = useContext(AuthContext);
    const [patientData, setPatientData] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.patient_id) {
            fetchPortalData();
        }
    }, [user]);

    const fetchPortalData = async () => {
        try {
            const [patientRes, apptRes, billsRes] = await Promise.all([
                axios.get(`/api/patients/${user.patient_id}/`),
                axios.get(`/api/appointments/?patient=${user.patient_id}`),
                axios.get(`/api/bills/?patient=${user.patient_id}`)
            ]);
            setPatientData(patientRes.data);
            setAppointments(apptRes.data.results || apptRes.data);
            setBills(billsRes.data.results || billsRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching portal data:', err);
            setLoading(false);
        }
    };

    const downloadMyReport = () => {
        const doc = new jsPDF();
        doc.text("PERSONAL MEDICAL REPORT", 105, 15, { align: "center" });
        doc.autoTable({
            startY: 25,
            head: [['Field', 'Information']],
            body: [
                ['Name', patientData.name],
                ['Gender', patientData.gender],
                ['Blood Group', patientData.blood_group],
                ['Current Status', patientData.status]
            ]
        });
        doc.save(`My_Report_${new Date().toLocaleDateString()}.pdf`);
    };

    if (loading) return <div className="p-8 text-center italic">Loading your health portal...</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome, {patientData?.name}</h1>
                    <p className="text-gray-500 text-sm">Your Personal Health Portal</p>
                </div>
                <button
                    onClick={downloadMyReport}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition shadow-sm"
                >
                    <Download size={18} className="mr-2" /> Download Health Summary
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">Patient Status</h3>
                    <div className="flex items-center space-x-4">
                        <div className="bg-green-100 p-3 rounded-full text-green-600">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 capitalize">{patientData?.status}</p>
                            <p className="text-xs text-gray-400">Current Admission Status</p>
                        </div>
                    </div>
                </div>

                {/* Billing Summary */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">Account Balance</h3>
                    <div className="flex items-center space-x-4">
                        <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                ${bills.filter(b => b.status === 'pending').reduce((acc, b) => acc + b.total_amount, 0).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-400">Total Pending Bills</p>
                        </div>
                    </div>
                </div>

                {/* Next Appointment */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">Upcoming Appointment</h3>
                    <div className="flex items-center space-x-4">
                        <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-900">
                                {appointments.length > 0 ? new Date(appointments[0].date_time).toLocaleDateString() : 'No upcoming'}
                            </p>
                            <p className="text-xs text-gray-400">{appointments.length > 0 ? appointments[0].reason : 'Schedule a visit'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-bold text-gray-800">My Appointments History</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead>
                        <tr className="text-gray-500">
                            <th className="px-6 py-3 text-left font-medium">Date</th>
                            <th className="px-6 py-3 text-left font-medium">Doctor</th>
                            <th className="px-6 py-3 text-left font-medium">Reason</th>
                            <th className="px-6 py-3 text-left font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {appointments.map(appt => (
                            <tr key={appt.id}>
                                <td className="px-6 py-4">{new Date(appt.date_time).toLocaleString()}</td>
                                <td className="px-6 py-4">{appt.doctor_name || 'N/A'}</td>
                                <td className="px-6 py-4">{appt.reason}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${appt.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {appt.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PatientPortal;
