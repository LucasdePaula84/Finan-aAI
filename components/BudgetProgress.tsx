import React, { useMemo } from 'react';
import { BudgetGoal, Transaction, TransactionType } from '../types';
import { Target, AlertCircle } from 'lucide-react';

interface BudgetProgressProps {
  budgets: BudgetGoal[];
  transactions: Transaction[];
  onConfigure: () => void;
}

const BudgetProgress: React.FC<BudgetProgressProps> = ({ budgets, transactions, onConfigure }) => {
  
  const budgetStatus = useMemo(() => {
    // 1. Filter transactions for CURRENT MONTH only
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthExpenses = transactions.filter(t => {
      if (t.type !== TransactionType.EXPENSE) return false;
      const tDate = new Date(t.date + 'T00:00:00'); // Fix timezone offset issue simple way
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });

    // 2. Aggregate expenses per category
    const expenseMap: Record<string, number> = {};
    currentMonthExpenses.forEach(t => {
      expenseMap[t.category] = (expenseMap[t.category] || 0) + t.amount;
    });

    // 3. Map budgets to status
    return budgets.map(b => {
      const spent = expenseMap[b.category] || 0;
      const percentage = (spent / b.limit) * 100;
      return {
        ...b,
        spent,
        percentage,
        remaining: b.limit - spent
      };
    }).sort((a, b) => b.percentage - a.percentage); // Show most critical first
  }, [budgets, transactions]);

  if (budgets.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
          <Target className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">Defina suas Metas</h3>
        <p className="text-slate-500 max-w-xs mb-6">
          Você ainda não configurou limites de gastos. Estabeleça metas para economizar mais.
        </p>
        <button 
          onClick={onConfigure}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Configurar Metas
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Progresso das Metas</h3>
          <p className="text-xs text-slate-500">Gastos deste mês vs. Limites definidos</p>
        </div>
        <button 
          onClick={onConfigure}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1 bg-indigo-50 rounded-lg transition-colors"
        >
          Editar Metas
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-5">
        {budgetStatus.map((item) => {
          let color = 'bg-emerald-500';
          let textColor = 'text-emerald-600';
          let statusText = 'No controle';
          
          if (item.percentage >= 100) {
            color = 'bg-rose-500';
            textColor = 'text-rose-600';
            statusText = 'Estourado';
          } else if (item.percentage >= 80) {
            color = 'bg-amber-500';
            textColor = 'text-amber-600';
            statusText = 'Atenção';
          }

          return (
            <div key={item.category} className="group">
              <div className="flex justify-between items-end mb-1">
                <span className="font-semibold text-slate-700">{item.category}</span>
                <span className={`text-xs font-bold ${textColor}`}>
                  {statusText} ({item.percentage.toFixed(0)}%)
                </span>
              </div>
              
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-1">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${color}`} 
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-slate-500">
                <span>Gasto: R$ {item.spent.toFixed(2)}</span>
                <span>Meta: R$ {item.limit.toFixed(2)}</span>
              </div>
            </div>
          );
        })}

        {budgetStatus.length === 0 && (
           <p className="text-center text-slate-400 py-4">Nenhuma despesa registrada nas categorias monitoradas este mês.</p>
        )}
      </div>
    </div>
  );
};

export default BudgetProgress;