import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  GroupPostDto,
  GroupPostLikeDto,
  GroupPostListDto,
  GroupPostSummaryDto,
} from '@inos/types';
import { PrismaService } from '../../prisma/prisma.service';
import { GroupService } from '../group/group.service';
import { CreateGroupPostDto, UpdateGroupPostDto } from './dto/board.dto';

export const POSTS_PAGE_SIZE = 5;

type PostWithMeta = {
  id: string;
  groupId: string;
  authorId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: { nickname: string };
  _count: { likes: number };
  likes: { id: string }[];
};

@Injectable()
export class BoardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupService: GroupService,
  ) {}

  async list(
    groupId: string,
    userId: string,
    page: number,
  ): Promise<GroupPostListDto> {
    await this.groupService.assertMember(groupId, userId);
    const safePage = Math.max(1, page);

    const [total, posts] = await Promise.all([
      this.prisma.groupPost.count({ where: { groupId } }),
      this.prisma.groupPost.findMany({
        where: { groupId },
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * POSTS_PAGE_SIZE,
        take: POSTS_PAGE_SIZE,
        include: this.postInclude(userId),
      }),
    ]);

    return {
      items: posts.map((p) => this.toSummary(p)),
      total,
      page: safePage,
      pageSize: POSTS_PAGE_SIZE,
    };
  }

  async findOne(
    groupId: string,
    postId: string,
    userId: string,
  ): Promise<GroupPostDto> {
    await this.groupService.assertMember(groupId, userId);
    const post = await this.loadPost(groupId, postId, userId);
    return this.toDetail(post);
  }

  async create(
    groupId: string,
    userId: string,
    dto: CreateGroupPostDto,
  ): Promise<GroupPostDto> {
    await this.groupService.assertMember(groupId, userId);
    const post = await this.prisma.groupPost.create({
      data: {
        groupId,
        authorId: userId,
        title: dto.title.trim(),
        content: dto.content,
      },
      include: this.postInclude(userId),
    });
    return this.toDetail(post);
  }

  async update(
    groupId: string,
    postId: string,
    userId: string,
    dto: UpdateGroupPostDto,
  ): Promise<GroupPostDto> {
    await this.assertCanManage(groupId, postId, userId);
    const post = await this.prisma.groupPost.update({
      where: { id: postId },
      data: {
        title: dto.title?.trim(),
        content: dto.content,
      },
      include: this.postInclude(userId),
    });
    return this.toDetail(post);
  }

  async remove(groupId: string, postId: string, userId: string): Promise<void> {
    await this.assertCanManage(groupId, postId, userId);
    await this.prisma.groupPost.delete({ where: { id: postId } });
  }

  async toggleLike(
    groupId: string,
    postId: string,
    userId: string,
  ): Promise<GroupPostLikeDto> {
    await this.groupService.assertMember(groupId, userId);
    await this.loadPost(groupId, postId, userId);

    const existing = await this.prisma.groupPostLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });
    if (existing) {
      await this.prisma.groupPostLike.delete({ where: { id: existing.id } });
    } else {
      await this.prisma.groupPostLike.create({ data: { postId, userId } });
    }

    const likeCount = await this.prisma.groupPostLike.count({ where: { postId } });
    return { likeCount, likedByMe: !existing };
  }

  // 수정/삭제 권한 — 작성자 본인 또는 오가니제이션 소유자
  private async assertCanManage(
    groupId: string,
    postId: string,
    userId: string,
  ): Promise<void> {
    await this.groupService.assertMember(groupId, userId);
    const post = await this.prisma.groupPost.findUnique({
      where: { id: postId },
      select: { groupId: true, authorId: true, group: { select: { ownerId: true } } },
    });
    if (!post || post.groupId !== groupId) {
      throw new NotFoundException('글을 찾을 수 없습니다');
    }
    if (post.authorId !== userId && post.group.ownerId !== userId) {
      throw new ForbiddenException('작성자 또는 오가니제이션 소유자만 가능합니다');
    }
  }

  private async loadPost(
    groupId: string,
    postId: string,
    userId: string,
  ): Promise<PostWithMeta> {
    const post = await this.prisma.groupPost.findUnique({
      where: { id: postId },
      include: this.postInclude(userId),
    });
    if (!post || post.groupId !== groupId) {
      throw new NotFoundException('글을 찾을 수 없습니다');
    }
    return post;
  }

  private postInclude(userId: string) {
    return {
      author: { select: { nickname: true } },
      _count: { select: { likes: true } },
      likes: { where: { userId }, select: { id: true }, take: 1 },
    } as const;
  }

  private toSummary(post: PostWithMeta): GroupPostSummaryDto {
    return {
      id: post.id,
      groupId: post.groupId,
      authorId: post.authorId,
      authorNickname: post.author.nickname,
      title: post.title,
      likeCount: post._count.likes,
      likedByMe: post.likes.length > 0,
      createdAt: post.createdAt.toISOString(),
    };
  }

  private toDetail(post: PostWithMeta): GroupPostDto {
    return {
      ...this.toSummary(post),
      content: post.content,
      updatedAt: post.updatedAt.toISOString(),
    };
  }
}
