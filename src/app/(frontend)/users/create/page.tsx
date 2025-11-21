'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function createUser(data: any) {
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Erro completo:', error);
            throw new Error(error.errors?.[0]?.message || error.message || 'Erro ao criar usuário');
        }

        return await response.json();
    } catch (error: any) {
        console.error('Erro ao criar usuário:', error);
        throw error;
    }
}

const CreateUserPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'writer',
    });
    const [error, setError] = useState('');

    const validateEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validações
        if (!formData.name.trim()) {
            setError('O nome é obrigatório');
            return;
        }

        if (!formData.email.trim()) {
            setError('O email é obrigatório');
            return;
        }

        if (!validateEmail(formData.email)) {
            setError('Email inválido. Use o formato: exemplo@dominio.com');
            return;
        }

        if (!formData.password) {
            setError('A senha é obrigatória');
            return;
        }

        if (formData.password.length < 8) {
            setError('A senha deve ter no mínimo 8 caracteres');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        try {
            setLoading(true);

            const userData = {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                role: formData.role,
            };

            await createUser(userData);

            alert('✅ Usuário criado com sucesso!');
            router.push('/users');
        } catch (error: any) {
            const errorMessage = error.message;
            
            if (errorMessage.includes('duplicate') || errorMessage.includes('já existe')) {
                setError('Este email já está cadastrado');
            } else if (errorMessage.includes('email')) {
                setError('Email inválido. Verifique o formato');
            } else {
                setError(errorMessage || 'Erro ao criar usuário');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <Header>
                <BackButton onClick={() => router.push('/users')}>
                    ← Voltar
                </BackButton>
                <Title>Criar Novo Usuário</Title>
            </Header>

            <Form onSubmit={handleSubmit}>
                {error && <ErrorMessage>⚠️ {error}</ErrorMessage>}

                <FormGroup>
                    <Label>
                        Nome Completo <Required>*</Required>
                    </Label>
                    <Input
                        type="text"
                        placeholder="João da Silva"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={loading}
                    />
                </FormGroup>

                <FormGroup>
                    <Label>
                        Email <Required>*</Required>
                    </Label>
                    <Input
                        type="email"
                        placeholder="usuario@exemplo.com"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value.toLowerCase() })
                        }
                        disabled={loading}
                    />
                    <Hint>Use um email válido no formato: exemplo@dominio.com</Hint>
                </FormGroup>

                <FormGroup>
                    <Label>
                        Senha <Required>*</Required>
                    </Label>
                    <Input
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        disabled={loading}
                    />
                    <Hint>A senha deve ter no mínimo 8 caracteres</Hint>
                </FormGroup>

                <FormGroup>
                    <Label>
                        Confirmar Senha <Required>*</Required>
                    </Label>
                    <Input
                        type="password"
                        placeholder="Digite a senha novamente"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                            setFormData({ ...formData, confirmPassword: e.target.value })
                        }
                        disabled={loading}
                    />
                </FormGroup>

                <FormGroup>
                    <Label>
                        Tipo de Usuário <Required>*</Required>
                    </Label>
                    <Select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        disabled={loading}
                    >
                        <option value="writer">✍️ Escritor</option>
                        <option value="admin">👑 Administrador</option>
                    </Select>
                    <Hint>
                        <strong>Escritor:</strong> Pode criar e editar seus próprios posts
                        <br />
                        <strong>Admin:</strong> Tem acesso total ao sistema
                    </Hint>
                </FormGroup>

                <FormActions>
                    <CancelButton
                        type="button"
                        onClick={() => router.push('/users')}
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
                            <>✓ Criar Usuário</>
                        )}
                    </SubmitButton>
                </FormActions>
            </Form>
        </Container>
    );
};

export default CreateUserPage;

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
    max-width: 600px;
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

const Hint = styled.p`
    font-size: 0.75rem;
    color: rgba(156, 163, 175, 1);
    margin-top: 0.5rem;
    line-height: 1.5;
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