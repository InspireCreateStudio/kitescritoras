(function () {
"use strict";

/* ---------- Utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const uid = () => Math.random().toString(36).slice(2, 10);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const num = v => { const n = parseFloat(String(v).replace(",", ".")); return isFinite(n) ? n : 0; };
const eur = n => num(n).toLocaleString("es-ES", { style: "currency", currency: "EUR" });
const fmt = n => Math.round(num(n)).toLocaleString("es-ES");
const pad = n => String(n).padStart(2, "0");
const ymd = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const TODAY = ymd(new Date());
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const monthOf = s => (s || "").slice(0, 7);
function addMonth(ym, k) { let [y, m] = ym.split("-").map(Number); m += k; while (m > 12) { m -= 12; y++; } while (m < 1) { m += 12; y--; } return y + "-" + pad(m); }
function monthDays(ym) { const [y, m] = ym.split("-").map(Number); const n = new Date(y, m, 0).getDate(); return Array.from({ length: n }, (_, i) => ym + "-" + pad(i + 1)); }
const dow = s => (new Date(s + "T12:00:00").getDay() + 6) % 7;
const mesLabel = ym => { const [y, m] = ym.split("-").map(Number); return MESES[m - 1] + " " + y; };
const dayLabel = s => { if (!s) return "Sin fecha"; const d = new Date(s + "T12:00:00"); return d.getDate() + " " + MESES[d.getMonth()].slice(0, 3); };
const words = t => (String(t || "").trim().match(/\S+/g) || []).length;

/* ---------- Catálogos ---------- */
const FASES = ["Edición y diseño", "Publicación", "Preventa y promoción", "Prensa y colaboraciones", "Envíos", "Después del lanzamiento"];
// Días respecto al lanzamiento (día D) en los que cae cada fase, para repartir fechas
const VENTANAS = { "Escritura": [-180, -121], "Edición y diseño": [-120, -61], "Publicación": [-60, -31], "Preventa y promoción": [-45, -1], "Prensa y colaboraciones": [-30, 0], "Envíos": [-14, 7], "Después del lanzamiento": [1, 30] };
const BEATS = ["Planteamiento", "Detonante", "Primer cambio de rumbo", "Desarrollo", "Segundo cambio de rumbo", "Clímax", "Final"];
const FASES_PROD = ["Primer borrador", "Reescritura", "Lectoras beta", "Corrección", "Revisión final", "Portada", "Maquetación ebook", "Maquetación papel", "Subido a KDP"];
const MODULOS_APLUS = {
  "Imagen de cabecera con texto": "970 × 600 px",
  "Imagen con texto superpuesto": "1940 × 600 px (mínimo 970 × 300). El texto va en el recuadro, no en la imagen",
  "Imagen a la izquierda y texto": "600 × 600 px (300 ppp)",
  "Imagen a la derecha y texto": "600 × 600 px (300 ppp)",
  "Tres imágenes con texto": "600 × 600 px cada una (mínimo 300 × 300)",
  "Comparativa (tus otros libros)": "Portadas de mínimo 150 × 300 px. Hasta 5 libros",
  "Solo texto": "Hasta 6000 caracteres",
  "Logo o firma de autora": "600 × 180 px"
};
const PROHIBIDAS = ["gratis", "free", "novedad", "oferta", "rebaja", "descuento", "mejor", "best seller", "bestseller", "más vendido", "kindle unlimited", "kdp select", "kindle", "libro", "libros", "ebook", "disponible"];
const TONES = {
  "Hecho": "ok", "Publicado": "ok", "Pagado": "ok", "Recibido": "ok", "Bueno": "ok", "Analizado": "ok", "Salió en prensa": "ok", "Ingreso": "ok", "Reseña hecha": "ok",
  "Preventa": "mid", "En revisión": "mid", "Borrador": "neu", "Sin reseña": "neu",
  "En curso": "mid", "Programado": "mid", "Diseñado": "mid", "Copy listo": "mid", "Enviado": "mid", "Nota enviada": "mid", "Respondió": "mid", "Satisfactorio": "mid", "A cuenta": "mid",
  "Pendiente": "neu", "Idea": "neu", "Por contactar": "neu", "Regalo": "warm",
  "Incidencia": "bad", "Malo": "bad", "No repetir": "bad", "Sin respuesta": "bad", "Gasto": "bad",
  "Alta": "hi", "Media": "warm", "Baja": "neu"
};
const tone = v => "t-" + (TONES[v] || "neu");
const CONCEPTOS_VENTA = ["Digital", "Tapa blanda", "Tapa dura", "KENP (páginas leídas)", "Edición especial", "Preventa", "Venta directa", "Facebook Ads", "Amazon Ads", "Colaboraciones / sorteos", "Otro gasto"];
const GASTOS = ["Facebook Ads", "Amazon Ads", "Colaboraciones / sorteos", "Otro gasto"];

/* Columnas de las tablas editables */
const COLS = {
  tareas: [
    { k: "tarea", t: "Tarea", w: 230 },
    { k: "herr", t: "Dónde / con qué", w: 150 },
    { k: "fecha", t: "Fecha", type: "date", w: 140 },
    { k: "importancia", t: "Prioridad", type: "pill", opts: ["Alta", "Media", "Baja"] },
    { k: "estado", t: "Estado", type: "pill", opts: ["Pendiente", "En curso", "Hecho"] },
    { k: "coste", t: "Coste", type: "money", w: 90 },
    { k: "notas", t: "Notas", w: 180 }
  ],
  posts: [
    { k: "fecha", t: "Fecha", type: "date", w: 140 },
    { k: "red", t: "Red", type: "select", opts: ["Instagram", "TikTok", "Facebook", "Newsletter", "Todas"] },
    { k: "tipo", t: "Formato", type: "select", opts: ["Post", "Reel", "Stories", "Carrusel", "Newsletter", "Directo"] },
    { k: "contenido", t: "Contenido", w: 200 },
    { k: "copy", t: "Copy", type: "area", w: 240 },
    { k: "hashtags", t: "Hashtags / SEO", w: 170 },
    { k: "cta", t: "CTA", w: 130 },
    { k: "estado", t: "Estado", type: "pill", opts: ["Idea", "Diseñado", "Copy listo", "Programado", "Publicado", "Analizado"] }
  ],
  pedidos: [
    { k: "nombre", t: "Nombre", w: 160 },
    { k: "dedicatoria", t: "Dedicatoria", w: 170 },
    { k: "contacto", t: "Email / teléfono", w: 170 },
    { k: "direccion", t: "Dirección, CP y ciudad", w: 210 },
    { k: "envio", t: "Envío", type: "select", opts: ["Ordinario", "Certificado", "Packlink", "En mano"] },
    { k: "pago", t: "Pago", type: "pill", opts: ["Pendiente", "Pagado", "A cuenta", "Regalo"] },
    { k: "importe", t: "Cobrado", type: "money", w: 90 },
    { k: "costeEnvio", t: "Coste envío", type: "money", w: 90 },
    { k: "_benef", t: "Beneficio", calc: (r, p) => num(r.importe) - num(p.costeEjemplar) - num(r.costeEnvio), money: true },
    { k: "seguimiento", t: "Nº seguimiento", w: 140 },
    { k: "estado", t: "Estado", type: "pill", opts: ["Pendiente", "Enviado", "Recibido", "Incidencia"] }
  ],
  costes: [
    { k: "concepto", t: "Concepto", w: 230 },
    { k: "importe", t: "Importe", type: "money", w: 110 },
    { k: "notas", t: "Notas", w: 300 }
  ],
  ventas: [
    { k: "libro", t: "Libro", w: 200 },
    { k: "concepto", t: "Concepto", type: "select", opts: CONCEPTOS_VENTA },
    { k: "uds", t: "Uds. / páginas", type: "number", w: 100 },
    { k: "importe", t: "Importe", type: "money", w: 100 },
    { k: "_tipo", t: "Tipo", calc: r => GASTOS.includes(r.concepto) ? "Gasto" : "Ingreso", pillCalc: true }
  ],
  prensa: [
    { k: "medio", t: "Medio", w: 180 },
    { k: "tipo", t: "Tipo", type: "select", opts: ["Periódico", "Radio", "Televisión", "Revista", "Blog / web", "Podcast"] },
    { k: "contacto", t: "Persona de contacto", w: 160 },
    { k: "email", t: "Email / teléfono", w: 180 },
    { k: "fecha", t: "Fecha contacto", type: "date", w: 140 },
    { k: "estado", t: "Estado", type: "pill", opts: ["Por contactar", "Nota enviada", "Respondió", "Salió en prensa", "Sin respuesta"] },
    { k: "notas", t: "Notas", w: 200 }
  ],
  colabs: [
    { k: "nombre", t: "Cuenta", w: 160 },
    { k: "red", t: "Red", type: "select", opts: ["Instagram", "TikTok", "YouTube", "Blog", "Club de lectura"] },
    { k: "seguidores", t: "Seguidores", type: "number", w: 100 },
    { k: "motivo", t: "Motivo", type: "select", opts: ["Lanzamiento", "Relanzamiento", "Ventas bajas", "Sorteo"] },
    { k: "fecha", t: "Fecha envío", type: "date", w: 140 },
    { k: "coste", t: "Coste (libro + envío)", type: "money", w: 110 },
    { k: "resultado", t: "Resultado", type: "pill", opts: ["Pendiente", "Bueno", "Satisfactorio", "Malo", "No repetir"] },
    { k: "opinion", t: "Opinión de la colaboración", type: "area", w: 220 }
  ],
  localizaciones: [
    { k: "nombre", t: "Lugar", w: 170 },
    { k: "tipo", t: "Tipo", type: "select", opts: ["Principal", "Secundaria"] },
    { k: "desc", t: "Cómo es / qué pasa aquí", type: "area", w: 320 }
  ],
  fases: [
    { k: "nombre", t: "Fase", w: 190 },
    { k: "estado", t: "Estado", type: "pill", opts: ["Pendiente", "En curso", "Hecho"] },
    { k: "quien", t: "Quién", w: 130 },
    { k: "fecha", t: "Fecha", type: "date", w: 140 },
    { k: "archivo", t: "Archivo bueno / versión", w: 260 }
  ],
  betas: [
    { k: "nombre", t: "Nombre", w: 150 },
    { k: "papel", t: "Papel", type: "select", opts: ["Lectora beta", "Lectora ARC", "Correctora", "Sensitivity reader", "Otra"] },
    { k: "enviado", t: "Enviado", type: "date", w: 140 },
    { k: "devuelto", t: "Devuelto", type: "date", w: 140 },
    { k: "caps", t: "Capítulos", w: 80 },
    { k: "notas", t: "Qué te ha dicho", type: "area", w: 240 },
    { k: "resena", t: "Reseña", type: "pill", opts: ["Sin reseña", "Reseña hecha"] }
  ],
  aplus: [
    { k: "tipo", t: "Módulo", type: "select", opts: Object.keys(MODULOS_APLUS) },
    { k: "_med", t: "Medida", calc: r => MODULOS_APLUS[r.tipo] || "" },
    { k: "titulo", t: "Titular", w: 180 },
    { k: "texto", t: "Texto del módulo", type: "area", w: 280 }
  ],
  frases: [
    { k: "frase", t: "Frase", type: "area", w: 300 },
    { k: "personaje", t: "Personaje", w: 130 },
    { k: "capitulo", t: "Capítulo", w: 80 },
    { k: "idea", t: "Idea de diseño", w: 200 },
    { k: "estado", t: "Estado", type: "pill", opts: ["Idea", "Diseñado", "Publicado"] }
  ]
};

/* ---------- Datos de ejemplo ---------- */
const TAREAS_KIT = [
  // La escritura (documentación, escaleta, escribir y releer) se lleva en Novelia Studio
  ["Edición y diseño", "Corrección 1ª vuelta tras correctora", "Libro"], ["Edición y diseño", "Corrección final", "Libro"], ["Edición y diseño", "Portada digital", "Canva"],
  ["Edición y diseño", "Portada tapa blanda Amazon", "Canva"], ["Edición y diseño", "Portada tapa dura Amazon", "Canva"], ["Edición y diseño", "Portada para imprenta", "Canva"],
  ["Edición y diseño", "Back matter papel", "Libro"], ["Edición y diseño", "Back matter digital", "Libro"], ["Edición y diseño", "Maquetación papel", "Libro"],
  ["Edición y diseño", "Maquetación digital", "Libro"], ["Edición y diseño", "Agradecimientos", "Libro"], ["Edición y diseño", "QR para reseñas", "Libro"],
  ["Edición y diseño", "Comprobar que funcionan QR y enlaces", "Libro"], ["Edición y diseño", "Diseños para papel (marcapáginas, láminas)", "Canva"],
  ["Publicación", "ISBN", "Agencia ISBN o Amazon"], ["Publicación", "Depósito legal", "Documento"], ["Publicación", "Registrar en CEDRO", "CEDRO"],
  ["Publicación", "Poner ISBN en todas las ediciones", "Libro"], ["Publicación", "Palabras clave", "Keywords Everywhere"], ["Publicación", "Categorías KDP", "KDP"],
  ["Publicación", "Contenido A+", "KDP"], ["Publicación", "Subir archivos a KDP", "KDP"],
  ["Preventa y promoción", "Cabeceras de redes sociales", "Canva"], ["Preventa y promoción", "Newsletter revelación de portada", "Systeme"],
  ["Preventa y promoción", "Formulario de preventa en papel", "Google Forms"], ["Preventa y promoción", "Newsletter preventa papel", "Systeme"],
  ["Preventa y promoción", "Automatización e-mails de preventa", "Systeme"], ["Preventa y promoción", "Automatización preventa en Instagram", "Manychat"],
  ["Preventa y promoción", "Confirmación de pagos de preventa", "E-mail"], ["Preventa y promoción", "Diseños del mes en redes", "Canva"],
  ["Preventa y promoción", "Programar publicaciones", "Metricool / Meta / TikTok"], ["Preventa y promoción", "Newsletters del mes de lanzamiento", "Systeme"],
  ["Prensa y colaboraciones", "Búsqueda de medios de prensa", "Google"], ["Prensa y colaboraciones", "Nota de prensa", "E-mail"],
  ["Prensa y colaboraciones", "Envío de la nota de prensa", "E-mail"], ["Prensa y colaboraciones", "Nota de prensa de la presentación", "E-mail"],
  ["Prensa y colaboraciones", "Contactar colaboraciones", "Redes"], ["Prensa y colaboraciones", "Envío de ejemplares a colaboraciones", "Correos"],
  ["Prensa y colaboraciones", "E-mail a librerías", "E-mail"], ["Prensa y colaboraciones", "Llevar libros a librerías", "En mano"],
  ["Envíos", "Marcapáginas a imprenta", "360imprimir"], ["Envíos", "Imprenta edición especial", "Imprenta"], ["Envíos", "Regalos para los envíos", "Tiendas online"],
  ["Envíos", "Sobres para envíos", "Tiendas online"], ["Envíos", "Etiquetas de envío", "Canva / Packlink"], ["Envíos", "Códigos de envío ordinario", "Correos"],
  ["Envíos", "Preparar sobres y paquetes", "En mano"], ["Envíos", "Enviar pedidos", "Correos"], ["Envíos", "Actualizar pedidos con nº de seguimiento", "Kit Escritoras"],
  ["Publicación", "Revisar la ficha de Amazon: precio, categorías y A+", "KDP"],
  ["Publicación", "Sinopsis para Amazon", "Libro"], ["Preventa y promoción", "Sacar frases para promos", "Libro"],
  ["Preventa y promoción", "Buscar lectoras ARC y bookstagrammers", "Redes"], ["Preventa y promoción", "Enviar los ejemplares anticipados (ARC)", "E-mail"],
  ["Preventa y promoción", "Página del libro en la web", "Web"],
  ["Después del lanzamiento", "Enlaces de compra en la web y en la bio", "Web"], ["Después del lanzamiento", "Recordar a las lectoras ARC que dejen reseña", "E-mail"],
  ["Después del lanzamiento", "Mirar ventas y ranking", "KDP"], ["Después del lanzamiento", "Balance del lanzamiento", "Kit Escritoras"]
];
const COSTES_KIT = [
  ["Impresión de libros (todos)", 456.85, "Incluye el transporte desde la imprenta o Amazon."], ["Corrección", 200, ""], ["Portada digital", 50, ""], ["Portada papel", 80, ""],
  ["Maquetación", 50, ""], ["ISBN", 45, "Bórralo si usas el ISBN gratuito de Amazon."], ["Sobres para envíos", 48.59, ""],
  ["Regalos para los paquetes", 80.15, "Post-its, papel de regalo, chuches, pins…"], ["Marcapáginas", 35.85, ""], ["Envíos ordinarios", 200, "Los certificados los suele pagar la lectora."],
  ["Ejemplares para depósito legal, sorteos y libro viajero", 87.24, ""]
];
const LEGAL_TPL = "Primera edición: ciudad, xx de xxxx de 20xx\n© 20xx, autora\nDepósito legal: XX X xxxxx-xxxx\nISBN: xxx-xx-xx-xxxxx-x\n\nDiseño de portada, contraportada y maquetación: xxx\nCorrección: xxx\n\nTodos los nombres, personajes, lugares y acontecimientos de esta novela son producto de la imaginación de la autora o son empleados como entes de ficción. Cualquier semejanza con personas vivas o fallecidas es mera coincidencia.\n\nReservados todos los derechos. Queda rigurosamente prohibida, sin la autorización escrita de los titulares del copyright, la reproducción parcial o total de esta obra por cualquier medio o procedimiento.\n\nImpreso en España – Printed in Spain";

function newProject(titulo, ejemplo) {
  const p = {
    id: uid(), titulo: titulo || "Nueva novela", genero: "", tropos: "", objetivoPalabras: 80000,
    idea: "", conflicto: "", resolucion: "", arco: "", aesthetic: "",
    escaleta: BEATS.map(b => ({ id: uid(), nombre: b, texto: "", caps: "" })),
    personajes: [], localizaciones: [], frases: [],
    ideasSinopsis: "", sinopsis: "", kwSinopsis: "", kwOpiniones: "",
    kdp: ["", "", "", "", "", "", ""], categorias: "",
    legales: LEGAL_TPL, epigrafe: "", dedicatoria: "", dedicatoriaFirma: "",
    escritura: {},
    tareas: TAREAS_KIT.map(([fase, tarea, herr]) => ({ id: uid(), fase, tarea, herr, fecha: "", importancia: "Media", estado: "Pendiente", coste: "", notas: "" })),
    pedidos: [], costes: [], unidades: 100, pvp: 18, costeEjemplar: 4.57,
    // Ficha del libro y publicación
    autora: "", subtitulo: "", serie: "", numero: "", subgenero: "", comparables: "", avisos: "", pitch: "", sinopsisCorta: "",
    portada: "", palabrasEscritas: "",
    kdpDesc: "", enlaces: { amazon: "", papel: "", otros: "" }, formatos: { ebook: {}, blanda: {}, dura: {} }, aplus: [],
    fases: FASES_PROD.map(n => ({ id: uid(), nombre: n, estado: "Pendiente", quien: "", fecha: "", archivo: "" })), betas: [],
    lanzFecha: "", preventaFecha: ""
  };
  if (!ejemplo) { p.costes = [{ id: uid(), concepto: "Impresión de libros (todos)", importe: "", notas: "" }]; return p; }
  return p;
}

function seed() {
  const p = newProject("Mi novela romántica (ejemplo)", true);
  const ym = monthOf(TODAY);
  Object.assign(p, {
    genero: "Comedia romántica", tropos: "Enemigos a amantes · romance de oficina · proximidad forzada",
    idea: "Dos rivales de la misma agencia de viajes tienen que organizar juntos la boda de su jefa en una isla.",
    conflicto: "Ella necesita el ascenso para quedarse en la ciudad; él, para poder irse.",
    resolucion: "Renuncian al ascenso para no perderse el uno al otro y montan su propia agencia.",
    arco: "Ella aprende a pedir ayuda; él deja de huir de los sitios cuando empieza a quererlos.",
    aesthetic: "Lino, sal, ferris al atardecer, libretas llenas de post-its."
  });
  p.escaleta[0].texto = "Presentamos a Lucía en su oficina y su rivalidad con Dani."; p.escaleta[0].caps = "1–3";
  p.escaleta[1].texto = "La jefa les encarga su boda… a los dos juntos."; p.escaleta[1].caps = "4";
  p.personajes = [
    { id: uid(), nombre: "Lucía", rol: "Protagonista", edad: "31", trabajo: "Organizadora de viajes", musa: "", conflicto: "Miedo a depender de nadie", aesthetic: "Gafas de pasta y agenda de colores", notas: "" },
    { id: uid(), nombre: "Dani", rol: "Interés amoroso", edad: "33", trabajo: "Guía y fotógrafo", musa: "", conflicto: "Nunca se queda en ningún sitio", aesthetic: "Mochila gastada y cámara analógica", notas: "" }
  ];
  p.localizaciones = [{ id: uid(), nombre: "La agencia", tipo: "Principal", desc: "Oficina pequeña con un mapa enorme lleno de chinchetas." }];
  p.frases = [{ id: uid(), frase: "«No te soporto. Pero tampoco soporto que te vayas».", personaje: "Lucía", capitulo: "27", idea: "Fondo de mar con tipografía manuscrita", estado: "Idea" }];
  p.kdp = ["comedia romántica", "enemigos a amantes", "romántica contemporánea", "romance de oficina", "proximidad forzada", "romántica con humor", "romántica de verano"];
  p.tareas.forEach((t, i) => { if (i < 3) t.estado = "Hecho"; if (i === 3 || i === 4) { t.estado = "En curso"; t.importancia = "Alta"; } });
  const f = p.tareas.find(t => t.tarea === "Sinopsis para Amazon"); f.fecha = ym + "-20";
  const f2 = p.tareas.find(t => t.tarea === "Corrección 1ª vuelta tras correctora"); f2.fecha = ym + "-28"; f2.importancia = "Alta";
  p.costes = COSTES_KIT.map(([concepto, importe, notas]) => ({ id: uid(), concepto, importe, notas }));
  p.pedidos = [
    { id: uid(), nombre: "Lectora de ejemplo", dedicatoria: "Para Ana, que también odia los aeropuertos", contacto: "", direccion: "", envio: "Ordinario", pago: "Pagado", importe: 18, costeEnvio: 1.8, seguimiento: "", estado: "Enviado" },
    { id: uid(), nombre: "Preventa ejemplo 2", dedicatoria: "", contacto: "", direccion: "", envio: "Certificado", pago: "Pendiente", importe: 18, costeEnvio: 0, seguimiento: "", estado: "Pendiente" },
    { id: uid(), nombre: "Depósito legal", dedicatoria: "", contacto: "", direccion: "", envio: "En mano", pago: "Regalo", importe: 0, costeEnvio: 0, seguimiento: "", estado: "Pendiente" }
  ];
  // Ficha y publicación de ejemplo
  const dD = new Date(TODAY + "T12:00:00"); dD.setDate(dD.getDate() + 60);
  Object.assign(p, {
    autora: "Tu nombre de autora", serie: "Agencia Rumbo", numero: "1", subgenero: "Comedia romántica contemporánea",
    comparables: "Emily Henry, Ali Hazelwood", pitch: "Ella necesita el ascenso para quedarse. Él, para irse. Solo uno puede ganarlo.",
    sinopsisCorta: "Lucía y Dani llevan tres años compitiendo por todo en la agencia de viajes. Ahora su jefa les encarga organizar juntos su boda en una isla… y el ascenso será para quien lo haga mejor.",
    palabrasEscritas: 64200, lanzFecha: ymd(dD)
  });
  ["Hecho", "Hecho", "En curso"].forEach((e, i) => { p.fases[i].estado = e; });
  p.fases[1].archivo = "MI NOVELA - 2ª versión.docx";
  p.betas = [{ id: uid(), nombre: "Lectora beta de ejemplo", papel: "Lectora beta", enviado: ym + "-02", devuelto: "", caps: "1-15", notas: "", resena: "Sin reseña" }];
  const posts = [
    [3, "Instagram", "Post", "Revelación de portada", "Publicado"], [6, "TikTok", "Reel", "Los tropos de la novela en 15 segundos", "Programado"],
    [10, "Instagram", "Stories", "Encuesta: ¿equipo Lucía o equipo Dani?", "Diseñado"], [14, "Instagram", "Carrusel", "5 frases del primer capítulo", "Copy listo"],
    [20, "Newsletter", "Newsletter", "Abrimos la preventa en papel", "Idea"], [24, "Todas", "Post", "Presentación y reseña", "Idea"]
  ].map(([d, red, tipo, contenido, estado]) => ({ id: uid(), fecha: ym + "-" + pad(d), red, tipo, contenido, copy: "", hashtags: "#romántica #novelaromántica", cta: "", estado }));
  const ventas = [];
  [-2, -1, 0].forEach((off, i) => {
    const m = addMonth(ym, off);
    ventas.push({ id: uid(), mes: m, libro: "Mi novela romántica (ejemplo)", concepto: "Digital", uds: 6 + i * 3, importe: 17.5 + i * 9.3 });
    ventas.push({ id: uid(), mes: m, libro: "Mi novela romántica (ejemplo)", concepto: "KENP (páginas leídas)", uds: 2400 + i * 1100, importe: 9.9 + i * 4.6 });
    ventas.push({ id: uid(), mes: m, libro: "Mi novela romántica (ejemplo)", concepto: "Tapa blanda", uds: 2 + i, importe: 6.6 + i * 3.3 });
    ventas.push({ id: uid(), mes: m, libro: "Mi novela romántica (ejemplo)", concepto: "Amazon Ads", uds: "", importe: 12 + i * 3 });
  });
  return {
    v: 1, activo: p.id, proyectos: [p], posts, ventas,
    prensa: [
      { id: uid(), medio: "Periódico local (ejemplo)", tipo: "Periódico", contacto: "Redacción de cultura", email: "", fecha: "", estado: "Por contactar", notas: "Mandar la nota la semana antes de la presentación" },
      { id: uid(), medio: "Radio comarcal (ejemplo)", tipo: "Radio", contacto: "", email: "", fecha: "", estado: "Por contactar", notas: "" }
    ],
    colabs: [
      { id: uid(), nombre: "@cuentalectora (ejemplo)", red: "Instagram", seguidores: 12500, motivo: "Lanzamiento", fecha: "", coste: 16.4, resultado: "Pendiente", opinion: "" }
    ]
  };
}

/* ---------- Estado y guardado ---------- */
const LS_KEY = "kitEscritoras.v1";
let S = null;
let dbRef = null;
let saveTimer = null;
const view = { mes: monthOf(TODAY), route: "inicio", fase: "Todas", fTareas: "todas" };

function loadLocal() { try { const raw = localStorage.getItem(LS_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } }
let avisoSinEspacio = false;
function saveLocal() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(S)); return true; }
  catch (e) {
    if (!avisoSinEspacio && typeof toast === "function") {
      avisoSinEspacio = true;
      toast("No se ha podido guardar: el navegador no tiene espacio o está en modo privado. Haz una copia de seguridad.");
    }
    return false;
  }
}
function setSave(cls, txt) { const el = $("#saveState"); el.className = "save " + cls; el.textContent = txt; }

function save() {
  clearTimeout(saveTimer);
  setSave("", "Guardando…");
  saveTimer = setTimeout(async () => {
    const okLocal = saveLocal();
    if (dbRef) {
      try { await dbRef.set({ data: JSON.stringify(S), updated: new Date().toISOString() }); setSave("ok", "Guardado en tu cuenta"); }
      catch (e) { setSave("local", okLocal ? "Guardado solo en este navegador" : "No se ha podido guardar"); }
    } else {
      setSave("local", okLocal ? "Guardado en este navegador" : "No se ha podido guardar");
    }
  }, 600);
}

function normalize(st) {
  if (!st || !Array.isArray(st.proyectos) || !st.proyectos.length) return seed();
  ["posts", "ventas", "prensa", "colabs", "catalogo", "kdpVentas", "ingresos", "gastosNeg", "directa", "redesMes", "derechos", "resenas", "eventos", "objetivos", "historico"].forEach(k => { if (!Array.isArray(st[k])) st[k] = []; });
  st.proyectos.forEach(p => {
    const base = newProject(p.titulo);
    Object.keys(base).forEach(k => { if (p[k] === undefined || p[k] === null) p[k] = base[k]; });
    ["escaleta", "personajes", "localizaciones", "frases", "tareas", "pedidos", "costes", "fases", "betas", "aplus"].forEach(k => { if (!Array.isArray(p[k])) p[k] = base[k]; });
    if (!p.escritura || typeof p.escritura !== "object" || Array.isArray(p.escritura)) p.escritura = {};
    ["enlaces", "formatos"].forEach(k => { if (!p[k] || typeof p[k] !== "object" || Array.isArray(p[k])) p[k] = base[k]; });
    ["ebook", "blanda", "dura"].forEach(k => { if (!p.formatos[k] || typeof p.formatos[k] !== "object") p.formatos[k] = {}; });
    if (!Array.isArray(p.kdp)) p.kdp = [];
    while (p.kdp.length < 7) p.kdp.push("");
  });
  if (!st.proyectos.some(p => p.id === st.activo)) st.activo = st.proyectos[0].id;
  return st;
}

