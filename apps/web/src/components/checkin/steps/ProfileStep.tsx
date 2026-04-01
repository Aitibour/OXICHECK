'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { StepProps } from '../types';

const profileSchema = z.object({
  firstName: z.string().min(1, 'required').max(100),
  lastName: z.string().min(1, 'required').max(100),
  email: z.string().min(1, 'required').email('invalidEmail'),
  phone: z.string().optional(),
  preferredLocale: z.enum(['en', 'fr']),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileStep({ formData, onNext }: StepProps) {
  const t = useTranslations();
  const tProfile = useTranslations('precheck.profile');
  const tErrors = useTranslations('errors.validation');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: formData.profile?.firstName || '',
      lastName: formData.profile?.lastName || '',
      email: formData.profile?.email || '',
      phone: formData.profile?.phone || '',
      preferredLocale: (formData.profile?.preferredLocale as 'en' | 'fr') || 'en',
    },
  });

  function onSubmit(values: ProfileFormValues) {
    onNext({ profile: values });
  }

  function getError(field: keyof ProfileFormValues): string | undefined {
    const err = errors[field];
    if (!err?.message) return undefined;
    // Map zod error codes to i18n keys
    const key = err.message as string;
    if (key === 'required') return tErrors('required');
    if (key === 'invalidEmail') return tErrors('invalidEmail');
    return err.message;
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-1">{tProfile('heading')}</h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">{tProfile('description')}</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={tProfile('firstName')}
            required
            error={getError('firstName')}
            {...register('firstName')}
          />
          <Input
            label={tProfile('lastName')}
            required
            error={getError('lastName')}
            {...register('lastName')}
          />
        </div>

        <Input
          label={tProfile('email')}
          type="email"
          required
          error={getError('email')}
          {...register('email')}
        />

        <Input
          label={tProfile('phone')}
          type="tel"
          error={getError('phone')}
          {...register('phone')}
        />

        <fieldset>
          <legend className="form-label">{tProfile('preferredLanguage')}</legend>
          <div className="flex gap-4 mt-1">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                value="en"
                {...register('preferredLocale')}
                className="h-4 w-4 text-brand-primary focus:ring-brand-primary"
              />
              {tProfile('english')}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                value="fr"
                {...register('preferredLocale')}
                className="h-4 w-4 text-brand-primary focus:ring-brand-primary"
              />
              {tProfile('french')}
            </label>
          </div>
        </fieldset>

        <div className="flex justify-end pt-4">
          <Button type="submit">{t('common.next')}</Button>
        </div>
      </form>
    </Card>
  );
}
