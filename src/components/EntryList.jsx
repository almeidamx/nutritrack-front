// Lista dos registros do dia, agrupados por refeicao. Cada item tem editar
// (PUT) e remover (DELETE). Traz paginacao — o extra de criatividade do lado
// da interface, alimentado pelo envelope paginado da API.

const MEAL_LABELS = {
  breakfast: "Café da manhã",
  lunch: "Almoço",
  dinner: "Jantar",
  snack: "Lanche",
};
const MEAL_ORDER = ["breakfast", "lunch", "dinner", "snack"];

function sumKcal(entries) {
  return entries.reduce((acc, e) => acc + (e.energy_kcal || 0), 0);
}

export default function EntryList({ page, onEdit, onDelete, onPage }) {
  const { items, total, page: current, pages } = page;

  if (total === 0) {
    return (
      <section className="card">
        <h2>Registros do dia</h2>
        <div className="empty">
          Nenhum registro ainda. Busque um alimento acima para começar.
        </div>
      </section>
    );
  }

  const byMeal = MEAL_ORDER.map((meal) => ({
    meal,
    entries: items.filter((e) => e.meal === meal),
  })).filter((g) => g.entries.length > 0);

  return (
    <section className="card">
      <h2>
        Registros do dia <span className="badge">{total} no total</span>
      </h2>

      {byMeal.map((group) => (
        <div className="meal-group" key={group.meal}>
          <h3>
            {MEAL_LABELS[group.meal]}
            <span className="kcal">{Math.round(sumKcal(group.entries))} kcal</span>
          </h3>
          {group.entries.map((e) => (
            <div className="entry" key={e.id}>
              {e.image_url && <img src={e.image_url} alt="" loading="lazy" />}
              <div className="info">
                <div className="name">{e.product_name}</div>
                <div className="sub">
                  {e.quantity_g}g · {e.energy_kcal ?? "—"} kcal · P {e.proteins ?? "—"}g ·
                  C {e.carbohydrates ?? "—"}g · G {e.fat ?? "—"}g
                </div>
              </div>
              <div className="actions">
                <button className="ghost small" onClick={() => onEdit(e)}>
                  Editar
                </button>
                <button className="danger small" onClick={() => onDelete(e)}>
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}

      {pages > 1 && (
        <div className="pagination">
          <button
            className="ghost small"
            disabled={current <= 1}
            onClick={() => onPage(current - 1)}
          >
            ← Anterior
          </button>
          <span className="muted">
            Página {current} de {pages}
          </span>
          <button
            className="ghost small"
            disabled={current >= pages}
            onClick={() => onPage(current + 1)}
          >
            Próxima →
          </button>
        </div>
      )}
    </section>
  );
}
