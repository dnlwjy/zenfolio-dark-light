import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import { schemaTypes } from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'my portfolio cms',
  projectId: 'irfb1i5g',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('About')
              .id('about')
              .child(
                S.document()
                  .schemaType('about')
                  .documentId('about')
              ),

            orderableDocumentListDeskItem({
              type: 'shop',
              title: 'Builds',
              S,
              context,
            }),

            orderableDocumentListDeskItem({
              type: 'projects',
              title: 'Case Studies',
              S,
              context,
            }),

            orderableDocumentListDeskItem({
              type: 'uses',
              title: 'Uses',
              S,
              context,
            }),

            ...S.documentTypeListItems().filter(
              (listItem) =>
                !['shop', 'projects', 'about', 'uses'].includes(
                  listItem.getId() || ''
                )
            ),
          ])
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    newDocumentOptions: (prev) =>
      prev.filter((item) => item.templateId !== 'about'),

    actions: (prev, context) => {
      if (context.schemaType === 'about') {
        return prev.filter(
          ({ action }) => action !== 'delete'
        )
      }

      return prev
    },
  },
})