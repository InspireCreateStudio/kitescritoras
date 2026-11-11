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
const FASES = ["Escritura", "Edición y diseño", "Publicación", "Preventa y promoción", "Prensa y colaboraciones", "Envíos", "Después del lanzamiento"];
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
  ["Escritura", "Documentación", "Libro"], ["Escritura", "Escaleta", "Libro"], ["Escritura", "Vision board", "Canva"], ["Escritura", "Sinopsis", "Libro"],
  ["Escritura", "Escribir la novela", "Libro"], ["Escritura", "Releer la novela completa", "Libro"], ["Escritura", "Sacar frases para promos", "Libro"],
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
  const f = p.tareas.find(t => t.tarea === "Sinopsis"); f.fecha = ym + "-20";
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
  ["posts", "ventas", "prensa", "colabs"].forEach(k => { if (!Array.isArray(st[k])) st[k] = []; });
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
  ["inicio", "Mi mes"], ["libro", "Libro"], ["kdp", "Amazon KDP"], ["produccion", "Producción"], ["lanzamiento", "Lanzamiento"],
  ["redes", "Redes y citas"], ["pedidos", "Pedidos"], ["cuentas", "Cuentas"], ["prensa", "Prensa y colabs"], ["web", "Web"], ["ajustes", "Ajustes"]
];
// Direcciones de versiones anteriores
const ALIAS = { novela: "libro", escritura: "inicio" };
const MONTHLY = ["inicio", "redes", "cuentas", "lanzamiento"];

function renderNav() {
  $("#nav").innerHTML = ROUTES.map(([k, t], i) => `<a href="#${k}" ${view.route === k ? 'aria-current="page"' : ""}><span class="n">${i + 1}</span>${t}</a>`).join("");
  $("#projSel").innerHTML = S.proyectos.map(p => `<option value="${p.id}"${p.id === S.activo ? " selected" : ""}>${esc(p.titulo || "Sin título")}</option>`).join("");
  $("#mLbl").textContent = mesLabel(view.mes);
  $("#monthNav").style.visibility = MONTHLY.includes(view.route) ? "visible" : "hidden";
}

