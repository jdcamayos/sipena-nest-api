import { SetMetadata } from '@nestjs/common';

export const IS_PUBIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBIC_KEY, true);
