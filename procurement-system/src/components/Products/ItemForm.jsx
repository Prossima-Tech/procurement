/* eslint-disable react/prop-types */
import { Form, Input, Select, InputNumber, Button, Space } from 'antd';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { baseURL } from '../../utils/endpoint';

const ItemForm = ({ onSubmit, onCancel, isLoading, initialData }) => {
    const [form] = Form.useForm();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchCategories();
        if (initialData) {
            form.setFieldsValue(initialData);
        }
    }, [initialData, form]);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${baseURL}/items/allCategories`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleFinish = (values) => {
        onSubmit(values);
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            initialValues={{
                type: 'good',
                ...initialData
            }}
        >
            <div className="grid grid-cols-2 gap-4">
                <Form.Item
                    label="Item Code"
                    name="ItemCode"
                    rules={[{ required: true, message: 'Please enter item code' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Item Name"
                    name="ItemName"
                    rules={[{ required: true, message: 'Please enter item name' }]}
                >
                    <Input />
                </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Form.Item
                    label="Type"
                    name="type"
                    rules={[{ required: true }]}
                >
                    <Select>
                        <Select.Option value="good">Good</Select.Option>
                        <Select.Option value="service">Service</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label="SAC/HSN Code"
                    name="SAC_HSN_Code"
                >
                    <Input />
                </Form.Item>
            </div>

            <Form.Item
                label="Category"
                name="ItemCategory"
            >
                <Select>
                    <Select.Option value="">Select a category</Select.Option>
                    {categories.map(category => (
                        <Select.Option key={category._id} value={category.name}>
                            {category.name}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
                <Form.Item label="IGST Rate (%)" name="IGST_Rate">
                    <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="CGST Rate (%)" name="CGST_Rate">
                    <InputNumber style={{ width: '100%' }} />
                </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Form.Item label="SGST Rate (%)" name="SGST_Rate">
                    <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="UTGST Rate (%)" name="UTGST_Rate">
                    <InputNumber style={{ width: '100%' }} />
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

export default ItemForm;
