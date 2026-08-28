import { z } from 'zod';

const serverOrHttpUrl = z
  .string()
  .url('Invalid URL')
  .or(z.string().regex(/^\/uploads\/\S+$/, 'Invalid image URL'));

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Nickname must be at least 2 characters').max(50, 'Nickname is too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nickname must be at least 2 characters').max(50, 'Nickname is too long').optional(),
  image: serverOrHttpUrl.optional().or(z.literal('')).nullable(),
  bio: z.string().max(500, 'Bio is too long').optional(),
});

export const appreciationSchema = z.object({
  memberId: z.string().min(1, 'Member selection is required'),
  content: z.string().min(10, 'Message must be at least 10 characters long').max(1000, 'Message is too long'),
});

export const postSchema = z.object({
  type: z.string().min(1, 'Post type is required'),
  title: z.string().max(200, 'Title is too long').optional().default(''),
  content: z.string().min(10, 'Post must be at least 10 characters long').max(2000, 'Post is too long'),
  memberId: z.string().optional().nullable(),
  imageUrl: serverOrHttpUrl.optional().or(z.literal('')),
});

export const storySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long').max(100, 'Title is too long'),
  content: z.string().min(20, 'Story must be at least 20 characters long').max(5000, 'Story is too long'),
  category: z.enum(['Personal Journey', 'Artistic Inspiration', 'Community Kindness', 'Overcoming Hardship']),
});

export const reportSchema = z.object({
  reason: z.string().min(5, 'Please provide a reason for reporting').max(500, 'Reason is too long'),
  contentType: z.enum(['appreciation', 'post', 'story', 'comment', 'letter', 'photo', 'milestone']),
  contentId: z.string().min(1),
  contentSnippet: z.string().max(300).optional().nullable(),
});

export const letterSchema = z.object({
  memberId: z.string().optional(),
  title: z.string().min(2, 'Title must be at least 2 characters').max(100, 'Title is too long'),
  body: z.string().min(10, 'Body must be at least 10 characters').max(5000, 'Body is too long'),
  imageUrl: serverOrHttpUrl.optional().or(z.literal('')),
  visibility: z.enum(['shared', 'private']).default('shared'),
});

export const photoSchema = z.object({
  memberSlug: z.string().min(1, 'Member selection is required'),
  url: serverOrHttpUrl,
  caption: z.string().max(300, 'Caption is too long').optional(),
  category: z.string().default('Stage'),
  credit: z.string().max(100, 'Credit is too long').optional(),
});

export const milestoneSchema = z.object({
  memberId: z.string().optional().nullable(),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description is too long'),
  eventDate: z.string(),
  category: z.string().default('Milestone'),
  sourceUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export const targetIdSchema = z.object({
  targetUserId: z.string().min(1, 'Target user ID is required'),
});

export const likeSchema = z.object({
  id: z.string().min(1, 'Target ID is required'),
});
