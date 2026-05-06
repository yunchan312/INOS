import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UserContentStatus, GroupContentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TmdbService } from './external/tmdb.service';
import { KakaoBookService } from './external/kakao-book.service';
import {
  SearchContentDto,
  ContentType,
  ContentResponseDto,
  GroupContentResponseDto,
  UserContentResponseDto,
  UpdateGroupContentStatusDto,
  UpdateUserContentDto,
} from './dto/content.dto';

@Injectable()
export class ContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tmdb: TmdbService,
    private readonly kakao: KakaoBookService,
  ) {}

  async search(dto: SearchContentDto): Promise<ContentResponseDto[]> {
    const limit = dto.limit ?? 20;

    if (!dto.query) {
      return this.prisma.content.findMany({
        where: dto.type ? { type: dto.type } : undefined,
        take: limit,
        select: this.contentSelect(),
      });
    }

    const dbResults = await this.prisma.content.findMany({
      where: {
        ...(dto.type && { type: dto.type }),
        title: { contains: dto.query, mode: 'insensitive' },
      },
      take: limit,
      select: this.contentSelect(),
    });

    if (dbResults.length > 0) return dbResults;

    return this.searchExternal(dto.query, dto.type, limit);
  }

  async findContent(contentId: string): Promise<ContentResponseDto> {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
      select: this.contentSelect(),
    });
    if (!content) throw new NotFoundException('콘텐츠를 찾을 수 없습니다');
    return content;
  }

  async getUserContents(userId: string): Promise<UserContentResponseDto[]> {
    return this.prisma.userContent.findMany({
      where: { userId },
      select: {
        id: true,
        contentId: true,
        status: true,
        createdAt: true,
        content: { select: this.contentSelect() },
      },
    });
  }

  async addUserContent(userId: string, contentId: string): Promise<UserContentResponseDto> {
    const content = await this.prisma.content.findUnique({ where: { id: contentId } });
    if (!content) throw new NotFoundException('콘텐츠를 찾을 수 없습니다');

    return this.prisma.userContent.upsert({
      where: { userId_contentId: { userId, contentId } },
      update: {},
      create: { userId, contentId, status: 'WISHLIST' },
      select: {
        id: true,
        contentId: true,
        status: true,
        createdAt: true,
        content: { select: this.contentSelect() },
      },
    });
  }

  async updateUserContent(
    userId: string,
    userContentId: string,
    dto: UpdateUserContentDto,
  ): Promise<void> {
    const record = await this.prisma.userContent.findFirst({
      where: { id: userContentId, userId },
    });
    if (!record) throw new NotFoundException('유저 콘텐츠를 찾을 수 없습니다');

    if (dto.status !== undefined) {
      await this.prisma.userContent.update({
        where: { id: userContentId },
        data: { status: dto.status as UserContentStatus },
      });
    }
  }

  async getGroupContents(groupId: string): Promise<GroupContentResponseDto[]> {
    const results = await this.prisma.groupContent.findMany({
      where: { groupId },
      select: {
        id: true,
        groupId: true,
        contentId: true,
        status: true,
        selectedAt: true,
        content: { select: this.contentSelect() },
        votes: { select: { score: true } },
      },
    });

    return results.map((gc) => {
      const voteCount = gc.votes.length;
      const avgScore =
        voteCount > 0
          ? gc.votes.reduce((sum, v) => sum + v.score, 0) / voteCount
          : 0;
      return {
        id: gc.id,
        groupId: gc.groupId,
        contentId: gc.contentId,
        status: gc.status,
        selectedAt: gc.selectedAt,
        content: gc.content,
        avgScore,
        voteCount,
      };
    });
  }

  async addGroupContent(groupId: string, contentId: string): Promise<GroupContentResponseDto> {
    const content = await this.prisma.content.findUnique({ where: { id: contentId } });
    if (!content) throw new NotFoundException('콘텐츠를 찾을 수 없습니다');

    const gc = await this.prisma.groupContent.upsert({
      where: { groupId_contentId: { groupId, contentId } },
      update: {},
      create: { groupId, contentId, status: 'VOTING' },
      select: {
        id: true,
        groupId: true,
        contentId: true,
        status: true,
        selectedAt: true,
        content: { select: this.contentSelect() },
        votes: { select: { score: true } },
      },
    });

    const voteCount = gc.votes.length;
    const avgScore =
      voteCount > 0 ? gc.votes.reduce((sum, v) => sum + v.score, 0) / voteCount : 0;

    return { ...gc, avgScore, voteCount };
  }

  async updateGroupContentStatus(
    groupId: string,
    gcId: string,
    dto: UpdateGroupContentStatusDto,
  ): Promise<void> {
    const gc = await this.prisma.groupContent.findFirst({
      where: { id: gcId, groupId },
    });
    if (!gc) throw new NotFoundException('그룹 콘텐츠를 찾을 수 없습니다');

    await this.prisma.groupContent.update({
      where: { id: gcId },
      data: { status: dto.status as GroupContentStatus },
    });
  }

  async voteGroupContent(
    groupId: string,
    userId: string,
    groupContentId: string,
    score: number,
  ): Promise<void> {
    const groupContent = await this.prisma.groupContent.findFirst({
      where: { id: groupContentId, groupId },
    });
    if (!groupContent) throw new NotFoundException('그룹 콘텐츠를 찾을 수 없습니다');

    const existing = await this.prisma.contentVote.findUnique({
      where: { groupContentId_userId: { groupContentId, userId } },
    });
    if (existing) throw new ConflictException('이미 투표했습니다');

    await this.prisma.contentVote.create({
      data: { groupContentId, userId, score },
    });
  }

  private async searchExternal(
    query: string,
    type: ContentType | undefined,
    limit: number,
  ): Promise<ContentResponseDto[]> {
    const results: ContentResponseDto[] = [];

    if (!type || type === ContentType.MOVIE) {
      const movies = await this.tmdb.searchMovies(query, limit);
      for (const m of movies) {
        const content = await this.prisma.content.upsert({
          where: { source_sourceId: { source: 'TMDB', sourceId: m.externalId } },
          update: {},
          create: {
            title: m.title,
            type: 'MOVIE',
            creator: m.creator ?? '',
            synopsis: m.synopsis,
            releaseYear: m.releaseYear,
            thumbnailUrl: m.thumbnailUrl,
            source: 'TMDB',
            sourceId: m.externalId,
          },
          select: this.contentSelect(),
        });
        results.push(content);
      }
    }

    if (!type || type === ContentType.BOOK) {
      const books = await this.kakao.searchBooks(query, limit);
      for (const b of books) {
        const content = await this.prisma.content.upsert({
          where: { source_sourceId: { source: 'KAKAO', sourceId: b.externalId } },
          update: {},
          create: {
            title: b.title,
            type: 'BOOK',
            creator: b.creator ?? '',
            synopsis: b.synopsis,
            releaseYear: b.releaseYear,
            thumbnailUrl: b.thumbnailUrl,
            source: 'KAKAO',
            sourceId: b.externalId,
          },
          select: this.contentSelect(),
        });
        results.push(content);
      }
    }

    return results;
  }

  private contentSelect() {
    return {
      id: true,
      title: true,
      type: true,
      creator: true,
      releaseYear: true,
      thumbnailUrl: true,
      synopsis: true,
    } as const;
  }
}
