export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum Category {
  FOOD = 'Alimentação',
  HOUSING = 'Moradia',
  TRANSPORT = 'Transporte',
  UTILITIES = 'Contas (Luz/Água/Net)',
  SHOPPING = 'Compras',
  CLOTHING = 'Vestuário',
  ENTERTAINMENT = 'Lazer',
  HEALTH = 'Saúde',
  EDUCATION = 'Educação',
  PETS = 'Pets',
  GIFTS = 'Presentes',
  TRAVEL = 'Viagem',
  SALARY = 'Salário',
  INVESTMENT = 'Investimentos',
  OTHER = 'Outros'
}

export enum PaymentMethod {
  PIX = 'Pix',
  CREDIT = 'Crédito',
  DEBIT = 'Débito',
  MONEY = 'Dinheiro',
  MEAL_TICKET = 'Alimentação',
  TRANSFER = 'Transferência',
  OTHER = 'Outros'
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: Category | string;
  paymentMethod?: PaymentMethod | string;
  date: string;
}

export interface BudgetGoal {
  category: string;
  limit: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}