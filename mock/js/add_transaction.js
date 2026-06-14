// Add Transaction Screen: Seed Bank Account chips dynamically
function renderFormWallets() {
    const srcContainer = document.getElementById("source-wallet-chips");
    if (!srcContainer) return;
    srcContainer.innerHTML = "";
    
    const tgtContainer = document.getElementById("target-wallet-chips");
    if (!tgtContainer) return;
    tgtContainer.innerHTML = "";

    state.wallets.forEach((w, idx) => {
        const isSrcActive = state.selectedSrcWalletId === w.id;
        const srcChip = document.createElement("div");
        srcChip.className = `chip-option ${isSrcActive ? 'active' : ''}`;
        srcChip.innerHTML = `${w.name}<br><span style="font-size:9px;opacity:0.8;">₹${w.currentBalance.toLocaleString('en-IN')}</span>`;
        srcChip.onclick = () => selectWallet('src', w.id);
        srcContainer.appendChild(srcChip);

        const isTgtActive = state.selectedTgtWalletId === w.id;
        const tgtChip = document.createElement("div");
        tgtChip.className = `chip-option ${isTgtActive ? 'active' : ''}`;
        tgtChip.innerHTML = `${w.name}<br><span style="font-size:9px;opacity:0.8;">₹${w.currentBalance.toLocaleString('en-IN')}</span>`;
        tgtChip.onclick = () => selectWallet('tgt', w.id);
        tgtContainer.appendChild(tgtChip);
    });
}

// Dynamic Form categories seeder (Tied to Expense, Income, Saving selections)
function renderFormCategories() {
    const container = document.getElementById("form-category-chips");
    if (!container) return;
    container.innerHTML = "";

    const activeCats = categories[state.activeFormType] || [];
    activeCats.forEach((cat, idx) => {
        const chip = document.createElement("div");
        chip.className = `chip-option ${idx === 0 ? 'active' : ''}`;
        if (idx === 0) state.selectedCategoryId = cat.id;

        chip.innerText = cat.name;
        chip.onclick = () => {
            document.querySelectorAll("#form-category-chips .chip-option").forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            state.selectedCategoryId = cat.id;
        };
        container.appendChild(chip);
    });
}

// Relational Payment Mode filter (Bank Account select updates available modes: e.g. UPI, Debit Card)
function syncFormPaymentModes() {
    const activeModes = state.walletPaymentModes[state.selectedSrcWalletId] || [];
    const dropdownList = document.getElementById("payment-mode-dropdown-list");
    if (!dropdownList) return;
    dropdownList.innerHTML = "";

    const defaultMode = activeModes[0] || "Cash";
    document.getElementById("selected-payment-mode").innerText = defaultMode;
    state.selectedPaymentModeValue = defaultMode;

    activeModes.forEach(mode => {
        const item = document.createElement("div");
        item.className = "dropdown-menu-item";
        item.innerText = mode;
        item.onclick = () => {
            document.getElementById("selected-payment-mode").innerText = mode;
            state.selectedPaymentModeValue = mode;
            dropdownList.classList.remove("show");
        };
        dropdownList.appendChild(item);
    });
}

// Form Type toggles
function setFormType(type) {
    state.activeFormType = type;
    document.querySelectorAll(".type-toggle-btn").forEach(btn => {
        btn.classList.remove("active");
        if (btn.innerText.toUpperCase() === type) btn.classList.add("active");
    });

    const tgtSection = document.getElementById("transfer-target-section");
    const catSection = document.getElementById("category-selection-section");
    if (type === "TRANSFER") {
        if (tgtSection) tgtSection.style.display = "block";
        if (catSection) catSection.style.display = "none";
    } else {
        if (tgtSection) tgtSection.style.display = "none";
        if (catSection) catSection.style.display = "block";
        renderFormCategories();
    }
}

// Select wallet accounts inside add forms
function selectWallet(dir, walletId) {
    if (dir === 'src') {
        state.selectedSrcWalletId = walletId;
    }
    if (dir === 'tgt') {
        state.selectedTgtWalletId = walletId;
    }
    renderFormWallets();
    if (dir === 'src') syncFormPaymentModes();
}

// Toggle payment dropdown
function toggleDropdown() {
    const list = document.getElementById("payment-mode-dropdown-list");
    if (list) list.classList.toggle("show");
}

