"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ShoppingCart,
    Box,
    Hammer,
    Calculator,
    MessageSquare,
    LogOut,
    FileText,
    Image as ImageIcon
} from "lucide-react";

const navigation = [
    { name: "Заказы", href: "/orders", icon: ShoppingCart },
    { name: "Мангалы (Товары)", href: "/products", icon: Box },
    { name: "Услуги сварки", href: "/services", icon: Hammer },
    { name: "Заявки", href: "/applications", icon: MessageSquare },
    { name: "Калькулятор", href: "/calculator", icon: Calculator },
    { name: "Контент (CMS)", href: "/content", icon: FileText },
    { name: "Портфолио", href: "/portfolio", icon: ImageIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex ext-zinc-900 dark:text-zinc-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="text-xl font-bold text-green-600 dark:text-green-500">MyBase Admin</span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive
                                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                                    }`}
                            >
                                <item.icon className="h-5 w-5 flex-shrink-0" />
                                <span className="text-sm font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors">
                        <LogOut className="h-5 w-5" />
                        <span className="text-sm font-medium">Выйти</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 flex items-center justify-between px-8 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 md:hidden">
                    <span className="text-xl font-bold text-green-600 dark:text-green-500">MyBase</span>
                    {/* Mobile menu toggle can be added here */}
                </header>
                <div className="flex-1 overflow-y-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
