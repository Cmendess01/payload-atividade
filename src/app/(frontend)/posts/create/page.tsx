'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function createPost(data: any) {
    try {
        const response = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data),
        });
        
        if (response.status === 403) {
            throw new Error('❌ Você não tem permissão para criar posts. Verifique sua role (deve ser admin ou writer)');
        }
        
        if (response.status === 401) {
            throw new Error('❌ Sessão expirada. Faça login novamente!');
        }

        if (!response.ok) {
            const error = await response.json();
            console.error('Erro da API:', error);
            throw new Error(error.message || 'Erro ao criar post');
        }
        
        return await response.json();
    } catch (error: any) {
        console.error('Erro ao criar post:', error);
        throw error;
    }
}

const CreatePostPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        status: 'draft',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const response = await fetch(`${API_URL}/users/me`, {
                credentials: 'include',
            });

            if (!response.ok) {
                alert('⚠️ Você precisa estar logado!');
                router.push('/admin/login');
                return;
            }

            const data = await response.json();
            setUser(data.user);
            
            console.log('👤 Usuário:', data.user.email);
            console.log('🎭 Role:', data.user.role);

            if (!['admin', 'writer'].includes(data.user.role)) {
                alert(`❌ Sua role "${data.user.role}" não pode criar posts!\n\nApenas admin e writer podem criar posts.`);
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Erro ao verificar auth:', error);
            router.push('/admin/login');
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.title.trim()) {
            setError('O título é obrigatório');
            return;
        }
        
        if (!formData.content.trim()) {
            setError('O conteúdo é obrigatório');
            return;
        }

        if (!user) {
            setError('Usuário não encontrado. Recarregue a página.');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const postData = {
                title: formData.title,
                content: {
                    root: {
                        type: 'root',
                        children: [
                            {
                                type: 'paragraph',
                                children: [
                                    {
                                        type: 'text',
                                        text: formData.content,
                                    },
                                ],
                            },
                        ],
                        direction: 'ltr',
                        format: '',
                        indent: 0,
                        version: 1,
                    },
                },
                status: formData.status,
                author: user.id,
            };

            console.log('📤 Enviando:', postData);
            await createPost(postData);
            
            alert('✅ Post criado com sucesso!');
            router.push('/posts');
        } catch (error: any) {
            console.error('❌ Erro:', error);
            setError(error.message || 'Erro ao criar post');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <Container>
                <LoadingText>Verificando permissões...</LoadingText>
            </Container>
        );
    }

    return (
        <Container>
            <Header>
                <BackButton onClick={() => router.push('/posts')}>
                    ← Voltar
                </BackButton>
                <Title>Criar Novo Post</Title>
            </Header>

            <Form onSubmit={handleSubmit}>
                {error && <ErrorMessage>⚠️ {error}</ErrorMessage>}

                <FormGroup>
                    <Label>
                        Título <Required>*</Required>
                    </Label>
                    <Input
                        type="text"
                        placeholder="Digite o título do post..."
                        value={formData.title}
                        onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                        }
                        disabled={loading}
                    />
                </FormGroup>

                <FormGroup>
                    <Label>
                        Conteúdo <Required>*</Required>
                    </Label>
                    <Textarea
                        placeholder="Digite o conteúdo do post..."
                        rows={15}
                        value={formData.content}
                        onChange={(e) =>
                            setFormData({ ...formData, content: e.target.value })
                        }
                        disabled={loading}
                    />
                </FormGroup>

                <FormGroup>
                    <Label>Status</Label>
                    <Select
                        value={formData.status}
                        onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value })
                        }
                        disabled={loading}
                    >
                        <option value="draft">📝 Rascunho</option>
                        <option value="published">✓ Publicado</option>
                    </Select>
                </FormGroup>

                <FormActions>
                    <CancelButton
                        type="button"
                        onClick={() => router.push('/posts')}
                        disabled={loading}
                    >
                        Cancelar
                    </CancelButton>
                    <SubmitButton type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <ButtonSpinner />
                                Criando...
                            </>
                        ) : (
                            <>✓ Criar Post</>
                        )}
                    </SubmitButton>
                </FormActions>
            </Form>
        </Container>
    );
};

