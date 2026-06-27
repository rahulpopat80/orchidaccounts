// js/app.js

// Load Gujarati font (Noto Sans Gujarati) from CDN with fallbacks and localStorage cache
async function loadGujaratiFont() {
    if (window.gujaratiFontBase64) return window.gujaratiFontBase64;
    
    const cached = localStorage.getItem("orchid_gujarati_font_base64");
    if (cached && cached.length > 1000) {
        window.gujaratiFontBase64 = cached;
        return cached;
    }

    const FONT_URLS = [
        "https://fonts.gstatic.com/s/notosansgujarati/v27/wlpWgx_HC1ti5ViekvcxnhMlCVo3f5pv17ivlzsUB14gg1TMR2Gw4VceEl7MA_ypFwPM.ttf",
        "https://fonts.gstatic.com/s/notosansgujarati/v24/wlpWgx_HC1ti5ViekvcxnhMlCVo3f5pv17ivlzsUB14gg1TMR2Gw4VceEl7MA_ypFwPM.ttf",
        "https://raw.githubusercontent.com/notofonts/gujarati/main/fonts/NotoSansGujarati/hinted/ttf/NotoSansGujarati-Regular.ttf",
        "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts/hinted/ttf/NotoSansGujarati/NotoSansGujarati-Regular.ttf"
    ];

    for (const url of FONT_URLS) {
        try {
            const response = await fetch(url);
            if (!response.ok) continue;
            const blob = await response.blob();
            
            const base64data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(reader.result.split(',')[1]);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
            
            try {
                localStorage.setItem("orchid_gujarati_font_base64", base64data);
            } catch(e) {
                console.warn("Storage full, could not cache font base64", e);
            }
            window.gujaratiFontBase64 = base64data;
            return base64data;
        } catch (e) {
            console.warn(`Failed to load font from ${url}`, e);
        }
    }
    return null;
}

// Map payment mode values to full display names
function getDisplayPaymentMode(mode) {
    if (mode === "Bank: CBI") {
        return "Central Bank of India";
    } else if (mode === "Bank: JCOM") {
        return "The Junagadh Commercial Co-Operative Bank Ltd.";
    } else if (mode === "Cash") {
        return state.lang === "gu" ? "રોકડ (Cash)" : "Cash On Hand";
    }
    return mode;
}

// Format date to dd-mm-yyyy for Excel
function formatDateDMY(dateStr) {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
}

// Robust Excel date parser
function parseExcelDate(val) {
    if (val === undefined || val === null || val === "") {
        return new Date("2026-06-24").toISOString().split('T')[0];
    }
    
    // If it's a number (Excel date serial)
    if (typeof val === 'number' || (!isNaN(val) && !isNaN(parseFloat(val)) && String(val).indexOf('-') === -1 && String(val).indexOf('/') === -1)) {
        const serial = parseFloat(val);
        const utc_days = Math.floor(serial - 25569);
        const date = new Date(utc_days * 86400 * 1000);
        const tzOffset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() + tzOffset);
        return localDate.toISOString().split('T')[0];
    }
    
    const str = String(val).trim();
    
    // Match DD-MM-YYYY or DD/MM/YYYY
    const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (dmyMatch) {
        const day = dmyMatch[1].padStart(2, '0');
        const month = dmyMatch[2].padStart(2, '0');
        const year = dmyMatch[3];
        return `${year}-${month}-${day}`;
    }
    
    // Match DD-MM-YY or DD/MM/YY
    const dmy2Match = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2})$/);
    if (dmy2Match) {
        const day = dmy2Match[1].padStart(2, '0');
        const month = dmy2Match[2].padStart(2, '0');
        const year = "20" + dmy2Match[3];
        return `${year}-${month}-${day}`;
    }

    // Match YYYY-MM-DD
    const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (ymdMatch) {
        const year = ymdMatch[1];
        const month = ymdMatch[2].padStart(2, '0');
        const day = ymdMatch[3].padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // Try browser parse
    const parsed = Date.parse(str);
    if (!isNaN(parsed)) {
        return new Date(parsed).toISOString().split('T')[0];
    }
    
    return new Date("2026-06-24").toISOString().split('T')[0];
}

// Bilingual Translations Dictionary
const TRANSLATIONS = {
    gu: {
        app_title: "ઓર્કિડ હાઇટ્સ",
        app_tagline: "એકાઉન્ટિંગ સોફ્ટવેર",
        nav_dashboard: "ડેશબોર્ડ",
        nav_entry: "નવી એન્ટ્રી",
        nav_reports: "માસિક અહેવાલ",
        nav_balance: "સરવૈયું (Balance)",
        nav_heads: "ખાતાના હેડ",
        nav_backup: "બેકઅપ / રીસ્ટોર",
        theme_light: "પ્રકાશ",
        theme_dark: "અંધકાર",
        lang_label: "English ભાષા",
        
        dashboard_title: "સોસાયટી હિસાબ ડેશબોર્ડ",
        total_income: "કુલ આવક",
        total_expense: "કુલ ખર્ચ",
        net_savings: "ચોખ્ખી બચત",
        fd_investments: "ફિક્સ ડિપોઝિટ",
        chart_title: "છેલ્લા ૬ મહિનાની આવક અને ખર્ચની સરખામણી",
        recent_transactions: "તાજેતરના વ્યવહારો",
        quick_actions: "ઝડપી એક્શન",
        action_add_income: "આવક એન્ટ્રી",
        action_add_expense: "ખર્ચ એન્ટ્રી",
        action_scan_bill: "બિલ સ્કેન કરો",
        
        entry_title: "નવી એન્ટ્રી ઉમેરો / સુધારો",
        entry_type: "વ્યવહાર પ્રકાર",
        type_income: "આવક (Income)",
        type_expense: "ખર્ચ (Expense)",
        select_head: "ખાતાનો હેડ પસંદ કરો",
        amount_label: "રકમ (₹)",
        date_label: "તારીખ",
        payment_mode: "ચુકવણી પદ્ધતિ",
        mode_bank: "બેંક ટ્રાન્સફર / ચેક",
        mode_cash: "Cash On Hand (રોકડ સિલક)",
        mode_fd: "FD રોકાણ",
        reference_label: "ચેક / ટ્રાન્ઝેક્શન નં. (જો હોય તો)",
        description_label: "વિગત / નોંધ",
        bill_upload_label: "બિલ / રસીદ અપલોડ કરો (ઇમેજ)",
        bill_scan_helper: "બિલ ખેંચો અથવા અહીં ક્લિક કરો",
        btn_save: "એન્ટ્રી સેવ કરો",
        btn_update: "સુધારો અને સાચવો",
        btn_cancel: "રદ કરો",
        btn_delete: "એન્ટ્રી ડીલીટ કરો",
        
        reports_title: "માસિક રીપોર્ટ અને હિસાબ",
        filter_month: "માસ પસંદ કરો",
        filter_year: "વર્ષ પસંદ કરો",
        btn_copy_whatsapp: "વોટ્સએપ લખાણ કોપી",
        btn_download_whatsapp: "વોટ્સએપ ઈમેજ ડાઉનલોડ",
        col_date: "તારીખ",
        col_type: "પ્રકાર",
        col_head: "ખાતાનો હેડ",
        col_amount: "રકમ",
        col_mode: "પદ્ધતિ",
        col_desc: "વિગત",
        col_bill: "બિલ",
        no_transactions: "આ માસમાં કોઈ વ્યવહાર નોંધાયેલ નથી.",
        view_bill: "બિલ જુઓ",
        edit_entry: "એન્ટ્રી એડિટ કરો",
        
        balance_title: "વાર્ષિક સરવૈયું (Balance Sheet)",
        select_fy: "નાણાકીય વર્ષ",
        print_sheet: "રીપોર્ટ પ્રિન્ટ કરો",
        print_report: "અહેવાલ પ્રિન્ટ કરો",
        liabilities: "જવાબદારી અને ભંડોળ (Liabilities)",
        assets: "મિલકતો અને લેણાં (Assets)",
        corpus_fund: "કોર્પસ ફંડ / સભ્યોની ડિપોઝિટ",
        reserves: "અનામત અને અન્ય ભંડોળ",
        surplus_bal: "નફો-નુકસાન ખાતું (વધારો)",
        cash_bal: "રોકડ સિલક (Cash in Hand)",
        bank_bal: "બેંક સિલક (Bank Balance)",
        fd_bal: "ફિક્સ ડિપોઝિટ રોકાણ (FD)",
        total: "કુલ (Total)",
        opening_title: "શરૂઆતની સિલક સેટઅપ (૦૧-એપ્રિલ)",
        
        heads_title: "આવક અને ખર્ચના હેડ મેનેજમેન્ટ",
        add_head: "નવો હેડ ઉમેરો",
        head_name_gu: "ગુજરાતી નામ",
        head_name_en: "અંગ્રેજી નામ",
        head_color: "કલર કોડ",
        income_heads_list: "આવક હેડ્સ લિસ્ટ",
        expense_heads_list: "ખર્ચ હેડ્સ લિસ્ટ",
        btn_add_head: "હેડ ઉમેરો",
        
        backup_title: "ડેટા બેકઅપ અને રીસ્ટોર",
        backup_desc: "તમારો તમામ એકાઉન્ટિંગ ડેટા સુરક્ષિત રાખવા માટે બેકઅપ ફાઈલ ડાઉનલોડ કરો. જો ભવિષ્યમાં ડેટા ખોવાઈ જાય તો આ ફાઈલ દ્વારા પાછો લાવી શકાશે.",
        btn_export: "બેકઅપ ફાઈલ ડાઉનલોડ કરો (Export)",
        import_title: "બેકઅપ ફાઈલ અપલોડ કરો (Import)",
        import_desc: "સાચવેલી .json બેકઅપ ફાઈલ પસંદ કરો. નોંધ: આનાથી તમારો હાલનો ડેટા ઓવરરાઈટ થઈ જશે.",
        btn_import: "ડેટા રીસ્ટોર કરો",
        
        toast_saved: "એન્ટ્રી સફળતાપૂર્વક સાચવવામાં આવી!",
        toast_updated: "એન્ટ્રી સફળતાપૂર્વક સુધારવામાં આવી!",
        toast_deleted: "એન્ટ્રી ડીલીટ કરવામાં આવી!",
        toast_whatsapp_copied: "વોટ્સએપ મેસેજ ક્લિપબોર્ડમાં કોપી થઈ ગયો છે!",
        toast_backup_exported: "બેકઅપ ફાઈલ ડાઉનલોડ થઈ ગઈ છે!",
        toast_backup_imported: "ડેટા સફળતાપૂર્વક રીસ્ટોર કરવામાં આવ્યો છે!",
        toast_backup_failed: "બેકઅપ રીસ્ટોર કરવામાં નિષ્ફળ! કૃપા કરીને સાચી ફાઇલ પસંદ કરો.",
        toast_head_added: "નવો હેડ સફળતાપૂર્વક ઉમેરવામાં આવ્યો!",
        toast_head_deleted: "હેડ ડીલીટ કરવામાં આવ્યો!",
        toast_scan_success: "બિલ સ્કેન પૂર્ણ! રકમ અને વિગતો ઓટો-ફિલ કરવામાં આવી છે.",
        toast_fields_required: "કૃપા કરીને રકમ, તારીખ અને હેડ પસંદ કરો!",
        report_society_title: "ઓર્કિડ હાઇટ્સ રેસીડેન્સી",
        balance_society_title: "ઓર્કિડ હાઇટ્સ રેસીડેન્સી",
        balance_society_subtitle: "વાર્ષિક સરવૈયું અને નાણાકીય પત્રકો"
    },
    en: {
        app_title: "Orchid Heights",
        app_tagline: "Accounting Software",
        nav_dashboard: "Dashboard",
        nav_entry: "New Entry",
        nav_reports: "Monthly Report",
        nav_balance: "Balance Sheet",
        nav_heads: "Account Heads",
        nav_backup: "Backup & Restore",
        theme_light: "Light",
        theme_dark: "Dark",
        lang_label: "English Language",
        
        dashboard_title: "Society Accounting Dashboard",
        total_income: "Total Income",
        total_expense: "Total Expense",
        net_savings: "Net Savings",
        fd_investments: "Fixed Deposits",
        chart_title: "Last 6 Months Income vs Expense",
        recent_transactions: "Recent Transactions",
        quick_actions: "Quick Actions",
        action_add_income: "Add Income",
        action_add_expense: "Add Expense",
        action_scan_bill: "Scan Bill",
        
        entry_title: "Add / Edit Transaction Entry",
        entry_type: "Transaction Type",
        type_income: "Income",
        type_expense: "Expense",
        select_head: "Select Account Head",
        amount_label: "Amount (₹)",
        date_label: "Date",
        payment_mode: "Payment Mode",
        mode_bank: "Bank Transfer / Cheque",
        mode_cash: "Cash On Hand",
        mode_fd: "FD Investment",
        reference_label: "Cheque / Transaction No. (Optional)",
        description_label: "Description / Notes",
        bill_upload_label: "Upload Bill / Receipt (Image)",
        bill_scan_helper: "Drag bill here or click to upload",
        btn_save: "Save Entry",
        btn_update: "Update & Save",
        btn_cancel: "Cancel",
        btn_delete: "Delete Entry",
        
        reports_title: "Monthly Reports & Statements",
        filter_month: "Select Month",
        filter_year: "Select Year",
        btn_copy_whatsapp: "Copy WhatsApp Text",
        btn_download_whatsapp: "Download WhatsApp Image",
        col_date: "Date",
        col_type: "Type",
        col_head: "Account Head",
        col_amount: "Amount",
        col_mode: "Mode",
        col_desc: "Description",
        col_bill: "Bill",
        no_transactions: "No transactions recorded in this month.",
        view_bill: "View Bill",
        edit_entry: "Edit Entry",
        
        balance_title: "Year-End Balance Sheet",
        select_fy: "Financial Year",
        print_sheet: "Print Statement",
        print_report: "Print Report",
        liabilities: "Liabilities & Funds",
        assets: "Assets & Receivables",
        corpus_fund: "Corpus Fund / Member Deposits",
        reserves: "Reserve & Other Funds",
        surplus_bal: "Income & Expenditure A/c (Surplus)",
        cash_bal: "Cash in Hand",
        bank_bal: "Bank Balance",
        fd_bal: "Fixed Deposits (FD)",
        total: "Total",
        opening_title: "Opening Balance Setup (01-April)",
        
        heads_title: "Income & Expense Heads Management",
        add_head: "Add New Head",
        head_name_gu: "Gujarati Name",
        head_name_en: "English Name",
        head_color: "Color Code",
        income_heads_list: "Income Heads List",
        expense_heads_list: "Expense Heads List",
        btn_add_head: "Add Head",
        
        backup_title: "Data Backup & Restore",
        backup_desc: "Download a backup file to keep your accounting data safe. If data is lost in the future, it can be restored from this file.",
        btn_export: "Download Backup File (Export)",
        import_title: "Upload Backup File (Import)",
        import_desc: "Select a saved .json backup file. Note: This will overwrite your current data.",
        btn_import: "Restore Data",
        
        toast_saved: "Entry saved successfully!",
        toast_updated: "Entry updated successfully!",
        toast_deleted: "Entry deleted successfully!",
        toast_whatsapp_copied: "WhatsApp message copied to clipboard!",
        toast_backup_exported: "Backup file downloaded successfully!",
        toast_backup_imported: "Data restored successfully!",
        toast_backup_failed: "Failed to restore backup! Please select a valid file.",
        toast_head_added: "New category head added successfully!",
        toast_head_deleted: "Category head deleted successfully!",
        toast_scan_success: "Bill scan complete! Amount and details auto-filled.",
        toast_fields_required: "Please fill in Amount, Date, and Select Head!",
        view_bill: "View Bill",
        edit_entry: "Edit Entry",
        report_society_title: "Orchid Heights Residency",
        balance_society_title: "Orchid Heights Residency",
        balance_society_subtitle: "Year-End Balance Sheet & Financial Statements"
    }
};

// Global App State
const state = {
    lang: "en",
    theme: localStorage.getItem("orchid_theme") || "light",
    activeTab: "dashboard",
    editingTxId: null,
    selectedMonth: new Date("2026-06-24").getMonth() + 1, // 1-12
    selectedYear: new Date("2026-06-24").getFullYear(),
    filterFromDate: "2026-06-01",
    filterToDate: "2026-06-30",
    filterHeadId: "",
    balanceFromDate: "2026-04-01",
    balanceToDate: "2027-03-31",
    attachedBillUrl: null
};

// Toast notification helper
function showToast(messageKey, isError = false) {
    const text = TRANSLATIONS[state.lang][messageKey] || messageKey;
    const toast = document.getElementById("toast");
    const toastText = document.getElementById("toast-text");
    const toastIcon = document.getElementById("toast-icon");
    
    toastText.innerText = text;
    
    if (isError) {
        toastIcon.className = "toast-icon error fas fa-times-circle";
    } else {
        toastIcon.className = "toast-icon success fas fa-check-circle";
    }
    
    toast.classList.add("active");
    
    setTimeout(() => {
        toast.classList.remove("active");
    }, 3000);
}

// Translate Page Elements
function applyTranslations() {
    const t = TRANSLATIONS[state.lang];
    
    document.querySelectorAll("[data-translate]").forEach(elem => {
        const key = elem.getAttribute("data-translate");
        if (t[key]) {
            if (elem.tagName === "INPUT" && (elem.type === "submit" || elem.type === "button")) {
                elem.value = t[key];
            } else {
                elem.innerText = t[key];
            }
        }
    });

    document.querySelectorAll("[data-translate-placeholder]").forEach(elem => {
        const key = elem.getAttribute("data-translate-placeholder");
        if (t[key]) {
            elem.setAttribute("placeholder", t[key]);
        }
    });
    
    const langLabel = document.getElementById("lang-label");
    if (langLabel) {
        langLabel.innerText = t.lang_label;
    }

    renderHeadsDropdowns();
}

