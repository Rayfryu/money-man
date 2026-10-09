import React, { useState } from 'react';
import { SavingsGoalCard } from '../../../components/SavingsGoalCard';
import { DEFAULT_SAVINGS_GOALS, DEFAULT_TOTAL_BALANCE } from '../../../lib/store';
import { SavingsGoal } from '../../../types';

export default function SavingsPage() {
  const [goals, setGoals] = useState(DEFAULT_SAVINGS_GOALS);
  const [balance, setBalance] = useState(DEFAULT_TOTAL_BALANCE);

  const handleDeposit = (goalId: string, amount: number) => {
    setBalance((prev) => prev - amount);
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, current_amount: g.current_amount + amount } : g))
    );
  };

  const handleAddGoal = (newGoal: Omit<SavingsGoal, 'id' | 'user_id' | 'current_amount'>) => {
    setGoals((prev) => [
      ...prev,
      {
        id: `sg-${Date.now()}`,
        user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        current_amount: 0,
        ...newGoal,
      },
    ]);
  };

  const handleDeleteGoal = (goalId: string) => {
    const target = goals.find((g) => g.id === goalId);
    if (!target) return;

    setBalance((prev) => prev + target.current_amount);
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  return (
    <div className="p-4 pb-20">
      <SavingsGoalCard
        goals={goals}
        totalBalance={balance}
        onDeposit={handleDeposit}
        onAddGoal={handleAddGoal}
        onDeleteGoal={handleDeleteGoal}
      />
    </div>
  );
}
