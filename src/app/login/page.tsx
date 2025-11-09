'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser } from '@/firebase';
import { UtensilsCrossed, LogIn } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleAuthAction = async (
    action: 'signIn' | 'signUp',
    values: z.infer<typeof formSchema>
  ) => {
    if (!auth) return;
    setIsSubmitting(true);
    const { email, password } = values;
    try {
      if (action === 'signIn') {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: 'Signed in successfully!' });
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: 'Account created successfully!' });
      }
      // Redirect is handled by the useEffect hook
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description:
          error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password'
            ? 'Invalid email or password.'
            : error.code === 'auth/email-already-in-use'
            ? 'An account with this email already exists.'
            : 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <UtensilsCrossed className="mb-4 h-16 w-16 text-primary" />
          <h1 className="text-4xl font-bold font-headline text-foreground">
            TiffinTrack
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sign in or create an account to manage your tiffin service.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              handleAuthAction('signIn', values)
            )}
            className="mt-8 space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col space-y-2 pt-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                <LogIn className="mr-2 h-5 w-5" />
                Sign In
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={form.handleSubmit((values) =>
                  handleAuthAction('signUp', values)
                )}
                disabled={isSubmitting}
              >
                Sign Up
              </Button>
            </div>
          </form>
        </Form>
        <p className="mt-8 px-8 text-center text-sm text-muted-foreground">
          By signing in or creating an account, you agree to our Terms of
          Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
