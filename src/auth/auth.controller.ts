import {
    Controller,
    Request,
    Post,
    UseGuards,
    Get,
    UsePipes,
    ValidationPipe,
    Body,
    ConflictException,
    InternalServerErrorException,
} from '@nestjs/common';
import { c_error_codes, db_error_codes } from 'src/constatns';
import { UserDto } from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { AccessTokenDto } from './dto/access_tocken.dto';
import { CreateUserDto } from './dto/create_user.dto';
import { ROLE } from './enums/role.enum';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';


@Controller( 'auth' )
export class AuthController {
    constructor (
        private auth_service: AuthService,
        private users_service: UsersService,
    ) {}

    @UseGuards( LocalAuthGuard )
    @Post( 'login' )
    async login ( @Request() req ): Promise<AccessTokenDto> {
        return new AccessTokenDto( await this.auth_service.login( req.user ) );
    }

    @UseGuards( RolesGuard )
    @UseGuards( JwtAuthGuard )
    @Roles( ROLE.USER )
    @Get( 'profile' )
    async getProfile ( @Request() req ): Promise<UserDto> {
        return new UserDto( req.user );
    }

    @UsePipes( new ValidationPipe( { whitelist: true } ) )
    @Post( 'register' )
    async register ( @Body() create_user_dto: CreateUserDto ): Promise<AccessTokenDto> {
        return this.auth_service.login(
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
