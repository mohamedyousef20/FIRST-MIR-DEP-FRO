import { pickupPointService } from '../pickupPointService';
import axios from 'axios';

jest.mock('axios');

const mockAxios = axios as jest.Mocked<typeof axios>;

const mockPickupPoint = {
  id: '1',
  name: 'Test Station',
  address: '123 Test St',
  city: 'Test City',
  postalCode: '12345',
  phoneNumber: '555-1234',
  operatingHours: '9am-5pm',
};

describe('pickupPointService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a pickup point', async () => {
      mockAxios.post.mockResolvedValue({ data: mockPickupPoint });

      const result = await pickupPointService.create(mockPickupPoint);

      expect(mockAxios.post).toHaveBeenCalledWith('/pickup-points', mockPickupPoint);
      expect(result).toEqual(mockPickupPoint);
    });

    it('should throw error on failed request', async () => {
      const error = new Error('Failed to create pickup point');
      mockAxios.post.mockRejectedValue(error);

      await expect(pickupPointService.create(mockPickupPoint))
        .rejects
        .toThrow('Failed to create pickup point');
    });
  });

  describe('getAll', () => {
    it('should fetch pickup points', async () => {
      const pickupPoints = [mockPickupPoint];
      mockAxios.get.mockResolvedValue({ data: pickupPoints });

      const result = await pickupPointService.getAll();

      expect(mockAxios.get).toHaveBeenCalledWith('/pickup-points');
      expect(result).toEqual(pickupPoints);
    });

    it('should throw error on failed request', async () => {
      const error = new Error('Failed to fetch pickup points');
      mockAxios.get.mockRejectedValue(error);

      await expect(pickupPointService.getAll())
        .rejects
        .toThrow('Failed to fetch pickup points');
    });
  });
});
