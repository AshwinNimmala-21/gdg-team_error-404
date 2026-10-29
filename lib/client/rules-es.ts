// Hand-written Spanish for every sentence the rules, data files and server can produce ("usted" style, like
// consumidor.ftc.gov). No machine translation: each English template has a Spanish template here, and the
// verdict logic never sees this file. Statute citations are kept exactly as written.
// Unknown text is returned unchanged, so nothing is hidden; scripts/e2e-es.mjs fails if English slips through.

const S: Record<string, string> = {
  // ---------- scam flags and headlines ----------
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
  "We didn't run the scam check": "No hicimos la revisión de estafa",
  "Scam warning signs show up in rental listings and landlord messages, and we didn't find one here.":
    "Las señales de estafa aparecen en anuncios y mensajes del arrendador, y aquí no encontramos ninguno.",
  "Paste the listing or the landlord's messages to check them.": "Pegue el anuncio o los mensajes del arrendador para revisarlos.",
  "That isn't a guarantee.": "Eso no es una garantía.",
  "See the place in person (or on a live video tour) and sign a lease before you pay anything.":
    "Vea la vivienda en persona (o en un recorrido por video en vivo) y firme un contrato antes de pagar algo.",
  "These match the warning signs the FTC lists for rental scams.": "Coinciden con las señales de estafa de alquiler que indica la FTC.",
  "Don't send money.": "No envíe dinero.",
  "If you already paid, use the FTC link below.": "Si ya pagó, use el enlace de la FTC abajo.",
  "Get answers to the questions below before you send any money.": "Obtenga respuestas a las preguntas de abajo antes de enviar dinero.",
  // scam evidence
  "Payment request": "Pedido de pago",
  "Instructions aimed at AI tools": "Instrucciones dirigidas a herramientas de IA",
  "Instructions aimed at AI tools (not counted: quote not found)": "Instrucciones dirigidas a herramientas de IA (no contado: no encontramos la cita)",
  "FTC: “If the rent is a lot cheaper than most rents in the area, it could be a sign of a scam.”":
    "FTC (traducido): “Si la renta es mucho más barata que la mayoría de las rentas de la zona, podría ser señal de una estafa.”",
  "Clearlease counts 25% or more, and only alongside another warning sign.": "Clearlease cuenta un 25% o más, y solo junto con otra señal de alerta.",
  // ---------- price ----------
  "We don't have rent data for this ZIP yet": "Todavía no tenemos datos de renta para este código postal",
  "Clearlease covers DC, Northern Virginia, suburban Maryland, Baltimore and the Blacksburg area.":
    "Clearlease cubre DC, el norte de Virginia, los suburbios de Maryland, Baltimore y la zona de Blacksburg.",
  "We couldn't read it from what you shared.": "No pudimos leerlo en lo que usted compartió.",
  "Use Edit above to fill it in.": "Use “Corregir lo que leímos”, arriba, para completarlo.",
  "Well under most places like it.": "Muy por debajo de la mayoría de las viviendas parecidas.",
  "Rooms in shared houses, older buildings and income-restricted units are often priced like this, so that alone isn't a red flag.":
    "Los cuartos en casas compartidas, los edificios antiguos y las viviendas con límite de ingresos suelen tener precios así, así que eso solo no es una señal de alerta.",
  "Verify before paying: see it in person and sign a lease before you send money.":
    "Verifique antes de pagar: véala en persona y firme un contrato antes de enviar dinero.",
  "Rent this far under local rents, together with the other warning signs below, matches the FTC's description of rental scams.":
    "Una renta tan por debajo de las rentas locales, junto con las otras señales de alerta de abajo, coincide con la descripción de la FTC de las estafas de alquiler.",
  "Our cut-off (25% under) is a Clearlease rule of thumb, not an FTC number.": "Nuestro límite (25% por debajo) es una regla práctica de Clearlease, no una cifra de la FTC.",
  "Cheaper than most places like it.": "Más barato que la mayoría de las viviendas parecidas.",
  "That can be a real deal, but see the unit before you pay anything.": "Puede ser una buena oferta, pero vea la vivienda antes de pagar algo.",
  "Ask what's included (utilities, parking, amenities) and compare a few similar listings nearby.":
    "Pregunte qué incluye (servicios, estacionamiento, amenidades) y compare algunos anuncios parecidos cerca.",
  "Rough comparison only: per-bedroom rents near campus often run above an even split of area averages.":
    "Solo una comparación aproximada: las rentas por recámara cerca del campus suelen ser más altas que una división pareja de los promedios de la zona.",
  "Compare 2–3 nearby listings and ask what's included.": "Compare 2 o 3 anuncios cercanos y pregunte qué incluye.",
  "Summer sublets often list below market; price alone isn't a red flag here.":
    "Los subarriendos de verano suelen anunciarse por debajo del mercado; aquí el precio solo no es una señal de alerta.",
  "Both figures include utilities, so a listing without utilities can sit a bit lower and still be normal.":
    "Ambas cifras incluyen servicios, así que un anuncio sin servicios puede estar un poco más bajo y aun así ser normal.",
  // price evidence
  "Asking rent we read": "Renta que leímos",
  "Size we read": "Tamaño que leímos",
  "Rent you entered": "Renta que usted escribió",
  "Bedrooms you entered": "Recámaras que usted escribió",
  "Size of the whole unit we read": "Tamaño de la vivienda completa que leímos",
  "Rent is per bedroom": "La renta es por recámara",
  "Rent is per person": "La renta es por persona",
  "Sublet or short-term rental": "Subarriendo o alquiler de corto plazo",
  "HUD benchmark rent (Fair Market Rent)": "Renta de referencia de HUD (Fair Market Rent)",
  "Census median rent, all unit sizes (context)": "Renta mediana del Censo, todos los tamaños (contexto)",
  // sources
  "Census 2020–2024 ACS 5-year, median gross rent by bedrooms (B25031)": "Censo, ACS de 5 años 2020–2024, renta bruta mediana por recámaras (B25031)",
  "Census 2020–2024 ACS 5-year, median gross rent (B25064)": "Censo, ACS de 5 años 2020–2024, renta bruta mediana (B25064)",
  "HUD Fair Market Rents FY2027": "Fair Market Rents de HUD, año fiscal 2027",
  "FTC: Rental listing scams": "FTC: estafas con anuncios de alquiler",
  "FTC Data Spotlight, Dec 2025": "FTC Data Spotlight, dic. 2025",
  "DC Attorney General consumer alert": "Alerta al consumidor del Fiscal General de DC",
  // ---------- lease ----------
  "No lease added": "No agregó un contrato",
  "Add a photo of the lease to check its clauses against your state's rules before you sign.":
    "Agregue una foto del contrato para comparar sus cláusulas con las reglas de su estado antes de firmar.",
  "Ask the landlord to remove or rewrite these before you sign.": "Pida al arrendador que las quite o las cambie antes de firmar.",
  "Get answers in writing.": "Pida las respuestas por escrito.",
  "Nothing clearly conflicts with the rules we check, but these deserve a clear answer.":
    "Nada contradice claramente las reglas que revisamos, pero estas cláusulas merecen una respuesta clara.",
  "Add the ZIP code to compare these with your state's rules.": "Agregue el código postal para comparar estas cláusulas con las reglas de su estado.",
  "The clauses we check look standard": "Las cláusulas que revisamos parecen estándar",
  "We didn't find the clauses we check": "No encontramos las cláusulas que revisamos",
  "We only count clauses we can find word for word. Read the original wording, or try a clearer photo.":
    "Solo contamos las cláusulas que encontramos palabra por palabra. Lea el texto original o intente con una foto más clara.",
  "We check deposits, late fees, entry, renewal, waivers, legal fees, repairs and extra fees.":
    "Revisamos depósitos, cargos por pago tardío, entrada, renovación, renuncias, honorarios legales, reparaciones y cargos extra.",
  "Still read the whole lease.": "Aun así, lea todo el contrato.",
  "From your lease": "De su contrato",
  "We couldn't match this clause to the exact text, so we didn't count it.": "No pudimos encontrar esta cláusula en el texto exacto, así que no la contamos.",
  "Read the original wording.": "Lea la redacción original.",
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
  // legal reasons (judge) without numbers
  "Add the ZIP code so we can compare this with your state's rules.": "Agregue el código postal para que podamos comparar esto con las reglas de su estado.",
  "The clause doesn't say how much notice you'll get.": "La cláusula no dice con cuánto aviso le avisarán.",
  "Ask for it in writing.": "Pídalo por escrito.",
  "We couldn't compare the deposit with the rent.": "No pudimos comparar el depósito con la renta.",
  "Ask exactly how much the late fee is and when it starts.": "Pregunte exactamente de cuánto es el cargo por pago tardío y cuándo empieza.",
  "Ask whether this applies both ways and only when a court awards fees.":
    "Pregunte si esto aplica para ambas partes y solo cuando un tribunal ordene pagar los honorarios.",
  "Ask how and when you have to give notice if you don't want to renew.": "Pregunte cómo y cuándo debe avisar si no quiere renovar.",
  "This puts all repairs on you, whatever the cause.": "Esto pone todas las reparaciones a su cargo, sin importar la causa.",
  "Ask which repairs you'd pay for.": "Pregunte qué reparaciones pagaría usted.",
  "Damage you cause is normal; routine upkeep usually isn't.": "Pagar daños que usted cause es normal; el mantenimiento de rutina normalmente no.",
  "Ask the landlord to explain this in writing before you sign.": "Pida al arrendador que le explique esto por escrito antes de firmar.",
  // ---------- rule sheets: law summaries (citations stay as written) ----------
  "A landlord can't demand a security deposit of more than two months' rent.": "El arrendador no puede exigir un depósito de seguridad de más de dos meses de renta.",
  "Except in an emergency, the landlord must give notice before entering, at reasonable times, and at least 72 hours' notice for routine maintenance you didn't ask for.":
    "Salvo en una emergencia, el arrendador debe avisar antes de entrar, a horas razonables, y con al menos 72 horas de aviso para mantenimiento de rutina que usted no pidió.",
  "A late fee can't be more than 10% of the monthly rent (or 10% of the balance owed, if less), and only if the written lease provides for it.":
    "Un cargo por pago tardío no puede ser mayor al 10% de la renta mensual (o al 10% del saldo adeudado, si es menor), y solo si el contrato escrito lo incluye.",
  "A lease can't make you waive your rights under Virginia's landlord-tenant law or limit the landlord's legal liability to you.":
    "Un contrato no puede obligarlo a renunciar a sus derechos bajo la ley de arrendadores e inquilinos de Virginia ni limitar la responsabilidad legal del arrendador hacia usted.",
  "Such terms are unenforceable.": "Esas cláusulas no son válidas.",
  "A lease can't make you agree to pay the landlord's attorney fees except as Virginia's landlord-tenant law provides.":
    "Un contrato no puede obligarlo a pagar los honorarios de abogados del arrendador, salvo lo que permite la ley de arrendadores e inquilinos de Virginia.",
  "Automatic renewal is allowed in a written lease, along with notice requirements for leaving.":
    "La renovación automática está permitida en un contrato escrito, junto con los requisitos de aviso para irse.",
  "Know the deadline.": "Conozca la fecha límite.",
  "Service members with orders and survivors of family or sexual abuse can end a lease early without liquidated damages, with written notice and documents.":
    "Los miembros del servicio militar con órdenes y los sobrevivientes de abuso familiar o sexual pueden terminar un contrato antes de tiempo sin penalidad, con aviso por escrito y documentos.",
  "The landlord must make repairs and keep electrical, plumbing and heating systems working, and can't charge you for maintenance or repairs you didn't cause.":
    "El arrendador debe hacer las reparaciones y mantener funcionando la electricidad, la plomería y la calefacción, y no puede cobrarle mantenimiento ni reparaciones que usted no causó.",
  "A written good-faith agreement for specific repairs is allowed.": "Se permite un acuerdo escrito y de buena fe para reparaciones específicas.",
  "Landlords with more than four units must give written notice of a rent increase at least 60 days before the lease ends.":
    "Los arrendadores con más de cuatro viviendas deben avisar por escrito un aumento de renta al menos 60 días antes de que termine el contrato.",
  "Deposits, rent and one-time fees must be itemized on the first page of the written lease.":
    "Los depósitos, la renta y los cargos únicos deben detallarse en la primera página del contrato escrito.",
  "A security deposit can't be more than one month's rent.": "Un depósito de seguridad no puede ser mayor a un mes de renta.",
  "Except in an emergency, the landlord must give at least 48 hours' written notice and enter only 9 a.m.–5 p.m., not on Sundays or federal holidays, unless you agree otherwise.":
    "Salvo en una emergencia, el arrendador debe avisar por escrito con al menos 48 horas y entrar solo de 9 a. m. a 5 p. m., no los domingos ni días feriados federales, a menos que usted acepte otra cosa.",
  "A late fee can't be more than 5% of the rent due, and only after rent is 5 days late (or a longer grace period in the lease).":
    "Un cargo por pago tardío no puede ser mayor al 5% de la renta adeudada, y solo después de 5 días de atraso (o un período de gracia más largo si el contrato lo dice).",
  "Clauses that waive the landlord's liability for injuries from conditions they're responsible for, or waive a jury trial, are unenforceable in DC.":
    "En DC no son válidas las cláusulas que eximen al arrendador por lesiones causadas por condiciones de su responsabilidad, ni las que renuncian a un juicio con jurado.",
  "A clause assigning attorney fees to you regardless of what a court decides is unenforceable in DC.":
    "En DC no es válida una cláusula que le asigne a usted los honorarios de abogados sin importar lo que decida un tribunal.",
  "A clause requiring more than 30 days' notice to move out at the end of the first lease term is void.":
    "Es nula una cláusula que exija más de 30 días de aviso para mudarse al final del primer período del contrato.",
  "After the first term, you can usually stay month to month.": "Después del primer período, normalmente puede quedarse mes a mes.",
  "Survivors of intrafamily offenses can be released from a lease with documentation.": "Los sobrevivientes de delitos intrafamiliares pueden liberarse de un contrato con documentación.",
  "Service members are covered by the federal SCRA.": "Los miembros del servicio militar están protegidos por la ley federal SCRA.",
  "A clause waiving the landlord's responsibility for basic maintenance is unenforceable, and landlords can't charge fees for services needed to keep the unit habitable.":
    "No es válida una cláusula que exima al arrendador del mantenimiento básico, y los arrendadores no pueden cobrar por servicios necesarios para que la vivienda sea habitable.",
  "Before you apply, the landlord must tell you the rent and whether the unit is rent-controlled or exempt, which affects how much rent can go up.":
    "Antes de que usted solicite, el arrendador debe decirle la renta y si la vivienda tiene control de rentas o está exenta, lo que afecta cuánto puede subir la renta.",
  "Before signing, only an application fee may be charged.": "Antes de firmar, solo se puede cobrar un cargo de solicitud.",
  "Fees for services needed to keep the unit habitable are banned.": "Están prohibidos los cargos por servicios necesarios para que la vivienda sea habitable.",
  "A security deposit can't be more than one month's rent (a narrow exception allows two months for some utility-assistance tenants).":
    "Un depósito de seguridad no puede ser mayor a un mes de renta (una excepción limitada permite dos meses para algunos inquilinos con asistencia para servicios).",
  "Except in an emergency, the landlord must give at least 24 hours' written notice and enter only 7 a.m.–7 p.m., Monday to Saturday, unless you agree in writing.":
    "Salvo en una emergencia, el arrendador debe avisar por escrito con al menos 24 horas y entrar solo de 7 a. m. a 7 p. m., de lunes a sábado, a menos que usted acepte por escrito.",
  "A lease can't set a late fee above 5% of the unpaid rent.": "Un contrato no puede fijar un cargo por pago tardío mayor al 5% de la renta no pagada.",
  "A lease can't make you waive legal rights or a jury trial, or excuse the landlord's negligence.":
    "Un contrato no puede obligarlo a renunciar a derechos legales o a un juicio con jurado, ni excusar la negligencia del arrendador.",
  "An automatic-renewal clause must be set apart in the lease with a space for you to initial it, or the landlord can't enforce it.":
    "Una cláusula de renovación automática debe estar separada en el contrato con un espacio para sus iniciales; si no, el arrendador no puede hacerla cumplir.",
  "Service members with new orders and victims of abuse can end a lease early with limited rent owed, with written notice and documents.":
    "Los miembros del servicio militar con nuevas órdenes y las víctimas de abuso pueden terminar un contrato antes de tiempo debiendo una renta limitada, con aviso por escrito y documentos.",
  // ---------- help links ----------
  "Virginia landlord-tenant handbook (DHCD)": "Manual de arrendadores e inquilinos de Virginia (DHCD, en inglés)",
  "Virginia Law Help: before you sign a lease": "Virginia Law Help: antes de firmar un contrato (en inglés)",
  "Free legal aid in Virginia (866-534-5243)": "Ayuda legal gratuita en Virginia (866-534-5243)",
  "DC Office of the Tenant Advocate (202-719-6560)": "Oficina del Defensor del Inquilino de DC (202-719-6560)",
  "Legal Aid DC (202-628-1161)": "Legal Aid DC, ayuda legal (202-628-1161)",
  "DC Bar Landlord Tenant Resource Center": "Centro de Recursos para Arrendadores e Inquilinos del Colegio de Abogados de DC",
  "Maryland Attorney General: landlord-tenant disputes": "Fiscal General de Maryland: disputas entre arrendadores e inquilinos",
  "Maryland Legal Aid (888-465-2468)": "Maryland Legal Aid, ayuda legal (888-465-2468)",
  "Virginia Tech Student Legal Services (540-231-4720)": "Servicios Legales Estudiantiles de Virginia Tech (540-231-4720)",
  "Report a rental scam to the FTC": "Reporte una estafa de alquiler a la FTC",
  "Already paid? FTC steps to try to get money back": "¿Ya pagó? Pasos de la FTC para intentar recuperar el dinero",
  // ---------- notes from the server ----------
  "We couldn't confirm the rent in your text, so we left it out.": "No pudimos confirmar la renta en su texto, así que no la usamos.",
  "We couldn't confirm the number of bedrooms, so we left it out.": "No pudimos confirmar el número de recámaras, así que no lo usamos.",
  "We couldn't confirm the ZIP code, so we left it out.": "No pudimos confirmar el código postal, así que no lo usamos.",
  "Demo mode can't read photos.": "El modo de demostración no puede leer fotos.",
  "Paste the text, or run Clearlease with a Gemini API key.": "Pegue el texto, o use Clearlease con una clave de la API de Gemini.",
  // ---------- errors from the server ----------
  "That upload is too large.": "Ese archivo es demasiado grande.",
  "Try a screenshot or a smaller photo.": "Pruebe con una captura de pantalla o una foto más pequeña.",
  "That image is over 8 MB.": "Esa imagen pesa más de 8 MB.",
  "Something in the request wasn't valid.": "Algo en la solicitud no era válido.",
  "Reload the page and try again.": "Vuelva a cargar la página e intente de nuevo.",
  "Paste a listing or add a photo first.": "Primero pegue un anuncio o agregue una foto.",
  "Couldn't update the check.": "No pudimos actualizar la revisión.",
  "Run it again.": "Hágala de nuevo.",
  "Gemma is busy right now.": "Gemma está ocupada en este momento.",
  "Wait a few seconds and try again.": "Espere unos segundos e intente de nuevo.",
  "We couldn't read this text.": "No pudimos leer este texto.",
  "Try pasting the listing itself.": "Pruebe pegando el anuncio mismo.",
  "We couldn't read this photo.": "No pudimos leer esta foto.",
  "Try a clearer photo, or paste the text instead.": "Pruebe con una foto más clara, o pegue el texto.",
  "We couldn't reach the AI model.": "No pudimos comunicarnos con el modelo de IA.",
  "Try again, or try one of the samples.": "Intente de nuevo, o pruebe uno de los ejemplos.",
  "Something went wrong on our side.": "Algo salió mal de nuestro lado.",
  "Try again in a moment.": "Intente de nuevo en un momento.",
  "Paste the most important part.": "Pegue la parte más importante.",
  "Something went wrong.": "Algo salió mal.",
  "You seem to be offline, or our server didn't answer.": "Parece que no tiene conexión, o nuestro servidor no respondió.",
  "Check your connection and try again.": "Revise su conexión e intente de nuevo.",
  // ---------- client-side image and form errors ----------
  "That file isn't an image.": "Ese archivo no es una imagen.",
  "Use a photo or a screenshot.": "Use una foto o una captura de pantalla.",
  "That photo is too large (over 25 MB).": "Esa foto es demasiado grande (más de 25 MB).",
  "Try a screenshot instead.": "Pruebe con una captura de pantalla.",
  "We couldn't open that image.": "No pudimos abrir esa imagen.",
  "If it's a HEIC photo, take a screenshot of it and upload that.": "Si es una foto HEIC, tómele una captura de pantalla y suba esa.",
  "Your browser couldn't process the image.": "Su navegador no pudo procesar la imagen.",
  "That image is still over 8 MB after shrinking.": "Esa imagen sigue pesando más de 8 MB después de reducirla.",
  "Try a screenshot.": "Pruebe con una captura de pantalla.",
  "Couldn't read the image.": "No pudimos leer la imagen.",
  "We couldn't use that image.": "No pudimos usar esa imagen.",
  "Enter the monthly rent as a number, like 1850.": "Escriba la renta mensual como número, por ejemplo 1850.",
  "Enter a 5-digit ZIP code.": "Escriba un código postal de 5 dígitos.",
};

