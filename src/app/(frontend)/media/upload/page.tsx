'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const MediaUploadPage = () => {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [altText, setAltText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [preview, setPreview] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validar tipo de arquivo
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(selectedFile.type)) {
            setError('❌ Formato inválido. Use: JPG, PNG, WebP ou GIF');
            return;
        }

        // Validar tamanho (máx 10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('❌ Arquivo muito grande. Máximo 10MB');
            return;
        }

        setFile(selectedFile);
        setError('');

        // ✅ Definir alt automaticamente se vazio
        if (!altText) {
            setAltText(selectedFile.name.replace(/\.[^/.]+$/, ''));
        }

        // Mostrar preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            setError('Selecione um arquivo');
            return;
        }

        if (!altText.trim()) {
            setError('Descrição da imagem é obrigatória');
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append('file', file);
            // ✅ ADICIONAR: Campo alt (obrigatório)
            formData.append('alt', altText.trim());

            const response = await fetch(`${API_URL}/media`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Erro:', errorData);
                throw new Error(errorData.message || 'Erro ao fazer upload');
            }

            // consume JSON response without creating an unused variable
            await response.json();
            alert('✅ Mídia enviada com sucesso!');
            router.push('/media');
        } catch (error: unknown) {
            if (typeof error === 'string') {
                setError(error);
            } else if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('Erro ao fazer upload');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <FormWrapper>
                <Header>
                    <Logo>📸</Logo>
                    <Title>Upload de Mídia</Title>
                    <Subtitle>Envie suas imagens</Subtitle>
                </Header>

                <Form onSubmit={handleSubmit}>
                    {error && <ErrorMessage>⚠️ {error}</ErrorMessage>}

                    {preview && (
                        <PreviewContainer>
                            <PreviewImage src={preview} alt="Preview" />
                        </PreviewContainer>
                    )}

                    <FileInputWrapper>
                        <FileInput
                            id="fileInput"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={loading}
                        />
                        <FileLabel htmlFor="fileInput">
                            {file ? `✅ ${file.name}` : '📁 Clique para selecionar ou arraste'}
                        </FileLabel>
                    </FileInputWrapper>

                    {/* ✅ NOVO: Campo de descrição */}
                    {file && (
                        <FormGroup>
                            <Label>Descrição da Imagem</Label>
                            <Input
                                type="text"
                                placeholder="Ex: Foto do dashboard"
                                value={altText}
                                onChange={(e) => setAltText(e.target.value)}
                                disabled={loading}
                            />
                            <Hint>Use uma descrição curta que explique o que a imagem mostra</Hint>
                        </FormGroup>
                    )}

                    <FormActions>
                        <CancelButton
                            type="button"
                            onClick={() => router.back()}
                            disabled={loading}
                        >
                            Cancelar
                        </CancelButton>
                        <SubmitButton type="submit" disabled={loading || !file || !altText.trim()}>
                            {loading ? 'Enviando...' : '✓ Enviar'}
                        </SubmitButton>
                    </FormActions>
                </Form>

                <BackLink type="button" onClick={() => router.push('/media')}>
                    ← Ver todas as mídias
                </BackLink>
            </FormWrapper>
        </Container>
    );
};

export default MediaUploadPage;

// Styled Components
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

const PreviewContainer = styled.div`
    margin-bottom: 2rem;
    text-align: center;
`;

const PreviewImage = styled.img`
    max-width: 100%;
    max-height: 300px;
    border-radius: 0.75rem;
    border: 2px solid rgba(139, 92, 246, 0.3);
`;

const FileInputWrapper = styled.div`
    position: relative;
    margin-bottom: 1.5rem;
`;

const FileInput = styled.input`
    display: none;
`;

const FileLabel = styled.label`
    display: block;
    padding: 2rem;
    background: rgba(31, 41, 55, 1);
    border: 2px dashed rgba(139, 92, 246, 0.3);
    border-radius: 0.75rem;
    text-align: center;
    color: rgba(156, 163, 175, 1);
    cursor: pointer;
    transition: 0.2s;

    &:hover {
        border-color: rgba(167, 139, 250, 1);
        background: rgba(139, 92, 246, 0.1);
        color: rgba(243, 244, 246, 1);
    }
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
`;

const FormActions = styled.div`
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
`;

const CancelButton = styled.button`
    flex: 1;
    background: rgba(17, 24, 39, 0.5);
    border: 1px solid rgba(139, 92, 246, 0.2);
    color: rgba(243, 244, 246, 1);
    padding: 0.75rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 600;
    transition: 0.2s;

    &:hover:not(:disabled) {
        background: rgba(139, 92, 246, 0.1);
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
    padding: 0.75rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 600;
    transition: 0.2s;

    &:hover:not(:disabled) {
        background: rgba(124, 58, 237, 1);
    }

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;

const BackLink = styled.button`
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

    &:hover {
        color: rgba(243, 244, 246, 1);
    }
`;