'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';

// Funções da API (inline)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function getRecentPosts(limit = 4) {
    try {
        const response = await fetch(
            `${API_URL}/posts?limit=${limit}&sort=-createdAt&depth=1`,
            { credentials: 'include', cache: 'no-store' }
        );
        if (!response.ok) return [];
        const data = await response.json();
        return data.docs || [];
    } catch (error) {
        console.error('Erro ao buscar posts:', error);
        return [];
    }
}

async function getStats() {
    try {
        const postsResponse = await fetch(`${API_URL}/posts?limit=0`, {
            credentials: 'include',
            cache: 'no-store',
        });
        const postsData = await postsResponse.json();
        const totalPosts = postsData.totalDocs || 0;

        const viewsResponse = await fetch(`${API_URL}/posts?limit=1000`, {
            credentials: 'include',
            cache: 'no-store',
        });
        const viewsData = await viewsResponse.json();
        const totalViews = viewsData.docs?.reduce((acc: number, post: any) => {
            return acc + (post.views || 0);
        }, 0) || 0;

        const formatNumber = (num: number) => {
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
            return num.toString();
        };

        return {
            totalPosts,
            totalViews: formatNumber(totalViews),
        };
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return { totalPosts: 0, totalViews: '0' };
    }
}

async function getCurrentUser() {
    try {
        const response = await fetch(`${API_URL}/users/me`, {
            credentials: 'include',
            cache: 'no-store',
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.user;
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        return null;
    }
}

async function logout() {
    try {
        await fetch(`${API_URL}/users/logout`, {
            method: 'POST',
            credentials: 'include',
        });
        document.cookie = 'payload-token=; Max-Age=0; path=/;';
        window.location.href = '/admin/login';
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    }
}

const DashboardPage = () => {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({ totalPosts: 0, totalViews: '0' });
    const [recentPosts, setRecentPosts] = useState<any[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    async function loadDashboardData() {
        try {
            setLoading(true);
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                router.push('/admin/login');
                return;
            }
            setUser(currentUser);

            const [statsData, postsData] = await Promise.all([
                getStats(),
                getRecentPosts(4),
            ]);

            setStats(statsData);
            setRecentPosts(postsData);
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
        } finally {
            setLoading(false);
        }
    }

    const navigate = (path: string) => {
        router.push(path);
    };

    if (loading) {
        return (
            <Container>
                <LoadingContainer>
                    <Spinner />
                    <LoadingText>Carregando dashboard...</LoadingText>
                </LoadingContainer>
            </Container>
        );
    }

    return (
        <Container>
            {/* Sidebar */}
            <Sidebar className={sidebarOpen ? 'open' : ''}>
                <SidebarHeader>
                    <Logo>
                        <span className="icon">🚀</span>
                        <span className="text">Meu CMS</span>
                    </Logo>
                    <CloseButton onClick={() => setSidebarOpen(false)}>✕</CloseButton>
                </SidebarHeader>

                <Nav>
                    <NavItem className="active" onClick={() => navigate('/dashboard')}>
                        <span className="icon">📊</span>
                        <span className="text">Dashboard</span>
                    </NavItem>
                    <NavItem onClick={() => navigate('/posts')}>
                        <span className="icon">📝</span>
                        <span className="text">Posts</span>
                    </NavItem>
                    <NavItem onClick={() => navigate('/users')}>
                        <span className="icon">👥</span>
                        <span className="text">Usuários</span>
                    </NavItem>
                    <NavItem onClick={() => navigate('/media')}>
                        <span className="icon">📁</span>
                        <span className="text">Mídia</span>
                    </NavItem>
                    <NavItem onClick={() => navigate('/settings')}>
                        <span className="icon">⚙️</span>
                        <span className="text">Configurações</span>
                    </NavItem>
                </Nav>

                <SidebarFooter>
                    <NavItem onClick={logout}>
                        <span className="icon">🚪</span>
                        <span className="text">Sair</span>
                    </NavItem>
                </SidebarFooter>
            </Sidebar>

            {/* Main Content */}
            <MainContent>
                {/* Header */}
                <Header>
                    <HeaderLeft>
                        <MenuButton onClick={() => setSidebarOpen(!sidebarOpen)}>
                            ☰
                        </MenuButton>
                        <PageTitle>Dashboard</PageTitle>
                    </HeaderLeft>

                    <HeaderRight>
                        <SearchBar>
                            <input
                                type="text"
                                placeholder="Buscar..."
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        const query = (e.target as HTMLInputElement).value;
                                        navigate(`/posts?search=${query}`);
                                    }
                                }}
                            />
                            <span className="icon">🔍</span>
                        </SearchBar>

                        <UserMenu>
                            <UserAvatar>
                                <span>{user?.name?.charAt(0) || 'U'}</span>
                            </UserAvatar>
                            <UserInfo>
                                <UserName>{user?.name || 'Usuário'}</UserName>
                                <UserRole>
                                    {user?.role === 'admin' ? 'Administrador' : user?.role || 'Membro'}
                                </UserRole>
                            </UserInfo>
                            <DropdownIcon>▼</DropdownIcon>
                        </UserMenu>
                    </HeaderRight>
                </Header>

                {/* Stats Cards */}
                <StatsGrid>
                    <StatCard color="#8b5cf6">
                        <StatIcon>📝</StatIcon>
                        <StatContent>
                            <StatValue>{stats.totalPosts}</StatValue>
                            <StatLabel>Total de Posts</StatLabel>
                        </StatContent>
                    </StatCard>
                    <StatCard color="#06b6d4">
                        <StatIcon>👁️</StatIcon>
                        <StatContent>
                            <StatValue>{stats.totalViews}</StatValue>
                            <StatLabel>Visualizações</StatLabel>
                        </StatContent>
                    </StatCard>
                </StatsGrid>

                {/* Recent Posts */}
                <Card>
                    <CardHeader>
                        <CardTitle>Posts Recentes</CardTitle>
                        <CardAction onClick={() => navigate('/posts')}>
                            Ver todos →
                        </CardAction>
                    </CardHeader>
                    <CardBody>
                        {recentPosts.length === 0 ? (
                            <EmptyState>
                                <EmptyIcon>📝</EmptyIcon>
                                <EmptyText>Nenhum post encontrado</EmptyText>
                                <EmptyButton onClick={() => navigate('/admin/collections/posts/create')}>
                                    Criar Primeiro Post
                                </EmptyButton>
                            </EmptyState>
                        ) : (
                            recentPosts.map((post) => (
                                <PostItem
                                    key={post.id}
                                    onClick={() => navigate(`/admin/collections/posts/${post.id}`)}
                                >
                                    <PostInfo>
                                        <PostTitle>{post.title}</PostTitle>
                                        <PostMeta>
                                            <span>{post.views || 0} visualizações</span>
                                            <span>•</span>
                                            <span>
                                                {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                                            </span>
                                        </PostMeta>
                                    </PostInfo>
                                    <PostAction>→</PostAction>
                                </PostItem>
                            ))
                        )}
                    </CardBody>
                </Card>

                {/* Quick Actions */}
                <QuickActions>
                    <QuickActionButton
                        color="#8b5cf6"
                        onClick={() => navigate('/admin/collections/posts/create')}
                    >
                        <span className="icon">➕</span>
                        <span className="text">Novo Post</span>
                    </QuickActionButton>
                    <QuickActionButton
                        color="#06b6d4"
                        onClick={() => navigate('/admin/collections/media/create')}
                    >
                        <span className="icon">📤</span>
                        <span className="text">Upload</span>
                    </QuickActionButton>
                    <QuickActionButton
                        color="#10b981"
                        onClick={() => navigate('/users')}
                    >
                        <span className="icon">👥</span>
                        <span className="text">Usuários</span>
                    </QuickActionButton>
                    <QuickActionButton color="#f59e0b" onClick={() => navigate('/settings')}>
                        <span className="icon">⚙️</span>
                        <span className="text">Config</span>
                    </QuickActionButton>
                </QuickActions>
            </MainContent>

            {/* Overlay para mobile */}
            {sidebarOpen && <Overlay onClick={() => setSidebarOpen(false)} />}
        </Container>
    );
};

