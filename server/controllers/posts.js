import { prisma } from '../lib/prisma.js';
import { HttpError } from '../utils/httpError.js';

const postInclude = (userId) => ({
  user: { select: { id: true, fullName: true } },
  likes: {
    where: userId ? { userId } : { userId: '__anonymous__' },
    select: { userId: true },
  },
});

const toApiPost = (post) => ({
  _id: post.id,
  title: post.title,
  message: post.message,
  creator: post.user?.fullName || post.creator || '',
  tags: post.tags,
  selectedFile: post.selectedFile,
  likeCount: post.likeCount,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
  user: post.user,
  likedByMe: post.likes.length > 0,
});

const findPostOrThrow = async (id) => {
  const post = await prisma.post.findUnique({ where: { id } });

  if (!post) {
    throw new HttpError(404, 'Memory not found.');
  }

  return post;
};

const assertOwnership = (post, userId) => {
  if (post.userId !== userId) {
    throw new HttpError(403, 'You can only change your own memories.');
  }
};

const sendError = (next, error) => {
  if (error.code === 'P2025') {
    return next(new HttpError(404, 'Memory not found.'));
  }

  return next(error);
};

export const getPosts = async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: postInclude(req.user?.id),
    });

    res.status(200).json(posts.map(toApiPost));
  } catch (error) {
    next(error);
  }
};

export const getPost = async (req, res, next) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: postInclude(req.user?.id),
    });

    if (!post) {
      throw new HttpError(404, 'Memory not found.');
    }

    res.status(200).json(toApiPost(post));
  } catch (error) {
    next(error);
  }
};

export const createPost = async (req, res, next) => {
  try {
    const post = await prisma.post.create({
      data: {
        ...req.body,
        creator: req.user.fullName,
        userId: req.user.id,
      },
      include: postInclude(req.user.id),
    });

    res.status(201).json(toApiPost(post));
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const existingPost = await findPostOrThrow(req.params.id);
    assertOwnership(existingPost, req.user.id);

    const post = await prisma.post.update({
      where: { id: req.params.id, userId: req.user.id },
      data: req.body,
      include: postInclude(req.user.id),
    });

    res.status(200).json(toApiPost(post));
  } catch (error) {
    sendError(next, error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const existingPost = await findPostOrThrow(req.params.id);
    assertOwnership(existingPost, req.user.id);
    await prisma.post.delete({ where: { id: req.params.id, userId: req.user.id } });

    res.status(200).json({ message: 'Post deleted successfully.' });
  } catch (error) {
    sendError(next, error);
  }
};

export const likePost = async (req, res, next) => {
  try {
    const post = await prisma.$transaction(async (transaction) => {
      await findPostOrThrow(req.params.id);
      const like = await transaction.like.createMany({
        data: { userId: req.user.id, postId: req.params.id },
        skipDuplicates: true,
      });

      if (like.count > 0) {
        await transaction.post.update({
          where: { id: req.params.id },
          data: { likeCount: { increment: 1 } },
        });
      }

      return transaction.post.findUnique({
        where: { id: req.params.id },
        include: postInclude(req.user.id),
      });
    });

    res.status(200).json(toApiPost(post));
  } catch (error) {
    sendError(next, error);
  }
};

export const unlikePost = async (req, res, next) => {
  try {
    const post = await prisma.$transaction(async (transaction) => {
      await findPostOrThrow(req.params.id);
      const like = await transaction.like.deleteMany({
        where: { userId: req.user.id, postId: req.params.id },
      });

      if (like.count > 0) {
        await transaction.post.update({
          where: { id: req.params.id },
          data: { likeCount: { decrement: 1 } },
        });
      }

      return transaction.post.findUnique({
        where: { id: req.params.id },
        include: postInclude(req.user.id),
      });
    });

    res.status(200).json(toApiPost(post));
  } catch (error) {
    sendError(next, error);
  }
};
