import { Global, Module } from '@nestjs/common';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { FirebaseService } from './firebase.service';

@Global()
@Module({
  providers: [
    {
      provide: 'FIREBASE_APP',
      useFactory: () => {
        if (getApps().length > 0) {
          return getApps()[0];
        }

        const serviceAccountPath = resolve(
          process.cwd(),
          'secrets',
          'firebase-service-account.json',
        );

        const serviceAccount = JSON.parse(
          readFileSync(serviceAccountPath, 'utf-8'),
        );

        return initializeApp({
          credential: cert(serviceAccount),
        });
      },
    },
    FirebaseService,
  ],
  exports: [FirebaseService],
})
export class FirebaseModule {}