export default DashboardPage;

// Mantenha todos os Styled Components que você já tem
// (Não preciso repetir aqui, são os mesmos)

// Styled Components
const Container = styled.div`
    display: flex;
    min-height: 100vh;
    background: linear-gradient(135deg, #1e1b4b 0%, #3b0764 100%);
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
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
    padding: 3rem 1rem;
    gap: 1rem;
`;

const EmptyIcon = styled.div`
    font-size: 3rem;
    opacity: 0.5;
`;

const EmptyText = styled.p`
    color: rgba(156, 163, 175, 1);
    font-size: 1rem;
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

const Sidebar = styled.aside`
    width: 260px;
    background: rgba(17, 24, 39, 0.95);
    backdrop-filter: blur(10px);
    border-right: 1px solid rgba(139, 92, 246, 0.2);
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 1000;
    transition: transform 0.3s ease;

    @media (max-width: 768px) {
        transform: translateX(-100%);

        &.open {
            transform: translateX(0);
        }
    }
`;

const SidebarHeader = styled.div`
    padding: 1.5rem;
    border-bottom: 1px solid rgba(139, 92, 246, 0.2);
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const Logo = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .icon {
        font-size: 1.5rem;
    }

    .text {
        font-size: 1.25rem;
        font-weight: 700;
        color: rgba(243, 244, 246, 1);
    }
