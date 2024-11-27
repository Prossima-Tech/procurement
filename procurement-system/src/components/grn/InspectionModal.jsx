/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Modal, Form, Input, InputNumber, Table, Button, message } from 'antd';
import axios from 'axios';
import { baseURL } from '../../utils/endpoint';

const InspectionModal = ({ isOpen, onClose, grn, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState(grn.items.map(item => ({
        ...item,
        parameters: [],
        acceptedQuantity: 0,
        rejectedQuantity: 0,
        remarks: ''
    })));

    const handleAddParameter = (itemIndex) => {
        const newItems = [...items];
        newItems[itemIndex].parameters.push({
            parameterName: '',
            specification: '',
            observation: '',
            result: 'pass'
        });
        setItems(newItems);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();

            // Validate quantities
            const invalidItems = items.filter(item =>
                (item.acceptedQuantity + item.rejectedQuantity) > item.receivedQuantity
            );

            if (invalidItems.length > 0) {
                message.error('Sum of accepted and rejected quantities cannot exceed received quantity');
                return;
            }

            const inspectionData = {
                items: items.map(item => ({
                    grnItem: item._id,
                    parameters: item.parameters,
                    acceptedQuantity: item.acceptedQuantity,
                    rejectedQuantity: item.rejectedQuantity,
                    remarks: item.remarks
                })),
                remarks: values.remarks
            };

            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${baseURL}/grn/${grn._id}/inspection`,
                inspectionData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                message.success('Inspection completed successfully');
                onSuccess();
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Error updating inspection:', error);
            message.error('Failed to complete inspection');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Part Code',
            dataIndex: ['partCode', 'PartCodeNumber'],
            key: 'partCode',
        },
        {
            title: 'Received Qty',
            dataIndex: 'receivedQuantity',
            key: 'receivedQuantity',
        },
        {
            title: 'Inspection Parameters',
            key: 'parameters',
            render: (_, record, index) => (
                <div className="space-y-2">
                    {record.parameters.map((param, paramIndex) => (
                        <div key={paramIndex} className="flex gap-2">
                            <Input
                                placeholder="Parameter"
                                value={param.parameterName}
                                onChange={(e) => {
                                    const newItems = [...items];
                                    newItems[index].parameters[paramIndex].parameterName = e.target.value;
                                    setItems(newItems);
                                }}
                                style={{ width: 120 }}
                            />
                            <Input
                                placeholder="Specification"
                                value={param.specification}
                                onChange={(e) => {
                                    const newItems = [...items];
                                    newItems[index].parameters[paramIndex].specification = e.target.value;
                                    setItems(newItems);
                                }}
                                style={{ width: 120 }}
                            />
                            <Input
                                placeholder="Observation"
                                value={param.observation}
                                onChange={(e) => {
                                    const newItems = [...items];
                                    newItems[index].parameters[paramIndex].observation = e.target.value;
                                    setItems(newItems);
                                }}
                                style={{ width: 120 }}
                            />
                            <select
                                value={param.result}
                                onChange={(e) => {
                                    const newItems = [...items];
                                    newItems[index].parameters[paramIndex].result = e.target.value;
                                    setItems(newItems);
                                }}
                                className="border rounded px-2 py-1"
                            >
                                <option value="pass">Pass</option>
                                <option value="fail">Fail</option>
                                <option value="conditional">Conditional</option>
                            </select>
                            <Button
                                type="link"
                                danger
                                onClick={() => {
                                    const newItems = [...items];
                                    newItems[index].parameters.splice(paramIndex, 1);
                                    setItems(newItems);
                                }}
                            >
                                Remove
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="dashed"
                        onClick={() => handleAddParameter(index)}
                        block
                    >
                        + Add Parameter
                    </Button>
                </div>
            )
        },
        {
            title: 'Accepted Qty',
            key: 'acceptedQuantity',
            render: (_, record, index) => (
                <InputNumber
                    min={0}
                    max={record.receivedQuantity}
                    value={record.acceptedQuantity}
                    onChange={(value) => {
                        const newItems = [...items];
                        newItems[index].acceptedQuantity = value;
                        setItems(newItems);
                    }}
                />
            )
        },
        {
            title: 'Rejected Qty',
            key: 'rejectedQuantity',
            render: (_, record, index) => (
                <InputNumber
                    min={0}
                    max={record.receivedQuantity - record.acceptedQuantity}
                    value={record.rejectedQuantity}
                    onChange={(value) => {
                        const newItems = [...items];
                        newItems[index].rejectedQuantity = value;
                        setItems(newItems);
                    }}
                />
            )
        },
        {
            title: 'Remarks',
            key: 'remarks',
            render: (_, record, index) => (
                <Input.TextArea
                    value={record.remarks}
                    onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].remarks = e.target.value;
                        setItems(newItems);
                    }}
                    placeholder="Add inspection remarks"
                    rows={2}
                />
            )
        }
    ];

    return (
        <Modal
            title="Quality Inspection"
            open={isOpen}
            onCancel={onClose}
            onOk={handleSubmit}
            okText="Complete Inspection"
            confirmLoading={loading}
            width={1200}
        >
            <Form
                form={form}
                layout="vertical"
                className="mt-4"
            >
                <div className="mb-4">
                    <h3 className="font-medium mb-2">GRN Details</h3>
                    <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded">
                        <div>
                            <label className="text-sm font-medium">GRN Number:</label>
                            <p>{grn.grnNumber}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Vendor:</label>
                            <p>{grn.vendor?.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Challan Number:</label>
                            <p>{grn.challanNumber}</p>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className="font-medium mb-2">Inspection Items</h3>
                    <Table
                        columns={columns}
                        dataSource={items}
                        rowKey="_id"
                        pagination={false}
                    />
                </div>

                <Form.Item
                    label="Overall Inspection Remarks"
                    name="remarks"
                    rules={[{ required: true, message: 'Please add inspection remarks' }]}
                >
                    <Input.TextArea rows={4} placeholder="Add overall inspection remarks" />
                </Form.Item>
            </Form>

            <div className="mt-4 bg-yellow-50 p-4 rounded">
                <h4 className="text-sm font-medium text-yellow-800">Important Notes:</h4>
                <ul className="list-disc list-inside text-sm text-yellow-800 mt-2">
                    <li>Ensure all parameters are properly checked</li>
                    <li>Sum of accepted and rejected quantities should not exceed received quantity</li>
                    <li>Add clear remarks for any rejections</li>
                </ul>
            </div>
        </Modal>
    );
};

export default InspectionModal;