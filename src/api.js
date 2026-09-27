// Cliente HTTP da API NutriTrack.
//
// Sempre usa o caminho relativo /api: em dev o Vite faz proxy para a API Flask,
// em producao o nginx faz o mesmo. Cada funcao aqui deixa explicito qual metodo
// HTTP dispara (GET/POST/PUT/DELETE) — util para o item 5 do roteiro do video.

const BASE = "/api";

async function request(path, options = {}) {
  const resp = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (resp.status === 204) return null;
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(data.error || `Erro ${resp.status}`);
  }
  return data;
}

// --- GET: busca de produtos por texto (proxy da Open Food Facts) ---
export function searchProducts(q, page = 1, pageSize = 8) {
  const qs = new URLSearchParams({ q, page, page_size: pageSize });
  return request(`/products/search?${qs}`);
}

// --- GET: lista de registros do dia (paginado, com filtros) ---
export function listEntries({ date, meal, page = 1, pageSize = 50 } = {}) {
  const qs = new URLSearchParams({ page, page_size: pageSize });
  if (date) qs.set("date", date);
  if (meal) qs.set("meal", meal);
  return request(`/entries?${qs}`);
}

// --- POST: cria um registro de consumo ---
export function createEntry(payload) {
  return request("/entries", { method: "POST", body: JSON.stringify(payload) });
}

// --- PUT: edita quantidade/refeicao de um registro ---
export function updateEntry(id, payload) {
  return request(`/entries/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// --- DELETE: remove um registro ---
export function deleteEntry(id) {
  return request(`/entries/${id}`, { method: "DELETE" });
}

// --- GET: meta diaria ---
export function getGoal() {
  return request("/goal");
}

// --- PUT: atualiza a meta diaria ---
export function updateGoal(payload) {
  return request("/goal", { method: "PUT", body: JSON.stringify(payload) });
}

// --- GET: resumo do dia (totais x meta) para o dashboard ---
export function getSummary(date) {
  const qs = date ? `?date=${date}` : "";
  return request(`/summary${qs}`);
}
