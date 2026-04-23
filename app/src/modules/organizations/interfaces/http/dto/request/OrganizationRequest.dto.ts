import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class AddressInputDto {
  @ApiProperty({ example: 'Av. Principal 123' })
  @IsString() @MinLength(1) @MaxLength(200)
  street!: string;

  @ApiProperty({ example: 'Santiago' })
  @IsString() @MinLength(1) @MaxLength(100)
  city!: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(100)
  region?: string | null;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(20)
  postalCode?: string | null;

  @ApiProperty({ example: 'CL' })
  @IsString() @Length(2, 2)
  countryCode!: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(50)
  label?: string | null;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  isPrimary?: boolean;
}

export class RegionalSettingsInputDto {
  @ApiPropertyOptional() @IsOptional() @IsString() timezone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() locale?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() currency?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dateFormat?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() numberFormat?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(6) weekStart?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20) timeFormat?: string;
}

export class FiscalSettingsInputDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 12 })
  @IsOptional() @IsInt() @Min(1) @Max(12)
  fiscalYearStartMonth?: number;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) taxRegime?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) economicActivity?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string | null;
}

export class NotificationSettingsInputDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(150) emailFromName?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(150) emailFrom?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsEmail() emailReplyTo?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() smsEnabled?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() enableEmail?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() enableSms?: boolean;
}

export class BrandingSettingsInputDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString() @Matches(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
  primaryColor?: string | null;
  @ApiPropertyOptional()
  @IsOptional() @IsString() @Matches(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
  secondaryColor?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) logoUrl?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) faviconUrl?: string | null;
}

export class SettingsInputDto {
  @ApiPropertyOptional({ type: RegionalSettingsInputDto })
  @IsOptional() @ValidateNested() @Type(() => RegionalSettingsInputDto)
  regional?: RegionalSettingsInputDto;

  @ApiPropertyOptional({ type: FiscalSettingsInputDto })
  @IsOptional() @ValidateNested() @Type(() => FiscalSettingsInputDto)
  fiscal?: FiscalSettingsInputDto;

  @ApiPropertyOptional({ type: NotificationSettingsInputDto })
  @IsOptional() @ValidateNested() @Type(() => NotificationSettingsInputDto)
  notifications?: NotificationSettingsInputDto;

  @ApiPropertyOptional({ type: BrandingSettingsInputDto })
  @IsOptional() @ValidateNested() @Type(() => BrandingSettingsInputDto)
  branding?: BrandingSettingsInputDto;
}

export class CreateOrganizationRequestDto {
  @ApiProperty({ example: 'Mi Empresa SpA' })
  @IsString() @MinLength(1) @MaxLength(200)
  legalName!: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(200)
  tradeName?: string | null;

  @ApiPropertyOptional({ example: '76123456-7' })
  @IsOptional() @IsString() @MinLength(3) @MaxLength(30)
  taxId?: string | null;

  @ApiProperty({ example: 'CL' })
  @IsString() @Length(2, 2)
  countryCode!: string;

  @ApiPropertyOptional() @IsOptional() @IsEmail()
  email?: string | null;

  @ApiPropertyOptional({ example: '+56912345678' })
  @IsOptional() @IsString() @MaxLength(20)
  phone?: string | null;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500)
  website?: string | null;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ type: [AddressInputDto] })
  @IsOptional() @IsArray() @ArrayMaxSize(20)
  @ValidateNested({ each: true }) @Type(() => AddressInputDto)
  addresses?: AddressInputDto[];

  @ApiPropertyOptional({ type: SettingsInputDto })
  @IsOptional() @ValidateNested() @Type(() => SettingsInputDto)
  settings?: SettingsInputDto;
}

export class UpdateOrganizationRequestDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) @MaxLength(200)
  legalName?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200)
  tradeName?: string | null;

  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(3) @MaxLength(30)
  taxId?: string | null;

  @ApiPropertyOptional() @IsOptional() @IsString() @Length(2, 2)
  countryCode?: string;

  @ApiPropertyOptional() @IsOptional() @IsEmail()
  email?: string | null;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20)
  phone?: string | null;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500)
  website?: string | null;
}

export class ListOrganizationsQueryDto {
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(200)
  perPage?: number;
  @ApiPropertyOptional() @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  active?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Boolean) @IsBoolean()
  isPrimary?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(2, 2)
  countryCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()
  query?: string;
}

export class SearchOrganizationsQueryDto {
  @ApiProperty() @IsString() @MinLength(1)
  query!: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(200)
  perPage?: number;
}
