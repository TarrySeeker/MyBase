"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (error) {
            toast.error("Ошибка при загрузке заказов");
        } else {
            setOrders(data || []);
        }
        setIsLoading(false);
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
        if (error) {
            toast.error("Ошибка обновления статуса");
        } else {
            toast.success("Статус обновлен");
            fetchOrders();
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'new': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Новый</Badge>;
            case 'processing': return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">В обработке</Badge>;
            case 'completed': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Выполнен</Badge>;
            case 'cancelled': return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Отменен</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Заказы (Мангалы)</h1>
                <p className="text-muted-foreground mt-2">
                    Управление заказами из интернет-магазина
                </p>
            </div>

            <div className="border rounded-md bg-white dark:bg-zinc-950">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Дата</TableHead>
                            <TableHead>Клиент</TableHead>
                            <TableHead>Комментарий</TableHead>
                            <TableHead>Сумма</TableHead>
                            <TableHead>Доставка</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead>Товары</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">Загрузка...</TableCell>
                            </TableRow>
                        ) : orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">Заказов пока нет</TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="whitespace-nowrap">
                                        {format(new Date(order.created_at), "dd MMM yyyy HH:mm", { locale: ru })}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{order.customer_info?.name || "Без имени"}</div>
                                        <div className="text-sm text-muted-foreground">{order.customer_info?.phone}</div>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">
                                        {order.customer_info?.comment || "—"}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {order.total.toLocaleString('ru-RU')} ₽
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm font-medium">{order.shipping_method || 'Самовывоз / Не выбран'}</div>
                                        {Number(order.shipping_cost) > 0 && <div className="text-xs text-muted-foreground">+{Number(order.shipping_cost).toLocaleString('ru-RU')} ₽</div>}
                                        {order.delivery_detail && (
                                            <div className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                                                {order.delivery_detail.city}, {order.delivery_detail.address}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(order.status)}
                                            <Select defaultValue={order.status} onValueChange={(val) => handleStatusChange(order.id, val)}>
                                                <SelectTrigger className="w-[140px] h-8">
                                                    <SelectValue placeholder="Сменить" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="new">Новый</SelectItem>
                                                    <SelectItem value="processing">В обработке</SelectItem>
                                                    <SelectItem value="completed">Выполнен</SelectItem>
                                                    <SelectItem value="cancelled">Отменен</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            {order.items?.map((item: any, idx: number) => (
                                                <div key={idx} className="text-sm">
                                                    {item.quantity}x {item.name}
                                                </div>
                                            ))}
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
