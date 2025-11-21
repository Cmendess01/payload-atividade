'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        // Validação simples dos campos
        if (!formData.email || !formData.password) {
            setError('Preencha todos os campos.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/users/login/`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data?.message || 'Erro ao autenticar.');
                return;
            }

            // Salvar preferência "Lembrar-me"
            if (formData.rememberMe) {
                localStorage.setItem('rememberedEmail', formData.email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            window.location.href = '/dashboard';
        } catch (err: Error | unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Erro de rede.';
            setError(errorMessage || 'Erro de rede.');
        } finally {
            setLoading(false);
        }
    }

    // Carregar email salvo ao montar componente
    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setFormData(prev => ({ ...prev, email: savedEmail, rememberMe: true }));
        }
    }, []);

    return (
        <StyledWrapper>
            <div className="form-container">
                <p className="title">Login</p>
                <p className="subtitle">Acesse sua conta</p>

                <form className="form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <div className="input-wrapper">
                            <input 
                                type="email" 
                                name="email" 
                                id="email" 
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="seu@email.com"
                                required 
                            />
                            {formData.email && (
                                <span className="input-icon">
                                    {formData.email.includes('@') ? '✓' : '✗'}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Senha</label>
                        <div className="input-wrapper">
                            <input 
                                type={showPassword ? 'text' : 'password'}
                                name="password" 
                                id="password" 
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required 
                            />
                            <button 
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <div className="options-row">
                        <div className="checkbox-group">
                            <input 
                                type="checkbox" 
                                name="rememberMe" 
                                id="rememberMe" 
                                checked={formData.rememberMe}
                                onChange={handleChange}
                            />
                            <label htmlFor="rememberMe">Lembrar-me</label>
                        </div>

                        <div className="forgot">
                            <a href="/recover">Esqueci minha senha</a>
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            <span className="error-icon">⚠️</span>
                            {error}
                        </div>
                    )}

                    <button 
                        className="sign" 
                        type="submit" 
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="loading">
                                <span className="spinner"></span>
                                Entrando...
                            </span>
                        ) : (
                            'Entrar'
                        )}
                    </button>
                </form>

                <div className="divider">
                    <span>ou</span>
                </div>

                <div className="social-login">
                    <button className="social-btn google" type="button">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Entrar com Google
                    </button>

                    <button className="social-btn github" type="button">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        Entrar com GitHub
                    </button>
                </div>

                <p className="signup">
                    Não possui conta?
                    <a href="/register"> Criar conta</a>
                </p>
            </div>
        </StyledWrapper>
    );
};

export default LoginPage;

const StyledWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #1e1b4b, #3b0764);

    .form-container {
        width: 380px;
        border-radius: 0.75rem;
        background-color: rgba(17, 24, 39, 1);
        padding: 2rem;
        color: rgba(243, 244, 246, 1);
        box-shadow: 0px 8px 25px rgba(0,0,0,0.25);
    }

    .title {
        text-align: center;
        font-size: 1.75rem;
        line-height: 2rem;
        font-weight: 700;
        margin-bottom: 0.25rem;
    }

    .subtitle {
        text-align: center;
        font-size: 0.875rem;
        color: rgba(156, 163, 175, 1);
        margin-bottom: 1.5rem;
    }

    .form {
        margin-top: 1.5rem;
    }

    .input-group {
        margin-bottom: 1.25rem;
        font-size: 0.875rem;
    }

    .input-group label {
        display: block;
        color: rgba(156, 163, 175, 1);
        margin-bottom: 6px;
        font-weight: 500;
    }

    .input-wrapper {
        position: relative;
    }

    .input-group input {
        width: 100%;
        border-radius: 0.375rem;
        border: 1px solid rgba(55, 65, 81, 1);
        outline: 0;
        background-color: rgba(17, 24, 39, 1);
        padding: 0.75rem 2.5rem 0.75rem 1rem;
        color: rgba(243, 244, 246, 1);
        transition: 0.2s;
    }

    .input-group input::placeholder {
        color: rgba(107, 114, 128, 1);
    }

    .input-group input:focus {
        border-color: rgba(167, 139, 250, 1);
        box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.1);
    }

    .input-icon {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.875rem;
        color: rgba(156, 163, 175, 1);
    }

    .toggle-password {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.1rem;
        opacity: 0.6;
        transition: 0.2s;
        padding: 0;
        display: flex;
        align-items: center;
    }

    .toggle-password:hover {
        opacity: 1;
    }

    .options-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .checkbox-group {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8rem;
    }

    .checkbox-group input[type="checkbox"] {
        cursor: pointer;
        width: 16px;
        height: 16px;
        margin: 0;
    }

    .checkbox-group label {
        color: rgba(156, 163, 175, 1);
        cursor: pointer;
        user-select: none;
        margin: 0;
    }

    .forgot {
        font-size: 0.8rem;
    }

    .forgot a {
        color: rgba(167, 139, 250, 1);
        text-decoration: none;
        transition: 0.2s;
    }

    .forgot a:hover {
        color: rgba(139, 92, 246, 1);
        text-decoration: underline;
    }

    .error-message {
        background-color: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 0.375rem;
        padding: 0.75rem;
        margin-bottom: 1rem;
        color: #fca5a5;
        font-size: 0.875rem;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .error-icon {
        font-size: 1rem;
    }

    .sign {
        display: block;
        width: 100%;
        background-color: rgba(167, 139, 250, 1);
        padding: 0.875rem;
        text-align: center;
        color: rgba(17, 24, 39, 1);
        border: none;
        border-radius: 0.375rem;
        font-weight: 600;
        font-size: 0.95rem;
        cursor: pointer;
        transition: 0.2s;
    }

    .sign:hover:not(:disabled) {
        background-color: rgba(139, 92, 246, 1);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(167, 139, 250, 0.4);
    }

    .sign:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
    }

    .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }

    .spinner {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(17, 24, 39, 0.3);
        border-top-color: rgba(17, 24, 39, 1);
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .divider {
        position: relative;
        text-align: center;
        margin: 1.5rem 0;
    }

    .divider::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background-color: rgba(55, 65, 81, 1);
    }

    .divider span {
        position: relative;
        background-color: rgba(17, 24, 39, 1);
        padding: 0 1rem;
        font-size: 0.8rem;
        color: rgba(156, 163, 175, 1);
    }

    .social-login {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
    }

    .social-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        width: 100%;
        padding: 0.75rem;
        border-radius: 0.375rem;
        border: 1px solid rgba(55, 65, 81, 1);
        background-color: rgba(31, 41, 55, 1);
        color: rgba(243, 244, 246, 1);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: 0.2s;
    }

    .social-btn:hover {
        background-color: rgba(55, 65, 81, 1);
        border-color: rgba(75, 85, 99, 1);
        transform: translateY(-1px);
    }

    .social-btn svg {
        flex-shrink: 0;
    }

    .signup {
        text-align: center;
        font-size: 0.85rem;
        margin-top: 1rem;
        color: rgba(156, 163, 175, 1);
    }

    .signup a {
        color: rgba(167, 139, 250, 1);
        text-decoration: none;
        font-weight: 600;
        transition: 0.2s;
    }

    .signup a:hover {
        color: rgba(139, 92, 246, 1);
        text-decoration: underline;
    }
`;