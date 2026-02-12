/* ========================================
CONSTANTS
========================================
*/
function getIcon(domain) { return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`; }
const FD_ICON = "https://icons.duckduckgo.com/ip3/sportsbook.fanduel.com.ico";
const SCORE_ICON = "https://icons.duckduckgo.com/ip3/thescore.com.ico";

// In-page debug overlay (only intercepts console when visible)
(function(){
    const dbg = document.createElement('div'); dbg.id = 'inpage-debug';
    dbg.style.cssText = 'position:fixed;left:12px;top:12px;z-index:99999;max-width:320px;max-height:180px;overflow:auto;padding:10px;background:rgba(0,0,0,0.85);color:#fff;border:1px solid #333;border-radius:8px;font-size:11px;line-height:1.2;display:none;';
    dbg.innerHTML = '<div style="font-weight:800;margin-bottom:6px;color:#FACC15">Debug Panel</div><div id="inpage-debug-body" style="font-size:12px;color:#DDD"></div><div style="margin-top:8px;text-align:right"><button id="inpage-debug-clear" class="btn btn-secondary">Clear</button></div>';
    document.addEventListener('DOMContentLoaded', ()=>{ document.body.appendChild(dbg); document.getElementById('inpage-debug-clear').onclick = ()=>{ document.getElementById('inpage-debug-body').innerHTML = ''; }; });

    window._debugVisible = false;
    function append(msg){ if(!window._debugVisible) return; const b = document.getElementById('inpage-debug-body'); if(b) { const el = document.createElement('div'); el.innerText = msg; if(b.children.length > 50) b.removeChild(b.firstChild); b.appendChild(el); } }

    window.addEventListener('error', function(e){ try{ append('Error: ' + (e.message || e.error || e.toString()) + ' @ ' + (e.filename||e.srcElement?.src||'') + ':' + (e.lineno||'') ); }catch(err){} });
    window.addEventListener('unhandledrejection', function(e){ try{ append('UnhandledRejection: ' + (e.reason && e.reason.message ? e.reason.message : (e.reason || ''))); }catch(err){} });
})();

const MASTER_BOOKS = {
    "Bank": { url: "https://chime.com", logo: getIcon("chime.com"), col: "#00D54B" },
    "FanDuel": { url: "https://sportsbook.fanduel.com", logo: FD_ICON, col: "#3B82F6" },
    "DraftKings": { url: "https://sportsbook.draftkings.com", logo: getIcon("draftkings.com"), col: "#4ADE80" },
    "Fanatics": { url: "https://sportsbook.fanatics.com", logo: getIcon("fanatics.com"), col: "#E5E7EB" },
    "BetMGM": { url: "https://sportsbook.betmgm.com", logo: getIcon("betmgm.com"), col: "#D4AF37" },
    "Caesars": { url: "https://caesars.com/sportsbook-and-casino", logo: getIcon("caesars.com"), col: "#D7A04D" },
    "Hard Rock": { url: "https://app.hardrock.bet", logo: getIcon("hardrock.bet"), col: "#D946EF" },
    "Bally Bet": { url: "https://ballybet.com", logo: getIcon("ballybet.com"), col: "#F87171" },
    "theScore Bet": { url: "https://thescore.bet", logo: SCORE_ICON, col: "#0074D9" },
    "bet365": { url: "https://bet365.com", logo: getIcon("bet365.com"), col: "#218559" },
    "Desert Diamond": { url: "https://playdesertdiamond.com", logo: getIcon("playdesertdiamond.com"), col: "#00A3E0" },
    "BetRivers": { url: "https://betrivers.com", logo: getIcon("betrivers.com"), col: "#1E4C9C" },
    "Underdog": { url: "https://underdogfantasy.com", logo: getIcon("underdogfantasy.com"), col: "#FACC15" },
    "Sportzino": { url: "https://sportzino.com", logo: getIcon("sportzino.com"), col: "#FF5722" },
    "Onyx": { url: "https://onyxodds.com", logo: getIcon("onyxodds.com"), col: "#7C3AED" },
    "Golden Nugget": { url: "https://goldennuggetcasino.com", logo: getIcon("goldennuggetcasino.com"), col: "#C5A059" },
    "Kalshi": { url: "https://kalshi.com", logo: getIcon("kalshi.com"), col: "#00E676" },
    "Polymarket": { url: "https://polymarket.com", logo: getIcon("polymarket.com"), col: "#2979FF" },
    "Sporttrade": { url: "https://sporttrade.com", logo: getIcon("sporttrade.com"), col: "#00E676" },
    "Fliff": { url: "https://fliff.com", logo: getIcon("fliff.com"), col: "#00D9FF" },
    "PrizePicks": { url: "https://prizepicks.com", logo: getIcon("prizepicks.com"), col: "#9333EA" },
    "Robinhood": { url: "https://robinhood.com", logo: getIcon("robinhood.com"), col: "#00C805" },
    "Thrillzz": { url: "https://thrillzz.com", logo: getIcon("thrillzz.com"), col: "#FFD700" },
    "Crypto.com": { url: "https://crypto.com", logo: getIcon("crypto.com"), col: "#003D7A" },
    "Pinny": { url: "https://pinnacle.com", logo: getIcon("pinnacle.com"), col: "#FF6B00" },
    "BetOpenly": { url: "https://betopenly.com", logo: getIcon("betopenly.com"), col: "#DC2626" },
    "Betr": { url: "https://betr.app", logo: getIcon("betr.app"), col: "#06B6D4" },
    "Bracco": { url: "https://bracco.com", logo: getIcon("bracco.com"), col: "#F97316" },
    "4CX": { url: "https://4cx.com", logo: getIcon("4cx.com"), col: "#8B5CF6" }
};

// Expose MASTER_BOOKS globally for Firebase sync
window.MASTER_BOOKS = MASTER_BOOKS;

/* ========================================
   STATE MANAGEMENT
======================================== */
const SAVE_KEY = "bankroll_pro_v34";
window.data = { accounts: [], graphData: [], myBooks: [], lastSaved: "" };
let data = window.data;
let currentAccIndex = -1;
let selectedBookForNewAccount = "";
let privacyMode = false;

// Global function to sync data reference after Firestore loads
window.syncDataReference = function() {
    data = window.data;

};

// Firebase auth and data
// (Moved to Firebase module above)

window.onload = () => {
    const saved = localStorage.getItem(SAVE_KEY); 
    if(saved) {
        window.data = JSON.parse(saved);
        data = window.data; // Keep reference in sync
        
        // CLEANER
        data.myBooks = data.myBooks.filter(bk => bk.id.toLowerCase() !== "the bet");
        let repaired = false;
        
        // Update existing books from MASTER_BOOKS
        data.myBooks.forEach(bk => {
            if(MASTER_BOOKS[bk.id]) {
                bk.url = MASTER_BOOKS[bk.id].url;
                bk.logo = MASTER_BOOKS[bk.id].logo; 
                bk.col = MASTER_BOOKS[bk.id].col;
                repaired = true;
            }
        });
        
        // Add any new books from MASTER_BOOKS that don't exist in myBooks yet
        Object.keys(MASTER_BOOKS).forEach(key => {
            if(!data.myBooks.find(bk => bk.id === key)) {
                data.myBooks.push({ id: key, ...MASTER_BOOKS[key] });
                repaired = true;
                console.log('Added new book:', key);
            }
        });
        
        if(repaired) { saveData(); console.log("System cleaned and updated with new books."); }
    } else {
        initFresh();
    }
    // One-time migration: swap stake and bonus fields if not already done
    try {
        const migrated = localStorage.getItem('swap_stake_bonus_done_v1');
        if(!migrated) {
            let swapped = false;
            data.accounts.forEach(a => {
                if(a && (a.stake !== undefined || a.bonus !== undefined)) {
                    const tmp = a.bonus || 0;
                    a.bonus = a.stake || 0;
                    a.stake = tmp;
                    swapped = true;
                }
            });
            if(swapped) { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); localStorage.setItem('swap_stake_bonus_done_v1','1'); console.log('Swapped stake/bonus for existing accounts'); }
        }
    } catch(e){ console.error('Migration error', e); }
    if(!data.graphData) data.graphData = [];
    
    // CLEAN UP DUPLICATES: Keep only the last entry for each date
    const dateMap = new Map();
    data.graphData.forEach(point => {
        dateMap.set(point.d, point); // This will overwrite earlier entries with same date
    });
    data.graphData = Array.from(dateMap.values());
    
    renderDashboard();
    // Refresh graph if visible
    if(document.getElementById('graph-view') && document.getElementById('graph-view').style.display === 'block') {
        setTimeout(drawGraph, 100);
    }
};

function initFresh() {
    data.myBooks = [];
    Object.keys(MASTER_BOOKS).forEach(key => {
        data.myBooks.push({ id: key, ...MASTER_BOOKS[key] });
    });
    saveData();
}

async function saveData() { 
    data.lastSaved = new Date().toLocaleString(); 
    localStorage.setItem(SAVE_KEY, JSON.stringify(data)); 
    // Save to Firestore in background (don't block UI)
    if (window.saveUserDataToFirestore) {
        isSaving = true;
        window.saveUserDataToFirestore().then(() => {
            lastSaveTime = Date.now();
            isSaving = false;
        }).catch(err => {
            console.error('Firestore save error:', err);
            isSaving = false;
        });
    }
}

// --- FACTORY RESET ---
function factoryReset() {
    if(confirm("⚠️ NUCLEAR OPTION ⚠️\n\nThis will wipe ALL data from this app.\n\nAre you sure?")) {
        localStorage.removeItem(SAVE_KEY);
        sessionStorage.setItem('factoryResetInProgress', 'true');
        location.reload();
    }
}

// Firebase functions
// Firestore functions moved to module above

function toggleAuthModal() {
  document.getElementById('auth-modal').style.display = 'flex';
}

function closeAuthModal() {
  document.getElementById('auth-modal').style.display = 'none';
  document.getElementById('auth-error').innerText = '';
}

// Firebase functions moved to module above

// Attach event listeners
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('signin-btn').onclick = window.signInUser;
  document.getElementById('signup-btn').onclick = window.signUpUser;
  document.getElementById('google-signin-btn').onclick = window.signInWithGoogle;
  document.getElementById('close-auth').onclick = closeAuthModal;
  document.getElementById('forgot-password-link').onclick = (e) => {
    e.preventDefault();
    window.resetPassword();
  };
});

/* ========================================
CORE FUNCTIONS & CALCULATORS
========================================
*/
function getDec(us) {
    if(!us || us===0) return 0;
    if(us > 0) return (us/100) + 1;
    return (100/Math.abs(us)) + 1;
}

function runHedgeCalc() {
    const amtStr = document.getElementById('hedge-amt').value;
    const bOddsStr = document.getElementById('hedge-bonus-odds').value;
    const hOddsStr = document.getElementById('hedge-opp-odds').value;
    const hBookName = document.getElementById('hedge-book-select').value;
    const resEl = document.getElementById('hedge-result');
    const txtEl = document.getElementById('hedge-scenarios');
    const pctEl = document.getElementById('hedge-pct'); 
    const profitCont = document.getElementById('profit-container');

    if(!amtStr || !bOddsStr || !hOddsStr) {
        resEl.innerText = "$0.00";
        profitCont.style.display = 'none';
        txtEl.innerText = "Enter odds to see breakdown...";
        return;
    }

    const bonus = parseFloat(amtStr);
    const decBonus = getDec(parseFloat(bOddsStr));
    const decHedge = getDec(parseFloat(hOddsStr));

    if(decBonus <= 1 || decHedge <= 1) return;

    const hedgeStake = (bonus * (decBonus - 1)) / decHedge;
    const profit = hedgeStake * (decHedge - 1); 
    const profitBonusSide = (bonus * (decBonus - 1)) - hedgeStake; 
    const pct = (profit / bonus) * 100;

    resEl.innerText = "$" + hedgeStake.toFixed(2);
    profitCont.style.display = 'flex';
    pctEl.innerText = pct.toFixed(2) + "%";
    pctEl.style.color = pct > 70 ? "#00E676" : (pct > 60 ? "#FACC15" : "#FF1744");
    
    txtEl.innerHTML = `
        <span style="color:#00E676">If Bonus Wins: +$${profitBonusSide.toFixed(2)}</span><br>
        <span style="color:#9D4EDD">If ${hBookName} Wins: +$${profit.toFixed(2)}</span>
    `;
}

function runKelly() {
    const wStr = document.getElementById('kelly-odds').value;
    const pStr = document.getElementById('kelly-prob').value;
    const sliderVal = document.getElementById('kelly-slider').value;
    const mult = parseFloat(sliderVal); 
    let txt = mult.toFixed(2);
    if(mult === 0.25) txt += " (Quarter)";
    document.getElementById('kelly-mult-display').innerText = txt;

    let wOdds = parseFloat(wStr);
    let p = 0;
    if(pStr && pStr.includes("%")) p = parseFloat(pStr.replace("%",""))/100;
    else if(pStr) p = (parseFloat(pStr)>0) ? 100/(parseFloat(pStr)+100) : Math.abs(parseFloat(pStr))/(Math.abs(parseFloat(pStr))+100);

    let totalBank = 0;
    data.accounts.forEach(a => totalBank += a.cash + (a.stake||0));

    const resEl = document.getElementById('kelly-result');
    if(wOdds && p > 0) {
        let b = (wOdds > 0) ? wOdds/100 : 100/Math.abs(wOdds);
        const f = ((b * p - (1 - p)) / b) * mult;
        if(f > 0) {
            resEl.innerText = "$" + (totalBank * f).toFixed(2);
            document.getElementById('kelly-ev').innerText = `EV: +${(f*b*100).toFixed(1)}%`;
            return;
        }
    }
    resEl.innerText = "$0.00";
    document.getElementById('kelly-ev').innerText = "EV: 0%";
}

function runArbCalc() {
    const totalStake = parseFloat(document.getElementById('arb-total').value) || 0;
    const odds1Str = document.getElementById('arb-odds1').value;
    const odds2Str = document.getElementById('arb-odds2').value;
    
    const profitEl = document.getElementById('arb-profit');
    const stakesEl = document.getElementById('arb-stakes');
    const pctEl = document.getElementById('arb-pct');
    const pctContainer = document.getElementById('arb-pct-container');
    const statusEl = document.getElementById('arb-status');
    
    if(!totalStake || !odds1Str || !odds2Str) {
        profitEl.innerText = "$0.00";
        pctContainer.style.display = 'none';
        stakesEl.innerText = "Enter two opposing odds to calculate...";
        statusEl.innerText = "No Arb";
        statusEl.style.color = "var(--text-muted)";
        return;
    }
    
    const dec1 = getDec(parseFloat(odds1Str));
    const dec2 = getDec(parseFloat(odds2Str));
    
    if(dec1 <= 1 || dec2 <= 1) {
        statusEl.innerText = "Invalid";
        statusEl.style.color = "var(--danger)";
        return;
    }
    
    // Calculate implied probabilities
    const implied1 = 1 / dec1;
    const implied2 = 1 / dec2;
    const totalImplied = implied1 + implied2;
    
    // Arb exists if total implied < 1
    const isArb = totalImplied < 1;
    const arbPct = ((1 - totalImplied) * 100);
    
    if(isArb) {
        // Calculate optimal stakes
        const stake1 = (totalStake * implied1) / totalImplied;
        const stake2 = (totalStake * implied2) / totalImplied;
        
        // Guaranteed return regardless of outcome
        const payout1 = stake1 * dec1;
        const payout2 = stake2 * dec2;
        const guaranteedProfit = payout1 - totalStake;
        
        profitEl.innerText = "+$" + guaranteedProfit.toFixed(2);
        profitEl.style.color = "var(--success)";
        pctContainer.style.display = 'flex';
        pctEl.innerText = arbPct.toFixed(2) + "%";
        pctEl.style.color = arbPct > 5 ? "#00E676" : "var(--success)";
        
        statusEl.innerHTML = "✓ ARB FOUND";
        statusEl.style.color = "var(--success)";
        
        stakesEl.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <span>Stake on Odds 1 (${odds1Str}):</span>
                <span style="color:var(--primary); font-weight:600;">$${stake1.toFixed(2)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <span>Stake on Odds 2 (${odds2Str}):</span>
                <span style="color:var(--purple); font-weight:600;">$${stake2.toFixed(2)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-top:1px dashed var(--border); padding-top:6px; margin-top:6px;">
                <span>Payout Either Way:</span>
                <span style="color:var(--success); font-weight:700;">$${payout1.toFixed(2)}</span>
            </div>
        `;
    } else {
        const margin = ((totalImplied - 1) * 100);
        profitEl.innerText = "-$" + (totalStake * (totalImplied - 1)).toFixed(2);
        profitEl.style.color = "var(--danger)";
        pctContainer.style.display = 'flex';
        pctEl.innerText = "-" + margin.toFixed(2) + "%";
        pctEl.style.color = "var(--danger)";
        
        statusEl.innerText = "No Arb";
        statusEl.style.color = "var(--warning)";
        
        stakesEl.innerHTML = `
            <span style="color:var(--warning)">⚠️ No arbitrage opportunity</span><br>
            <span>Book margin: ${margin.toFixed(2)}%</span>
        `;
    }
}

