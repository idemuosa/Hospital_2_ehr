import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, DollarSign, Download, Search, CheckCircle, Clock, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Billing = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const res = await axios.get(`/api/bills/`);
                setBills(res.data.results || res.data);
                setLoading(false);
            } catch (err) {
                console.error('Bills API not found, using dummy data for demo');
                setBills([
                    { id: '1', patient_name: 'John Doe', total_amount: 150.00, status: 'paid', invoice_number: 'INV-001', created_at: new Date().toISOString() },
                    { id: '2', patient_name: 'Jane Smith', total_amount: 45.00, status: 'pending', invoice_number: 'INV-002', created_at: new Date().toISOString() },
                ]);
                setLoading(false);
            }
        };
        fetchBills();
    }, []);

    const generateInvoice = (bill) => {
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.text("HOSPITAL INVOICE", 105, 15, { align: "center" });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Invoice #: ${bill.invoice_number}`, 14, 30);
        doc.text(`Date: ${new Date(bill.created_at).toLocaleDateString()}`, 14, 35);
        doc.text(`Patient: ${bill.patient_name}`, 14, 40);

        doc.autoTable({
            startY: 50,
            head: [['Description', 'Amount']],
            body: [
                ['Medical Services / Consultation', `$${bill.total_amount}`],
                ['Total Amount', `$${bill.total_amount}`],
            ],
            foot: [['Total', `$${bill.total_amount}`]]
        });

        doc.text("Status: " + bill.status.toUpperCase(), 14, doc.lastAutoTable.finalY + 10);
        doc.save(`Invoice_${bill.invoice_number}.pdf`);
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <CreditCard className="mr-2" /> Revenue & Billing
                </h2>
                <div className="flex space-x-2">
                    <button className="bg-white border px-4 py-2 rounded-md hover:bg-gray-50 flex items-center shadow-sm">
                        <Download size={18} className="mr-2" /> Export Report
                    </button>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 shadow-sm font-bold">
                        Create Manual Invoice
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 rounded-xl text-white shadow-lg">
                    <p className="opacity-80 text-sm font-medium">Monthly Revenue</p>
                    <h3 className="text-3xl font-bold mt-1">$12,450.00</h3>
                    <div className="mt-4 flex items-center text-xs opacity-90">
                        <span className="bg-white/20 px-2 py-0.5 rounded-full mr-2">+12% from last month</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <p className="text-gray-500 text-sm font-medium">Pending Invoices</p>
                    <h3 className="text-3xl font-bold mt-1 text-orange-600">24</h3>
                    <p className="text-xs text-gray-400 mt-2">Estimated value: $2,840.00</p>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <p className="text-gray-500 text-sm font-medium">Paid Invoices (Today)</p>
                    <h3 className="text-3xl font-bold mt-1 text-green-600">8</h3>
                    <p className="text-xs text-gray-400 mt-2">Total: $1,120.00</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-4 border-b">
                    <div className="relative max-w-md">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                            <Search size={18} />
                        </span>
                        <input
                            type="text"
                            placeholder="Filter by invoice # or patient..."
                            className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                        />
                    </div>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {bills.map((bill) => (
                            <tr key={bill.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-sans text-gray-900">{bill.invoice_number}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bill.patient_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">${bill.total_amount}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {bill.status === 'paid' ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <CheckCircle size={12} className="mr-1" /> Paid
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                            <Clock size={12} className="mr-1" /> Pending
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button
                                        onClick={() => generateInvoice(bill)}
                                        className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                                    >
                                        <Printer size={16} className="mr-1" /> Print
                                    </button>
                                    <button className="text-gray-600 hover:text-gray-900">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Billing;
