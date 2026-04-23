import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

class EmailInputDto {
  @ApiProperty() @IsEmail() email!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) label?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPrimary?: boolean;
}

class PhoneInputDto {
  @ApiProperty() @IsString() @MaxLength(20) phone!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) label?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPrimary?: boolean;
}

class AddressInputDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(200) street!: string;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(100) city!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) region?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20) postalCode?: string | null;
  @ApiProperty() @IsString() @Length(2, 2) countryCode!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) label?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPrimary?: boolean;
}

export class CreateContactRequestDto {
  @ApiProperty() @IsUUID() organizationId!: string;
  @ApiProperty({ enum: ['PERSON', 'COMPANY'] })
  @IsEnum(['PERSON', 'COMPANY'] as const)
  type!: 'PERSON' | 'COMPANY';

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) personFirstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) personLastName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(150) companyLegalName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(150) companyTradeName?: string | null;

  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(3) @MaxLength(30) taxId?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(2, 2) countryCode?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsInt() userId?: number | null;
  @ApiPropertyOptional() @IsOptional() @IsInt() assignedToUserId?: number | null;

  @ApiPropertyOptional({ type: [EmailInputDto] })
  @IsOptional() @IsArray() @ArrayMaxSize(20) @ValidateNested({ each: true }) @Type(() => EmailInputDto)
  emails?: EmailInputDto[];

  @ApiPropertyOptional({ type: [PhoneInputDto] })
  @IsOptional() @IsArray() @ArrayMaxSize(20) @ValidateNested({ each: true }) @Type(() => PhoneInputDto)
  phones?: PhoneInputDto[];

  @ApiPropertyOptional({ type: [AddressInputDto] })
  @IsOptional() @IsArray() @ArrayMaxSize(20) @ValidateNested({ each: true }) @Type(() => AddressInputDto)
  addresses?: AddressInputDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsUUID('all', { each: true })
  roleTypeIds?: string[];
}

export class UpdateContactRequestDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) personFirstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) personLastName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(150) companyLegalName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(150) companyTradeName?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(3) @MaxLength(30) taxId?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(2, 2) countryCode?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsInt() userId?: number | null;
}

export class AssignContactRequestDto {
  @ApiProperty({ nullable: true })
  @IsOptional() @IsInt()
  assignedToUserId!: number | null;
}

export class AddContactRoleRequestDto {
  @ApiProperty() @IsUUID() roleTypeId!: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() since?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsDateString() until?: string | null;
}

export class AddContactEmailRequestDto {
  @ApiProperty() @IsEmail() email!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) label?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPrimary?: boolean;
}
export class UpdateContactEmailRequestDto {
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) label?: string | null;
}

export class AddContactPhoneRequestDto {
  @ApiProperty() @IsString() @MaxLength(20) phone!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) label?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPrimary?: boolean;
}
export class UpdateContactPhoneRequestDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20) phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) label?: string | null;
}

export class AddContactAddressRequestDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(200) street!: string;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(100) city!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) region?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20) postalCode?: string | null;
  @ApiProperty() @IsString() @Length(2, 2) countryCode!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) label?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPrimary?: boolean;
}
export class UpdateContactAddressRequestDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) @MaxLength(200) street?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) @MaxLength(100) city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) region?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20) postalCode?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(2, 2) countryCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) label?: string | null;
}

export class ListContactsQueryDto {
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(200) perPage?: number;
  @ApiPropertyOptional() @IsOptional() @IsUUID() organizationId?: string;
  @ApiPropertyOptional({ enum: ['PERSON', 'COMPANY'] })
  @IsOptional() @IsEnum(['PERSON', 'COMPANY'] as const)
  type?: 'PERSON' | 'COMPANY';
  @ApiPropertyOptional() @IsOptional() @Type(() => Boolean) @IsBoolean() active?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsUUID() roleTypeId?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() assignedToUserId?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() query?: string;
}

export class SearchContactsQueryDto {
  @ApiProperty() @IsString() @MinLength(1) query!: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(200) perPage?: number;
}

// Suprimir warning de imports no usados
void Matches;