function renderDashboard() {
    const list = document.getElementById('card-list');
    let totCash=0, totBonus=0, startBasis=0, totStake=0;
    const grouped = {};
    
    data.accounts.forEach((acc, idx) => {
        acc._idx = idx;
        if(!grouped[acc.book]) grouped[acc.book] = [];
        grouped[acc.book].push(acc);
        totCash += acc.cash;
        if(acc.book !== "Bank") { totBonus += acc.bonus; totStake += (acc.stake || 0); }
        const basis = (acc.startBasis !== undefined) ? acc.startBasis : (acc.lastCash !== undefined ? acc.lastCash : 0);
        startBasis += basis;
    });

    const totalNetWorth = totCash + totStake;
    document.getElementById('dash-total').innerText = "$" + totalNetWorth.toLocaleString('en-US', {minimumFractionDigits: 2});
    
    const diff = totalNetWorth - startBasis;
    const dayEl = document.getElementById('dash-day');
    dayEl.innerText = (diff >= 0 ? "+$" : "-$") + Math.abs(diff).toFixed(2);
    dayEl.className = "hero-stat-value " + (diff >= 0 ? "pos" : "neg");
    
    // Update hero change pill
    const heroChange = document.getElementById('dash-day-hero');
    if(heroChange) {
        heroChange.innerText = (diff >= 0 ? "+$" : "-$") + Math.abs(diff).toFixed(2) + " today";
        heroChange.className = "hero-change" + (diff < 0 ? " negative" : "");
    }
    
    document.getElementById('dash-bonus').innerText = "$" + totBonus.toFixed(0);
    document.getElementById('dash-stake').innerText = "$" + totStake.toFixed(2);
    
    // Update account count
    const countEl = document.getElementById('account-count');
    if(countEl) countEl.innerText = data.accounts.length;

    [document.getElementById('dash-total'), document.getElementById('dash-bonus'), document.getElementById('dash-stake')].forEach(el => { if(el) el.classList.toggle('blur-text', privacyMode); });

    // Build all cards in a DocumentFragment (single DOM reflow instead of one per card)
    const frag = document.createDocumentFragment();
    const booksWithAccounts = data.myBooks.filter(bk => grouped[bk.id]);
    booksWithAccounts.forEach(bk => {
        const header = document.createElement('div');
        header.className = "book-header";
        header.innerHTML = `
            <a href="${bk.url || '#'}" target="_blank" class="book-logo-link">
                <img src="${bk.logo}" class="book-logo-img" onerror="this.style.display='none'">
            </a>
            <span class="book-title" style="color:${bk.col}">${bk.id}</span>
        `;
        frag.appendChild(header);
        
        grouped[bk.id].forEach(acc => {
            const card = document.createElement('div'); 
            card.className = "card"; 
            card.style.setProperty('--card-accent', bk.col);
            card.onclick = () => openInput(acc._idx);
            
            let badges = "";
            if(acc.book !== "Bank") {
                if(acc.stake > 0) badges += `<span class="card-badge stake">▶ $${acc.stake.toFixed(0)}</span>`;
                if(acc.bonus > 0) badges += `<span class="card-badge bonus">🎁 $${acc.bonus.toFixed(0)}</span>`;
            }
            
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-left">
                        <div class="card-nick">${acc.nick}</div>
                    </div>
                    <div class="card-right">
                        <div class="card-cash ${privacyMode?'blur-text':''}">$${acc.cash.toFixed(2)}</div>
                        ${badges ? `<div class="card-badges">${badges}</div>` : ''}
                    </div>
                </div>
            `;
            frag.appendChild(card);
        });
    });
    list.innerHTML = "";
    list.appendChild(frag);
}

function populateHedgeDropdown() {
    const sel = document.getElementById('hedge-book-select');
    sel.innerHTML = `<option value="Opponent">Opponent</option>`;
    data.myBooks.forEach(b => { if(b.id !== "Bank") sel.innerHTML += `<option value="${b.id}">${b.id}</option>`; });
}

function openBookManager() {
    const area = document.getElementById('books-list-area'); area.innerHTML = "";
    data.myBooks.forEach(bk => {
        const div = document.createElement('div'); 
        div.style.cssText="display:flex;align-items:center;justify-content:space-between;padding:16px;background:var(--surface);border:1px solid var(--border);border-radius:14px;margin-bottom:10px;border-left:4px solid "+bk.col;
        div.innerHTML = `<div style="color:var(--text);font-weight:600;">${bk.id}</div><div class="plus-btn" onclick="addNewAccountFromLib('${bk.id}')">+</div>`;
        area.appendChild(div);
    });
    openScreen('screen-books');
}

function addNewAccountFromLib(bookId) {
    selectedBookForNewAccount = bookId; currentAccIndex = -1;
    const bk = data.myBooks.find(b => b.id === bookId);
    const masterBk = MASTER_BOOKS[bookId];
    const url = masterBk ? masterBk.url : "";
    document.getElementById('input-book').innerText = bookId; document.getElementById('input-book').style.color = bk.col;
    document.getElementById('inp-nick').value = "Main"; document.getElementById('inp-cash').value = ""; document.getElementById('inp-bonus').value = ""; document.getElementById('inp-stake').value = "";
    openScreen('screen-input');
}

function openInput(idx) {
    currentAccIndex = idx; const acc = data.accounts[idx]; const bk = data.myBooks.find(b => b.id === acc.book);
    document.getElementById('input-book').innerText = acc.book; document.getElementById('input-book').style.color = bk.col;
    document.getElementById('inp-nick').value = acc.nick; document.getElementById('inp-cash').value = acc.cash; document.getElementById('inp-bonus').value = acc.bonus; document.getElementById('inp-stake').value = acc.stake || 0;
    openScreen('screen-input');
}

async function saveInput() {
    const c = parseFloat(document.getElementById('inp-cash').value); if(isNaN(c)) return alert("Invalid Cash");
    const b = parseFloat(document.getElementById('inp-bonus').value)||0; const s = parseFloat(document.getElementById('inp-stake').value)||0; const n = document.getElementById('inp-nick').value||"Main";
    if(currentAccIndex === -1) {
        if(selectedBookForNewAccount) {
            // For new accounts, don't set startBasis to (c+s) which made Day P/L ignore new accounts
            data.accounts.push({book:selectedBookForNewAccount, nick:n, cash:c, bonus:b, stake:s});
        }
    } else {
        const a = data.accounts[currentAccIndex]; if(a.startBasis === undefined) a.startBasis = (a.lastCash || 0); a.cash=c; a.bonus=b; a.stake=s; a.nick=n;
    }
    await saveData(); renderDashboard(); closeScreen('screen-input'); closeScreen('screen-books'); showToast("Saved");
}

async function deleteAccount() { 
    if(confirm("Delete account?")) { 
        const acc = data.accounts[currentAccIndex];
        const currentValue = (acc.cash || 0) + (acc.stake || 0);
        const basis = (acc.startBasis !== undefined) ? acc.startBasis : 0;
        

        
        // Find another account to adjust startBasis
        const otherAcc = data.accounts.find((a, i) => i !== currentAccIndex);
        
        if (currentValue === 0 && basis !== 0) {
            // Empty account with old startBasis: transfer startBasis to another account
            // so Day P/L is NOT affected (startBasis sum stays same)
            if (otherAcc) {
                otherAcc.startBasis = (otherAcc.startBasis || 0) + basis;

            }
        } else if (currentValue > 0 && otherAcc) {
            // Account with money: transfer its startBasis to keep startBasis sum same
            // Total cash will drop by currentValue, startBasis stays same
            // Day P/L will decrease by currentValue
            otherAcc.startBasis = (otherAcc.startBasis || 0) + basis;

        }
        
        data.accounts.splice(currentAccIndex, 1); 
        await saveData(); 
        renderDashboard();
        closeScreen('screen-input'); 
        showToast("Deleted"); 
    } 
}

async function confirmDay() {
    if(confirm("Lock Day?")) {
        let t = 0; 
        window.data.accounts.forEach(a => { a.startBasis = a.cash + (a.stake || 0); t += a.startBasis; });
        
        // Check if we already locked today
        const todayStr = new Date().toLocaleDateString('en-US',{month:'numeric',day:'numeric'});
        
        // Remove ALL existing entries for today (handle duplicates)
        window.data.graphData = window.data.graphData.filter(point => point.d !== todayStr);
        
        // Add the new/updated entry
        window.data.graphData.push({d: todayStr, v:t, timestamp: Date.now()});
        
        // Keep last 90 points for history
        if(window.data.graphData.length > 90) window.data.graphData.shift();
        
        // Clean up any other duplicates
        const dateMap = new Map();
        window.data.graphData.forEach(point => {
            dateMap.set(point.d, point);
        });
        window.data.graphData = Array.from(dateMap.values());
        
        // Ensure data reference stays in sync
        data = window.data;
        await saveData();

        // Check if day was profitable and launch confetti
        const prevTotal = window.data.graphData.length >= 2 ? window.data.graphData[window.data.graphData.length - 2].v : t;
        if(t > prevTotal && window.launchConfetti) {
            window.launchConfetti();
        }

        showToast("Locked!");
    }
}

// Global variable for graph range filter
let currentGraphRange = 7; // Default to 7 days

function setGraphRange(range) {
    currentGraphRange = range;
    // Update button states
    document.querySelectorAll('.graph-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.dataset.range == range) btn.classList.add('active');
    });
    drawGraph();
}

let _drawGraphTimer = null;
function drawGraph() {
    if(_drawGraphTimer) cancelAnimationFrame(_drawGraphTimer);
    _drawGraphTimer = requestAnimationFrame(_drawGraphInner);
}
function _drawGraphInner() {
    _drawGraphTimer = null;
    const c = document.getElementById('growthCanvas'); if(!c) return;
    const ctx = c.getContext('2d');
    let pts = data.graphData || [];
    const dpr = window.devicePixelRatio || 1;
    const cssW = c.parentElement.offsetWidth;
    const cssH = 280;
    c.style.width = cssW + 'px';
    c.style.height = cssH + 'px';
    c.width = cssW * dpr;
    c.height = cssH * dpr;
    ctx.scale(dpr, dpr);
    const w = cssW, h = cssH;

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const chartBg = isLight ? '#ffffff' : '#0d1117';
    const chartMuted = isLight ? '#656d76' : '#8b949e';
    const chartGrid = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)';
    const chartLabel = isLight ? '#8b949e' : '#484f58';

    ctx.fillStyle = chartBg; ctx.fillRect(0, 0, w, h);

    if(pts.length < 2) {
        ctx.fillStyle = chartMuted;
        ctx.font = "14px 'Inter', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Lock Day 2+ times to see your curve.", w/2, h/2);
        const sg = document.getElementById('stat-growth');
        const sp = document.getElementById('stat-percent');
        const sc = document.getElementById('stat-count');
        if(sg) { sg.textContent = '$0'; sg.className = 'graph-stat-value'; }
        if(sp) { sp.textContent = '0%'; sp.className = 'graph-stat-value'; }
        if(sc) sc.textContent = '0';
        return;
    }

    // Apply time range filter
    if(currentGraphRange !== 'all') {
        const rangeNum = parseInt(currentGraphRange);
        if(pts.length > rangeNum) pts = pts.slice(-rangeNum);
    }

    // Stats
    const firstVal = pts[0].v, lastVal = pts[pts.length - 1].v;
    const growth = lastVal - firstVal;
    const growthPct = firstVal !== 0 ? ((growth / Math.abs(firstVal)) * 100).toFixed(1) : '0.0';
    const isUp = growth >= 0;
    const lineColor = isUp ? '#00FF87' : '#FF4444';

    const sg = document.getElementById('stat-growth');
    const sp = document.getElementById('stat-percent');
    const sc = document.getElementById('stat-count');
    if(sg) { sg.textContent = (isUp ? '+$' : '-$') + Math.abs(growth).toFixed(2); sg.className = 'graph-stat-value ' + (isUp ? 'positive' : 'negative'); }
    if(sp) { sp.textContent = (isUp ? '+' : '') + growthPct + '%'; sp.className = 'graph-stat-value ' + (isUp ? 'positive' : 'negative'); }
    if(sc) sc.textContent = pts.length;

    // Scale
    let min = Infinity, max = -Infinity;
    pts.forEach(p => { if(p.v < min) min = p.v; if(p.v > max) max = p.v; });
    const range = max - min;
    const pad = range === 0 ? 100 : range * 0.12;
    const pMin = min - pad, pMax = max + pad;

    // Grid — minimal, just 3 lines
    ctx.strokeStyle = chartGrid; ctx.lineWidth = 1;
    for(let i = 1; i <= 3; i++) {
        const y = h - ((i / 4) * h);
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        const val = pMin + (i / 4) * (pMax - pMin);
        ctx.fillStyle = chartLabel;
        ctx.font = "10px 'Inter', monospace";
        ctx.textAlign = "left";
        ctx.fillText('$' + (val >= 1000 ? (val/1000).toFixed(1) + 'k' : val.toFixed(0)), 6, y - 4);
    }

    // Build pixel points
    const padX = 12;
    const graphW = w - padX * 2;
    const step = pts.length > 1 ? graphW / (pts.length - 1) : 0;
    const graphPts = pts.map((p, i) => ({
        x: padX + i * step,
        y: h * 0.92 - ((p.v - pMin) / (pMax - pMin)) * h * 0.84,
        data: p
    }));

    // Draw smooth line via bezier
    ctx.beginPath();
    ctx.moveTo(graphPts[0].x, graphPts[0].y);
    for(let i = 0; i < graphPts.length - 1; i++) {
        const curr = graphPts[i], next = graphPts[i + 1];
        const cpx = (curr.x + next.x) / 2;
        ctx.bezierCurveTo(cpx, curr.y, cpx, next.y, next.x, next.y);
    }
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.stroke();

    // Fill under curve
    ctx.lineTo(graphPts[graphPts.length - 1].x, h);
    ctx.lineTo(graphPts[0].x, h);
    ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, 0, 0, h);
    if(isUp) {
        fillGrad.addColorStop(0, 'rgba(0,255,135,0.18)');
        fillGrad.addColorStop(1, 'rgba(0,255,135,0)');
    } else {
        fillGrad.addColorStop(0, 'rgba(255,68,68,0.18)');
        fillGrad.addColorStop(1, 'rgba(255,68,68,0)');
    }
    ctx.fillStyle = fillGrad; ctx.fill();

    // --- Robinhood-style touch/mouse scrub ---
    // Use an overlay canvas for interactive elements
    let overlay = c.parentElement.querySelector('.tooltip-overlay');
    if(!overlay) {
        overlay = document.createElement('canvas');
        overlay.className = 'tooltip-overlay';
        overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:auto;border-radius:12px;touch-action:none;';
        c.parentElement.style.position = 'relative';
        c.parentElement.appendChild(overlay);
    }
    overlay.width = cssW * dpr; overlay.height = cssH * dpr;
    overlay.style.width = cssW + 'px'; overlay.style.height = cssH + 'px';
    const octx = overlay.getContext('2d');
    octx.scale(dpr, dpr);

    // Scrub label element (above chart)
    let scrubLabel = c.parentElement.querySelector('.graph-scrub-label');
    if(!scrubLabel) {
        scrubLabel = document.createElement('div');
        scrubLabel.className = 'graph-scrub-label';
        scrubLabel.style.cssText = 'position:absolute;top:-8px;left:50%;transform:translateX(-50%);font-size:13px;font-weight:700;color:var(--text);opacity:0;transition:opacity 0.15s;pointer-events:none;white-space:nowrap;z-index:5;';
        c.parentElement.appendChild(scrubLabel);
    }

    function getClosestPoint(clientX) {
        const rect = overlay.getBoundingClientRect();
        const mx = (clientX - rect.left) * (w / rect.width);
        // Find nearest point by x only (Robinhood-style)
        let closest = graphPts[0], closestIdx = 0, closestDist = Infinity;
        graphPts.forEach((pt, idx) => {
            const d = Math.abs(mx - pt.x);
            if(d < closestDist) { closestDist = d; closest = pt; closestIdx = idx; }
        });
        return { pt: closest, idx: closestIdx };
    }

    function drawScrub(clientX) {
        const { pt, idx } = getClosestPoint(clientX);
        octx.clearRect(0, 0, w, h);

        // Vertical crosshair line
        octx.strokeStyle = isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)';
        octx.lineWidth = 1;
        octx.setLineDash([4, 4]);
        octx.beginPath(); octx.moveTo(pt.x, 0); octx.lineTo(pt.x, h); octx.stroke();
        octx.setLineDash([]);

        // Dot on line
        octx.beginPath(); octx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
        octx.fillStyle = chartBg; octx.fill();
        octx.beginPath(); octx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        octx.fillStyle = lineColor; octx.fill();

        // Update scrub label
        const val = pt.data.v;
        const changeFromFirst = val - pts[0].v;
        const pct = pts[0].v !== 0 ? ((changeFromFirst / Math.abs(pts[0].v)) * 100).toFixed(1) : '0.0';
        const sign = changeFromFirst >= 0 ? '+' : '';
        scrubLabel.innerHTML = `<span style="color:${lineColor}">$${val.toLocaleString('en-US', {minimumFractionDigits:2})}</span> <span style="font-size:11px;color:${changeFromFirst >= 0 ? '#00FF87' : '#FF4444'}">${sign}$${Math.abs(changeFromFirst).toFixed(2)} (${sign}${pct}%)</span>`;
        scrubLabel.style.opacity = '1';

        // Date label at bottom
        octx.fillStyle = isLight ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)';
        octx.font = "11px 'Inter', sans-serif";
        octx.textAlign = 'center';
        octx.fillText(pt.data.d || ('Day ' + (idx + 1)), pt.x, h - 4);
    }

    function clearScrub() {
        octx.clearRect(0, 0, w, h);
        scrubLabel.style.opacity = '0';
    }

    // Mouse events
    let isMouseDown = false;
    overlay.onmouseenter = (e) => drawScrub(e.clientX);
    overlay.onmousemove = (e) => drawScrub(e.clientX);
    overlay.onmouseleave = () => { if(!isMouseDown) clearScrub(); };

    // Touch events (mobile scrub — like Robinhood)
    overlay.ontouchstart = (e) => {
        isMouseDown = true;
        e.preventDefault();
        drawScrub(e.touches[0].clientX);
    };
    overlay.ontouchmove = (e) => {
        e.preventDefault();
        drawScrub(e.touches[0].clientX);
    };
    overlay.ontouchend = () => {
        isMouseDown = false;
        clearScrub();
    };
    overlay.onmousedown = () => { isMouseDown = true; };
    overlay.onmouseup = () => { isMouseDown = false; };
}

function exportHistoryCSV() {
    if(!data.graphData || data.graphData.length === 0) return alert("No history to export.");
    let csv = "Date,Total Net Worth\n";
    data.graphData.forEach(row => { csv += `${row.d},${row.v}\n`; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `bankroll_history.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

function importHistoryCSV(input) {
    const file = input.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const rows = e.target.result.split("\n");
        const newHist = [];
        for(let i=1; i<rows.length; i++) {
            const cols = rows[i].split(",");
            if(cols.length >= 2) { const val = parseFloat(cols[1]); if(!isNaN(val)) newHist.push({d: cols[0], v: val}); }
        }
        if(newHist.length > 0 && confirm(`Found ${newHist.length} entries. Overwrite?`)) { data.graphData = newHist; saveData(); showToast("Imported!"); closeScreen('screen-settings'); }
    };
    reader.readAsText(file); input.value = '';
}

function downloadBackupFile() {
    const b = new Blob([JSON.stringify({liveData:data},null,2)], {type:"application/json"});
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `bankroll_backup.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
}
function uploadBackupFile(i) {
    const f = i.files[0]; if(!f) return;
    const r = new FileReader(); 
    r.onload = async (e) => { 
        try { 
            const d = JSON.parse(e.target.result); 
            if(d.liveData) { 
                window.data = d.liveData; 
            } else if(d.accounts) { 
                window.data = d; 
            } 
            data = window.data;
            // Save to localStorage first
            localStorage.setItem(SAVE_KEY, JSON.stringify(window.data));
            // Force save to Firestore
            if (window.saveUserDataToFirestore) {
                await window.saveUserDataToFirestore();
            }
            renderDashboard();
            closeScreen('screen-settings'); 
            showToast("Backup Restored!"); 
        } catch(err) {
            console.error('Backup restore error:', err);
            alert("Error restoring backup");
        } 
    }; 
    r.readAsText(f);
}

function togglePrivacy() { privacyMode = !privacyMode; renderDashboard(); }
function showTab(t) { 
    // Update bottom nav
    document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active')); 
    const navItem = document.getElementById('nav-'+t);
    if(navItem) navItem.classList.add('active');
    
    // Show/hide quick actions based on tab
    if(t === 'dash') {
        document.body.classList.remove('hide-quick-actions');
    } else {
        document.body.classList.add('hide-quick-actions');
    }
    
    // Toggle views
    ['dash','calc','graph','odds','bets'].forEach(v => { 
        const el = document.getElementById(v+'-view'); 
        if(el){ el.style.display = 'none'; el.classList.add('hidden'); }
    });
    const target = document.getElementById(t+'-view'); 
    if(target){ target.classList.remove('hidden'); target.style.display = 'block'; }
    if(t==='calc') populateHedgeDropdown(); 
    if(t==='graph') setTimeout(drawGraph, 100);
    if(t==='odds') loadOdds();
    if(t==='bets') renderActiveBets();
}
function showToast(m) { const t=document.getElementById('toast'); t.innerText=m; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2000); }
function openScreen(id) { document.getElementById(id).classList.add('active'); }
function closeScreen(id) { document.getElementById(id).classList.remove('active'); }
function openSettings() { openScreen('screen-settings'); }
function toggleDebugPanel() { const d = document.getElementById('inpage-debug'); if(d) { d.style.display = d.style.display === 'none' ? 'block' : 'none'; window._debugVisible = d.style.display !== 'none'; showToast(d.style.display === 'none' ? 'Debug hidden' : 'Debug visible'); } }

/* -----------------------------
   Active Bets - OddsJam CSV Import
----------------------------- */
let activeBets = JSON.parse(localStorage.getItem('activeBets') || '[]');
window.activeBets = activeBets; // Expose for Firebase module sync
// Bridge so Firebase module can update the module-scoped variable
window._setActiveBets = function(arr) { activeBets = arr; window.activeBets = arr; };
let currentBetFilter = 'pending';
let currentBetTypeFilter = 'all';
let currentBetDateFilter = 'all'; // 'all', 'today', '3d', '7d', '30d'

function importOddsJamCSV(input) {
    const file = input.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target.result;
            const lines = text.split(/\r?\n/).filter(l => l.trim());
            if(lines.length < 2) { showToast('Empty CSV'); return; }
            
            // Parse header to find column indices - OddsJam specific
            const header = parseCSVLine(lines[0]);
            
            const cols = {};
            header.forEach((h, i) => {
                const key = h.toLowerCase().trim().replace(/['"]/g, '').replace(/\s+/g, '_');
                // OddsJam / general CSV column names (flexible matching)
                if(key === 'sportsbook' || key === 'book') cols.book = cols.book ?? i;
                if(key === 'event_name' || key === 'event' || key === 'match' || key === 'game') cols.event = cols.event ?? i;
                if(key === 'bet_name' || key === 'selection' || key === 'pick' || key === 'bet') cols.selection = cols.selection ?? i;
                if(key === 'odds' || key === 'american_odds') cols.odds = cols.odds ?? i;
                if(key === 'stake' || key === 'wager' || key === 'risk' || key === 'amount') cols.stake = cols.stake ?? i;
                if(key === 'percentage' || key === 'ev' || key === 'ev%' || key === 'ev_percentage' || key === 'expected_value') cols.ev = cols.ev ?? i;
                if(key === 'market_name' || key === 'market' || key === 'bet_market') cols.market = cols.market ?? i;
                if(key.includes('date') || key.includes('time') || key.includes('start') || key === 'placed' || key === 'created_at') cols.date = cols.date ?? i;
                if(key === 'potential_payout' || key === 'payout' || key === 'to_win') cols.payout = cols.payout ?? i;
                if(key === 'bet_profit' || key === 'profit' || key === 'net') cols.profit = cols.profit ?? i;
                if(key === 'bet_type' || key === 'type' || key === 'category') cols.type = cols.type ?? i;
                if(key === 'is_free_bet' || key === 'free_bet' || key === 'freebet' || key === 'promo') cols.freebet = cols.freebet ?? i;
                if(key === 'status' || key === 'result' || key === 'outcome') cols.status = cols.status ?? i;
                if(key === 'league' || key === 'sport_league') cols.league = cols.league ?? i;
                if(key === 'sport') cols.sport = cols.sport ?? i;
                if(key === 'game_id' || key === 'event_id' || key === 'match_id') cols.gameId = cols.gameId ?? i;
            });
            
            // Parse data rows
            const bets = [];
            for(let i = 1; i < lines.length; i++) {
                const row = parseCSVLine(lines[i]);
                if(row.length < 5) continue;
                
                // Helper to safely get column value
                const getCol = (colName, fallback = '') => {
                    if(cols[colName] !== undefined && row[cols[colName]] !== undefined) {
                        return String(row[cols[colName]]).trim().replace(/^["']|["']$/g, '');
                    }
                    return fallback;
                };
                
                // Determine bet type from OddsJam's bet_type column
                let betType = 'ev';
                const typeVal = getCol('type').toLowerCase();
                const freebetVal = getCol('freebet').toLowerCase();
                
                if(typeVal === 'arbitrage' || typeVal.includes('arb')) betType = 'arb';
                else if(typeVal === 'positive_ev' || typeVal.includes('ev')) betType = 'ev';
                else if(typeVal === 'normal' || typeVal === 'no_sweat_bet') betType = 'ev';
                
                // Check if it's a free bet
                if(freebetVal === 'true') betType = 'freebet';
                
                // Parse odds - OddsJam uses numbers (145.0 = +145, -120.0 = -120)
                let oddsVal = parseFloat(getCol('odds')) || 0;
                
                // Parse stake
                let stake = parseFloat(getCol('stake')) || 0;
                
                // Parse EV percentage
                let ev = parseFloat(getCol('ev')) || 0;
                
                // Parse payout
                let payout = parseFloat(getCol('payout')) || 0;
                
                // Parse profit
                let profit = parseFloat(getCol('profit')) || 0;
                
                // Get status
                let status = getCol('status', 'pending').toLowerCase();
                
                // Build event string
                let event = getCol('event');
                if(!event) {
                    event = getCol('league') || getCol('sport', '');
                }
                
                const bet = {
                    id: Date.now() + '_' + i,
                    type: betType,
                    book: getCol('book', 'Unknown'),
                    event: event,
                    selection: getCol('selection', 'Unknown Bet'),
                    odds: oddsVal,
                    stake: stake,
                    ev: ev,
                    market: getCol('market', ''),
                    date: getCol('date', ''),
                    payout: payout,
                    profit: profit,
                    status: status,
                    gameId: getCol('gameId', ''),  // For pairing
                    isFreebet: freebetVal === 'true',  // Track original freebet status
                    pairId: null  // Will be set during pair detection
                };
                
                bets.push(bet);
            }
            
            // PAIR DETECTION: Auto-pair FREE BET conversions and ARB bets
            // Group bets by gameId + market
            const pairGroups = {};
            bets.forEach(bet => {
                if(bet.gameId && bet.market) {
                    const key = `${bet.gameId}__${bet.market}`;
                    if(!pairGroups[key]) pairGroups[key] = [];
                    pairGroups[key].push(bet);
                }
            });
            
            // Assign pairIds for free bets and arbs (but not regular EV+ bets)
            let pairCounter = 1;
            for(const key in pairGroups) {
                const group = pairGroups[key];
                if(group.length === 2) {
                    const hasFreeBet = group.some(b => b.isFreebet);
                    const hasArb = group.some(b => b.type === 'arb');
                    
                    // Auto-pair if: one is free bet OR one is arb
                    if(hasFreeBet || hasArb) {
                        const pairId = `pair_${pairCounter++}`;
                        group.forEach(bet => {
                            bet.pairId = pairId;
                            // If one is freebet, mark both as freebet type
                            if(hasFreeBet) bet.type = 'freebet';
                        });
                    }
                    // Regular EV+ bets on same game won't be auto-paired
                }
            }
            
            // Sort by EV descending
            bets.sort((a, b) => b.ev - a.ev);
            
            activeBets = bets;
            _syncBets();
            showToast(`Imported ${bets.length} bets — saving to cloud...`);
            renderActiveBets();
        } catch(err) {
            console.error('CSV Parse Error:', err);
            showToast('Error parsing CSV');
        }
    };
    reader.readAsText(file);
    input.value = '';
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for(let i = 0; i < line.length; i++) {
        const ch = line[i];
        if(ch === '"') {
            inQuotes = !inQuotes;
        } else if(ch === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += ch;
        }
    }
    result.push(current.trim());
    return result;
}

function filterBets(filter) {
    currentBetFilter = filter;
    document.querySelectorAll('.bets-filter').forEach(el => {
        el.classList.toggle('active', el.dataset.filter === filter);
    });
    renderActiveBets();
}

function filterBetType(type) {
    currentBetTypeFilter = type;
    document.querySelectorAll('.bets-type-tab').forEach(el => {
        el.classList.toggle('active', el.dataset.type === type);
    });
    renderActiveBets();
}

function filterBetDate(range) {
    currentBetDateFilter = range;
    document.querySelectorAll('.bets-date-tab').forEach(el => {
        el.classList.toggle('active', el.dataset.date === range);
    });
    renderActiveBets();
}

function formatBetDate(dateStr) {
    if(!dateStr) return '';
    try {
        const d = new Date(dateStr);
        if(isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch(e) { return dateStr; }
}

function _syncBets() {
    window.activeBets = activeBets;
    localStorage.setItem('activeBets', JSON.stringify(activeBets));
    // Fire-and-forget Firestore save with retry
    if(window.saveBetsToFirestore) {
        window.saveBetsToFirestore().catch(err => {
            console.error('Bet save failed, will retry...', err);
            // Retry once after 2s
            setTimeout(() => {
                if(window.saveBetsToFirestore) window.saveBetsToFirestore().catch(() => {});
            }, 2000);
        });
    }
}

function updateBetStatus(betId, newStatus) {
    const bet = activeBets.find(b => b.id === betId);
    if(bet) {
        bet.status = newStatus;
        if(newStatus === 'won') {
            const odds = bet.odds;
            let payout = 0;
            if(odds >= 0) {
                payout = bet.stake + (bet.stake * odds / 100);
            } else {
                payout = bet.stake + (bet.stake * 100 / Math.abs(odds));
            }
            bet.profit = payout - bet.stake;
            bet.payout = payout;
        } else if(newStatus === 'lost') {
            bet.profit = -bet.stake;
        }
        _syncBets();
        renderActiveBets();
        showToast(`Marked as ${newStatus}`);
    }
}

function deleteBet(betId) {
    activeBets = activeBets.filter(b => b.id !== betId);
    _syncBets();
    renderActiveBets();
    showToast('Bet deleted');
}

function renderActiveBets() {
    const list = document.getElementById('bets-list');
    const summary = document.getElementById('bets-summary');
    if(!list) return;
    
    let bets = [...activeBets];
    
    // Apply status filter
    if(currentBetFilter === 'pending') {
        bets = bets.filter(b => b.status === 'pending');
    } else if(currentBetFilter === 'won') {
        bets = bets.filter(b => b.status === 'won');
    } else if(currentBetFilter === 'lost') {
        bets = bets.filter(b => b.status === 'lost');
    }
    // Apply type filter
    if(currentBetTypeFilter !== 'all') {
        bets = bets.filter(b => b.type === currentBetTypeFilter);
    }
    // Apply date filter
    if(currentBetDateFilter !== 'all') {
        const now = new Date();
        now.setHours(23,59,59,999);
        let cutoff = new Date();
        if(currentBetDateFilter === 'today') { cutoff.setHours(0,0,0,0); }
        else if(currentBetDateFilter === '3d') { cutoff.setDate(cutoff.getDate() - 3); cutoff.setHours(0,0,0,0); }
        else if(currentBetDateFilter === '7d') { cutoff.setDate(cutoff.getDate() - 7); cutoff.setHours(0,0,0,0); }
        else if(currentBetDateFilter === '30d') { cutoff.setDate(cutoff.getDate() - 30); cutoff.setHours(0,0,0,0); }
        bets = bets.filter(b => {
            if(!b.date) return true; // keep bets with no date
            const d = new Date(b.date);
            return !isNaN(d.getTime()) && d >= cutoff;
        });
    }
    
    if(bets.length === 0) {
        let emptyMsg = 'No bets found';
        if(currentBetFilter === 'pending') emptyMsg = 'No pending bets';
        else if(currentBetFilter === 'won') emptyMsg = 'No winning bets yet';
        else if(currentBetFilter === 'lost') emptyMsg = 'No losing bets';
        
        list.innerHTML = `
            <div class="bets-empty">
                <div class="bets-empty-icon">🎫</div>
                <div class="bets-empty-text">${emptyMsg}</div>
                <div style="font-size:12px; color:var(--text-muted); line-height:1.6;">
                    Import bets from OddsJam or change the filter.
                </div>
            </div>
        `;
        summary.innerHTML = '';
        return;
    }
    
    // Group bets by pairId for side-by-side rendering
    const pairedBets = {};
    const singleBets = [];
    const renderedPairs = new Set();
    
    bets.forEach(bet => {
        if(bet.pairId) {
            if(!pairedBets[bet.pairId]) pairedBets[bet.pairId] = [];
            pairedBets[bet.pairId].push(bet);
        } else {
            singleBets.push(bet);
        }
    });
    
    // Helper to render a single bet card
    function renderBetCard(bet, isPaired = false, pairPosition = '') {
        const typeLabel = bet.type === 'ev' ? 'EV+' : bet.type === 'arb' ? 'Arb' : 'Free Bet';
        const oddsDisplay = bet.odds >= 0 ? '+' + Math.round(bet.odds) : Math.round(bet.odds);
        
        // Status badge
        let statusBadge = '';
        let statusClass = '';
        if(bet.status === 'won') {
            statusBadge = '✓ Won';
            statusClass = 'status-won';
        } else if(bet.status === 'lost') {
            statusBadge = '✗ Lost';
            statusClass = 'status-lost';
        } else {
            statusBadge = '⏳ Pending';
            statusClass = 'status-pending';
        }
        
        // Profit display
        let profitDisplay = '';
        if(bet.status === 'won' && bet.profit > 0) {
            profitDisplay = `<div class="bet-detail">Profit: <span style="color:var(--success);font-weight:700;">+$${bet.profit.toFixed(2)}</span></div>`;
        } else if(bet.status === 'lost') {
            profitDisplay = `<div class="bet-detail">Loss: <span style="color:var(--danger);font-weight:700;">-$${bet.stake.toFixed(2)}</span></div>`;
        } else if(bet.payout > 0) {
            profitDisplay = `<div class="bet-detail">To Win: <span style="color:var(--text-secondary);">$${(bet.payout - bet.stake).toFixed(2)}</span></div>`;
        }
        
        // Paired indicator
        let pairIndicator = '';
        if(isPaired) {
            pairIndicator = bet.isFreebet ? 
                `<span style="font-size:10px; background:var(--success); color:#000; padding:2px 6px; border-radius:4px;">🎁 FREE BET</span>` :
                `<span style="font-size:10px; background:var(--warning); color:#000; padding:2px 6px; border-radius:4px;">🔄 HEDGE</span>`;
        }
        
        // Action buttons - show different buttons based on status
        let actionButtons = '';
        if(bet.status === 'pending') {
            actionButtons = `
                <div class="bet-actions">
                    <button class="bet-action-btn won" onclick="event.stopPropagation(); updateBetStatus('${bet.id}', 'won')">✓ Won</button>
                    <button class="bet-action-btn lost" onclick="event.stopPropagation(); updateBetStatus('${bet.id}', 'lost')">✗ Lost</button>
                    <button class="bet-action-btn delete" onclick="event.stopPropagation(); deleteBet('${bet.id}')">🗑️</button>
                </div>
            `;
        } else {
            actionButtons = `
                <div class="bet-actions">
                    <button class="bet-action-btn" style="background:var(--surface-elevated); color:var(--text-muted);" onclick="event.stopPropagation(); updateBetStatus('${bet.id}', 'pending')">↩ Undo</button>
                    <button class="bet-action-btn delete" onclick="event.stopPropagation(); deleteBet('${bet.id}')">🗑️ Delete</button>
                </div>
            `;
        }
        
        // Pair button for single bets
        let pairBtn = '';
        if(!isPaired) {
            pairBtn = `<button class="bet-action-btn" style="background:var(--surface-elevated); color:var(--text-muted); font-size:10px; padding:4px 8px;" onclick="event.stopPropagation(); startPairing('${bet.id}')">🔗 Pair</button>`;
        }
        
        return `
            <div class="bet-card ${statusClass} ${isPaired ? 'paired-bet' : ''}" data-id="${bet.id}" style="${isPaired ? 'flex:1; min-width:0;' : ''}">
                <div class="bet-card-header">
                    <span style="font-size:12px; color:var(--text-secondary); font-weight:600;">${bet.book}</span>
                    <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
                        ${pairIndicator}
                        <span class="bet-status-badge ${statusClass}">${statusBadge}</span>
                        <span class="bet-type-badge ${bet.type}">${typeLabel}</span>
                    </div>
                </div>
                <div class="bet-card-body">
                    <div class="bet-selection">${bet.selection}</div>
                    <div class="bet-event">${bet.event}${bet.market ? ' • ' + bet.market : ''}</div>
                    ${bet.date ? `<div class="bet-date" style="font-size:11px; color:var(--text-muted); margin-top:2px;">📅 ${formatBetDate(bet.date)}</div>` : ''}
                    <div class="bet-details">
                        <div class="bet-detail">Odds: <span>${oddsDisplay}</span></div>
                        <div class="bet-detail">Stake: <span>$${bet.stake.toFixed(2)}</span></div>
                        ${bet.ev > 0 ? `<div class="bet-detail">EV: <span class="bet-ev">+${bet.ev.toFixed(1)}%</span></div>` : ''}
                        ${profitDisplay}
                    </div>
                    <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
                        ${actionButtons}
                        ${pairBtn}
                    </div>
                </div>
            </div>
        `;
    }
    
    // Render bet cards with pairs grouped
    let html = '';
    
    // Render paired bets side by side
    for(const pairId in pairedBets) {
        const pair = pairedBets[pairId];
        if(pair.length === 2) {
            // Sort: free bet first, then hedge
            pair.sort((a, b) => (b.isFreebet ? 1 : 0) - (a.isFreebet ? 1 : 0));
            
            // Calculate profit scenarios for arb display
            const bet1 = pair[0];
            const bet2 = pair[1];
            
            // Calculate payout for each side
            // American odds to decimal: positive = (odds/100)+1, negative = (100/|odds|)+1
            const toDecimal = (odds) => odds >= 0 ? (odds / 100) + 1 : (100 / Math.abs(odds)) + 1;
            const decimal1 = toDecimal(bet1.odds);
            const decimal2 = toDecimal(bet2.odds);
            
            // Determine which is free bet and which is hedge
            const freeBet = bet1.isFreebet ? bet1 : (bet2.isFreebet ? bet2 : null);
            const hedgeBet = bet1.isFreebet ? bet2 : (bet2.isFreebet ? bet1 : null);
            
            let profitIf1Wins, profitIf2Wins, totalStaked;
            
            if(freeBet && hedgeBet) {
                // FREE BET CONVERSION MATH
                // Free bet wins: profit only (no stake return) minus hedge stake
                // Hedge wins: full payout minus nothing (free bet stake was free)
                const freeDecimal = toDecimal(freeBet.odds);
                const hedgeDecimal = toDecimal(hedgeBet.odds);
                
                // Free bet profit = stake * (decimal - 1) since stake not returned
                const freeBetProfit = freeBet.stake * (freeDecimal - 1);
                const hedgePayout = hedgeBet.stake * hedgeDecimal;
                
                // Only the hedge stake is real money at risk
                totalStaked = hedgeBet.stake;
                
                // If free bet wins: get free bet profit, lose hedge stake
                const profitIfFreeWins = freeBetProfit - hedgeBet.stake;
                // If hedge wins: get hedge payout, free bet loses nothing (was free)
                const profitIfHedgeWins = hedgePayout - hedgeBet.stake;
                
                // Assign to correct bet position
                if(bet1.isFreebet) {
                    profitIf1Wins = profitIfFreeWins;
                    profitIf2Wins = profitIfHedgeWins;
                } else {
                    profitIf1Wins = profitIfHedgeWins;
                    profitIf2Wins = profitIfFreeWins;
                }
            } else {
                // REGULAR ARB MATH - both are cash bets
                totalStaked = bet1.stake + bet2.stake;
                const payout1 = bet1.stake * decimal1;
                const payout2 = bet2.stake * decimal2;
                profitIf1Wins = payout1 - totalStaked;
                profitIf2Wins = payout2 - totalStaked;
            }
            
            // Build profit summary
            let profitSummary = '';
            if(bet1.status === 'pending' && bet2.status === 'pending') {
                const isFreeConversion = freeBet && hedgeBet;
                const stakeLabel = isFreeConversion ? 'Cash at Risk (Hedge):' : 'Total Staked:';
                
                profitSummary = `
                    <div class="bet-pair-profit">
                        <div class="pair-profit-row">
                            <span>If <strong>${bet1.selection.substring(0, 20)}${bet1.selection.length > 20 ? '...' : ''}</strong> wins:</span>
                            <span style="color:${profitIf1Wins >= 0 ? 'var(--success)' : 'var(--danger)'}; font-weight:700;">
                                ${profitIf1Wins >= 0 ? '+' : ''}$${profitIf1Wins.toFixed(2)}
                            </span>
                        </div>
                        <div class="pair-profit-row">
                            <span>If <strong>${bet2.selection.substring(0, 20)}${bet2.selection.length > 20 ? '...' : ''}</strong> wins:</span>
                            <span style="color:${profitIf2Wins >= 0 ? 'var(--success)' : 'var(--danger)'}; font-weight:700;">
                                ${profitIf2Wins >= 0 ? '+' : ''}$${profitIf2Wins.toFixed(2)}
                            </span>
                        </div>
                        <div class="pair-profit-row" style="border-top:1px solid var(--border); padding-top:8px; margin-top:8px;">
                            <span>${stakeLabel}</span>
                            <span style="color:var(--primary); font-weight:700;">$${totalStaked.toFixed(2)}</span>
                        </div>
                    </div>
                `;
            }
            
            html += `
                <div class="bet-pair-container">
                    <div class="bet-pair-header">
                        <span>🔗 Paired Bets</span>
                        <button class="bet-action-btn" style="background:transparent; color:var(--text-muted); font-size:10px; padding:2px 6px;" onclick="unpairBets('${pairId}')">Unpair</button>
                    </div>
                    ${profitSummary}
                    <div class="bet-pair-cards">
                        ${pair.map(bet => renderBetCard(bet, true)).join('')}
                    </div>
                </div>
            `;
        } else {
            // Only one bet from pair passed filter, render as single
            pair.forEach(bet => {
                html += renderBetCard(bet, false);
            });
        }
    }
    
    // Render single bets
    singleBets.forEach(bet => {
        html += renderBetCard(bet, false);
    });
    
    list.innerHTML = html;
    
    // Render summary
    const totalStake = bets.reduce((s, b) => s + b.stake, 0);
    const avgEV = bets.filter(b => b.ev > 0).reduce((s, b, i, arr) => s + b.ev / arr.length, 0);
    const evCount = bets.filter(b => b.type === 'ev').length;
    const arbCount = bets.filter(b => b.type === 'arb').length;
    const fbCount = bets.filter(b => b.type === 'freebet').length;
    
    // Calculate P/L
    const wonBets = bets.filter(b => b.status === 'won');
    const lostBets = bets.filter(b => b.status === 'lost');
    const pendingBets = bets.filter(b => b.status === 'pending');
    const totalProfit = wonBets.reduce((s, b) => s + (b.profit || 0), 0);
    const totalLoss = lostBets.reduce((s, b) => s + b.stake, 0);
    const netPL = totalProfit - totalLoss;
    
    summary.innerHTML = `
        <div class="bets-summary-row"><span>Total Bets</span><span style="color:var(--text);font-weight:700;">${bets.length}</span></div>
        <div class="bets-summary-row"><span>Record</span><span><span style="color:var(--success)">${wonBets.length}W</span> - <span style="color:var(--danger)">${lostBets.length}L</span> - <span style="color:var(--text-muted)">${pendingBets.length}P</span></span></div>
        <div class="bets-summary-row"><span>Total Stake</span><span style="color:var(--primary);font-weight:700;">$${totalStake.toFixed(2)}</span></div>
        <div class="bets-summary-row"><span>Avg EV</span><span style="color:var(--success);font-weight:700;">+${avgEV.toFixed(1)}%</span></div>
        <div class="bets-summary-row">
            <span>Net P/L</span>
            <span style="color:${netPL >= 0 ? 'var(--success)' : 'var(--danger)'};font-weight:700;">${netPL >= 0 ? '+' : ''}$${netPL.toFixed(2)}</span>
        </div>
    `;
}

function clearActiveBets() {
    if(confirm('Clear all active bets?')) {
        activeBets = [];
        _syncBets();
        renderActiveBets();
        showToast('Bets cleared');
    }
}

// Manual bet pairing
let pairingBetId = null;

function startPairing(betId) {
    if(pairingBetId) {
        // Cancel existing pairing mode
        cancelPairing();
    }
    pairingBetId = betId;
    showToast('Select another bet to pair with');
    
    // Highlight source bet and add click handlers to targets
    document.querySelectorAll('.bet-card').forEach(card => {
        if(card.dataset.id === betId) {
            card.classList.add('pairing-source');
        } else if(!card.closest('.bet-pair-container')) {
            card.classList.add('pairing-target');
            card.addEventListener('click', handlePairClick);
        }
    });
    
    // Add cancel button to UI
    const list = document.getElementById('bets-list');
    const cancelBtn = document.createElement('div');
    cancelBtn.id = 'pairing-cancel';
    cancelBtn.innerHTML = `
        <div style="position:fixed; bottom:80px; left:50%; transform:translateX(-50%); z-index:1000; 
                    background:var(--warning); color:#000; padding:12px 24px; border-radius:12px;
                    font-weight:700; font-size:14px; box-shadow:0 4px 20px rgba(0,0,0,0.3); cursor:pointer;"
             onclick="cancelPairing()">
            🔗 Pairing Mode - Tap another bet or Cancel
        </div>
    `;
    document.body.appendChild(cancelBtn);
}

function handlePairClick(e) {
    e.stopPropagation();
    const targetId = e.currentTarget.dataset.id;
    if(targetId && pairingBetId && targetId !== pairingBetId) {
        pairBets(pairingBetId, targetId);
    }
}

function cancelPairing() {
    pairingBetId = null;
    document.querySelectorAll('.bet-card').forEach(card => {
        card.classList.remove('pairing-source', 'pairing-target');
        card.removeEventListener('click', handlePairClick);
    });
    const cancelBtn = document.getElementById('pairing-cancel');
    if(cancelBtn) cancelBtn.remove();
}

function pairBets(betId1, betId2) {
    const bet1 = activeBets.find(b => b.id === betId1);
    const bet2 = activeBets.find(b => b.id === betId2);
    
    if(!bet1 || !bet2) {
        showToast('Could not find bets to pair');
        cancelPairing();
        return;
    }
    
    // Generate new pairId
    const pairId = `pair_manual_${Date.now()}`;
    bet1.pairId = pairId;
    bet2.pairId = pairId;
    
    // If one is a freebet, mark both as freebet type
    if(bet1.isFreebet || bet2.isFreebet) {
        bet1.type = 'freebet';
        bet2.type = 'freebet';
    }
    
    _syncBets();
    cancelPairing();
    renderActiveBets();
    showToast('Bets paired! 🔗');
}

function unpairBets(pairId) {
    activeBets.forEach(bet => {
        if(bet.pairId === pairId) {
            bet.pairId = null;
            if(!bet.isFreebet && bet.type === 'freebet') {
                bet.type = 'ev';
            }
        }
    });
    _syncBets();
    renderActiveBets();
    showToast('Bets unpaired');
}

/* -----------------------------
   Sportsbook Deep Links
----------------------------- */
const sportsbookLinks = {
    'draftkings': { web: 'https://sportsbook.draftkings.com', app: 'dksportsbook://home', name: 'DraftKings' },
    'fanduel': { web: 'https://sportsbook.fanduel.com', app: 'fdsblink://home', name: 'FanDuel' },
    'betmgm': { web: 'https://sports.betmgm.com', app: 'betmgm://sports', name: 'BetMGM' },
    'caesars': { web: 'https://sportsbook.caesars.com', app: 'czr://sports', name: 'Caesars' },
    'espnbet': { web: 'https://espnbet.com', app: 'espnbet://home', name: 'ESPN BET' },
    'fanatics': { web: 'https://sportsbook.fanatics.com', app: 'fanatics://sportsbook', name: 'Fanatics' },
    'betrivers': { web: 'https://www.betrivers.com', app: 'betrivers://home', name: 'BetRivers' },
    'hard rock': { web: 'https://hardrock.bet', app: 'hardrockbet://home', name: 'Hard Rock' },
    'bet365': { web: 'https://www.bet365.com', app: 'bet365://home', name: 'Bet365' },
    'betonline': { web: 'https://www.betonline.ag', app: null, name: 'BetOnline' },
    'bovada': { web: 'https://www.bovada.lv', app: null, name: 'Bovada' },
    'pinnacle': { web: 'https://www.pinnacle.com', app: null, name: 'Pinnacle' },
    'unibet': { web: 'https://www.unibet.com', app: 'unibet://sports', name: 'Unibet' },
    'superbook': { web: 'https://superbook.com', app: 'superbook://home', name: 'SuperBook' },
    'fliff': { web: 'https://www.getfliff.com', app: 'fliff://home', name: 'Fliff' }
};

function openSportsbook(bookName, eventInfo) {
    const key = bookName.toLowerCase().replace(/[^a-z0-9]/g, '');
    let link = null;
    for(const [name, urls] of Object.entries(sportsbookLinks)) {
        if(key.includes(name.replace(/[^a-z0-9]/g, ''))) {
            link = urls;
            break;
        }
    }
    
    if(!link) {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(bookName + ' sportsbook')}`, '_blank');
        showToast(`Searching for ${bookName}...`);
        return;
    }
    
    // Universal Links will open app if installed, otherwise website
    window.location.href = link.web;
    showToast(`Opening ${link.name}...`);
}

/* -----------------------------
   Odds API - Lightweight, credit-friendly loaders
   - Shows sports selector
   - Loads minimal event list (markets fogged)
   - Preview shows basic event info
   - Load Markets fetches detailed markets on-demand
----------------------------- */

function saveOddsApiKey() {
    const input = document.getElementById('odds-api-key-input');
    const key = input.value.trim();
    if(!key) {
        showToast('Please enter an API key');
        return;
    }
    localStorage.setItem('odds_api_key', key);
    showToast('API key saved!');
    updateApiKeyUI();
    loadOdds();
}

function clearOddsApiKey() {
    if(confirm('Remove your API key?')) {
        localStorage.removeItem('odds_api_key');
        document.getElementById('odds-api-key-input').value = '';
        showToast('API key removed');
        updateApiKeyUI();
        loadOdds();
    }
}

function showApiKeyEditor() {
    const saved = document.getElementById('api-key-saved');
    const editor = document.getElementById('api-key-editor');
    const clearBtn = document.getElementById('clear-api-btn');
    const input = document.getElementById('odds-api-key-input');
    const key = localStorage.getItem('odds_api_key');
    if(saved) saved.style.display = 'none';
    if(editor) editor.style.display = 'block';
    if(clearBtn && key) clearBtn.style.display = 'inline-block';
    if(input && key) input.value = key;
}

function updateApiKeyUI() {
    const key = localStorage.getItem('odds_api_key');
    const saved = document.getElementById('api-key-saved');
    const editor = document.getElementById('api-key-editor');
    const setupDiv = document.getElementById('odds-api-setup');
    if(key) {
        // Key exists — show compact saved state
        if(setupDiv) setupDiv.style.display = 'block';
        if(saved) saved.style.display = 'block';
        if(editor) editor.style.display = 'none';
    } else {
        // No key — show full editor
        if(setupDiv) setupDiv.style.display = 'block';
        if(saved) saved.style.display = 'none';
        if(editor) editor.style.display = 'block';
    }
}

function showOddsApiSetup() {
    const setupDiv = document.getElementById('odds-api-setup');
    if(setupDiv) setupDiv.style.display = 'block';
    showApiKeyEditor();
}

async function loadOdds() {
    const container = document.getElementById('odds-content');
    const key = localStorage.getItem('odds_api_key');
    updateApiKeyUI();

    if(!key) {
        container.innerHTML = `<div style="padding:20px; text-align:center; color:var(--text-muted);">
            <div style="font-size:48px; margin-bottom:16px;"><i data-lucide="key-round" style="width:48px;height:48px;"></i></div>
            <div style="font-size:14px;">Enter your API key above to load odds</div>
        </div>`;
        if(window.refreshIcons) refreshIcons(); else if(window.lucide) lucide.createIcons();
        return;
    }
    container.innerHTML = `<div style="padding:12px;color:#9CA3AF">Loading sports...</div>`;
    
    try {
        const res = await fetch(`https://api.the-odds-api.com/v4/sports?apiKey=${encodeURIComponent(key)}`);
        if(!res.ok) throw new Error('Failed to fetch sports');
        const sports = await res.json();
        // build selector with better styling
        container.innerHTML = '';
        const top = document.createElement('div'); top.className = 'odds-header';
        
        const sel = document.createElement('select'); sel.className = 'odds-sport-select'; sel.onchange = () => fetchEvents(sel.value);
        sports.forEach(s => { const opt = document.createElement('option'); opt.value = s.key; opt.text = s.title; sel.appendChild(opt); });
        top.appendChild(sel);
        const refreshBtn = document.createElement('button'); refreshBtn.className='odds-refresh-btn'; refreshBtn.innerText='↻ Refresh'; refreshBtn.onclick = () => fetchEvents(sel.value);
        top.appendChild(refreshBtn);
        
        container.appendChild(top);
        
        // Add settings row below
        const settingsRow = document.createElement('div');
        settingsRow.style.cssText = 'padding:8px 16px; display:flex; justify-content:flex-end;';
        const keyBtn = document.createElement('button');
        keyBtn.innerText = '⚙️ API Settings';
        keyBtn.style.cssText = 'padding:6px 12px; border-radius:6px; background:transparent; border:1px solid var(--border); color:var(--text-muted); font-size:11px; cursor:pointer;';
        keyBtn.onclick = () => showOddsApiSetup();
        settingsRow.appendChild(keyBtn);
        container.appendChild(settingsRow);
        
        const list = document.createElement('div'); list.id = 'odds-events-list'; container.appendChild(list);
        // cache minimal events global
        window._oddsEvents = window._oddsEvents || {};
        // load default (first sport)
        if(sports.length) fetchEvents(sports[0].key);
    } catch (err) {
        container.innerHTML = `<div style="padding:12px;color:#FF6B6B">Error loading sports: ${err.message}</div>`;
        console.error(err);
    }
}

async function fetchEvents(sportKey) {
    const key = localStorage.getItem('odds_api_key');
    const list = document.getElementById('odds-events-list'); if(!list) return;
    list.innerHTML = `<div style="padding:12px;color:#9CA3AF">Loading upcoming events for ${sportKey}...</div>`;
    try {
        // minimal markets request to conserve credits (h2h only)
        const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?apiKey=${encodeURIComponent(key)}&regions=us&markets=h2h&oddsFormat=american&dateFormat=iso`;
        const r = await fetch(url);
        if(!r.ok) {
            const body = await r.text(); throw new Error(`API ${r.status}: ${body}`);
        }
        const events = await r.json();
        window._oddsEvents = window._oddsEvents || {};
        window._oddsEvents[sportKey] = events.map(ev => ({ id: ev.id || ev.marketId || ev.key || ev.home_team+"_"+ev.away_team, sport: sportKey, home: ev.home_team, away: ev.away_team, commence_time: ev.commence_time, raw: ev }));
        renderEventsList(sportKey);
    } catch (err) {
        list.innerHTML = `<div style="padding:12px;color:#FF6B6B">Error fetching events: ${err.message}</div>`;
        console.error(err);
    }
}

function renderEventsList(sportKey) {
    const list = document.getElementById('odds-events-list');
    if(!list) { loadOdds(); return; }
    list.innerHTML = '';
    const events = (window._oddsEvents && window._oddsEvents[sportKey]) || [];
    if(events.length === 0) { list.innerHTML = `<div style="padding:20px;color:#9CA3AF;text-align:center">No upcoming events found for this sport.</div>`; return; }
    events.forEach((ev, idx) => {
        const card = document.createElement('div'); card.className='odds-event-card';
        const time = new Date(ev.commence_time).toLocaleString('en-US', {weekday:'short', month:'short', day:'numeric', hour:'numeric', minute:'2-digit'});
        // Show quick h2h odds from cached raw data if available
        let quickOdds = '';
        if(ev.raw && ev.raw.bookmakers && ev.raw.bookmakers.length > 0) {
            const bk = ev.raw.bookmakers[0];
            const bookTitle = bk.title || bk.key || '';
            const h2h = bk.markets && bk.markets.find(m => m.key === 'h2h');
            if(h2h && h2h.outcomes) {
                quickOdds = `<div class="odds-grid" style="grid-template-columns: 1fr 1fr; margin-top:0; border-radius:0 0 12px 12px;">
                    ${h2h.outcomes.map(o => `<div class="odds-cell clickable" onclick="event.stopPropagation(); openSportsbook('${bookTitle.replace(/'/g, "\\'")}', '${o.name.replace(/'/g, "\\'")}')" style="padding:14px"><div class="odds-price ${o.price >= 0 ? 'positive' : 'negative'}">${o.price >= 0 ? '+' : ''}${o.price}</div><div class="odds-point">${o.name}</div></div>`).join('')}
                </div>`;
            }
        }
        card.innerHTML = `
            <div class="odds-event-header">
                <div>
                    <div class="odds-event-teams">${ev.away} @ ${ev.home}</div>
                    <div class="odds-event-time">📅 ${time}</div>
                </div>
                <div class="odds-event-actions">
                    <button class="odds-btn odds-btn-primary" data-load="${idx}">View All Markets</button>
                </div>
            </div>
            ${quickOdds}
        `;
        list.appendChild(card);
        card.querySelector('[data-load]').onclick = (e) => { e.stopPropagation(); loadEventMarkets(sportKey, idx); };
    });
}

async function loadEventMarkets(sportKey, idx) {
    const key = localStorage.getItem('odds_api_key');
    const ev = (window._oddsEvents && window._oddsEvents[sportKey] || [])[idx]; if(!ev) return alert('Event not found');
    // Try with all markets first, fallback to basic if player_props invalid
    let markets = 'h2h,spreads,totals,player_props';
    let events = null;
    try {
        let url = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?apiKey=${encodeURIComponent(key)}&regions=us&markets=${markets}&oddsFormat=american&dateFormat=iso`;
        let r = await fetch(url);
        if(r.status === 422) {
            // Likely player_props invalid for this sport, retry without it
            console.log('Retrying without player_props...');
            markets = 'h2h,spreads,totals';
            url = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?apiKey=${encodeURIComponent(key)}&regions=us&markets=${markets}&oddsFormat=american&dateFormat=iso`;
            r = await fetch(url);
        }
        if(!r.ok) {
            const body = await r.text(); throw new Error(`API ${r.status}: ${body}`);
        }
        events = await r.json();
        // find matching event by home/away and commence_time
        const match = events.find(e => (e.home_team === ev.home && e.away_team === ev.away && e.commence_time === ev.commence_time) || e.id === ev.id);
        if(!match) return alert('Detailed event not found in response');
        // render markets with grid layout
        const content = document.getElementById('odds-content');
        const time = new Date(ev.commence_time).toLocaleString('en-US', {weekday:'short', month:'short', day:'numeric', hour:'numeric', minute:'2-digit'});
        content.innerHTML = `
            <button class="odds-back-btn" onclick="loadOdds()">← Back to Events</button>
            <div style="background:var(--card);border-radius:12px;overflow:hidden;border:1px solid var(--card-border);">
                <div style="padding:16px 20px;background:linear-gradient(135deg, rgba(157,78,221,0.15) 0%, transparent 100%);border-bottom:1px solid var(--card-border);">
                    <div style="font-size:18px;font-weight:800;color:#FFF;">${ev.away} @ ${ev.home}</div>
                    <div style="font-size:12px;color:#777;margin-top:6px;">📅 ${time}</div>
                </div>
                <div class="market-tabs" id="market-tabs"></div>
                <div id="markets-area" style="padding:0;"></div>
            </div>
        `;
        const tabsEl = document.getElementById('market-tabs');
        const area = document.getElementById('markets-area');
        if(!match.bookmakers || match.bookmakers.length === 0) { area.innerHTML = '<div style="padding:20px;color:#999;text-align:center">No bookmaker markets found.</div>'; return; }
        
        // Collect all unique markets
        const marketKeys = new Set();
        match.bookmakers.forEach(bk => (bk.markets||[]).forEach(m => marketKeys.add(m.key)));
        const marketList = Array.from(marketKeys);
        const marketNames = { h2h: 'Moneyline', spreads: 'Spread', totals: 'Total', player_props: 'Player Props' };
        
        // Render market tabs
        marketList.forEach((mk, i) => {
            const tab = document.createElement('div');
            tab.className = 'market-tab' + (i === 0 ? ' active' : '');
            tab.innerText = marketNames[mk] || mk;
            tab.onclick = () => { document.querySelectorAll('.market-tab').forEach(t => t.classList.remove('active')); tab.classList.add('active'); renderMarketGrid(match, mk); };
            tabsEl.appendChild(tab);
        });
        
        // Render first market
        if(marketList.length > 0) renderMarketGrid(match, marketList[0]);
        
        function renderMarketGrid(matchData, marketKey) {
            const area = document.getElementById('markets-area');
            // Get all bookmakers that have this market
            const booksWithMarket = matchData.bookmakers.filter(bk => (bk.markets||[]).some(m => m.key === marketKey));
            if(booksWithMarket.length === 0) { area.innerHTML = '<div style="padding:20px;color:#999;text-align:center">No odds available for this market.</div>'; return; }
            
            // Get all unique outcomes for this market
            const outcomeSet = new Map();
            booksWithMarket.forEach(bk => {
                const mkt = bk.markets.find(m => m.key === marketKey);
                if(mkt && mkt.outcomes) {
                    mkt.outcomes.forEach(o => {
                        const key = o.name + (o.point !== undefined ? '_' + o.point : '');
                        if(!outcomeSet.has(key)) outcomeSet.set(key, { name: o.name, point: o.point });
                    });
                }
            });
            const outcomes = Array.from(outcomeSet.values());
            
            // Build grid: columns = bookmakers, rows = outcomes
            const numCols = booksWithMarket.length + 1; // +1 for outcome label
            let gridHtml = `<div class="odds-grid" style="grid-template-columns: minmax(120px, 1.5fr) repeat(${booksWithMarket.length}, 1fr);">`;
            
            // Header row
            gridHtml += `<div class="odds-grid-header"><div style="text-align:left;padding-left:14px;">Outcome</div>`;
            booksWithMarket.forEach(bk => {
                const name = (bk.title || bk.key || '').replace(' ', '\n');
                gridHtml += `<div>${name}</div>`;
            });
            gridHtml += `</div>`;
            
            // Data rows
            outcomes.forEach(outcome => {
                gridHtml += `<div class="odds-grid-row"><div class="odds-team-cell">${outcome.name}${outcome.point !== undefined ? ' <span style="color:#9CA3AF;font-size:11px;">' + (outcome.point >= 0 ? '+' : '') + outcome.point + '</span>' : ''}</div>`;
                booksWithMarket.forEach(bk => {
                    const mkt = bk.markets.find(m => m.key === marketKey);
                    const found = mkt && mkt.outcomes ? mkt.outcomes.find(o => o.name === outcome.name && (outcome.point === undefined || o.point === outcome.point)) : null;
                    if(found) {
                        const price = found.price;
                        const cls = price >= 0 ? 'positive' : 'negative';
                        const bookTitle = bk.title || bk.key || '';
                        gridHtml += `<div class="odds-cell clickable" onclick="openSportsbook('${bookTitle.replace(/'/g, "\\'")}', '${outcome.name.replace(/'/g, "\\'")}')"><div class="odds-price ${cls}">${price >= 0 ? '+' : ''}${price}</div></div>`;
                    } else {
                        gridHtml += `<div class="odds-cell"><div class="odds-empty">—</div></div>`;
                    }
                });
                gridHtml += `</div>`;
            });
            
            gridHtml += `</div>`;
            area.innerHTML = gridHtml;
        }
    } catch (err) {
        alert('Error loading markets: ' + err.message);
        console.error(err);
    }
}

