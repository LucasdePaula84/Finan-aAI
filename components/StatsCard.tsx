import React from 'react';
import { ArrowUp, ArrowDown, DollarSign } from 'lucide-react';

interface StatsCardProps {
  title: string;
  amount: number;
  type: 'balance' | 'income' | 'expense';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, amount, type }) => {
  let icon = <DollarSign className="w-6 h-6 text-indigo-600" />;
  let colorClass = "text-slate-900";
  let bgClass = "bg-white";

  if (type === 'income') {
    icon = <ArrowUp className="w-6 h-6 text-emerald-600" />;
    colorClass = "text-emerald-600";
    bgClass = "bg-emerald-50";
  } else if (type === 'expense') {
    icon = <ArrowDown className="w-6 h-6 text-rose-600" />;
    colorClass = "text-rose-600";
    bgClass = "bg-rose-50";
  }

  const formattedAmount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center justify-between transition-all hover:shadow-md">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className={`text-2xl font-bold ${colorClass}`}>{formattedAmount}</h3>
      </div>
      <div className={`p-3 rounded-full ${bgClass}`}>
        {icon}
      </div>
    </div>
  );
};

export default StatsCard;