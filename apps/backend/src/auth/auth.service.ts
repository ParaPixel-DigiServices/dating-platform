import { Injectable, UnauthorizedException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';

import { FirebaseService } from '../firebase/firebase.service';

import { FirebaseLoginDto } from './dto/firebase-login.dto';

import { AuthResponseType } from './types/auth-response.type';

@Injectable()
export class AuthService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
        private readonly firebaseService: FirebaseService,
    ){}

    async loginWithFirebase(
        dto: FirebaseLoginDto,
    ): Promise<AuthResponseType>{
        try {
            const decodedToken = await this.firebaseService.verifyIdToken(dto.idToken);
            const phoneNumber = decodedToken.phone_number;

            if(!phoneNumber){
                throw new UnauthorizedException('Phone number not found in token.',);
            }

            let user = await this.prismaService.user.findUnique({
                where: {
                    phoneNumber,
                },
            });

            if(!user){
                user = await this.prismaService.user.create({
                    data:{
                        phoneNumber,
                        authProvider: 'PHONE',
                    },
                });
            }

            const accessToken = await this.jwtService.signAsync({
                sub: user.id,
                phoneNumber: user.phoneNumber,
            });

            const refreshToken = crypto.randomUUID();

            const expiresAt = new Date();

            expiresAt.setDate(expiresAt.getDate() + 30);

            await this.prismaService.session.create({
                data:{
                    userId: user.id,
                    refreshToken,
                    expiresAt,
                },
            });

            return{
                accessToken,
                refreshToken,
                user:{
                    id: user.id,
                    phoneNumber: user.phoneNumber,
                    email: user.email,
                },
            };
        } catch {
            throw new UnauthorizedException(
                'Invalid Firebase Token',
            );
        }
    }
}