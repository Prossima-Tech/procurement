/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Search, Filter, Eye, ClipboardList, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { baseURL } from '../../utils/endpoint';

// Status Badge Component

export const StatusBadge = ({ status }) => {
    const colors = {
        pending: 'bg-yellow-100 text-yellow-800',
        in_progress: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        pass: 'bg-green-100 text-green-800',
        fail: 'bg-red-100 text-red-800',
        conditional: 'bg-yellow-100 text-yellow-800'
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || colors.pending}`}>
            {status.replace(/_/g, ' ').toUpperCase()}
        </span>
    );
};

// components/inspection/FilterSection.jsx

export const FilterSection = ({ filters, setFilters, isDarkMode }) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
            <input
                type="text"
                placeholder="Search inspections..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className={`w-full pl-10 pr-4 py-2 rounded-md border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
        </div>
        <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
            className={`rounded-md border p-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
        />
        <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
            className={`rounded-md border p-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
        />
        <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className={`rounded-md border p-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
        >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
        </select>
    </div>
);

// components/inspection/PendingGRNsTable.jsx


export const PendingGRNsTable = ({ pendingGRNs, onCreateInspection, isDarkMode }) => (
    <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Pending GRNs for Inspection</h3>
        <div className={`rounded-lg shadow overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider">GRN Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider">Vendor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider">Items</th>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {pendingGRNs.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="px-6 py-4 text-center">No pending GRNs</td>
                        </tr>
                    ) : (
                        pendingGRNs.map((grn) => (
                            <tr key={grn._id}>
                                <td className="px-6 py-4">{grn.grnNumber}</td>
                                <td className="px-6 py-4">{grn.vendor?.name}</td>
                                <td className="px-6 py-4">{new Date(grn.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4">{grn.items?.length || 0}</td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => onCreateInspection(grn)}
                                        className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Create
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

// components/inspection/InspectionsTable.jsx

export const InspectionsTable = ({ inspections, onView, onStart, isDarkMode, loading }) => (
    <div className={`rounded-lg shadow overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <table className="min-w-full divide-y divide-gray-200">
            <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider">Inspection</th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider">GRN</th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {loading ? (
                    <tr>
                        <td colSpan="6" className="px-6 py-4 text-center">Loading...</td>
                    </tr>
                ) : inspections.length === 0 ? (
                    <tr>
                        <td colSpan="6" className="px-6 py-4 text-center">No inspections found</td>
                    </tr>
                ) : (
                    inspections.map((inspection) => (
                        <tr key={inspection._id}>
                            <td className="px-6 py-4">
                                <button
                                    onClick={() => onView(inspection)}
                                    className="text-blue-500 hover:text-blue-700"
                                >
                                    {inspection.inspectionNumber}
                                </button>
                            </td>
                            <td className="px-6 py-4">{inspection.grn?.grnNumber}</td>
                            <td className="px-6 py-4">
                                <div className="text-sm">
                                    {inspection.items.map((item, idx) => (
                                        <div key={idx} className="mb-1">
                                            <span className="font-medium">{item.partCode}</span>
                                            <span className="text-gray-500 ml-2">
                                                {item.itemDetails?.itemName || 'N/A'}
                                            </span>
                                        </div>
                                    )).slice(0, 2)}
                                    {inspection.items.length > 2 && (
                                        <span className="text-gray-500">
                                            +{inspection.items.length - 2} more
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {new Date(inspection.startDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                                <StatusBadge status={inspection.status} />
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => onView(inspection)}
                                        className="text-blue-500 hover:text-blue-700"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    {inspection.status === 'pending' && (
                                        <button
                                            onClick={() => onStart(inspection)}
                                            className="text-green-500 hover:text-green-700"
                                        >
                                            <ClipboardList className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>
);

// Pagination Component
const Pagination = ({ pagination, onPageChange, isDarkMode }) => (
    <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-500">
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} entries
        </span>
        <div className="flex space-x-2">
            <button
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`px-3 py-1 rounded-md ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'
                    } border disabled:opacity-50`}
            >
                Previous
            </button>
            <button
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`px-3 py-1 rounded-md ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'
                    } border disabled:opacity-50`}
            >
                Next
            </button>
        </div>
    </div>
);


const InspectionView = ({ inspection, onBack }) => {
    const { isDarkMode } = useTheme();

    const ResultBadge = ({ result }) => {
        const colors = {
            pending: 'bg-gray-100 text-gray-800',
            pass: 'bg-green-100 text-green-800',
            fail: 'bg-red-100 text-red-800',
            conditional: 'bg-yellow-100 text-yellow-800'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[result] || colors.pending}`}>
                {(result || 'pending').toUpperCase()}
            </span>
        );
    };

    if (!inspection) {
        return (
            <div className="flex justify-center items-center h-64">
                <p>No inspection data available</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <button
                        onClick={onBack}
                        className="mr-4 text-gray-500 hover:text-gray-700"
                    >
                        ← Back
                    </button>
                    <h2 className="text-2xl font-bold">
                        Inspection: {inspection.inspectionNumber}
                    </h2>
                </div>
                <StatusBadge status={inspection.status} />
            </div>

            {/* Basic Details */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                <div>
                    <label className="block text-sm font-medium mb-1">GRN Number</label>
                    <p className="text-lg">{inspection.grn?.grnNumber}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Vendor</label>
                    <p className="text-lg">{inspection.grn?.vendor?.name}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <p className="text-lg">
                        {new Date(inspection.startDate).toLocaleDateString()}
                    </p>
                </div>
                {inspection.completionDate && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Completion Date</label>
                        <p className="text-lg">
                            {new Date(inspection.completionDate).toLocaleDateString()}
                        </p>
                    </div>
                )}
            </div>

            {/* Items */}
            <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-lg font-semibold mb-4">Inspected Items</h3>
                {inspection.items.map((item, index) => (
                    <div key={item._id} className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-medium">{item.itemDetails?.itemName || 'N/A'}</h4>
                                <p className="text-sm text-gray-500">{item.partCode}</p>
                            </div>
                            <ResultBadge result={item.result} />
                        </div>

                        {/* Quantities */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Received Qty</label>
                                <p className="text-lg">{item.receivedQuantity}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Inspected Qty</label>
                                <p className="text-lg">{item.inspectedQuantity}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Accepted Qty</label>
                                <p className="text-lg">{item.acceptedQuantity}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Rejected Qty</label>
                                <p className="text-lg">{item.rejectedQuantity}</p>
                            </div>
                        </div>

                        {/* Parameters */}
                        {item.parameters && item.parameters.length > 0 && (
                            <div className="mt-4">
                                <h5 className="font-medium mb-2">Inspection Parameters</h5>
                                <table className="min-w-full">
                                    <thead>
                                        <tr className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                                            <th className="px-4 py-2 text-left">Parameter</th>
                                            <th className="px-4 py-2 text-left">Value</th>
                                            <th className="px-4 py-2 text-left">Result</th>
                                            <th className="px-4 py-2 text-left">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {item.parameters.map((param, paramIndex) => (
                                            <tr key={paramIndex}>
                                                <td className="px-4 py-2">{param.parameterName}</td>
                                                <td className="px-4 py-2">{param.value}</td>
                                                <td className="px-4 py-2">
                                                    <ResultBadge result={param.result} />
                                                </td>
                                                <td className="px-4 py-2">{param.remarks || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Item Attachments */}
                        {item.attachments && item.attachments.length > 0 && (
                            <div className="mt-4">
                                <h5 className="font-medium mb-2">Attachments</h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {item.attachments.map((attachment, index) => (
                                        <div
                                            key={index}
                                            className={`p-2 rounded-lg flex items-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                                                }`}
                                        >
                                            <a
                                                href={attachment.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                {attachment.name}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Item Remarks */}
                        {item.remarks && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium mb-1">Remarks</label>
                                <p className="text-gray-600">{item.remarks}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Overall Remarks */}
            {inspection.remarks && (
                <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <h3 className="text-lg font-semibold mb-2">Overall Remarks</h3>
                    <p className="text-gray-600">{inspection.remarks}</p>
                </div>
            )}

            {/* Overall Result */}
            <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-lg font-semibold mb-2">Overall Result</h3>
                <ResultBadge result={inspection.overallResult} />
            </div>
        </div>
    );
};

// InspectionForm Component
// InspectionForm.jsx
export const InspectionForm = ({ inspection, onBack, onSuccess }) => {
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(false);

    // Initialize formData with proper checks for missing data
    const [formData, setFormData] = useState(() => {
        // Ensure items exist and have the required fields
        const initialItems = inspection?.items?.map(item => ({
            ...item,
            receivedQuantity: item.receivedQuantity || 0,
            inspectedQuantity: item.inspectedQuantity || 0,
            acceptedQuantity: item.acceptedQuantity || 0,
            rejectedQuantity: item.rejectedQuantity || 0,
            parameters: Array.isArray(item.parameters) ? item.parameters : [],
            result: item.result || 'pending',
            remarks: item.remarks || '',
            itemDetails: {
                ...item.itemDetails
            }
        })) || [];

        return {
            items: initialItems,
            status: inspection?.status || 'in_progress',
            remarks: inspection?.remarks || ''
        };
    });

    const handleSubmit = async (status) => {
        try {
            if (!inspection?._id) {
                toast.error('Invalid inspection data');
                return;
            }

            setLoading(true);
            const response = await axios.put(
                `${baseURL}/inspection/${inspection._id}`,
                {
                    ...formData,
                    status
                }
            );

            if (response.data.success) {
                toast.success('Inspection updated successfully');
                if (onSuccess) onSuccess(response.data.data);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error updating inspection:', error);
            toast.error('Failed to update inspection');
        } finally {
            setLoading(false);
        }
    };

    const handleParameterChange = (itemIndex, paramIndex, field, value) => {
        const newItems = [...formData.items];
        if (!newItems[itemIndex].parameters[paramIndex]) {
            newItems[itemIndex].parameters[paramIndex] = {};
        }
        newItems[itemIndex].parameters[paramIndex][field] = value;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addParameter = (itemIndex) => {
        const newItems = [...formData.items];
        if (!Array.isArray(newItems[itemIndex].parameters)) {
            newItems[itemIndex].parameters = [];
        }
        newItems[itemIndex].parameters.push({
            parameterName: '',
            value: '',
            result: 'pass',
            remarks: ''
        });
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const validateQuantities = (item, field, value) => {
        const numValue = Number(value);
        if (field === 'inspectedQuantity' && numValue > item.receivedQuantity) {
            toast.error('Inspected quantity cannot exceed received quantity');
            return false;
        }
        if (field === 'acceptedQuantity' || field === 'rejectedQuantity') {
            const otherField = field === 'acceptedQuantity' ? 'rejectedQuantity' : 'acceptedQuantity';
            const otherValue = Number(item[otherField] || 0);
            if (numValue + otherValue > item.inspectedQuantity) {
                toast.error('Sum of accepted and rejected quantities cannot exceed inspected quantity');
                return false;
            }
        }
        return true;
    };

    const updateItemQuantity = (itemIndex, field, value) => {
        const newItems = [...formData.items];
        const item = newItems[itemIndex];

        if (validateQuantities(item, field, value)) {
            item[field] = Number(value);
            setFormData(prev => ({ ...prev, items: newItems }));
        }
    };

    // Add null check for inspection
    if (!inspection) {
        return (
            <div className="flex justify-center items-center h-64">
                <p>No inspection data available</p>
            </div>
        );
    }

    return (
        <div>
            {/* Form Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <button
                        onClick={onBack}
                        className="mr-4 text-gray-500 hover:text-gray-700"
                    >
                        ← Back
                    </button>
                    <h2 className="text-2xl font-bold">
                        Inspection: {inspection.inspectionNumber}
                    </h2>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleSubmit('in_progress')}
                        disabled={loading}
                        className={`px-4 py-2 rounded-md border ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
                            }`}
                    >
                        Save Progress
                    </button>
                    <button
                        onClick={() => handleSubmit('completed')}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                    >
                        Complete Inspection
                    </button>
                </div>
            </div>

            {/* Items */}
            <div className="space-y-6">
                {formData.items.map((item, itemIndex) => (
                    <div
                        key={itemIndex}
                        className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">{item.itemDetails?.itemName || 'N/A'}</h3>
                                <p className="text-sm text-gray-500">Part Code: {item.partCode}</p>
                            </div>
                        </div>

                        {/* Quantities */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Received Quantity</label>
                                <input
                                    type="number"
                                    value={item.receivedQuantity}
                                    disabled
                                    className={`w-full px-3 py-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-300'
                                        }`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Inspected Quantity</label>
                                <input
                                    type="number"
                                    value={item.inspectedQuantity}
                                    onChange={(e) => updateItemQuantity(itemIndex, 'inspectedQuantity', e.target.value)}
                                    min="0"
                                    max={item.receivedQuantity}
                                    className={`w-full px-3 py-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                                        }`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Accepted Quantity</label>
                                <input
                                    type="number"
                                    value={item.acceptedQuantity}
                                    onChange={(e) => updateItemQuantity(itemIndex, 'acceptedQuantity', e.target.value)}
                                    min="0"
                                    max={item.inspectedQuantity}
                                    className={`w-full px-3 py-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                                        }`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Rejected Quantity</label>
                                <input
                                    type="number"
                                    value={item.rejectedQuantity}
                                    onChange={(e) => updateItemQuantity(itemIndex, 'rejectedQuantity', e.target.value)}
                                    min="0"
                                    max={item.inspectedQuantity}
                                    className={`w-full px-3 py-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                                        }`}
                                />
                            </div>
                        </div>

                        {/* Parameters Section */}
                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">Inspection Parameters</h4>
                                <button
                                    onClick={() => addParameter(itemIndex)}
                                    className="flex items-center text-blue-500 hover:text-blue-700"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add Parameter
                                </button>
                            </div>

                            {item.parameters.map((param, paramIndex) => (
                                <div key={paramIndex} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
                                    <input
                                        type="text"
                                        value={param.parameterName || ''}
                                        onChange={(e) => handleParameterChange(itemIndex, paramIndex, 'parameterName', e.target.value)}
                                        placeholder="Parameter Name"
                                        className={`w-full px-3 py-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                                            }`}
                                    />
                                    <input
                                        type="text"
                                        value={param.value || ''}
                                        onChange={(e) => handleParameterChange(itemIndex, paramIndex, 'value', e.target.value)}
                                        placeholder="Value"
                                        className={`w-full px-3 py-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                                            }`}
                                    />
                                    <select
                                        value={param.result || 'pass'}
                                        onChange={(e) => handleParameterChange(itemIndex, paramIndex, 'result', e.target.value)}
                                        className={`w-full px-3 py-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                                            }`}
                                    >
                                        <option value="pass">Pass</option>
                                        <option value="fail">Fail</option>
                                        <option value="conditional">Conditional</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={param.remarks || ''}
                                        onChange={(e) => handleParameterChange(itemIndex, paramIndex, 'remarks', e.target.value)}
                                        placeholder="Remarks"
                                        className={`w-full px-3 py-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                                            }`}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Item Remarks */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-1">Item Remarks</label>
                            <textarea
                                value={item.remarks || ''}
                                onChange={(e) => {
                                    const newItems = [...formData.items];
                                    newItems[itemIndex].remarks = e.target.value;
                                    setFormData(prev => ({ ...prev, items: newItems }));
                                }}
                                rows={2}
                                className={`w-full px-3 py-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                                    }`}
                                placeholder="Add any remarks about this item..."
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Overall Remarks */}
            <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <label className="block text-sm font-medium mb-1">Overall Inspection Remarks</label>
                <textarea
                    value={formData.remarks}
                    onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                        }`}
                    placeholder="Add any overall remarks about the inspection..."
                />
            </div>
        </div>
    );
};

export const InspectionManagement = () => {
    const { isDarkMode } = useTheme();
    const [view, setView] = useState('list');
    const [selectedInspection, setSelectedInspection] = useState(null);
    const [inspections, setInspections] = useState([]);
    const [pendingGRNs, setPendingGRNs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        dateFrom: '',
        dateTo: '',
        status: ''
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });

    // Fetch inspections with filters and pagination
    const fetchInspections = useCallback(async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: pagination.currentPage.toString(),
                limit: pagination.itemsPerPage.toString(),
                ...(filters.search && { search: filters.search }),
                ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
                ...(filters.dateTo && { dateTo: filters.dateTo }),
                ...(filters.status && { status: filters.status })
            });

            const response = await axios.get(`${baseURL}/inspection?${queryParams}`);
            if (response.data.success) {
                setInspections(response.data.data.inspections || []);
                setPendingGRNs(response.data.data.pendingGRNs || []);
                setPagination(prev => ({
                    ...prev,
                    totalPages: response.data.pagination.pages,
                    totalItems: response.data.pagination.total
                }));
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error fetching inspections:', error);
            toast.error('Failed to fetch inspections');
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.currentPage, pagination.itemsPerPage]);

    useEffect(() => {
        fetchInspections();
    }, [fetchInspections]);

    // Handle inspection creation
    const handleCreateInspection = async (grn) => {
        try {
            setLoading(true);
            const inspectionItems = grn.items.map(item => ({
                grnItemId: item._id,
                partCode: item.partCode,
                receivedQuantity: item.receivedQuantity,
                itemDetails: {
                    partCodeNumber: item.partCode,
                    itemName: item.itemDetails?.itemName || item.masterItemName || 'N/A',
                    measurementUnit: item.itemDetails?.measurementUnit || item.masterMeasurementUnit || 'Units'
                }
            }));

            const response = await axios.post(`${baseURL}/inspection/create`, {
                grnId: grn._id,
                items: inspectionItems
            });

            if (response.data.success) {
                toast.success('Inspection created successfully');
                fetchInspections();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error creating inspection:', error);
            toast.error('Failed to create inspection');
        } finally {
            setLoading(false);
        }
    };

    // Handle inspection view/edit/back navigation
    const handleViewInspection = (inspection) => {
        setSelectedInspection(inspection);
        setView('view');
    };

    const handleStartInspection = async (inspection) => {
        try {
            setLoading(true);
            const response = await axios.get(`${baseURL}/inspection/${inspection._id}`);
            if (response.data.success) {
                setSelectedInspection(response.data.data);
                setView('perform');
            } else {
                toast.error('Failed to load inspection details');
            }
        } catch (error) {
            console.error('Error loading inspection:', error);
            toast.error('Failed to load inspection details');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setView('list');
        setSelectedInspection(null);
        fetchInspections();
    };

    // Render content based on current view
    const renderContent = () => {
        switch (view) {
            case 'view':
                return (
                    <InspectionView
                        inspection={selectedInspection}
                        onBack={handleBack}
                    />
                );
            case 'perform':
                return (
                    <InspectionForm
                        inspection={selectedInspection}
                        onBack={handleBack}
                        onSuccess={() => {
                            fetchInspections();
                            handleBack();
                        }}
                    />
                );
            default:
                return (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Inspection Records</h2>
                        </div>

                        <FilterSection
                            filters={filters}
                            setFilters={setFilters}
                            isDarkMode={isDarkMode}
                        />

                        <PendingGRNsTable
                            pendingGRNs={pendingGRNs}
                            onCreateInspection={handleCreateInspection}
                            isDarkMode={isDarkMode}
                        />

                        <InspectionsTable
                            inspections={inspections}
                            onView={handleViewInspection}
                            onStart={handleStartInspection}
                            isDarkMode={isDarkMode}
                            loading={loading}
                        />

                        <Pagination
                            pagination={pagination}
                            onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
                            isDarkMode={isDarkMode}
                        />
                    </>
                );
        }
    };

    return (
        <div className={`p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
            {renderContent()}
        </div>
    );
};

export default InspectionManagement;