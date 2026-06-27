// js/data.js

// Default Income and Expense Heads (Categories)
const DEFAULT_INCOME_HEADS = [
    { id: "inc_maintenance", name_gu: "સભ્ય મેઇન્ટેનન્સ (Maintenance)", name_en: "Member Maintenance", color: "#4caf50", icon: "fa-home" },
    { id: "inc_fd_interest", name_gu: "એફ.ડી. વ્યાજ (FD Interest)", name_en: "Fix Deposit Interest", color: "#2196f3", icon: "fa-percentage" },
    { id: "inc_bank_interest", name_gu: "બેંક ખાતા વ્યાજ (Bank Interest)", name_en: "Bank Interest", color: "#03a9f4", icon: "fa-university" }
];

const DEFAULT_EXPENSE_HEADS = [
    { id: "exp_security_salary", name_gu: "સિક્યોરિટી પગાર (Security Salary)", name_en: "Security Salary", color: "#e91e63", icon: "fa-shield-alt" },
    { id: "exp_safai_salary", name_gu: "સફાઈ કામદાર પગાર", name_en: "Safai Kamdar Salary", color: "#ff9800", icon: "fa-broom" },
    { id: "exp_garden_maint", name_gu: "બગીચા મરામત (Garden Maint.)", name_en: "Garden Maintenance", color: "#8bc34a", icon: "fa-leaf" },
    { id: "exp_theater_maint", name_gu: "થિયેટર મરામત (Theater Maint.)", name_en: "Theater Maintenance", color: "#9c27b0", icon: "fa-film" },
    { id: "exp_lift_maint", name_gu: "લિફ્ટ મરામત (Lift Maint.)", name_en: "Lift Maintenance", color: "#9e9e9e", icon: "fa-arrows-alt-v" },
    { id: "exp_gym_maint", name_gu: "જીમ મરામત (Gym Maint.)", name_en: "Gym Maintenance", color: "#00bcd4", icon: "fa-dumbbell" },
    { id: "exp_bank_charges", name_gu: "બેંક ચાર્જિસ (Bank Charges)", name_en: "Bank Charges", color: "#ff5722", icon: "fa-university" },
    { id: "exp_furniture", name_gu: "ફર્નિચર ખરીદી (Furniture)", name_en: "Furniture Purchase", color: "#795548", icon: "fa-chair" },
    { id: "exp_stationary", name_gu: "સ્ટેશનરી ખરીદી (Stationary)", name_en: "Stationary Purchase", color: "#607d8b", icon: "fa-paperclip" },
    { id: "exp_light_bill", name_gu: "લાઈટ બિલ (Light Bill)", name_en: "Light Bill", color: "#ffeb3b", icon: "fa-bolt" },
    { id: "exp_electric_equip", name_gu: "ઇલેક્ટ્રિક સાધનો ખરીદી", name_en: "Electric Equipment Purchase", color: "#ffc107", icon: "fa-plug" },
    { id: "exp_lift_amc", name_gu: "લિફ્ટ AMC (Lift AMC)", name_en: "Lift AMC", color: "#ff5722", icon: "fa-sync-alt" },
    { id: "exp_fire_bottle", name_gu: "ફાયર બોટલ રીફીલીંગ", name_en: "Fire Bottle Refilling", color: "#f44336", icon: "fa-fire-extinguisher" },
    { id: "exp_gardener_salary", name_gu: "માળી પગાર (Gardner Salary)", name_en: "Gardner Salary", color: "#4caf50", icon: "fa-seedling" },
    { id: "exp_misc", name_gu: "પરચૂરણ ખર્ચ", name_en: "Misc. Expense", color: "#9e9e9e", icon: "fa-shopping-cart" },
    { id: "contra_withdrawal", name_gu: "Bank Withdrawal", name_en: "Bank Withdrawal", color: "#9c27b0", icon: "fa-money-bill-wave" },
    { id: "contra_deposit", name_gu: "Bank Deposit", name_en: "Bank Deposit", color: "#009688", icon: "fa-university" }
];

// Helper to get past dates relative to current date (2026-06-24)
function getPastDate(daysAgo) {
    const baseDate = new Date("2026-06-24T12:00:00+05:30");
    baseDate.setDate(baseDate.getDate() - daysAgo);
    return baseDate.toISOString().split('T')[0];
}

// Seed Transactions (Realistic dummy data mapped to new heads)
const SEED_TRANSACTIONS = [];

