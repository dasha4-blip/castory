/* CASTORY — interactions. No dependencies. */
(() => {
  'use strict';

  const TG_USERNAME = 'official_castory';
  const TG_URL = `https://t.me/${TG_USERNAME}`;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- header state ---------- */
  const header = $('#header');
  const onScrollHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- mobile menu ---------- */
  const burger = $('.burger');
  const mnav = $('#mnav');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    $('use', burger).setAttribute('href', open ? '#i-x' : '#i-menu');
    mnav.hidden = !open;
    mnav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  mnav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !mnav.hidden) { setMenu(false); burger.focus(); } });
  window.addEventListener('resize', () => { if (window.innerWidth >= 1040 && !mnav.hidden) setMenu(false); });

  /* ---------- reveal on scroll ---------- */
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- active nav link ---------- */
  const navLinks = $$('.nav a');
  if (navLinks.length && 'IntersectionObserver' in window) {
    const map = new Map(navLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const link = map.get(en.target.id);
        if (link && en.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove('is-active'));
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- hero live timer ---------- */
  const timer = $('[data-timer]');
  if (timer && !reduceMotion) {
    let t = 42 * 60 + 17;
    const pad = (n) => String(n).padStart(2, '0');
    setInterval(() => {
      t += 1;
      timer.textContent = `${pad(Math.floor(t / 3600))}:${pad(Math.floor(t / 60) % 60)}:${pad(t % 60)}`;
    }, 1000);
  }

  /* ---------- myths: flip cards ---------- */
  $$('.myth').forEach((card) => {
    card.addEventListener('click', () => {
      card.setAttribute('aria-pressed', String(card.getAttribute('aria-pressed') !== 'true'));
    });
  });

  /* ---------- process: progress line ---------- */
  const steps = $('[data-progress]');
  if (steps) {
    const items = $$('.step', steps);
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      const line = vh * 0.62;
      const r = steps.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (line - r.top - 30) / (r.height - 60)));
      steps.style.setProperty('--p', p.toFixed(4));
      items.forEach((it) => {
        const ir = it.getBoundingClientRect();
        it.classList.toggle('is-lit', ir.top + 40 < line);
      });
    };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    update();
  }

  /* ---------- themes rail ---------- */
  const rail = $('[data-rail]');
  if (rail) {
    const prev = $('[data-scroll="-1"]');
    const next = $('[data-scroll="1"]');
    const step = () => {
      const card = $('.theme', rail);
      return card ? card.getBoundingClientRect().width + 14 : 300;
    };
    const sync = () => {
      const max = rail.scrollWidth - rail.clientWidth - 2;
      if (prev) prev.disabled = rail.scrollLeft <= 2;
      if (next) next.disabled = rail.scrollLeft >= max;
    };
    [prev, next].forEach((b) => b && b.addEventListener('click', () => {
      rail.scrollBy({ left: Number(b.dataset.scroll) * step() * (window.innerWidth > 960 ? 2 : 1), behavior: reduceMotion ? 'auto' : 'smooth' });
    }));
    rail.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();

    // drag to scroll with a mouse
    let down = false, startX = 0, startLeft = 0, moved = false;
    rail.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startLeft = rail.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) { moved = true; rail.classList.add('is-dragging'); }
      if (moved) rail.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      if (moved) {
        rail.classList.remove('is-dragging');
        // let snap settle on the nearest card
        const w = step();
        rail.scrollTo({ left: Math.round(rail.scrollLeft / w) * w, behavior: 'smooth' });
      }
    });
    rail.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); rail.scrollBy({ left: step(), behavior: 'smooth' }); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); rail.scrollBy({ left: -step(), behavior: 'smooth' }); }
    });
  }

  /* ---------- FAQ: smooth accordion ---------- */
  $$('[data-faq] details').forEach((d) => {
    const summary = $('summary', d);
    const body = $('.faq__a', d);
    let anim = null;
    summary.addEventListener('click', (e) => {
      if (reduceMotion || !body.animate) return;
      e.preventDefault();
      if (anim) anim.cancel();
      if (!d.open) {
        d.open = true;
        const h = body.scrollHeight;
        anim = body.animate([{ height: '0px', opacity: 0 }, { height: `${h}px`, opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.75,.2,1)' });
        anim.onfinish = () => { anim = null; };
      } else {
        const h = body.scrollHeight;
        anim = body.animate([{ height: `${h}px`, opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 300, easing: 'cubic-bezier(.4,0,.2,1)' });
        anim.onfinish = () => { d.open = false; anim = null; };
      }
    });
  });

  /* ---------- mobile sticky CTA ---------- */
  const mcta = $('.mcta');
  const hero = $('.hero');
  const apply = $('#apply');
  if (mcta && 'IntersectionObserver' in window) {
    let pastHero = false, nearApply = false;
    const set = () => {
      const show = pastHero && !nearApply;
      mcta.classList.toggle('is-shown', show);
      mcta.setAttribute('aria-hidden', String(!show));
      mcta.tabIndex = show ? 0 : -1;
    };
    new IntersectionObserver(([en]) => { pastHero = !en.isIntersecting; set(); }).observe(hero);
    new IntersectionObserver((entries) => { nearApply = entries.some((en) => en.isIntersecting); set(); }, { rootMargin: '0px 0px -10% 0px' })
      .observe(apply);
  }

  /* ---------- carry ?ref= / utm_source to the Telegram message ---------- */
  const params = new URLSearchParams(location.search);
  const refCode = (params.get('ref') || params.get('utm_source') || '').replace(/[^\w.-]/g, '').slice(0, 40);

  /* ---------- mini-application → Telegram ---------- */
  const form = $('#leadForm');
  const sent = $('#leadSent');
  if (form && sent) {
    const about = form.elements.about;
    const counter = $('[data-count]', form);
    const updateCount = () => { counter.textContent = `${about.value.length} / ${about.maxLength}`; };
    about.addEventListener('input', updateCount);
    updateCount();

    const rules = {
      name: (v) => {
        if (!v) return 'Напиши, как тебя зовут';
        if (v.length < 2) return 'Слишком короткое имя';
        if (!/^[\p{L}][\p{L}\s'’.-]*$/u.test(v)) return 'Только буквы, без цифр и символов';
        return '';
      },
      age: (v) => {
        if (!v) return 'Укажи возраст';
        if (!/^\d{1,2}$/.test(v)) return 'Возраст — число, например 21';
        const n = Number(v);
        if (n < 18) return 'Мы рассматриваем кандидаток от 18 лет';
        if (n > 99) return 'Проверь возраст';
        return '';
      },
      country: (v) => {
        if (!v) return 'Укажи страну проживания';
        if (v.length < 2 || !/^[\p{L}][\p{L}\s().,'’-]*$/u.test(v)) return 'Название страны — буквами';
        return '';
      },
    };

    const setError = (input, msg) => {
      const field = input.closest('.field');
      field.classList.toggle('is-error', !!msg);
      $('.field__err', field).textContent = msg;
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    };
    const check = (name) => {
      const input = form.elements[name];
      const msg = rules[name](input.value.trim().replace(/\s+/g, ' '));
      setError(input, msg);
      return !msg;
    };
    Object.keys(rules).forEach((name) => {
      const input = form.elements[name];
      input.addEventListener('blur', () => { if (input.value) check(name); });
      input.addEventListener('input', () => { if (input.closest('.field').classList.contains('is-error')) check(name); });
    });

    let lastText = '';
    const buildText = () => {
      const val = (n) => form.elements[n].value.trim().replace(/\s+/g, ' ');
      const lines = [
        'Привет! Хочу узнать о работе в CASTORY.',
        '',
        `Имя: ${val('name')}`,
        `Возраст: ${val('age')}`,
        `Страна: ${val('country')}`,
        `Формат: ${form.elements.format.value}`,
      ];
      const a = about.value.trim();
      if (a) lines.push(`О себе: ${a}`);
      if (refCode) lines.push(`Код приглашения: ${refCode}`);
      return lines.join('\n');
    };
    const tgLink = (text) => `${TG_URL}?text=${encodeURIComponent(text)}`;

    const copy = async (text) => {
      try { await navigator.clipboard.writeText(text); return true; } catch (_) { /* fall through */ }
      try {
        const ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        return ok;
      } catch (_) { return false; }
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = Object.keys(rules).map(check).every(Boolean);
      if (!ok) {
        const firstBad = $('.field.is-error input, .field.is-error textarea', form);
        if (firstBad) firstBad.focus();
        return;
      }
      lastText = buildText();
      const link = tgLink(lastText);
      $('[data-sent-open]', sent).href = link;
      window.open(link, '_blank', 'noopener');
      copy(lastText);
      form.hidden = true;
      sent.hidden = false;
      sent.focus({ preventScroll: true });
      sent.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    $('[data-sent-copy]', sent).addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      const label = $('span', btn);
      const ok = await copy(lastText);
      label.textContent = ok ? 'Скопировано' : 'Не удалось скопировать';
      setTimeout(() => { label.textContent = 'Скопировать текст'; }, 2200);
    });
    $('[data-sent-back]', sent).addEventListener('click', () => {
      sent.hidden = true;
      form.hidden = false;
      form.elements.name.focus();
    });
  }
})();
