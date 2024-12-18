import { Form, Input, Select, Space, Button } from 'antd';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { baseURL } from '../../utils/endpoint';

const PartForm = ({ onSubmit, onCancel, isLoading, initialData }) => {
    const [form] = Form.useForm();
    const [items, setItems] = useState([]);
    const [dropdownOptions, setDropdownOptions] = useState({
        SizeName: [],
        ColourName: [],
        ItemMakeName: [],
        MeasurementUnit: []
    });

    useEffect(() => {
        fetchItems();
        fetchDropdownOptions();
        if (initialData) {
            form.setFieldsValue(initialData);
        }
    }, [initialData, form]);

    const fetchItems = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${baseURL}/items`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setItems(response.data.data.map(item => ({
                value: item.ItemCode,
                label: `${item.ItemCode} - ${item.ItemName}`
            })));
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const fetchDropdownOptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const endpoints = ['sizes', 'colours', 'makers', 'units'];
            const responses = await Promise.all(
                endpoints.map(endpoint =>
                    axios.get(`${baseURL}/parts/${endpoint}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                )
            );

            setDropdownOptions({
                SizeName: responses[0].data.data.map(size => ({ value: size.name, label: size.name })),
                ColourName: responses[1].data.data.map(color => ({ value: color.name, label: color.name })),
                ItemMakeName: responses[2].data.data.map(maker => ({ value: maker.name, label: maker.name })),
                MeasurementUnit: responses[3].data.data.map(unit => ({ value: unit.name, label: unit.name }))
            });
        } catch (error) {
            console.error('Error fetching dropdown options:', error);
        }
    };

    const handleFinish = async (values) => {
        onSubmit(values);
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            initialValues={initialData}
        >
            <div className="grid grid-cols-2 gap-4">
                <Form.Item
                    label="Part Code Number"
                    name="PartCodeNumber"
                    rules={[{ required: true, message: 'Please enter part code number' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Item Code"
                    name="ItemCode"
                    rules={[{ required: true, message: 'Please select item code' }]}
                >
                    <Select
                        showSearch
                        options={items}
                        filterOption={(input, option) =>
                            option.label.toLowerCase().includes(input.toLowerCase())
                        }
                    />
                </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Form.Item
                    label="Size"
                    name="SizeName"
                >
                    <Select
                        showSearch
                        options={dropdownOptions.SizeName}
                        filterOption={(input, option) =>
                            option.label.toLowerCase().includes(input.toLowerCase())
                        }
                    />
                </Form.Item>

                <Form.Item
                    label="Colour"
                    name="ColourName"
                >
                    <Select
                        showSearch
                        options={dropdownOptions.ColourName}
                        filterOption={(input, option) =>
                            option.label.toLowerCase().includes(input.toLowerCase())
                        }
                    />
                </Form.Item>
            </div>

            <Form.Item
                label="Serial Number"
                name="SerialNumber"
                rules={[{ required: true, message: 'Please enter serial number' }]}
            >
                <Input />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
                <Form.Item
                    label="Maker"
                    name="ItemMakeName"
                >
                    <Select
                        showSearch
                        options={dropdownOptions.ItemMakeName}
                        filterOption={(input, option) =>
                            option.label.toLowerCase().includes(input.toLowerCase())
                        }
                    />
                </Form.Item>

                <Form.Item
                    label="Measurement Unit"
                    name="MeasurementUnit"
                >
                    <Select
                        showSearch
                        options={dropdownOptions.MeasurementUnit}
                        filterOption={(input, option) =>
                            option.label.toLowerCase().includes(input.toLowerCase())
                        }
                    />
                </Form.Item>
            </div>

            <Form.Item className="mb-0">
                <Space className="float-right">
                    <Button onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="primary" htmlType="submit" loading={isLoading}>
                        {initialData ? 'Update' : 'Create'}
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
};

export default PartForm;