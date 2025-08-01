import { Request } from 'express';

export interface UserRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  }
}
