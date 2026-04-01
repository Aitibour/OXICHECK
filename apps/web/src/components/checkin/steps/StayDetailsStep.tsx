'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { StepProps } from '../types';

const staySchema = z.object({
  adults: z.coerce.number().min(1).max(20),
  children: z.coerce.number().min(0).max(20),
  specialRequests: z.string().max(1000).optional(),
  arrivalTime: z.string().optional(),
});

type StayFormValues = z.infer<typeof staySchema>;

const ARRIVAL_TIMES = [
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
];

export function StayDetailsStep({ reservation, formData, onNext }: StepProps) {
  const t = useTranslations();
  const tStay = useTranslations('precheck.stayDetails');

  const checkIn = new Date(reservation.checkInDate);
  const checkOut = new Date(reservation.checkOutDate);
  const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StayFormValues>({
    resolver: zodResolver(staySchema),
    defaultValues: {
      adults: formData.stayDetails?.adults ?? reservation.adults ?? 1,
      children: formData.stayDetails?.children ?? reservation.children ?? 0,
      specialRequests: formData.stayDetails?.specialRequests ?? reservation.specialRequests ?? '',
      arrivalTime: formData.stayDetails?.arrivalTime ?? reservation.arrivalTime ?? '',
    },
  });

  function onSubmit(values: StayFormValues) {
    onNext({ stayDetails: values });
  }

  const dateFormat = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-1">{tStay('heading')}</h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">{tStay('description')}</p>

      {/* Read-only reservation details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-[var(--color-bg-muted)] rounded-brand">
        <div>
          <p className="text-xs font-medium text-[var(--color-text-muted)]">{tStay('checkIn')}</p>
          <p className="font-medium">{dateFormat.format(checkIn)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-[var(--color-text-muted)]">{tStay('checkOut')}</p>
          <p className="font-medium">{dateFormat.format(checkOut)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-[var(--color-text-muted)]">{tStay('roomType')}</p>
          <p className="font-medium">{reservation.roomType}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-[var(--color-text-muted)]">
            {t('precheck.stayDetails.nights', { count: nights })}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={tStay('adults')}
            type="number"
            min={1}
            max={20}
            required
            error={errors.adults?.message}
            {...register('adults')}
          />
          <Input
            label={tStay('children')}
            type="number"
            min={0}
            max={20}
            error={errors.children?.message}
            {...register('children')}
          />
        </div>

        <div>
          <label htmlFor="arrivalTime" className="form-label">
            {tStay('arrivalTime')}
          </label>
          <select
            id="arrivalTime"
            className="form-input"
            {...register('arrivalTime')}
          >
            <option value="">{tStay('selectTime')}</option>
            {ARRIVAL_TIMES.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="specialRequests" className="form-label">
            {tStay('specialRequests')}
          </label>
          <textarea
            id="specialRequests"
            rows={3}
            className="form-input resize-y"
            placeholder={tStay('specialRequestsPlaceholder')}
            {...register('specialRequests')}
          />
          {errors.specialRequests && (
            <p className="form-error" role="alert">{errors.specialRequests.message}</p>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit">{t('common.next')}</Button>
        </div>
      </form>
    </Card>
  );
}
