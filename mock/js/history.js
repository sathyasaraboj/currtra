        // Populate history transactions list
        function renderHistoryTransactions(filterText = "") {
            const historyContainer = document.getElementById("history-tx-list");
            if (!historyContainer) return;
            historyContainer.innerHTML = "";

            const filtered = state.transactions.filter(tx => {
                const desc = tx.description ? tx.description.toLowerCase() : "";
                const cat = tx.categoryName ? tx.categoryName.toLowerCase() : "";
                const mode = tx.paymentMode ? tx.paymentMode.toLowerCase() : "";
                const term = filterText.toLowerCase();
                
                const matchesSearch = desc.includes(term) || cat.includes(term) || mode.includes(term);
                return matchesSearch && applyAdvancedFilters(tx);
            });

            if (filtered.length === 0) {
                historyContainer.innerHTML = '<div style="text-align:center; padding: 20px; color:var(--text-secondary); font-size:12px;">No matching records found.</div>';
            } else {
                filtered.forEach(tx => {
                    historyContainer.appendChild(createTxRow(tx));
                });
            }
        }

        // Search log filter handler
        const txSearchBar = document.getElementById("tx-search-bar");
        if (txSearchBar) {
            txSearchBar.oninput = function(e) {
                renderHistoryTransactions(e.target.value);
            };
        }