const AREAS: Record<string, string> = {
  "Washington metro": "área metropolitana de Washington",
  "Baltimore metro": "área metropolitana de Baltimore",
  "Blacksburg area": "zona de Blacksburg",
  "this area": "esta zona",
};

/** "1-bedroom" → "1 recámara", "studio" → "estudio" */
const bed = (b: string) => (b === "studio" ? "estudio" : b.replace(/^(\d+)-bedroom$/, (_m, n) => `${n} recámara${n === "1" ? "" : "s"}`));
/** "ZIP 22201" → "el código postal 22201"; known area names; county names stay as written. */
const geo = (g: string) => AREAS[g] ?? g.replace(/^ZIP (\d{5})$/, "el código postal $1");
const state = (w: string) => (w === "your state" ? "su estado" : w);
const State = (w: string) => (w === "your state" ? "Su estado" : w);
const vintage = (v: string) => v.replace("2020–2024 ACS 5-year", "ACS de 5 años 2020–2024");
const saved = (s: string | undefined) => (s ? " (cifra guardada)" : "");
const share = (n: string | undefined, basis: string | undefined, amt: string | undefined) =>
  n ? `; ÷ ${n} recámaras = parte por ${basis === "person" ? "persona" : "recámara"} (aproximación): ${amt}` : "";
