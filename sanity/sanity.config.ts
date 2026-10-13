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

            S.listItem()
              .title('Chatbot')
              .id('chatbot')
              .child(
                S.document()
                  .schemaType('chatbot')
                  .documentId('chatbot')
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

            ...S.documentTypeListItems().filter(
              (listItem) =>
                !['shop', 'projects', 'about', 'chatbot'].includes(
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
      prev.filter((item) => !['about', 'chatbot'].includes(item.templateId ?? '')),

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