const fieldIds = [
  "candidateName",
  "clientName",
  "hourlyRate",
  "weeklyHours",
  "homeAllowance",
  "travelAllowance",
  "vacationReservePct",
  "holidayPayPct",
  "thirteenthMonthPct",
  "transitionPct",
  "employerBurdenPct",
  "employerPensionPct",
  "employeePensionPct",
  "payrollFeePct",
  "taxPct"
];

const fields = Object.fromEntries(
  fieldIds.map((id) => [id, document.getElementById(id)])
);

const outputs = {
  summaryName: document.getElementById("summaryName"),
  summaryTitle: document.getElementById("summaryTitle"),
  summaryMeta: document.getElementById("summaryMeta"),
  grossHourlyWage: document.getElementById("grossHourlyWage"),
  grossSalary: document.getElementById("grossSalary"),
  grossAllIn: document.getElementById("grossAllIn"),
  netSalary: document.getElementById("netSalary"),
  monthlyHoursInclusive: document.getElementById("monthlyHoursInclusive"),
  monthlyReserveHours: document.getElementById("monthlyReserveHours"),
  monthlyHoursExclusive: document.getElementById("monthlyHoursExclusive"),
  budgetInclusive: document.getElementById("budgetInclusive"),
  budgetReserve: document.getElementById("budgetReserve"),
  budgetExclusive: document.getElementById("budgetExclusive"),
  salaryBase: document.getElementById("salaryBase"),
  holidayPay: document.getElementById("holidayPay"),
  thirteenthMonth: document.getElementById("thirteenthMonth"),
  transitionPay: document.getElementById("transitionPay"),
  employeePension: document.getElementById("employeePension"),
  taxAmount: document.getElementById("taxAmount"),
  employerBurden: document.getElementById("employerBurden"),
  employerPension: document.getElementById("employerPension"),
  payrollFee: document.getElementById("payrollFee"),
  homeAllowanceOut: document.getElementById("homeAllowanceOut"),
  travelAllowanceOut: document.getElementById("travelAllowanceOut"),
  totalEmployerCost: document.getElementById("totalEmployerCost")
};

const generatePdfButton = document.getElementById("generatePdfButton");

const euro = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0
});

const decimal = new Intl.NumberFormat("nl-NL", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const integer = new Intl.NumberFormat("nl-NL", {
  maximumFractionDigits: 0
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[char]));
}

function getNumber(id) {
  const value = Number(fields[id].value);
  return Number.isFinite(value) ? value : 0;
}

function collectCalculationData() {
  const candidateName = fields.candidateName.value.trim() || "Nieuwe kandidaat";
  const clientName = fields.clientName.value.trim() || "Nieuwe opdrachtgever";
  const hourlyRate = getNumber("hourlyRate");
  const weeklyHours = getNumber("weeklyHours");
  const homeAllowance = getNumber("homeAllowance");
  const travelAllowance = getNumber("travelAllowance");
  const vacationReservePct = getNumber("vacationReservePct") / 100;
  const holidayPayPct = getNumber("holidayPayPct") / 100;
  const thirteenthMonthPct = getNumber("thirteenthMonthPct") / 100;
  const transitionPct = getNumber("transitionPct") / 100;
  const employerBurdenPct = getNumber("employerBurdenPct") / 100;
  const employerPensionPct = getNumber("employerPensionPct") / 100;
  const employeePensionPct = getNumber("employeePensionPct") / 100;
  const payrollFeePct = getNumber("payrollFeePct") / 100;
  const taxPct = getNumber("taxPct") / 100;

  const monthlyHoursInclusive = weeklyHours * 52 / 12;
  const monthlyReserveHours = monthlyHoursInclusive * vacationReservePct;
  const monthlyHoursExclusive = monthlyHoursInclusive - monthlyReserveHours;

  const budgetInclusive = hourlyRate * monthlyHoursInclusive;
  const budgetReserve = hourlyRate * monthlyReserveHours;
  const budgetExclusive = hourlyRate * monthlyHoursExclusive;

  const grossStackFactor =
    1 +
    holidayPayPct +
    thirteenthMonthPct +
    transitionPct +
    payrollFeePct;

  const employerFactor = 1 + employerBurdenPct + employerPensionPct;
  const grossSalary = employerFactor > 0 && grossStackFactor > 0
    ? budgetExclusive / (grossStackFactor * employerFactor)
    : 0;

  const holidayPay = grossSalary * holidayPayPct;
  const thirteenthMonth = grossSalary * thirteenthMonthPct;
  const transitionPay = grossSalary * transitionPct;
  const payrollFee = grossSalary * payrollFeePct;
  const employerBase = grossSalary + holidayPay + thirteenthMonth + transitionPay + payrollFee;
  const employeePension = grossSalary * employeePensionPct;
  const grossAllIn = grossSalary + holidayPay + thirteenthMonth + transitionPay - employeePension;
  const employerBurden = employerBase * employerBurdenPct;
  const employerPension = employerBase * employerPensionPct;
  const totalEmployerCost = employerBase + employerBurden + employerPension;
  const taxAmount = Math.max(0, grossAllIn * taxPct);
  const netSalary = grossAllIn - taxAmount + homeAllowance + travelAllowance;
  const grossHourlyWage = monthlyHoursInclusive > 0 ? grossSalary / monthlyHoursInclusive : 0;
  const paidLeaveHoursPerYear = weeklyHours * 5;
  const today = new Date();

  return {
    candidateName,
    clientName,
    hourlyRate,
    weeklyHours,
    homeAllowance,
    travelAllowance,
    vacationReservePct,
    holidayPayPct,
    thirteenthMonthPct,
    transitionPct,
    employerBurdenPct,
    employerPensionPct,
    employeePensionPct,
    payrollFeePct,
    taxPct,
    monthlyHoursInclusive,
    monthlyReserveHours,
    monthlyHoursExclusive,
    budgetInclusive,
    budgetReserve,
    budgetExclusive,
    grossSalary,
    holidayPay,
    thirteenthMonth,
    transitionPay,
    payrollFee,
    employerBase,
    employeePension,
    grossAllIn,
    employerBurden,
    employerPension,
    totalEmployerCost,
    taxAmount,
    netSalary,
    grossHourlyWage,
    paidLeaveHoursPerYear,
    generatedDate: today.toLocaleDateString("nl-NL")
  };
}

