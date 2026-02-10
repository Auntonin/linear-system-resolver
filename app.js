/**
 * Linear System Resolver - UI
 */

const elements = {
    matrixSize: document.getElementById('matrix-size'),
    matrixA: document.getElementById('matrix-a'),
    vectorB: document.getElementById('vector-b'),
    outputSection: document.getElementById('output-section'),
    resultCard: document.getElementById('result-card'),
    resultMethod: document.getElementById('result-method'),
    resultStatus: document.getElementById('result-status'),
    resultSolution: document.getElementById('result-solution'),
    logContent: document.getElementById('log-content'),
    btnClear: document.getElementById('btn-clear'),
    btnExample: document.getElementById('btn-example'),
    btnCopy: document.getElementById('btn-copy'),
    btnExpandAll: document.getElementById('btn-expand-all'),
    btnCollapseAll: document.getElementById('btn-collapse-all'),
    methodCards: document.querySelectorAll('.method-card')
};

let currentSize = 3;

const examples = {
    2: { A: [[3, 2], [1, 4]], b: [12, 10] },
    3: { A: [[2, -1, 1], [-3, 4, 1], [1, 1, 5]], b: [8, -1, 9] },
    4: { A: [[2, 1, -1, 1], [1, 3, 2, -1], [3, -1, 1, 2], [1, 1, 1, 1]], b: [6, 3, 13, 10] },
    5: { A: [[5, 1, 0, 0, 0], [1, 4, 1, 0, 0], [0, 1, 4, 1, 0], [0, 0, 1, 4, 1], [0, 0, 0, 1, 5]], b: [6, 6, 6, 6, 6] }
};

function fmt(x) {
    let r = Math.round(x * 10000) / 10000;
    if (Math.abs(r) < 1e-10) return '0';
    return Number.isInteger(r) ? r.toString() : r.toFixed(4).replace(/\.?0+$/, '');
}

function createInputs(size) {
    elements.matrixA.innerHTML = '';
    elements.vectorB.innerHTML = '';
    elements.matrixA.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    elements.vectorB.style.gridTemplateColumns = '1fr';

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let inp = document.createElement('input');
            inp.type = 'number'; inp.step = 'any';
            inp.placeholder = `a${i + 1}${j + 1}`;
            inp.id = `a-${i}-${j}`;
            elements.matrixA.appendChild(inp);
        }
    }
    for (let i = 0; i < size; i++) {
        let inp = document.createElement('input');
        inp.type = 'number'; inp.step = 'any';
        inp.placeholder = `b${i + 1}`;
        inp.id = `b-${i}`;
        elements.vectorB.appendChild(inp);
    }
}

function getData() {
    let n = currentSize, A = [], b = [];
    for (let i = 0; i < n; i++) {
        A[i] = [];
        for (let j = 0; j < n; j++) {
            let v = parseFloat(document.getElementById(`a-${i}-${j}`).value);
            if (isNaN(v)) return null;
            A[i][j] = v;
        }
        let v = parseFloat(document.getElementById(`b-${i}`).value);
        if (isNaN(v)) return null;
        b[i] = v;
    }
    return { A, b };
}

function loadExample() {
    let ex = examples[currentSize];
    if (!ex) return;
    for (let i = 0; i < currentSize; i++) {
        for (let j = 0; j < currentSize; j++) {
            document.getElementById(`a-${i}-${j}`).value = ex.A[i][j];
        }
        document.getElementById(`b-${i}`).value = ex.b[i];
    }
}

function clearAll() {
    for (let i = 0; i < currentSize; i++) {
        for (let j = 0; j < currentSize; j++) document.getElementById(`a-${i}-${j}`).value = '';
        document.getElementById(`b-${i}`).value = '';
    }
    elements.outputSection.classList.remove('visible');
    elements.methodCards.forEach(c => c.classList.remove('active'));
}

function solve(method) {
    let data = getData();
    if (!data) { alert('กรอกค่าให้ครบ'); return; }

    let result, name;
    switch (method) {
        case 'gauss': result = LinearSolver.gaussElimination(data.A, data.b); name = 'Gauss Elimination'; break;
        case 'gauss-jordan': result = LinearSolver.gaussJordan(data.A, data.b); name = 'Gauss-Jordan'; break;
        case 'lu': result = LinearSolver.luFactorization(data.A, data.b); name = 'LU Factorization'; break;
        case 'inverse': result = LinearSolver.inverseMatrix(data.A, data.b); name = 'Inverse Matrix'; break;
    }

    showResult(result, name, method, data);
}

