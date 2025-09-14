import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-white/70 dark:bg-black/30 backdrop-blur sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight text-xl">
            <span className="inline-block h-6 w-6 rounded bg-gradient-to-br from-violet-500 to-indigo-600" />
            PortFolioo
          </Link>
          <nav className="flex items-center gap-3">
            <Link to="/u/demo" className="text-sm text-muted-foreground hover:text-foreground">Примеры</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Панель</Link>
                <Link to={`/u/${user.username}`} className="text-sm text-muted-foreground hover:text-foreground">Моё портфолио</Link>
                <Button variant="outline" onClick={() => { logout(); nav("/"); }}>Выйти</Button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">Войти</Link>
                <Link to="/register" className="text-sm text-muted-foreground hover:text-foreground">Регистрация</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t mt-16">
        <div className="container py-8 text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} PortFolioo</p>
          <p className="opacity-80">Создайте портфолио за минуты</p>
        </div>
      </footer>
    </div>
  );
}
