import { describe_with_db, TestContext } from 'src/abstract_spec';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';


let auth_service: AuthService;

describe_with_db(
    'AuthService',
    [AuthModule],
    ( context: TestContext ) => {
        auth_service = context.module.get<AuthService>( AuthService );
    },
    () => {
        it( 'should be defined', () => {
            expect( auth_service ).toBeDefined();
        } );
    },
);
