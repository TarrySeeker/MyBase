"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('applications').select('*').order('created_at', { ascending: false });
        if (error) {
            toast.error("Ошибка при загрузке заявок");
        } else {
            setApplications(data || []);
        }
        setIsLoading(false);
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        const { error } = await supabase.from('applications').update({ status: newStatus }).eq('id', id);
        if (error) {
            toast.error("Ошибка обновления статуса");
        } else {
            toast.success("Статус обновлен");
            fetchApplications();
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'new': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Новая</Badge>;
            case 'processing': return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">В работе</Badge>;
            case 'completed': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Обработана</Badge>;
            case 'rejected': return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Отклонена</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Заявки</h1>
                <p className="text-muted-foreground mt-2">
                    Входящие заявки на расчет стоимости и обратный звонок
                </p>
            </div>

            <div className="border rounded-md bg-white dark:bg-zinc-950">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Дата</TableHead>
                            <TableHead>Имя</TableHead>
                            <TableHead>Телефон</TableHead>
                            <TableHead>Детали / Комментарий</TableHead>
                            <TableHead>Статус</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">Загрузка...</TableCell>
                            </TableRow>
                        ) : applications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">Заявок пока нет</TableCell>
                            </TableRow>
                        ) : (
                            applications.map((app) => (
                                <TableRow key={app.id}>
                                    <TableCell className="whitespace-nowrap">
                                        {format(new Date(app.created_at), "dd MMM yyyy HH:mm", { locale: ru })}
                                    </TableCell>
                                    <TableCell className="font-medium">{app.name}</TableCell>
                                    <TableCell>{app.phone}</TableCell>
                                    <TableCell className="max-w-[400px]">
                                        <p className="truncate text-sm" title={app.details}>{app.details || "—"}</p>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(app.status)}
                                            <Select defaultValue={app.status} onValueChange={(val) => handleStatusChange(app.id, val)}>
                                                <SelectTrigger className="w-[140px] h-8">
                                                    <SelectValue placeholder="Сменить" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="new">Новая</SelectItem>
                                                    <SelectItem value="processing">В работе</SelectItem>
                                                    <SelectItem value="completed">Обработана</SelectItem>
                                                    <SelectItem value="rejected">Отклонена</SelectItem>
                                                </SelectContent>
                                            </Select>
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
