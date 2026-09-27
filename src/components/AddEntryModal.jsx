import { useState } from "react";

// Modal para escolher quantidade e refeicao antes de gravar o Entry (dispara o
// POST). Tambem reaproveitado para edicao (dispara o PUT) quando recebe `entry`.

const MEALS = [
  { value: "breakfast", label: "Café da manhã" },
  { value: "lunch", label: "Almoço" },
  { value: "dinner", label: "Jantar" },
  { value: "snack", label: "Lanche" },
];

function preview(v100, qty) {
  if (v100 == null) return "—";
  return Math.round((v100 * qty) / 100 * 10) / 10;
}

export default function AddEntryModal({ product, entry, onConfirm, onClose, saving }) {
  const isEdit = Boolean(entry);
  const [quantity, setQuantity] = useState(entry ? entry.quantity_g : 100);
  const [meal, setMeal] = useState(entry ? entry.meal : "breakfast");

  const qty = Number(quantity) || 0;
  const basis = product?.nutrition_basis || "100g";
  const unit = basis.includes("ml") ? "ml" : "g";

  function submit(e) {
    e.preventDefault();
    if (qty <= 0) return;
    onConfirm({ quantity_g: qty, meal });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{isEdit ? "Editar registro" : "Adicionar registro"}</h3>

        <div className="product-head">
          {product?.image_url && <img src={product.image_url} alt="" />}
          <div>
            <div style={{ fontWeight: 600 }}>
              {product?.name || entry?.product_name}
            </div>
            {product && (
              <div className="muted" style={{ fontSize: "0.82rem" }}>
                {product.energy_kcal_100g ?? "—"} kcal por {basis}
              </div>
            )}
          </div>
        </div>

        <form onSubmit={submit}>
          <div className="field">
            <label>Quantidade ({unit})</label>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              autoFocus
            />
          </div>

          <div className="field">
            <label>Refeição</label>
            <select value={meal} onChange={(e) => setMeal(e.target.value)}>
              {MEALS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {product && (
            <div className="notice info" style={{ marginTop: 0 }}>
              Nesta quantidade: <b>{preview(product.energy_kcal_100g, qty)}</b> kcal ·
              P {preview(product.proteins_100g, qty)}g · C{" "}
              {preview(product.carbohydrates_100g, qty)}g · G{" "}
              {preview(product.fat_100g, qty)}g
            </div>
          )}

          <div className="row">
            <button type="button" className="ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={saving}>
              {saving ? <span className="spinner" /> : isEdit ? "Salvar" : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
