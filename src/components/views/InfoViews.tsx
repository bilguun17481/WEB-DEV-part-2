"use client";
import Link from "next/link";
import { Photo } from "@/components/Photo";
import { company, stores } from "@/data/stores";
import { dict, useLang } from "@/lib/i18n";
import { useSettings } from "@/lib/settings";

const tel = (s: string) => `tel:${s.replace(/\s+/g, "")}`;

export function ServiceView() {
  const { t } = useLang();
  const { store } = useSettings();
  const s = dict.service;
  const phone = store?.phone ?? company.phone;
  return (
    <>
      <section className="relative text-paper">
        <Photo label={t(s.title)} tone="dark" ratio="aspect-[4/3] sm:aspect-[16/6]" hint={t(dict.nav.servis)} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="container-x absolute inset-x-0 bottom-0 pb-8 sm:pb-12">
          <div className="eyebrow !text-neutral-300">{t(dict.nav.servis)}</div>
          <h1 className="mt-2 text-[40px] font-bold leading-none tracking-[-0.02em] sm:text-[56px]">{t(s.title)}</h1>
          <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-neutral-200">{t(s.lead)}</p>
        </div>
      </section>
      <section className="container-x py-16">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {s.items.map((it, i) => (
            <li key={i} className="bg-tile p-6">
              <div className="text-[18px] font-semibold leading-snug">{t(it)}</div>
            </li>
          ))}
        </ul>
        <a href={tel(phone)} className="btn-ink mt-10">{t(s.cta)} · {phone}</a>
      </section>
    </>
  );
}

export function StoresView() {
  const { t } = useLang();
  const s = dict.stores;
  return (
    <>
      <section className="relative text-paper">
        <Photo label={t(s.title)} tone="dark" ratio="aspect-[4/3] sm:aspect-[16/6]" hint={t(s.eyebrow)} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="container-x absolute inset-x-0 bottom-0 pb-8 sm:pb-12">
          <div className="eyebrow !text-neutral-300">{t(s.eyebrow)}</div>
          <h1 className="mt-2 text-[40px] font-bold leading-none tracking-[-0.02em] sm:text-[56px]">{t(s.title)}</h1>
          <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-neutral-200">{t(s.lead)}</p>
        </div>
      </section>
      <section className="container-x py-16">
        <ul className="grid gap-x-5 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((st) => (
            <li key={st.id} className="flex flex-col">
              <Photo label={st.name} ratio="aspect-[3/2]" hint={st.city} />
              <div className="eyebrow mt-4">{st.main ? t(s.main) : t(s.pickup)}</div>
              <h2 className="mt-2 text-[22px] font-semibold leading-tight">{st.city}</h2>
              <p className="mt-1 text-[13px] text-mute">{st.name}</p>
              <dl className="mt-4 grid grid-cols-[112px_1fr] gap-y-2 border-t hairline pt-4 text-[13px]">
                <dt className="font-semibold">{t(dict.contact.title)}</dt>
                <dd>{st.street}<br />{st.zip} {st.city}</dd>
                <dt className="font-semibold">{t(s.hours)}</dt>
                <dd>{t(st.hours)}</dd>
                <dt className="font-semibold">{t(s.phone)}</dt>
                <dd>{st.phones.map((p, i) => <span key={p}>{i > 0 && <br />}<a className="hover:underline" href={tel(p)}>{p}</a></span>)}</dd>
                <dt className="font-semibold">{t(dict.contact.email)}</dt>
                <dd><a className="hover:underline" href={`mailto:${st.email}`}>{st.email}</a></dd>
                <dt className="font-semibold">{t(s.range)}</dt>
                <dd className="text-mute">{t(st.range)}</dd>
              </dl>
              <a href={`https://mapy.cz/?q=${encodeURIComponent(`${st.street}, ${st.city}`)}`} target="_blank" rel="noreferrer" className="btn-link mt-4">{t(s.map)} <span aria-hidden>→</span></a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export function ContactView() {
  const { t } = useLang();
  const { store } = useSettings();
  const c = dict.contact;
  const phone = store?.phone ?? company.phone;
  const email = store?.email ?? company.email;
  return (
    <section className="container-x py-14">
      <div className="eyebrow">{company.name}</div>
      <h1 className="mt-2 text-[40px] font-bold leading-none tracking-[-0.02em] sm:text-[56px]">{t(c.title)}</h1>
      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <Photo label={t(c.eshop)} ratio="aspect-[4/3]" hint={t(c.eshop)} />
        <div className="grid gap-px bg-hair sm:grid-cols-2">
          <Cell label={t(c.eshop)}>{store?.name ?? company.name}<br />{store?.address ?? company.address}</Cell>
          <Cell label={t(c.hours)}>{t(c.hoursValue).split("\n").map((l, i) => <span key={i}>{l}<br /></span>)}</Cell>
          <Cell label={t(c.phone)}><a className="hover:underline" href={tel(phone)}>{phone}</a></Cell>
          <Cell label={t(c.email)}><a className="hover:underline" href={`mailto:${email}`}>{email}</a></Cell>
          <Cell label={t(c.company)}>
            {store?.legal ?? company.legal}<br />{company.seat}<br />IČO {store?.ico || company.ico} · DIČ {store?.dic || company.dic}
          </Cell>
          <div className="bg-paper p-6">
            <div className="eyebrow">{t(c.storesTitle)}</div>
            <p className="mt-3 text-[14px] leading-relaxed text-mute">{t(c.storesText)}</p>
            <Link href="/prodejny/" className="btn-link mt-3">{t(c.storesCta)} <span aria-hidden>→</span></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-paper p-6">
      <div className="eyebrow">{label}</div>
      <div className="mt-3 text-[14px] leading-relaxed">{children}</div>
    </div>
  );
}
