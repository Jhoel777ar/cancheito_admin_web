
import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 animated-gradient-background">
      <div className="w-full max-w-md flex-grow flex items-center justify-center">
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 p-2">
              <Image 
                  src="https://arkdev.pages.dev/logos/logoarkdevsystem-removebg-preview.png"
                  width={48}
                  height={48}
                  alt="ARK DEV SYSTEM Logo"
                />
            </div>
            <CardTitle className="text-3xl font-bold">ARK ADMIN</CardTitle>
            <CardDescription>Bienvenido de nuevo. Por favor, inicia sesión para continuar.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
      <footer className="w-full py-6 text-center text-xs text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} Cancheito. Todos los derechos reservados.
        </p>
        <p className="mt-1">
          Powered by ARK DEV SYSTEM, impulsado por IA.
        </p>
      </footer>
    </main>
  );
}
