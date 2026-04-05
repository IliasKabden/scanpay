const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Mening Deregim Team";
pres.title = "Mening Deregim - Pitch Deck";

// Colors
const BG = "0D1117";
const BG2 = "161B22";
const BLUE = "1A73E8";
const GREEN = "34A853";
const RED = "EA4335";
const YELLOW = "FBBC04";
const ORANGE = "FF6D01";
const CYAN = "46BDC6";
const WHITE = "FFFFFF";
const GRAY = "8B949E";
const LGRAY = "C9D1D9";
const CARD = "21262D";

const FONT = "Calibri";
const W = 10, H = 5.625;

// ====== SLIDE 1: TITLE ======
{
  const s = pres.addSlide();
  s.background = { color: BG };
  // Top accent line
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.06, fill: { color: BLUE } });
  // Main title
  s.addText("\u041C\u0435\u043D\u0456\u04A3 \u0414\u0435\u0440\u0435\u0433\u0456\u043C", {
    x: 0.5, y: 1.2, w: 9, h: 1.2, fontSize: 54, fontFace: FONT, color: WHITE, bold: true, align: "center", margin: 0,
  });
  // Subtitle
  s.addText("\u041C\u0430\u0440\u043A\u0435\u0442\u043F\u043B\u0435\u0439\u0441 \u0434\u0430\u043D\u043D\u044B\u0445 \u043D\u0430 \u0431\u043B\u043E\u043A\u0447\u0435\u0439\u043D\u0435 Solana", {
    x: 0.5, y: 2.4, w: 9, h: 0.5, fontSize: 22, fontFace: FONT, color: BLUE, align: "center", margin: 0,
  });
  // Tagline
  s.addShape(pres.shapes.RECTANGLE, { x: 3, y: 3.2, w: 4, h: 0.55, fill: { color: BLUE } });
  s.addText("\u0412\u0430\u0448\u0438 \u0447\u0435\u043A\u0438 = \u0412\u0430\u0448\u0438 \u0434\u0435\u043D\u044C\u0433\u0438", {
    x: 3, y: 3.2, w: 4, h: 0.55, fontSize: 18, fontFace: FONT, color: WHITE, bold: true, align: "center", valign: "middle", margin: 0,
  });
  // Bottom
  s.addText("IT \u043A\u043E\u043D\u043A\u0443\u0440\u0441 2026", {
    x: 0.5, y: 4.9, w: 9, h: 0.4, fontSize: 12, fontFace: FONT, color: GRAY, align: "center", margin: 0,
  });
}

// ====== SLIDE 2: PROBLEM ======
{
  const s = pres.addSlide();
  s.background = { color: BG };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.06, fill: { color: RED } });
  s.addText("\u041F\u0440\u043E\u0431\u043B\u0435\u043C\u0430", {
    x: 0.6, y: 0.3, w: 5, h: 0.6, fontSize: 36, fontFace: FONT, color: RED, bold: true, margin: 0,
  });
  // Bullet points
  const problems = [
    "\u041A\u0430\u0436\u0434\u044B\u0439 \u0434\u0435\u043D\u044C \u043C\u0438\u043B\u043B\u0438\u043E\u043D\u044B \u043A\u0430\u0437\u0430\u0445\u0441\u0442\u0430\u043D\u0446\u0435\u0432 \u0434\u0435\u043B\u0430\u044E\u0442 \u043F\u043E\u043A\u0443\u043F\u043A\u0438",
    "\u0418\u0445 \u0434\u0430\u043D\u043D\u044B\u0435 \u2014 \u0437\u043E\u043B\u043E\u0442\u0430\u044F \u0436\u0438\u043B\u0430 \u0434\u043B\u044F Coca-Cola, Samsung, Magnum",
    "\u041D\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0438 \u041D\u0415 \u043F\u043E\u043B\u0443\u0447\u0430\u044E\u0442 \u043D\u0438\u0447\u0435\u0433\u043E \u0437\u0430 \u0441\u0432\u043E\u0438 \u0434\u0430\u043D\u043D\u044B\u0435",
    "\u041A\u043E\u043C\u043F\u0430\u043D\u0438\u0438 \u043F\u043E\u043A\u0443\u043F\u0430\u044E\u0442 \u0434\u0430\u043D\u043D\u044B\u0435 \u0443 \u043F\u043E\u0441\u0440\u0435\u0434\u043D\u0438\u043A\u043E\u0432 \u0437\u0430 \u043C\u0438\u043B\u043B\u0438\u043E\u043D\u044B \u20B8",
  ];
  problems.forEach((t, i) => {
    s.addShape(pres.shapes.OVAL, { x: 0.6, y: 1.15 + i * 0.65, w: 0.12, h: 0.12, fill: { color: RED } });
    s.addText(t, { x: 0.9, y: 1.0 + i * 0.65, w: 5.5, h: 0.5, fontSize: 15, fontFace: FONT, color: LGRAY, margin: 0 });
  });
  // Big stat card
  s.addShape(pres.shapes.RECTANGLE, { x: 6.5, y: 1.0, w: 3.2, h: 2.8, fill: { color: CARD } });
  s.addText("92%", { x: 6.5, y: 1.3, w: 3.2, h: 1.2, fontSize: 64, fontFace: FONT, color: RED, bold: true, align: "center", margin: 0 });
  s.addText("\u043F\u043E\u0442\u0440\u0435\u0431\u0438\u0442\u0435\u043B\u0435\u0439 \u0445\u043E\u0442\u044F\u0442\n\u043A\u043E\u043D\u0442\u0440\u043E\u043B\u0438\u0440\u043E\u0432\u0430\u0442\u044C\n\u0441\u0432\u043E\u0438 \u0434\u0430\u043D\u043D\u044B\u0435", {
    x: 6.5, y: 2.5, w: 3.2, h: 1.0, fontSize: 14, fontFace: FONT, color: GRAY, align: "center", margin: 0,
  });
  // Bottom red bar
  s.addShape(pres.shapes.RECTANGLE, { x: 6.5, y: 3.7, w: 3.2, h: 0.07, fill: { color: RED } });
}

