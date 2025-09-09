import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const typeOrmConfigFactory = (configService: ConfigService): TypeOrmModuleOptions => {
  const config = {
    type: 'postgres' as const,
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    autoLoadEntities: true,
    synchronize: false,
    logging: configService.get<string>('NODE_ENV') === 'development',
  };

  if (configService.get<string>('NODE_ENV') === 'development') {
    console.log('TypeORM Config:', {
      host: config.host,
      port: config.port,
      username: config.username,
      database: config.database,
    });
  }

  return config;
};

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  autoLoadEntities: true,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};
