import { z } from 'zod';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const allowedImage = /^data:image\/(?:png|jpeg|webp|gif);base64,([A-Za-z0-9+/]+={0,2})$/;

const matchesImageType = (mimeType, image) => {
  if (mimeType === 'image/png') {
    return image.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }

  if (mimeType === 'image/jpeg') {
    return image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff;
  }

  if (mimeType === 'image/gif') {
    return image.subarray(0, 6).toString('ascii').match(/^GIF8[79]a$/);
  }

  return mimeType === 'image/webp'
    && image.subarray(0, 4).toString('ascii') === 'RIFF'
    && image.subarray(8, 12).toString('ascii') === 'WEBP';
};

const selectedFile = z.string().max(7_000_000).optional().nullable().refine((value) => {
  if (!value) {
    return true;
  }

  const match = allowedImage.exec(value);
  if (!match) {
    return false;
  }

  const encoded = match[1];
  if (encoded.length % 4 !== 0) {
    return false;
  }

  const image = Buffer.from(encoded, 'base64');
  return image.length <= MAX_IMAGE_BYTES && matchesImageType(match[0].slice(5, match[0].indexOf(';')), image);
}, 'Image must be a PNG, JPEG, WebP, or GIF no larger than 5 MB.');

const tags = z.array(z.string().trim().min(1).max(30))
  .max(10, 'A post may have at most 10 tags.');

export const postIdSchema = z.object({
  id: z.string().min(1).max(64).regex(/^[A-Za-z0-9_-]+$/, 'Post ID is invalid.'),
}).strict();

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Title is required.').max(120),
    message: z.string().trim().min(1, 'Message is required.').max(10_000),
    tags: tags.default([]),
    selectedFile,
  }).strict(),
});

export const updatePostSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(120).optional(),
    message: z.string().trim().min(1).max(10_000).optional(),
    tags: tags.optional(),
    selectedFile,
  }).strict().refine((body) => Object.keys(body).length > 0, 'At least one post field is required.'),
});
