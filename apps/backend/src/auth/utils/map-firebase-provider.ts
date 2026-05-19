import { AuthProvider } from '@prisma/client';

export function mapFirebaseProvider(
  provider: string,
): AuthProvider {
  switch (provider) {
    case 'phone':
      return AuthProvider.PHONE;

    case 'google.com':
      return AuthProvider.GOOGLE;

    case 'apple.com':
      return AuthProvider.APPLE;

    default:
      return AuthProvider.PHONE;
  }
}