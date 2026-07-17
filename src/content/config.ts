import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    category: z.enum(['shiptalk', 'sidequest', 'wanderlog']),
    // field  = SE / work life
    // log    = passtimes / hobbies / learning-in-public
    // route  = travel
    excerpt: z.string(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { blog };
