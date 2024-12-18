/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { Modal, Form, Select, Card, Steps, Button, Space, Tag, message, Spin } from 'antd';
import { api } from '../../../utils/endpoint';
import { baseURL } from '../../../utils/endpoint';
import PurchaseOrderForm from '../purchaseOrder/PurchaseOrderForm';
import axios from 'axios';

const { Step } = Steps;

const CreateDirectPOModal = ({ isOpen, onClose, indent, onSuccess }) => {
    const [form] = Form.useForm();
    const [step, setStep] = useState(0);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedPartCodes, setSelectedPartCodes] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [itemPartCodes, setItemPartCodes] = useState({});
    const [itemDetails, setItemDetails] = useState({});
    const [initialPOData, setInitialPOData] = useState({});

    useEffect(() => {
        if (isOpen) {
            resetSelections();
            fetchPartCodesForItems();
        }
    }, [isOpen]);

    const resetSelections = () => {
        setSelectedItems([]);
        setSelectedPartCodes({});
        setItemDetails({});
        setStep(0);
    };

    const fetchPartCodesForItems = async () => {
        setIsLoading(true);
        try {
            const allItems = [
                ...(indent?.items?.existing || []).map(item => ({ ...item, type: 'existing' })),
                ...(indent?.items?.new || []).map(item => ({ ...item, type: 'new' }))
            ];

            const partCodesPromises = allItems
                .filter(item => item.reference)
                .map(item =>
                    api(`${baseURL}/parts/getPartByItemCode/${item.reference}`, 'get')
                );

            const responses = await Promise.all(partCodesPromises);

            const partCodesMap = {};
            const detailsMap = {};

            allItems.forEach((item, index) => {
                if (item.reference) {
                    const partsData = responses[index]?.data?.data || [];
                    partCodesMap[item._id] = partsData;
                    detailsMap[item._id] = {
                        ...item,
                        availablePartCodes: partsData
                    };
                }
            });

            setItemPartCodes(partCodesMap);
            setItemDetails(detailsMap);
        } catch (error) {
            console.error('Error fetching part codes:', error);
            message.error('Failed to fetch part codes');
        } finally {
            setIsLoading(false);
        }
    };

    const handleItemSelection = (itemId) => {
        setSelectedItems(prev => {
            if (prev.includes(itemId)) {
                const newSelected = prev.filter(id => id !== itemId);
                setSelectedPartCodes(prevCodes => {
                    const newCodes = { ...prevCodes };
                    delete newCodes[itemId];
                    return newCodes;
                });
                return newSelected;
            }
            return [...prev, itemId];
        });
    };

    const handlePartCodeSelection = (itemId, partCode) => {
        setSelectedPartCodes(prev => ({
            ...prev,
            [itemId]: partCode
        }));
    };

    const handleNext = () => {
        if (step === 0) {
            // Validate item and part code selection
            const missingPartCodes = selectedItems.filter(itemId => !selectedPartCodes[itemId]);
            if (missingPartCodes.length > 0) {
                message.error('Please select part codes for all selected items');
                return;
            }
        }
        setStep(prev => prev + 1);
    };

    const ItemCard = ({ item, isExisting = true }) => {
        const isSelected = selectedItems.includes(item._id);
        const hasPartCodes = itemPartCodes[item._id]?.length > 0;

        return (
            <Card
                size="small"
                className={`mb-3 ${isSelected ? 'border-blue-500' : ''}`}
                hoverable
            >
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{item.name}</h4>
                            <Space>
                                {item.status && (
                                    <Tag color={
                                        item.status === 'rfq' ? 'blue' :
                                            item.status === 'po' ? 'green' : 'default'
                                    }>
                                        {item.status.toUpperCase()}
                                    </Tag>
                                )}
                                <Button
                                    type={isSelected ? 'primary' : 'default'}
                                    onClick={() => handleItemSelection(item._id)}
                                    disabled={item.status === 'po'}
                                >
                                    {isSelected ? 'Selected' : 'Select'}
                                </Button>
                            </Space>
                        </div>
                        <p className="text-sm text-gray-500">
                            Quantity: {item.quantity} | Type: {isExisting ? 'Existing' : 'New'}
                        </p>

                        {isSelected && hasPartCodes && (
                            <Form.Item
                                label="Select Part Code"
                                className="mt-2"
                                required
                            >
                                <Select
                                    value={selectedPartCodes[item._id]}
                                    onChange={(value) => handlePartCodeSelection(item._id, value)}
                                    style={{ width: '100%' }}
                                >
                                    {itemPartCodes[item._id].map(part => (
                                        <Select.Option key={part._id} value={part._id}>
                                            {part.PartCodeNumber}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        )}
                    </div>
                </div>
            </Card>
        );
    };

    const steps = [
        {
            title: 'Select Items',
            content: (
                <div>
                    {indent?.items?.existing?.length > 0 && (
                        <div className="mb-4">
                            <h4 className="font-medium mb-2">Existing Items</h4>
                            {indent.items.existing.map(item => (
                                <ItemCard key={item._id} item={item} isExisting={true} />
                            ))}
                        </div>
                    )}
                    {indent?.items?.new?.length > 0 && (
                        <div>
                            <h4 className="font-medium mb-2">New Items</h4>
                            {indent.items.new.map(item => (
                                <ItemCard key={item._id} item={item} isExisting={false} />
                            ))}
                        </div>
                    )}
                </div>
            )
        },
        {
            title: 'Purchase Order Details',
            content: (
                <PurchaseOrderForm
                    form={form}
                    selectedItems={selectedItems.map(itemId => ({
                        item: itemDetails[itemId],
                        partCode: selectedPartCodes[itemId]
                    }))}
                    indent={indent}
                    onSubmit={onSuccess}
                />
            )
        }
    ];

    return (
        <Modal
            title="Create Direct Purchase Order"
            open={isOpen}
            onCancel={onClose}
            width={1000}
            footer={null}
        >
            <div className="space-y-6">
                <Steps current={step} items={steps} />

                {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <Spin size="large" />
                    </div>
                ) : (
                    <div className="mt-6">
                        {steps[step].content}
                    </div>
                )}

                <div className="flex justify-end space-x-2">
                    {step > 0 && (
                        <Button onClick={() => setStep(step - 1)}>
                            Previous
                        </Button>
                    )}
                    {step < steps.length - 1 && (
                        <Button type="primary" onClick={handleNext}>
                            Next
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default CreateDirectPOModal; 