import { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
    slug: 'users',
    auth: {
        verify: true,
        maxLoginAttempts: 10,
        lockTime: 15 * 60 * 1000,
    },
    admin: {
        useAsTitle: 'name',
    },
    access: {
        read: ({ req }) => {
            if (req.user?.role === 'admin') {
                return true
            }
            return {
                id: {
                    equals: req.user?.id,
                },
            }
        },
        create: () => true,
        update: ({ req, id }) => req.user?.role === 'admin' || req.user?.id === id,
        delete: ({ req }) => req.user?.role === 'admin',
    },
    fields: [
        {
            name: 'name',
            label: 'Nome completo',
            type: 'text',
            required: true,
        },
        {
            name: 'email',
            label: 'E-mail',
            type: 'email',
            required: true,
            unique: true,
            index: true,
        },
        {
            name: 'role',
            label: 'Função',
            type: 'select',
            required: true,
            defaultValue: 'writer',
            options: [
                { label: 'Admin', value: 'admin' },
                { label: 'Escritor', value: 'writer' },
                { label: 'Usuário comum', value: 'user' },
            ],
            access: {
                create: () => true,
                update: ({ req }) => req.user?.role === 'admin',
            },
        },
    ],
}
