import { z, defineCollection } from 'astro:content';
import { PHOTO_NAMES, PHOTO_TAGS } from '../data/photoTypes.generated';

const standardOptions = {
    title: z.string(),
    startdate: z.date().optional(),
    date: z.date().or(z.enum(["ongoing"])),
}

const textBodyOptions = {
    columns: z.number().int().nonnegative().lte(2).default(2),
    startIcon: z.boolean().default(true),
    endIcon: z.boolean().default(true),
    hyphens: z.boolean().default(false),

    cover: z.enum(PHOTO_NAMES).or(z.string()).optional(),
    coverCaption: z.string().optional(),
}


const photo = defineCollection({
    type: 'content',
    schema: z.object({
        ...standardOptions,
        ...textBodyOptions,

        // photos
        names: z.array(z.enum(PHOTO_NAMES)).optional(),
        tags: z.array(z.enum(PHOTO_TAGS)).optional(),
        excludeNames: z.array(z.enum(PHOTO_NAMES)).optional(),
        excludeTags: z.array(z.enum(PHOTO_TAGS)).optional(),
    }),
});

const text = defineCollection({
    type: 'content',
    schema: z.object({
        ...standardOptions,
        ...textBodyOptions,
    })
})

const homepage = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        icon: z.string(),
        href: z.string().or(z.boolean()).optional(),
        bottomLine: z.string().optional(),
        smallTitle: z.boolean().default(false),
        titleLigatures: z.boolean().default(false),
        iconSpace: z.enum(["title", "bottom", "both"]).optional(),
    })
});

export const collections = { photo, text, homepage };