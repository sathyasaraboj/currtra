        // Render budget progress indicators
        function renderBudgets() {
            const listContainer = document.getElementById("budget-meters-list");
            listContainer.innerHTML = "";

            state.budgets.forEach(b => {
                let percent = (b.spent / b.limit) * 100;
                let color = "var(--income)";
                let statusText = "Spent smoothly";
                
                if (percent >= 100) {
                    color = "var(--expense)";
                    statusText = `Overspent by ₹${(b.spent - b.limit).toLocaleString('en-IN')}!`;
                } else if (percent >= 80) {
                    color = "#FFB300"; // gold warning
                    statusText = `Warning: Used ${percent.toFixed(0)}% limit.`;
                } else {
                    statusText = `Remaining: ₹${(b.limit - b.spent).toLocaleString('en-IN')}`;
                }

                const card = document.createElement("div");
                card.className = "budget-row";
                card.innerHTML = `
                    <div class="budget-info-row">
                        <div>
                            <h4 class="budget-category-title">${b.categoryName}</h4>
                            <span class="budget-detail-limit">₹${b.spent.toLocaleString('en-IN')} spent of ₹${b.limit.toLocaleString('en-IN')} limit</span>
                        </div>
                    </div>
                    <div class="progress-track">
                        <div class="progress-bar-fill" style="width: ${Math.min(percent, 100)}%; background-color: ${color};"></div>
                    </div>
                    <div class="budget-warning" style="color: ${color};">${statusText}</div>
                `;
                listContainer.appendChild(card);
            });
        }

