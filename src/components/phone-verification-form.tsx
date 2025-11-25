'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import type { User, DocumentReference } from 'firebase/auth';

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
import { useAuth } from '@/firebase';
import { updateDoc } from 'firebase/firestore';
import { Phone, MessageSquare } from 'lucide-react';

interface PhoneVerificationFormProps {
  user: User;
  userDocRef: DocumentReference | null;
}

const phoneFormSchema = z.object({
  phoneNumber: z.string().min(10, { message: 'Enter a valid phone number with country code (e.g., +919876543210).' }),
});

const otpFormSchema = z.object({
  otp: z.string().length(6, { message: 'OTP must be 6 digits.' }),
});

export default function PhoneVerificationForm({ user, userDocRef }: PhoneVerificationFormProps) {
  const auth = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const phoneForm = useForm<z.infer<typeof phoneFormSchema>>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: { phoneNumber: '' },
  });

  const otpForm = useForm<z.infer<typeof otpFormSchema>>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: { otp: '' },
  });

  const setupRecaptcha = () => {
    if (!auth) return;
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: (response: any) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      },
    });
  };

  const onSendOtp = async (values: z.infer<typeof phoneFormSchema>) => {
    if (!auth) return;
    setupRecaptcha();
    setIsSubmitting(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, values.phoneNumber, appVerifier);
      setConfirmationResult(result);
      toast({ title: 'OTP Sent!', description: 'Check your phone for the verification code.' });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Failed to Send OTP',
        description: error.message || 'Please check the phone number and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onVerifyOtp = async (values: z.infer<typeof otpFormSchema>) => {
    if (!confirmationResult || !userDocRef) return;
    setIsSubmitting(true);
    try {
      await confirmationResult.confirm(values.otp);
      
      // Update user document in Firestore
      await updateDoc(userDocRef, {
        phoneNumber: phoneForm.getValues('phoneNumber'),
        phoneVerified: true,
      });

      toast({ title: 'Phone Verified!', description: 'You can now receive WhatsApp notifications.' });
      // Redirect is handled by the page component
    } catch (error: any) {
       console.error(error);
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: 'The OTP is incorrect or has expired. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmationResult) {
    return (
      <Form {...otpForm}>
        <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="mt-8 space-y-4">
          <FormField
            control={otpForm.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification Code (OTP)</FormLabel>
                <FormControl>
                  <Input placeholder="123456" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            <MessageSquare className="mr-2 h-5 w-5" />
            Verify OTP
          </Button>
        </form>
      </Form>
    );
  }

  return (
    <Form {...phoneForm}>
      <form onSubmit={phoneForm.handleSubmit(onSendOtp)} className="mt-8 space-y-4">
        <FormField
          control={phoneForm.control}
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
          Send OTP
        </Button>
      </form>
    </Form>
  );
}

// Add this to your global types or a specific types file if you have one
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

