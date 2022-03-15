import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class LocalStrategy extends PassportStrategy( Strategy ) {
    constructor ( private auth_service: AuthService ) {
        super( {
            passwordField: 'password_hash',
        } );
    }

    async validate ( username: string, password_hash: string ): Promise<User> {
        const user = await this.auth_service.validateUser( username, password_hash );
        if ( !user ) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
