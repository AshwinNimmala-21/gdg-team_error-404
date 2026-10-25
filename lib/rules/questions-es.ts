import type { Question } from "@/lib/types";

// Spanish versions of the question templates in questions.ts. The questions are fixed templates (never written
// by the model), so they are translated here by hand. A test checks every template has a translation.

const S: Record<string, string> = {
  // scam questions
  "Can I see the unit in person, or on a live video call, before I pay anything?": "¿Puedo ver la vivienda en persona, o en una videollamada en vivo, antes de pagar algo?",
  "Rental scammers generally won't show the place (FTC).": "Los estafadores de alquileres normalmente no muestran la vivienda (FTC).",
  "Can I pay the deposit after I've seen the unit and signed a lease?": "¿Puedo pagar el depósito después de ver la vivienda y firmar un contrato?",
  "Asking for money before a viewing is a common scam tactic (FTC).": "Pedir dinero antes de una visita es una táctica común de estafa (FTC).",
  "Can I pay by check or credit card instead?": "¿Puedo pagar con cheque o tarjeta de crédito?",
  "Wire transfers, gift cards, crypto and payment apps are like sending cash: hard to get back (FTC, DC Attorney General).":
    "Las transferencias, las tarjetas de regalo, las criptomonedas y las aplicaciones de pago son como enviar efectivo: es difícil recuperar el dinero (FTC, Fiscal General de DC).",
  "Who will meet me with the keys, and does their ID match the county property records?":
    "¿Quién me va a entregar las llaves, y su identificación coincide con los registros de propiedad del condado?",
  "Fake owners usually claim to be out of the country (FTC).": "Los dueños falsos suelen decir que están fuera del país (FTC).",
  "Why do you need my Social Security number or credit report before I've agreed to rent?":
    "¿Por qué necesita mi número de Seguro Social o mi informe de crédito antes de que acepte alquilar?",
  "Until you agree to rent, a landlord doesn't need them, and real landlords pull credit themselves (FTC).":
    "Hasta que usted acepte alquilar, el arrendador no los necesita, y los arrendadores reales piden el crédito ellos mismos (FTC).",
  "Why is the rent so far below similar places nearby?": "¿Por qué la renta es mucho más baja que la de viviendas parecidas cerca?",
  "Prices well under the local benchmark are a classic bait (FTC).": "Los precios muy por debajo de la referencia local son un anzuelo clásico (FTC).",
  // lease questions (fixed parts)
  "Will you change the entry clause so you give notice before coming in, except in emergencies?":
    "¿Puede cambiar la cláusula de entrada para avisarme antes de entrar, salvo en emergencias?",
  "Will you remove the clause where I waive your liability or my rights?": "¿Puede quitar la cláusula en la que renuncio a reclamarle o a mis derechos?",
  "Will you remove the attorney-fees clause or make it apply to both of us?": "¿Puede quitar la cláusula de honorarios de abogados o hacer que aplique a ambos?",
  "One-sided fee clauses can cost you a lot in any dispute.": "Las cláusulas de honorarios que favorecen a una sola parte le pueden costar mucho en cualquier disputa.",
  "This fee looks higher than the law allows.": "Este cargo parece más alto de lo que permite la ley.",
  "Exactly how much is the late fee, and how many days do I have before it applies?": "¿De cuánto es exactamente el cargo por pago tardío, y cuántos días tengo antes de que se aplique?",
  "Late fees add up fast.": "Los cargos por pago tardío se acumulan rápido.",
  "Can the deposit be reduced to the legal cap?": "¿Se puede reducir el depósito al límite legal?",
  "What's the exact date I need to give notice by if I don't want to renew, and how do I give it?":
    "¿Cuál es la fecha exacta para avisar si no quiero renovar, y cómo debo avisar?",
  "Miss the deadline and you can be locked into another lease term.": "Si se le pasa la fecha, puede quedar obligado a otro período de contrato.",
  "Which repairs would I have to pay for?": "¿Qué reparaciones tendría que pagar yo?",
  "Routine upkeep is usually the landlord's job.": "El mantenimiento normal suele ser responsabilidad del arrendador.",
  "What would it cost me to leave early, and is it in writing?": "¿Cuánto me costaría irme antes de tiempo, y está por escrito?",
  "Early-termination fees are often the biggest surprise.": "Los cargos por terminar antes de tiempo suelen ser la mayor sorpresa.",
  "How much can the rent go up at renewal, and how much notice will I get?": "¿Cuánto puede subir la renta al renovar, y con cuánto aviso?",
  "Know your costs for next year before you commit.": "Conozca sus costos del próximo año antes de comprometerse.",
  "Can you list every fee in writing before I sign?": "¿Puede poner por escrito todos los cargos antes de que firme?",
  "Unlisted fees are a common complaint.": "Los cargos no indicados son una queja común.",
  // general questions
  "Can I read the full lease before I pay a deposit?": "¿Puedo leer el contrato completo antes de pagar un depósito?",
  "Don't pay a security deposit until a lease is signed (DC Attorney General).": "No pague un depósito de seguridad hasta que se firme un contrato (Fiscal General de DC).",
  "What's included in the rent: utilities, parking, amenities?": "¿Qué incluye la renta: servicios, estacionamiento, amenidades?",
  "It's well above HUD's local benchmark.": "Está muy por encima de la referencia local de HUD.",
  "What's included in the rent: utilities, furniture, parking, internet?": "¿Qué incluye la renta: servicios, muebles, estacionamiento, internet?",
  "Per-bedroom prices only allow a rough comparison with area averages, so compare 2–3 nearby listings.":
    "Los precios por recámara solo permiten una comparación aproximada con los promedios de la zona; compare 2 o 3 anuncios cercanos.",
  "If you search the address online, does the same unit show up with a different price, owner or as for sale?":
    "Si busca la dirección en internet, ¿aparece la misma vivienda con otro precio, otro dueño o en venta?",
  "Same place with different contacts, or listed for sale, is a big red flag (FTC).": "La misma vivienda con otros contactos, o anunciada en venta, es una gran señal de alerta (FTC).",
  "Who owns the property? Check the county's property records and compare the name with the landlord's ID.":
    "¿Quién es el dueño? Revise los registros de propiedad del condado y compare el nombre con la identificación del arrendador.",
  "The FTC suggests checking tax-assessment records.": "La FTC sugiere revisar los registros de impuestos sobre la propiedad.",
};

