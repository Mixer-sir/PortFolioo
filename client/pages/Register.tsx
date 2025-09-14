import { FormEvent, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Register() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, username, password }),
      });
      login(res.token, res.user);
      nav("/dashboard");
    } catch (err: any) {
      setError("Не удалось зарегистрироваться");
    }
  };

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold">Регистрация</h1>
      <form onSubmit={onSubmit} className="mt-6 max-w-md space-y-4">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button type="submit" className="w-full">
          Создать аккаунт
        </Button>
      </form>
    </div>
  );
}