// Render Category Dropdowns in Forms
function renderHeadsDropdowns() {
    const headSelect = document.getElementById("tx-head");
    const txType = document.getElementById("tx-type").value;
    
    const heads = txType === "income" ? db.getIncomeHeads() : db.getExpenseHeads();
    
    headSelect.innerHTML = `<option value="" disabled selected data-translate="select_head">${TRANSLATIONS[state.lang].select_head}</option>`;
    
    heads.forEach(head => {
        const opt = document.createElement("option");
        opt.value = head.id;
        opt.innerText = head.name_en;
        headSelect.appendChild(opt);
    });
}

// Navigation Controllers
function switchTab(tabId) {
    state.activeTab = tabId;
    
    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
        if (item.getAttribute("data-tab") === tabId) {
            item.classList.add("active");
        }
    });
    
    document.querySelectorAll(".mobile-nav-item").forEach(item => {
        item.classList.remove("active");
        if (item.getAttribute("data-tab") === tabId) {
            item.classList.add("active");
        }
    });
    
    document.querySelectorAll(".page-section").forEach(sec => {
        sec.classList.remove("active");
    });
    
    const activeSec = document.getElementById(`section-${tabId}`);
    if (activeSec) {
        activeSec.classList.add("active");
    }

    if (tabId === "dashboard") {
        loadDashboard();
    } else if (tabId === "reports") {
        loadReports();
    } else if (tabId === "balance") {
        loadBalanceSheet();
    } else if (tabId === "heads") {
        loadHeadsManagement();
    }
}

