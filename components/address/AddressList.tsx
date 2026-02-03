'use client';

import { useState, useEffect } from 'react';
import { addressService } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Edit, Trash2, Check, Plus } from 'lucide-react';
import AddressFormComponent from './AddressForm';
const AddressForm = AddressFormComponent as any;

interface AddressListProps {
  onSelect?: (address: any) => void;
  showAddButton?: boolean;
  showActions?: boolean;
  selectedAddressId?: string | null;
}

export default function AddressList({ 
  onSelect, 
  showAddButton = true, 
  showActions = true,
  selectedAddressId = null 
}: AddressListProps) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await addressService.getAddresses();
      setAddresses(response.data);
    } catch (error: any) {
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    try {
      await addressService.deleteAddress(id);
      toast.success('Address deleted successfully');
      fetchAddresses();
    } catch (error: any) {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressService.setDefaultAddress(id);
      toast.success('Default address updated');
      fetchAddresses();
    } catch (error: any) {
      toast.error('Failed to update default address');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAddress(null);
    fetchAddresses();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showAddButton && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary btn-outline w-full md:w-auto"
        >
          <Plus className="mr-2" /> Add New Address
        </button>
      )}

      {showForm && (
        <div className="card bg-base-100 shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h3>
          <AddressForm
            initialData={editingAddress}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingAddress(null);
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {addresses.map((address) => (
          <div 
            key={address._id} 
            className={`card bg-base-100 shadow-md hover:shadow-lg transition-shadow ${
              selectedAddressId === address._id ? 'ring-2 ring-primary' : ''
            }`}
          >
            <div className="card-body p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="card-title text-lg">
                    {address.fullName}
                    {address.isDefault && (
                      <span className="badge badge-primary badge-sm ml-2">
                        Default
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500">{address.phone}</p>
                </div>
                {showActions && (
                  <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                    </div>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
                      <li>
                        <button 
                          onClick={() => {
                            setEditingAddress(address);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="text-blue-500" /> Edit
                        </button>
                      </li>
                      <li>
                        <button onClick={() => handleDelete(address._id)}>
                          <Trash2 className="text-red-500" /> Delete
                        </button>
                      </li>
                      {!address.isDefault && (
                        <li>
                          <button onClick={() => handleSetDefault(address._id)}>
                            <Check className="text-green-500" /> Set as Default
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="mt-2 text-sm">
                <p>{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>
                  {address.city}, {address.state} {address.postalCode}
                </p>
                <p>{address.country}</p>
              </div>

              {onSelect && (
                <div className="card-actions justify-end mt-4">
                  <button
                    onClick={() => onSelect(address)}
                    className="btn btn-sm btn-primary"
                  >
                    Select Address
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!loading && addresses.length === 0 && !showForm && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No addresses found</p>
          {showAddButton && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary btn-outline"
            >
              <Plus className="mr-2" /> Add Your First Address
            </button>
          )}
        </div>
      )}
    </div>
  );
}
