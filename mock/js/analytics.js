// --- PROGRAMMATIC INSIGHTS & ANALYTICS CONTROLLER ---

// Local state for timeline filtering
if (typeof state !== 'undefined') {
    state.analyticsTimeRange = 'MONTH'; // DEFAULT Filter
}

// Adjust seeded transaction timestamps for dynamic analysis demonstration on startup
function adjustSeededTimestamps() {
    if (typeof state !== 'undefined' && state.transactions && state.transactions.length >= 4) {
        // Adjust timestamps to distribute them across different relative ranges:
        state.transactions[0].timestamp = Date.now() - 2 * 60 * 60 * 1000;       // Salary (2 hrs old) -> Week, Month, All
        state.transactions[1].timestamp = Date.now() - 3 * 24 * 60 * 60 * 1000;  // Shopping (3 days old) -> Week, Month, All
        state.transactions[2].timestamp = Date.now() - 10 * 24 * 60 * 60 * 1000; // Food & Dining (10 days old) -> Month, All
        state.transactions[3].timestamp = Date.now() - 40 * 24 * 60 * 60 * 1000; // Mutual Funds (40 days old) -> All
    }
}
adjustSeededTimestamps();

// Switch sub-tabs within the Analytics tab
function switchAnalyticsSubTab(tabName) {
    document.querySelectorAll("#tab-analytics .sub-view-tab-btn").forEach(btn => btn.classList.remove("active"));
    
    // Hide all sub-panels
    document.getElementById("analytics-panel-overview").style.display = "none";
    document.getElementById("analytics-panel-trends").style.display = "none";
    document.getElementById("analytics-panel-budgets").style.display = "none";
    const goalsPanel = document.getElementById("analytics-panel-goals");
    if (goalsPanel) goalsPanel.style.display = "none";

    // Close drilldown panels
    closeDrilldownPanel();

    // Show active panel
    if (tabName === 'OVERVIEW') {
        document.getElementById("analytics-sub-tab-overview").classList.add("active");
        document.getElementById("analytics-panel-overview").style.display = "block";
        renderAnalyticsOverview();
    }
    if (tabName === 'TRENDS') {
        document.getElementById("analytics-sub-tab-trends").classList.add("active");
        document.getElementById("analytics-panel-trends").style.display = "block";
        renderAnalyticsTrends();
    }
    if (tabName === 'BUDGETS') {
        document.getElementById("analytics-sub-tab-budgets").classList.add("active");
        document.getElementById("analytics-panel-budgets").style.display = "block";
        renderAnalyticsBudgets();
    }
    if (tabName === 'GOALS') {
        const btn = document.getElementById("analytics-sub-tab-goals");
        if (btn) btn.classList.add("active");
        if (goalsPanel) goalsPanel.style.display = "block";
        renderAnalyticsGoals();
    }
}

// Set active timeline filter (Week, Month, All)
function setAnalyticsTimeRange(range) {
    state.analyticsTimeRange = range;
    
    // Toggle active classes on buttons
    document.querySelectorAll(".time-filter-btn").forEach(btn => btn.classList.remove("active"));
    document.getElementById(`time-filter-${range.toLowerCase()}`).classList.add("active");
    
    // Close drilldown panels
    closeDrilldownPanel();

    // Rerender active sub-tab view to update calculations
    const activeSubTab = document.querySelector("#tab-analytics .sub-view-tab-btn.active");
    if (activeSubTab) {
        const id = activeSubTab.id;
        if (id.includes("overview")) renderAnalyticsOverview();
        else if (id.includes("trends")) renderAnalyticsTrends();
        else if (id.includes("budgets")) renderAnalyticsBudgets();
    }
}

// Filters state.transactions based on active analyticsTimeRange and active advanced filters
function getFilteredTransactions() {
    const now = Date.now();
    const range = state.analyticsTimeRange || 'MONTH';
    
    return state.transactions.filter(t => {
        const ageMs = now - t.timestamp;
        let inTimeRange = true;
        if (range === 'WEEK') {
            inTimeRange = ageMs <= 7 * 24 * 60 * 60 * 1000;
        } else if (range === 'MONTH') {
            inTimeRange = ageMs <= 30 * 24 * 60 * 60 * 1000;
        }
        return inTimeRange && applyAdvancedFilters(t);
    });
}

