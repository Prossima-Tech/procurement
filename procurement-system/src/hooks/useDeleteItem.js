import { useState } from 'react';
import { toast } from 'react-toastify';
import DeleteConfirmationDialog from '../components/common/DeleteConfirmationDialog';
import axios from 'axios';

export const useDeleteItem = ({
    endpoint,
    itemType = 'item',
    onSuccess,
    toastConfig = {},
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const getToken = () => localStorage.getItem('token');

    const showDeleteConfirmation = (item) => {
        toast(
            ({ closeToast }) => (
                <DeleteConfirmationDialog
                    title={`Delete ${itemType}`}
                    message={`Are you sure you want to delete this ${itemType.toLowerCase()}? This action cannot be undone.`}
                    itemType={itemType}
                    itemName={item.name || item.vendorCode || item.itemCode || String(item._id)}
                    closeToast={closeToast}
                    onDelete={() => handleDelete(item._id)}
                />
            ),
            {
                autoClose: false,
                closeOnClick: false,
                draggable: false,
                closeButton: false,
                style: {
                    padding: '1.5rem',
                    minWidth: '400px',
                    ...toastConfig.style,
                },
                ...toastConfig,
            }
        );
    };

    const handleDelete = async (itemId) => {
        try {
            setIsLoading(true);
            await axios.delete(`${endpoint}/${itemId}`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            toast.success(`${itemType} deleted successfully`, {
                ...toastConfig,
                autoClose: 3000,
            });

            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            console.error(`Error deleting ${itemType}:`, err);
            toast.error(
                err.response?.data?.message || `Failed to delete ${itemType}. Please try again.`,
                toastConfig
            );
        } finally {
            setIsLoading(false);
        }
    };

    return {
        showDeleteConfirmation,
        isLoading,
    };
};