// --- Dashboard Code ---
function loadDashboard() {
    const now = new Date("2026-06-24");
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    const summary = db.getMonthSummary(currentYear, currentMonth);
    const openingBalances = db.getOpeningBalances();
    const totalFd = openingBalances.fd;

    document.getElementById("stat-income").innerText = `₹ ${summary.totalIncome.toLocaleString('en-IN')}`;
    document.getElementById("stat-expense").innerText = `₹ ${summary.totalExpense.toLocaleString('en-IN')}`;
    
    const savings = summary.totalIncome - summary.totalExpense;
    const savingsElem = document.getElementById("stat-savings");
    savingsElem.innerText = `₹ ${savings.toLocaleString('en-IN')}`;
    savingsElem.style.color = savings >= 0 ? "var(--success)" : "var(--danger)";

    document.getElementById("stat-fd").innerText = `₹ ${totalFd.toLocaleString('en-IN')}`;
    
    const monthNameEn = ENGLISH_MONTHS[currentMonth];
    document.getElementById("dashboard-month-desc").innerText = `Transactions for ${monthNameEn} 2026`;

    const recentList = document.getElementById("recent-transactions-list");
    recentList.innerHTML = "";
    
    const dashboardSearchInput = document.getElementById("dashboard-search-input");
    const searchText = dashboardSearchInput ? dashboardSearchInput.value.toLowerCase().trim() : "";
    let txs = db.getTransactions();
    const incomeHeads = db.getIncomeHeads();
    const expenseHeads = db.getExpenseHeads();
    
    if (searchText !== "") {
        txs = txs.filter(tx => {
            const head = tx.type === "income" ? incomeHeads.find(h => h.id === tx.headId) : expenseHeads.find(h => h.id === tx.headId);
            const headName = head ? (head.name_en.toLowerCase() + " " + head.name_gu.toLowerCase()) : "";
            const mode = getDisplayPaymentMode(tx.paymentMode).toLowerCase();
            const desc = (tx.description || "").toLowerCase();
            const amt = String(tx.amount);
            const date = tx.date;
            
            return headName.includes(searchText) || 
                   mode.includes(searchText) || 
                   desc.includes(searchText) || 
                   amt.includes(searchText) || 
                   date.includes(searchText);
        });
    }
    txs = txs.slice(0, 5);
    
    txs.forEach(tx => {
        const row = document.createElement("tr");
        const head = tx.type === "income" 
            ? incomeHeads.find(h => h.id === tx.headId) 
            : expenseHeads.find(h => h.id === tx.headId);
        
        const headName = head ? head.name_en : tx.headId;
        const formattedDate = formatDate(tx.date);
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td><span class="badge ${tx.type === "income" ? "badge-income" : "badge-expense"}">${tx.type === "income" ? "Income" : "Expense"}</span></td>
            <td>${headName}</td>
            <td style="font-weight: 700; color: ${tx.type === "income" ? "var(--success)" : "var(--danger)"}">₹ ${parseFloat(tx.amount).toLocaleString('en-IN')}</td>
            <td>${getDisplayPaymentMode(tx.paymentMode)}</td>
            <td>${tx.description || "-"}</td>
        `;
        
        row.addEventListener("click", () => openEditModal(tx));
        recentList.appendChild(row);
    });

    drawDashboardChart();
}

// Draw a beautiful SVG Bar Chart for the last 6 months
function drawDashboardChart() {
    const container = document.getElementById("chart-container");
    container.innerHTML = "";
    
    const now = new Date("2026-06-24");
    const monthsToDraw = [];
    
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthsToDraw.push({
            year: d.getFullYear(),
            month: d.getMonth() + 1
        });
    }

    const summaries = monthsToDraw.map(m => {
        const sum = db.getMonthSummary(m.year, m.month);
        return {
            label: state.lang === "gu" ? GUJARATI_MONTHS[m.month] : ENGLISH_MONTHS[m.month].substring(0, 3),
            income: sum.totalIncome,
            expense: sum.totalExpense
        };
    });

    let maxVal = 20000;
    summaries.forEach(s => {
        if (s.income > maxVal) maxVal = s.income;
        if (s.expense > maxVal) maxVal = s.expense;
    });
    maxVal = Math.ceil(maxVal / 10000) * 10000;

    const width = container.clientWidth || 500;
    const height = 300;
    const paddingLeft = 60;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 40;
    
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    
    let svgHtml = `<svg width="${width}" height="${height}" style="overflow: visible;">`;
    
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
        const val = (maxVal / gridLines) * i;
        const y = height - paddingBottom - (chartHeight / gridLines) * i;
        
        svgHtml += `
            <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="var(--border-color)" stroke-dasharray="4,4" stroke-width="1" />
            <text x="${paddingLeft - 10}" y="${y + 4}" fill="var(--text-muted)" font-size="11" text-anchor="end">₹ ${val.toLocaleString('en-IN')}</text>
        `;
    }

    const barGroups = summaries.length;
    const groupWidth = chartWidth / barGroups;
    const barWidth = 14;
    
    summaries.forEach((s, idx) => {
        const groupX = paddingLeft + (groupWidth * idx);
        const centerX = groupX + (groupWidth / 2);
        
        const incHeight = (s.income / maxVal) * chartHeight;
        const expHeight = (s.expense / maxVal) * chartHeight;
        
        const incY = height - paddingBottom - incHeight;
        const expY = height - paddingBottom - expHeight;
        
        svgHtml += `
            <rect class="chart-bar" x="${centerX - barWidth - 2}" y="${incY}" width="${barWidth}" height="${incHeight}" rx="4" fill="var(--success)" opacity="0.85">
                <title>${s.label}: Income ₹${s.income.toLocaleString()}</title>
            </rect>
            <rect class="chart-bar" x="${centerX + 2}" y="${expY}" width="${barWidth}" height="${expHeight}" rx="4" fill="var(--primary)" opacity="0.85">
                <title>${s.label}: Expense ₹${s.expense.toLocaleString()}</title>
            </rect>
            <text x="${centerX}" y="${height - paddingBottom + 20}" fill="var(--text-muted)" font-size="12" text-anchor="middle" font-weight="600">${s.label}</text>
        `;
    });

    const legendY = height - 5;
    svgHtml += `
        <g transform="translate(${width/2 - 100}, ${legendY})">
            <rect x="0" y="-10" width="12" height="12" rx="2" fill="var(--success)" />
            <text x="18" y="0" fill="var(--text-main)" font-size="12" font-weight="600">${state.lang === 'gu' ? 'આવક (Income)' : 'Income'}</text>
            
            <rect x="120" y="-10" width="12" height="12" rx="2" fill="var(--primary)" />
            <text x="138" y="0" fill="var(--text-main)" font-size="12" font-weight="600">${state.lang === 'gu' ? 'ખર્ચ (Expense)' : 'Expense'}</text>
        </g>
    `;

    svgHtml += `</svg>`;
    container.innerHTML = svgHtml;
}

// --- Transaction Entry & Scanner Code ---
function handleBillUpload(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        state.attachedBillUrl = e.target.result;
        document.getElementById("preview-img").src = e.target.result;
        document.getElementById("preview-container").style.display = "block";
        
        const scanOverlay = document.getElementById("scanner-overlay");
        const scanStatus = document.getElementById("scanner-text");
        const scanProgressFill = document.getElementById("scanner-progress-bar");
        
        if (scanOverlay) {
            scanOverlay.style.display = "flex";
        }
        
        scanner.scanBill(file, 
            (progressTextGu, progressTextEn, percent) => {
                if (scanStatus) {
                    scanStatus.innerText = state.lang === "gu" ? progressTextGu : progressTextEn;
                }
                if (scanProgressFill) {
                    scanProgressFill.style.width = percent + "%";
                }
            }, 
            (result) => {
                if (scanOverlay) {
                    scanOverlay.style.display = "none";
                }
                
                if (result.amount) {
                    document.getElementById("tx-amount").value = result.amount;
                }
                if (result.date) {
                    document.getElementById("tx-date").value = result.date;
                }
                if (result.headId) {
                    document.getElementById("tx-head").value = result.headId;
                }
                if (result.description) {
                    document.getElementById("tx-desc").value = result.description;
                }
                if (result.type) {
                    document.getElementById("tx-type").value = result.type;
                    renderHeadsDropdowns();
                }
                showToast("toast_scan_success");
            }
        );
    };
    reader.readAsDataURL(file);
}

function handleTransactionSubmit(e) {
    e.preventDefault();
    const type = document.getElementById("tx-type").value;
    const headId = document.getElementById("tx-head").value;
    const amount = parseFloat(document.getElementById("tx-amount").value);
    const date = document.getElementById("tx-date").value;
    const paymentMode = document.getElementById("tx-payment-mode").value;
    const reference = document.getElementById("tx-ref").value;
    const description = document.getElementById("tx-desc").value;
    
    if (!amount || !date || !headId) {
        showToast("toast_fields_required", true);
        return;
    }
    
    const tx = {
        type,
        headId,
        amount,
        date,
        paymentMode,
        reference,
        description,
        billUrl: state.attachedBillUrl
    };
    
    db.addTransaction(tx);
    showToast("toast_saved");
    resetTransactionForm();
    loadDashboard();
}

function resetTransactionForm() {
    document.getElementById("tx-form").reset();
    document.getElementById("tx-date").value = new Date("2026-06-24").toISOString().split('T')[0];
    document.getElementById("preview-container").style.display = "none";
    document.getElementById("preview-img").src = "";
    state.attachedBillUrl = null;
}

// --- Reports Code ---
function loadReports() {
    document.getElementById("filter-from-date").value = state.filterFromDate;
    document.getElementById("filter-to-date").value = state.filterToDate;

    populateFilterHeadDropdown();
    const filterHead = document.getElementById("filter-head");
    if (filterHead) {
        filterHead.value = state.filterHeadId;
    }

    const summary = db.getDateRangeSummary(state.filterFromDate, state.filterToDate);
    const incomeHeads = db.getIncomeHeads();
    const expenseHeads = db.getExpenseHeads();

    const fromFormatted = formatDate(state.filterFromDate);
    const toFormatted = formatDate(state.filterToDate);
    
    let ledgerTitle = "";
    if (state.filterHeadId === "ledger_cash") {
        ledgerTitle = state.lang === "gu" ? "રોકડ સિલક ખાતું (Cash Ledger)" : "Cash Account Ledger";
    } else if (state.filterHeadId === "ledger_bank_cbi") {
        ledgerTitle = state.lang === "gu" ? "સેન્ટ્રલ બેંક ઓફ ઇન્ડિયા (CBI) લેજર" : "Central Bank of India (CBI) Ledger";
    } else if (state.filterHeadId === "ledger_bank_jcom") {
        ledgerTitle = state.lang === "gu" ? "ધ જુનાગઢ કોમર્શિયલ બેંક (JCOM) લેજર" : "The Junagadh Commercial Co-Op (JCOM) Ledger";
    } else if (state.filterHeadId) {
        const headObj = incomeHeads.concat(expenseHeads).find(h => h.id === state.filterHeadId);
        ledgerTitle = headObj ? `${state.lang === "gu" ? "કેટેગરી: " : "Category: "}${state.lang === "gu" && headObj.name_gu ? headObj.name_gu : headObj.name_en}` : "";
    }
    
    let titleText = "";
    if (state.lang === "gu") {
        titleText = ledgerTitle
            ? `તારીખ ${fromFormatted} થી ${toFormatted} સુધીનો હિસાબ (${ledgerTitle})`
            : `તારીખ ${fromFormatted} થી ${toFormatted} સુધીનો હિસાબ`;
    } else {
        titleText = ledgerTitle 
            ? `Statement from ${fromFormatted} to ${toFormatted} (${ledgerTitle})`
            : `Statement from ${fromFormatted} to ${toFormatted}`;
    }
    document.getElementById("report-month-title").innerText = titleText;

    const tableBody = document.getElementById("reports-table-body");
    const noTxAlert = document.getElementById("no-transactions-alert");
    tableBody.innerHTML = "";

    const headerRow = document.getElementById("reports-table-header-row");
    const filterHeadId = state.filterHeadId;
    const isSpecialLedger = filterHeadId === "ledger_cash" || filterHeadId === "ledger_bank_cbi" || filterHeadId === "ledger_bank_jcom";
    
    if (filterHeadId === "") {
        headerRow.innerHTML = `
            <th data-translate="col_date">Date</th>
            <th data-translate="col_type">Type</th>
            <th data-translate="col_head">Account Head</th>
            <th data-translate="col_amount">Amount</th>
            <th data-translate="col_mode">Mode</th>
            <th data-translate="col_desc">Description / Notes</th>
            <th>Cash Bal</th>
            <th>CBI Bal</th>
            <th>JCOM Bal</th>
            <th style="text-align: center;" data-translate="col_bill">Bill File</th>
        `;
    } else if (filterHeadId === "ledger_cash") {
        headerRow.innerHTML = `
            <th>Date</th>
            <th>Particulars (Account Head)</th>
            <th>Ref / Cheque</th>
            <th style="text-align: right;">Receipts (Dr)</th>
            <th style="text-align: right;">Payments (Cr)</th>
            <th style="text-align: right;">Cash Balance</th>
            <th style="text-align: center;">Bill File</th>
        `;
    } else if (filterHeadId === "ledger_bank_cbi" || filterHeadId === "ledger_bank_jcom") {
        const bankName = filterHeadId === "ledger_bank_cbi" ? "CBI" : "JCOM";
        headerRow.innerHTML = `
            <th>Date</th>
            <th>Particulars (Account Head)</th>
            <th>Ref / Cheque</th>
            <th style="text-align: right;">Deposits (Dr)</th>
            <th style="text-align: right;">Withdrawals (Cr)</th>
            <th style="text-align: right;">${bankName} Balance</th>
            <th style="text-align: center;">Bill File</th>
        `;
    } else {
        const headObj = incomeHeads.concat(expenseHeads).find(h => h.id === filterHeadId);
        const isIncomeHead = headObj ? headObj.type === "income" || headObj.id.startsWith("inc_") : false;
        const balLabel = isIncomeHead ? "Balance (Cr)" : "Balance (Dr)";
        headerRow.innerHTML = `
            <th>Date</th>
            <th>Particulars (Payment Mode)</th>
            <th>Ref / Cheque</th>
            <th style="text-align: right;">Debit (Dr)</th>
            <th style="text-align: right;">Credit (Cr)</th>
            <th style="text-align: right;">${balLabel}</th>
            <th style="text-align: center;">Bill File</th>
        `;
    }

    const opening = db.getOpeningBalancesAtDate(state.filterFromDate);
    let runningCash = opening.cash;
    let runningBankCBI = opening.bank_cbi || 0;
    let runningBankJCOM = opening.bank_jcom || 0;

    const sortedAllTxs = [...(summary.transactions || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sortedAllTxs.forEach(tx => {
        const amt = parseFloat(tx.amount) || 0;
        if (tx.headId === "contra_withdrawal") {
            runningCash += amt;
            if (tx.paymentMode === "Bank: JCOM") {
                runningBankJCOM -= amt;
            } else {
                runningBankCBI -= amt;
            }
        } else if (tx.headId === "contra_deposit") {
            runningCash -= amt;
            if (tx.paymentMode === "Bank: JCOM") {
                runningBankJCOM += amt;
            } else {
                runningBankCBI += amt;
            }
        } else {
            if (tx.type === "income") {
                if (tx.paymentMode === "Cash") runningCash += amt;
                else if (tx.paymentMode === "Bank: JCOM") runningBankJCOM += amt;
                else if (tx.paymentMode === "FD") { }
                else runningBankCBI += amt;
            } else {
                if (tx.paymentMode === "Cash") runningCash -= amt;
                else if (tx.paymentMode === "Bank: JCOM") runningBankJCOM -= amt;
                else if (tx.paymentMode === "FD") { }
                else runningBankCBI -= amt;
            }
        }
        tx.runningCash = runningCash;
        tx.runningBankCBI = runningBankCBI;
        tx.runningBankJCOM = runningBankJCOM;
    });

    let displayTxs = sortedAllTxs;
    if (filterHeadId === "ledger_cash") {
        displayTxs = sortedAllTxs.filter(tx => tx.paymentMode === "Cash" || tx.headId === "contra_withdrawal" || tx.headId === "contra_deposit");
    } else if (filterHeadId === "ledger_bank_cbi") {
        displayTxs = sortedAllTxs.filter(tx => tx.paymentMode === "Bank: CBI" || (isContra(tx) && tx.paymentMode !== "Bank: JCOM"));
    } else if (filterHeadId === "ledger_bank_jcom") {
        displayTxs = sortedAllTxs.filter(tx => tx.paymentMode === "Bank: JCOM" || (isContra(tx) && tx.paymentMode === "Bank: JCOM"));
    } else if (filterHeadId !== "") {
        displayTxs = sortedAllTxs.filter(tx => tx.headId === filterHeadId);
    }

    const reportSearchInput = document.getElementById("report-search-input");
    const searchText = reportSearchInput ? reportSearchInput.value.toLowerCase().trim() : "";
    if (searchText !== "") {
        displayTxs = displayTxs.filter(tx => {
            const head = tx.type === "income" ? incomeHeads.find(h => h.id === tx.headId) : expenseHeads.find(h => h.id === tx.headId);
            const headName = head ? (head.name_en.toLowerCase() + " " + head.name_gu.toLowerCase()) : "";
            const mode = getDisplayPaymentMode(tx.paymentMode).toLowerCase();
            const desc = (tx.description || "").toLowerCase();
            const ref = (tx.reference || "").toLowerCase();
            const amt = String(tx.amount);
            const date = tx.date;
            
            return headName.includes(searchText) || 
                   mode.includes(searchText) || 
                   desc.includes(searchText) || 
                   ref.includes(searchText) || 
                   amt.includes(searchText) || 
                   date.includes(searchText);
        });
    }

    function isContra(tx) {
        return tx.headId === "contra_withdrawal" || tx.headId === "contra_deposit";
    }

    let displayIncome = 0;
    let displayExpense = 0;
    
    if (filterHeadId === "") {
        displayIncome = summary.totalIncome;
        displayExpense = summary.totalExpense;
    } else if (filterHeadId === "ledger_cash") {
        displayTxs.forEach(tx => {
            const amt = parseFloat(tx.amount) || 0;
            if (tx.headId === "contra_withdrawal" || (tx.type === "income" && tx.paymentMode === "Cash")) {
                displayIncome += amt;
            } else if (tx.headId === "contra_deposit" || (tx.type === "expense" && tx.paymentMode === "Cash")) {
                displayExpense += amt;
            }
        });
    } else if (filterHeadId === "ledger_bank_cbi" || filterHeadId === "ledger_bank_jcom") {
        const isCBI = filterHeadId === "ledger_bank_cbi";
        const targetMode = isCBI ? "Bank: CBI" : "Bank: JCOM";
        displayTxs.forEach(tx => {
            const amt = parseFloat(tx.amount) || 0;
            const affectsThisBankContra = isCBI ? tx.paymentMode !== "Bank: JCOM" : tx.paymentMode === "Bank: JCOM";
            if ((tx.headId === "contra_deposit" && affectsThisBankContra) || (tx.type === "income" && tx.paymentMode === targetMode)) {
                displayIncome += amt;
            } else if ((tx.headId === "contra_withdrawal" && affectsThisBankContra) || (tx.type === "expense" && tx.paymentMode === targetMode)) {
                displayExpense += amt;
            }
        });
    } else {
        const headObj = incomeHeads.concat(expenseHeads).find(h => h.id === filterHeadId);
        const isIncomeHead = headObj ? headObj.type === "income" || headObj.id.startsWith("inc_") : false;
        displayTxs.forEach(tx => {
            const amt = parseFloat(tx.amount) || 0;
            if (isIncomeHead) {
                displayIncome += amt;
            } else {
                displayExpense += amt;
            }
        });
    }

    document.getElementById("rep-total-income").innerText = `₹ ${displayIncome.toLocaleString('en-IN')}`;
    document.getElementById("rep-total-expense").innerText = `₹ ${displayExpense.toLocaleString('en-IN')}`;
    
    const monthlyNet = displayIncome - displayExpense;
    const netElem = document.getElementById("rep-net-savings");
    netElem.innerText = `₹ ${monthlyNet.toLocaleString('en-IN')}`;
    netElem.style.color = monthlyNet >= 0 ? "var(--success)" : "var(--danger)";

    if (sortedAllTxs.length === 0) {
        noTxAlert.style.display = "block";
    } else {
        noTxAlert.style.display = "none";
        
        const openRow = document.createElement("tr");
        openRow.style.backgroundColor = "var(--bg-app)";
        openRow.style.fontWeight = "600";
        openRow.style.cursor = "default";
        
        if (filterHeadId === "") {
            openRow.innerHTML = `
                <td>${fromFormatted}</td>
                <td><span class="badge" style="background-color: var(--text-muted); color: white;">Opening</span></td>
                <td><strong>Opening Balance</strong></td>
                <td>-</td>
                <td>-</td>
                <td>Opening balances at start of period</td>
                <td style="font-weight: 700; color: var(--text-main);">₹ ${opening.cash.toLocaleString('en-IN')}</td>
                <td style="font-weight: 700; color: var(--text-main);">₹ ${opening.bank_cbi.toLocaleString('en-IN')}</td>
                <td style="font-weight: 700; color: var(--text-main);">₹ ${opening.bank_jcom.toLocaleString('en-IN')}</td>
                <td style="text-align: center;">-</td>
            `;
        } else if (filterHeadId === "ledger_cash") {
            openRow.innerHTML = `
                <td>${fromFormatted}</td>
                <td><strong>Opening Balance</strong></td>
                <td>-</td>
                <td style="text-align: right;">-</td>
                <td style="text-align: right;">-</td>
                <td style="text-align: right; font-weight: 700;">₹ ${opening.cash.toLocaleString('en-IN')}</td>
                <td style="text-align: center;">-</td>
            `;
        } else if (filterHeadId === "ledger_bank_cbi" || filterHeadId === "ledger_bank_jcom") {
            const openBal = filterHeadId === "ledger_bank_cbi" ? opening.bank_cbi : opening.bank_jcom;
            openRow.innerHTML = `
                <td>${fromFormatted}</td>
                <td><strong>Opening Balance</strong></td>
                <td>-</td>
                <td style="text-align: right;">-</td>
                <td style="text-align: right;">-</td>
                <td style="text-align: right; font-weight: 700;">₹ ${openBal.toLocaleString('en-IN')}</td>
                <td style="text-align: center;">-</td>
            `;
        } else {
            const headOpeningBal = db.getHeadOpeningBalance(filterHeadId, state.filterFromDate);
            openRow.innerHTML = `
                <td>${fromFormatted}</td>
                <td><strong>Opening Balance (B/F)</strong></td>
                <td>-</td>
                <td style="text-align: right;">-</td>
                <td style="text-align: right;">-</td>
                <td style="text-align: right; font-weight: 700;">₹ ${headOpeningBal.toLocaleString('en-IN')}</td>
                <td style="text-align: center;">-</td>
            `;
        }
        tableBody.appendChild(openRow);

        if (displayTxs.length === 0 && filterHeadId !== "") {
            const emptyRow = document.createElement("tr");
            const colspanVal = (filterHeadId === "" ? 10 : 7);
            emptyRow.innerHTML = `<td colspan="${colspanVal}" style="text-align: center; color: var(--text-muted); padding: 20px;">No transactions matching this ledger/category.</td>`;
            tableBody.appendChild(emptyRow);
        } else {
            let runningCategoryBal = filterHeadId !== "" && !isSpecialLedger ? db.getHeadOpeningBalance(filterHeadId, state.filterFromDate) : 0;
            const headObj = filterHeadId !== "" && !isSpecialLedger ? incomeHeads.concat(expenseHeads).find(h => h.id === filterHeadId) : null;
            const isIncomeHead = headObj ? headObj.type === "income" || headObj.id.startsWith("inc_") : false;

            displayTxs.forEach(tx => {
                const row = document.createElement("tr");
                const formattedDate = formatDate(tx.date);
                const billBtnHtml = tx.billUrl 
                    ? `<button class="btn btn-secondary px-2 py-1" style="font-size: 11px;" onclick="event.stopPropagation(); openBillViewer('${tx.billUrl}')"><i class="fas fa-file-invoice-dollar"></i> View Bill</button>`
                    : "-";

                if (filterHeadId === "") {
                    const head = tx.type === "income" ? incomeHeads.find(h => h.id === tx.headId) : expenseHeads.find(h => h.id === tx.headId);
                    const headName = head ? head.name_en : tx.headId;
                    let amountColor = "var(--text-main)";
                    let amountPrefix = "";
                    let badgeClass = "";
                    let badgeText = "";
                    
                    if (isContra(tx)) {
                        amountColor = "#0369a1";
                        amountPrefix = "⇄ ";
                        badgeClass = "badge-contra";
                        badgeText = "Contra";
                    } else if (tx.type === "income") {
                        amountColor = "var(--success)";
                        amountPrefix = "+ ";
                        badgeClass = "badge-income";
                        badgeText = "Income";
                    } else {
                        amountColor = "var(--danger)";
                        amountPrefix = "- ";
                        badgeClass = "badge-expense";
                        badgeText = "Expense";
                    }

                    row.innerHTML = `
                        <td>${formattedDate}</td>
                        <td><span class="badge ${badgeClass}">${badgeText}</span></td>
                        <td><strong>${headName}</strong></td>
                        <td style="font-weight: 700; color: ${amountColor}">${amountPrefix}₹ ${parseFloat(tx.amount).toLocaleString('en-IN')}</td>
                        <td>${getDisplayPaymentMode(tx.paymentMode)}</td>
                        <td>${tx.description || "-"}</td>
                        <td style="font-weight: 600; color: var(--text-main);">₹ ${tx.runningCash.toLocaleString('en-IN')}</td>
                        <td style="font-weight: 600; color: var(--text-main);">₹ ${tx.runningBankCBI.toLocaleString('en-IN')}</td>
                        <td style="font-weight: 600; color: var(--text-main);">₹ ${tx.runningBankJCOM.toLocaleString('en-IN')}</td>
                        <td style="text-align: center;">${billBtnHtml}</td>
                    `;
                } else if (filterHeadId === "ledger_cash") {
                    const head = tx.type === "income" ? incomeHeads.find(h => h.id === tx.headId) : expenseHeads.find(h => h.id === tx.headId);
                    let particulars = head ? head.name_en : tx.headId;
                    if (tx.headId === "contra_withdrawal") particulars = "Contra: Bank Withdrawal";
                    else if (tx.headId === "contra_deposit") particulars = "Contra: Bank Deposit";

                    let dr = "-";
                    let cr = "-";
                    const amt = parseFloat(tx.amount) || 0;
                    if (tx.headId === "contra_withdrawal" || (tx.type === "income" && tx.paymentMode === "Cash")) {
                        dr = `₹ ${amt.toLocaleString('en-IN')}`;
                    } else if (tx.headId === "contra_deposit" || (tx.type === "expense" && tx.paymentMode === "Cash")) {
                        cr = `₹ ${amt.toLocaleString('en-IN')}`;
                    }

                    row.innerHTML = `
                        <td>${formattedDate}</td>
                        <td><strong>${particulars}</strong>${tx.description ? '<br><small style="color: var(--text-muted); font-style: italic;">' + tx.description + '</small>' : ''}</td>
                        <td>${tx.reference || "-"}</td>
                        <td style="text-align: right; color: var(--success); font-weight: 600;">${dr}</td>
                        <td style="text-align: right; color: var(--danger); font-weight: 600;">${cr}</td>
                        <td style="text-align: right; font-weight: 600; color: var(--text-main);">₹ ${tx.runningCash.toLocaleString('en-IN')}</td>
                        <td style="text-align: center;">${billBtnHtml}</td>
                    `;
                } else if (filterHeadId === "ledger_bank_cbi" || filterHeadId === "ledger_bank_jcom") {
                    const isCBI = filterHeadId === "ledger_bank_cbi";
                    const targetMode = isCBI ? "Bank: CBI" : "Bank: JCOM";
                    const head = tx.type === "income" ? incomeHeads.find(h => h.id === tx.headId) : expenseHeads.find(h => h.id === tx.headId);
                    let particulars = head ? head.name_en : tx.headId;
                    if (tx.headId === "contra_withdrawal") particulars = "Contra: Cash Withdrawal";
                    else if (tx.headId === "contra_deposit") particulars = "Contra: Cash Deposit";

                    let dr = "-";
                    let cr = "-";
                    const amt = parseFloat(tx.amount) || 0;
                    const affectsThisBankContra = isCBI ? tx.paymentMode !== "Bank: JCOM" : tx.paymentMode === "Bank: JCOM";
                    if ((tx.headId === "contra_deposit" && affectsThisBankContra) || (tx.type === "income" && tx.paymentMode === targetMode)) {
                        dr = `₹ ${amt.toLocaleString('en-IN')}`;
                    } else if ((tx.headId === "contra_withdrawal" && affectsThisBankContra) || (tx.type === "expense" && tx.paymentMode === targetMode)) {
                        cr = `₹ ${amt.toLocaleString('en-IN')}`;
                    }

                    const runningVal = isCBI ? tx.runningBankCBI : tx.runningBankJCOM;

                    row.innerHTML = `
                        <td>${formattedDate}</td>
                        <td><strong>${particulars}</strong>${tx.description ? '<br><small style="color: var(--text-muted); font-style: italic;">' + tx.description + '</small>' : ''}</td>
                        <td>${tx.reference || "-"}</td>
                        <td style="text-align: right; color: var(--success); font-weight: 600;">${dr}</td>
                        <td style="text-align: right; color: var(--danger); font-weight: 600;">${cr}</td>
                        <td style="text-align: right; font-weight: 600; color: var(--text-main);">₹ ${runningVal.toLocaleString('en-IN')}</td>
                        <td style="text-align: center;">${billBtnHtml}</td>
                    `;
                } else {
                    let dr = "-";
                    let cr = "-";
                    const amt = parseFloat(tx.amount) || 0;
                    if (isIncomeHead) {
                        cr = `₹ ${amt.toLocaleString('en-IN')}`;
                    } else {
                        dr = `₹ ${amt.toLocaleString('en-IN')}`;
                    }
                    runningCategoryBal += amt;

                    row.innerHTML = `
                        <td>${formattedDate}</td>
                        <td><strong>${getDisplayPaymentMode(tx.paymentMode)}</strong>${tx.description ? '<br><small style="color: var(--text-muted); font-style: italic;">' + tx.description + '</small>' : ''}</td>
                        <td>${tx.reference || "-"}</td>
                        <td style="text-align: right; color: var(--danger); font-weight: 600;">${dr}</td>
                        <td style="text-align: right; color: var(--success); font-weight: 600;">${cr}</td>
                        <td style="text-align: right; font-weight: 600; color: var(--text-main);">₹ ${runningCategoryBal.toLocaleString('en-IN')}</td>
                        <td style="text-align: center;">${billBtnHtml}</td>
                    `;
                }

                row.addEventListener("click", () => openEditModal(tx));
                tableBody.appendChild(row);
            });
        }

        const closeRow = document.createElement("tr");
        closeRow.style.backgroundColor = "var(--bg-app)";
        closeRow.style.fontWeight = "600";
        closeRow.style.cursor = "default";
        
        if (filterHeadId === "") {
            closeRow.innerHTML = `
                <td>${toFormatted}</td>
                <td><span class="badge" style="background-color: var(--primary); color: white;">Closing</span></td>
                <td><strong>Closing Balance (પુરાંત)</strong></td>
                <td>-</td>
                <td>-</td>
                <td>Closing balances at end of period</td>
                <td style="font-weight: 700; color: var(--text-main);">₹ ${runningCash.toLocaleString('en-IN')}</td>
                <td style="font-weight: 700; color: var(--text-main);">₹ ${runningBankCBI.toLocaleString('en-IN')}</td>
                <td style="font-weight: 700; color: var(--text-main);">₹ ${runningBankJCOM.toLocaleString('en-IN')}</td>
                <td style="text-align: center;">-</td>
            `;
        } else if (filterHeadId === "ledger_cash") {
            closeRow.innerHTML = `
                <td>${toFormatted}</td>
                <td><strong>Closing Balance</strong></td>
                <td>-</td>
                <td style="text-align: right;">-</td>
                <td style="text-align: right;">-</td>
                <td style="text-align: right; font-weight: 700; color: var(--primary);">₹ ${runningCash.toLocaleString('en-IN')}</td>
                <td style="text-align: center;">-</td>
            `;
        } else if (filterHeadId === "ledger_bank_cbi" || filterHeadId === "ledger_bank_jcom") {
            const closeBal = filterHeadId === "ledger_bank_cbi" ? runningBankCBI : runningBankJCOM;
            closeRow.innerHTML = `
                <td>${toFormatted}</td>
                <td><strong>Closing Balance</strong></td>
                <td>-</td>
                <td style="text-align: right;">-</td>
                <td style="text-align: right;">-</td>
                <td style="text-align: right; font-weight: 700; color: var(--primary);">₹ ${closeBal.toLocaleString('en-IN')}</td>
                <td style="text-align: center;">-</td>
            `;
        } else {
            let runningCategoryBal = db.getHeadOpeningBalance(filterHeadId, state.filterFromDate);
            displayTxs.forEach(tx => {
                runningCategoryBal += parseFloat(tx.amount) || 0;
            });
            closeRow.innerHTML = `
                <td>${toFormatted}</td>
                <td><strong>Closing Balance (C/F)</strong></td>
                <td>-</td>
                <td style="text-align: right;">-</td>
                <td style="text-align: right;">-</td>
                <td style="text-align: right; font-weight: 700; color: var(--primary);">₹ ${runningCategoryBal.toLocaleString('en-IN')}</td>
                <td style="text-align: center;">-</td>
            `;
        }
        tableBody.appendChild(closeRow);
    }
}

function populateFilterHeadDropdown() {
    const filterHead = document.getElementById("filter-head");
    if (!filterHead) return;
    
    const incomeHeads = db.getIncomeHeads();
    const expenseHeads = db.getExpenseHeads();
    const totalHeadsCount = incomeHeads.length + expenseHeads.length;
    
    if (filterHead.dataset.headsCount == totalHeadsCount + 3) {
        return;
    }
    
    const currentVal = filterHead.value || state.filterHeadId;
    
    filterHead.innerHTML = `
        <option value="">General Ledger (All Transactions)</option>
        <optgroup label="Account Ledgers">
            <option value="ledger_cash">Cash Account Ledger</option>
            <option value="ledger_bank_cbi">Central Bank of India (CBI) Ledger</option>
            <option value="ledger_bank_jcom">The Junagadh Commercial Co-Op (JCOM) Ledger</option>
        </optgroup>
    `;
    
    const incomeGroup = document.createElement("optgroup");
    incomeGroup.label = "Income Head Ledgers";
    incomeHeads.forEach(h => {
        const opt = document.createElement("option");
        opt.value = h.id;
        opt.innerText = h.name_en;
        incomeGroup.appendChild(opt);
    });
    filterHead.appendChild(incomeGroup);
    
    const expenseGroup = document.createElement("optgroup");
    expenseGroup.label = "Expense Head Ledgers";
    expenseHeads.forEach(h => {
        const opt = document.createElement("option");
        opt.value = h.id;
        opt.innerText = h.name_en;
        expenseGroup.appendChild(opt);
    });
    filterHead.appendChild(expenseGroup);
    
    filterHead.dataset.headsCount = totalHeadsCount + 3;
    filterHead.value = currentVal;
}

// Edit Mode Modal Handler
function openEditModal(tx) {
    state.editingTxId = tx.id;
    state.attachedBillUrl = tx.billUrl;
    
    document.getElementById("edit-tx-id").value = tx.id;
    document.getElementById("edit-tx-type").value = tx.type;
    
    renderModalHeadsDropdown();
    document.getElementById("edit-tx-head").value = tx.headId;
    
    document.getElementById("edit-tx-amount").value = tx.amount;
    document.getElementById("edit-tx-date").value = tx.date;
    document.getElementById("edit-tx-payment-mode").value = tx.paymentMode;
    document.getElementById("edit-tx-ref").value = tx.reference || "";
    document.getElementById("edit-tx-desc").value = tx.description || "";
    
    const previewContainer = document.getElementById("edit-preview-container");
    const previewImg = document.getElementById("edit-preview-img");
    if (tx.billUrl) {
        previewImg.src = tx.billUrl;
        previewContainer.style.display = "block";
    } else {
        previewContainer.style.display = "none";
        previewImg.src = "";
    }
    
    document.getElementById("edit-modal").style.display = "flex";
}

function renderModalHeadsDropdown() {
    const headSelect = document.getElementById("edit-tx-head");
    const txType = document.getElementById("edit-tx-type").value;
    const heads = txType === "income" ? db.getIncomeHeads() : db.getExpenseHeads();
    
    headSelect.innerHTML = `<option value="" disabled selected>${TRANSLATIONS[state.lang].select_head}</option>`;
    heads.forEach(head => {
        const opt = document.createElement("option");
        opt.value = head.id;
        opt.innerText = head.name_en;
        headSelect.appendChild(opt);
    });
}

function closeEditModal() {
    document.getElementById("edit-modal").style.display = "none";
}

function handleModalUpdate(e) {
    e.preventDefault();
    
    const id = document.getElementById("edit-tx-id").value;
    const type = document.getElementById("edit-tx-type").value;
    const headId = document.getElementById("edit-tx-head").value;
    const amount = parseFloat(document.getElementById("edit-tx-amount").value);
    const date = document.getElementById("edit-tx-date").value;
    const paymentMode = document.getElementById("edit-tx-payment-mode").value;
    const reference = document.getElementById("edit-tx-ref").value;
    const description = document.getElementById("edit-tx-desc").value;
    
    if (!amount || !date || !headId) {
        alert(TRANSLATIONS[state.lang].toast_fields_required);
        return;
    }
    
    const txData = {
        id,
        type,
        headId,
        amount,
        date,
        paymentMode,
        reference,
        description,
        billUrl: state.attachedBillUrl
    };
    
    db.updateTransaction(txData);
    showToast("toast_updated");
    closeEditModal();
    
    if (state.activeTab === "dashboard") {
        loadDashboard();
    } else {
        loadReports();
    }
}

function handleModalDelete() {
    if (confirm(state.lang === "gu" ? "શું તમે ખરેખર આ એન્ટ્રી ડીલીટ કરવા માંગો છો?" : "Are you sure you want to delete this entry?")) {
        db.deleteTransaction(state.editingTxId);
        showToast("toast_deleted");
        closeEditModal();
        
        if (state.activeTab === "dashboard") {
            loadDashboard();
        } else {
            loadReports();
        }
    }
}

// Modal Bill Viewer
function openBillViewer(url) {
    const viewerModal = document.getElementById("bill-viewer-modal");
    const viewerImg = document.getElementById("viewer-img");
    viewerImg.src = url;
    viewerModal.style.display = "flex";
}

function closeBillViewer() {
    document.getElementById("bill-viewer-modal").style.display = "none";
}

// --- Year-End Balance Sheet Code ---
function loadBalanceSheet() {
    document.getElementById("balance-from-date").value = state.balanceFromDate;
    document.getElementById("balance-to-date").value = state.balanceToDate;

    const fromFormatted = formatDate(state.balanceFromDate);
    const toFormatted = formatDate(state.balanceToDate);
    
    const periodTitleStr = state.lang === "gu"
        ? `ગાળો: ${fromFormatted} થી ${toFormatted}`
        : `Period: ${fromFormatted} to ${toFormatted}`;
    document.getElementById("balance-period-title").innerText = periodTitleStr;
    document.getElementById("balance-screen-period").innerText = `${fromFormatted} થી ${toFormatted}`;

    const summary = db.getDateRangeSummary(state.balanceFromDate, state.balanceToDate);
    const opening = db.getOpeningBalancesAtDate(state.balanceFromDate);
    
    const toDateObj = new Date(state.balanceToDate);
    toDateObj.setDate(toDateObj.getDate() + 1);
    const nextDayStr = toDateObj.toISOString().split('T')[0];
    const closing = db.getOpeningBalancesAtDate(nextDayStr);

    const incomeHeads = db.getIncomeHeads();
    const expenseHeads = db.getExpenseHeads();

    const liabTable = document.getElementById("liab-table-body");
    liabTable.innerHTML = "";

    let liabTotal = 0;
    const globalOpening = db.getOpeningBalances();
    const openingSum = globalOpening.fd + (globalOpening.bank_cbi || 0) + (globalOpening.bank_jcom || 0) + globalOpening.cash;
    const reserveAmt = openingSum >= 50000 ? 50000 : 0;
    const corpusAmt = openingSum - reserveAmt;
    liabTotal += corpusAmt;
    liabTable.innerHTML += `
        <tr>
            <td>Corpus Fund / Member Deposits</td>
            <td style="text-align: right;">₹ ${corpusAmt.toLocaleString('en-IN')}</td>
        </tr>
    `;

    liabTotal += reserveAmt;
    liabTable.innerHTML += `
        <tr>
            <td>Reserves & Other Funds</td>
            <td style="text-align: right;">₹ ${reserveAmt.toLocaleString('en-IN')}</td>
        </tr>
    `;

    const globalStartSummary = db.getDateRangeSummary("2026-04-01", state.balanceToDate);
    const surplus = globalStartSummary.totalIncome - globalStartSummary.totalExpense;
    liabTotal += surplus;
    liabTable.innerHTML += `
        <tr>
            <td>Income & Expenditure A/c (Surplus)</td>
            <td style="text-align: right; color: ${surplus >= 0 ? 'var(--success)' : 'var(--danger)'}">₹ ${surplus.toLocaleString('en-IN')}</td>
        </tr>
    `;

    document.getElementById("liab-total").innerText = `₹ ${liabTotal.toLocaleString('en-IN')}`;

    const assetsTable = document.getElementById("assets-table-body");
    assetsTable.innerHTML = "";

    const assetsTotal = closing.cash + (closing.bank_cbi || 0) + (closing.bank_jcom || 0) + closing.fd;

    assetsTable.innerHTML += `
        <tr>
            <td>Central Bank of India Balance (CBI)</td>
            <td style="text-align: right;">₹ ${(closing.bank_cbi || 0).toLocaleString('en-IN')}</td>
        </tr>
        <tr>
            <td>The Junagadh Commercial Co-Op Balance (JCOM)</td>
            <td style="text-align: right;">₹ ${(closing.bank_jcom || 0).toLocaleString('en-IN')}</td>
        </tr>
        <tr>
            <td>Cash in Hand</td>
            <td style="text-align: right;">₹ ${closing.cash.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
            <td>Fixed Deposits (FD)</td>
            <td style="text-align: right;">₹ ${closing.fd.toLocaleString('en-IN')}</td>
        </tr>
    `;

    document.getElementById("assets-total").innerText = `₹ ${assetsTotal.toLocaleString('en-IN')}`;

    const tallyIndicator = document.getElementById("tally-indicator");
    const diff = Math.abs(liabTotal - assetsTotal);
    if (diff < 1) {
        tallyIndicator.innerHTML = `<span style="color: var(--success); font-weight: 700;"><i class="fas fa-check-double"></i> Balance Sheet Tallied</span>`;
    } else {
        tallyIndicator.innerHTML = `<span style="color: var(--warning); font-weight: 700;"><i class="fas fa-exclamation-triangle"></i> Difference: ₹ ${diff.toLocaleString('en-IN')}</span>`;
    }

    const detailedIncomeTbody = document.getElementById("detailed-income-heads-tbody");
    if (detailedIncomeTbody) {
        detailedIncomeTbody.innerHTML = "";
        incomeHeads.forEach(head => {
            const amt = summary.incomeByHead[head.id] || 0;
            detailedIncomeTbody.innerHTML += `
                <tr>
                    <td>${head.name_en}</td>
                    <td style="text-align: right; font-weight: 600;">₹ ${amt.toLocaleString('en-IN')}</td>
                </tr>
            `;
        });
    }

    const detailedExpenseTbody = document.getElementById("detailed-expense-heads-tbody");
    if (detailedExpenseTbody) {
        detailedExpenseTbody.innerHTML = "";
        expenseHeads.forEach(head => {
            const amt = summary.expenseByHead[head.id] || 0;
            detailedExpenseTbody.innerHTML += `
                <tr>
                    <td>${head.name_en}</td>
                    <td style="text-align: right; font-weight: 600;">₹ ${amt.toLocaleString('en-IN')}</td>
                </tr>
            `;
        });
    }

    const ledgerTbody = document.getElementById("balance-sheet-ledger-tbody");
    if (ledgerTbody) {
        ledgerTbody.innerHTML = "";
        const sortedTxs = [...summary.transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
        if (sortedTxs.length === 0) {
            ledgerTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); font-style: italic;">No transactions in this period.</td></tr>`;
        } else {
            sortedTxs.forEach(tx => {
                const head = tx.type === "income" 
                    ? incomeHeads.find(h => h.id === tx.headId) 
                    : expenseHeads.find(h => h.id === tx.headId);
                const headName = head ? head.name_en : tx.headId;
                const formattedDate = formatDate(tx.date);
                
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${formattedDate}</td>
                    <td><span class="badge ${tx.type === "income" ? "badge-income" : "badge-expense"}">${tx.type === "income" ? "Income" : "Expense"}</span></td>
                    <td>${headName}</td>
                    <td style="font-weight: 700; color: ${tx.type === "income" ? "var(--success)" : "var(--danger)"}">₹ ${parseFloat(tx.amount).toLocaleString('en-IN')}</td>
                    <td>${getDisplayPaymentMode(tx.paymentMode)}</td>
                    <td>${tx.description || tx.reference || "-"}</td>
                `;
                ledgerTbody.appendChild(row);
            });
        }
    }

    const opCashInput = document.getElementById("op-cash");
    const opCbiInput = document.getElementById("op-bank-cbi");
    const opJcomInput = document.getElementById("op-bank-jcom");
    const opFdInput = document.getElementById("op-fd");
    if (opCashInput) opCashInput.value = globalOpening.cash;
    if (opCbiInput) opCbiInput.value = globalOpening.bank_cbi || 0;
    if (opJcomInput) opJcomInput.value = globalOpening.bank_jcom || 0;
    if (opFdInput) opFdInput.value = globalOpening.fd;
}

function handleOpeningBalancesSave(e) {
    e.preventDefault();
    const cash = parseFloat(document.getElementById("op-cash").value) || 0;
    const bank_cbi = parseFloat(document.getElementById("op-bank-cbi").value) || 0;
    const bank_jcom = parseFloat(document.getElementById("op-bank-jcom").value) || 0;
    const fd = parseFloat(document.getElementById("op-fd").value) || 0;
    
    db.saveOpeningBalances({ cash, bank_cbi, bank_jcom, fd });
    showToast("toast_updated");
    loadBalanceSheet();
}

// --- Account Heads Management Code ---
function loadHeadsManagement() {
    const incList = document.getElementById("income-heads-list");
    const expList = document.getElementById("expense-heads-list");
    
    incList.innerHTML = "";
    expList.innerHTML = "";
    
    db.getIncomeHeads().forEach(head => {
        const item = document.createElement("div");
        item.className = "category-item";
        item.innerHTML = `
            <div class="category-info">
                <div class="category-color-dot" style="background-color: ${head.color || 'var(--primary)'}"></div>
                <div>
                    <strong style="display: block;">${head.name_en}</strong>
                </div>
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="category-edit-btn" onclick="openEditCategoryModal('${head.id}', 'income')" style="background: none; border: none; color: var(--primary); cursor: pointer; padding: 4px;"><i class="fas fa-edit"></i></button>
                <button class="category-delete-btn" onclick="deleteHead('${head.id}', 'income')" style="background: none; border: none; color: var(--danger); cursor: pointer; padding: 4px;"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        incList.appendChild(item);
    });

    db.getExpenseHeads().forEach(head => {
        const item = document.createElement("div");
        item.className = "category-item";
        item.innerHTML = `
            <div class="category-info">
                <div class="category-color-dot" style="background-color: ${head.color || 'var(--primary)'}"></div>
                <div>
                    <strong style="display: block;">${head.name_en}</strong>
                </div>
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="category-edit-btn" onclick="openEditCategoryModal('${head.id}', 'expense')" style="background: none; border: none; color: var(--primary); cursor: pointer; padding: 4px;"><i class="fas fa-edit"></i></button>
                <button class="category-delete-btn" onclick="deleteHead('${head.id}', 'expense')" style="background: none; border: none; color: var(--danger); cursor: pointer; padding: 4px;"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        expList.appendChild(item);
    });
}

function handleAddHeadSubmit(e) {
    e.preventDefault();
    const type = document.getElementById("head-type").value;
    const nameEn = document.getElementById("head-name-en").value;
    const color = document.getElementById("head-color").value;
    
    if (!nameEn) return;
    
    const newHead = {
        name_gu: nameEn,
        name_en: nameEn,
        color,
        icon: "fa-tag"
    };

    if (type === "income") {
        db.addIncomeHead(newHead);
    } else {
        db.addExpenseHead(newHead);
    }

    document.getElementById("head-form").reset();
    showToast("toast_head_added");
    loadHeadsManagement();
    renderHeadsDropdowns();
}

function deleteHead(id, type) {
    if (confirm("Are you sure you want to delete this head?")) {
        if (type === "income") {
            db.deleteIncomeHead(id);
        } else {
            db.deleteExpenseHead(id);
        }
        showToast("toast_head_deleted");
        loadHeadsManagement();
        renderHeadsDropdowns();
    }
}

// Category Editing Modal Controllers
function openEditCategoryModal(id, type) {
    const heads = type === "income" ? db.getIncomeHeads() : db.getExpenseHeads();
    const head = heads.find(h => h.id === id);
    if (!head) return;

    document.getElementById("edit-cat-id").value = id;
    document.getElementById("edit-cat-type").value = type;
    document.getElementById("edit-cat-name").value = head.name_en;
    document.getElementById("edit-cat-color").value = head.color || "#ec407a";

    document.getElementById("category-edit-modal").style.display = "flex";
}

function closeEditCategoryModal() {
    document.getElementById("category-edit-modal").style.display = "none";
}

function handleEditCategorySubmit(e) {
    e.preventDefault();
    const id = document.getElementById("edit-cat-id").value;
    const type = document.getElementById("edit-cat-type").value;
    const name = document.getElementById("edit-cat-name").value;
    const color = document.getElementById("edit-cat-color").value;

    if (!name) return;

    const heads = type === "income" ? db.getIncomeHeads() : db.getExpenseHeads();
    const existingHead = heads.find(h => h.id === id);
    if (!existingHead) return;

    const updatedHead = {
        ...existingHead,
        name_gu: name,
        name_en: name,
        color: color
    };

    if (type === "income") {
        db.updateIncomeHead(updatedHead);
    } else {
        db.updateExpenseHead(updatedHead);
    }

    closeEditCategoryModal();
    showToast("toast_updated");
    loadHeadsManagement();
    renderHeadsDropdowns();
}

// --- Society Logo Setup Code ---
function updateLogoStatusDisplay() {
    const statusContainer = document.getElementById("logo-status-container");
    if (!statusContainer) return;
    
    const savedLogo = localStorage.getItem("orchid_society_logo_base64");
    if (savedLogo) {
        statusContainer.innerHTML = `
            <span style="color: var(--success); display: block; margin-bottom: 6px;"><i class="fas fa-check-circle"></i> Logo Active (Custom)</span>
            <img src="${savedLogo}" style="height: 50px; max-width: 150px; object-fit: contain; border-radius: 6px; padding: 4px; background: white; border: 1px solid var(--border-color); margin: 0 auto; display: block;">
        `;
    } else {
        statusContainer.innerHTML = `
            <span style="color: var(--warning); display: block; margin-bottom: 6px;"><i class="fas fa-exclamation-circle"></i> Fallback Active</span>
            <span style="font-size: 11px; color: var(--text-muted); display: block;">No custom logo uploaded. System will use default canvas logo.</span>
        `;
    }
}

function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file (.jpg, .jpeg, .png).");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
        const base64Data = evt.target.result;
        try {
            localStorage.setItem("orchid_society_logo_base64", base64Data);
            updateLogoStatusDisplay();
            showToast("toast_updated");
            ['sidebar-logo', 'report-logo', 'balance-logo'].forEach(id => {
                const img = document.getElementById(id);
                if (img) img.src = base64Data;
            });
        } catch (err) {
            console.error("Failed to save logo to localStorage", err);
            alert("Failed to save logo. The image file might be too large.");
        }
    };
    reader.readAsDataURL(file);
}

// --- Backup & Restore Code ---
function triggerExportBackup() {
    const txs = db.getTransactions();
    const incHeads = db.getIncomeHeads();
    const expHeads = db.getExpenseHeads();
    
    const txRows = txs.map(tx => {
        const head = tx.type === "income" 
            ? incHeads.find(h => h.id === tx.headId) 
            : expHeads.find(h => h.id === tx.headId);
        return {
            "Date (dd-mm-yyyy)": formatDateDMY(tx.date),
            "Type": tx.type === "income" ? "Income" : "Expense",
            "Head ID": tx.headId,
            "Category": head ? head.name_en : tx.headId,
            "Amount": parseFloat(tx.amount) || 0,
            "Mode": tx.paymentMode,
            "Reference": tx.reference || "",
            "Description": tx.description || ""
        };
    });

    const catRows = [];
    incHeads.forEach(h => {
        catRows.push({
            "Type": "Income",
            "ID": h.id,
            "Name": h.name_en,
            "Color": h.color || "#4caf50"
        });
    });
    expHeads.forEach(h => {
        catRows.push({
            "Type": "Expense",
            "ID": h.id,
            "Name": h.name_en,
            "Color": h.color || "#e91e63"
        });
    });

    const op = db.getOpeningBalances();
    const opRows = [{
        "Cash": op.cash,
        "Bank: CBI": op.bank_cbi || 0,
        "Bank: JCOM": op.bank_jcom || 0,
        "FD": op.fd
    }];

    const wb = XLSX.utils.book_new();
    
    const wsTx = XLSX.utils.json_to_sheet(txRows);
    const wsCat = XLSX.utils.json_to_sheet(catRows);
    const wsOp = XLSX.utils.json_to_sheet(opRows);
    
    XLSX.utils.book_append_sheet(wb, wsTx, "Transactions");
    XLSX.utils.book_append_sheet(wb, wsCat, "Categories");
    XLSX.utils.book_append_sheet(wb, wsOp, "Opening Balances");

    const filename = `Orchid_Heights_Accounts_Backup_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
    
    showToast("toast_backup_exported");
}

function handleImportBackup(e) {
    e.preventDefault();
    const fileInput = document.getElementById("backup-file-input");
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const data = evt.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            
            if (!workbook.SheetNames.includes("Transactions") || !workbook.SheetNames.includes("Categories")) {
                showToast("toast_backup_failed", true);
                return;
            }

            const wsTx = workbook.Sheets["Transactions"];
            const txDataRaw = XLSX.utils.sheet_to_json(wsTx);
            const parsedTransactions = txDataRaw.map(row => {
                const typeText = String(row["Type"] || row["વ્યવહાર પ્રકાર (Type)"] || "");
                const type = typeText.includes("આવક") || typeText.toLowerCase().includes("income") ? "income" : "expense";
                
                const rawDate = row["Date"] || row["Date (dd-mm-yyyy)"] || row["તારીખ (Date)"];
                const txDate = parseExcelDate(rawDate);
                
                let paymentMode = row["Mode"] || row["પદ્ધતિ (Mode)"] || "Bank: CBI";
                if (paymentMode === "Bank") {
                    paymentMode = "Bank: CBI";
                }
                return {
                    id: "tx_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now(),
                    date: txDate,
                    type: type,
                    headId: row["Head ID"] || row["હેડ આઈડી (Head ID)"] || "exp_misc",
                    amount: parseFloat(row["Amount"] || row["રકમ (Amount)"]) || 0,
                    paymentMode: paymentMode,
                    reference: String(row["Reference"] || row["ચેક નં / રેફરન્સ (Reference)"] || "").trim(),
                    description: String(row["Description"] || row["વિગત (Description)"] || "").trim(),
                    billUrl: null
                };
            });

            const wsCat = workbook.Sheets["Categories"];
            const catDataRaw = XLSX.utils.sheet_to_json(wsCat);
            const parsedIncomeHeads = [];
            const parsedExpenseHeads = [];

            catDataRaw.forEach(row => {
                const typeText = String(row["Type"] || row["પ્રકાર (Type)"] || "");
                const type = typeText.includes("આવક") || typeText.toLowerCase().includes("income") ? "income" : "expense";
                const head = {
                    id: row["ID"] || row["આઈડી (ID)"] || (type === "income" ? "inc_" : "exp_") + Date.now() + Math.random().toString(36).substring(2, 5),
                    name_gu: row["Name"] || row["અંગ્રેજી નામ (Name En)"] || row["Name En"] || row["Name Gu"] || "Unknown",
                    name_en: row["Name"] || row["અંગ્રેજી નામ (Name En)"] || row["Name En"] || "Unknown",
                    color: row["Color"] || row["Color Code"] || row["કલર કોડ (Color)"] || (type === "income" ? "#4caf50" : "#e91e63"),
                    icon: "fa-tag"
                };
                if (type === "income") {
                    parsedIncomeHeads.push(head);
                } else {
                    parsedExpenseHeads.push(head);
                }
            });

            let parsedOpening = { cash: 0, bank_cbi: 0, bank_jcom: 0, fd: 0 };
            if (workbook.SheetNames.includes("Opening Balances")) {
                const wsOp = workbook.Sheets["Opening Balances"];
                const opDataRaw = XLSX.utils.sheet_to_json(wsOp);
                if (opDataRaw.length > 0) {
                    const row = opDataRaw[0];
                    parsedOpening = {
                        cash: parseFloat(row["Cash"] || row["રોકડ સિલક (Cash)"]) || 0,
                        bank_cbi: parseFloat(row["Bank: CBI"] || row["Bank CBI"] || row["Bank"] || row["બેંક સિલક (Bank)"]) || 0,
                        bank_jcom: parseFloat(row["Bank: JCOM"] || row["Bank JCOM"]) || 0,
                        fd: parseFloat(row["FD"] || row["ફિક્સ ડિપોઝિટ (FD)"]) || 0
                    };
                }
            }

            db.saveTransactions(parsedTransactions);
            db.saveIncomeHeads(parsedIncomeHeads);
            db.saveExpenseHeads(parsedExpenseHeads);
            db.saveOpeningBalances(parsedOpening);

            showToast("toast_backup_imported");
            fileInput.value = "";
            
            loadDashboard();
            switchTab("dashboard");

        } catch (err) {
            console.error("Excel import failed", err);
            showToast("toast_backup_failed", true);
        }
    };
    reader.readAsBinaryString(file);
}

function handleClearAllTransactions() {
    const confirmation = confirm(state.lang === "gu" 
        ? "ચેતવણી: શું તમે ખરેખર સોસાયટીના તમામ આવક-ખર્ચ વ્યવહારો ડીલીટ કરવા માંગો છો? આ વ્યવહારો કાયમી ધોરણે ડીલીટ થઇ જશે અને પાછા લાવી શકાશે નહીં." 
        : "WARNING: Are you sure you want to delete all income and expense transactions? This action is permanent and cannot be undone.");
    
    if (confirmation) {
        const secondConfirmation = confirm(state.lang === "gu"
            ? "આ છેલ્લી ચેતવણી છે! શું ખરેખર સોસાયટીનો તમામ વ્યવહાર ડેટા સાફ કરવો છે?"
            : "FINAL WARNING! Do you really want to erase all society transactions?");
            
        if (secondConfirmation) {
            db.saveTransactions([]);
            db.saveOpeningBalances({ cash: 0, bank_cbi: 0, bank_jcom: 0, fd: 0 });
            localStorage.removeItem("orchid_heights_v2_setup_cash_completed");
            showToast("toast_deleted");
            
            loadDashboard();
            switchTab("dashboard");
            
            setTimeout(() => {
                const openCashModal = document.getElementById("opening-cash-modal");
                if (openCashModal) {
                    document.getElementById("setup-cash-input").value = 0;
                    openCashModal.style.display = "flex";
                }
            }, 500);
        }
    }
}

// --- WhatsApp Share Buttons Actions ---
function copyWhatsAppSummary() {
    const summary = db.getDateRangeSummary(state.filterFromDate, state.filterToDate);
    const incomeHeads = db.getIncomeHeads();
    const expenseHeads = db.getExpenseHeads();
    
    if (state.filterHeadId) {
        summary.transactions = (summary.transactions || []).filter(tx => tx.headId === state.filterHeadId);
        
        let filteredIncome = 0;
        let filteredExpense = 0;
        summary.transactions.forEach(tx => {
            const amt = parseFloat(tx.amount) || 0;
            if (tx.headId === "contra_withdrawal" || tx.headId === "contra_deposit") return;
            if (tx.type === "income") filteredIncome += amt;
            else filteredExpense += amt;
        });
        summary.totalIncome = filteredIncome;
        summary.totalExpense = filteredExpense;
        
        const headObj = incomeHeads.concat(expenseHeads).find(h => h.id === state.filterHeadId);
        summary.filterHeadName = headObj ? headObj.name_en : "";
    }

    const textMsg = generateWhatsAppText(summary, incomeHeads, expenseHeads);
    
    navigator.clipboard.writeText(textMsg).then(() => {
        showToast("toast_whatsapp_copied");
    }).catch(err => {
        console.error("Clipboard copy failed", err);
        alert(textMsg);
    });
}

function downloadWhatsAppReportImage() {
    const summary = db.getDateRangeSummary(state.filterFromDate, state.filterToDate);
    const incomeHeads = db.getIncomeHeads();
    const expenseHeads = db.getExpenseHeads();
    
    if (state.filterHeadId) {
        summary.transactions = (summary.transactions || []).filter(tx => tx.headId === state.filterHeadId);
        
        let filteredIncome = 0;
        let filteredExpense = 0;
        summary.transactions.forEach(tx => {
            const amt = parseFloat(tx.amount) || 0;
            if (tx.headId === "contra_withdrawal" || tx.headId === "contra_deposit") return;
            if (tx.type === "income") filteredIncome += amt;
            else filteredExpense += amt;
        });
        summary.totalIncome = filteredIncome;
        summary.totalExpense = filteredExpense;
        
        const headObj = incomeHeads.concat(expenseHeads).find(h => h.id === state.filterHeadId);
        summary.filterHeadName = headObj ? headObj.name_en : "";
    }

    const savedLogo = localStorage.getItem("orchid_society_logo_base64");
    const logoSrc = savedLogo || "../../brain/225c9f60-c27f-466e-a355-582c6ebd7961/media__1782475273284.jpg";

    exportReportToImage(summary, incomeHeads, expenseHeads, logoSrc, (dataUrl) => {
        const a = document.createElement("a");
        const namePrefix = summary.filterHeadName ? `Category_${summary.filterHeadName.replace(/\s+/g, '_')}_` : "";
        a.download = `Orchid_Heights_${namePrefix}Statement_${state.filterFromDate}_to_${state.filterToDate}.png`;
        a.href = dataUrl;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}

async function viewPDFReport() {
    const base64font = await loadGujaratiFont();
    const summary = db.getDateRangeSummary(state.filterFromDate, state.filterToDate);
    const incomeHeads = db.getIncomeHeads();
    const expenseHeads = db.getExpenseHeads();
    
    const filterHeadId = state.filterHeadId || "";
    const isSpecialLedger = filterHeadId === "ledger_cash" || filterHeadId === "ledger_bank_cbi" || filterHeadId === "ledger_bank_jcom";
    
    const sortedAllTxs = [...(summary.transactions || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const opening = db.getOpeningBalancesAtDate(state.filterFromDate);
    let runningCash = opening.cash;
    let runningBankCBI = opening.bank_cbi || 0;
    let runningBankJCOM = opening.bank_jcom || 0;
    
    sortedAllTxs.forEach(tx => {
        const amt = parseFloat(tx.amount) || 0;
        if (tx.headId === "contra_withdrawal") {
            runningCash += amt;
            if (tx.paymentMode === "Bank: JCOM") {
                runningBankJCOM -= amt;
            } else {
                runningBankCBI -= amt;
            }
        } else if (tx.headId === "contra_deposit") {
            runningCash -= amt;
            if (tx.paymentMode === "Bank: JCOM") {
                runningBankJCOM += amt;
            } else {
                runningBankCBI += amt;
            }
        } else {
            if (tx.type === "income") {
                if (tx.paymentMode === "Cash") runningCash += amt;
                else if (tx.paymentMode === "Bank: JCOM") runningBankJCOM += amt;
                else if (tx.paymentMode === "FD") { }
                else runningBankCBI += amt;
            } else {
                if (tx.paymentMode === "Cash") runningCash -= amt;
                else if (tx.paymentMode === "Bank: JCOM") runningBankJCOM -= amt;
                else if (tx.paymentMode === "FD") { }
                else runningBankCBI -= amt;
            }
        }
        tx.runningCash = runningCash;
        tx.runningBankCBI = runningBankCBI;
        tx.runningBankJCOM = runningBankJCOM;
    });

    function isContra(tx) {
        return tx.headId === "contra_withdrawal" || tx.headId === "contra_deposit";
    }

    let displayTxs = sortedAllTxs;
    if (filterHeadId === "ledger_cash") {
        displayTxs = sortedAllTxs.filter(tx => tx.paymentMode === "Cash" || tx.headId === "contra_withdrawal" || tx.headId === "contra_deposit");
    } else if (filterHeadId === "ledger_bank_cbi") {
        displayTxs = sortedAllTxs.filter(tx => tx.paymentMode === "Bank: CBI" || (isContra(tx) && tx.paymentMode !== "Bank: JCOM"));
    } else if (filterHeadId === "ledger_bank_jcom") {
        displayTxs = sortedAllTxs.filter(tx => tx.paymentMode === "Bank: JCOM" || (isContra(tx) && tx.paymentMode === "Bank: JCOM"));
    } else if (filterHeadId !== "") {
        displayTxs = sortedAllTxs.filter(tx => tx.headId === filterHeadId);
    }

    let displayIncome = 0;
    let displayExpense = 0;
    
    if (filterHeadId === "") {
        displayIncome = summary.totalIncome;
        displayExpense = summary.totalExpense;
    } else if (filterHeadId === "ledger_cash") {
        displayTxs.forEach(tx => {
            const amt = parseFloat(tx.amount) || 0;
            if (tx.headId === "contra_withdrawal" || (tx.type === "income" && tx.paymentMode === "Cash")) {
                displayIncome += amt;
            } else if (tx.headId === "contra_deposit" || (tx.type === "expense" && tx.paymentMode === "Cash")) {
                displayExpense += amt;
            }
        });
    } else if (filterHeadId === "ledger_bank_cbi" || filterHeadId === "ledger_bank_jcom") {
        const isCBI = filterHeadId === "ledger_bank_cbi";
        const targetMode = isCBI ? "Bank: CBI" : "Bank: JCOM";
        displayTxs.forEach(tx => {
            const amt = parseFloat(tx.amount) || 0;
            const affectsThisBankContra = isCBI ? tx.paymentMode !== "Bank: JCOM" : tx.paymentMode === "Bank: JCOM";
            if ((tx.headId === "contra_deposit" && affectsThisBankContra) || (tx.type === "income" && tx.paymentMode === targetMode)) {
                displayIncome += amt;
            } else if ((tx.headId === "contra_withdrawal" && affectsThisBankContra) || (tx.type === "expense" && tx.paymentMode === targetMode)) {
                displayExpense += amt;
            }
        });
    } else {
        const headObj = incomeHeads.concat(expenseHeads).find(h => h.id === filterHeadId);
        const isIncomeHead = headObj ? headObj.type === "income" || headObj.id.startsWith("inc_") : false;
        displayTxs.forEach(tx => {
            const amt = parseFloat(tx.amount) || 0;
            if (isIncomeHead) {
                displayIncome += amt;
            } else {
                displayExpense += amt;
            }
        });
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    if (base64font) {
        doc.addFileToVFS('NotoSansGujarati.ttf', base64font);
        doc.addFont('NotoSansGujarati.ttf', 'NotoSansGujarati', 'normal');
        doc.addFont('NotoSansGujarati.ttf', 'NotoSansGujarati', 'bold');
        doc.setFont('NotoSansGujarati', 'normal');
    }
    
    const margin = 15;
    const contentWidth = 210 - (margin * 2);
    
    const savedLogo = localStorage.getItem("orchid_society_logo_base64");
    const logoSize = 18;
    const logoX = margin;
    const logoY = 12;
    const textOffset = logoSize + 6;
    
    if (savedLogo) {
        try {
            doc.addImage(savedLogo, 'JPEG', logoX, logoY, logoSize, logoSize);
        } catch (e) {
            console.warn("Failed to load custom logo in PDF", e);
        }
    } else {
        doc.setFillColor(236, 64, 122);
        const centerX = logoX + logoSize / 2;
        const centerY = logoY + logoSize / 2;
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const x = centerX + Math.cos(angle) * 3;
            const y = centerY + Math.sin(angle) * 3;
            doc.ellipse(x, y, 1.8, 3, 'F', angle * 180 / Math.PI);
        }
        doc.setFillColor(255, 255, 255);
        doc.circle(centerX, centerY, 1, 'F');
    }
    
    doc.setTextColor(30, 41, 59);
    if (base64font) doc.setFont("NotoSansGujarati", "bold"); else doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    const headerTitleText = state.lang === "gu" ? "ઓર્કિડ હાઇટ્સ રેસીડેન્સી" : "ORCHID HEIGHTS RESIDENCY";
    doc.text(headerTitleText, margin + textOffset, 21);
    
    doc.setTextColor(236, 64, 122);
    doc.setFontSize(11);
    
    let subtitle = "";
    if (state.lang === "gu") {
        subtitle = "સોસાયટી ખાતા પત્રક (જનરલ લેજર)";
        if (filterHeadId === "ledger_cash") {
            subtitle = "રોકડ સિલક ખાતું (Cash Ledger)";
        } else if (filterHeadId === "ledger_bank_cbi") {
            subtitle = "સેન્ટ્રલ બેંક ઓફ ઇન્ડિયા (CBI) લેજર";
        } else if (filterHeadId === "ledger_bank_jcom") {
            subtitle = "ધ જુનાગઢ કોમર્શિયલ બેંક (JCOM) લેજર";
        } else if (filterHeadId !== "") {
            const headObj = incomeHeads.concat(expenseHeads).find(h => h.id === filterHeadId);
            const headName = headObj ? (headObj.name_gu || headObj.name_en) : filterHeadId;
            subtitle = `કેટેગરી લેજર ખાતું: ${headName}`;
        }
    } else {
        subtitle = "Society Accounts Statement (General Ledger)";
        if (filterHeadId === "ledger_cash") {
            subtitle = "Cash Account Ledger";
        } else if (filterHeadId === "ledger_bank_cbi") {
            subtitle = "Central Bank of India (CBI) Ledger";
        } else if (filterHeadId === "ledger_bank_jcom") {
            subtitle = "The Junagadh Commercial Co-Op (JCOM) Ledger";
        } else if (filterHeadId !== "") {
            const headObj = incomeHeads.concat(expenseHeads).find(h => h.id === filterHeadId);
            const headName = headObj ? headObj.name_en : filterHeadId;
            subtitle = `Category Accounts Ledger: ${headName}`;
        }
    }
    doc.text(subtitle, margin + textOffset, 27);
    
    doc.setTextColor(100, 116, 139);
    if (base64font) doc.setFont("NotoSansGujarati", "normal"); else doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const fromFormatted = formatDate(state.filterFromDate);
    const toFormatted = formatDate(state.filterToDate);
    const periodLabel = state.lang === "gu" ? `ગાળો: ${fromFormatted} થી ${toFormatted}` : `Period: ${fromFormatted} to ${toFormatted}`;
    const generatedLabel = state.lang === "gu" ? `તારીખ: ${new Date().toLocaleDateString('en-IN')}` : `Generated: ${new Date().toLocaleDateString('en-IN')}`;
    doc.text(periodLabel, margin, 37);
    doc.text(generatedLabel, 210 - margin, 37, { align: 'right' });
    
    doc.setDrawColor(236, 64, 122);
    doc.setLineWidth(0.5);
    doc.line(margin, 41, 210 - margin, 41);
    
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, 44, contentWidth, 32, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, 44, contentWidth, 32, 'S');
    
    doc.setTextColor(30, 41, 59);
    if (base64font) doc.setFont("NotoSansGujarati", "bold"); else doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Financial Summary", margin + 6, 49);
    
    if (base64font) doc.setFont("NotoSansGujarati", "normal"); else doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    
    if (filterHeadId === "") {
        doc.text(`Total Inflow: Rs. ${displayIncome.toLocaleString('en-IN')}`, margin + 6, 55);
        doc.text(`Total Outflow: Rs. ${displayExpense.toLocaleString('en-IN')}`, margin + 6, 61);
        const netSavings = displayIncome - displayExpense;
        if (base64font) doc.setFont("NotoSansGujarati", "bold"); else doc.setFont("helvetica", "bold");
        doc.setTextColor(netSavings >= 0 ? 46 : 198, netSavings >= 0 ? 125 : 40, netSavings >= 0 ? 50 : 40);
        doc.text(`Net Savings: Rs. ${netSavings.toLocaleString('en-IN')}`, margin + 6, 68);
        
        if (base64font) doc.setFont("NotoSansGujarati", "normal"); else doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        doc.text(`Opening Cash: Rs. ${opening.cash.toLocaleString('en-IN')}`, margin + 70, 55);
        doc.text(`Opening CBI: Rs. ${opening.bank_cbi.toLocaleString('en-IN')}`, margin + 70, 61);
        doc.text(`Opening JCOM: Rs. ${opening.bank_jcom.toLocaleString('en-IN')}`, margin + 70, 68);
        
        if (base64font) doc.setFont("NotoSansGujarati", "bold"); else doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59);
        doc.text(`Closing Cash: Rs. ${runningCash.toLocaleString('en-IN')}`, margin + 125, 55);
        doc.text(`Closing CBI: Rs. ${runningBankCBI.toLocaleString('en-IN')}`, margin + 125, 61);
        doc.text(`Closing JCOM: Rs. ${runningBankJCOM.toLocaleString('en-IN')}`, margin + 125, 68);
    } else if (filterHeadId === "ledger_cash") {
        doc.text(`Total Receipts: Rs. ${displayIncome.toLocaleString('en-IN')}`, margin + 6, 55);
        doc.text(`Total Payments: Rs. ${displayExpense.toLocaleString('en-IN')}`, margin + 6, 61);
        const netCash = displayIncome - displayExpense;
        if (base64font) doc.setFont("NotoSansGujarati", "bold"); else doc.setFont("helvetica", "bold");
        doc.setTextColor(netCash >= 0 ? 46 : 198, netCash >= 0 ? 125 : 40, netCash >= 0 ? 50 : 40);
        doc.text(`Net Cash Flow: Rs. ${netCash.toLocaleString('en-IN')}`, margin + 6, 68);
        
        if (base64font) doc.setFont("NotoSansGujarati", "normal"); else doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        doc.text(`Opening Cash Balance: Rs. ${opening.cash.toLocaleString('en-IN')}`, margin + 85, 55);
        
        if (base64font) doc.setFont("NotoSansGujarati", "bold"); else doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59);
        doc.text(`Closing Cash Balance: Rs. ${runningCash.toLocaleString('en-IN')}`, margin + 145, 55);
    } else if (filterHeadId === "ledger_bank_cbi") {
        doc.text(`Total Deposits: Rs. ${displayIncome.toLocaleString('en-IN')}`, margin + 6, 55);
        doc.text(`Total Withdrawals: Rs. ${displayExpense.toLocaleString('en-IN')}`, margin + 6, 61);
        const netCBI = displayIncome - displayExpense;
        if (base64font) doc.setFont("NotoSansGujarati", "bold"); else doc.setFont("helvetica", "bold");
        doc.setTextColor(netCBI >= 0 ? 46 : 198, netCBI >= 0 ? 125 : 40, netCBI >= 0 ? 50 : 40);
        doc.text(`Net CBI Flow: Rs. ${netCBI.toLocaleString('en-IN')}`, margin + 6, 68);
        
        if (base64font) doc.setFont("NotoSansGujarati", "normal"); else doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        doc.text(`Opening CBI Balance: Rs. ${opening.bank_cbi.toLocaleString('en-IN')}`, margin + 85, 55);
        
        if (base64font) doc.setFont("NotoSansGujarati", "bold"); else doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59);
        doc.text(`Closing CBI Balance: Rs. ${runningBankCBI.toLocaleString('en-IN')}`, margin + 145, 55);
    } else if (filterHeadId === "ledger_bank_jcom") {
        doc.text(`Total Deposits: Rs. ${displayIncome.toLocaleString('en-IN')}`, margin + 6, 55);
        doc.text(`Total Withdrawals: Rs. ${displayExpense.toLocaleString('en-IN')}`, margin + 6, 61);
        const netJCOM = displayIncome - displayExpense;
        if (base64font) doc.setFont("NotoSansGujarati", "bold"); else doc.setFont("helvetica", "bold");
        doc.setTextColor(netJCOM >= 0 ? 46 : 198, netJCOM >= 0 ? 125 : 40, netJCOM >= 0 ? 50 : 40);
        doc.text(`Net JCOM Flow: Rs. ${netJCOM.toLocaleString('en-IN')}`, margin + 6, 68);
        
        if (base64font) doc.setFont("NotoSansGujarati", "normal"); else doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        doc.text(`Opening JCOM Balance: Rs. ${opening.bank_jcom.toLocaleString('en-IN')}`, margin + 85, 55);
        
        if (base64font) doc.setFont("NotoSansGujarati", "bold"); else doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59);
        doc.text(`Closing JCOM Balance: Rs. ${runningBankJCOM.toLocaleString('en-IN')}`, margin + 145, 55);
    } else {
        const headOpeningBal = db.getHeadOpeningBalance(filterHeadId, state.filterFromDate);
        let closingCategoryBal = headOpeningBal;
        displayTxs.forEach(tx => {
            closingCategoryBal += parseFloat(tx.amount) || 0;
        });
        
        const headObj = incomeHeads.concat(expenseHeads).find(h => h.id === filterHeadId);
        const isIncomeHead = headObj ? headObj.type === "income" || headObj.id.startsWith("inc_") : false;
        
        if (isIncomeHead) {
            doc.text(`Total Credits (Income): Rs. ${displayIncome.toLocaleString('en-IN')}`, margin + 6, 55);
        } else {
            doc.text(`Total Debits (Expense): Rs. ${displayExpense.toLocaleString('en-IN')}`, margin + 6, 55);
        }
        
        if (base64font) doc.setFont("NotoSansGujarati", "normal"); else doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        doc.text(`Opening Balance: Rs. ${headOpeningBal.toLocaleString('en-IN')}`, margin + 85, 55);
        
        if (base64font) doc.setFont("NotoSansGujarati", "bold"); else doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59);
        doc.text(`Closing Balance: Rs. ${closingCategoryBal.toLocaleString('en-IN')}`, margin + 145, 55);
    }

    let columns = [];
    let rows = [];
    let columnStylesSetting = {};
    
    if (filterHeadId === "") {
        columns = [
            { header: 'DATE', dataKey: 'date' },
            { header: 'TYPE', dataKey: 'type' },
            { header: 'PARTICULARS', dataKey: 'particulars' },
            { header: 'MODE', dataKey: 'mode' },
            { header: 'CASH BAL', dataKey: 'cash_bal' },
            { header: 'CBI BAL', dataKey: 'cbi_bal' },
            { header: 'JCOM BAL', dataKey: 'jcom_bal' },
            { header: 'AMOUNT', dataKey: 'amount' }
        ];
        
        rows.push({
            date: fromFormatted,
            type: 'OPENING',
            particulars: 'Opening balances at start of period',
            mode: '-',
            cash_bal: `Rs. ${opening.cash.toLocaleString('en-IN')}`,
            cbi_bal: `Rs. ${opening.bank_cbi.toLocaleString('en-IN')}`,
            jcom_bal: `Rs. ${opening.bank_jcom.toLocaleString('en-IN')}`,
            amount: '-'
        });
        
        displayTxs.forEach(tx => {
            const dateParts = tx.date.split("-");
            const dateStr = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0].substring(2)}` : tx.date;
            
            const head = tx.type === "income" 
                ? incomeHeads.find(h => h.id === tx.headId) 
                : expenseHeads.find(h => h.id === tx.headId);
            const headName = head ? (state.lang === 'gu' && head.name_gu ? head.name_gu : head.name_en) : tx.headId;
            
            let typeStr = tx.type.toUpperCase();
            let particularsStr = headName;
            if (tx.headId === "contra_withdrawal") {
                typeStr = "CONTRA";
                particularsStr = "Contra: Bank Withdrawal";
            } else if (tx.headId === "contra_deposit") {
                typeStr = "CONTRA";
                particularsStr = "Contra: Bank Deposit";
            }
            
            if (tx.description) {
                particularsStr += `\n${tx.description}`;
            }
            
            const isContra = tx.headId === "contra_withdrawal" || tx.headId === "contra_deposit";
            const prefixSymbol = isContra ? "⇄ " : (tx.type === "income" ? "+" : "-");
            
            rows.push({
                date: dateStr,
                type: typeStr,
                particulars: particularsStr,
                mode: getDisplayPaymentMode(tx.paymentMode),
                cash_bal: `Rs. ${tx.runningCash.toLocaleString('en-IN')}`,
                cbi_bal: `Rs. ${tx.runningBankCBI.toLocaleString('en-IN')}`,
                jcom_bal: `Rs. ${tx.runningBankJCOM.toLocaleString('en-IN')}`,
                amount: `${prefixSymbol} Rs. ${parseFloat(tx.amount).toLocaleString('en-IN')}`
            });
        });
        
        rows.push({
            date: toFormatted,
            type: 'CLOSING',
            particulars: 'Closing balances (પુરાંત) at end of period',
            mode: '-',
            cash_bal: `Rs. ${runningCash.toLocaleString('en-IN')}`,
            cbi_bal: `Rs. ${runningBankCBI.toLocaleString('en-IN')}`,
            jcom_bal: `Rs. ${runningBankJCOM.toLocaleString('en-IN')}`,
            amount: '-'
        });
        
        columnStylesSetting = {
            date: { width: 18, halign: 'center' },
            type: { width: 16, halign: 'center' },
            particulars: { font: base64font ? 'NotoSansGujarati' : 'helvetica' },
            mode: { width: 18, halign: 'center' },
            cash_bal: { width: 22, halign: 'right' },
            cbi_bal: { width: 22, halign: 'right' },
            jcom_bal: { width: 22, halign: 'right' },
            amount: { width: 24, halign: 'right', fontStyle: 'bold' }
        };
    } else if (filterHeadId === "ledger_cash") {
        columns = [
            { header: 'DATE', dataKey: 'date' },
            { header: 'PARTICULARS', dataKey: 'particulars' },
            { header: 'REF / CHEQUE', dataKey: 'ref' },
            { header: 'RECEIPTS (DR)', dataKey: 'dr' },
            { header: 'PAYMENTS (CR)', dataKey: 'cr' },
            { header: 'CASH BALANCE', dataKey: 'balance' }
        ];
        
        rows.push({
            date: fromFormatted,
            particulars: 'Opening Balance',
            ref: '-',
            dr: '-',
            cr: '-',
            balance: `Rs. ${opening.cash.toLocaleString('en-IN')}`
        });
        
        displayTxs.forEach(tx => {
            const dateParts = tx.date.split("-");
            const dateStr = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0].substring(2)}` : tx.date;
            
            const head = tx.type === "income" 
                ? incomeHeads.find(h => h.id === tx.headId) 
                : expenseHeads.find(h => h.id === tx.headId);
            const headName = head ? (state.lang === 'gu' && head.name_gu ? head.name_gu : head.name_en) : tx.headId;
            
            let particularsStr = headName;
            if (tx.headId === "contra_withdrawal") {
                particularsStr = "Contra: Bank Withdrawal";
            } else if (tx.headId === "contra_deposit") {
                particularsStr = "Contra: Bank Deposit";
            }
            
            if (tx.description) {
                particularsStr += `\n${tx.description}`;
            }
            
            let dr = "-";
            let cr = "-";
            const amt = parseFloat(tx.amount) || 0;
            if (tx.headId === "contra_withdrawal" || (tx.type === "income" && tx.paymentMode === "Cash")) {
                dr = `Rs. ${amt.toLocaleString('en-IN')}`;
            } else if (tx.headId === "contra_deposit" || (tx.type === "expense" && tx.paymentMode === "Cash")) {
                cr = `Rs. ${amt.toLocaleString('en-IN')}`;
            }
            
            rows.push({
                date: dateStr,
                particulars: particularsStr,
                ref: tx.reference || "-",
                dr: dr,
                cr: cr,
                balance: `Rs. ${tx.runningCash.toLocaleString('en-IN')}`
            });
        });
        
        rows.push({
            date: toFormatted,
            particulars: 'Closing Balance',
            ref: '-',
            dr: '-',
            cr: '-',
            balance: `Rs. ${runningCash.toLocaleString('en-IN')}`
        });
        
        columnStylesSetting = {
            date: { width: 20, halign: 'center' },
            particulars: { font: base64font ? 'NotoSansGujarati' : 'helvetica' },
            ref: { width: 25, halign: 'center' },
            dr: { width: 30, halign: 'right', textColor: [46, 125, 50] },
            cr: { width: 30, halign: 'right', textColor: [198, 40, 40] },
            balance: { width: 32, halign: 'right', fontStyle: 'bold' }
        };
    } else if (filterHeadId === "ledger_bank_cbi" || filterHeadId === "ledger_bank_jcom") {
        const isCBI = filterHeadId === "ledger_bank_cbi";
        const bankLabel = isCBI ? "CBI BALANCE" : "JCOM BALANCE";
        
        columns = [
            { header: 'DATE', dataKey: 'date' },
            { header: 'PARTICULARS', dataKey: 'particulars' },
            { header: 'REF / CHEQUE', dataKey: 'ref' },
            { header: 'DEPOSITS (DR)', dataKey: 'dr' },
            { header: 'WITHDRAWALS (CR)', dataKey: 'cr' },
            { header: bankLabel, dataKey: 'balance' }
        ];
        
        const openBal = isCBI ? opening.bank_cbi : opening.bank_jcom;
        rows.push({
            date: fromFormatted,
            particulars: 'Opening Balance',
            ref: '-',
            dr: '-',
            cr: '-',
            balance: `Rs. ${openBal.toLocaleString('en-IN')}`
        });
        
        displayTxs.forEach(tx => {
            const dateParts = tx.date.split("-");
            const dateStr = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0].substring(2)}` : tx.date;
            
            const head = tx.type === "income" 
                ? incomeHeads.find(h => h.id === tx.headId) 
                : expenseHeads.find(h => h.id === tx.headId);
            const headName = head ? (state.lang === 'gu' && head.name_gu ? head.name_gu : head.name_en) : tx.headId;
            
            let particularsStr = headName;
            if (tx.headId === "contra_withdrawal") {
                particularsStr = "Contra: Cash Withdrawal";
            } else if (tx.headId === "contra_deposit") {
                particularsStr = "Contra: Cash Deposit";
            }
            
            if (tx.description) {
                particularsStr += `\n${tx.description}`;
            }
            
            let dr = "-";
            let cr = "-";
            const amt = parseFloat(tx.amount) || 0;
            const targetMode = isCBI ? "Bank: CBI" : "Bank: JCOM";
            const affectsThisBankContra = isCBI ? tx.paymentMode !== "Bank: JCOM" : tx.paymentMode === "Bank: JCOM";
            
            if ((tx.headId === "contra_deposit" && affectsThisBankContra) || (tx.type === "income" && tx.paymentMode === targetMode)) {
                dr = `Rs. ${amt.toLocaleString('en-IN')}`;
            } else if ((tx.headId === "contra_withdrawal" && affectsThisBankContra) || (tx.type === "expense" && tx.paymentMode === targetMode)) {
                cr = `Rs. ${amt.toLocaleString('en-IN')}`;
            }
            
            const runningVal = isCBI ? tx.runningBankCBI : tx.runningBankJCOM;
            rows.push({
                date: dateStr,
                particulars: particularsStr,
                ref: tx.reference || "-",
                dr: dr,
                cr: cr,
                balance: `Rs. ${runningVal.toLocaleString('en-IN')}`
            });
        });
        
        const closeBal = isCBI ? runningBankCBI : runningBankJCOM;
        rows.push({
            date: toFormatted,
            particulars: 'Closing Balance',
            ref: '-',
            dr: '-',
            cr: '-',
            balance: `Rs. ${closeBal.toLocaleString('en-IN')}`
        });
        
        columnStylesSetting = {
            date: { width: 20, halign: 'center' },
            particulars: { font: base64font ? 'NotoSansGujarati' : 'helvetica' },
            ref: { width: 25, halign: 'center' },
            dr: { width: 30, halign: 'right', textColor: [46, 125, 50] },
            cr: { width: 30, halign: 'right', textColor: [198, 40, 40] },
            balance: { width: 32, halign: 'right', fontStyle: 'bold' }
        };
    } else {
        const headObj = incomeHeads.concat(expenseHeads).find(h => h.id === filterHeadId);
        const isIncomeHead = headObj ? headObj.type === "income" || headObj.id.startsWith("inc_") : false;
        const balLabel = isIncomeHead ? "BALANCE (CR)" : "BALANCE (DR)";
        
        columns = [
            { header: 'DATE', dataKey: 'date' },
            { header: 'PARTICULARS (MODE)', dataKey: 'particulars' },
            { header: 'REF / CHEQUE', dataKey: 'ref' },
            { header: 'DEBIT (DR)', dataKey: 'dr' },
            { header: 'CREDIT (CR)', dataKey: 'cr' },
            { header: balLabel, dataKey: 'balance' }
        ];
        
        const headOpeningBal = db.getHeadOpeningBalance(filterHeadId, state.filterFromDate);
        rows.push({
            date: fromFormatted,
            particulars: 'Opening Balance (B/F)',
            ref: '-',
            dr: '-',
            cr: '-',
            balance: `Rs. ${headOpeningBal.toLocaleString('en-IN')}`
        });
        
        let runningCategoryBal = headOpeningBal;
        displayTxs.forEach(tx => {
            const dateParts = tx.date.split("-");
            const dateStr = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0].substring(2)}` : tx.date;
            
            let particularsStr = getDisplayPaymentMode(tx.paymentMode);
            if (tx.description) {
                particularsStr += `\n${tx.description}`;
            }
            
            let dr = "-";
            let cr = "-";
            const amt = parseFloat(tx.amount) || 0;
            if (isIncomeHead) {
                cr = `Rs. ${amt.toLocaleString('en-IN')}`;
            } else {
                dr = `Rs. ${amt.toLocaleString('en-IN')}`;
            }
            
            runningCategoryBal += amt;
            
            rows.push({
                date: dateStr,
                particulars: particularsStr,
                ref: tx.reference || "-",
                dr: dr,
                cr: cr,
                balance: `Rs. ${runningCategoryBal.toLocaleString('en-IN')}`
            });
        });
        
        rows.push({
            date: toFormatted,
            particulars: 'Closing Balance (C/F)',
            ref: '-',
            dr: '-',
            cr: '-',
            balance: `Rs. ${runningCategoryBal.toLocaleString('en-IN')}`
        });
        
        columnStylesSetting = {
            date: { width: 20, halign: 'center' },
            particulars: { font: base64font ? 'NotoSansGujarati' : 'helvetica' },
            ref: { width: 25, halign: 'center' },
            dr: { width: 30, halign: 'right', textColor: [198, 40, 40] },
            cr: { width: 30, halign: 'right', textColor: [46, 125, 50] },
            balance: { width: 32, halign: 'right', fontStyle: 'bold' }
        };
    }

    doc.autoTable({
        columns: columns,
        body: rows,
        startY: 82,
        theme: 'grid',
        styles: {
            font: base64font ? 'NotoSansGujarati' : 'helvetica'
        },
        headStyles: {
            fillColor: [236, 64, 122],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'center',
            font: base64font ? 'NotoSansGujarati' : 'helvetica'
        },
        bodyStyles: {
            fontSize: 8,
            textColor: [51, 65, 85],
            valign: 'middle',
            font: base64font ? 'NotoSansGujarati' : 'helvetica'
        },
        columnStyles: columnStylesSetting,
        didParseCell: function(data) {
            if (filterHeadId === "") {
                if (data.column.dataKey === 'amount' && data.cell.section === 'body') {
                    const val = data.cell.text[0] || '';
                    if (val.startsWith('+')) {
                        data.cell.styles.textColor = [46, 125, 50];
                    } else if (val.startsWith('-')) {
                        data.cell.styles.textColor = [198, 40, 40];
                    } else if (val.startsWith('⇄')) {
                        data.cell.styles.textColor = [3, 105, 161];
                    }
                }
                if (data.column.dataKey === 'type' && data.cell.section === 'body') {
                    const val = data.cell.text[0];
                    if (val === 'INCOME') {
                        data.cell.styles.textColor = [46, 125, 50];
                    } else if (val === 'EXPENSE') {
                        data.cell.styles.textColor = [198, 40, 40];
                    } else if (val === 'CONTRA') {
                        data.cell.styles.textColor = [3, 105, 161];
                    } else if (val === 'OPENING' || val === 'CLOSING') {
                        data.cell.styles.fontStyle = 'bold';
                        data.cell.styles.textColor = [30, 41, 59];
                    }
                }
            } else {
                if (data.cell.section === 'body') {
                    const rowData = data.row.raw;
                    if (rowData.particulars === 'Opening Balance' || rowData.particulars === 'Opening Balance (B/F)' || rowData.particulars === 'Closing Balance' || rowData.particulars === 'Closing Balance (C/F)') {
                        data.cell.styles.fontStyle = 'bold';
                        data.cell.styles.textColor = [30, 41, 59];
                    }
                }
            }
        },
        didDrawPage: function(data) {
            const str = "Page " + doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            if (base64font) doc.setFont("NotoSansGujarati", "normal"); else doc.setFont("helvetica", "normal");
            doc.text(str, 210 - margin, 297 - 10, { align: 'right' });
            doc.text(state.lang === "gu" ? "🌸 ઓર્કિડ હાઇટ્સ રેસીડેન્સી એકાઉન્ટિંગ રીપોર્ટ" : "🌸 Orchid Heights Residency Accounting Report", margin, 297 - 10);
        }
    });

    try {
        const pdfUrl = doc.output('bloburl');
        const iframe = document.getElementById("pdf-viewer-iframe");
        if (iframe) {
            iframe.src = pdfUrl;
        }
        const modal = document.getElementById("pdf-viewer-modal");
        if (modal) {
            modal.style.display = "flex";
        }
    } catch (e) {
        console.error("PDF preview open failed", e);
        alert("Failed to render PDF preview: " + e.message);
    }
}