`;

const CloseButton = styled.button`
    display: none;
    background: none;
    border: none;
    color: rgba(156, 163, 175, 1);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;

    @media (max-width: 768px) {
        display: block;
    }
`;

const Nav = styled.nav`
    flex: 1;
    padding: 1rem 0;
    overflow-y: auto;
`;

const NavItem = styled.a`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.5rem;
    color: rgba(156, 163, 175, 1);
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s;

    .icon {
        font-size: 1.25rem;
    }

    .text {
        font-size: 0.875rem;
        font-weight: 500;
    }

    &:hover {
        background: rgba(139, 92, 246, 0.1);
        color: rgba(167, 139, 250, 1);
    }

    &.active {
        background: rgba(139, 92, 246, 0.2);
        color: rgba(167, 139, 250, 1);
        border-right: 3px solid rgba(167, 139, 250, 1);
    }
`;

const SidebarFooter = styled.div`
    padding: 1rem 0;
    border-top: 1px solid rgba(139, 92, 246, 0.2);
`;

const MainContent = styled.main`
    flex: 1;
    margin-left: 260px;
    padding: 2rem;

    @media (max-width: 768px) {
        margin-left: 0;
        padding: 1rem;
    }
`;

const Header = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    background: rgba(17, 24, 39, 0.5);
    backdrop-filter: blur(10px);
    padding: 1rem 1.5rem;
    border-radius: 0.75rem;
    border: 1px solid rgba(139, 92, 246, 0.2);

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const MenuButton = styled.button`
    display: none;
    background: none;
    border: none;
    color: rgba(243, 244, 246, 1);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;

    @media (max-width: 768px) {
        display: block;
    }
`;

const PageTitle = styled.h1`
    font-size: 1.5rem;
    font-weight: 700;
    color: rgba(243, 244, 246, 1);

    @media (max-width: 768px) {
        font-size: 1.25rem;
    }
`;

const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;

    @media (max-width: 768px) {
        width: 100%;
    }
`;

const SearchBar = styled.div`
    position: relative;

    input {
        width: 250px;
        padding: 0.5rem 2.5rem 0.5rem 1rem;
        background: rgba(31, 41, 55, 1);
        border: 1px solid rgba(55, 65, 81, 1);
        border-radius: 0.5rem;
        color: rgba(243, 244, 246, 1);
        font-size: 0.875rem;

        &:focus {
            outline: none;
            border-color: rgba(167, 139, 250, 1);
        }

        @media (max-width: 768px) {
            width: 100%;
        }
    }

    .icon {
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
    }
`;

