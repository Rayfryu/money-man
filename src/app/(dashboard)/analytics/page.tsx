import React from 'react';
import { AnalyticsCharts } from '../../../components/AnalyticsCharts';
import { DEFAULT_TRANSACTIONS, DEFAULT_CATEGORIES } from '../../../lib/store';

export default function AnalyticsPage() {
  return (
    <div className="p-4 pb-20">
      <AnalyticsCharts
        transactions={DEFAULT_TRANSACTIONS}
        categories={DEFAULT_CATEGORIES}
      />
    </div>
  );
}
