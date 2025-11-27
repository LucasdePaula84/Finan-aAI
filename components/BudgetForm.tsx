import React, { useState, useEffect } from 'react';
import { Category, BudgetGoal } from '../types';
import { Save, X, Target } from 'lucide-react';

interface BudgetFormProps {
  currentBudgets: BudgetGoal[];
  onSave: (budgets: BudgetGoal[]) => void;
  onClose: () => void;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ currentBudgets, onSave, onClose }) => {
  // Initialize state with all categories, pre-filling existing limits
  const [localBudgets, setLocalBudgets] = useState<Record<string, string>>({});

  useEffect(() => {
    const initialState: Record<string, string> = {};
    // Pre-populate with 0 or existing values
    Object.values(Category).forEach(cat => {
      const found = currentBudgets.find(b => b.category === cat);
      initialState[cat] = found ? found.limit.toString() : '';
    });
    setLocalBudgets(initialState);
  }, [currentBudgets]);

  const handleChange = (category: string, value: string) => {
    setLocalBudgets(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBudgets: BudgetGoal[] = Object.entries(localBudgets)
      .filter(([_, value]) => value && parseFloat(value) > 0)
      .map(([category, value]) => ({
        category,
        limit: parseFloat(value)
      }));
    
    onSave(newBudgets);
  };

  // Filter out INCOME categories essentially (Salary, Investment) if desired, 
  // but user might want to limit Investment inputs? Usually budget is for expenses.
  // Let's filter out 'Salário' and 'Investimentos' to keep it focused on spending.
  const expenseCategories = Object.values(Category).filter(
    c => c !== Category.SALARY && c !== Category.INVESTMENT
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-up">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2 text-indigo-600">
            <Target className="w-6 h-6" />
            <h2 className="text-xl font-bold text-slate-800">Definir Metas Mensais</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <p className="text-sm text-slate-500 mb-6 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
            Defina o valor máximo que deseja gastar por mês em cada categoria. 
            Deixe em branco as categorias que não deseja monitorar.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {expenseCategories.map((cat) => (
              <div key={cat} className="space-y-1">
                <label className="text-sm font-medium text-slate-700">{cat}</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm">R$</span>
                  <input
                    type="number"
                    step="10"
                    value={localBudgets[cat] || ''}
                    onChange={(e) => handleChange(cat, e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                    placeholder="Sem limite"
                  />
                </div>
              </div>
            ))}
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 shrink-0 bg-slate-50 rounded-b-2xl">
          <div className="flex gap-3 justify-end">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2.5 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-white transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200"
            >
              <Save className="w-4 h-4" />
              Salvar Metas
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BudgetForm;