// ===== SETTINGS — the only things you should need to change =====
// 1. Contact form: make a free form at formspree.io, then paste its ID here (e.g. "xyzabcd").
//    Until then, the form opens the visitor's email app instead.
const FORMSPREE_ID = "";

// 2. For Sale page: publish Dad's Google Sheet as CSV (File > Share > Publish to web > CSV)
//    and paste the link here. Sheet columns (row 1):
//    name | price | description | photo | status
//    photo  = a Google Drive share link (file shared "Anyone with the link") or any image link.
//             Put several links separated by spaces for more photos.
//    status = available, on hold, or sold
const SALE_SHEET_CSV = "";
// ================================================================

const EMAIL = "stringmedic@gmail.com";

// ---------- Mobile menu ----------
const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav");
if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open);
  });
}
document.querySelectorAll("[data-year]").forEach(el => (el.textContent = new Date().getFullYear()));

// ---------- Scroll animation ----------
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const observer = "IntersectionObserver" in window && !reduceMotion
  ? new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("in"); observer.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" })
  : null;

function animate(selector) {
  if (!observer) return;
  document.querySelectorAll(selector).forEach(el => {
    if (el.classList.contains("reveal")) return;
    const siblings = [...el.parentElement.children];
    el.style.transitionDelay = Math.min(siblings.indexOf(el), 6) * 70 + "ms";
    el.classList.add("reveal");
    observer.observe(el);
  });
}
const ANIMATED = [
  ".hero .copy > *", ".hero figure",
  ".page-head .wrap > *",
  ".split > *", ".split .stack > *",
  ".quotes figure", ".service", ".how > div",
  ".project > h2", ".project > p", ".gallery button",
  ".details dl > div", ".contact-grid form",
  ".product", ".empty",
  "section > .wrap > .eyebrow", ".parallax .wrap > *", ".story-section .stack > *"
].join(",");
animate(ANIMATED);

// ---------- Photo banners move slower than the page ----------
const parallaxImgs = [...document.querySelectorAll("[data-parallax], .hero figure img")];
let ticking = false;
function moveParallax() {
  const vh = window.innerHeight;
  parallaxImgs.forEach(img => {
    const box = img.parentElement.getBoundingClientRect();
    if (box.bottom < -100 || box.top > vh + 100) return;
    const offset = box.top + box.height / 2 - vh / 2;   // 0 when centred on screen
    if (img.hasAttribute("data-parallax")) {
      img.style.transform = `translate3d(0, ${offset * -0.3}px, 0)`;
    } else {
      img.style.transform = `translate3d(0, ${offset * -0.08}px, 0) scale(1.12)`;  // hero photo
    }
  });
  ticking = false;
}
if (!reduceMotion && parallaxImgs.length) {
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(moveParallax); } }, { passive: true });
  window.addEventListener("resize", moveParallax);
  moveParallax();
}

// ---------- About story: photo changes with each step ----------
const steps = [...document.querySelectorAll(".story-step")];
const storyImgs = [...document.querySelectorAll(".story-media img")];
if (steps.length && "IntersectionObserver" in window) {
  const storyObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const i = steps.indexOf(e.target);
      steps.forEach((s, n) => s.classList.toggle("active", n === i));
      storyImgs.forEach((img, n) => img.classList.toggle("active", n === Math.min(i, storyImgs.length - 1)));
    });
  }, { rootMargin: window.innerWidth <= 820 ? "-62% 0px -25% 0px" : "-45% 0px -45% 0px" });
  steps.forEach(s => storyObs.observe(s));
}

// ---------- Photo viewer (lightbox) ----------
const lb = document.createElement("div");
lb.className = "lightbox";
lb.hidden = true;
lb.innerHTML = `
  <img alt="">
  <button class="lb-close" aria-label="Close">&times;</button>
  <button class="lb-prev" aria-label="Previous photo">&#8249;</button>
  <button class="lb-next" aria-label="Next photo">&#8250;</button>`;
document.body.appendChild(lb);
const big = lb.querySelector("img");
let lbList = [], lbIndex = 0;

function openViewer(list, i) {
  lbList = list; lbIndex = i; showPhoto();
  lb.hidden = false;
  document.body.classList.add("lb-open");
  lb.querySelector(".lb-prev").hidden = lb.querySelector(".lb-next").hidden = list.length < 2;
}
function showPhoto() {
  lbIndex = (lbIndex + lbList.length) % lbList.length;
  big.src = lbList[lbIndex].src;
  big.alt = lbList[lbIndex].alt;
}
function closeViewer() {
  lb.hidden = true;
  document.body.classList.remove("lb-open");
}
lb.querySelector(".lb-close").addEventListener("click", closeViewer);
lb.querySelector(".lb-prev").addEventListener("click", e => { e.stopPropagation(); lbIndex--; showPhoto(); });
lb.querySelector(".lb-next").addEventListener("click", e => { e.stopPropagation(); lbIndex++; showPhoto(); });
lb.addEventListener("click", e => { if (e.target === lb) closeViewer(); });
document.addEventListener("keydown", e => {
  if (lb.hidden) return;
  if (e.key === "Escape") closeViewer();
  if (e.key === "ArrowLeft") { lbIndex--; showPhoto(); }
  if (e.key === "ArrowRight") { lbIndex++; showPhoto(); }
});
function wireGallery(root) {
  const imgs = [...root.querySelectorAll(".gallery img, .product figure img")];
  imgs.forEach((img, i) => {
    const target = img.closest("button") || img.closest("figure");
    target.style.cursor = "zoom-in";
    target.addEventListener("click", () => {
      // within a product, only cycle that product's photos
      const product = img.closest(".product");
      const list = product ? (product._photos || [img]) : imgs;
      openViewer(list, product ? 0 : i);
    });
  });
}
wireGallery(document);

