/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, LayoutList, Calendar, Clock, PlusCircle, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ListComponent = ({
    title,
    data,
    columns,
    onFetch,
    totalPages,
    onCreateNew,
    isLoading,
    showHeader = true,
    debounceTime = 300,
    enableClickableSearch = false
}) => {
    const { isDarkMode } = useTheme();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const safeData = Array.isArray(data) ? data : [];

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        onFetch(newPage);
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        onFetch(1, 10, event.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setCurrentPage(1);
        onFetch(1, 10, ''); // Reset search
    };

    const filteredData = safeData.filter(item =>
        columns.some(column =>
            String(item[column.key]).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleCellClick = (value) => {
        if (enableClickableSearch && value) {
            setSearchTerm(String(value));
            setCurrentPage(1);
            debouncedSearch(String(value));
        }
    };

    return (
        <div className="">
            {showHeader && (
                <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{title}</h2>
                    <button
                        className={`bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center transition duration-300 ease-in-out`}
                        onClick={onCreateNew}
                    >
                        <PlusCircle size={20} className="mr-2" />
                        New {title.replace("Master", "")}
                    </button>
                </div>
            )}
            <div className="mb-6 flex justify-between items-center">
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className={`w-full ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'} pl-10 pr-10 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600`}
                    />
                    <svg
                        className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    {searchTerm && (
                        <button
                            onClick={handleClearSearch}
                            className={`absolute right-3 top-2.5 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors`}
                        >
                            <X size={18} className="text-gray-400" />
                        </button>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button className={`p-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-md transition duration-300 ease-in-out`}>
                        <LayoutList size={20} />
                    </button>
                    <button className={`p-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-md transition duration-300 ease-in-out`}>
                        <LayoutGrid size={20} />
                    </button>
                    <button className={`p-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-md transition duration-300 ease-in-out`}>
                        <Calendar size={20} />
                    </button>
                    <button className={`p-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-md transition duration-300 ease-in-out`}>
                        <Clock size={20} />
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className={`text-left border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            {columns.map((column, index) => (
                                <th key={index} className={`px-4 py-3 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{column.header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-4">Loading...</td>
                            </tr>
                        ) : filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-4">Nothing found!</td>
                            </tr>
                        ) : (
                            filteredData.map((item, rowIndex) => (
                                <tr key={rowIndex} className={`border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-100'} transition duration-300 ease-in-out`}>
                                    {columns.map((column, colIndex) => (
                                        <td 
                                            key={colIndex} 
                                            className={`px-4 py-4 ${enableClickableSearch ? 'cursor-pointer hover:bg-opacity-80' : ''}`}
                                            onClick={() => handleCellClick(item[column.key])}
                                        >
                                            {column.render 
                                                ? column.render(item) 
                                                : item[column.key] === "" 
                                                    ? "NaN" 
                                                    : item[column.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center mt-6">
                <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{`${(currentPage - 1) * 10 + 1}-${Math.min(currentPage * 10, filteredData.length)} / ${filteredData.length}`}</div>
                <div className="flex space-x-2">
                    <button
                        className={`p-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-md transition duration-300 ease-in-out disabled:opacity-50`}
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isLoading}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        className={`p-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-md transition duration-300 ease-in-out disabled:opacity-50`}
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || isLoading}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ListComponent;