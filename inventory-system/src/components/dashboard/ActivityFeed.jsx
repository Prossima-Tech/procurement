import React from 'react';

const ActivityFeed = () => {
  // Placeholder for activity feed
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Activity Feed</h3>
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {/* Add activity items here */}
          <li className="px-4 py-4">Sample activity item</li>
        </ul>
      </div>
    </div>
  );
};

export default ActivityFeed;