// ---------- Contact form ----------
const form = document.querySelector("#contact-form");
if (form) {
  const status = document.querySelector(".form-status");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const data = new FormData(form);
    if (!FORMSPREE_ID) {
      const body = `Name: ${data.get("name")}\nPhone: ${data.get("phone") || "-"}\nAbout: ${data.get("instrument")}\n\n${data.get("message")}`;
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Website enquiry from " + data.get("name"))}&body=${encodeURIComponent(body)}`;
      return;
    }
    status.textContent = "Sending…";
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST", body: data, headers: { Accept: "application/json" }
      });
      if (!res.ok) throw new Error();
      form.reset();
      status.textContent = "Thanks, your message has been sent. Luke will get back to you soon.";
    } catch {
      status.textContent = `Your message didn't send. Please email ${EMAIL} or call 021 0230 5111.`;
    }
  });
}

// Pre-fill the form when someone clicks "Enquire" on a listing
const forItem = new URLSearchParams(location.search).get("instrument");
if (form && forItem) {
  document.querySelector("#instrument").value = "Buying an instrument";
  const msg = document.querySelector("#message");
  if (!msg.value) msg.value = `Hi Luke, I'm interested in the ${forItem} listed for sale. Could I arrange a time to see and play it?`;
}

// ---------- For Sale listings ----------
// Shown only when previewing on your own computer before the Google Sheet is connected,
// so you can see how listings look. They never appear on the live site.
const EXAMPLES = [
  { name: "Example: 4/4 violin, French, 1987", price: "$2,400", status: "available",
    description: "Restored and set up in the workshop. Warm, even tone. Includes case and bow.",
    photo: "images/luke-workshop.jpg images/luke-violin.jpg" },
  { name: "Example: 3/4 student violin", price: "$650", status: "on hold",
    description: "Good first instrument, newly strung and adjusted.",
    photo: "images/carving-scroll.jpg" },
  { name: "Example: Acoustic guitar", price: "$480", status: "sold",
    description: "Fully repaired after flood damage.",
    photo: "images/bridge-knife.jpg" }
];

const listings = document.querySelector("#listings");
if (listings) loadListings();

async function loadListings() {
  const empty = `<div class="empty">Nothing listed right now. New instruments come through the workshop often, so <a href="contact.html?instrument=instrument">tell us what you're after</a>.</div>`;
  let items = [];
  let isExample = false;
  if (SALE_SHEET_CSV) {
    try {
      const text = await (await fetch(SALE_SHEET_CSV, { cache: "no-store" })).text();
      const [head, ...rows] = parseCSV(text);
      const keys = head.map(h => h.trim().toLowerCase());
      items = rows.map(r => Object.fromEntries(keys.map((k, i) => [k, (r[i] || "").trim()]))).filter(i => i.name);
    } catch { items = []; }
  } else if (location.protocol === "file:") {
    items = EXAMPLES; isExample = true;
  }
  if (!items.length) { listings.innerHTML = empty; animate(".empty"); return; }

  // available first, then on hold, then sold
  const order = s => ({ available: 0, "on hold": 1, sold: 2 }[(s || "available").toLowerCase()] ?? 0);
  items.sort((a, b) => order(a.status) - order(b.status));

  listings.innerHTML =
    (isExample ? `<p class="tip" style="margin-bottom:2rem">Preview only: these are example listings so you can see the layout. They disappear once Dad's Google Sheet is connected.</p>` : "") +
    `<div class="products">${items.map(card).join("")}</div>`;

  listings.querySelectorAll(".product").forEach((el, i) => {
    const photos = photoLinks(items[i].photo);
    el._photos = photos.map(src => ({ src, alt: items[i].name }));
  });
  wireGallery(listings);
  animate(".product");
}

function card(p) {
  const status = (p.status || "available").toLowerCase();
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const photos = photoLinks(p.photo);
  const badge = status === "sold" ? `<span class="badge sold">Sold</span>`
    : status === "on hold" ? `<span class="badge">On hold</span>` : "";
  const action = status === "sold" ? "" :
    `<a class="btn${status === "available" ? " primary" : ""}" href="contact.html?instrument=${encodeURIComponent(p.name)}">Enquire</a>`;
  return `<article class="product">
    <figure>${photos[0] ? `<img src="${esc(photos[0])}" alt="${esc(p.name)}" loading="lazy">` : ""}</figure>
    ${badge}
    <h3>${esc(p.name)}</h3>
    ${p.price ? `<div class="price ${status === "sold" ? "sold" : ""}">${esc(p.price)}</div>` : ""}
    ${p.description ? `<p>${esc(p.description)}</p>` : ""}
    ${photos.length > 1 ? `<span class="eyebrow" style="color:var(--muted)">${photos.length} photos, tap to view</span>` : ""}
    <div class="actions">${action}</div>
  </article>`;
}

// Turns Google Drive share links into image links that work on a web page
function photoLinks(cell) {
  return (cell || "").split(/\s+/).filter(Boolean).map(url => {
    const m = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?.*id=)([\w-]+)/);
    return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1600` : url;
  });
}

function parseCSV(text) {
  const rows = []; let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (c !== "\r") cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}