/* ========================================
   DESIGN UPGRADE v39 — New Features
======================================== */

// --- FLOATING PARTICLE SYSTEM (Enhanced: dots + streaks + constellations) ---
(function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId = null;
    let w, h;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    resize();
    let _resizeTimer;
    window.addEventListener('resize', () => { clearTimeout(_resizeTimer); _resizeTimer = setTimeout(resize, 150); });

    const isMobile = window.innerWidth <= 768;
    const DOT_COUNT = isMobile ? 22 : 30;
    const STREAK_COUNT = isMobile ? 8 : 12;
    const CONNECTION_DIST = isMobile ? 90 : 120; // constellation on all devices
    const colors = [
        { r: 0, g: 255, b: 135 },   // neon green
        { r: 191, g: 64, b: 255 },   // neon purple
        { r: 0, g: 204, b: 106 },    // mid green
        { r: 160, g: 80, b: 255 },   // light purple
        { r: 0, g: 217, b: 255 },    // cyan
    ];

    function createDot() {
        const col = colors[Math.floor(Math.random() * colors.length)];
        return {
            type: 'dot',
            x: Math.random() * w,
            y: Math.random() * h,
            size: Math.random() * 2.5 + 1,
            speedX: (Math.random() - 0.5) * 0.35,
            speedY: (Math.random() - 0.5) * 0.3 - 0.08,
            opacity: Math.random() * 0.4 + 0.1,
            targetOpacity: Math.random() * 0.5 + 0.15,
            fadeSpeed: 0.002 + Math.random() * 0.004,
            fadingIn: Math.random() > 0.5,
            r: col.r, g: col.g, b: col.b,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.008 + Math.random() * 0.015,
        };
    }

    function createStreak() {
        const col = colors[Math.floor(Math.random() * colors.length)];
        const angle = (Math.random() * 0.8 + 0.2) * (Math.random() > 0.5 ? 1 : -1); // diagonal
        return {
            type: 'streak',
            x: Math.random() * w,
            y: Math.random() * h,
            length: Math.random() * 20 + 10,
            thickness: Math.random() * 1.2 + 0.4,
            angle: angle,
            speedX: Math.cos(angle) * (0.15 + Math.random() * 0.25),
            speedY: Math.sin(angle) * (0.15 + Math.random() * 0.25) - 0.15,
            opacity: Math.random() * 0.25 + 0.05,
            targetOpacity: Math.random() * 0.35 + 0.1,
            fadeSpeed: 0.001 + Math.random() * 0.003,
            fadingIn: Math.random() > 0.5,
            r: col.r, g: col.g, b: col.b,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.005 + Math.random() * 0.01,
        };
    }

    for(let i = 0; i < DOT_COUNT; i++) particles.push(createDot());
    for(let i = 0; i < STREAK_COUNT; i++) particles.push(createStreak());

    function animate() {
        ctx.clearRect(0, 0, w, h);

        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const opacityMult = isLight ? 0.35 : 1;

        // Update positions and opacities
        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            p.pulse += p.pulseSpeed;

            if(p.fadingIn) {
                p.opacity += p.fadeSpeed;
                if(p.opacity >= p.targetOpacity) { p.fadingIn = false; }
            } else {
                p.opacity -= p.fadeSpeed;
                if(p.opacity <= 0.05) {
                    p.fadingIn = true;
                    p.targetOpacity = p.type === 'dot' ? Math.random() * 0.5 + 0.15 : Math.random() * 0.35 + 0.1;
                }
            }

            if(p.x < -30) p.x = w + 30;
            if(p.x > w + 30) p.x = -30;
            if(p.y < -30) p.y = h + 30;
            if(p.y > h + 30) p.y = -30;
        });

        // Draw constellation connection lines between nearby dots (desktop only)
        if(CONNECTION_DIST > 0) {
            const dots = particles.filter(p => p.type === 'dot');
            ctx.lineWidth = 0.6;
            for(let i = 0; i < dots.length; i++) {
                for(let j = i + 1; j < dots.length; j++) {
                    const dx = dots[i].x - dots[j].x;
                    const dy = dots[i].y - dots[j].y;
                    const distSq = dx * dx + dy * dy;
                    if(distSq < CONNECTION_DIST * CONNECTION_DIST) {
                        const dist = Math.sqrt(distSq);
                        const lineOpacity = (1 - dist / CONNECTION_DIST) * 0.12 * opacityMult;
                        const avgR = (dots[i].r + dots[j].r) >> 1;
                        const avgG = (dots[i].g + dots[j].g) >> 1;
                        const avgB = (dots[i].b + dots[j].b) >> 1;
                        ctx.strokeStyle = `rgba(${avgR},${avgG},${avgB},${lineOpacity})`;
                        ctx.beginPath();
                        ctx.moveTo(dots[i].x, dots[i].y);
                        ctx.lineTo(dots[j].x, dots[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        // Draw particles
        particles.forEach(p => {
            const pulseFactor = 0.7 + Math.sin(p.pulse) * 0.3;
            const finalOpacity = p.opacity * pulseFactor * opacityMult;

            if(p.type === 'dot') {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${finalOpacity})`;
                ctx.fill();

                // Glow halo
                if(p.size > 1.8) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${finalOpacity * 0.07})`;
                    ctx.fill();
                }
            } else {
                // Streak — small glowing diagonal line
                const dx = Math.cos(p.angle) * p.length * 0.5;
                const dy = Math.sin(p.angle) * p.length * 0.5;
                ctx.beginPath();
                ctx.moveTo(p.x - dx, p.y - dy);
                ctx.lineTo(p.x + dx, p.y + dy);
                ctx.strokeStyle = `rgba(${p.r},${p.g},${p.b},${finalOpacity})`;
                ctx.lineWidth = p.thickness;
                ctx.lineCap = 'round';
                ctx.stroke();
                ctx.lineWidth = 0.6; // Reset for connections
            }
        });

        animId = requestAnimationFrame(animate);
    }

    setTimeout(() => animate(), 500);

    document.addEventListener('visibilitychange', () => {
        if(document.hidden) {
            cancelAnimationFrame(animId);
        } else {
            animate();
        }
    });
})();

// --- ANIMATED NUMBER TRANSITIONS ---
let _prevTotalBalance = null;
function animateValue(element, newValue, prefix, suffix) {
    if(!element) return;
    const currentText = element.innerText;
    const currentVal = parseFloat(currentText.replace(/[^0-9.\-]/g, '')) || 0;
    if(Math.abs(currentVal - newValue) < 0.01) return;

    const direction = newValue > currentVal ? 'tick-up' : 'tick-down';
    element.classList.remove('tick-up', 'tick-down');
    element.classList.add('number-animate', direction);
    element.innerText = (prefix || '') + Math.abs(newValue).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + (suffix || '');

    setTimeout(() => element.classList.remove(direction), 400);
}

// Debounced Lucide icon refresh — avoids re-scanning DOM on every call
let _lucideTimer = null;
function refreshIcons() {
    if(_lucideTimer) return;
    _lucideTimer = setTimeout(() => { _lucideTimer = null; if(window.lucide) lucide.createIcons(); }, 60);
}
window.refreshIcons = refreshIcons;

// Wrap the original renderDashboard to add number animation
const _origRenderDashboard = renderDashboard;
renderDashboard = function() {
    const prevTotal = _prevTotalBalance;
    _origRenderDashboard();
    // After render, animate the total balance
    const totalEl = document.getElementById('dash-total');
    if(totalEl) {
        const newVal = parseFloat(totalEl.innerText.replace(/[^0-9.\-]/g, '')) || 0;
        if(prevTotal !== null && Math.abs(prevTotal - newVal) > 0.01) {
            const dir = newVal > prevTotal ? 'tick-up' : 'tick-down';
            totalEl.classList.add('number-animate', dir);
            setTimeout(() => totalEl.classList.remove(dir), 400);
        }
        _prevTotalBalance = newVal;
    }
    // Only refresh icons on the visible dashboard area, not the entire DOM
    if(window.lucide) {
        const heroSection = document.querySelector('.hero-section');
        if(heroSection) lucide.createIcons({nameAttr: 'data-lucide', node: heroSection});
    }
};

// --- CONFETTI CELEBRATION ---
window.launchConfetti = function() {
    const canvas = document.getElementById('confetti-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#00FF87', '#BF40FF', '#3fb950', '#d29922', '#f85149', '#00FFAA', '#E040FB'];
    const particles = [];
    for(let i = 0; i < 120; i++) {
        particles.push({
            x: canvas.width / 2 + (Math.random() - 0.5) * 200,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 16,
            vy: (Math.random() - 1) * 18 - 4,
            w: Math.random() * 10 + 4,
            h: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 12,
            gravity: 0.25 + Math.random() * 0.15,
            opacity: 1,
            decay: 0.008 + Math.random() * 0.008
        });
    }

    let frame = 0;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        particles.forEach(p => {
            if(p.opacity <= 0) return;
            alive = true;
            p.x += p.vx;
            p.vy += p.gravity;
            p.y += p.vy;
            p.vx *= 0.98;
            p.rotation += p.rotSpeed;
            p.opacity -= p.decay;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.globalAlpha = Math.max(0, p.opacity);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
            ctx.restore();
        });
        frame++;
        if(alive && frame < 200) requestAnimationFrame(animate);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    animate();
};

// --- PULL TO REFRESH ---
(function() {
    let touchStartY = 0;
    let pulling = false;
    const threshold = 80;

    document.addEventListener('touchstart', function(e) {
        if(window.scrollY === 0) {
            touchStartY = e.touches[0].clientY;
        }
    }, { passive: true });

    document.addEventListener('touchmove', function(e) {
        if(touchStartY === 0) return;
        const dy = e.touches[0].clientY - touchStartY;
        if(dy > 20 && window.scrollY === 0) {
            pulling = true;
            const ptrEl = document.getElementById('ptr-container');
            if(ptrEl) {
                const progress = Math.min(dy / threshold, 1);
                ptrEl.style.transform = `translateY(${-60 + (60 * progress)}px)`;
                const spinner = document.getElementById('ptr-spinner');
                if(spinner) spinner.style.transform = `rotate(${progress * 360}deg)`;
            }
        }
    }, { passive: true });

    document.addEventListener('touchend', function() {
        if(pulling) {
            const ptrEl = document.getElementById('ptr-container');
            const spinner = document.getElementById('ptr-spinner');
            const transform = ptrEl ? ptrEl.style.transform : '';
            const currentOffset = parseFloat(transform.match(/translateY\(([^p]+)/)?.[1] || -60);

            if(currentOffset >= -10) {
                // Trigger refresh
                if(spinner) spinner.classList.add('spinning');
                if(ptrEl) ptrEl.style.transform = 'translateY(0px)';
                renderDashboard();
                if(window.loadUserDataFromFirestore) window.loadUserDataFromFirestore();
                setTimeout(() => {
                    if(ptrEl) ptrEl.style.transform = 'translateY(-60px)';
                    if(spinner) spinner.classList.remove('spinning');
                    showToast('Refreshed');
                }, 1200);
            } else {
                if(ptrEl) ptrEl.style.transform = 'translateY(-60px)';
            }
        }
        touchStartY = 0;
        pulling = false;
    }, { passive: true });
})();

// --- ONBOARDING FLOW ---
function showOnboarding() {
    const overlay = document.getElementById('onboarding-overlay');
    if(overlay) {
        overlay.classList.add('active');
        if(window.refreshIcons) refreshIcons(); else if(window.lucide) lucide.createIcons();
    }
}
function onboardingNext() {
    const step1 = document.getElementById('onboarding-step-1');
    const step2 = document.getElementById('onboarding-step-2');
    if(step1) step1.style.display = 'none';
    if(step2) { step2.style.display = 'block'; if(window.refreshIcons) refreshIcons(); else if(window.lucide) lucide.createIcons(); }
}
function closeOnboarding() {
    const overlay = document.getElementById('onboarding-overlay');
    if(overlay) overlay.classList.remove('active');
    localStorage.setItem('bankroll_onboarding_done', '1');
}
// Check on load
document.addEventListener('DOMContentLoaded', function() {
    if(!localStorage.getItem('bankroll_onboarding_done')) {
        setTimeout(showOnboarding, 800);
    }
});

// --- LIGHT/DARK THEME TOGGLE ---
function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const newTheme = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('bankroll_theme', newTheme);
    // Update icon (scoped refresh)
    const btn = document.getElementById('theme-toggle-btn');
    if(btn) {
        btn.innerHTML = newTheme === 'light' ?
            '<i data-lucide="moon" class="theme-toggle-icon"></i>' :
            '<i data-lucide="sun" class="theme-toggle-icon"></i>';
        if(window.lucide) lucide.createIcons({nameAttr: 'data-lucide', node: btn});
    }
    // Update chart colors only if graph view is visible
    if(document.getElementById('graph-view').style.display === 'block') {
        setTimeout(drawGraph, 100);
    }
    showToast(newTheme === 'light' ? 'Light mode' : 'Dark mode');
}
// Load saved theme
(function() {
    const saved = localStorage.getItem('bankroll_theme');
    if(saved === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        document.addEventListener('DOMContentLoaded', () => {
            const btn = document.getElementById('theme-toggle-btn');
            if(btn) {
                btn.innerHTML = '<i data-lucide="moon" class="theme-toggle-icon"></i>';
                if(window.refreshIcons) refreshIcons(); else if(window.lucide) lucide.createIcons();
            }
        });
    }
})();

// --- SKELETON LOADING ---
function showSkeletonCards() {
    const list = document.getElementById('card-list');
    if(!list) return;
    let html = '';
    for(let i = 0; i < 4; i++) {
        html += '<div class="skeleton skeleton-card"></div>';
    }
    list.innerHTML = html;
}

// --- INITIALIZE LUCIDE ICONS ---
document.addEventListener('DOMContentLoaded', function() {
    if(window.lucide) {
        lucide.createIcons();
    }
});

// Re-init Lucide icons after dynamic content renders (scoped to active view)
const _origShowTab = showTab;
showTab = function(t) {
    _origShowTab(t);
    // Scope icon refresh to just the active view instead of entire DOM
    if(window.lucide) {
        const view = document.getElementById(t + '-view');
        if(view) lucide.createIcons({nameAttr: 'data-lucide', node: view});
    }
};
