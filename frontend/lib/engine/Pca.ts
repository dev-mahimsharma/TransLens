// Lightweight PCA, deliberately implemented for OUR specific case: a small
// number of points (one per token, usually < 30) in a high-dimensional
// space (768 for gpt2-small). Standard PCA computes eigenvectors of a
// 768x768 covariance matrix -- overkill and slow here. Because we have far
// fewer points than dimensions, we use "dual PCA": compute eigenvectors of
// the much smaller n x n Gram matrix instead, which is mathematically
// equivalent and cheap to run in the browser with plain power iteration
// (no need for a linear algebra library for a 2-component projection).
//
// Crucially, this also hands back the actual unit direction vectors in the
// original 768-dim space (`componentDirections`) -- these are what let the
// Embeddings stage translate a 2D drag on screen into a real edit to the
// token's actual embedding vector, not just a cosmetic scatter plot.

export interface PCAResult {
  points: number[][]; // [n][k] -- 2D (or k-D) coordinates for each token
  componentDirections: number[][]; // [k][d] -- unit vectors in original space
  mean: number[]; // [d] -- the mean vector that was subtracted before projecting
}

function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function norm(v: number[]): number {
  return Math.sqrt(dot(v, v));
}

function normalize(v: number[]): number[] {
  const n = norm(v) || 1e-9;
  return v.map((x) => x / n);
}

function matVecMul(matrix: number[][], vec: number[]): number[] {
  return matrix.map((row) => dot(row, vec));
}

function powerIteration(matrix: number[][], iterations = 200): { vector: number[]; eigenvalue: number } {
  const n = matrix.length;
  let v = normalize(Array.from({ length: n }, () => Math.random() - 0.5));
  for (let i = 0; i < iterations; i++) {
    const next = matVecMul(matrix, v);
    v = normalize(next);
  }
  const Mv = matVecMul(matrix, v);
  const eigenvalue = dot(v, Mv);
  return { vector: v, eigenvalue };
}

export function pca(vectors: number[][], k = 2): PCAResult {
  const n = vectors.length;
  const d = vectors[0]?.length ?? 0;

  // Degenerate case: fewer than 2 tokens can't be projected meaningfully.
  if (n < 2 || d === 0) {
    return {
      points: vectors.map(() => Array(k).fill(0)),
      componentDirections: Array.from({ length: k }, () => Array(d).fill(0)),
      mean: Array(d).fill(0),
    };
  }

  const mean = Array(d).fill(0);
  for (const v of vectors) for (let j = 0; j < d; j++) mean[j] += v[j] / n;
  const centered = vectors.map((v) => v.map((x, j) => x - mean[j]));

  // Gram matrix: G[i][j] = centered[i] . centered[j]  (n x n, cheap)
  let G: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => dot(centered[i], centered[j]))
  );

  const dualVectors: number[][] = [];
  const eigenvalues: number[] = [];
  const numComponents = Math.min(k, n - 1);

  for (let c = 0; c < numComponents; c++) {
    const { vector, eigenvalue } = powerIteration(G);
    dualVectors.push(vector);
    eigenvalues.push(Math.max(eigenvalue, 0));
    // Deflate so the next power iteration finds the next component.
    G = G.map((row, i) => row.map((val, j) => val - eigenvalue * vector[i] * vector[j]));
  }

  // Original-space unit direction for each component:
  // v_c = normalize( sum_i( dualVector_c[i] * centered[i] ) )
  const componentDirections = dualVectors.map((u) => {
    const raw = Array(d).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < d; j++) raw[j] += u[i] * centered[i][j];
    }
    return normalize(raw);
  });

  // Point coordinates = sqrt(eigenvalue) * dual eigenvector component --
  // the standard dual-PCA score, equivalent to projecting onto the
  // original-space direction vectors above.
  const points = Array.from({ length: n }, (_, i) =>
    Array.from({ length: numComponents }, (_, c) => Math.sqrt(eigenvalues[c]) * dualVectors[c][i])
  );

  return { points, componentDirections, mean };
}