import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwt_constants } from '../constatns';

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ) {
    constructor () {
        super( {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwt_constants.secret,
        } );
    }

    async validate ( payload: any ) {
        return { uuid: payload.sub, username: payload.username };
    }
}
