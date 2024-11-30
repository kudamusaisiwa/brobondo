import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrophyIcon, StarIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import { usePaymentStore } from '../../store/paymentStore';
import { useUserStore } from '../../store/userStore';

type TimeRange = 'daily' | 'weekly' | 'monthly';

interface SalesPerformer {
  id: string;
  name: string;
  revenue: number;
  dealsCount: number;
  previousRank?: number;
  currentRank?: number;
}

const badges = {
  1: { icon: TrophyIcon, color: 'text-yellow-400', label: 'Top Performer' },
  2: { icon: StarIcon, color: 'text-gray-400', label: 'Silver Star' },
  3: { icon: ChartBarIcon, color: 'text-amber-600', label: 'Bronze Achiever' }
};

export default function LeaderboardCard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly');
  const [performers, setPerformers] = useState<SalesPerformer[]>([]);
  const { payments, getPaymentsByDateRange } = usePaymentStore();
  const { users } = useUserStore();

  useEffect(() => {
    const loadData = async () => {
      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case 'daily':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'weekly':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'monthly':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
      }

      // Get payments for the date range
      const periodPayments = await getPaymentsByDateRange(startDate, now);

      // Group payments by sales rep
      const salesData = periodPayments.reduce((acc, payment) => {
        if (!payment.soldBy || payment.status !== 'completed') return acc;

        if (!acc[payment.soldBy]) {
          const user = users.find(u => u.id === payment.soldBy);
          acc[payment.soldBy] = {
            id: payment.soldBy,
            name: user?.name || payment.soldBy,
            revenue: 0,
            dealsCount: 0
          };
        }

        acc[payment.soldBy].revenue += payment.amount;
        acc[payment.soldBy].dealsCount += 1;
        return acc;
      }, {} as Record<string, SalesPerformer>);

      // Convert to array and sort by revenue
      const prevPerformers = [...performers];
      const newPerformers = Object.values(salesData)
        .sort((a, b) => b.revenue - a.revenue)
        .map((performer, index) => ({
          ...performer,
          currentRank: index + 1,
          previousRank: prevPerformers.find(p => p.id === performer.id)?.currentRank || index + 1
        }));

      setPerformers(newPerformers);
    };

    loadData();
  }, [timeRange, users, getPaymentsByDateRange]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Leaderboard
        </h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as TimeRange)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        >
          <option value="daily">Today</option>
          <option value="weekly">This Week</option>
          <option value="monthly">This Month</option>
        </select>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {performers.slice(0, 5).map((performer) => {
            const Badge = badges[performer.currentRank as keyof typeof badges]?.icon || ChartBarIcon;
            const badgeColor = badges[performer.currentRank as keyof typeof badges]?.color || 'text-gray-400';
            const rankChange = performer.previousRank && performer.previousRank - performer.currentRank;

            return (
              <motion.div
                key={performer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white min-w-[2rem]">
                      #{performer.currentRank}
                    </span>
                    <Badge className={`h-8 w-8 ${badgeColor}`} />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {performer.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {performer.dealsCount} deals
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 dark:text-white">
                      ${performer.revenue.toLocaleString()}
                    </div>
                    {rankChange !== 0 && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`text-sm ${rankChange > 0 ? 'text-green-500' : 'text-red-500'}`}
                      >
                        {rankChange > 0 ? '↑' : '↓'} {Math.abs(rankChange)}
                      </motion.span>
                    )}
                  </div>
                </div>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                  <motion.div
                    className="bg-indigo-600 h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(performer.revenue / (performers[0]?.revenue || 1)) * 100}%` 
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