const place = (where: string) => (where === "your state" ? "su estado" : where);
const Place = (where: string) => (where === "your state" ? "Su estado" : where);

// Templates with a value filled in (state name, hours).
const PATTERNS: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^Will you change the entry clause to give me at least (\d+) hours' written notice\?$/, (m) => `¿Puede cambiar la cláusula de entrada para darme al menos ${m[1]} horas de aviso por escrito?`],
  [/^(.+) requires notice before a landlord enters\.$/, (m) => `${Place(m[1])} exige aviso antes de que el arrendador entre.`],
  [/^(.+) treats these waivers as unenforceable\.$/, (m) => `${Place(m[1])} considera que estas renuncias no son válidas.`],
  [/^Can the late fee be lowered to (.+)'s legal limit\?$/, (m) => `¿Se puede bajar el cargo por pago tardío al límite legal de ${place(m[1])}?`],
  [/^(.+) limits how large a deposit can be\.$/, (m) => `${Place(m[1])} limita el monto del depósito.`],
];

export function toSpanish(s: string): string | null {
  if (S[s]) return S[s];
  for (const [re, f] of PATTERNS) {
    const m = s.match(re);
    if (m) return f(m);
  }
  return null;
}

/** Spanish question; falls back to the English text if a template is ever missing (a test guards against that). */
export const questionToSpanish = (q: Question): Question => ({ text: toSpanish(q.text) ?? q.text, why: toSpanish(q.why) ?? q.why });
