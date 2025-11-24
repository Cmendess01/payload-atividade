'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const RegisterPage = () => {
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

    const validateGmail = (email: string) => {
        const gmailRegex = /^[^\s@]+@gmail\.com$/i;
        return gmailRegex.test(email);
    };

    const handleEmailChange = (value: string) => {
        const cleanEmail = value.toLowerCase().trim();
        setFormData({ ...formData, email: cleanEmail });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim()) {
            setError('O nome é obrigatório');
            return;
        }

        if (!formData.email.trim()) {
            setError('O Gmail é obrigatório');
            return;
        }

        if (!validateGmail(formData.email)) {
            setError('❌ Use apenas email do Gmail (exemplo@gmail.com)');
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

            console.log('📤 Criando usuário:', userData);

            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.errors?.[0]?.message || error.message || 'Erro ao criar conta');
            }

            const result = await response.json();
            console.log('✅ Usuário criado:', result);

            alert(`✅ Conta criada com sucesso!\nRole: ${formData.role}`);
            router.push('/login');
        } catch (error: any) {
            console.error('❌ Erro:', error);
            if (error.message.includes('duplicate') || error.message.includes('já existe')) {
                setError('❌ Este Gmail já está cadastrado');
            } else if (error.message.includes('email')) {
                setError('❌ Gmail inválido. Use o formato: exemplo@gmail.com');
            } else {
                setError(error.message || 'Erro ao criar conta');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <FormWrapper>
                <Header>
                    <Logo>🚀</Logo>
                    <Title>Criar Conta</Title>
                    <Subtitle>Preencha os dados para começar</Subtitle>
                </Header>

                <Form onSubmit={handleSubmit}>
                    {error && <ErrorMessage>⚠️ {error}</ErrorMessage>}

                    <FormGroup>
                        <Label>Nome Completo</Label>
                        <Input
                            type="text"
                            placeholder="João da Silva"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            disabled={loading}
                            autoComplete="name"
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>
                            Gmail
                            <GmailBadge>📧 Apenas Gmail</GmailBadge>
                        </Label>
                        <EmailInputWrapper>
                            <EmailInput
                                type="text"
                                placeholder="seunome"
                                value={formData.email.replace('@gmail.com', '')}
                                onChange={(e) => handleEmailChange(e.target.value + '@gmail.com')}
                                disabled={loading}
                                autoComplete="email"
                            />
                            <EmailSuffix>@gmail.com</EmailSuffix>
                        </EmailInputWrapper>
                        <Hint>
                            ✅ Digite apenas o nome de usuário (sem @gmail.com)
                            <br />
                            Exemplo: se seu email é <strong>joao123@gmail.com</strong>, digite apenas{' '}
                            <strong>joao123</strong>
                        </Hint>
                    </FormGroup>

                    <FormGroup>
                        <Label>Senha</Label>
                        <Input
                            type="password"
                            placeholder="Mínimo 8 caracteres"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            disabled={loading}
                            autoComplete="new-password"
                        />
                        <PasswordStrength password={formData.password} />
                    </FormGroup>

                    <FormGroup>
                        <Label>Confirmar Senha</Label>
                        <Input
                            type="password"
                            placeholder="Digite a senha novamente"
                            value={formData.confirmPassword}
                            onChange={(e) =>
                                setFormData({ ...formData, confirmPassword: e.target.value })
                            }
                            disabled={loading}
                            autoComplete="new-password"
                        />
                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                            <ErrorHint>❌ As senhas não coincidem</ErrorHint>
                        )}
                        {formData.confirmPassword && formData.password === formData.confirmPassword && (
                            <SuccessHint>✅ As senhas coincidem</SuccessHint>
                        )}
                    </FormGroup>

                    <FormGroup>
                        <Label>Tipo de Conta</Label>
                        <RoleSelector>
                            <RoleOption
                                type="button"
                                active={formData.role === 'writer'}
                                onClick={() => setFormData({ ...formData, role: 'writer' })}
                                disabled={loading}
                            >
                                <RoleIcon>✍️</RoleIcon>
                                <RoleTitle>Escritor</RoleTitle>
                                <RoleDescription>Cria e edita seus posts</RoleDescription>
                            </RoleOption>

                            <RoleOption
                                type="button"
                                active={formData.role === 'admin'}
                                onClick={() => setFormData({ ...formData, role: 'admin' })}
                                disabled={loading}
                            >
                                <RoleIcon>👑</RoleIcon>
                                <RoleTitle>Administrador</RoleTitle>
                                <RoleDescription>Acesso total ao sistema</RoleDescription>
                            </RoleOption>

                            <RoleOption
                                type="button"
                                active={formData.role === 'user'}
                                onClick={() => setFormData({ ...formData, role: 'user' })}
                                disabled={loading}
                            >
                                <RoleIcon>👤</RoleIcon>
                                <RoleTitle>Usuário</RoleTitle>
                                <RoleDescription>Apenas visualização</RoleDescription>
                            </RoleOption>
                        </RoleSelector>
                    </FormGroup>

                    <PreviewBox>
                        <PreviewLabel>📧 Email completo:</PreviewLabel>
                        <PreviewEmail>{formData.email || 'seunome@gmail.com'}</PreviewEmail>
                    </PreviewBox>

                    <SubmitButton type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <ButtonSpinner />
                                Criando conta...
                            </>
                        ) : (
                            'Criar Conta'
                        )}
                    </SubmitButton>

                    <LoginLink type="button" onClick={() => router.push('/login')}>
                        Já tem uma conta? <strong>Fazer login</strong>
                    </LoginLink>
                </Form>
            </FormWrapper>
        </Container>
    );
};

