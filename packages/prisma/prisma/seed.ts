import { PrismaClient, GroupRole, OAuthProvider } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const placeholder = await prisma.user.upsert({
    where: {
      oauthProvider_oauthId: {
        oauthProvider: OAuthProvider.GOOGLE,
        oauthId: 'dev-seed-owner',
      },
    },
    update: {},
    create: {
      email: 'owner@inos.local',
      nickname: '개발 관리자',
      oauthProvider: OAuthProvider.GOOGLE,
      oauthId: 'dev-seed-owner',
    },
  });

  let group = await prisma.group.findFirst({ where: { name: '개발자 모임' } });
  if (!group) {
    group = await prisma.group.create({
      data: {
        name: '개발자 모임',
        description: 'INOS 개발용 시드 오가니제이션',
        greeting: '함께 읽고, 보고, 생각해요.',
        ownerId: placeholder.id,
        members: {
          create: { userId: placeholder.id, role: GroupRole.OWNER },
        },
      },
    });
  }

  const attachEmail = process.env.SEED_ATTACH_EMAIL;
  if (attachEmail) {
    const realUser = await prisma.user.findUnique({
      where: { email: attachEmail },
    });
    if (realUser) {
      await prisma.$transaction([
        prisma.group.update({
          where: { id: group.id },
          data: { ownerId: realUser.id },
        }),
        prisma.groupMember.upsert({
          where: {
            groupId_userId: { groupId: group.id, userId: realUser.id },
          },
          update: { role: GroupRole.OWNER },
          create: {
            groupId: group.id,
            userId: realUser.id,
            role: GroupRole.OWNER,
          },
        }),
        prisma.groupMember.updateMany({
          where: { groupId: group.id, userId: placeholder.id },
          data: { role: GroupRole.MEMBER },
        }),
      ]);
      console.log(`✓ ${realUser.email} 을(를) ${group.name} OWNER 로 지정`);
    } else {
      console.log(
        `⚠ ${attachEmail} 유저가 아직 없음. Google 로그인 후 다시 실행하세요.`,
      );
    }
  }

  console.log(`✓ Group seeded: ${group.name} (${group.id})`);
  console.log('');
  console.log('👉 첫 사용: 브라우저에서 Google 로그인 후 다시 seed 실행');
  console.log('   SEED_ATTACH_EMAIL=your@gmail.com pnpm --filter @inos/prisma prisma:seed');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