// Execute form submit
function executeFormSubmit() {
    const amtVal = parseFloat(document.getElementById("form-amount").value) || 0;
    const noteVal = document.getElementById("form-note").value.trim();

    if (amtVal <= 0) {
        alert("Please enter a valid amount greater than 0.");
        return;
    }

    const srcWallet = state.wallets.find(w => w.id === state.selectedSrcWalletId);
    
    // Category Budget check and active warnings
    if (state.activeFormType === "EXPENSE" && state.selectedCategoryId) {
        const catObj = categories.EXPENSE.find(c => c.id === state.selectedCategoryId);
        if (catObj) {
            const budgetObj = state.budgets.find(b => b.categoryName === catObj.name);
            if (budgetObj) {
                const projectedSpent = budgetObj.spent + amtVal;
                const limit = budgetObj.limit;
                if (projectedSpent > limit) {
                    if (!confirm(`⚠️ BUDGET EXCEEDED ALERT!\n\nLogging this transaction of ₹${amtVal.toLocaleString('en-IN')} will push your total spending in "${catObj.name}" to ₹${projectedSpent.toLocaleString('en-IN')}, which EXCEEDS your budget limit of ₹${limit.toLocaleString('en-IN')}.\n\nDo you want to proceed?`)) {
                        return;
                    }
                } else if (projectedSpent >= limit * 0.8) {
                    if (!confirm(`⚠️ BUDGET THRESHOLD WARNING (80%+ Used)!\n\nLogging this transaction of ₹${amtVal.toLocaleString('en-IN')} will push your spending in "${catObj.name}" to ₹${projectedSpent.toLocaleString('en-IN')} (${((projectedSpent / limit) * 100).toFixed(0)}% of your ₹${limit.toLocaleString('en-IN')} budget).\n\nDo you want to proceed?`)) {
                        return;
                    }
                }
            }
        }
    }
    
    if (state.activeFormType === "TRANSFER") {
        if (state.selectedSrcWalletId === state.selectedTgtWalletId) {
            alert("Source and target accounts must be different.");
            return;
        }
        const tgtWallet = state.wallets.find(w => w.id === state.selectedTgtWalletId);
        srcWallet.currentBalance -= amtVal;
        tgtWallet.currentBalance += amtVal;
    } else {
        if (state.activeFormType === "INCOME") {
            srcWallet.currentBalance += amtVal;
        } else {
            srcWallet.currentBalance -= amtVal;
        }

        if (state.activeFormType === "EXPENSE" && state.selectedCategoryId) {
            const catObj = categories.EXPENSE.find(c => c.id === state.selectedCategoryId);
            if (catObj) {
                const budgetObj = state.budgets.find(b => b.categoryName === catObj.name);
                if (budgetObj) {
                    budgetObj.spent += amtVal;
                }
            }
        }
    }

    let activeCatName = "";
    if (state.activeFormType !== "TRANSFER") {
        const catList = categories[state.activeFormType];
        const catObj = catList.find(c => c.id === state.selectedCategoryId);
        activeCatName = catObj ? catObj.name : "";
    }

    // Retrieve and format multiple space-separated hashtags
    let tagInputVal = document.getElementById("form-tag") ? document.getElementById("form-tag").value.trim() : "";
    let tagsArray = [];
    if (tagInputVal.length > 0) {
        tagsArray = tagInputVal.split(/\s+/)
            .map(t => t.trim())
            .filter(t => t.length > 0)
            .map(t => t.startsWith("#") ? t : "#" + t);
    }

    const newTx = {
        id: state.transactions.length + 1,
        type: state.activeFormType,
        amount: amtVal,
        walletId: state.selectedSrcWalletId,
        categoryName: activeCatName,
        paymentMode: state.selectedPaymentModeValue,
        tags: tagsArray,
        description: noteVal.length > 0 ? noteVal : (activeCatName || "Transfer"),
        timestamp: Date.now()
    };

    state.transactions.unshift(newTx);

    // Clear form fields
    document.getElementById("form-amount").value = "";
    document.getElementById("form-note").value = "";
    if (document.getElementById("form-tag")) {
        document.getElementById("form-tag").value = "";
    }

    switchPhoneTab("home");
}

// Preset Tags list & helper renderer (Supports Multi #Tag Selection)
const presetTags = ["#Personal", "#Office", "#Travel", "#Foodie", "#Medical", "#Shopping", "#Entertainment"];

function renderFormTags() {
    const container = document.getElementById("form-preset-tags");
    if (!container) return;
    container.innerHTML = "";

    const input = document.getElementById("form-tag");
    if (!input) return;

    // Parse current tags from the input box
    const currentTags = input.value.split(/\s+/)
        .map(t => t.trim())
        .filter(t => t.length > 0)
        .map(t => t.startsWith("#") ? t : "#" + t);

    presetTags.forEach(tag => {
        const isActive = currentTags.some(t => t.toLowerCase() === tag.toLowerCase());
        const chip = document.createElement("div");
        chip.className = `chip-option ${isActive ? 'active' : ''}`;
        chip.innerText = tag;
        chip.onclick = () => {
            let updatedTags = [...currentTags];
            const matchIdx = updatedTags.findIndex(t => t.toLowerCase() === tag.toLowerCase());
            if (matchIdx > -1) {
                // Tag already exists, toggle off
                updatedTags.splice(matchIdx, 1);
            } else {
                // Tag doesn't exist, toggle on
                updatedTags.push(tag);
            }
            // Format nicely as a space-separated string back in the input box
            input.value = updatedTags.join(" ");
            renderFormTags();
        };
        container.appendChild(chip);
    });

    // Hook up manual typing input to update chips highlights in real time
    if (!input.dataset.listenerAttached) {
        input.oninput = () => {
            renderFormTags();
        };
        input.dataset.listenerAttached = "true";
    }
}

