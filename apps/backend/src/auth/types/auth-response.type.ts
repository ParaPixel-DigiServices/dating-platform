export type AuthResponseType = {
    accessToken: string;
    refreshToken: string;

    user:{
        id: string;
        phoneNumber?: string | null;
        email?: string | null;
    };
};