// Renders core high-level overview metrics
function renderAnalyticsOverview() {
    const filteredTx = getFilteredTransactions();
    
    let incSum = 0;
    let savSum = 0;
    let expSum = 0;

    filteredTx.forEach(t => {
        if (t.type === "INCOME") incSum += t.amount;
        if (t.type === "SAVING") savSum += t.amount;
        if (t.type === "EXPENSE") expSum += t.amount;
    });

    const surplus = incSum - expSum - savSum;
    const savingsRate = incSum > 0 ? Math.round((savSum / incSum) * 100) : 0;
    
    const range = state.analyticsTimeRange || 'MONTH';
    const denominatorDays = range === 'WEEK' ? 7 : range === 'MONTH' ? 30 : 90;
    const dailyAvg = Math.round(expSum / denominatorDays);
    
    // Grab cash wallet balance as disposable cash
    const cashReserve = state.wallets.find(w => w.id === 3)?.currentBalance || 0;

    // Dynamic Financial Health Score Calculator
    let healthScore = 75; // baseline
    if (surplus > 0) {
        healthScore += Math.min(Math.round((surplus / (incSum || 1)) * 20), 20); // +20 points max for positive surplus
    } else if (surplus < 0) {
        healthScore -= Math.min(Math.round((Math.abs(surplus) / (incSum || 1)) * 30), 40); // deficit penalty
    }

    if (savingsRate >= 20) {
        healthScore += 5; // ideal rate bonus
    }

    // Inspect budget violations
    state.budgets.forEach(b => {
        if (b.spent > b.limit) healthScore -= 4; // penalty for overspending
    });

    healthScore = Math.max(0, Math.min(100, healthScore));

    // Update DOM elements
    document.getElementById("analytics-health-val").innerText = `${healthScore}/100`;
    
    const healthLabel = document.getElementById("analytics-health-status");
    if (healthScore >= 80) {
        healthLabel.className = "change-indicator positive";
        healthLabel.innerHTML = `<span class="material-icons-round" style="font-size:10px;">trending_up</span>Excellent Health`;
    } else if (healthScore >= 50) {
        healthLabel.className = "change-indicator";
        healthLabel.style.color = "#FFB300";
        healthLabel.innerHTML = `<span class="material-icons-round" style="font-size:10px;">trending_flat</span>Stable Health`;
    } else {
        healthLabel.className = "change-indicator negative";
        healthLabel.innerHTML = `<span class="material-icons-round" style="font-size:10px;">trending_down</span>Needs Review`;
    }

    document.getElementById("analytics-savings-rate-val").innerText = `${savingsRate}%`;
    const savingsLabel = document.getElementById("analytics-savings-status");
    if (savingsRate >= 20) {
        savingsLabel.className = "change-indicator positive";
        savingsLabel.innerHTML = `<span class="material-icons-round" style="font-size:10px;">check_circle</span>Ideal Rate (&gt;20%)`;
    } else {
        savingsLabel.className = "change-indicator";
        savingsLabel.style.color = "#FFB300";
        savingsLabel.innerHTML = `<span class="material-icons-round" style="font-size:10px;">info</span>Below Ideal (&lt;20%)`;
    }

    const surplusVal = document.getElementById("analytics-surplus-val");
    if (surplus >= 0) {
        surplusVal.style.color = "var(--income)";
        surplusVal.innerText = `₹${surplus.toLocaleString('en-IN')}`;
        document.getElementById("analytics-surplus-label").innerText = `${range === 'WEEK' ? 'Weekly' : range === 'MONTH' ? 'Monthly' : 'All-Time'} Cash Surplus`;
        document.getElementById("analytics-surplus-desc").innerText = "Your income exceeds all spending allocations. Good job!";
    } else {
        surplusVal.style.color = "var(--expense)";
        surplusVal.innerText = `-₹${Math.abs(surplus).toLocaleString('en-IN')}`;
        document.getElementById("analytics-surplus-label").innerText = `${range === 'WEEK' ? 'Weekly' : range === 'MONTH' ? 'Monthly' : 'All-Time'} Cash Deficit`;
        document.getElementById("analytics-surplus-desc").innerText = "Warning: Outflows exceed total incoming deposits!";
    }

    document.getElementById("analytics-daily-avg-val").innerText = `₹${dailyAvg.toLocaleString('en-IN')}`;
    document.getElementById("analytics-daily-avg-period").innerText = `${denominatorDays} Days Average`;
    document.getElementById("analytics-disposable-val").innerText = `₹${cashReserve.toLocaleString('en-IN')}`;

    // Render programmatic runway intelligence card
    renderSmartInsights(incSum, savSum, expSum, dailyAvg, savingsRate);
}

