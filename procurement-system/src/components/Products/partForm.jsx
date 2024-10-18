import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import { debounce } from 'lodash'; // Make sure to install lodash if not already present

const PartForm = ({ onSubmit, onCancel, initialData = {} }) => {
    const { isDarkMode } = useTheme();
    const [formData, setFormData] = useState({
        PartCodeNumber: '',
        ItemCode: '',
        SizeName: 'NONE',
        ColourName: '',
        SerialNumber: '',
        ItemMakeName: 'NONE',
        MeasurementUnit: 'NONE',
        ...initialData
    });

    const [sizes, setSizes] = useState([]);
    const [colours, setColours] = useState([]);
    const [filteredColours, setFilteredColours] = useState([]);
    const [makers, setMakers] = useState([]);
    const [units, setUnits] = useState([]);
    const [items, setItems] = useState([]);
    const [isSearchingColour, setIsSearchingColour] = useState(false);
    const [showColourDropdown, setShowColourDropdown] = useState(false);
    const colourInputRef = useRef(null);

    useEffect(() => {
        fetchOptions();
    }, []);

    const fetchOptions = async () => {
        const token = localStorage.getItem('token');
        try {
            const [sizesRes, coloursRes, makersRes, unitsRes, itemsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/parts/sizes/allSizeNames', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/parts/colours/allColourNames', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/parts/makers/allMakerNames', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/parts/units/allMeasurementUnits', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/items', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            setSizes(sizesRes.data.data);
            setColours(coloursRes.data.data);
            setMakers(makersRes.data.data);
            setUnits(unitsRes.data.data);
            setItems(itemsRes.data.data);
        } catch (error) {
            console.error('Error fetching options:', error);
        }
    };

    const debouncedSearchColours = debounce(async (searchTerm) => {
        if (searchTerm.length < 2) {
            setFilteredColours(colours);
            return;
        }
        setIsSearchingColour(true);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`http://localhost:5000/api/parts/colours/searchColourNames`, {
                params: { query: searchTerm },
                headers: { Authorization: `Bearer ${token}` }
            });
            setFilteredColours(response.data.data);
        } catch (error) {
            console.error('Error searching colours:', error);
        } finally {
            setIsSearchingColour(false);
        }
    }, 300);

    const handleColourInputChange = (e) => {
        const { value } = e.target;
        setFormData(prevState => ({ ...prevState, ColourName: value }));
        setShowColourDropdown(true);
        debouncedSearchColours(value);
    };

    const handleColourSelect = (colour) => {
        setFormData(prevState => ({ ...prevState, ColourName: colour }));
        setShowColourDropdown(false);
    };

    const handleCreateNewColour = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post('http://localhost:5000/api/parts/colours/createColourName', 
                { name: formData.ColourName },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                const newColour = response.data.data;
                
                // Update the colours list
                setColours(prevColours => [...prevColours, newColour]);
                
                // Update the filtered colours list
                setFilteredColours(prevFiltered => [...prevFiltered, newColour]);
                
                // Update the form data
                setFormData(prevState => ({ ...prevState, ColourName: newColour.name }));
                
                // Close the dropdown
                setShowColourDropdown(false);

                // Optionally, show a success message
                alert(`New colour "${newColour.name}" created successfully!`);
            }
        } catch (error) {
            console.error('Error creating new colour:', error);
            // Optionally, show an error message
            alert(`Failed to create new colour: ${error.response?.data?.error || error.message}`);
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
                    <label htmlFor="PartCodeNumber" className={labelClass}>Part Code Number</label>
                    <input type="text" id="PartCodeNumber" name="PartCodeNumber" value={formData.PartCodeNumber} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                    <label htmlFor="ItemCode" className={labelClass}>Item Code</label>
                    <select id="ItemCode" name="ItemCode" value={formData.ItemCode} onChange={handleChange} className={inputClass} required>
                        <option value="">Select an item</option>
                        {items.map(item => (
                            <option key={item._id} value={item.ItemCode}>{item.ItemCode} - {item.ItemName}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="SizeName" className={labelClass}>Size</label>
                    <select id="SizeName" name="SizeName" value={formData.SizeName} onChange={handleChange} className={inputClass} required>
                        <option value="NONE">NONE</option>
                        {sizes.map(size => (
                            <option key={size._id} value={size.name}>{size.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="ColourName" className={labelClass}>Colour</label>
                    <div className="relative">
                        <input
                            ref={colourInputRef}
                            type="text"
                            id="ColourName"
                            name="ColourName"
                            value={formData.ColourName}
                            onChange={handleColourInputChange}
                            onFocus={() => setShowColourDropdown(true)}
                            className={inputClass}
                            placeholder="Type to search or add a colour"
                            required
                        />
                        {showColourDropdown && (
                            <ul className={`absolute z-10 w-full mt-1 max-h-60 overflow-auto rounded-md shadow-lg ${
                                isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
                            }`}>
                                {isSearchingColour ? (
                                    <li className="px-4 py-2 text-sm">Searching...</li>
                                ) : filteredColours.length > 0 ? (
                                    filteredColours.map(colour => (
                                        <li
                                            key={colour._id}
                                            className={`px-4 py-2 text-sm cursor-pointer hover:${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'}`}
                                            onClick={() => handleColourSelect(colour.name)}
                                        >
                                            {colour.name}
                                        </li>
                                    ))
                                ) : (
                                    <li
                                        className={`px-4 py-2 text-sm cursor-pointer hover:${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'}`}
                                        onClick={handleCreateNewColour}
                                    >
                                        Create new colour: {formData.ColourName}
                                    </li>
                                )}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
            <div>
                <label htmlFor="SerialNumber" className={labelClass}>Serial Number</label>
                <input type="text" id="SerialNumber" name="SerialNumber" value={formData.SerialNumber} onChange={handleChange} className={inputClass} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="ItemMakeName" className={labelClass}>Maker</label>
                    <select id="ItemMakeName" name="ItemMakeName" value={formData.ItemMakeName} onChange={handleChange} className={inputClass} required>
                        <option value="NONE">NONE</option>
                        {makers.map(maker => (
                            <option key={maker._id} value={maker.name}>{maker.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="MeasurementUnit" className={labelClass}>Measurement Unit</label>
                    <select id="MeasurementUnit" name="MeasurementUnit" value={formData.MeasurementUnit} onChange={handleChange} className={inputClass} required>
                        <option value="NONE">NONE</option>
                        {units.map(unit => (
                            <option key={unit._id} value={unit.name}>{unit.name}</option>
                        ))}
                    </select>
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

export default PartForm;
