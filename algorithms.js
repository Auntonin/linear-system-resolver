/**
 * Linear System Solver - Pure Algorithms
 * เขียนแบบ C-style ให้อ่านง่าย สั้น กระชับ
 */

// ========== UTILITY ==========

// Copy matrix
function copyMatrix(M) {
    let R = [];
    for (let i = 0; i < M.length; i++) R[i] = M[i].slice();
    return R;
}

// สร้าง [A|b]
function augment(A, b) {
    let n = A.length, Aug = [];
    for (let i = 0; i < n; i++) {
        Aug[i] = A[i].slice();
        Aug[i].push(b[i]);
    }
    return Aug;
}

// สร้าง Identity Matrix
function identity(n) {
    let I = [];
    for (let i = 0; i < n; i++) {
        I[i] = [];
        for (let j = 0; j < n; j++) I[i][j] = (i === j) ? 1 : 0;
    }
    return I;
}

// ปัดเศษ
function round(x) { return Math.round(x * 1e6) / 1e6; }


// ========== 1. GAUSS ELIMINATION ==========

function gaussElimination(A, b) {
    let n = A.length;
    let Aug = augment(A, b);

    // Forward Elimination
    for (let k = 0; k < n; k++) {
        // Pivoting: หาแถวที่ค่ามากสุด
        let maxRow = k;
        for (let i = k + 1; i < n; i++) {
            if (Math.abs(Aug[i][k]) > Math.abs(Aug[maxRow][k])) maxRow = i;
        }
        // สลับแถว
        let temp = Aug[k]; Aug[k] = Aug[maxRow]; Aug[maxRow] = temp;

        // ตรวจ Singular
        if (Math.abs(Aug[k][k]) < 1e-10) return { success: false, error: "Singular Matrix" };

        // Eliminate: ทำให้ใต้ pivot เป็น 0
        for (let i = k + 1; i < n; i++) {
            let factor = Aug[i][k] / Aug[k][k];
            for (let j = k; j <= n; j++) {
                Aug[i][j] -= factor * Aug[k][j];
            }
        }
    }

    // Back Substitution
    let x = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
        let sum = Aug[i][n];
        for (let j = i + 1; j < n; j++) sum -= Aug[i][j] * x[j];
        x[i] = round(sum / Aug[i][i]);
    }

    return { success: true, solution: x };
}


// ========== 2. GAUSS-JORDAN ==========

function gaussJordan(A, b) {
    let n = A.length;
    let Aug = augment(A, b);

    for (let k = 0; k < n; k++) {
        // Pivoting
        let maxRow = k;
        for (let i = k + 1; i < n; i++) {
            if (Math.abs(Aug[i][k]) > Math.abs(Aug[maxRow][k])) maxRow = i;
        }
        let temp = Aug[k]; Aug[k] = Aug[maxRow]; Aug[maxRow] = temp;

        if (Math.abs(Aug[k][k]) < 1e-10) return { success: false, error: "Singular Matrix" };

        // Normalize: ทำให้ pivot = 1
        let pivot = Aug[k][k];
        for (let j = 0; j <= n; j++) Aug[k][j] /= pivot;

        // Eliminate: ทำให้ทั้งบนและล่างเป็น 0
        for (let i = 0; i < n; i++) {
            if (i === k) continue;
            let factor = Aug[i][k];
            for (let j = 0; j <= n; j++) Aug[i][j] -= factor * Aug[k][j];
        }
    }

    // ดึงคำตอบจากคอลัมน์สุดท้าย
    let x = [];
    for (let i = 0; i < n; i++) x[i] = round(Aug[i][n]);

    return { success: true, solution: x };
}


// ========== 3. LU FACTORIZATION ==========

function luFactorization(A, b) {
    let n = A.length;
    let L = identity(n);
    let U = copyMatrix(A);

    // สร้าง L และ U
    for (let k = 0; k < n; k++) {
        if (Math.abs(U[k][k]) < 1e-10) return { success: false, error: "Need Pivoting" };

        for (let i = k + 1; i < n; i++) {
            let factor = U[i][k] / U[k][k];
            L[i][k] = factor;
            for (let j = k; j < n; j++) U[i][j] -= factor * U[k][j];
        }
    }

    // Forward Sub: Ly = b
    let y = new Array(n);
    for (let i = 0; i < n; i++) {
        let sum = b[i];
        for (let j = 0; j < i; j++) sum -= L[i][j] * y[j];
        y[i] = sum;
    }

    // Back Sub: Ux = y
    let x = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
        let sum = y[i];
        for (let j = i + 1; j < n; j++) sum -= U[i][j] * x[j];
        x[i] = round(sum / U[i][i]);
    }

    return { success: true, solution: x, L: L, U: U };
}


// ========== 4. INVERSE MATRIX ==========

function inverseMatrix(A, b) {
    let n = A.length;

    // สร้าง [A|I]
    let Aug = [];
    for (let i = 0; i < n; i++) {
        Aug[i] = A[i].slice();
        for (let j = 0; j < n; j++) Aug[i].push(i === j ? 1 : 0);
    }

    // Gauss-Jordan บน [A|I] -> [I|A^-1]
    for (let k = 0; k < n; k++) {
        // Pivoting
        let maxRow = k;
        for (let i = k + 1; i < n; i++) {
            if (Math.abs(Aug[i][k]) > Math.abs(Aug[maxRow][k])) maxRow = i;
        }
        let temp = Aug[k]; Aug[k] = Aug[maxRow]; Aug[maxRow] = temp;

        if (Math.abs(Aug[k][k]) < 1e-10) return { success: false, error: "No Inverse" };

        // Normalize
        let pivot = Aug[k][k];
        for (let j = 0; j < 2 * n; j++) Aug[k][j] /= pivot;

        // Eliminate
        for (let i = 0; i < n; i++) {
            if (i === k) continue;
            let factor = Aug[i][k];
            for (let j = 0; j < 2 * n; j++) Aug[i][j] -= factor * Aug[k][j];
        }
    }

    // ดึง A^-1
    let inv = [];
    for (let i = 0; i < n; i++) {
        inv[i] = [];
        for (let j = 0; j < n; j++) inv[i][j] = round(Aug[i][n + j]);
    }

    // x = A^-1 * b
    let x = new Array(n);
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) sum += inv[i][j] * b[j];
        x[i] = round(sum);
    }

    return { success: true, solution: x, inverse: inv };
}


// ========== EXPORT ==========

const LinearSolver = {
    gaussElimination,
    gaussJordan,
    luFactorization,
    inverseMatrix
};