export default CreatePostPage;

// ========== STYLED COMPONENTS ==========

const Container = styled.div`
    min-height: 100vh;
    background: linear-gradient(135deg, #1e1b4b 0%, #3b0764 100%);
    padding: 2rem;

    @media (max-width: 768px) {
        padding: 1rem;
    }
`;

const LoadingText = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    color: rgba(243, 244, 246, 1);
    font-size: 1.125rem;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
`;

const BackButton = styled.button`
    background: rgba(17, 24, 39, 0.5);
    border: 1px solid rgba(139, 92, 246, 0.2);
    color: rgba(167, 139, 250, 1);
    padding: 0.75rem 1.5rem;
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

const Form = styled.form`
    max-width: 800px;
    margin: 0 auto;
    background: rgba(17, 24, 39, 0.5);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 0.75rem;
    padding: 2rem;

    @media (max-width: 768px) {
        padding: 1.5rem;
    }
`;

const ErrorMessage = styled.div`
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: rgba(239, 68, 68, 1);
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    font-weight: 600;
`;

const FormGroup = styled.div`
    margin-bottom: 1.5rem;
`;

const Label = styled.label`
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(243, 244, 246, 1);
    margin-bottom: 0.5rem;
`;

const Required = styled.span`
    color: rgba(239, 68, 68, 1);
`;

const Input = styled.input`
    width: 100%;
    padding: 0.75rem 1rem;
    background: rgba(31, 41, 55, 1);
    border: 1px solid rgba(55, 65, 81, 1);
    border-radius: 0.5rem;
    color: rgba(243, 244, 246, 1);
    font-size: 1rem;
    transition: 0.2s;

    &:focus {
        outline: none;
        border-color: rgba(167, 139, 250, 1);
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    &::placeholder {
        color: rgba(156, 163, 175, 1);
    }
`;

const Textarea = styled.textarea`
    width: 100%;
    padding: 0.75rem 1rem;
    background: rgba(31, 41, 55, 1);
    border: 1px solid rgba(55, 65, 81, 1);
    border-radius: 0.5rem;
    color: rgba(243, 244, 246, 1);
    font-size: 1rem;
    font-family: inherit;
    resize: vertical;
    transition: 0.2s;

    &:focus {
        outline: none;
        border-color: rgba(167, 139, 250, 1);
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    &::placeholder {
        color: rgba(156, 163, 175, 1);
    }
`;

const Select = styled.select`
    width: 100%;
    padding: 0.75rem 1rem;
    background: rgba(31, 41, 55, 1);
    border: 1px solid rgba(55, 65, 81, 1);
    border-radius: 0.5rem;
    color: rgba(243, 244, 246, 1);
    font-size: 1rem;
    cursor: pointer;
    transition: 0.2s;

    &:focus {
        outline: none;
        border-color: rgba(167, 139, 250, 1);
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const FormActions = styled.div`
    display: flex;
    gap: 1rem;
    margin-top: 2rem;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const CancelButton = styled.button`
    flex: 1;
    background: rgba(17, 24, 39, 0.5);
    border: 1px solid rgba(139, 92, 246, 0.2);
    color: rgba(243, 244, 246, 1);
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 600;
    transition: 0.2s;

    &:hover:not(:disabled) {
        background: rgba(139, 92, 246, 0.1);
        border-color: rgba(167, 139, 250, 1);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const SubmitButton = styled.button`
    flex: 1;
    background: rgba(139, 92, 246, 1);
    border: none;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 600;
    transition: 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:hover:not(:disabled) {
        background: rgba(124, 58, 237, 1);
        transform: translateY(-2px);
    }

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
    }
`;

const ButtonSpinner = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
`;