// Generate premium smart runway & savings checkouts programmatically
function renderSmartInsights(incSum, savSum, expSum, dailyAvg, savingsRate) {
    const container = document.getElementById("analytics-insight-container");
    container.innerHTML = "";

    const netWorth = state.wallets.reduce((acc, curr) => acc + curr.currentBalance, 0);
    
    // Calculate simulated runway (months)
    const monthlyPace = dailyAvg * 30;
    const runwayMonths = monthlyPace > 0 ? (netWorth / monthlyPace).toFixed(1) : '∞';

    // Build automated insights list based on active state data
    const insights = [];

    // Insight A: Capital runway metrics
    insights.push({
        title: "Capital Runway Forecast",
        icon: "hourglass_empty",
        body: `Your net liquid wealth of ₹${netWorth.toLocaleString('en-IN')} will support your lifestyle for <strong>${runwayMonths} months</strong> based on a daily burn rate of ₹${dailyAvg.toLocaleString('en-IN')}.`,
        tag: `Runway: ${runwayMonths} Months`
    });

    // Insight B: High expense analysis
    const filteredTx = getFilteredTransactions();
    const catTotals = {};
    let topCatName = "";
    let topCatAmt = 0;
    
    filteredTx.forEach(t => {
        if (t.type === "EXPENSE" && t.categoryName) {
            catTotals[t.categoryName] = (catTotals[t.categoryName] || 0) + t.amount;
            if (catTotals[t.categoryName] > topCatAmt) {
                topCatAmt = catTotals[t.categoryName];
                topCatName = t.categoryName;
            }
        }
    });

    if (topCatName) {
        const totalExp = Object.values(catTotals).reduce((a, b) => a + b, 0);
        const topCatPct = Math.round((topCatAmt / (totalExp || 1)) * 100);
        insights.push({
            title: "Outflow Concentration Alert",
            icon: "warning_amber",
            body: `<strong>${topCatName}</strong> represents ${topCatPct}% of your total cost allocations in this period, summing to ₹${topCatAmt.toLocaleString('en-IN')}. Tap legend below to audit logs.`,
            tag: `Outflow: ${topCatPct}%`
        });
    }

    // Insight C: Target savings feedback
    if (savingsRate < 20) {
        const gapVal = Math.round((incSum * 0.20) - savSum);
        insights.push({
            title: "Savings Rate Booster",
            icon: "trending_up",
            body: `Your savings rate is ${savingsRate}%. Allocate an additional ₹${gapVal.toLocaleString('en-IN')} to Savings (e.g. Mutual Funds) to achieve the standard 20% financial stability benchmark.`,
            tag: "Savings Boost Required"
        });
    } else {
        insights.push({
            title: "Compounding Mastery",
            icon: "stars",
            body: `Excellent! Your savings rate of ${savingsRate}% exceeds the standard 20% healthy threshold. Your investments are compounding wealth at an accelerated rate.`,
            tag: "Ideal Wealth Building"
        });
    }

    // Pick one insight to display based on some rotation or list them together beautifully!
    // To ensure ultimate data density and "wow" factor, let's display a beautiful list of the top two critical insights!
    insights.slice(0, 2).forEach(ins => {
        const card = document.createElement("div");
        card.className = "insight-card";
        card.style.marginBottom = "12px";
        card.innerHTML = `
            <div class="header-row">
                <span class="material-icons-round insight-icon">${ins.icon}</span>
                <span class="insight-title">${ins.title}</span>
            </div>
            <div class="insight-body">${ins.body}</div>
            <div class="insight-metric-tag">${ins.tag}</div>
        `;
        container.appendChild(card);
    });
}