const UserMenu = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    background: rgba(31, 41, 55, 1);
    border: 1px solid rgba(55, 65, 81, 1);
    border-radius: 0.5rem;
    cursor: pointer;
    transition: 0.2s;

    &:hover {
        border-color: rgba(167, 139, 250, 1);
    }
`;

const UserAvatar = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(167, 139, 250, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    span {
        color: rgba(17, 24, 39, 1);
        font-weight: 700;
        font-size: 1.125rem;
    }
`;

const UserInfo = styled.div`
    display: flex;
    flex-direction: column;

    @media (max-width: 768px) {
        display: none;
    }
`;

const UserName = styled.span`
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(243, 244, 246, 1);
`;

const UserRole = styled.span`
    font-size: 0.75rem;
    color: rgba(156, 163, 175, 1);
`;

const DropdownIcon = styled.span`
    color: rgba(156, 163, 175, 1);
    font-size: 0.75rem;
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
`;

const StatCard = styled.div<{ color: string }>`
    background: rgba(17, 24, 39, 0.5);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 0.75rem;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: 0.2s;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(139, 92, 246, 0.2);
        border-color: ${(props) => props.color};
    }
`;

const StatIcon = styled.div`
    font-size: 2.5rem;
`;

const StatContent = styled.div`
    display: flex;
    flex-direction: column;
`;

const StatValue = styled.div`
    font-size: 2rem;
    font-weight: 700;
    color: rgba(243, 244, 246, 1);
`;

const StatLabel = styled.div`
    font-size: 0.875rem;
    color: rgba(156, 163, 175, 1);
`;

const Card = styled.div`
    background: rgba(17, 24, 39, 0.5);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 0.75rem;
    overflow: hidden;
    margin-bottom: 2rem;
`;

const CardHeader = styled.div`
    padding: 1.5rem;
    border-bottom: 1px solid rgba(139, 92, 246, 0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const CardTitle = styled.h3`
    font-size: 1.125rem;
    font-weight: 600;
    color: rgba(243, 244, 246, 1);
`;

const CardAction = styled.a`
    font-size: 0.875rem;
    color: rgba(167, 139, 250, 1);
    text-decoration: none;
    cursor: pointer;

    &:hover {
        text-decoration: underline;
    }
`;

const CardBody = styled.div`
    padding: 1rem;
`;

const PostItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
    transition: 0.2s;
    cursor: pointer;

    &:hover {
        background: rgba(139, 92, 246, 0.1);
    }

    &:last-child {
        margin-bottom: 0;
    }
`;

const PostInfo = styled.div`
    flex: 1;
`;

const PostTitle = styled.div`
    font-size: 0.875rem;
    font-weight: 500;
    color: rgba(243, 244, 246, 1);
    margin-bottom: 0.25rem;
`;

const PostMeta = styled.div`
    font-size: 0.75rem;
    color: rgba(156, 163, 175, 1);
    display: flex;
    gap: 0.5rem;
`;

const PostAction = styled.div`
    color: rgba(167, 139, 250, 1);
    cursor: pointer;
`;

const QuickActions = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
`;

const QuickActionButton = styled.button<{ color: string }>`
    background: rgba(17, 24, 39, 0.5);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 0.75rem;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    transition: 0.2s;

    .icon {
        font-size: 2rem;
    }

    .text {
        font-size: 0.875rem;
        font-weight: 600;
        color: rgba(243, 244, 246, 1);
    }

    &:hover {
        border-color: ${(props) => props.color};
        transform: translateY(-4px);
        box-shadow: 0 8px 20px ${(props) => props.color}40;
    }
`;

const Overlay = styled.div`
    display: none;

    @media (max-width: 768px) {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
    }
`;