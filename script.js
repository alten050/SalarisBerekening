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
const storageKey = "salary-calculator-values-v1";
const infoModal = document.getElementById("infoModal");
const infoModalTitle = document.getElementById("infoModalTitle");
const infoModalBody = document.getElementById("infoModalBody");
const infoModalSources = document.getElementById("infoModalSources");
const infoModalSourcesList = document.getElementById("infoModalSourcesList");
const infoModalClose = document.getElementById("infoModalClose");

const fieldHelp = {
  candidateName: {
    title: "Naam kandidaat",
    description: "De naam die op de berekening en in de PDF komt te staan. Dit is een administratief veld voor de kandidaat en heeft geen eigen fiscale of arbeidsrechtelijke rekenregel."
  },
  clientName: {
    title: "Opdrachtgever",
    description: "De organisatie waarvoor de kandidaat wordt ingezet. Dit veld is vooral bedoeld voor dossiervorming, vergelijking tussen opdrachten en de naamgeving in de export."
  },
  hourlyRate: {
    title: "Uurtarief kandidaat",
    description: "Het afgesproken tarief per gewerkt uur. De tool gebruikt dit tarief om het maandbudget voor verloning te berekenen op basis van de uren die daadwerkelijk voor loon beschikbaar zijn."
  },
  weeklyHours: {
    title: "Uren per week",
    description: "Het gemiddelde aantal uren dat per week wordt gewerkt. De tool rekent dit om naar maanduren met 52 weken gedeeld door 12 maanden, zodat de salarisopbouw per maand berekend kan worden."
  },
  homeAllowance: {
    title: "Thuiswerkvergoeding p/m",
    description: "Een vaste netto vergoeding voor thuiswerken. De Belastingdienst kent een gerichte vrijstelling voor thuiswerkkosten per thuiswerkdag; in deze tool vul je het maandbedrag in dat je wilt meenemen in de netto-indicatie en werkgeverskosten.",
    sources: [
      {
        label: "Belastingdienst: vrijgestelde vergoedingen en verstrekkingen",
        url: "https://www.belastingdienst.nl/wps/wcm/connect/nl/werkgever/content/werkkostenregeling-vrijgestelde-loonbestanddelen"
      }
    ]
  },
  travelAllowance: {
    title: "Reiskostenvergoeding p/m",
    description: "Een vaste netto vergoeding voor woon-werkverkeer of zakelijke reiskosten. In de tool tel je hier het maandbedrag op dat naast het salaris wordt vergoed.",
    sources: [
      {
        label: "Belastingdienst: reiskostenvergoeding",
        url: "https://www.belastingdienst.nl/wps/wcm/connect/nl/werkgever/content/reiskostenvergoeding"
      }
    ]
  },
  vacationReservePct: {
    title: "Reservering verlof/feestdagen %",
    description: "Het deel van de uren of loonsom dat je reserveert voor doorbetaald verlof en feestdagen. Rijksoverheid legt uit dat werknemers vakantie-uren opbouwen over gewerkte uren; in de praktijk wordt dat bij flexibele uren vaak omgerekend naar een percentage.",
    sources: [
      {
        label: "Rijksoverheid: vakantiedagen en vakantiegeld bij nulurencontract",
        url: "https://www.rijksoverheid.nl/onderwerpen/vakantiedagen-en-vakantiegeld/vraag-en-antwoord/nulurencontract-en-vakantiedagen-en-vakantiegeld"
      }
    ]
  },
  holidayPayPct: {
    title: "Vakantiegeld %",
    description: "Het percentage vakantiegeld boven op het brutoloon. Volgens de Rijksoverheid is vakantiegeld in Nederland minimaal 8% van het brutoloon, tenzij in een uitzonderingssituatie iets anders geldt.",
    sources: [
      {
        label: "Rijksoverheid: vakantiedagen en vakantiegeld bij nulurencontract",
        url: "https://www.rijksoverheid.nl/onderwerpen/vakantiedagen-en-vakantiegeld/vraag-en-antwoord/nulurencontract-en-vakantiedagen-en-vakantiegeld"
      }
    ]
  },
  thirteenthMonthPct: {
    title: "13e maand %",
    description: "De 13e maand is een extra bruto uitkering, vaak afgesproken in cao of arbeidsovereenkomst. Het is geen automatisch wettelijk recht, maar een arbeidsvoorwaarde die per werkgever of cao verschilt.",
    sources: [
      {
        label: "FNV: uitleg over de 13e maand",
        url: "https://www.fnv.nl/werk-inkomen/salaris-loon/13e-maand"
      }
    ]
  },
  transitionPct: {
    title: "Transitievergoeding %",
    description: "De transitievergoeding is een wettelijke vergoeding bij ontslag of het niet verlengen van een tijdelijk contract op initiatief van de werkgever. In deze tool gebruik je dit als reserveringspercentage als die vergoeding maandelijks wordt meegenomen in de kostprijs.",
    sources: [
      {
        label: "Rijksoverheid: regels ontslagrecht en transitievergoeding",
        url: "https://www.rijksoverheid.nl/onderwerpen/ontslag/nieuwe-regels-ontslagrecht"
      }
    ]
  },
  employerBurdenPct: {
    title: "Werkgeverslasten %",
    description: "Dit percentage staat voor de extra werkgeverskosten boven op het brutoloon, zoals premies werknemersverzekeringen en andere loonheffingscomponenten aan werkgeverszijde. De precieze mix hangt af van situatie en sector.",
    sources: [
      {
        label: "Belastingdienst: als u loonheffingen gaat inhouden",
        url: "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/internationaal/personeel/u_bent_niet_in_nederland_gevestigd_loonheffingen_inhouden/als_u_loonheffingen_gaat_inhouden/"
      }
    ]
  },
  employerPensionPct: {
    title: "Werkgeverspensioen %",
    description: "Het deel van de pensioenpremie dat door de werkgever wordt betaald. De verdeling tussen werkgever en werknemer verschilt per pensioenregeling; in deze tool voer je het werkgeversdeel als percentage in.",
    sources: [
      {
        label: "ABP Werkgevers: pensioen en werkgeversinformatie",
        url: "https://www.abp.nl/werkgevers/uw-werknemers-informeren/met-pensioen/wat-regelt-u-als-werkgever"
      }
    ]
  },
  employeePensionPct: {
    title: "Werknemerspensioen inhouding %",
    description: "Het deel van de pensioenpremie dat op het brutoloon van de werknemer wordt ingehouden. Dit verlaagt de bruto all-in vergoeding en verschilt per pensioenregeling of cao.",
    sources: [
      {
        label: "ABP Werkgevers: pensioen en werkgeversinformatie",
        url: "https://www.abp.nl/werkgevers/uw-werknemers-informeren/met-pensioen/wat-regelt-u-als-werkgever"
      }
    ]
  },
  payrollFeePct: {
    title: "Payroll/overhead %",
    description: "Een opslag voor interne kosten, payrollkosten of administratieve overhead boven op de salarisopbouw. Dit is geen vaste wettelijke norm, maar een commerciële of operationele aanname die per organisatie verschilt."
  },
  taxPct: {
    title: "Effectieve loonheffing %",
    description: "Een benaderd percentage voor de inhoudingen op het loon, zoals loonbelasting, premie volksverzekeringen en andere loonheffingen. In de tool is dit een praktische netto-indicatie, niet een exacte loonstrookberekening.",
    sources: [
      {
        label: "Belastingdienst: als u loonheffingen gaat inhouden",
        url: "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/internationaal/personeel/u_bent_niet_in_nederland_gevestigd_loonheffingen_inhouden/als_u_loonheffingen_gaat_inhouden/"
      }
    ]
  }
};

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

