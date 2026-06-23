import { Global, Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

import { AppConfigService } from '../../config/config.service';


@Global()
@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [AppConfigService],

      useFactory: (config: AppConfigService) => ({
        pinoHttp: {
          level: config.isDevelopment ? 'debug' : 'info',

          transport: config.isDevelopment
            ? {
                target: 'pino-pretty',

                options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  singleLine: false,
                },
              }
            : undefined,

          redact: {
            paths: [
              'req.headers.authorization',
              'req.headers.cookie',
            ],

            remove: true,
          },
        },
      }),
    }),
  ],
})
export class AppLoggerModule {}