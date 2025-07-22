
'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageSquareText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { login, signup } from '@/app/auth/actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    startTransition(async () => {
      const { error } = isLogin ? await login(formData) : await signup(formData);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Authentication Failed',
          description: error,
        });
      } else {
        toast({
          title: 'Success!',
          description: isLogin ? 'You are now logged in.' : 'Account created. Please log in.',
        });
        if (isLogin) {
          router.push('/');
          router.refresh();
        } else {
          setIsLogin(true); // Switch to login view after signup
          // Clear form fields
          (event.target as HTMLFormElement).reset();
        }
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <MessageSquareText className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="font-headline text-3xl">Preach It SMS</CardTitle>
          <CardDescription>
            {isLogin ? 'Sign in to your account' : 'Create the first admin account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" name="fullName" required />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="name@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
             {!isLogin && (
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" required />
                </div>
            )}
            <Button type="submit" className="w-full !mt-6" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-4">
            <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-primary hover:underline"
                disabled={isPending}
            >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
            {isLogin && (
                 <Link
                    href="/forgot-password"
                    className="text-sm text-muted-foreground hover:underline"
                 >
                    Forgot your password?
                </Link>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
