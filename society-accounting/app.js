/**
 * Orchid Society Accounting Manager - Core Logic & IndexedDB Operations
 */

// ==========================================================================
// TRANSLATION SYSTEM (ENGLISH & GUJARATI)
// ==========================================================================
const TRANSLATIONS = {
    en: {
        appName: "Orchid Society Manager",
        dashboard: "Dashboard",
        members: "Member Registry",
        expenses: "Expense Log",
        maintenance: "Maintenance Bill",
        reports: "Reports",
        settings: "Settings",
        totalIncome: "Total Income",
        totalExpenses: "Total Expenses",
        netBalance: "Net Balance",
        outstandingDues: "Outstanding Dues",
        recentTransactions: "Recent Transactions",
        categoryBreakdown: "Expense Category Breakdown",
        changeLanguage: "Change Language",
        addMember: "Add Member",
        editMember: "Edit Member",
        addExpense: "Record Expense",
        editExpense: "Edit Expense",
        importExcel: "Import Excel",
        exportBackup: "Backup Data",
        restoreBackup: "Restore Backup",
        resetDb: "Reset Database",
        flatNo: "Flat No",
        wing: "Wing",
        ownerName: "Owner Name",
        flatType: "Flat Type",
        monthlyCharge: "Monthly Charge",
        actions: "Actions",
        date: "Date",
        item: "Expense Item",
        category: "Category",
        amount: "Amount",
        status: "Status",
        paymentDate: "Payment Date",
        outstanding: "Outstanding",
        allFlatTypes: "All Flat Types",
        allCategories: "All Categories",
        searchMembers: "Search members by name or flat...",
        searchExpenses: "Search expenses (e.g. generator, cleaning)...",
        emptyState: "No records found.",
        confirmDelete: "Are you sure you want to delete this record?",
        successImport: "Expenses successfully imported from Excel!",
        errorImport: "Failed to parse Excel file. Make sure the headers match.",
        saveSuccess: "Record saved successfully!",
        deleteSuccess: "Record deleted successfully!",
        paid: "Paid",
        unpaid: "Unpaid",
        markPaid: "Mark Paid",
        markUnpaid: "Mark Unpaid",
        incomeSummary: "Income Summary (આવક વિગત)",
        expenseSummary: "Expense Summary (ખર્ચ વિગત)",
        statementPeriod: "Statement Period",
        totalIncomeLabel: "Total Income (કુલ આવક)",
        totalExpenseLabel: "Total Expenses (કુલ ખર્ચ)",
        netBalanceLabel: "Net Balance (ચોખ્ખી સિલક)"
    },
    gu: {
        appName: "ઓર્કિડ સોસાયટી મેનેજર",
        dashboard: "ડેશબોર્ડ",
        members: "સભ્યોની યાદી",
        expenses: "ખર્ચ રજીસ્ટર",
        maintenance: "મેન્ટેનન્સ બિલ",
        reports: "રીપોર્ટ્સ",
        settings: "સેટિંગ્સ",
        totalIncome: "કુલ આવક",
        totalExpenses: "કુલ ખર્ચ",
        netBalance: "ચોખ્ખી સિલક",
        outstandingDues: "બાકી લેણું",
        recentTransactions: "તાજેતરના વ્યવહારો",
        categoryBreakdown: "ખર્ચ શ્રેણી વિભાજન",
        changeLanguage: "ભાષા બદલો",
        addMember: "નવો સભ્ય ઉમેરો",
        editMember: "સભ્યની વિગતો સુધારો",
        addExpense: "ખર્ચ દાખલ કરો",
        editExpense: "ખર્ચ સુધારો",
        importExcel: "એક્સેલ ઇમ્પોર્ટ",
        exportBackup: "બેકઅપ ડેટા",
        restoreBackup: "બેકઅપ રીસ્ટોર",
        resetDb: "ડેટાબેઝ રીસેટ",
        flatNo: "ફ્લેટ નંબર",
        wing: "વિંગ",
        ownerName: "સભ્યનું નામ",
        flatType: "ફ્લેટ પ્રકાર",
        monthlyCharge: "માસિક ચાર્જ",
        actions: "ક્રિયાઓ",
        date: "તારીખ",
        item: "ખર્ચ વિગત",
        category: "ખર્ચ શ્રેણી",
        amount: "રકમ",
        status: "સ્થિતિ",
        paymentDate: "ચુકવણી તારીખ",
        outstanding: "બાકી લેણું",
        allFlatTypes: "બધા પ્રકાર",
        allCategories: "બધી શ્રેણીઓ",
        searchMembers: "સભ્ય અથવા ફ્લેટ થી શોધો...",
        searchExpenses: "ખર્ચ વિગત (દા.ત. જનરેટર, સફાઈ) થી શોધો...",
        emptyState: "કોઈ રેકોર્ડ મળ્યો નથી.",
        confirmDelete: "શું તમે ખરેખર આ રેકોર્ડ કાઢી નાખવા માંગો છો?",
        successImport: "એક્સેલમાંથી ખર્ચ સફળતાપૂર્વક આયાત કરવામાં આવ્યો!",
        errorImport: "એક્સેલ ફાઇલ રીડ કરવામાં ભૂલ થઈ. હેડર્સ બરાબર છે ને?",
        saveSuccess: "રેકોર્ડ સફળતાપૂર્વક સાચવવામાં આવ્યો!",
        deleteSuccess: "રેકોર્ડ સફળતાપૂર્વક કાઢી નાખવામાં આવ્યો!",
        paid: "ચૂકવેલ",
        unpaid: "બાકી",
        markPaid: "ચૂકવેલ કરો",
        markUnpaid: "બાકી કરો",
        incomeSummary: "આવક વિગત (Income Summary)",
        expenseSummary: "ખર્ચ વિગત (Expense Summary)",
        statementPeriod: "પત્રક સમયગાળો",
        totalIncomeLabel: "કુલ આવક (Total Income)",
        totalExpenseLabel: "કુલ ખર્ચ (Total Expenses)",
        netBalanceLabel: "ચોખ્ખી સિલક (Net Balance)"
    }
};

let currentLang = localStorage.getItem("orchid_lang") || "en";

// Firebase Global references
let firebaseDb = null;
let firebaseUser = null;
let firebaseBypassed = sessionStorage.getItem("fb_auth_bypassed") === "true";


// ==========================================================================
// DATABASE SETUP (INDEXEDDB)
// ==========================================================================
const DB_NAME = "OrchidSocietyDB";
const DB_VERSION = 1;
let db = null;

function initDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onupgradeneeded = function(e) {
            const dbInstance = e.target.result;
            
            // Members Store (flat no, owner, type, custom charge)
            if (!dbInstance.objectStoreNames.contains("members")) {
                dbInstance.createObjectStore("members", { keyPath: "id", autoIncrement: true });
            }
            
            // Expenses Store (date, item, category, amount)
            if (!dbInstance.objectStoreNames.contains("expenses")) {
                dbInstance.createObjectStore("expenses", { keyPath: "id", autoIncrement: true });
            }
            
            // Maintenance Payments Store (memberId, year_month, amountPaid, paymentDate, status)
            if (!dbInstance.objectStoreNames.contains("payments")) {
                dbInstance.createObjectStore("payments", { keyPath: "id", autoIncrement: true });
            }
            
            // Settings Store (key-value pair for maintenance rates, society details, etc.)
            if (!dbInstance.objectStoreNames.contains("settings")) {
                dbInstance.createObjectStore("settings", { keyPath: "key" });
            }
        };
        
        request.onsuccess = function(e) {
            db = e.target.result;
            resolve(db);
        };
        
        request.onerror = function(e) {
            console.error("Database open error:", e.target.error);
            reject(e.target.error);
        };
    });
}

// Helper to perform database transactions
function getStore(storeName, mode = "readonly") {
    const tx = db.transaction(storeName, mode);
    return tx.objectStore(storeName);
}

