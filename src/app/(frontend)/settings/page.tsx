'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

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
        return null;
    }
}

const SettingsPage = () => {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    async function loadUser() {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setLoading(false);
    }

    const settingsSections = [
        {
            title: 'Geral',
            icon: '⚙️',
            items: [
                { label: 'Perfil', description: 'Editar informações pessoais', link: `/users/${user?.id}` },
                { label: 'Segurança', description: 'Alterar senha e configurações de segurança', link: `/users/${user?.id}` },
            ],
        },
        {
            title: 'Conteúdo',
            icon: '📝',
            items: [
                { label: 'Posts', description: 'Gerenciar posts', link: '/posts' },
                { label: 'Mídia', description: 'Gerenciar arquivos', link: '/media' },
                { label: 'Usuários', description: 'Gerenciar usuários', link: '/users' },
            ],
        },
        {
            title: 'Sistema',
            icon: '🔧',
            items: [
                { label: 'Painel Admin', description: 'Acessar painel admin do Payload', link: '/admin' },
                { label: 'Coleções', description: 'Ver todas as coleções', link: '/admin/collections' },
            ],
        },
    ];

    if (loading) {
        return (
            <Container>
                <LoadingContainer>
                    <Spinner />
                    <LoadingText>Carregando configurações...</LoadingText>
                </LoadingContainer>
            </Container>
        );
    }

    return (
        <Container>
            <Header>
                <HeaderTop>
                    <BackButton onClick={() => router.push('/dashboard')}>
                        ← Voltar
                    </BackButton>
                    <Title>Configurações</Title>
                </HeaderTop>
            </Header>

            <ProfileCard>
                <ProfileAvatar>
                    <AvatarCircle>{user?.name?.charAt(0) || 'U'}</AvatarCircle>
                </ProfileAvatar>
                <ProfileInfo>
                    <ProfileName>{user?.name || 'Usuário'}</ProfileName>
                    <ProfileEmail>{user?.email || 'email@example.com'}</ProfileEmail>
                    <ProfileRole>
                        {user?.role === 'admin' ? '👑 Administrador' : '✍️ Escritor'}
                    </ProfileRole>
                </ProfileInfo>
                <ProfileAction
                    onClick={() => router.push(`/users/${user?.id}`)}
                >
                    ✏️ Editar Perfil
                </ProfileAction>
            </ProfileCard>

            {settingsSections.map((section, index) => (
                <SettingsSection key={index}>
                    <SectionHeader>
                        <SectionIcon>{section.icon}</SectionIcon>
                        <SectionTitle>{section.title}</SectionTitle>
                    </SectionHeader>

                    <SectionItems>
                        {section.items.map((item, itemIndex) => (
                            <SettingItem key={itemIndex} onClick={() => router.push(item.link)}>
                                <SettingItemContent>
                                    <SettingItemLabel>{item.label}</SettingItemLabel>
                                    <SettingItemDescription>
                                        {item.description}
                                    </SettingItemDescription>
                                </SettingItemContent>
                                <SettingItemArrow>→</SettingItemArrow>
                            </SettingItem>
                        ))}
                    </SectionItems>
                </SettingsSection>
            ))}

            <DangerZone>
                <DangerHeader>
                    <DangerIcon>⚠️</DangerIcon>
                    <DangerTitle>Zona de Perigo</DangerTitle>
                </DangerHeader>
                <DangerButton onClick={() => alert('Funcionalidade em desenvolvimento')}>
                    🗑️ Deletar Conta
                </DangerButton>
            </DangerZone>
        </Container>
    );
};

export default SettingsPage;

// Styled Components
const Container = styled.div`
    min-height: 100vh;
    background: linear-gradient(135deg, #1e1b4b 0%, #3b0764 100%);
    padding: 2rem;
    max-width: 900px;
    margin: 0 auto;

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

const ProfileCard = styled.div`
    background: rgba(17, 24, 39, 0.5);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 0.75rem;
    padding: 2rem;
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
`;

const ProfileAvatar = styled.div`
    margin-bottom: 0.5rem;
`;

const AvatarCircle = styled.div`
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: rgba(139, 92, 246, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    font-weight: 700;
    color: white;
`;

const ProfileInfo = styled.div`
    text-align: center;
`;

const ProfileName = styled.div`
    font-size: 1.5rem;
    font-weight: 700;
    color: rgba(243, 244, 246, 1);
    margin-bottom: 0.25rem;
`;

const ProfileEmail = styled.div`
    font-size: 0.875rem;
    color: rgba(156, 163, 175, 1);
    margin-bottom: 0.5rem;
`;

const ProfileRole = styled.div`
    display: inline-block;
    background: rgba(139, 92, 246, 0.2);
    color: rgba(167, 139, 250, 1);
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 600;
`;

const ProfileAction = styled.button`
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

const SettingsSection = styled.div`
    background: rgba(17, 24, 39, 0.5);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 0.75rem;
    overflow: hidden;
    margin-bottom: 1.5rem;
`;

const SectionHeader = styled.div`
    padding: 1.5rem;
    border-bottom: 1px solid rgba(139, 92, 246, 0.2);
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const SectionIcon = styled.div`
    font-size: 1.5rem;
`;

const SectionTitle = styled.h2`
    font-size: 1.25rem;
    font-weight: 600;
    color: rgba(243, 244, 246, 1);
`;

const SectionItems = styled.div`
    padding: 0.5rem;
`;

const SettingItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: 0.2s;

    &:hover {
        background: rgba(139, 92, 246, 0.1);
    }
`;

const SettingItemContent = styled.div`
    flex: 1;
`;

const SettingItemLabel = styled.div`
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(243, 244, 246, 1);
    margin-bottom: 0.25rem;
`;

const SettingItemDescription = styled.div`
    font-size: 0.75rem;
    color: rgba(156, 163, 175, 1);
`;

const SettingItemArrow = styled.div`
    color: rgba(167, 139, 250, 1);
    font-size: 1.25rem;
`;

const DangerZone = styled.div`
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 0.75rem;
    padding: 1.5rem;
    margin-top: 2rem;
`;

const DangerHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
`;

const DangerIcon = styled.div`
    font-size: 1.5rem;
`;

const DangerTitle = styled.h3`
    font-size: 1.125rem;
    font-weight: 600;
    color: rgba(239, 68, 68, 1);
`;

const DangerButton = styled.button`
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.5);
    color: rgba(239, 68, 68, 1);
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 600;
    transition: 0.2s;

    &:hover {
        background: rgba(239, 68, 68, 0.3);
        border-color: rgba(239, 68, 68, 1);
    }
`;