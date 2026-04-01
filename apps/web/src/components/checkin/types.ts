import type { ReservationData, PreCheckFormData } from '@/lib/api';

export interface StepProps {
  token: string;
  reservation: ReservationData;
  formData: PreCheckFormData;
  updateFormData: (partial: Partial<PreCheckFormData>) => void;
  onNext: (stepData?: Partial<PreCheckFormData>) => void;
  onBack: () => void;
  onSkip: () => void;
  goToStep: (step: number) => void;
}