// --- Helpers ---
function formatDate(dateStr) {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
}

function handleImportMemberDeposits(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet);
            
            let importedCount = 0;
            const newTransactions = [];
            
            rows.forEach(row => {
                const wing = String(row["WING"] || row["wing"] || "").trim();
                const block = String(row["BLOCK NUMBER"] || row["block number"] || row["BLOCK NO"] || row["block no"] || "").trim();
                const owner = String(row["OWNER NAME"] || row["owner name"] || row["NAME"] || row["name"] || "").trim();
                const chqNo = String(row["CHQ NO"] || row["chq no"] || "").trim();
                const depoDateVal = row["DEPO DATE"] || row["depo date"] || "";
                const banklSelect = String(row["BANKL SELECT"] || row["bankl select"] || row["BANK SELECT"] || row["bank select"] || "").trim().toUpperCase();
                const amount = parseFloat(row["AMOUNT"] || row["amount"] || 0);
                
                if (!amount || (!owner && !block)) {
                    return;
                }
                
                const txDate = parseExcelDate(depoDateVal);
                
                let paymentMode = "Bank: CBI";
                if (banklSelect === "JCOM") {
                    paymentMode = "Bank: JCOM";
                } else if (banklSelect === "CBI") {
                    paymentMode = "Bank: CBI";
                }
                
                const descParts = [];
                if (wing) descParts.push(`Wing ${wing}`);
                if (block) descParts.push(`Block ${block}`);
                if (owner) descParts.push(owner);
                const description = descParts.join(" - ");
                
                const tx = {
                    id: "tx_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now() + "_" + importedCount,
                    type: "income",
                    headId: "inc_maintenance",
                    amount: amount,
                    date: txDate,
                    paymentMode: paymentMode,
                    reference: chqNo || "",
                    description: description,
                    billUrl: null
                };
                
                newTransactions.push(tx);
                importedCount++;
            });
            
            if (newTransactions.length > 0) {
                const currentTxs = db.getTransactions();
                const updatedTxs = currentTxs.concat(newTransactions);
                db.saveTransactions(updatedTxs);
                
                alert(`Successfully imported ${importedCount} member deposit entries!`);
                
                loadDashboard();
                if (state.activeTab === "reports") {
                    loadReports();
                } else if (state.activeTab === "balance") {
                    loadBalanceSheet();
                }
                switchTab("reports");
            } else {
                alert("No valid deposit entries found. Please check columns: WING, BLOCK NUMBER, OWNER NAME, CHQ NO, DEPO DATE, BANKL SELECT, AMOUNT.");
            }
        } catch (err) {
            console.error("Member deposits import failed", err);
            alert("Failed to parse Excel sheet: " + err.message);
        }
    };
    reader.readAsBinaryString(file);
}

