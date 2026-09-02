import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';

export interface CreatePostDto {
  topicId: string;
  title: string;
  body: string;
  isAnonymous: boolean;
}

export interface CreateCommentDto {
  postId: string;
  parentId?: string;
  body: string;
  isAnonymous: boolean;
}

export interface VoteDto {
  targetType: 'POST' | 'COMMENT';
  targetId: string;
  value: number; // 1 or -1
}

@Injectable()
export class SocialService {
  constructor(private prisma: DatabaseService) {}

  async getTopics() {
    return this.prisma.socialTopic.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  // Format a single item (post or comment) to handle anonymity and calculate user vote
  private formatItemAuthor(item: any, currentUserId: string) {
    if (!item) return null;
    
    // Find if current user voted
    let userVote: 'up' | 'down' | null = null;
    if (item.votes && item.votes.length > 0) {
      const vote = item.votes.find((v: any) => v.userId === currentUserId);
      if (vote) {
        userVote = vote.value === 1 ? 'up' : 'down';
      }
    }

    // Determine author profile
    let authorName = 'Anonymous';
    let authorAvatar = null;
    let authorId = null;

    if (!item.isAnonymous && item.user && item.user.profile) {
      const p = item.user.profile;
      authorName = p.firstName + (p.lastName ? ` ${p.lastName}` : '');
      authorId = item.userId;
      
      // Grab the first photo
      if (p.photos && p.photos.length > 0) {
        // We'll just grab the first string, or if it's JSON grab url
        const photo = p.photos[0] as any;
        authorAvatar = photo.url || (typeof photo === 'string' ? photo : null);
      }
    }

    return {
      ...item,
      user: undefined, // remove raw user object
      votes: undefined, // remove raw votes array
      authorName,
      authorAvatar,
      authorId,
      userVote,
      date: item.createdAt.toISOString().split('T')[0],
      timeAgo: this.timeSince(item.createdAt),
      // for posts
      commentCount: item._count ? item._count.comments : (item.replies ? item.replies.length : 0),
    };
  }

  async getPosts(userId: string, topicId?: string, search?: string) {
    const where: any = {};
    if (topicId) where.topicId = topicId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { body: { contains: search, mode: 'insensitive' } },
      ];
    }

    const posts = await this.prisma.socialPost.findMany({
      where,
      orderBy: [{ voteCount: 'desc' }, { createdAt: 'desc' }],
      include: {
        topic: true,
        user: {
          include: { profile: true },
        },
        votes: {
          where: { userId },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    return posts.map(p => this.formatItemAuthor(p, userId));
  }

  async getPostDetails(userId: string, postId: string) {
    const post = await this.prisma.socialPost.findUnique({
      where: { id: postId },
      include: {
        topic: true,
        user: { include: { profile: true } },
        votes: { where: { userId } },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { include: { profile: true } },
            votes: { where: { userId } },
            replies: true,
          }
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    if (!post) throw new NotFoundException('Post not found');

    const formattedPost = this.formatItemAuthor(post, userId);
    
    // Format comments (simplistic flat format for now, ignoring deep nested replies rendering in this basic structure)
    // If you need nested, you'd recursively format.
    formattedPost.comments = post.comments.map(c => this.formatItemAuthor(c, userId));

    return formattedPost;
  }

  async createPost(userId: string, dto: CreatePostDto) {
    const post = await this.prisma.socialPost.create({
      data: {
        userId,
        topicId: dto.topicId,
        title: dto.title,
        body: dto.body,
        isAnonymous: dto.isAnonymous,
      },
    });
    return post;
  }

  async createComment(userId: string, dto: CreateCommentDto) {
    const comment = await this.prisma.socialComment.create({
      data: {
        userId,
        postId: dto.postId,
        parentId: dto.parentId || null,
        body: dto.body,
        isAnonymous: dto.isAnonymous,
      },
    });
    return comment;
  }

  async vote(userId: string, dto: VoteDto) {
    const { targetType, targetId, value } = dto;
    const isUpvote = value > 0;
    const voteVal = isUpvote ? 1 : -1;

    // Check existing vote
    const existingVote = await this.prisma.socialVote.findFirst({
      where: {
        userId,
        ...(targetType === 'POST' ? { postId: targetId } : { commentId: targetId }),
      },
    });

    return this.prisma.$transaction(async (tx) => {
      let voteDiff = 0;

      if (existingVote) {
        if (existingVote.value === voteVal) {
          // Un-vote
          await tx.socialVote.delete({ where: { id: existingVote.id } });
          voteDiff = -voteVal;
        } else {
          // Switch vote (e.g. from -1 to 1 means a +2 change)
          await tx.socialVote.update({
            where: { id: existingVote.id },
            data: { value: voteVal },
          });
          voteDiff = voteVal * 2;
        }
      } else {
        // New vote
        await tx.socialVote.create({
          data: {
            userId,
            value: voteVal,
            ...(targetType === 'POST' ? { postId: targetId } : { commentId: targetId }),
          },
        });
        voteDiff = voteVal;
      }

      // Update parent count
      if (targetType === 'POST') {
        await tx.socialPost.update({
          where: { id: targetId },
          data: { voteCount: { increment: voteDiff } },
        });
      } else {
        await tx.socialComment.update({
          where: { id: targetId },
          data: { voteCount: { increment: voteDiff } },
        });
      }

      return { voteDiff };
    });
  }

  // Helper for simple "timeAgo"
  private timeSince(date: Date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + 'y ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + 'mo ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'd ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'h ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + 'm ago';
    return Math.floor(seconds) + 's ago';
  }
}