// ====== SLIDE 3: SOLUTION ======
{
  const s = pres.addSlide();
  s.background = { color: BG };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.06, fill: { color: GREEN } });
  s.addText("\u0420\u0435\u0448\u0435\u043D\u0438\u0435 \u2014 \u041C\u0435\u043D\u0456\u04A3 \u0414\u0435\u0440\u0435\u0433\u0456\u043C", {
    x: 0.6, y: 0.3, w: 8, h: 0.6, fontSize: 32, fontFace: FONT, color: GREEN, bold: true, margin: 0,
  });
  // Three step cards
  const steps = [
    { icon: "1", title: "\u0421\u043A\u0430\u043D\u0438\u0440\u0443\u0439 \u0447\u0435\u043A", desc: "\u0424\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0440\u0443\u0439 \u0447\u0435\u043A\n\u0432 Telegram \u0431\u043E\u0442\u0435", color: BLUE },
    { icon: "2", title: "AI \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442", desc: "Claude AI \u0438\u0437\u0432\u043B\u0435\u043A\u0430\u0435\u0442\n\u043C\u0430\u0433\u0430\u0437\u0438\u043D, \u0442\u043E\u0432\u0430\u0440\u044B, \u0446\u0435\u043D\u044B", color: GREEN },
    { icon: "3", title: "\u041F\u043E\u043B\u0443\u0447\u0438 \u0434\u0435\u043D\u044C\u0433\u0438", desc: "\u041A\u043E\u043C\u043F\u0430\u043D\u0438\u0438 \u043F\u043E\u043A\u0443\u043F\u0430\u044E\u0442 \u0434\u0430\u043D\u043D\u044B\u0435\n\u0434\u0435\u043D\u044C\u0433\u0438 \u043D\u0430 \u043A\u043E\u0448\u0435\u043B\u0451\u043A", color: YELLOW },
  ];
  steps.forEach((st, i) => {
    const x = 0.5 + i * 3.15;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w: 2.9, h: 2.8, fill: { color: CARD } });
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w: 2.9, h: 0.06, fill: { color: st.color } });
    s.addShape(pres.shapes.OVAL, { x: x + 1.05, y: 1.5, w: 0.8, h: 0.8, fill: { color: st.color } });
    s.addText(st.icon, { x: x + 1.05, y: 1.5, w: 0.8, h: 0.8, fontSize: 28, fontFace: FONT, color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
    s.addText(st.title, { x: x + 0.2, y: 2.5, w: 2.5, h: 0.5, fontSize: 17, fontFace: FONT, color: WHITE, bold: true, align: "center", margin: 0 });
    s.addText(st.desc, { x: x + 0.2, y: 3.0, w: 2.5, h: 0.8, fontSize: 12, fontFace: FONT, color: GRAY, align: "center", margin: 0 });
  });
  // Flow arrow
  s.addText("\u0427\u0435\u043A  \u2192  AI  \u2192  Solana  \u2192  \u20B8", {
    x: 0.5, y: 4.3, w: 9, h: 0.5, fontSize: 18, fontFace: FONT, color: BLUE, bold: true, align: "center", margin: 0,
  });
}

