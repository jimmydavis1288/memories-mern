import express from 'express';

import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  likePost,
  unlikePost,
  updatePost,
} from '../controllers/posts.js';
import { optionalAuthentication, requireAuthentication } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { emptyBodySchema } from '../validators/likes.js';
import {
  createPostSchema,
  postIdSchema,
  updatePostSchema,
} from '../validators/posts.js';
import { emptyQuerySchema } from '../validators/auth.js';

const router = express.Router();

router.use(optionalAuthentication);
router.use(validate({ query: emptyQuerySchema }));

router.get('/', getPosts);
router.post('/', requireAuthentication, validate({ body: createPostSchema.shape.body }), createPost);
router.get('/:id', validate({ params: postIdSchema }), getPost);
router.patch('/:id', requireAuthentication, validate({ params: postIdSchema, body: updatePostSchema.shape.body }), updatePost);
router.delete('/:id', requireAuthentication, validate({ params: postIdSchema }), deletePost);
router.patch('/:id/likePost', requireAuthentication, validate({
  params: postIdSchema,
  body: emptyBodySchema,
}), likePost);
router.delete('/:id/likePost', requireAuthentication, validate({
  params: postIdSchema,
  body: emptyBodySchema,
}), unlikePost);

export default router;