// --- Initialization & Binding ---
document.addEventListener("DOMContentLoaded", () => {
    document.body.setAttribute("data-theme", state.theme);
    document.getElementById("theme-checkbox").checked = state.theme === "dark";
    
    const langCheckbox = document.getElementById("lang-checkbox");
    if (langCheckbox) {
        langCheckbox.checked = state.lang === "en";
    }
    
    applyTranslations();
    switchTab("dashboard");

    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", () => {
            switchTab(item.getAttribute("data-tab"));
        });
    });
    
    document.querySelectorAll(".mobile-nav-item").forEach(item => {
        item.addEventListener("click", () => {
            switchTab(item.getAttribute("data-tab"));
        });
    });

    document.getElementById("theme-checkbox").addEventListener("change", (e) => {
        const newTheme = e.target.checked ? "dark" : "light";
        state.theme = newTheme;
        localStorage.setItem("orchid_theme", newTheme);
        document.body.setAttribute("data-theme", newTheme);
        if (state.activeTab === "dashboard") {
            drawDashboardChart();
        }
    });

    if (langCheckbox) {
        langCheckbox.addEventListener("change", (e) => {
            const newLang = e.target.checked ? "en" : "gu";
            state.lang = newLang;
            localStorage.setItem("orchid_lang", newLang);
            applyTranslations();
            
            if (state.activeTab === "dashboard") loadDashboard();
            else if (state.activeTab === "reports") loadReports();
            else if (state.activeTab === "balance") loadBalanceSheet();
            else if (state.activeTab === "heads") loadHeadsManagement();
        });
    }

    document.getElementById("tx-type").addEventListener("change", renderHeadsDropdowns);
    document.getElementById("tx-form").addEventListener("submit", handleTransactionSubmit);
    document.getElementById("btn-cancel-tx").addEventListener("click", resetTransactionForm);

    const fileInput = document.getElementById("tx-file");
    const dropArea = document.getElementById("upload-droparea");
    
    dropArea.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        handleBillUpload(file);
    });

    dropArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropArea.style.borderColor = "var(--primary)";
        dropArea.style.backgroundColor = "var(--primary-light)";
    });

    dropArea.addEventListener("dragleave", () => {
        dropArea.style.borderColor = "var(--border-color)";
        dropArea.style.backgroundColor = "var(--bg-app)";
    });

    dropArea.addEventListener("drop", (e) => {
        e.preventDefault();
        dropArea.style.borderColor = "var(--border-color)";
        dropArea.style.backgroundColor = "var(--bg-app)";
        const file = e.dataTransfer.files[0];
        handleBillUpload(file);
    });

    document.getElementById("remove-preview-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        state.attachedBillUrl = null;
        document.getElementById("preview-container").style.display = "none";
        document.getElementById("preview-img").src = "";
        fileInput.value = "";
    });

    document.getElementById("edit-tx-form").addEventListener("submit", handleModalUpdate);
    document.getElementById("edit-modal-close").addEventListener("click", closeEditModal);
    document.getElementById("edit-modal-cancel").addEventListener("click", closeEditModal);
    document.getElementById("edit-modal-delete").addEventListener("click", handleModalDelete);
    document.getElementById("edit-tx-type").addEventListener("change", renderModalHeadsDropdown);

    document.getElementById("bill-viewer-close").addEventListener("click", closeBillViewer);

    document.getElementById("filter-from-date").value = state.filterFromDate;
    document.getElementById("filter-to-date").value = state.filterToDate;
    
    document.getElementById("btn-apply-date-filter").addEventListener("click", () => {
        const fromVal = document.getElementById("filter-from-date").value;
        const toVal = document.getElementById("filter-to-date").value;
        if (fromVal && toVal) {
            state.filterFromDate = fromVal;
            state.filterToDate = toVal;
            loadReports();
        } else {
            alert("Please select both From and To dates.");
        }
    });

    const filterHead = document.getElementById("filter-head");
    if (filterHead) {
        filterHead.addEventListener("change", (e) => {
            state.filterHeadId = e.target.value;
            loadReports();
        });
    }

    const btnViewPdf = document.getElementById("btn-view-pdf-report");
    if (btnViewPdf) {
        btnViewPdf.addEventListener("click", viewPDFReport);
    }
    const pdfClose = document.getElementById("pdf-viewer-close");
    const pdfModal = document.getElementById("pdf-viewer-modal");
    if (pdfClose && pdfModal) {
        pdfClose.addEventListener("click", () => {
            pdfModal.style.display = "none";
        });
        pdfModal.addEventListener("click", (e) => {
            if (e.target === pdfModal) {
                pdfModal.style.display = "none";
            }
        });
    }

    document.getElementById("balance-from-date").value = state.balanceFromDate;
    document.getElementById("balance-to-date").value = state.balanceToDate;
    
    document.getElementById("btn-apply-balance-filter").addEventListener("click", () => {
        const fromVal = document.getElementById("balance-from-date").value;
        const toVal = document.getElementById("balance-to-date").value;
        if (fromVal && toVal) {
            state.balanceFromDate = fromVal;
            state.balanceToDate = toVal;
            loadBalanceSheet();
        } else {
            alert("Please select both From and To dates.");
        }
    });

    document.getElementById("opening-balances-form").addEventListener("submit", handleOpeningBalancesSave);
    document.getElementById("print-balance-sheet").addEventListener("click", () => window.print());
    document.getElementById("head-form").addEventListener("submit", handleAddHeadSubmit);
    document.getElementById("btn-export-backup").addEventListener("click", triggerExportBackup);
    document.getElementById("backup-import-form").addEventListener("submit", handleImportBackup);
    document.getElementById("btn-clear-all-tx").addEventListener("click", handleClearAllTransactions);

    document.getElementById("cat-edit-form").addEventListener("submit", handleEditCategorySubmit);
    document.getElementById("cat-edit-modal-close").addEventListener("click", closeEditCategoryModal);
    document.getElementById("cat-edit-modal-cancel").addEventListener("click", closeEditCategoryModal);

    document.getElementById("tx-date").value = new Date("2026-06-24").toISOString().split('T')[0];

    const savedLogo = localStorage.getItem("orchid_society_logo_base64");
    if (savedLogo) {
        ['sidebar-logo', 'report-logo', 'balance-logo'].forEach(id => {
            const img = document.getElementById(id);
            if (img) img.src = savedLogo;
        });
    }
    updateLogoStatusDisplay();

    const btnUploadLogo = document.getElementById("btn-upload-logo");
    const logoFileInput = document.getElementById("logo-file-input");
    if (btnUploadLogo && logoFileInput) {
        btnUploadLogo.addEventListener("click", () => logoFileInput.click());
        logoFileInput.addEventListener("change", handleLogoUpload);
    }

    const openCashModal = document.getElementById("opening-cash-modal");
    const openCashForm = document.getElementById("opening-cash-setup-form");
    const openCashInput = document.getElementById("setup-cash-input");
    const btnShowCashSetup = document.getElementById("btn-show-cash-setup");
    
    if (btnShowCashSetup) {
        btnShowCashSetup.addEventListener("click", () => {
            const opBalances = db.getOpeningBalances();
            openCashInput.value = opBalances.cash;
            openCashModal.style.display = "flex";
        });
    }

    const openCashClose = document.getElementById("opening-cash-modal-close");
    if (openCashClose) {
        openCashClose.addEventListener("click", () => {
            openCashModal.style.display = "none";
        });
    }

    if (openCashForm) {
        openCashForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const cashVal = parseFloat(openCashInput.value) || 0;
            const opBalances = db.getOpeningBalances();
            opBalances.cash = cashVal;
            db.saveOpeningBalances(opBalances);
            localStorage.setItem("orchid_heights_v2_setup_cash_completed", "true");
            openCashModal.style.display = "none";
            showToast("toast_updated");
            
            if (state.activeTab === "reports") loadReports();
            else if (state.activeTab === "balance") loadBalanceSheet();
            else if (state.activeTab === "dashboard") loadDashboard();
        });
    }

    if (!localStorage.getItem("orchid_heights_v2_setup_cash_completed")) {
        setTimeout(() => {
            const opBalances = db.getOpeningBalances();
            openCashInput.value = opBalances.cash;
            openCashModal.style.display = "flex";
        }, 300);
    }

    const memberDepositsFile = document.getElementById("member-deposits-file");
    const btnImportMemberDeposits = document.getElementById("btn-import-member-deposits");
    if (memberDepositsFile && btnImportMemberDeposits) {
        btnImportMemberDeposits.addEventListener("click", () => memberDepositsFile.click());
        memberDepositsFile.addEventListener("change", (e) => {
            const file = e.target.files[0];
            handleImportMemberDeposits(file);
        });
    }

    const reportSearchInput = document.getElementById("report-search-input");
    if (reportSearchInput) {
        reportSearchInput.addEventListener("input", loadReports);
    }
    const dashboardSearchInput = document.getElementById("dashboard-search-input");
    if (dashboardSearchInput) {
        dashboardSearchInput.addEventListener("input", loadDashboard);
    }

    const datePromptForm = document.getElementById("date-prompt-setup-form");
    if (datePromptForm) {
        datePromptForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const fromVal = document.getElementById("prompt-from-date").value;
            const toVal = document.getElementById("prompt-to-date").value;
            
            if (pendingTabSwitch === "reports") {
                state.filterFromDate = fromVal;
                state.filterToDate = toVal;
            } else if (pendingTabSwitch === "balance") {
                state.balanceFromDate = fromVal;
                state.balanceToDate = toVal;
            }
            
            document.getElementById("date-prompt-modal").style.display = "none";
            if (pendingTabSwitch) {
                switchTabDirectly(pendingTabSwitch);
                pendingTabSwitch = null;
            }
        });
    }
    
    const datePromptClose = document.getElementById("date-prompt-modal-close");
    if (datePromptClose) {
        datePromptClose.addEventListener("click", () => {
            document.getElementById("date-prompt-modal").style.display = "none";
            pendingTabSwitch = null;
        });
    }

    const generalExcelFile = document.getElementById("general-excel-file");
    const btnImportGeneralExcel = document.getElementById("btn-import-general-excel");
    if (generalExcelFile && btnImportGeneralExcel) {
        btnImportGeneralExcel.addEventListener("click", () => generalExcelFile.click());
        generalExcelFile.addEventListener("change", (e) => {
            const file = e.target.files[0];
            handleGeneralExcelUpload(file);
        });
    }
    
    const excelMapperClose = document.getElementById("excel-mapper-modal-close");
    if (excelMapperClose) {
        excelMapperClose.addEventListener("click", () => {
            document.getElementById("excel-mapper-modal").style.display = "none";
        });
    }
    
    const excelMapperForm = document.getElementById("excel-mapper-setup-form");
    if (excelMapperForm) {
        excelMapperForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const mappings = {
                date: document.getElementById("map-date").value,
                category: document.getElementById("map-category").value,
                amount: document.getElementById("map-amount").value,
                type: document.getElementById("map-type").value,
                mode: document.getElementById("map-mode").value,
                ref: document.getElementById("map-ref").value,
                desc: document.getElementById("map-desc").value
            };
            
            document.getElementById("excel-mapper-modal").style.display = "none";
            executeExcelImport(mappings);
        });
    }
});