async function connectDb() {
  let timer;
  const fallback = () => { if (!dbRef) setSave("local", "Guardado en este navegador"); };
  try {
    if (!window.claude || typeof window.claude.use !== "function") { fallback(); return; }
    timer = setTimeout(fallback, 10000);
    const [db, user] = await Promise.all([window.claude.use("db"), window.claude.use("user")]);
    if (!db || !user) { clearTimeout(timer); fallback(); return; }
    const id = await user.id();
    if (!id) { clearTimeout(timer); fallback(); return; }
    const ref = db.collection("data/users/" + id).doc("kit");
    const snap = await ref.get();
    clearTimeout(timer);
    let data = null;
    if (snap) {
      const d = typeof snap.data === "function" ? snap.data() : snap;
      const exists = typeof snap.exists === "function" ? snap.exists() : (snap.exists !== undefined ? snap.exists : !!(d && d.data));
      if (exists && d && d.data) { try { data = JSON.parse(d.data); } catch (e) { data = null; } }
    }
    dbRef = ref;
    if (data) { S = normalize(data); saveLocal(); render(); setSave("ok", "Guardado en tu cuenta"); }
    else { save(); }
  } catch (e) {
    clearTimeout(timer);
    fallback();
  }
}

const P = () => S.proyectos.find(p => p.id === S.activo) || S.proyectos[0];

