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
    UseInterceptors,
    ClassSerializerInterceptor,
} from '@nestjs/common';
import { UserDto } from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { AccessTokenDto } from './dto/access_tocken.dto';
import { CreateUserDto } from './dto/create_user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';


@Controller( 'auth' )
export class AuthController {
    constructor (
        private authService: AuthService,
        private usersService: UsersService,
    ) {}

    @UseGuards( LocalAuthGuard )
    @Post( 'login' )
    async login ( @Request() req ): Promise<AccessTokenDto> {
        const t: any = await this.authService.login( req.user );
        t.t = '2';
        return new AccessTokenDto( t );
    }

    @UseGuards( JwtAuthGuard )
    @Get( 'profile' )
    async getProfile ( @Request() req ): Promise<UserDto> {
        return new UserDto( ( await this.usersService.get_user_by_username( req.user?.username ) as any )._doc );
    }

    @UsePipes( new ValidationPipe( { whitelist: true } ) )
    @Post( 'register' )
    async register ( @Body() createUserDto: CreateUserDto ): Promise<AccessTokenDto> {
        return this.authService.login(
            await this.usersService.create( createUserDto ).catch( ( err ) => {
                if ( err.code = 11000 ) {
                    throw new ConflictException( err );
                }
                throw new InternalServerErrorException( err );
            } ),
        );
    }
}