// Renders the Conic Gradient spending donut breakdown & Legend list
function renderAnalyticsTrends() {
    const filteredTx = getFilteredTransactions();
    
    let expSum = 0;
    const catTotals = {};

    // Get active expenses
    filteredTx.forEach(t => {
        if (t.type === "EXPENSE") {
            expSum += t.amount;
            if (t.categoryName) {
                catTotals[t.categoryName] = (catTotals[t.categoryName] || 0) + t.amount;
            }
        }
    });

    const range = state.analyticsTimeRange || 'MONTH';
    document.getElementById("analytics-total-exp-label").innerText = `Total: ₹${expSum.toLocaleString('en-IN')}`;

    const sortedCats = [];
    Object.keys(catTotals).forEach(catName => {
        sortedCats.push({ name: catName, amount: catTotals[catName] });
    });
    sortedCats.sort((a, b) => b.amount - a.amount);

    const legendContainer = document.getElementById("analytics-donut-legend");
    legendContainer.innerHTML = "";

    const colors = ["var(--expense)", "#FFB300", "var(--saving)", "var(--primary)", "#9C27B0", "#E91E63", "#00BCD4"];
    
    if (sortedCats.length === 0 || expSum === 0) {
        document.getElementById("analytics-donut-graphic").style.background = "conic-gradient(#333 0% 100%)";
        document.getElementById("analytics-donut-center-val").innerText = "₹0 spent";
        legendContainer.innerHTML = `<div style="text-align:center; padding: 20px; color:var(--text-secondary); font-size:12px;">No recorded expenses in this timeline range.</div>`;
        return;
    }

    let gradientSegments = [];
    let currentPercentage = 0;

    sortedCats.forEach((cat, idx) => {
        const pct = Math.round((cat.amount / expSum) * 100);
        const color = colors[idx % colors.length];

        gradientSegments.push(`${color} ${currentPercentage}% ${currentPercentage + pct}%`);
        currentPercentage += pct;

        // Render interactive legend item
        const item = document.createElement("div");
        item.className = "legend-item";
        item.style.cursor = "pointer";
        item.innerHTML = `
            <div class="legend-item-left">
                <span class="legend-color-dot" style="background-color: ${color};"></span>
                <span class="legend-item-title">${cat.name}</span>
            </div>
            <div>
                <span style="font-size:11px; color:var(--text-secondary); margin-right:8px;">₹${cat.amount.toLocaleString('en-IN')}</span>
                <span class="legend-item-pct">${pct}%</span>
            </div>
        `;
        // Dynamic Click Handler to launch interactive Category Audit drilldown panel
        item.onclick = () => selectCategoryDrilldown(cat.name, cat.amount, color);
        legendContainer.appendChild(item);
    });

    // Make donut graphic clickable to trigger general breakdown audit
    document.getElementById("analytics-donut-graphic").onclick = () => {
        if (sortedCats[0]) {
            selectCategoryDrilldown(sortedCats[0].name, sortedCats[0].amount, colors[0]);
        }
    };

    // Handle rounding padding to 100%
    if (currentPercentage < 100 && gradientSegments.length > 0) {
        const color = colors[(gradientSegments.length - 1) % colors.length];
        gradientSegments[gradientSegments.length - 1] = `${color} ${currentPercentage - Math.round((sortedCats[sortedCats.length - 1].amount / expSum) * 100)}% 100%`;
    }

    // Apply conic gradient background
    document.getElementById("analytics-donut-graphic").style.background = `conic-gradient(${gradientSegments.join(', ')})`;
    document.getElementById("analytics-donut-center-val").innerText = `₹${expSum.toLocaleString('en-IN')}`;

    // Update Cash Flow chronology heights based on active filter range
    updateChronologyHeights();
}

// Helper to make vertical cash flow bars update relative to filters
function updateChronologyHeights() {
    const range = state.analyticsTimeRange || 'MONTH';
    
    // Define relative height profiles to simulate real week variations
    let heights = [
        { inc: 55, exp: 35 },
        { inc: 78, exp: 48 },
        { inc: 64, exp: 52 },
        { inc: 92, exp: 58 }
    ];

    if (range === 'WEEK') {
        heights = [
            { inc: 88, exp: 20 },
            { inc: 0, exp: 12 },
            { inc: 0, exp: 35 },
            { inc: 30, exp: 10 }
        ];
        document.getElementById("analytics-chronology-title").innerText = "This Week's Chronology";
        document.getElementById("trends-label-wk1").innerText = "Mon";
        document.getElementById("trends-label-wk2").innerText = "Tue";
        document.getElementById("trends-label-wk3").innerText = "Wed";
        document.getElementById("trends-label-wk4").innerText = "Thu";
    } else if (range === 'ALL') {
        heights = [
            { inc: 70, exp: 40 },
            { inc: 85, exp: 60 },
            { inc: 95, exp: 55 },
            { inc: 75, exp: 65 }
        ];
        document.getElementById("analytics-chronology-title").innerText = "Quarterly Chronology";
        document.getElementById("trends-label-wk1").innerText = "Q1";
        document.getElementById("trends-label-wk2").innerText = "Q2";
        document.getElementById("trends-label-wk3").innerText = "Q3";
        document.getElementById("trends-label-wk4").innerText = "Q4";
    } else {
        document.getElementById("analytics-chronology-title").innerText = "4 Week Chronology";
        document.getElementById("trends-label-wk1").innerText = "Wk 1";
        document.getElementById("trends-label-wk2").innerText = "Wk 2";
        document.getElementById("trends-label-wk3").innerText = "Wk 3";
        document.getElementById("trends-label-wk4").innerText = "Wk 4";
    }

    heights.forEach((h, idx) => {
        const incBar = document.getElementById(`trends-bar-inc${idx + 1}`);
        const expBar = document.getElementById(`trends-bar-exp${idx + 1}`);
        if (incBar && expBar) {
            incBar.style.height = `${h.inc}px`;
            expBar.style.height = `${h.exp}px`;
        }
    });
}