// --- Date Prompt & Tab Switching Helper Functions ---
let pendingTabSwitch = null;

function switchTab(tabId) {
    if (tabId === "reports" || tabId === "balance") {
        pendingTabSwitch = tabId;
        const fromVal = tabId === "reports" ? state.filterFromDate : state.balanceFromDate;
        const toVal = tabId === "reports" ? state.filterToDate : state.balanceToDate;
        document.getElementById("prompt-from-date").value = fromVal;
        document.getElementById("prompt-to-date").value = toVal;
        document.getElementById("date-prompt-modal").style.display = "flex";
        return;
    }
    switchTabDirectly(tabId);
}

function switchTabDirectly(tabId) {
    state.activeTab = tabId;
    
    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
        if (item.getAttribute("data-tab") === tabId) {
            item.classList.add("active");
        }
    });
    
    document.querySelectorAll(".mobile-nav-item").forEach(item => {
        item.classList.remove("active");
        if (item.getAttribute("data-tab") === tabId) {
            item.classList.add("active");
        }
    });
    
    document.querySelectorAll(".page-section").forEach(sec => {
        sec.classList.remove("active");
    });
    
    const activeSec = document.getElementById(`section-${tabId}`);
    if (activeSec) {
        activeSec.classList.add("active");
    }

    if (tabId === "dashboard") {
        loadDashboard();
    } else if (tabId === "reports") {
        loadReports();
    } else if (tabId === "balance") {
        loadBalanceSheet();
    } else if (tabId === "heads") {
        loadHeadsManagement();
    }
}

