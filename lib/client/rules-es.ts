// Spanish for the short, fixed sentences the rules produce (headlines, flag labels, clause titles).
// Longer explanations (price details, legal reasons, evidence) stay in English; the report says so.
// Anything without a translation is shown as-is, so a missing entry never hides information.

const S: Record<string, string> = {
  // scam flags
  "Rent is far below similar rentals": "La renta está muy por debajo de alquileres parecidos",
  "Wants payment by wire transfer, gift card or crypto": "Pide pago por transferencia, tarjeta de regalo o criptomonedas",
  "Wants payment you can't get back (payment app, cashier's check or cash)": "Pide un pago que no se puede recuperar (aplicación de pago, cheque de caja o efectivo)",
  "Asks for money before you've seen the place or signed a lease": "Pide dinero antes de que vea la vivienda o firme un contrato",
  "Won't show the unit in person": "No muestra la vivienda en persona",
  "Says the owner is out of town or overseas": "Dice que el dueño está fuera de la ciudad o del país",
  "Asks for your SSN or credit report before you've agreed to rent": "Pide su número de Seguro Social o su informe de crédito antes de que acepte alquilar",
  "Pushes you to decide or pay quickly": "Lo presiona para decidir o pagar rápido",
  "Moves the conversation off the listing site": "Lleva la conversación fuera del sitio del anuncio",
  "Hides instructions aimed at AI checkers like this one": "Esconde instrucciones dirigidas a verificadores con IA como este",
  // scam headlines and details
  "We didn't run the scam check": "No hicimos la revisión de estafa",
  "Scam warning signs show up in rental listings and landlord messages, and we didn't find one here. Paste the listing or the landlord's messages to check them.":
    "Las señales de estafa aparecen en anuncios y mensajes del arrendador, y aquí no encontramos ninguno. Pegue el anuncio o los mensajes del arrendador para revisarlos.",
  "That isn't a guarantee. See the place in person (or on a live video tour) and sign a lease before you pay anything.":
    "Eso no es una garantía. Vea la vivienda en persona (o en un recorrido por video en vivo) y firme un contrato antes de pagar algo.",
  "These match the warning signs the FTC lists for rental scams. Don't send money. If you already paid, use the FTC link below.":
    "Coinciden con las señales de estafa de alquiler que indica la FTC. No envíe dinero. Si ya pagó, use el enlace de la FTC abajo.",
  "Get answers to the questions below before you send any money.": "Obtenga respuestas a las preguntas de abajo antes de enviar dinero.",
  // lease headlines and details
  "No lease added": "No agregó un contrato",
  "Add a photo of the lease to check its clauses against your state's rules before you sign.":
    "Agregue una foto del contrato para comparar sus cláusulas con las reglas de su estado antes de firmar.",
  "Ask the landlord to remove or rewrite these before you sign. Get answers in writing.": "Pida al arrendador que las quite o las cambie antes de firmar. Pida las respuestas por escrito.",
  "The clauses we check look standard": "Las cláusulas que revisamos parecen estándar",
  "We didn't find the clauses we check": "No encontramos las cláusulas que revisamos",
  // clause titles
  "Lease renews automatically": "El contrato se renueva automáticamente",
  "Move-out notice is longer than the law allows": "El aviso para mudarse es más largo de lo que permite la ley",
  "When the landlord can come in": "Cuándo puede entrar el arrendador",
  "Landlord can enter without enough notice": "El arrendador puede entrar sin aviso suficiente",
  "Late fee": "Cargo por pago tardío",
  "Late fee is higher than the law allows": "El cargo por pago tardío es más alto de lo que permite la ley",
  "Late fee is within the legal limit": "El cargo por pago tardío está dentro del límite legal",
  "Security deposit": "Depósito de seguridad",
  "Deposit is higher than the legal cap": "El depósito es más alto que el límite legal",
  "Deposit is within the legal cap": "El depósito está dentro del límite legal",
  "Cost of leaving early": "Costo de irse antes de tiempo",
  "You give up rights or the landlord's liability": "Usted renuncia a derechos o a reclamarle al arrendador",
  "You pay the landlord's legal fees": "Usted paga los gastos legales del arrendador",
  "Repairs are put on you": "Las reparaciones quedan a su cargo",
  "Rent can go up": "La renta puede subir",
  "Extra fees": "Cargos extra",
};

const unit = (u: string) =>
  u
    .replace(/^one bedroom's share of a (\d+)-bedroom/, "la parte de una recámara en una vivienda de $1 recámaras")
    .replace(/^one person's share of a (\d+)-bedroom/, "la parte de una persona en una vivienda de $1 recámaras")
    .replace(/^a studio/, "un estudio")
    .replace(/^a (\d+)-bedroom/, (_m, n) => `una vivienda de ${n} recámara${n === "1" ? "" : "s"}`)
    .replace(/ in ZIP (\d{5})$/, " en el código postal $1")
    .replace(/ in this area$/, " en esta zona");

const PATTERNS: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^(\d+)% below the usual range for (.+)$/, (m) => `${m[1]}% por debajo de lo usual para ${unit(m[2])}`],
  [/^(\d+)% above the usual range for (.+)$/, (m) => `${m[1]}% por encima de lo usual para ${unit(m[2])}`],
  [/^Within the usual range for (.+)$/, (m) => `Dentro de lo usual para ${unit(m[1])}`],
  [/^Rough comparison only for (.+)$/, (m) => `Solo una comparación aproximada para ${unit(m[1])}`],
  [/^We checked (\d+) warning signs and found none$/, (m) => `Revisamos ${m[1]} señales de alerta y no encontramos ninguna`],
  [/^(\d+) of (\d+) checks flagged$/, (m) => `${m[1]} de ${m[2]} revisiones con alerta`],
  [/^(\d+) clauses? may conflict with (.+) law$/, (m) => `${m[1]} cláusula${m[1] === "1" ? " puede" : "s pueden"} contradecir la ley de ${m[2]}`],
  [/^Ask about (\d+) clauses?$/, (m) => `Pregunte sobre ${m[1]} cláusula${m[1] === "1" ? "" : "s"}`],
];

export function ruleToSpanish(s: string): string {
  if (S[s]) return S[s];
  for (const [re, f] of PATTERNS) {
    const m = s.match(re);
    if (m) return f(m);
  }
  return s;
}
