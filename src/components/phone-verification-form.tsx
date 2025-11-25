'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { User } from 'firebase/auth';
import type { DocumentReference } from 'firebase/firestore';
import { updateDoc } from 'firebase/firestore';

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
import { Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { UserData } from '@/lib/types';

interface PhoneVerificationFormProps {
  user: User;
  userDocRef: DocumentReference | null;
  userData: UserData | null;
}

const phoneFormSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, {
      message:
        'Enter a valid phone number with country code (e.g., +919876543210).',
    }),
});

export default function PhoneVerificationForm({
  user,
  userDocRef,
  userData,
}: PhoneVerificationFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof phoneFormSchema>>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: { phoneNumber: '' },
  });

  useEffect(() => {
    if (userData?.phoneNumber) {
      form.reset({ phoneNumber: userData.phoneNumber });
    }
  }, [userData, form]);

  const onSavePhoneNumber = async (
    values: z.infer<typeof phoneFormSchema>
  ) => {
    if (!userDocRef) return;
    setIsSubmitting(true);
    try {
      await updateDoc(userDocRef, {
        phoneNumber: values.phoneNumber,
        phoneVerified: false, // Explicitly set to false as we are skipping OTP
      });
      toast({
        title: 'Phone Number Saved!',
        description: 'You will be redirected shortly.',
        duration: 1000,
      });
      router.push('/');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Failed to Save Number',
        description: error.message || 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSavePhoneNumber)}
        className="mt-8 space-y-4"
      >
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="+919876543210" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          <Phone className="mr-2 h-5 w-5" />
          Save Phone Number
        </Button>
      </form>
    </Form>
  );
}
