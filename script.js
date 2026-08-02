/* ==========================================================================
   COMPANY NAME — script.js
   Vanilla JS: nav toggle, scroll reveal, FAQ accordion, ripple buttons,
   back-to-top, vCard download, contact form (placeholder handler).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     LANGUAGE SWITCHER (English / Hindi / Marathi)
     ========================================================================== */
  const LANG_KEY = 'lsi_lang';
  const i18nEls = Array.from(document.querySelectorAll('[data-i18n]'));
  const placeholderEls = Array.from(document.querySelectorAll('[data-i18n-placeholder]'));

  // Capture the page's original English content once, so switching back to
  // English always restores exactly what's authored in index.html.
  const englishDefaults = {
    i18n: new Map(i18nEls.map(el => [el, el.innerHTML])),
    placeholders: new Map(placeholderEls.map(el => [el, el.getAttribute('placeholder') || '']))
  };

  function getLangData(lang) {
    return (window.SITE_I18N && window.SITE_I18N[lang]) ? window.SITE_I18N[lang] : null;
  }

  function applyLanguage(lang) {
    const data = getLangData(lang);

    i18nEls.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translated = data && data.i18n[key];
      el.innerHTML = translated || englishDefaults.i18n.get(el);
    });

    placeholderEls.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const translated = data && data.placeholders[key];
      el.setAttribute('placeholder', translated || englishDefaults.placeholders.get(el));
    });

    document.documentElement.setAttribute('lang', lang);
    document.body.classList.toggle('lang-devanagari', lang === 'hi' || lang === 'mr');

    document.querySelectorAll('.lang-btn').forEach(btn => {
      const isActive = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    renderTestimonials(lang);
    renderFAQ(lang);

    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* storage unavailable */ }
    currentLang = lang;
  }

  let currentLang = 'en';

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      if (lang !== currentLang) applyLanguage(lang);
    });
  });

  /* ---------- Sticky header shadow + scroll progress bar ---------- */
  const header = document.getElementById('siteHeader');
  const scrollProgress = document.getElementById('scrollProgress');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 12);
    backToTop.classList.toggle('visible', window.scrollY > 500);

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = `${pct}%`;
  };

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });
  // Close mobile nav after clicking a link
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Scroll reveal (fade-in on scroll) with cascading stagger ---------- */
  // Grids where children should reveal in a staggered cascade rather than all at once
  const staggerGroups = [
    '.service-grid', '.team-grid', '.gallery-grid',
    '.case-list', '#testimonialRow', '.accordion', '.chip-row'
  ];
  staggerGroups.forEach(selector => {
    document.querySelectorAll(`${selector} > *`).forEach((child, i) => {
      child.style.setProperty('--delay', `${Math.min(i * 90, 450)}ms`);
    });
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.fade-in').forEach(item => revealObserver.observe(item));

  /* ---------- Button ripple effect ---------- */
  document.querySelectorAll('.ripple').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple-effect';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  /* ---------- Magnetic buttons (desktop only): buttons drift gently toward the cursor ---------- */
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.25}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Hero cursor spotlight ---------- */
  const heroSection = document.getElementById('heroSection');
  const heroSpotlight = document.getElementById('heroSpotlight');
  const heroOrbit = document.getElementById('heroOrbit');
  if (heroSection && window.matchMedia('(hover: hover)').matches) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * 100;
      const py = ((e.clientY - rect.top) / rect.height) * 100;
      heroSpotlight.style.setProperty('--sx', `${px}%`);
      heroSpotlight.style.setProperty('--sy', `${py}%`);
      // subtle parallax on the orbit rings/dots
      const dx = (px - 50) * 0.15;
      const dy = (py - 50) * 0.15;
      heroOrbit.style.transform = `translate(${dx}px, ${dy}px)`;
    });
  }

  /* ---------- Scrollspy: highlight the active nav link as sections pass ---------- */
  const navLinks = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
  const spySections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const link = navLinks.find(a => a.getAttribute('href') === `#${entry.target.id}`);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
  spySections.forEach(section => spyObserver.observe(section));

  /* ---------- Subtle card tilt on hover (desktop only) ---------- */
  const tiltEls = document.querySelectorAll('[data-tilt]');
  const supportsHover = window.matchMedia('(hover: hover)').matches;
  if (supportsHover) {
    tiltEls.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `perspective(800px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg) translateY(-4px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- WhatsApp button ---------- */
  const waButtons = document.querySelectorAll('[data-whatsapp]');
  waButtons.forEach(waBtn => {
    waBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const phone = '9920254354'; // Replace with real WhatsApp number, digits only, country code first
      const message = encodeURIComponent('Hi Vaibhav! I found the Lord Sai Investment & Share Market Academy website and would like to know more.');
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank', 'noopener');
    });
  });

  /* ---------- vCard download ---------- */
  const vcardBtn = document.getElementById('vcardBtn');
  if (vcardBtn) {
    vcardBtn.addEventListener('click', () => {
      const vcard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'N:Pawar;Vaibhav;;;',
        'FN:Vaibhav Pawar',
        'ORG:Lord Sai Investment & Share Market Academy',
        'TITLE:Founder | NJ Wealth Distribution Partner',
        'TEL;TYPE=WORK,VOICE:+91-12345-67890',
        'EMAIL:info@lordsaiacademy.com',
        'URL:https://www.lordsaiacademy.com',
        'END:VCARD'
      ].join('\n');
      const blob = new Blob([vcard], { type: 'text/vcard' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vaibhav-pawar-lord-sai-academy.vcf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }

  /* ---------- Testimonials: data-driven cards with avatar initials ---------- */
  const englishTestimonialData = [
    { name: 'Rohan Deshmukh', role: 'Salaried Employee, LSI Student', text: 'I never understood SIPs or mutual funds before. Vaibhav Sir\'s planning session finally made it simple and I started investing with a clear goal.' },
    { name: 'Sneha Kulkarni', role: 'College Student, LSI Student', text: 'The live market sessions cleared up so much confusion from random YouTube videos. I finally understand price action and risk management.' },
    { name: 'Amit Joshi', role: 'Business Owner', text: 'Vaibhav helped me diversify beyond my business — real financial planning, not just product selling. Transparent and practical advice.' },
    { name: 'Pooja Naik', role: 'LSI Student', text: 'Small batch sizes meant every doubt got solved. The mentorship continues even after the course ended.' },
    { name: 'Kiran Patil', role: 'NJ Wealth Client', text: 'Got proper term and health insurance guidance along with a goal-based investment plan. No pressure, just honest advice.' }
  ];
  const testimonialRow = document.getElementById('testimonialRow');

  function renderTestimonials(lang) {
    if (!testimonialRow) return;
    const data = getLangData(lang);
    const list = (data && data.testimonials) ? data.testimonials : englishTestimonialData;
    testimonialRow.innerHTML = '';
    list.forEach(t => {
      const initials = t.name.split(' ').map(w => w[0]).join('');
      const card = document.createElement('div');
      card.className = 'testimonial-card fade-in';
      card.innerHTML = `
        <div class="stars" aria-label="5 out of 5 stars">★★★★★</div>
        <p>"${t.text}"</p>
        <div class="client-row">
          <span class="client-avatar" aria-hidden="true">${initials}</span>
          <span>
            <span class="client-name">${t.name}</span>
            <span class="client-role">${t.role}</span>
          </span>
        </div>
      `;
      testimonialRow.appendChild(card);
      revealObserver.observe(card);
    });
    // Re-apply stagger delays now that cards exist
    Array.from(testimonialRow.children).forEach((child, i) => {
      child.style.setProperty('--delay', `${Math.min(i * 90, 450)}ms`);
    });
  }

  /* ---------- Hero entrance: staggered reveal on page load (not just on scroll) ---------- */
  document.querySelectorAll('.hero .fade-in').forEach((el, i) => {
    el.style.setProperty('--delay', `${i * 120}ms`);
  });

  /* ---------- FAQ data + accordion build ---------- */
  const englishFaqData = [
    { q: 'Who can join the academy?', a: 'Anyone interested in learning about the stock market or financial planning — students, salaried professionals, business owners and homemakers are all welcome.' },
    { q: 'Do I need prior experience to join?', a: 'No. Courses start from the basics and build up to advanced strategies, so complete beginners are welcome.' },
    { q: 'What is the course duration?', a: 'Course duration varies by batch and level (basic, intermediate, advanced). Ask during your free counselling session for the current schedule.' },
    { q: 'Are weekend batches available?', a: 'Yes, weekend batches are available for working professionals and students who cannot attend weekday sessions.' },
    { q: 'What are the course fees?', a: 'Fees are kept affordable and vary by course level. Contact us for the current fee structure and any ongoing offers.' },
    { q: 'Will I get a certificate?', a: 'Yes, students receive a certificate of completion after finishing the course.' },
    { q: 'Do you provide live market exposure?', a: 'Yes. Live market sessions and practical trading exercises are a core part of the curriculum, not just theory.' },
    { q: 'Are classes online or offline?', a: 'Both options are available depending on the batch — check with us for the current mode of the next batch.' },
    { q: 'Is there support after the course ends?', a: 'Yes. Students continue to get mentorship, doubt-solving and community support even after course completion.' },
    { q: 'What is the difference between investing and trading?', a: 'Investing is a long-term, goal-based approach to building wealth, while trading is shorter-term buying and selling based on market movements. Both are covered at LSI, with an emphasis on discipline and risk management.' },
    { q: 'Do you offer financial planning services too?', a: 'Yes. As an NJ Wealth Distribution Partner, Vaibhav offers financial planning, mutual funds, insurance and retirement planning services alongside the academy\'s courses.' },
    { q: 'How do I get in touch or enrol?', a: 'Use the contact form, WhatsApp button, or call directly to book a free counselling session and get started.' }
  ];

  const accordion = document.getElementById('accordion');

  function renderFAQ(lang) {
    if (!accordion) return;
    const data = getLangData(lang);
    const list = (data && data.faq) ? data.faq : englishFaqData;
    accordion.innerHTML = '';
    list.forEach((item, i) => {
      const el = document.createElement('div');
      el.className = 'accordion-item fade-in';
      el.innerHTML = `
        <button class="accordion-question" aria-expanded="false">
          <span>${item.q}</span>
          <span class="accordion-icon" aria-hidden="true"></span>
        </button>
        <div class="accordion-answer">
          <p>${item.a}</p>
        </div>
      `;
      el.style.setProperty('--delay', `${Math.min(i * 70, 420)}ms`);
      accordion.appendChild(el);
      revealObserver.observe(el);
    });
  }

  accordion.addEventListener('click', (e) => {
    const question = e.target.closest('.accordion-question');
    if (!question) return;
    const item = question.closest('.accordion-item');
    const answer = item.querySelector('.accordion-answer');
    const isOpen = item.classList.contains('open');

    // Close all other open items for a clean single-open accordion
    accordion.querySelectorAll('.accordion-item.open').forEach(openItem => {
      if (openItem !== item) {
        openItem.classList.remove('open');
        openItem.querySelector('.accordion-question').setAttribute('aria-expanded', 'false');
        openItem.querySelector('.accordion-answer').style.maxHeight = null;
      }
    });

    if (isOpen) {
      item.classList.remove('open');
      question.setAttribute('aria-expanded', 'false');
      answer.style.maxHeight = null;
    } else {
      item.classList.add('open');
      question.setAttribute('aria-expanded', 'true');
      answer.style.maxHeight = `${answer.scrollHeight}px`;
    }
  });

  /* ---------- Back to top ---------- */
  const backToTop = document.getElementById('backToTop');
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  window.addEventListener('scroll', onScroll);
  onScroll();

  /* ---------- Contact form (placeholder handler — wire up to your backend) ---------- */
  const contactForm = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = getLangData(currentLang);
      formNote.textContent = (data && data.formNote) || 'Thanks! This form is a placeholder — connect it to your email service or backend to receive messages.';
      contactForm.reset();
    });
  }

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Initialize language (saved preference, else English) ---------- */
  let savedLang = 'en';
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === 'en' || stored === 'hi' || stored === 'mr') savedLang = stored;
  } catch (e) { /* storage unavailable */ }
  applyLanguage(savedLang);

});
