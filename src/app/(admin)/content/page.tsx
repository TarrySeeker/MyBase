"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

// Типизация для контента сайта (договоренность)
interface HomeHeroContent {
    title: string;
    subtitle: string;
    buttonText: string;
}

interface ContactInfoContent {
    phone: string;
    email: string;
    address: string;
    schedule: string;
    brandName: string;
    footerDescription: string;
    socials: {
        instagram: string;
        whatsapp: string;
        telegram: string;
    };
}

interface AboutPageContent {
    title: string;
    description: string;
    stats: {
        years: string;
        projects: string;
        support: string;
        warranty: string;
    };
}

export default function ContentManagementPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Стейты для различных секций контента
    const [homeHero, setHomeHero] = useState<HomeHeroContent>({
        title: "ПРОМЫШЛЕННАЯ СВАРКА",
        subtitle: "Высокоточные сварочные работы для промышленности и частного сектора. Гарантия качества на каждый шов по ГОСТ 14771-76.",
        buttonText: "Оставить заявку"
    });

    const [contactInfo, setContactInfo] = useState<ContactInfoContent>({
        phone: "+7 (999) 000-00-00",
        email: "info@svarka-pro.ru",
        address: "Екатеринбург, Промзона, 12",
        schedule: "Пн-Пт: 9:00 - 18:00",
        brandName: "IRONFORGE",
        footerDescription: "Искусство работы с металлом. Премиальные сварочные решения для тех, кто ценит качество, точность и эстетику.",
        socials: {
            instagram: "https://instagram.com",
            whatsapp: "https://wa.me/79990000000",
            telegram: "https://t.me/svarkapro"
        }
    });

    const [aboutPage, setAboutPage] = useState<AboutPageContent>({
        title: "О Компании IRONFORGE",
        description: "Мы работаем в Екатеринбурге с 2005 года. За это время мы прошли путь от небольшой мастерской до крупного подрядчика по монтажу металлоконструкций.",
        stats: {
            years: "15+",
            projects: "500+",
            support: "24/7",
            warranty: "100%"
        }
    });

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('cms_content').select('*');
        if (error) {
            toast.error("Ошибка при загрузке контента: " + error.message);
        } else if (data) {
            data.forEach((item: any) => {
                if (item.key === 'home_hero' && item.content) {
                    setHomeHero((prev) => ({ ...prev, ...item.content }));
                }
                if (item.key === 'contact_info' && item.content) {
                    setContactInfo((prev) => ({ ...prev, ...item.content }));
                }
                if (item.key === 'about_page' && item.content) {
                    setAboutPage((prev) => ({ ...prev, ...item.content }));
                }
            });
        }
        setIsLoading(false);
    };

    const handleSave = async (key: string, contentData: any) => {
        setIsSaving(true);
        try {
            const { error } = await supabase.from('cms_content').upsert({
                key: key,
                content: contentData,
                updated_at: new Date().toISOString()
            }, { onConflict: 'key' });

            if (error) throw error;
            toast.success(`Секция успешно обновлена`);
        } catch (error: any) {
            toast.error("Ошибка сохранения: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-zinc-500">Загрузка контента...</div>;
    }

    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Контент сайта (CMS)</h1>
                <p className="text-muted-foreground mt-2">
                    Управление текстовым наполнением клиентского сайта Svarka.
                </p>
            </div>

            <Tabs defaultValue="home" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="home">Главная страница</TabsTrigger>
                    <TabsTrigger value="contacts">Брендинг и Контакты</TabsTrigger>
                    <TabsTrigger value="about">О компании</TabsTrigger>
                </TabsList>

                {/* Вкладка: Главная страница */}
                <TabsContent value="home" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Первый экран (Hero Banner)</CardTitle>
                            <CardDescription>Заголовок и текст на главном баннере сайта</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="hero_title">Крупный заголовок</Label>
                                <Input
                                    id="hero_title"
                                    value={homeHero.title}
                                    onChange={(e) => setHomeHero({ ...homeHero, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hero_subtitle">Описание под заголовком</Label>
                                <Textarea
                                    id="hero_subtitle"
                                    value={homeHero.subtitle}
                                    onChange={(e) => setHomeHero({ ...homeHero, subtitle: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hero_button">Текст на кнопке</Label>
                                <Input
                                    id="hero_button"
                                    value={homeHero.buttonText}
                                    onChange={(e) => setHomeHero({ ...homeHero, buttonText: e.target.value })}
                                />
                            </div>
                            <Button
                                onClick={() => handleSave('home_hero', homeHero)}
                                disabled={isSaving}
                                className="mt-2"
                            >
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Сохранить
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Вкладка: Контакты */}
                <TabsContent value="contacts" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Брендинг и Реквизиты</CardTitle>
                            <CardDescription>Общие настройки визуального бренда и контактов</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="brandName">Название бренда (Logo)</Label>
                                    <Input
                                        id="brandName"
                                        value={contactInfo.brandName}
                                        onChange={(e) => setContactInfo({ ...contactInfo, brandName: e.target.value })}
                                        placeholder="Например: IRONFORGE"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="footerDescription">Краткое описание в подвале</Label>
                                    <Textarea
                                        id="footerDescription"
                                        value={contactInfo.footerDescription}
                                        onChange={(e) => setContactInfo({ ...contactInfo, footerDescription: e.target.value })}
                                        rows={2}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Телефон</Label>
                                    <Input
                                        id="phone"
                                        value={contactInfo.phone}
                                        onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        value={contactInfo.email}
                                        onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="address">Адрес производства</Label>
                                    <Input
                                        id="address"
                                        value={contactInfo.address}
                                        onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-4 col-span-2 border-t pt-4">
                                    <h3 className="text-sm font-bold">Социальные сети (Ссылки)</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="instagram">Instagram</Label>
                                            <Input
                                                id="instagram"
                                                value={contactInfo.socials.instagram}
                                                onChange={(e) => setContactInfo({ ...contactInfo, socials: { ...contactInfo.socials, instagram: e.target.value } })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="whatsapp">WhatsApp</Label>
                                            <Input
                                                id="whatsapp"
                                                value={contactInfo.socials.whatsapp}
                                                onChange={(e) => setContactInfo({ ...contactInfo, socials: { ...contactInfo.socials, whatsapp: e.target.value } })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="telegram">Telegram</Label>
                                            <Input
                                                id="telegram"
                                                value={contactInfo.socials.telegram}
                                                onChange={(e) => setContactInfo({ ...contactInfo, socials: { ...contactInfo.socials, telegram: e.target.value } })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Button
                                onClick={() => handleSave('contact_info', contactInfo)}
                                disabled={isSaving}
                                className="mt-2"
                            >
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Сохранить
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Вкладка: О компании */}
                <TabsContent value="about" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Страница "О компании"</CardTitle>
                            <CardDescription>Управление текстом и статистикой</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="about_title">Заголовок страницы</Label>
                                <Input
                                    id="about_title"
                                    value={aboutPage.title}
                                    onChange={(e) => setAboutPage({ ...aboutPage, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="about_description">Основной текст (Интро)</Label>
                                <Textarea
                                    id="about_description"
                                    value={aboutPage.description}
                                    onChange={(e) => setAboutPage({ ...aboutPage, description: e.target.value })}
                                    rows={5}
                                />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="stat_years">Лет опыта</Label>
                                    <Input
                                        id="stat_years"
                                        value={aboutPage.stats.years}
                                        onChange={(e) => setAboutPage({ ...aboutPage, stats: { ...aboutPage.stats, years: e.target.value } })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stat_projects">Проектов</Label>
                                    <Input
                                        id="stat_projects"
                                        value={aboutPage.stats.projects}
                                        onChange={(e) => setAboutPage({ ...aboutPage, stats: { ...aboutPage.stats, projects: e.target.value } })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stat_support">Поддержка</Label>
                                    <Input
                                        id="stat_support"
                                        value={aboutPage.stats.support}
                                        onChange={(e) => setAboutPage({ ...aboutPage, stats: { ...aboutPage.stats, support: e.target.value } })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stat_warranty">Гарантия</Label>
                                    <Input
                                        id="stat_warranty"
                                        value={aboutPage.stats.warranty}
                                        onChange={(e) => setAboutPage({ ...aboutPage, stats: { ...aboutPage.stats, warranty: e.target.value } })}
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={() => handleSave('about_page', aboutPage)}
                                disabled={isSaving}
                                className="mt-2"
                            >
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Сохранить
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
}
