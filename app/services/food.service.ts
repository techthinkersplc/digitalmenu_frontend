import api from '../lib/axios';
import { Food } from '../types/index';

export const foodService = {
 
  async getPublicMenu(): Promise<Food[]> {
    const { data } = await api.get('/menu');
    return data;
  },

  /**
   * ADMIN: Fetch all food items
   * Used for the main admin dashboard table.
   */
  async getAllAdmin(): Promise<Food[]> {
    const { data } = await api.get('/admin/food');
    return data;
  },

  /**
   * ADMIN: Fetch a single food item by ID
   * Used for the "Edit Food" page.
   */
  async getById(id: string): Promise<Food> {
    const { data } = await api.get(`/admin/food/${id}`);
    return data;
  },

  /**
   * ADMIN: Create a new food record
   * Must use FormData because of the image file.
   */
  async create(formData: FormData): Promise<Food> {
    const { data } = await api.post('/admin/food', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data' 
      }
    });
    return data;
  },

  /**
   * ADMIN: Update an existing food record
   * If updateData is FormData, it handles image changes.
   */
  async update(id: string, updateData: FormData | Partial<Food>): Promise<Food> {
    const isFormData = updateData instanceof FormData;
    
    const { data } = await api.put(`/admin/food/${id}`, updateData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return data;
  },

  /**
   * ADMIN: Delete a food record
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/admin/food/${id}`);
  }
};