// Componente para força da senha
const PasswordStrength = ({ password }: { password: string }) => {
    if (!password) return null;

    const getStrength = () => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        return strength;
    };

    const strength = getStrength();
    const labels = ['Muito fraca', 'Fraca', 'Média', 'Forte', 'Muito forte'];
    const colors = ['#ef4444', '#f59e0b', '#eab308', '#10b981', '#06b6d4'];

    return (
        <StrengthContainer>
            <StrengthBar>
                <StrengthFill strength={strength} color={colors[strength]} />
            </StrengthBar>
            <StrengthLabel color={colors[strength]}>{labels[strength]}</StrengthLabel>
        </StrengthContainer>
    );
};

export default RegisterPage;

// ========== STYLED COMPONENTS ==========

const Container = styled.div`
    min-height: 100vh;
    background: linear-gradient(135deg, #1e1b4b 0%, #3b0764 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
`;

const FormWrapper = styled.div`
    width: 100%;
    max-width: 500px;
`;

const Header = styled.div`
    text-align: center;
    margin-bottom: 2rem;
`;

const Logo = styled.div`
    font-size: 3rem;
    margin-bottom: 1rem;
`;

const Title = styled.h1`
    font-size: 2rem;
    font-weight: 700;
    color: rgba(243, 244, 246, 1);
    margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
    color: rgba(156, 163, 175, 1);
    font-size: 0.875rem;
`;

const Form = styled.form`
    background: rgba(17, 24, 39, 0.5);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 0.75rem;
    padding: 2rem;
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(243, 244, 246, 1);
    margin-bottom: 0.5rem;
`;

const GmailBadge = styled.span`
    background: rgba(6, 182, 212, 0.2);
    color: rgba(6, 182, 212, 1);
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
`;

const EmailInputWrapper = styled.div`
    display: flex;
    align-items: center;
    background: rgba(31, 41, 55, 1);
    border: 1px solid rgba(55, 65, 81, 1);
    border-radius: 0.5rem;
    overflow: hidden;
    transition: 0.2s;

    &:focus-within {
        border-color: rgba(167, 139, 250, 1);
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    }
`;

