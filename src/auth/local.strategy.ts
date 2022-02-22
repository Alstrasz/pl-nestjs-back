import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy( Strategy ) {
    constructor ( private auth_service: AuthService ) {
        super();
    }

    async validate ( username: string, password: string ): Promise<any> {
        const user = await this.auth_service.validateUser( username, password );
        if ( !user ) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
