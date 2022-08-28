import { Request } from 'express';
import { User } from './user.entity';

export interface RequestType extends Request {
  user: User;
}
