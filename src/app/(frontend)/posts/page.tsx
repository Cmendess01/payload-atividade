'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function getPosts(page = 1, limit = 10, search = '') {
    try {
        const searchParam = search ? `&where[title][contains]=${search}` : '';
        const response = await fetch(
            `${API_URL}/posts?page=${page}&limit=${limit}&sort=-createdAt${searchParam}`,
            { credentials: 'include', cache: 'no-store' }
        );
        if (!response.ok) return { docs: [], totalPages: 0, totalDocs: 0 };
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar posts:', error);
        return { docs: [], totalPages: 0, totalDocs: 0 };
    }
}

async function deletePost(id: string) {
    try {
        const response = await fetch(`${API_URL}/posts/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        return response.ok;
    } catch (error) {
        console.error('Erro ao deletar post:', error);
        return false;
    }
}

const PostsPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalDocs, setTotalDocs] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

    useEffect(() => {
        loadPosts();
    }, [currentPage, searchQuery]);

    async function loadPosts() {
        setLoading(true);
        const data = await getPosts(currentPage, 10, searchQuery);
        setPosts(data.docs || []);
        setTotalPages(data.totalPages || 0);
        setTotalDocs(data.totalDocs || 0);
        setLoading(false);
    }

    async function handleDelete(id: string, title: string) {
        if (!confirm(`Tem certeza que deseja deletar "${title}"?`)) return;
        const success = await deletePost(id);
        if (success) {
            alert('Post deletado com sucesso!');
            loadPosts();
        } else {
            alert('Erro ao deletar post');
        }
    }

    const filteredPosts = posts.filter((post) => {
        if (filterStatus === 'all') return true;
        return post.status === filterStatus;
    });

    return (
        <Container>
            <Header>
                <HeaderTop>
                    <BackButton onClick={() => router.push('/dashboard')}>
                        ← Voltar
                    </BackButton>
                    <Title>Gerenciar Posts</Title>
                </HeaderTop>

                <ActionBar>
                    <SearchBar>
                        <input
                            type="text"
                            placeholder="Buscar posts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <span className="icon">🔍</span>
                    </SearchBar>

                    <FilterButtons>
                        <FilterButton
                            active={filterStatus === 'all'}
                            onClick={() => setFilterStatus('all')}
                        >
                            Todos ({posts.length})
                        </FilterButton>
                        <FilterButton
                            active={filterStatus === 'published'}
                            onClick={() => setFilterStatus('published')}
                        >
                            Publicados
                        </FilterButton>
                        <FilterButton
                            active={filterStatus === 'draft'}
                            onClick={() => setFilterStatus('draft')}
                        >
                            Rascunhos
                        </FilterButton>
                    </FilterButtons>

                    <CreateButton onClick={() => router.push('/posts/create')}>
                        ➕ Novo Post
                    </CreateButton>
                </ActionBar>
            </Header>

            {loading ? (
                <LoadingContainer>
                    <Spinner />
                    <LoadingText>Carregando posts...</LoadingText>
                </LoadingContainer>
            ) : filteredPosts.length === 0 ? (
                <EmptyState>
                    <EmptyIcon>📝</EmptyIcon>
                    <EmptyText>Nenhum post encontrado</EmptyText>
                    <EmptyButton onClick={() => router.push('/posts/create')}>
                        Criar Primeiro Post
                    </EmptyButton>
                </EmptyState>
            ) : (
                <>
                    <PostsGrid>
                        {filteredPosts.map((post) => (
                            <PostCard key={post.id}>
                                <PostCardHeader>
                                    <StatusBadge status={post.status}>
                                        {post.status === 'published' ? '✓ Publicado' : '📝 Rascunho'}
                                    </StatusBadge>
                                    <PostDate>
                                        {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                                    </PostDate>
                                </PostCardHeader>

                                <PostCardBody>
                                    <PostTitle>{post.title}</PostTitle>
                                    <PostMeta>
                                        <MetaItem>
                                            👁️ {post.views || 0} visualizações
                                        </MetaItem>
                                        <MetaItem>
                                            👤 {post.author?.name || 'Sem autor'}
                                        </MetaItem>
                                    </PostMeta>
                                </PostCardBody>

                                <PostCardActions>
                                    <ActionButton
                                        color="#06b6d4"
                                        onClick={() => router.push(`/posts/${post.id}`)}
                                    >
                                        ✏️ Editar
                                    </ActionButton>
                                    <ActionButton
                                        color="#ef4444"
                                        onClick={() => handleDelete(post.id, post.title)}
                                    >
                                        🗑️ Deletar
                                    </ActionButton>
                                </PostCardActions>
                            </PostCard>
                        ))}
                    </PostsGrid>

                    {totalPages > 1 && (
                        <Pagination>
                            <PaginationButton
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                            >
                                ← Anterior
                            </PaginationButton>
                            <PaginationInfo>
                                Página {currentPage} de {totalPages}
                            </PaginationInfo>
                            <PaginationButton
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => p + 1)}
                            >
                                Próxima →
                            </PaginationButton>
                        </Pagination>
                    )}
                </>
            )}
        </Container>
    );
};

export default PostsPage;

// Styled Components
const Container = styled.div`
    min-height: 100vh;
    background: linear-gradient(135deg, #1e1b4b 0%, #3b0764 100%);
    padding: 2rem;

    @media (max-width: 768px) {
        padding: 1rem;
    }
`;

const Header = styled.div`
    margin-bottom: 2rem;
`;

const HeaderTop = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
`;

const BackButton = styled.button`
    background: rgba(17, 24, 39, 0.5);
    border: 1px solid rgba(139, 92, 246, 0.2);
    color: rgba(167, 139, 250, 1);
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 600;
    transition: 0.2s;

    &:hover {
        background: rgba(139, 92, 246, 0.2);
        border-color: rgba(167, 139, 250, 1);
    }
`;

const Title = styled.h1`
    font-size: 2rem;
    font-weight: 700;
    color: rgba(243, 244, 246, 1);

    @media (max-width: 768px) {
        font-size: 1.5rem;
    }
`;

const ActionBar = styled.div`
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    align-items: center;
`;

const SearchBar = styled.div`
    position: relative;
    flex: 1;
    min-width: 250px;

    input {
        width: 100%;
        padding: 0.75rem 2.5rem 0.75rem 1rem;
        background: rgba(17, 24, 39, 0.5);
        border: 1px solid rgba(139, 92, 246, 0.2);
        border-radius: 0.5rem;
        color: rgba(243, 244, 246, 1);
        font-size: 0.875rem;

        &:focus {
            outline: none;
            border-color: rgba(167, 139, 250, 1);
        }
    }

    .icon {
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
    }
`;

const FilterButtons = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const FilterButton = styled.button<{ active: boolean }>`
    background: ${(props) =>
        props.active ? 'rgba(139, 92, 246, 0.3)' : 'rgba(17, 24, 39, 0.5)'};
    border: 1px solid
        ${(props) =>
            props.active ? 'rgba(167, 139, 250, 1)' : 'rgba(139, 92, 246, 0.2)'};
    color: ${(props) =>
        props.active ? 'rgba(167, 139, 250, 1)' : 'rgba(156, 163, 175, 1)'};
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.875rem;
    transition: 0.2s;

    &:hover {
        background: rgba(139, 92, 246, 0.2);
        border-color: rgba(167, 139, 250, 1);
        color: rgba(167, 139, 250, 1);
    }
`;

const CreateButton = styled.button`
    background: rgba(139, 92, 246, 1);
    border: none;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 600;
    transition: 0.2s;

    &:hover {
        background: rgba(124, 58, 237, 1);
        transform: translateY(-2px);
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 1rem;
`;

const Spinner = styled.div`
    width: 50px;
    height: 50px;
    border: 4px solid rgba(139, 92, 246, 0.2);
    border-top-color: rgba(167, 139, 250, 1);
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
`;

const LoadingText = styled.p`
    color: rgba(243, 244, 246, 1);
    font-size: 1rem;
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 1rem;
`;

const EmptyIcon = styled.div`
    font-size: 4rem;
    opacity: 0.5;
`;

const EmptyText = styled.p`
    color: rgba(156, 163, 175, 1);
    font-size: 1.125rem;
`;

const EmptyButton = styled.button`
    background: rgba(139, 92, 246, 1);
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 600;
    transition: 0.2s;

    &:hover {
        background: rgba(124, 58, 237, 1);
        transform: translateY(-2px);
    }
`;

const PostsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const PostCard = styled.div`
    background: rgba(17, 24, 39, 0.5);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 0.75rem;
    overflow: hidden;
    transition: 0.2s;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(139, 92, 246, 0.2);
        border-color: rgba(167, 139, 250, 1);
    }
`;

const PostCardHeader = styled.div`
    padding: 1rem;
    border-bottom: 1px solid rgba(139, 92, 246, 0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const StatusBadge = styled.span<{ status: string }>`
    background: ${(props) =>
        props.status === 'published' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'};
    color: ${(props) =>
        props.status === 'published' ? 'rgba(16, 185, 129, 1)' : 'rgba(245, 158, 11, 1)'};
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
`;

const PostDate = styled.span`
    color: rgba(156, 163, 175, 1);
    font-size: 0.75rem;
`;

const PostCardBody = styled.div`
    padding: 1.5rem;
`;

const PostTitle = styled.h3`
    font-size: 1.125rem;
    font-weight: 600;
    color: rgba(243, 244, 246, 1);
    margin-bottom: 0.75rem;
`;

const PostMeta = styled.div`
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
`;

const MetaItem = styled.span`
    color: rgba(156, 163, 175, 1);
    font-size: 0.875rem;
`;

const PostCardActions = styled.div`
    padding: 1rem;
    border-top: 1px solid rgba(139, 92, 246, 0.2);
    display: flex;
    gap: 0.5rem;
`;

const ActionButton = styled.button<{ color: string }>`
    flex: 1;
    background: rgba(17, 24, 39, 0.5);
    border: 1px solid rgba(139, 92, 246, 0.2);
    color: rgba(243, 244, 246, 1);
    padding: 0.75rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.875rem;
    transition: 0.2s;

    &:hover {
        background: ${(props) => props.color}20;
        border-color: ${(props) => props.color};
        color: ${(props) => props.color};
    }
`;

const Pagination = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
`;

const PaginationButton = styled.button`
    background: rgba(17, 24, 39, 0.5);
    border: 1px solid rgba(139, 92, 246, 0.2);
    color: rgba(167, 139, 250, 1);
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 600;
    transition: 0.2s;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    &:not(:disabled):hover {
        background: rgba(139, 92, 246, 0.2);
        border-color: rgba(167, 139, 250, 1);
    }
`;

const PaginationInfo = styled.span`
    color: rgba(243, 244, 246, 1);
    font-weight: 600;
`;