    import React, { useState, useEffect } from 'react';
import { Modal, Table, Tabs, message } from 'antd';
import axios from 'axios';
import { baseURL } from '../../../utils/endpoint';

const { TabPane } = Tabs;

const ViewRfqModal = ({ isOpen, onClose, rfq }) => {
    const [loading, setLoading] = useState(false);
    const [vendorQuotes, setVendorQuotes] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [vendors, setVendors] = useState([]);

    useEffect(() => {
        if (isOpen && rfq) {
            fetchVendorQuotes();
            fetchVendors();
        }
    }, [isOpen, rfq]);

    const fetchVendorQuotes = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            console.log("rfq._id", rfq);
            const response = await axios.get(`${baseURL}/rfq/quotes/${rfq._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // console.log("vendor quotes", response.data);
            // setVendorQuotes(response.data || []);
            if (response.data.success) {
                const formattedQuotes = response.data.quotes.map(quote => ({
                    _id: quote._id,
                    vendor: quote.vendor._id,
                    vendorName: quote.vendor.name,
                    items: quote.items.map(item => ({
                        _id: item._id,
                        name: item.name,
                        quotedPrice: item.unitPrice,
                        quantity: item.quantity,
                        deliveryTimeline: item.deliveryTime,
                        status: quote.status,
                        remarks: item.technicalRemarks
                    }))
                }));
                // setVendorQuotes(formattedQuotes);
                console.log("formatted quotes", formattedQuotes);
            } else {
                message.error('Failed to fetch vendor quotes');
            }
        } catch (error) {
            console.error('Error fetching vendor quotes:', error);
            message.error('Failed to fetch vendor quotes');
        } finally {
            setLoading(false);
        }
    };

    const fetchVendors = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${baseURL}/vendors`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVendors(response.data.vendors || []);
        } catch (error) {
            console.error('Error fetching vendors:', error);
        }
    };

    const getVendorName = (vendorId) => {
        const vendor = vendors.find(v => v._id === vendorId);
        return vendor ? vendor.name : 'Unknown Vendor';
    };

    const itemColumns = [
        {
            title: 'Item Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Required Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Item Type',
            dataIndex: 'indentItemType',
            key: 'indentItemType',
            render: (type) => type.charAt(0).toUpperCase() + type.slice(1)
        }
    ];

    const handleAcceptQuote = async (quote) => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setVendorQuotes(prevQuotes => 
                prevQuotes.map(q => {
                    if (q.item._id === quote.item._id) {
                        if (q._id === quote._id) {
                            return { ...q, status: 'approved' };
                        }
                        return { ...q, status: 'rejected' };
                    }
                    return q;
                })
            );
            
            message.success(`Quote approved for ${getVendorName(quote.vendor)}`);
        } catch (error) {
            message.error('Failed to approve quote');
        } finally {
            setLoading(false);
        }
    };

    const handleRejectQuote = async (quote) => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setVendorQuotes(prevQuotes => 
                prevQuotes.map(q => 
                    q._id === quote._id ? { ...q, status: 'rejected' } : q
                )
            );
            message.success(`Quote rejected for ${getVendorName(quote.vendor)}`);
        } catch (error) {
            message.error('Failed to reject quote');
        } finally {
            setLoading(false);
        }
    };

    const vendorQuoteColumns = [
        {
            title: 'Vendor',
            key: 'vendor',
            render: (record) => getVendorName(record.vendor),
            width: 150,
        },
        {
            title: 'Item',
            dataIndex: ['item', 'name'],
            key: 'itemName',
            width: 150,
        },
        {
            title: 'Price/Unit',
            dataIndex: 'quotedPrice',
            key: 'quotedPrice',
            width: 100,
            render: (price) => `₹${price.toLocaleString()}`
        },
        {
            title: 'Qty',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 60,
        },
        {
            title: 'Total',
            key: 'totalAmount',
            width: 100,
            render: (record) => `₹${(record.quotedPrice * record.quantity).toLocaleString()}`
        },
        {
            title: 'Delivery',
            dataIndex: 'deliveryTimeline',
            key: 'deliveryTimeline',
            width: 100,
            render: (date) => new Date(date).toLocaleDateString()
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 90,
            render: (status) => {
                let color = '';
                let text = '';

                switch (status) {
                    case 'approved':
                        color = 'bg-green-100 text-green-700';
                        text = 'Approved';
                        break;
                    case 'rejected':
                        color = 'bg-red-100 text-red-700';
                        text = 'Rejected';
                        break;
                    default: // draft
                        color = 'bg-gray-100 text-gray-700';
                        text = 'Draft';
                }

                return (
                    <span className={`px-1.5 py-0.5 rounded text-xs ${color}`}>
                        {text}
                    </span>
                );
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: 140,
            render: (record) => {
                const isAnotherQuoteApproved = vendorQuotes.some(q => 
                    q.item._id === record.item._id && 
                    q.status === 'approved'
                );

                return (
                    <div className="flex space-x-1">
                        <button
                            onClick={() => handleViewQuoteDetails(record)}
                            className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                            View
                        </button>
                        {record.status === 'draft' && !isAnotherQuoteApproved && (
                            <>
                                <button
                                    onClick={() => handleAcceptQuote(record)}
                                    className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleRejectQuote(record)}
                                    className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                >
                                    Reject
                                </button>
                            </>
                        )}
                    </div>
                );
            }
        }
    ];

    const handleViewQuoteDetails = (quote) => {
        const isAnotherQuoteApproved = vendorQuotes.some(q => 
            q.item._id === quote.item._id && 
            q._id !== quote._id && 
            q.status === 'approved'
        );

        Modal.info({
            title: 'Quote Details',
            width: 600,
            content: (
                <div className="space-y-4">
                    <div>
                        <h3 className="font-medium">Vendor Information</h3>
                        <p>Name: {getVendorName(quote.vendor)}</p>
                    </div>
                    <div>
                        <h3 className="font-medium">Quote Information</h3>
                        <p>Item: {quote.item.name}</p>
                        <p>Price per unit: ₹{quote.quotedPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                        <p>Quantity: {quote.quantity}</p>
                        <p>Total Amount: ₹{(quote.quotedPrice * quote.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                        <p>Delivery Timeline: {new Date(quote.deliveryTimeline).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}</p>
                        <p>Status: {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}</p>
                        {quote.status === 'rejected' && isAnotherQuoteApproved && (
                            <p className="text-red-500">This quote was rejected because another quote was approved for this item.</p>
                        )}
                        <p>Remarks: {quote.remarks}</p>
                        <p>Terms and Conditions: {quote.termsAndConditions}</p>
                    </div>
                </div>
            )
        });
    };

    const getDummyQuotes = () => {
        // Base prices for different item types
        const basePrices = {
            'Steel Pipes': { min: 1200, max: 1800 },
            'Copper Wiring': { min: 400, max: 600 },
            'Paint': { min: 150, max: 250 },
            'Cement': { min: 350, max: 450 },
            'Bricks': { min: 8, max: 12 },
            'default': { min: 100, max: 1000 }
        };

        // Possible statuses with weighted distribution
        const statuses = ['draft', 'draft', 'draft', 'approved', 'rejected'];
        
        // Sample remarks pool
        const remarksPool = [
            'Best quality materials guaranteed',
            'Includes free delivery',
            'Bulk discount applied',
            'Premium quality product',
            'Standard quality materials',
            'Express delivery available',
            'ISO certified products',
            'Direct factory price',
            'Competitive market rate',
            'Limited time offer'
        ];

        // Sample T&C pool
        const termsPool = [
            'Payment within 30 days',
            'Delivery within 7 working days',
            'Minimum order quantity applies',
            'Price valid for 15 days',
            'Installation not included',
            'Warranty included',
            'Transportation extra',
            'Subject to stock availability',
            'Taxes as applicable'
        ];

        return rfq.selectedVendors.flatMap(vendorData => {
            return rfq.items.map(item => {
                // Get price range for item type or use default
                const priceRange = basePrices[item.name] || basePrices.default;
                
                // Generate random price within range
                const basePrice = Math.floor(
                    Math.random() * (priceRange.max - priceRange.min) + priceRange.min
                );

                // Random delivery date between 7 and 30 days
                const deliveryDate = new Date();
                deliveryDate.setDate(
                    deliveryDate.getDate() + Math.floor(Math.random() * 23) + 7
                );

                // Random status
                const status = statuses[Math.floor(Math.random() * statuses.length)];

                // Random remarks and terms
                const remarks = remarksPool[Math.floor(Math.random() * remarksPool.length)];
                const terms = termsPool[Math.floor(Math.random() * termsPool.length)];

                return {
                    _id: `quote_${vendorData.vendor}_${item._id}`,
                    rfq: rfq._id,
                    vendor: vendorData.vendor,
                    item: {
                        _id: item._id,
                        name: item.name,
                        quantity: item.quantity
                    },
                    quotedPrice: basePrice,
                    quantity: item.quantity,
                    deliveryTimeline: deliveryDate,
                    status: status,
                    remarks: remarks,
                    termsAndConditions: terms,
                    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last 7 days
                    updatedAt: new Date()
                };
            });
        });
    };

    // Add this useEffect to set initial dummy quotes
    useEffect(() => {
        if (rfq && rfq.selectedVendors) {
            setVendorQuotes(getDummyQuotes());
        }
    }, [rfq]);

    return (
        <Modal
            title={`RFQ Details - ${rfq?.rfqNumber}`}
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={1000}
        >
            <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 bg-gray-50 p-3 rounded text-sm">
                    <div>
                        <span className="text-gray-600">Indent Number:</span>
                        <span className="ml-1 font-medium">{rfq?.indent?.indentNumber}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Status:</span>
                        <span className="ml-1 font-medium">{rfq?.status}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Deadline:</span>
                        <span className="ml-1 font-medium">
                            {new Date(rfq?.submissionDeadline).toLocaleDateString()}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600">Published:</span>
                        <span className="ml-1 font-medium">
                            {new Date(rfq?.publishDate).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                <select
                    value={selectedVendor || ''}
                    onChange={(e) => setSelectedVendor(e.target.value)}
                    className="w-full p-1.5 mb-3 border rounded text-sm"
                >
                    <option value="">All Vendors</option>
                    {rfq?.selectedVendors.map(v => (
                        <option key={v.vendor} value={v.vendor}>
                            {getVendorName(v.vendor)}
                        </option>
                    ))}
                </select>

                <Table
                    dataSource={vendorQuotes.filter(quote => 
                        !selectedVendor || quote.vendor === selectedVendor
                    )}
                    columns={vendorQuoteColumns}
                    rowKey="_id"
                    loading={loading}
                    pagination={false}
                    scroll={{ x: 900 }}
                    size="small"
                    className="overflow-x-auto"
                />
            </div>
        </Modal>
    );
};

export default ViewRfqModal;