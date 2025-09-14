import { FormEvent, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      login(res.token, res.user);
      nav("/dashboard");
    } catch (err: any) {
      setError("Неверный email или пароль");
    }
  };

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold">Вход</h1>
      <form onSubmit={onSubmit} className="mt-6 max-w-md space-y-4">
        <input className="w-full border rounded px-3 py-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button type="submit" className="w-full">Войти</Button>
      </form>
    </div>
  );
}