// ====== SLIDE 4: HOW IT WORKS ======
{
  const s = pres.addSlide();
  s.background = { color: BG };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.06, fill: { color: BLUE } });
  s.addText("\u041A\u0430\u043A \u044D\u0442\u043E \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442", {
    x: 0.6, y: 0.3, w: 8, h: 0.6, fontSize: 32, fontFace: FONT, color: BLUE, bold: true, margin: 0,
  });
  // Flow steps
  const flow = [
    { label: "Telegram", sub: "\u0424\u043E\u0442\u043E \u0447\u0435\u043A\u0430", c: BLUE },
    { label: "Claude AI", sub: "OCR + \u043F\u0430\u0440\u0441\u0438\u043D\u0433", c: GREEN },
    { label: "SHA256", sub: "\u0425\u0435\u0448 \u0434\u0430\u043D\u043D\u044B\u0445", c: ORANGE },
    { label: "Solana", sub: "\u0411\u043B\u043E\u043A\u0447\u0435\u0439\u043D", c: CYAN },
    { label: "Dashboard", sub: "\u0410\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0430", c: YELLOW },
    { label: "\u041E\u043F\u043B\u0430\u0442\u0430", sub: "\u0421\u043C\u0430\u0440\u0442-\u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442", c: GREEN },
  ];
  flow.forEach((f, i) => {
    const x = 0.3 + i * 1.6;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w: 1.4, h: 1.1, fill: { color: CARD } });
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w: 1.4, h: 0.05, fill: { color: f.c } });
    s.addText(f.label, { x, y: 1.35, w: 1.4, h: 0.5, fontSize: 12, fontFace: FONT, color: WHITE, bold: true, align: "center", margin: 0 });
    s.addText(f.sub, { x, y: 1.8, w: 1.4, h: 0.35, fontSize: 9, fontFace: FONT, color: GRAY, align: "center", margin: 0 });
    if (i < flow.length - 1) {
      s.addText("\u2192", { x: x + 1.4, y: 1.45, w: 0.2, h: 0.4, fontSize: 16, fontFace: FONT, color: GRAY, align: "center", margin: 0 });
    }
  });
  // Key points
  const points = [
    "\u0414\u0430\u043D\u043D\u044B\u0435 \u0445\u0435\u0448\u0438\u0440\u0443\u044E\u0442\u0441\u044F (SHA256) \u0438 \u0437\u0430\u043F\u0438\u0441\u044B\u0432\u0430\u044E\u0442\u0441\u044F \u043D\u0430 Solana \u2014 \u043D\u0435\u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E \u043F\u043E\u0434\u0434\u0435\u043B\u0430\u0442\u044C",
    "AI \u0430\u0432\u0442\u043E\u043D\u043E\u043C\u043D\u043E \u043F\u043E\u0434\u0431\u0438\u0440\u0430\u0435\u0442 \u0430\u0443\u0434\u0438\u0442\u043E\u0440\u0438\u044E \u0434\u043B\u044F \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438 \u0438 \u043D\u0430\u0437\u043D\u0430\u0447\u0430\u0435\u0442 \u0446\u0435\u043D\u0443",
    "\u0421\u043C\u0430\u0440\u0442-\u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u043E\u043F\u043B\u0430\u0447\u0438\u0432\u0430\u0435\u0442 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F\u043C",
  ];
  points.forEach((p, i) => {
    s.addShape(pres.shapes.OVAL, { x: 0.6, y: 2.7 + i * 0.6, w: 0.15, h: 0.15, fill: { color: BLUE } });
    s.addText(p, { x: 0.9, y: 2.6 + i * 0.6, w: 8.5, h: 0.45, fontSize: 13, fontFace: FONT, color: LGRAY, margin: 0 });
  });
  // Auto-moderation note
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.5, w: 9, h: 0.45, fill: { color: "1C2333" } });
  s.addText("\u0410\u0432\u0442\u043E-\u043C\u043E\u0434\u0435\u0440\u0430\u0446\u0438\u044F: \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0434\u0443\u0431\u043B\u0438\u043A\u0430\u0442\u043E\u0432, \u0430\u043D\u043E\u043C\u0430\u043B\u0438\u0439 \u0446\u0435\u043D, \u0447\u0430\u0441\u0442\u043E\u0442\u044B, \u0434\u0430\u0442 + \u0440\u0443\u0447\u043D\u0430\u044F \u043E\u0447\u0435\u0440\u0435\u0434\u044C \u0432 Admin Panel", {
    x: 0.5, y: 4.5, w: 9, h: 0.45, fontSize: 11, fontFace: FONT, color: GRAY, align: "center", valign: "middle", margin: 0,
  });
}