function saveFormValues() {
  const values = Object.fromEntries(
    Object.entries(fields).map(([id, field]) => [id, field.value])
  );

  window.localStorage.setItem(storageKey, JSON.stringify(values));
}

function restoreFormValues() {
  const stored = window.localStorage.getItem(storageKey);

  if (!stored) {
    return;
  }

  try {
    const values = JSON.parse(stored);

    for (const [id, value] of Object.entries(values)) {
      if (fields[id] && typeof value === "string") {
        fields[id].value = value;
      }
    }
  } catch {
    window.localStorage.removeItem(storageKey);
  }
}

function renderDefaultNotes() {
  for (const label of document.querySelectorAll(".assumption-field")) {
    const input = label.querySelector("input");

    if (!input) {
      continue;
    }

    const note = document.createElement("small");
    note.className = "default-note";
    note.innerHTML = `Standaardwaarde: <strong>${escapeHtml(input.defaultValue.replace(".", ","))}</strong>`;
    label.appendChild(note);
  }
}

function openInfoModal(id) {
  const help = fieldHelp[id];

  if (!help) {
    return;
  }

  infoModalTitle.textContent = help.title;
  infoModalBody.textContent = help.description;
  infoModalSourcesList.innerHTML = "";

  if (help.sources?.length) {
    for (const source of help.sources) {
      const item = document.createElement("li");
      const link = document.createElement("a");

      link.href = source.url;
      link.target = "_blank";
      link.rel = "noreferrer noopener";
      link.textContent = source.label;

      item.appendChild(link);
      infoModalSourcesList.appendChild(item);
    }

    infoModalSources.hidden = false;
  } else {
    infoModalSources.hidden = true;
  }

  infoModal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeInfoModal() {
  infoModal.hidden = true;
  document.body.style.overflow = "";
}

function enhanceFieldLabels() {
  for (const [id, field] of Object.entries(fields)) {
    const label = field?.closest("label");
    const textNode = label?.querySelector("span");
    const help = fieldHelp[id];

    if (!label || !textNode || !help) {
      continue;
    }

    const heading = document.createElement("div");
    heading.className = "field-heading";

    textNode.replaceWith(heading);
    heading.appendChild(textNode);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "info-button";
    button.setAttribute("aria-label", `Meer uitleg over ${help.title}`);
    button.textContent = "i";
    button.addEventListener("click", () => openInfoModal(id));

    heading.appendChild(button);
  }
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
  const allowancesTotal = homeAllowance + travelAllowance;

  const grossBaseFactor =
    1 +
    holidayPayPct +
    thirteenthMonthPct +
    transitionPct;
  const totalCostFactor =
    grossBaseFactor * (1 + employerBurdenPct + employerPensionPct) +
    payrollFeePct;
  const payrollBudget = Math.max(0, budgetExclusive - allowancesTotal);
  const grossSalary = totalCostFactor > 0
    ? payrollBudget / totalCostFactor
    : 0;

  const holidayPay = grossSalary * holidayPayPct;
  const thirteenthMonth = grossSalary * thirteenthMonthPct;
  const transitionPay = grossSalary * transitionPct;
  const payrollFee = grossSalary * payrollFeePct;
  const compensationBase = grossSalary + holidayPay + thirteenthMonth + transitionPay;
  const employeePension = grossSalary * employeePensionPct;
  const grossAllIn = compensationBase - employeePension;
  const employerBurden = compensationBase * employerBurdenPct;
  const employerPension = compensationBase * employerPensionPct;
  const employerCostBeforeAllowances = compensationBase + payrollFee + employerBurden + employerPension;
  const totalEmployerCost = employerCostBeforeAllowances + allowancesTotal;
  const taxAmount = Math.max(0, grossAllIn * taxPct);
  const netSalary = grossAllIn - taxAmount + allowancesTotal;
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
    compensationBase,
    employeePension,
    grossAllIn,
    employerBurden,
    employerPension,
    employerCostBeforeAllowances,
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
  outputs.totalEmployerCost.textContent = euro.format(data.totalEmployerCost);
}

function createPdfHtml(data) {
  const fileTitle = `Ind Salaris berekening ${new Date().getFullYear()} ${data.candidateName} ${Math.round(data.weeklyHours)} uur`;
  const purple = "#bf1aa8";

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(fileTitle)}</title>
  <style>
    @page { size: A4; margin: 12mm; }
    html, body { margin: 0; padding: 0; background: white; color: #111; font-family: Arial, Helvetica, sans-serif; font-size: 11px; line-height: 1.2; }
    table { width: 100%; border-collapse: collapse; }
    .header td { vertical-align: middle; }
    .header td:first-child { width: 210px; font-size: 10px; font-weight: 700; line-height: 1.45; }
    .logo-wrap { display: inline-flex; align-items: center; gap: 10px; }
    .brand-mark { position: relative; width: 50px; height: 50px; border-radius: 50%; background: conic-gradient(from -35deg, #222 0 118deg, transparent 118deg 360deg); overflow: hidden; }
    .brand-mark::before { content: ""; position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(from 128deg, ${purple} 0 112deg, transparent 112deg 360deg); }
    .brand-mark::after { content: ""; position: absolute; inset: 13px; border-radius: 50%; background: white; box-shadow: 0 0 0 8px transparent, -9px -10px 0 7px #d4d4d4; }
    .brand-text { font-style: italic; line-height: 0.95; font-weight: 800; font-size: 24px; }
    .brand-text .accent { color: ${purple}; }
    .rule { border-top: 2px solid #222; margin: 14px 0 22px; }
    h1 { margin: 0 0 22px; font-size: 18px; text-decoration: underline; text-underline-offset: 4px; }
    .meta { width: 430px; margin-bottom: 28px; }
    .meta td { padding: 2px 0; vertical-align: top; }
    .meta td:first-child { width: 150px; }
    .row-wide { margin-bottom: 8px; }
    .row-wide td { padding: 0; }
    .row-wide td:last-child { width: 80px; text-align: right; }
    .budget-top { margin-bottom: 2px; }
    .budget-top td { padding: 0; vertical-align: bottom; }
    .budget-top .label { font-weight: 700; }
    .budget-top .currency, .budget-top .value { text-align: right; font-weight: 700; }
    .budget-top .currency { width: 24px; }
    .budget-top .value { width: 90px; }
    .hours-line { margin-bottom: 8px; }
    .hours-line td { padding: 0 0 4px; vertical-align: bottom; }
    .hours-line td:first-child { font-weight: 700; }
    .hours-line td:last-child { width: 90px; text-align: right; border-bottom: 2px solid ${purple}; font-weight: 700; }
    .budget-table { margin-bottom: 22px; }
    .budget-table td { padding: 1px 0; }
    .budget-table td:nth-child(2), .budget-table td:nth-child(3), .budget-table td:nth-child(4) { text-align: right; }
    .budget-table td:nth-child(2) { width: 50px; }
    .budget-table td:nth-child(3) { width: 20px; }
    .budget-table td:nth-child(4) { width: 110px; }
    .budget-table .strong td { font-weight: 700; }
    .salary-head td { background: ${purple}; color: white; font-weight: 700; padding: 4px 8px; font-size: 11px; }
    .salary-head td:nth-child(2), .salary-head td:nth-child(3) { text-align: center; }
    .salary-table { margin-top: 4px; margin-bottom: 6px; }
    .salary-table td { padding: 2px 4px; vertical-align: top; }
    .salary-table td:nth-child(2), .salary-table td:nth-child(3), .salary-table td:nth-child(4), .salary-table td:nth-child(5) { text-align: right; }
    .salary-table td:nth-child(2), .salary-table td:nth-child(4) { width: 18px; }
    .salary-table td:nth-child(3), .salary-table td:nth-child(5) { width: 90px; }
    .salary-table .gap td { padding-top: 8px; }
    .salary-table .total td { padding-top: 8px; font-weight: 700; }
    .leave-hours { margin-bottom: 6px; }
    .footer-note { font-size: 8px; line-height: 1.28; color: #333; }
    .footer-note p { margin: 0 0 2px; }
    .footer-company { margin-top: 6px; }
  </style>
</head>
<body>
  <div class="sheet">
    <table class="header">
      <tr>
        <td>
          Werkgever ICQ-Talent Profs<br>
          Waterloseweg 7a<br>
          7311 JG Apeldoorn
        </td>
        <td>
          <div class="logo-wrap">
            <div class="brand-mark"></div>
            <div class="brand-text"><span class="accent">ICQ</span><br>TALENT PROFS</div>
          </div>
        </td>
      </tr>
    </table>
    <div class="rule"></div>
    <h1>Indicatieve salarisberekening</h1>
    <table class="meta">
      <tr><td>Naam kandidaat:</td><td>${escapeHtml(data.candidateName)}</td></tr>
      <tr><td>Naam opdrachtgever:</td><td>${escapeHtml(data.clientName)}</td></tr>
    </table>
    <table class="row-wide">
      <tr><td>Gemiddeld aantal te werken<sup>5</sup> uren per week:</td><td>${escapeHtml(integer.format(data.weeklyHours))}</td></tr>
    </table>
    <table class="budget-top">
      <tr><td class="label">Uurtarief kandidaat</td><td class="currency">€</td><td class="value">${escapeHtml(decimal.format(data.hourlyRate).replace(",00", ",0"))}</td></tr>
    </table>
    <table class="hours-line">
      <tr><td>Gewerkte uren per maand incl vak en nat feestdagen</td><td>${escapeHtml(integer.format(data.monthlyHoursInclusive))}</td></tr>
    </table>
    <table class="budget-table">
      <tr class="strong"><td>Gemiddeld beschikbaar budget voor verloning</td><td>${escapeHtml(integer.format(data.monthlyHoursInclusive))}</td><td>€</td><td>${escapeHtml(integer.format(data.budgetInclusive))}</td></tr>
      <tr><td>Gem beschikbaar budget voor vakantie</td><td>${escapeHtml(integer.format(data.monthlyReserveHours))}</td><td>€</td><td>${escapeHtml(integer.format(data.budgetReserve))}</td></tr>
      <tr class="strong"><td>Gem beschikbaar budget voor verloning excl vak en nat feestdagen</td><td>${escapeHtml(integer.format(data.monthlyHoursExclusive))}</td><td>€</td><td>${escapeHtml(integer.format(data.budgetExclusive))}</td></tr>
    </table>
    <table class="salary-head">
      <tr><td></td><td>Werknemer</td><td>Werkgeverslasten</td></tr>
    </table>
    <table class="salary-table">
      <tr><td>Verloningskosten</td><td>€</td><td>-</td><td>€</td><td>-</td></tr>
      <tr><td>Premies sociale lasten, premies en verzekeringen</td><td></td><td></td><td>€</td><td>${escapeHtml(integer.format(data.employerBurden))}</td></tr>
      <tr><td>Pensioenpremie</td><td></td><td></td><td>€</td><td>${escapeHtml(integer.format(data.employerPension))}</td></tr>
      <tr><td>Uurloon</td><td>€</td><td>${escapeHtml(decimal.format(data.grossHourlyWage))}</td><td></td><td></td></tr>
      <tr class="gap"><td>Salaris</td><td>€</td><td>${escapeHtml(integer.format(data.grossSalary))}</td><td></td><td></td></tr>
      <tr><td>Vakantiegeld<sup>1</sup></td><td>€</td><td>${escapeHtml(integer.format(data.holidayPay))}</td><td></td><td></td></tr>
      <tr><td>13<sup>e</sup> maand<sup>1</sup></td><td>€</td><td>${escapeHtml(integer.format(data.thirteenthMonth))}</td><td></td><td></td></tr>
      <tr><td>Uitbetaling vak dagen</td><td>€</td><td>-</td><td></td><td></td></tr>
      <tr><td>Transitievergoeding<sup>2</sup></td><td>€</td><td>${escapeHtml(integer.format(data.transitionPay))}</td><td></td><td></td></tr>
      <tr><td>Inhouding pensioen premie</td><td>€</td><td>(${escapeHtml(integer.format(data.employeePension))})</td><td></td><td></td></tr>
      <tr class="total"><td>All-in vergoeding bruto per maand<sup>3</sup></td><td>€</td><td>${escapeHtml(integer.format(data.grossAllIn))}</td><td>€</td><td>${escapeHtml(integer.format(data.compensationBase))}</td></tr>
      <tr class="gap"><td>Loonheffing (over alle inkomsten) Met Loonhef korting<sup>7</sup></td><td>€</td><td>(${escapeHtml(integer.format(data.taxAmount))})</td><td></td><td></td></tr>
      <tr><td>Thuiswerk verg + internet verg</td><td>€</td><td>${escapeHtml(integer.format(data.homeAllowance))}</td><td>€</td><td>${escapeHtml(integer.format(data.homeAllowance))}</td></tr>
      <tr><td>Reiskostenvergoeding<sup>6</sup></td><td>€</td><td>${escapeHtml(integer.format(data.travelAllowance))}</td><td>€</td><td>${escapeHtml(integer.format(data.travelAllowance))}</td></tr>
      <tr class="total"><td>Nettosalaris<sup>4</sup></td><td>€</td><td>${escapeHtml(integer.format(data.netSalary))}</td><td>€</td><td>${escapeHtml(integer.format(data.totalEmployerCost))}</td></tr>
    </table>
    <div class="leave-hours">Aantal betaalde uren verlof per jaar ${escapeHtml(integer.format(data.paidLeaveHoursPerYear))}</div>
    <div class="footer-note">
      <p>1 Vakantiegeld en een eindejaarsuitkering of 13e maand kunnen onderdeel zijn van een Individuele Kosten Regeling en/of persoonlijk budget. Dit wordt apart uitgewerkt in de uitzendbevestiging. Wij volgen hier de collectieve arbeidsvoorwaarden van de opdrachtgever.</p>
      <p>2 Transitievergoeding is een compensatie ter bevordering van werk naar werk. Deze wordt uitbetaald bij einde dienstverband of maandelijks vooruitbetaald.</p>
      <p>3 Het betreft een indicatie van het gemiddeld salaris gebaseerd op het genoemde aantal uren per week.</p>
      <p>4 Aanname is dat de arbeidskorting kan worden toegepast, genoemde bedrag is een indicatie en alleen bedoeld om een beeld te krijgen van wat je ongeveer per maand kunt verwachten. Het betreft hier het all-insalaris, minus loonheffing waarbij vervolgens de netto onkostenvergoeding is opgeteld. Aan de genoemde bedragen loonheffing en nettosalaris kunnen geen rechten worden ontleend.</p>
      <p>5 Dit betreft het aantal te werken uren waar het salaris op is gebaseerd en waar het verlof al van is afgetrokken.</p>
      <p>6 Dit is een aanname, afhankelijk van aantal dagen reizen naar kantoor en afstand woon-werkverkeer.</p>
      <p>7 De loonheffing is een voorheffing gebaseerd op dit salaris. Bij de aangifte Inkomsten belasting waar ook de inkomsten uit bedrijf worden opgegeven kan de te betalen belasting over dit salaris hoger uitkomen.</p>
      <div class="footer-company">ICQ-Talent Profs BV<br>Waterloseweg 7a, 7311 JG Apeldoorn<br>Tel. 0553031464-, website: www.icq-groep.nl</div>
    </div>
  </div>
</body>
</html>`;
}

async function generatePdf() {
  if (typeof window.html2pdf !== "function") {
    window.alert("De PDF-module is nog niet geladen. Controleer je internetverbinding en probeer het opnieuw.");
    return;
  }

  const data = collectCalculationData();
  const html = createPdfHtml(data);
  const fileName = `Ind Salaris berekening ${new Date().getFullYear()} ${data.candidateName} ${Math.round(data.weeklyHours)} uur.pdf`;
  const parser = new DOMParser();
  const exportDocument = parser.parseFromString(html, "text/html");
  const exportStyles = exportDocument.querySelector("style")?.textContent ?? "";
  const exportSheet = exportDocument.querySelector(".sheet");

  if (!exportSheet) {
    window.alert("De PDF-export kon niet worden opgebouwd.");
    return;
  }

  const tempContainer = document.createElement("div");
  tempContainer.setAttribute("aria-hidden", "true");
  tempContainer.style.position = "fixed";
  tempContainer.style.left = "0";
  tempContainer.style.top = "0";
  tempContainer.style.width = "210mm";
  tempContainer.style.opacity = "0";
  tempContainer.style.pointerEvents = "none";
  tempContainer.style.zIndex = "-1";
  tempContainer.style.background = "#ffffff";

  const styleElement = document.createElement("style");
  styleElement.textContent = `
    ${exportStyles}
    .sheet {
      width: 186mm;
      padding: 12mm;
      box-sizing: border-box;
      background: #ffffff;
    }
  `;

  const renderSheet = document.createElement("div");
  renderSheet.className = "sheet";
  renderSheet.innerHTML = exportSheet.innerHTML;

  tempContainer.appendChild(styleElement);
  tempContainer.appendChild(renderSheet);

  document.body.appendChild(tempContainer);

  const options = {
    margin: 0,
    filename: fileName,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff"
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait"
    },
    pagebreak: {
      mode: ["avoid-all", "css", "legacy"]
    }
  };

  await new Promise((resolve) => window.requestAnimationFrame(() => resolve()));

  try {
    await window.html2pdf()
      .set(options)
      .from(renderSheet)
      .save();
  } catch {
    window.alert("De PDF kon niet worden opgeslagen.");
  } finally {
    tempContainer.remove();
  }
}

for (const field of Object.values(fields)) {
  field.addEventListener("input", () => {
    saveFormValues();
    calculate();
  });
}

generatePdfButton.addEventListener("click", generatePdf);
infoModalClose.addEventListener("click", closeInfoModal);
infoModal.addEventListener("click", (event) => {
  if (event.target instanceof HTMLElement && event.target.hasAttribute("data-info-close")) {
    closeInfoModal();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !infoModal.hidden) {
    closeInfoModal();
  }
});

enhanceFieldLabels();
renderDefaultNotes();
restoreFormValues();
calculate();
