import {
  IsString,
  MinLength,
  MaxLength,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDomainDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  host: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
