'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { uploadId } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import type { StepProps } from '../types';
import clsx from 'clsx';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export function IdUploadStep({ token, onNext, onSkip }: StepProps) {
  const t = useTranslations();
  const tId = useTranslations('precheck.idUpload');

  const [consent, setConsent] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (selectedFile: File) => {
      setError(null);

      if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
        setError(t('errors.validation.invalidFileType', { types: 'JPG, PNG, PDF' }));
        return;
      }

      if (selectedFile.size > MAX_FILE_SIZE) {
        setError(t('errors.validation.fileTooBig', { max: '10' }));
        return;
      }

      setFile(selectedFile);

      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    },
    [t],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFileSelect(f);
    },
    [handleFileSelect],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) handleFileSelect(f);
    },
    [handleFileSelect],
  );

  function removeFile() {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleUploadAndContinue() {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      await uploadId(token, file);
      onNext({ idUploaded: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.serverErrorMessage'));
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-1">{tId('heading')}</h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-4">{tId('description')}</p>

      <Alert variant="info" className="mb-6">
        {tId('consentNotice')}
      </Alert>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Consent checkbox */}
      <div className="mb-6">
        <Checkbox
          label={tId('consentCheckbox')}
          checked={consent}
          onChange={() => setConsent(!consent)}
        />
      </div>

      {/* File upload area */}
      {consent && (
        <>
          <div
            className={clsx(
              'border-2 border-dashed rounded-brand p-8 text-center transition-colors',
              'hover:border-brand-primary/50',
              file ? 'border-brand-primary bg-brand-primary/5' : 'border-[var(--color-border)]',
            )}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            role="region"
            aria-label={t('accessibility.fileUploadArea')}
          >
            {file ? (
              <div className="space-y-3">
                {preview && (
                  <img
                    src={preview}
                    alt={tId('preview')}
                    className="max-h-48 mx-auto rounded-brand"
                  />
                )}
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button variant="ghost" size="sm" onClick={removeFile}>
                  {tId('removeFile')}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[var(--color-text-muted)]">{tId('uploadLabel')}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{tId('uploadHint')}</p>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {tId('chooseFile')}
                  </Button>
                  {/* Mobile camera capture */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.capture = 'environment';
                        fileInputRef.current.click();
                      }
                    }}
                    className="sm:hidden"
                  >
                    {tId('takePhoto')}
                  </Button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleInputChange}
              className="sr-only"
              aria-label={tId('uploadLabel')}
            />
          </div>

          {file && (
            <div className="flex justify-end pt-6">
              <Button onClick={handleUploadAndContinue} loading={uploading}>
                {t('common.next')}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Skip button */}
      <div className="flex justify-end pt-4">
        <Button variant="ghost" onClick={() => onNext({ idUploaded: false })}>
          {tId('skipStep')}
        </Button>
      </div>
    </Card>
  );
}
