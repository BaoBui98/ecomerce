import { Request } from 'express';
import { TokenPayload } from '../services/token.service';

export interface RequestWithUser extends Request {
  user: TokenPayload;
}