function calculate() {
  const data = collectCalculationData();

  outputs.summaryName.textContent = data.candidateName;
  outputs.summaryTitle.textContent = "Indicatieve salarisberekening";
  outputs.summaryMeta.textContent = `${data.clientName} · ${decimal.format(data.weeklyHours)} uur per week`;

  outputs.grossHourlyWage.textContent = euro.format(data.grossHourlyWage);
  outputs.grossSalary.textContent = euro.format(data.grossSalary);
  outputs.grossAllIn.textContent = euro.format(data.grossAllIn);
  outputs.netSalary.textContent = euro.format(data.netSalary);

  outputs.monthlyHoursInclusive.textContent = decimal.format(data.monthlyHoursInclusive);
  outputs.monthlyReserveHours.textContent = decimal.format(data.monthlyReserveHours);
  outputs.monthlyHoursExclusive.textContent = decimal.format(data.monthlyHoursExclusive);
  outputs.budgetInclusive.textContent = euro.format(data.budgetInclusive);
  outputs.budgetReserve.textContent = euro.format(data.budgetReserve);
  outputs.budgetExclusive.textContent = euro.format(data.budgetExclusive);

  outputs.salaryBase.textContent = euro.format(data.grossSalary);
  outputs.holidayPay.textContent = euro.format(data.holidayPay);
  outputs.thirteenthMonth.textContent = euro.format(data.thirteenthMonth);
  outputs.transitionPay.textContent = euro.format(data.transitionPay);
  outputs.employeePension.textContent = euro.format(-data.employeePension);
  outputs.taxAmount.textContent = euro.format(-data.taxAmount);

  outputs.employerBurden.textContent = euro.format(data.employerBurden);
  outputs.employerPension.textContent = euro.format(data.employerPension);
  outputs.payrollFee.textContent = euro.format(data.payrollFee);
  outputs.homeAllowanceOut.textContent = euro.format(data.homeAllowance);
  outputs.travelAllowanceOut.textContent = euro.format(data.travelAllowance);
  outputs.totalEmployerCost.textContent = euro.format(data.totalEmployerCost + data.homeAllowance + data.travelAllowance);
}