// ==========================================================================
// APP STATE & CONSTANTS
// ==========================================================================
const CATEGORY_MAP = {
    "Security": { en: "Security", gu: "સિક્યુરીટી" },
    "Cleaning": { en: "Cleaning", gu: "સફાઈ" },
    "Repairs & Maintenance": { en: "Repairs & Maintenance", gu: "રીપેરીંગ/જાળવણી" },
    "Electricity & Power": { en: "Electricity & Power", gu: "વીજળી બીલ/જનરેટર" },
    "Gardening": { en: "Gardening", gu: "બગીચો" },
    "Other": { en: "Other Operational", gu: "અન્ય ખર્ચ" }
};

const DEFAULT_MEMBERS = [
    { wing: "A", flat: "101", owner: "Hareshbhai Patel", type: "3 BHK" },
    { wing: "A", flat: "102", owner: "Rajeshbhai Shah", type: "4 BHK" },
    { wing: "A", flat: "201", owner: "Arvindbhai Savaliya", type: "3 BHK" },
    { wing: "A", flat: "202", owner: "Kiritbhai Vekariya", type: "3 BHK" },
    { wing: "A", flat: "301", owner: "Manishbhai Gajera", type: "4 BHK" },
    { wing: "A", flat: "302", owner: "Dineshbhai Ribadiya", type: "3 BHK" },
    { wing: "B", flat: "101", owner: "Vijaybhai Dobariya", type: "3 BHK" },
    { wing: "B", flat: "102", owner: "Sureshbhai Vachhani", type: "4 BHK" },
    { wing: "B", flat: "201", owner: "Jethabhai Radadiya", type: "3 BHK" },
    { wing: "B", flat: "202", owner: "Gopalbhai Sanghani", type: "4 BHK" },
    { wing: "B", flat: "301", owner: "Bhupatbhai Chovatia", type: "3 BHK" },
    { wing: "B", flat: "302", owner: "Mansukhbhai Bhalala", type: "3 BHK" }
];

let appSettings = {
    rate3BHK: 2000,
    rate4BHK: 2500
};

let currentTab = "dashboard";
let currentBillingMonth = "2024-07"; // default to July 2024 corresponding to Excel start

// ==========================================================================
// SEEDING DATA & INITIALIZATION
// ==========================================================================
async function seedDatabaseIfEmpty() {
    // 1. Settings Seeding
    const settingsStore = getStore("settings", "readwrite");
    const getSettingsReq = settingsStore.get("config");
    
    await new Promise((resolve) => {
        getSettingsReq.onsuccess = function() {
            if (getSettingsReq.result) {
                appSettings = getSettingsReq.result.val;
                resolve();
            } else {
                settingsStore.put({ key: "config", val: appSettings }).onsuccess = () => resolve();
            }
        };
    });

    // 2. Members Seeding
    const membersStore = getStore("members", "readwrite");
    const countReq = membersStore.count();
    
    const count = await new Promise((resolve) => {
        countReq.onsuccess = () => resolve(countReq.result);
    });

    if (count === 0) {
        console.log("Seeding default members...");
        for (const m of DEFAULT_MEMBERS) {
            await new Promise((resolve) => {
                membersStore.add(m).onsuccess = () => resolve();
            });
        }
    }
}

// ==========================================================================
// FIREBASE CLOUD INITIALIZER & SYNCHRONIZER ENGINE
// ==========================================================================
function initFirebaseApp() {
    if (typeof firebase === 'undefined') {
        console.warn("Firebase SDK is not loaded. Cloud features are unavailable.");
        return;
    }
    
    let fbConfig = null;
    try {
        fbConfig = JSON.parse(localStorage.getItem("orchid_fb_config"));
    } catch(e) {}
    
    if (fbConfig && fbConfig.apiKey) {
        try {
            if (firebase.apps.length === 0) {
                firebase.initializeApp(fbConfig);
            }
            firebaseDb = firebase.firestore();
            
            // Show config values in settings inputs if elements are ready
            const keyEl = document.getElementById("fb-api-key");
            if (keyEl) {
                keyEl.value = fbConfig.apiKey;
                document.getElementById("fb-auth-domain").value = fbConfig.authDomain;
                document.getElementById("fb-project-id").value = fbConfig.projectId;
                document.getElementById("fb-app-id").value = fbConfig.appId;
            }
            
            // Set up Auth state listener
            firebase.auth().onAuthStateChanged(async (user) => {
                if (user) {
                    firebaseUser = user;
                    firebaseBypassed = false;
                    
                    // Show Sync button and Sign Out button
                    document.getElementById("btn-cloud-sync").style.display = "inline-flex";
                    document.getElementById("btn-logout-fb").style.display = "inline-block";
                    
                    // Hide auth overlay modal
                    document.getElementById("modal-auth-overlay").classList.remove("active");
                    
                    showToast("Connected to Firebase: " + user.email, "success");
                    
                    // Perform initial sync
                    syncWithFirebase();
                } else {
                    firebaseUser = null;
                    document.getElementById("btn-cloud-sync").style.display = "none";
                    document.getElementById("btn-logout-fb").style.display = "none";
                    
                    // If not bypassed, show auth overlay modal
                    if (!firebaseBypassed) {
                        document.getElementById("modal-auth-overlay").classList.add("active");
                    }
                }
            });
        } catch (err) {
            console.error("Firebase init failed:", err);
            showToast("Firebase Config error!", "error");
        }
    } else {
        // No Firebase config, ensure overlay and sync buttons are hidden
        document.getElementById("modal-auth-overlay").classList.remove("active");
        document.getElementById("btn-cloud-sync").style.display = "none";
    }
}

async function syncWithFirebase() {
    if (!firebaseDb || !firebaseUser) return;
    
    const syncIcon = document.getElementById("sync-icon");
    const syncText = document.getElementById("sync-text");
    
    // Set loading state
    syncIcon.textContent = "🔄";
    syncIcon.classList.add("spin");
    syncText.textContent = "Syncing...";
    
    const userId = firebaseUser.uid;
    
    try {
        // Sync Members
        const localMembers = await getAllRecords("members");
        for (const m of localMembers) {
            await firebaseDb.collection("users").doc(userId).collection("members").doc(m.id.toString()).set(m);
        }
        const cloudMembers = await firebaseDb.collection("users").doc(userId).collection("members").get();
        const mStore = getStore("members", "readwrite");
        cloudMembers.forEach(doc => {
            const m = doc.data();
            m.id = Number(doc.id);
            mStore.put(m);
        });

        // Sync Expenses
        const localExpenses = await getAllRecords("expenses");
        for (const e of localExpenses) {
            await firebaseDb.collection("users").doc(userId).collection("expenses").doc(e.id.toString()).set(e);
        }
        const cloudExpenses = await firebaseDb.collection("users").doc(userId).collection("expenses").get();
        const eStore = getStore("expenses", "readwrite");
        cloudExpenses.forEach(doc => {
            const e = doc.data();
            e.id = Number(doc.id);
            eStore.put(e);
        });

        // Sync Payments
        const localPayments = await getAllRecords("payments");
        for (const p of localPayments) {
            await firebaseDb.collection("users").doc(userId).collection("payments").doc(p.id.toString()).set(p);
        }
        const cloudPayments = await firebaseDb.collection("users").doc(userId).collection("payments").get();
        const pStore = getStore("payments", "readwrite");
        cloudPayments.forEach(doc => {
            const p = doc.data();
            p.id = Number(doc.id);
            pStore.put(p);
        });
        
        // Reset status to Success
        syncIcon.textContent = "☁️";
        syncIcon.classList.remove("spin");
        syncText.textContent = "Synced";
        showToast("Database successfully synced with Cloud!", "success");
        
        // Refresh UI of active tab
        if (currentTab === "dashboard") renderDashboard();
        else if (currentTab === "members") renderMembers();
        else if (currentTab === "expenses") renderExpenses();
        else if (currentTab === "maintenance") renderMaintenance();
        else if (currentTab === "reports") renderReports();
        
    } catch (err) {
        console.error("Cloud Sync Error:", err);
        syncIcon.textContent = "⚠️";
        syncIcon.classList.remove("spin");
        syncText.textContent = "Sync Error";
        showToast("Cloud sync failed. Check Firebase Firestore security rules.", "error");
    }
}

