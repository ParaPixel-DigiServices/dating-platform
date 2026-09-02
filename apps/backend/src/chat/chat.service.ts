import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';

export interface SendMessageDto {
  matchId: string;
  content: string;
  clientMessageId: string;
}

@Injectable()
export class ChatService {
  constructor(private readonly prisma: DatabaseService) {}

  async getInbox(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });
    if (!user?.profile) throw new NotFoundException('Profile not found');
    const myProfileId = user.profile.id;

    // Fetch matches
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [
          { profileOneId: myProfileId },
          { profileTwoId: myProfileId }
        ],
        unmatchedAt: null
      },
      include: {
        profileOne: { include: { user: true, photos: true } },
        profileTwo: { include: { user: true, photos: true } },
        chat: true
      },
    });

    console.log(`[getInbox] Found ${matches.length} matches for profile ${myProfileId}`);
    if (matches.length > 0) {
      console.log(`[getInbox] First match:`, JSON.stringify(matches[0], null, 2));
    }

    // We can optimize the latest message fetch. For now, fetch latest 1 message per chat.
    const inbox = await Promise.all(matches.map(async (match) => {
      let latestMessage: any = null;
      let unreadCount = 0;
      let lastMessageAt = match.createdAt;

      if (match.chat) {
        latestMessage = await this.prisma.message.findFirst({
          where: { chatId: match.chat.id },
          orderBy: { createdAt: 'desc' },
        });
        unreadCount = await this.prisma.message.count({
          where: {
            chatId: match.chat.id,
            senderProfileId: { not: myProfileId },
            isRead: false
          }
        });
        lastMessageAt = match.chat.lastMessageAt || match.createdAt;
      }

      const otherProfile = match.profileOneId.toLowerCase() === myProfileId.toLowerCase() ? match.profileTwo : match.profileOne;
      return {
        chatId: match.chat?.id || 'temp',
        matchId: match.id,
        otherProfile: {
          id: otherProfile.id,
          name: otherProfile.firstName,
          avatar: otherProfile.photos?.[0]?.cdnUrl || null,
        },
        latestMessage,
        unreadCount,
        lastMessageAt
      };
    }));

    inbox.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

    return inbox;
  }

  async getMessages(userId: string, matchId: string, before?: string, limit = 30) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });
    const myProfileId = user?.profile?.id;

    const chat = await this.prisma.chat.findUnique({
      where: { matchId },
      include: { match: true }
    });

    if (!chat) {
      // Check if match exists and we're authorized
      const match = await this.prisma.match.findUnique({ where: { id: matchId } });
      if (!match || (match.profileOneId !== myProfileId && match.profileTwoId !== myProfileId)) {
        throw new ForbiddenException('Not authorized for this match');
      }
      return []; // Return empty array if chat hasn't been created yet
    }

    if (chat.match.profileOneId !== myProfileId && chat.match.profileTwoId !== myProfileId) {
      throw new ForbiddenException('Not authorized for this chat');
    }

    let cursorQuery = {};
    if (before) {
      const cursorMessage = await this.prisma.message.findUnique({ where: { id: before } });
      if (cursorMessage) {
        cursorQuery = {
          createdAt: { lt: cursorMessage.createdAt }
        };
      }
    }

    const messages = await this.prisma.message.findMany({
      where: {
        chatId: chat.id,
        ...cursorQuery
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    // Mark as read (simple approach)
    await this.prisma.message.updateMany({
      where: {
        chatId: chat.id,
        senderProfileId: { not: myProfileId },
        isRead: false
      },
      data: { isRead: true, readAt: new Date() }
    });

    return messages; // Return in reverse chronological order (newest first) for FlatList inverted
  }

  async saveMessage(userId: string, dto: SendMessageDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });
    if (!user?.profile) throw new NotFoundException('Profile not found');
    const myProfileId = user.profile.id;

    // Verify Match and ensure it's not unmatched
    const match = await this.prisma.match.findUnique({ where: { id: dto.matchId } });
    if (!match) throw new NotFoundException('Match not found');
    if (match.profileOneId !== myProfileId && match.profileTwoId !== myProfileId) {
      throw new ForbiddenException('Not authorized for this match');
    }
    if (match.unmatchedAt) throw new ForbiddenException('Match is no longer active');

    // Also check for Blocks
    const otherProfileId = match.profileOneId === myProfileId ? match.profileTwoId : match.profileOneId;
    const block = await this.prisma.block.findFirst({
      where: {
        OR: [
          { blockerProfileId: myProfileId, blockedProfileId: otherProfileId },
          { blockerProfileId: otherProfileId, blockedProfileId: myProfileId }
        ]
      }
    });
    if (block) throw new ForbiddenException('Cannot send message to this user');

    // Get or Create Chat
    let chat = await this.prisma.chat.findUnique({ where: { matchId: dto.matchId } });
    if (!chat) {
      chat = await this.prisma.chat.create({ data: { matchId: dto.matchId } });
    }

    // Check for idempotency
    if (dto.clientMessageId) {
      const existing = await this.prisma.message.findUnique({ where: { clientMessageId: dto.clientMessageId } });
      if (existing) return existing; // Return ACK for existing
    }

    // Create Message in Transaction
    const [message] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: {
          clientMessageId: dto.clientMessageId,
          chatId: chat.id,
          senderProfileId: myProfileId,
          content: dto.content,
          type: 'TEXT'
        }
      }),
      this.prisma.chat.update({
        where: { id: chat.id },
        data: { lastMessageAt: new Date() }
      })
    ]);

    return message;
  }
}
