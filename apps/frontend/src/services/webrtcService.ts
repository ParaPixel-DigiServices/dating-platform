import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';
import { socketService } from './socketService';

export interface CallSignalPayload {
  matchId: string;
  senderId: string;
  type: 'offer' | 'answer' | 'ice_candidate' | 'reject' | 'end';
  payload?: any;
}

type WebRTCSignalHandler = (data: CallSignalPayload) => void;

class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  public localStream: MediaStream | null = null;
  public remoteStream: MediaStream | null = null;

  // Callbacks for UI updates
  public onLocalStream: ((stream: MediaStream) => void) | null = null;
  public onRemoteStream: ((stream: MediaStream) => void) | null = null;
  public onCallStateChange: ((state: 'connecting' | 'connected' | 'disconnected' | 'ended' | 'rejected' | 'ringing' | 'incoming') => void) | null = null;
  public onIncomingCall: ((data: { matchId: string; callerId: string, callerName: string, isVideo: boolean }) => void) | null = null;
  public onCallAccepted: (() => void) | null = null;

  public currentMatchId: string | null = null;

  // Google's public STUN servers for NAT traversal
  private configuration = {
    iceServers: [
      {
        urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'],
      },
    ],
  };

  constructor() {
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    // This is called when webrtcService is initialized
    // but the socket might not be connected yet. 
    // We attach it dynamically or rely on the socket emitting.
  }

  public attachSocketListeners() {
    const socket = socketService.getSocket();
    if (!socket) return;

    socket.off('call:incoming', this.handleIncoming);
    socket.off('call:accepted', this.handleAccepted);
    socket.off('call:rejected', this.handleRejected);
    socket.off('call:ended', this.handleEnded);
    socket.off('call:offer', this.handleOffer);
    socket.off('call:answer', this.handleAnswer);
    socket.off('call:ice', this.handleIce);

    socket.on('call:incoming', this.handleIncoming);
    socket.on('call:accepted', this.handleAccepted);
    socket.on('call:rejected', this.handleRejected);
    socket.on('call:ended', this.handleEnded);
    socket.on('call:offer', this.handleOffer);
    socket.on('call:answer', this.handleAnswer);
    socket.on('call:ice', this.handleIce);
  }

  private handleIncoming = (data: any) => {
    if (this.onIncomingCall) {
      this.onIncomingCall(data);
    }
  };

  private handleAccepted = (data: any) => {
    if (this.currentMatchId === data.matchId && this.onCallAccepted) {
      this.onCallAccepted();
    }
  };

  private handleRejected = (data: any) => {
    this.endCallLocally('rejected');
  };

  private handleEnded = (data: any) => {
    this.endCallLocally('ended');
  };

  private handleOffer = async (data: any) => {
    if (this.peerConnection) {
      this.onCallStateChange?.('connecting');
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.payload));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      this.sendSignal('call:answer', answer);
    }
  };

  private handleAnswer = async (data: any) => {
    if (this.peerConnection) {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.payload));
    }
  };

  private handleIce = async (data: any) => {
    if (this.peerConnection && data.payload) {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.payload));
    }
  };

  private sendSignal(event: string, payload?: any) {
    if (!this.currentMatchId) return;
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit(event, {
        matchId: this.currentMatchId,
        payload,
      });
    }
  }

  public inviteUser(matchId: string, isVideo: boolean, callerName: string) {
    this.currentMatchId = matchId;
    this.onCallStateChange?.('ringing');
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('call:invite', { matchId, isVideo, callerName });
    }
  }

  public acceptCall(matchId: string) {
    this.currentMatchId = matchId;
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('call:accept', { matchId });
    }
  }

  public async startLocalStream(isVideo: boolean = false) {
    try {
      const mediaConstraints = {
        audio: true,
        video: isVideo ? { facingMode: 'user' } : false,
      };
      
      this.localStream = await mediaDevices.getUserMedia(mediaConstraints);
      if (this.onLocalStream) {
        this.onLocalStream(this.localStream);
      }
      return this.localStream;
    } catch (err) {
      console.error('Error accessing media devices.', err);
      return null;
    }
  }

  public async initiateCall(matchId: string, isVideo: boolean = false) {
    this.currentMatchId = matchId;
    if (this.onCallStateChange) this.onCallStateChange('connecting');

    if (!this.localStream) {
      await this.startLocalStream(isVideo);
    }
    this.createPeerConnection();

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });
    }

    try {
      const offer = await this.peerConnection?.createOffer();
      if (offer) {
        await this.peerConnection?.setLocalDescription(offer);
        this.sendSignal('call:offer', offer);
      }
    } catch (e) {
      console.error('Error creating offer:', e);
    }
  }

  public async setupAnswerStream(matchId: string, isVideo: boolean = false) {
    this.currentMatchId = matchId;
    if (this.onCallStateChange) this.onCallStateChange('connecting');

    if (!this.localStream) {
      await this.startLocalStream(isVideo);
    }
    this.createPeerConnection();

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });
    }
    // We wait for the offer to arrive via 'call:offer' to create the answer.
  }

  private createPeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.configuration);

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal('call:ice', event.candidate);
      }
    };

    this.peerConnection.onconnectionstatechange = (event) => {
      console.log('Connection state change:', this.peerConnection?.connectionState);
      if (this.peerConnection?.connectionState === 'connected') {
        if (this.onCallStateChange) this.onCallStateChange('connected');
      } else if (this.peerConnection?.connectionState === 'disconnected' || this.peerConnection?.connectionState === 'failed') {
        this.endCallLocally('disconnected');
      }
    };

    this.peerConnection.ontrack = (event) => {
      console.log('Received remote track', event.streams);
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        if (this.onRemoteStream) {
          this.onRemoteStream(this.remoteStream);
        }
      }
    };
  }

  public rejectCall(matchId: string) {
    this.currentMatchId = matchId;
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('call:reject', { matchId });
    }
    this.endCallLocally('rejected');
  }

  public endCall() {
    const socket = socketService.getSocket();
    if (socket && this.currentMatchId) {
      socket.emit('call:end', { matchId: this.currentMatchId });
    }
    this.endCallLocally('ended');
  }

  private endCallLocally(state: 'ended' | 'rejected' | 'disconnected') {
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.remoteStream = null;
    this.currentMatchId = null;
    
    if (this.onCallStateChange) this.onCallStateChange(state);
  }

  public toggleMute(muted: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
    }
  }

  public toggleVideo(videoOn: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = videoOn;
      });
    }
  }
}

export const webrtcService = new WebRTCService();
