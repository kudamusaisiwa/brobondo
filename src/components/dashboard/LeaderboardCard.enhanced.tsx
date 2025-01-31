import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  TrophyIcon, 
  StarIcon, 
  ChartBarIcon,
  FireIcon,
  SparklesIcon,
  ChartPieIcon
} from '@heroicons/react/24/solid';
import { usePaymentStore } from '../../store/paymentStore';
import { useUserStore } from '../../store/userStore';
import { useOrderStore } from '../../store/orderStore';

type TimeRange = 'custom' | 'daily' | 'weekly' | 'monthly';

interface SalesPerformer {
  id: string;
  name: string;
  revenue: number;
  dealsCount: number;
  conversionRate: number;
  level: number;
  badges: string[];
  streak: number;
  previousRank?: number;
  currentRank?: number;
  lastCustomerDate?: Date;
}

interface Badge {
  icon: any;
  color: string;
  label: string;
  threshold: number;
}

const badges: Record<string, Badge> = {
  'top_performer': { 
    icon: TrophyIcon, 
    color: 'text-yellow-400', 
    label: 'Top Performer',
    threshold: 10000
  },
  'rising_star': { 
    icon: StarIcon, 
    color: 'text-blue-400', 
    label: 'Rising Star',
    threshold: 5000
  },
  'deal_maker': { 
    icon: ChartBarIcon, 
    color: 'text-green-400', 
    label: 'Deal Maker',
    threshold: 3000
  },
  'hot_streak': { 
    icon: FireIcon, 
    color: 'text-red-400', 
    label: 'Hot Streak',
    threshold: 2000
  },
  'customer_favorite': { 
    icon: SparklesIcon, 
    color: 'text-purple-400', 
    label: 'Customer Favorite',
    threshold: 1000
  }
};

const calculateLevel = (revenue: number): number => {
  return Math.floor(revenue / 1000) + 1;
};

const calculateBadges = (performer: SalesPerformer): string[] => {
  return Object.entries(badges)
    .filter(([_, badge]) => performer.revenue >= badge.threshold)
    .map(([key, _]) => key);
};

