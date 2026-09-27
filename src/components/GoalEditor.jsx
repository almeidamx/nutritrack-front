import { useState } from "react";

// Modal de edicao da meta diaria (dispara o PUT /goal).

const FIELDS = [
  { key: "energy_kcal", label: "Calorias (kcal)" },
  { key: "proteins", label: "Proteínas (g)" },
  { key: "carbohydrates", label: "Carboidratos (g)" },
  { key: "fat", label: "Gorduras (g)" },
];

export default function GoalEditor({ goal, onSave, onClose, saving }) {
  const [form, setForm] = useState({ ...goal });

  function submit(e) {
    e.preventDefault();
    onSave({
      energy_kcal: Number(form.energy_kcal),
      proteins: Number(form.proteins),
      carbohydrates: Number(form.carbohydrates),
      fat: Number(form.fat),
    });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Editar meta diária</h3>
        <form onSubmit={submit}>
          {FIELDS.map((f) => (
            <div className="field" key={f.key}>
              <label>{f.label}</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            </div>
          ))}
          <div className="row">
            <button type="button" className="ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={saving}>
              {saving ? <span className="spinner" /> : "Salvar meta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
