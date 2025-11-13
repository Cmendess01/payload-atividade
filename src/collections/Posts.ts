import { CollectionConfig, AccessArgs } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
  },

access: {
  read: () => true, // todos podem ler

  create: ({ req }: AccessArgs) => {
    if (!req.user) return false
    const user = req.user as { role: string }
    return ['admin', 'writer'].includes(user.role)
  },

  update: ({ req }: AccessArgs) => {
    if (!req.user) return false
    const user = req.user as { role: string }
    return user.role === 'admin'
  },

  delete: ({ req }: AccessArgs) => {
    if (!req.user) return false
    const user = req.user as { role: string }
    return user.role === 'admin'
  },
},

  fields: [
    {
      name: 'title',
      label: 'Título',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      label: 'Conteúdo',
      type: 'richText',
      required: true,
    },
    {
      name: 'author',
      label: 'Autor',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: { readOnly: true }, // não editável
    },
    {
      name: 'tags',
      label: 'Tags',
      type: 'array',
      fields: [
        { name: 'tag', type: 'text' },
      ],
    },
    {
      name: 'image',
      label: 'Imagem',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'views',
      label: 'Visualizações',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
    },
  ],

  hooks: {
beforeValidate: [
  ({ data, req, operation }) => {
    if (operation === 'create' && req.user) {
      const safeData = data || {}
      safeData.author = req.user.id
      return safeData
    }
    return data
  },
],

  },
}
