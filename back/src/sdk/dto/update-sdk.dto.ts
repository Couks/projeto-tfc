import { PartialType } from '@nestjs/mapped-types';
import { CreateSdkDto } from './create-sdk.dto';

export class UpdateSdkDto extends PartialType(CreateSdkDto) {}
