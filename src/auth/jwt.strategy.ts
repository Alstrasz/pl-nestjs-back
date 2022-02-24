import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwt_constants } from '../constatns';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ) {
    constructor ( private users_service: UsersService ) {
        super( {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwt_constants.secret,
        } );
    }

    async validate ( payload: any ) {
        return await this.users_service.get_user_by_username( payload.username );
    }
}