const STORAGE_KEYS = {
    TRANSACTIONS: "orchid_heights_v2_transactions",
    OPENING_BALANCES: "orchid_heights_v2_opening_balances",
    INCOME_HEADS: "orchid_heights_v2_income_heads",
    EXPENSE_HEADS: "orchid_heights_v2_expense_heads"
};

class SocietyDB {
    constructor() {
        this.init();
    }

    init() {
        // Initialize Income Heads
        if (!localStorage.getItem(STORAGE_KEYS.INCOME_HEADS)) {
            localStorage.setItem(STORAGE_KEYS.INCOME_HEADS, JSON.stringify(DEFAULT_INCOME_HEADS));
        }

        // Initialize Expense Heads
        if (!localStorage.getItem(STORAGE_KEYS.EXPENSE_HEADS)) {
            localStorage.setItem(STORAGE_KEYS.EXPENSE_HEADS, JSON.stringify(DEFAULT_EXPENSE_HEADS));
        }

        // Database Migration: Split single bank balance into CBI and JCOM if it exists
        const currentBalances = JSON.parse(localStorage.getItem(STORAGE_KEYS.OPENING_BALANCES));
        if (currentBalances && currentBalances.hasOwnProperty('bank')) {
            currentBalances.bank_cbi = currentBalances.bank;
            currentBalances.bank_jcom = 0;
            delete currentBalances.bank;
            localStorage.setItem(STORAGE_KEYS.OPENING_BALANCES, JSON.stringify(currentBalances));
        }

        // Force reset to the user's custom opening cash balance once
        if (!localStorage.getItem("orchid_heights_v2_setup_30300")) {
            localStorage.setItem(STORAGE_KEYS.OPENING_BALANCES, JSON.stringify({ cash: 30300, bank_cbi: 0, bank_jcom: 0, fd: 0 }));
            localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
            localStorage.setItem("orchid_heights_v2_setup_30300", "true");
        }

        // Initialize Transactions
        if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
            localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(SEED_TRANSACTIONS));
        }

        // Initialize Opening Balances (As of 2026-04-01 - Start of FY)
        if (!localStorage.getItem(STORAGE_KEYS.OPENING_BALANCES)) {
            const initialBalances = {
                cash: 30300,
                bank_cbi: 0,
                bank_jcom: 0,
                fd: 0
            };
            localStorage.setItem(STORAGE_KEYS.OPENING_BALANCES, JSON.stringify(initialBalances));
        }
    }

    // Getters
    getTransactions() {
        const txs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) || [];
        // Sort by date descending
        return txs.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    getIncomeHeads() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.INCOME_HEADS)) || [];
    }

    getExpenseHeads() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSE_HEADS)) || [];
    }

    getOpeningBalances() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.OPENING_BALANCES)) || { cash: 0, bank_cbi: 0, bank_jcom: 0, fd: 0 };
    }

    getOpeningBalancesAtDate(targetDateStr) {
        const transactions = this.getTransactions();
        const opening = this.getOpeningBalances();
        let cash = opening.cash;
        let bank_cbi = opening.bank_cbi || 0;
        let bank_jcom = opening.bank_jcom || 0;
        let fd = opening.fd || 0;
        
        transactions.forEach(tx => {
            if (tx.date < targetDateStr) {
                const amt = parseFloat(tx.amount) || 0;
                if (tx.headId === "contra_withdrawal") {
                    cash += amt;
                    if (tx.paymentMode === "Bank: JCOM") {
                        bank_jcom -= amt;
                    } else {
                        bank_cbi -= amt;
                    }
                } else if (tx.headId === "contra_deposit") {
                    cash -= amt;
                    if (tx.paymentMode === "Bank: JCOM") {
                        bank_jcom += amt;
                    } else {
                        bank_cbi += amt;
                    }
                } else {
                    if (tx.type === "income") {
                        if (tx.paymentMode === "Cash") cash += amt;
                        else if (tx.paymentMode === "Bank: JCOM") bank_jcom += amt;
                        else if (tx.paymentMode === "FD") fd += amt;
                        else bank_cbi += amt; // default to CBI for Bank
                    } else {
                        if (tx.paymentMode === "Cash") cash -= amt;
                        else if (tx.paymentMode === "Bank: JCOM") bank_jcom -= amt;
                        else if (tx.paymentMode === "FD") fd -= amt;
                        else bank_cbi -= amt; // default to CBI for Bank
                    }
                }
            }
        });
        
        return { cash, bank_cbi, bank_jcom, fd };
    }

    // Setters / Modifiers
    saveTransactions(transactions) {
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    }

    saveIncomeHeads(heads) {
        localStorage.setItem(STORAGE_KEYS.INCOME_HEADS, JSON.stringify(heads));
    }

    saveExpenseHeads(heads) {
        localStorage.setItem(STORAGE_KEYS.EXPENSE_HEADS, JSON.stringify(heads));
    }

    saveOpeningBalances(balances) {
        localStorage.setItem(STORAGE_KEYS.OPENING_BALANCES, JSON.stringify(balances));
    }

    // Transaction CRUD
    addTransaction(tx) {
        const transactions = this.getTransactions();
        // Generate simple unique id if not present
        if (!tx.id) {
            tx.id = "tx_" + Date.now();
        }
        transactions.push(tx);
        this.saveTransactions(transactions);
        return tx;
    }

    updateTransaction(updatedTx) {
        let transactions = this.getTransactions();
        transactions = transactions.map(tx => tx.id === updatedTx.id ? updatedTx : tx);
        this.saveTransactions(transactions);
        return updatedTx;
    }

    deleteTransaction(id) {
        let transactions = this.getTransactions();
        transactions = transactions.filter(tx => tx.id !== id);
        this.saveTransactions(transactions);
    }

    // Head/Category CRUD
    addIncomeHead(head) {
        const heads = this.getIncomeHeads();
        if (!head.id) {
            head.id = "inc_" + Date.now();
        }
        heads.push(head);
        this.saveIncomeHeads(heads);
        return head;
    }

    deleteIncomeHead(id) {
        let heads = this.getIncomeHeads();
        heads = heads.filter(h => h.id !== id);
        this.saveIncomeHeads(heads);
    }

    updateIncomeHead(updatedHead) {
        let heads = this.getIncomeHeads();
        heads = heads.map(h => h.id === updatedHead.id ? updatedHead : h);
        this.saveIncomeHeads(heads);
        return updatedHead;
    }

    addExpenseHead(head) {
        const heads = this.getExpenseHeads();
        if (!head.id) {
            head.id = "exp_" + Date.now();
        }
        heads.push(head);
        this.saveExpenseHeads(heads);
        return head;
    }

    deleteExpenseHead(id) {
        let heads = this.getExpenseHeads();
        heads = heads.filter(h => h.id !== id);
        this.saveExpenseHeads(heads);
    }

    updateExpenseHead(updatedHead) {
        let heads = this.getExpenseHeads();
        heads = heads.map(h => h.id === updatedHead.id ? updatedHead : h);
        this.saveExpenseHeads(heads);
        return updatedHead;
    }

    // Database import/export
    exportBackup() {
        const backup = {
            transactions: this.getTransactions(),
            incomeHeads: this.getIncomeHeads(),
            expenseHeads: this.getExpenseHeads(),
            openingBalances: this.getOpeningBalances(),
            exportDate: new Date().toISOString(),
            societyName: "Orchid Heights"
        };
        return JSON.stringify(backup, null, 2);
    }

    importBackup(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.transactions && data.incomeHeads && data.expenseHeads && data.openingBalances) {
                localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
                localStorage.setItem(STORAGE_KEYS.INCOME_HEADS, JSON.stringify(data.incomeHeads));
                localStorage.setItem(STORAGE_KEYS.EXPENSE_HEADS, JSON.stringify(data.expenseHeads));
                localStorage.setItem(STORAGE_KEYS.OPENING_BALANCES, JSON.stringify(data.openingBalances));
                return true;
            }
            return false;
        } catch (e) {
            console.error("Backup import failed", e);
            return false;
        }
    }

    // Calculations & Reports
    getFinancialYearSummary(fyStartYear = 2026) {
        const transactions = this.getTransactions();
        const startStr = `${fyStartYear}-04-01`;
        const endStr = `${fyStartYear + 1}-03-31`;

        const fyTransactions = transactions.filter(tx => {
            return tx.date >= startStr && tx.date <= endStr;
        });

        let totalIncome = 0;
        let totalExpense = 0;

        const incomeByHead = {};
        const expenseByHead = {};

        this.getIncomeHeads().forEach(h => incomeByHead[h.id] = 0);
        this.getExpenseHeads().forEach(h => expenseByHead[h.id] = 0);

        fyTransactions.forEach(tx => {
            const amount = parseFloat(tx.amount) || 0;
            if (tx.headId === "contra_withdrawal" || tx.headId === "contra_deposit") {
                return;
            }
            if (tx.type === "income") {
                totalIncome += amount;
                incomeByHead[tx.headId] = (incomeByHead[tx.headId] || 0) + amount;
            } else {
                totalExpense += amount;
                expenseByHead[tx.headId] = (expenseByHead[tx.headId] || 0) + amount;
            }
        });

        const opening = this.getOpeningBalances();
        const openingTotal = opening.cash + (opening.bank_cbi || 0) + (opening.bank_jcom || 0) + opening.fd;
        const surplus = totalIncome - totalExpense;
        const closingTotal = openingTotal + surplus;

        return {
            opening,
            openingTotal,
            totalIncome,
            totalExpense,
            surplus,
            closingTotal,
            incomeByHead,
            expenseByHead,
            transactions: fyTransactions
        };
    }

    getMonthSummary(year, month) {
        const transactions = this.getTransactions();
        // month is 1-indexed (1-12)
        const monthStr = month < 10 ? `0${month}` : `${month}`;
        const prefix = `${year}-${monthStr}`;

        const monthTransactions = transactions.filter(tx => tx.date.startsWith(prefix));

        let totalIncome = 0;
        let totalExpense = 0;

        const incomeByHead = {};
        const expenseByHead = {};

        this.getIncomeHeads().forEach(h => incomeByHead[h.id] = 0);
        this.getExpenseHeads().forEach(h => expenseByHead[h.id] = 0);

        monthTransactions.forEach(tx => {
            const amount = parseFloat(tx.amount) || 0;
            if (tx.headId === "contra_withdrawal" || tx.headId === "contra_deposit") {
                return;
            }
            if (tx.type === "income") {
                totalIncome += amount;
                incomeByHead[tx.headId] = (incomeByHead[tx.headId] || 0) + amount;
            } else {
                totalExpense += amount;
                expenseByHead[tx.headId] = (expenseByHead[tx.headId] || 0) + amount;
            }
        });

        const startOfPeriodStr = `${year}-${monthStr}-01`;
        const opening = this.getOpeningBalancesAtDate(startOfPeriodStr);
        const openingTotal = opening.cash + (opening.bank_cbi || 0) + (opening.bank_jcom || 0) + (opening.fd || 0);

        // Next month start
        const nextMonthDate = new Date(year, month, 1);
        const nextMonthStr = nextMonthDate.toISOString().split('T')[0];
        const closing = this.getOpeningBalancesAtDate(nextMonthStr);
        const closingTotal = closing.cash + (closing.bank_cbi || 0) + (closing.bank_jcom || 0) + (closing.fd || 0);

        return {
            year,
            month,
            opening,
            openingBalance: openingTotal,
            totalIncome,
            totalExpense,
            closing,
            closingBalance: closingTotal,
            incomeByHead,
            expenseByHead,
            transactions: monthTransactions
        };
    }

    getDateRangeSummary(fromDateStr, toDateStr) {
        const transactions = this.getTransactions();
        const rangeTransactions = transactions.filter(tx => {
            return tx.date >= fromDateStr && tx.date <= toDateStr;
        });

        let totalIncome = 0;
        let totalExpense = 0;

        const incomeByHead = {};
        const expenseByHead = {};

        this.getIncomeHeads().forEach(h => incomeByHead[h.id] = 0);
        this.getExpenseHeads().forEach(h => expenseByHead[h.id] = 0);

        rangeTransactions.forEach(tx => {
            const amount = parseFloat(tx.amount) || 0;
            if (tx.headId === "contra_withdrawal" || tx.headId === "contra_deposit") {
                return;
            }
            if (tx.type === "income") {
                totalIncome += amount;
                incomeByHead[tx.headId] = (incomeByHead[tx.headId] || 0) + amount;
            } else {
                totalExpense += amount;
                expenseByHead[tx.headId] = (expenseByHead[tx.headId] || 0) + amount;
            }
        });

        // Compute opening balances at the start of this range
        const opening = this.getOpeningBalancesAtDate(fromDateStr);
        const openingTotal = opening.cash + (opening.bank_cbi || 0) + (opening.bank_jcom || 0) + (opening.fd || 0);

        // Compute closing balances at the end of this range
        const toDateObj = new Date(toDateStr);
        toDateObj.setDate(toDateObj.getDate() + 1);
        const nextDayStr = toDateObj.toISOString().split('T')[0];
        const closing = this.getOpeningBalancesAtDate(nextDayStr);
        const closingTotal = closing.cash + (closing.bank_cbi || 0) + (closing.bank_jcom || 0) + (closing.fd || 0);

        return {
            fromDate: fromDateStr,
            toDate: toDateStr,
            opening,
            openingBalance: openingTotal,
            totalIncome,
            totalExpense,
            closing,
            closingBalance: closingTotal,
            incomeByHead,
            expenseByHead,
            transactions: rangeTransactions
        };
    }
}

// Instantiation
const db = new SocietyDB();
