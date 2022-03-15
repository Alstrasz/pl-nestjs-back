import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class VotePostDto {
    @ApiProperty()
    @IsOptional()
    @IsBoolean()
        vote?: boolean;
}
