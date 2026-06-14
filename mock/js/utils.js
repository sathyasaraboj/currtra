// --- CUSTOM IN-APP POPUP OVERRIDE ---
(function() {
    const style = document.createElement('style');
    style.innerHTML = `
        .custom-popup-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(10, 11, 13, 0.85);
            backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
            z-index: 10000;
            display: flex; align-items: center; justify-content: center;
            opacity: 0; pointer-events: none;
            transition: opacity 0.4s ease;
        }
        .custom-popup-overlay.show { opacity: 1; pointer-events: auto; }
        
        .custom-popup-card {
            background: #12141C;
            border: 1px solid rgba(197, 168, 128, 0.25);
            border-radius: 20px;
            padding: 24px;
            width: 85%; max-width: 320px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.05);
            transform: scale(0.8) translateY(20px);
            opacity: 0;
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .custom-popup-overlay.show .custom-popup-card {
            transform: scale(1) translateY(0);
            opacity: 1;
        }
        
        .custom-popup-icon {
            font-size: 36px; color: var(--primary); margin-bottom: 12px;
        }
        .custom-popup-message {
            color: var(--text-white); font-size: 14px; margin-bottom: 24px;
            white-space: pre-wrap; line-height: 1.5;
        }
        .custom-popup-btn {
            background: var(--primary); color: #000; font-weight: 800;
            border: none; padding: 12px 24px; border-radius: 12px;
            width: 100%; cursor: pointer;
            transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .custom-popup-btn:active { transform: scale(0.95); }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.className = 'custom-popup-overlay';
    overlay.innerHTML = `
        <div class="custom-popup-card">
            <div class="material-icons-round custom-popup-icon">info</div>
            <div class="custom-popup-message" id="custom-popup-msg"></div>
            <button class="custom-popup-btn" onclick="closeCustomPopup()">Okay</button>
        </div>
    `;
    document.body.appendChild(overlay);

    window.alert = function(msg) {
        document.getElementById('custom-popup-msg').innerText = msg;
        
        const iconEl = document.querySelector('.custom-popup-icon');
        if (msg.includes('✅') || msg.includes('successfully') || msg.includes('Approved')) {
            iconEl.innerText = 'check_circle';
            iconEl.style.color = 'var(--saving)'; // green
        } else if (msg.includes('Insufficient') || msg.includes('must') || msg.includes('Cannot') || msg.includes('Please')) {
            iconEl.innerText = 'error_outline';
            iconEl.style.color = 'var(--expense)'; // red
        } else {
            iconEl.innerText = 'info';
            iconEl.style.color = 'var(--primary)'; // gold
        }

        overlay.classList.add('show');
        if (window.navigator.vibrate) window.navigator.vibrate(50);
    };

    window.closeCustomPopup = function() {
        overlay.classList.remove('show');
    };
})();
// ------------------------------------

        // Render balance math
        function calculateBalances() {
            let net = state.wallets.reduce((acc, curr) => acc + curr.currentBalance, 0);
            
            let incSum = 0;
            let savSum = 0;
            let expSum = 0;

            state.transactions.forEach(t => {
                if (t.type === "INCOME") incSum += t.amount;
                if (t.type === "SAVING") savSum += t.amount;
                if (t.type === "EXPENSE") expSum += t.amount;
            });

            // Update UI
            document.getElementById("home-net-balance").innerText = "₹" + net.toLocaleString('en-IN', { minimumFractionDigits: 2 });
            document.getElementById("home-income-sum").innerText = "₹" + incSum.toLocaleString('en-IN');
            document.getElementById("home-saving-sum").innerText = "₹" + savSum.toLocaleString('en-IN');
            document.getElementById("home-expense-sum").innerText = "₹" + expSum.toLocaleString('en-IN');
        }

        // Helper to construct transaction row visual DOM
        function createTxRow(tx) {
            const row = document.createElement("div");
            row.className = "tx-row";

            let iconChar = tx.categoryName ? tx.categoryName.charAt(0) : "T";
            let color = "var(--primary)";
            if (tx.type === "INCOME") color = "var(--income)";
            if (tx.type === "EXPENSE") color = "var(--expense)";
            if (tx.type === "SAVING") color = "var(--saving)";

            let tagHtml = "";
            if (tx.tags && tx.tags.length > 0) {
                tagHtml = tx.tags.map(t => `<span class="tx-tag-pill">${t}</span>`).join('');
            } else if (tx.tag) {
                tagHtml = `<span class="tx-tag-pill">${tx.tag}</span>`;
            }

            row.innerHTML = `
                <div class="left">
                    <div class="tx-icon-box" style="background-color: ${color}15; color: ${color};">
                        <strong style="font-size: 15px;">${iconChar}</strong>
                    </div>
                    <div class="tx-info">
                        <h4 class="title">${tx.description}</h4>
                        <div class="details">
                            <span>${tx.categoryName || 'Transfer'}</span>
                            <span class="payment-tag">${tx.paymentMode}</span>
                            ${tagHtml}
                        </div>
                    </div>
                </div>
                <div class="amt" style="color: ${color};">
                    ${tx.type === "INCOME" ? "+" : tx.type === "EXPENSE" || tx.type === "SAVING" ? "-" : ""}₹${tx.amount.toLocaleString('en-IN')}
                </div>
            `;
            return row;
        }

        // Dynamic navigation tabs
        function switchPhoneTab(tabName) {
            document.querySelectorAll(".screen-tab").forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".tab-bar .tab-item").forEach(i => i.classList.remove("active"));

            document.getElementById("tab-" + tabName).classList.add("active");
            
            let items = document.querySelectorAll(".tab-bar .tab-item");
            if (tabName === "home") items[0].classList.add("active");
            if (tabName === "transactions") items[1].classList.add("active");
            if (tabName === "analytics") items[2].classList.add("active");
            if (tabName === "settings") items[3].classList.add("active");

            // Close sub-view overlays
            document.querySelectorAll(".sub-view-overlay").forEach(o => o.classList.remove("show"));

            if (tabName === "home") {
                calculateBalances();
                renderHomeTransactions();
                renderHomeDebts();
                if (typeof renderHomeScheduledList === "function") renderHomeScheduledList();
            }
            if (tabName === "transactions") {
                renderHistoryTransactions();
            }
            if (tabName === "add") {
                renderFormWallets(); // Seed Bank Account chips
                renderFormCategories(); // Seed classification Categories
                syncFormPaymentModes(); // Seed relational modes
                if (typeof renderFormTags === "function") renderFormTags(); // Seed preset #tags
            }
            if (tabName === "analytics") {
                switchAnalyticsSubTab('OVERVIEW');
            }
        }

        // String helper polyfill
        String.prototype.replaceFirstChar = function(transform) {
            return transform(this.charAt(0)) + this.slice(1);
        };

        // Phone clock mockup
        setInterval(() => {
            const d = new Date();
            const hrs = String(d.getHours()).padStart(2, '0');
            const mins = String(d.getMinutes()).padStart(2, '0');
            document.getElementById("time-display").innerText = `${hrs}:${mins}`;
        }, 1000);

        window.onload = function() {
            calculateBalances();
            renderHomeTransactions();
            renderHomeDebts();
            if (typeof renderHomeScheduledList === "function") renderHomeScheduledList();
        }

        // --- GLOBAL ADVANCED FILTER CHECKER ---
        state.activeFilters = {
            types: [],
            wallets: [],
            categories: [],
            tags: [],
            minAmt: null,
            maxAmt: null,
            startDate: "",
            endDate: ""
        };

        function applyAdvancedFilters(tx) {
            const f = state.activeFilters;
            if (!f) return true;

            // 1. Filter by Type
            if (f.types && f.types.length > 0) {
                if (!f.types.includes(tx.type)) return false;
            }

            // 2. Filter by Wallet
            if (f.wallets && f.wallets.length > 0) {
                if (!f.wallets.includes(tx.walletId)) return false;
            }

            // 3. Filter by Category
            if (f.categories && f.categories.length > 0) {
                if (!f.categories.includes(tx.categoryName)) return false;
            }

            // 4. Filter by Tag
            if (f.tags && f.tags.length > 0) {
                if (tx.tags && tx.tags.length > 0) {
                    if (!tx.tags.some(t => f.tags.includes(t))) return false;
                } else if (tx.tag) {
                    if (!f.tags.includes(tx.tag)) return false;
                } else {
                    return false;
                }
            }

            // 5. Filter by Min Amount
            if (f.minAmt !== null && !isNaN(f.minAmt)) {
                if (tx.amount < f.minAmt) return false;
            }

            // 6. Filter by Max Amount
            if (f.maxAmt !== null && !isNaN(f.maxAmt)) {
                if (tx.amount > f.maxAmt) return false;
            }

            // 7. Filter by Date Range
            if (f.startDate) {
                const start = new Date(f.startDate);
                start.setHours(0,0,0,0);
                if (tx.timestamp < start.getTime()) return false;
            }
            if (f.endDate) {
                const end = new Date(f.endDate);
                end.setHours(23,59,59,999);
                if (tx.timestamp > end.getTime()) return false;
            }

            return true;
        }

        // Open Advanced Filter Panel
        function openAdvancedFilter() {
            openOverlayView("advanced-filter");
            renderAdvancedFilterTypeChips();
            renderAdvancedFilterWalletChips();
            renderAdvancedFilterCategoryChips();
            renderAdvancedFilterTagChips();
            
            // Populate form bounds
            document.getElementById("filter-min-amount").value = state.activeFilters.minAmt || "";
            document.getElementById("filter-max-amount").value = state.activeFilters.maxAmt || "";
            document.getElementById("filter-start-date").value = state.activeFilters.startDate || "";
            document.getElementById("filter-end-date").value = state.activeFilters.endDate || "";
        }

        // Toggle selected value in array filters
        function toggleFilterValue(key, value) {
            const list = state.activeFilters[key + "s"];
            const idx = list.indexOf(value);
            if (idx > -1) {
                list.splice(idx, 1);
            } else {
                list.push(value);
            }
            
            if (key === 'type') renderAdvancedFilterTypeChips();
            if (key === 'wallet') renderAdvancedFilterWalletChips();
            if (key === 'category') renderAdvancedFilterCategoryChips();
            if (key === 'tag') renderAdvancedFilterTagChips();
        }

        function renderAdvancedFilterTypeChips() {
            const container = document.getElementById("filter-type-chips");
            if (!container) return;
            const types = ["EXPENSE", "INCOME", "SAVING", "TRANSFER"];
            container.innerHTML = "";
            types.forEach(t => {
                const isActive = state.activeFilters.types.includes(t);
                const chip = document.createElement("div");
                chip.className = `chip-option ${isActive ? 'active' : ''}`;
                chip.innerText = t.charAt(0) + t.slice(1).toLowerCase();
                chip.onclick = () => toggleFilterValue('type', t);
                container.appendChild(chip);
            });
        }

        function renderAdvancedFilterWalletChips() {
            const container = document.getElementById("filter-wallet-chips");
            if (!container) return;
            container.innerHTML = "";
            state.wallets.forEach(w => {
                const isActive = state.activeFilters.wallets.includes(w.id);
                const chip = document.createElement("div");
                chip.className = `chip-option ${isActive ? 'active' : ''}`;
                chip.innerText = w.name;
                chip.onclick = () => toggleFilterValue('wallet', w.id);
                container.appendChild(chip);
            });
        }

        function renderAdvancedFilterCategoryChips() {
            const container = document.getElementById("filter-category-chips");
            if (!container) return;
            container.innerHTML = "";
            
            // Gather categories from all flows
            const allCats = [];
            Object.keys(categories).forEach(k => {
                categories[k].forEach(c => {
                    if (!allCats.includes(c.name)) {
                        allCats.push(c.name);
                    }
                });
            });

            allCats.forEach(catName => {
                const isActive = state.activeFilters.categories.includes(catName);
                const chip = document.createElement("div");
                chip.className = `chip-option ${isActive ? 'active' : ''}`;
                chip.innerText = catName;
                chip.onclick = () => toggleFilterValue('category', catName);
                container.appendChild(chip);
            });
        }

        function renderAdvancedFilterTagChips() {
            const container = document.getElementById("filter-tag-chips");
            if (!container) return;
            container.innerHTML = "";

            // Gather all tags from transactions dynamically
            const allTags = [];
            state.transactions.forEach(t => {
                if (t.tags && t.tags.length > 0) {
                    t.tags.forEach(tag => {
                        if (!allTags.includes(tag)) {
                            allTags.push(tag);
                        }
                    });
                } else if (t.tag && t.tag.length > 0) {
                    if (!allTags.includes(t.tag)) {
                        allTags.push(t.tag);
                    }
                }
            });

            if (allTags.length === 0) {
                container.innerHTML = `<span style="font-size:10px; color:var(--text-secondary);">No custom tags logged.</span>`;
                return;
            }

            allTags.forEach(tag => {
                const isActive = state.activeFilters.tags.includes(tag);
                const chip = document.createElement("div");
                chip.className = `chip-option ${isActive ? 'active' : ''}`;
                chip.innerText = tag;
                chip.onclick = () => toggleFilterValue('tag', tag);
                container.appendChild(chip);
            });
        }

        // Apply filters
        function applyAndCloseAdvancedFilters() {
            const min = parseFloat(document.getElementById("filter-min-amount").value);
            const max = parseFloat(document.getElementById("filter-max-amount").value);
            const start = document.getElementById("filter-start-date").value;
            const end = document.getElementById("filter-end-date").value;

            state.activeFilters.minAmt = isNaN(min) ? null : min;
            state.activeFilters.maxAmt = isNaN(max) ? null : max;
            state.activeFilters.startDate = start || "";
            state.activeFilters.endDate = end || "";

            // Toggle visual indicator on filter button
            const hasActiveFilters = 
                state.activeFilters.types.length > 0 ||
                state.activeFilters.wallets.length > 0 ||
                state.activeFilters.categories.length > 0 ||
                state.activeFilters.tags.length > 0 ||
                state.activeFilters.minAmt !== null ||
                state.activeFilters.maxAmt !== null ||
                state.activeFilters.startDate !== "" ||
                state.activeFilters.endDate !== "";

            const icons = document.querySelectorAll(".filter-indicator-icon-class");
            icons.forEach(icon => {
                const iconSpan = icon.tagName === 'SPAN' ? icon : icon.querySelector('.material-icons-round');
                if (iconSpan) {
                    if (hasActiveFilters) {
                        iconSpan.style.color = "var(--saving)"; // glow gold if active
                        iconSpan.innerText = "filter_alt";
                        if (icon.classList.contains('chip-option')) {
                            icon.style.borderColor = "var(--saving)";
                            icon.style.boxShadow = "0 0 8px var(--saving)";
                        }
                    } else {
                        iconSpan.style.color = "var(--primary)"; // regular color
                        iconSpan.innerText = "tune";
                        if (icon.classList.contains('chip-option')) {
                            icon.style.borderColor = "var(--border)";
                            icon.style.boxShadow = "none";
                        }
                    }
                }
            });

            closeOverlayView("advanced-filter");

            // Rerender lists
            renderHomeTransactions();
            renderHistoryTransactions(document.getElementById("tx-search-bar") ? document.getElementById("tx-search-bar").value : "");
            
            // Rerender analytics if active
            const activeTab = document.querySelector(".screen-tab.active");
            if (activeTab && activeTab.id === "tab-analytics") {
                const activeSubTab = document.querySelector("#tab-analytics .sub-view-tab-btn.active");
                if (activeSubTab) {
                    const id = activeSubTab.id;
                    if (id.includes("overview")) renderAnalyticsOverview();
                    else if (id.includes("trends")) renderAnalyticsTrends();
                    else if (id.includes("budgets")) renderAnalyticsBudgets();
                }
            }
        }

        // Clear all filters
        function clearAllAdvancedFilters() {
            state.activeFilters = {
                types: [],
                wallets: [],
                categories: [],
                tags: [],
                minAmt: null,
                maxAmt: null,
                startDate: "",
                endDate: ""
            };

            // Clear input fields
            document.getElementById("filter-min-amount").value = "";
            document.getElementById("filter-max-amount").value = "";
            document.getElementById("filter-start-date").value = "";
            document.getElementById("filter-end-date").value = "";

            renderAdvancedFilterTypeChips();
            renderAdvancedFilterWalletChips();
            renderAdvancedFilterCategoryChips();
            renderAdvancedFilterTagChips();
        }
