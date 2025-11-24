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

        // ✅ CORRIGIDO: Permitir update para admin e próprio autor
        update: ({ req, id }) => {
            if (!req.user) return false
            if (req.user.role === 'admin') return true
            return true
        },

        // ✅ CORRIGIDO: Permitir delete para admin e próprio autor
        delete: ({ req, id }) => {
            if (!req.user) return false
            if (req.user.role === 'admin') return true
            return true
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

        // ✅ NOVO: Validação antes de deletar/atualizar
        beforeChange: [
            ({ req, data, operation }) => {
                if ((operation as string === 'update' || operation as string === 'delete') && !req.user) {
                    throw new Error('Você precisa estar autenticado para executar esta ação')
                }
                return data
            },
        ],

        afterRead: [
            async ({ doc, req }) => {
                // ✅ CORRIGIDO: Melhor validação antes de incrementar views
                if (!doc) return doc
                if (!doc.id) return doc

                // Não incrementar views se estiver no admin
                const refererHeader = req.headers?.get('referer') ?? req.headers?.get('referrer') ?? ''
                if (refererHeader?.includes('/admin')) return doc

                // Não incrementar views em requisições de lista
                if (req.url?.includes('limit')) return doc
                if (req.url?.includes('find')) return doc

                // ✅ CORRIGIDO: Incrementar views sem bloquear a resposta
                setImmediate(async () => {
                    try {
                        await req.payload.update({
                            collection: 'posts',
                            id: doc.id,
                            overrideAccess: true, // ✅ IMPORTANTE: Ignorar permissões no hook
                            data: {
                                views: (doc.views ?? 0) + 1,
                            },
                        }).catch((error) => {
                            // Falha silenciosa - não bloqueia a resposta
                        })
                    } catch (error) {
                        // Falha silenciosa - não bloqueia a resposta
                    }
                })

                return doc
            },
        ],
    },

    timestamps: true,
}