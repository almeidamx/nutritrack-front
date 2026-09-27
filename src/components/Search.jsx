import { useEffect, useState } from "react";
import { searchProducts } from "../api";

// Busca de produtos. IMPORTANTE: submit explicito (botao / Enter), sem
// search-as-you-type — a doc da Open Food Facts proibe por escrito e o limite
// de busca e 10 req/min compartilhados por todo o container.

function macroLine(p) {
  const fmt = (v, u) => (v == null ? "—" : `${v}${u}`);
  return `${fmt(p.energy_kcal_100g, " kcal")} · P ${fmt(p.proteins_100g, "g")} · C ${fmt(
    p.carbohydrates_100g,
    "g"
  )} · G ${fmt(p.fat_100g, "g")}  (por ${p.nutrition_basis})`;
}

export default function Search({ onPick, clearToken }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [offDown, setOffDown] = useState(false);
  const [searched, setSearched] = useState(false);

  function clearSearch() {
    setResults([]);
    setQ("");
    setSearched(false);
    setOffDown(false);
    setError("");
  }

  // O App incrementa clearToken depois de um registro ser adicionado com
  // sucesso; a busca entao "recolhe" sozinha.
  useEffect(() => {
    if (clearToken) clearSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearToken]);

  async function submit(e) {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setError("");
    setOffDown(false);
    try {
      const data = await searchProducts(q.trim());
      setResults(data.items);
      setOffDown(Boolean(data.off_unavailable));
      setSearched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h2>Adicionar alimento</h2>
      <form className="search-form" onSubmit={submit}>
        <input
          type="text"
          placeholder="Buscar produto (ex.: arroz, leite integral)..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? <span className="spinner" /> : "Buscar"}
        </button>
      </form>

      {error && <div className="notice error">{error}</div>}
      {offDown && (
        <div className="notice info">
          A Open Food Facts está indisponível no momento. Tente novamente em instantes.
        </div>
      )}

      {results.length > 0 && (
        <div className="results-head">
          <span className="muted">{results.length} resultado(s)</span>
          <button type="button" className="ghost small" onClick={clearSearch}>
            Limpar
          </button>
        </div>
      )}

      <div className="results">
        {results.map((p) => (
          <div className="result" key={p.barcode}>
            {p.image_url ? (
              <img src={p.image_url} alt={p.name} loading="lazy" />
            ) : (
              <div className="img placeholder" style={{ width: 52, height: 52 }} />
            )}
            <div className="info">
              <div className="name">{p.name}</div>
              {p.brands && <div className="brand">{p.brands}</div>}
              <div className="macros">{macroLine(p)}</div>
            </div>
            <button className="small" onClick={() => onPick(p)}>
              Adicionar
            </button>
          </div>
        ))}
        {searched && !loading && results.length === 0 && !offDown && (
          <div className="empty">Nenhum produto encontrado para “{q}”.</div>
        )}
      </div>
    </section>
  );
}
