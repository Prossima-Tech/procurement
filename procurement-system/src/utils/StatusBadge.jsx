import React from 'react';
import { 
    Clock, 
    CheckCircle, 
    AlertCircle, 
    Package, 
    Receipt,
    Ban,
    Loader,
    ShoppingCart,
    Truck,
    FileCheck,
    XCircle,
    FileText,
    ClipboardList,
} from 'lucide-react';

const StatusBadge = ({ status }) => {
    const statusConfig = {
        // Purchase Order Statuses
           // Purchase Order Main Statuses
           draft: { 
            color: 'gray', 
            icon: FileText, 
            label: 'Draft',
            description: 'PO is in draft state'
        },
        created: { 
            color: 'yellow', 
            icon: ShoppingCart, 
            label: 'Created',
            description: 'New PO created and pending action'
        },
        in_progress: { 
            color: 'blue', 
            icon: Clock, 
            label: 'In Progress',
            description: 'PO is being processed'
        },
        grn_created: { 
            color: 'green', 
            icon: ClipboardList, 
            label: 'GRN Created',
            description: 'Goods Receipt Note created'
        },

        // RFQ Statuses
        published: { color: 'blue', icon: Clock, label: 'Published' },
        evaluation: { color: 'yellow', icon: Loader, label: 'Evaluation' },
        evaluated: { color: 'purple', icon: CheckCircle, label: 'Evaluated' },
        awarded: { color: 'green', icon: CheckCircle, label: 'Awarded' },
        cancelled: { color: 'red', icon: Ban, label: 'Cancelled' },

        // GRN Statuses
        pending: { color: 'yellow', icon: Clock, label: 'Pending' },
        approved: { color: 'green', icon: CheckCircle, label: 'Approved' },
        completed: { color: 'blue', icon: Package, label: 'Completed' },
        rejected: { color: 'red', icon: AlertCircle, label: 'Rejected' },
        invoice_created: { color: 'purple', icon: Receipt, label: 'Invoice Created' },
        inspection_in_progress: { color: 'orange', icon: Clock, label: 'Inspection In Progress' },

        // Default status
        default: { color: 'gray', icon: Clock }
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.default;
    const Icon = config.icon;

    return (
        <div className="relative group">
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
                bg-${config.color}-100 text-${config.color}-800 border border-${config.color}-200
                transition-all duration-200 hover:bg-${config.color}-200`}>
                <Icon className="h-4 w-4" />
                {config.label}
            </span>
            
            {/* Tooltip */}
            {config.description && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1
                    bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100
                    transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    {config.description}
                    {/* Triangle */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4
                        border-transparent border-t-gray-800"></div>
                </div>
            )}
        </div>
    );
};

export default StatusBadge;