// ====== SLIDE 5: PRODUCT ======
{
  const s = pres.addSlide();
  s.background = { color: BG };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.06, fill: { color: CYAN } });
  s.addText("\u041F\u0440\u043E\u0434\u0443\u043A\u0442 \u2014 5 \u043C\u043E\u0434\u0443\u043B\u0435\u0439", {
    x: 0.6, y: 0.3, w: 8, h: 0.6, fontSize: 32, fontFace: FONT, color: CYAN, bold: true, margin: 0,
  });
  const modules = [
    { title: "Telegram Mini App", desc: "\u0421\u043A\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0447\u0435\u043A\u043E\u0432, \u043A\u043E\u0448\u0435\u043B\u0451\u043A,\n\u043F\u0440\u043E\u0444\u0438\u043B\u044C (RU/KZ/EN)", c: BLUE },
    { title: "Company Dashboard", desc: "\u041A\u0430\u0440\u0442\u0430 \u043F\u0440\u043E\u0434\u0430\u0436, Zebra BI,\nPDF \u044D\u043A\u0441\u043F\u043E\u0440\u0442, real-time", c: GREEN },
    { title: "Admin Panel", desc: "\u041C\u043E\u0434\u0435\u0440\u0430\u0446\u0438\u044F, \u0432\u044B\u0432\u043E\u0434\u044B,\n\u0430\u0443\u0434\u0438\u0442, \u0430\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0430", c: YELLOW },
    { title: "Smart Contract", desc: "Solana Anchor (Rust),\n\u0430\u0432\u0442\u043E\u043F\u043B\u0430\u0442\u0435\u0436\u0438", c: ORANGE },
    { title: "Backend API", desc: "35+ \u044D\u043D\u0434\u043F\u043E\u0439\u043D\u0442\u043E\u0432,\nAI-\u043C\u0430\u0442\u0447\u0438\u043D\u0433, \u043D\u043E\u0442\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u0438", c: RED },
  ];
  // Top row: 3 modules
  modules.slice(0, 3).forEach((m, i) => {
    const x = 0.4 + i * 3.15;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.1, w: 2.95, h: 1.6, fill: { color: CARD } });
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.1, w: 2.95, h: 0.05, fill: { color: m.c } });
    s.addText(m.title, { x: x + 0.15, y: 1.25, w: 2.65, h: 0.4, fontSize: 14, fontFace: FONT, color: WHITE, bold: true, margin: 0 });
    s.addText(m.desc, { x: x + 0.15, y: 1.7, w: 2.65, h: 0.8, fontSize: 11, fontFace: FONT, color: GRAY, margin: 0 });
  });
  // Bottom row: 2 modules
  modules.slice(3).forEach((m, i) => {
    const x = 1.9 + i * 3.35;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 2.95, w: 3.15, h: 1.5, fill: { color: CARD } });
    s.addShape(pres.shapes.RECTANGLE, { x, y: 2.95, w: 3.15, h: 0.05, fill: { color: m.c } });
    s.addText(m.title, { x: x + 0.15, y: 3.1, w: 2.85, h: 0.4, fontSize: 14, fontFace: FONT, color: WHITE, bold: true, margin: 0 });
    s.addText(m.desc, { x: x + 0.15, y: 3.5, w: 2.85, h: 0.7, fontSize: 11, fontFace: FONT, color: GRAY, margin: 0 });
  });
  // URL
  s.addShape(pres.shapes.RECTANGLE, { x: 2.5, y: 4.75, w: 5, h: 0.45, fill: { color: BLUE } });
  s.addText("app.aiqalam.kz", {
    x: 2.5, y: 4.75, w: 5, h: 0.45, fontSize: 16, fontFace: FONT, color: WHITE, bold: true, align: "center", valign: "middle", margin: 0,
  });
}

