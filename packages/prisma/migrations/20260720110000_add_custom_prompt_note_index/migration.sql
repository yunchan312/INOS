-- AlterTable: 자체 발제 노트 키 고정값 (기존 행은 생성순 100번대 백필)
ALTER TABLE "discussion_custom_prompts" ADD COLUMN "noteIndex" INTEGER;

UPDATE "discussion_custom_prompts" p
SET "noteIndex" = sub.rn + 99
FROM (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY "discussionId", "promptKind" ORDER BY "createdAt", id
  ) AS rn
  FROM "discussion_custom_prompts"
) sub
WHERE p.id = sub.id;

ALTER TABLE "discussion_custom_prompts" ALTER COLUMN "noteIndex" SET NOT NULL;
