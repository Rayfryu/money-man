import React from 'react';
import { SplitBillCalculator } from '../../../components/SplitBillCalculator';

export default function SplitBillPage() {
  const handleRecord = (_amount: number, _notes: string) => {
    // In Next.js client, records to local storage or API
  };

  return (
    <div className="p-4 pb-20">
      <SplitBillCalculator onRecordMyShare={handleRecord} />
    </div>
  );
}