const unit = (u: string) =>
  u
    .replace(/^one bedroom's share of a (\d+)-bedroom/, "la parte de una recámara en una vivienda de $1 recámaras")
    .replace(/^one person's share of a (\d+)-bedroom/, "la parte de una persona en una vivienda de $1 recámaras")
    .replace(/^a studio/, "un estudio")
    .replace(/^a (\d+)-bedroom/, (_m, n) => `una vivienda de ${n} recámara${n === "1" ? "" : "s"}`)
    .replace(/ in ZIP (\d{5})$/, " en el código postal $1")
    .replace(/ in this area$/, " en esta zona");
const refName = (n: string) =>
  n
    .replace(/^Census median for a (.+?) in (.+?)(, ÷ \d+)?$/, (_m, b, g, d) => `mediana del Censo para ${bed(b)} en ${geo(g)}${d ?? ""}`)
    .replace(/^HUD (FY\d{4}) benchmark, (.+?)(, ÷ \d+)?$/, (_m, y, w, d) => `referencia de HUD, año fiscal ${y.slice(2)}, ${geo(w)}${d ?? ""}`);
const needs: Record<string, string> = {
  "the monthly rent": "la renta mensual",
  "the number of bedrooms": "el número de recámaras",
  "the ZIP code": "el código postal",
  "the rent details": "los datos de la renta",
};

const PATTERNS: [RegExp, (m: RegExpMatchArray) => string][] = [
  // headlines
  [/^(\d+)% below the usual range for (.+)$/, (m) => `${m[1]}% por debajo de lo usual para ${unit(m[2])}`],
  [/^(\d+)% above the usual range for (.+)$/, (m) => `${m[1]}% por encima de lo usual para ${unit(m[2])}`],
  [/^Within the usual range for (.+)$/, (m) => `Dentro de lo usual para ${unit(m[1])}`],
  [/^Rough comparison only for (.+)$/, (m) => `Solo una comparación aproximada para ${unit(m[1])}`],
  [/^Add (.+) to check the price$/, (m) => `Agregue ${m[1].replace(/the monthly rent|the number of bedrooms|the ZIP code|the rent details/g, (x) => needs[x]).replace(/ and /, " y ")} para revisar el precio`],
  [/^We checked (\d+) warning signs and found none$/, (m) => `Revisamos ${m[1]} señales de alerta y no encontramos ninguna`],
  [/^(\d+) of (\d+) checks flagged$/, (m) => `${m[1]} de ${m[2]} revisiones con alerta`],
  [/^(\d+) clauses? may conflict with (.+) law$/, (m) => `${m[1]} cláusula${m[1] === "1" ? " puede" : "s pueden"} contradecir la ley de ${state(m[2])}`],
  [/^Ask about (\d+) clauses?$/, (m) => `Pregunte sobre ${m[1]} cláusula${m[1] === "1" ? "" : "s"}`],
  [/^We couldn't match (\d+) clauses? to your text$/, (m) => `No pudimos encontrar ${m[1] === "1" ? "1 cláusula" : `${m[1]} cláusulas`} palabra por palabra en su texto`],
  // price detail sentences
  [/^Usual range: (\$[\d,]+) \((.+?)\) to (\$[\d,]+) \((.+?)\)\.$/, (m) => `Rango usual: ${m[1]} (${refName(m[2])}) a ${m[3]} (${refName(m[4])}).`],
  [/^Local benchmark: (\$[\d,]+) \((.+?)\)\.$/, (m) => `Referencia local: ${m[1]} (${refName(m[2])}).`],
  [/^Per-(bedroom|person) figures are the whole-unit benchmarks divided by (\d+), an approximation\.$/,
    (m) => `Las cifras por ${m[1] === "person" ? "persona" : "recámara"} son las referencias de la vivienda completa divididas entre ${m[2]}, una aproximación.`],
  // price evidence
  [/^Census median rent for a (.+)$/, (m) => `Renta mediana del Censo para ${bed(m[1])}`],
  [/^(\$[\d,]+) a month$/, (m) => `${m[1]} al mes`],
  [/^(studio|\d+-bedroom)$/, (m) => bed(m[1])],
  [/^(\$[\d,]+) a month in (.+?), (2020–2024 ACS 5-year)( \(saved figure\))?(?:; ÷ (\d+) bedrooms = per-(bedroom|person) share \(approximation\): (\$[\d,]+))?$/,
    (m) => `${m[1]} al mes en ${geo(m[2])}, ${vintage(m[3])}${saved(m[4])}${share(m[5], m[6], m[7])}`],
  [/^At least (\$[\d,]+) a month in (.+?), (2020–2024 ACS 5-year)( \(saved figure\))?$/, (m) => `Al menos ${m[1]} al mes en ${geo(m[2])}, ${vintage(m[3])}${saved(m[4])}`],
  [/^(\$[\d,]+) a month for a (.+?), (.+?), (FY\d{4})( \(saved figure\))?(?:; ÷ (\d+) bedrooms = per-(bedroom|person) share \(approximation\): (\$[\d,]+))?$/,
    (m) => `${m[1]} al mes para ${bed(m[2])}, ${geo(m[3])}, año fiscal ${m[4].slice(2)}${saved(m[5])}${share(m[6], m[7], m[8])}`],
  // scam evidence
  [/^(\$[\d,]+) is (\d+)% under the low end of the usual local range \((\$[\d,]+)\)\.$/,
    (m) => `${m[1]} está un ${m[2]}% por debajo del extremo bajo del rango local usual (${m[3]}).`],
  [/^(.+) \(not counted: we couldn't find this quote in what you shared\)$/, (m) => `${ruleToSpanish(m[1])} (no contado: no encontramos esta cita en lo que usted compartió)`],
  [/^(.+) \(not counted: moving for work isn't the warning sign; the FTC sign is an owner who can't meet you or show the place\)$/,
    (m) => `${ruleToSpanish(m[1])} (no contado: mudarse por trabajo no es la señal de alerta; la señal de la FTC es un dueño que no puede reunirse con usted ni mostrar la vivienda)`],
  [/^(.+)\. This is a Clearlease rule of thumb\.$/, (m) => `${ruleToSpanish(m[1])}. Es una regla práctica de Clearlease.`],
  // lease reasons with values
  [/^(.+) requires notice before a landlord enters, except in an emergency\.$/, (m) => `${State(m[1])} exige aviso antes de que el arrendador entre, salvo en una emergencia.`],
  [/^(.+) requires at least (\d+) hours' notice; this lease gives (\d+)\.$/, (m) => `${State(m[1])} exige al menos ${m[2]} horas de aviso; este contrato da ${m[3]}.`],
  [/^(\d+) hours' notice meets (.+)'s rule\.$/, (m) => `${m[1]} horas de aviso cumplen la regla de ${state(m[2])}.`],
  [/^(\$[\d,]+) is more than (one month's|\d+ months') rent \((\$[\d,]+)\), the cap in (.+)\.$/,
    (m) => `${m[1]} es más que ${m[2] === "one month's" ? "un mes" : `${m[2].split(" ")[0]} meses`} de renta (${m[3]}), el límite en ${state(m[4])}.`],
  [/^(\$[\d,]+) is within (.+)'s cap of (one month's|\d+ months') rent\.$/,
    (m) => `${m[1]} está dentro del límite de ${state(m[2])} de ${m[3] === "one month's" ? "un mes" : `${m[3].split(" ")[0]} meses`} de renta.`],
  [/^(.+) doesn't allow a late fee until rent is (\d+) days late\.$/, (m) => `${State(m[1])} no permite un cargo por pago tardío hasta que la renta tenga ${m[2]} días de atraso.`],
  [/^This fee is ([\d.]+%) of the rent; (.+) caps late fees at (\d+)%\.$/, (m) => `Este cargo es el ${m[1]} de la renta; ${state(m[2])} limita los cargos por pago tardío al ${m[3]}%.`],
  [/^This fee is ([\d.]+%) of the rent, under (.+)'s (\d+)% cap\.$/, (m) => `Este cargo es el ${m[1]} de la renta, por debajo del límite de ${m[3]}% de ${state(m[2])}.`],
  [/^(.+) treats waivers like this as unenforceable, but signing it can still cause trouble\.$/,
    (m) => `${State(m[1])} considera que estas renuncias no son válidas, pero firmarlas aun así puede causarle problemas.`],
  [/^(.+) limits clauses that make you pay the landlord's lawyer\.$/, (m) => `${State(m[1])} limita las cláusulas que lo obligan a pagar el abogado del arrendador.`],
  [/^(.+) voids clauses requiring more than (\d+) days' notice at the end of the first term\.$/,
    (m) => `${State(m[1])} anula las cláusulas que exigen más de ${m[2]} días de aviso al final del primer período.`],
  [/^Put a reminder in your calendar: you must give (\d+) days' notice or you're locked in again\.$/,
    (m) => `Ponga un recordatorio en su calendario: debe avisar con ${m[1]} días de anticipación o quedará obligado otra vez.`],
  [/^(.+) doesn't let a lease shift the landlord's basic maintenance duties to you\.$/,
    (m) => `${State(m[1])} no permite que un contrato le pase a usted las obligaciones básicas de mantenimiento del arrendador.`],
  [/^(.+) makes the landlord responsible for repairs and basic systems, and doesn't let a landlord charge you for repairs you didn't cause\.$/,
    (m) => `${State(m[1])} hace al arrendador responsable de las reparaciones y los sistemas básicos, y no le permite cobrarle reparaciones que usted no causó.`],
  [/^The lease asks for a (\$[\d,]+) security deposit\.$/, (m) => `El contrato pide un depósito de seguridad de ${m[1]}.`],
  // errors with values
  [/^Too many checks in a minute\. Try again in (\d+) seconds\.$/, (m) => `Demasiadas revisiones en un minuto. Intente de nuevo en ${m[1]} segundos.`],
  [/^Text is limited to ([\d,]+) characters\.$/, (m) => `El texto tiene un límite de ${m[1]} caracteres.`],
];

function one(s: string): string | null {
  if (S[s]) return S[s];
  for (const [re, f] of PATTERNS) {
    const m = s.match(re);
    if (m) return f(m);
  }
  return null;
}

/** Spanish for a rule sentence or paragraph. Whole string first, then sentence by sentence; unknown parts stay as-is. */
export function ruleToSpanish(s: string): string {
  const whole = one(s.trim());
  if (whole !== null) return whole;
  const parts = s.trim().split(/(?<=[.!?])\s+(?=[A-Z$0-9(“"])/);
  if (parts.length < 2) return s;
  return parts.map((p) => one(p) ?? p).join(" ");
}
