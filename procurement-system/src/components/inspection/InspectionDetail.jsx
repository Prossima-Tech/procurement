import React, { useState } from 'react';
import {
    Form,
    Input,
    InputNumber,
    Select,
    Button,
    Table,
    Space,
    Card,
    Typography,
    Divider,
    message
} from 'antd';
import {
    PlusOutlined,
    SaveOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { baseURL } from '../../utils/endpoint';

const { Title, Text } = Typography;
const { TextArea } = Input;

const InspectionDetail = ({ inspection, onClose }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState(inspection.items.map(item => ({
        ...item,
        parameters: Array.isArray(item.parameters) ? item.parameters : []
    })));

    const validateQuantities = (item, field, value) => {
        if (value < 0) {
            return Promise.reject('Quantities cannot be negative');
        }

        switch (field) {
            case 'inspectedQuantity':
                if (value > item.receivedQuantity) {
                    return Promise.reject(`Cannot exceed received quantity (${item.receivedQuantity})`);
                }
                break;
            case 'acceptedQuantity':
            case 'rejectedQuantity':
                const otherField = field === 'acceptedQuantity' ? 'rejectedQuantity' : 'acceptedQuantity';
                const otherValue = item[otherField] || 0;
                if (value + otherValue > item.inspectedQuantity) {
                    return Promise.reject(`Total cannot exceed inspected quantity (${item.inspectedQuantity})`);
                }
                break;
        }
        return Promise.resolve();
    };

    const handleSave = async (status = 'in_progress') => {
        try {
            setLoading(true);
            const values = await form.validateFields();

            // Calculate overall result
            const overallResult = items.some(item => item.result === 'fail') ? 'fail' :
                items.some(item => item.result === 'conditional') ? 'conditional' :
                    items.every(item => item.result === 'pass') ? 'pass' : 'pending';

            const submitData = {
                ...values,
                items,
                status,
                overallResult,
                completionDate: status === 'completed' ? new Date().toISOString() : null
            };

            const response = await axios.put(
                `${baseURL}/inspection/${inspection._id}`,
                submitData
            );

            if (response.data.success) {
                message.success(`Inspection ${status === 'completed' ? 'completed' : 'saved'} successfully`);
                onClose();
            }
        } catch (error) {
            message.error('Failed to save inspection');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Parameter',
            dataIndex: 'parameterName',
            key: 'parameterName',
            render: (text, record, index) => (
                <Input
                    value={text}
                    onChange={(e) => {
                        const newItems = [...items];
                        newItems[record.itemIndex].parameters[index].parameterName = e.target.value;
                        setItems(newItems);
                    }}
                />
            ),
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
            render: (text, record, index) => (
                <Input
                    value={text}
                    onChange={(e) => {
                        const newItems = [...items];
                        newItems[record.itemIndex].parameters[index].value = e.target.value;
                        setItems(newItems);
                    }}
                />
            ),
        },
        {
            title: 'Result',
            dataIndex: 'result',
            key: 'result',
            render: (text, record, index) => (
                <Select
                    value={text || 'pass'}
                    onChange={(value) => {
                        const newItems = [...items];
                        newItems[record.itemIndex].parameters[index].result = value;
                        setItems(newItems);
                    }}
                >
                    <Select.Option value="pass">Pass</Select.Option>
                    <Select.Option value="fail">Fail</Select.Option>
                    <Select.Option value="conditional">Conditional</Select.Option>
                </Select>
            ),
        },
        {
            title: 'Remarks',
            dataIndex: 'remarks',
            key: 'remarks',
            render: (text, record, index) => (
                <Input
                    value={text}
                    onChange={(e) => {
                        const newItems = [...items];
                        newItems[record.itemIndex].parameters[index].remarks = e.target.value;
                        setItems(newItems);
                    }}
                />
            ),
        },
    ];

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{
                remarks: inspection.remarks
            }}
        >
            {items.map((item, itemIndex) => (
                <Card key={item._id} style={{ marginBottom: 16 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Title level={4}>
                            {item.itemDetails?.itemName} ({item.partCode})
                        </Title>
                        {/* Quantities Section */}
                        <Space size="large">
                            <Form.Item label="Received Quantity">
                                <InputNumber
                                    value={item.receivedQuantity}
                                    disabled
                                    style={{ width: 120 }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Inspected Quantity"
                                rules={[
                                    {
                                        validator: (_, value) => validateQuantities(item, 'inspectedQuantity', value)
                                    }
                                ]}
                            >
                                <InputNumber
                                    value={item.inspectedQuantity}
                                    onChange={(value) => {
                                        const newItems = [...items];
                                        newItems[itemIndex].inspectedQuantity = value;
                                        newItems[itemIndex].acceptedQuantity = 0;
                                        newItems[itemIndex].rejectedQuantity = 0;
                                        setItems(newItems);
                                    }}
                                    min={0}
                                    max={item.receivedQuantity}
                                    style={{ width: 120 }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Accepted Quantity"
                                rules={[
                                    {
                                        validator: (_, value) => validateQuantities(item, 'acceptedQuantity', value)
                                    }
                                ]}
                            >
                                <InputNumber
                                    value={item.acceptedQuantity}
                                    onChange={(value) => {
                                        const newItems = [...items];
                                        newItems[itemIndex].acceptedQuantity = value;
                                        newItems[itemIndex].rejectedQuantity = item.inspectedQuantity - value;
                                        setItems(newItems);
                                    }}
                                    min={0}
                                    max={item.inspectedQuantity}
                                    style={{ width: 120 }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Rejected Quantity"
                                rules={[
                                    {
                                        validator: (_, value) => validateQuantities(item, 'rejectedQuantity', value)
                                    }
                                ]}
                            >
                                <InputNumber
                                    value={item.rejectedQuantity}
                                    onChange={(value) => {
                                        const newItems = [...items];
                                        newItems[itemIndex].rejectedQuantity = value;
                                        newItems[itemIndex].acceptedQuantity = item.inspectedQuantity - value;
                                        setItems(newItems);
                                    }}
                                    min={0}
                                    max={item.inspectedQuantity}
                                    style={{ width: 120 }}
                                />
                            </Form.Item>

                            <Form.Item label="Result">
                                <Select
                                    value={item.result}
                                    onChange={(value) => {
                                        const newItems = [...items];
                                        newItems[itemIndex].result = value;
                                        setItems(newItems);
                                    }}
                                    style={{ width: 120 }}
                                >
                                    <Select.Option value="pending">Pending</Select.Option>
                                    <Select.Option value="pass">Pass</Select.Option>
                                    <Select.Option value="fail">Fail</Select.Option>
                                    <Select.Option value="conditional">Conditional</Select.Option>
                                </Select>
                            </Form.Item>
                        </Space>

                        {/* Parameters Section */}
                        <Divider orientation="left">Inspection Parameters</Divider>
                        <Button
                            type="dashed"
                            onClick={() => {
                                const newItems = [...items];
                                if (!Array.isArray(newItems[itemIndex].parameters)) {
                                    newItems[itemIndex].parameters = [];
                                }
                                newItems[itemIndex].parameters.push({
                                    parameterName: '',
                                    value: '',
                                    result: 'pass',
                                    remarks: ''
                                });
                                setItems(newItems);
                            }}
                            icon={<PlusOutlined />}
                            style={{ marginBottom: 16 }}
                        >
                            Add Parameter
                        </Button>

                        <Table
                            columns={columns}
                            dataSource={item.parameters.map((param, idx) => ({
                                ...param,
                                key: idx,
                                itemIndex
                            }))}
                            pagination={false}
                            size="small"
                        />

                        {/* Item Remarks */}
                        <Form.Item label="Item Remarks">
                            <TextArea
                                value={item.remarks}
                                onChange={(e) => {
                                    const newItems = [...items];
                                    newItems[itemIndex].remarks = e.target.value;
                                    setItems(newItems);
                                }}
                                rows={2}
                            />
                        </Form.Item>
                    </Space>
                </Card>
            ))}

            {/* Overall Remarks */}
            <Form.Item name="remarks" label="Overall Remarks">
                <TextArea rows={3} />
            </Form.Item>

            {/* Action Buttons */}
            <Form.Item>
                <Space>
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={() => handleSave('in_progress')}
                        loading={loading}
                    >
                        Save Progress
                    </Button>
                    <Button
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleSave('completed')}
                        loading={loading}
                    >
                        Complete Inspection
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
};

export default InspectionDetail;