// Main Application Controller & UI State

document.addEventListener('DOMContentLoaded', () => {
    let activeProgram = PROGRAMS_DATA[0];
    let activeCategory = 'All';
    let searchQuery = '';

    // Initialize execution engine & terminal
    const engine = new DSEngine('visualizerCanvas', 'executionLog');
    window.appEngine = engine;

    const terminal = new TurboTerminal('terminalContainer');
    window.appTerminal = terminal;

    // DOM Elements
    const programListEl = document.getElementById('programList');
    const searchInput = document.getElementById('searchPrograms');
    const categoryFiltersEl = document.getElementById('categoryFilters');
    const currentTitleEl = document.getElementById('currentTitle');
    const currentNumEl = document.getElementById('currentNum');
    const currentAimEl = document.getElementById('currentAim');
    const currentCategoryBadge = document.getElementById('currentCategoryBadge');
    const currentTimeComplexity = document.getElementById('currentTimeComplexity');
    const currentSpaceComplexity = document.getElementById('currentSpaceComplexity');
    const cppCodeBlock = document.getElementById('cppCodeBlock');
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    const downloadCppBtn = document.getElementById('downloadCppBtn');
    const speedSlider = document.getElementById('speedSlider');
    const speedValueLbl = document.getElementById('speedValue');
    const clearLogBtn = document.getElementById('clearLogBtn');

    // Sidebar Category Filter Pills
    const categories = ['All', 'Stacks & Queues', 'Sorting', 'Searching', 'Expressions', 'Linked Lists', 'Trees', 'Graphs', 'Recursion', 'Arrays'];

    function renderCategoryFilters() {
        categoryFiltersEl.innerHTML = '';
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = `filter-pill ${cat === activeCategory ? 'active' : ''}`;
            btn.textContent = cat;
            btn.onclick = () => {
                activeCategory = cat;
                renderCategoryFilters();
                renderProgramList();
            };
            categoryFiltersEl.appendChild(btn);
        });
    }

    function renderProgramList() {
        programListEl.innerHTML = '';
        const filtered = PROGRAMS_DATA.filter(p => {
            const matchesCat = activeCategory === 'All' || p.category === activeCategory;
            const matchesSearch = searchQuery === '' || 
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                p.aim.toLowerCase().includes(searchQuery.toLowerCase()) ||
                `p${p.number}`.includes(searchQuery.toLowerCase());
            return matchesCat && matchesSearch;
        });

        if (filtered.length === 0) {
            programListEl.innerHTML = `<div class="sidebar-empty">No practicals found matching "${searchQuery}"</div>`;
            return;
        }

        filtered.forEach(p => {
            const card = document.createElement('div');
            card.className = `prog-sidebar-card ${p.id === activeProgram.id ? 'active' : ''}`;
            card.id = `sidebar-prog-${p.id}`;
            card.innerHTML = `
                <div class="sidebar-card-top">
                    <span class="prog-tag-num">Practical ${p.number}</span>
                    <span class="prog-cat-tag cat-${getCategorySlug(p.category)}">${p.category}</span>
                </div>
                <div class="prog-card-title">${p.title}</div>
                <div class="prog-card-complexity">⏱️ ${p.timeComplexity}</div>
            `;
            card.onclick = () => {
                selectProgram(p);
                // On mobile, close sidebar if open
                document.body.classList.remove('sidebar-open');
            };
            programListEl.appendChild(card);
        });
    }

    function getCategorySlug(cat) {
        return cat.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }

    function selectProgram(p) {
        activeProgram = p;
        renderProgramList();

        // Update Header Info
        currentNumEl.textContent = `PRACTICAL #${p.number}`;
        currentTitleEl.textContent = p.title;
        currentAimEl.textContent = p.aim;
        currentCategoryBadge.textContent = p.category;
        currentCategoryBadge.className = `badge badge-category cat-${getCategorySlug(p.category)}`;
        currentTimeComplexity.textContent = p.timeComplexity;
        currentSpaceComplexity.textContent = p.spaceComplexity;

        // Update C++ Code view
        renderSyntaxHighlitCode(p.code);

        // Update Theory View
        renderTheoryView(p);

        // Load into Interactive Engine
        engine.loadProgram(p.id);

        // Load into Terminal Simulator
        terminal.loadProgram(p);

        // Scroll to top of main view
        document.querySelector('.main-content').scrollTop = 0;
    }

    function renderSyntaxHighlitCode(rawCode) {
        // Simple client-side syntax highlighter for Turbo C++
        const lines = rawCode.split('\n');
        let html = '';
        lines.forEach((line, idx) => {
            let highlighted = escapeHtml(line);
            // Preprocessors
            highlighted = highlighted.replace(/(#include\s*&lt;.*?&gt;|#define\s+\w+\s+\w+)/g, '<span class="cpp-prep">$1</span>');
            // Keywords
            highlighted = highlighted.replace(/\b(void|int|char|struct|return|while|for|if|else|switch|case|break|default|do|sizeof|malloc|free|NULL)\b/g, '<span class="cpp-keyword">$1</span>');
            // IO streams
            highlighted = highlighted.replace(/\b(cout|cin|clrscr|getch)\b/g, '<span class="cpp-io">$1</span>');
            // Strings
            highlighted = highlighted.replace(/(&quot;.*?&quot;)/g, '<span class="cpp-str">$1</span>');
            // Single quotes / chars
            highlighted = highlighted.replace(/(&#39;.*?&#39;|&#39;\\0&#39;)/g, '<span class="cpp-char">$1</span>');
            // Numbers
            highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="cpp-num">$1</span>');
            
            html += `<span class="line-num">${(idx + 1).toString().padStart(2, ' ')}</span> <span class="line-code">${highlighted}</span>\n`;
        });
        cppCodeBlock.innerHTML = html;
    }

    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderTheoryView(p) {
        const descEl = document.getElementById('theoryDescription');
        const algoEl = document.getElementById('theoryAlgorithm');
        const timeEl = document.getElementById('theoryTime');
        const spaceEl = document.getElementById('theorySpace');

        if (descEl) descEl.textContent = p.description || p.aim;
        if (algoEl) {
            const steps = (p.algorithmSteps || 'Refer to C++ source code.').split('\n');
            algoEl.innerHTML = steps.map(s => `<li>${escapeHtml(s)}</li>`).join('');
        }
        if (timeEl) timeEl.textContent = p.timeComplexity;
        if (spaceEl) spaceEl.textContent = p.spaceComplexity;
    }

    // Tab Switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPane = document.getElementById(btn.dataset.tab);
            if (targetPane) targetPane.classList.add('active');

            // If switching to terminal tab, focus input
            if (btn.dataset.tab === 'tabTerminal') {
                const dosIn = document.getElementById('dosInput');
                if (dosIn) dosIn.focus();
            }
        });
    });

    // Search event
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        renderProgramList();
    });

    // Speed Slider
    speedSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        speedValueLbl.textContent = `${val}ms`;
        engine.setSpeed(val);
    });

    // Clear Log
    clearLogBtn.addEventListener('click', () => {
        engine.clearLog();
    });

    // Copy C++ Code
    copyCodeBtn.addEventListener('click', () => {
        if (!activeProgram) return;
        navigator.clipboard.writeText(activeProgram.code).then(() => {
            const orig = copyCodeBtn.innerHTML;
            copyCodeBtn.innerHTML = '<span>✅</span> Copied!';
            setTimeout(() => copyCodeBtn.innerHTML = orig, 2000);
        });
    });

    // Download .cpp
    downloadCppBtn.addEventListener('click', () => {
        if (!activeProgram) return;
        const blob = new Blob([activeProgram.code], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeName = activeProgram.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
        a.download = `p${activeProgram.number}_${safeName}.cpp`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // Mobile Sidebar Drawer Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-open');
        });
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.body.classList.remove('sidebar-open');
        }
    });

    // Initial render
    renderCategoryFilters();
    renderProgramList();
    selectProgram(PROGRAMS_DATA[0]);
});
