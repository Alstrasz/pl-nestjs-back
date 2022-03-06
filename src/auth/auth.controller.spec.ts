import { describe_with_db, TestContext } from 'src/abstract_spec';
import { AuthController } from './auth.controller';
import { AuthModule } from './auth.module';


let auth_controller: AuthController;

describe_with_db(
    'AuthController',
    [AuthModule],
    ( context: TestContext ) => {
        auth_controller = context.module.get<AuthController>( AuthController );
    },
    () => {
        it( 'should be defined', () => {
            expect( auth_controller ).toBeDefined();
        } );
    },
);
