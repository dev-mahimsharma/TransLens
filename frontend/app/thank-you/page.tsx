import { Suspense } from 'react';
import { ThankYouContent } from '@/components/thank-you/ThankYouContent';

export default function ThankYouPage() {
  return (
    <Suspense fallback={null}>
      <ThankYouContent />
    </Suspense>
  );
}