import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { AccessTokenDto } from './dto/access_tocken.dto';

@Injectable()
export class AuthService {
    constructor (
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async validateUser ( username: string, pass: string ): Promise<User | null> {
        const user = await this.usersService.get_user_by_username( username );
        console.log( user );
        if ( user && user.password_hash === pass ) {
            user.password_hash = undefined;
            return user;
        }
        return null;
    }

    async login ( user: User ): Promise<AccessTokenDto> {
        const payload = { username: user.username, sub: user.uuid };
        return {
            access_token: this.jwtService.sign( payload ),
        };
    }
}