function setPromptQuickDates(rangeType) {
    const fromInput = document.getElementById("prompt-from-date");
    const toInput = document.getElementById("prompt-to-date");
    const now = new Date("2026-06-24");
    
    if (rangeType === 'this_month') {
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const monthStr = month < 10 ? `0${month}` : `${month}`;
        fromInput.value = `${year}-${monthStr}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        toInput.value = `${year}-${monthStr}-${lastDay}`;
    } else if (rangeType === 'last_month') {
        const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const monthStr = month < 10 ? `0${month}` : `${month}`;
        fromInput.value = `${year}-${monthStr}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        toInput.value = `${year}-${monthStr}-${lastDay}`;
    } else if (rangeType === 'fy_2026') {
        fromInput.value = "2026-04-01";
        toInput.value = "2027-03-31";
    }
}

// --- Printable Cash & Bank Ledger Helper ---
function printLedger(ledgerType) {
    const filterHead = document.getElementById("filter-head");
    if (filterHead) {
        filterHead.value = ledgerType;
        state.filterHeadId = ledgerType;
    }
    loadReports();
    setTimeout(() => {
        window.print();
    }, 300);
}

// --- General Excel Upload & Column Mapper Handler Functions ---
let parsedExcelData = null;
let excelHeaders = [];

function handleGeneralExcelUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const data = evt.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            if (rawRows.length < 2) {
                alert("Excel file is empty or contains insufficient data.");
                return;
            }
            
            let headerRowIndex = 0;
            while (headerRowIndex < rawRows.length && (!rawRows[headerRowIndex] || rawRows[headerRowIndex].length === 0)) {
                headerRowIndex++;
            }
            
            if (headerRowIndex >= rawRows.length) {
                alert("No headers found in Excel file.");
                return;
            }
            
            excelHeaders = rawRows[headerRowIndex].map(h => String(h || "").trim()).filter(h => h !== "");
            parsedExcelData = XLSX.utils.sheet_to_json(worksheet);
            
            const mappings = autoMapColumns(excelHeaders);
            
            if (mappings.date && mappings.category && mappings.amount) {
                if (confirm(`Auto-detected headers:\nDate: ${mappings.date}\nCategory: ${mappings.category}\nAmount: ${mappings.amount}\nDo you want to import this data?`)) {
                    executeExcelImport(mappings);
                } else {
                    showExcelMapper(excelHeaders, mappings);
                }
            } else {
                showExcelMapper(excelHeaders, mappings);
            }
            
        } catch (err) {
            console.error("General Excel parsing failed", err);
            alert("Failed to parse Excel file: " + err.message);
        }
    };
    reader.readAsBinaryString(file);
}

