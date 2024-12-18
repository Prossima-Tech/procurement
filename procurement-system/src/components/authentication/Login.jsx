import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { Form, Input, Button, Card, Typography, Spin, Layout, Avatar } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Content } = Layout;

const LoginPage = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();

    const onFinish = async (values) => {
        setError('');
        setLoading(true);
        try {
            await login(values.email, values.password);
            navigate('/');
        } catch (err) {
            setError('Failed to log in');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Content className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <div className="flex items-center justify-center min-h-screen px-4">
                    <Card
                        className={`w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                        bordered={false}
                    >
                        <div className="text-center mb-8">
                            <Avatar size={64} icon={<UserOutlined />} className="mb-4" />
                            <Title level={2} className={isDarkMode ? 'text-white' : ''}>
                                Sign in to your account
                            </Title>
                        </div>

                        <Form
                            name="login"
                            onFinish={onFinish}
                            layout="vertical"
                            size="large"
                        >
                            <Form.Item
                                name="email"
                                rules={[
                                    { required: true, message: 'Please input your email!' },
                                    { type: 'email', message: 'Please enter a valid email!' }
                                ]}
                            >
                                <Input 
                                    prefix={<UserOutlined />}
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
                                    {loading ? 'Signing in...' : 'Sign in'}
                                </Button>
                            </Form.Item>
                        </Form>

                        <div className={`text-center space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <div>
                                Don't have an account?{' '}
                                <Link to="/register" className="text-blue-500 hover:text-blue-600">
                                    Register here
                                </Link>
                            </div>
                            <div>
                                Are you a vendor?{' '}
                                <Link to="/vendor-registration" className="text-blue-500 hover:text-blue-600">
                                    Register as Vendor
                                </Link>
                            </div>
                        </div>
                    </Card>
                </div>
            </Content>
        </Layout>
    );
};

export default LoginPage;