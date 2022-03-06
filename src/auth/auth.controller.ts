import {
    Controller,
    Request,
    Post,
    UseGuards,
    Get,
    UsePipes,
    ValidationPipe,
    Body,
} from '@nestjs/common';
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
        return this.auth_service.register( create_user_dto );
    }
}
