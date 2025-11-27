import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Wallet, MessageSquareText, Plus, CalendarClock, Clock, Trash2, Github, Target } from 'lucide-react';
import { Transaction, TransactionType, BudgetGoal } from './types';
import { getStoredTransactions, saveTransactionsToStorage, getLastUpdate, saveLastUpdate, getStoredBudgets, saveBudgetsToStorage } from './services/storageService';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import AIAdvisor from './components/AIAdvisor';
import BudgetForm from './components/BudgetForm';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'advisor'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<BudgetGoal[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  
  // States for default form values (provisioning)
  const [defaultDate, setDefaultDate] = useState<string | undefined>(undefined);
  const [defaultType, setDefaultType] = useState<TransactionType | undefined>(undefined);

  // Load initial data
  useEffect(() => {
    const data = getStoredTransactions();
    const budgetData = getStoredBudgets();
    setTransactions(data);
    setBudgets(budgetData);
    const lastUpdateDate = getLastUpdate();
    if (lastUpdateDate) {
      setLastUpdated(lastUpdateDate);
    }
  }, []);

  // Save data on change
  useEffect(() => {
    saveTransactionsToStorage(transactions);
  }, [transactions]);

  useEffect(() => {
    saveBudgetsToStorage(budgets);
  }, [budgets]);

  const updateTimestamp = () => {
    const now = new Date().toISOString();
    setLastUpdated(now);
    saveLastUpdate(now);
  };

  const handleSaveTransaction = (txData: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      // Update existing
      setTransactions(prev => prev.map(t => 
        t.id === editingTransaction.id 
          ? { ...txData, id: editingTransaction.id }
          : t
      ));
    } else {
      // Create new
      const transaction: Transaction = {
        ...txData,
        id: crypto.randomUUID()
      };
      setTransactions(prev => [...prev, transaction]);
    }
    updateTimestamp();
    closeForm();
  };

  const handleSaveBudgets = (newBudgets: BudgetGoal[]) => {
    setBudgets(newBudgets);
    setIsBudgetFormOpen(false);
    updateTimestamp();
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setDefaultDate(undefined);
    setDefaultType(undefined);
    setIsFormOpen(true);
  };

  const openNewTransaction = () => {
    setEditingTransaction(null);
    setDefaultDate(new Date().toISOString().split('T')[0]);
    setDefaultType(TransactionType.EXPENSE);
    setIsFormOpen(true);
  };

  const openProvisioning = () => {
    setEditingTransaction(null);
    // Set default date to tomorrow for provisioning
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDefaultDate(tomorrow.toISOString().split('T')[0]);
    setDefaultType(TransactionType.EXPENSE);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
    setDefaultDate(undefined);
    setDefaultType(undefined);
  };

  const requestDeleteTransaction = (id: string) => {
    setTransactionToDelete(id);
  };

  const confirmDelete = () => {
    if (transactionToDelete) {
      setTransactions(prev => prev.filter(t => t.id !== transactionToDelete));
      updateTimestamp();
      setTransactionToDelete(null);
    }
  };

  const formattedLastUpdate = lastUpdated 
    ? new Date(lastUpdated).toLocaleString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    : null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      
      {/* Sidebar / Mobile Nav */}
      <aside className="md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3 text-white border-b border-slate-800">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Wallet className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight">FinançaAI</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setIsBudgetFormOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-slate-800 hover:text-white"
          >
            <Target className="w-5 h-5" />
            <span>Metas de Gastos</span>
          </button>

          <button
            onClick={() => setActiveTab('advisor')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'advisor' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <MessageSquareText className="w-5 h-5" />
            <span>Consultor IA</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-3">
          <button
            onClick={openProvisioning}
            className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 border border-slate-700 hover:border-amber-500/50"
            title="Adicionar despesa futura"
          >
            <CalendarClock className="w-5 h-5" />
            Provisionar
          </button>

          <button
            onClick={openNewTransaction}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
          >
            <Plus className="w-5 h-5" />
            Nova Transação
          </button>

          <div className="pt-4 mt-2 border-t border-slate-800/50 flex justify-center">
             <a 
               href="https://github.com/LucasdePaula84" 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors text-xs font-medium group"
               title="Ver perfil no GitHub"
             >
               <Github className="w-4 h-4 group-hover:scale-110 transition-transform" />
               <span>LucasdePaula84</span>
             </a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen custom-scrollbar relative">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {activeTab === 'dashboard' ? 'Visão Geral' : 'Consultor Financeiro'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {activeTab === 'dashboard' 
                ? 'Acompanhe seus rendimentos e despesas.' 
                : 'Tire dúvidas e peça conselhos ao Gemini.'}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
               <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
               Online
            </div>
            {formattedLastUpdate && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                <span>Atualizado em: {formattedLastUpdate}</span>
              </div>
            )}
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <Dashboard 
            transactions={transactions} 
            budgets={budgets}
            onDelete={requestDeleteTransaction}
            onEdit={handleEditClick}
            onOpenBudget={() => setIsBudgetFormOpen(true)}
          />
        )}

        {activeTab === 'advisor' && (
          <div className="max-w-4xl mx-auto">
            <AIAdvisor transactions={transactions} />
          </div>
        )}
      </main>

      {/* Transaction Form Modal */}
      {isFormOpen && (
        <TransactionForm 
          initialData={editingTransaction}
          defaultDate={defaultDate}
          defaultType={defaultType}
          onSave={handleSaveTransaction} 
          onClose={closeForm} 
        />
      )}

      {/* Budget Form Modal */}
      {isBudgetFormOpen && (
        <BudgetForm 
          currentBudgets={budgets} 
          onSave={handleSaveBudgets} 
          onClose={() => setIsBudgetFormOpen(false)} 
        />
      )}

      {/* Delete Confirmation Modal */}
      {transactionToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up p-6 text-center">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir Transação?</h3>
            <p className="text-slate-500 mb-6 text-sm">
              Essa ação não pode ser desfeita. Você tem certeza que deseja remover este item?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setTransactionToDelete(null)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default App;