// ====== SLIDE 6: BUSINESS MODEL ======
{
  const s = pres.addSlide();
  s.background = { color: BG };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.06, fill: { color: GREEN } });
  s.addText("\u0411\u0438\u0437\u043D\u0435\u0441-\u043C\u043E\u0434\u0435\u043B\u044C", {
    x: 0.6, y: 0.3, w: 8, h: 0.6, fontSize: 32, fontFace: FONT, color: GREEN, bold: true, margin: 0,
  });
  // Revenue streams
  const streams = [
    { title: "\u041A\u043E\u043C\u0438\u0441\u0441\u0438\u044F 15%", desc: "\u0441 \u043A\u0430\u0436\u0434\u043E\u0439\n\u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u0438", c: BLUE },
    { title: "\u041F\u043E\u0434\u043F\u0438\u0441\u043A\u0430", desc: "\u043F\u0440\u0435\u043C\u0438\u0443\u043C\n\u0430\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0430", c: GREEN },
    { title: "API \u0434\u043E\u0441\u0442\u0443\u043F", desc: "\u0438\u043D\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u044F\nCRM/ERP", c: YELLOW },
  ];
  streams.forEach((st, i) => {
    const x = 0.5 + i * 3.15;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.1, w: 2.9, h: 1.5, fill: { color: CARD } });
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.1, w: 2.9, h: 0.05, fill: { color: st.c } });
    s.addText(st.title, { x, y: 1.3, w: 2.9, h: 0.45, fontSize: 18, fontFace: FONT, color: WHITE, bold: true, align: "center", margin: 0 });
    s.addText(st.desc, { x, y: 1.8, w: 2.9, h: 0.6, fontSize: 12, fontFace: FONT, color: GRAY, align: "center", margin: 0 });
  });
  // Stats
  const stats = [
    { num: "6 072", label: "\u0442\u043E\u0432\u0430\u0440\u043E\u0432 \u0432 \u0431\u0430\u0437\u0435", c: BLUE },
    { num: "35+", label: "\u0447\u0435\u043A\u043E\u0432 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u043E", c: GREEN },
    { num: "5", label: "\u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0439", c: YELLOW },
    { num: "~50 \u20B8", label: "\u0437\u0430 \u0447\u0435\u043A", c: ORANGE },
  ];
  stats.forEach((st, i) => {
    const x = 0.5 + i * 2.35;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 3.0, w: 2.15, h: 1.6, fill: { color: CARD } });
    s.addText(st.num, { x, y: 3.15, w: 2.15, h: 0.8, fontSize: 32, fontFace: FONT, color: st.c, bold: true, align: "center", margin: 0 });
    s.addText(st.label, { x, y: 3.95, w: 2.15, h: 0.4, fontSize: 11, fontFace: FONT, color: GRAY, align: "center", margin: 0 });
  });
}

