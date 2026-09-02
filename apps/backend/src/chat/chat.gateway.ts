import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService, SendMessageDto } from './chat.service';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { IsString, IsNotEmpty, IsUUID, IsOptional, IsObject } from 'class-validator';

export class SendMessagePayloadDto {
  @IsUUID()
  matchId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  clientMessageId: string;
}

export class TypingPayloadDto {
  @IsUUID()
  matchId: string;
}

export class CallSignalingDto {
  @IsUUID()
  matchId: string;

  @IsString()
  @IsNotEmpty()
  type: 'offer' | 'answer' | 'ice_candidate' | 'reject' | 'end';

  @IsOptional()
  @IsObject()
  payload?: any;
}

@WebSocketGateway({
  cors: {
    origin: '*', // Allow all for now, in prod limit to your app's origins
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.headers.authorization || (client.handshake.auth?.token as string);
      let token = authHeader;
      if (token && token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
      }

      if (!token) {
        client.disconnect();
        return;
      }

      const decoded = this.jwtService.verify(token);
      client.data.userId = decoded.sub; // sub contains the userId
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Cleanup if needed (ephemeral presence updates)
  }

  @SubscribeMessage('join_chat')
  async handleJoinChat(@ConnectedSocket() client: Socket, @MessageBody() data: { matchId: string }) {
    if (!data.matchId || !client.data.userId) return;
    
    // We should ideally verify via ChatService if the user belongs to the match
    // For simplicity, we just join the room string `match_${data.matchId}`
    const room = `match_${data.matchId}`;
    client.join(room);
  }

  @SubscribeMessage('leave_chat')
  async handleLeaveChat(@ConnectedSocket() client: Socket, @MessageBody() data: { matchId: string }) {
    if (!data.matchId) return;
    const room = `match_${data.matchId}`;
    client.leave(room);
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('send_message')
  async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: SendMessagePayloadDto) {
    const userId = client.data.userId;
    if (!userId) return;

    try {
      const message = await this.chatService.saveMessage(userId, payload);
      
      // Send ACK back to sender
      client.emit('message_saved', message);

      // Broadcast to the room (excluding sender)
      const room = `match_${payload.matchId}`;
      client.to(room).emit('new_message', message);
    } catch (error) {
      client.emit('message_failed', { clientMessageId: payload.clientMessageId, error: error.message });
    }
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('typing_start')
  handleTypingStart(@ConnectedSocket() client: Socket, @MessageBody() payload: TypingPayloadDto) {
    if (!client.data.userId) return;
    const room = `match_${payload.matchId}`;
    client.to(room).emit('typing_start', { matchId: payload.matchId, userId: client.data.userId });
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('typing_end')
  handleTypingEnd(@ConnectedSocket() client: Socket, @MessageBody() payload: TypingPayloadDto) {
    if (!client.data.userId) return;
    const room = `match_${payload.matchId}`;
    client.to(room).emit('typing_end', { matchId: payload.matchId, userId: client.data.userId });
  }


}
