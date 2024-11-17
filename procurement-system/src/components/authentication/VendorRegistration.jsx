import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import VendorForm from '../Vendors/VendorForm';
import { Spin, Modal } from 'antd';
import axios from 'axios';
import { baseURL } from '../../utils/endpoint';

const VendorRegistration = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();

    // Password modal states
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [tempFormData, setTempFormData] = useState(null);
    const [passwordData, setPasswordData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');

    const handleFormSubmit = (formData) => {
        setTempFormData(formData);
        setIsPasswordModalVisible(true);
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
        setPasswordError('');
    };

    const handlePasswordSubmit = async () => {
        if (passwordData.password !== passwordData.confirmPassword) {
            setPasswordError("Passwords don't match");
            return;
        }
        if (passwordData.password.length < 6) {
            setPasswordError("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);
        try {
            const completeData = {
                ...tempFormData,
                password: passwordData.password
            };
            console.log("completeData",completeData);
            await axios.post(`${baseURL}/auth/vendor-register`, completeData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to register vendor');
            console.error('Vendor registration error:', err);
        } finally {
            setLoading(false);
            setIsPasswordModalVisible(false);
            setPasswordData({ password: '', confirmPassword: '' });
        }
    };

    const inputClass = `w-full p-2 text-sm rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`;
    const labelClass = 'block text-xs font-medium mb-1';

    return (
        <div className={`min-h-screen py-12 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <div className={`max-w-4xl mx-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-8`}>
                <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Vendor Registration
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    <VendorForm
                        onSubmit={handleFormSubmit}
                        onCancel={() => navigate('/login')}
                        isLoading={loading}
                    />
                </div>

                {/* Password Modal */}
                <Modal
                    title="Set Account Password"
                    open={isPasswordModalVisible}
                    onOk={handlePasswordSubmit}
                    onCancel={() => {
                        setIsPasswordModalVisible(false);
                        setPasswordData({ password: '', confirmPassword: '' });
                        setPasswordError('');
                    }}
                    okText="Complete Registration"
                    cancelText="Cancel"
                    confirmLoading={loading}
                >
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>Password*</label>
                            <input
                                type="password"
                                name="password"
                                value={passwordData.password}
                                onChange={handlePasswordChange}
                                className={inputClass}
                                required
                                placeholder="Enter password"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Confirm Password*</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className={inputClass}
                                required
                                placeholder="Confirm password"
                            />
                        </div>
                        {passwordError && (
                            <div className="text-red-500 text-sm">
                                {passwordError}
                            </div>
                        )}
                        <div className="text-sm text-gray-500">
                            Password must be at least 6 characters long.
                        </div>
                    </div>
                </Modal>

                {loading && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <Spin size="large" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorRegistration; 