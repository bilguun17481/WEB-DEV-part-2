"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "cs" | "en";
type Text = { cs: string; en: string };

export const dict = {
  nav: {
    "televize-audio": { cs: "Televize", en: "TV" },
    "velke-spotrebice": { cs: "Spotřebiče", en: "Appliances" },
    "male-spotrebice": { cs: "Domácnost", en: "Home" },
    "pocitace-telefony": { cs: "Počítače", en: "Computers" },
    naradi: { cs: "Nářadí", en: "Tools" },
    zahrada: { cs: "Zahrada", en: "Garden" },
    prodejny: { cs: "Prodejny", en: "Stores" },
    servis: { cs: "Servis", en: "Service" },
    kontakt: { cs: "Kontakt", en: "Contact" },
    cart: { cs: "Košík", en: "Cart" },
    search: { cs: "Hledat", en: "Search" },
    menu: { cs: "Menu", en: "Menu" },
  },
  topbar: {
    cs: "Doprava zdarma od 2 000 Kč · 6 prodejen na Vysočině a v Pardubickém kraji · Zákaznická linka +420 702 521 521, Po–Pá 7:30–15:00",
    en: "Free delivery over 2 000 Kč · 6 stores in Vysočina and the Pardubice region · Customer line +420 702 521 521, Mon–Fri 7:30–15:00",
  },
  home: {
    linesEyebrow: { cs: "Sortiment", en: "Range" },
    linesTitle: { cs: "Všechno pro domácnost, dílnu i zahradu.", en: "Everything for the home, the workshop and the garden." },
    linesLead: {
      cs: "Elektro a domácí spotřebiče prodáváme od roku 1990. Šest prodejen, jeden e-shop a lidé, kteří vám poradí, zapojí a opraví.",
      en: "We have sold electronics and appliances since 1990. Six stores, one online shop and people who advise, install and repair.",
    },
    featuredEyebrow: { cs: "Vybrané produkty", en: "Featured products" },
    featuredTitle: { cs: "Právě skladem", en: "In stock now" },
    all: { cs: "Celý sortiment", en: "Full range" },
    slide: { cs: "Snímek", en: "Slide" },
    brandsEyebrow: { cs: "Značky", en: "Brands" },
    brandsTitle: { cs: "Značky, které prodáváme a servisujeme", en: "Brands we sell and service" },
    newsEyebrow: { cs: "Aktuálně", en: "News" },
    allNews: { cs: "Všechny aktuality", en: "All news" },
    serviceTitle: { cs: "Servis a poradenství pod jednou střechou.", en: "Service and advice under one roof." },
    serviceLead: {
      cs: "Záruční i pozáruční servis zahradní techniky a nářadí, reklamace spotřebičů, nastavení počítačů a telefonů. Na každé prodejně.",
      en: "Warranty and post-warranty service for garden machinery and tools, appliance claims, computer and phone set-up. In every store.",
    },
    serviceCta: { cs: "Více o servisu", en: "About our service" },
  },
  /** EU energy label explanations (2021 scale). */
  energy: {
    A: { cs: "Nejúspornější třída nové stupnice. Zatím ji dosahují jen špičkové spotřebiče.", en: "The most efficient class on the new scale. Only top-end appliances reach it yet." },
    B: { cs: "Velmi úsporný spotřebič, znatelně pod průměrem trhu.", en: "A very efficient appliance, well below the market average." },
    C: { cs: "Úsporný spotřebič s nízkou roční spotřebou.", en: "An efficient appliance with low annual consumption." },
    D: { cs: "Dobrá běžná spotřeba; typická pro většinu dnešních myček a chladniček.", en: "Good everyday consumption; typical of most dishwashers and fridges today." },
    E: { cs: "Průměrná spotřeba. Cenově dostupná volba do málo vytížených domácností.", en: "Average consumption. An affordable choice for lightly used households." },
    F: { cs: "Vyšší spotřeba. U televizí běžné, roční náklady závisí hlavně na velikosti a jasu.", en: "Higher consumption. Common for TVs; yearly cost depends mostly on size and brightness." },
    G: { cs: "Nejvyšší spotřeba na nové stupnici.", en: "The highest consumption on the new scale." },
  },
  catalog: {
    filterBrand: { cs: "Značka", en: "Brand" },
    filterEnergy: { cs: "Energetická třída", en: "Energy class" },
    all: { cs: "Vše", en: "All" },
    sort: { cs: "Řadit: cena vzestupně", en: "Sort: price ascending" },
    models: { cs: "produktů", en: "products" },
    inStock: { cs: "Skladem", en: "In stock" },
    new: { cs: "Novinka", en: "New" },
    sale: { cs: "Akce", en: "Sale" },
    demo: { cs: "Vystavený kus", en: "Display unit" },
    buy: { cs: "Koupit", en: "Buy" },
    soldOut: { cs: "Vyprodáno", en: "Sold out" },
    sortPriceAsc: { cs: "Cena vzestupně", en: "Price ascending" },
    sortPriceDesc: { cs: "Cena sestupně", en: "Price descending" },
    sortName: { cs: "Název", en: "Name" },
    filters: { cs: "Filtr", en: "Filter" },
    reset: { cs: "Zrušit filtr", en: "Clear filter" },
  },
  news: [
    { tag: { cs: "Novinka", en: "New" }, title: { cs: "QLED televize JVC a Sencor s Google TV a webOS", en: "JVC and Sencor QLED televisions with Google TV and webOS" }, text: { cs: "Nová řada od 43 do 65 palců s Mini LED podsvícením a Dolby Atmos. Přijďte si obraz porovnat vedle sebe v Čáslavi a Golčově Jeníkově.", en: "A new range from 43 to 65 inches with Mini LED backlighting and Dolby Atmos. Compare them side by side in Čáslav and Golčův Jeníkov." } },
    { tag: { cs: "Akce", en: "Offer" }, title: { cs: "Odvoz starého spotřebiče zdarma", en: "Free removal of your old appliance" }, text: { cs: "Ke každé pračce, chladničce a myčce dovezené naším autem odvezeme starý spotřebič k ekologické likvidaci bez příplatku.", en: "With every washer, fridge or dishwasher delivered by our van, we take your old appliance for recycling at no charge." } },
    { tag: { cs: "Zahrada", en: "Garden" }, title: { cs: "Zazimování sekaček a příprava fréz", en: "Winterising mowers and preparing snow throwers" }, text: { cs: "Objednejte se na podzimní servis. Výměna oleje, ostření nožů, konzervace a uskladnění na přání.", en: "Book an autumn service. Oil change, blade sharpening, preservation and storage on request." } },
  ],
  product: {
    addToCart: { cs: "Přidat do košíku", en: "Add to cart" },
    added: { cs: "Přidáno do košíku", en: "Added to cart" },
    prev: { cs: "Předchozí fotka", en: "Previous photo" },
    next: { cs: "Další fotka", en: "Next photo" },
    reserve: { cs: "Rezervovat na prodejně", en: "Reserve in store" },
    specs: { cs: "Technické údaje", en: "Specifications" },
    colors: { cs: "Barevné provedení", en: "Colour options" },
    included: { cs: "V ceně", en: "Included" },
    includedList: {
      cs: "Záruka 2 roky · Odborné poradenství · Recyklační poplatek · Zapojení a předvedení při odběru na prodejně",
      en: "2-year warranty · Expert advice · Recycling fee · Set-up and demonstration on store collection",
    },
    delivery: { cs: "Doručení", en: "Delivery" },
    deliveryText: { cs: "Zdarma od 2 000 Kč balíkem, nebo osobně na šesti prodejnách. Velké spotřebiče dovezeme a zapojíme vlastním autem.", en: "Free parcel delivery over 2 000 Kč, or collect at six stores. Large appliances are delivered and installed by our own van." },
    financing: { cs: "Splátky", en: "Instalments" },
    financingText: { cs: "Nákup na splátky Home Credit od 3 000 Kč, vyřízení online i na prodejně.", en: "Home Credit instalments from 3 000 Kč, arranged online or in store." },
    vat: { cs: "Cena včetně 21 % DPH", en: "Price including 21 % VAT" },
    related: { cs: "Podobné produkty", en: "Similar products" },
    back: { cs: "Zpět na", en: "Back to" },
  },
  cart: {
    title: { cs: "Košík", en: "Cart" },
    items: { cs: "položky", en: "items" },
    qty: { cs: "Množství", en: "Qty" },
    remove: { cs: "Odebrat", en: "Remove" },
    subtotal: { cs: "Mezisoučet", en: "Subtotal" },
    delivery: { cs: "Doprava", en: "Delivery" },
    pickup: { cs: "Osobní odběr na prodejně", en: "Store collection" },
    free: { cs: "Zdarma", en: "Free" },
    total: { cs: "Celkem", en: "Total" },
    vatIncl: { cs: "včetně DPH", en: "incl. VAT" },
    checkout: { cs: "Pokračovat k pokladně", en: "Continue to checkout" },
    continue: { cs: "Pokračovat v nákupu", en: "Continue shopping" },
    note: { cs: "Balíky posíláme po celé ČR, od 2 000 Kč zdarma. Velké spotřebiče a zahradní stroje dovezeme vlastním autem nebo si je vyzvednete na prodejně.", en: "Parcels ship across Czechia, free over 2 000 Kč. Large appliances and garden machines are delivered by our van or collected in store." },
    empty: { cs: "Košík je prázdný.", en: "Your cart is empty." },
    atCheckout: { cs: "podle volby v pokladně", en: "chosen at checkout" },
  },
  checkout: {
    title: { cs: "Pokladna", en: "Checkout" },
    contact: { cs: "Kontakt", en: "Contact" },
    delivery: { cs: "Doprava a odběr", en: "Delivery and collection" },
    payment: { cs: "Platba", en: "Payment" },
    name: { cs: "Jméno a příjmení", en: "Full name" },
    email: { cs: "E-mail", en: "Email" },
    phone: { cs: "Telefon", en: "Phone" },
    street: { cs: "Ulice a číslo", en: "Street and number" },
    city: { cs: "Město", en: "City" },
    zip: { cs: "PSČ", en: "Postcode" },
    payTransfer: { cs: "Bankovní převod", en: "Bank transfer" },
    payCard: { cs: "Platební karta", en: "Card" },
    payFin: { cs: "Nákup na splátky", en: "Instalments" },
    payCash: { cs: "Hotově při odběru", en: "Cash on collection" },
    place: { cs: "Odeslat objednávku", en: "Place order" },
    summary: { cs: "Souhrn objednávky", en: "Order summary" },
    terms: { cs: "Odesláním souhlasíte s obchodními podmínkami. Velké spotřebiče doručujeme vlastní dopravou nebo k odběru na prodejně.", en: "By ordering you accept the terms. Large appliances are delivered by our own van or collected in store." },
    bulkyHint: { cs: "Košík obsahuje velký spotřebič nebo zahradní stroj, proto nabízíme jen odběr na prodejně a vlastní dopravu.", en: "Your cart contains a large appliance or garden machine, so only store collection and our own delivery are offered." },
    notes: { cs: "Poznámka", en: "Notes" },
    code: { cs: "Slevový kód", en: "Discount code" },
    apply: { cs: "Použít", en: "Apply" },
    discount: { cs: "Sleva", en: "Discount" },
    badCode: { cs: "Kód není platný.", en: "That code is not valid." },
    choosePoint: { cs: "Vybrat výdejní místo", en: "Choose a pickup point" },
    pickPoint: { cs: "Vyberte prosím výdejní místo.", en: "Please choose a pickup point." },
    noWidget: { cs: "Výběr míst bude dostupný po nastavení Zásilkovny.", en: "Point selection becomes available once Packeta is configured." },
    demo: { cs: "Ukázková verze: objednávky se odesílají až po připojení databáze.", en: "Demo version: orders are sent once the database is connected." },
  },
  service: {
    title: { cs: "Servis a reklamace", en: "Service and claims" },
    lead: { cs: "Autorizovaný servis zahradní techniky VARI a AL-KO, opravy nářadí Einhell, Graphite a Makita. Reklamace spotřebičů všech značek vyřídíme za vás na kterékoli prodejně.", en: "Authorised service for VARI and AL-KO garden machinery, repairs of Einhell, Graphite and Makita tools. We handle appliance claims for every brand at any of our stores." },
    items: [
      { cs: "Záruční a pozáruční servis sekaček, kultivátorů a pil", en: "Warranty and post-warranty service for mowers, tillers and saws" },
      { cs: "Opravy elektrického a aku nářadí Einhell, Graphite a Makita", en: "Repairs of Einhell, Graphite and Makita power and cordless tools" },
      { cs: "Reklamace televizí a spotřebičů, svoz k výrobci", en: "TV and appliance claims, collection to the manufacturer" },
      { cs: "Nastavení počítačů, přenos dat a instalace Windows", en: "Computer set-up, data transfer and Windows installation" },
      { cs: "Dovoz, zapojení a odvoz starých spotřebičů", en: "Delivery, installation and removal of old appliances" },
      { cs: "Zpětný odběr elektrozařízení a baterií", en: "Take-back of electrical waste and batteries" },
    ] as Text[],
    cta: { cs: "Zavolat na zákaznickou linku", en: "Call the customer line" },
  },
  stores: {
    title: { cs: "Naše prodejny", en: "Our stores" },
    eyebrow: { cs: "Šest prodejen", en: "Six stores" },
    lead: { cs: "Kamenné prodejny na Vysočině a v Pardubickém kraji. V každé si zboží z e-shopu vyzvednete zdarma a poradí vám lidé, kteří zboží sami používají.", en: "Physical stores across Vysočina and the Pardubice region. Collect your online order free at any of them, from people who use the products themselves." },
    hours: { cs: "Otevírací doba", en: "Opening hours" },
    phone: { cs: "Telefon", en: "Phone" },
    range: { cs: "Sortiment", en: "Range" },
    pickup: { cs: "Výdej e-shopu zdarma", en: "Free online-order collection" },
    map: { cs: "Zobrazit na mapě", en: "Show on map" },
    main: { cs: "Hlavní prodejna a sklad", en: "Main store and warehouse" },
  },
  contact: {
    title: { cs: "Kontakt", en: "Contact" },
    eshop: { cs: "E-shop a zákaznická linka", en: "Online shop and customer line" },
    company: { cs: "Provozovatel", en: "Operator" },
    hours: { cs: "Zákaznická linka", en: "Customer line" },
    hoursValue: { cs: "Pondělí až pátek 7:30 – 15:00\nObjednávky přijímáme nonstop", en: "Monday to Friday 7:30 – 15:00\nOrders accepted around the clock" },
    phone: { cs: "Telefon", en: "Phone" },
    email: { cs: "E-mail", en: "Email" },
    storesTitle: { cs: "Prodejny", en: "Stores" },
    storesText: { cs: "Šest kamenných prodejen s výdejem objednávek zdarma. Otevírací doby a telefony najdete na stránce prodejen.", en: "Six physical stores with free order collection. Opening hours and phone numbers are on the stores page." },
    storesCta: { cs: "Všechny prodejny", en: "All stores" },
  },
  footer: {
    sales: { cs: "Sortiment", en: "Range" },
    company: { cs: "Firma", en: "Company" },
    help: { cs: "Pomoc", en: "Help" },
    about: { cs: "O nás", en: "About us" },
    terms: { cs: "Obchodní podmínky", en: "Terms" },
    privacy: { cs: "Ochrana údajů", en: "Privacy" },
    financing: { cs: "Nákup na splátky", en: "Instalments" },
    delivery: { cs: "Doprava a platba", en: "Delivery and payment" },
    warranty: { cs: "Reklamace", en: "Claims" },
    parts: { cs: "Náhradní díly", en: "Spare parts" },
    stores: { cs: "Prodejny", en: "Stores" },
    newsletter: { cs: "Akce e-mailem", en: "Offers by email" },
    newsletterHint: { cs: "Slevy, novinky a sezónní akce, zhruba dvakrát měsíčně.", en: "Discounts, new arrivals and seasonal offers, about twice a month." },
    subscribe: { cs: "Odebírat", en: "Subscribe" },
    rights: { cs: "Dvořák a synové, s.r.o. · IČO 17540780 · Nádraží 604, 582 82 Golčův Jeníkov", en: "Dvořák a synové, s.r.o. · Company ID 17540780 · Nádraží 604, 582 82 Golčův Jeníkov" },
  },
};

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "cs", setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("cs");
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("ed-lang");
      if (saved === "en" || saved === "cs") setLangState(saved);
    } catch {}
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = (l: Lang) => {
    setLangState(l);
    try { window.localStorage.setItem("ed-lang", l); } catch {}
  };
  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  const { lang, setLang } = useContext(LangCtx);
  const t = (x: Text) => x[lang];
  return { lang, setLang, t };
}