// Click Handler: Legend Item Category Drilldown Auditor
function selectCategoryDrilldown(catName, totalAmount, color) {
    const filteredTx = getFilteredTransactions();
    
    // Filter transactions contributing to this specific category
    const catTx = filteredTx.filter(t => t.categoryName === catName);
    
    // Open interactive audit drawer card
    const panel = document.getElementById("analytics-drilldown-panel");
    panel.style.display = "block";

    document.getElementById("drilldown-title").innerText = `${catName} Outflow Breakdown`;
    
    const count = catTx.length;
    const avg = count > 0 ? Math.round(totalAmount / count) : 0;

    document.getElementById("drilldown-stats-row").innerHTML = `
        <div class="drilldown-stat-item">
            <span class="lbl" style="color:${color}">Total Spent</span>
            <span class="val">₹${totalAmount.toLocaleString('en-IN')}</span>
        </div>
        <div class="drilldown-stat-item">
            <span class="lbl">Audit Count</span>
            <span class="val">${count} Tx</span>
        </div>
        <div class="drilldown-stat-item">
            <span class="lbl">Average Size</span>
            <span class="val">₹${avg.toLocaleString('en-IN')}</span>
        </div>
    `;

    // Populate transaction lists dynamically
    const txContainer = document.getElementById("drilldown-transactions-list");
    txContainer.innerHTML = "";

    if (catTx.length === 0) {
        txContainer.innerHTML = `<div style="text-align:center; padding:12px; color:var(--text-secondary); font-size:11px;">No transactions recorded.</div>`;
    } else {
        catTx.forEach(t => {
            const row = createTxRow(t);
            txContainer.appendChild(row);
        });
    }

    // Highlight selected bar chronology style
    document.querySelectorAll('.trends-bar-pair-container').forEach(c => c.classList.remove('active'));
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Click Handler: Chronology week selector bar click
function selectChronologyWeek(weekNum) {
    // Apply visual highlight outline to clicked week container
    document.querySelectorAll('.trends-bar-pair-container').forEach(c => c.classList.remove('active'));
    const clickedContainer = document.getElementById(`trends-bar-wk${weekNum}`);
    if (clickedContainer) clickedContainer.classList.add('active');

    const range = state.analyticsTimeRange || 'MONTH';
    let timeLabel = `Week ${weekNum}`;
    
    if (range === 'WEEK') {
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday"];
        timeLabel = days[weekNum - 1] || `Day ${weekNum}`;
    } else if (range === 'ALL') {
        timeLabel = `Quarter ${weekNum}`;
    }

    const panel = document.getElementById("analytics-drilldown-panel");
    panel.style.display = "block";
    
    document.getElementById("drilldown-title").innerText = `${timeLabel} Cash Auditor`;

    // Mock realistic week metrics reflecting graph balance pairs
    let inc = 0;
    let exp = 0;

    if (range === 'WEEK') {
        if (weekNum === 1) { inc = 54000; exp = 0; }
        if (weekNum === 2) { inc = 0; exp = 2000; }
        if (weekNum === 3) { inc = 0; exp = 4000; }
        if (weekNum === 4) { inc = 10000; exp = 1500; }
    } else if (range === 'ALL') {
        if (weekNum === 1) { inc = 70000; exp = 40000; }
        if (weekNum === 2) { inc = 85000; exp = 60000; }
        if (weekNum === 3) { inc = 95000; exp = 55000; }
        if (weekNum === 4) { inc = 75000; exp = 65000; }
    } else {
        // Standard month weeks
        if (weekNum === 1) { inc = 12000; exp = 7500; }  // Includes Shopping
        if (weekNum === 2) { inc = 16000; exp = 4000; }  // Includes Food
        if (weekNum === 3) { inc = 14000; exp = 0; }     // Safe period
        if (weekNum === 4) { inc = 12000; exp = 12500; } // Includes SIP saving
    }

    const surplus = inc - exp;

    document.getElementById("drilldown-stats-row").innerHTML = `
        <div class="drilldown-stat-item">
            <span class="lbl" style="color:var(--income)">Income</span>
            <span class="val">₹${inc.toLocaleString('en-IN')}</span>
        </div>
        <div class="drilldown-stat-item">
            <span class="lbl" style="color:var(--expense)">Expenses</span>
            <span class="val">₹${exp.toLocaleString('en-IN')}</span>
        </div>
        <div class="drilldown-stat-item">
            <span class="lbl">Net Cashflow</span>
            <span class="val" style="color:${surplus >= 0 ? 'var(--income)' : 'var(--expense)'}">₹${surplus.toLocaleString('en-IN')}</span>
        </div>
    `;

    // Extract transaction items relating to this time bracket
    const txContainer = document.getElementById("drilldown-transactions-list");
    txContainer.innerHTML = "";

    const filteredTx = getFilteredTransactions();
    const chronologyTx = filteredTx.filter(t => {
        const ageMs = Date.now() - t.timestamp;
        const ageDays = ageMs / (24 * 60 * 60 * 1000);
        
        if (range === 'WEEK') {
            // Group based on days offset
            if (weekNum === 1) return ageDays <= 1; // Mon
            if (weekNum === 2) return ageDays > 1 && ageDays <= 3; // Tue
            if (weekNum === 3) return ageDays > 3 && ageDays <= 5; // Wed
            return ageDays > 5; // Thu
        } else if (range === 'ALL') {
            // Group by quarters (demonstration blocks)
            if (weekNum === 1) return ageDays <= 15;
            if (weekNum === 2) return ageDays > 15 && ageDays <= 35;
            if (weekNum === 3) return ageDays > 35 && ageDays <= 60;
            return ageDays > 60;
        } else {
            // Group by 4 calendar weeks
            if (weekNum === 1) return ageDays <= 7;
            if (weekNum === 2) return ageDays > 7 && ageDays <= 14;
            if (weekNum === 3) return ageDays > 14 && ageDays <= 21;
            return ageDays > 21;
        }
    });

    if (chronologyTx.length === 0) {
        txContainer.innerHTML = `<div style="text-align:center; padding:12px; color:var(--text-secondary); font-size:11px;">No transaction logs found in this timeframe chunk.</div>`;
    } else {
        chronologyTx.forEach(t => {
            const row = createTxRow(t);
            txContainer.appendChild(row);
        });
    }

    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Close category drilldown drawer
function closeDrilldownPanel() {
    const panel = document.getElementById("analytics-drilldown-panel");
    if (panel) panel.style.display = "none";
    document.querySelectorAll('.trends-bar-pair-container').forEach(c => c.classList.remove('active'));
}

// Renders the Monthly Budgets progress trackers inside Analytics
function renderAnalyticsBudgets() {
    const listContainer = document.getElementById("analytics-budget-meters-list");
    listContainer.innerHTML = "";

    if (state.budgets.length === 0) {
        listContainer.innerHTML = `<div style="text-align:center; padding: 24px; color:var(--text-secondary); font-size:12px;">No active budgets configured.</div>`;
        return;
    }

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

// Renders the Savings Goals progress trackers & contribution workflows inside Analytics
function renderAnalyticsGoals() {
    const listContainer = document.getElementById("analytics-goals-list");
    if (!listContainer) return;
    listContainer.innerHTML = "";

    if (!state.savingsGoals || state.savingsGoals.length === 0) {
        listContainer.innerHTML = `<div style="text-align:center; padding: 24px; color:var(--text-secondary); font-size:12px;">No savings goals configured. Create one below!</div>`;
        return;
    }

    state.savingsGoals.forEach(g => {
        const percent = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
        let color = "var(--saving)"; // savings gold/blue tint
        let statusText = `₹${g.currentAmount.toLocaleString('en-IN')} saved of ₹${g.targetAmount.toLocaleString('en-IN')} (Target: ${g.targetDate})`;

        const card = document.createElement("div");
        card.className = "budget-row"; // reuse the premium card design
        card.innerHTML = `
            <div class="budget-info-row">
                <div>
                    <h4 class="budget-category-title" style="color:var(--text-white); font-weight:700;">${g.name}</h4>
                    <span class="budget-detail-limit" style="font-size:10px; color:var(--text-secondary);">${statusText}</span>
                </div>
                <div style="font-size: 11px; font-weight: 800; color: var(--saving);">${percent.toFixed(0)}%</div>
            </div>
            <div class="progress-track" style="background-color: rgba(255,255,255,0.05); height: 8px; border-radius: 4px; overflow: hidden; margin: 8px 0;">
                <div class="progress-bar-fill" style="width: ${percent}%; background-color: ${color}; height: 100%; border-radius: 4px; box-shadow: 0 0 10px rgba(197, 168, 128, 0.3);"></div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                <button class="submit-btn" style="padding: 4px 8px; font-size: 10px; margin: 0; width: auto; background-color: rgba(197,168,128,0.15); border: 1px solid var(--primary); color: var(--primary);" onclick="contributeToGoal(${g.id})">Add Funds</button>
                <span class="material-icons-round" style="color:var(--expense); font-size:16px; cursor:pointer;" onclick="deleteSavingsGoal(${g.id})">delete</span>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

function contributeToGoal(goalId) {
    const goal = state.savingsGoals.find(g => g.id === goalId);
    if (!goal) return;

    const wallet = state.wallets[0]; // primary bank account
    const inputAmt = prompt(`Deduct funds from "${wallet.name}" to allocate to "${goal.name}".\n\nEnter contribution amount (INR):`);
    if (inputAmt === null) return;

    const amt = parseFloat(inputAmt);
    if (isNaN(amt) || amt <= 0) {
        alert("Please enter a valid positive contribution amount.");
        return;
    }

    if (wallet.currentBalance < amt) {
        alert(`Insufficient balance in ${wallet.name} (Available: ₹${wallet.currentBalance.toLocaleString('en-IN')}).`);
        return;
    }

    // Deduct and add
    wallet.currentBalance -= amt;
    goal.currentAmount += amt;

    // Log a corresponding ledger transaction
    const newTx = {
        id: state.transactions.length + 1,
        type: "SAVING",
        amount: amt,
        walletId: wallet.id,
        categoryName: "Emergency Fund", // standard savings category
        paymentMode: "Internet Banking",
        tags: ["#SavingsGoals"],
        description: `Goal Allocation: ${goal.name}`,
        timestamp: Date.now()
    };
    state.transactions.unshift(newTx);

    alert(`✅ Contributed ₹${amt.toLocaleString('en-IN')} to "${goal.name}".\nDeducted from ${wallet.name}.`);

    if (typeof calculateBalances === "function") calculateBalances();
    renderAnalyticsGoals();
}

function deleteSavingsGoal(goalId) {
    if (!confirm("Are you sure you want to remove this savings goal?")) return;
    state.savingsGoals = state.savingsGoals.filter(g => g.id !== goalId);
    renderAnalyticsGoals();
}

function addCustomSavingsGoal() {
    const name = document.getElementById("goal-name-input").value.trim();
    const targetAmt = parseFloat(document.getElementById("goal-target-input").value);
    const date = document.getElementById("goal-date-input").value;

    if (!name) {
        alert("Please enter a goal name.");
        return;
    }
    if (isNaN(targetAmt) || targetAmt <= 0) {
        alert("Please enter a valid target amount.");
        return;
    }
    if (!date) {
        alert("Please select a target date.");
        return;
    }

    const newGoal = {
        id: (state.savingsGoals ? state.savingsGoals.length : 0) + 1,
        name: name,
        targetAmount: targetAmt,
        currentAmount: 0,
        targetDate: date
    };

    if (!state.savingsGoals) state.savingsGoals = [];
    state.savingsGoals.push(newGoal);

    // Clear fields
    document.getElementById("goal-name-input").value = "";
    document.getElementById("goal-target-input").value = "";
    document.getElementById("goal-date-input").value = "";

    alert(`✅ Savings Goal "${name}" created successfully!`);
    renderAnalyticsGoals();
}
