import { Body, Controller, Get, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROLE } from 'src/auth/enums/role.enum';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { c_error_codes } from 'src/constatns';
import { SetRolesDto } from './dto/set_roles.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@ApiTags( 'Users' )
@Controller( 'users' )
export class UsersController {
    constructor ( private users_service: UsersService ) {}

    @Get( ':username' )
    @ApiOperation( { summary: 'Get user data by username' } )
    @ApiBearerAuth( )
    async get_user ( @Param( 'username' ) username: string ): Promise<UserDto> {
        const user = await this.users_service.get_user_by_username( username );
        if ( user == null ) {
            throw new NotFoundException( {
                fields: { username: username },
                description: 'No user with such username found',
                code: c_error_codes.not_found,
            } );
        }
        return new UserDto( user );
    }

    @Post( ':username/roles' )
    @UseGuards( RolesGuard )
    @UseGuards( JwtAuthGuard )
    @Roles( ROLE.ADMIN )
    @ApiOperation( { summary: 'Get user data by username. Requers admin role' } )
    @ApiBearerAuth( )
    async set_roles ( @Param( 'username' ) username: string, @Body() set_roles_dto: SetRolesDto ): Promise<UserDto> {
        const user = await this.users_service.set_roles( username, set_roles_dto.roles );
        if ( user == null ) {
            throw new NotFoundException( {
                fields: { username: username },
                description: 'No user with such username found',
                code: c_error_codes.not_found,
            } );
        }
        return new UserDto( user );
    }
}
