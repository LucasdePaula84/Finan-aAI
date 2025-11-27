import { Transaction, BudgetGoal } from '../types';

const STORAGE_KEY = 'fingemini_transactions';
const BUDGET_KEY = 'fingemini_budgets';
const UPDATE_KEY = 'fingemini_last_update';

export const getStoredTransactions = (): Transaction[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to parse transactions", error);
    return [];
  }
};

export const saveTransactionsToStorage = (transactions: Transaction[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error("Failed to save transactions", error);
  }
};

export const getStoredBudgets = (): BudgetGoal[] => {
  try {
    const stored = localStorage.getItem(BUDGET_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to parse budgets", error);
    return [];
  }
};

export const saveBudgetsToStorage = (budgets: BudgetGoal[]) => {
  try {
    localStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
  } catch (error) {
    console.error("Failed to save budgets", error);
  }
};

export const getLastUpdate = (): string | null => {
  return localStorage.getItem(UPDATE_KEY);
};

export const saveLastUpdate = (date: string) => {
  localStorage.setItem(UPDATE_KEY, date);
};