// Simple deferred background sync trigger
function triggerAutoSync() {
    if (firebaseDb && firebaseUser) {
        // Sync in background
        syncWithFirebase();
    }
}

// Initialize billing months in dropdown
const BILLING_MONTHS = [
    { value: "2024-07", label: "July 2024 (જુલાઈ 2024)" },
    { value: "2024-08", label: "August 2024 (ઓગસ્ટ 2024)" },
    { value: "2024-09", label: "September 2024 (સપ્ટેમ્બર 2024)" },
    { value: "2024-10", label: "October 2024 (ઓક્ટોબર 2024)" },
    { value: "2024-11", label: "November 2024 (નવેમ્બર 2024)" },
    { value: "2024-12", label: "December 2024 (ડિસેમ્બર 2024)" },
    { value: "2025-01", label: "January 2025 (જાન્યુઆરી 2025)" },
    { value: "2025-02", label: "February 2025 (ફેબ્રુઆરી 2025)" },
    { value: "2025-03", label: "March 2025 (માર્ચ 2025)" },
    { value: "2025-04", label: "April 2025 (એપ્રિલ 2025)" },
    { value: "2025-05", label: "May 2025 (મે 2025)" },
    { value: "2025-06", label: "June 2025 (જૂન 2025)" }
];

// ==========================================================================
// CORE DATA FETCHERS
// ==========================================================================
function getAllRecords(storeName) {
    return new Promise((resolve, reject) => {
        const store = getStore(storeName, "readonly");
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

function saveRecord(storeName, record) {
    return new Promise((resolve, reject) => {
        const store = getStore(storeName, "readwrite");
        const req = store.put(record);
        req.onsuccess = () => {
            resolve(req.result);
            triggerAutoSync();
        };
        req.onerror = () => reject(req.error);
    });
}

function deleteRecord(storeName, id) {
    return new Promise((resolve, reject) => {
        const store = getStore(storeName, "readwrite");
        const req = store.delete(id);
        req.onsuccess = () => {
            resolve(req.result);
            triggerAutoSync();
        };
        req.onerror = () => reject(req.error);
    });
}

// ==========================================================================
// BUSINESS CALCULATIONS & BILLING ENGINE
// ==========================================================================

// Calculates the monthly maintenance bill amount for a member
function getMonthlyRate(memberType) {
    return memberType === "4 BHK" ? appSettings.rate4BHK : appSettings.rate3BHK;
}

// Returns list of payments with member info
async function getLedgerForMonth(yearMonth) {
    const members = await getAllRecords("members");
    const payments = await getAllRecords("payments");
    
    // Group payments by memberId_month
    const paymentMap = {};
    payments.forEach(p => {
        paymentMap[`${p.memberId}_${p.month}`] = p;
    });

    return members.map(m => {
        const key = `${m.id}_${yearMonth}`;
        const payRecord = paymentMap[key];
        const billAmount = getMonthlyRate(m.type);
        
        return {
            memberId: m.id,
            flatNo: `${m.wing}-${m.flat}`,
            owner: m.owner,
            type: m.type,
            month: yearMonth,
            billAmount: billAmount,
            status: payRecord ? payRecord.status : "Unpaid",
            paymentDate: payRecord ? payRecord.paymentDate : "-",
            paymentId: payRecord ? payRecord.id : null
        };
    });
}

// Get outstanding dues for each member
async function getOutstandingDuesMap() {
    const members = await getAllRecords("members");
    const payments = await getAllRecords("payments");
    
    // Create a key map of paid months
    const paidKeys = new Set();
    payments.forEach(p => {
        if (p.status === "Paid") {
            paidKeys.add(`${p.memberId}_${p.month}`);
        }
    });

    const duesMap = {};
    members.forEach(m => {
        let totalDues = 0;
        // Loop through all defined billing months up to today
        BILLING_MONTHS.forEach(bm => {
            const key = `${m.id}_${bm.value}`;
            if (!paidKeys.has(key)) {
                totalDues += getMonthlyRate(m.type);
            }
        });
        duesMap[m.id] = totalDues;
    });
    
    return duesMap;
}

// Get Total Income, Total Expenses, Net Balance and Outstanding Dues
async function getFinancialKPIs() {
    const expenses = await getAllRecords("expenses");
    const payments = await getAllRecords("payments");
    const members = await getAllRecords("members");

    // 1. Total Expenses
    const totalExp = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    // 2. Total Income (Maintenance collected)
    const totalInc = payments.reduce((sum, p) => {
        if (p.status === "Paid") {
            const m = members.find(mem => mem.id === p.memberId);
            const rate = m ? getMonthlyRate(m.type) : 0;
            return sum + rate;
        }
        return sum;
    }, 0);

    // 3. Outstanding Dues
    const duesMap = await getOutstandingDuesMap();
    const totalDues = Object.values(duesMap).reduce((sum, d) => sum + d, 0);

    return {
        income: totalInc,
        expenses: totalExp,
        balance: totalInc - totalExp,
        dues: totalDues
    };
}

// ==========================================================================
// EXCEL IMPORT PARSER & GUJARATI KANBAN CATEGORY AUTO-MAPPING
// ==========================================================================
function mapGujaratiToCategory(description) {
    if (!description) return "Other";
    const desc = description.toLowerCase();
    
    // Cleaning / સફાઈ
    if (desc.includes("સફાઈ") || desc.includes("સાવરણી") || desc.includes("સાવરણા") || desc.includes("પગી") || desc.includes("કામદાર") || desc.includes("સાફ") || desc.includes("cleaning") || desc.includes("sweep")) {
        return "Cleaning";
    }
    // Security / સિક્યુરીટી
    if (desc.includes("સિક્યુરીટી") || desc.includes("સિક્યુ") || desc.includes("સીક્યુરીટી") || desc.includes("security") || desc.includes("guard")) {
        return "Security";
    }
    // Electricity & Power / વીજળી અને જનરેટર
    if (desc.includes("જનરેટર") || desc.includes("જ્નેરેટર") || desc.includes("ડીઝલ") || desc.includes("બીલ") || desc.includes("લાઈટ") || desc.includes("light") || desc.includes("diesel") || desc.includes("generator") || desc.includes("power")) {
        return "Electricity & Power";
    }
    // Gardening / બગીચો
    if (desc.includes("બગીચો") || desc.includes("ગાર્ડેન") || desc.includes("ગાર્ડન") || desc.includes("માળી") || desc.includes("રોપા") || desc.includes("દવા") || desc.includes("garden") || desc.includes("plant") || desc.includes("gardening")) {
        return "Gardening";
    }
    // Repairs & Maintenance / રીપેરીંગ અને પંપ
    if (desc.includes("મોટર") || desc.includes("રીપૈરીંગ") || desc.includes("રીપેરીંગ") || desc.includes("રીપેરીન્ગ") || desc.includes("cctv") || desc.includes("dvr") || desc.includes("રિમોટ") || desc.includes("ટાંકા") || desc.includes("પંપ") || desc.includes("લેમ્પ") || desc.includes("રિપેર") || desc.includes("repair") || desc.includes("maintenance")) {
        return "Repairs & Maintenance";
    }
    
    return "Other";
}

// Convert Excel Serial Date or Date string to YYYY-MM-DD format
function parseExcelDate(serial) {
    if (!serial || serial === "-") return "2024-07-01"; // default fallback for society-accounting
    
    // Check if it's already a numeric Excel serial representation
    if (typeof serial === 'number' || (!isNaN(serial) && !isNaN(parseFloat(serial)))) {
        try {
            const num = parseFloat(serial);
            const utc_days = Math.floor(num - 25569);
            const utc_value = utc_days * 86400;
            const date_info = new Date(utc_value * 1000);
            if (!isNaN(date_info.getTime())) {
                return date_info.toISOString().split('T')[0];
            }
        } catch(e) {}
    }
    
    // If it's a string, try split by common separators like - or /
    const parts = serial.toString().trim().split(/[-/]/);
    if (parts.length === 3) {
        let day = "", month = "", year = "";
        // Case: YYYY-MM-DD
        if (parts[0].length === 4) {
            year = parts[0];
            month = parts[1];
            day = parts[2];
        } 
        // Case: DD-MM-YYYY or MM-DD-YYYY
        else if (parts[2].length === 4) {
            // Under Indian locale/Gujarati logs, standard is DD-MM-YYYY
            day = parts[0];
            month = parts[1];
            year = parts[2];
        }
        // Case: DD-MM-YY or MM-DD-YY
        else if (parts[2].length === 2) {
            day = parts[0];
            month = parts[1];
            year = "20" + parts[2];
        }
        
        if (year && month && day) {
            if (month.length === 1) month = "0" + month;
            if (day.length === 1) day = "0" + day;
            return `${year}-${month}-${day}`;
        }
    }
    
    // Standard Javascript parsing fallback
    try {
        const parsed = new Date(serial);
        if (!isNaN(parsed.getTime())) {
            return parsed.toISOString().split('T')[0];
        }
    } catch(e) {}
    
    return "2024-07-01"; // Fallback to July 2024 (project start date)
}



// Handles parsing and loading Excel worksheets
function importExpensesFromExcel(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
                
                if (jsonData.length === 0) {
                    reject("Excel file is empty");
                    return;
                }
                
                // Find headers mappings dynamically
                const sampleRow = jsonData[0];
                let descKey = "";
                let dateKey = "";
                let amountKey = "";
                
                Object.keys(sampleRow).forEach(key => {
                    const cleanKey = key.trim().toLowerCase();
                    if (cleanKey === "કાર્ય" || cleanKey === "task" || cleanKey === "description" || cleanKey === "item") {
                        descKey = key;
                    } else if (cleanKey === "તારીખ" || cleanKey === "date") {
                        dateKey = key;
                    } else if (cleanKey === "ખર્ચ" || cleanKey === "expense" || cleanKey === "amount" || cleanKey === "rupees") {
                        amountKey = key;
                    }
                });
                
                // Fallbacks if clean matches fail
                if (!descKey) descKey = Object.keys(sampleRow)[0];
                if (!dateKey) dateKey = Object.keys(sampleRow)[1];
                if (!amountKey) amountKey = Object.keys(sampleRow)[2];
                
                let importCount = 0;
                
                for (const row of jsonData) {
                    const rawDesc = row[descKey] ? row[descKey].toString().trim() : "";
                    const rawDate = row[dateKey] ? row[dateKey] : "";
                    const rawAmount = row[amountKey] ? Number(row[amountKey]) : 0;
                    
                    // Filter out header or total rows
                    if (!rawDesc || rawDesc.toLowerCase() === "total" || rawDesc.toLowerCase() === "કુલ" || rawDesc === "") {
                        continue;
                    }
                    
                    let dateStr = parseExcelDate(rawDate);
                    // Handle non-date string headers like "જુલાઈ મહિનો" or "-"
                    if (!dateStr || dateStr === "-" || dateStr.includes("મહિનો") || dateStr.includes("month")) {
                        // Fallback date to July 2024 for Excel data
                        dateStr = "2024-07-01"; 
                    }
                    
                    const category = mapGujaratiToCategory(rawDesc);
                    
                    const expenseRecord = {
                        item: rawDesc,
                        date: dateStr,
                        category: category,
                        amount: rawAmount
                    };
                    
                    await saveRecord("expenses", expenseRecord);
                    importCount++;
                }
                
                resolve(importCount);
            } catch (err) {
                console.error("Excel import error:", err);
                reject(err);
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}

// ==========================================================================
// RENDER & UI CONTROLLERS
// ==========================================================================

// Display dynamic toast alert
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let icon = "🔔";
    if (type === "success") icon = "✅";
    if (type === "error") icon = "❌";
    if (type === "warning") icon = "⚠️";
    
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);
    
    // Auto-remove toast
    setTimeout(() => {
        toast.remove();
    }, 4000);
}

// Update translation labels throughout UI
function updateUILanguage() {
    const t = TRANSLATIONS[currentLang];
    
    // Sidebar Links
    document.querySelector('[data-tab="dashboard"] .menu-label').textContent = t.dashboard;
    document.querySelector('[data-tab="members"] .menu-label').textContent = t.members;
    document.querySelector('[data-tab="expenses"] .menu-label').textContent = t.expenses;
    document.querySelector('[data-tab="maintenance"] .menu-label').textContent = t.maintenance;
    document.querySelector('[data-tab="reports"] .menu-label').textContent = t.reports;
    document.querySelector('[data-tab="settings"] .menu-label').textContent = t.settings;
    document.getElementById("lang-btn").textContent = currentLang === "en" ? "ગુજરાતી" : "English";
    
    // Headers & Labels
    updatePageHeaders();
    
    // Update inputs placeholders
    document.getElementById("member-search").placeholder = t.searchMembers;
    document.getElementById("expense-search").placeholder = t.searchExpenses;
    
    // Settings labels
    document.querySelector("#settings-maintenance-form button").textContent = currentLang === "en" ? "Save Configuration" : "રૂપરેખા સાચવો";
}

function updatePageHeaders() {
    const t = TRANSLATIONS[currentLang];
    const pageTitle = document.getElementById("header-page-title");
    const pageSubtitle = document.getElementById("header-page-subtitle");
    
    if (currentTab === "dashboard") {
        pageTitle.textContent = t.dashboard;
        pageSubtitle.textContent = currentLang === "en" ? "Overview of Orchid Society accounts" : "ઓર્કિડ સોસાયટી હિસાબની એક નજરે સમરી";
    } else if (currentTab === "members") {
        pageTitle.textContent = t.members;
        pageSubtitle.textContent = currentLang === "en" ? "Manage flat owners registry" : "ફ્લેટ માલિકો અને સભ્યોની યાદી સંચાલન";
    } else if (currentTab === "expenses") {
        pageTitle.textContent = t.expenses;
        pageSubtitle.textContent = currentLang === "en" ? "Detailed logs of expenditures" : "સોસાયટીના તમામ ખર્ચાઓનું ખાતાવહી";
    } else if (currentTab === "maintenance") {
        pageTitle.textContent = t.maintenance;
        pageSubtitle.textContent = currentLang === "en" ? "Track maintenance collections" : "માસિક મેન્ટેનન્સ જમા રજીસ્ટર";
    } else if (currentTab === "reports") {
        pageTitle.textContent = t.reports;
        pageSubtitle.textContent = currentLang === "en" ? "Generate financial statements" : "નાણાકીય પત્રકો અને વાર્ષિક અહેવાલો";
    } else if (currentTab === "settings") {
        pageTitle.textContent = t.settings;
        pageSubtitle.textContent = currentLang === "en" ? "Configure system parameters" : "સિસ્ટમના દરો અને ડેટાબેઝ સેટિંગ્સ";
    }
}

// Render Dashboard UI
async function renderDashboard() {
    const kpis = await getFinancialKPIs();
    
    document.getElementById("kpi-total-income").textContent = `₹${kpis.income.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById("kpi-total-expenses").textContent = `₹${kpis.expenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById("kpi-net-balance").textContent = `₹${kpis.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById("kpi-outstanding-dues").textContent = `₹${kpis.dues.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Render Recent Transactions
    const expenses = await getAllRecords("expenses");
    const payments = await getAllRecords("payments");
    const members = await getAllRecords("members");

    // Mix payments and expenses together
    const txs = [];
    
    // Add paid payments
    payments.forEach(p => {
        if (p.status === "Paid") {
            const m = members.find(mem => mem.id === p.memberId);
            const rate = m ? getMonthlyRate(m.type) : 0;
            txs.push({
                desc: `${m ? `${m.wing}-${m.flat} - ${m.owner}` : "Member"} Maintenance (${p.month})`,
                date: p.paymentDate || "2026-01-01",
                amount: rate,
                type: "income"
            });
        }
    });
    
    // Add expenses
    expenses.forEach(e => {
        txs.push({
            desc: e.item,
            date: e.date,
            amount: e.amount,
            type: "expense"
        });
    });

    // Sort by date descending
    txs.sort((a,b) => new Date(b.date) - new Date(a.date));
    
    const recentContainer = document.getElementById("dashboard-recent-transactions");
    recentContainer.innerHTML = "";
    
    const recentTxs = txs.slice(0, 5);
    if (recentTxs.length === 0) {
        recentContainer.innerHTML = `<div class="empty-state">${TRANSLATIONS[currentLang].emptyState}</div>`;
    } else {
        recentTxs.forEach(t => {
            const sign = t.type === "income" ? "+" : "-";
            const colorClass = t.type === "income" ? "income" : "expense";
            const formattedDate = new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            
            const div = document.createElement("div");
            div.className = "transaction-item";
            div.innerHTML = `
                <div class="transaction-details">
                    <span class="transaction-name">${t.desc}</span>
                    <span class="transaction-meta">${formattedDate}</span>
                </div>
                <span class="transaction-amount ${colorClass}">${sign} ₹${t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            `;
            recentContainer.appendChild(div);
        });
    }

    // Render Dynamic SVG Donut Chart for Expense categories
    renderExpenseChart(expenses);
}

// Render dynamic Donut Chart using SVG
function renderExpenseChart(expenses) {
    const container = document.getElementById("expense-chart-container");
    container.innerHTML = "";
    
    // Group expenses by category
    const catTotals = {};
    Object.keys(CATEGORY_MAP).forEach(k => catTotals[k] = 0);
    
    expenses.forEach(e => {
        const cat = e.category || "Other";
        if (catTotals[cat] !== undefined) {
            catTotals[cat] += Number(e.amount || 0);
        } else {
            catTotals["Other"] += Number(e.amount || 0);
        }
    });

    const totalExp = Object.values(catTotals).reduce((sum, val) => sum + val, 0);
    
    if (totalExp === 0) {
        container.innerHTML = `<div class="chart-fallback">No expense data available to draw chart.</div>`;
        return;
    }

    // Colors list
    const colors = {
        "Security": "#ef4444",
        "Cleaning": "#10b981",
        "Repairs & Maintenance": "#3b82f6",
        "Electricity & Power": "#f59e0b",
        "Gardening": "#8b5cf6",
        "Other": "#64748b"
    };

    // Draw SVG Circle Sector
    // We can draw a modern dashboard donut chart using simple circle strokes
    let accumulatedPercent = 0;
    let svgContent = `<svg class="chart-svg" viewBox="0 0 42 42">
        <circle class="donut-hole" cx="21" cy="21" r="15.91549430918954" fill="transparent"></circle>
        <circle class="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="rgba(255,255,255,0.03)" stroke-width="3.5"></circle>
    `;

    Object.keys(catTotals).forEach(cat => {
        const amount = catTotals[cat];
        if (amount === 0) return;
        
        const percent = (amount / totalExp) * 100;
        const dashArray = `${percent} ${100 - percent}`;
        const dashOffset = 100 - accumulatedPercent + 25; // 25 to start at top (12 o'clock)
        const strokeColor = colors[cat];
        
        svgContent += `
            <circle class="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" 
                    stroke="${strokeColor}" stroke-width="3.8" 
                    stroke-dasharray="${dashArray}" stroke-dashoffset="${dashOffset}">
            </circle>
        `;
        accumulatedPercent += percent;
    });

    svgContent += `
        <g class="donut-text">
            <text x="50%" y="47%" class="donut-number" text-anchor="middle" font-size="5" fill="#f8fafc" font-weight="700">₹${Math.round(totalExp).toLocaleString('en-IN')}</text>
            <text x="50%" y="58%" class="donut-label" text-anchor="middle" font-size="2.5" fill="#94a3b8" font-weight="500">TOTAL EXPENSES</text>
        </g>
    </svg>`;

    // Build Legend
    let legendHtml = `<div class="chart-legend">`;
    Object.keys(catTotals).forEach(cat => {
        const amount = catTotals[cat];
        if (amount === 0) return;
        
        const label = currentLang === "en" ? CATEGORY_MAP[cat].en : CATEGORY_MAP[cat].gu;
        const percent = Math.round((amount / totalExp) * 100);
        legendHtml += `
            <div class="legend-item">
                <span class="legend-color" style="background-color: ${colors[cat]}"></span>
                <span>${label} (${percent}%)</span>
            </div>
        `;
    });
    legendHtml += `</div>`;

    const chartWrapper = document.createElement("div");
    chartWrapper.className = "flex-col align-center";
    chartWrapper.innerHTML = svgContent + legendHtml;
    container.appendChild(chartWrapper);
}

// Render Members List
async function renderMembers() {
    const members = await getAllRecords("members");
    const duesMap = await getOutstandingDuesMap();
    const searchVal = document.getElementById("member-search").value.toLowerCase();
    const filterType = document.getElementById("member-filter-type").value;
    
    const tbody = document.getElementById("members-table-body");
    tbody.innerHTML = "";

    const filtered = members.filter(m => {
        const matchSearch = m.owner.toLowerCase().includes(searchVal) || `${m.wing}-${m.flat}`.toLowerCase().includes(searchVal);
        const matchType = filterType === "all" || m.type === filterType;
        return matchSearch && matchType;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-secondary">${TRANSLATIONS[currentLang].emptyState}</td></tr>`;
        return;
    }

    filtered.forEach(m => {
        const dues = duesMap[m.id] || 0;
        const charge = getMonthlyRate(m.type);
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="font-bold">${m.flat}</td>
            <td>Wing ${m.wing}</td>
            <td>${m.owner}</td>
            <td><span class="badge ${m.type === '4 BHK' ? 'badge-success' : 'badge-warning'}">${m.type}</span></td>
            <td>₹${charge.toLocaleString('en-IN')}</td>
            <td class="${dues > 0 ? 'text-danger font-semibold' : 'text-success'}">₹${dues.toLocaleString('en-IN')}</td>
            <td class="text-right">
                <button class="btn-text btn-sm" onclick="editMember(${m.id})">✏️</button>
                <button class="btn-text btn-sm text-danger" onclick="deleteMember(${m.id})">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Render Expenses List
async function renderExpenses() {
    const expenses = await getAllRecords("expenses");
    const searchVal = document.getElementById("expense-search").value.toLowerCase();
    const filterCat = document.getElementById("expense-filter-category").value;
    
    const tbody = document.getElementById("expenses-table-body");
    tbody.innerHTML = "";

    // Fill Categories Dropdown
    const catSelect = document.getElementById("expense-filter-category");
    const activeVal = catSelect.value;
    catSelect.innerHTML = `<option value="all">${TRANSLATIONS[currentLang].allCategories}</option>`;
    Object.keys(CATEGORY_MAP).forEach(k => {
        const label = currentLang === "en" ? CATEGORY_MAP[k].en : CATEGORY_MAP[k].gu;
        const option = document.createElement("option");
        option.value = k;
        option.textContent = label;
        catSelect.appendChild(option);
    });
    catSelect.value = activeVal;

    const filtered = expenses.filter(e => {
        const matchSearch = e.item.toLowerCase().includes(searchVal) || (e.category || "").toLowerCase().includes(searchVal);
        const matchCat = filterCat === "all" || e.category === filterCat;
        return matchSearch && matchCat;
    });

    // Sort by date descending
    filtered.sort((a,b) => new Date(b.date) - new Date(a.date));

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-secondary">${TRANSLATIONS[currentLang].emptyState}</td></tr>`;
        return;
    }

    filtered.forEach(e => {
        const catLabel = currentLang === "en" ? CATEGORY_MAP[e.category]?.en : CATEGORY_MAP[e.category]?.gu;
        const formattedDate = new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${formattedDate}</td>
            <td class="font-medium">${e.item}</td>
            <td><span class="badge" style="background-color: rgba(255,255,255,0.03); color: var(--text-secondary);">${catLabel || e.category}</span></td>
            <td class="text-right font-semibold">₹${e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td class="text-right">
                <button class="btn-text btn-sm" onclick="editExpense(${e.id})">✏️</button>
                <button class="btn-text btn-sm text-danger" onclick="deleteExpense(${e.id})">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Render Maintenance Billing
async function renderMaintenance() {
    const container = document.getElementById("billing-months-list");
    container.innerHTML = "";
    
    // Create tabs for billing months
    BILLING_MONTHS.forEach(bm => {
        const btn = document.createElement("button");
        btn.className = `month-tab ${currentBillingMonth === bm.value ? 'active' : ''}`;
        btn.textContent = currentLang === "en" ? bm.value : bm.label.split(' ')[1] || bm.value;
        btn.onclick = () => {
            currentBillingMonth = bm.value;
            renderMaintenance();
        };
        container.appendChild(btn);
    });

    const ledger = await getLedgerForMonth(currentBillingMonth);
    const tbody = document.getElementById("maintenance-table-body");
    tbody.innerHTML = "";

    ledger.forEach(l => {
        const statusBadge = l.status === "Paid" ? 'badge-success' : 'badge-danger';
        const statusLabel = l.status === "Paid" ? TRANSLATIONS[currentLang].paid : TRANSLATIONS[currentLang].unpaid;
        
        const actionBtn = l.status === "Paid" 
            ? `<button class="btn btn-secondary btn-sm" onclick="togglePayment(${l.memberId}, '${l.month}', 'Unpaid', ${l.paymentId})">${TRANSLATIONS[currentLang].markUnpaid}</button>`
            : `<button class="btn btn-primary btn-sm" onclick="togglePayment(${l.memberId}, '${l.month}', 'Paid', null)">${TRANSLATIONS[currentLang].markPaid}</button>`;
        
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="font-bold">${l.flatNo}</td>
            <td>${l.owner}</td>
            <td><span class="badge" style="background-color: rgba(255,255,255,0.03); color: var(--text-secondary);">${l.type}</span></td>
            <td>${l.month}</td>
            <td class="font-semibold">₹${l.billAmount.toLocaleString('en-IN')}</td>
            <td><span class="badge ${statusBadge}">${statusLabel}</span></td>
            <td>${l.paymentDate}</td>
            <td class="text-right">${actionBtn}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Handle payment toggling
async function togglePayment(memberId, month, status, paymentId) {
    if (status === "Paid") {
        const today = new Date().toISOString().split('T')[0];
        const paymentRecord = {
            memberId: memberId,
            month: month,
            status: "Paid",
            paymentDate: today
        };
        await saveRecord("payments", paymentRecord);
        showToast(TRANSLATIONS[currentLang].saveSuccess);
    } else {
        if (paymentId) {
            await deleteRecord("payments", paymentId);
            showToast(TRANSLATIONS[currentLang].deleteSuccess);
        }
    }
    renderMaintenance();
}

// Render Financial Reports
async function renderReports() {
    const expenses = await getAllRecords("expenses");
    const payments = await getAllRecords("payments");
    const members = await getAllRecords("members");

    const fromDateInput = document.getElementById("report-from-date").value;
    const toDateInput = document.getElementById("report-to-date").value;

    const fromDate = fromDateInput ? new Date(fromDateInput) : null;
    const toDate = toDateInput ? new Date(toDateInput) : null;

    if (fromDate || toDate) {
        const fromStr = fromDate ? fromDate.toLocaleDateString('en-IN') : "Beginning";
        const toStr = toDate ? toDate.toLocaleDateString('en-IN') : "Present";
        document.getElementById("report-period-text").textContent = `${TRANSLATIONS[currentLang].statementPeriod}: ${fromStr} to ${toStr}`;
    } else {
        document.getElementById("report-period-text").textContent = `${TRANSLATIONS[currentLang].statementPeriod}: All Time`;
    }

    // Filter income (maintenance collected)
    let totalIncome = 0;
    const incomeDetails = {};
    
    payments.forEach(p => {
        if (p.status === "Paid") {
            const payDate = new Date(p.paymentDate);
            if (fromDate && payDate < fromDate) return;
            if (toDate && payDate > toDate) return;
            
            const m = members.find(mem => mem.id === p.memberId);
            const rate = m ? getMonthlyRate(m.type) : 0;
            totalIncome += rate;

            const categoryName = m ? `${m.type} Maintenance` : "Maintenance Collections";
            incomeDetails[categoryName] = (incomeDetails[categoryName] || 0) + rate;
        }
    });

    const incomeBody = document.getElementById("report-income-body");
    incomeBody.innerHTML = "";
    Object.keys(incomeDetails).forEach(k => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${k}</td><td class="text-right">₹${incomeDetails[k].toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>`;
        incomeBody.appendChild(tr);
    });
    if (Object.keys(incomeDetails).length === 0) {
        incomeBody.innerHTML = `<tr><td colspan="2" class="text-center">${TRANSLATIONS[currentLang].emptyState}</td></tr>`;
    }

    // Filter expenses
    let totalExpenses = 0;
    const expenseDetails = {};
    Object.keys(CATEGORY_MAP).forEach(k => expenseDetails[k] = 0);

    expenses.forEach(e => {
        const expDate = new Date(e.date);
        if (fromDate && expDate < fromDate) return;
        if (toDate && expDate > toDate) return;

        totalExpenses += Number(e.amount);
        const cat = e.category || "Other";
        if (expenseDetails[cat] !== undefined) {
            expenseDetails[cat] += Number(e.amount);
        } else {
            expenseDetails["Other"] += Number(e.amount);
        }
    });

    const expenseBody = document.getElementById("report-expense-body");
    expenseBody.innerHTML = "";
    Object.keys(expenseDetails).forEach(k => {
        const amt = expenseDetails[k];
        if (amt === 0) return;
        
        const label = currentLang === "en" ? CATEGORY_MAP[k].en : CATEGORY_MAP[k].gu;
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${label}</td><td class="text-right">₹${amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>`;
        expenseBody.appendChild(tr);
    });
    if (totalExpenses === 0) {
        expenseBody.innerHTML = `<tr><td colspan="2" class="text-center">${TRANSLATIONS[currentLang].emptyState}</td></tr>`;
    }

    // Render totals
    document.getElementById("report-total-income-val").textContent = `₹${totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    document.getElementById("report-total-expense-val").textContent = `₹${totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    
    const balanceVal = document.getElementById("report-net-balance-val");
    const netBalance = totalIncome - totalExpenses;
    balanceVal.textContent = `₹${netBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    if (netBalance >= 0) {
        balanceVal.className = "font-bold text-success";
    } else {
        balanceVal.className = "font-bold text-danger";
    }
}

// Render Settings Setup
function renderSettings() {
    document.getElementById("rate-3bhk").value = appSettings.rate3BHK;
    document.getElementById("rate-4bhk").value = appSettings.rate4BHK;
}

// ==========================================================================
// MODALS & EVENT HANDLERS
// ==========================================================================
function openModal(id) {
    document.getElementById(id).classList.add("active");
}

function closeModal(id) {
    document.getElementById(id).classList.remove("active");
    // Clear forms inside modal
    const form = document.querySelector(`#${id} form`);
    if (form) form.reset();
    
    // Clear edit hidden IDs
    const editId = document.getElementById("edit-member-id");
    if (editId) editId.value = "";
    const editExpId = document.getElementById("edit-expense-id");
    if (editExpId) editExpId.value = "";
}

// Global functions for editing/deleting
window.editMember = async function(id) {
    const store = getStore("members", "readonly");
    const req = store.get(id);
    req.onsuccess = function() {
        const m = req.result;
        if (m) {
            document.getElementById("edit-member-id").value = m.id;
            document.getElementById("member-flat").value = m.flat;
            document.getElementById("member-wing").value = m.wing;
            document.getElementById("member-name").value = m.owner;
            document.getElementById("member-type").value = m.type;
            
            document.getElementById("member-modal-title").textContent = TRANSLATIONS[currentLang].editMember;
            openModal("modal-add-member");
        }
    };
};

window.deleteMember = async function(id) {
    if (confirm(TRANSLATIONS[currentLang].confirmDelete)) {
        await deleteRecord("members", id);
        // Also delete their payments
        const payments = await getAllRecords("payments");
        const store = getStore("payments", "readwrite");
        payments.forEach(p => {
            if (p.memberId === id) store.delete(p.id);
        });
        showToast(TRANSLATIONS[currentLang].deleteSuccess);
        renderMembers();
        triggerAutoSync();
    }
};

window.editExpense = async function(id) {
    const store = getStore("expenses", "readonly");
    const req = store.get(id);
    req.onsuccess = function() {
        const e = req.result;
        if (e) {
            document.getElementById("edit-expense-id").value = e.id;
            document.getElementById("expense-item").value = e.item;
            document.getElementById("expense-date").value = e.date;
            document.getElementById("expense-amount").value = e.amount;
            document.getElementById("expense-category").value = e.category || "Other";
            
            document.getElementById("expense-modal-title").textContent = TRANSLATIONS[currentLang].editExpense;
            openModal("modal-add-expense");
        }
    };
};

window.deleteExpense = async function(id) {
    if (confirm(TRANSLATIONS[currentLang].confirmDelete)) {
        await deleteRecord("expenses", id);
        showToast(TRANSLATIONS[currentLang].deleteSuccess);
        renderExpenses();
        triggerAutoSync();
    }
};


// ==========================================================================
// INITIAL SETUP & MAIN HANDLER
// ==========================================================================
document.addEventListener("DOMContentLoaded", async () => {
    // 1. Initialize IndexedDB
    try {
        await initDatabase();
        await seedDatabaseIfEmpty();
    } catch (err) {
        console.error("DB init failed:", err);
        showToast("Database initialisation failed!", "error");
        return;
    }

    // 2. Set default active tab
    changeTab("dashboard");
    updateUILanguage();

    // 3. Navigation Sidebar Toggle
    document.querySelectorAll(".sidebar-menu a").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const tabName = link.getAttribute("data-tab");
            
            // Remove active classes
            document.querySelectorAll(".sidebar-menu a").forEach(l => l.classList.remove("active"));
            link.classList.add("active");
            
            changeTab(tabName);
        });
    });

    // 4. Tab loading dispatcher
    async function changeTab(tabName) {
        currentTab = tabName;
        
        // Hide all tab screens
        document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
        // Show current screen
        const targetTab = document.getElementById(`tab-${tabName}`);
        if (targetTab) targetTab.classList.add("active");
        
        updatePageHeaders();

        // Dispatch page renders
        if (tabName === "dashboard") {
            await renderDashboard();
        } else if (tabName === "members") {
            await renderMembers();
        } else if (tabName === "expenses") {
            await renderExpenses();
        } else if (tabName === "maintenance") {
            await renderMaintenance();
        } else if (tabName === "reports") {
            await renderReports();
        } else if (tabName === "settings") {
            renderSettings();
        }
    }

    // 5. Language Toggle Event
    document.getElementById("lang-btn").addEventListener("click", () => {
        currentLang = currentLang === "en" ? "gu" : "en";
        localStorage.setItem("orchid_lang", currentLang);
        updateUILanguage();
        changeTab(currentTab); // refresh current view
    });

    // 6. Member Form Submission
    document.getElementById("member-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const editIdVal = document.getElementById("edit-member-id").value;
        const memberRecord = {
            flat: document.getElementById("member-flat").value.trim(),
            wing: document.getElementById("member-wing").value.trim().toUpperCase(),
            owner: document.getElementById("member-name").value.trim(),
            type: document.getElementById("member-type").value
        };
        if (editIdVal) {
            memberRecord.id = Number(editIdVal);
        }
        await saveRecord("members", memberRecord);
        closeModal("modal-add-member");
        showToast(TRANSLATIONS[currentLang].saveSuccess);
        renderMembers();
    });

    // 7. Manual Expense Form Submission
    document.getElementById("expense-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const editIdVal = document.getElementById("edit-expense-id").value;
        const expenseRecord = {
            item: document.getElementById("expense-item").value.trim(),
            date: document.getElementById("expense-date").value,
            amount: Number(document.getElementById("expense-amount").value),
            category: document.getElementById("expense-category").value
        };
        if (editIdVal) {
            expenseRecord.id = Number(editIdVal);
        }
        await saveRecord("expenses", expenseRecord);
        closeModal("modal-add-expense");
        showToast(TRANSLATIONS[currentLang].saveSuccess);
        
        if (currentTab === "dashboard") renderDashboard();
        else renderExpenses();
    });

    // 8. Settings Form Submission
    document.getElementById("settings-maintenance-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        appSettings.rate3BHK = Number(document.getElementById("rate-3bhk").value);
        appSettings.rate4BHK = Number(document.getElementById("rate-4bhk").value);
        
        await saveRecord("settings", { key: "config", val: appSettings });
        showToast(TRANSLATIONS[currentLang].saveSuccess);
    });

    // 9. Quick Actions Hooks
    document.getElementById("btn-quick-add-expense").onclick = () => {
        document.getElementById("expense-modal-title").textContent = TRANSLATIONS[currentLang].addExpense;
        // set today's date default
        document.getElementById("expense-date").value = new Date().toISOString().split('T')[0];
        openModal("modal-add-expense");
    };
    document.getElementById("btn-add-expense-manual").onclick = () => {
        document.getElementById("expense-modal-title").textContent = TRANSLATIONS[currentLang].addExpense;
        document.getElementById("expense-date").value = new Date().toISOString().split('T')[0];
        openModal("modal-add-expense");
    };
    document.getElementById("btn-add-member").onclick = () => {
        document.getElementById("member-modal-title").textContent = TRANSLATIONS[currentLang].addMember;
        openModal("modal-add-member");
    };

    // 10. Database Control Actions
    document.getElementById("btn-export-backup").onclick = async () => {
        const members = await getAllRecords("members");
        const expenses = await getAllRecords("expenses");
        const payments = await getAllRecords("payments");
        
        const backupData = {
            version: DB_VERSION,
            settings: appSettings,
            members: members,
            expenses: expenses,
            payments: payments
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `orchid_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast("Backup file downloaded successfully!");
    };

    document.getElementById("btn-trigger-restore").onclick = () => {
        document.getElementById("restore-file-input").click();
    };

    document.getElementById("restore-file-input").onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async function(evt) {
            try {
                const data = JSON.parse(evt.target.result);
                if (!data.members || !data.expenses || !data.payments) {
                    throw new Error("Invalid backup format");
                }
                
                // Clear existing databases
                const mStore = getStore("members", "readwrite");
                const eStore = getStore("expenses", "readwrite");
                const pStore = getStore("payments", "readwrite");
                
                mStore.clear();
                eStore.clear();
                pStore.clear();

                // Load new data
                data.members.forEach(m => mStore.put(m));
                data.expenses.forEach(ex => eStore.put(ex));
                data.payments.forEach(p => pStore.put(p));

                if (data.settings) {
                    appSettings = data.settings;
                    await saveRecord("settings", { key: "config", val: appSettings });
                }

                showToast("Database successfully restored!");
                location.reload();
            } catch (err) {
                console.error(err);
                showToast("Restore failed: Invalid JSON backup file.", "error");
            }
        };
        reader.readAsText(file);
    };

    document.getElementById("btn-reset-db").onclick = async () => {
        if (confirm("WARNING: This will wipe out all changes and custom invoices in this application. Are you sure?")) {
            const mStore = getStore("members", "readwrite");
            const eStore = getStore("expenses", "readwrite");
            const pStore = getStore("payments", "readwrite");
            
            mStore.clear();
            eStore.clear();
            pStore.clear();
            
            localStorage.clear();
            showToast("Database reset successfully!");
            location.reload();
        }
    };

    // 11. Search & Filter Input Listeners
    document.getElementById("member-search").oninput = renderMembers;
    document.getElementById("member-filter-type").onchange = renderMembers;
    document.getElementById("expense-search").oninput = renderExpenses;
    document.getElementById("expense-filter-category").onchange = renderExpenses;
    
    document.getElementById("btn-dashboard-view-all").onclick = () => {
        // Switch to expenses tab
        document.querySelector('[data-tab="expenses"]').click();
    };

    document.getElementById("btn-generate-report").onclick = renderReports;

    // ==========================================================================
    // EXCEL DRAG & DROP & PARSING TRIGGER
    // ==========================================================================
    const dragDropArea = document.getElementById("drag-drop-area");
    const fileInput = document.getElementById("excel-file-input");
    const btnConfirmImport = document.getElementById("btn-confirm-import");
    let excelFileToImport = null;

    document.getElementById("btn-quick-import-excel").onclick = () => openModal("modal-import-excel");
    document.getElementById("btn-import-excel-exp").onclick = () => openModal("modal-import-excel");
    document.getElementById("file-picker-link").onclick = () => fileInput.click();

    dragDropArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        dragDropArea.classList.add("dragover");
    });

    dragDropArea.addEventListener("dragleave", () => {
        dragDropArea.classList.remove("dragover");
    });

    dragDropArea.addEventListener("drop", (e) => {
        e.preventDefault();
        dragDropArea.classList.remove("dragover");
        if (e.dataTransfer.files.length > 0) {
            handleSelectedExcelFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleSelectedExcelFile(e.target.files[0]);
        }
    });

    function handleSelectedExcelFile(file) {
        excelFileToImport = file;
        document.getElementById("import-file-name").textContent = file.name;
        
        // Show details panel
        const details = document.getElementById("import-details");
        details.classList.remove("hidden");
        
        // Pre-parse row count (just basic check)
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const wb = XLSX.read(data, {type: 'array'});
                const sheet = wb.Sheets[wb.SheetNames[0]];
                const ref = sheet['!ref'];
                let rowCount = 0;
                if (ref) {
                    const range = XLSX.utils.decode_range(ref);
                    rowCount = range.e.r; // End row index (excluding header, approx)
                }
                document.getElementById("import-row-count").textContent = `${rowCount} rows parsed`;
                document.getElementById("import-row-count").className = "badge badge-success";
                document.getElementById("import-status-text").textContent = "File parsed successfully. Ready to import.";
                btnConfirmImport.removeAttribute("disabled");
            } catch (err) {
                document.getElementById("import-row-count").textContent = "Error";
                document.getElementById("import-row-count").className = "badge badge-danger";
                document.getElementById("import-status-text").textContent = "Invalid Excel file format.";
                btnConfirmImport.setAttribute("disabled", "true");
            }
        };
        reader.readAsArrayBuffer(file);
    }

    btnConfirmImport.addEventListener("click", async () => {
        if (!excelFileToImport) return;
        
        btnConfirmImport.setAttribute("disabled", "true");
        document.getElementById("import-status-text").textContent = "Importing rows into local database...";
        document.getElementById("import-progress-fill").style.width = "40%";
        
        try {
            const count = await importExpensesFromExcel(excelFileToImport);
            document.getElementById("import-progress-fill").style.width = "100%";
            document.getElementById("import-status-text").textContent = `Successfully imported ${count} expense items!`;
            
            showToast(`${TRANSLATIONS[currentLang].successImport} (${count} records)`);
            setTimeout(() => {
                closeModal("modal-import-excel");
                // Clear import UI
                document.getElementById("import-details").classList.add("hidden");
                document.getElementById("import-progress-fill").style.width = "0%";
                btnConfirmImport.setAttribute("disabled", "true");
                excelFileToImport = null;
                
                // Refresh dashboard/expenses tab
                changeTab(currentTab);
            }, 1500);
        } catch (err) {
            console.error(err);
            document.getElementById("import-progress-fill").style.width = "0%";
            document.getElementById("import-status-text").textContent = "Import failed.";
            showToast(TRANSLATIONS[currentLang].errorImport, "error");
            btnConfirmImport.removeAttribute("disabled");
        }
    });

    // ==========================================================================
    // FIREBASE CLOUD EVENT LISTENERS
    // ==========================================================================
    
    // Initialize Firebase Setup
    initFirebaseApp();

    // Firebase Settings config save
    const fbForm = document.getElementById("settings-firebase-form");
    if (fbForm) {
        fbForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const config = {
                apiKey: document.getElementById("fb-api-key").value.trim(),
                authDomain: document.getElementById("fb-auth-domain").value.trim(),
                projectId: document.getElementById("fb-project-id").value.trim(),
                appId: document.getElementById("fb-app-id").value.trim()
            };
            
            if (config.apiKey && config.projectId) {
                localStorage.setItem("orchid_fb_config", JSON.stringify(config));
                showToast("Firebase Config saved. Connecting...", "success");
                setTimeout(() => {
                    location.reload();
                }, 1000);
            } else {
                showToast("Please enter at least API Key and Project ID", "error");
            }
        });
    }

    // Sign Out button
    const logoutFbBtn = document.getElementById("btn-logout-fb");
    if (logoutFbBtn) {
        logoutFbBtn.onclick = () => {
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                firebase.auth().signOut().then(() => {
                    localStorage.removeItem("orchid_fb_config");
                    sessionStorage.removeItem("fb_auth_bypassed");
                    showToast("Signed out and cloud settings cleared.");
                    setTimeout(() => {
                        location.reload();
                    }, 1000);
                }).catch(err => {
                    console.error("Sign out failed", err);
                    // Force clear config
                    localStorage.removeItem("orchid_fb_config");
                    sessionStorage.removeItem("fb_auth_bypassed");
                    location.reload();
                });
            } else {
                localStorage.removeItem("orchid_fb_config");
                sessionStorage.removeItem("fb_auth_bypassed");
                location.reload();
            }
        };
    }

    // Manual Cloud Sync button (in header)
    const cloudSyncBtn = document.getElementById("btn-cloud-sync");
    if (cloudSyncBtn) {
        cloudSyncBtn.onclick = () => {
            syncWithFirebase();
        };
    }

    // Auth Overlay Form handling
    const authForm = document.getElementById("auth-form");
    let authMode = "signin"; // default
    
    const toggleAuthModeBtn = document.getElementById("btn-toggle-auth-mode");
    if (toggleAuthModeBtn) {
        toggleAuthModeBtn.onclick = () => {
            const title = document.getElementById("auth-modal-title");
            const submitBtn = document.getElementById("btn-auth-submit");
            const helpText = document.getElementById("auth-help-text");
            
            if (authMode === "signin") {
                authMode = "signup";
                title.textContent = "Register Cloud Account";
                submitBtn.textContent = "Sign Up";
                toggleAuthModeBtn.textContent = "Already have an account? Sign In";
                helpText.textContent = "Create a cloud account to securely back up and sync your housing society data.";
            } else {
                authMode = "signin";
                title.textContent = "Sign In to Cloud";
                submitBtn.textContent = "Sign In";
                toggleAuthModeBtn.textContent = "Need a new account? Register here";
                helpText.textContent = "Your society accounts are protected. Sign in to synchronize your local database with Firebase.";
            }
        };
    }

    if (authForm) {
        authForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const email = document.getElementById("auth-email").value.trim();
            const password = document.getElementById("auth-password").value;
            
            const submitBtn = document.getElementById("btn-auth-submit");
            submitBtn.setAttribute("disabled", "true");
            submitBtn.textContent = authMode === "signin" ? "Signing In..." : "Signing Up...";
            
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                if (authMode === "signin") {
                    firebase.auth().signInWithEmailAndPassword(email, password)
                        .catch(err => {
                            console.error(err);
                            showToast("Auth failed: " + err.message, "error");
                            submitBtn.removeAttribute("disabled");
                            submitBtn.textContent = "Sign In";
                        });
                } else {
                    firebase.auth().createUserWithEmailAndPassword(email, password)
                        .then(() => {
                            showToast("Cloud registration successful!", "success");
                        })
                        .catch(err => {
                            console.error(err);
                            showToast("Registration failed: " + err.message, "error");
                            submitBtn.removeAttribute("disabled");
                            submitBtn.textContent = "Sign Up";
                        });
                }
            } else {
                showToast("Firebase not initialized", "error");
                submitBtn.removeAttribute("disabled");
                submitBtn.textContent = authMode === "signin" ? "Sign In" : "Sign Up";
            }
        });
    }

    // Bypass Auth Overlay button
    const bypassAuthBtn = document.getElementById("btn-bypass-auth-dialog");
    if (bypassAuthBtn) {
        bypassAuthBtn.onclick = () => {
            firebaseBypassed = true;
            sessionStorage.setItem("fb_auth_bypassed", "true");
            document.getElementById("modal-auth-overlay").classList.remove("active");
            showToast("Bypassed Cloud mode. Running local-only.", "warning");
        };
    }
});
