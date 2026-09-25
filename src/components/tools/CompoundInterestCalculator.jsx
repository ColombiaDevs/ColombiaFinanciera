import { useMemo, useState } from 'react';

function ToolContainer({ title, children }) {
  return (
    <section id="calculadora-interes-compuesto" className="max-readable card-surface space-y-4 p-5 md:p-6">
      <h2 className="text-primary text-2xl font-semibold md:text-3xl">{title}</h2>
      {children}
    </section>
  );
}

function sanitizeNumeric(value) {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const [head, ...rest] = cleaned.split('.');
  return rest.length === 0 ? head : `${head}.${rest.join('')}`;
}

function sanitizeInteger(value) {
  return value.replace(/[^0-9]/g, '');
}

function ToolField({ id, label, value, onChange, inputMode = 'decimal', allowDecimals = true }) {
  return (
    <label htmlFor={id} className="space-y-1">
      <span className="text-secondary text-sm md:text-base">{label}</span>
      <input
        id={id}
        type="text"
        inputMode={inputMode}
        autoComplete="off"
        value={value}
        onChange={(event) =>
          onChange(
            allowDecimals
              ? sanitizeNumeric(event.target.value)
              : sanitizeInteger(event.target.value),
          )
        }
        className="border-subtle bg-surface-muted text-primary w-full rounded-lg border px-3 py-2"
      />
    </label>
  );
}

function ToolSelect({ id, label, value, onChange, options, hint }) {
  return (
    <label htmlFor={id} className="space-y-1 md:col-span-2">
      <span className="text-secondary text-sm md:text-base">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-subtle bg-surface-muted text-primary w-full rounded-lg border px-3 py-2"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && <span className="text-muted block text-xs md:text-sm">{hint}</span>}
    </label>
  );
}