export default function LeaderboardCard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly');
  const [performers, setPerformers] = useState<SalesPerformer[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalDeals, setTotalDeals] = useState(0);
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { payments, getPaymentsByDateRange } = usePaymentStore();
  const { orders } = useOrderStore();
  const { users } = useUserStore();

  // Calculate date range
  const now = new Date();
  const startDate = new Date();
  
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
    case 'custom':
      // Use custom dates if available, otherwise default to weekly
      if (customStartDate && customEndDate) {
        startDate.setTime(customStartDate.getTime());
        now.setTime(customEndDate.getTime());
      } else {
        startDate.setDate(startDate.getDate() - 7);
      }
      break;
  }

  const handleTimeRangeChange = (value: TimeRange) => {
    setTimeRange(value);
    if (value === 'custom') {
      setShowDatePicker(true);
    } else {
      setShowDatePicker(false);
    }
  };

  const handleDateRangeSelect = (start: Date | null, end: Date | null) => {
    setCustomStartDate(start);
    setCustomEndDate(end);
    if (start && end) {
      setShowDatePicker(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get payments for the date range
        const periodPayments = await getPaymentsByDateRange(startDate, now);

        // Create a map to track unique orders per sales rep
        const uniqueOrdersMap = new Map<string, Set<string>>();
        const totalOrdersMap = new Map<string, number>();
        
        // Group payments by sales rep
        const salesData = periodPayments.reduce((acc, payment) => {
          const soldBy = payment.soldBy;
          if (!soldBy) return acc;

          // Initialize sales rep data if not exists
          if (!acc[soldBy]) {
            const user = users.find(u => u.id === soldBy);
            if (!user) return acc;
            
            acc[soldBy] = {
              id: soldBy,
              name: user.name,
              revenue: 0,
              dealsCount: 0,
              conversionRate: 0,
              level: 1,
              badges: [],
              streak: 0,
              lastCustomerDate: undefined
            };
            // Initialize unique orders set for this sales rep
            uniqueOrdersMap.set(soldBy, new Set());
            totalOrdersMap.set(soldBy, 0);
          }

          // Add payment amount to revenue
          acc[soldBy].revenue += payment.amount || 0;
          
          // Track unique order
          const orderSet = uniqueOrdersMap.get(soldBy)!;
          if (!orderSet.has(payment.orderId)) {
            orderSet.add(payment.orderId);
            acc[soldBy].dealsCount = orderSet.size;
            
            // Update last customer date if this payment is more recent
            if (payment.date) {
              const paymentDate = payment.date instanceof Date ? payment.date : new Date(payment.date);
              if (!acc[soldBy].lastCustomerDate || paymentDate > acc[soldBy].lastCustomerDate) {
                acc[soldBy].lastCustomerDate = paymentDate;
              }
            }
          }

          // Update total orders for conversion rate
          totalOrdersMap.set(soldBy, (totalOrdersMap.get(soldBy) || 0) + 1);

          return acc;
        }, {} as Record<string, SalesPerformer>);

        // Calculate additional metrics
        Object.values(salesData).forEach(performer => {
          performer.conversionRate = performer.dealsCount / (totalOrdersMap.get(performer.id) || 1);
          performer.level = calculateLevel(performer.revenue);
          performer.badges = calculateBadges(performer);
        });

        // Calculate totals
        const totalRev = Object.values(salesData).reduce((sum, p) => sum + p.revenue, 0);
        const totalDls = Object.values(salesData).reduce((sum, p) => sum + p.dealsCount, 0);
        setTotalRevenue(totalRev);
        setTotalDeals(totalDls);

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
      } catch (error) {
        console.error('Error loading leaderboard data:', error);
      }
    };

    loadData();
  }, [timeRange, users, orders, getPaymentsByDateRange, customStartDate, customEndDate]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <TrophyIcon className="h-8 w-8 text-yellow-400 mr-2" />
              TOP SALES
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {timeRange === 'custom' 
                ? `${customStartDate?.toLocaleDateString()} - ${customEndDate?.toLocaleDateString()}`
                : timeRange === 'daily' 
                  ? 'Today' 
                  : timeRange === 'weekly' 
                    ? 'This Week' 
                    : 'This Month'
              }
            </p>
          </div>
          <div className="flex flex-col items-end">
            <select
              value={timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value as TimeRange)}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm mb-2"
            >
              <option value="daily">Today</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="custom">Customer Range</option>
            </select>
            {showDatePicker && (
              <div className="absolute mt-10 z-10">
                <DatePicker
                  selectsRange={true}
                  startDate={customStartDate}
                  endDate={customEndDate}
                  onChange={(update: [Date | null, Date | null]) => handleDateRangeSelect(update[0], update[1])}
                  isClearable={true}
                  inline
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white">
            <div className="text-sm opacity-80">Total Revenue</div>
            <div className="text-xl font-bold">${totalRevenue.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 text-white">
            <div className="text-sm opacity-80">Total Deals</div>
            <div className="text-xl font-bold">{totalDeals}</div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-4">
        <AnimatePresence>
          {performers.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-4">
              No sales data available for this period
            </div>
          ) : (
            performers.slice(0, 5).map((performer) => {
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
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white min-w-[2rem]">
                        #{performer.currentRank}
                      </span>
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                          {performer.name}
                          <span className="ml-2 text-sm text-blue-500">
                            Lvl {performer.level}
                          </span>
                        </h3>
                        <div className="flex space-x-2">
                          {performer.badges.map(badgeKey => {
                            const badge = badges[badgeKey];
                            const BadgeIcon = badge.icon;
                            return (
                              <motion.div
                                key={badgeKey}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`${badge.color}`}
                                title={badge.label}
                              >
                                <BadgeIcon className="h-5 w-5" />
                              </motion.div>
                            );
                          })}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Last customer: {performer.lastCustomerDate 
                            ? new Date(performer.lastCustomerDate).toLocaleDateString()
                            : 'No customers yet'
                          }
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 dark:text-white">
                        ${performer.revenue.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {performer.dealsCount} deals
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

                  {/* Progress Bar */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Progress to Next Level</span>
                      <span>{Math.min(100, (performer.revenue % 1000) / 10)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                      <motion.div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${Math.min(100, (performer.revenue % 1000) / 10)}%`
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
