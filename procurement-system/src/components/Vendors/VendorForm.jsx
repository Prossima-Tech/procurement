import { Form, Input, Card, Row, Col, Button, Space } from 'antd';
import { useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const VendorForm = ({ onSubmit, onCancel, isLoading, initialData }) => {
    const [form] = Form.useForm();
    const { isDarkMode } = useTheme();

    useEffect(() => {
        if (initialData) {
            form.setFieldsValue({
                poPrefix: initialData.poPrefix || '',
                name: initialData.name || '',
                contactPerson: initialData.contactPerson || '',
                contactNumber: initialData.contactNumber || '',
                mobileNumber: initialData.mobileNumber || '',
                panNumber: initialData.panNumber || '',
                email: initialData.email || '',
                gstNumber: initialData.gstNumber || '',
                bankDetails: {
                    name: initialData.bankDetails?.name || '',
                    branchName: initialData.bankDetails?.branchName || '',
                    accountNumber: initialData.bankDetails?.accountNumber || '',
                    ifscCode: initialData.bankDetails?.ifscCode || '',
                },
                address: {
                    line1: initialData.address?.line1 || '',
                    line2: initialData.address?.line2 || '',
                    city: initialData.address?.city || '',
                    state: initialData.address?.state || '',
                    pinCode: initialData.address?.pinCode || '',
                },
                remark: initialData.remark || '',
            });
        }
    }, [initialData, form]);

    const handleFormSubmit = async (values) => {
        try {
            await form.validateFields();
            onSubmit(values);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleFormSubmit}
            initialValues={{
                bankDetails: {},
                address: {},
            }}
            className="px-4"
        >
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item label="PO Prefix" name="poPrefix">
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item 
                        label="Vendor Name" 
                        name="name"
                        rules={[{ required: true, message: 'Please enter vendor name' }]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item 
                        label="Contact Person" 
                        name="contactPerson"
                        rules={[{ required: true, message: 'Please enter contact person' }]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item label="Contact Number" name="contactNumber">
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item 
                        label="Mobile Number" 
                        name="mobileNumber"
                        rules={[{ required: true, message: 'Please enter mobile number' }]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item 
                        label="Email" 
                        name="email"
                        rules={[{ type: 'email', message: 'Please enter valid email' }]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label="PAN Number" name="panNumber">
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="GST Number" name="gstNumber">
                        <Input />
                    </Form.Item>
                </Col>
            </Row>

            <Card title="Bank Details" className="mb-4">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Bank Name" name={['bankDetails', 'name']}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Branch Name" name={['bankDetails', 'branchName']}>
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Account Number" name={['bankDetails', 'accountNumber']}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="IFSC Code" name={['bankDetails', 'ifscCode']}>
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
            </Card>

            <Card title="Address Details" className="mb-4">
                <Form.Item label="Address Line 1" name={['address', 'line1']}>
                    <Input />
                </Form.Item>
                <Form.Item label="Address Line 2" name={['address', 'line2']}>
                    <Input />
                </Form.Item>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item label="City" name={['address', 'city']}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="State" name={['address', 'state']}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Pin Code" name={['address', 'pinCode']}>
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
            </Card>

            <Form.Item label="Remark" name="remark">
                <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item className="mb-0">
                <Space className="float-right">
                    <Button onClick={onCancel} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="primary" htmlType="submit" loading={isLoading}>
                        {initialData ? 'Update' : 'Create'} Vendor
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
};

export default VendorForm;