import React, { useState } from 'react';
import { PickupPoint, Location } from '../../types/pickup-point';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '../../components/ui/toast-provider';
import { pickupPointService } from '../../../lib/api/services/pickupPointService';

interface PickupPointFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<PickupPoint>;
}

export const PickupPointForm: React.FC<PickupPointFormProps> = ({ onSuccess, onCancel, initialData = {} }) => {
  const [isLoading, setIsLoading] = useState(false);
  // Create a safe initial data object with all required fields
  const safeInitialData: Omit<PickupPoint, '_id'> = {
    id: initialData.id || '',
    name: initialData.name || '',
    address: initialData.address || '',
    city: initialData.city || '',
    country: initialData.country || '',
    postalCode: initialData.postalCode || '',
    phoneNumber: (initialData as any).phoneNumber || (initialData as any).phone || '',
    email: initialData.email || '',
    isActive: initialData.isActive ?? true,
    operatingHours: (initialData as any).operatingHours || (initialData as any).workingHours || '',
    location: initialData.location || { lat: 0, lng: 0 },
    createdAt: initialData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const [formData, setFormData] = useState<Omit<PickupPoint, '_id'>>(safeInitialData);

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create a complete payload with all required fields
      const payload: Omit<PickupPoint, '_id'> = {
        id: formData.id,
        name: formData.name,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        postalCode: formData.postalCode,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        isActive: formData.isActive,
        operatingHours: formData.operatingHours,
        location: formData.location || { lat: 0, lng: 0 },
        createdAt: formData.createdAt,
        updatedAt: new Date().toISOString(),
      };
      
      if (initialData.id) {
        // For updates, we need to include the id
        await pickupPointService.update(initialData.id, payload);
      } else {
        // For new records, create a new object without the id
        const { id, ...createPayload } = payload;
        await pickupPointService.create(createPayload);
      }
      
      toast({
        title: 'Success',
        description: 'Pickup point added successfully',
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add pickup point',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          required
          placeholder="Enter station name"
        />
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          placeholder="Enter address"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            placeholder="Enter city"
          />
        </div>
        <div>
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            required
            placeholder="Enter postal code"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
          placeholder="Enter phone number"
        />
      </div>

      <div>
        <Label htmlFor="operatingHours">Operating Hours</Label>
        <Textarea
          id="operatingHours"
          name="operatingHours"
          value={formData.operatingHours}
          onChange={handleChange}
          required
          placeholder="Enter operating hours"
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Adding...' : 'Add Pickup Point'}
      </Button>
    </form>
  );
};
