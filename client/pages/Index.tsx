import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Index() {
  return (
    <section className="bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-violet-900/20 dark:via-background dark:to-indigo-900/20">
      <div className="container py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground bg-white/60 dark:bg-black/20">
              Для фрилансеров, дизайнеров и разработчиков
            </div>
            <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">
              Создайте онлайн‑портфолио за считанные минуты
            </h1>
            <p className="mt-4 text-muted-foreground text-lg">
              Минималистичный и адаптивный конструктор портфолио. Регистрируйтесь, добавляйте проекты и делитесь ссылкой вида /u/username.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/register"><Button className="bg-gradient-to-r from-violet-600 to-indigo-600">Начать бесплатно</Button></Link>
              <Link to="/login"><Button variant="outline">У меня уже есть аккаунт</Button></Link>
            </div>
            <ul className="mt-8 grid gap-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-violet-600"/> Регистрация и вход с защитой паролей (bcrypt)</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-violet-600"/> CRUD проектов с изображениями</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-violet-600"/> Публичная страница /u/:username</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-violet-600"/> Совместимо с GitHub Pages (build:docs)</li>
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-violet-500/20 to-indigo-500/20 blur-2xl rounded-3xl"/>
            <div className="relative rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="p-4 border-b flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400"/>
                <div className="h-3 w-3 rounded-full bg-yellow-400"/>
                <div className="h-3 w-3 rounded-full bg-green-400"/>
                <span className="ml-2 text-sm text-muted-foreground">Портфолио — Превью</span>
              </div>
              <div className="p-6 grid sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="h-40 rounded-lg bg-gradient-to-br from-indigo-200 to-violet-200"/>
                  <div className="h-3 w-3/4 rounded bg-muted"/>
                  <div className="h-3 w-2/3 rounded bg-muted"/>
                </div>
                <div className="space-y-3">
                  <div className="h-40 rounded-lg bg-gradient-to-br from-indigo-200 to-violet-200"/>
                  <div className="h-3 w-3/4 rounded bg-muted"/>
                  <div className="h-3 w-2/3 rounded bg-muted"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
