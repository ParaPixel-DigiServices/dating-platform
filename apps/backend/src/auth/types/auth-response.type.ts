export type AuthResponseType = {
  accessToken?: string;

  refreshToken?: string;

  requiresPhoneVerification: boolean;

  user: {
    id?: string;

    phoneNumber?: string | null;

    email?: string | null;
  };
};