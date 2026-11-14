import { defineType } from 'sanity'

export const cookiePolicy = defineType({
  name: 'cookiePolicy',
  title: 'Cookie Policy',
  type: 'document',
  fields: [
    {
      name: 'items',
      title: 'The data we collect',
      type: 'array',
      validation: (Rule) => Rule.required().min(1),
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'description',
            },
          },
        },
      ],
    },
  ],
  preview: {
    prepare() {
      return { title: 'Cookie Policy' }
    },
  },
})
