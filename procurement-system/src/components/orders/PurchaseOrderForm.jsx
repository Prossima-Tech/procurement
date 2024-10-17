/* eslint-disable react/prop-types */
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const PurchaseOrderForm = ({ onSubmit, onCancel }) => {
    const { isDarkMode } = useTheme();
    const [formData, setFormData] = useState({
        reference: '',
        vendorName: '',
        total: '',
        expectedArrival: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="reference" className="block mb-1">Reference</label>
                <input
                    type="text"
                    id="reference"
                    name="reference"
                    value={formData.reference}
                    onChange={handleChange}
                    className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
                    required
                />
            </div>
            <div>
                <label htmlFor="vendorName" className="block mb-1">Vendor Name</label>
                <input
                    type="text"
                    id="vendorName"
                    name="vendorName"
                    value={formData.vendorName}
                    onChange={handleChange}
                    className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
                    required
                />
            </div>
            <div>
                <label htmlFor="total" className="block mb-1">Total</label>
                <input
                    type="number"
                    id="total"
                    name="total"
                    value={formData.total}
                    onChange={handleChange}
                    className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
                    required
                />
            </div>
            <div>
                <label htmlFor="expectedArrival" className="block mb-1">Expected Arrival</label>
                <input
                    type="date"
                    id="expectedArrival"
                    name="expectedArrival"
                    value={formData.expectedArrival}
                    onChange={handleChange}
                    className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
                    required
                />
            </div>
            <div className="flex justify-end space-x-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">
                    Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Create
                </button>
            </div>
        </form>
    );
};

export default PurchaseOrderForm;