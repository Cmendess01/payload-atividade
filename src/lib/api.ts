// Funções para interagir com a API do Payload

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

// Buscar posts recentes
export async function getRecentPosts(limit = 4) {
    try {
        const response = await fetch(`${API_URL}/posts?limit=${limit}&sort=-createdAt`, {
            credentials: 'include',
            cache: 'no-store',
        })

        if (!response.ok) {
            throw new Error('Erro ao buscar posts')
        }

        const data = await response.json()
        return data.docs || []
    } catch (error) {
        console.error('Erro ao buscar posts:', error)
        return []
    }
}

// Buscar estatísticas
export async function getStats() {
    try {
        const [postsResponse, viewsResponse] = await Promise.all([
            fetch(`${API_URL}/posts?limit=0`, { credentials: 'include', cache: 'no-store' }),
            fetch(`${API_URL}/posts`, { credentials: 'include', cache: 'no-store' }),
        ])

        const postsData = await postsResponse.json()
        const viewsData = await viewsResponse.json()

        // Calcular total de visualizações
        const totalViews = viewsData.docs?.reduce((acc: number, post: any) => {
            return acc + (post.views || 0)
        }, 0) || 0

        return {
            totalPosts: postsData.totalDocs || 0,
            totalViews: formatNumber(totalViews),
        }
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error)
        return {
            totalPosts: 0,
            totalViews: '0',
        }
    }
}

// Buscar usuário atual
export async function getCurrentUser() {
    try {
        const response = await fetch(`${API_URL}/users/me`, {
            credentials: 'include',
            cache: 'no-store',
        })

        if (!response.ok) {
            return null
        }

        const data = await response.json()
        return data.user
    } catch (error) {
        console.error('Erro ao buscar usuário:', error)
        return null
    }
}

// Fazer logout
export async function logout() {
    try {
        const response = await fetch(`${API_URL}/users/logout`, {
            method: 'POST',
            credentials: 'include',
        })

        if (response.ok) {
            window.location.href = '/login'
        }
    } catch (error) {
        console.error('Erro ao fazer logout:', error)
    }
}

// Formatar números grandes
function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
}