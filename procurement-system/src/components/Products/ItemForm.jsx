import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import { baseURL } from '../../utils/endpoint';
const ItemForm = ({ onSubmit, onCancel, initialData = {} }) => {
    const { isDarkMode } = useTheme();
    const [formData, setFormData] = useState({
        ItemCode: '',
        ItemName: '',
        type: 'good',
        SAC_HSN_Code: '',
        ItemCategory: '',
        IGST_Rate: '',
        CGST_Rate: '',
        SGST_Rate: '',
        UTGST_Rate: '',
        ...initialData
    });
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${baseURL}/items/allCategories`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("response",response);
            setCategories(response.data.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const inputClass = `w-full p-2 rounded-md border ${
        isDarkMode 
            ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' 
            : 'bg-white text-gray-800 border-gray-300 focus:border-blue-500'
    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`;

    const labelClass = `block text-sm font-medium mb-1 ${
        isDarkMode ? 'text-gray-200' : 'text-gray-700'
    }`;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="ItemCode" className={labelClass}>Item Code</label>
                    <input type="text" id="ItemCode" name="ItemCode" value={formData.ItemCode} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                    <label htmlFor="ItemName" className={labelClass}>Item Name</label>
                    <input type="text" id="ItemName" name="ItemName" value={formData.ItemName} onChange={handleChange} className={inputClass} required />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="type" className={labelClass}>Type</label>
                    <select id="type" name="type" value={formData.type} onChange={handleChange} className={inputClass} required>
                        <option value="good">Good</option>
                        <option value="service">Service</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="SAC_HSN_Code" className={labelClass}>SAC/HSN Code</label>
                    <input type="text" id="SAC_HSN_Code" name="SAC_HSN_Code" value={formData.SAC_HSN_Code} onChange={handleChange} className={inputClass} />
                </div>
            </div>
            <div>
                <label htmlFor="ItemCategory" className={labelClass}>Item Category</label>
                <select 
                    id="ItemCategory" 
                    name="ItemCategory" 
                    value={formData.ItemCategory} 
                    onChange={handleChange} 
                    className={inputClass}
                >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                        <option key={category._id} value={category.name}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="IGST_Rate" className={labelClass}>IGST Rate (%)</label>
                    <input type="number" id="IGST_Rate" name="IGST_Rate" value={formData.IGST_Rate} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                    <label htmlFor="CGST_Rate" className={labelClass}>CGST Rate (%)</label>
                    <input type="number" id="CGST_Rate" name="CGST_Rate" value={formData.CGST_Rate} onChange={handleChange} className={inputClass} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="SGST_Rate" className={labelClass}>SGST Rate (%)</label>
                    <input type="number" id="SGST_Rate" name="SGST_Rate" value={formData.SGST_Rate} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                    <label htmlFor="UTGST_Rate" className={labelClass}>UTGST Rate (%)</label>
                    <input type="number" id="UTGST_Rate" name="UTGST_Rate" value={formData.UTGST_Rate} onChange={handleChange} className={inputClass} />
                </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
                <button 
                    type="button" 
                    onClick={onCancel} 
                    className={`px-4 py-2 rounded-md ${
                        isDarkMode 
                            ? 'bg-gray-600 text-white hover:bg-gray-700' 
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    } transition-colors duration-200`}
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                >
                    Submit
                </button>
            </div>
        </form>
    );
};

export default ItemForm;