function showResult(result, name, method, data) {
    elements.outputSection.classList.add('visible');
    elements.resultMethod.textContent = name;

    if (result.success) {
        elements.resultCard.classList.remove('error');
        elements.resultStatus.textContent = '✓ สำเร็จ';

        let html = '';
        result.solution.forEach((v, i) => {
            html += `<div class="solution-item"><span class="solution-var">x<sub>${i + 1}</sub></span> = ${fmt(v)}</div>`;
        });
        elements.resultSolution.innerHTML = html;

        // Show explanation
        showExplanation(method, data, result);
    } else {
        elements.resultCard.classList.add('error');
        elements.resultStatus.textContent = '✗ Error';
        elements.resultSolution.innerHTML = result.error;
        elements.logContent.innerHTML = '<div class="log-placeholder"><p>ไม่สามารถคำนวณได้</p></div>';
    }

    elements.outputSection.scrollIntoView({ behavior: 'smooth' });
}

function matrixHTML(M) {
    let r = M.length, c = M[0].length;
    let h = `<div class="log-matrix" style="grid-template-columns: repeat(${c}, 1fr);">`;
    for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
            h += `<div class="log-matrix-cell">${fmt(M[i][j])}</div>`;
        }
    }
    return h + '</div>';
}

function showExplanation(method, data, result) {
    let html = '';

    // Show input
    html += `<div class="log-section"><div class="log-section-title">📊 ข้อมูลนำเข้า</div></div>`;
    html += `<div class="log-step expanded"><div class="log-step-header"><span class="log-step-number">1</span><span class="log-step-title">Matrix A และ Vector b</span></div>`;
    html += `<div class="log-step-content"><strong>A =</strong> ${matrixHTML(data.A)}<br><strong>b =</strong> [${data.b.map(fmt).join(', ')}]</div></div>`;

    // Method specific
    html += `<div class="log-section"><div class="log-section-title">⚙️ ${method === 'gauss' ? 'Gauss Elimination' : method === 'gauss-jordan' ? 'Gauss-Jordan' : method === 'lu' ? 'LU Factorization' : 'Inverse Matrix'}</div></div>`;

    if (method === 'lu' && result.L && result.U) {
        html += `<div class="log-step expanded"><div class="log-step-header"><span class="log-step-number">2</span><span class="log-step-title">Matrix L (Lower)</span></div>`;
        html += `<div class="log-step-content">${matrixHTML(result.L)}</div></div>`;
        html += `<div class="log-step expanded"><div class="log-step-header"><span class="log-step-number">3</span><span class="log-step-title">Matrix U (Upper)</span></div>`;
        html += `<div class="log-step-content">${matrixHTML(result.U)}</div></div>`;
    }

    if (method === 'inverse' && result.inverse) {
        html += `<div class="log-step expanded"><div class="log-step-header"><span class="log-step-number">2</span><span class="log-step-title">A⁻¹ (Inverse Matrix)</span></div>`;
        html += `<div class="log-step-content">${matrixHTML(result.inverse)}</div></div>`;
    }

    // Result
    html += `<div class="log-section"><div class="log-section-title">🎯 ผลลัพธ์</div></div>`;
    html += `<div class="log-step expanded"><div class="log-step-header"><span class="log-step-number">✓</span><span class="log-step-title">คำตอบ</span></div>`;
    html += `<div class="log-step-content">${result.solution.map((v, i) => `x<sub>${i + 1}</sub> = ${fmt(v)}`).join('<br>')}</div></div>`;

    elements.logContent.innerHTML = html;
}

function toggleLogStep(el) { el.classList.toggle('expanded'); }
function expandAllLogs() { document.querySelectorAll('.log-step').forEach(s => s.classList.add('expanded')); }
function collapseAllLogs() { document.querySelectorAll('.log-step').forEach(s => s.classList.remove('expanded')); }

// Events
elements.matrixSize.addEventListener('change', function () {
    currentSize = parseInt(this.value);
    createInputs(currentSize);
    elements.outputSection.classList.remove('visible');
});
elements.btnClear.addEventListener('click', clearAll);
elements.btnExample.addEventListener('click', loadExample);
elements.btnExpandAll.addEventListener('click', expandAllLogs);
elements.btnCollapseAll.addEventListener('click', collapseAllLogs);
elements.methodCards.forEach(card => {
    card.addEventListener('click', function () {
        elements.methodCards.forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        solve(this.getAttribute('data-method'));
    });
});

// Init
createInputs(currentSize);
loadExample();
