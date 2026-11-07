/* Panel interactivo de FAQ (antes inline en faq/index.html) */
const faqData = [
  [
    "Before",
    "Do we need to shut down operations?",
    "No. Solar arrays and distribution lines need to be operating, because anomalies show up under load. Roof inspections are done from the air, with no access to the building interior.",
  ],
  [
    "Before",
    "What areas do you serve?",
    "The Greater Toronto Area and Southern Ontario. For sites further away, contact us and we'll confirm availability.",
  ],
  [
    "Before",
    "How much does an inspection cost?",
    "It depends on the asset type, site size and access. Send us the details and we'll prepare a free quote.",
  ],
  [
    "During",
    "What happens if the weather is bad?",
    "Thermal imaging needs the right conditions: dry, calm and, for solar, sunny. We check conditions before every flight. If they aren't suitable, we reschedule to the next good window at no extra cost.",
  ],
  [
    "During",
    "Why are roof inspections done early in the morning?",
    "After sunset, wet insulation holds heat longer than dry insulation. Flying in the early hours makes those differences easier to see.",
  ],
  [
    "During",
    "Can you inspect the roof beneath solar panels?",
    "No. Thermal cameras can't see through panels. We assess the accessible roof areas and the system interfaces.",
  ],
  [
    "After",
    "How long until I receive my report?",
    "Roofing reports are delivered within 48 hours of the flight. For solar and distribution, timing depends on site size and is confirmed in your quote.",
  ],
  [
    "After",
    "What will I receive?",
    "A PDF report with paired thermal and visual images, GPS coordinates, temperature differences and a severity rating for every finding, plus recommended follow-up.",
  ],
  [
    "After",
    "Does a thermal anomaly mean there's damage?",
    "Not necessarily. Thermography flags areas that behave differently and may need attention. A qualified contractor confirms the cause through physical testing.",
  ],
  [
    "After",
    "Do you also do repairs?",
    "No. We're an independent inspection company. We don't sell repairs, roofing or solar installs, so our findings are objective.",
  ],
];

const items = document.querySelectorAll(".faq-item");
const faqTag = document.getElementById("faqTag");
const faqTitle = document.getElementById("faqTitle");
const faqDesc = document.getElementById("faqDesc");

items.forEach((item) => {
  item.addEventListener("click", () => {
    const id = parseInt(item.getAttribute("data-id"));
    items.forEach((x) => x.classList.remove("on"));
    item.classList.add("on");
    faqTag.textContent = faqData[id][0];
    faqTitle.textContent = faqData[id][1];
    faqDesc.textContent = faqData[id][2];
  });
});
