import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  
  admin: {
    useAsTitle: 'filename',
  },
  
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  
  fields: [
    {
      name: 'alt',
      label: 'Texto Alternativo',
      type: 'text',
      required: true,
      admin: {
        description: 'Descrição da imagem para acessibilidade',
      },
    },
  ],
  
  upload: {
    staticDir: 'media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        height: 300,
        position: 'centre',
      },
      {
        name: 'square',
        width: 500,
        height: 500,
        position: 'centre',
      },
      {
        name: 'fullSize',
        width: 1280,
        height: 720,
        position: 'centre',
      },
    ],
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
  
  timestamps: true,
}