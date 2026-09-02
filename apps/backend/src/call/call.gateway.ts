import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CallService } from './call.service';
import { UsePipes, ValidationPipe } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class CallGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly callService: CallService) {}

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('call:invite')
  async handleCallInvite(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { matchId: string; isVideo: boolean; callerName: string }
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    try {
      const activeCall = await this.callService.validateAndCreateCall(userId, data.matchId);
      
      const room = `match_${data.matchId}`;
      client.to(room).emit('call:incoming', {
        matchId: data.matchId,
        callerId: userId,
        callerName: data.callerName,
        isVideo: data.isVideo,
      });
    } catch (error) {
      client.emit('call:error', { message: error.message });
    }
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('call:accept')
  handleCallAccept(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { matchId: string }
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    const call = this.callService.getCall(data.matchId);
    if (!call || call.calleeId !== userId) {
      client.emit('call:error', { message: 'Invalid call session' });
      return;
    }

    this.callService.updateCallStatus(data.matchId, 'ACCEPTED');
    const room = `match_${data.matchId}`;
    client.to(room).emit('call:accepted', { matchId: data.matchId });
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('call:reject')
  handleCallReject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { matchId: string }
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    this.callService.endCall(data.matchId);
    const room = `match_${data.matchId}`;
    client.to(room).emit('call:rejected', { matchId: data.matchId });
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('call:end')
  handleCallEnd(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { matchId: string }
  ) {
    if (!client.data.userId) return;

    this.callService.endCall(data.matchId);
    const room = `match_${data.matchId}`;
    client.to(room).emit('call:ended', { matchId: data.matchId });
  }

  // WebRTC Negotiating Relays (Only if call is ACCEPTED)
  private handleWebRtcRelay(client: Socket, event: string, matchId: string, payload: any) {
    if (!client.data.userId) return;
    const call = this.callService.getCall(matchId);
    if (call?.status !== 'ACCEPTED') return; // Reject signaling if not in an accepted call

    const room = `match_${matchId}`;
    client.to(room).emit(event, { matchId, senderId: client.data.userId, payload });
  }

  @SubscribeMessage('call:offer')
  handleCallOffer(@ConnectedSocket() client: Socket, @MessageBody() data: { matchId: string, payload: any }) {
    this.handleWebRtcRelay(client, 'call:offer', data.matchId, data.payload);
  }

  @SubscribeMessage('call:answer')
  handleCallAnswer(@ConnectedSocket() client: Socket, @MessageBody() data: { matchId: string, payload: any }) {
    this.handleWebRtcRelay(client, 'call:answer', data.matchId, data.payload);
  }

  @SubscribeMessage('call:ice')
  handleCallIce(@ConnectedSocket() client: Socket, @MessageBody() data: { matchId: string, payload: any }) {
    this.handleWebRtcRelay(client, 'call:ice', data.matchId, data.payload);
  }
}
