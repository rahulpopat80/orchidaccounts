// js/sync.js

class CloudSyncManager {
    constructor() {
        this.firebaseApp = null;
        this.firestore = null;
        this.active = false;
        this.config = null;
        this.listeners = [];
        this.isOnline = navigator.onLine;

        // Prevent infinite sync loops by checking if data is updating from server
        this.isSyncingFromServer = false;

        this.init();
    }

    init() {
        // Default built-in Firebase config provided by the user
        const DEFAULT_CONFIG = {
            apiKey: "AIzaSyDF826FrHNrbiUfk55L0QLUl2NYZmFQJcs",
            authDomain: "orchidaccountings.firebaseapp.com",
            projectId: "orchidaccountings",
            appId: "1:841901805257:web:9409ede12780fec37c0718"
        };

        // Load configuration from localStorage
        const savedConfig = localStorage.getItem("orchid_firebase_config");
        if (savedConfig) {
            try {
                this.config = JSON.parse(savedConfig);
            } catch (e) {
                console.error("Failed to parse saved Firebase config", e);
            }
        }
        
        // Use default config if none is stored
        if (!this.config) {
            this.config = DEFAULT_CONFIG;
        }

        if (this.config) {
            this.initializeFirebase(this.config);
        }

        // Setup event listeners for online/offline status
        window.addEventListener("online", () => this.updateOnlineStatus(true));
        window.addEventListener("offline", () => this.updateOnlineStatus(false));

        // Bind UI events when DOM is loaded
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => this.bindUIEvents());
        } else {
            this.bindUIEvents();
        }
    }

    updateOnlineStatus(online) {
        this.isOnline = online;
        this.updateBadge();
        if (online && this.active) {
            if (this.firestore) {
                this.firestore.enableNetwork().catch(err => console.error("Error enabling firestore network", err));
            }
        }
    }

    initializeFirebase(config) {
        try {
            // Delete existing app if any
            if (firebase.apps.length > 0) {
                if (this.config && this.config.projectId === config.projectId && this.firebaseApp) {
                    this.onConnectionActive();
                    return true;
                }
                firebase.apps.forEach(app => app.delete());
            }

            const firebaseConfig = {
                apiKey: config.apiKey,
                authDomain: config.authDomain,
                projectId: config.projectId,
                appId: config.appId
            };

            this.firebaseApp = firebase.initializeApp(firebaseConfig);
            
            // Enable Firestore Offline Persistence
            this.firestore = firebase.firestore();
            this.firestore.enablePersistence({ synchronizeTabs: true }).catch(err => {
                if (err.code === 'failed-precondition') {
                    console.warn("Firestore offline persistence failed: Multiple tabs open.");
                } else if (err.code === 'unimplemented') {
                    console.warn("Firestore offline persistence not supported in this browser.");
                }
            });

            this.config = config;
            localStorage.setItem("orchid_firebase_config", JSON.stringify(config));

            this.onConnectionActive();
            return true;
        } catch (e) {
            console.error("Firebase Initialization Failed", e);
            showToast("Failed to initialize Firebase! Check config.", true);
            this.active = false;
            this.updateBadge();
            return false;
        }
    }

    onConnectionActive() {
        this.active = true;
        this.updateBadge();
        this.showSetupStep("active");
        
        const projectDisplay = document.getElementById("cloud-active-project-id");
        if (projectDisplay) {
            projectDisplay.innerText = this.config.projectId;
        }

        // Check if remote database is empty. If yes, upload local database to remote.
        this.checkAndInitializeRemoteData();

        // Setup real-time Firestore listeners
        this.setupRealtimeListeners();
    }

    onDisconnect() {
        this.active = false;
        this.config = null;
        localStorage.removeItem("orchid_firebase_config");
        this.detachListeners();
        this.updateBadge();
        this.showSetupStep("step-1");
        showToast("Disconnected from cloud sync. Reverted to local mode.");
    }

    setupRealtimeListeners() {
        this.detachListeners();

        if (!this.active || !this.firestore) return;
        
        // 1. Transactions Listener
        const txListener = this.firestore.collection("transactions")
            .onSnapshot(snapshot => {
                this.handleRemoteTransactionsUpdate(snapshot);
            }, err => {
                console.error("Firestore transactions listener error", err);
                this.updateBadge(true);
            });
        this.listeners.push(txListener);

        // 2. Opening Balances Listener
        const opListener = this.firestore.doc("opening_balances/data")
            .onSnapshot(doc => {
                if (doc.exists) {
                    this.handleRemoteOpeningBalancesUpdate(doc.data());
                }
            }, err => {
                console.error("Firestore opening balances listener error", err);
            });
        this.listeners.push(opListener);

        // 3. Income Heads Listener
        const incListener = this.firestore.collection("income_heads")
            .onSnapshot(snapshot => {
                this.handleRemoteCategoriesUpdate("income", snapshot);
            }, err => {
                console.error("Firestore income heads listener error", err);
            });
        this.listeners.push(incListener);

        // 4. Expense Heads Listener
        const expListener = this.firestore.collection("expense_heads")
            .onSnapshot(snapshot => {
                this.handleRemoteCategoriesUpdate("expense", snapshot);
            }, err => {
                console.error("Firestore expense heads listener error", err);
            });
        this.listeners.push(expListener);
    }

    detachListeners() {
        this.listeners.forEach(unsubscribe => unsubscribe());
        this.listeners = [];
    }

    // Handlers for Firestore data updates
    handleRemoteTransactionsUpdate(snapshot) {
        if (this.isSyncingFromServer) return;

        const remoteTxs = [];
        snapshot.forEach(doc => {
            remoteTxs.push({ id: doc.id, ...doc.data() });
        });

        // Determine if local transactions database differs
        const localTxs = db.getTransactions();
        
        // Simple string comparison for equality
        const localStr = JSON.stringify(localTxs.sort((a,b) => a.id.localeCompare(b.id)));
        const remoteStr = JSON.stringify(remoteTxs.sort((a,b) => a.id.localeCompare(b.id)));

        if (localStr !== remoteStr) {
            console.log("Sync: Remote transactions updated, refreshing local state...");
            this.isSyncingFromServer = true;
            db.saveTransactions(remoteTxs);
            this.isSyncingFromServer = false;
            this.refreshActiveUI();
        }

        // Update badge based on pending writes
        this.updateBadge(false, snapshot.metadata.hasPendingWrites);
    }

    handleRemoteOpeningBalancesUpdate(remoteBalances) {
        if (this.isSyncingFromServer) return;

        const localBalances = db.getOpeningBalances();
        const localStr = JSON.stringify(localBalances);
        const remoteStr = JSON.stringify(remoteBalances);

        if (localStr !== remoteStr) {
            console.log("Sync: Remote opening balances updated, refreshing local state...");
            this.isSyncingFromServer = true;
            db.saveOpeningBalances(remoteBalances);
            this.isSyncingFromServer = false;
            this.refreshActiveUI();
        }
    }

    handleRemoteCategoriesUpdate(type, snapshot) {
        if (this.isSyncingFromServer) return;

        const remoteHeads = [];
        snapshot.forEach(doc => {
            remoteHeads.push({ id: doc.id, ...doc.data() });
        });

        const localHeads = type === "income" ? db.getIncomeHeads() : db.getExpenseHeads();
        
        const localStr = JSON.stringify(localHeads.sort((a,b) => a.id.localeCompare(b.id)));
        const remoteStr = JSON.stringify(remoteHeads.sort((a,b) => a.id.localeCompare(b.id)));

        if (localStr !== remoteStr) {
            console.log(`Sync: Remote ${type} heads updated, refreshing local state...`);
            this.isSyncingFromServer = true;
            if (type === "income") {
                db.saveIncomeHeads(remoteHeads);
            } else {
                db.saveExpenseHeads(remoteHeads);
            }
            this.isSyncingFromServer = false;
            
            // Re-render categories layout & dropdowns
            renderHeadsDropdowns();
            if (typeof loadHeadsManagement === "function" && state.activeTab === "heads") {
                loadHeadsManagement();
            }
            this.refreshActiveUI();
        }
    }

    // Refresh active tab views
    refreshActiveUI() {
        if (typeof switchTab === "function") {
            switchTab(state.activeTab);
        }
    }

    // Write-through local modifications to Firestore
    uploadTransaction(tx) {
        if (!this.active || !this.firestore) return;
        const txCopy = { ...tx };
        delete txCopy.id;

        this.firestore.doc(`transactions/${tx.id}`)
            .set(txCopy)
            .catch(err => console.error("Sync Error uploading transaction", err));
    }

    deleteTransaction(txId) {
        if (!this.active || !this.firestore) return;
        this.firestore.doc(`transactions/${txId}`)
            .delete()
            .catch(err => console.error("Sync Error deleting transaction", err));
    }

    uploadOpeningBalances(balances) {
        if (!this.active || !this.firestore) return;
        this.firestore.doc("opening_balances/data")
            .set(balances)
            .catch(err => console.error("Sync Error uploading opening balances", err));
    }

    uploadCategory(type, head) {
        if (!this.active || !this.firestore) return;
        const headCopy = { ...head };
        delete headCopy.id;

        const path = type === "income" ? "income_heads" : "expense_heads";
        this.firestore.doc(`${path}/${head.id}`)
            .set(headCopy)
            .catch(err => console.error(`Sync Error uploading category ${type}`, err));
    }

    deleteCategory(type, headId) {
        if (!this.active || !this.firestore) return;
        const path = type === "income" ? "income_heads" : "expense_heads";
        this.firestore.doc(`${path}/${headId}`)
            .delete()
            .catch(err => console.error(`Sync Error deleting category ${type}`, err));
    }

    async syncFullTransactions(transactions) {
        if (!this.active || !this.firestore) return;
        
        try {
            const snapshot = await this.firestore.collection("transactions").get();
            const remoteDocIds = [];
            snapshot.forEach(doc => {
                remoteDocIds.push(doc.id);
            });

            const localIds = new Set(transactions.map(t => t.id));
            const batchLimit = 20;
            let batch = this.firestore.batch();
            let operations = 0;

            for (const id of remoteDocIds) {
                if (!localIds.has(id)) {
                    batch.delete(this.firestore.doc(`transactions/${id}`));
                    operations++;
                    if (operations >= batchLimit) {
                        await batch.commit();
                        batch = this.firestore.batch();
                        operations = 0;
                    }
                }
            }

            for (const tx of transactions) {
                const txCopy = { ...tx };
                delete txCopy.id;
                
                batch.set(this.firestore.doc(`transactions/${tx.id}`), txCopy);
                operations++;
                if (operations >= batchLimit) {
                    await batch.commit();
                    batch = this.firestore.batch();
                    operations = 0;
                }
            }

            if (operations > 0) {
                await batch.commit();
            }

            console.log("Sync: Full transactions synchronization complete.");
        } catch (e) {
            console.error("Sync: Error during transactions syncFull", e);
        }
    }

    async syncFullCategories(type, heads) {
        if (!this.active || !this.firestore) return;
        
        try {
            const path = type === "income" ? "income_heads" : "expense_heads";
            const snapshot = await this.firestore.collection(path).get();
            const remoteDocIds = [];
            snapshot.forEach(doc => {
                remoteDocIds.push(doc.id);
            });

            const localIds = new Set(heads.map(h => h.id));
            let batch = this.firestore.batch();
            let operations = 0;
            const batchLimit = 20;

            for (const id of remoteDocIds) {
                if (!localIds.has(id)) {
                    batch.delete(this.firestore.doc(`${path}/${id}`));
                    operations++;
                    if (operations >= batchLimit) {
                        await batch.commit();
                        batch = this.firestore.batch();
                        operations = 0;
                    }
                }
            }

            for (const head of heads) {
                const headCopy = { ...head };
                delete headCopy.id;
                
                batch.set(this.firestore.doc(`${path}/${head.id}`), headCopy);
                operations++;
                if (operations >= batchLimit) {
                    await batch.commit();
                    batch = this.firestore.batch();
                    operations = 0;
                }
            }

            if (operations > 0) {
                await batch.commit();
            }

            console.log(`Sync: Full ${type} categories synchronization complete.`);
        } catch (e) {
            console.error(`Sync: Error during category syncFull for ${type}`, e);
        }
    }

    // Upload local storage database to cloud if remote database is brand new (empty)
    async checkAndInitializeRemoteData() {
        if (!this.active || !this.firestore) return;
        
        try {
            const opDoc = await this.firestore.doc("opening_balances/data").get();
            
            if (!opDoc.exists) {
                console.log("Sync: Remote database is empty, uploading current local data...");
                
                // 1. Upload Opening Balances
                const localBalances = db.getOpeningBalances();
                await this.firestore.doc("opening_balances/data").set(localBalances);

                // 2. Upload Income Categories
                const localIncome = db.getIncomeHeads();
                for (const head of localIncome) {
                    const copy = { ...head };
                    delete copy.id;
                    await this.firestore.doc(`income_heads/${head.id}`).set(copy);
                }

                // 3. Upload Expense Categories
                const localExpense = db.getExpenseHeads();
                for (const head of localExpense) {
                    const copy = { ...head };
                    delete copy.id;
                    await this.firestore.doc(`expense_heads/${head.id}`).set(copy);
                }

                // 4. Upload Transactions
                const localTxs = db.getTransactions();
                const batchLimit = 20;
                let currentBatch = this.firestore.batch();
                let operations = 0;

                for (let i = 0; i < localTxs.length; i++) {
                    const tx = localTxs[i];
                    const copy = { ...tx };
                    delete copy.id;
                    
                    const docRef = this.firestore.doc(`transactions/${tx.id}`);
                    currentBatch.set(docRef, copy);
                    operations++;

                    if (operations >= batchLimit) {
                        await currentBatch.commit();
                        currentBatch = this.firestore.batch();
                        operations = 0;
                    }
                }
                if (operations > 0) {
                    await currentBatch.commit();
                }

                console.log("Sync: Local database uploaded successfully to Cloud.");
                showToast("Local data successfully backed up to Cloud!");
            }
        } catch (e) {
            console.error("Error during remote database initialization", e);
        }
    }

    // UI Updates
    updateBadge(error = false, pendingWrites = false) {
        const badges = [
            document.getElementById("cloud-sync-badge"),
            document.getElementById("header-sync-indicator")
        ];

        badges.forEach(badge => {
            if (!badge) return;

            const dot = badge.querySelector(".dot");
            const text = badge.querySelector(".text");

            if (error) {
                badge.className = "sync-badge error";
                dot.style.background = "#ef4444";
                text.innerText = "Sync Error / Blocked";
            } else if (!this.config) {
                badge.className = "sync-badge offline";
                dot.style.background = "#94a3b8";
                text.innerText = "Offline / Local Mode";
            } else if (!this.active) {
                badge.className = "sync-badge offline";
                dot.style.background = "#94a3b8";
                text.innerText = "Offline Mode";
            } else if (!this.isOnline) {
                badge.className = "sync-badge offline";
                dot.style.background = "#f59e0b";
                text.innerText = "Offline (Cached)";
            } else if (pendingWrites) {
                badge.className = "sync-badge syncing";
                dot.style.background = "#f59e0b";
                text.innerText = "Syncing Data...";
            } else {
                badge.className = "sync-badge online";
                dot.style.background = "#10b981";
                text.innerText = "Connected & Live";
            }
        });
    }

    showSetupStep(stepId) {
        const step1 = document.getElementById("cloud-sync-setup-step-1");
        const stepActive = document.getElementById("cloud-sync-setup-step-active");

        if (step1) step1.style.display = stepId === "step-1" ? "block" : "none";
        if (stepActive) stepActive.style.display = stepId === "active" ? "block" : "none";
    }

    bindUIEvents() {
        // Elements
        const openSetupBtn = document.getElementById("btn-open-sync-setup");
        const headerIndicator = document.getElementById("header-sync-indicator");
        const modal = document.getElementById("cloud-sync-modal");
        const closeBtn = document.getElementById("cloud-sync-modal-close");
        const closeBtnActive = document.getElementById("btn-cloud-close");

        const configForm = document.getElementById("cloud-config-form");
        const disconnectBtn = document.getElementById("btn-cloud-disconnect");

        // Open Modal
        const showModal = () => {
            if (modal) {
                modal.style.display = "flex";
                if (this.active) {
                    this.showSetupStep("active");
                } else {
                    this.showSetupStep("step-1");
                }
            }
        };

        if (openSetupBtn) openSetupBtn.addEventListener("click", showModal);
        if (headerIndicator) headerIndicator.addEventListener("click", showModal);

        // Close Modal
        const hideModal = () => { if (modal) modal.style.display = "none"; };
        if (closeBtn) closeBtn.addEventListener("click", hideModal);
        if (closeBtnActive) closeBtnActive.addEventListener("click", hideModal);
        if (modal) {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) hideModal();
            });
        }

        // Save Config & Connect
        if (configForm) {
            configForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const apiKey = document.getElementById("cloud-apiKey").value.trim();
                const projectId = document.getElementById("cloud-projectId").value.trim();
                const cloudAuthDomain = document.getElementById("cloud-authDomain").value.trim();
                const appId = document.getElementById("cloud-appId").value.trim();

                const newConfig = { apiKey, projectId, authDomain: cloudAuthDomain, appId };
                
                const success = this.initializeFirebase(newConfig);
                if (success) {
                    showToast("Connected to Firebase Cloud!");
                    this.showSetupStep("active");
                }
            });
        }

        // Disconnect
        if (disconnectBtn) {
            disconnectBtn.addEventListener("click", () => {
                this.onDisconnect();
            });
        }

        // Pre-fill config if saved
        if (this.config) {
            document.getElementById("cloud-apiKey").value = this.config.apiKey || "";
            document.getElementById("cloud-projectId").value = this.config.projectId || "";
            document.getElementById("cloud-authDomain").value = this.config.authDomain || "";
            document.getElementById("cloud-appId").value = this.config.appId || "";
        }
        
        this.updateBadge();
    }
}

// Instantiate Sync Manager
const syncManager = new CloudSyncManager();
