/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';
import { Search, Plus, Trash2 } from 'lucide-react';

const MasterComponent = ({ title, searchEndpoint, getAllEndpoint, createEndpoint, deleteEndpoint }) => {
    const [items, setItems] = useState([]);
    const [newItemName, setNewItemName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const { isDarkMode } = useTheme();

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await axios.get(getAllEndpoint);
            setItems(response.data.data);
        } catch (error) {
            alert(error + 'Failed to fetch items');
        }
    };

    const handleCreate = async () => {
        if (!newItemName.trim()) {
            alert('Please enter a name');
            return;
        }
        try {
            await axios.post(createEndpoint, { name: newItemName });
            alert('Item created successfully');
            setNewItemName('');
            fetchItems();
        } catch (error) {
            alert(error + 'Failed to create item');
        }
    };

    const handleSearch = async () => {
        try {
            const response = await axios.get(`${searchEndpoint}?query=${searchQuery}`);
            setItems(response.data.data);
        } catch (error) {
            alert(error + 'Failed to search items');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await axios.delete(`${deleteEndpoint}/${id}`);
                alert('Item deleted successfully');
                fetchItems();
            } catch (error) {
                alert(error + 'Failed to delete item');
            }
        }
    };

    return (
        <div className={`p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded - lg shadow - md`}>
            <h2 className="text-2xl font-bold mb-6">{title}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Create New {title}</h3>
                    <div className="flex">
                        <input
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder={`Enter ${title} name`}
                            className="flex-grow mr-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleCreate}
                            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <Plus size={18} className="mr-2" />
                            Create
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Search {title}</h3>
                    <div className="flex">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`Search ${title}`}
                            className="flex-grow mr-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleSearch}
                            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <Search size={18} className="mr-2" />
                            Search
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-3">{title} List</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className={isDarkMode ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}>
                            {items.map((item) => (
                                <tr key={item._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {item.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="text-red-600 hover:text-red-900 focus:outline-none"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MasterComponent;