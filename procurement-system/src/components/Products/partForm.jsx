/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';

const BASE_URL = 'http://localhost:5000/api/parts';

const useApi = () => {
    const makeRequest = useCallback(async (method, url, data = null, params = null) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios({
                method,
                url,
                data,
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }, []);

    return { makeRequest };
};

const Dropdown = ({ label, onChange, onSearch, onCreate, options, loading, isDarkMode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setSearchTerm(newValue);
        onChange(newValue);
        onSearch(newValue);
    };

    const handleFocus = () => {
        setIsOpen(true);
        if (!searchTerm) {
            onSearch('');
        }
    };

    const baseInputClass = `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${isDarkMode
        ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500'
        : 'bg-white text-gray-900 border-gray-300 focus:ring-blue-500 focus:border-blue-500'
        }`;

    const baseDropdownClass = `absolute z-10 w-full mt-1 border rounded-md shadow-lg max-h-60 overflow-auto ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
        }`;

    return (
        <div className="mb-4 relative" ref={dropdownRef}>
            <label className={`block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {label}
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    className={baseInputClass}
                    placeholder={`Search ${label.toLowerCase()}`}
                />
                {isOpen && (
                    <div className={baseDropdownClass}>
                        {loading ? (
                            <div className={`px-4 py-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading...</div>
                        ) : options.length > 0 ? (
                            options.map((option) => (
                                <div
                                    key={option.value}
                                    className={`px-4 py-2 cursor-pointer ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                                        }`}
                                    onClick={() => {
                                        onChange(option.label);
                                        setSearchTerm(option.label);
                                        setIsOpen(false);
                                    }}
                                >
                                    {option.label}
                                </div>
                            ))
                        ) : (
                            <div
                                className={`px-4 py-2 cursor-pointer ${isDarkMode ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-gray-100'
                                    }`}
                                onClick={() => {
                                    onCreate(searchTerm);
                                    setIsOpen(false);
                                }}
                            >
                                Create &quot;{searchTerm}&quot;
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const PartForm = ({ onSubmit, onCancel, initialData = {} }) => {
    const { isDarkMode } = useTheme();
    const { makeRequest } = useApi();
    const [formData, setFormData] = useState({
        PartCodeNumber: '',
        ItemCode: '',
        sizeName: '',
        colourName: '',
        SerialNumber: '',
        itemMakeName: '',
        measurementUnit: '',
        ...initialData
    });

    const [items, setItems] = useState([]);
    const [dropdownOptions, setDropdownOptions] = useState({
        sizeName: [],
        colourName: [],
        itemMakeName: [],
        measurementUnit: []
    });
    const [loading, setLoading] = useState({
        sizeName: false,
        colourName: false,
        itemMakeName: false,
        measurementUnit: false
    });

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await makeRequest('GET', 'http://localhost:5000/api/items');
                setItems(response.data.map(item => ({ value: item.ItemCode, label: `${item.ItemCode} - ${item.ItemName}` })));
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };
        fetchItems();
    }, [makeRequest]);

    const handleInputChange = (field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleDropdownSearch = useCallback(async (field, searchTerm) => {
        setLoading(prev => ({ ...prev, [field]: true }));
        try {
            let endpoint;
            switch (field) {
                case 'sizeName':
                    endpoint = searchTerm ? `${BASE_URL}/sizes/searchSizeNames` : `${BASE_URL}/sizes/allSizeNames`;
                    break;
                case 'colourName':
                    endpoint = searchTerm ? `${BASE_URL}/colours/searchColourNames` : `${BASE_URL}/colours/allColourNames`;
                    break;
                case 'itemMakeName':
                    endpoint = searchTerm ? `${BASE_URL}/makers/searchMakerNames` : `${BASE_URL}/makers/allMakerNames`;
                    break;
                case 'measurementUnit':
                    endpoint = searchTerm ? `${BASE_URL}/units/searchMeasurementUnits` : `${BASE_URL}/units/allMeasurementUnits`;
                    break;
                default:
                    throw new Error(`Invalid field: ${field}`);
            }

            const response = await makeRequest('GET', endpoint, null, searchTerm ? { query: searchTerm } : null);
            setDropdownOptions(prev => ({
                ...prev,
                [field]: response.data.map(item => ({ value: item._id, label: item.name }))
            }));
        } catch (error) {
            console.error(`Error fetching ${field} options:`, error);
            setDropdownOptions(prev => ({ ...prev, [field]: [] }));
        } finally {
            setLoading(prev => ({ ...prev, [field]: false }));
        }
    }, [makeRequest]);

    const handleCreateNew = useCallback(async (field, name) => {
        try {
            let endpoint;
            switch (field) {
                case 'sizeName':
                    endpoint = `${BASE_URL}/sizes/createSizeName`;
                    break;
                case 'colourName':
                    endpoint = `${BASE_URL}/colours/createColourName`;
                    break;
                case 'itemMakeName':
                    endpoint = `${BASE_URL}/makers/createMakerName`;
                    break;
                case 'measurementUnit':
                    endpoint = `${BASE_URL}/units/createMeasurementUnit`;
                    break;
                default:
                    throw new Error(`Invalid field: ${field}`);
            }

            const response = await makeRequest('POST', endpoint, { name });
            if (response.success) {
                setFormData(prev => ({ ...prev, [field]: name }));
                alert(`New ${field.replace('Name', '')} "${name}" created successfully!`);
                // Refresh the options for this field
                handleDropdownSearch(field, '');
            }
        } catch (error) {
            console.error(`Error creating new ${field}:`, error);
            alert(`Failed to create new ${field.replace('Name', '')}: ${error.response?.data?.error || error.message}`);
        }
    }, [makeRequest, handleDropdownSearch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const formClass = `m-3 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`;

    const inputClass = `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${isDarkMode
        ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500'
        : 'bg-white text-gray-900 border-gray-300 focus:ring-blue-500 focus:border-blue-500'
        }`;

    const labelClass = `block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;

    const buttonClass = `px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 ${isDarkMode
        ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
        : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500'
        }`;

    return (
        <form onSubmit={handleSubmit} className={formClass}>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                    <label className={labelClass}>Part Code Number</label>
                    <input
                        type="text"
                        value={formData.PartCodeNumber}
                        onChange={handleInputChange('PartCodeNumber')}
                        className={inputClass}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className={labelClass}>Item Code</label>
                    <select
                        value={formData.ItemCode}
                        onChange={handleInputChange('ItemCode')}
                        className={inputClass}
                        required
                    >
                        <option value="">Select Item Code</option>
                        {items.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Dropdown
                    label="Size"
                    value={formData.sizeName}
                    onChange={(value) => setFormData(prev => ({ ...prev, sizeName: value }))}
                    onSearch={(term) => handleDropdownSearch('sizeName', term)}
                    onCreate={(name) => handleCreateNew('sizeName', name)}
                    options={dropdownOptions.sizeName}
                    loading={loading.sizeName}
                    isDarkMode={isDarkMode}
                />
                <Dropdown
                    label="Colour"
                    value={formData.colourName}
                    onChange={(value) => setFormData(prev => ({ ...prev, colourName: value }))}
                    onSearch={(term) => handleDropdownSearch('colourName', term)}
                    onCreate={(name) => handleCreateNew('colourName', name)}
                    options={dropdownOptions.colourName}
                    loading={loading.colourName}
                    isDarkMode={isDarkMode}
                />
            </div>

            <div className="mb-4">
                <label className={labelClass}>Serial Number</label>
                <input
                    type="text"
                    value={formData.SerialNumber}
                    onChange={handleInputChange('SerialNumber')}
                    className={inputClass}
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Dropdown
                    label="Maker"
                    value={formData.itemMakeName}
                    onChange={(value) => setFormData(prev => ({ ...prev, itemMakeName: value }))}
                    onSearch={(term) => handleDropdownSearch('itemMakeName', term)}
                    onCreate={(name) => handleCreateNew('itemMakeName', name)}
                    options={dropdownOptions.itemMakeName}
                    loading={loading.itemMakeName}
                    isDarkMode={isDarkMode}
                />
                <Dropdown
                    label="Measurement Unit"
                    value={formData.measurementUnit}
                    onChange={(value) => setFormData(prev => ({ ...prev, measurementUnit: value }))}
                    onSearch={(term) => handleDropdownSearch('measurementUnit', term)}
                    onCreate={(name) => handleCreateNew('measurementUnit', name)}
                    options={dropdownOptions.measurementUnit}
                    loading={loading.measurementUnit}
                    isDarkMode={isDarkMode}
                />
            </div>

            <div className="mt-6 flex justify-end space-x-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className={`${buttonClass} bg-gray-500 hover:bg-gray-600`}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className={buttonClass}
                >
                    Submit
                </button>
            </div>
        </form>
    );
};

export default PartForm;