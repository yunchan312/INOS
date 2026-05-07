import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { UserContentStatus, GroupContentStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { TmdbService } from "./external/tmdb.service";
import { GoogleBooksService } from "./external/google-books.service";
import {
  SearchContentDto,
  ListContentDto,
  ContentType,
  ContentResponseDto,
  ContentListResponseDto,
  GroupContentResponseDto,
  UserContentResponseDto,
  UpdateGroupContentStatusDto,
  UpdateUserContentDto,
} from "./dto/content.dto";

@Injectable()
export class ContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tmdb: TmdbService,
    private readonly googleBooks: GoogleBooksService,
  ) {}

  private static readonly LIST_PAGE_SIZE = 50;
  private static readonly TMDB_PAGE_SIZE = 20;
  private static readonly GOOGLE_PAGE_SIZE = 50;

  async list(dto: ListContentDto): Promise<ContentListResponseDto> {
    const type = dto.type ?? ContentType.MOVIE;
    const limit = ContentService.LIST_PAGE_SIZE;

    await this.ensureSeeded(type, limit, dto.cursor);

    const rows = await this.prisma.content.findMany({
      where: { type },
      take: limit + 1,
      ...(dto.cursor ? { cursor: { id: dto.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "asc" },
      select: this.contentSelect(),
    });

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
  }

  private async ensureSeeded(
    type: ContentType,
    needed: number,
    cursor?: string,
  ): Promise<void> {
    // 커서가 있으면 이미 앞 페이지 데이터는 있으므로, 전체 count로 부족 여부 판단
    const dbCount = await this.prisma.content.count({ where: { type } });
    if (dbCount >= needed) return;

    const shortage = needed - dbCount;
    const pagesNeeded = Math.ceil(
      shortage /
        (type === ContentType.MOVIE
          ? ContentService.TMDB_PAGE_SIZE
          : ContentService.GOOGLE_PAGE_SIZE),
    );
    const startPage =
      Math.floor(
        dbCount /
          (type === ContentType.MOVIE
            ? ContentService.TMDB_PAGE_SIZE
            : ContentService.GOOGLE_PAGE_SIZE),
      ) + 1;

    for (let p = startPage; p < startPage + pagesNeeded; p++) {
      const externals =
        type === ContentType.MOVIE
          ? await this.tmdb.fetchPopularMovies(p)
          : await this.googleBooks.fetchPopularBooks(p);

      await Promise.all(
        externals.map((item) =>
          this.prisma.content.upsert({
            where: {
              source_sourceId: {
                source: type === ContentType.MOVIE ? "TMDB" : "GOOGLE_BOOKS",
                sourceId: item.externalId,
              },
            },
            update: {},
            create: {
              title: item.title,
              type,
              creator: item.creator ?? "",
              synopsis: item.synopsis,
              releaseYear: item.releaseYear,
              thumbnailUrl: item.thumbnailUrl,
              source: type === ContentType.MOVIE ? "TMDB" : "GOOGLE_BOOKS",
              sourceId: item.externalId,
            },
          }),
        ),
      );
    }
  }

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
        title: { contains: dto.query, mode: "insensitive" },
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
    if (!content) throw new NotFoundException("콘텐츠를 찾을 수 없습니다");
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

  async addUserContent(
    userId: string,
    contentId: string,
  ): Promise<UserContentResponseDto> {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
    });
    if (!content) throw new NotFoundException("콘텐츠를 찾을 수 없습니다");

    return this.prisma.userContent.upsert({
      where: { userId_contentId: { userId, contentId } },
      update: {},
      create: { userId, contentId, status: "WISHLIST" },
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
    if (!record) throw new NotFoundException("유저 콘텐츠를 찾을 수 없습니다");

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

  async addGroupContent(
    groupId: string,
    contentId: string,
  ): Promise<GroupContentResponseDto> {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
    });
    if (!content) throw new NotFoundException("콘텐츠를 찾을 수 없습니다");

    const gc = await this.prisma.groupContent.upsert({
      where: { groupId_contentId: { groupId, contentId } },
      update: {},
      create: { groupId, contentId, status: "VOTING" },
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
      voteCount > 0
        ? gc.votes.reduce((sum, v) => sum + v.score, 0) / voteCount
        : 0;

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
    if (!gc) throw new NotFoundException("그룹 콘텐츠를 찾을 수 없습니다");

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
    if (!groupContent)
      throw new NotFoundException("그룹 콘텐츠를 찾을 수 없습니다");

    const existing = await this.prisma.contentVote.findUnique({
      where: { groupContentId_userId: { groupContentId, userId } },
    });
    if (existing) throw new ConflictException("이미 투표했습니다");

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
          where: {
            source_sourceId: { source: "TMDB", sourceId: m.externalId },
          },
          update: {},
          create: {
            title: m.title,
            type: "MOVIE",
            creator: m.creator ?? "",
            synopsis: m.synopsis,
            releaseYear: m.releaseYear,
            thumbnailUrl: m.thumbnailUrl,
            source: "TMDB",
            sourceId: m.externalId,
          },
          select: this.contentSelect(),
        });
        results.push(content);
      }
    }

    if (!type || type === ContentType.BOOK) {
      const books = await this.googleBooks.searchBooks(query, limit);
      for (const b of books) {
        const content = await this.prisma.content.upsert({
          where: {
            source_sourceId: { source: "GOOGLE_BOOKS", sourceId: b.externalId },
          },
          update: {},
          create: {
            title: b.title,
            type: "BOOK",
            creator: b.creator ?? "",
            synopsis: b.synopsis,
            releaseYear: b.releaseYear,
            thumbnailUrl: b.thumbnailUrl,
            source: "GOOGLE_BOOKS",
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
