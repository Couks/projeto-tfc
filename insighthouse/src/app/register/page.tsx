'use client';
import { useState } from 'react';
import Link from "next/link";
import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";
import { ThemeToggle } from "@/lib/components/ThemeToggle";
import { ArrowLeft, Eye, EyeOff, Check } from "lucide-react";
import { apiClient } from "@/lib/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await apiClient.post("/api/auth/register", { email, password, name });
      location.href = "/login";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no registro");
    }
  };

  // Password strength indicators
  const passwordChecks = [
    { label: "Pelo menos 8 caracteres", met: password.length >= 8 },
    { label: "Contém uma letra maiúscula", met: /[A-Z]/.test(password) },
    { label: "Contém um número", met: /\d/.test(password) },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Voltar</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8">
          {/* Logo/Brand */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-light text-foreground">
              Insight House
            </h1>
            <p className="text-muted-foreground">Crie sua conta</p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      placeholder="Senha"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 text-base pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground font-medium">
                        Requisitos da senha:
                      </p>
                      <div className="space-y-1">
                        {passwordChecks.map((check, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full flex items-center justify-center ${
                                check.met ? "bg-green-500" : "bg-muted"
                              }`}
                            >
                              {check.met && (
                                <Check className="h-2 w-2 text-white" />
                              )}
                            </div>
                            <span
                              className={`text-xs ${
                                check.met
                                  ? "text-green-600"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {check.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                size="lg"
              >
                Criar conta
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">
                  ou
                </span>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link
                  href="/login"
                  className="text-foreground hover:text-foreground/80 transition-colors font-medium"
                >
                  Entrar
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-xs text-muted-foreground">
          © 2025 Insight House. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}


