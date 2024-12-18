import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { Form, Input, Button, Card, Typography, Spin, Layout, Avatar, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;

const RegisterPage = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();

    const onFinish = async (values) => {
        setError('');

        if (values.password !== values.confirmPassword) {
            setError("Passwords don't match");
            toast.error("Passwords don't match");
            return;
        }

        setLoading(true);
        try {
            await register(values.username, values.email, values.password, values.role);
            navigate('/');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to register';
            setError(errorMessage);
            toast.error(errorMessage);
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Content className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <ToastContainer />
                <div className="flex items-center justify-center min-h-screen px-4">
                    <Card
                        className={`w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                        bordered={false}
                    >
                        <div className="text-center mb-8">
                            <Avatar size={64} icon={<UserOutlined />} className="mb-4" />
                            <Title level={2} className={isDarkMode ? 'text-white' : ''}>
                                Create your account
                            </Title>
                        </div>

                        <Form
                            name="register"
                            onFinish={onFinish}
                            layout="vertical"
                            size="large"
                            initialValues={{ role: 'employee' }}
                        >
                            <Form.Item
                                name="username"
                                rules={[{ required: true, message: 'Please input your username!' }]}
                            >
                                <Input
                                    prefix={<UserOutlined />}
                                    placeholder="Username"
                                    className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}
                                />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                rules={[
                                    { required: true, message: 'Please input your email!' },
                                    { type: 'email', message: 'Please enter a valid email!' }
                                ]}
                            >
                                <Input
                                    prefix={<MailOutlined />}
                                    placeholder="Email address"
                                    className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Please input your password!' }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Password"
                                    className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}
                                />
                            </Form.Item>

                            <Form.Item
                                name="confirmPassword"
                                rules={[{ required: true, message: 'Please confirm your password!' }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Confirm Password"
                                    className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}
                                />
                            </Form.Item>

                            <Form.Item
                                name="role"
                                rules={[{ required: true, message: 'Please select a role!' }]}
                            >
                                <Select
                                    className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}
                                >
                                    <Option value="employee">Employee</Option>
                                    <Option value="manager">Manager</Option>
                                    <Option value="admin">Admin</Option>
                                </Select>
                            </Form.Item>

                            {error && (
                                <div className="text-red-500 text-sm mb-4">{error}</div>
                            )}

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    block
                                    loading={loading}
                                >
                                    {loading ? 'Creating account...' : 'Register'}
                                </Button>
                            </Form.Item>
                        </Form>

                        <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-500 hover:text-blue-600">
                                Sign in
                            </Link>
                        </div>
                    </Card>
                </div>
            </Content>
        </Layout>
    );
};

export default RegisterPage;