function autoMapColumns(headers) {
    const mappings = { date: "", type: "", category: "", amount: "", mode: "", ref: "", desc: "" };
    
    headers.forEach(h => {
        const hl = h.toLowerCase();
        if (!mappings.date && (hl === "date" || hl.includes("તારીખ") || hl === "depo date" || hl === "depodate" || hl === "date (dd-mm-yyyy)")) {
            mappings.date = h;
        } else if (!mappings.type && (hl === "type" || hl.includes("પ્રકાર") || hl === "transaction type" || hl.includes("income") || hl.includes("expense"))) {
            mappings.type = h;
        } else if (!mappings.category && (hl === "category" || hl === "head" || hl.includes("ખાતાનો હેડ") || hl.includes("હેડ") || hl.includes("કેટેગરી") || hl === "head id" || hl === "particulars" || hl === "ખાતું" || hl === "account head")) {
            mappings.category = h;
        } else if (!mappings.amount && (hl === "amount" || hl.includes("રકમ") || hl === "value" || hl === "total")) {
            mappings.amount = h;
        } else if (!mappings.mode && (hl === "mode" || hl.includes("payment mode") || hl.includes("પદ્ધતિ") || hl.includes("ચુકવણી") || hl === "bankl select" || hl === "cash/bank")) {
            mappings.mode = h;
        } else if (!mappings.ref && (hl === "reference" || hl === "ref" || hl.includes("cheque") || hl.includes("chq") || hl.includes("ચેક") || hl.includes("રેફરન્સ"))) {
            mappings.ref = h;
        } else if (!mappings.desc && (hl === "description" || hl === "details" || hl.includes("વિગત") || hl.includes("નોંધ") || hl === "remarks" || hl === "particulars")) {
            mappings.desc = h;
        }
    });
    return mappings;
}

function showExcelMapper(headers, currentMappings) {
    const container = document.getElementById("mapper-selects-container");
    container.innerHTML = "";
    
    const fields = [
        { id: "map-date", label: "તારીખ કોલમ (Date Column) *", key: "date", required: true },
        { id: "map-category", label: "ખાતાનો હેડ/કેટેગરી કોલમ (Category Head) *", key: "category", required: true },
        { id: "map-amount", label: "રકમ કોલમ (Amount Column) *", key: "amount", required: true },
        { id: "map-type", label: "પ્રકાર કોલમ (Type - Income/Expense) (Optional)", key: "type", required: false },
        { id: "map-mode", label: "ચુકવણી પદ્ધતિ કોલમ (Payment Mode) (Optional)", key: "mode", required: false },
        { id: "map-ref", label: "ચેક નં / રેફરન્સ કોલમ (Optional)", key: "ref", required: false },
        { id: "map-desc", label: "વિગત/વર્ણન કોલમ (Description) (Optional)", key: "desc", required: false }
    ];
    
    fields.forEach(f => {
        const group = document.createElement("div");
        group.className = "form-group";
        
        const label = document.createElement("label");
        label.innerText = f.label;
        group.appendChild(label);
        
        const select = document.createElement("select");
        select.id = f.id;
        select.className = "form-control";
        if (f.required) select.required = true;
        
        const emptyOpt = document.createElement("option");
        emptyOpt.value = "";
        emptyOpt.innerText = "-- Select Column --";
        select.appendChild(emptyOpt);
        
        headers.forEach(h => {
            const opt = document.createElement("option");
            opt.value = h;
            opt.innerText = h;
            if (currentMappings[f.key] === h) {
                opt.selected = true;
            }
            select.appendChild(opt);
        });
        
        group.appendChild(select);
        container.appendChild(group);
    });
    
    document.getElementById("excel-mapper-modal").style.display = "flex";
}

function executeExcelImport(mappings) {
    if (!parsedExcelData || parsedExcelData.length === 0) return;
    
    let importedCount = 0;
    const newTransactions = [];
    const incomeHeads = db.getIncomeHeads();
    const expenseHeads = db.getExpenseHeads();
    
    parsedExcelData.forEach((row, idx) => {
        const rawDate = row[mappings.date];
        const rawCategory = String(row[mappings.category] || "").trim();
        const rawAmount = parseFloat(String(row[mappings.amount] || "0").replace(/,/g, ''));
        
        if (!rawDate || !rawCategory || isNaN(rawAmount) || rawAmount === 0) {
            return;
        }
        
        const txDate = parseExcelDate(rawDate);
        
        let type = "expense";
        if (mappings.type && row[mappings.type]) {
            const typeVal = String(row[mappings.type]).toLowerCase();
            if (typeVal.includes("income") || typeVal.includes("આવક") || typeVal.includes("inflow") || typeVal.includes("deposit")) {
                type = "income";
            }
        } else {
            const catLower = rawCategory.toLowerCase();
            if (catLower.includes("maintenance") || catLower.includes("interest") || catLower.includes("વ્યાજ") || catLower.includes("આવક") || catLower.includes("income")) {
                type = "income";
            }
        }
        
        let headId = "";
        const allHeads = type === "income" ? incomeHeads : expenseHeads;
        const matchingHead = allHeads.find(h => 
            h.name_en.toLowerCase() === rawCategory.toLowerCase() || 
            h.name_gu.toLowerCase() === rawCategory.toLowerCase()
        );
        
        if (matchingHead) {
            headId = matchingHead.id;
        } else {
            const newId = (type === "income" ? "inc_" : "exp_") + Date.now() + "_" + Math.random().toString(36).substring(2, 5);
            const newHead = {
                id: newId,
                name_en: rawCategory,
                name_gu: rawCategory,
                color: type === "income" ? "#10b981" : "#ec407a",
                icon: "fa-tag"
            };
            if (type === "income") {
                db.addIncomeHead(newHead);
                incomeHeads.push(newHead);
            } else {
                db.addExpenseHead(newHead);
                expenseHeads.push(newHead);
            }
            headId = newId;
        }
        
        let paymentMode = "Bank: CBI";
        if (mappings.mode && row[mappings.mode]) {
            const modeText = String(row[mappings.mode]).toLowerCase();
            if (modeText.includes("cash") || modeText.includes("રોકડ") || modeText.includes("કેશ")) {
                paymentMode = "Cash";
            } else if (modeText.includes("jcom") || modeText.includes("junagadh") || modeText.includes("જુનાગઢ")) {
                paymentMode = "Bank: JCOM";
            } else if (modeText.includes("fd") || modeText.includes("investment")) {
                paymentMode = "FD";
            }
        }
        
        const reference = mappings.ref && row[mappings.ref] ? String(row[mappings.ref]).trim() : "";
        const description = mappings.desc && row[mappings.desc] ? String(row[mappings.desc]).trim() : "";
        
        const tx = {
            id: "tx_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now() + "_" + idx,
            type: type,
            headId: headId,
            amount: rawAmount,
            date: txDate,
            paymentMode: paymentMode,
            reference: reference,
            description: description,
            billUrl: null
        };
        
        newTransactions.push(tx);
        importedCount++;
    });
    
    if (newTransactions.length > 0) {
        const currentTxs = db.getTransactions();
        db.saveTransactions(currentTxs.concat(newTransactions));
        alert(`Successfully imported ${importedCount} transactions and updated account heads!`);
        
        loadDashboard();
        if (state.activeTab === "reports") {
            loadReports();
        } else if (state.activeTab === "balance") {
            loadBalanceSheet();
        }
        switchTabDirectly("reports");
    } else {
        alert("No valid transaction rows found in Excel sheet.");
    }
}
