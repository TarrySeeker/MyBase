"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

export default function CalculatorSettingsPage() {
    const [settings, setSettings] = useState<Record<string, number>>({
        rate_mig: 500,
        rate_tig: 800,
        rate_stick: 600,
        mult_aluminum: 1.5,
        mult_stainless: 1.8,
        mult_titanium: 3.0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('calculator_settings').select('key, value');
        if (error) {
            toast.error("Ошибка при загрузке настроек");
        } else if (data) {
            const settingsMap: Record<string, number> = { ...settings };
            data.forEach((item: any) => {
                settingsMap[item.key] = Number(item.value);
            });
            setSettings(settingsMap);
        }
        setIsLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const updates = Object.entries(settings).map(([key, value]) => ({
                key,
                value,
            }));

            // Обновляем каждую настройку. upsert может потребовать добавления всех NOT NULL полей,
            // поэтому надежнее сделать update, но если ключей нет - их надо создать.
            // Предполагаем, что ключи уже существуют, так как мы их закладываем.
            const { error } = await supabase.from('calculator_settings').upsert(updates, { onConflict: 'key' });

            if (error) {
                // Если не получилось upsert (из-за недостатка полей), попробуем последовательный update
                console.warn("Upsert failed, trying sequential update");
                for (const update of updates) {
                    await supabase.from('calculator_settings').update({ value: update.value }).eq('key', update.key);
                }
            }

            toast.success("Настройки калькулятора успешно обновлены");
        } catch (error: any) {
            console.error(error);
            toast.error("Ошибка сохранения: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: Number(value) }));
    };

    if (isLoading) {
        return <div className="p-8 text-center text-zinc-500">Загрузка настроек...</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Редактор Калькулятора</h1>
                <p className="text-muted-foreground mt-2">
                    Изменяйте базовую стоимость швов и коэффициенты наценки для разных металлов. Изменения сразу отразятся на сайте.
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Базовые ставки */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Базовая цена сварки</CardTitle>
                            <CardDescription>Стоимость за 1 метр шва для простой стали</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="rate_mig">MIG (Полуавтомат), ₽/м</Label>
                                <Input
                                    id="rate_mig"
                                    type="number"
                                    value={settings.rate_mig || ""}
                                    onChange={(e) => handleChange("rate_mig", e.target.value)}
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rate_stick">MMA (Электрод), ₽/м</Label>
                                <Input
                                    id="rate_stick"
                                    type="number"
                                    value={settings.rate_stick || ""}
                                    onChange={(e) => handleChange("rate_stick", e.target.value)}
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rate_tig">TIG (Аргон), ₽/м</Label>
                                <Input
                                    id="rate_tig"
                                    type="number"
                                    value={settings.rate_tig || ""}
                                    onChange={(e) => handleChange("rate_tig", e.target.value)}
                                    min="0"
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Коэффициенты материала */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Коэффициенты металла</CardTitle>
                            <CardDescription>На какую величину умножается базовая цена (для стали = 1)</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="mult_aluminum">Алюминий (множитель)</Label>
                                <Input
                                    id="mult_aluminum"
                                    type="number"
                                    step="0.1"
                                    value={settings.mult_aluminum || ""}
                                    onChange={(e) => handleChange("mult_aluminum", e.target.value)}
                                    min="1"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Например: 1.5 означает, что выйдет на 50% дороже стали.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mult_stainless">Нержавейка (множитель)</Label>
                                <Input
                                    id="mult_stainless"
                                    type="number"
                                    step="0.1"
                                    value={settings.mult_stainless || ""}
                                    onChange={(e) => handleChange("mult_stainless", e.target.value)}
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mult_titanium">Титан (множитель)</Label>
                                <Input
                                    id="mult_titanium"
                                    type="number"
                                    step="0.1"
                                    value={settings.mult_titanium || ""}
                                    onChange={(e) => handleChange("mult_titanium", e.target.value)}
                                    min="1"
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {isSaving ? "Сохранение..." : "Сохранить настройки"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
