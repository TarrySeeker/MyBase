import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Hammer, MessageSquare } from "lucide-react";
import { supabase } from "@/utils/supabase/server";

export default async function DashboardPage() {
    // В реальном проекте мы бы получали эти данные из БД
    // Для MVP админки мы можем вывести плейсхолдеры или сделать быстрые запросы
    const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { count: servicesCount } = await supabase.from('services').select('*', { count: 'exact', head: true });
    const { count: applicationsCount } = await supabase.from('applications').select('*', { count: 'exact', head: true });

    const stats = [
        {
            title: "Всего заказов",
            value: ordersCount || 0,
            icon: ShoppingCart,
            color: "text-blue-500",
        },
        {
            title: "Товары (Мангалы)",
            value: productsCount || 0,
            icon: Package,
            color: "text-green-500",
        },
        {
            title: "Услуги",
            value: servicesCount || 0,
            icon: Hammer,
            color: "text-orange-500",
        },
        {
            title: "Новые заявки",
            value: applicationsCount || 0,
            icon: MessageSquare,
            color: "text-purple-500",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Дашборд</h1>
                <p className="text-muted-foreground mt-2">
                    Сводная информация по вашему проекту
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Последние действия</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Здесь будет лог последних событий...</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
