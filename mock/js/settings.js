        // Settings Sub-views coordinator
        function openOverlayView(viewId) {
            document.getElementById("overlay-" + viewId).classList.add("show");
            if (viewId === "accounts") {
                state.expandedWalletId = null; // reset expanded card
                renderSettingsAccounts();
                
                // Initialize Account Creation Form with default Bank type
                state.newAccountType = "BANK";
                state.selectedNewAccountModes = ["UPI", "Debit Card", "Internet Banking"];
                state.availableNewAccountModes = ["UPI", "Debit Card", "Internet Banking"];
                setNewAccountType("BANK");
            }
            if (viewId === "custom-categories") {
                switchSettingsCategoryTab("EXPENSE");
                setupCategoryInputWarningListener();
            }
            if (viewId === "debts") {
                state.activeDebtFilterTab = 'ACTIVE';
                state.activeDebtFormType = 'LENT';
                state.selectedDebtFormWalletId = state.wallets[0]?.id || 1;
                renderSettingsDebts();
                renderDebtFormWallets();
            }
            if (viewId === "scheduled") {
                state.activeSchedFormType = "EXPENSE";
                state.activeSchedFormFreq = "MONTHLY";
                state.selectedSchedFormWalletId = state.wallets[0]?.id || 1;
                
                // Set initial category based on first expense category
                if (categories.EXPENSE && categories.EXPENSE.length > 0) {
                    state.selectedSchedFormCategoryId = categories.EXPENSE[0].id;
                } else {
                    state.selectedSchedFormCategoryId = 1;
                }

                setSchedFormType("EXPENSE");
                setSchedFormFreq("MONTHLY");
                renderSettingsScheduledList();
            }
        }

        function closeOverlayView(viewId) {
            document.getElementById("overlay-" + viewId).classList.remove("show");
        }

        // Toggles selectable preset chips in the Add Account form (Deprecated in favor of setNewAccountType)
        function togglePresetInstrument(chip) {
            chip.classList.toggle("active");
        }

        // Settings: Unified Manage Accounts & Relational Instruments
        function renderSettingsAccounts() {
            const list = document.getElementById("settings-accounts-list");
            if (!list) return;
            list.innerHTML = "";

            if (state.wallets.length === 0) {
                list.innerHTML = `<div style="text-align:center; padding: 24px; color:var(--text-secondary); font-size:12px;">No accounts found. Create one below!</div>`;
                return;
            }

            // Universal set of preset payment modes available to select for BANK accounts
            const presetModes = ["UPI", "Debit Card", "Internet Banking"];

            state.wallets.forEach(w => {
                const isExpanded = state.expandedWalletId === w.id;
                const linkedModes = state.walletPaymentModes[w.id] || [];
                
                // Select icon based on wallet type
                let iconChar = "account_balance";
                if (w.type === "CASH") iconChar = "payments";
                else if (w.type === "CREDIT_CARD") iconChar = "credit_card";

                const card = document.createElement("div");
                card.className = `account-card-premium ${isExpanded ? 'expanded' : ''}`;
                
                // Generate expanded details based on type constraints
                let detailsHtml = "";
                if (w.type === "CASH") {
                    detailsHtml = `
                        <div style="font-size: 11px; color: var(--text-secondary); text-align: center; padding: 12px; border: 1px dashed var(--border); border-radius: 12px; background-color: rgba(0,0,0,0.15); margin-bottom:12px;">
                            🔒 Cash accounts are strictly limited to Cash transactions.
                        </div>
                    `;
                } else if (w.type === "CREDIT_CARD") {
                    detailsHtml = `
                        <div style="font-size: 11px; color: var(--text-secondary); text-align: center; padding: 12px; border: 1px dashed var(--border); border-radius: 12px; background-color: rgba(0,0,0,0.15); margin-bottom:12px;">
                            🔒 Credit Cards are strictly limited to Credit Card transactions.
                        </div>
                    `;
                } else {
                    // Combine default preset modes with any custom modes linked to this account
                    const modesToRender = [...presetModes];

                    const hasUpiLinked = linkedModes.includes("UPI") || linkedModes.some(m => m.startsWith("UPI (") && m.endsWith(")"));
                    let upiSubHtml = "";
                    if (hasUpiLinked) {
                        const standardUpiApps = ["GPay", "PhonePe", "Paytm", "BHIM", "CRED"];
                        const linkedUpiApps = linkedModes
                            .filter(m => m.startsWith("UPI (") && m.endsWith(")"))
                            .map(m => m.substring(5, m.length - 1));
                        
                        const allUpiApps = [...standardUpiApps];
                        linkedUpiApps.forEach(app => {
                            if (!allUpiApps.includes(app)) {
                                allUpiApps.push(app);
                            }
                        });

                        upiSubHtml = `
                            <div class="upi-sub-checklist-container" style="margin-top: 10px; padding: 12px; border-radius: 12px; background: rgba(0, 0, 0, 0.2); border: 1px solid var(--border); margin-bottom: 12px;">
                                <div style="font-size: 11px; font-weight: 600; color: var(--primary); margin-bottom: 8px; display: flex; justify-content: space-between;">
                                    <span>Select UPI Applications</span>
                                    <span style="font-size: 8px; opacity:0.8;">Account Specific</span>
                                </div>
                                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
                                    ${allUpiApps.map(app => {
                                        const isAppLinked = linkedUpiApps.includes(app);
                                        return `
                                            <div class="chip-option ${isAppLinked ? 'active' : ''}" onclick="toggleWalletUpiAppLink(${w.id}, '${app}')" style="font-size: 11px; padding: 5px 10px;">
                                                ${app}
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                                <div class="inline-action-row" style="margin-bottom: 0;">
                                    <input type="text" class="inline-action-input" placeholder="Add custom UPI App (e.g. CRED)" id="custom-upi-app-input-${w.id}">
                                    <button class="inline-action-btn" onclick="addCustomUpiAppInline(${w.id})">Link App</button>
                                </div>
                            </div>
                        `;
                    }

                    detailsHtml = `
                        <div class="instrument-management-title">
                            <span>Link Spent Instruments (Payment Modes)</span>
                            <span style="font-size: 9px; opacity:0.8; color:var(--primary);">Relational Toggle</span>
                        </div>
                        
                        <div class="instruments-checkbox-grid">
                            ${modesToRender.map(mode => {
                                const isLinked = linkedModes.includes(mode) || (mode === "UPI" && linkedModes.some(m => m.startsWith("UPI (") && m.endsWith(")")));
                                const isPreset = presetModes.includes(mode);
                                return `
                                    <div class="instrument-check-pill ${isLinked ? 'linked' : ''}" onclick="toggleWalletInstrumentLink(${w.id}, '${mode}')">
                                        <span>${mode} ${isPreset ? '' : '<span style="font-size:8px; opacity:0.6;">(Custom)</span>'}</span>
                                        <span class="material-icons-round indicator">${isLinked ? 'check_circle' : 'radio_button_unchecked'}</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>

                        ${upiSubHtml}
                    `;
                }

                card.innerHTML = `
                    <div class="account-card-header" onclick="toggleAccountCardExpansion(${w.id})">
                        <div class="account-card-meta">
                            <div class="account-card-icon">
                                <span class="material-icons-round" style="font-size: 20px;">${iconChar}</span>
                            </div>
                            <div>
                                <h4 class="account-card-title">${w.name}</h4>
                                <span class="account-card-subtitle">${linkedModes.length} linked instrument${linkedModes.length === 1 ? '' : 's'}</span>
                            </div>
                        </div>
                        <div class="account-card-balance">
                            <span class="amt">₹${w.currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            <span class="label">Net Balance</span>
                        </div>
                    </div>
                    
                    <div class="account-card-details">
                        ${detailsHtml}
                        <button class="inline-delete-account-btn" onclick="deleteSettingsAccount(${w.id})">
                            <span class="material-icons-round" style="font-size: 14px; vertical-align: middle; margin-right: 4px;">delete</span>
                            Remove Account & Linked Instruments
                        </button>
                    </div>
                `;
                list.appendChild(card);
            });
        }

        // Toggle Expand card in settings list
        function toggleAccountCardExpansion(walletId) {
            if (state.expandedWalletId === walletId) {
                state.expandedWalletId = null;
            } else {
                state.expandedWalletId = walletId;
            }
            renderSettingsAccounts();
        }

        // Toggles a payment mode linked to a specific wallet
        function toggleWalletInstrumentLink(walletId, mode) {
            if (!state.walletPaymentModes[walletId]) {
                state.walletPaymentModes[walletId] = [];
            }
            
            const list = state.walletPaymentModes[walletId];
            
            if (mode === "UPI") {
                const hasAnyUpi = list.includes("UPI") || list.some(m => m.startsWith("UPI (") && m.endsWith(")"));
                if (hasAnyUpi) {
                    state.walletPaymentModes[walletId] = list.filter(m => !m.startsWith("UPI"));
                } else {
                    list.push("UPI");
                }
            } else {
                const idx = list.indexOf(mode);
                if (idx > -1) {
                    list.splice(idx, 1);
                } else {
                    list.push(mode);
                }
            }

            if (state.walletPaymentModes[walletId].length === 0) {
                const w = state.wallets.find(x => x.id === walletId);
                if (w) {
                    if (w.type === "BANK") state.walletPaymentModes[walletId] = ["Debit Card"];
                    else if (w.type === "CREDIT_CARD") state.walletPaymentModes[walletId] = ["Credit Card"];
                    else state.walletPaymentModes[walletId] = ["Cash"];
                }
            }

            renderSettingsAccounts();
            syncFormPaymentModes();
        }

        // Toggles a specific UPI app linked to a specific wallet
        function toggleWalletUpiAppLink(walletId, appName) {
            if (!state.walletPaymentModes[walletId]) {
                state.walletPaymentModes[walletId] = [];
            }
            
            const list = state.walletPaymentModes[walletId];
            const modeStr = `UPI (${appName})`;
            const idx = list.indexOf(modeStr);
            
            if (idx > -1) {
                list.splice(idx, 1);
            } else {
                list.push(modeStr);
            }
            
            renderSettingsAccounts();
            syncFormPaymentModes();
        }

        // Inline dynamic UPI app linking
        function addCustomUpiAppInline(walletId) {
            const input = document.getElementById(`custom-upi-app-input-${walletId}`);
            if (!input) return;
            const appName = input.value.trim();
            if (appName.length === 0) return;

            if (!state.walletPaymentModes[walletId]) {
                state.walletPaymentModes[walletId] = [];
            }

            const list = state.walletPaymentModes[walletId];
            const modeStr = `UPI (${appName})`;
            if (list.includes(modeStr)) {
                alert("This UPI application is already linked.");
                return;
            }

            list.push(modeStr);
            input.value = "";
            renderSettingsAccounts();
            syncFormPaymentModes();
        }

        // Set new account type inside Account Creation Form
        function setNewAccountType(type) {
            state.newAccountType = type;
            
            // Toggle active classes on buttons
            document.getElementById("acct-type-bank-btn").classList.remove("active");
            document.getElementById("acct-type-cc-btn").classList.remove("active");
            document.getElementById("acct-type-cash-btn").classList.remove("active");
            
            if (type === "BANK") {
                document.getElementById("acct-type-bank-btn").classList.add("active");
                state.selectedNewAccountUpiApps = ["GPay", "PhonePe"];
            } else if (type === "CREDIT_CARD") {
                document.getElementById("acct-type-cc-btn").classList.add("active");
            } else if (type === "CASH") {
                document.getElementById("acct-type-cash-btn").classList.add("active");
            }
            
            renderNewAccountModesList();
        }

        // Render dynamic link selector chips inside Account Creation Form
        function renderNewAccountModesList() {
            const container = document.getElementById("new-account-preset-instruments");
            if (!container) return;
            container.innerHTML = "";

            const upiAppsContainer = document.getElementById("new-account-upi-apps-container");

            if (state.newAccountType === "CASH") {
                container.innerHTML = `<div class="chip-option active" style="cursor: default;">Cash</div>`;
                if (upiAppsContainer) {
                    upiAppsContainer.style.display = "none";
                    upiAppsContainer.innerHTML = "";
                }
            } else if (state.newAccountType === "CREDIT_CARD") {
                container.innerHTML = `<div class="chip-option active" style="cursor: default;">Credit Card</div>`;
                if (upiAppsContainer) {
                    upiAppsContainer.style.display = "none";
                    upiAppsContainer.innerHTML = "";
                }
            } else {
                // Bank Account - list all available default and custom modes
                state.availableNewAccountModes.forEach(mode => {
                    const isActive = state.selectedNewAccountModes.includes(mode);
                    const chip = document.createElement("div");
                    chip.className = `chip-option ${isActive ? 'active' : ''}`;
                    chip.innerText = mode;
                    chip.onclick = () => togglePresetNewAccountMode(mode);
                    container.appendChild(chip);
                });

                if (state.selectedNewAccountModes.includes("UPI") && upiAppsContainer) {
                    upiAppsContainer.style.display = "block";
                    
                    if (!state.selectedNewAccountUpiApps) {
                        state.selectedNewAccountUpiApps = ["GPay", "PhonePe"];
                    }
                    if (!state.availableNewAccountUpiApps) {
                        state.availableNewAccountUpiApps = ["GPay", "PhonePe", "Paytm", "BHIM", "CRED"];
                    }

                    upiAppsContainer.innerHTML = `
                        <div class="upi-sub-checklist-container" style="margin-top: 10px; padding: 12px; border-radius: 12px; background: rgba(0, 0, 0, 0.2); border: 1px solid var(--border);">
                            <div style="font-size: 11px; font-weight: 600; color: var(--primary); margin-bottom: 8px;">Select UPI Applications:</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
                                ${state.availableNewAccountUpiApps.map(app => {
                                    const isAppActive = state.selectedNewAccountUpiApps.includes(app);
                                    return `
                                        <div class="chip-option ${isAppActive ? 'active' : ''}" onclick="toggleNewAccountUpiApp('${app}')" style="font-size: 11px; padding: 5px 10px;">
                                            ${app}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                            <div class="inline-action-row" style="margin-bottom: 0;">
                                <input type="text" class="inline-action-input" placeholder="Add custom UPI App (e.g. CRED)" id="new-account-custom-upi-input">
                                <button class="inline-action-btn" onclick="addNewAccountCustomUpiAppInline()">Link App</button>
                            </div>
                        </div>
                    `;
                } else if (upiAppsContainer) {
                    upiAppsContainer.style.display = "none";
                    upiAppsContainer.innerHTML = "";
                }
            }
        }

        // Toggle preset or custom payment instrument in creator form
        function togglePresetNewAccountMode(mode) {
            if (state.newAccountType !== "BANK") return;
            
            const list = state.selectedNewAccountModes;
            const idx = list.indexOf(mode);
            if (idx > -1) {
                if (list.length <= 1) {
                    alert("Bank accounts must retain at least 1 active payment instrument.");
                    return;
                }
                list.splice(idx, 1);
            } else {
                list.push(mode);
            }
            renderNewAccountModesList();
        }

        // Toggle sub-apps checklist for new account creation
        function toggleNewAccountUpiApp(app) {
            if (!state.selectedNewAccountUpiApps) {
                state.selectedNewAccountUpiApps = [];
            }
            const idx = state.selectedNewAccountUpiApps.indexOf(app);
            if (idx > -1) {
                state.selectedNewAccountUpiApps.splice(idx, 1);
            } else {
                state.selectedNewAccountUpiApps.push(app);
            }
            renderNewAccountModesList();
        }

        // Add dynamic custom UPI app during creation
        function addNewAccountCustomUpiAppInline() {
            const input = document.getElementById("new-account-custom-upi-input");
            if (!input) return;
            const app = input.value.trim();
            if (app.length === 0) return;

            if (!state.availableNewAccountUpiApps) {
                state.availableNewAccountUpiApps = ["GPay", "PhonePe", "Paytm", "BHIM", "CRED"];
            }
            if (!state.selectedNewAccountUpiApps) {
                state.selectedNewAccountUpiApps = [];
            }

            if (state.availableNewAccountUpiApps.includes(app)) {
                if (!state.selectedNewAccountUpiApps.includes(app)) {
                    state.selectedNewAccountUpiApps.push(app);
                }
            } else {
                state.availableNewAccountUpiApps.push(app);
                state.selectedNewAccountUpiApps.push(app);
            }
            input.value = "";
            renderNewAccountModesList();
        }

        // Create new bank account / cash / credit card with strict payment mode rules
        function addCustomAccount() {
            const nameInput = document.getElementById("settings-account-name-input");
            const balInput = document.getElementById("settings-account-bal-input");
            if (!nameInput || !balInput) return;

            const name = nameInput.value.trim();
            const bal = parseFloat(balInput.value) || 0;

            if (name.length === 0) {
                alert("Please enter a valid account name.");
                return;
            }

            // Gather linked payment modes based on strict type rules
            let selectedModes = [];
            if (state.newAccountType === "CASH") {
                selectedModes = ["Cash"];
            } else if (state.newAccountType === "CREDIT_CARD") {
                selectedModes = ["Credit Card"];
            } else {
                state.selectedNewAccountModes.forEach(mode => {
                    if (mode === "UPI") {
                        if (state.selectedNewAccountUpiApps && state.selectedNewAccountUpiApps.length > 0) {
                            state.selectedNewAccountUpiApps.forEach(app => {
                                selectedModes.push(`UPI (${app})`);
                            });
                        } else {
                            selectedModes.push("UPI");
                        }
                    } else {
                        selectedModes.push(mode);
                    }
                });
            }

            if (selectedModes.length === 0) {
                alert("Please select at least 1 payment mode to link to this bank account.");
                return;
            }

            const newId = Date.now();
            const registeredType = state.newAccountType;
            
            // Add wallet to state database
            state.wallets.push({ 
                id: newId, 
                name: name, 
                type: registeredType, 
                currentBalance: bal 
            });
            
            // Link relational payment modes map
            state.walletPaymentModes[newId] = selectedModes;

            // Clear form inputs
            nameInput.value = "";
            balInput.value = "";
            
            // Reset to BANK defaults for next entry
            state.newAccountType = "BANK";
            state.selectedNewAccountModes = ["UPI", "Debit Card", "Internet Banking"];
            state.selectedNewAccountUpiApps = ["GPay", "PhonePe"];
            setNewAccountType("BANK");
            
            // Re-render other dependent views
            renderSettingsAccounts();
            calculateBalances();
            renderFormWallets();
            syncFormPaymentModes();
            
            alert(`🏦 Account "${name}" registered successfully as ${registeredType === "CASH" ? 'Cash' : registeredType === "CREDIT_CARD" ? 'Credit Card' : 'Bank'} type.`);
        }

        // Safely deletes bank accounts
        function deleteSettingsAccount(walletId) {
            if (state.wallets.length <= 1) {
                alert("You must retain at least one core bank account / cash wallet.");
                return;
            }

            const wallet = state.wallets.find(w => w.id === walletId);
            if (!confirm(`Are you sure you want to remove account "${wallet?.name}"?\nAll linked payment modes and future aggregates will be unlinked.`)) {
                return;
            }

            const idx = state.wallets.findIndex(w => w.id === walletId);
            if (idx > -1) {
                state.wallets.splice(idx, 1);
                delete state.walletPaymentModes[walletId];
            }

            state.expandedWalletId = null;
            renderSettingsAccounts();
            calculateBalances();
            renderFormWallets();
            syncFormPaymentModes();
        }

        // Settings: Dynamic Flow Categories Manager (Repeating Allowed)
        function switchSettingsCategoryTab(type) {
            state.activeSettingCategoryTab = type;
            
            // Highlight selector tabs
            document.querySelectorAll("#overlay-custom-categories .sub-view-tab-btn").forEach(btn => btn.classList.remove("active"));
            document.getElementById(`settings-cat-tab-${type.toLowerCase()}`).classList.add("active");

            // Format title headings
            const labelStr = type === "EXPENSE" ? "Expense Budgets" : type === "INCOME" ? "Income Flows" : "Savings Goals";
            document.getElementById("settings-cat-label").innerText = `Current ${labelStr}`;
            document.getElementById("add-cat-flow-header").innerText = `Create Custom ${type === "EXPENSE" ? "Expense" : type === "INCOME" ? "Income" : "Saving"} Category`;

            // Reset inputs & check warning
            const input = document.getElementById("settings-custom-cat-input");
            input.value = "";
            checkCategoryRepeatingWarning("");

            renderSettingsCategoriesList();
        }

        // Monitors custom category inputs in real time to show repeating warnings
        function setupCategoryInputWarningListener() {
            const input = document.getElementById("settings-custom-cat-input");
            input.oninput = function(e) {
                checkCategoryRepeatingWarning(e.target.value.trim());
            };
        }

        // Check if category name repeats in other flows
        function checkCategoryRepeatingWarning(val) {
            const warnMsg = document.getElementById("cat-repeat-warning-msg");
            if (val.length < 2) {
                warnMsg.style.display = "none";
                return;
            }

            const activeFlow = state.activeSettingCategoryTab;
            const otherFlows = [];
            
            // Check other categories
            Object.keys(categories).forEach(flowKey => {
                if (flowKey !== activeFlow) {
                    const match = categories[flowKey].some(c => c.name.toLowerCase() === val.toLowerCase());
                    if (match) {
                        const flowTitle = flowKey === "EXPENSE" ? "Expense" : flowKey === "INCOME" ? "Income" : "Saving";
                        otherFlows.push(flowTitle);
                    }
                }
            });

            if (otherFlows.length > 0) {
                warnMsg.innerHTML = `🔁 "${val}" already exists under ${otherFlows.join(" & ")}. Creating this will repeat it dynamically!`;
                warnMsg.style.display = "block";
            } else {
                warnMsg.style.display = "none";
            }
        }

        // Renders categories with visual indicators showing if they repeat in other flows
        function renderSettingsCategoriesList() {
            const list = document.getElementById("settings-categories-list");
            list.innerHTML = "";

            const catList = categories[state.activeSettingCategoryTab] || [];
            
            if (catList.length === 0) {
                list.innerHTML = `<div style="text-align:center; padding: 24px; color:var(--text-secondary); font-size:12px;">No categories in this flow. Create one below!</div>`;
                return;
            }

            catList.forEach(cat => {
                const repeatsIn = [];
                
                // Inspect other flow groups for matching category names
                Object.keys(categories).forEach(flowKey => {
                    if (flowKey !== state.activeSettingCategoryTab) {
                        const match = categories[flowKey].some(c => c.name.toLowerCase() === cat.name.toLowerCase());
                        if (match) {
                            const badgeTitle = flowKey === "EXPENSE" ? "Expense" : flowKey === "INCOME" ? "Income" : "Saving";
                            repeatsIn.push(badgeTitle);
                        }
                    }
                });

                const isRepeated = repeatsIn.length > 0;
                const dotColor = state.activeSettingCategoryTab === "EXPENSE" ? "var(--expense)" : state.activeSettingCategoryTab === "INCOME" ? "var(--income)" : "var(--saving)";

                const item = document.createElement("div");
                item.className = "category-row-premium";
                
                item.innerHTML = `
                    <div class="left-side">
                        <div class="cat-dot" style="background-color: ${cat.color || dotColor};"></div>
                        <span class="cat-name">${cat.name}</span>
                        ${isRepeated ? `
                            <span class="repeat-label ${repeatsIn[0].toLowerCase()}">
                                <span class="material-icons-round" style="font-size:10px;">repeat</span>
                                Also in ${repeatsIn.join(', ')}
                            </span>
                        ` : ''}
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        ${isRepeated ? `<span class="taxonomy-badge-pill">Repeating taxonomy</span>` : ''}
                        <span class="repeat-btn-delete material-icons-round" onclick="deleteSettingsCategory(${cat.id})">delete</span>
                    </div>
                `;
                list.appendChild(item);
            });
        }

        // Create dynamic new category, enforcing unique name per list, permitting repeating globally
        function addCustomCategory() {
            const input = document.getElementById("settings-custom-cat-input");
            const val = input.value.trim();
            if (val.length === 0) return;

            const activeList = categories[state.activeSettingCategoryTab];
            // Check identical name inside the same list
            if (activeList.some(c => c.name.toLowerCase() === val.toLowerCase())) {
                alert(`Category "${val}" already exists inside this specific flow.`);
                return;
            }

            const newId = Date.now();
            const colorMap = {
                EXPENSE: "var(--expense)",
                INCOME: "var(--income)",
                SAVING: "var(--saving)"
            };

            activeList.push({ 
                id: newId, 
                name: val, 
                color: colorMap[state.activeSettingCategoryTab] 
            });

            input.value = "";
            checkCategoryRepeatingWarning("");
            renderSettingsCategoriesList();
            renderFormCategories(); // refresh active form category list
            
            // If duplicate in another flow, show special notification
            let wasRepeating = false;
            Object.keys(categories).forEach(flowKey => {
                if (flowKey !== state.activeSettingCategoryTab) {
                    if (categories[flowKey].some(c => c.name.toLowerCase() === val.toLowerCase())) {
                        wasRepeating = true;
                    }
                }
            });

            if (wasRepeating) {
                alert(`🔁 Repeated Taxonomy: "${val}" successfully registered in ${state.activeSettingCategoryTab} flow.\nName is shared across multiple flows.`);
            }
        }

        // Safely deletes category allocations
        function deleteSettingsCategory(catId) {
            const activeList = categories[state.activeSettingCategoryTab];
            const cat = activeList.find(c => c.id === catId);
            
            if (activeList.length <= 1) {
                alert("Flow must retain at least 1 active category.");
                return;
            }

            if (!confirm(`Are you sure you want to delete "${cat?.name}" category?`)) {
                return;
            }

            const idx = activeList.findIndex(c => c.id === catId);
            if (idx > -1) {
                activeList.splice(idx, 1);
            }
            renderSettingsCategoriesList();
            renderFormCategories();
        }

        // --- DEBTS & LOANS CONTROLLER ACTIONS ---

        // Toggles selectable pills in the Add Debt form
        function setDebtFormType(type) {
            state.activeDebtFormType = type;
            document.getElementById("debt-type-lent-btn").classList.remove("active");
            document.getElementById("debt-type-borrowed-btn").classList.remove("active");
            
            if (type === 'LENT') {
                document.getElementById("debt-type-lent-btn").classList.add("active");
            } else {
                document.getElementById("debt-type-borrowed-btn").classList.add("active");
            }
        }

        // Toggles selectable preset chips in the Add Debt wallet form
        function renderDebtFormWallets() {
            const container = document.getElementById("debt-wallet-chips");
            if (!container) return;
            container.innerHTML = "";

            state.wallets.forEach(w => {
                const isActive = state.selectedDebtFormWalletId === w.id;
                const chip = document.createElement("div");
                chip.className = `chip-option ${isActive ? 'active' : ''}`;
                chip.innerHTML = `${w.name}<br><span style="font-size:9px;opacity:0.8;">₹${w.currentBalance.toLocaleString('en-IN')}</span>`;
                chip.onclick = () => {
                    state.selectedDebtFormWalletId = w.id;
                    renderDebtFormWallets();
                };
                container.appendChild(chip);
            });
        }

        // Switches Active vs Settled filter tabs
        function switchDebtFilterTab(status) {
            state.activeDebtFilterTab = status;
            document.getElementById("debt-tab-active").classList.remove("active");
            document.getElementById("debt-tab-settled").classList.remove("active");

            if (status === 'ACTIVE') {
                document.getElementById("debt-tab-active").classList.add("active");
                document.getElementById("debts-list-label").innerText = "Active Debt Records";
            } else {
                document.getElementById("debt-tab-settled").classList.add("active");
                document.getElementById("debts-list-label").innerText = "Settled Debt Records";
            }
            renderSettingsDebts();
        }

        // Renders outstanding debts list and updates dynamic metrics
        function renderSettingsDebts() {
            let totalLent = 0;
            let totalBorrowed = 0;

            state.debts.forEach(d => {
                if (d.status === "ACTIVE") {
                    if (d.debtType === "LENT") {
                        totalLent += d.amount;
                    } else {
                        totalBorrowed += d.amount;
                    }
                }
            });

            const lentVal = document.getElementById("debts-lent-val");
            const borrowedVal = document.getElementById("debts-borrowed-val");
            if (lentVal) lentVal.innerText = `₹${totalLent.toLocaleString('en-IN')}`;
            if (borrowedVal) borrowedVal.innerText = `₹${totalBorrowed.toLocaleString('en-IN')}`;

            const list = document.getElementById("settings-debts-list");
            if (!list) return;
            list.innerHTML = "";

            const filteredDebts = state.debts.filter(d => d.status === state.activeDebtFilterTab);

            if (filteredDebts.length === 0) {
                list.innerHTML = `<div style="text-align:center; padding: 24px; color:var(--text-secondary); font-size:12px;">No ${state.activeDebtFilterTab.toLowerCase()} debt records found.</div>`;
                return;
            }

            filteredDebts.forEach(d => {
                const row = document.createElement("div");
                row.className = "debt-card-row";

                const badgeClass = d.status === "SETTLED" ? "settled" : d.debtType.toLowerCase();
                const badgeText = d.status === "SETTLED" ? "Settled" : d.debtType === "LENT" ? "Owed to Me" : "I Owe";
                const amtColor = d.status === "SETTLED" ? "var(--text-secondary)" : d.debtType === "LENT" ? "var(--income)" : "var(--expense)";
                const wallet = state.wallets.find(w => w.id === d.walletId);
                const walletName = wallet ? wallet.name : "Cash Wallet";

                row.innerHTML = `
                    <div class="top-row">
                        <span class="person-name">${d.personName}</span>
                        <span class="debt-badge ${badgeClass}">${badgeText}</span>
                    </div>
                    <div class="mid-row">
                        <span class="amt" style="color: ${amtColor};">₹${d.amount.toLocaleString('en-IN')}</span>
                        <div style="display: flex; gap: 6px; align-items: center;">
                            <span class="wallet-tag">${walletName}</span>
                            ${d.dueDate ? `
                                <span class="wallet-tag" style="background: rgba(255, 215, 0, 0.04); color: var(--primary); border: 1px solid rgba(255, 215, 0, 0.15); display: inline-flex; align-items: center; gap: 3px;">
                                    <span class="material-icons-round" style="font-size:10px;">calendar_today</span>
                                    Due: ${d.dueDate}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    ${d.notes ? `<div class="notes">${d.notes}</div>` : ''}
                    <div class="action-row">
                        ${d.status === "ACTIVE" ? `
                            <button class="settle-btn" onclick="executeSettingsSettle(${d.id})">Settle Balance</button>
                        ` : ''}
                        <button class="delete-btn" onclick="deleteSettingsDebt(${d.id})">
                            <span class="material-icons-round" style="font-size: 14px;">delete</span>
                        </button>
                    </div>
                `;
                list.appendChild(row);
            });
        }

        // Settle outstanding debt (with custom/partial amount support)
        function executeSettingsSettle(debtId) {
            const debt = state.debts.find(d => d.id === debtId);
            if (!debt || debt.status === "SETTLED") return;

            const inputAmount = prompt(
                `Outstanding balance with ${debt.personName} is ₹${debt.amount.toLocaleString('en-IN')}.\n` +
                `Enter the amount to settle (or press OK to settle full amount):`, 
                debt.amount
            );

            if (inputAmount === null) return; // User cancelled

            const settleAmt = parseFloat(inputAmount);
            if (isNaN(settleAmt) || settleAmt <= 0) {
                alert("Please enter a valid positive number.");
                return;
            }

            if (settleAmt > debt.amount) {
                alert(`Cannot settle more than the outstanding debt amount (₹${debt.amount.toLocaleString('en-IN')}).`);
                return;
            }

            const wallet = state.wallets.find(w => w.id === debt.walletId);
            if (wallet) {
                if (debt.debtType === "LENT") {
                    wallet.currentBalance += settleAmt;
                } else {
                    wallet.currentBalance -= settleAmt;
                }
            }

            if (settleAmt === debt.amount) {
                debt.status = "SETTLED";
                debt.notes = (debt.notes ? debt.notes + " " : "") + `[Fully settled ₹${settleAmt.toLocaleString('en-IN')}]`;
                alert(`✅ Debt with ${debt.personName} for ₹${settleAmt.toLocaleString('en-IN')} has been fully settled.`);
            } else {
                debt.amount -= settleAmt;
                debt.notes = (debt.notes ? debt.notes + " " : "") + `[Partially settled ₹${settleAmt.toLocaleString('en-IN')}]`;
                alert(`✅ Partial payment of ₹${settleAmt.toLocaleString('en-IN')} logged. Remaining balance: ₹${debt.amount.toLocaleString('en-IN')}.`);
            }
            
            calculateBalances();
            renderSettingsDebts();
            renderDebtFormWallets();
            renderHomeDebts();
        }

        // Delete debt record safely
        function deleteSettingsDebt(debtId) {
            const idx = state.debts.findIndex(d => d.id === debtId);
            if (idx === -1) return;

            const debt = state.debts[idx];
            
            if (debt.status === "ACTIVE") {
                if (!confirm(`Warning: Deleting active debt with ${debt.personName} for ₹${debt.amount.toLocaleString('en-IN')} will NOT reverse the initial wallet cash flows. Proceed with deletion?`)) {
                    return;
                }
            } else {
                if (!confirm(`Delete settled debt record for ${debt.personName}?`)) {
                    return;
                }
            }

            state.debts.splice(idx, 1);
            
            calculateBalances();
            renderSettingsDebts();
            renderDebtFormWallets();
            renderHomeDebts();
        }

        // Save customized new debt record
        function addCustomDebtRecord() {
            const personInput = document.getElementById("debt-person-input");
            const amtInput = document.getElementById("debt-amount-input");
            const notesInput = document.getElementById("debt-notes-input");
            const dueInput = document.getElementById("debt-due-date-input");

            if (!personInput || !amtInput || !notesInput) return;

            const personVal = personInput.value.trim();
            const amtVal = parseFloat(amtInput.value) || 0;
            const notesVal = notesInput.value.trim();
            const dueVal = dueInput ? dueInput.value : "";

            if (!personVal) {
                alert("Please enter the person's name.");
                return;
            }
            if (amtVal <= 0) {
                alert("Please enter a valid amount greater than 0.");
                return;
            }

            const wallet = state.wallets.find(w => w.id === state.selectedDebtFormWalletId);
            if (!wallet) {
                alert("Selected linked account does not exist.");
                return;
            }

            // Core Banking relational flows for Debts:
            // Lenting decreases balance (giving away cash)
            // Borrowing increases balance (receiving cash)
            if (state.activeDebtFormType === "LENT") {
                wallet.currentBalance -= amtVal;
            } else {
                wallet.currentBalance += amtVal;
            }

            const newDebt = {
                id: state.debts.length + 1,
                personName: personVal,
                amount: amtVal,
                debtType: state.activeDebtFormType,
                walletId: state.selectedDebtFormWalletId,
                walletName: wallet.name,
                status: "ACTIVE",
                notes: notesVal,
                dueDate: dueVal
            };

            state.debts.unshift(newDebt);

            // Clear inputs
            personInput.value = "";
            amtInput.value = "";
            notesInput.value = "";
            if (dueInput) dueInput.value = "";

            // Recalculate and update views
            calculateBalances();
            renderSettingsDebts();
            renderDebtFormWallets();
            renderHomeDebts();

            alert(`💸 Debt logged: ${state.activeDebtFormType === 'LENT' ? 'Lent to' : 'Borrowed from'} ${personVal} for ₹${amtVal.toLocaleString('en-IN')}.\nBalance synced with ${wallet.name}.`);
        }

        // --- SCHEDULED & RECURRING PAYMENTS CONTROLLER ---

        // Toggle scheduled flow type Expense vs Income
        function setSchedFormType(type) {
            state.activeSchedFormType = type;
            document.getElementById("sched-type-expense-btn").classList.remove("active");
            document.getElementById("sched-type-income-btn").classList.remove("active");
            
            if (type === 'EXPENSE') {
                document.getElementById("sched-type-expense-btn").classList.add("active");
            } else {
                document.getElementById("sched-type-income-btn").classList.add("active");
            }

            // Category list shifts
            if (categories[type] && categories[type].length > 0) {
                state.selectedSchedFormCategoryId = categories[type][0].id;
            }
            
            renderSchedFormCategories();
            renderSchedFormWallets();
        }

        // Toggle scheduled frequency
        function setSchedFormFreq(freq) {
            state.activeSchedFormFreq = freq;
            document.getElementById("sched-freq-monthly-btn").classList.remove("active");
            document.getElementById("sched-freq-weekly-btn").classList.remove("active");
            document.getElementById("sched-freq-once-btn").classList.remove("active");

            if (freq === 'MONTHLY') {
                document.getElementById("sched-freq-monthly-btn").classList.add("active");
            } else if (freq === 'WEEKLY') {
                document.getElementById("sched-freq-weekly-btn").classList.add("active");
            } else {
                document.getElementById("sched-freq-once-btn").classList.add("active");
            }
        }

        // Render wallet chips inside scheduled payments form
        function renderSchedFormWallets() {
            const container = document.getElementById("sched-wallet-chips");
            if (!container) return;
            container.innerHTML = "";

            state.wallets.forEach(w => {
                const isActive = state.selectedSchedFormWalletId === w.id;
                const chip = document.createElement("div");
                chip.className = `chip-option ${isActive ? 'active' : ''}`;
                chip.innerHTML = `${w.name}<br><span style="font-size:9px;opacity:0.8;">₹${w.currentBalance.toLocaleString('en-IN')}</span>`;
                chip.onclick = () => {
                    state.selectedSchedFormWalletId = w.id;
                    renderSchedFormWallets();
                };
                container.appendChild(chip);
            });
        }

        // Render category chips inside scheduled payments form
        function renderSchedFormCategories() {
            const container = document.getElementById("sched-category-chips");
            if (!container) return;
            container.innerHTML = "";

            const catList = categories[state.activeSchedFormType] || [];
            catList.forEach(cat => {
                const isActive = state.selectedSchedFormCategoryId === cat.id;
                const chip = document.createElement("div");
                chip.className = `chip-option ${isActive ? 'active' : ''}`;
                chip.innerText = cat.name;
                chip.onclick = () => {
                    state.selectedSchedFormCategoryId = cat.id;
                    renderSchedFormCategories();
                };
                container.appendChild(chip);
            });
        }

        // Render list of active scheduled payments / reminders
        function renderSettingsScheduledList() {
            const list = document.getElementById("settings-scheduled-list");
            if (!list) return;
            list.innerHTML = "";

            if (!state.scheduledPayments || state.scheduledPayments.length === 0) {
                list.innerHTML = `<div style="text-align:center; padding: 24px; color:var(--text-secondary); font-size:12px;">No active scheduled payments or reminders.</div>`;
                return;
            }

            state.scheduledPayments.forEach(s => {
                const row = document.createElement("div");
                row.className = "debt-card-row";
                row.style.borderColor = "var(--primary)";

                const wallet = state.wallets.find(w => w.id === s.walletId);
                const walletName = wallet ? wallet.name : "Core Account";
                
                // Calculate due days
                const today = new Date();
                today.setHours(0,0,0,0);
                const dueDate = new Date(s.nextDueDate);
                dueDate.setHours(0,0,0,0);
                const diffTime = dueDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                let badgeText = `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
                let badgeClass = "lent";
                if (diffDays === 0) {
                    badgeText = "Due Today!";
                    badgeClass = "borrowed";
                    row.style.borderColor = "var(--saving)";
                } else if (diffDays < 0) {
                    badgeText = `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}!`;
                    badgeClass = "borrowed";
                    row.style.borderColor = "var(--expense)";
                }

                row.innerHTML = `
                    <div class="top-row">
                        <span class="person-name" style="font-weight:700;">${s.name}</span>
                        <span class="debt-badge ${badgeClass}">${badgeText}</span>
                    </div>
                    <div class="mid-row">
                        <span class="amt" style="color: ${s.type === 'INCOME' ? 'var(--income)' : 'var(--expense)'};">₹${s.amount.toLocaleString('en-IN')}</span>
                        <div style="display:flex; gap:6px; align-items:center;">
                            <span class="wallet-tag" style="background:rgba(197,168,128,0.05); color:var(--primary); border:1px solid rgba(197,168,128,0.15);">${s.frequency}</span>
                            <span class="wallet-tag">${walletName}</span>
                            <span class="wallet-tag">${s.categoryName}</span>
                        </div>
                    </div>
                    ${s.notes ? `<div class="notes" style="margin-top:6px; opacity:0.8;">${s.notes}</div>` : ''}
                    <div class="action-row" style="margin-top:12px;">
                        <button class="settle-btn" onclick="executeSchedSettle(${s.id})" style="background:var(--primary); color:var(--surface-dark); font-weight:700;">Settle & Log</button>
                        <button class="delete-btn" onclick="deleteSettingsScheduled(${s.id})">
                            <span class="material-icons-round" style="font-size:14px;">delete</span>
                        </button>
                    </div>
                `;
                list.appendChild(row);
            });
        }

        // Execute scheduled payment settlement (logs real transaction, updates balance, rolls due date)
        function executeSchedSettle(schedId) {
            const s = state.scheduledPayments.find(x => x.id === schedId);
            if (!s) return;

            const wallet = state.wallets.find(w => w.id === s.walletId);
            if (wallet) {
                if (s.type === "INCOME") {
                    wallet.currentBalance += s.amount;
                } else {
                    wallet.currentBalance -= s.amount;
                }
            }

            // Create new transaction
            const newTx = {
                id: state.transactions.length + 1,
                type: s.type,
                amount: s.amount,
                walletId: s.walletId,
                categoryName: s.categoryName,
                paymentMode: wallet?.type === "CREDIT_CARD" ? "Credit Card" : (s.type === "INCOME" ? "Internet Banking" : "UPI"),
                tags: s.frequency === "ONCE" ? ["#OneTime"] : ["#Recurring"],
                description: s.name,
                timestamp: Date.now()
            };
            state.transactions.unshift(newTx);

            // Roll expected date
            if (s.frequency === "MONTHLY") {
                const next = new Date(s.nextDueDate);
                next.setMonth(next.getMonth() + 1);
                s.nextDueDate = next.toISOString().split('T')[0];
                alert(`✅ Payment logged successfully. Recurring reminder advanced to next cycle (Next Due: ${s.nextDueDate}).`);
            } else if (s.frequency === "WEEKLY") {
                const next = new Date(s.nextDueDate);
                next.setDate(next.getDate() + 7);
                s.nextDueDate = next.toISOString().split('T')[0];
                alert(`✅ Payment logged successfully. Weekly reminder advanced to next cycle (Next Due: ${s.nextDueDate}).`);
            } else {
                // One-Time
                state.scheduledPayments = state.scheduledPayments.filter(x => x.id !== schedId);
                alert(`✅ One-time scheduled payment settled and logged in history.`);
            }

            // Sync all view layers
            calculateBalances();
            renderHomeTransactions();
            renderSettingsScheduledList();
            if (typeof renderHomeScheduledList === "function") renderHomeScheduledList();
        }

        // Delete scheduled payment record
        function deleteSettingsScheduled(schedId) {
            const s = state.scheduledPayments.find(x => x.id === schedId);
            if (!s) return;

            if (!confirm(`Are you sure you want to remove the scheduled reminder for "${s.name}"?`)) {
                return;
            }

            state.scheduledPayments = state.scheduledPayments.filter(x => x.id !== schedId);
            renderSettingsScheduledList();
            if (typeof renderHomeScheduledList === "function") renderHomeScheduledList();
        }

        // Add custom scheduled payment record
        function addCustomScheduledPayment() {
            const nameInput = document.getElementById("sched-name-input");
            const amtInput = document.getElementById("sched-amount-input");
            const dateInput = document.getElementById("sched-due-date-input");
            const notesInput = document.getElementById("sched-notes-input");

            if (!nameInput || !amtInput || !dateInput || !notesInput) return;

            const name = nameInput.value.trim();
            const amt = parseFloat(amtInput.value) || 0;
            const dueDate = dateInput.value;
            const notes = notesInput.value.trim();

            if (name.length === 0) {
                alert("Please enter a valid reminder title.");
                return;
            }
            if (amt <= 0) {
                alert("Please enter a valid amount greater than 0.");
                return;
            }
            if (!dueDate) {
                alert("Please select the next expected due date.");
                return;
            }

            const wallet = state.wallets.find(w => w.id === state.selectedSchedFormWalletId);
            if (!wallet) {
                alert("Selected linked account does not exist.");
                return;
            }

            const catList = categories[state.activeSchedFormType] || [];
            const catObj = catList.find(c => c.id === state.selectedSchedFormCategoryId);
            const categoryName = catObj ? catObj.name : "Bills & Utilities";

            const newSched = {
                id: Date.now(),
                name: name,
                amount: amt,
                type: state.activeSchedFormType,
                categoryName: categoryName,
                walletId: state.selectedSchedFormWalletId,
                frequency: state.activeSchedFormFreq,
                nextDueDate: dueDate,
                notes: notes
            };

            state.scheduledPayments.push(newSched);

            // Reset inputs
            nameInput.value = "";
            amtInput.value = "";
            dateInput.value = "";
            notesInput.value = "";

            state.activeSchedFormType = "EXPENSE";
            state.activeSchedFormFreq = "MONTHLY";
            setSchedFormType("EXPENSE");
            setSchedFormFreq("MONTHLY");

            renderSettingsScheduledList();
            if (typeof renderHomeScheduledList === "function") renderHomeScheduledList();

            alert(`📅 Scheduled Payment "${name}" successfully registered. Upcoming payments will notify you on dashboard.`);
        }

