import React from 'react';
import MetricCard from '../components/dashboard/MetricCard';
import { UserGroupIcon, CubeIcon, CurrencyDollarIcon, DocumentTextIcon } from '@heroicons/react/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const metrics = [
  { id: 1, title: 'Total Vendors', value: '120', icon: UserGroupIcon, change: 12 },
  { id: 2, title: 'Total Items', value: '1,234', icon: CubeIcon, change: 8 },
  { id: 3, title: 'Total Spend', value: '$543,210', icon: CurrencyDollarIcon, change: -2 },
  { id: 4, title: 'Open POs', value: '23', icon: DocumentTextIcon, change: 4 },
];

const chartData = [
  { name: 'Jan', spend: 4000 },
  { name: 'Feb', spend: 3000 },
  { name: 'Mar', spend: 5000 },
  { name: 'Apr', spend: 4500 },
  { name: 'May', spend: 6000 },
  { name: 'Jun', spend: 5500 },
];

const Dashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.id}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            change={metric.change}
          />
        ))}
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Monthly Spend</h2>
        <div className="bg-white p-4 rounded-lg shadow">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="spend" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;