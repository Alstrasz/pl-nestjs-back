import { User } from 'src/schemas/user.schema';
import { Request } from 'express';

export interface RequestWithUser extends Request {
    user: User
}

export interface RequestWithOptionalUser extends Request {
    user: User
}