// ==========================================
// Transaction Drafts Logic
// ==========================================

function renderDraftInbox() {
    const list = document.getElementById("draft-inbox-list");
    const badge = document.getElementById("draft-badge");
    
    if (state.drafts.length > 0) {
        if (badge) badge.style.display = "block";
    } else {
        if (badge) badge.style.display = "none";
    }

    if (!list) return;
    list.innerHTML = "";

    if (state.drafts.length === 0) {
        list.innerHTML = `<div style="text-align:center; color:var(--text-secondary); font-size:12px; padding: 20px;">No pending drafts.</div>`;
        return;
    }

    state.drafts.forEach(draft => {
        const item = document.createElement("div");
        item.className = "chart-card";
        item.style.padding = "16px";
        item.style.cursor = "pointer";
        item.style.display = "flex";
        item.style.alignItems = "center";
        item.style.gap = "12px";
        item.onclick = () => openDraft(draft.id);

        const isIncome = draft.type === "INCOME";
        const color = isIncome ? "var(--income)" : "var(--expense)";
        const icon = isIncome ? "south_west" : "north_east";
        const prefix = isIncome ? "+" : "-";
        const merchantText = draft.merchant ? draft.merchant : "Unknown App";

        item.innerHTML = `
            <div style="width: 40px; height: 40px; border-radius: 50%; background: ${color}22; color: ${color}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <span class="material-icons-round" style="font-size: 20px;">${icon}</span>
            </div>
            <div style="flex: 1; overflow: hidden;">
                <div style="font-weight: 600; font-size: 14px; color: var(--text-white); margin-bottom: 4px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${merchantText}</div>
                <div style="font-size: 11px; color: var(--text-secondary); display: flex; align-items: center; gap: 4px;">
                    <span class="material-icons-round" style="font-size: 10px;">mail</span>
                    ${draft.senderPackage}
                </div>
            </div>
            <div style="font-weight: 700; color: ${color}; font-size: 15px;">
                ${prefix}₹${draft.amount.toLocaleString('en-IN')}
            </div>
        `;
        list.appendChild(item);
    });
}

function openDraft(draftId) {
    const draft = state.drafts.find(d => d.id === draftId);
    if (!draft) return;

    state.activeDraftId = draftId;
    closeOverlayView("draft-inbox");

    // Populate Add Transaction Form
    setFormType(draft.type);
    document.getElementById("form-amount").value = draft.amount;
    document.getElementById("form-note").value = draft.merchant || "";

    // Show Source Banner
    const banner = document.getElementById("draft-source-banner");
    const bannerText = document.getElementById("draft-source-text");
    if (banner && bannerText) {
        banner.style.display = "flex";
        bannerText.innerText = `Drafted from ${draft.senderPackage}`;
    }

    switchPhoneTab("add");
}

function showDraftRawMessage() {
    if (!state.activeDraftId) return;
    const draft = state.drafts.find(d => d.id === state.activeDraftId);
    if (!draft) return;

    const modal = document.getElementById("raw-message-modal");
    const textNode = document.getElementById("raw-message-text");
    if (modal && textNode) {
        textNode.innerText = draft.rawMessage;
        modal.style.display = "flex";
    }
}

function closeDraftRawMessage() {
    const modal = document.getElementById("raw-message-modal");
    if (modal) modal.style.display = "none";
}

// Hook into form reset to hide banner after submit
const originalExecuteFormSubmit = executeFormSubmit;
executeFormSubmit = function() {
    originalExecuteFormSubmit();
    
    // If successfully saved (assuming switchPhoneTab clears the form conceptually)
    if (state.activeDraftId) {
        // Remove from state.drafts
        state.drafts = state.drafts.filter(d => d.id !== state.activeDraftId);
        state.activeDraftId = null;
        
        // Hide banner
        const banner = document.getElementById("draft-source-banner");
        if (banner) banner.style.display = "none";
        
        renderDraftInbox();
    }
};

// Initial Render hook
if (typeof renderDraftInbox === "function") {
    // wait for DOM loaded to attach it safely if possible, but JS is at the end of body anyway
    setTimeout(renderDraftInbox, 100);
}
