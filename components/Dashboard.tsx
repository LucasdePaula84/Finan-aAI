import React, { useMemo, useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { Transaction, TransactionType, BudgetGoal } from '../types';
import StatsCard from './StatsCard';
import BudgetProgress from './BudgetProgress';
import { Trash2, Pencil, CalendarClock, CreditCard, Filter } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  budgets: BudgetGoal[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  onOpenBudget: () => void;
}

const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f59e0b', '#f43f5e', '#10b981', '#64748b', '#3b82f6', '#818cf8', '#a855f7', '#06b6d4'];
const PAYMENT_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

const Dashboard: React.FC<DashboardProps> = ({ transactions, budgets, onDelete, onEdit, onOpenBudget }) => {
  
  const today = new Date().toISOString().split('T')[0];

  // Initialize dates: First day of current month to Last day of current month
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
  });

  // Filter transactions based on date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => t.date >= startDate && t.date <= endDate);
  }, [transactions, startDate, endDate]);

  const { currentBalance, projectedBalance, totalIncome, totalExpense } = useMemo(() => {
    let income = 0;
    let expense = 0;
    let currentBal = 0; // Balance calculated from ALL time up to today, not just filtered range usually, but for dashboard view let's stick to filtered context or mix? 
    // Standard approach: Stats reflect the FILTERED period.
    
    filteredTransactions.forEach(t => {
      if (t.type === TransactionType.INCOME) income += t.amount;
      else expense += t.amount;
    });

    // For current balance, we usually want the REAL account balance (all history). 
    // However, based on the prompt requesting a filter, users usually want to analyze that specific period.
    // Let's calculate "Period Balance" (Result of the period).
    
    // To calculate the REAL current balance (money in pocket), we need all transactions up to today.
    let realBalance = 0;
    transactions.forEach(t => {
      if (t.date <= today) {
        if (t.type === TransactionType.INCOME) realBalance += t.amount;
        else realBalance -= t.amount;
      }
    });

    return {
      totalIncome: income,
      totalExpense: expense,
      currentBalance: realBalance, // Keep this as global reality
      projectedBalance: income - expense // This becomes "Period Result"
    };
  }, [filteredTransactions, transactions, today]);

  // Data for Pie Chart (Expenses by Category)
  const categoryData = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE);
    const catMap: Record<string, number> = {};
    let totalExp = 0;
    
    expenses.forEach(t => {
      if (!catMap[t.category]) catMap[t.category] = 0;
      catMap[t.category] += t.amount;
      totalExp += t.amount;
    });

    return Object.keys(catMap).map(key => ({
      name: key,
      value: catMap[key],
      percent: totalExp > 0 ? (catMap[key] / totalExp) : 0
    })).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Data for Payment Method Chart
  const paymentMethodData = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE);
    const methodMap: Record<string, number> = {};
    
    expenses.forEach(t => {
      const method = t.paymentMethod || 'Não definido';
      if (!methodMap[method]) methodMap[method] = 0;
      methodMap[method] += t.amount;
    });

    return Object.keys(methodMap).map(key => ({
      name: key,
      value: methodMap[key]
    })).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Data for Simple Bar Chart (Receita vs Despesa)
  const comparisonData = useMemo(() => {
    return [
      { name: 'Receitas', value: totalIncome, fill: '#10b981' }, // Emerald-500
      { name: 'Despesas', value: totalExpense, fill: '#f43f5e' }  // Rose-500
    ];
  }, [totalIncome, totalExpense]);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Date Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <Filter className="w-5 h-5" />
          <span>Filtrar Período:</span>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <span className="text-slate-400">até</span>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="ml-auto text-sm text-slate-400">
          Exibindo {filteredTransactions.length} registros
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard title="Saldo Atual (Global)" amount={currentBalance} type="balance" />
        <StatsCard title="Resultado do Período" amount={projectedBalance} type="balance" />
        <StatsCard title="Receitas (Período)" amount={totalIncome} type="income" />
        <StatsCard title="Despesas (Período)" amount={totalExpense} type="expense" />
      </div>

      {/* Row 1: Transactions List (1) & Categories Chart (2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. Recent Transactions List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col h-[600px]">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Transações do Período</h3>
          <div className="overflow-hidden flex-1">
            <div className="h-full overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {filteredTransactions.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-slate-400 h-full">
                  <p>Nenhuma transação encontrada neste período.</p>
                </div>
              ) : (
                filteredTransactions.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => {
                  const isFuture = t.date > today;
                  
                  return (
                    <div key={t.id} className={`flex items-center justify-between p-4 rounded-lg border transition-all group shadow-sm ${
                      isFuture 
                        ? 'bg-amber-50 border-amber-100 hover:border-amber-200' 
                        : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold relative ${
                          t.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                        }`}>
                          {t.category.charAt(0).toUpperCase()}
                          {isFuture && (
                            <div className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 border-2 border-white" title="Provisionado / Futuro">
                               <CalendarClock className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-900">{t.description}</p>
                            {isFuture && <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Provisionado</span>}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="bg-slate-200 px-2 py-0.5 rounded text-slate-700">{t.category}</span>
                            <span>•</span>
                            <span>{new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                            {t.paymentMethod && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <CreditCard className="w-3 h-3" />
                                  {t.paymentMethod}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-bold text-lg ${
                          t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {t.type === TransactionType.INCOME ? '+' : '-'} R$ {t.amount.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => onEdit(t)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => onDelete(t.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* 2. Pie Chart: Expenses by Category (Larger, Legend Bottom) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-[600px] flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Despesas por Categoria</h3>
          {categoryData.length > 0 ? (
            <div className="flex-1 flex flex-col">
              {/* Chart Area - Increased Height & Radius */}
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80} // Increased size
                      outerRadius={120} // Increased size
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`R$ ${value.toFixed(2)}`, '']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend Bottom - Grid Layout */}
              <div className="mt-4 border-t border-slate-100 pt-4 max-h-[200px] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categoryData.map((entry, index) => (
                    <div key={index} className="flex flex-col p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <div 
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-xs font-semibold text-slate-600 truncate" title={entry.name}>
                          {entry.name}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm font-bold text-slate-800">
                           {new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1 }).format(entry.percent)}
                        </span>
                        <span className="text-xs text-slate-400">
                          R$ {entry.value.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              <p>Sem despesas para exibir no período.</p>
            </div>
          )}
        </div>

      </div>

      {/* Row 2: Flow (3) & Payment Methods (4) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 3. Bar Chart: Total Income vs Expense */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-[450px] flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-800">Fluxo de Caixa (Resumo)</h3>
            <p className="text-xs text-slate-500">Comparativo total do período selecionado.</p>
          </div>
          
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 14, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `R$${val}`} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor']}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={80}>
                   {
                      comparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))
                    }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Payment Methods Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col h-[450px]">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Despesas por Pagamento</h3>
          {paymentMethodData.length > 0 ? (
            <div className="flex-1 w-full min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentMethodData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} width={80} interval={0} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor']}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              <p>Nenhum dado de pagamento no período.</p>
            </div>
          )}
        </div>

      </div>

      {/* Row 3: Budget Goals */}
      <div className="w-full h-[450px]">
         <BudgetProgress 
            budgets={budgets} 
            transactions={filteredTransactions} 
            onConfigure={onOpenBudget} 
         />
      </div>

    </div>
  );
};

export default Dashboard;