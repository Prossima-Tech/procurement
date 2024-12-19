import { useState, useEffect, useCallback } from 'react';
import { Table, Input, Button, Card, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';

const { Search: AntSearch } = Input;

const MasterComponent = ({ title, searchEndpoint, getAllEndpoint, createEndpoint, deleteEndpoint }) => {
    const [items, setItems] = useState([]);
    const [newItemName, setNewItemName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const { isDarkMode } = useTheme();

    // Debounced search handler using useCallback
    const debouncedSearch = useCallback(
        (query) => {
            handleSearch(query);
        },
        [searchEndpoint]
    );

    // Effect for debouncing search
    useEffect(() => {
        const timer = setTimeout(() => {
            debouncedSearch(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, debouncedSearch]);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await axios.get(getAllEndpoint);
            setItems(response.data.data);
        } catch (error) {
            message.error('Failed to fetch items: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newItemName.trim()) {
            message.warning('Please enter a name');
            return;
        }
        try {
            setLoading(true);
            await axios.post(createEndpoint, { name: newItemName });
            message.success('Item created successfully');
            setNewItemName('');
            fetchItems();
        } catch (error) {
            message.error('Failed to create item: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query) => {
        try {
            setLoading(true);
            const response = await axios.get(`${searchEndpoint}?query=${query}`);
            setItems(response.data.data);
        } catch (error) {
            message.error('Failed to search items: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            await axios.delete(`${deleteEndpoint}/${id}`);
            message.success('Item deleted successfully');
            fetchItems();
        } catch (error) {
            message.error('Failed to delete item: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'right',
            render: (_, record) => (
                <Popconfirm
                    title="Delete Item"
                    description="Are you sure you want to delete this item?"
                    onConfirm={() => handleDelete(record._id)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button 
                        type="link" 
                        danger 
                        icon={<DeleteOutlined />}
                    />
                </Popconfirm>
            ),
        },
    ];

    return (
        <Card 
            title={title}
            className={isDarkMode ? 'bg-gray-800 text-white' : ''}
        >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Create Section */}
                <Card size="small" title={`Create New ${title}`}>
                    <Space.Compact style={{ width: '100%' }}>
                        <Input
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder={`Enter ${title} name`}
                            onPressEnter={handleCreate}
                        />
                        <Button 
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreate}
                            loading={loading}
                        >
                            Create
                        </Button>
                    </Space.Compact>
                </Card>

                {/* Search Section */}
                <Card size="small" title={`Search ${title}`}>
                    <AntSearch
                        placeholder={`Search ${title}`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onSearch={handleSearch}
                        enterButton={<Button icon={<SearchOutlined />}>Search</Button>}
                    />
                </Card>

                {/* Table Section */}
                <Table
                    columns={columns}
                    dataSource={items}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total, range) => 
                            `${range[0]}-${range[1]} of ${total} items`,
                    }}
                />
            </Space>
        </Card>
    );
};

export default MasterComponent;