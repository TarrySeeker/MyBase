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

export default function ServicesPage() {
    const [services, setServices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<any | null>(null);
    const [uploadImageUrl, setUploadImageUrl] = useState<string>("");

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false });
        if (error) {
            toast.error("Ошибка при загрузке услуг");
        } else {
            setServices(data || []);
        }
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Удалить эту услугу?")) return;
        const { error } = await supabase.from('services').delete().eq('id', id);
        if (error) {
            toast.error("Ошибка удаления");
        } else {
            toast.success("Услуга удалена");
            fetchServices();
        }
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const serviceData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            price: formData.get('price') as string,
            category: formData.get('category') as string,
            image: formData.get('image') as string || '',
        };

        if (editingService) {
            const { error } = await supabase.from('services').update(serviceData).eq('id', editingService.id);
            if (error) toast.error("Ошибка обновления");
            else toast.success("Услуга обновлена");
        } else {
            const { error } = await supabase.from('services').insert([serviceData]);
            if (error) toast.error("Ошибка добавления");
            else toast.success("Услуга добавлена");
        }

        setIsDialogOpen(false);
        setEditingService(null);
        fetchServices();
    };

    const openEdit = (service: any) => {
        setEditingService(service);
        setUploadImageUrl(service.image || "");
        setIsDialogOpen(true);
    };

    const openAdd = () => {
        setEditingService(null);
        setUploadImageUrl("");
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Услуги сварки</h1>
                    <p className="text-muted-foreground mt-2">Управление услугами на сайте Svarka</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Добавить услугу</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>{editingService ? "Редактировать услугу" : "Новая услуга"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Название</Label>
                                    <Input id="title" name="title" defaultValue={editingService?.title} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Категория</Label>
                                    <Input id="category" name="category" defaultValue={editingService?.category} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Цена (строка, напр. "от 500 ₽ / м")</Label>
                                    <Input id="price" name="price" defaultValue={editingService?.price} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Изображение (Загрузите или перетащите файл)</Label>
                                    <ImageUploader
                                        currentImage={uploadImageUrl}
                                        onUploadAction={(url) => setUploadImageUrl(url)}
                                        bucketName="products"
                                    />
                                    <input type="hidden" name="image" value={uploadImageUrl} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Описание</Label>
                                <Textarea id="description" name="description" defaultValue={editingService?.description} rows={3} />
                            </div>
                            <div className="pt-4 flex justify-end">
                                <Button type="submit">Сохранить</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md bg-white dark:bg-zinc-950">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Название</TableHead>
                            <TableHead>Категория</TableHead>
                            <TableHead>Цена от</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">Загрузка...</TableCell>
                            </TableRow>
                        ) : services.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">Услуги не найдены</TableCell>
                            </TableRow>
                        ) : (
                            services.map((service) => (
                                <TableRow key={service.id}>
                                    <TableCell className="font-medium">{service.title}</TableCell>
                                    <TableCell>{service.category}</TableCell>
                                    <TableCell>{service.price}</TableCell>
                                    <TableCell>
                                        <span className={'px-2 py-1 rounded-full text-xs bg-green-100 text-green-800'}>
                                            Активна
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(service)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(service.id)}>
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
