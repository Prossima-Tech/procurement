/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, DatePicker, Input, Card, Steps, Button, message, Tag } from 'antd';
import { baseURL } from '../../../utils/endpoint';
import axios from 'axios';

const { TextArea } = Input;
const { Step } = Steps;

const CreateRfqModal = ({ isOpen, onClose, indent, onSuccess }) => {
    const [form] = Form.useForm();
    const [step, setStep] = useState(0);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedVendors, setSelectedVendors] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        if (step === 1) {
            fetchVendors();
        }
    }, [step]);

    const fetchVendors = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${baseURL}/vendors`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVendors(response.data.vendors || []);
        } catch (error) {
            console.error('Error fetching vendors:', error);
            message.error('Failed to fetch vendors');
        } finally {
            setIsLoading(false);
        }
    };

    const handleItemSelection = (itemId) => {
        const item = indent.items.existing.find(i => i._id === itemId) ||
            indent.items.new.find(i => i._id === itemId);

        if (item && (item.status === 'rfq' || item.status === 'po')) {
            message.warning(`This item already has a ${item.status.toUpperCase()} created`);
            return;
        }

        setSelectedItems(prev => {
            if (prev.includes(itemId)) {
                return prev.filter(id => id !== itemId);
            }
            return [...prev, itemId];
        });
    };

    const handleNext = () => {
        if (step === 0 && selectedItems.length === 0) {
            message.error('Please select at least one item before proceeding');
            return;
        }
        if (step === 1 && selectedVendors.length === 0) {
            message.error('Please select at least one vendor before proceeding');
            return;
        }
        setValidationError('');
        setStep(step + 1);
    };


    const handleCreateRfq = async () => {
        try {
            const values = await form.validateFields();
            setIsLoading(true);

            // Format selected items
            const formattedItems = selectedItems.map(itemId => {
                const existingItem = indent.items.existing.find(item => item._id === itemId);
                const newItem = indent.items.new.find(item => item._id === itemId);

                if (existingItem) {
                    return {
                        indentItemType: "existing",
                        indentItemId: itemId,
                        name: existingItem.name,
                        quantity: existingItem.quantity || 0,
                        itemCode: existingItem.itemCode,
                        requiredDeliveryDate: existingItem.requiredDeliveryDate || new Date()
                    };
                } else if (newItem) {
                    return {
                        indentItemType: "new",
                        indentItemId: itemId,
                        name: newItem.name,
                        quantity: newItem.quantity || 0,
                        requiredDeliveryDate: newItem.requiredDeliveryDate || new Date()
                    };
                }
                return null;
            }).filter(item => item !== null);

            // Format selected vendors
            const formattedVendors = selectedVendors.map(vendorId => ({
                vendor: vendorId,
                status: 'invited'
            }));

            const rfqData = {
                indent: indent._id,
                unit: indent.unit._id,
                project: indent.project._id,
                items: formattedItems,
                selectedVendors: formattedVendors,
                publishDate: values.publishDate.toDate(),
                submissionDeadline: values.submissionDeadline.toDate(),
                generalTerms: values.generalTerms || ''
            };

            const token = localStorage.getItem('token');
            const response = await axios.post(`${baseURL}/rfq/createRFQ`, rfqData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                await axios.post(
                    `${baseURL}/rfq/notify-vendors`,
                    {
                        rfqId: response.data.data.rfqId,
                        vendorIds: selectedVendors,
                        submissionDeadline: values.submissionDeadline.toDate(),
                        generalTerms: values.generalTerms || ''
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                message.success('RFQ created and vendors notified successfully');
                onSuccess();
                onClose();
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Error creating RFQ:', error);
            message.error(error.response?.data?.message || error.message || 'Failed to create RFQ');
        } finally {
            setIsLoading(false);
        }
    };

    const renderItemCard = ({ item, isExisting = true }) => (
        <Card
            key={item._id}
            size="small"
            className="mb-3"
            hoverable
            onClick={() => handleItemSelection(item._id)}
        >
            <div className={`p-4 ${selectedItems.includes(item._id) ? 'border-2 border-blue-500' : ''}`}>
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-500">
                            Quantity: {item.quantity} | Type: {isExisting ? 'Existing' : 'New'}
                        </p>
                    </div>
                    {item.status && (
                        <Tag color={
                            item.status === 'rfq' ? 'blue' :
                                item.status === 'po' ? 'green' : 'default'
                        }>
                            {item.status.toUpperCase()}
                        </Tag>
                    )}
                </div>
            </div>
        </Card>
    );

    useEffect(() => {
        if (step === 1) {
            form.setFieldsValue({
                vendors: selectedVendors
            });
        }
    }, [step, selectedVendors, form]);

    const handlePrevious = () => {
        // Preserve form values before going back
        if (step === 2) {
            const values = form.getFieldsValue();
            form.setFieldsValue({
                ...values,
                vendors: selectedVendors
            });
        }
        setStep(step - 1);
    };

    const steps = [
        {
            title: 'Select Items',
            content: (
                <div>
                    {indent?.items?.existing?.length > 0 && (
                        <div className="mb-4">
                            <h4 className="mb-2">Existing Items</h4>
                            {indent.items.existing.map(item => renderItemCard({ item, isExisting: true }))}
                        </div>
                    )}
                    {indent?.items?.new?.length > 0 && (
                        <div>
                            <h4 className="mb-2">New Items</h4>
                            {indent.items.new.map(item => renderItemCard({ item, isExisting: false }))}
                        </div>
                    )}
                </div>
            )
        },
        {
            title: 'Select Vendors',
            content: (
                <div>
                    <Form.Item
                        label="Select Vendors"
                        name="vendors"
                        rules={[{ required: true, message: 'Please select at least one vendor' }]}
                        validateStatus={step === 1 && selectedVendors.length === 0 ? 'error' : ''}
                        help={step === 1 && selectedVendors.length === 0 ? 'At least one vendor must be selected' : ''}
                    >
                        <Select
                            mode="multiple"
                            loading={isLoading}
                            value={selectedVendors}
                            onChange={(values) => {
                                setSelectedVendors(values);
                                form.setFieldsValue({ vendors: values });
                            }}
                            options={vendors.map(v => ({ label: v.name, value: v._id }))}
                            className={step === 1 && selectedVendors.length === 0 ? 'border-red-500' : ''}
                        />
                    </Form.Item>

                    {/* Selected Vendors List */}
                    {selectedVendors.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Selected Vendors ({selectedVendors.length})</h4>
                            <div className="space-y-2">
                                {selectedVendors.map(vendorId => {
                                    const vendor = vendors.find(v => v._id === vendorId);
                                    return vendor && (
                                        <Card key={vendor._id} size="small" className="bg-gray-50">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="font-medium">{vendor.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {vendor.email || 'No email provided'}
                                                    </div>
                                                </div>
                                                <Button
                                                    type="link"
                                                    danger
                                                    onClick={() => {
                                                        const newVendors = selectedVendors.filter(id => id !== vendor._id);
                                                        setSelectedVendors(newVendors);
                                                        form.setFieldsValue({ vendors: newVendors });
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )
        },
        {
            title: 'RFQ Details',
            content: (
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Submission Deadline"
                        name="submissionDeadline"
                        rules={[{ required: true, message: 'Please select submission deadline' }]}
                    >
                        <DatePicker className="w-full" />
                    </Form.Item>
                    <Form.Item
                        label="Publish Date"
                        name="publishDate"
                        rules={[{ required: true, message: 'Please select publish date' }]}
                    >
                        <DatePicker className="w-full" />
                    </Form.Item>
                    <Form.Item
                        label="General Terms"
                        name="generalTerms"
                    >
                        <TextArea rows={4} />
                    </Form.Item>
                </Form>
            )
        }
    ];

    return (
        <Modal
            title="Create RFQ"
            open={isOpen}
            onCancel={onClose}
            width={800}
            footer={null}
        >
            <Steps current={step} items={steps} className="mb-8" />
            <div className="mb-6">
                {steps[step].content}
            </div>
            <div className="flex justify-end space-x-2">
                {step > 0 && (
                    <Button onClick={handlePrevious}>
                        Previous
                    </Button>
                )}
                {step < steps.length - 1 && (
                    <Button
                        type="primary"
                        onClick={handleNext}
                        disabled={
                            (step === 0 && selectedItems.length === 0) ||
                            (step === 1 && selectedVendors.length === 0)
                        }
                    >
                        Next
                    </Button>
                )}
                {step === steps.length - 1 && (
                    <Button
                        type="primary"
                        onClick={handleCreateRfq}
                        loading={isLoading}
                    >
                        Create RFQ
                    </Button>
                )}
            </div>
        </Modal>
    );
};

export default CreateRfqModal;