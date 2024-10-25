import React, { useState, useEffect } from 'react';
import PurchaseOrderForm from './PurchaseOrderForm';
import PurchaseOrderMaster from './PurchaseOrderMaster'; // Assuming this is your PO master component
import axios from 'axios';
import { toast } from 'react-toastify';

const PurchaseOrderManagement = () => {
    const [showForm, setShowForm] = useState(false);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchPurchaseOrders = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/purchase-orders/getAllPOs', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });
            setPurchaseOrders(response.data);
        } catch (error) {
            console.error('Error fetching purchase orders:', error);
            toast.error('Failed to fetch purchase orders');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPurchaseOrders();
    }, []);

    const handleFormSubmit = async (formData) => {
        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/purchase-orders/createPO', formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                }
            });
            if (response.status === 201) {
                toast.success("Purchase order created successfully");
                setShowForm(false); // Close the form
                fetchPurchaseOrders(); // Refresh the list
            }
        } catch (error) {
            console.error('Error creating Purchase Order:', error);
            toast.error(`Failed to create purchase order: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormCancel = () => {
        setShowForm(false);
    };

    return (
        <div>
            {showForm ? (
                <PurchaseOrderForm 
                    onSubmit={handleFormSubmit} 
                    onCancel={handleFormCancel}
                    isLoading={isLoading}
                />
            ) : (
                <PurchaseOrderMaster 
                    purchaseOrders={purchaseOrders}
                    isLoading={isLoading}
                    onCreateNew={() => setShowForm(true)}
                />
            )}
        </div>
    );
};

export default PurchaseOrderManagement;