function render() {
  if (!S) return;
  renderNav();
  const fn = { inicio: vInicio, libro: vLibro, kdp: vKdp, produccion: vProduccion, lanzamiento: vLanzamiento, redes: vRedes, pedidos: vPedidos, cuentas: vCuentas, prensa: vPrensa, web: vWeb, ajustes: vAjustes }[view.route] || vInicio;
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
  ["instagram", "tiktok", "web"].forEach(k => { if (pr.enlaces[k] == null) pr.enlaces[k] = ""; });
  return pr;
}
function ajustes() {
  if (!S.ajustes || typeof S.ajustes !== "object") S.ajustes = {};
  const a = S.ajustes;
  if (!a.acento) a.acento = "#a5595d";
  if (!a.cal || typeof a.cal !== "object") a.cal = {};
  CAL_TIPOS.forEach(([k]) => { if (typeof a.cal[k] !== "boolean") a.cal[k] = true; });
  if (!a.calTam) a.calTam = "grande";
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
  const links = [["instagram", "Instagram"], ["tiktok", "TikTok"], ["web", "Web"]].filter(([k]) => pr.enlaces[k].trim())
    .map(([k, t]) => `<a href="${esc(enlaceRed(k, pr.enlaces[k]))}" target="_blank" rel="noopener">${t}</a>`).join("");
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
        <div class="fgrid">${field("Instagram (usuario o enlace)", gp("perfil.enlaces.instagram"), pr.enlaces.instagram)}${field("TikTok (usuario o enlace)", gp("perfil.enlaces.tiktok"), pr.enlaces.tiktok)}${field("Web", gp("perfil.enlaces.web"), pr.enlaces.web)}</div>
        <p class="hint" style="margin:0">Tu nombre sale en el saludo de «Mi mes». Si en la ficha de un libro no pones autora, se usa este.</p>
      </div>
    </div></div>
  <div class="card"><h3>Color de la app</h3>
    <div class="acentos">${ACENTOS.map(([c, n]) => `<button type="button" data-acento="${c}" title="${n}" aria-label="${n}" aria-pressed="${a.acento === c}" style="background:${c}"></button>`).join("")}
      <label class="otro">Otro <input type="color" id="acentoLibre" value="${esc(a.acento)}"></label></div></div>
  <div class="card"><h3>Calendario de «Mi mes»</h3>
    <div class="checks">${CAL_TIPOS.map(([k, t]) => `<label class="chk" style="margin:0"><input type="checkbox" ${gp("ajustes.cal." + k)}${a.cal[k] ? " checked" : ""}> ${t}</label>`).join("")}</div>
    <div class="filters">Tamaño: <button type="button" data-caltam="grande" aria-pressed="${a.calTam !== "pequeño"}">Grande, con el texto</button><button type="button" data-caltam="pequeño" aria-pressed="${a.calTam === "pequeño"}">Pequeño, con puntos</button></div></div>
  <div class="card"><h3>Tus datos</h3>
    <p class="hint" style="margin:0">Todo se guarda en este navegador. Descarga una copia de vez en cuando y guárdala en tu ordenador o en Drive.</p>
    <div class="filters"><button type="button" id="ajCopia">Copia de seguridad</button><button type="button" id="ajNovelia">Traer de Novelia Studio</button><button type="button" id="ajReset">Empezar en blanco</button></div></div>`;
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
      <div class="fgrid">${field("Objetivo de palabras", pf("objetivoPalabras"), p.objetivoPalabras, "number")}${field("Palabras escritas", pf("palabrasEscritas"), p.palabrasEscritas, "number")}</div>
      <p class="hint" style="margin:0">Las palabras escritas las puedes traer de Novelia Studio o apuntarlas a mano.</p>
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
      ${tableHTML("tareas", "p", rows, { preset: { fase: fa }, addLabel: "Añadir tarea", empty: f === "todas" ? "Sin tareas en esta fase." : "Nada con este filtro." })}</div>`;
  }).join("");
  const fb = (k, t) => `<button type="button" data-ftareas="${k}" aria-pressed="${f === k}">${t}</button>`;
  const faltan = diasA(p.lanzFecha);
  const sinFecha = p.tareas.filter(t => !t.fecha && t.estado !== "Hecho").length;
  return `
  <div class="head"><div><div class="eyebrow">Checklist de lanzamiento</div><h1>Del manuscrito a la librería</h1>
    <p>Todo lo que hay que hacer para publicar, agrupado por fases. Ponle fecha a una tarea y te aparecerá en «Mi mes».</p></div></div>
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
    ["instagram", "tiktok", "web"].forEach(k => { const v = d.perfil.enlaces && d.perfil.enlaces[k]; if (!String(pr.enlaces[k]).trim() && v) pr.enlaces[k] = v; });
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
  if (el.type === "checkbox" && el.dataset.path) { render(); return; }
  if (el.dataset.k === "objetivoPalabras" || el.closest(".tiles") === null && ["pvp", "unidades", "costeEjemplar"].includes(el.dataset.k)) { render(); }
});

document.addEventListener("click", e => {
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
  if (d.dia) { view.diaSel = view.diaSel === d.dia ? "" : d.dia; render(); return; }
  if (d.caltam) { ajustes().calTam = d.caltam; save(); render(); return; }
  if (d.acento) { ajustes().acento = d.acento; aplicarAcento(); save(); render(); return; }
  if (t.id === "quitarFoto") { const pr = perfil(), prev = pr.foto; pr.foto = ""; save(); render(); toast("Foto quitada", () => { pr.foto = prev; }); return; }
  if (t.id === "ajCopia") { $("#btnBackup").click(); return; }
  if (t.id === "ajReset") { $("#btnReset").click(); return; }
  if (t.id === "ajNovelia") { abrirNovelia(); return; }
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
function pintarUltimaCopia() {
  const b = $("#btnBackup"); if (!b) return;
  b.textContent = S.ultimaCopia ? "Copia de seguridad (última: " + dayLabel(S.ultimaCopia) + ")" : "Copia de seguridad";
}
$("#btnBackup").addEventListener("click", () => {
  openModal(`<h2>Copia de seguridad</h2>
    <p style="margin:0">Tus datos se guardan en este navegador. Descarga una copia de vez en cuando y guárdala en tu ordenador o en Drive: te sirve si cambias de móvil, borras el navegador o quieres pasar tus datos a otro aparato.</p>
    <div class="acts" style="justify-content:flex-start"><button class="btn" type="button" id="bkDown">Descargar copia</button>
      <label class="btn ghost" style="display:inline-flex;align-items:center">Cargar una copia<input type="file" id="bkFile" accept=".json,application/json" style="display:none"></label></div>
    <p class="hint" id="bkMsg" style="margin:0"></p>
    <details><summary class="hint" style="cursor:pointer">Copiar o pegar como texto</summary>
      <label class="field" style="margin-top:8px"><span>Tus datos</span><textarea id="bkT" style="min-height:140px;font-family:monospace;font-size:.75rem">${esc(JSON.stringify(S))}</textarea></label>
      <div class="acts" style="justify-content:flex-start;margin-top:8px"><button class="btn ghost sm" type="button" id="bkCopy">Copiar texto</button><button class="btn ghost sm" type="button" id="bkRes">Restaurar desde el texto</button></div>
    </details>
    <div class="acts"><button class="btn ghost" type="button" data-close>Cerrar</button></div>`, box => {
    const msg = $("#bkMsg", box);
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
      S = { v: 1, activo: p.id, proyectos: [p], posts: [], ventas: [], prensa: [], colabs: [], perfil: S.perfil, ajustes: S.ajustes };
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
const enClaude = !!(window.claude && typeof window.claude.use === "function");
setSave("", enClaude ? "Conectando…" : "Guardado en este navegador");
if (enClaude) connectDb(); else setSave("local", "Guardado en este navegador");

// Primera vez: elegir entre ver el ejemplo o empezar con su novela
if (!guardado && !enClaude) {
  openModal(`<div class="eyebrow">Te damos la bienvenida</div><h2>Kit Escritoras</h2>
    <p style="margin:0">Todo lo que pasa cuando tu novela está escrita: ficha del libro, Amazon KDP, producción, checklist de lanzamiento, redes, pedidos, cuentas, prensa y la página para tu web.</p>
    <p class="hint" style="margin:0">Todo se guarda en este navegador, sin cuentas ni contraseñas. Desde «Copia de seguridad» puedes descargar tus datos cuando quieras.</p>
    <label class="field"><span>Título de tu novela</span><input type="text" id="wTit" placeholder="Puedes cambiarlo luego"></label>
    <div class="acts"><button class="btn ghost" type="button" id="wEj">Ver primero un ejemplo</button><button class="btn" type="button" id="wGo">Empezar con mi novela</button></div>`, box => {
    $("#wEj", box).addEventListener("click", () => { closeModal(); save(); });
    $("#wGo", box).addEventListener("click", () => {
      const p = newProject($("#wTit", box).value.trim() || "Mi novela");
      S = { v: 1, activo: p.id, proyectos: [p], posts: [], ventas: [], prensa: [], colabs: [] };
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
})();
