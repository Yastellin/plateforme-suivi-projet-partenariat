import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MAIL_PORT } from './mail.port';
import { NoopMailAdapter } from './adapters/noop-mail.adapter';
import { SmtpMailAdapter } from './adapters/smtp-mail.adapter';

@Global()
@Module({
  providers: [
    {
      provide: MAIL_PORT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const mode = config.get<string>('MAIL_MODE', 'noop');
        return mode === 'smtp'
          ? new SmtpMailAdapter(config)
          : new NoopMailAdapter();
      },
    },
  ],
  exports: [MAIL_PORT],
})
export class MailModule {}
