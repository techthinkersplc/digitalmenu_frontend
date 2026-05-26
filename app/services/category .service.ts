import api from '../lib/axios';
import { Category } from '../types/index';

export const categoryService = {
 
  async getAll(): Promise<Category[]> {
    // 🛠 FIXED: Swapped out '/admin/category' for your clean public endpoint
    const { data } = await api.get('/category');
    return data;
  },


  async getById(id: string): Promise<Category> {
    // 🛠 FIXED: Corrected path to match the plural public endpoint mounting
    const { data } = await api.get(`/category/${id}`);
    return data;
  },


  async getWithFoods(id: string): Promise<Category> {
    // 🛠 FIXED: Corrected path endpoint naming mismatch
    const { data } = await api.get(`/category/${id}/foods`);
    return data;
  },


  async create(name: string): Promise<Category> {
    const { data } = await api.post('/admin/category', { name });
    return data;
  },


  async update(id: string, name: string): Promise<Category> {
    const { data } = await api.put(`/admin/category/${id}`, { name });
    return data;
  },

 
  async delete(id: string): Promise<void> {
    await api.delete(`/admin/category/${id}`);
  }
};