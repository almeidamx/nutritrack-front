import { useCallback, useEffect, useState } from "react";
import {
  createEntry,
  deleteEntry,
  getGoal,
  getSummary,
  listEntries,
  updateEntry,
  updateGoal,
} from "./api";
import AddEntryModal from "./components/AddEntryModal";
import Dashboard from "./components/Dashboard";
import EntryList from "./components/EntryList";
import GoalEditor from "./components/GoalEditor";
import Search from "./components/Search";

const PAGE_SIZE = 6; // pequeno de proposito, para a paginacao aparecer na demo

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function App() {
  const [date, setDate] = useState(todayISO());
  const [summary, setSummary] = useState(null);
  const [entriesPage, setEntriesPage] = useState({
    items: [], total: 0, page: 1, pages: 0,
  });
  const [page, setPage] = useState(1);
  const [goal, setGoal] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null); // para POST
  const [editingEntry, setEditingEntry] = useState(null); // para PUT
  const [showGoal, setShowGoal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // GET summary + entries do dia selecionado.
  const refresh = useCallback(async () => {
    setError("");
    try {
      const [sum, ents] = await Promise.all([
        getSummary(date),
        listEntries({ date, page, pageSize: PAGE_SIZE }),
      ]);
      setSummary(sum);
      setEntriesPage(ents);
    } catch (err) {
      setError(err.message);
    }
  }, [date, page]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // GET goal (uma vez).
  useEffect(() => {
    getGoal().then(setGoal).catch((e) => setError(e.message));
  }, []);

  // POST: criar registro a partir do produto escolhido na busca.
  async function confirmAdd({ quantity_g, meal }) {
    setSaving(true);
    setError("");
    try {
      await createEntry({
        barcode: selectedProduct.barcode,
        quantity_g,
        meal,
        consumed_on: date,
      });
      setSelectedProduct(null);
      setPage(1);
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // PUT: editar um registro existente.
  async function confirmEdit({ quantity_g, meal }) {
    setSaving(true);
    setError("");
    try {
      await updateEntry(editingEntry.id, { quantity_g, meal });
      setEditingEntry(null);
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // DELETE: remover um registro (com confirmacao).
  async function handleDelete(entry) {
    if (!window.confirm(`Remover "${entry.product_name}"?`)) return;
    setError("");
    try {
      await deleteEntry(entry.id);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  // PUT: salvar a meta.
  async function saveGoal(payload) {
    setSaving(true);
    setError("");
    try {
      const updated = await updateGoal(payload);
      setGoal(updated);
      setShowGoal(false);
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="logo">🥗</div>
          <div>
            <h1>NutriTrack</h1>
            <div className="muted" style={{ fontSize: "0.85rem" }}>
              Seu diário alimentar
            </div>
          </div>
        </div>
        <div className="date-picker">
          <button className="ghost small" onClick={() => setShowGoal(true)}>
            ⚙ Meta
          </button>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setPage(1);
              setDate(e.target.value);
            }}
          />
        </div>
      </header>

      {error && <div className="notice error">{error}</div>}

      <div className="grid grid-2">
        <Dashboard summary={summary} />
        <Search onPick={setSelectedProduct} />
      </div>

      <div style={{ marginTop: 20 }}>
        <EntryList
          page={entriesPage}
          onEdit={setEditingEntry}
          onDelete={handleDelete}
          onPage={setPage}
        />
      </div>

      {selectedProduct && (
        <AddEntryModal
          product={selectedProduct}
          onConfirm={confirmAdd}
          onClose={() => setSelectedProduct(null)}
          saving={saving}
        />
      )}

      {editingEntry && (
        <AddEntryModal
          entry={editingEntry}
          onConfirm={confirmEdit}
          onClose={() => setEditingEntry(null)}
          saving={saving}
        />
      )}

      {showGoal && goal && (
        <GoalEditor
          goal={goal}
          onSave={saveGoal}
          onClose={() => setShowGoal(false)}
          saving={saving}
        />
      )}

      <footer>
        Dados de produtos fornecidos por{" "}
        <a href="https://openfoodfacts.org" target="_blank" rel="noreferrer">
          Open Food Facts
        </a>{" "}
        — dados sob ODbL 1.0, conteúdo sob DbCL 1.0, imagens sob CC BY-SA 3.0.
      </footer>
    </div>
  );
}
