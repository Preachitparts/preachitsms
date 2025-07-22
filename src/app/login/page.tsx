
'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageSquareText, Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { login, signup } from '@/app/auth/actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    startTransition(async () => {
      const result = isLogin ? await login(formData) : await signup(formData);

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Authentication Failed',
          description: result.error,
        });
      } else if (result.success) {
        if (isLogin) {
          toast({
            title: 'Success!',
            description: 'You are now logged in.',
          });
          router.push('/');
        } else {
            toast({
                title: 'Account Created!',
                description: 'Your account has been created. Please sign in to continue.',
            });
          setIsLogin(true);
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
            {isLogin ? 'Sign in to your account' : 'Create an administrator account'}
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
               <div className="relative">
                <Input id="password" name="password" type={showPassword ? 'text' : 'password'} required />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute inset-y-0 right-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? <EyeOff /> : <Eye />}
                    <span className="sr-only">{showPassword ? 'Hide' : 'Show'} password</span>
                </Button>
               </div>
            </div>
             {!isLogin && (
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                     <div className="relative">
                        <Input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} required />
                         <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute inset-y-0 right-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff /> : <Eye />}
                        </Button>
                    </div>
                </div>
            )}
            <Button type="submit" className="w-full !mt-6" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-4">
            <Button
                variant="link"
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-primary hover:underline"
                disabled={isPending}
            >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </Button>
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