function parseNonNegative(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function parsePositive(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

const FREQUENCIES = [
  { value: '1', label: 'Anual (1 vez al año)' },
  { value: '2', label: 'Semestral (2 veces al año)' },
  { value: '4', label: 'Trimestral (4 veces al año)' },
  { value: '12', label: 'Mensual (12 veces al año)' },
  { value: '365', label: 'Diaria (365 veces al año)' },
];

/**
 * Simula periodo a periodo con tasa periodica derivada de la EA:
 * tasa_periodica = (1 + EA)^(1/f) - 1.
 * Los aportes se suman al cierre de cada mes y rentan desde la
 * siguiente capitalizacion. Devuelve el balance de cada mes.
 */
function simulate(initial, monthlyContribution, eaAnnual, freq, years) {
  const periodicRate = Math.pow(1 + eaAnnual, 1 / freq) - 1;
  const totalPeriods = freq * years;
  const rows = [];
  let balance = initial;
  let contributed = initial;
  let nextMonth = 1;
  const eps = 1e-9;
  for (let p = 1; p <= totalPeriods; p++) {
    balance *= 1 + periodicRate;
    const elapsedYears = p / freq;
    while (nextMonth / 12 <= elapsedYears + eps) {
      balance += monthlyContribution;
      contributed += monthlyContribution;
      rows.push({ month: nextMonth, balance, contributed });
      nextMonth += 1;
    }
  }
  return rows;
}

const compactMoney = new Intl.NumberFormat('es-CO', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function niceCeil(value) {
  if (value <= 0) return 1;
  const exp = Math.floor(Math.log10(value));
  const base = 10 ** exp;
  const ratio = value / base;
  const nice = ratio <= 1 ? 1 : ratio <= 2 ? 2 : ratio <= 2.5 ? 2.5 : ratio <= 5 ? 5 : 10;
  return nice * base;
}

function GrowthChart({ monthly, money, annual }) {
  const [hover, setHover] = useState(null);

  const W = 600;
  const H = 280;
  const padL = 58;
  const padR = 14;
  const padT = 14;
  const padB = 30;
  const n = monthly.length;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const maxBalance = Math.max(...monthly.map((row) => row.balance), 0);
  const yMax = niceCeil(maxBalance);
  const x = (i) => padL + (i / (n - 1)) * plotW;
  const y = (v) => padT + (1 - v / yMax) * plotH;

  const investPoints = monthly
    .map((row, i) => `${x(i).toFixed(1)},${y(row.balance).toFixed(1)}`)
    .join(' ');
  const savePoints = monthly
    .map((row, i) => `${x(i).toFixed(1)},${y(row.contributed).toFixed(1)}`)
    .join(' ');
  const areaPoints = `${x(0).toFixed(1)},${y(0).toFixed(1)} ${investPoints} ${x(n - 1).toFixed(1)},${y(0).toFixed(1)}`;

  const yTicks = [0, 1, 2, 3, 4].map((t) => (yMax * t) / 4);
  const totalYears = annual ? n : n / 12;
  const tickEveryYears = Math.max(1, Math.ceil(totalYears / 6));
  const monthStep = Math.max(1, Math.ceil(n / 6));
  const xTickIndexes = monthly
    .map((_, i) => i)
    .filter((i) =>
      annual
        ? monthly[i].month % 12 === 0 && monthly[i].month / 12 % tickEveryYears === 0
        : i % monthStep === 0 || i === n - 1,
    );

  const series = useMemo(
    () => (
      <>
        <polygon points={areaPoints} fill="#34d399" fillOpacity={0.12} />
        <polyline
          points={savePoints}
          fill="none"
          stroke="#38bdf8"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <polyline
          points={investPoints}
          fill="none"
          stroke="#34d399"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {monthly.map((row, i) => (
          <g key={row.month}>
            <circle cx={x(i)} cy={y(row.contributed)} r={2} fill="#38bdf8" />
            <circle cx={x(i)} cy={y(row.balance)} r={2} fill="#34d399" />
          </g>
        ))}
      </>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [areaPoints, savePoints, investPoints, n],
  );

  const pointFromClientX = (clientX, target) => {
    const rect = target.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * W;
    const i = Math.round(((svgX - padL) / plotW) * (n - 1));
    return Math.max(0, Math.min(n - 1, i));
  };

  const handleMove = (clientX, target) => setHover(pointFromClientX(clientX, target));

  const hovered = hover !== null ? monthly[hover] : null;
  const hoverPct = hover !== null ? (x(hover) / W) * 100 : 0;
  const tooltipLeft = Math.max(14, Math.min(86, hoverPct));

  const last = monthly[n - 1];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs md:text-sm">
        <span className="text-secondary flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-400" />
          Solo ahorrando
        </span>
        <span className="text-secondary flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />
          Invirtiendo
        </span>
      </div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="text-secondary w-full"
          role="img"
          aria-label={annual ? `Comparativa a ${totalYears} años: ahorrando ${compactMoney.format(last.contributed)} frente a invirtiendo ${compactMoney.format(last.balance)}` : `Comparativa a ${n} meses: ahorrando ${compactMoney.format(last.contributed)} frente a invirtiendo ${compactMoney.format(last.balance)}`}
        >
          {yTicks.map((t) => (
            <g key={t}>
              <line
                x1={padL}
                x2={W - padR}
                y1={y(t)}
                y2={y(t)}
                stroke="currentColor"
                strokeOpacity={0.15}
              />
              <text x={padL - 6} y={y(t) + 4} textAnchor="end" fontSize={11} fill="currentColor">
                {compactMoney.format(t)}
              </text>
            </g>
          ))}
          {xTickIndexes.map((i) => (
            <text
              key={`tick-${i}`}
              x={x(i)}
              y={H - 10}
              textAnchor="middle"
              fontSize={11}
              fill="currentColor"
            >
              {annual ? `Año ${monthly[i].month / 12}` : `Mes ${monthly[i].month}`}
            </text>
          ))}
          {series}
          {hovered && (
            <g>
              <line
                x1={x(hover)}
                x2={x(hover)}
                y1={padT}
                y2={padT + plotH}
                stroke="currentColor"
                strokeOpacity={0.4}
                strokeDasharray="4 3"
              />
              <circle
                cx={x(hover)}
                cy={y(hovered.contributed)}
                r={5}
                fill="#38bdf8"
                stroke="#fff"
                strokeWidth={1.5}
              />
              <circle
                cx={x(hover)}
                cy={y(hovered.balance)}
                r={5}
                fill="#34d399"
                stroke="#fff"
                strokeWidth={1.5}
              />
            </g>
          )}
          <rect
            x={padL}
            y={padT}
            width={plotW}
            height={plotH}
            fill="transparent"
            onMouseMove={(event) => handleMove(event.clientX, event.currentTarget)}
            onMouseLeave={() => setHover(null)}
            onTouchStart={(event) => handleMove(event.touches[0].clientX, event.currentTarget)}
            onTouchMove={(event) => handleMove(event.touches[0].clientX, event.currentTarget)}
            onTouchEnd={() => setHover(null)}
          />
        </svg>
        {hovered && (
          <div
            className="border-subtle bg-surface-muted pointer-events-none absolute top-1 z-10 space-y-0.5 rounded-lg border px-3 py-2 text-xs shadow-lg md:text-sm"
            style={{ left: `${tooltipLeft}%`, transform: 'translateX(-50%)' }}
          >
            <p className="text-primary font-medium">
              {annual ? `Año ${hovered.month / 12}` : `Mes ${hovered.month} · Año ${Math.ceil(hovered.month / 12)}`}
            </p>
            <p className="text-secondary">
              Invertido: <span className="text-emerald-400 font-medium">{money.format(hovered.balance)}</span>
            </p>
            <p className="text-secondary">
              Ahorrado: <span className="text-sky-400 font-medium">{money.format(hovered.contributed)}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CompoundInterestCalculator() {
  const [initial, setInitial] = useState('1000000');
  const [monthly, setMonthly] = useState('200000');
  const [rate, setRate] = useState('10');
  const [years, setYears] = useState('10');
  const [frequency, setFrequency] = useState('12');

  const initialValue = parseNonNegative(initial);
  const monthlyValue = parseNonNegative(monthly);
  const rateValue = parseNonNegative(rate);
  const yearsValue = Math.floor(parsePositive(years));
  const freqValue = parseInt(frequency, 10) || 12;
  const hasValidInputs = yearsValue > 0 && (initialValue > 0 || monthlyValue > 0);

  const monthlyRows = useMemo(() => {
    if (!hasValidInputs) return [];
    return simulate(initialValue, monthlyValue, rateValue / 100, freqValue, yearsValue);
  }, [initialValue, monthlyValue, rateValue, freqValue, yearsValue, hasValidInputs]);

  const yearly = useMemo(
    () =>
      monthlyRows
        .filter((row) => row.month % 12 === 0)
        .map((row) => ({ year: row.month / 12, balance: row.balance, contributed: row.contributed })),
    [monthlyRows],
  );

  const chartAnnual = yearsValue >= 2;
  const chartRows = useMemo(() => {
    if (!hasValidInputs) return [];
    if (!chartAnnual) return monthlyRows;
    return yearly.map((row) => ({
      month: row.year * 12,
      balance: row.balance,
      contributed: row.contributed,
    }));
  }, [hasValidInputs, chartAnnual, monthlyRows, yearly]);

  const last = yearly[yearly.length - 1];
  const finalBalance = last ? last.balance : 0;
  const totalContributed = last ? last.contributed : 0;
  const totalInterest = Math.max(finalBalance - totalContributed, 0);
  const interestShare = finalBalance > 0 ? (totalInterest / finalBalance) * 100 : 0;

  const money = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });

  return (
    <ToolContainer title="Simula tu escenario">
      <p className="text-secondary text-sm md:text-base">
        Estimacion con tasa efectiva anual y capitalizacion periodica. Resultado referencial.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        <ToolField
          id="compound-initial"
          label="Monto inicial"
          value={initial}
          onChange={setInitial}
          inputMode="numeric"
          allowDecimals={false}
        />
        <ToolField
          id="compound-monthly"
          label="Aporte mensual"
          value={monthly}
          onChange={setMonthly}
          inputMode="numeric"
          allowDecimals={false}
        />
        <ToolField
          id="compound-rate"
          label="Tasa efectiva anual (%)"
          value={rate}
          onChange={setRate}
        />
        <ToolField
          id="compound-years"
          label="Plazo (años)"
          value={years}
          onChange={setYears}
          inputMode="numeric"
          allowDecimals={false}
        />
        <ToolSelect
          id="compound-frequency"
          label="Frecuencia de capitalización"
          value={frequency}
          onChange={setFrequency}
          options={FREQUENCIES}
          hint="Cantidad de veces por año que se capitaliza el interés."
        />
      </div>

      <div className="border-subtle bg-surface-muted space-y-3 rounded-xl border p-4">
        <div>
          <p className="text-secondary text-sm">Valor futuro estimado</p>
          <p className="text-primary text-2xl font-semibold md:text-3xl">
            {hasValidInputs ? money.format(finalBalance) : 'Ingresa valores validos'}
          </p>
        </div>

        {hasValidInputs && (
          <>
            <div
              className="border-subtle flex h-4 w-full overflow-hidden rounded-full border"
              role="img"
              aria-label={`Aportes ${money.format(totalContributed)}, intereses ${money.format(totalInterest)}`}
            >
              <div className="bg-sky-500/70" style={{ width: `${100 - interestShare}%` }} />
              <div className="bg-emerald-500/80" style={{ width: `${interestShare}%` }} />
            </div>
            <div className="grid gap-2 text-sm md:grid-cols-2 md:text-base">
              <p className="text-secondary">
                Total aportado:{' '}
                <span className="text-primary font-medium">{money.format(totalContributed)}</span>
              </p>
              <p className="text-secondary">
                Intereses ganados:{' '}
                <span className="text-primary font-medium">{money.format(totalInterest)}</span>
              </p>
            </div>
            <GrowthChart monthly={chartRows} money={money} annual={chartAnnual} />
          </>
        )}
      </div>

      {hasValidInputs && yearly.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-primary text-lg font-semibold">Crecimiento por año</h3>
          <div
            className={`border-subtle overflow-y-auto rounded-xl border ${yearly.length > 10 ? 'max-h-[30rem]' : ''}`}
          >
            <table className="w-full text-sm md:text-base">
              <thead className="bg-surface-muted text-secondary sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Año</th>
                  <th className="px-3 py-2 text-right font-medium">Aportado</th>
                  <th className="px-3 py-2 text-right font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {yearly.map((row) => (
                  <tr key={row.year} className="border-subtle text-secondary border-t">
                    <td className="px-3 py-2">{row.year}</td>
                    <td className="px-3 py-2 text-right">{money.format(row.contributed)}</td>
                    <td className="text-primary px-3 py-2 text-right font-medium">
                      {money.format(row.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ToolContainer>
  );
}
