import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    author: z.string(),
    publishDate: z.coerce.date(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    readTime: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