function createPdfHtml(data) {
  const fileTitle = `Ind Salaris berekening ${new Date().getFullYear()} ${data.candidateName} ${Math.round(data.weeklyHours)} uur`;

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(fileTitle)}</title>
  <style>
    @page {
      size: A4;
      margin: 14mm;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      color: #111;
      background: white;
    }

    .sheet {
      width: 100%;
      min-height: calc(297mm - 28mm);
      display: flex;
      flex-direction: column;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 18px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }

    .brand-mark {
      position: relative;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: conic-gradient(from -35deg, #222 0 118deg, transparent 118deg 360deg);
      overflow: hidden;
    }

    .brand-mark::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: conic-gradient(from 128deg, #b1179b 0 112deg, transparent 112deg 360deg);
    }

    .brand-mark::after {
      content: "";
      position: absolute;
      inset: 8px;
      border-radius: 50%;
      background: white;
      box-shadow: 0 0 0 8px transparent, -7px -10px 0 6px #d4d4d4;
    }

    .brand-name {
      font-weight: 700;
      font-size: 11px;
      line-height: 1.1;
    }

    .brand-name .accent { color: #b1179b; }

    .employer {
      font-size: 11px;
      line-height: 1.35;
    }

    h1 {
      margin: 0 0 10px;
      font-size: 19px;
      font-weight: 700;
    }

    .meta {
      display: grid;
      grid-template-columns: 1fr;
      gap: 3px;
      margin-bottom: 10px;
      font-size: 12px;
    }

    .meta div {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 6px;
    }

    .meta strong {
      font-weight: 700;
    }

    .budget-strip {
      margin-bottom: 10px;
      font-size: 12px;
    }

    .budget-row {
      display: grid;
      grid-template-columns: 1fr 48px 95px;
      gap: 8px;
      padding: 1px 0;
    }

    .budget-row strong {
      font-weight: 700;
      text-align: right;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-bottom: 10px;
    }

    .table thead th {
      text-align: left;
      border-bottom: 1px solid #222;
      padding: 6px 0 7px;
      font-size: 12px;
      font-weight: 700;
    }

    .table thead th:last-child,
    .table thead th:nth-child(2),
    .table tbody td:nth-child(2),
    .table tbody td:last-child {
      text-align: right;
    }

    .table tbody td {
      padding: 4px 0;
      vertical-align: top;
    }

    .table tbody tr.total td {
      border-top: 1px solid #222;
      font-weight: 700;
      padding-top: 6px;
      padding-bottom: 6px;
    }

    .leave-hours {
      font-size: 12px;
      margin-bottom: 10px;
    }

    .footer-note {
      font-size: 9px;
      line-height: 1.35;
      color: #333;
      margin-top: auto;
    }

    .footer-note p {
      margin: 0 0 3px;
    }

    .generated {
      font-size: 10px;
      color: #555;
      text-align: right;
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div>
        <div class="brand">
          <div class="brand-mark"></div>
          <div class="brand-name"><span class="accent">ICQ</span><br>TALENT PROFS</div>
        </div>
        <div class="employer">
          Werkgever ICQ-Talent Profs<br>
          Waterloseweg 7a<br>
          7311 JG Apeldoorn
        </div>
      </div>
      <div class="generated">Gegenereerd op ${escapeHtml(data.generatedDate)}</div>
    </div>

    <h1>Indicatieve salarisberekening</h1>

    <div class="meta">
      <div><span>Naam kandidaat:</span><strong>${escapeHtml(data.candidateName)}</strong></div>
      <div><span>Naam opdrachtgever:</span><strong>${escapeHtml(data.clientName)}</strong></div>
      <div><span>Gemiddeld aantal te werken5 uren per week:</span><strong>${escapeHtml(integer.format(data.weeklyHours))}</strong></div>
      <div><span>Uurtarief kandidaat</span><strong>${escapeHtml(decimal.format(data.hourlyRate).replace(",00", ",0"))} €</strong></div>
    </div>

    <div class="budget-strip">
      <div class="budget-row">
        <span>Gewerkte uren per maand incl vak en nat feestdagen</span>
        <strong>${escapeHtml(integer.format(data.monthlyHoursInclusive))}</strong>
        <strong>${escapeHtml(integer.format(data.budgetInclusive))}</strong>
      </div>
      <div class="budget-row">
        <span>Gem beschikbaar budget voor vakantie</span>
        <strong>${escapeHtml(integer.format(data.monthlyReserveHours))}</strong>
        <strong>${escapeHtml(integer.format(data.budgetReserve))} €</strong>
      </div>
      <div class="budget-row">
        <span>Gem beschikbaar budget voor verloning excl vak en nat feestdagen</span>
        <strong>${escapeHtml(integer.format(data.monthlyHoursExclusive))} €</strong>
        <strong>${escapeHtml(integer.format(data.budgetExclusive))}</strong>
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th> </th>
          <th>Werknemer</th>
          <th>Werkgeverslasten</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Verloningskosten</td><td>- €</td><td></td></tr>
        <tr><td>Premies sociale lasten, premies en verzekeringen</td><td></td><td>${escapeHtml(integer.format(data.employerBurden))} €</td></tr>
        <tr><td>Pensioenpremie</td><td></td><td>${escapeHtml(integer.format(data.employerPension))} €</td></tr>
        <tr><td>Uurloon</td><td>${escapeHtml(decimal.format(data.grossHourlyWage))} €</td><td></td></tr>
        <tr><td>Salaris</td><td>${escapeHtml(integer.format(data.grossSalary))} €</td><td></td></tr>
        <tr><td>Vakantiegeld1</td><td>${escapeHtml(integer.format(data.holidayPay))} €</td><td></td></tr>
        <tr><td>13e maand1</td><td>${escapeHtml(integer.format(data.thirteenthMonth))} €</td><td></td></tr>
        <tr><td>Uitbetaling vak dagen</td><td>- €</td><td></td></tr>
        <tr><td>Transitievergoeding2</td><td>${escapeHtml(integer.format(data.transitionPay))} €</td><td></td></tr>
        <tr><td>Inhouding pensioen premie</td><td>(${escapeHtml(integer.format(data.employeePension))}) €</td><td></td></tr>
        <tr class="total"><td>All-in vergoeding bruto per maand3</td><td>${escapeHtml(integer.format(data.grossAllIn))} €</td><td>${escapeHtml(integer.format(data.totalEmployerCost))} €</td></tr>
        <tr><td>Loonheffing (over alle inkomsten) Met Loonhef korting7</td><td>(${escapeHtml(integer.format(data.taxAmount))}) €</td><td></td></tr>
        <tr><td>Thuiswerk verg + internet verg</td><td>${escapeHtml(integer.format(data.homeAllowance))} €</td><td>${escapeHtml(integer.format(data.homeAllowance))} €</td></tr>
        <tr><td>Reiskostenvergoeding6</td><td>${escapeHtml(integer.format(data.travelAllowance))} €</td><td>${escapeHtml(integer.format(data.travelAllowance))} €</td></tr>
        <tr class="total"><td>Nettosalaris4</td><td>${escapeHtml(integer.format(data.netSalary))} €</td><td>${escapeHtml(integer.format(data.budgetExclusive))} €</td></tr>
      </tbody>
    </table>

    <div class="leave-hours">
      Aantal betaalde uren verlof per jaar ${escapeHtml(integer.format(data.paidLeaveHoursPerYear))}
    </div>

    <div class="footer-note">
      <p>1 Vakantiegeld en een eindejaarsuitkering of 13e maand kunnen onderdeel zijn van een Individuele Kosten Regeling en/of persoonlijk budget. Dit wordt apart uitgewerkt in de uitzendbevestiging. Wij volgen hier de collectieve arbeidsvoorwaarden van de opdrachtgever.</p>
      <p>2 Transitievergoeding is een compensatie ter bevordering van werk naar werk. Deze wordt uitbetaald bij einde dienstverband of maandelijks vooruitbetaald.</p>
      <p>3 Het betreft een indicatie van het gemiddeld salaris gebaseerd op het genoemde aantal uren per week.</p>
      <p>4 Aanname is dat de arbeidskorting kan worden toegepast, genoemde bedrag is een indicatie en alleen bedoeld om een beeld te krijgen van wat je ongeveer per maand kunt verwachten. Het betreft hier het all-insalaris, minus loonheffing waarbij vervolgens de netto onkostenvergoeding is opgeteld. Aan de genoemde bedragen loonheffing en nettosalaris kunnen geen rechten worden ontleend.</p>
      <p>5 Dit betreft het aantal te werken uren waar het salaris op is gebaseerd en waar het verlof al van is afgetrokken.</p>
      <p>6 Dit is een aanname, afhankelijk van aantal dagen reizen naar kantoor en afstand woon-werkverkeer.</p>
      <p>7 De loonheffing is een voorheffing gebaseerd op dit salaris. Bij de aangifte Inkomsten belasting waar ook de inkomsten uit bedrijf worden opgegeven kan de te betalen belasting over dit salaris hoger uitkomen.</p>
      <p style="margin-top:8px;">ICQ-Talent Profs BV<br>Waterloseweg 7a, 7311 JG Apeldoorn<br>Tel. 0553031464-, website: www.icq-groep.nl</p>
    </div>
  </div>
</body>
</html>`;
}

function generatePdf() {
  const data = collectCalculationData();
  const printWindow = window.open("", "_blank", "width=900,height=1200");

  if (!printWindow) {
    window.alert("De PDF kan niet worden geopend. Sta pop-ups toe voor deze pagina.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(createPdfHtml(data));
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}

for (const field of Object.values(fields)) {
  field.addEventListener("input", calculate);
}

generatePdfButton.addEventListener("click", generatePdf);

calculate();
