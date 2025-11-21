'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function getMedia(page = 1, limit = 12) {
    try {
        const response = await fetch(
            `${API_URL}/media?page=${page}&limit=${limit}&sort=-createdAt`,
            { credentials: 'include', cache: 'no-store' }
        );
        if (!response.ok) return { docs: [], totalPages: 0, totalDocs: 0 };
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar mídia:', error);
        return { docs: [], totalPages: 0, totalDocs: 0 };
    }
}

async function deleteMedia(id: string) {
    try {
        const response = await fetch(`${API_URL}/media/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        return response.ok;
    } catch (error) {
        console.error('Erro ao deletar mídia:', error);
        return false;
    }
}

const MediaPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [media, setMedia] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        loadMedia();
    }, [currentPage]);

    async function loadMedia() {
        setLoading(true);
        const data = await getMedia(currentPage, 12);
        setMedia(data.docs || []);
        setTotalPages(data.totalPages || 0);
        setLoading(false);
    }

    async function handleDelete(id: string, filename: string) {
        if (!confirm(`Tem certeza que deseja deletar "${filename}"?`)) return;
        const success = await deleteMedia(id);
        if (success) {
            alert('Mídia deletada com sucesso!');
            loadMedia();
        } else {
            alert('Erro ao deletar mídia');
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    return (
        <Container>
            <Header>
                <HeaderTop>
                    <BackButton onClick={() => router.push('/dashboard')}>
                        ← Voltar
                    </BackButton>
                    <Title>Gerenciar Mídia</Title>
                </HeaderTop>

                <ActionBar>
                    <ViewToggle>
                        <ViewButton
                            active={viewMode === 'grid'}
                            onClick={() => setViewMode('grid')}
                        >
                            🔲 Grid
                        </ViewButton>
                        <ViewButton
                            active={viewMode === 'list'}
                            onClick={() => setViewMode('list')}
                        >
                            ☰ Lista
                        </ViewButton>
                    </ViewToggle>

                    <UploadButton onClick={() => router.push('/admin/collections/media/create')}>
                        ⬆️ Upload
                    </UploadButton>
                </ActionBar>
            </Header>

            {loading ? (
                <LoadingContainer>
                    <Spinner />
                    <LoadingText>Carregando mídia...</LoadingText>
                </LoadingContainer>
            ) : media.length === 0 ? (
                <EmptyState>
                    <EmptyIcon>📁</EmptyIcon>
                    <EmptyText>Nenhuma mídia encontrada</EmptyText>
                    <EmptyButton onClick={() => router.push('/admin/collections/media/create')}>
                        Fazer Primeiro Upload
                    </EmptyButton>
                </EmptyState>
            ) : (
                <>
                    {viewMode === 'grid' ? (
                        <MediaGrid>
                            {media.map((item) => (
                                <MediaCard key={item.id}>
                                    <MediaPreview>
                                        {item.mimeType?.startsWith('image/') ? (
                                            <MediaImage
                                                src={item.url}
                                                alt={item.filename}
                                            />
                                        ) : (
                                            <MediaIcon>📄</MediaIcon>
                                        )}
                                    </MediaPreview>

                                    <MediaInfo>
                                        <MediaFilename>{item.filename}</MediaFilename>
                                        <MediaMeta>
                                            {formatFileSize(item.filesize)}
                                        </MediaMeta>
                                    </MediaInfo>

                                    <MediaActions>
                                        <MediaActionButton
                                            color="#06b6d4"
                                            onClick={() =>
                                                router.push(`/admin/collections/media/${item.id}`)
                                            }
                                        >
                                            ✏️
                                        </MediaActionButton>
                                        <MediaActionButton
                                            color="#ef4444"
                                            onClick={() => handleDelete(item.id, item.filename)}
                                        >
                                            🗑️
                                        </MediaActionButton>
                                    </MediaActions>
                                </MediaCard>
                            ))}
                        </MediaGrid>
                    ) : (
                        <MediaList>
                            {media.map((item) => (
                                <MediaListItem key={item.id}>
                                    <MediaListPreview>
                                        {item.mimeType?.startsWith('image/') ? (
                                            <MediaListImage
                                                src={item.url}
                                                alt={item.filename}
                                            />
                                        ) : (
                                            <span>📄</span>
                                        )}
                                    </MediaListPreview>

                                    <MediaListInfo>
                                        <MediaListFilename>{item.filename}</MediaListFilename>
                                        <MediaListMeta>
                                            {formatFileSize(item.filesize)} •{' '}
                                            {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                                        </MediaListMeta>
                                    </MediaListInfo>

                                    <MediaListActions>
                                        <ActionButton
                                            color="#06b6d4"
                                            onClick={() =>
                                                router.push(`/admin/collections/media/${item.id}`)
                                            }
                                        >
                                            ✏️ Editar
                                        </ActionButton>
                                        <ActionButton
                                            color="#ef4444"
                                            onClick={() => handleDelete(item.id, item.filename)}
                                        >
                                            🗑️ Deletar
                                        </ActionButton>
                                    </MediaListActions>
                                </MediaListItem>
                            ))}
                        </MediaList>
                    )}

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

export default MediaPage;

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
    justify-content: space-between;
    align-items: center;
`;

const ViewToggle = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const ViewButton = styled.button<{ active: boolean }>`
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
    transition: 0.2s;

    &:hover {
        background: rgba(139, 92, 246, 0.2);
        border-color: rgba(167, 139, 250, 1);
        color: rgba(167, 139, 250, 1);
    }
`;

const UploadButton = styled.button`
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

const MediaGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;

    @media (max-width: 768px) {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
`;

const MediaCard = styled.div`
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

const MediaPreview = styled.div`
    aspect-ratio: 1;
    background: rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
`;

const MediaImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const MediaIcon = styled.div`
    font-size: 3rem;
    opacity: 0.5;
`;

const MediaInfo = styled.div`
    padding: 1rem;
    border-top: 1px solid rgba(139, 92, 246, 0.2);
`;

const MediaFilename = styled.div`
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(243, 244, 246, 1);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 0.25rem;
`;

const MediaMeta = styled.div`
    font-size: 0.75rem;
    color: rgba(156, 163, 175, 1);
`;

const MediaActions = styled.div`
    padding: 0.75rem;
    border-top: 1px solid rgba(139, 92, 246, 0.2);
    display: flex;
    gap: 0.5rem;
`;

const MediaActionButton = styled.button<{ color: string }>`
    flex: 1;
    background: rgba(17, 24, 39, 0.5);
    border: 1px solid rgba(139, 92, 246, 0.2);
    color: rgba(243, 244, 246, 1);
    padding: 0.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-size: 1.125rem;
    transition: 0.2s;

    &:hover {
        background: ${(props) => props.color}20;
        border-color: ${(props) => props.color};
    }
`;

const MediaList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
`;

const MediaListItem = styled.div`
    background: rgba(17, 24, 39, 0.5);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 0.75rem;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: 0.2s;

    &:hover {
        border-color: rgba(167, 139, 250, 1);
    }
`;

const MediaListPreview = styled.div`
    width: 60px;
    height: 60px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;

    span {
        font-size: 2rem;
        opacity: 0.5;
    }
`;

const MediaListImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const MediaListInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const MediaListFilename = styled.div`
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(243, 244, 246, 1);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 0.25rem;
`;

const MediaListMeta = styled.div`
    font-size: 0.75rem;
    color: rgba(156, 163, 175, 1);
`;

const MediaListActions = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const ActionButton = styled.button<{ color: string }>`
    background: rgba(17, 24, 39, 0.5);
    border: 1px solid rgba(139, 92, 246, 0.2);
    color: rgba(243, 244, 246, 1);
    padding: 0.5rem 1rem;
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