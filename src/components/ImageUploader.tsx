"use client";

import React, { useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { UploadCloud, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploaderProps {
    onUploadAction: (url: string) => void;
    currentImage?: string;
    bucketName?: string;
}

export function ImageUploader({ onUploadAction, currentImage = "", bucketName = "products" }: ImageUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string>(currentImage);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            uploadFile(files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            uploadFile(files[0]);
        }
    };

    const uploadFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error("Пожалуйста, выберите изображение");
            return;
        }

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: publicUrlData } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath);

            const url = publicUrlData.publicUrl;
            setPreviewUrl(url);
            onUploadAction(url);
            toast.success("Изображение успешно загружено");

        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error("Ошибка при загрузке: " + (error.message || "Неизвестная ошибка"));
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const clearImage = () => {
        setPreviewUrl("");
        onUploadAction("");
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="w-full">
            {previewUrl ? (
                <div className="relative w-full aspect-video rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-800 group bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                    <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-white text-black px-3 py-1 rounded text-sm font-medium hover:bg-gray-200"
                        >
                            Изменить
                        </button>
                        <button
                            type="button"
                            onClick={clearImage}
                            className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full h-40 border-2 border-dashed rounded-md flex flex-col justify-center items-center cursor-pointer transition-colors ${isDragging
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                        }`}
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center text-zinc-500">
                            <Loader2 className="w-8 h-8 mb-2 animate-spin" />
                            <span className="text-sm font-medium">Загрузка...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-zinc-500">
                            <UploadCloud className="w-10 h-10 mb-2 text-zinc-400" />
                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Нажмите или перетащите файл</span>
                            <span className="text-xs text-zinc-400 mt-1">PNG, JPG, WEBP до 5MB</span>
                        </div>
                    )}
                </div>
            )}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading}
            />
        </div>
    );
}
