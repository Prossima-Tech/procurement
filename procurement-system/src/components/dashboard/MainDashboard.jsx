/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Space, Progress, Typography } from 'antd';
import { ShoppingCartOutlined, FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, DollarOutlined } from '@ant-design/icons';
import IndentList from './indentList';
import { baseURL } from '../../utils/endpoint';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';

const { Title } = Typography;

function MainDashboard() {
    const [stats, setStats] = useState({
        totalIndents: 0,
        pendingIndents: 0,
        totalPOs: 0,
        pendingPOs: 0,
        totalGRN: 0,
        pendingGRN: 0,
        totalSpent: 0,
        recentIndents: [],
        vendorPerformance: [],
    });

    const [loading, setLoading] = useState(true);

    const { isDarkMode } = useTheme();

    useEffect(() => {
        console.log('useEffect is running');
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch total indents and pending indents
                const indentsResponse = await axios.get(`${baseURL}/indents`);
                console.log('Indents Response:', indentsResponse.data); // Log the response to check its structure

                // Ensure data is an array
                const indents = Array.isArray(indentsResponse.data) ? indentsResponse.data : indentsResponse.data.data || [];
                const totalIndents = indents.length;
                console.log(totalIndents)
                // Example filter usage
                const pendingIndents = indents.filter(indent => indent.status === 'submitted');

                // Fetch total purchase orders and pending purchase orders
                const poResponse = await axios.get(`${baseURL}/purchase-orders/getAllPOs`);
                console.log('PO Response:', poResponse.data); // Log the response to check its structure
                const pos = poResponse.data.purchaseOrders || []; // Adjust based on actual response structure
                const totalPOs = pos.length;
                console.log(totalPOs)
                const pendingPOs = pos.filter(po => po.status === 'Pending').length;

                const totalProcurement = pos.reduce((sum, po) => {
                    return sum + po.items.reduce((itemSum, item) => itemSum + item.totalPrice, 0);
                }, 0);
                console.log(totalProcurement);

                // Fetch total GRNs and pending GRNs
                const grnResponse = await axios.get(`${baseURL}/grn`);
                console.log('GRN Response:', grnResponse.data); // Log the response to check its structure
                const grns = grnResponse.data.grns || []; // Adjust based on actual response structure
                const totalGRN = grns.length;
                console.log(totalGRN)
                const pendingGRN = grns.filter(grn => grn.status === 'Pending').length;

                // Fetch total spent (assuming you have an endpoint for this)
                // const spentResponse = await axios.get(`${baseURL}/spent`);
                // console.log('Spent Response:', spentResponse.data); // Log the response to check its structure
                // const totalSpent = spentResponse.data.totalSpent;
                const totalSpent = 0;


                // Fetch recent indents
                const recentIndents = indents.slice(0, 3); // Assuming the data is sorted by date

                // Fetch vendor performance (assuming you have an endpoint for this)
                // const vendorPerformanceResponse = await axios.get(`${baseURL}/vendors/performance`);
                // console.log('Vendor Performance Response:', vendorPerformanceResponse.data); // Log the response to check its structure
                // const vendorPerformance = vendorPerformanceResponse.data;

                const vendorPerformance = [];

                // Fetch inspections and filter pending ones
                const inspectionsResponse = await axios.get(`${baseURL}/inspection`);
                const inspections = inspectionsResponse.data.data.inspections || [];
                const pendingInspections = inspections.filter(inspection => inspection.status === 'pending');

                setStats({
                    totalIndents,
                    pendingIndents: pendingIndents.length,
                    totalPOs,
                    pendingPOs,
                    totalGRN,
                    pendingGRN,
                    totalSpent: totalProcurement,
                    recentIndents,
                    vendorPerformance,
                    pendingInspections: pendingInspections.length,
                });
                console.log('Updated Stats:', {
                    totalIndents,
                    pendingIndents: pendingIndents.length,
                    totalPOs,
                    pendingPOs,
                    totalGRN,
                    pendingGRN,
                    totalSpent: totalProcurement,
                    recentIndents,
                    vendorPerformance,
                    pendingInspections: pendingInspections.length,
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const vendorColumns = [
        {
            title: 'Vendor',
            dataIndex: 'vendor',
            key: 'vendor',
        },
        {
            title: 'Rating',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating) => <Progress percent={rating * 20} size="small" />
        },
        {
            title: 'On-Time Delivery',
            dataIndex: 'onTimeDelivery',
            key: 'onTimeDelivery',
            render: (value) => <Progress percent={value} size="small" status="active" />
        },
        {
            title: 'Quality Score',
            dataIndex: 'qualityScore',
            key: 'qualityScore',
            render: (value) => <Progress percent={value} size="small" status="active" />
        },
    ];

    const StatisticCard = ({ icon, title, value, subtext }) => (
        <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 ${icon.bgColor} rounded-lg`}>
                    {icon.component}
                </div>
                <span className="text-2xl font-bold">{value}</span>
            </div>
            <h3 className="text-lg font-semibold mb-1">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{subtext}</p>
        </div>
    );

    const statistics = [
        {
            icon: {
                component: <FileTextOutlined className="w-6 h-6 text-blue-600 dark:text-blue-300" />,
                bgColor: "bg-blue-100 dark:bg-blue-900"
            },
            title: "Total Indents",
            value: stats.totalIndents,
            subtext: `${stats.pendingIndents} pending approvals`
        },
        {
            icon: {
                component: <ShoppingCartOutlined className="w-6 h-6 text-green-600 dark:text-green-300" />,
                bgColor: "bg-green-100 dark:bg-green-900"
            },
            title: "Purchase Orders",
            value: stats.totalPOs,
            subtext: `${stats.pendingPOs} in process`
        },
        {
            icon: {
                component: <CheckCircleOutlined className="w-6 h-6 text-purple-600 dark:text-purple-300" />,
                bgColor: "bg-purple-100 dark:bg-purple-900"
            },
            title: "GRN Status",
            value: stats.totalGRN,
            subtext: `${stats.pendingGRN} pending`
        },
        {
            icon: {
                component: <ClockCircleOutlined className="w-6 h-6 text-red-600 dark:text-red-300" />,
                bgColor: "bg-red-100 dark:bg-red-900"
            },
            title: "Pending Inspections",
            value: stats.pendingInspections,
            subtext: ""
        }
    ];

    return (
        <div className="space-y-6">
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statistics.map((stat, index) => (
                    <StatisticCard key={index} {...stat} />
                ))}
            </div>

            {/* Vendor Performance */}
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-600`}>
                <h2 className="text-xl font-semibold mb-4">Top Vendor Performance</h2>
                <Table
                    columns={vendorColumns}
                    dataSource={stats.vendorPerformance}
                    pagination={false}
                    loading={loading}
                    className={isDarkMode ? 'ant-table-dark' : ''}
                />
            </div>

            {/* Recent Indents */}
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-600`}>
                <h2 className="text-xl font-semibold mb-4">Recent Indents</h2>
                <IndentList />
            </div>
        </div>
    );
}

export default MainDashboard;

