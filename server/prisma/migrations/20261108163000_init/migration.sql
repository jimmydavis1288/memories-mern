-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "posts" (
    "_id" TEXT NOT NULL,
    "title" TEXT,
    "message" TEXT,
    "creator" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "selectedFile" TEXT,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("_id")
);
