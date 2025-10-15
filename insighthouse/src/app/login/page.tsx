'use client';
import { useState } from 'react';
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setError(j.error || "Falha no login");
      return;
    }
    location.href = "/admin";
  };

  return (
    <div className="mx-auto max-w-sm p-6">
      <Card>
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Acesse sua dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-3">
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              placeholder="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <div className="text-sm text-red-600">{error}</div>}
            <Button className="w-full" type="submit">
              Entrar
            </Button>
          </form>
          <div className="text-xs text-muted-foreground mt-3">
            Não tem conta?{" "}
            <Link className="underline" href="/register">
              Registre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


