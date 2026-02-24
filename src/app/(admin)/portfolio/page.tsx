"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";

export default function PortfolioManagementPage() {
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);

    // Стейты картинок
    const [beforeImage, setBeforeImage] = useState<string>("");
    const [afterImage, setAfterImage] = useState<string>("");

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('portfolio_items').select('*').order('sort_order', { ascending: true });
        if (error) {
            toast.error("Ошибка при загрузке портфолио: " + error.message);
        } else if (data) {
            setItems(data);
        }
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Вы уверены, что хотите удалить эту запись?")) return;
        const { error } = await supabase.from('portfolio_items').delete().eq('id', id);
        if (error) toast.error("Ошибка удаления: " + error.message);
        else {
            toast.success("Запись удалена");
            setItems(items.filter(item => item.id !== id));
        }
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const itemData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            sort_order: Number(formData.get('sort_order')) || 0,
            before_image: beforeImage,
            after_image: afterImage,
        };

        if (editingItem) {
            const { error } = await supabase.from('portfolio_items').update(itemData).eq('id', editingItem.id);
            if (error) toast.error("Ошибка обновления: " + error.message);
            else toast.success("Запись обновлена");
        } else {
            const { error } = await supabase.from('portfolio_items').insert([itemData]);
            if (error) toast.error("Ошибка добавления: " + error.message);
            else toast.success("Запись добавлена");
        }

        setIsDialogOpen(false);
        setEditingItem(null);
        fetchItems();
    };

    const openEdit = (item: any) => {
        setEditingItem(item);
        setBeforeImage(item.before_image || "");
        setAfterImage(item.after_image || "");
        setIsDialogOpen(true);
    };

    const openAdd = () => {
        setEditingItem(null);
        setBeforeImage("");
        setAfterImage("");
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Портфолио</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Добавить работу</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingItem ? "Редактировать работу" : "Новая работа в портфолио"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-6 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Название проекта</Label>
                                <Input id="title" name="title" defaultValue={editingItem?.title} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Описание проделанной работы</Label>
                                <Textarea id="description" name="description" defaultValue={editingItem?.description} rows={3} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sort_order">Порядок отображения (чем меньше, тем выше)</Label>
                                <Input id="sort_order" name="sort_order" type="number" defaultValue={editingItem?.sort_order || 0} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Фото "ДО"</Label>
                                    <ImageUploader
                                        currentImage={beforeImage}
                                        onUploadAction={(url) => setBeforeImage(url)}
                                        bucketName="products"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Фото "ПОСЛЕ"</Label>
                                    <ImageUploader
                                        currentImage={afterImage}
                                        onUploadAction={(url) => setAfterImage(url)}
                                        bucketName="products"
                                    />
                                </div>
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
                            <TableHead>Порядок</TableHead>
                            <TableHead>Фото</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8">Загрузка...</TableCell>
                            </TableRow>
                        ) : items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8">В портфолио пока нет записей</TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.title}</TableCell>
                                    <TableCell>{item.sort_order}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            {item.before_image && <img src={item.before_image} alt="Before" className="w-10 h-10 object-cover rounded" />}
                                            {item.after_image && <img src={item.after_image} alt="After" className="w-10 h-10 object-cover rounded" />}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="icon" onClick={() => openEdit(item)}>
                                                <Pencil className="h-4 w-4 text-blue-500" />
                                            </Button>
                                            <Button variant="outline" size="icon" onClick={() => handleDelete(item.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
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
