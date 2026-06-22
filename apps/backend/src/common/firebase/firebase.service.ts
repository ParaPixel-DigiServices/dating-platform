import { Injectable, UnauthorizedException } from '@nestjs/common';
import { getAuth } from 'firebase-admin/auth';

@Injectable()
export class FirebaseService {
  async verifyIdToken(idToken: string) {
    try {
      const decodedToken = await getAuth().verifyIdToken(idToken);

      return {
        uid: decodedToken.uid,
        phoneNumber: decodedToken.phone_number ?? null,
        email: decodedToken.email ?? null,
      };
    } catch {
      throw new UnauthorizedException('Invalid Firebase ID token');
    }
  }
}