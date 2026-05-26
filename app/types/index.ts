export interface User {
  id: string;
  email: string; // Keep this so you can display "Welcome, [email]" in the header
  role: string;
  // No password here!
}

export interface AuthResponse {
  token: string;
  user: User;
}
export interface Category {
  id: string;
  name: string;
}

export interface Food {
  image: unknown;
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  ingredients: string[];
  isAvailable: boolean;
  categoryId: string;
  category?: Category; // This matches the relation we added in the backend
  createdAt?: string;
  updatedAt?: string;
}
