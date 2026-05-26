import api from '../lib/axios';

export const authService = {
  async login(credentials: Record<string, string>) {
    const { data } = await api.post('/auth/login', credentials);
    if (data.token) {
      localStorage.setItem('admin_token', data.token);
    }
    return data;
  },

  logout() {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin';
  },

  /**
   * Sends the password update payload to the backend
   */
  async changePassword(passwords: Record<string, string>) {
    // This utilizes your custom 'api' instance and targets your change password route
    const { data } = await api.post('/auth/change-password', passwords);
    return data;
  }
};