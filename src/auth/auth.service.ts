import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { c_error_codes, db_error_codes } from 'src/constatns';
import { User } from 'src/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { AccessTokenDto } from './dto/access_tocken.dto';
import { CreateUserDto } from './dto/create_user.dto';

@Injectable()
export class AuthService {
    constructor (
        private users_service: UsersService,
        private jwt_service: JwtService,
    ) {}

    async validateUser ( username: string, password_hash: string ): Promise<User | null> {
        const user = await this.users_service.get_user_by_username( username );
        if ( user && user.password_hash === password_hash ) {
            user.password_hash = undefined;
            return user;
        }
        return null;
    }

    async login ( user: User ): Promise<AccessTokenDto> {
        const payload = { username: user.username, sub: user.uuid };
        return {
            access_token: this.jwt_service.sign( payload ),
        };
    }

    async register ( create_user_dto: CreateUserDto ): Promise<AccessTokenDto> {
        return this.login(
            await this.users_service.create( create_user_dto ).catch( ( err ) => {
                if ( err.code == db_error_codes.collizion ) {
                    throw new ConflictException( {
                        fields: err?.keyValue,
                        description: 'Such unique index already exists',
                        code: c_error_codes.collizion,
                    } );
                }
                throw new InternalServerErrorException( err );
            } ),
        );
    }
}
