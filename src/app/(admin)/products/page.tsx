"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/ImageUploader";

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [uploadImageUrls, setUploadImageUrls] = useState<string[]>([]);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (error) {
            toast.error("Ошибка при загрузке товаров");
        } else {
            setProducts(data || []);
        }
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Удалить этот товар?")) return;
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
            toast.error("Ошибка удаления");
        } else {
            toast.success("Товар удален");
            fetchProducts();
        }
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const productData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            price: parseFloat(formData.get('price') as string),
            category: formData.get('category') as string,
            is_active: formData.get('is_active') === 'on',
            weight: parseFloat(formData.get('weight') as string) || 20000,
            dimensions: {
                length: parseFloat(formData.get('length') as string) || 60,
                width: parseFloat(formData.get('width') as string) || 40,
                height: parseFloat(formData.get('height') as string) || 40,
            },
            images: uploadImageUrls,
        };

        if (editingProduct) {
            const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
            if (error) toast.error("Ошибка обновления");
            else toast.success("Товар обновлен");
        } else {
            const { error } = await supabase.from('products').insert([productData]);
            if (error) toast.error("Ошибка добавления");
            else toast.success("Товар добавлен");
        }

        setIsDialogOpen(false);
        setEditingProduct(null);
        fetchProducts();
    };

    const openEdit = (product: any) => {
        setEditingProduct(product);
        setUploadImageUrls(product.images || []);
        setIsDialogOpen(true);
    };

    const openAdd = () => {
        setEditingProduct(null);
        setUploadImageUrls([]);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Мангалы (Товары)</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Добавить товар</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>{editingProduct ? "Редактировать товар" : "Новый товар"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Название</Label>
                                <Input id="title" name="title" defaultValue={editingProduct?.title} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Категория</Label>
                                <Input id="category" name="category" defaultValue={editingProduct?.category} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Цена (₽)</Label>
                                <Input id="price" name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Описание</Label>
                                <Textarea id="description" name="description" defaultValue={editingProduct?.description} rows={4} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="weight">Вес (граммы)</Label>
                                    <Input id="weight" name="weight" type="number" defaultValue={editingProduct?.weight || 20000} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Габариты (Д×Ш×В см)</Label>
                                    <div className="flex gap-2">
                                        <Input name="length" type="number" placeholder="Д" defaultValue={editingProduct?.dimensions?.length || 60} required />
                                        <Input name="width" type="number" placeholder="Ш" defaultValue={editingProduct?.dimensions?.width || 40} required />
                                        <Input name="height" type="number" placeholder="В" defaultValue={editingProduct?.dimensions?.height || 40} required />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Фотографии мангала (до 5 штук)</Label>
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    {uploadImageUrls.map((url, idx) => (
                                        <div key={idx} className="relative aspect-square border rounded overflow-hidden">
                                            <img src={url} alt={`Photo ${idx}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setUploadImageUrls(prev => prev.filter((_, i) => i !== idx))}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded p-1 hover:bg-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {uploadImageUrls.length < 5 && (
                                    <ImageUploader
                                        currentImage=""
                                        onUploadAction={(url) => {
                                            if (url) {
                                                setUploadImageUrls(prev => [...prev, url]);
                                            }
                                        }}
                                        bucketName="products"
                                    />
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" id="is_active" name="is_active" defaultChecked={editingProduct ? editingProduct.is_active : true} className="rounded border-gray-300" />
                                <Label htmlFor="is_active">Активен (Отображать на сайте)</Label>
                            </div>
                            <div className="pt-4 flex justify-end">
                                <Button type="submit">Сохранить</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Название</TableHead>
                            <TableHead>Категория</TableHead>
                            <TableHead>Цена</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">Загрузка...</TableCell>
                            </TableRow>
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">Товары не найдены</TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.title}</TableCell>
                                    <TableCell>{product.category}</TableCell>
                                    <TableCell>{product.price.toLocaleString('ru-RU')} ₽</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-zinc-100 text-zinc-800'}`}>
                                            {product.is_active ? "Активен" : "Скрыт"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(product.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
