import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  secrets: {
    jwt: process.env.JWT_SECRET || 'supersecret',
    recoveryPassword: process.env.RECOVERY_PASSWORD_SECRET || 'ultrasecret',
  },
  constants: {
    jwtExpireTime: process.env.JWT_EXPIRE_TIME || '30d',
  },
}));
