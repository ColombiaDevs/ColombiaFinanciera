import { useMemo, useState } from 'react';

function ToolContainer({ title, children }) {
  return (
    <section id="simulador-credito" className="max-readable card-surface space-y-4 p-5 md:p-6">
      <h2 className="text-primary text-2xl font-semibold md:text-3xl">{title}</h2>
      {children}
    </section>
  );
}

function ToolField({ id, label, value, onChange, inputMode = 'decimal' }) {
  return (
    <label htmlFor={id} className="space-y-1">
      <span className="text-secondary text-sm md:text-base">{label}</span>
      <input
        id={id}
        type="number"
        min="0"
        step="any"
        inputMode={inputMode}
        value={value}
        onChange={onChange}
        className="border-subtle bg-surface-muted text-primary w-full rounded-lg border px-3 py-2"
      />
    </label>
  );
}

function parsePositive(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function calculateMonthlyPayment(principal, annualRate, months) {
  const monthlyRate = annualRate / 100 / 12;
  if (months <= 0 || principal <= 0) return 0;
  if (monthlyRate === 0) return principal / months;
  return (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -months);
}

export default function CreditSimulator() {
  const [amount, setAmount] = useState('150000000');
  const [rate, setRate] = useState('14');
  const [term, setTerm] = useState('180');

  const monthlyPayment = useMemo(() => {
    const principal = parsePositive(amount);
    const annualRate = parsePositive(rate);
    const months = parsePositive(term);
    return calculateMonthlyPayment(principal, annualRate, months);
  }, [amount, rate, term]);

  const amountValue = parsePositive(amount);
  const rateValue = parsePositive(rate);
  const termValue = parsePositive(term);
  const hasValidInputs = amountValue > 0 && rateValue >= 0 && termValue > 0;

  const money = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });

  return (
    <ToolContainer title="Simulador de credito">
      <p className="text-secondary text-sm md:text-base">
        Estimacion de cuota mensual con tasa fija. Resultado referencial.
      </p>

      <div className="grid gap-3 md:grid-cols-3">
        <ToolField
          id="credit-amount"
          label="Monto"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
        <ToolField
          id="credit-rate"
          label="Tasa anual (%)"
          value={rate}
          onChange={(event) => setRate(event.target.value)}
        />
        <ToolField
          id="credit-term"
          label="Plazo (meses)"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          inputMode="numeric"
        />
      </div>

      <div className="border-subtle bg-surface-muted rounded-xl border p-4">
        <p className="text-secondary text-sm">Cuota mensual estimada</p>
        <p className="text-primary text-2xl font-semibold md:text-3xl">
          {hasValidInputs ? money.format(monthlyPayment) : 'Ingresa valores validos'}
        </p>
      </div>
    </ToolContainer>
  );
}
