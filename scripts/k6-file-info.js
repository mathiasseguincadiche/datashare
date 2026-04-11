// ──────────────────────────────────────────────
// DataShare — Test de performance k6
// Endpoint : GET /files/:token/info
//
// Usage :
//   FILE_TOKEN=ton_token k6 run scripts/k6-file-info.js
//
// Pre-requis :
//   - k6 installe (https://k6.io/docs/getting-started/installation/)
//   - Backend demarre sur http://localhost:3000
//   - Un fichier uploade avec un token valide
// ──────────────────────────────────────────────

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ── Metriques personnalisees ──
const errorRate = new Rate('errors');
const infoLatency = new Trend('info_latency', true);

// ── Configuration du test ──
export const options = {
  stages: [
    { duration: '10s', target: 10 },   // montee progressive a 10 utilisateurs
    { duration: '30s', target: 50 },   // maintien a 50 utilisateurs simultanes
    { duration: '10s', target: 0 },    // descente progressive
  ],
  thresholds: {
    http_req_duration: ['p(50)<200', 'p(95)<500'],  // budget de performance
    errors: ['rate<0.01'],                            // moins de 1% d'erreur
  },
};

// ── Token du fichier a tester ──
const FILE_TOKEN = __ENV.FILE_TOKEN;
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  if (!FILE_TOKEN) {
    console.error('Variable FILE_TOKEN requise. Usage : FILE_TOKEN=xxx k6 run scripts/k6-file-info.js');
    return;
  }

  const url = `${BASE_URL}/files/${FILE_TOKEN}/info`;
  const res = http.get(url);

  // ── Enregistrement de la latence ──
  infoLatency.add(res.timings.duration);

  // ── Verification des resultats ──
  const passed = check(res, {
    'status 200': (r) => r.status === 200,
    'latence < 500ms': (r) => r.timings.duration < 500,
    'contient originalName': (r) => {
      try {
        const body = JSON.parse(r.body);
        return typeof body.originalName === 'string';
      } catch {
        return false;
      }
    },
    'contient expiresAt': (r) => {
      try {
        const body = JSON.parse(r.body);
        return typeof body.expiresAt === 'string';
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!passed);
  sleep(0.5);
}

// ── Resume affiche en fin de test ──
export function handleSummary(data) {
  const duration = data.metrics.http_req_duration;
  const p50 = duration ? duration.values.med : 0;
  const p95 = duration ? duration.values['p(95)'] : 0;
  const errRate = data.metrics.errors ? data.metrics.errors.values.rate : 0;
  const totalReqs = data.metrics.http_reqs ? data.metrics.http_reqs.values.count : 0;

  const summary = `
============================================
  DataShare — Resultats k6
============================================

  Endpoint  : GET /files/:token/info
  Requetes  : ${totalReqs}
  Latence p50 : ${Math.round(p50)} ms
  Latence p95 : ${Math.round(p95)} ms
  Taux erreur : ${(errRate * 100).toFixed(2)}%

  Budget :
    p50 < 200ms  → ${p50 < 200 ? 'OK' : 'DEPASSE'}
    p95 < 500ms  → ${p95 < 500 ? 'OK' : 'DEPASSE'}
    erreurs < 1% → ${errRate < 0.01 ? 'OK' : 'DEPASSE'}
============================================`;

  console.log(summary);
  return {};
}
