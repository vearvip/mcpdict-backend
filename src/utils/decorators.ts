import { SetMetadata } from '@nestjs/common';

export const PUBLIC_KEY = 'Is_Public';
export const Public = () => SetMetadata(PUBLIC_KEY, true);