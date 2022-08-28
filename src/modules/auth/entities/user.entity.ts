export interface User {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  role: 'admin' | 'customer' | 'worker';
}
