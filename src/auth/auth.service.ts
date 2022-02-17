import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor ( private usersService: UsersService ) {}

    async validateUser ( username: string, pass: string ): Promise<any> {
        const user = await this.usersService.findOne( username );
        if ( user && user.password_hash === pass ) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password_hash, ...result } = user;
            return result;
        }
        return null;
    }
}