const EmailInput = styled.input`
    flex: 1;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    color: rgba(243, 244, 246, 1);
    font-size: 1rem;

    &:focus {
        outline: none;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    &::placeholder {
        color: rgba(156, 163, 175, 1);
    }
`;

const EmailSuffix = styled.span`
    padding: 0.75rem 1rem;
    color: rgba(156, 163, 175, 1);
    font-size: 1rem;
    font-weight: 600;
    border-left: 1px solid rgba(55, 65, 81, 1);
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

const Hint = styled.p`
    font-size: 0.75rem;
    color: rgba(156, 163, 175, 1);
    margin-top: 0.5rem;
    line-height: 1.5;
`;

const ErrorHint = styled.p`
    font-size: 0.75rem;
    color: rgba(239, 68, 68, 1);
    margin-top: 0.5rem;
    font-weight: 600;
`;

const SuccessHint = styled.p`
    font-size: 0.75rem;
    color: rgba(16, 185, 129, 1);
    margin-top: 0.5rem;
    font-weight: 600;
`;

const StrengthContainer = styled.div`
    margin-top: 0.5rem;
`;

const StrengthBar = styled.div`
    height: 4px;
    background: rgba(55, 65, 81, 1);
    border-radius: 9999px;
    overflow: hidden;
`;

const StrengthFill = styled.div<{ strength: number; color: string }>`
    height: 100%;
    background: ${(props) => props.color};
    width: ${(props) => (props.strength / 5) * 100}%;
    transition: 0.3s;
`;

const StrengthLabel = styled.span<{ color: string }>`
    display: block;
    font-size: 0.75rem;
    color: ${(props) => props.color};
    margin-top: 0.25rem;
    font-weight: 600;
`;

const PreviewBox = styled.div`
    background: rgba(6, 182, 212, 0.1);
    border: 1px solid rgba(6, 182, 212, 0.3);
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1.5rem;
`;

const PreviewLabel = styled.div`
    font-size: 0.75rem;
    color: rgba(156, 163, 175, 1);
    margin-bottom: 0.5rem;
    font-weight: 600;
`;

const PreviewEmail = styled.div`
    font-size: 1rem;
    color: rgba(6, 182, 212, 1);
    font-weight: 600;
    word-break: break-all;
`;

const RoleSelector = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const RoleOption = styled.button<{ active: boolean }>`
    background: ${(props) =>
        props.active ? 'rgba(139, 92, 246, 0.2)' : 'rgba(31, 41, 55, 1)'};
    border: 2px solid
        ${(props) =>
            props.active ? 'rgba(167, 139, 250, 1)' : 'rgba(55, 65, 81, 1)'};
    border-radius: 0.75rem;
    padding: 1rem;
    cursor: pointer;
    transition: 0.2s;
    text-align: center;

    &:hover:not(:disabled) {
        border-color: rgba(167, 139, 250, 1);
        background: rgba(139, 92, 246, 0.1);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const RoleIcon = styled.div`
    font-size: 2rem;
    margin-bottom: 0.5rem;
`;

const RoleTitle = styled.div`
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(243, 244, 246, 1);
    margin-bottom: 0.25rem;
`;

const RoleDescription = styled.div`
    font-size: 0.75rem;
    color: rgba(156, 163, 175, 1);
`;

const SubmitButton = styled.button`
    width: 100%;
    background: rgba(139, 92, 246, 1);
    border: none;
    color: white;
    padding: 0.875rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 600;
    font-size: 1rem;
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

const LoginLink = styled.button`
    width: 100%;
    background: none;
    border: none;
    color: rgba(156, 163, 175, 1);
    padding: 1rem;
    margin-top: 1rem;
    text-align: center;
    cursor: pointer;
    font-size: 0.875rem;
    transition: 0.2s;

    strong {
        color: rgba(167, 139, 250, 1);
    }

    &:hover {
        color: rgba(243, 244, 246, 1);

        strong {
            text-decoration: underline;
        }
    }
`;