// ====== SLIDE 7: TECH STACK ======
{
  const s = pres.addSlide();
  s.background = { color: BG };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.06, fill: { color: ORANGE } });
  s.addText("\u0422\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u0438\u0438", {
    x: 0.6, y: 0.3, w: 8, h: 0.6, fontSize: 32, fontFace: FONT, color: ORANGE, bold: true, margin: 0,
  });
  const tech = [
    { cat: "Frontend", items: "React 19, MUI Material Design\nRecharts, Leaflet Maps", c: BLUE },
    { cat: "Backend", items: "Node.js, Express, SQLite\nClaude AI API", c: GREEN },
    { cat: "Blockchain", items: "Solana, Anchor (Rust)\nSPL Tokens, Devnet", c: CYAN },
    { cat: "Infrastructure", items: "Ubuntu, Nginx, PM2\nLet's Encrypt SSL", c: ORANGE },
    { cat: "AI", items: "Claude Sonnet 4\nOCR + Autonomous Matching", c: RED },
    { cat: "Mobile", items: "Telegram Mini App\n3 \u044F\u0437\u044B\u043A\u0430 (RU/KZ/EN)", c: YELLOW },
  ];
  tech.forEach((t, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.4 + col * 3.15, y = 1.1 + row * 1.8;
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.95, h: 1.5, fill: { color: CARD } });
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.06, h: 1.5, fill: { color: t.c } });
    s.addText(t.cat, { x: x + 0.2, y: y + 0.15, w: 2.6, h: 0.35, fontSize: 14, fontFace: FONT, color: WHITE, bold: true, margin: 0 });
    s.addText(t.items, { x: x + 0.2, y: y + 0.55, w: 2.6, h: 0.7, fontSize: 11, fontFace: FONT, color: GRAY, margin: 0 });
  });
  // Footer
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.85, w: 9, h: 0.4, fill: { color: "1C2333" } });
  s.addText("\u041F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E \u0440\u0430\u0431\u043E\u0447\u0438\u0439 \u043F\u0440\u043E\u0434\u0443\u043A\u0442, \u0437\u0430\u0434\u0435\u043F\u043B\u043E\u0435\u043D \u043D\u0430 app.aiqalam.kz", {
    x: 0.5, y: 4.85, w: 9, h: 0.4, fontSize: 12, fontFace: FONT, color: GREEN, bold: true, align: "center", valign: "middle", margin: 0,
  });
}

// ====== SLIDE 8: CTA ======
{
  const s = pres.addSlide();
  s.background = { color: BG };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.06, fill: { color: BLUE } });
  // Title
  s.addText("\u041C\u0435\u043D\u0456\u04A3 \u0414\u0435\u0440\u0435\u0433\u0456\u043C", {
    x: 0.5, y: 0.6, w: 9, h: 0.8, fontSize: 44, fontFace: FONT, color: WHITE, bold: true, align: "center", margin: 0,
  });
  // Quote
  s.addText([
    { text: "\u0414\u0430\u043D\u043D\u044B\u0435 \u2014 \u043D\u043E\u0432\u0430\u044F \u043D\u0435\u0444\u0442\u044C.\n", options: { fontSize: 22, color: LGRAY, italic: true } },
    { text: "\u041F\u0443\u0441\u0442\u044C \u043F\u0440\u0438\u0431\u044B\u043B\u044C \u0438\u0434\u0451\u0442 \u043D\u0430\u0440\u043E\u0434\u0443.", options: { fontSize: 22, color: GREEN, bold: true, italic: true } },
  ], { x: 1, y: 1.6, w: 8, h: 1.0, fontFace: FONT, align: "center", margin: 0 });
  // Links
  const links = [
    { icon: "\uD83C\uDF10", label: "app.aiqalam.kz", desc: "\u0413\u043B\u0430\u0432\u043D\u0430\u044F" },
    { icon: "\uD83D\uDCCA", label: "app.aiqalam.kz/dashboard", desc: "\u0414\u0430\u0448\u0431\u043E\u0440\u0434 \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0439" },
    { icon: "\u2699\uFE0F", label: "app.aiqalam.kz/admin", desc: "Admin Panel" },
  ];
  links.forEach((l, i) => {
    const x = 1.2 + i * 2.7;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 3.0, w: 2.5, h: 1.0, fill: { color: CARD } });
    s.addText(l.label, { x, y: 3.1, w: 2.5, h: 0.45, fontSize: 11, fontFace: FONT, color: BLUE, bold: true, align: "center", margin: 0 });
    s.addText(l.desc, { x, y: 3.55, w: 2.5, h: 0.35, fontSize: 10, fontFace: FONT, color: GRAY, align: "center", margin: 0 });
  });
  // Bottom
  s.addShape(pres.shapes.RECTANGLE, { x: 3, y: 4.4, w: 4, h: 0.55, fill: { color: BLUE } });
  s.addText("\u0421\u043F\u0430\u0441\u0438\u0431\u043E! \u0412\u043E\u043F\u0440\u043E\u0441\u044B?", {
    x: 3, y: 4.4, w: 4, h: 0.55, fontSize: 20, fontFace: FONT, color: WHITE, bold: true, align: "center", valign: "middle", margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: H - 0.06, w: W, h: 0.06, fill: { color: BLUE } });
}

pres.writeFile({ fileName: path.join(__dirname, "pitch-deck.pptx") })
  .then(() => console.log("PPTX created: docs/pitch-deck.pptx"))
  .catch(e => console.error("Error:", e));
