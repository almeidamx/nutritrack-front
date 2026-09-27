import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Dashboard de macros: anel de calorias + barras de progresso + grafico
// comparando consumido x meta. E o extra de criatividade do Cenario 1.

const MACROS = [
  { key: "proteins", label: "Proteínas", color: "#3f6fce", unit: "g" },
  { key: "carbohydrates", label: "Carboidratos", color: "#d0912f", unit: "g" },
  { key: "fat", label: "Gorduras", color: "#cd5f52", unit: "g" },
];

function CalorieRing({ consumed, goal }) {
  const pct = goal > 0 ? Math.min(consumed / goal, 1) : 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const over = consumed > goal;
  return (
    <div className="cal-ring">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#efece7" strokeWidth="12" />
        <circle
          cx="70" cy="70" r={radius} fill="none"
          stroke={over ? "#c0392b" : "#15734a"} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
        />
      </svg>
      <div className="center">
        <div>
          <div className="big">{Math.round(consumed)}</div>
          <div className="lbl">de {Math.round(goal)} kcal</div>
        </div>
      </div>
    </div>
  );
}

function MacroBar({ label, color, consumed, goal, unit }) {
  const pct = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;
  return (
    <div className="macro-bar">
      <div className="top">
        <span>{label}</span>
        <span className="muted">
          {consumed}
          {unit} / {goal}
          {unit}
        </span>
      </div>
      <div className="track">
        <div className="fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function Dashboard({ summary }) {
  if (!summary) return null;
  const { consumed, goal, entries_count } = summary;

  const chartData = [
    { name: "Kcal", Consumido: consumed.energy_kcal, Meta: goal.energy_kcal, color: "#15734a" },
    ...MACROS.map((m) => ({
      name: m.label,
      Consumido: consumed[m.key],
      Meta: goal[m.key],
      color: m.color,
    })),
  ];

  return (
    <section className="card">
      <h2>
        Resumo do dia <span className="badge">{entries_count} registros</span>
      </h2>

      <div className="dash-top">
        <CalorieRing consumed={consumed.energy_kcal} goal={goal.energy_kcal} />
        <div className="macro-bars">
          {MACROS.map((m) => (
            <MacroBar
              key={m.key}
              label={m.label}
              color={m.color}
              unit={m.unit}
              consumed={consumed[m.key]}
              goal={goal[m.key]}
            />
          ))}
        </div>
      </div>

      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Meta" fill="#e4e0d9" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Consumido" radius={[4, 4, 0, 0]}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
