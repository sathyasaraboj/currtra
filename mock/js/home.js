        // Recent transactions seeder
        function renderHomeTransactions() {
            const listContainer = document.getElementById("home-recent-tx");
            if (!listContainer) return;
            listContainer.innerHTML = "";

            const filtered = state.transactions.filter(applyAdvancedFilters);
            if (filtered.length === 0) {
                listContainer.innerHTML = '<div style="color:var(--text-secondary); font-size:12px; padding: 10px; text-align:center;">No matching records.</div>';
                return;
            }

            filtered.slice(0, 5).forEach(tx => {
                listContainer.appendChild(createTxRow(tx));
            });
        }

        // Render outstanding debts on home tab
        function renderHomeDebts() {
            const carousel = document.getElementById("home-debts-list");
            carousel.innerHTML = "";

            const active = state.debts.filter(d => d.status === "ACTIVE");
            if (active.length === 0) {
                carousel.innerHTML = '<div style="color:var(--text-secondary); font-size:12px; padding: 10px;">No pending debts.</div>';
                return;
            }

            active.forEach(d => {
                const card = document.createElement("div");
                card.className = "debt-card-mock";
                let borderCol = d.debtType === "LENT" ? "var(--income)" : "var(--expense)";
                card.style.borderColor = borderCol;
                card.style.cursor = "pointer";
                card.onclick = () => executeSettle(d.id);

                card.innerHTML = `
                    <div class="meta">${d.debtType === "LENT" ? "Lent to" : "Borrowed from"}</div>
                    <div class="name">${d.personName}</div>
                    <div class="amt" style="color: ${d.debtType === "LENT" ? "var(--income)" : "var(--expense)"};">
                        ₹${d.amount.toLocaleString('en-IN')}
                    </div>
                `;
                carousel.appendChild(card);
            });
        }

        // Settle outstanding debt (with custom/partial amount support)
        function executeSettle(debtId) {
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
            renderHomeDebts();
            switchPhoneTab("home");
        }

        // Render scheduled reminders list on home tab
        function renderHomeScheduledList() {
            const carousel = document.getElementById("home-scheduled-list");
            if (!carousel) return;
            carousel.innerHTML = "";

            if (!state.scheduledPayments || state.scheduledPayments.length === 0) {
                carousel.innerHTML = '<div style="color:var(--text-secondary); font-size:12px; padding: 10px;">No scheduled reminders.</div>';
                return;
            }

            state.scheduledPayments.forEach(s => {
                const card = document.createElement("div");
                card.className = "debt-card-mock";
                card.style.borderColor = "var(--primary)";
                card.style.cursor = "pointer";
                card.onclick = () => {
                    if (confirm(`Log scheduled payment "${s.name}" for ₹${s.amount.toLocaleString('en-IN')}?`)) {
                        executeSchedSettle(s.id);
                    }
                };

                const today = new Date();
                today.setHours(0,0,0,0);
                const dueDate = new Date(s.nextDueDate);
                dueDate.setHours(0,0,0,0);
                const diffTime = dueDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                let dateLabel = `Due: ${s.nextDueDate}`;
                if (diffDays === 0) {
                    dateLabel = "⚠️ Due Today!";
                    card.style.borderColor = "var(--saving)";
                } else if (diffDays < 0) {
                    dateLabel = `🚨 Overdue!`;
                    card.style.borderColor = "var(--expense)";
                }

                card.innerHTML = `
                    <div class="meta">${s.frequency} ${s.type.toLowerCase()}</div>
                    <div class="name" style="font-weight:700;">${s.name}</div>
                    <div class="amt" style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                        <span style="font-size:13px; color:var(--text-white);">₹${s.amount.toLocaleString('en-IN')}</span>
                        <span style="font-size:8px; opacity:0.8; color:var(--primary); font-weight:600;">${dateLabel}</span>
                    </div>
                `;
                carousel.appendChild(card);
            });
        }

