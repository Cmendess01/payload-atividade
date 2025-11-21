import { CollectionConfig, Where } from 'payload'

export const Posts: CollectionConfig = {
    slug: 'posts',
    admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'author', 'status', 'views', 'createdAt'],
    },

    access: {
        read: ({ req }) => {
            const user = req.user
            const where: Where = {}

            if (!user) {
                    where.status = {
                        equals: 'published'
                }
                return where
            }

            

            if (user.role === 'writer') {
                
                    where.or = [
                        {
                            author: {
                                equals: String(user.id),
                            },
                        },
                        {
                            status: {
                                equals: 'published',
                            },
                        },
                    ]
                return where

        
                
            }

            return {
                status: {
                    equals: 'published',
                },
            }
        },

        create: ({ req }) => {
            if (!req.user) return false
            return ['admin', 'writer'].includes(req.user.role as string)
        },

        update: ({ req }) => {
            if (!req.user) return false
            return req.user.role === 'admin'
        },

        delete: ({ req }) => {
            if (!req.user) return false
            return req.user.role === 'admin'
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
            admin: {
                readOnly: true,
                description: 'Definido automaticamente ao criar o post',
            },
        },
        {
            name: 'status',
            label: 'Status',
            type: 'select',
            required: true,
            defaultValue: 'draft',
            options: [
                { label: 'Rascunho', value: 'draft' },
                { label: 'Publicado', value: 'published' },
            ],
            admin: {
                description: 'Posts publicados são visíveis publicamente',
            },
        },
        {
            name: 'tags',
            label: 'Tags',
            type: 'array',
            fields: [{ name: 'tag', type: 'text' }],
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
            admin: {
                readOnly: true,
                description: 'Incrementado automaticamente a cada leitura',
            },
        },
    ],

    hooks: {
        beforeValidate: [
            ({ data, req, operation }) => {
                if (operation === 'create' && req.user && data) {
                    data.author = req.user.id
                }
                return data
            },
        ],

        afterRead: [
            async ({ doc, req }) => {
                if (!doc) return doc

                const refererHeader = req.headers?.get('referer') ?? req.headers?.get('referrer') ?? ''

                const isAdminPanel = refererHeader?.includes('/admin')

                if (isAdminPanel) return doc

                const isListRequest = req.url?.includes('limit')

                if (isListRequest) return doc

                try {
                    setImmediate(async () => {
                        try {
                            await req.payload.update({
                                collection: 'posts',
                                id: doc.id,
                                data: {
                                    views: (doc.views ?? 0) + 1,
                                },
                            })
                        } catch (error) {
                            console.error('Erro ao incrementar views:', error)
                        }
                    })
                } catch (error) {
                    console.error('Erro ao agendar incremento de views:', error)
                }

                return doc
            },
        ],
    },

    timestamps: true,
}