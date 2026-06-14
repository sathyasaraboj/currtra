// Core Mock Database State
const state = {
    // Real bank accounts & credit cards with explicit relational Types
    wallets: [
        { id: 1, name: "ICICI Bank", type: "BANK", currentBalance: 32500.50 },
        { id: 2, name: "HDFC Credit Card", type: "CREDIT_CARD", currentBalance: 6000.00 },
        { id: 3, name: "Cash Wallet", type: "CASH", currentBalance: 4000.00 }
    ],
    // Relational Payment Mode mapping (1 Account -> Many Modes)
    walletPaymentModes: {
        1: ["UPI (GPay)", "UPI (PhonePe)", "Debit Card", "Internet Banking"],
        2: ["Credit Card"],
        3: ["Cash"]
    },
    transactions: [
        // INCOME
        { id: 1, type: "INCOME", amount: 39516.14, walletId: 1, categoryName: "Salary", paymentMode: "Internet Banking", tags: ["#Salary"], description: "Salary", timestamp: new Date("2026-05-01T10:00:00Z").getTime() },
        { id: 2, type: "INCOME", amount: 2500.00, walletId: 1, categoryName: "Rent", paymentMode: "UPI", tags: ["#Rent"], description: "Rent", timestamp: new Date("2026-05-01T11:00:00Z").getTime() },
        { id: 3, type: "INCOME", amount: 81.41, walletId: 1, categoryName: "Investments", paymentMode: "Internet Banking", tags: ["#Investments"], description: "Profins - wint wealth", timestamp: new Date("2026-05-13T10:00:00Z").getTime() },
        // EXPENSES
        { id: 4, type: "EXPENSE", amount: 2507.00, walletId: 2, categoryName: "Bills", paymentMode: "Credit Card", tags: ["#Bills"], description: "Credit Card Bill", timestamp: new Date("2026-05-01T12:00:00Z").getTime() },
        { id: 5, type: "EXPENSE", amount: 564.00, walletId: 1, categoryName: "Food & Dining", paymentMode: "UPI", tags: ["#Food"], description: "Hotel Kannapa", timestamp: new Date("2026-05-02T13:00:00Z").getTime() },
        { id: 6, type: "EXPENSE", amount: 1000.00, walletId: 1, categoryName: "Utilities", paymentMode: "UPI", tags: ["#Utilities"], description: "Nagini Tailor", timestamp: new Date("2026-05-03T10:00:00Z").getTime() },
        { id: 7, type: "EXPENSE", amount: 750.00, walletId: 1, categoryName: "Entertainment", paymentMode: "UPI", tags: ["#Movie"], description: "Project Hailmary - Movie Ticket + Lunch", timestamp: new Date("2026-05-03T11:00:00Z").getTime() },
        { id: 8, type: "EXPENSE", amount: 120.00, walletId: 1, categoryName: "Entertainment", paymentMode: "UPI", tags: ["#Movie"], description: "Mommy movie", timestamp: new Date("2026-05-03T11:30:00Z").getTime() },
        { id: 9, type: "SAVING", amount: 2500.00, walletId: 1, categoryName: "Savings", paymentMode: "Internet Banking", tags: ["#SIP"], description: "Nifty SIP", timestamp: new Date("2026-05-03T12:00:00Z").getTime() },
        { id: 10, type: "EXPENSE", amount: 4000.00, walletId: 1, categoryName: "Debt", paymentMode: "UPI", tags: ["#Debt"], description: "To Amma", timestamp: new Date("2026-05-03T12:30:00Z").getTime() },
        { id: 11, type: "EXPENSE", amount: 240.00, walletId: 1, categoryName: "Entertainment", paymentMode: "UPI", tags: ["#Snacks"], description: "Popcorn + Coke", timestamp: new Date("2026-05-03T13:00:00Z").getTime() },
        { id: 12, type: "EXPENSE", amount: 1167.00, walletId: 1, categoryName: "Bills", paymentMode: "UPI", tags: ["#EB"], description: "EB Bill - Hollow Blocks", timestamp: new Date("2026-05-03T14:00:00Z").getTime() },
        { id: 13, type: "EXPENSE", amount: 240.00, walletId: 1, categoryName: "Entertainment", paymentMode: "UPI", tags: ["#Snacks"], description: "Project Hailmary - Movie Snack", timestamp: new Date("2026-05-03T14:30:00Z").getTime() },
        { id: 14, type: "EXPENSE", amount: 489.00, walletId: 1, categoryName: "Bills", paymentMode: "UPI", tags: ["#EB"], description: "EB Bill - House", timestamp: new Date("2026-05-03T15:00:00Z").getTime() },
        { id: 15, type: "EXPENSE", amount: 243.00, walletId: 1, categoryName: "Bills", paymentMode: "UPI", tags: ["#EB"], description: "EB Bill - Opticals", timestamp: new Date("2026-05-03T15:30:00Z").getTime() },
        { id: 16, type: "EXPENSE", amount: 621.00, walletId: 1, categoryName: "Bills", paymentMode: "UPI", tags: ["#EB"], description: "EB Bill - Moter", timestamp: new Date("2026-05-03T16:00:00Z").getTime() },
        { id: 17, type: "EXPENSE", amount: 3300.00, walletId: 1, categoryName: "Education", paymentMode: "UPI", tags: ["#Exam"], description: "MCA Exam Fee", timestamp: new Date("2026-05-03T16:30:00Z").getTime() },
        { id: 18, type: "EXPENSE", amount: 200.00, walletId: 1, categoryName: "Food & Dining", paymentMode: "UPI", tags: ["#Food"], description: "Chicken 65 (400g)", timestamp: new Date("2026-05-03T18:00:00Z").getTime() },
        { id: 19, type: "EXPENSE", amount: 10000.00, walletId: 1, categoryName: "Debt", paymentMode: "UPI", tags: ["#Interest"], description: "Intrest - Send to Dharmaraj Chithappa", timestamp: new Date("2026-05-06T10:00:00Z").getTime() },
        { id: 20, type: "EXPENSE", amount: 100.00, walletId: 1, categoryName: "Food & Dining", paymentMode: "UPI", tags: ["#Juice"], description: "Carrot Juice 🥕", timestamp: new Date("2026-05-06T11:00:00Z").getTime() },
        { id: 21, type: "SAVING", amount: 10000.00, walletId: 1, categoryName: "Savings", paymentMode: "Internet Banking", tags: ["#EmergencyFund"], description: "Savings Emergency Fund", timestamp: new Date("2026-05-06T12:00:00Z").getTime() },
        { id: 22, type: "EXPENSE", amount: 299.00, walletId: 1, categoryName: "Shopping", paymentMode: "UPI", tags: ["#Clothes"], description: "T-shirt at Yousta", timestamp: new Date("2026-05-06T18:00:00Z").getTime() },
        { id: 23, type: "EXPENSE", amount: 300.00, walletId: 1, categoryName: "Food & Dining", paymentMode: "UPI", tags: ["#Dinner"], description: "Dinner Roshan", timestamp: new Date("2026-05-07T20:00:00Z").getTime() },
        { id: 24, type: "EXPENSE", amount: 120.00, walletId: 1, categoryName: "Food & Dining", paymentMode: "UPI", tags: ["#Snacks"], description: "Jigarthanda", timestamp: new Date("2026-05-08T15:00:00Z").getTime() },
        { id: 25, type: "EXPENSE", amount: 100.00, walletId: 1, categoryName: "Food & Dining", paymentMode: "UPI", tags: ["#Juice"], description: "Carrot Juice 🥕", timestamp: new Date("2026-05-11T11:00:00Z").getTime() },
        { id: 26, type: "EXPENSE", amount: 620.00, walletId: 1, categoryName: "Food & Dining", paymentMode: "UPI", tags: ["#Lunch"], description: "Lunch Amount", timestamp: new Date("2026-05-11T13:00:00Z").getTime() },
        { id: 27, type: "EXPENSE", amount: 130.00, walletId: 1, categoryName: "Food & Dining", paymentMode: "UPI", tags: ["#Lunch"], description: "Lunch at JFC", timestamp: new Date("2026-05-15T13:30:00Z").getTime() },
        { id: 28, type: "EXPENSE", amount: 210.00, walletId: 1, categoryName: "Transportation", paymentMode: "UPI", tags: ["#Petrol"], description: "Petrol", timestamp: new Date("2026-05-16T09:00:00Z").getTime() },
        { id: 29, type: "EXPENSE", amount: 235.00, walletId: 1, categoryName: "Shopping", paymentMode: "UPI", tags: ["#Clothes"], description: "Clothes", timestamp: new Date("2026-05-16T10:00:00Z").getTime() },
        { id: 30, type: "EXPENSE", amount: 275.00, walletId: 1, categoryName: "Food & Dining", paymentMode: "UPI", tags: ["#Snacks"], description: "Snacks", timestamp: new Date("2026-05-16T16:00:00Z").getTime() },
        { id: 31, type: "EXPENSE", amount: 800.00, walletId: 1, categoryName: "Shopping", paymentMode: "UPI", tags: ["#Clothes"], description: "T-shirt 👕", timestamp: new Date("2026-05-16T18:00:00Z").getTime() }
    ],
    budgets: [
        { id: 1, categoryName: "Food & Dining", limit: 5000.00, spent: 4000.00 },
        { id: 2, categoryName: "Shopping", limit: 10000.00, spent: 7500.00 },
        { id: 3, categoryName: "Bills", limit: 8000.00, spent: 8500.00 }
    ],
    debts: [
        { id: 1, personName: "Sakthi", amount: 3500.00, debtType: "LENT", walletId: 1, walletName: "ICICI Bank", status: "ACTIVE", notes: "Lent for travel tickets" },
        { id: 2, personName: "Sam", amount: 1200.00, debtType: "BORROWED", walletId: 3, walletName: "Cash Wallet", status: "ACTIVE", notes: "Borrowed for lunch cash change" }
    ],
    drafts: [
        { id: 1, type: "EXPENSE", amount: 850.00, merchant: "Zomato", senderPackage: "Messages", rawMessage: "Spent INR 850.00 at Zomato via UPI on ICICI Bank.", timestamp: Date.now() - 3600000 },
        { id: 2, type: "INCOME", amount: 5000.00, merchant: null, senderPackage: "Messages", rawMessage: "INR 5000 credited to your HDFC bank account via IMPS.", timestamp: Date.now() - 7200000 }
    ],
    activeDraftId: null,
    activeFormType: "EXPENSE",
    selectedSrcWalletId: 1,
    selectedTgtWalletId: 2,
    selectedCategoryId: 1,
    selectedPaymentModeValue: "",
    activeSettingWalletId: 1,
    activeSettingCategoryTab: "EXPENSE",
    activeDebtFilterTab: "ACTIVE",
    activeDebtFormType: "LENT",
    selectedDebtFormWalletId: 1,
    newAccountType: "BANK",
    availableNewAccountModes: ["UPI", "Debit Card", "Internet Banking"],
    scheduledPayments: [
        { id: 1, name: "Rent Payment", amount: 15000.00, type: "EXPENSE", categoryName: "Bills", walletId: 1, frequency: "MONTHLY", nextDueDate: "2026-06-01", notes: "Owner HDFC account transfer" },
        { id: 2, name: "Netflix Subscription", amount: 649.00, type: "EXPENSE", categoryName: "Bills", walletId: 2, frequency: "MONTHLY", nextDueDate: "2026-06-05", notes: "Auto-charged on HDFC credit card" },
        { id: 3, name: "Salary Credit Reminder", amount: 54000.00, type: "INCOME", categoryName: "Salary", walletId: 1, frequency: "MONTHLY", nextDueDate: "2026-06-30", notes: "Monthly job payout" }
    ],
    activeSchedFormType: "EXPENSE",
    activeSchedFormFreq: "MONTHLY",
    selectedSchedFormWalletId: 1,
    selectedSchedFormCategoryId: 1,
    savingsGoals: [
        { id: 1, name: "Emergency Fund", targetAmount: 50000.00, currentAmount: 15000.00, targetDate: "2026-12-31" },
        { id: 2, name: "New Laptop", targetAmount: 80000.00, currentAmount: 35000.00, targetDate: "2026-08-15" }
    ]
};

const categories = {
    EXPENSE: [
        { id: 1, name: "Food & Dining", color: "#FF5722" },
        { id: 2, name: "Shopping", color: "#E91E63" },
        { id: 3, name: "Bills", color: "#9C27B0" },
        { id: 8, name: "Mutual Funds", color: "#3F51B5" }, // Allowed to repeat as expense
        { id: 9, name: "Utilities", color: "#FF9800" },
        { id: 10, name: "Entertainment", color: "#E040FB" },
        { id: 11, name: "Debt", color: "#795548" },
        { id: 12, name: "Education", color: "#00BCD4" },
        { id: 13, name: "Transportation", color: "#607D8B" }
    ],
    INCOME: [
        { id: 4, name: "Salary", color: "#4CAF50" },
        { id: 5, name: "Freelancing", color: "#8BC34A" },
        { id: 14, name: "Rent", color: "#009688" },
        { id: 15, name: "Investments", color: "#3F51B5" }
    ],
    SAVING: [
        { id: 6, name: "Emergency Fund", color: "#009688" },
        { id: 7, name: "Mutual Funds", color: "#3F51B5" }, // Allowed to repeat as saving
        { id: 16, name: "Savings", color: "#4CAF50" }
    ]
};
