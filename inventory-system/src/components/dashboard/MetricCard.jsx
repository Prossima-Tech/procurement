import React from 'react';
import { ArrowSmUpIcon, ArrowSmDownIcon } from '@heroicons/react/solid';

const MetricCard = ({ title, value, icon: Icon, change }) => {
  const isPositive = change >= 0;

  return (
    <div className="bg-white overflow-hidden shadow-lg rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-shrink-0">
            <Icon className="h-12 w-12 text-indigo-500" aria-hidden="true" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate mb-1">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isPositive ? (
                    <ArrowSmUpIcon className="self-center flex-shrink-0 h-5 w-5 text-green-500" aria-hidden="true" />
                  ) : (
                    <ArrowSmDownIcon className="self-center flex-shrink-0 h-5 w-5 text-red-500" aria-hidden="true" />
                  )}
                  <span className="sr-only">{isPositive ? 'Increased' : 'Decreased'} by</span>
                  {Math.abs(change)}%
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-6 py-3">
        <div className="text-sm">
          <span className="font-medium text-indigo-600 hover:text-indigo-500">
            View all<span className="sr-only"> {title} stats</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;