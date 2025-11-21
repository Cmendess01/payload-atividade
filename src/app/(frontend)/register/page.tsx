'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'leitor', // valor padrão
        acceptTerms: false
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    function calculatePasswordStrength(password: string): number {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        return strength;
    }

    useEffect(() => {
        setPasswordStrength(calculatePasswordStrength(formData.password));
    }, [formData.password]);

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

        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (passwordStrength < 2) {
            setError('Senha muito fraca. Use letras, números e pelo menos 8 caracteres.');
            return;
        }

        if (!formData.acceptTerms) {
            setError('Você precisa aceitar os termos de uso.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/users/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                }),
            });

            if (!res.ok) {
                const _data = await res.json();
            }

            const loginRes = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/users/login/`, {
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

            if (loginRes.ok) {
                window.location.href = '/dashboard';
            }
        } catch (err: unknown) {
            console.error(err);
            setError('Ocorreu um erro ao criar a conta.');
        } finally {
            setLoading(false);
        }
    }

    function getStrengthLabel(): string {
        if (passwordStrength === 0) return '';
        if (passwordStrength <= 2) return 'Fraca';
        if (passwordStrength === 3) return 'Média';
        return 'Forte';
    }

    function getStrengthColor(): string {
        if (passwordStrength <= 2) return '#ef4444';
        if (passwordStrength === 3) return '#f59e0b';
        return '#10b981';
    }

    return (
        <StyledWrapper>
            <div className="form-container">
                <p className="title">Criar Conta</p>
                <p className="subtitle">Preencha seus dados</p>

                <form className="form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="name">Nome Completo</label>
                        <input 
                            type="text" 
                            name="name" 
                            id="name" 
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Seu nome"
                            required 
                        />
                    </div>

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

                    <div className="role-group">
                        <label className="role-label">Tipo de Conta</label>
                        <div className="role-cards">
                            <label className={`role-card ${formData.role === 'leitor' ? 'selected' : ''}`}>
                                <input 
                                    type="radio" 
                                    name="role" 
                                    value="leitor"
                                    checked={formData.role === 'leitor'}
                                    onChange={handleChange}
                                />
                                <div className="role-icon">🔍</div>
                                <div className="role-title">Leitor</div>
                                <div className="role-desc">Acesso de leitura</div>
                            </label>

                            <label className={`role-card ${formData.role === 'escritor' ? 'selected' : ''}`}>
                                <input 
                                    type="radio" 
                                    name="role" 
                                    value="escritor"
                                    checked={formData.role === 'escritor'}
                                    onChange={handleChange}
                                />
                                <div className="role-icon">✍️</div>
                                <div className="role-title">Escritor</div>
                                <div className="role-desc">Criar conteúdos</div>
                            </label>

                            <label className={`role-card ${formData.role === 'admin' ? 'selected' : ''}`}>
                                <input 
                                    type="radio" 
                                    name="role" 
                                    value="admin"
                                    checked={formData.role === 'admin'}
                                    onChange={handleChange}
                                />
                                <div className="role-icon">👑</div>
                                <div className="role-title">Admin</div>
                                <div className="role-desc">Controle total</div>
                            </label>
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Senha</label>
                        <input 
                            type="password" 
                            name="password" 
                            id="password" 
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Mínimo 8 caracteres"
                            required 
                        />
                        {formData.password && (
                            <div className="strength-indicator">
                                <div className="strength-bars">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div 
                                            key={i}
                                            className={`bar ${i <= passwordStrength ? 'active' : ''}`}
                                            style={{
                                                backgroundColor: i <= passwordStrength ? getStrengthColor() : 'rgba(55, 65, 81, 1)'
                                            }}
                                        />
                                    ))}
                                </div>
                                <span style={{ color: getStrengthColor() }}>
                                    {getStrengthLabel()}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="input-group">
                        <label htmlFor="confirmPassword">Confirmar Senha</label>
                        <input 
                            type="password" 
                            name="confirmPassword" 
                            id="confirmPassword" 
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Digite a senha novamente"
                            required 
                        />
                        {formData.confirmPassword && (
                            <span className={`match-indicator ${formData.password === formData.confirmPassword ? 'match' : 'no-match'}`}>
                                {formData.password === formData.confirmPassword ? '✓ Senhas coincidem' : '✗ Senhas não coincidem'}
                            </span>
                        )}
                    </div>

                    <div className="checkbox-group">
                        <input 
                            type="checkbox" 
                            name="acceptTerms" 
                            id="acceptTerms" 
                            checked={formData.acceptTerms}
                            onChange={handleChange}
                            required 
                        />
                        <label htmlFor="acceptTerms">
                            Aceito os <a href="/terms" target="_blank">termos de uso</a> e <a href="/privacy" target="_blank">política de privacidade</a>
                        </label>
                    </div>

                    {error && <p className="error-message">⚠️ {error}</p>}

                    <button className="sign" type="submit" disabled={loading}>
                        {loading ? (
                            <span className="loading">
                                <span className="spinner"></span>
                                Criando...
                            </span>
                        ) : (
                            'Criar Conta'
                        )}
                    </button>
                </form>

                <p className="signup">
                    Já possui conta?
                    <a href="/login"> Fazer login</a>
                </p>
            </div>
        </StyledWrapper>
    );
};

export default RegisterPage;

const StyledWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #1e1b4b, #3b0764);
    padding: 2rem 0;

    .form-container {
        width: 440px;
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
        margin-bottom: 1rem;
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
        padding: 0.75rem 1rem;
        color: rgba(243, 244, 246, 1);
        transition: 0.2s;
        font-size: 0.875rem;
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

    /* ROLE SELECTION CARDS */
    .role-group {
        margin-bottom: 1rem;
    }

    .role-label {
        display: block;
        color: rgba(156, 163, 175, 1);
        margin-bottom: 10px;
        font-weight: 500;
        font-size: 0.875rem;
    }

    .role-cards {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
    }

    .role-card {
        position: relative;
        background-color: rgba(31, 41, 55, 1);
        border: 2px solid rgba(55, 65, 81, 1);
        border-radius: 0.5rem;
        padding: 1rem 0.5rem;
        text-align: center;
        cursor: pointer;
        transition: 0.2s;
        user-select: none;
    }

    .role-card input[type="radio"] {
        position: absolute;
        opacity: 0;
        pointer-events: none;
    }

    .role-card:hover {
        border-color: rgba(167, 139, 250, 0.5);
        background-color: rgba(31, 41, 55, 0.8);
    }

    .role-card.selected {
        border-color: rgba(167, 139, 250, 1);
        background-color: rgba(167, 139, 250, 0.1);
        box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.1);
    }

    .role-icon {
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }

    .role-title {
        font-size: 0.875rem;
        font-weight: 600;
        color: rgba(243, 244, 246, 1);
        margin-bottom: 0.25rem;
    }

    .role-desc {
        font-size: 0.7rem;
        color: rgba(156, 163, 175, 1);
    }

    .strength-indicator {
        margin-top: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.75rem;
    }

    .strength-bars {
        display: flex;
        gap: 4px;
        flex: 1;
    }

    .bar {
        height: 4px;
        flex: 1;
        border-radius: 2px;
        transition: 0.3s;
    }

    .match-indicator {
        display: block;
        margin-top: 6px;
        font-size: 0.75rem;
    }

    .match {
        color: #10b981;
    }

    .no-match {
        color: #ef4444;
    }

    .checkbox-group {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin: 1rem 0;
        font-size: 0.75rem;
    }

    .checkbox-group input[type="checkbox"] {
        margin-top: 2px;
        cursor: pointer;
        width: 16px;
        height: 16px;
        flex-shrink: 0;
    }

    .checkbox-group label {
        color: rgba(156, 163, 175, 1);
        line-height: 1.4;
    }

    .checkbox-group a {
        color: rgba(167, 139, 250, 1);
        text-decoration: none;
    }

    .checkbox-group a:hover {
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
        text-align: center;
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
        margin-top: 1rem;
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