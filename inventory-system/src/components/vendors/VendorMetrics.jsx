import React from 'react';
import { UserGroupIcon, CurrencyDollarIcon, ClockIcon, TrendingUpIcon } from '@heroicons/react/outline';

const MetricCard = ({ title, value, icon: Icon, change }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex items-center">
      <div className="p-3 rounded-full bg-indigo-100 bg-opacity-75">
        <Icon className="h-8 w-8 text-indigo-600" />
      </div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd>
            <div className="text-lg font-medium text-gray-900">{value}</div>
          </dd>
        </dl>
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm font-medium">
      <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
        {change >= 0 ? '+' : ''}{change}%
      </span>
      <span className="text-gray-500 ml-2">from last month</span>
    </div>
  </div>
);

const VendorMetrics = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.id} {...metric} />
      ))}
    </div>
  );
};

export default VendorMetrics;