/* ---------- Avisos y modal ---------- */
let undoFn = null, toastTimer = null;
function toast(msg, undo) {
  undoFn = undo || null;
  $("#toastMsg").textContent = msg;
  $("#toastUndo").style.display = undo ? "" : "none";
  $("#toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 5000);
}
$("#toastUndo").addEventListener("click", () => { if (undoFn) { undoFn(); undoFn = null; save(); render(); } $("#toast").classList.remove("show"); });

function openModal(html, wire) {
  $("#modalBox").innerHTML = html;
  $("#modal").classList.add("open");
  const first = $("#modalBox input, #modalBox textarea, #modalBox button");
  if (first) first.focus();
  $$("[data-close]", $("#modalBox")).forEach(b => b.addEventListener("click", closeModal));
  if (wire) wire($("#modalBox"));
}
function closeModal() { $("#modal").classList.remove("open"); }
$("#modal").addEventListener("click", e => { if (e.target.id === "modal") closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

/* ---------- Componentes ---------- */
function bindAttrs(scope, list, id, k) { return `data-s="${scope}" data-l="${list}" data-id="${id}" data-k="${k}"`; }

function cellHTML(c, r, scope, list, p) {
  if (c.calc) {
    const v = c.calc(r, p);
    if (c.pillCalc) return `<td><span class="chip ${tone(v)}" data-calc="${c.k}">${esc(v)}</span></td>`;
    return `<td class="calc ${c.money && v < 0 ? "neg" : ""}" data-calc="${c.k}">${c.money ? eur(v) : esc(v)}</td>`;
  }
  const a = bindAttrs(scope, list, r.id, c.k);
  const v = r[c.k] == null ? "" : r[c.k];
  const st = c.w ? ` style="min-width:${c.w}px"` : "";
  const lab = ` aria-label="${esc(c.t)}"`;
  switch (c.type) {
    case "pill":
    case "select": {
      const opts = c.opts.map(o => `<option${o === v ? " selected" : ""}>${esc(o)}</option>`).join("");
      return `<td><select ${a}${lab} class="${c.type === "pill" ? "pill " + tone(v) : ""}">${!c.opts.includes(v) && v ? `<option selected>${esc(v)}</option>` : ""}${opts}</select></td>`;
    }
    case "date": return `<td${st}><input type="date" ${a}${lab} value="${esc(v)}"></td>`;
    case "month": return `<td${st}><input type="month" ${a}${lab} value="${esc(v)}" placeholder="aaaa-mm"></td>`;
    case "money": return `<td${st}><input type="number" step="0.01" inputmode="decimal" ${a}${lab} value="${esc(v)}" placeholder="0,00"></td>`;
    case "number": return `<td${st}><input type="number" inputmode="numeric" ${a}${lab} value="${esc(v)}"></td>`;
    case "area": return `<td${st}><textarea rows="1" ${a}${lab}>${esc(v)}</textarea></td>`;
    default: return `<td${st}><input type="text" ${a}${lab} value="${esc(v)}"></td>`;
  }
}

function tableHTML(list, scope, rows, opts = {}) {
  const cols = COLS[opts.cols || list];
  const p = P();
  const head = cols.map(c => `<th>${esc(c.t)}</th>`).join("") + "<th></th>";
  const body = rows.length ? rows.map(r => `<tr data-row="${r.id}">${cols.map(c => cellHTML(c, r, scope, list, p)).join("")}<td><button class="del" type="button" title="Eliminar fila" aria-label="Eliminar fila" data-del="${r.id}" data-s="${scope}" data-l="${list}">×</button></td></tr>`).join("")
    : `<tr><td colspan="${cols.length + 1}" class="empty">${esc(opts.empty || "Todavía no hay nada aquí.")}</td></tr>`;
  const foot = opts.foot ? `<tfoot><tr>${opts.foot}</tr></tfoot>` : "";
  const add = opts.noAdd ? "" : `<div><button class="btn ghost sm" type="button" data-add="${list}" data-s="${scope}"${opts.preset ? ` data-preset='${esc(JSON.stringify(opts.preset))}'` : ""}>+ ${esc(opts.addLabel || "Añadir fila")}</button></div>`;
  return `<div class="tblwrap"><table class="tbl"><thead><tr>${head}</tr></thead><tbody>${body}</tbody>${foot}</table></div>${add}`;
}

function field(label, attrs, value, type = "text", extra = "") {
  if (type === "area") return `<label class="field"><span>${label}${extra}</span><textarea ${attrs}>${esc(value)}</textarea></label>`;
  return `<label class="field"><span>${label}${extra}</span><input type="${type}" ${attrs} value="${esc(value)}"></label>`;
}
const pf = k => `data-s="p" data-k="${k}"`;

function tile(t, v, d, cls = "") { return `<div class="tile ${cls}"><div class="t">${t}</div><div class="v">${v}</div>${d ? `<div class="d">${d}</div>` : ""}</div>`; }
function bar(pct, cls = "") { return `<div class="bar ${cls}"><i style="width:${Math.max(0, Math.min(100, pct))}%"></i></div>`; }

/* ---------- Cálculos ---------- */
// Palabras del manuscrito: las apuntadas (o traídas de Novelia); si no hay, las del calendario antiguo
function palabras(p) {
  if (num(p.palabrasEscritas) > 0) return num(p.palabrasEscritas);
  let t = 0; Object.values(p.escritura || {}).forEach(e => t += num(e && e.real)); return t;
}
function diasA(fecha) { if (!fecha) return null; return Math.round((new Date(fecha + "T12:00:00") - new Date(TODAY + "T12:00:00")) / 86400000); }
function sumarDias(fecha, n) { const d = new Date(fecha + "T12:00:00"); d.setDate(d.getDate() + n); return ymd(d); }
function costesStats(p) {
  const total = p.costes.reduce((s, r) => s + num(r.importe), 0);
  const uds = num(p.unidades) || 0;
  const porLibro = uds ? total / uds : 0;
  const pvp = num(p.pvp);
  return { total, porLibro, margen: pvp - porLibro, equilibrio: pvp > 0 ? Math.ceil(total / pvp) : 0 };
}
function ventasMes(ym) {
  let ing = 0, gas = 0, uds = 0, kenp = 0;
  S.ventas.filter(v => v.mes === ym).forEach(v => {
    if (GASTOS.includes(v.concepto)) gas += num(v.importe);
    else { ing += num(v.importe); if (v.concepto.startsWith("KENP")) kenp += num(v.uds); else uds += num(v.uds); }
  });
  if (Array.isArray(S.kdpVentas) && S.kdpVentas.length) { const k = kdpMes(ym); ing += k.total; uds += k.uds; kenp += k.kenp; }
  return { ing, gas, neto: ing - gas, uds, kenp };
}
function pedidosStats(p) {
  const r = { n: p.pedidos.length, cobrado: 0, porCobrar: 0, porEnviar: 0, benef: 0 };
  p.pedidos.forEach(o => {
    if (o.pago === "Pagado" || o.pago === "A cuenta") r.cobrado += num(o.importe);
    if (o.pago === "Pendiente") r.porCobrar += num(o.importe) || num(p.pvp);
    if (o.estado === "Pendiente") r.porEnviar++;
    r.benef += num(o.importe) - num(p.costeEjemplar) - num(o.costeEnvio);
  });
  return r;
}

/* ---------- Vistas ---------- */
const ROUTES = [
  ["inicio", "Inicio"], ["libro", "Libro"], ["kdp", "Amazon KDP"], ["produccion", "Producción"], ["lanzamiento", "Lanzamiento"],
  ["redes", "Redes y citas"], ["pedidos", "Pedidos"], ["cuentas", "Cuentas"], ["catalogo", "Catálogo"], ["prensa", "Prensa y colabs"], ["web", "Web"], ["ajustes", "Ajustes"]
];
// Direcciones de versiones anteriores
// Negocio se lleva en la app Centro de Control (decidido el 11 nov 2026); el código sigue aquí por si se recupera
const ALIAS = { novela: "libro", escritura: "inicio", negocio: "catalogo" };
const MONTHLY = ["inicio", "redes", "cuentas", "lanzamiento", "catalogo", "negocio"];

const NAV_ICONOS = {"inicio": "<path d=\"M3 10.5 12 3l9 7.5\"/><path d=\"M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5\"/>", "libro": "<path d=\"M4 19.5V5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5 1.5 1.5 0 0 0 5.5 22H20v-4\"/><path d=\"M8 7h8\"/>", "kdp": "<path d=\"M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z\"/><path d=\"M3 7.5 12 12l9-4.5M12 12v9\"/>", "produccion": "<path d=\"M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z\"/>", "lanzamiento": "<path d=\"M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2\"/><path d=\"M14 4c3-1.5 6-1 6-1s.5 3-1 6l-6 6-5-5z\"/><path d=\"M9 10H5l3-3h4M14 15v4l3-3v-4\"/><circle cx=\"15.5\" cy=\"8.5\" r=\"1.3\"/>", "redes": "<rect x=\"6\" y=\"2.5\" width=\"12\" height=\"19\" rx=\"2.5\"/><path d=\"M10.5 18.5h3\"/><path d=\"m10 9 4.5 2.5L10 14z\"/>", "pedidos": "<path d=\"M4 7h16l-1.6 11.2A2 2 0 0 1 16.4 20H7.6a2 2 0 0 1-2-1.8z\"/><path d=\"M9 7V5a3 3 0 0 1 6 0v2\"/>", "cuentas": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M15.5 8.5a4 4 0 1 0 0 7M7 11h6M7 13.5h6\"/>", "catalogo": "<rect x=\"3.5\" y=\"4\" width=\"4\" height=\"16\" rx=\"1\"/><rect x=\"9.5\" y=\"4\" width=\"4\" height=\"16\" rx=\"1\"/><path d=\"m15.5 5.2 3.6-1 3.4 14.6-3.6 1z\"/>", "negocio": "<path d=\"M3 20h18M6 16v-4M10.5 16V8M15 16v-6M19.5 16V5\"/>", "prensa": "<path d=\"M3 10v4h3l7 4V6L6 10z\"/><path d=\"M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11\"/>", "web": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M3 12h18M12 3c2.5 2.5 3.7 5.5 3.7 9s-1.2 6.5-3.7 9c-2.5-2.5-3.7-5.5-3.7-9S9.5 5.5 12 3z\"/>", "ajustes": "<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z\"/>"};
function renderNav() {
  $("#nav").innerHTML = ROUTES.map(([k, t]) => `<a href="#${k}" ${k === "ajustes" ? 'class="abajo" ' : ""}${view.route === k ? 'aria-current="page"' : ""}><svg viewBox="0 0 24 24" aria-hidden="true">${NAV_ICONOS[k] || ""}</svg><span>${t}</span></a>`).join("");
  if (window.innerWidth <= 820) { const nav = $("#nav"), cur = $("#nav [aria-current]"); if (cur) requestAnimationFrame(() => { nav.scrollLeft = cur.offsetLeft - (nav.clientWidth - cur.offsetWidth) / 2; }); }
  $("#projSel").innerHTML = S.proyectos.map(p => `<option value="${p.id}"${p.id === S.activo ? " selected" : ""}>${esc(p.titulo || "Sin título")}</option>`).join("");
  $("#mLbl").textContent = mesLabel(view.mes);
  $("#monthNav").style.visibility = MONTHLY.includes(view.route) ? "visible" : "hidden";
}

function render() {
  if (!S) return;
  renderNav();
  const fn = { inicio: vInicio, libro: vLibro, kdp: vKdp, produccion: vProduccion, lanzamiento: vLanzamiento, redes: vRedes, pedidos: vPedidos, cuentas: vCuentas, catalogo: vCatalogo, negocio: vNegocio, prensa: vPrensa, web: vWeb, ajustes: vAjustes }[view.route] || vInicio;
  const y = window.scrollY;
  try {
    $("#view").innerHTML = fn();
    window.scrollTo(0, y);
    afterRender();
  } catch (e) {
    console.error(e);
    $("#view").innerHTML = `<div class="card"><h2>Esta sección no se ha podido mostrar</h2>
      <p>Tus datos siguen guardados. Prueba a ir a otra sección y volver. Si el problema sigue, haz una copia de seguridad (abajo a la izquierda) y escribe a la autora del kit con el texto de la copia.</p></div>`;
  }
}

function afterRender() {
  if (view.route === "cuentas") drawChart();
  if (view.route === "kdp") pintarDesc();
  if (view.route === "redes") pintarTarjeta();
  $$("#view textarea").forEach(autosize);
}
function autosize(t) { if (!t.closest(".tbl")) return; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight + 2, 220) + "px"; }

/* Campos con ruta (formatos.ebook.precio) y contadores de caracteres */
const getPath = (o, path) => { for (const k of path.split(".")) { if (o == null) return ""; o = o[k]; } return o == null ? "" : o; };
const pp = path => `data-s="p" data-path="${path}"`;
const cnt = (k, v, max) => `<em class="count${String(v || "").length > max ? " over" : ""}" data-countfor="${k}">${String(v || "").length}/${max}</em>`;
const fieldMax = (label, k, v, max, type = "area") => field(label, `${pf(k)} data-max="${max}"`, v, type, cnt(k, v, max));

/* ---------- Perfil, ajustes y calendario de Mi mes ---------- */
const ACENTOS = [["#a5595d", "Rosa"], ["#7a1f3d", "Vino"], ["#b5536b", "Frambuesa"], ["#6b4f8a", "Lavanda"], ["#3d6a8a", "Azul"], ["#2f5d50", "Verde"], ["#c27c4e", "Teja"], ["#3a2a2c", "Tinta"]];
const CAL_TIPOS = [["tareas", "Tareas del checklist"], ["redes", "Publicaciones de redes"], ["lanz", "Lanzamiento y preventa"], ["prod", "Fases de producción"], ["formatos", "Fechas de Amazon (ebook, papel)"], ["betas", "Lectoras beta (envío y devolución)"]];
function perfil() {
  if (!S.perfil || typeof S.perfil !== "object") S.perfil = {};
  const pr = S.perfil;
  ["nombre", "usuario", "genero", "foto", "bio"].forEach(k => { if (pr[k] == null) pr[k] = ""; });
  if (!pr.enlaces || typeof pr.enlaces !== "object") pr.enlaces = {};
  ["instagram", "tiktok", "amazon", "web"].forEach(k => { if (pr.enlaces[k] == null) pr.enlaces[k] = ""; });
  if (!Array.isArray(pr.otros)) pr.otros = [];
  return pr;
}
function ajustes() {
  if (!S.ajustes || typeof S.ajustes !== "object") S.ajustes = {};
  const a = S.ajustes;
  if (!a.acento) a.acento = "#a5595d";
  if (!a.cal || typeof a.cal !== "object") a.cal = {};
  CAL_TIPOS.forEach(([k]) => { if (typeof a.cal[k] !== "boolean") a.cal[k] = true; });
  if (!a.calTam) a.calTam = "grande";
  if (a.copiaDias === undefined || a.copiaDias === "") a.copiaDias = 7;
  return a;
}
function aplicarAcento() {
  const c = ajustes().acento || "#a5595d";
  const r = document.documentElement.style;
  r.setProperty("--rosa", c);
  r.setProperty("--rosa-2", `color-mix(in srgb, ${c} 75%, #ffffff)`);
  r.setProperty("--empolvado", `color-mix(in srgb, ${c} 45%, #ffffff)`);
  r.setProperty("--nube", `color-mix(in srgb, ${c} 12%, #ffffff)`);
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute("content", c);
}
const inicial = s => (String(s || "").trim()[0] || "✎").toUpperCase();
function enlaceRed(k, v) {
  v = String(v || "").trim(); if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  const h = v.replace(/^@/, "");
  if (k === "instagram") return "https://www.instagram.com/" + h;
  if (k === "tiktok") return "https://www.tiktok.com/@" + h;
  return "https://" + v.replace(/^\/+/, "");
}
function saludo() { const h = new Date().getHours(); return h < 6 ? "Buenas noches" : h < 14 ? "Buenos días" : h < 21 ? "Buenas tardes" : "Buenas noches"; }
function tarjetaPerfil() {
  const pr = perfil();
  const nom = pr.nombre.trim();
  const links = [...[["instagram", "Instagram"], ["tiktok", "TikTok"], ["amazon", "Amazon"], ["web", "Web"]].filter(([k]) => String(pr.enlaces[k] || "").trim())
    .map(([k, t]) => [t, enlaceRed(k, pr.enlaces[k])]), ...pr.otros.filter(o => o && String(o.u || "").trim()).map(o => [o.t || "Enlace", enlaceRed("", o.u)])]
    .map(([t, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a>`).join("");
  return `<p class="saludo">${saludo()}${nom ? ", " + esc(nom.split(/\s+/)[0]) : ""}</p>
  <div class="card perfil-card">
    <div class="avatar">${pr.foto ? `<img src="${pr.foto}" alt="">` : esc(inicial(nom))}</div>
    <div class="perfil-txt">
      <div class="perfil-nom">${esc(nom || "Tu nombre de autora")}</div>
      <div class="perfil-sub">${[pr.usuario ? esc(pr.usuario.startsWith("@") ? pr.usuario : "@" + pr.usuario) : "", esc(pr.genero)].filter(Boolean).join(" · ") || "Pon tu nombre, tu foto y tus redes en Ajustes"}</div>
      ${links ? `<div class="perfil-links">${links}</div>` : ""}
    </div>
    <a class="btn ghost" href="#ajustes">Editar perfil</a>
  </div>`;
}

/* Calendario del mes: todo lo que tiene fecha */
function cosasDelMes(ym) {
  const p = P(), a = ajustes().cal, out = {};
  const add = (f, x) => { if (f && monthOf(f) === ym) (out[f] = out[f] || []).push(x); };
  if (a.lanz) {
    if (p.lanzFecha) add(p.lanzFecha, { tipo: "lanz", txt: "🚀 Lanzamiento", ir: "lanzamiento" });
    if (p.preventaFecha) add(p.preventaFecha, { tipo: "lanz", txt: "🛒 Abre la preventa", ir: "lanzamiento" });
  }
  if (a.tareas) p.tareas.filter(t => t.fecha).forEach(t => add(t.fecha, { tipo: "tarea", txt: t.tarea, hecho: t.estado === "Hecho", id: t.id, fase: t.fase, ir: "lanzamiento" }));
  if (a.redes) S.posts.filter(x => x.fecha).forEach(x => add(x.fecha, { tipo: "redes", txt: `${x.tipo}: ${x.contenido || "sin título"}`, hecho: ["Publicado", "Analizado"].includes(x.estado), estado: x.estado, ir: "redes" }));
  if (a.prod) p.fases.filter(f => f.fecha).forEach(f => add(f.fecha, { tipo: "prod", txt: f.nombre, hecho: f.estado === "Hecho", ir: "produccion" }));
  if (a.formatos) [["ebook", "Ebook"], ["blanda", "Tapa blanda"], ["dura", "Tapa dura"]].forEach(([k, n]) => { const f = p.formatos[k] || {}; if (f.fecha) add(f.fecha, { tipo: "kdp", txt: `${n}${f.estado ? " · " + f.estado : ""}`, ir: "kdp" }); });
  if (a.betas) p.betas.forEach(b => {
    if (b.enviado) add(b.enviado, { tipo: "beta", txt: `Enviado a ${b.nombre || b.papel}`, ir: "produccion" });
    if (b.devuelto) add(b.devuelto, { tipo: "beta", txt: `Devuelto por ${b.nombre || b.papel}`, hecho: true, ir: "produccion" });
  });
  const ord = { lanz: 0, tarea: 1, prod: 2, kdp: 3, beta: 4, redes: 5 };
  Object.values(out).forEach(l => l.sort((x, y) => (x.hecho ? 1 : 0) - (y.hecho ? 1 : 0) || ord[x.tipo] - ord[y.tipo]));
  return out;
}
const ETIQ_CAL = { lanz: "Lanzamiento", tarea: "Tarea", redes: "Redes", prod: "Producción", kdp: "Amazon", beta: "Lectoras" };
function tarjetaCalendario(ym) {
  const C = cosasDelMes(ym), a = ajustes();
  const grande = a.calTam !== "pequeño";
  const days = monthDays(ym);
  if (!view.diaSel || monthOf(view.diaSel) !== ym) view.diaSel = monthOf(TODAY) === ym ? TODAY : "";
  let cells = DIAS.map(d => `<div class="dn">${d}</div>`).join("");
  for (let i = 0; i < dow(days[0]); i++) cells += `<div class="day blank" aria-hidden="true"></div>`;
  days.forEach(d => {
    const l = C[d] || [];
    const tarde = d < TODAY && l.some(x => x.tipo === "tarea" && !x.hecho);
    const cont = grande
      ? `<div class="chips">${l.slice(0, 3).map(x => `<span class="ev ev-${x.tipo}${x.hecho ? " hecho" : ""}" title="${esc(ETIQ_CAL[x.tipo] + ": " + x.txt)}">${esc(x.txt)}</span>`).join("")}${l.length > 3 ? `<span class="mas">+${l.length - 3} más</span>` : ""}</div>`
      : `<div class="puntos">${l.slice(0, 6).map(x => `<i class="ev-${x.tipo}${x.hecho ? " hecho" : ""}"></i>`).join("")}</div>`;
    cells += `<button type="button" class="day dia-cal${d === TODAY ? " today" : ""}${d === view.diaSel ? " sel" : ""}${tarde ? " tarde" : ""}" data-dia="${d}" aria-label="${dayLabel(d)}: ${l.length} cosas">
      <span class="num">${Number(d.slice(8))}</span>${cont}</button>`;
  });
  const sel = view.diaSel ? (C[view.diaSel] || []) : [];
  const leyenda = CAL_TIPOS.filter(([k]) => a.cal[k]).map(([k]) => ({ tareas: "tarea", redes: "redes", lanz: "lanz", prod: "prod", formatos: "kdp", betas: "beta" })[k])
    .map(t => `<span class="ley"><i class="ev-${t}"></i>${ETIQ_CAL[t]}</span>`).join("");
  return `<div class="card"><div class="ch"><h3>Calendario</h3>
      <div class="filters" style="margin:0"><button type="button" data-caltam="grande" aria-pressed="${grande}">Grande</button><button type="button" data-caltam="pequeño" aria-pressed="${!grande}">Pequeño</button></div></div>
    <div class="leyenda">${leyenda}</div>
    <div class="cal calmes${grande ? "" : " peq"}">${cells}</div>
    ${view.diaSel ? `<div class="dia-lista"><h3>${(t => t[0].toUpperCase() + t.slice(1))(new Date(view.diaSel + "T12:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }))}</h3>
      ${sel.length ? `<div class="list">${sel.map(x => `<div class="li">${x.tipo === "tarea" ? `<input type="checkbox" data-done="${x.id}"${x.hecho ? " checked disabled" : ""} aria-label="Marcar como hecha">` : `<i class="punto ev-${x.tipo}"></i>`}
        <div class="grow"><div${x.hecho ? ' style="text-decoration:line-through;color:var(--gris)"' : ""}>${esc(x.txt)}</div><div class="meta">${ETIQ_CAL[x.tipo]}${x.fase ? " · " + esc(x.fase) : ""}${x.estado ? " · " + esc(x.estado) : ""}</div></div>
        <a class="hint" href="#${x.ir}">Abrir</a></div>`).join("")}</div>` : `<div class="empty">Nada este día.</div>`}</div>` : ""}
  </div>`;
}

/* Ajustes */
function vAjustes() {
  const pr = perfil(), a = ajustes();
  const gp = path => `data-s="g" data-path="${path}"`;
  return `
  <div class="head"><div><div class="eyebrow">Ajustes</div><h1>Tu kit, a tu manera</h1><p>Tu perfil, el color de la app, qué sale en el calendario y tus datos.</p></div></div>
  <div class="card"><h3>Tu perfil</h3>
    <div class="perfil-edit">
      <div class="portada-card" style="align-items:center">
        <div class="avatar grande">${pr.foto ? `<img src="${pr.foto}" alt="">` : esc(inicial(pr.nombre))}</div>
        <label class="btn ghost sm">${pr.foto ? "Cambiar foto" : "Subir foto"}<input type="file" id="fFoto" accept="image/*" style="display:none"></label>
        ${pr.foto ? `<button class="linkbtn" type="button" id="quitarFoto">Quitar foto</button>` : ""}
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;flex:1;min-width:0">
        <div class="fgrid">${field("Nombre de autora", gp("perfil.nombre"), pr.nombre)}${field("Usuario", gp("perfil.usuario"), pr.usuario)}${field("Género", gp("perfil.genero"), pr.genero)}</div>
        <div class="fgrid">${field("Instagram (usuario o enlace)", gp("perfil.enlaces.instagram"), pr.enlaces.instagram)}${field("TikTok (usuario o enlace)", gp("perfil.enlaces.tiktok"), pr.enlaces.tiktok)}${field("Tu perfil de autora en Amazon", gp("perfil.enlaces.amazon"), pr.enlaces.amazon)}${field("Web", gp("perfil.enlaces.web"), pr.enlaces.web)}</div>
        <div><span class="hint">Más enlaces (newsletter, Goodreads, tu tienda…)</span>
          ${pr.otros.map((o, i) => `<div class="fgrid" style="grid-template-columns:1fr 2fr auto;align-items:end;margin-top:6px">${field("Nombre", gp("perfil.otros." + i + ".t"), o.t)}${field("Enlace", gp("perfil.otros." + i + ".u"), o.u)}<button class="del" type="button" data-pfdel="${i}" aria-label="Quitar enlace">×</button></div>`).join("")}
          <button class="btn ghost sm" type="button" id="pfAddLink" style="margin-top:8px">+ Añadir enlace</button></div>
        <p class="hint" style="margin:0">Tu nombre sale en el saludo de Inicio. Si en la ficha de un libro no pones autora, se usa este.</p>
      </div>
    </div></div>
  <div class="card"><h3>Color de la app</h3>
    <div class="acentos">${ACENTOS.map(([c, n]) => `<button type="button" data-acento="${c}" title="${n}" aria-label="${n}" aria-pressed="${a.acento === c}" style="background:${c}"></button>`).join("")}
      <label class="otro">Otro <input type="color" id="acentoLibre" value="${esc(a.acento)}"></label></div></div>
  <div class="card"><h3>Calendario de Inicio</h3>
    <div class="checks">${CAL_TIPOS.map(([k, t]) => `<label class="chk" style="margin:0"><input type="checkbox" ${gp("ajustes.cal." + k)}${a.cal[k] ? " checked" : ""}> ${t}</label>`).join("")}</div>
    <div class="filters">Tamaño: <button type="button" data-caltam="grande" aria-pressed="${a.calTam !== "pequeño"}">Grande, con el texto</button><button type="button" data-caltam="pequeño" aria-pressed="${a.calTam === "pequeño"}">Pequeño, con puntos</button></div></div>
  <div class="card"><h3>Tus datos</h3>
    <p class="hint" style="margin:0">Todo se guarda en este navegador. ${ksConectado() ? `Con Google Drive conectado, las copias de seguridad van a tu Drive, a la carpeta «${CopiaDrive.CARPETA}». Me quedo con las dos últimas y borro las anteriores.${CopiaDrive.faltaPermiso("Kit Escritoras · Copia") ? ` <b style="color:var(--mal)">Falta tu permiso: desconecta y vuelve a conectar Google Drive.</b>` : ""}` : "Las copias de seguridad van a tu carpeta de Descargas; si conectas Google Drive, irán a tu Drive."}</p>
    <label class="field" style="max-width:260px"><span>Copia automática</span><select data-s="g" data-path="ajustes.copiaDias">${[[0, "Nunca"], [1, "Cada día"], [3, "Cada 3 días"], [7, "Cada semana"], [15, "Cada 15 días"], [30, "Cada mes"]].map(([v, t]) => `<option value="${v}"${+a.copiaDias === v ? " selected" : ""}>${t}</option>`).join("")}</select></label>
    <div class="filters"><button type="button" id="ajCopia">Copia de seguridad</button><button type="button" id="ajNovelia">Traer de Novelia Studio</button><button type="button" id="ajCentro">Traer del Centro de control</button><button type="button" id="ajReset">Empezar en blanco</button></div></div>`;
}
function leerFoto(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file); const im = new Image();
    im.onload = () => {
      const L = 320, k = Math.max(L / im.width, L / im.height);
      const c = document.createElement("canvas"); c.width = L; c.height = L;
      c.getContext("2d").drawImage(im, (L - im.width * k) / 2, (L - im.height * k) / 2, im.width * k, im.height * k);
      URL.revokeObjectURL(url); res(c.toDataURL("image/jpeg", .85));
    };
    im.onerror = () => { URL.revokeObjectURL(url); rej(new Error("imagen")); };
    im.src = url;
  });
}

/* 1. Mi mes */
function vInicio() {
  const p = P(), ym = view.mes;
  const hechas = p.tareas.filter(t => t.estado === "Hecho").length;
  const pctT = p.tareas.length ? Math.round(hechas / p.tareas.length * 100) : 0;
  const fh = p.fases.filter(f => f.estado === "Hecho").length;
  const vm = ventasMes(ym);
  const ps = pedidosStats(p);
  const postsMes = S.posts.filter(x => monthOf(x.fecha) === ym).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const pubs = postsMes.filter(x => ["Publicado", "Analizado"].includes(x.estado)).length;
  const prio = { Alta: 0, Media: 1, Baja: 2 };
  const prox = p.tareas.filter(t => t.estado !== "Hecho").sort((a, b) => {
    const fa = a.fecha || "9999", fb = b.fecha || "9999";
    if (fa !== fb) return fa.localeCompare(fb);
    if (a.estado !== b.estado) return a.estado === "En curso" ? -1 : 1;
    return (prio[a.importancia] ?? 1) - (prio[b.importancia] ?? 1);
  }).slice(0, 7);
  const pal = palabras(p);
  const totalPct = num(p.objetivoPalabras) ? Math.round(pal / num(p.objetivoPalabras) * 100) : 0;
  const nextPosts = postsMes.filter(x => x.fecha >= (monthOf(TODAY) === ym ? TODAY : ym + "-01")).slice(0, 5);
  const faltan = diasA(p.lanzFecha);
  const lz = faltan === null ? tile("Lanzamiento", "Sin fecha", `<a href="#lanzamiento">Pon el día D</a>`, "")
    : faltan > 0 ? tile("Faltan", faltan + (faltan === 1 ? " día" : " días"), "para el lanzamiento · " + dayLabel(p.lanzFecha), faltan <= 14 ? "warn" : "lav")
    : faltan === 0 ? tile("Lanzamiento", "¡Hoy!", "es el día D", "ok") : tile("Lanzado", dayLabel(p.lanzFecha), "hace " + (-faltan) + " días", "ok");

  return `
  <div class="apps-barra"></div>
  ${tarjetaPerfil()}
  <div class="head"><div><div class="eyebrow">${esc(p.titulo)}</div><h1 style="text-transform:capitalize">${mesLabel(ym)}</h1>
    <p>Cómo va tu libro: producción, lanzamiento, redes y ventas. Cambia de mes con las flechas de arriba.</p></div></div>
  <div class="tiles">
    ${lz}
    ${tile("Checklist", pctT + "%", `${hechas} de ${p.tareas.length} tareas hechas`, "lav")}
    ${tile("Producción", `${fh} / ${p.fases.length}`, "fases hechas", fh === p.fases.length && fh ? "ok" : "")}
    ${tile("Redes del mes", pubs + " / " + postsMes.length, "publicaciones hechas", "")}
    ${tile("Ventas netas", eur(vm.neto), `${eur(vm.ing)} regalías · ${eur(vm.gas)} anuncios`, vm.neto < 0 ? "bad" : vm.neto > 0 ? "ok" : "")}
    ${tile("Pedidos", ps.porEnviar + " por enviar", `${eur(ps.porCobrar)} por cobrar`, ps.porEnviar ? "warn" : "")}
  </div>
  ${tarjetaCalendario(ym)}
  <div class="card"><div class="ch"><h3>Manuscrito</h3><span class="hint">${fmt(pal)} de ${fmt(p.objetivoPalabras)} palabras · ${totalPct}% · <a href="#libro">cambiar</a></span></div>${bar(totalPct, totalPct >= 100 ? "ok" : "")}</div>
  <div class="grid g2">
    <div class="card"><div class="ch"><h3>Próximas tareas</h3><a href="#lanzamiento" class="hint">Ver todas</a></div>
      <div class="list">${prox.length ? prox.map(t => `<div class="li"><input type="checkbox" data-done="${t.id}" aria-label="Marcar ${esc(t.tarea)} como hecha">
        <div class="grow"><div>${esc(t.tarea)}</div><div class="meta">${esc(t.fase)} · ${t.fecha ? dayLabel(t.fecha) : "sin fecha"}${t.herr ? " · " + esc(t.herr) : ""}</div></div>
        ${t.fecha && t.fecha < TODAY ? `<span class="chip t-bad">Atrasada</span>` : `<span class="chip ${tone(t.estado === "En curso" ? "En curso" : t.importancia)}">${esc(t.estado === "En curso" ? "En curso" : t.importancia)}</span>`}</div>`).join("") : `<div class="empty">¡Todo hecho! 🎉</div>`}</div></div>
    <div class="card"><div class="ch"><h3>Próximas publicaciones</h3><a href="#redes" class="hint">Abrir calendario</a></div>
      <div class="list">${nextPosts.length ? nextPosts.map(x => `<div class="li"><div style="width:52px" class="meta">${dayLabel(x.fecha)}</div>
        <div class="grow"><div>${esc(x.contenido || "Sin título")}</div><div class="meta">${esc(x.red)} · ${esc(x.tipo)}</div></div><span class="chip ${tone(x.estado)}">${esc(x.estado)}</span></div>`).join("") : `<div class="empty">No hay publicaciones previstas este mes.</div>`}</div></div>
  </div>`;
}

/* 2. Libro: ficha, sinopsis y páginas de cortesía */
function vLibro() {
  const p = P();
  return `
  <div class="head"><div><div class="eyebrow">Ficha del libro</div><h1>${esc(p.titulo || "Sin título")}</h1><p>Los datos que vas a usar en Amazon, en redes, en tu web y en la prensa.</p></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn ghost sm" type="button" id="btnNovelia">Traer de Novelia Studio</button><button class="btn ghost sm" type="button" id="btnDelProj">Eliminar esta novela</button></div></div>
  <div class="libro">
    <div class="card portada-card">
      <div class="portada${p.portada ? "" : " vacia"}">${p.portada ? `<img src="${p.portada}" alt="Portada">` : "<span>Sin portada</span>"}</div>
      <label class="btn ghost sm" style="justify-content:center">${p.portada ? "Cambiar portada" : "Subir portada"}<input type="file" id="fPortada" accept="image/*" style="display:none"></label>
      ${p.portada ? `<button class="linkbtn" type="button" id="quitarPortada">Quitar portada</button>` : ""}
      <p class="hint" style="margin:0;text-align:center">KDP recomienda 1600 × 2560 px. Aquí se guarda una copia pequeña para tus tarjetas y tu web.</p>
    </div>
    <div class="card"><h3>La ficha</h3>
      <div class="fgrid">${field("Título", pf("titulo"), p.titulo)}${field("Subtítulo", pf("subtitulo"), p.subtitulo)}${field("Autora (nombre de pluma)", pf("autora"), p.autora)}
        ${field("Serie", pf("serie"), p.serie)}${field("Número en la serie", pf("numero"), p.numero)}${field("Género", pf("genero"), p.genero)}
        ${field("Subgénero", pf("subgenero"), p.subgenero)}${field("Tropos", pf("tropos"), p.tropos)}${field("Para fans de… (autoras o libros parecidos)", pf("comparables"), p.comparables)}</div>
      ${field("Avisos de contenido", pf("avisos"), p.avisos)}
      ${bloquePalabras(p)}
    </div>
  </div>
  <div class="card"><h3>Sinopsis</h3>
    <div class="note">Escribe lo primero que se te ocurra. Nada sale perfecto a la primera y no hay ideas malas.</div>
    ${fieldMax("Frase gancho (una línea)", "pitch", p.pitch, 150, "text")}
    <div class="grid g2">${fieldMax("Sinopsis corta (redes, newsletter)", "sinopsisCorta", p.sinopsisCorta, 500)}
    ${field("Sinopsis larga (la de Amazon)", `${pf("sinopsis")} data-max="4000"`, p.sinopsis, "area", `${cnt("sinopsis", p.sinopsis, 4000)} <em class="count" data-count="sinopsis">${words(p.sinopsis)} palabras</em>`)}
    ${field("Ideas sueltas", pf("ideasSinopsis"), p.ideasSinopsis, "area")}
    ${field("Palabras clave en otras sinopsis", pf("kwSinopsis"), p.kwSinopsis, "area")}
    ${field("Palabras clave en opiniones de otras novelas", pf("kwOpiniones"), p.kwOpiniones, "area")}</div>
  </div>
  <div class="card"><h3>Páginas de cortesía</h3>
    <div class="grid g2">${field("Legales", pf("legales"), p.legales, "area")}
    <div style="display:flex;flex-direction:column;gap:12px">${field("Epígrafe", pf("epigrafe"), p.epigrafe, "area")}${field("Dedicatoria del libro", pf("dedicatoria"), p.dedicatoria, "area")}${field("Dedicatoria para libros firmados", pf("dedicatoriaFirma"), p.dedicatoriaFirma, "area")}</div></div>
  </div>`;
}

function bloquePalabras(p) {
  const nv = novelaVinculada(p), lista = ENLACE.novelia || [];
  const sel = lista.length ? `<label class="field"><span>Novela en Novelia Studio</span><select id="selNovelia">
      <option value="">— No vincular (apunto las palabras a mano) —</option>${lista.map(x => `<option value="${esc(x.id)}"${x.id === p.noveliaId ? " selected" : ""}>${esc(x.titulo)} · ${fmt(x.palabras)} palabras</option>`).join("")}</select></label>` : "";
  if (nv) return `${sel}<div class="fgrid"><div class="field"><span>Objetivo de palabras</span><div class="dato-fijo">${fmt(p.objetivoPalabras)}</div></div><div class="field"><span>Palabras escritas</span><div class="dato-fijo">${fmt(p.palabrasEscritas)}</div></div></div>
      <p class="hint" style="margin:0">Vienen de Novelia y se actualizan solas cada vez que abres el Kit. Para cambiarlas, escribe en Novelia.</p>`;
  return `${sel}<div class="fgrid">${field("Objetivo de palabras", pf("objetivoPalabras"), p.objetivoPalabras, "number")}${field("Palabras escritas", pf("palabrasEscritas"), p.palabrasEscritas, "number")}</div>
      <p class="hint" style="margin:0">${lista.length ? "Si escribes esta novela en Novelia, elígela arriba y las palabras se pondrán solas." : "Si escribes en Novelia Studio en este navegador, las palabras se pondrán solas. Si no, apúntalas a mano."}</p>`;
}

/* 3. Amazon KDP */
function avisosKw(p, kw) {
  const t = String(kw || "").trim().toLowerCase(); if (!t) return [];
  const meta = [p.titulo, p.subtitulo, p.serie, p.autora, p.categorias].join(" ").toLowerCase();
  const a = [];
  if (t.length > 50) a.push("más de 50 caracteres");
  PROHIBIDAS.forEach(w => { if (new RegExp("(^|\\s)" + w + "(\\s|$)", "i").test(t)) a.push(`«${w}» no está permitido o no ayuda`); });
  if (/["“”«»<>]/.test(t)) a.push("sin comillas ni etiquetas");
  t.split(/\s+/).filter(w => w.length > 3 && meta.includes(w)).slice(0, 2).forEach(w => a.push(`«${w}» ya está en el título, la autora o las categorías`));
  if (p.kdp.filter(x => String(x).trim().toLowerCase() === t).length > 1) a.push("repetida");
  return a;
}
function vKdp() {
  const p = P();
  const kdp = p.kdp.map((v, i) => `<label class="field"><span>Casilla ${i + 1}<em class="count ${v.length > 50 ? "over" : ""}" data-count="kdp${i}">${v.length}/50</em></span><input type="text" data-s="p" data-arr="kdp" data-i="${i}" value="${esc(v)}" maxlength="80"><small class="kwav" data-kwav="${i}">${esc(avisosKw(p, v).join(" · "))}</small></label>`).join("");
  const formato = (k, n) => {
    const f = p.formatos[k];
    const est = ["", "Borrador", "Preventa", "En revisión", "Publicado"].map(o => `<option${o === (f.estado || "") ? " selected" : ""}>${o}</option>`).join("");
    return `<div class="card fmt"><div class="ch"><h3>${n}</h3>${f.estado ? `<span class="chip ${tone(f.estado)}">${esc(f.estado)}</span>` : ""}</div>
      <div class="fgrid"><label class="field"><span>Estado</span><select ${pp(`formatos.${k}.estado`)}>${est}</select></label>
      ${field("Precio (€)", pp(`formatos.${k}.precio`), f.precio || "", "text")}
      ${field(k === "ebook" ? "ASIN" : "ISBN", pp(`formatos.${k}.id`), f.id || "")}
      ${field("Fecha", pp(`formatos.${k}.fecha`), f.fecha || "", "date")}</div>
      ${k === "ebook" ? `<label class="chk"><input type="checkbox" ${pp("formatos.ebook.ku")}${f.ku ? " checked" : ""}> En Kindle Unlimited (KDP Select)</label>` : ""}</div>`;
  };
  return `
  <div class="head"><div><div class="eyebrow">Amazon KDP</div><h1>Tu ficha en Amazon</h1><p>Palabras clave, categorías, formatos y la descripción con formato, listos para copiar en KDP.</p></div></div>
  <div class="grid g2">
    <div class="card"><div class="ch"><h3>Palabras clave</h3><button class="btn ghost sm" type="button" id="copiarKw">Copiar las 7</button></div>
      <p class="hint" style="margin:0">Frases que buscaría tu lectora («comedia romántica navidad pueblo»), sin repetir lo que ya está en el título o las categorías. Hasta 50 caracteres cada una.</p>
      <div class="kdp">${kdp}</div>
      ${field("Categorías (hasta 3, una por línea)", pf("categorias"), p.categorias, "area")}</div>
    <div class="card"><h3>Enlaces de compra</h3>
      ${field("Amazon (ebook)", pp("enlaces.amazon"), p.enlaces.amazon, "url")}
      ${field("Amazon (papel)", pp("enlaces.papel"), p.enlaces.papel, "url")}
      ${field("Otras tiendas (una por línea: tienda | enlace)", pp("enlaces.otros"), p.enlaces.otros, "area")}
      <p class="hint" style="margin:0">Salen como botones en la página de tu web (sección Web).</p></div>
  </div>
  <div class="grid g3">${formato("ebook", "Ebook")}${formato("blanda", "Tapa blanda")}${formato("dura", "Tapa dura")}</div>
  <div class="card"><div class="ch"><h3>Descripción para Amazon</h3><span id="descCont"></span></div>
    <p class="hint" style="margin:0">KDP admite negrita, cursiva, subrayado, títulos pequeños, párrafos, saltos y listas. Las etiquetas cuentan para el límite de 4000 caracteres.</p>
    <div class="filters">${[["b", "<b>N</b>"], ["i", "<i>C</i>"], ["u", "<u>S</u>"], ["h4", "Título"], ["p", "Párrafo"], ["br", "Salto"], ["li", "Lista"]].map(([t, l]) => `<button type="button" data-tag="${t}">${l}</button>`).join("")}
      <button type="button" id="descDesde">Traer la sinopsis larga</button><button type="button" id="descCopiar">Copiar para KDP</button></div>
    <div class="grid g2"><label class="field"><span>HTML</span><textarea id="kdpDesc" ${pf("kdpDesc")} style="min-height:260px;font-family:ui-monospace,Menlo,monospace;font-size:.8rem">${esc(p.kdpDesc)}</textarea></label>
      <div class="field"><span>Así se verá en Amazon</span><div class="desc-prev" id="descPrev"></div></div></div>
    <div id="descAv"></div></div>
  <div class="card"><div class="ch"><h3>Contenido A+</h3><span class="hint">Planifica los módulos antes de montarlos en KDP (Marketing › Contenido A+)</span></div>
    ${tableHTML("aplus", "p", p.aplus, { addLabel: "Añadir módulo", empty: "Un buen comienzo: una cabecera con la frase gancho, tres imágenes con los tropos y la comparativa con tus otros libros.", preset: { tipo: p.aplus.length ? "Tres imágenes con texto" : "Imagen de cabecera con texto" } })}
    <p class="hint" style="margin:0">Imágenes JPG o PNG de 3 MB como máximo, sin texto pequeño encima.</p></div>`;
}
const TAGS_KDP = /^(b|i|em|u|br|p|h4|h5|h6|ol|ul|li)$/i;
function pintarDesc() {
  const ta = $("#kdpDesc"); if (!ta) return;
  const v = ta.value;
  const c = $("#descCont"); c.className = "count" + (v.length > 4000 ? " over" : ""); c.textContent = v.length + "/4000";
  const malas = [...new Set([...v.matchAll(/<\/?([a-z0-9]+)[^>]*>/gi)].map(m => m[1].toLowerCase()).filter(t => !TAGS_KDP.test(t)))];
  $("#descAv").innerHTML = malas.length ? `<div class="note">⚠ KDP no admite: ${malas.map(t => "&lt;" + esc(t) + "&gt;").join(", ")}</div>` : "";
  const d = document.createElement("div"); d.innerHTML = v.replace(/\n/g, " ");
  $$("*", d).forEach(e => { if (!TAGS_KDP.test(e.tagName)) e.replaceWith(...e.childNodes); else [...e.attributes].forEach(a => e.removeAttribute(a.name)); });
  $("#descPrev").innerHTML = d.innerHTML || '<p class="hint">Escribe la descripción a la izquierda.</p>';
}

/* 4. Producción */
function vProduccion() {
  const p = P();
  const fh = p.fases.filter(f => f.estado === "Hecho").length;
  const pc = p.fases.length ? Math.round(fh / p.fases.length * 100) : 0;
  const fuera = p.betas.filter(b => b.enviado && !b.devuelto).length;
  return `
  <div class="head"><div><div class="eyebrow">Producción</div><h1>Del borrador al archivo final</h1><p>En qué fase está el libro, quién lo tiene y cuál es el archivo bueno de cada versión.</p></div></div>
  <div class="tiles">${tile("Fases hechas", `${fh} / ${p.fases.length}`, pc + "%", pc === 100 ? "ok" : "lav")}
    ${tile("En curso", p.fases.filter(f => f.estado === "En curso").map(f => esc(f.nombre)).join(", ") || "—", "", "")}
    ${tile("Lectoras y correctora", p.betas.length, fuera ? fuera + " con el libro ahora" : "", fuera ? "warn" : "")}
    ${tile("Reseñas", p.betas.filter(b => b.resena === "Reseña hecha").length, "de tus lectoras", "ok")}</div>
  <div class="card phase"><div class="ph"><h3>Fases</h3>${bar(pc, pc === 100 ? "ok" : "")}<span class="pct">${fh}/${p.fases.length}</span></div>
    <p class="hint" style="margin:0">Apunta en cada fase qué archivo es el bueno («MI NOVELA - 2ª revisión sin muletillas.docx») y así no tienes que adivinarlo.</p>
    ${tableHTML("fases", "p", p.fases, { addLabel: "Añadir fase" })}</div>
  <div class="card"><h3>Lectoras beta y correctora</h3>${tableHTML("betas", "p", p.betas, { addLabel: "Añadir persona", empty: "Nadie todavía." })}</div>`;
}

/* 5. Lanzamiento */
function vLanzamiento() {
  const p = P();
  const f = view.fTareas;
  const filt = t => f === "todas" ? true : f === "pendientes" ? t.estado !== "Hecho" : monthOf(t.fecha) === view.mes;
  const hechas = p.tareas.filter(t => t.estado === "Hecho").length;
  const coste = p.tareas.reduce((s, t) => s + num(t.coste), 0);
  const fases = FASES.concat([...new Set(p.tareas.map(t => t.fase))].filter(x => !FASES.includes(x)));
  const blocks = fases.map(fa => {
    const all = p.tareas.filter(t => t.fase === fa);
    const rows = all.filter(filt);
    if (!all.length && f !== "todas") return "";
    const h = all.filter(t => t.estado === "Hecho").length;
    const pc = all.length ? Math.round(h / all.length * 100) : 0;
    return `<div class="card phase"><div class="ph"><h3>${esc(fa)}</h3>${bar(pc, pc === 100 ? "ok" : "")}<span class="pct">${h}/${all.length}</span></div>
      ${fa === "Escritura" ? `<div class="note" style="display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap"><span>La escritura ahora se lleva en <b>Novelia Studio</b>. Si ya no te hace falta aquí, puedes quitar esta fase.</span><button class="btn ghost sm" type="button" data-quitarfase="Escritura">Quitar la fase Escritura</button></div>` : ""}
      ${tableHTML("tareas", "p", rows, { preset: { fase: fa }, addLabel: "Añadir tarea", empty: f === "todas" ? "Sin tareas en esta fase." : "Nada con este filtro." })}</div>`;
  }).join("");
  const fb = (k, t) => `<button type="button" data-ftareas="${k}" aria-pressed="${f === k}">${t}</button>`;
  const faltan = diasA(p.lanzFecha);
  const sinFecha = p.tareas.filter(t => !t.fecha && t.estado !== "Hecho").length;
  return `
  <div class="head"><div><div class="eyebrow">Checklist de lanzamiento</div><h1>Del manuscrito a la librería</h1>
    <p>Todo lo que hay que hacer para publicar, agrupado por fases. Ponle fecha a una tarea y te aparecerá en el calendario de Inicio.</p></div></div>
  <div class="card"><div class="ch"><h3>El día D</h3>${faltan !== null ? `<span class="hint">${faltan > 0 ? `Faltan <b>${faltan} ${faltan === 1 ? "día" : "días"}</b>` : faltan === 0 ? "<b>¡Hoy es el día!</b>" : `Salió hace ${-faltan} días`}</span>` : ""}</div>
    <div class="fgrid">${field("Fecha de lanzamiento", pf("lanzFecha"), p.lanzFecha, "date")}${field("Abre la preventa", pf("preventaFecha"), p.preventaFecha, "date")}</div>
    <div class="filters">
      <button type="button" id="repartir"${p.lanzFecha ? "" : " disabled"}>Poner fechas desde el día D${sinFecha ? ` (${sinFecha} sin fecha)` : ""}</button>
      <button type="button" id="planRedes"${p.lanzFecha ? "" : " disabled"}>Crear plan de redes del lanzamiento</button>
      <button type="button" id="ics">Descargar para Google Calendar (.ics)</button></div>
    ${p.lanzFecha ? "" : `<p class="hint" style="margin:0">Pon la fecha de lanzamiento y el kit te reparte las fechas de las tareas y te prepara las publicaciones.</p>`}</div>
  <div class="tiles">${tile("Hechas", `${hechas} / ${p.tareas.length}`, Math.round(hechas / Math.max(1, p.tareas.length) * 100) + "% del lanzamiento", "ok")}
    ${tile("En curso", p.tareas.filter(t => t.estado === "En curso").length, "tareas abiertas", "lav")}
    ${tile("Con fecha este mes", p.tareas.filter(t => monthOf(t.fecha) === view.mes).length, mesLabel(view.mes), "")}
    ${tile("Coste apuntado", eur(coste), "suma de la columna Coste", "")}</div>
  <div class="filters">${fb("todas", "Todas")}${fb("pendientes", "Solo pendientes")}${fb("mes", "Con fecha este mes")}</div>
  ${blocks}`;
}
function repartirFechas() {
  const p = P(); if (!p.lanzFecha) return;
  let n = 0;
  const antes = p.tareas.map(t => [t, t.fecha]);
  // Si falta menos de medio año, se aprieta el calendario para que nada caiga en el pasado
  const disp = diasA(p.lanzFecha);
  const k = disp > 0 && disp < 180 ? disp / 180 : 1;
  Object.keys(VENTANAS).forEach(fa => {
    const list = p.tareas.filter(t => t.fase === fa && !t.fecha && t.estado !== "Hecho");
    const [a, b] = VENTANAS[fa];
    list.forEach((t, i) => {
      let d = list.length > 1 ? a + (b - a) * i / (list.length - 1) : b;
      if (d < 0) d = Math.max(-disp, Math.round(d * k)); else d = Math.round(d);
      t.fecha = sumarDias(p.lanzFecha, d); n++;
    });
  });
  save(); render();
  toast(n ? `${n} tareas con fecha. Cámbialas a tu gusto.` : "Todas las tareas pendientes ya tenían fecha.", n ? () => antes.forEach(([t, f]) => { t.fecha = f; }) : null);
}
function planRedes() {
  const p = P(); if (!p.lanzFecha) return;
  const t = p.titulo || "mi novela";
  const plan = [[-40, "Revelación de portada", "Carrusel", "Instagram", "Por fin puedo enseñárosla"], [-30, `Tropos de ${t}`, "Carrusel", "Instagram", "Si te gustan estos tropos, este libro es para ti"],
    [-21, `Una frase de ${t}`, "Reel", "Todas", "Una frase que aún no ha leído nadie"], [-14, `${t} vibes`, "Post", "Instagram", "Moodboard sin spoilers"],
    [-10, "Conoce a los protagonistas", "Carrusel", "Instagram", "Ella es… y él es…"], [-7, "Cuenta atrás: queda una semana", "Reel", "Todas", "Ya no puedo guardar el secreto"],
    [-3, "Último aviso de preventa", "Newsletter", "Newsletter", "Quedan tres días"], [-1, "Mañana sale", "Stories", "Instagram", "Activa el recordatorio"],
    [0, `Día de lanzamiento: ${t}`, "Reel", "Todas", "Ya está aquí"], [3, "Lo que dicen las lectoras", "Carrusel", "Instagram", "No lo digo yo, lo dicen ellas"],
    [10, p.serie ? `Por dónde empezar: ${p.serie}` : "Por dónde empezar a leerme", "Carrusel", "Instagram", "¿Nunca me has leído? Empieza por aquí"]];
  const ya = new Set(S.posts.map(x => x.contenido));
  const nuevos = [];
  plan.forEach(([d, contenido, tipo, red, gancho]) => {
    const fecha = sumarDias(p.lanzFecha, d);
    if (ya.has(contenido) || fecha < TODAY) return;
    nuevos.push({ id: uid(), fecha, red, tipo, contenido, copy: gancho, hashtags: "#novelaromántica #bookstagram #romántica", cta: d === 0 ? "Enlace en mi bio" : "", estado: "Idea" });
  });
  S.posts.push(...nuevos);
  save();
  toast(nuevos.length ? `${nuevos.length} publicaciones añadidas en Redes (solo de hoy en adelante)` : "No hay publicaciones nuevas que añadir", nuevos.length ? () => { S.posts = S.posts.filter(x => !nuevos.includes(x)); } : null);
  if (nuevos.length) { view.mes = monthOf(nuevos[0].fecha); location.hash = "redes"; }
}
function descargarIcs() {
  const p = P();
  const f = s => s.replace(/-/g, "");
  const limpio = s => String(s || "").replace(/[\\,;]/g, " ").replace(/\n/g, " ");
  const ev = (d, s) => `BEGIN:VEVENT\r\nUID:${uid()}@kitescritoras\r\nDTSTAMP:${f(TODAY)}T000000Z\r\nDTSTART;VALUE=DATE:${f(d)}\r\nDTEND;VALUE=DATE:${f(sumarDias(d, 1))}\r\nSUMMARY:${limpio(s)}\r\nEND:VEVENT\r\n`;
  let ics = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Kit Escritoras//ES\r\n", n = 0;
  if (p.lanzFecha) { ics += ev(p.lanzFecha, `🚀 Lanzamiento: ${p.titulo}`); n++; }
  if (p.preventaFecha) { ics += ev(p.preventaFecha, `🛒 Abre la preventa: ${p.titulo}`); n++; }
  p.tareas.filter(t => t.fecha && t.estado !== "Hecho").forEach(t => { ics += ev(t.fecha, `📚 ${p.titulo}: ${t.tarea}`); n++; });
  S.posts.filter(x => x.fecha && !["Publicado", "Analizado"].includes(x.estado)).forEach(x => { ics += ev(x.fecha, `📱 ${x.tipo}: ${x.contenido || "sin título"}`); n++; });
  ics += "END:VCALENDAR\r\n";
  if (n < 1) { toast("No hay nada con fecha todavía."); return; }
  descargar(new Blob([ics], { type: "text/calendar" }), `lanzamiento-${(p.titulo || "novela").replace(/[^\wáéíóúñü -]/gi, "").trim().replace(/\s+/g, "-").toLowerCase()}.ics`);
  toast(`${n} fechas descargadas: abre el archivo o impórtalo en Google Calendar`);
}
function descargar(blob, nombre) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = nombre;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/* 5. Redes */
function vRedes() {
  const ym = view.mes;
  const mes = S.posts.filter(x => monthOf(x.fecha) === ym).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const sinFecha = S.posts.filter(x => !x.fecha);
  const days = monthDays(ym);
  let cells = DIAS.map(d => `<div class="dn">${d}</div>`).join("");
  for (let i = 0; i < dow(days[0]); i++) cells += `<div class="day blank" aria-hidden="true"></div>`;
  days.forEach(d => {
    const list = mes.filter(x => x.fecha === d);
    cells += `<div class="day post-day${d === TODAY ? " today" : ""}"><div class="num">${Number(d.slice(8))}<button class="linkbtn" type="button" data-addpost="${d}" aria-label="Añadir publicación el ${dayLabel(d)}" title="Añadir publicación">+</button></div>
      <div class="chips">${list.map(x => `<span class="chip ${tone(x.estado)}" title="${esc(x.red + " · " + x.tipo + " · " + x.contenido)}">${esc(x.tipo)}: ${esc(x.contenido || "sin título")}</span>`).join("")}</div></div>`;
  });
  const est = ["Idea", "Diseñado", "Copy listo", "Programado", "Publicado", "Analizado"];
  const counts = est.map(e => `<span class="chip ${tone(e)}">${e}: ${mes.filter(x => x.estado === e).length}</span>`).join(" ");
  return `
  <div class="head"><div><div class="eyebrow">Calendario de contenidos</div><h1 style="text-transform:capitalize">${mesLabel(ym)}</h1>
    <p>Planifica posts, reels, stories y newsletters. Pulsa + en un día para añadir una publicación.</p></div></div>
  <div class="filters">${counts}</div>
  <div class="cal">${cells}</div>
  <div class="card"><div class="ch"><h3>Publicaciones de ${MESES[+ym.slice(5) - 1]}</h3><span class="hint">${mes.length} publicaciones</span></div>
    ${tableHTML("posts", "g", mes, { preset: { fecha: ym === monthOf(TODAY) ? TODAY : ym + "-01" }, addLabel: "Añadir publicación", empty: "Aún no hay publicaciones este mes." })}</div>
  ${sinFecha.length ? `<div class="card"><h3>Ideas sin fecha</h3>${tableHTML("posts", "g", sinFecha, { noAdd: true })}</div>` : ""}
  <div class="card" id="citas"><div class="ch"><h3>Frases y citas de «${esc(P().titulo)}»</h3><span class="hint">Las que guardas para diseños y redes</span></div>${tableHTML("frases", "p", P().frases, { addLabel: "Añadir frase" })}</div>
  ${vTarjeta()}`;
}

/* Tarjetas de citas para Instagram */
const ESTILOS_TARJ = {
  marca: { n: "Rosa", fondo: "#a5595d", tinta: "#fffdfc" }, lino: { n: "Lino", fondo: "#f8f2ef", tinta: "#3a2a2c" },
  empolvado: { n: "Empolvado", fondo: "#dfadad", tinta: "#3a2a2c" }, noche: { n: "Noche", fondo: "#2a2022", tinta: "#f0e6ea" },
  portada: { n: "Con la portada", fondo: "#000", tinta: "#ffffff" }
};
const tarj = { formato: "1080x1350", estilo: "marca", frase: "" };
function vTarjeta() {
  const p = P();
  const frases = p.frases.filter(f => String(f.frase || "").trim());
  if (!frases.length) return `<div class="card"><h3>Tarjeta para redes</h3><div class="empty">Añade una frase arriba y aquí la conviertes en una imagen para Instagram.</div></div>`;
  if (!frases.some(f => f.id === tarj.frase)) tarj.frase = frases[0].id;
  const est = Object.entries(ESTILOS_TARJ).filter(([k]) => k !== "portada" || p.portada);
  if (!est.some(([k]) => k === tarj.estilo)) tarj.estilo = "marca";
  return `<div class="card"><div class="ch"><h3>Tarjeta para redes</h3><button class="btn sm" type="button" id="tjPng">Descargar PNG</button></div>
    <div class="tarj">
      <div style="display:flex;flex-direction:column;gap:12px">
        <label class="field"><span>Frase</span><select id="tjFrase">${frases.map(f => `<option value="${f.id}"${f.id === tarj.frase ? " selected" : ""}>${esc(String(f.frase).slice(0, 90))}</option>`).join("")}</select></label>
        <div class="field"><span>Formato</span><div class="filters" style="margin:0">${[["1080x1350", "Post 4:5"], ["1080x1080", "Cuadrada"], ["1080x1920", "Story / reel"]].map(([k, t]) => `<button type="button" data-tf="${k}" aria-pressed="${tarj.formato === k}">${t}</button>`).join("")}</div></div>
        <div class="field"><span>Estilo</span><div class="filters" style="margin:0">${est.map(([k, e]) => `<button type="button" data-te="${k}" aria-pressed="${tarj.estilo === k}">${e.n}</button>`).join("")}</div></div>
        <p class="hint" style="margin:0">Abajo sale el título${p.autora ? " y tu nombre de autora" : ". Pon tu nombre de autora en Libro para que salga también"}.</p>
      </div>
      <canvas id="tjC" aria-label="Vista previa de la tarjeta"></canvas>
    </div></div>`;
}
async function pintarTarjeta() {
  const cv = $("#tjC"); if (!cv) return;
  const p = P(); const fr = p.frases.find(f => f.id === tarj.frase); if (!fr) return;
  const [W, H] = tarj.formato.split("x").map(Number);
  cv.width = W; cv.height = H;
  const g = cv.getContext("2d"); const e = ESTILOS_TARJ[tarj.estilo];
  try { await document.fonts.load('italic 600 60px "Cormorant Garamond"'); await document.fonts.load('700 30px "Nunito Sans"'); } catch (err) { /* sin fuentes web */ }
  g.fillStyle = e.fondo; g.fillRect(0, 0, W, H);
  if (tarj.estilo === "portada" && p.portada) {
    const im = new Image(); await new Promise(r => { im.onload = r; im.onerror = r; im.src = p.portada; });
    if (im.width) { const k = Math.max(W / im.width, H / im.height); g.drawImage(im, (W - im.width * k) / 2, (H - im.height * k) / 2, im.width * k, im.height * k); }
    g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(0, 0, W, H);
  }
  const serif = '"Cormorant Garamond", Georgia, serif';
  const texto = String(fr.frase).replace(/\s+/g, " ").trim().replace(/^[«"“]+|[»"”]+$/g, "");
  const ancho = W - 240;
  const partir = t => { const out = []; let l = ""; t.split(" ").forEach(w => { const q = l ? l + " " + w : w; if (g.measureText(q).width > ancho && l) { out.push(l); l = w; } else l = q; }); if (l) out.push(l); return out; };
  let tam = 84, lineas = [];
  for (; tam >= 34; tam -= 2) { g.font = `italic 600 ${tam}px ${serif}`; lineas = partir(texto); if (lineas.length * tam * 1.3 < H * 0.55) break; }
  const alto = lineas.length * tam * 1.3, y = (H - alto) / 2 + tam * 0.5;
  g.fillStyle = e.tinta; g.textAlign = "center"; g.textBaseline = "middle";
  g.globalAlpha = .35; g.font = `${tam * 2.6}px ${serif}`; g.fillText("“", W / 2, y - tam * 1.45); g.globalAlpha = 1;
  g.font = `italic 600 ${tam}px ${serif}`;
  lineas.forEach((l, i) => g.fillText(l, W / 2, y + i * tam * 1.3));
  const pie = [p.titulo, p.autora || perfil().nombre].filter(Boolean).join(" · ").toUpperCase();
  g.font = '700 28px "Nunito Sans", sans-serif'; g.globalAlpha = .85;
  if ("letterSpacing" in g) g.letterSpacing = "4px";
  g.fillText(pie, W / 2, H - 110); g.globalAlpha = 1;
  if ("letterSpacing" in g) g.letterSpacing = "0px";
}

/* Web: página del libro para WordPress */
function htmlWeb(p, portada) {
  const otros = String(p.enlaces.otros || "").split("\n").map(l => l.split("|").map(s => s.trim())).filter(x => x[1]);
  const botones = [p.enlaces.amazon && ["Comprar en Amazon", p.enlaces.amazon], p.enlaces.papel && ["En papel", p.enlaces.papel], ...otros].filter(Boolean);
  const sinopsis = (p.sinopsis || p.sinopsisCorta || "").split(/\n\s*\n|\n/).filter(x => x.trim()).map(x => `<p>${esc(x.trim())}</p>`).join("\n    ");
  const tropos = String(p.tropos || "").split(/[·,\n]/).map(s => s.trim()).filter(Boolean);
  return `<div class="libro-ficha" style="display:flex;gap:32px;flex-wrap:wrap;align-items:flex-start">
  <!-- Sustituye PORTADA.jpg por la portada subida a tu biblioteca de medios -->
  <img src="${portada || "PORTADA.jpg"}" alt="${esc(p.titulo)}" style="width:260px;max-width:100%;border-radius:6px;box-shadow:0 10px 30px rgba(0,0,0,.15)">
  <div style="flex:1;min-width:260px">
    ${p.serie ? `<p style="text-transform:uppercase;letter-spacing:.12em;font-size:13px;opacity:.7">${esc(p.serie)}${p.numero ? " · Libro " + esc(p.numero) : ""}</p>` : ""}
    <h2>${esc(p.titulo)}</h2>${p.subtitulo ? `\n    <p><em>${esc(p.subtitulo)}</em></p>` : ""}
    ${p.pitch ? `<p style="font-size:1.2em"><strong>${esc(p.pitch)}</strong></p>` : ""}
    ${sinopsis}
    ${tropos.length ? `<p style="opacity:.8">${tropos.map(t => "#" + esc(t)).join(" · ")}</p>` : ""}
    <p>${botones.map(([n, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener" style="display:inline-block;margin:4px 8px 4px 0;padding:10px 18px;border-radius:999px;background:#a5595d;color:#fff;text-decoration:none">${esc(n)}</a>`).join("")}</p>
  </div>
</div>`;
}
function vWeb() {
  const p = P();
  const gris = "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22260%22 height=%22400%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23e9d8c9%22/%3E%3C/svg%3E";
  const html = htmlWeb(p);
  return `
  <div class="head"><div><div class="eyebrow">Tu web</div><h1>La página del libro</h1><p>Sale de la ficha del libro y de los enlaces de compra de Amazon KDP. Cópiala y pégala en tu web.</p></div></div>
  <div class="grid g2">
    <div class="card"><h3>Así quedaría</h3><div class="web-prev">${htmlWeb(p, p.portada || gris)}</div></div>
    <div class="card"><h3>Para WordPress</h3>
      <ol class="hint" style="margin:0;padding-left:18px;line-height:1.7"><li>En WordPress, crea la página del libro y añade un bloque <b>HTML personalizado</b>.</li><li>Pega este código y cambia <code>PORTADA.jpg</code> por la portada de tu biblioteca de medios.</li></ol>
      <label class="field"><span>Código</span><textarea id="webHtml" readonly style="min-height:300px;font-family:ui-monospace,Menlo,monospace;font-size:.75rem">${esc(html)}</textarea></label>
      <div class="acts" style="display:flex;gap:8px"><button class="btn" type="button" id="webCopiar">Copiar HTML</button>${p.portada ? `<button class="btn ghost" type="button" id="webPortada">Descargar portada</button>` : ""}</div></div>
  </div>`;
}
async function copiar(texto, msg) {
  try { await navigator.clipboard.writeText(texto); toast(msg || "Copiado"); }
  catch (e) { toast("Tu navegador no deja copiar automáticamente: selecciona el texto y usa Ctrl+C."); }
}

/* Portada: se guarda una copia pequeña */
function leerPortada(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file); const im = new Image();
    im.onload = () => {
      const k = Math.min(1, 800 / Math.max(im.width, im.height));
      const c = document.createElement("canvas"); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      res(c.toDataURL("image/jpeg", .85));
    };
    im.onerror = () => { URL.revokeObjectURL(url); rej(new Error("imagen")); };
    im.src = url;
  });
}

/* Traer de Novelia Studio */
const ESTADO_FASE = { pendiente: "Pendiente", curso: "En curso", hecho: "Hecho" };
const CAT_FASE = { "Producción": "Edición y diseño", "Amazon": "Publicación" };
function importarNovelia(d, destino) {
  const n = d.novela || {}; const pub = n.publicar || {};
  const F = pub.ficha || {}, K = pub.kdp || {}, R = pub.prod || {}, L = pub.lanz || {};
  let p = destino;
  if (!p) { p = newProject(F.titulo || n.titulo || "Mi novela"); S.proyectos.push(p); }
  S.activo = p.id;
  const put = (k, v) => { if (v !== undefined && v !== null && String(v).trim() !== "") p[k] = v; };
  put("titulo", F.titulo || n.titulo); put("subtitulo", F.subtitulo); put("serie", F.serie); put("numero", F.numero);
  put("genero", F.genero); put("subgenero", F.subgenero); put("comparables", F.comparables); put("avisos", F.avisos);
  put("pitch", F.pitch); put("sinopsisCorta", F.sinopsisCorta); put("sinopsis", F.sinopsisLarga);
  if (Array.isArray(F.tropos) && F.tropos.length) p.tropos = F.tropos.join(" · ");
  put("autora", d.autora); put("portada", n.portada);
  if (d.perfil && typeof d.perfil === "object") {
    const pr = perfil();
    ["nombre", "usuario", "genero", "foto"].forEach(k => { if (!String(pr[k]).trim() && d.perfil[k]) pr[k] = d.perfil[k]; });
    ["instagram", "tiktok", "amazon", "web"].forEach(k => { const v = d.perfil.enlaces && d.perfil.enlaces[k]; if (!String(pr.enlaces[k] || "").trim() && v) pr.enlaces[k] = v; });
    if (!pr.otros.length && Array.isArray(d.perfil.otros)) pr.otros = d.perfil.otros.filter(o => o && o.u).map(o => ({ t: o.t || "", u: o.u }));
  }
  if (num(n.palabras) > 0) p.palabrasEscritas = Math.round(num(n.palabras));
  if (num(n.objetivo) > 0) p.objetivoPalabras = Math.round(num(n.objetivo));
  if (Array.isArray(K.keywords) && K.keywords.some(x => String(x).trim())) { p.kdp = K.keywords.slice(0, 7).map(String); while (p.kdp.length < 7) p.kdp.push(""); }
  if (Array.isArray(K.categorias) && K.categorias.some(x => String(x).trim())) p.categorias = K.categorias.filter(x => String(x).trim()).join("\n");
  put("kdpDesc", K.descripcion);
  if (K.enlaces) ["amazon", "papel", "otros"].forEach(k => { if (String(K.enlaces[k] || "").trim()) p.enlaces[k] = K.enlaces[k]; });
  if (K.formatos) ["ebook", "blanda", "dura"].forEach(k => { const f = K.formatos[k] || {}; Object.keys(f).forEach(c => { if (f[c] !== "" && f[c] != null) p.formatos[k][c] = f[c]; }); });
  const MOD = { cabecera: "Imagen de cabecera con texto", superpuesto: "Imagen con texto superpuesto", izquierda: "Imagen a la izquierda y texto", derecha: "Imagen a la derecha y texto", tres: "Tres imágenes con texto", comparativa: "Comparativa (tus otros libros)", texto: "Solo texto", logo: "Logo o firma de autora" };
  (K.aplus || []).forEach(m => { if (!p.aplus.some(x => x.titulo === (m.titulo || "") && x.texto === (m.texto || ""))) p.aplus.push({ id: uid(), tipo: MOD[m.tipo] || "Solo texto", titulo: m.titulo || "", texto: m.texto || "" }); });
  (R.fases || []).forEach(f => {
    const nueva = { nombre: f.nombre || "Fase", estado: ESTADO_FASE[f.estado] || "Pendiente", quien: f.quien || "", fecha: f.fecha || "", archivo: f.archivo || "" };
    const ya = p.fases.find(x => x.nombre.toLowerCase() === nueva.nombre.toLowerCase() || (x.nombre === "Maquetación ebook" && /^maquetación ebook/i.test(nueva.nombre)));
    if (ya) Object.keys(nueva).forEach(k => { if (k !== "nombre" && nueva[k] && (k !== "estado" || nueva[k] !== "Pendiente")) ya[k] = nueva[k]; });
    else p.fases.push(Object.assign({ id: uid() }, nueva));
  });
  (R.betas || []).forEach(b => { if (!p.betas.some(x => x.nombre && x.nombre === b.nombre)) p.betas.push({ id: uid(), nombre: b.nombre || "", papel: b.papel || "Lectora beta", enviado: b.enviado || "", devuelto: b.devuelto || "", caps: b.caps || "", notas: b.notas || "", resena: b.resena ? "Reseña hecha" : "Sin reseña" }); });
  put("lanzFecha", L.fecha); put("preventaFecha", L.preventa);
  let nt = 0;
  (L.tareas || []).forEach(t => {
    if (p.tareas.some(x => x.tarea.toLowerCase() === String(t.texto || "").toLowerCase())) return;
    const dias = parseInt(t.dias, 10) || 0;
    const fase = CAT_FASE[t.cat] || (dias > 0 ? "Después del lanzamiento" : "Preventa y promoción");
    p.tareas.push({ id: uid(), fase, tarea: t.texto || "Tarea", herr: t.cat || "", fecha: p.lanzFecha ? sumarDias(p.lanzFecha, dias) : "", importancia: "Media", estado: t.hecho ? "Hecho" : "Pendiente", coste: "", notas: "" }); nt++;
  });
  const RED = { "IG + TikTok": "Todas", Stories: "Instagram" }, TIPO = { Story: "Stories" };
  let np = 0;
  (pub.redes || []).forEach(r => {
    if (S.posts.some(x => x.fecha === (r.fecha || "") && x.contenido === (r.tema || ""))) return;
    const estado = r.publicado ? "Publicado" : r.programado ? "Programado" : r.captionListo ? "Copy listo" : (r.grabado || r.editado) ? "Diseñado" : "Idea";
    S.posts.push({ id: uid(), fecha: r.fecha || "", red: RED[r.donde] || r.donde || "Instagram", tipo: TIPO[r.formato] || r.formato || "Post", contenido: r.tema || "", copy: [r.gancho, r.caption].filter(Boolean).join("\n\n"), hashtags: r.hashtags || "", cta: r.cta || "", estado }); np++;
  });
  let nc = 0;
  (pub.citas || []).concat(n.citas || []).forEach(c => {
    const t = String(c.texto || "").trim(); if (!t || p.frases.some(f => String(f.frase).replace(/^[«"]|[»"]$/g, "") === t)) return;
    p.frases.push({ id: uid(), frase: "«" + t + "»", personaje: "", capitulo: c.cap || "", idea: "", estado: "Idea" }); nc++;
  });
  save(); location.hash = "libro"; render();
  toast(`Traída «${p.titulo}»: ficha, KDP y producción${nt ? `, ${nt} tareas` : ""}${np ? `, ${np} publicaciones` : ""}${nc ? `, ${nc} citas` : ""}.`);
}
function abrirNovelia() {
  const p = P();
  openModal(`<h2>Traer de Novelia Studio</h2>
    <p style="margin:0">En Novelia, ve a <b>Citas › Pasar al Kit Escritoras</b> y descarga el archivo. Después elígelo aquí.</p>
    <p class="hint" style="margin:0">Se traen el título, las palabras escritas, la sinopsis, las citas y, si los tenías en Novelia, los datos de Amazon, producción, lanzamiento y redes. Lo que ya tengas aquí no se borra: solo se completa.</p>
    <label class="btn" style="display:inline-flex;align-items:center;justify-content:center">Elegir el archivo de Novelia<input type="file" id="nvFile" accept=".json,application/json" style="display:none"></label>
    <p class="hint" id="nvMsg" style="margin:0"></p>
    <div class="acts"><button class="btn ghost" type="button" data-close>Cancelar</button></div>`, box => {
    $("#nvFile", box).addEventListener("change", e => {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        let d; try { d = JSON.parse(String(r.result)); } catch (err) { d = null; }
        const msg = $("#nvMsg", box);
        if (!d || d.tipo !== "novelia-para-kit" || !d.novela) { msg.textContent = "Ese archivo no viene de Novelia Studio. Descárgalo desde Citas › Pasar al Kit Escritoras."; return; }
        const t = (d.novela.publicar && d.novela.publicar.ficha && d.novela.publicar.ficha.titulo) || d.novela.titulo || "la novela";
        msg.innerHTML = `Archivo de «${esc(t)}». ¿Dónde lo pongo?<div class="acts" style="justify-content:flex-start"><button class="btn sm" type="button" id="nvAqui">Completar «${esc(p.titulo)}»</button><button class="btn ghost sm" type="button" id="nvNueva">Crear una novela nueva</button></div>`;
        $("#nvAqui", box).addEventListener("click", () => { closeModal(); importarNovelia(d, p); });
        $("#nvNueva", box).addEventListener("click", () => { closeModal(); importarNovelia(d, null); });
      };
      r.readAsText(f);
    });
  });
}

/* 6. Pedidos */
function vPedidos() {
  const p = P(), ps = pedidosStats(p);
  return `
  <div class="head"><div><div class="eyebrow">Preventa y pedidos</div><h1>Pedidos en papel</h1>
    <p>Quién te ha pedido el libro, con qué dedicatoria, si ha pagado y en qué punto está el envío.</p></div></div>
  <div class="tiles">${tile("Pedidos", ps.n, "", "")}${tile("Cobrado", eur(ps.cobrado), "pagados y a cuenta", "ok")}
    ${tile("Por cobrar", eur(ps.porCobrar), "pagos pendientes", ps.porCobrar ? "warn" : "")}${tile("Por enviar", ps.porEnviar, "pedidos pendientes", ps.porEnviar ? "warn" : "")}
    ${tile("Beneficio", eur(ps.benef), "cobrado − libro − envío", ps.benef < 0 ? "bad" : "ok")}</div>
  <div class="card"><div class="ch"><h3>Lista de pedidos</h3>
    <label class="field" style="flex-direction:row;align-items:center;gap:8px"><span>Coste de cada libro</span><input type="number" step="0.01" ${pf("costeEjemplar")} value="${esc(p.costeEjemplar)}" style="width:100px"></label></div>
    ${tableHTML("pedidos", "p", p.pedidos, { addLabel: "Añadir pedido", empty: "Cuando abras la preventa, apunta aquí cada pedido.", preset: { envio: "Ordinario", pago: "Pendiente", estado: "Pendiente", importe: p.pvp } })}</div>`;
}

/* 7. Cuentas */
function vCuentas() {
  const p = P(), cs = costesStats(p), ym = view.mes, vm = ventasMes(ym);
  const rows = S.ventas.filter(v => v.mes === ym);
  return `
  <div class="head"><div><div class="eyebrow">Cuentas</div><h1>Lo que cuesta y lo que deja</h1>
    <p>Arriba, cuánto has invertido en este libro y cuántos ejemplares necesitas vender para recuperarlo. Abajo, tus regalías de cada mes.</p></div></div>
  <div class="card"><div class="ch"><h3>Contabilidad del libro: ${esc(p.titulo)}</h3></div>
    <div class="tiles" id="costTiles">${costTiles(cs)}</div>
    <div class="fgrid">${field("Ejemplares impresos", pf("unidades"), p.unidades, "number")}${field("Precio de venta (PVP)", pf("pvp"), p.pvp, "number")}</div>
    ${tableHTML("costes", "p", p.costes, { addLabel: "Añadir gasto" })}</div>
  <div class="card"><div class="ch"><h3 style="text-transform:capitalize">Ventas de ${mesLabel(ym)}</h3><span class="hint">Copia las cifras del informe de regalías de KDP</span></div>
    <div class="tiles" id="ventTiles">${ventTiles(vm)}</div>
    ${tableHTML("ventas", "g", rows, { preset: { mes: ym, libro: p.titulo, concepto: "Digital" }, addLabel: "Añadir línea", empty: "Sin ventas apuntadas este mes." })}</div>
  <div class="card chart"><div class="ch"><h3>Resultado neto de ${ym.slice(0, 4)}</h3><span class="hint" id="anualTot"></span></div><div id="chart"></div></div>`;
}
function costTiles(cs) {
  return tile("Inversión total", eur(cs.total), "", "") + tile("Coste por ejemplar", eur(cs.porLibro), "inversión ÷ ejemplares", "lav") +
    tile("Margen por ejemplar", eur(cs.margen), "PVP − coste por ejemplar", cs.margen < 0 ? "bad" : "ok") +
    tile("Para recuperar la inversión", fmt(cs.equilibrio) + " libros", "vendidos a PVP", "warn");
}
function ventTiles(vm) {
  return tile("Regalías", eur(vm.ing), "", "ok") + tile("Gastos en anuncios", eur(vm.gas), "", vm.gas ? "warn" : "") +
    tile("Neto del mes", eur(vm.neto), "", vm.neto < 0 ? "bad" : "ok") + tile("Libros vendidos", fmt(vm.uds), fmt(vm.kenp) + " páginas KENP", "lav");
}
function drawChart() {
  const el = $("#chart"); if (!el) return;
  const y = view.mes.slice(0, 4);
  const vals = Array.from({ length: 12 }, (_, i) => ventasMes(y + "-" + pad(i + 1)).neto);
  const W = 640, H = 220, L = 52, R = 10, T = 16, B = 28;
  const mx = Math.max(10, ...vals), mn = Math.min(0, ...vals);
  const step = Math.pow(10, Math.floor(Math.log10(mx - mn || 1)));
  const top = Math.ceil(mx / step) * step, bot = Math.floor(mn / step) * step || 0;
  const yS = v => T + (top - v) / (top - bot) * (H - T - B);
  const bw = (W - L - R) / 12;
  const sel = +view.mes.slice(5) - 1;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Resultado neto por mes en ${y}">`;
  const ticks = []; for (let v = bot; v <= top + 1e-9; v += (top - bot) / 4) ticks.push(v);
  ticks.forEach(v => { s += `<line x1="${L}" x2="${W - R}" y1="${yS(v)}" y2="${yS(v)}" stroke="#eadcd8" stroke-width="1"/><text x="${L - 6}" y="${yS(v) + 4}" text-anchor="end">${Math.round(v)} €</text>`; });
  vals.forEach((v, i) => {
    const x = L + i * bw + bw * 0.18, w = bw * 0.64;
    const y0 = yS(0), y1 = yS(v);
    const col = v < 0 ? "#a83e3e" : i === sel ? "#a5595d" : "#dfadad";
    if (v !== 0) s += `<rect x="${x}" y="${Math.min(y0, y1)}" width="${w}" height="${Math.max(1, Math.abs(y1 - y0))}" rx="4" fill="${col}"><title>${MESES[i]}: ${eur(v)}</title></rect>`;
    s += `<text x="${x + w / 2}" y="${H - 8}" text-anchor="middle" style="${i === sel ? "font-weight:700;fill:#3a2a2c" : ""}">${MESES[i].slice(0, 3)}</text>`;
    if (i === sel && v !== 0) s += `<text x="${x + w / 2}" y="${(v < 0 ? Math.max(y0, y1) + 13 : Math.min(y0, y1) - 5)}" text-anchor="middle" style="font-weight:700;fill:#3a2a2c">${Math.round(v)} €</text>`;
  });
  s += `<line x1="${L}" x2="${W - R}" y1="${yS(0)}" y2="${yS(0)}" stroke="#7a6668" stroke-width="1"/></svg>`;
  el.innerHTML = s;
  const tot = vals.reduce((a, b) => a + b, 0);
  const at = $("#anualTot"); if (at) at.textContent = "Total del año: " + eur(tot);
}

/* 8. Prensa y colaboraciones */
function vPrensa() {
  const colabCost = S.colabs.reduce((s, c) => s + num(c.coste), 0);
  return `
  <div class="head"><div><div class="eyebrow">Difusión</div><h1>Prensa y colaboraciones</h1>
    <p>Los medios a los que mandas tu nota de prensa y las cuentas lectoras con las que colaboras.</p></div></div>
  <div class="tiles">${tile("Medios", S.prensa.length, S.prensa.filter(x => x.estado === "Salió en prensa").length + " han publicado", "")}
    ${tile("Por contactar", S.prensa.filter(x => x.estado === "Por contactar").length, "medios", "warn")}
    ${tile("Colaboraciones", S.colabs.length, S.colabs.filter(c => c.resultado === "Bueno").length + " con buen resultado", "lav")}
    ${tile("Coste en colaboraciones", eur(colabCost), "libros + envíos", "")}</div>
  <div class="card"><h3>Medios de prensa</h3>${tableHTML("prensa", "g", S.prensa, { addLabel: "Añadir medio", preset: { estado: "Por contactar", tipo: "Periódico" } })}</div>
  <div class="card"><h3>Colaboraciones</h3>${tableHTML("colabs", "g", S.colabs, { addLabel: "Añadir colaboración", preset: { resultado: "Pendiente", red: "Instagram", motivo: "Lanzamiento" } })}</div>`;
}

/* ---------- Negocio de autora: catálogo, ventas de Amazon, ingresos, gastos, impuestos ---------- */
const NEG_LISTAS = ["catalogo", "kdpVentas", "ingresos", "gastosNeg", "directa", "redesMes", "derechos", "resenas", "eventos", "objetivos", "historico"];
const MONEDAS = { EUR: 1, USD: 0.8662, GBP: 1.1715, CAD: 0.622, AUD: 0.57, MXN: 0.047, BRL: 0.16, JPY: 0.0054, INR: 0.0101 };
function negocio() {
  if (!S.negocio || typeof S.negocio !== "object") S.negocio = {};
  const n = S.negocio;
  const def = { objetivoAnual: "", irpfPct: 15, pagoFracPct: 20, kenpTarifa: 0.0042, nif: "", actividad: "Autora: venta de libros y derechos de autor", cambio: {} };
  Object.keys(def).forEach(k => { if (n[k] === undefined || n[k] === null) n[k] = def[k]; });
  if (!n.cambio || typeof n.cambio !== "object") n.cambio = {};
  Object.keys(MONEDAS).forEach(k => { if (n.cambio[k] === undefined || n.cambio[k] === "") n.cambio[k] = MONEDAS[k]; });
  return n;
}
const ESTADOS_LIBRO = ["Activo", "Próximo", "En escritura", "Pausado", "Descatalogado"];
const FORMATOS_KDP = ["Ebook", "Tapa blanda", "Tapa dura", "KENP"];

Object.assign(COLS, {
  catalogo: [
    { k: "titulo", t: "Título", w: 210 },
    { k: "serie", t: "Serie y nº", w: 160 },
    { k: "genero", t: "Género", w: 150 },
    { k: "estado", t: "Estado", type: "pill", opts: ESTADOS_LIBRO },
    { k: "fecha", t: "Publicado", type: "date", w: 140 },
    { k: "asin", t: "ASIN ebook", w: 120 },
    { k: "isbn", t: "ISBN papel", w: 140 },
    { k: "enlace", t: "Enlace", w: 170 },
    { k: "notas", t: "Notas", w: 180 }
  ],
  ingresos: [
    { k: "fecha", t: "Fecha", type: "date", w: 140 },
    { k: "concepto", t: "Concepto", w: 190 },
    { k: "linea", t: "Línea", type: "select", opts: ["Club de lectura", "Charlas", "Talleres", "Editorial", "Derechos", "Colaboración", "Otro"] },
    { k: "cliente", t: "Cliente / entidad", w: 170 },
    { k: "bruto", t: "Base (€)", type: "money", w: 100 },
    { k: "iva", t: "IVA (€)", type: "money", w: 90 },
    { k: "irpf", t: "IRPF retenido (€)", type: "money", w: 100 },
    { k: "_neto", t: "Cobras", calc: r => num(r.bruto) + num(r.iva) - num(r.irpf), money: true },
    { k: "estado", t: "Cobro", type: "pill", opts: ["Pendiente", "Cobrado", "Parcial"] },
    { k: "factura", t: "Factura nº", w: 90 },
    { k: "notas", t: "Notas", w: 160 }
  ],
  gastosNeg: [
    { k: "fecha", t: "Fecha", type: "date", w: 140 },
    { k: "concepto", t: "Concepto", w: 200 },
    { k: "categoria", t: "Categoría", type: "select", opts: ["Corrección", "Diseño y portadas", "Impresión", "Publicidad", "Suscripciones", "Material", "Envíos", "Formación", "Gestoría", "Viajes y eventos", "Otros"] },
    { k: "proveedor", t: "Proveedor", w: 140 },
    { k: "libro", t: "Libro", w: 150 },
    { k: "base", t: "Base (€)", type: "money", w: 100 },
    { k: "iva", t: "IVA (€)", type: "money", w: 90 },
    { k: "_total", t: "Total", calc: r => num(r.base) + num(r.iva), money: true },
    { k: "pagado", t: "Pagado", type: "pill", opts: ["Sí", "No"] },
    { k: "deducible", t: "Deducible", type: "pill", opts: ["Sí", "No"] },
    { k: "notas", t: "Notas", w: 160 }
  ],
  directa: [
    { k: "fecha", t: "Fecha", type: "date", w: 140 },
    { k: "cliente", t: "Cliente", w: 170 },
    { k: "libro", t: "Libro", w: 170 },
    { k: "formato", t: "Formato", type: "select", opts: ["Edición especial", "Tapa blanda", "Tapa dura", "Firma / evento", "Otro"] },
    { k: "uds", t: "Uds.", type: "number", w: 70 },
    { k: "pvp", t: "PVP ud.", type: "money", w: 90 },
    { k: "_ing", t: "Ingreso", calc: r => num(r.uds) * num(r.pvp) + num(r.envioCobrado), money: true },
    { k: "costeUd", t: "Coste ud.", type: "money", w: 90 },
    { k: "envioCobrado", t: "Envío cobrado", type: "money", w: 90 },
    { k: "costeEnvio", t: "Coste envío", type: "money", w: 90 },
    { k: "otros", t: "Regalos / extras", type: "money", w: 90 },
    { k: "_benef", t: "Beneficio", calc: r => benefDirecta(r), money: true },
    { k: "estado", t: "Estado", type: "pill", opts: ["Pendiente", "Pagado", "Enviado", "Recibido", "Incidencia"] }
  ],
  redesMes: [
    { k: "mes", t: "Mes", type: "month", w: 140 },
    { k: "instagram", t: "Instagram", type: "number", w: 100 },
    { k: "tiktok", t: "TikTok", type: "number", w: 100 },
    { k: "youtube", t: "YouTube", type: "number", w: 100 },
    { k: "newsletter", t: "Newsletter", type: "number", w: 100 },
    { k: "notas", t: "Qué pasó ese mes", w: 220 }
  ],
  derechos: [
    { k: "libro", t: "Libro", w: 170 },
    { k: "tipo", t: "Derecho", type: "select", opts: ["Traducción", "Audiolibro", "Papel (editorial)", "Adaptación audiovisual", "Otro"] },
    { k: "territorio", t: "Idioma / territorio", w: 140 },
    { k: "editorial", t: "Editorial / plataforma", w: 170 },
    { k: "firma", t: "Firma", type: "date", w: 140 },
    { k: "fin", t: "Fin de la cesión", type: "date", w: 140 },
    { k: "estado", t: "Estado", type: "pill", opts: ["Negociando", "Firmado", "En producción", "Publicado", "Vencido"] },
    { k: "anticipo", t: "Anticipo (€)", type: "money", w: 100 },
    { k: "cobrado", t: "¿Anticipo cobrado?", type: "pill", opts: ["No", "Sí"] },
    { k: "regalias", t: "Regalías cobradas (€)", type: "money", w: 110 },
    { k: "_total", t: "Total ingresado", calc: r => (r.cobrado === "Sí" ? num(r.anticipo) : 0) + num(r.regalias), money: true },
    { k: "notas", t: "Dónde está el contrato", w: 180 }
  ],
  resenas: [
    { k: "libro", t: "Libro", w: 190 },
    { k: "fecha", t: "Fecha", type: "date", w: 140 },
    { k: "plataforma", t: "Plataforma", type: "select", opts: ["Amazon.es", "Amazon.com", "Goodreads", "Otra"] },
    { k: "nota", t: "Nota media", type: "number", w: 80 },
    { k: "num", t: "Nº reseñas", type: "number", w: 90 },
    { k: "objetivo", t: "Objetivo", type: "number", w: 90 },
    { k: "_falta", t: "Faltan", calc: r => num(r.objetivo) ? Math.max(0, num(r.objetivo) - num(r.num)) : "" },
    { k: "notas", t: "Notas", w: 180 }
  ],
  eventos: [
    { k: "nombre", t: "Evento", w: 190 },
    { k: "tipo", t: "Tipo", type: "select", opts: ["Feria", "Firma", "Presentación", "Charla", "Mercado", "Club de lectura", "Otro"] },
    { k: "lugar", t: "Lugar", w: 140 },
    { k: "fecha", t: "Fecha", type: "date", w: 140 },
    { k: "tarifa", t: "Te pagan (€)", type: "money", w: 100 },
    { k: "costes", t: "Costes (€)", type: "money", w: 100 },
    { k: "libros", t: "Libros vendidos", type: "number", w: 90 },
    { k: "ventas", t: "Ventas (€)", type: "money", w: 100 },
    { k: "_benef", t: "Beneficio", calc: r => num(r.tarifa) + num(r.ventas) - num(r.costes), money: true },
    { k: "valoracion", t: "¿Repetir?", type: "pill", opts: ["Sin valorar", "Sí", "Quizá", "No"] },
    { k: "notas", t: "Notas", w: 180 }
  ],
  objetivos: [
    { k: "area", t: "Objetivo", w: 230 },
    { k: "meta", t: "Meta del año", type: "number", w: 110 },
    { k: "actual", t: "Llevas", type: "number", w: 110 },
    { k: "_pct", t: "%", calc: r => num(r.meta) ? Math.round(num(r.actual) / num(r.meta) * 100) + "%" : "" },
    { k: "_est", t: "Cómo va", calc: r => !num(r.meta) ? "" : num(r.actual) >= num(r.meta) ? "Cumplido" : num(r.actual) / num(r.meta) >= 0.75 ? "En curso" : "Lejos", pillCalc: true },
    { k: "notas", t: "Notas", w: 200 }
  ]
});
TONES["Cumplido"] = "ok"; TONES["Lejos"] = "bad"; TONES["Cobrado"] = "ok"; TONES["Sí"] = "ok";
TONES["Activo"] = "ok"; TONES["Descatalogado"] = "neu"; TONES["Próximo"] = "mid"; TONES["Firmado"] = "ok"; TONES["Negociando"] = "warm"; TONES["En escritura"] = "mid"; TONES["Parcial"] = "mid"; TONES["Quizá"] = "warm"; TONES["En producción"] = "mid"; TONES["Vencido"] = "bad";

function benefDirecta(r) { return num(r.uds) * num(r.pvp) + num(r.envioCobrado) - num(r.uds) * num(r.costeUd) - num(r.costeEnvio) - num(r.otros); }

/* Ventas de Amazon (importadas del informe de KDP) */
function eurKdp(l) {
  const n = negocio();
  if (l.formato === "KENP") return num(l.uds) * num(n.kenpTarifa);
  if (l.eur !== undefined && l.eur !== "") return num(l.eur);
  const c = l.moneda && l.moneda !== "EUR" ? num(n.cambio[l.moneda] ?? MONEDAS[l.moneda] ?? 1) : 1;
  return num(l.regalias) * c;
}
function kdpMes(ym) {
  const r = { ebook: 0, papel: 0, kenpEur: 0, kenp: 0, uds: 0, total: 0 };
  (S.kdpVentas || []).forEach(l => {
    if (l.mes !== ym) return;
    const e = eurKdp(l);
    if (l.formato === "KENP") { r.kenpEur += e; r.kenp += num(l.uds); }
    else { if (l.formato === "Ebook") r.ebook += e; else r.papel += e; r.uds += num(l.uds); }
    r.total += e;
  });
  return r;
}
const enRango = (f, a, b) => f && f >= a && f <= b;
function mesesDe(desde, hasta) { const out = []; let m = desde; while (m <= hasta) { out.push(m); m = addMonth(m, 1); } return out; }
function cifras(desde, hasta) {
  // desde/hasta: "AAAA-MM"; fechas de ingresos y gastos se comparan por día
  const d0 = desde + "-01", d1 = hasta + "-31";
  const r = { kdp: 0, kdpManual: 0, otros: 0, iva: 0, irpf: 0, directa: 0, directaBenef: 0, eventos: 0, gastos: 0, gastosDed: 0, ivaSop: 0, porCobrar: 0, porPagar: 0 };
  mesesDe(desde, hasta).forEach(m => {
    r.kdp += kdpMes(m).total;
    S.ventas.filter(v => v.mes === m).forEach(v => { if (GASTOS.includes(v.concepto)) { r.gastos += num(v.importe); r.gastosDed += num(v.importe); } else r.kdpManual += num(v.importe); });
  });
  S.ingresos.forEach(i => { if (!enRango(i.fecha, d0, d1)) return; r.otros += num(i.bruto); r.iva += num(i.iva); r.irpf += num(i.irpf); if (i.estado !== "Cobrado") r.porCobrar += num(i.bruto) + num(i.iva) - num(i.irpf); });
  S.directa.forEach(x => { if (!enRango(x.fecha, d0, d1)) return; r.directa += num(x.uds) * num(x.pvp) + num(x.envioCobrado); r.directaBenef += benefDirecta(x); r.gastos += num(x.uds) * num(x.costeUd) + num(x.costeEnvio) + num(x.otros); r.gastosDed += num(x.uds) * num(x.costeUd) + num(x.costeEnvio) + num(x.otros); });
  S.eventos.forEach(e => { if (!enRango(e.fecha, d0, d1)) return; r.eventos += num(e.tarifa) + num(e.ventas); r.gastos += num(e.costes); r.gastosDed += num(e.costes); });
  S.gastosNeg.forEach(g => { if (!enRango(g.fecha, d0, d1)) return; r.gastos += num(g.base); if (g.deducible !== "No") { r.gastosDed += num(g.base); r.ivaSop += num(g.iva); } if (g.pagado === "No") r.porPagar += num(g.base) + num(g.iva); });
  r.ingresos = r.kdp + r.kdpManual + r.otros + r.directa + r.eventos;
  r.neto = r.ingresos - r.gastos;
  r.rendimiento = r.ingresos - r.gastosDed;
  return r;
}

/* Agrupa las ventas de Amazon por libro del catálogo */
const normT = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
function libroDe(l) {
  const asin = String(l.asin || "").trim().toUpperCase();
  const cat = S.catalogo;
  let b = asin && cat.find(c => [c.asin, c.isbn].some(x => String(x || "").replace(/[-\s]/g, "").toUpperCase() === asin.replace(/[-\s]/g, "")));
  if (!b) { const t = normT(l.titulo); b = cat.filter(c => normT(c.titulo)).sort((a, z) => normT(z.titulo).length - normT(a.titulo).length).find(c => t.startsWith(normT(c.titulo))); }
  return b ? b.titulo : String(l.titulo || "Sin título").split(/[:(]/)[0].trim();
}
function porLibro(year) {
  const m = {};
  (S.kdpVentas || []).forEach(l => {
    if (!String(l.mes).startsWith(year)) return;
    const k = libroDe(l), e = eurKdp(l);
    const o = m[k] || (m[k] = { libro: k, ebook: 0, papel: 0, kenp: 0, kenpEur: 0, uds: 0, total: 0, meses: {} });
    if (l.formato === "KENP") { o.kenp += num(l.uds); o.kenpEur += e; } else { o[l.formato === "Ebook" ? "ebook" : "papel"] += e; o.uds += num(l.uds); }
    o.total += e; o.meses[l.mes] = (o.meses[l.mes] || 0) + e;
  });
  return Object.values(m).sort((a, b) => b.total - a.total);
}

/* ---- Vista: Catálogo ---- */
function tablaCatalogoCentro() {
  const c = ENLACE.centro, cuando = c.fecha ? new Date(c.fecha).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" }) : "";
  const filas = S.catalogo.map(b => `<tr><td>${esc(b.titulo)}</td><td>${esc(b.serie)}</td><td>${esc(b.genero)}</td><td><span class="chip ${tone(b.estado)}">${esc(b.estado)}</span></td><td>${b.fecha ? esc(dayLabel(b.fecha)) : ""}</td><td>${esc(b.asin)}</td><td>${esc(b.isbn)}</td></tr>`).join("");
  return `<div class="note">Tus libros y las ventas de Amazon vienen de tu <b>Centro de Control</b>${cuando ? ` (último cambio: ${esc(cuando)})` : ""}. Aquí solo se ven: para añadir o cambiar un libro, hazlo allí y se pondrá solo. <a href="../centrodecontrol/" target="_blank" rel="noopener">Abrir el Centro de Control</a></div>
    <div class="tblwrap"><table class="tbl"><thead><tr><th>Título</th><th>Serie y nº</th><th>Género</th><th>Estado</th><th>Publicado</th><th>ASIN ebook</th><th>ISBN papel</th></tr></thead><tbody>${filas || `<tr><td colspan="7" class="empty">El Centro de Control no tiene libros todavía.</td></tr>`}</tbody></table></div>`;
}
function vCatalogo() {
  const y = view.mes.slice(0, 4), libros = porLibro(y);
  const act = S.catalogo.filter(c => c.estado === "Activo").length;
  const tot = libros.reduce((s, o) => s + o.total, 0);
  const top = libros[0];
  const yPrev = String(+y - 1), mesAct = monthOf(TODAY);
  const fila = o => {
    const ult = mesAct.startsWith(y) ? (o.meses[mesAct] || 0) : 0, ant = mesAct.startsWith(y) ? (o.meses[addMonth(mesAct, -1)] || 0) : 0;
    return `<tr><td>${esc(o.libro)}</td><td class="calc">${eur(o.ebook)}</td><td class="calc">${eur(o.papel)}</td><td class="calc">${fmt(o.kenp)}</td><td class="calc">${eur(o.kenpEur)}</td><td class="calc"><b>${eur(o.total)}</b></td><td class="calc">${fmt(o.uds)}</td></tr>`;
  };
  return `
  <div class="head"><div><div class="eyebrow">Tu catálogo</div><h1>Todos tus libros</h1>
    <p>Los libros publicados y los que vienen, con su ASIN e ISBN. Abajo, lo que te ha dejado cada uno en Amazon el año que eliges con las flechas de arriba.</p></div></div>
  <div class="tiles">${tile("Libros", S.catalogo.length, act + " activos", "")}${tile("Amazon en " + y, eur(tot), "ebook + papel + KENP", tot ? "ok" : "")}
    ${tile("El que más te deja", top ? esc(top.libro) : "—", top ? eur(top.total) + " en " + y : "importa tus ventas", "lav")}</div>
  <div class="card"><div class="ch"><h3>Catálogo</h3><span class="hint">El ASIN y el ISBN sirven para reconocer cada libro en los informes de Amazon</span></div>
    ${ENLACE.centro ? tablaCatalogoCentro() : tableHTML("catalogo", "g", S.catalogo, { addLabel: "Añadir libro", empty: "Apunta aquí todos tus libros, también los descatalogados.", preset: { estado: "Activo" } })}</div>
  <div class="card"><div class="ch"><h3>Regalías de Amazon por libro en ${y}</h3><span class="hint">${ENLACE.centro ? "Salen de tu Centro de Control" : "Salen de lo que traes del Centro de control (Ajustes)"}</span></div>
    ${libros.length ? `<div class="tblwrap"><table class="tbl"><thead><tr><th>Libro</th><th>Ebook</th><th>Papel</th><th>Páginas KENP</th><th>KENP (estimado)</th><th>Total</th><th>Ejemplares</th></tr></thead><tbody>${libros.map(fila).join("")}</tbody>
    <tfoot><tr><td><b>Total</b></td><td class="calc">${eur(libros.reduce((s, o) => s + o.ebook, 0))}</td><td class="calc">${eur(libros.reduce((s, o) => s + o.papel, 0))}</td><td class="calc">${fmt(libros.reduce((s, o) => s + o.kenp, 0))}</td><td class="calc">${eur(libros.reduce((s, o) => s + o.kenpEur, 0))}</td><td class="calc"><b>${eur(tot)}</b></td><td class="calc">${fmt(libros.reduce((s, o) => s + o.uds, 0))}</td></tr></tfoot></table></div>`
      : `<p class="empty">No hay ventas de Amazon importadas de ${y}. ${(S.kdpVentas || []).some(l => String(l.mes).startsWith(yPrev)) ? "Prueba con " + yPrev + "." : ""}</p>`}</div>
  <div class="card"><div class="ch"><h3>Reseñas</h3><span class="hint">Apunta de vez en cuando cuántas tiene cada libro</span></div>
    ${tableHTML("resenas", "g", S.resenas, { addLabel: "Añadir recuento", preset: { fecha: TODAY, plataforma: "Amazon.es" } })}</div>`;
}

/* ---- Vista: Negocio ---- */
const NSUBS = [["resumen", "Resumen del año"], ["comparar", "Comparar años"], ["amazon", "Ventas de Amazon"], ["ingresos", "Otros ingresos"], ["gastos", "Gastos"], ["directa", "Venta directa"], ["impuestos", "Impuestos"], ["objetivos", "Objetivos y redes"], ["derechos", "Derechos y eventos"]];
function vNegocio() {
  const sub = NSUBS.some(s => s[0] === view.nsub) ? view.nsub : "resumen";
  const tabs = `<div class="filters">${NSUBS.map(([k, t]) => `<button type="button" data-nsub="${k}" aria-pressed="${sub === k}">${t}</button>`).join("")}</div>`;
  const body = { resumen: nResumen, comparar: nComparar, amazon: nAmazon, ingresos: nIngresos, gastos: nGastos, directa: nDirecta, impuestos: nImpuestos, objetivos: nObjetivos, derechos: nDerechos }[sub]();
  return `<div class="head"><div><div class="eyebrow">Negocio de autora</div><h1>Tu negocio</h1>
    <p>Todo el dinero de tu escritura: Amazon, otros ingresos, venta directa, gastos e impuestos. Cambia de año o de trimestre con las flechas de arriba.</p></div></div>${tabs}${body}`;
}
function nResumen() {
  const n = negocio(), y = view.mes.slice(0, 4), c = cifras(y + "-01", y + "-12");
  const obj = num(n.objetivoAnual), pct = obj ? Math.round(c.ingresos / obj * 100) : 0;
  const meses = Array.from({ length: 12 }, (_, i) => { const m = y + "-" + pad(i + 1); return { m, c: cifras(m, m) }; });
  return `
  <div class="tiles">${tile("Ingresos " + y, eur(c.ingresos), "todo lo que entra", "ok")}${tile("Gastos", eur(c.gastos), "de todas las secciones", c.gastos ? "warn" : "")}
    ${tile("Beneficio", eur(c.neto), "ingresos − gastos", c.neto < 0 ? "bad" : "ok")}${tile("Por cobrar", eur(c.porCobrar), "otros ingresos sin cobrar", c.porCobrar ? "warn" : "")}
    ${tile("Por pagar", eur(c.porPagar), "gastos sin pagar", c.porPagar ? "warn" : "")}</div>
  <div class="card"><div class="ch"><h3>Objetivo de ingresos de ${y}</h3><label class="field" style="flex-direction:row;align-items:center;gap:8px"><span>Objetivo (€)</span><input type="number" data-s="g" data-path="negocio.objetivoAnual" value="${esc(n.objetivoAnual)}" style="width:120px"></label></div>
    ${obj ? `${bar(pct, pct >= 100 ? "ok" : "")}<p class="hint" style="margin:6px 0 0">${eur(c.ingresos)} de ${eur(obj)} · ${pct}%</p>` : `<p class="hint" style="margin:0">Pon una cifra y verás cuánto te falta.</p>`}</div>
  <div class="card"><h3>Mes a mes</h3><div class="tblwrap"><table class="tbl"><thead><tr><th>Mes</th><th>Amazon</th><th>Otros ingresos</th><th>Venta directa y eventos</th><th>Gastos</th><th>Beneficio</th></tr></thead><tbody>
    ${meses.map(({ m, c: k }) => `<tr><td style="text-transform:capitalize">${MESES[+m.slice(5) - 1]}</td><td class="calc">${eur(k.kdp + k.kdpManual)}</td><td class="calc">${eur(k.otros)}</td><td class="calc">${eur(k.directa + k.eventos)}</td><td class="calc">${eur(k.gastos)}</td><td class="calc ${k.neto < 0 ? "neg" : ""}"><b>${eur(k.neto)}</b></td></tr>`).join("")}</tbody>
    <tfoot><tr><td><b>Total</b></td><td class="calc">${eur(c.kdp + c.kdpManual)}</td><td class="calc">${eur(c.otros)}</td><td class="calc">${eur(c.directa + c.eventos)}</td><td class="calc">${eur(c.gastos)}</td><td class="calc"><b>${eur(c.neto)}</b></td></tr></tfoot></table></div>
    <p class="hint" style="margin:8px 0 0">Amazon suma lo importado del informe de KDP y las líneas que apuntas a mano en Cuentas. Las páginas KENP son una estimación (${String(n.kenpTarifa).replace(".", ",")} € por página).</p></div>`;
}
function nAmazon() {
  const n = negocio(), ym = view.mes, km = kdpMes(ym);
  const rows = (S.kdpVentas || []).filter(l => l.mes === ym).sort((a, b) => eurKdp(b) - eurKdp(a));
  const meses = [...new Set((S.kdpVentas || []).map(l => l.mes))].sort();
  return `
  <div class="tiles">${tile("Ebook", eur(km.ebook), "", "ok")}${tile("Papel", eur(km.papel), "", "")}${tile("KENP", fmt(km.kenp) + " págs.", eur(km.kenpEur) + " estimado", "lav")}${tile("Total del mes", eur(km.total), fmt(km.uds) + " ejemplares", km.total ? "ok" : "")}</div>
  <div class="card"><div class="ch"><h3>Importar el informe de Amazon KDP</h3></div>
    <ol class="hint" style="margin:0 0 8px;padding-left:18px"><li>En KDP, entra en <b>Informes › Regalías previas</b> (o en el panel) y descarga el Excel del mes.</li>
      <li>Abre el Excel, selecciona la tabla <b>con la fila de títulos</b> (Fecha, Título, ASIN, Regalías…) y cópiala.</li>
      <li>Pégala aquí. Sirven las hojas de ventas (ebook y papel) y la de páginas KENP leídas.</li></ol>
    <textarea id="kdpPaste" style="width:100%;min-height:120px;font-family:monospace;font-size:.78rem" placeholder="Pega aquí las filas copiadas del Excel de KDP"></textarea>
    <div class="filters" style="margin-top:8px"><button type="button" id="kdpImport">Importar</button><span class="hint" id="kdpMsg"></span></div></div>
  <div class="card"><div class="ch"><h3 style="text-transform:capitalize">Líneas de ${mesLabel(ym)}</h3><span class="hint">${rows.length} líneas · ${meses.length ? "hay datos de " + mesLabel(meses[0]) + " a " + mesLabel(meses[meses.length - 1]) : "sin datos todavía"}</span></div>
    ${rows.length ? `<div class="tblwrap"><table class="tbl"><thead><tr><th>Libro</th><th>Tienda</th><th>Formato</th><th>Uds. / págs.</th><th>Regalías</th><th>En euros</th><th></th></tr></thead><tbody>
      ${rows.map(l => `<tr><td>${esc(libroDe(l))}</td><td>${esc(l.tienda || "")}</td><td>${esc(l.formato)}</td><td class="calc">${fmt(l.uds)}</td><td class="calc">${l.formato === "KENP" ? "—" : esc(String(num(l.regalias).toFixed(2)).replace(".", ",") + " " + (l.moneda || "EUR"))}</td><td class="calc">${eur(eurKdp(l))}</td><td><button class="del" type="button" data-del="${l.id}" data-s="g" data-l="kdpVentas" aria-label="Eliminar línea">×</button></td></tr>`).join("")}</tbody></table></div>`
      : `<p class="empty">No hay ventas importadas de este mes.</p>`}
    ${rows.length ? `<div class="filters"><button type="button" id="kdpBorrarMes">Borrar las líneas de este mes</button></div>` : ""}</div>
  <div class="card"><h3>Cambio de moneda y KENP</h3>
    <p class="hint" style="margin:0 0 8px">Las regalías en otras monedas se pasan a euros con estos cambios. Actualízalos de vez en cuando (1 unidad de la moneda = X €).</p>
    <div class="fgrid">${Object.keys(MONEDAS).filter(k => k !== "EUR").map(k => field(k, `data-s="g" data-path="negocio.cambio.${k}"`, n.cambio[k], "number")).join("")}
      ${field("Euros por página KENP", `data-s="g" data-path="negocio.kenpTarifa"`, n.kenpTarifa, "number")}</div></div>`;
}
function nIngresos() {
  const y = view.mes.slice(0, 4), c = cifras(y + "-01", y + "-12");
  const rows = S.ingresos.filter(i => !i.fecha || i.fecha.startsWith(y)).sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
  return `<div class="tiles">${tile("Otros ingresos " + y, eur(c.otros), "base, sin IVA", "ok")}${tile("IRPF que te han retenido", eur(c.irpf), "lo descuentas en la Renta", "lav")}${tile("Por cobrar", eur(c.porCobrar), "", c.porCobrar ? "warn" : "")}</div>
  <div class="card"><div class="ch"><h3>Facturas y cobros de ${y}</h3><span class="hint">Club de lectura, charlas, talleres, editoriales…</span></div>
    ${tableHTML("ingresos", "g", rows, { addLabel: "Añadir ingreso", preset: { fecha: TODAY, linea: "Club de lectura", estado: "Pendiente", irpf: "", iva: 0 }, empty: "Sin ingresos apuntados este año." })}
    <p class="hint" style="margin:8px 0 0">El IRPF retenido se calcula solo si pones la base: al escribirla se rellena con el ${esc(negocio().irpfPct)} %. Puedes cambiarlo a mano.</p></div>`;
}
function nGastos() {
  const y = view.mes.slice(0, 4), c = cifras(y + "-01", y + "-12");
  const rows = S.gastosNeg.filter(g => !g.fecha || g.fecha.startsWith(y)).sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
  const porCat = {}; rows.forEach(g => { porCat[g.categoria || "Otros"] = (porCat[g.categoria || "Otros"] || 0) + num(g.base); });
  return `<div class="tiles">${tile("Gastos generales " + y, eur(rows.reduce((s, g) => s + num(g.base), 0)), "base, sin IVA", "warn")}${tile("IVA soportado", eur(c.ivaSop), "gastos deducibles", "lav")}${tile("Por pagar", eur(c.porPagar), "", c.porPagar ? "warn" : "")}</div>
  <div class="card"><div class="ch"><h3>Gastos del negocio en ${y}</h3><span class="hint">Los costes de un libro concreto (correctora, portada…) también puedes llevarlos en Cuentas</span></div>
    ${tableHTML("gastosNeg", "g", rows, { addLabel: "Añadir gasto", preset: { fecha: TODAY, categoria: "Suscripciones", pagado: "Sí", deducible: "Sí", iva: "" }, empty: "Sin gastos apuntados este año." })}
    ${Object.keys(porCat).length ? `<p class="hint" style="margin:8px 0 0">Por categoría: ${Object.entries(porCat).sort((a, b) => b[1] - a[1]).map(([k, v]) => esc(k) + " " + eur(v)).join(" · ")}</p>` : ""}</div>`;
}
function nDirecta() {
  const y = view.mes.slice(0, 4);
  const rows = S.directa.filter(x => !x.fecha || x.fecha.startsWith(y));
  const all = view.dirTodo ? S.directa : rows;
  const ing = all.reduce((s, x) => s + num(x.uds) * num(x.pvp) + num(x.envioCobrado), 0), ben = all.reduce((s, x) => s + benefDirecta(x), 0), uds = all.reduce((s, x) => s + num(x.uds), 0);
  return `<div class="tiles">${tile("Ejemplares", fmt(uds), "", "")}${tile("Ingresos", eur(ing), "", "ok")}${tile("Beneficio", eur(ben), "después de libro, envío y regalos", ben < 0 ? "bad" : "ok")}${tile("Pendientes", all.filter(x => x.estado === "Pendiente").length, "pedidos", "warn")}</div>
  <div class="card"><div class="ch"><h3>Ventas que haces tú</h3><div class="filters" style="margin:0"><button type="button" data-dirtodo="0" aria-pressed="${!view.dirTodo}">Solo ${y}</button><button type="button" data-dirtodo="1" aria-pressed="${!!view.dirTodo}">Todas</button></div></div>
    <p class="hint" style="margin:0 0 8px">Ediciones especiales, ventas en firmas y pedidos de cualquier libro del catálogo. La preventa de la novela que estás lanzando sigue en Pedidos.</p>
    ${S.directa.some(x => !x.fecha) ? `<p class="hint" style="margin:0 0 8px;color:var(--aviso)">Hay ${S.directa.filter(x => !x.fecha).length} ventas sin fecha: salen aquí, pero no cuentan en el resumen del año ni en los impuestos hasta que les pongas la fecha.</p>` : ""}
    ${tableHTML("directa", "g", all, { addLabel: "Añadir venta", preset: { fecha: TODAY, uds: 1, formato: "Edición especial", estado: "Pendiente" }, empty: "Sin ventas directas." })}</div>`;
}
function trimestre(ym) { const y = ym.slice(0, 4), q = Math.floor((+ym.slice(5) - 1) / 3); return { y, q: q + 1, desde: y + "-" + pad(q * 3 + 1), hasta: y + "-" + pad(q * 3 + 3) }; }
function nImpuestos() {
  const n = negocio(), t = trimestre(view.mes), c = cifras(t.desde, t.hasta), ac = cifras(t.y + "-01", t.hasta);
  const iva = c.iva - c.ivaSop;
  const frac = Math.max(0, ac.rendimiento * num(n.pagoFracPct) / 100 - ac.irpf);
  const plazo = ["1-20 de abril", "1-20 de julio", "1-20 de octubre", "1-30 de enero"][t.q - 1];
  const texto = resumenGestoria(t, c, ac, iva, frac);
  return `<div class="card"><div class="ch"><h3>Trimestre ${t.q} de ${t.y}</h3><span class="hint">Cambia de trimestre con las flechas de arriba · se presenta del ${plazo}</span></div>
    <div class="tiles">${tile("Ingresos del trimestre", eur(c.ingresos), "Amazon " + eur(c.kdp + c.kdpManual) + " · otros " + eur(c.otros + c.directa + c.eventos), "ok")}
      ${tile("Gastos deducibles", eur(c.gastosDed), "", "warn")}${tile("Rendimiento neto", eur(c.rendimiento), "ingresos − gastos deducibles", c.rendimiento < 0 ? "bad" : "")}
      ${tile("IVA (303)", eur(iva), eur(c.iva) + " repercutido − " + eur(c.ivaSop) + " soportado", iva > 0 ? "warn" : "")}
      ${tile("Pago fraccionado estimado", eur(frac), n.pagoFracPct + " % del rendimiento del año − retenciones", "lav")}</div>
    <p class="hint" style="margin:8px 0 0">Es una estimación para que no te pille por sorpresa. Las regalías de Amazon no llevan IVA español. Si tributas en una Hacienda foral (Álava, Bizkaia, Gipuzkoa o Navarra), los modelos, plazos y porcentajes pueden cambiar: confírmalo con tu gestoría.</p></div>
  <div class="card"><div class="ch"><h3>Resumen para la gestoría</h3><button class="btn ghost sm" type="button" id="gestCopiar">Copiar</button></div>
    <div class="fgrid">${field("Nombre", `data-s="g" data-path="perfil.nombre"`, perfil().nombre)}${field("NIF", `data-s="g" data-path="negocio.nif"`, n.nif)}${field("Actividad", `data-s="g" data-path="negocio.actividad"`, n.actividad)}</div>
    <pre class="gest" id="gestTxt" style="white-space:pre-wrap;background:var(--nube);border-radius:8px;padding:12px;font-size:.82rem;margin:10px 0 0">${esc(texto)}</pre></div>
  <div class="card"><h3>Porcentajes</h3><div class="fgrid">${field("IRPF que te retienen en las facturas (%)", `data-s="g" data-path="negocio.irpfPct"`, n.irpfPct, "number")}${field("Pago fraccionado (%)", `data-s="g" data-path="negocio.pagoFracPct"`, n.pagoFracPct, "number")}</div></div>`;
}
function resumenGestoria(t, c, ac, iva, frac) {
  const n = negocio(), L = (a, b) => (a + ":").padEnd(42, " ") + b;
  return [`${perfil().nombre || "Autora"}${n.nif ? " · NIF " + n.nif : ""}`, n.actividad, `Trimestre ${t.q} de ${t.y}`, "",
    L("Regalías de Amazon (KDP + KENP)", eur(c.kdp + c.kdpManual)), L("Otros ingresos (base)", eur(c.otros)), L("Venta directa y eventos", eur(c.directa + c.eventos)),
    L("Total ingresos", eur(c.ingresos)), L("Gastos deducibles (base)", eur(c.gastosDed)), L("Rendimiento neto del trimestre", eur(c.rendimiento)), "",
    L("IVA repercutido", eur(c.iva)), L("IVA soportado deducible", eur(c.ivaSop)), L("IVA resultante (303)", eur(iva)), "",
    L("Rendimiento acumulado del año", eur(ac.rendimiento)), L("Retenciones de IRPF acumuladas", eur(ac.irpf)), L("Pago fraccionado estimado", eur(frac)), "",
    "Cifras estimadas desde Kit Escritoras el " + dayLabel(TODAY) + " de " + TODAY.slice(0, 4) + "."].join("\n");
}
function nObjetivos() {
  const r = [...S.redesMes].sort((a, b) => String(a.mes).localeCompare(String(b.mes)));
  const first = r[0], last = r[r.length - 1];
  const dif = k => first && last && first !== last && num(last[k]) && num(first[k]) ? (num(last[k]) - num(first[k]) >= 0 ? "+" : "") + fmt(num(last[k]) - num(first[k])) : "";
  return `<div class="card"><div class="ch"><h3>Objetivos del año</h3><span class="hint">Libros publicados, reseñas, suscriptoras, ingresos…</span></div>
    ${tableHTML("objetivos", "g", S.objetivos, { addLabel: "Añadir objetivo", empty: "Ponte dos o tres objetivos para el año." })}</div>
  <div class="card"><div class="ch"><h3>Seguidores mes a mes</h3><span class="hint">Apunta las cifras el día 1 de cada mes</span></div>
    ${last ? `<div class="tiles">${[["instagram", "Instagram"], ["tiktok", "TikTok"], ["youtube", "YouTube"], ["newsletter", "Newsletter"]].map(([k, t]) => tile(t, fmt(last[k]), dif(k) ? dif(k) + " desde " + mesLabel(first.mes) : "", "")).join("")}</div>` : ""}
    ${tableHTML("redesMes", "g", r, { addLabel: "Añadir mes", preset: { mes: monthOf(TODAY) }, empty: "Sin cifras todavía." })}</div>`;
}
function nDerechos() {
  return `<div class="card"><div class="ch"><h3>Derechos cedidos</h3><span class="hint">Traducciones, audiolibros, ediciones en papel con editorial…</span></div>
    ${tableHTML("derechos", "g", S.derechos, { addLabel: "Añadir contrato", preset: { estado: "Negociando", cobrado: "No" }, empty: "Sin contratos de derechos." })}</div>
  <div class="card"><div class="ch"><h3>Eventos</h3><span class="hint">Ferias, firmas, presentaciones y charlas: lo que cuestan y lo que dejan</span></div>
    ${tableHTML("eventos", "g", [...S.eventos].sort((a, b) => String(a.fecha).localeCompare(String(b.fecha))), { addLabel: "Añadir evento", preset: { tipo: "Feria", valoracion: "Sin valorar" }, empty: "Sin eventos apuntados." })}</div>`;
}

/* ---- Importar el informe de KDP pegado desde Excel ---- */
function parseTabla(txt) {
  const filas = String(txt || "").replace(/\r/g, "").split("\n").filter(l => l.trim());
  return filas.map(l => l.split(l.includes("\t") ? "\t" : /;|,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(c => c.replace(/^"|"$/g, "").trim()));
}
function numKdp(v) { let s = String(v || "").replace(/[^\d,.\-]/g, ""); if (s.includes(",") && s.includes(".")) s = s.lastIndexOf(",") > s.lastIndexOf(".") ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, ""); else s = s.replace(",", "."); return num(s); }
function mesKdp(v) {
  const s = String(v || "").trim();
  let m = s.match(/^(\d{4})[-\/](\d{1,2})/); if (m) return m[1] + "-" + pad(+m[2]);
  m = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/); if (m) return m[3] + "-" + pad(+m[2]);
  const n = num(s); if (n > 30000 && n < 80000) { const d = new Date(Date.UTC(1899, 11, 30) + n * 86400000); return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1); }
  return "";
}
function importarKdp(txt) {
  const t = parseTabla(txt);
  const hi = t.findIndex(r => r.some(c => /t[ií]tulo|title/i.test(c)) && r.some(c => /regal|royalt|kenp|p[aá]ginas/i.test(c)));
  if (hi < 0) return { error: "No encuentro la fila de títulos. Copia la tabla incluyendo la fila de arriba (Fecha, Título, ASIN…)." };
  const h = t[hi].map(c => normT(c));
  const col = (...re) => h.findIndex(c => re.some(r => r.test(c)));
  const cF = col(/^fecha/, /^royalty date/, /^date/, /^mes/, /^period/), cT = col(/^titulo/, /^title/), cA = col(/^asin/, /isbn/),
    cS = col(/^tienda/, /marketplace/, /^store/), cX = col(/transacc/, /transaction/, /^tipo de transacc/, /^formato/),
    cU = col(/netas/, /net units/, /unidades netas/), cR = col(/^regalias$/, /^royalty$/, /^regalias eur/), cRe = h.findIndex(c => /regalias eur/.test(c)),
    cM = col(/^moneda/, /^currency/), cK = col(/kenp/, /paginas.*leidas/, /pages read/);
  if (cT < 0) return { error: "No encuentro la columna del título." };
  const esKenp = cK >= 0 && cR < 0;
  const out = [];
  t.slice(hi + 1).forEach(r => {
    const titulo = r[cT]; if (!titulo || /^total/i.test(titulo)) return;
    const mes = cF >= 0 ? mesKdp(r[cF]) : view.mes; if (!mes) return;
    const tx = cX >= 0 ? normT(r[cX]) : "";
    const formato = esKenp ? "KENP" : /blanda|paperback/.test(tx) ? "Tapa blanda" : /dura|hardcover/.test(tx) ? "Tapa dura" : "Ebook";
    const l = { id: uid(), mes, titulo, asin: cA >= 0 ? r[cA] : "", tienda: cS >= 0 ? r[cS] : "", formato,
      uds: esKenp ? numKdp(r[cK]) : (cU >= 0 ? numKdp(r[cU]) : 0), regalias: esKenp ? "" : numKdp(r[cR]), moneda: cM >= 0 ? String(r[cM] || "EUR").toUpperCase() : "EUR" };
    if (cRe >= 0 && r[cRe] !== "") l.eur = numKdp(r[cRe]);
    if (!esKenp && !l.uds && !l.regalias) return;
    if (esKenp && !l.uds) return;
    out.push(l);
  });
  if (!out.length) return { error: "No he encontrado ventas debajo de la fila de títulos." };
  return { lineas: out };
}

/* ---- Traer los datos del Excel «Centro de control» (archivo preparado) ---- */
function cargarCentroControl(d) {
  if (!d || d.tipo !== "centro-control-para-kit") return "Ese archivo no viene del Centro de control.";
  const pend = [];
  NEG_LISTAS.forEach(k => { if (Array.isArray(d[k])) pend.push([k, d[k].length]); });
  if (!pend.length) return "El archivo no trae datos.";
  return { pend, aplicar: () => {
    NEG_LISTAS.forEach(k => { if (Array.isArray(d[k])) S[k] = d[k].map(x => Object.assign({ id: uid() }, x)); });
    if (d.negocio) Object.assign(negocio(), d.negocio);
  } };
}
/* ---- Leer directamente el Excel «Centro de control» (.xlsx) ---- */
function cargarLibreriaExcel() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  return new Promise((ok, mal) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
    s.onload = () => window.XLSX ? ok(window.XLSX) : mal(new Error("sin XLSX"));
    s.onerror = () => mal(new Error("No se ha podido cargar el lector de Excel. Comprueba que tienes internet."));
    document.head.appendChild(s);
  });
}
function excelACentro(X, wb) {
  const hoja = n => wb.Sheets[n] || null;
  const celda = (ws, ref) => { const c = ws && ws[ref]; return !c || c.t === "e" ? null : c.v; };
  const ultima = ws => ws && ws["!ref"] ? X.utils.decode_range(ws["!ref"]).e.r + 1 : 0;
  function* filas(nombre, desde, hasta) {
    const ws = hoja(nombre); if (!ws) return;
    const fin = hasta || ultima(ws);
    for (let r = desde; r <= fin; r++) yield { r, v: col => celda(ws, col + r) };
  }
  const t = v => {
    if (v === null || v === undefined) return "";
    const s = String(v).split(/\r?\n/).map(x => x.trim()).filter(Boolean).join(" · ");
    return ["-", "#VALUE!", "None"].includes(s) ? "" : s;
  };
  const n = v => {
    if (v === null || v === undefined || v === "" || v === "-") return "";
    const x = typeof v === "number" ? v : Number(String(v).trim());
    return Number.isFinite(x) ? Math.round(x * 10000) / 10000 : "";
  };
  const ymd = v => {
    if (typeof v === "number" && v > 20000 && v < 80000) {
      const d = new Date(Math.round((v - 25569) * 86400000));
      return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate());
    }
    if (v instanceof Date) return v.getFullYear() + "-" + pad(v.getMonth() + 1) + "-" + pad(v.getDate());
    const m = String(v || "").trim().match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
    return m ? `${m[1]}-${m[2]}-${m[3] || "01"}` : "";
  };
  const ym = v => ymd(v).slice(0, 7);
  const si = v => t(v).toLowerCase().startsWith("s");
  const out = { tipo: "centro-control-para-kit", origen: "Excel Centro de control", creado: TODAY };

  out.catalogo = [];
  for (const { v } of filas("BIBLIOTECA", 8)) {
    if (!t(v("A"))) continue;
    out.catalogo.push({ titulo: t(v("A")), serie: t(v("F")), genero: t(v("G")), estado: t(v("I")) || "Activo", fecha: ymd(v("M")),
      asin: /^[A-Z0-9]{10}$/.test(t(v("R"))) ? t(v("R")) : "", isbn: t(v("S")) || t(v("T")), enlace: t(v("J")), notas: t(v("B")) });
  }
  // Amazon KDP: ventas desde la fila 17 hasta el bloque «KENP · PEGA AQUÍ», y KENP después
  out.kdpVentas = [];
  const kws = hoja("AMAZON KDP");
  if (kws) {
    let marca = 0;
    for (let r = 17; r <= ultima(kws); r++) if (/^KENP/i.test(t(celda(kws, "A" + r)))) { marca = r; break; }
    for (const { v } of filas("AMAZON KDP", 17, marca ? marca - 1 : ultima(kws))) {
      if (!t(v("B"))) continue;
      const tx = t(v("G")).toLowerCase(), mes = ym(v("A"));
      if (!mes) continue;
      const l = { mes, titulo: t(v("B")), asin: t(v("D")), tienda: t(v("E")),
        formato: tx.includes("blanda") || tx.includes("paperback") ? "Tapa blanda" : tx.includes("dura") || tx.includes("hardcover") ? "Tapa dura" : "Ebook",
        uds: n(v("J")) || 0, regalias: n(v("N")) || 0, moneda: t(v("O")) || "EUR" };
      if (n(v("P")) !== "") l.eur = n(v("P"));
      out.kdpVentas.push(l);
    }
    if (marca) for (const { v } of filas("AMAZON KDP", marca + 1)) {
      if (!t(v("B")) || n(v("F")) === "") continue;
      const mes = ym(v("A")); if (!mes) continue;
      out.kdpVentas.push({ mes, titulo: t(v("B")), asin: t(v("D")), tienda: t(v("E")), formato: "KENP", uds: n(v("F")), regalias: "", moneda: "EUR" });
    }
  }
  out.ingresos = [];
  for (const { v } of filas("INGRESOS NO KDP", 8)) {
    if (!(t(v("B")) || n(v("E")))) continue;
    out.ingresos.push({ fecha: ymd(v("A")), concepto: t(v("B")), linea: t(v("C")), cliente: t(v("D")), bruto: n(v("E")), iva: n(v("G")) || 0, irpf: n(v("F")) || 0, irpfManual: true,
      estado: t(v("I")) || "Pendiente", factura: t(v("K")), notas: t(v("M")) });
  }
  out.gastosNeg = [];
  for (const { v } of filas("GASTOS", 8)) {
    if (!t(v("B"))) continue;
    out.gastosNeg.push({ fecha: ymd(v("A")), concepto: t(v("B")), categoria: t(v("C")) || "Otros", proveedor: t(v("E")), libro: t(v("F")), base: n(v("G")), iva: n(v("H")) || 0,
      pagado: si(v("J")) ? "Sí" : "No", deducible: t(v("L")).toLowerCase().startsWith("n") ? "No" : "Sí", notas: [t(v("D")), t(v("M"))].filter(Boolean).join(" · ") });
  }
  out.directa = [];
  for (const { v } of filas("VENTA DIRECTA", 8)) {
    if (!(t(v("C")) || t(v("D")))) continue;
    let est = t(v("O")) || "Pendiente"; if (est === "Enviado" && t(v("P")) === "Recibido") est = "Recibido";
    out.directa.push({ fecha: ymd(v("A")), cliente: t(v("C")), libro: t(v("D")), formato: t(v("E")) || "Edición especial", uds: n(v("F")) || 0, pvp: n(v("G")),
      costeUd: n(v("J")), envioCobrado: n(v("K")) || 0, costeEnvio: n(v("L")) || 0, otros: n(v("M")) || 0, estado: est, pedido: t(v("B")) });
  }
  const anio = String(celda(hoja("CONFIG"), "B9") || TODAY.slice(0, 4));
  out.redesMes = [];
  let i = 0;
  for (const { v } of filas("CRECIMIENTO REDES", 13, 24)) {
    i++;
    const vals = { instagram: n(v("B")), tiktok: n(v("D")), youtube: n(v("F")), newsletter: n(v("H")) };
    if (Object.values(vals).some(x => x !== "")) out.redesMes.push(Object.assign({ mes: anio + "-" + pad(i), notas: "" }, vals));
  }
  out.derechos = [];
  for (const { v } of filas("DERECHOS", 9)) {
    const a = t(v("A")); if (!a || a.startsWith("🧪")) continue;
    out.derechos.push({ libro: a, tipo: t(v("B")), territorio: t(v("C")), editorial: t(v("D")), firma: ymd(v("F")), fin: ymd(v("H")), estado: t(v("G")), anticipo: n(v("I")),
      cobrado: si(v("J")) ? "Sí" : "No", regalias: n(v("M")), notas: t(v("Q")) });
  }
  out.resenas = [];
  for (const { v } of filas("RESEÑAS", 8)) {
    if (!t(v("A"))) continue;
    out.resenas.push({ libro: t(v("A")), fecha: ymd(v("B")), plataforma: t(v("C")), nota: n(v("E")), num: n(v("F")), objetivo: n(v("G")), notas: t(v("I")) });
  }
  out.eventos = [];
  for (const { v } of filas("EVENTOS", 11)) {
    if (!t(v("A"))) continue;
    out.eventos.push({ nombre: t(v("A")), tipo: t(v("B")), lugar: t(v("C")), fecha: ymd(v("D")), tarifa: n(v("F")), costes: n(v("G")), libros: n(v("L")), ventas: n(v("M")), valoracion: "Sin valorar", notas: t(v("O")) });
  }
  out.objetivos = [];
  for (const { v } of filas("OBJETIVOS", 8)) {
    if (!t(v("A"))) continue;
    out.objetivos.push({ area: t(v("A")), meta: n(v("B")), actual: n(v("E")), notas: t(v("H")) });
  }
  const cfg = hoja("CONFIG"), cambio = {};
  for (let r = 9; r <= 19; r++) { const k = t(celda(cfg, "O" + r)), val = n(celda(cfg, "P" + r)); if (k && val !== "") cambio[k] = val; }
  out.negocio = { objetivoAnual: n(celda(cfg, "B10")), cambio, kenpTarifa: 0.0042, actividad: t(celda(hoja("RESUMEN GESTORÍA"), "D11")) || "Autora" };
  // Sin ninguna de las hojas del Centro de control, no es ese Excel
  if (!["BIBLIOTECA", "AMAZON KDP", "GASTOS", "VENTA DIRECTA", "INGRESOS NO KDP"].some(hoja)) return null;
  return out;
}

const NOMBRES_LISTAS = { catalogo: "libros", kdpVentas: "líneas de Amazon", ingresos: "ingresos", gastosNeg: "gastos", directa: "ventas directas", redesMes: "meses de seguidores", derechos: "contratos", resenas: "recuentos de reseñas", eventos: "eventos", objetivos: "objetivos", historico: "años apuntados a mano" };
function abrirCentroControl() {
  openModal(`<h2>Traer datos del Centro de control</h2>
    <p style="margin:0">Elige tu Excel <b>CENTRO CONTROL</b> (.xlsx) tal cual, o el archivo <b>centro-control-para-kit.json</b>. Se cargan tu catálogo, las ventas de Amazon, los ingresos, gastos, venta directa, derechos, reseñas, eventos y objetivos.</p>
    <p class="hint" style="margin:0">Ojo: sustituye lo que tengas en esas secciones del Kit. Si has apuntado cosas aquí que no están en el Excel, haz antes una copia de seguridad.</p>
    <label class="btn ghost" style="display:inline-flex;align-items:center;align-self:flex-start">Elegir archivo<input type="file" id="ccFile" accept=".xlsx,.xlsm,.json,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" style="display:none"></label>
    <p class="hint" id="ccMsg" style="margin:0"></p>
    <div class="acts"><button class="btn ghost" type="button" data-close>Cerrar</button></div>`, box => {
    $("#ccFile", box).addEventListener("change", e => {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      const msg = $("#ccMsg", box);
      const seguir = d => {
        const res = cargarCentroControl(d);
        if (typeof res === "string") { msg.textContent = res; return; }
        msg.innerHTML = `Trae ${res.pend.map(([k, n]) => n + " " + NOMBRES_LISTAS[k]).join(", ")}. Sustituye lo que haya ahora en esas secciones. <button class="btn sm" type="button" id="ccSi">Cargar</button>`;
        $("#ccSi", box).addEventListener("click", () => { res.aplicar(); closeModal(); save(); location.hash = "catalogo"; render(); toast("Datos del Centro de control cargados"); });
      };
      if (/\.xls[xm]$/i.test(f.name)) {
        msg.textContent = "Leyendo el Excel… (puede tardar unos segundos)";
        Promise.all([cargarLibreriaExcel(), f.arrayBuffer()]).then(([X, buf]) => {
          const wb = X.read(new Uint8Array(buf), { type: "array", cellDates: false, cellStyles: false, cellFormula: false, sheetStubs: false });
          const d = excelACentro(X, wb);
          if (!d) { msg.textContent = "Ese Excel no parece el Centro de control: no tiene las hojas BIBLIOTECA, AMAZON KDP, GASTOS…"; return; }
          seguir(d);
        }).catch(er => { msg.textContent = er && er.message && er.message.startsWith("No se ha podido") ? er.message : "No he podido leer ese Excel. ¿Está guardado como .xlsx?"; });
        return;
      }
      const r = new FileReader();
      r.onload = () => { let d; try { d = JSON.parse(String(r.result)); } catch (er) { d = null; } seguir(d); };
      r.readAsText(f);
    });
  });
}

/* ---- Negocio › Comparar años (el año elegido y los cinco anteriores) ---- */
COLS.historico = [
  { k: "anio", t: "Año", type: "number", w: 80 },
  { k: "amazon", t: "Amazon (€)", type: "money", w: 110 },
  { k: "ejemplares", t: "Ejemplares Amazon", type: "number", w: 100 },
  { k: "kenp", t: "Páginas KENP", type: "number", w: 110 },
  { k: "otros", t: "Otros ingresos (€)", type: "money", w: 110 },
  { k: "directa", t: "Venta directa y eventos (€)", type: "money", w: 120 },
  { k: "gastos", t: "Gastos (€)", type: "money", w: 100 },
  { k: "notas", t: "Notas", w: 200 }
];
function datosAnio(y) {
  const c = cifras(y + "-01", y + "-12");
  const h = (S.historico || []).find(x => String(x.anio) === String(y)) || {};
  let uds = 0, kenp = 0;
  (S.kdpVentas || []).forEach(l => { if (!String(l.mes).startsWith(y)) return; if (l.formato === "KENP") kenp += num(l.uds); else uds += num(l.uds); });
  const manual = {};
  const pick = (k, auto) => { if (auto) return auto; if (num(h[k])) { manual[k] = true; return num(h[k]); } return 0; };
  const r = {
    amazon: pick("amazon", c.kdp + c.kdpManual), ejemplares: pick("ejemplares", uds), kenp: pick("kenp", kenp),
    otros: pick("otros", c.otros), directa: pick("directa", c.directa + c.eventos), gastos: pick("gastos", c.gastos)
  };
  r.ingresos = r.amazon + r.otros + r.directa;
  r.beneficio = r.ingresos - r.gastos;
  r.lanzamientos = S.catalogo.filter(b => String(b.fecha || "").startsWith(y));
  const redes = S.redesMes.filter(m => String(m.mes).startsWith(y)).sort((a, b) => String(a.mes).localeCompare(String(b.mes)));
  const ult = redes[redes.length - 1] || {};
  r.instagram = num(ult.instagram); r.newsletter = num(ult.newsletter);
  r.resenas = S.resenas.filter(x => String(x.fecha || "").startsWith(y)).reduce((m, x) => Math.max(m, num(x.num)), 0);
  r.manual = manual;
  r.hay = r.ingresos || r.gastos || r.ejemplares || r.kenp;
  return r;
}
function variacion(a, b) {
  // a: año anterior, b: este año
  if (!a && !b) return "";
  if (!a) return `<span class="var up">nuevo</span>`;
  const p = Math.round((b - a) / Math.abs(a) * 100);
  return `<span class="var ${p > 0 ? "up" : p < 0 ? "down" : ""}">${p > 0 ? "▲ +" : p < 0 ? "▼ " : "= "}${p}%</span>`;
}
function porQue(y, d, dp) {
  // Explicaciones automáticas de qué cambió entre y-1 y y
  const out = [], yp = String(+y - 1);
  if (!d.hay) return [`No hay datos de ${y}.`];
  if (!dp.hay) return [`No hay datos de ${yp} para comparar. Importa sus ventas de Amazon o apunta sus cifras en «Años sin detalle».`];
  const dif = d.ingresos - dp.ingresos;
  out.push(`Ingresos ${dif >= 0 ? "suben" : "bajan"} ${eur(Math.abs(dif))} (${eur(dp.ingresos)} → ${eur(d.ingresos)}).`);
  const partes = [["Amazon", d.amazon - dp.amazon], ["otros ingresos", d.otros - dp.otros], ["venta directa y eventos", d.directa - dp.directa]].filter(x => Math.abs(x[1]) >= 1).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  if (partes.length && Math.abs(dif) >= 1) out.push(`Lo que más pesa: ${partes.slice(0, 2).map(([k, v]) => k + " (" + (v >= 0 ? "+" : "−") + eur(Math.abs(v)) + ")").join(" y ")}.`);
  if (dp.kenp || d.kenp) out.push(`Páginas leídas en Kindle Unlimited: ${fmt(dp.kenp)} → ${fmt(d.kenp)}${dp.kenp ? " (" + Math.round((d.kenp - dp.kenp) / dp.kenp * 100) + "%)" : ""}.`);
  const la = porLibro(y), lb = porLibro(yp), mb = {}; lb.forEach(o => mb[o.libro] = o.total);
  const cambios = la.map(o => [o.libro, o.total - (mb[o.libro] || 0), !!mb[o.libro]]);
  lb.forEach(o => { if (!la.some(x => x.libro === o.libro)) cambios.push([o.libro, -o.total, true]); });
  const sube = cambios.filter(c => c[1] > 1).sort((a, b) => b[1] - a[1]).slice(0, 3), baja = cambios.filter(c => c[1] < -1).sort((a, b) => a[1] - b[1]).slice(0, 3);
  if (sube.length) out.push(`Libros que tiran hacia arriba: ${sube.map(([l, v, ant]) => esc(l) + " +" + eur(v) + (ant ? "" : " (primer año con ventas)")).join(", ")}.`);
  if (baja.length) out.push(`Libros que bajan: ${baja.map(([l, v]) => esc(l) + " −" + eur(-v)).join(", ")}.`);
  if (d.lanzamientos.length) out.push(`Publicaste ${d.lanzamientos.length === 1 ? "un libro" : d.lanzamientos.length + " libros"}: ${d.lanzamientos.map(b => esc(b.titulo) + (b.fecha ? " (" + mesLabel(b.fecha.slice(0, 7)) + ")" : "")).join(", ")}.`);
  else if (dp.lanzamientos.length) out.push(`Este año no publicaste nada nuevo (en ${yp} salieron ${dp.lanzamientos.length}): sin lanzamiento, las ventas suelen bajar.`);
  const dg = d.gastos - dp.gastos;
  if (Math.abs(dg) >= 1) {
    const cat = yy => { const m = {}; S.gastosNeg.forEach(g => { if (String(g.fecha || "").startsWith(yy)) m[g.categoria || "Otros"] = (m[g.categoria || "Otros"] || 0) + num(g.base); }); return m; };
    const ca = cat(y), cb = cat(yp), ks = [...new Set([...Object.keys(ca), ...Object.keys(cb)])].map(k => [k, (ca[k] || 0) - (cb[k] || 0)]).filter(x => Math.abs(x[1]) >= 1).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
    out.push(`Gastos ${dg > 0 ? "suben" : "bajan"} ${eur(Math.abs(dg))}${ks.length ? ", sobre todo en " + ks.slice(0, 2).map(([k, v]) => esc(k) + " (" + (v >= 0 ? "+" : "−") + eur(Math.abs(v)) + ")").join(" y ") : ""}.`);
  }
  // meses que más cambian
  const mm = Array.from({ length: 12 }, (_, i) => { const a = cifras(yp + "-" + pad(i + 1), yp + "-" + pad(i + 1)).ingresos, b = cifras(y + "-" + pad(i + 1), y + "-" + pad(i + 1)).ingresos; return [i, b - a]; }).filter(x => Math.abs(x[1]) >= 1);
  const mejor = [...mm].sort((a, b) => b[1] - a[1])[0], peor = [...mm].sort((a, b) => a[1] - b[1])[0];
  if (mejor && mejor[1] > 0) out.push(`Donde más mejoras: ${MESES[mejor[0]]} (+${eur(mejor[1])} frente a ${MESES[mejor[0]]} de ${yp}).`);
  if (peor && peor[1] < 0) out.push(`Donde más fallas: ${MESES[peor[0]]} (−${eur(-peor[1])} frente a ${MESES[peor[0]]} de ${yp}).`);
  if (d.instagram && dp.instagram) out.push(`Instagram: ${fmt(dp.instagram)} → ${fmt(d.instagram)} seguidores.`);
  if (d.newsletter && dp.newsletter) out.push(`Newsletter: ${fmt(dp.newsletter)} → ${fmt(d.newsletter)} suscriptoras.`);
  if (Object.keys(d.manual).length || Object.keys(dp.manual).length) out.push(`Alguna cifra sale de «Años sin detalle» (apuntada a mano), así que no se puede bajar a libros ni a meses.`);
  return out;
}
function nComparar() {
  const y = +view.mes.slice(0, 4), anios = Array.from({ length: 6 }, (_, i) => String(y - 5 + i));
  const D = {}; anios.concat([String(y - 6)]).forEach(a => D[a] = datosAnio(a));
  const n = negocio(); if (!n.notasAnio || typeof n.notasAnio !== "object") n.notasAnio = {};
  const filas = [
    ["Ingresos totales", "ingresos", eur], ["Amazon (ebook, papel y KENP)", "amazon", eur], ["Ejemplares vendidos en Amazon", "ejemplares", fmt], ["Páginas KENP leídas", "kenp", fmt],
    ["Otros ingresos", "otros", eur], ["Venta directa y eventos", "directa", eur], ["Gastos", "gastos", eur, true], ["Beneficio", "beneficio", eur],
    ["Libros publicados", "lanzamientos", v => fmt(v.length)], ["Seguidores en Instagram (fin de año)", "instagram", fmt], ["Suscriptoras newsletter (fin de año)", "newsletter", fmt]
  ];
  const val = (a, k) => k === "lanzamientos" ? D[a][k].length : D[a][k];
  const celda = (a, k, f, inv) => {
    const d = D[a]; if (!d.hay && k !== "lanzamientos") return `<td class="calc" style="color:var(--gris)">—</td>`;
    if (!d.hay) return `<td class="calc">${f(d[k])}</td>`;
    const prev = D[String(+a - 1)], v = val(a, k), pv = prev && prev.hay ? val(String(+a - 1), k) : null;
    let vv = pv === null ? "" : variacion(pv, v); if (inv && vv) vv = vv.replace('"var up"', '"var tmp"').replace('"var down"', '"var up"').replace('"var tmp"', '"var down"');
    return `<td class="calc">${f(d[k])}${d.manual[k] ? "*" : ""}<br>${vv}</td>`;
  };
  // mes a mes: ingresos de cada mes en cada año
  const conDatos = anios.filter(a => D[a].hay);
  const mesTabla = conDatos.length ? `<div class="tblwrap"><table class="tbl cmp"><thead><tr><th>Mes</th>${conDatos.map(a => `<th>${a}</th>`).join("")}</tr></thead><tbody>
    ${MESES.map((mn, i) => `<tr><td style="text-transform:capitalize">${mn}</td>${conDatos.map(a => {
      const v = cifras(a + "-" + pad(i + 1), a + "-" + pad(i + 1)).ingresos, pa = String(+a - 1);
      const p = D[pa] && D[pa].hay ? cifras(pa + "-" + pad(i + 1), pa + "-" + pad(i + 1)).ingresos : null;
      const cls = p === null || (!p && !v) ? "" : v > p ? "up" : v < p ? "down" : "";
      return `<td class="calc ${cls ? "m" + cls : ""}">${v ? eur(v) : "—"}</td>`;
    }).join("")}</tr>`).join("")}</tbody></table></div>
    <p class="hint" style="margin:8px 0 0">En verde, el mes fue mejor que el mismo mes del año anterior; en rojo, peor. Las cifras apuntadas a mano en «Años sin detalle» no se pueden repartir por meses.</p>` : `<p class="empty">Todavía no hay datos de estos años.</p>`;
  const grafica = (() => {
    const max = Math.max(1, ...anios.map(a => Math.max(D[a].ingresos, D[a].gastos)));
    return `<div class="cmpbars">${anios.map(a => `<div class="cb"><div class="cbars"><i class="ing" style="height:${D[a].ingresos / max * 100}%" title="Ingresos ${eur(D[a].ingresos)}"></i><i class="gas" style="height:${D[a].gastos / max * 100}%" title="Gastos ${eur(D[a].gastos)}"></i></div><b>${a}</b><span>${D[a].hay ? eur(D[a].beneficio) : "—"}</span></div>`).join("")}</div>
      <p class="hint" style="margin:6px 0 0"><span class="dot ing"></span> Ingresos · <span class="dot gas"></span> Gastos · debajo, el beneficio</p>`;
  })();
  const sinDatos = anios.filter(a => !D[a].hay);
  return `
  <div class="card"><div class="ch"><h3>De ${anios[0]} a ${anios[5]}</h3><span class="hint">Cambia el último año con las flechas de arriba</span></div>${grafica}</div>
  <div class="card"><h3>Año a año</h3><div class="tblwrap"><table class="tbl cmp"><thead><tr><th></th>${anios.map(a => `<th>${a}</th>`).join("")}</tr></thead><tbody>
    ${filas.map(([t, k, f, inv]) => `<tr><td>${t}</td>${anios.map(a => celda(a, k, f, inv)).join("")}</tr>`).join("")}</tbody></table></div>
    <p class="hint" style="margin:8px 0 0">El porcentaje compara con el año anterior. * = cifra apuntada a mano.${sinDatos.length ? " Sin datos: " + sinDatos.join(", ") + "." : ""}</p></div>
  <div class="card"><h3>Cuándo: mes a mes</h3>${mesTabla}</div>
  <div class="card"><h3>Por qué: qué cambió cada año</h3>
    ${[...anios].reverse().filter(a => D[a].hay).map(a => `<div class="porque"><h4>${a} frente a ${+a - 1}</h4><ul>${porQue(a, D[a], D[String(+a - 1)]).map(x => `<li>${x}</li>`).join("")}</ul>
      ${field("Lo que pasó en " + a + " (tus notas: cambios de portada, promociones, anuncios, vida…)", `data-s="g" data-path="negocio.notasAnio.${a}"`, n.notasAnio[a] || "", "area")}</div>`).join("") || `<p class="empty">Cuando haya datos de al menos un año, aquí verás qué subió, qué bajó y por qué.</p>`}</div>
  <div class="card"><div class="ch"><h3>Años sin detalle</h3><span class="hint">Para los años de los que no tienes el informe de Amazon</span></div>
    <p class="hint" style="margin:0 0 8px">Lo mejor es importar en <a href="#negocio" data-nsub="amazon">Ventas de Amazon</a> los informes de cada mes de años anteriores (en KDP: Informes › Regalías previas). Si solo sabes los totales de un año, apúntalos aquí: se usan solo cuando ese año no tiene datos detallados.</p>
    ${tableHTML("historico", "g", [...(S.historico || [])].sort((a, b) => num(a.anio) - num(b.anio)), { addLabel: "Añadir año", preset: { anio: y - 1 }, empty: "Sin años apuntados a mano." })}</div>`;
}

/* ---------- Edición ---------- */
function readVal(el) {
  if (el.type === "checkbox") return el.checked;
  if (el.type === "number") return el.value === "" ? "" : num(el.value);
  return el.value;
}
function applyEdit(el) {
  const d = el.dataset;
  if (d.day) {
    const p = P();
    const e = p.escritura[d.day] || (p.escritura[d.day] = { obj: "", real: "", caps: "" });
    e[d.k] = readVal(el);
    return true;
  }
  if (!d.s) return false;
  const base = d.s === "g" ? S : P();
  if (d.arr) { base[d.arr][+d.i] = el.value; return true; }
  if (d.path) {
    const ks = d.path.split("."); let o = base;
    for (let i = 0; i < ks.length - 1; i++) { if (!o[ks[i]] || typeof o[ks[i]] !== "object") o[ks[i]] = {}; o = o[ks[i]]; }
    o[ks[ks.length - 1]] = readVal(el); return true;
  }
  if (d.l) { const it = base[d.l].find(x => x.id === d.id); if (!it) return false; it[d.k] = readVal(el); return true; }
  if (d.k) { base[d.k] = readVal(el); return true; }
  return false;
}

document.addEventListener("input", e => {
  const el = e.target;
  if (!el.closest("#view") || !applyEdit(el)) return;
  save();
  const d = el.dataset;
  if (el.tagName === "TEXTAREA") autosize(el);
  if (d.day) return;
  if (d.arr === "kdp") {
    const c = $(`[data-count="kdp${d.i}"]`); if (c) { c.textContent = el.value.length + "/50"; c.classList.toggle("over", el.value.length > 50); }
    $$("[data-kwav]").forEach(a => { a.textContent = avisosKw(P(), P().kdp[+a.dataset.kwav]).join(" · "); });
    return;
  }
  if (d.max && d.k) { const c = $(`[data-countfor="${d.k}"]`); if (c) { c.textContent = el.value.length + "/" + d.max; c.classList.toggle("over", el.value.length > +d.max); } }
  if (d.k === "sinopsis") { const c = $('[data-count="sinopsis"]'); if (c) c.textContent = words(el.value) + " palabras"; }
  if (d.k === "kdpDesc") { pintarDesc(); return; }
  if (d.l === "frases" && view.route === "redes") pintarTarjeta();
  if (d.k === "titulo" && !d.l) { renderNav(); return; }
  if (d.l === "ingresos" && (d.k === "bruto" || d.k === "irpf")) {
    const it = S.ingresos.find(x => x.id === d.id);
    if (it && d.k === "irpf") it.irpfManual = el.value !== "";
    if (it && d.k === "bruto" && !it.irpfManual) {
      it.irpf = Math.round(num(it.bruto) * num(negocio().irpfPct)) / 100;
      const ir = $(`[data-row="${it.id}"] [data-k="irpf"]`); if (ir) ir.value = it.irpf;
    }
  }
  // celdas calculadas de la fila
  const tr = el.closest("[data-row]");
  if (tr && d.l && COLS[d.l]) {
    const it = (d.s === "g" ? S : P())[d.l].find(x => x.id === d.id);
    $$("[data-calc]", tr).forEach(c => {
      const col = COLS[d.l].find(x => x.k === c.dataset.calc);
      const v = col.calc(it, P());
      if (col.pillCalc) { c.textContent = v; c.className = "chip " + tone(v); }
      else { c.textContent = col.money ? eur(v) : v; c.classList.toggle("neg", col.money && v < 0); }
    });
  }
  if (view.route === "cuentas") {
    const ct = $("#costTiles"); if (ct) ct.innerHTML = costTiles(costesStats(P()));
    const vt = $("#ventTiles"); if (vt) vt.innerHTML = ventTiles(ventasMes(view.mes));
    drawChart();
  }
  if (view.route === "pedidos" && d.k === "costeEjemplar") $$("[data-row]").forEach(tr2 => {
    const it = P().pedidos.find(x => x.id === tr2.dataset.row); const c = $('[data-calc="_benef"]', tr2);
    if (it && c) { const v = COLS.pedidos[8].calc(it, P()); c.textContent = eur(v); c.classList.toggle("neg", v < 0); }
  });
});
document.addEventListener("change", e => {
  const el = e.target;
  if (!el.closest("#view")) return;
  if (el.id === "fFoto") {
    const f = el.files && el.files[0]; if (!f) return;
    leerFoto(f).then(url => { perfil().foto = url; save(); render(); toast("Foto guardada"); }).catch(() => toast("No he podido leer esa imagen. Prueba con un JPG o PNG."));
    return;
  }
  if (el.id === "acentoLibre") { ajustes().acento = el.value; aplicarAcento(); save(); render(); return; }
  if (el.id === "selNovelia") { P().noveliaId = el.value || ""; save(); traerDeOtrasApps(); toast(el.value ? "Vinculada con Novelia" : "Sin vincular: apunta las palabras a mano"); return; }
  if (el.id === "tjFrase") { tarj.frase = el.value; pintarTarjeta(); return; }
  if (el.id === "fPortada") {
    const f = el.files && el.files[0]; if (!f) return;
    leerPortada(f).then(url => { P().portada = url; save(); render(); toast("Portada guardada"); }).catch(() => toast("No he podido leer esa imagen. Prueba con un JPG o PNG."));
    return;
  }
  // Fechas: se guardan al momento, pero la pantalla se redibuja al salir del campo.
  // Si se redibujara al cambiar, al teclear el año (2-0-2-7) se perdería el campo a mitad.
  if (el.matches("input[type=date]")) {
    applyEdit(el); save();
    if (document.activeElement !== el) { render(); return; }
    if (!el.dataset.esperando) {
      el.dataset.esperando = "1";
      el.addEventListener("blur", ev => {
        const otro = ev.relatedTarget;
        // Si salta a otro campo o botón de la pantalla, no se redibuja para no quitarle el foco
        if (otro && otro.closest && otro.closest("#view") && otro.matches("input, select, textarea, button")) return;
        render();
      }, { once: true });
    }
    return;
  }
  if (el.matches("select")) { applyEdit(el); save(); render(); return; }
  // Se redibuja un poco después para no perder el clic si se ha salido del campo pulsando un botón
  if (["negocio", "catalogo"].includes(view.route) && el.matches("input[type=number], input[type=month]")) { clearTimeout(view.rtTimer); view.rtTimer = setTimeout(render, 300); return; }
  if (el.type === "checkbox" && el.dataset.path) { render(); return; }
  if (el.dataset.k === "objetivoPalabras" || el.closest(".tiles") === null && ["pvp", "unidades", "costeEjemplar"].includes(el.dataset.k)) { render(); }
});

document.addEventListener("click", e => {
  const ln = e.target.closest("a[data-nsub]"); if (ln) view.nsub = ln.dataset.nsub;
  const t = e.target.closest("button, input[type=checkbox]");
  if (!t) return;
  const d = t.dataset;
  if (d.add) {
    const base = d.s === "g" ? S : P();
    const preset = d.preset ? JSON.parse(d.preset) : {};
    const item = { id: uid() };
    if (COLS[d.add]) COLS[d.add].forEach(c => { if (!c.calc) item[c.k] = c.opts ? c.opts[0] : ""; });
    if (d.add === "personajes") Object.assign(item, { nombre: "", rol: "Secundario", edad: "", trabajo: "", musa: "", conflicto: "", aesthetic: "", notas: "" });
    Object.assign(item, preset);
    base[d.add].push(item);
    save(); render();
    const first = $(`[data-row="${item.id}"] input, [data-row="${item.id}"] textarea`); if (first) first.focus();
    return;
  }
  if (d.del) {
    const base = d.s === "g" ? S : P();
    const arr = base[d.l]; const i = arr.findIndex(x => x.id === d.del); if (i < 0) return;
    const [removed] = arr.splice(i, 1);
    save(); render();
    toast("Fila eliminada", () => arr.splice(i, 0, removed));
    return;
  }
  if (d.done) {
    const tk = P().tareas.find(x => x.id === d.done); if (!tk) return;
    const prev = tk.estado; tk.estado = "Hecho"; save();
    setTimeout(render, 250);
    toast("Tarea hecha: " + tk.tarea, () => { tk.estado = prev; });
    return;
  }
  if (d.ftareas) { view.fTareas = d.ftareas; render(); return; }
  if (d.addpost) {
    S.posts.push({ id: uid(), fecha: d.addpost, red: "Instagram", tipo: "Post", contenido: "", copy: "", hashtags: "", cta: "", estado: "Idea" });
    save(); render();
    const rows = $$("#view .tbl [data-row]"); const last = S.posts[S.posts.length - 1];
    const inp = $(`[data-row="${last.id}"] [data-k="contenido"]`); if (inp) inp.focus();
    return;
  }
  if (d.quitarfase) {
    const p = P(), antes = p.tareas.slice(), n = p.tareas.filter(x => x.fase === d.quitarfase).length;
    p.tareas = p.tareas.filter(x => x.fase !== d.quitarfase); save(); render();
    toast(`Quitada la fase ${d.quitarfase} (${n} tareas)`, () => { p.tareas = antes; });
    return;
  }
  if (d.dia) { view.diaSel = view.diaSel === d.dia ? "" : d.dia; render(); return; }
  if (d.caltam) { ajustes().calTam = d.caltam; save(); render(); return; }
  if (d.acento) { ajustes().acento = d.acento; aplicarAcento(); save(); render(); return; }
  if (t.id === "pfAddLink") { perfil().otros.push({ t: "", u: "" }); save(); render(); const ins = $$('[data-path^="perfil.otros."][data-path$=".t"]'); if (ins.length) ins[ins.length - 1].focus(); return; }
  if (t.dataset && t.dataset.pfdel !== undefined) { const pr = perfil(), i = +t.dataset.pfdel, prev = pr.otros[i]; pr.otros.splice(i, 1); save(); render(); toast("Enlace quitado", () => { pr.otros.splice(i, 0, prev); }); return; }
  if (t.id === "quitarFoto") { const pr = perfil(), prev = pr.foto; pr.foto = ""; save(); render(); toast("Foto quitada", () => { pr.foto = prev; }); return; }
  if (t.id === "ajCopia") { $("#btnBackup").click(); return; }
  if (t.id === "ajReset") { $("#btnReset").click(); return; }
  if (t.id === "ajNovelia") { abrirNovelia(); return; }
  if (t.id === "ajCentro") { abrirCentroControl(); return; }
  if (d.nsub) { view.nsub = d.nsub; render(); return; }
  if (d.dirtodo) { view.dirTodo = d.dirtodo === "1"; render(); return; }
  if (t.id === "gestCopiar") { copiar($("#gestTxt").textContent, "Resumen copiado: pégalo en un email a tu gestoría"); return; }
  if (t.id === "kdpBorrarMes") {
    const prev = S.kdpVentas.slice(); S.kdpVentas = S.kdpVentas.filter(l => l.mes !== view.mes); save(); render();
    toast("Líneas del mes borradas", () => { S.kdpVentas = prev; }); return;
  }
  if (t.id === "kdpImport") {
    const res = importarKdp($("#kdpPaste").value), msg = $("#kdpMsg");
    if (res.error) { msg.textContent = res.error; return; }
    const meses = [...new Set(res.lineas.map(l => l.mes))].sort(), kenp = res.lineas[0].formato === "KENP";
    const prev = S.kdpVentas.slice();
    // Sustituye lo importado antes de esos meses (del mismo tipo) para no contarlo dos veces
    S.kdpVentas = S.kdpVentas.filter(l => !(meses.includes(l.mes) && (l.formato === "KENP") === kenp)).concat(res.lineas);
    view.mes = meses[meses.length - 1]; save(); render();
    toast(`${res.lineas.length} líneas importadas (${meses.map(mesLabel).join(", ")})`, () => { S.kdpVentas = prev; });
    return;
  }
  if (d.tf) { tarj.formato = d.tf; render(); return; }
  if (d.te) { tarj.estilo = d.te; render(); return; }
  if (d.tag) {
    const ta = $("#kdpDesc"); if (!ta) return;
    const s0 = ta.selectionStart, s1 = ta.selectionEnd, sel = ta.value.slice(s0, s1);
    const ins = d.tag === "br" ? "<br>" : d.tag === "li" ? `<ul>\n<li>${sel || "Elemento"}</li>\n</ul>` : `<${d.tag}>${sel}</${d.tag}>`;
    ta.setRangeText(ins, s0, s1, "end"); ta.focus(); P().kdpDesc = ta.value; save(); pintarDesc();
    return;
  }
  if (t.id === "descDesde") {
    const p = P(), txt = String(p.sinopsis || "").trim();
    if (!txt) { toast("Escribe primero la sinopsis larga en Libro."); return; }
    const prev = p.kdpDesc;
    p.kdpDesc = txt.split(/\n\s*\n|\n/).map(x => x.trim()).filter(Boolean).map(x => `<p>${esc(x)}</p>`).join("\n");
    save(); render(); toast("Sinopsis traída. Ahora dale formato.", () => { p.kdpDesc = prev; });
    return;
  }
  if (t.id === "descCopiar") { copiar(P().kdpDesc, "Descripción copiada: pégala en KDP"); return; }
  if (t.id === "copiarKw") { copiar(P().kdp.filter(x => String(x).trim()).join("\n"), "Palabras clave copiadas"); return; }
  if (t.id === "repartir") { repartirFechas(); return; }
  if (t.id === "planRedes") { planRedes(); return; }
  if (t.id === "ics") { descargarIcs(); return; }
  if (t.id === "webCopiar") { copiar(htmlWeb(P()), "HTML copiado: pégalo en un bloque HTML personalizado"); return; }
  if (t.id === "webPortada") { fetch(P().portada).then(r => r.blob()).then(b => descargar(b, "portada.jpg")); return; }
  if (t.id === "tjPng") { const cv = $("#tjC"); if (cv) cv.toBlob(b => descargar(b, `cita-${tarj.formato}.png`), "image/png"); return; }
  if (t.id === "btnNovelia") { abrirNovelia(); return; }
  if (t.id === "quitarPortada") { const p = P(), prev = p.portada; p.portada = ""; save(); render(); toast("Portada quitada", () => { p.portada = prev; }); return; }
  if (t.id === "btnDelProj") { confirmDelProj(); return; }
});

/* ---------- Novelas, copia y reinicio ---------- */
$("#projSel").addEventListener("change", e => { S.activo = e.target.value; save(); render(); });
$("#btnNewProj").addEventListener("click", () => {
  openModal(`<h2>Nueva novela</h2><label class="field"><span>Título</span><input type="text" id="npT" placeholder="Título provisional"></label>
    <p class="hint" style="margin:0">Empieza con la checklist completa de lanzamiento. Las redes, ventas y prensa son comunes a todas tus novelas.</p>
    <div class="acts"><button class="btn ghost" type="button" data-close>Cancelar</button><button class="btn" type="button" id="npOk">Crear</button></div>`, box => {
    const go = () => { const p = newProject($("#npT", box).value.trim() || "Nueva novela"); S.proyectos.push(p); S.activo = p.id; closeModal(); save(); location.hash = "libro"; render(); };
    $("#npOk", box).addEventListener("click", go);
    $("#npT", box).addEventListener("keydown", e => { if (e.key === "Enter") go(); });
  });
});
function confirmDelProj() {
  const p = P();
  if (S.proyectos.length < 2) { toast("Es tu única novela: crea otra antes de eliminar esta."); return; }
  openModal(`<h2>¿Eliminar «${esc(p.titulo)}»?</h2><p style="margin:0">Se borran su ficha, Amazon KDP, producción, checklist, citas, pedidos y costes. Las redes, ventas y prensa se quedan.</p>
    <div class="acts"><button class="btn ghost" type="button" data-close>Cancelar</button><button class="btn danger" type="button" id="dpOk">Eliminar novela</button></div>`, box => {
    $("#dpOk", box).addEventListener("click", () => { S.proyectos = S.proyectos.filter(x => x.id !== p.id); S.activo = S.proyectos[0].id; closeModal(); save(); render(); });
  });
}
function restaurar(texto, msgEl) {
  let d;
  try { d = JSON.parse(texto); } catch (e) { d = null; }
  if (!d || !Array.isArray(d.proyectos)) { msgEl.textContent = "Ese archivo no es una copia del Kit Escritoras."; return; }
  const n = d.proyectos.length;
  msgEl.innerHTML = `La copia tiene ${n} ${n === 1 ? "novela" : "novelas"}. Al restaurarla se sustituye todo lo que hay ahora en este aparato. <button class="btn sm danger" type="button" id="bkSi">Sí, restaurar</button>`;
  $("#bkSi").addEventListener("click", () => { S = normalize(d); aplicarAcento(); closeModal(); save(); render(); toast("Datos restaurados"); });
}
function descargarCopia() {
  S.ultimaCopia = TODAY;
  const blob = new Blob([JSON.stringify(S, null, 1)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "kit-escritoras-copia-" + TODAY + ".json";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  save(); pintarUltimaCopia();
}
function ksConectado() { try { return !!KSync.e.conectado; } catch (e) { return false; } } // KSync se crea más abajo
// Copia de seguridad: a Google Drive si está conectado (se quedan las dos últimas); si no, a Descargas
async function hacerCopiaKit(auto) {
  const d = new Date();
  const nombre = `Kit Escritoras · Copia ${TODAY} ${String(d.getHours()).padStart(2, "0")}h${String(d.getMinutes()).padStart(2, "0")}.json`;
  const blob = new Blob([JSON.stringify(S, null, 1)], { type: "application/json" });
  const bajar = (b, n) => { const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = n; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };
  const dest = await CopiaDrive.guardar({ prefijo: "Kit Escritoras · Copia", nombre, blob, auto: !!auto, app: {
    conectado: () => !!KSync.e.conectado, token: () => ksPedirToken(false),
    olvidarToken: () => { KSync.token = null; localStorage.removeItem(KS_TOKEN); },
    descargar: bajar, aviso: toast,
  } });
  if (dest === "descargas" && !KSync.e.conectado) toast(auto ? "He guardado tu copia de seguridad en Descargas" : "Copia guardada en Descargas");
  S.ultimaCopia = TODAY; save(); pintarUltimaCopia();
  return dest;
}
function pintarUltimaCopia() {
  const b = $("#btnBackup"); if (!b) return;
  b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg>Copia${S.ultimaCopia ? `<small>${esc(dayLabel(S.ultimaCopia))}</small>` : ""}`;
  b.title = S.ultimaCopia ? "Copia de seguridad · última: " + dayLabel(S.ultimaCopia) : "Copia de seguridad";
}
$("#btnBackup").addEventListener("click", () => {
  openModal(`<h2>Copia de seguridad</h2>
    <p style="margin:0">Tus datos se guardan en este navegador. Descarga una copia de vez en cuando y guárdala en tu ordenador o en Drive: te sirve si cambias de móvil, borras el navegador o quieres pasar tus datos a otro aparato.</p>
    <div class="acts" style="justify-content:flex-start"><button class="btn" type="button" id="bkHacer">Hacer copia ahora</button><button class="btn ghost" type="button" id="bkDown">Descargar copia</button>
      <label class="btn ghost" style="display:inline-flex;align-items:center">Cargar una copia<input type="file" id="bkFile" accept=".json,application/json" style="display:none"></label></div>
    <p class="hint" id="bkMsg" style="margin:0"></p>
    <details><summary class="hint" style="cursor:pointer">Copiar o pegar como texto</summary>
      <label class="field" style="margin-top:8px"><span>Tus datos</span><textarea id="bkT" style="min-height:140px;font-family:monospace;font-size:.75rem">${esc(JSON.stringify(S))}</textarea></label>
      <div class="acts" style="justify-content:flex-start;margin-top:8px"><button class="btn ghost sm" type="button" id="bkCopy">Copiar texto</button><button class="btn ghost sm" type="button" id="bkRes">Restaurar desde el texto</button></div>
    </details>
    <div class="acts"><button class="btn ghost" type="button" data-close>Cerrar</button></div>`, box => {
    const msg = $("#bkMsg", box);
    $("#bkHacer", box).addEventListener("click", async () => { msg.textContent = "Guardando…"; const d = await hacerCopiaKit(false); msg.textContent = d === "drive" ? "Copia guardada en tu Google Drive." : "Copia guardada en tu carpeta de descargas."; });
    $("#bkDown", box).addEventListener("click", () => { try { descargarCopia(); msg.textContent = "Copia descargada. Búscala en tu carpeta de descargas."; } catch (e) { msg.textContent = "No se ha podido descargar. Usa «Copiar o pegar como texto»."; } });
    $("#bkFile", box).addEventListener("change", e => {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => restaurar(String(r.result), msg);
      r.onerror = () => { msg.textContent = "No se ha podido leer el archivo."; };
      r.readAsText(f);
    });
    $("#bkCopy", box).addEventListener("click", async () => {
      try { await navigator.clipboard.writeText($("#bkT", box).value); msg.textContent = "Copiado. Pégalo en un documento para guardarlo."; }
      catch (e) { $("#bkT", box).select(); msg.textContent = "Tu navegador no deja copiar automáticamente: el texto ya está seleccionado, usa Ctrl+C."; }
    });
    $("#bkRes", box).addEventListener("click", () => restaurar($("#bkT", box).value, msg));
  });
});
$("#btnReset").addEventListener("click", () => {
  openModal(`<h2>Empezar en blanco</h2><p style="margin:0">Se borran los datos de ejemplo y todo lo que hayas escrito. Te quedará una novela vacía con la checklist de lanzamiento. Si quieres conservar algo, haz antes una copia de seguridad.</p>
    <div class="acts"><button class="btn ghost" type="button" data-close>Cancelar</button><button class="btn danger" type="button" id="rsOk">Borrar todo y empezar</button></div>`, box => {
    $("#rsOk", box).addEventListener("click", () => {
      const p = newProject("Mi novela");
      S = normalize({ v: 1, activo: p.id, proyectos: [p], posts: [], ventas: [], prensa: [], colabs: [], perfil: S.perfil, ajustes: S.ajustes });
      closeModal(); save(); location.hash = "libro"; render();
    });
  });
});

/* ---------- Navegación ---------- */
$("#mPrev").addEventListener("click", () => { view.mes = addMonth(view.mes, -1); render(); });
$("#mNext").addEventListener("click", () => { view.mes = addMonth(view.mes, 1); render(); });
$("#mHoy").addEventListener("click", () => { view.mes = monthOf(TODAY); render(); });
function route() {
  let h = (location.hash || "").replace("#", "");
  if (ALIAS[h]) { h = ALIAS[h]; history.replaceState(null, "", "#" + h); }
  view.route = ROUTES.some(r => r[0] === h) ? h : "inicio";
  render();
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);

/* ---------- Arranque ---------- */
const guardado = loadLocal();
S = normalize(guardado || seed());
aplicarAcento();
route();
pintarUltimaCopia();
// Recordatorio de copia de seguridad: una vez por sesión si hace más de 14 días (o nunca) y ya hay cosas apuntadas
setTimeout(() => {
  try {
    if (sessionStorage.getItem("ks-aviso-copia")) return;
    const dias = S.ultimaCopia ? Math.round((new Date(TODAY) - new Date(S.ultimaCopia)) / 86400000) : null;
    const hayDatos = (S.proyectos || []).some(p => p.titulo && !/ejemplo/i.test(p.titulo)) || (S.catalogo || []).length;
    if (!hayDatos) return;
    // Copia automática cada los días elegidos en Ajustes
    const cada = +ajustes().copiaDias || 0;
    if (cada > 0) { if (dias === null || dias >= cada) hacerCopiaKit(true); return; }
    if (dias !== null && dias < 14) return;
    sessionStorage.setItem("ks-aviso-copia", "1");
    toast(dias === null ? "Aún no has hecho ninguna copia de seguridad: pulsa «Copia» en el menú." : `Hace ${dias} días de tu última copia de seguridad: pulsa «Copia» en el menú.`);
  } catch (e) { /* sin sessionStorage */ }
}, 2500);
const enClaude = !!(window.claude && typeof window.claude.use === "function");
setSave("", enClaude ? "Conectando…" : "Guardado en este navegador");
if (enClaude) connectDb(); else setSave("local", "Guardado en este navegador");

// Primera vez: elegir entre ver el ejemplo o empezar con su novela
if (!guardado && !enClaude) {
  openModal(`<div class="eyebrow">Te damos la bienvenida</div><h2>Kit Escritoras</h2>
    <p style="margin:0">Todo lo que pasa cuando tu novela está escrita: ficha del libro, Amazon KDP, producción, checklist de lanzamiento, redes, pedidos, cuentas, tu catálogo y el negocio (ventas, gastos e impuestos), prensa y la página para tu web.</p>
    <p class="hint" style="margin:0">Todo se guarda en este navegador, sin cuentas ni contraseñas. Desde «Copia de seguridad» puedes descargar tus datos cuando quieras.</p>
    <label class="field"><span>Título de tu novela</span><input type="text" id="wTit" placeholder="Puedes cambiarlo luego"></label>
    <div class="acts"><button class="btn ghost" type="button" id="wEj">Ver primero un ejemplo</button><button class="btn" type="button" id="wGo">Empezar con mi novela</button></div>`, box => {
    $("#wEj", box).addEventListener("click", () => { closeModal(); save(); });
    $("#wGo", box).addEventListener("click", () => {
      const p = newProject($("#wTit", box).value.trim() || "Mi novela");
      S = normalize({ v: 1, activo: p.id, proyectos: [p], posts: [], ventas: [], prensa: [], colabs: [] });
      closeModal(); save(); location.hash = "libro"; render();
    });
  });
}

// Si la app está abierta en dos pestañas, la otra se pone al día al guardar
window.addEventListener("storage", e => {
  if (e.key !== LS_KEY || !e.newValue) return;
  try { S = normalize(JSON.parse(e.newValue)); render(); } catch (err) { /* copia ilegible: se ignora */ }
});
window.addEventListener("pagehide", () => { clearTimeout(saveTimer); saveLocal(); });
document.addEventListener("visibilitychange", () => { if (document.hidden) { clearTimeout(saveTimer); saveLocal(); } });

// Pedir al navegador que no borre los datos por falta de espacio
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); } catch (e) { /* no disponible */ }

// Instalable y sin conexión cuando se abre desde GitHub Pages (https)
if ("serviceWorker" in navigator && location.protocol === "https:" && !enClaude) {
  const habia = !!navigator.serviceWorker.controller;
  let recargando = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!habia || recargando) return;
    recargando = true;
    clearTimeout(saveTimer); saveLocal();
    const escribiendo = document.activeElement && document.activeElement.matches("input, textarea, select");
    if (!$("#modal").classList.contains("open") && !escribiendo) location.reload();
    else toast("Hay una versión nueva de la app: cierra y vuelve a abrirla para tenerla.");
  });
  navigator.serviceWorker.register("sw.js").then(reg => {
    reg.update().catch(() => {});
    document.addEventListener("visibilitychange", () => { if (!document.hidden) reg.update().catch(() => {}); });
  }).catch(() => {});
}

// =====================================================================
//  Kit Escritoras — Copia automática en Google Drive.
//  Todo se guarda en un archivo «kit-escritoras.json» dentro de la
//  carpeta privada de la app en tu Drive (appDataFolder): no se ve entre
//  tus archivos y ninguna otra app puede leerlo.
//  Igual que en Novelia Studio: mismo ID de cliente de Google.
// =====================================================================

const KS_CLIENT_ID = '171808282615-3onraig9fvo9gg2fea3mdsouon7h6pv9.apps.googleusercontent.com';
const KS_SCOPE = 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file';
const KS_ARCHIVO = 'kit-escritoras.json';
const KS_EST = 'kitEscritoras.sincro', KS_TOKEN = 'kitEscritoras.token';

const KSync = {
  e: (() => { try { return JSON.parse(localStorage.getItem(KS_EST)) || {}; } catch (e) { return {}; } })(),
  guardar() { try { localStorage.setItem(KS_EST, JSON.stringify(this.e)); } catch (e) { /* sin espacio */ } },
  token: null, caduca: 0, ocupado: false, aplicando: false, estado: ''
};
if (!KSync.e.disp) { KSync.e.disp = uid(); KSync.guardar(); }
try { const t = JSON.parse(localStorage.getItem(KS_TOKEN)); if (t && t.caduca > Date.now() + 60000) { KSync.token = t.token; KSync.caduca = t.caduca; } } catch (e) { /* nada */ }

const ksHuella = () => { const s = JSON.stringify(S); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36) + s.length.toString(36); };
const ksDia = () => new Date().toISOString().slice(0, 10);

// Cada vez que el kit guarda, si ha cambiado algo de verdad, se marca para subir
const ksSaveOriginal = save;
save = function () {
  ksSaveOriginal.apply(this, arguments);
  if (KSync.aplicando || !KSync.e.conectado || !S) return;
  setTimeout(() => {
    if (KSync.e.h === ksHuella()) return;
    if (!KSync.e.sucio) { KSync.e.sucio = Date.now(); KSync.guardar(); }
    ksPintar('');
    ksSubirPronto();
  }, 700);
};

function ksCargarGIS() {
  if (window.google && google.accounts && google.accounts.oauth2) return Promise.resolve();
  return new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.onload = res; s.onerror = () => rej(new Error('sin conexión')); document.head.appendChild(s); });
}
let ksTokenClient = null, ksEsperando = null;
async function ksPedirToken(interactivo) {
  if (KSync.token && KSync.caduca > Date.now() + 60000) return KSync.token;
  await ksCargarGIS();
  if (!ksTokenClient) ksTokenClient = google.accounts.oauth2.initTokenClient({
    client_id: KS_CLIENT_ID, scope: KS_SCOPE,
    callback: (r) => {
      const w = ksEsperando; ksEsperando = null; if (!w) return;
      if (r.error) { w.rej(new Error(r.error)); return; }
      KSync.token = r.access_token; KSync.caduca = Date.now() + (r.expires_in || 3600) * 1000;
      try { localStorage.setItem(KS_TOKEN, JSON.stringify({ token: KSync.token, caduca: KSync.caduca })); } catch (e) { /* nada */ }
      w.res(KSync.token);
    },
    error_callback: (e) => { const w = ksEsperando; ksEsperando = null; if (w) w.rej(new Error((e && e.type) || 'cancelado')); }
  });
  return new Promise((res, rej) => { ksEsperando = { res, rej }; ksTokenClient.requestAccessToken({ prompt: interactivo ? 'consent' : '' }); });
}
async function ksDrive(url, opts = {}) {
  const t = await ksPedirToken(false);
  const r = await fetch(url, { ...opts, headers: { Authorization: 'Bearer ' + t, ...(opts.headers || {}) } });
  if (r.status === 401) { KSync.token = null; localStorage.removeItem(KS_TOKEN); throw new Error('token'); }
  if (!r.ok) throw new Error('drive ' + r.status);
  return r;
}
async function ksRemoto() {
  const r = await ksDrive(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name%3D'${KS_ARCHIVO}'&fields=files(id,modifiedTime,appProperties)&orderBy=modifiedTime%20desc`);
  const j = await r.json(); return (j.files || [])[0] || null;
}
async function ksSubir(remoto) {
  const fecha = new Date().toISOString();
  const h = ksHuella();
  const cuerpo = JSON.stringify({ app: 'kit-escritoras', version: 1, fecha, disp: KSync.e.disp, datos: S });
  const props = { fecha, disp: KSync.e.disp };
  const lim = 'kit' + uid();
  const meta = remoto ? { appProperties: props } : { name: KS_ARCHIVO, parents: ['appDataFolder'], appProperties: props };
  const multi = `--${lim}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${lim}\r\nContent-Type: application/json\r\n\r\n${cuerpo}\r\n--${lim}--`;
  const url = remoto ? `https://www.googleapis.com/upload/drive/v3/files/${remoto.id}?uploadType=multipart` : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
  await ksDrive(url, { method: remoto ? 'PATCH' : 'POST', headers: { 'Content-Type': `multipart/related; boundary=${lim}` }, body: multi });
  Object.assign(KSync.e, { base: fecha, sucio: 0, ultima: Date.now(), h }); KSync.guardar();
}
async function ksTraer(remoto) {
  const r = await ksDrive(`https://www.googleapis.com/drive/v3/files/${remoto.id}?alt=media`);
  const j = await r.json();
  if (!j || !j.datos || !Array.isArray(j.datos.proyectos)) throw new Error('archivo');
  KSync.aplicando = true;
  try {
    S = normalize(j.datos);
    saveLocal();
    if (typeof aplicarAcento === 'function') aplicarAcento();
    render();
    Object.assign(KSync.e, { base: j.fecha, sucio: 0, ultima: Date.now(), h: ksHuella() }); KSync.guardar();
  } finally { KSync.aplicando = false; }
  toast('Traído de Google Drive: ya tienes lo último');
}
function ksDescargarCopia(nombre) {
  const b = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = nombre;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
async function ksSincronizar(manual) {
  if (!KSync.e.conectado || KSync.ocupado || !navigator.onLine || $('#ksEste')) return;
  KSync.ocupado = true; ksPintar('Sincronizando…');
  try {
    const remoto = await ksRemoto();
    const fechaR = remoto && remoto.appProperties && remoto.appProperties.fecha;
    const otroCambio = remoto && fechaR !== KSync.e.base;
    if (!remoto) await ksSubir(null);
    else if (otroCambio && !KSync.e.sucio) await ksTraer(remoto);
    else if (otroCambio && KSync.e.sucio) { KSync.ocupado = false; ksPintar(''); ksConflicto(remoto); return; }
    else if (KSync.e.sucio) await ksSubir(remoto);
    ksPintar('');
    if (manual) toast('Guardado en Google Drive');
  } catch (e) {
    const m = e.message || '';
    ksPintar(m === 'token' || /popup|cancel|access_denied|interaction/.test(m) ? 'Toca para conectar' : !navigator.onLine ? 'Sin conexión' : 'No se ha podido');
    if (manual) toast(/access_denied/.test(m) ? 'Google no te deja entrar: pide a Marta que te añada como usuaria de prueba.' : 'No he podido sincronizar. Vuelve a intentarlo.');
  } finally { KSync.ocupado = false; }
}
function ksConflicto(remoto) {
  const f = new Date(remoto.appProperties.fecha).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
  openModal(`<h2>Hay cambios en los dos sitios</h2>
    <p style="margin:0">Has cambiado cosas aquí y en otro aparato (el ${esc(f)}). No puedo juntarlas, así que dime con cuál me quedo. La otra te la descargo como copia, para que no pierdas nada.</p>
    <div class="acts"><button class="btn ghost" type="button" data-close>Ahora no</button><button class="btn ghost" type="button" id="ksOtro">Lo del otro aparato</button><button class="btn" type="button" id="ksEste">Lo de este aparato</button></div>`, box => {
    $('#ksEste', box).addEventListener('click', async () => {
      closeModal();
      try { KSync.ocupado = true; const r = await ksDrive(`https://www.googleapis.com/drive/v3/files/${remoto.id}?alt=media`); const j = await r.json(); const b = new Blob([JSON.stringify(j.datos || j, null, 1)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `Kit Escritoras · lo del otro aparato ${ksDia()}.json`; document.body.appendChild(a); a.click(); a.remove(); await ksSubir(remoto); toast('Guardado lo de este aparato'); }
      catch (e) { toast('No he podido subirlo'); } finally { KSync.ocupado = false; ksPintar(''); }
    });
    $('#ksOtro', box).addEventListener('click', async () => {
      closeModal();
      try { ksDescargarCopia(`Kit Escritoras · lo de este aparato ${ksDia()}.json`); await new Promise(r => setTimeout(r, 600)); KSync.e.sucio = 0; await ksTraer(remoto); }
      catch (e) { toast('No he podido traerlo'); } finally { ksPintar(''); }
    });
  });
}
let ksTimer = null;
function ksSubirPronto() { clearTimeout(ksTimer); ksTimer = setTimeout(() => { if (KSync.e.conectado && KSync.token && KSync.caduca > Date.now()) ksSincronizar(); }, 15000); }

// ---------- estado visible (abajo del menú) ----------
function ksPintar(t) {
  KSync.estado = t;
  let b = $('#ksPill');
  if (!KSync.e.conectado) { if (b) b.remove(); return; }
  if (!b) {
    b = document.createElement('button'); b.id = 'ksPill'; b.type = 'button'; b.className = 'ks-pill'; b.title = 'Guardar ahora en Google Drive';
    b.addEventListener('click', () => ksConectarYSincronizar());
    const foot = $('.side .foot'); if (foot) foot.insertBefore(b, $('#btnReset')); else document.body.appendChild(b);
  }
  const hace = KSync.e.ultima ? Math.round((Date.now() - KSync.e.ultima) / 60000) : null;
  b.textContent = t || (KSync.e.sucio ? '☁ Sin subir' : hace === null ? '☁ Drive' : `☁ Al día${hace < 1 ? '' : hace < 60 ? ` · ${hace} min` : ''}`);
  b.classList.toggle('alerta', /conectar|podido/.test(t));
  b.classList.toggle('girando', /…$/.test(t));
}
async function ksConectarYSincronizar() {
  try { await ksPedirToken(!KSync.e.conectado); KSync.e.conectado = true; KSync.guardar(); await ksSincronizar(true); }
  catch (e) { toast(/access_denied/.test(e.message || '') ? 'Google no te deja entrar: hace falta estar en la lista de usuarias de prueba.' : 'No se ha conectado con Google'); ksPintar('Toca para conectar'); }
  if (typeof view !== 'undefined' && view.route === 'ajustes') render();
}

// ---------- tarjeta en Ajustes ----------
function ksTarjeta() {
  const E = KSync.e;
  const ult = E.ultima ? new Date(E.ultima).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }) : '';
  return `<div class="card" id="ksCard"><h3>Copia automática en Google Drive</h3>
    ${E.conectado
      ? `<p style="margin:0">Conectado a tu Google Drive. Se guarda solo mientras trabajas y lo tienes igual en el móvil y en el ordenador.${ult ? ` Última vez: ${esc(ult)}.` : ''}${E.sucio ? ' <b>Hay cambios sin subir.</b>' : ''}</p>
        <div class="filters"><button type="button" id="ksYa">Guardar ahora</button><button type="button" id="ksOff">Desconectar este aparato</button></div>`
      : `<p style="margin:0">Guarda el kit en tu Google Drive y no pierdes nada si borras el navegador o cambias de móvil. Se sube solo mientras trabajas y se trae al abrir la app en otro aparato.</p>
        <div class="filters"><button type="button" id="ksOn">Conectar con Google Drive</button></div>
        <p class="hint" style="margin:0">Google te avisará de que la app «no está verificada»: es normal, pulsa «Continuar». Se guarda en una carpeta privada de la app: no lo verás entre tus archivos de Drive.</p>`}
  </div>`;
}
vAjustes = (orig => function () {
  const html = orig.apply(this, arguments);
  const marca = '<div class="card"><h3>Tus datos</h3>';
  return html.includes(marca) ? html.replace(marca, ksTarjeta() + marca) : html + ksTarjeta();
})(vAjustes);

document.addEventListener('click', async (ev) => {
  const b = ev.target.closest && ev.target.closest('#ksOn, #ksYa, #ksOff');
  if (!b) return;
  if (b.id === 'ksYa') { await ksConectarYSincronizar(); return; }
  if (b.id === 'ksOff') {
    KSync.e.conectado = false; KSync.token = null; localStorage.removeItem(KS_TOKEN); KSync.guardar(); ksPintar(''); render();
    toast('Desconectado. Tus datos siguen aquí y en Drive.'); return;
  }
  if (b.id === 'ksOn') {
    try {
      await ksPedirToken(true);
      const remoto = await ksRemoto();
      KSync.e.conectado = true;
      if (remoto) {
        ksDescargarCopia(`Kit Escritoras · antes de conectar ${ksDia()}.json`);
        KSync.e.sucio = 0; KSync.e.base = null; KSync.guardar();
        await new Promise(r => setTimeout(r, 600));
        await ksTraer(remoto);
      } else { KSync.e.sucio = Date.now(); KSync.guardar(); await ksSincronizar(true); }
      ksPintar(''); render();
    } catch (e) {
      toast(/access_denied/.test(e.message || '') ? 'Google no te deja entrar: hace falta estar en la lista de usuarias de prueba.' : 'No se ha conectado con Google');
    }
  }
});

// ---------- arranque ----------
(function ksEsperar() {
  if (!S || !$('#view') || !$('#view').innerHTML) { setTimeout(ksEsperar, 300); return; }
  if (!KSync.e.conectado) return;
  ksPintar('');
  if (KSync.token && KSync.caduca > Date.now() + 60000) ksSincronizar();
  else {
    ksPintar('Toca para conectar');
    // Google necesita un toque para renovar el permiso: el primero que des en la app
    document.addEventListener('click', function uno() { document.removeEventListener('click', uno, true); ksConectarYSincronizar(); }, true);
  }
  setInterval(() => { if (!document.hidden && KSync.token && KSync.caduca > Date.now()) ksSincronizar(); }, 120000);
  document.addEventListener('visibilitychange', () => {
    if (!KSync.token || KSync.caduca <= Date.now()) return;
    if (!document.hidden) ksSincronizar(); else if (KSync.e.sucio) ksSincronizar();
  });
})();


/* ---------- Datos que viven en las otras apps ----------
   El Kit, el Centro de Control y Novelia están en la misma dirección (inspirecreatestudio.github.io),
   así que el Kit puede leer lo que guardan en este mismo navegador:
   · libros y ventas de Amazon → los manda el Centro de Control (aquí se ven, no se editan)
   · palabras escritas y objetivo → los manda Novelia (si la novela está vinculada)
   Si esas apps no se usan en este navegador, el Kit sigue con sus propios datos. */
const ENLACE = { centro: null, novelia: null, leido: false };
function leerOtraApp(db, clave) {
  return new Promise(res => {
    let r;
    try { r = indexedDB.open(db); } catch (e) { res(null); return; }
    // Si esa app nunca se ha abierto aquí, no se crea su base de datos vacía
    r.onupgradeneeded = () => { try { r.transaction.abort(); } catch (e) { /* nada */ } };
    r.onerror = () => res(null);
    r.onblocked = () => res(null);
    r.onsuccess = () => {
      const d = r.result;
      if (!d.objectStoreNames.contains("kv")) { d.close(); res(null); return; }
      try {
        const g = d.transaction("kv", "readonly").objectStore("kv").get(clave);
        g.onsuccess = () => { d.close(); res(g.result === undefined ? null : g.result); };
        g.onerror = () => { d.close(); res(null); };
      } catch (e) { d.close(); res(null); }
    };
  });
}
const firmaDe = v => { const s = JSON.stringify(v); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36) + s.length.toString(36); };
const normTit = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
async function traerDeOtrasApps() {
  const [D, M] = await Promise.all([leerOtraApp("centro", "datos"), leerOtraApp("novelia-studio", "mesa:meta")]);
  let cambiado = false;
  ENLACE.leido = true;
  // Centro de Control → catálogo y ventas de Amazon
  ENLACE.centro = null;
  if (D && Array.isArray(D.libros) && (D.libros.length || ((D.kdp || {}).ventas || []).length)) {
    const cat = D.libros.map(l => ({ id: "cc-" + l.id, titulo: l.titulo || "", serie: l.serie || "", genero: l.genero || "", estado: l.estado || "Activo",
      fecha: l.fechaPub || "", asin: l.asin || "", isbn: l.isbnAmazon || l.isbnPropio || "", enlace: l.afiliado || "", notas: l.subtitulo || "" }));
    const k = D.kdp || {};
    const ven = (k.ventas || []).map(f => {
      const tx = String(f.transaccion || f.tipo || "").toLowerCase();
      return { id: "cc-" + f.id, mes: f.mes, titulo: f.titulo || "", asin: f.codigo || "", tienda: f.tienda || "",
        formato: /blanda|paperback/.test(tx) ? "Tapa blanda" : /dura|hardcover/.test(tx) ? "Tapa dura" : "Ebook",
        uds: num(f.netas), regalias: num(f.regalias), moneda: String(f.moneda || "EUR").toUpperCase() };
    }).concat((k.kenp || []).map(f => ({ id: "cc-" + f.id, mes: f.mes, titulo: f.titulo || "", asin: f.codigo || "", tienda: f.tienda || "",
      formato: "KENP", uds: num(f.paginas), regalias: "", moneda: "EUR" })));
    ENLACE.centro = { fecha: D.cambiado || "", libros: cat.length, lineas: ven.length };
    const firma = firmaDe([cat, ven]);
    if (S.centroFirma !== firma) { S.catalogo = cat; S.kdpVentas = ven; S.centroFirma = firma; cambiado = true; }
  }
  // Novelia → palabras escritas y objetivo de la novela vinculada
  ENLACE.novelia = null;
  if (M && Array.isArray(M.proyectos) && M.nodos && typeof M.nodos === "object") {
    const nodos = Object.values(M.nodos);
    const nov = M.proyectos.map(p => ({ id: p.id, titulo: p.titulo || "Sin título", objetivo: num(p.objetivo),
      palabras: nodos.filter(n => n && n.pid === p.id && n.tipo !== "parte").reduce((a, n) => a + (num(n.palabras) || 0), 0) + Math.max(0, num(p.palabrasFuera) || 0) }));
    ENLACE.novelia = nov;
    S.proyectos.forEach(p => {
      if (p.noveliaId === undefined || p.noveliaId === null) {
        const m = nov.find(x => normTit(x.titulo) && normTit(x.titulo) === normTit(p.titulo));
        if (m) { p.noveliaId = m.id; cambiado = true; }
      }
      const m = p.noveliaId && nov.find(x => x.id === p.noveliaId);
      if (!m) return;
      if (num(p.palabrasEscritas) !== m.palabras) { p.palabrasEscritas = m.palabras; cambiado = true; }
      if (m.objetivo && num(p.objetivoPalabras) !== m.objetivo) { p.objetivoPalabras = m.objetivo; cambiado = true; }
    });
  }
  if (cambiado) save();
  render();
}
function novelaVinculada(p) { return ENLACE.novelia && p.noveliaId ? ENLACE.novelia.find(x => x.id === p.noveliaId) || null : null; }
// Al abrir, al volver a la app y al cambiar de sección
setTimeout(traerDeOtrasApps, 300);
document.addEventListener("visibilitychange", () => { if (!document.hidden) traerDeOtrasApps(); });
window.addEventListener("hashchange", () => { if (["libro", "catalogo", "inicio"].includes((location.hash || "").slice(1))) traerDeOtrasApps(); });

})();
