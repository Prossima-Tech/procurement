import React from 'react';
import Button from '../common/Button';

const QuickActions = () => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Create Purchase Order</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <Button onClick={() => console.log('Create PO')}>Create PO</Button>
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Add New Vendor</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <Button onClick={() => console.log('Add Vendor')}>Add Vendor</Button>
            </dd>
          </div>
          {/* Add more quick actions as needed */}
        </dl>
      </div>
    </div>
  );
};

export default QuickActions;