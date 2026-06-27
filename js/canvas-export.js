// js/canvas-export.js

const ENGLISH_MONTHS = {
    1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June",
    7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December"
};

// Local date formatter helper for range reporting
function formatDateRange(dateStr) {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
}

// Generate Beautiful WhatsApp Formatted Text in English with detailed entries
function generateWhatsAppText(summary, incomeHeads, expenseHeads) {
    const fromFormatted = formatDateRange(summary.fromDate);
    const toFormatted = formatDateRange(summary.toDate);
    
    let text = `🌸 *Orchid Heights Society* 🌸\n`;
    if (summary.filterHeadName) {
        text += `📊 *Category Statement: ${summary.filterHeadName}*\n`;
    } else {
        text += `📊 *Accounts Statement*\n`;
    }
    text += `📅 *Period:* ${fromFormatted} to ${toFormatted}\n`;
    text += `=========================\n\n`;
    
    text += `💰 *Total Income:* ₹ ${summary.totalIncome.toLocaleString('en-IN')}\n`;
    text += `💸 *Total Expense:* ₹ ${summary.totalExpense.toLocaleString('en-IN')}\n`;
    text += `🏦 *Net Savings:* ₹ ${(summary.totalIncome - summary.totalExpense).toLocaleString('en-IN')}\n`;
    text += `-------------------------\n`;
    text += `👉 *Opening Balances:* (Total: ₹ ${summary.openingBalance.toLocaleString('en-IN')})\n`;
    text += `   • Cash: ₹ ${(summary.opening.cash || 0).toLocaleString('en-IN')}\n`;
    text += `   • CBI Bank: ₹ ${(summary.opening.bank_cbi || 0).toLocaleString('en-IN')}\n`;
    text += `   • JCOM Bank: ₹ ${(summary.opening.bank_jcom || 0).toLocaleString('en-IN')}\n`;
    text += `   • FD: ₹ ${(summary.opening.fd || 0).toLocaleString('en-IN')}\n`;
    text += `👉 *Closing Balances:* (Total: ₹ ${summary.closingBalance.toLocaleString('en-IN')})\n`;
    text += `   • Cash: ₹ ${(summary.closing.cash || 0).toLocaleString('en-IN')}\n`;
    text += `   • CBI Bank: ₹ ${(summary.closing.bank_cbi || 0).toLocaleString('en-IN')}\n`;
    text += `   • JCOM Bank: ₹ ${(summary.closing.bank_jcom || 0).toLocaleString('en-IN')}\n`;
    text += `   • FD: ₹ ${(summary.closing.fd || 0).toLocaleString('en-IN')}\n\n`;
    
    text += `📊 *Transaction Details:*\n`;
    text += `-------------------------\n`;
    const transactions = summary.transactions || [];
    if (transactions.length === 0) {
        text += `  No transactions recorded in this period.\n`;
    } else {
        const sortedTxs = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
        sortedTxs.forEach((tx, idx) => {
            const dateParts = tx.date.split("-");
            const dateStr = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}` : tx.date;
            
            const head = tx.type === "income" 
                ? incomeHeads.find(h => h.id === tx.headId) 
                : expenseHeads.find(h => h.id === tx.headId);
            const headName = head ? head.name_en : tx.headId;
            
            let sign = tx.type === "income" ? "🟢 +" : "🔴 -";
            let contraDirection = "";
            if (tx.headId === "contra_withdrawal") {
                sign = "🔵 ⇄";
                contraDirection = " (Bank ➔ Cash)";
            } else if (tx.headId === "contra_deposit") {
                sign = "🔵 ⇄";
                contraDirection = " (Cash ➔ Bank)";
            }
            const desc = tx.description ? ` (${tx.description})` : "";
            
            text += `${idx + 1}. [${dateStr}] ${headName}${contraDirection}${desc}: ${sign} ₹ ${parseFloat(tx.amount).toLocaleString('en-IN')}\n`;
        });
    }

    text += `\n=========================\n`;
    text += `📝 _Note: For any queries regarding this statement, please contact the committee._\n`;
    text += `🌸 *Orchid Heights Management Committee*`;
    
    return text;
}

// Draw and Download the WhatsApp Image Card
function exportReportToImage(summary, incomeHeads, expenseHeads, logoUrl, callback) {
    const transactions = summary.transactions || [];
    const txCount = Math.max(1, transactions.length);
    const rowHeight = 45;
    const tableHeight = 40 + (txCount * rowHeight) + 40;
    
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 450 + tableHeight + 110;
    const ctx = canvas.getContext("2d");

    // 1. Draw Background (Solid White)
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Load Logo and Draw Header
    const drawHeader = (logoImg) => {
        const logoSize = 90;
        const logoX = 50;
        const logoY = 40;

        if (logoImg) {
            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
        } else {
            ctx.save();
            ctx.translate(logoX + 45, logoY + 45);
            ctx.fillStyle = "#ec407a";
            for (let i = 0; i < 6; i++) {
                ctx.beginPath();
                ctx.ellipse(0, -18, 14, 25, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.rotate(Math.PI / 3);
            }
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        ctx.fillStyle = "#2c3e50";
        ctx.font = "bold 32px 'Outfit', 'Inter', sans-serif";
        ctx.fillText("ORCHID HEIGHTS", 160, 75);

        ctx.fillStyle = "#ec407a";
        ctx.font = "bold 20px 'Outfit', 'Inter', sans-serif";
        const subtitleText = summary.filterHeadName ? `Category Statement: ${summary.filterHeadName}` : "Accounts Statement";
        ctx.fillText(subtitleText, 160, 105);

        ctx.fillStyle = "#000000";
        ctx.font = "14px 'Outfit', 'Inter', sans-serif";
        ctx.fillText(`Report Date: ${new Date().toLocaleDateString('en-US')}`, 160, 125);

        ctx.strokeStyle = "rgba(236, 64, 122, 0.2)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(50, 155);
        ctx.lineTo(750, 155);
        ctx.stroke();

        const fromFormatted = formatDateRange(summary.fromDate);
        const toFormatted = formatDateRange(summary.toDate);
        ctx.fillStyle = "#2c3e50";
        ctx.font = "bold 22px 'Outfit', 'Inter', sans-serif";
        ctx.fillText(`Period: ${fromFormatted} to ${toFormatted}`, 50, 195);

        const cardY = 220;
        const cardHeight = 110;
        const cardWidth = 216;
        const cardGap = 26;

        drawCard(ctx, 50, cardY, cardWidth, cardHeight, "#e8f5e9", "#2e7d32", "TOTAL INCOME", `₹ ${summary.totalIncome.toLocaleString('en-IN')}`);
        drawCard(ctx, 50 + cardWidth + cardGap, cardY, cardWidth, cardHeight, "#ffebee", "#c62828", "TOTAL EXPENSE", `₹ ${summary.totalExpense.toLocaleString('en-IN')}`);

        const savings = summary.totalIncome - summary.totalExpense;
        const savingsBg = savings >= 0 ? "#fce4ec" : "#efebe9";
        const savingsColor = savings >= 0 ? "#c2185b" : "#4e342e";
        drawCard(ctx, 50 + (cardWidth + cardGap) * 2, cardY, cardWidth, cardHeight, savingsBg, savingsColor, "NET SAVINGS", `₹ ${savings.toLocaleString('en-IN')}`);

        ctx.fillStyle = "#fafafa";
        ctx.strokeStyle = "#e0e0e0";
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, 50, 350, 700, 70, 8, true, true);
        
        ctx.fillStyle = "#000000";
        ctx.font = "bold 13px 'Inter', sans-serif";
        ctx.fillText("OPENING BALANCES", 65, 375);
        ctx.font = "13px 'Inter', sans-serif";
        ctx.fillText(`Cash: ₹${(summary.opening.cash || 0).toLocaleString('en-IN')}`, 220, 375);
        ctx.fillText(`CBI: ₹${(summary.opening.bank_cbi || 0).toLocaleString('en-IN')}`, 370, 375);
        ctx.fillText(`JCOM: ₹${(summary.opening.bank_jcom || 0).toLocaleString('en-IN')}`, 520, 375);
        ctx.font = "bold 13px 'Inter', sans-serif";
        ctx.fillText(`Total: ₹${(summary.openingBalance || 0).toLocaleString('en-IN')}`, 665, 375);
        
        ctx.fillStyle = "#000000";
        ctx.font = "bold 13px 'Inter', sans-serif";
        ctx.fillText("CLOSING BALANCES", 65, 403);
        ctx.font = "13px 'Inter', sans-serif";
        ctx.fillText(`Cash: ₹${(summary.closing.cash || 0).toLocaleString('en-IN')}`, 220, 403);
        ctx.fillText(`CBI: ₹${(summary.closing.bank_cbi || 0).toLocaleString('en-IN')}`, 370, 403);
        ctx.fillText(`JCOM: ₹${(summary.closing.bank_jcom || 0).toLocaleString('en-IN')}`, 520, 403);
        ctx.font = "bold 13px 'Inter', sans-serif";
        ctx.fillStyle = "#ec407a";
        ctx.fillText(`Total: ₹${(summary.closingBalance || 0).toLocaleString('en-IN')}`, 665, 403);

        const tableY = 450;
        drawLedgerTable(ctx, 50, tableY, 700, "Transaction Ledger", transactions, incomeHeads, expenseHeads);

        const footerY = canvas.height - 80;
        ctx.strokeStyle = "rgba(236, 64, 122, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(50, footerY - 20);
        ctx.lineTo(750, footerY - 20);
        ctx.stroke();

        ctx.fillStyle = "#000000";
        ctx.font = "italic 14px 'Inter', sans-serif";
        ctx.fillText("Report generated by 🌸 Orchid Heights Accounting Software.", 50, footerY + 10);

        ctx.fillStyle = "#2c3e50";
        ctx.font = "bold 15px 'Inter', sans-serif";
        ctx.textAlign = "right";
        ctx.fillText("Management Committee", 750, footerY + 5);
        ctx.font = "13px 'Inter', sans-serif";
        ctx.fillText("🌸 Orchid Heights Society", 750, footerY + 25);
        ctx.textAlign = "left";

        try {
            callback(canvas.toDataURL("image/png"));
        } catch (e) {
            console.warn("Canvas export failed (likely tainted due to local file restrictions). Retrying with a clean canvas and vector fallback...", e);
            exportReportToImage(summary, incomeHeads, expenseHeads, null, callback);
            alert("Note: To export reports with the original society logo when running locally from a folder, please upload the logo file once in the 'Society Logo Setup' section under the 'Backup & Restore' tab.");
        }
    };

    if (logoUrl) {
        const img = new Image();
        if (logoUrl.startsWith("http") && !logoUrl.startsWith("data:")) {
            img.crossOrigin = "anonymous";
        }
        img.onload = () => drawHeader(img);
        img.onerror = () => drawHeader(null);
        img.src = logoUrl;
    } else {
        drawHeader(null);
    }
}

// Helper to draw rounded cards
function drawCard(ctx, x, y, width, height, bgColor, textColor, label, value) {
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = "rgba(0,0,0,0.02)";
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, x, y, width, height, 12, true, true);

    ctx.fillStyle = textColor;
    drawRoundedRect(ctx, x, y, 6, height, {tl: 12, tr: 0, bl: 12, br: 0}, true, false);

    ctx.fillStyle = "#000000";
    ctx.font = "bold 13px 'Inter', sans-serif";
    ctx.fillText(label, x + 20, y + 36);

    ctx.fillStyle = textColor;
    ctx.font = "bold 24px 'Inter', sans-serif";
    ctx.fillText(value, x + 20, y + 82);
}

// Helper to draw detailed transaction ledger table
function drawLedgerTable(ctx, x, y, width, title, transactions, incomeHeads, expenseHeads) {
    ctx.fillStyle = "#2c3e50";
    ctx.font = "bold 18px 'Inter', sans-serif";
    ctx.fillText(title, x, y);

    const headerY = y + 15;
    const headerHeight = 35;
    ctx.fillStyle = "#f5f7fa";
    drawRoundedRect(ctx, x, headerY, width, headerHeight, 6, true, false);

    ctx.fillStyle = "#000000";
    ctx.font = "bold 12px 'Inter', sans-serif";
    ctx.fillText("DATE", x + 15, headerY + 22);
    ctx.fillText("TYPE", x + 110, headerY + 22);
    ctx.fillText("PARTICULARS (CATEGORY & DESCRIPTION)", x + 200, headerY + 22);
    ctx.textAlign = "right";
    ctx.fillText("AMOUNT", x + width - 15, headerY + 22);
    ctx.textAlign = "left";

    let rowY = headerY + headerHeight + 10;
    const rowHeight = 45;
    let totalIncome = 0;
    let totalExpense = 0;

    const sortedTxs = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedTxs.forEach((tx, index) => {
        const isInc = tx.type === "income";
        const isContra = tx.headId === "contra_withdrawal" || tx.headId === "contra_deposit";
        const amt = parseFloat(tx.amount) || 0;
        if (!isContra) {
            if (isInc) totalIncome += amt;
            else totalExpense += amt;
        }

        const dateParts = tx.date.split("-");
        const dateStr = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0].substring(2)}` : tx.date;
        ctx.fillStyle = "#2c3e50";
        ctx.font = "13px 'Inter', sans-serif";
        ctx.fillText(dateStr, x + 15, rowY + 18);

        if (isContra) {
            ctx.fillStyle = "#e0f2fe";
        } else {
            ctx.fillStyle = isInc ? "#e8f5e9" : "#ffebee";
        }
        drawRoundedRect(ctx, x + 110, rowY + 3, 70, 22, 11, true, false);

        if (isContra) {
            ctx.fillStyle = "#0369a1";
        } else {
            ctx.fillStyle = isInc ? "#2e7d32" : "#c62828";
        }
        ctx.font = "bold 11px 'Inter', sans-serif";
        ctx.fillText(isContra ? "CONTRA" : (isInc ? "INCOME" : "EXPENSE"), x + 120, rowY + 18);

        const head = isInc 
            ? incomeHeads.find(h => h.id === tx.headId) 
            : expenseHeads.find(h => h.id === tx.headId);
        const headName = head ? head.name_en : tx.headId;

        let particularsStr = headName;
        if (tx.headId === "contra_withdrawal") {
            const srcBank = tx.paymentMode === "Bank: JCOM" ? "The Junagadh Commercial Co-Operative Bank Ltd. (JCOM)" : "Central Bank of India (CBI)";
            particularsStr = `Contra: Cash Withdrawal from ${srcBank}`;
        } else if (tx.headId === "contra_deposit") {
            const destBank = tx.paymentMode === "Bank: JCOM" ? "The Junagadh Commercial Co-Operative Bank Ltd. (JCOM)" : "Central Bank of India (CBI)";
            particularsStr = `Contra: Cash Deposit to ${destBank}`;
        }

        ctx.fillStyle = "#2c3e50";
        ctx.font = "bold 13px 'Inter', sans-serif";
        ctx.fillText(particularsStr, x + 200, rowY + 14);

        ctx.fillStyle = "#000000";
        ctx.font = "italic 11px 'Inter', sans-serif";
        const descText = tx.description || tx.reference || "-";
        
        let truncatedDesc = descText;
        if (ctx.measureText(truncatedDesc).width > 420) {
            while (ctx.measureText(truncatedDesc + "...").width > 420 && truncatedDesc.length > 0) {
                truncatedDesc = truncatedDesc.substring(0, truncatedDesc.length - 1);
            }
            truncatedDesc += "...";
        }
        ctx.fillText(truncatedDesc, x + 200, rowY + 30);

        if (isContra) {
            ctx.fillStyle = "#0369a1";
        } else {
            ctx.fillStyle = isInc ? "#2e7d32" : "#c62828";
        }
        ctx.font = "bold 14px 'Inter', sans-serif";
        const prefixSymbol = isContra ? "⇄ " : (isInc ? "+" : "-");
        const amtStr = `${prefixSymbol} ₹${amt.toLocaleString('en-IN')}`;
        ctx.textAlign = "right";
        ctx.fillText(amtStr, x + width - 15, rowY + 22);
        ctx.textAlign = "left";

        ctx.strokeStyle = "rgba(0, 0, 0, 0.04)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 10, rowY + rowHeight - 5);
        ctx.lineTo(x + width - 10, rowY + rowHeight - 5);
        ctx.stroke();

        rowY += rowHeight;
    });

    if (sortedTxs.length === 0) {
        ctx.fillStyle = "#000000";
        ctx.font = "italic 13px 'Inter', sans-serif";
        ctx.fillText("No transactions in this period", x + 200, rowY + 20);
        rowY += rowHeight;
    }

    ctx.fillStyle = "#fafafa";
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, x, rowY + 5, width, 30, 4, true, true);

    ctx.fillStyle = "#2c3e50";
    ctx.font = "bold 13px 'Inter', sans-serif";
    ctx.fillText("Summary:", x + 15, rowY + 24);
    
    ctx.fillStyle = "#2e7d32";
    ctx.fillText(`Total In: +₹${totalIncome.toLocaleString('en-IN')}`, x + 150, rowY + 24);
    
    ctx.fillStyle = "#c62828";
    ctx.fillText(`Total Out: -₹${totalExpense.toLocaleString('en-IN')}`, x + 350, rowY + 24);

    const net = totalIncome - totalExpense;
    ctx.fillStyle = net >= 0 ? "#2e7d32" : "#c62828";
    ctx.textAlign = "right";
    ctx.fillText(`Net: ₹${net.toLocaleString('en-IN')}`, x + width - 15, rowY + 24);
    ctx.textAlign = "left";
}

// Utility function to draw rounded rectangles
function drawRoundedRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof radius === 'number') {
        radius = {tl: radius, tr: radius, bl: radius, br: radius};
    } else {
        const defaultRadius = {tl: 0, tr: 0, bl: 0, br: 0};
        radius = Object.assign(defaultRadius, radius);
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}
