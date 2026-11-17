(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ====== PENGATURAN: ganti nomor WhatsApp sekolah (format 62...) ====== */
  var WA_SEKOLAH = '6281200000000';

  /* Menu mobile */
  var burger = $('.burger'), menu = $('#menu');
  burger.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('#menu a').forEach(function (a) {
    a.addEventListener('click', function () { menu.classList.remove('open'); burger.setAttribute('aria-expanded', false); });
  });

  /* Tahun footer */
  $('#year').textContent = new Date().getFullYear();

  /* Tombol kembali ke atas */
  var totop = $('.totop');
  window.addEventListener('scroll', function () { totop.classList.toggle('show', window.scrollY > 600); }, { passive: true });

  /* Hitung angka statistik */
  function countUp(el) {
    var target = +el.dataset.count, start = performance.now(), dur = 1400;
    (function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }
  var statObs = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); statObs.unobserve(e.target); } });
  }, { threshold: .6 });
  $$('[data-count]').forEach(function (el) { statObs.observe(el); });

  /* Muncul halus saat di-scroll */
  var revObs = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); } });
  }, { threshold: .12 });
  $$('.card, .news, .teacher, .fac').forEach(function (el) { el.classList.add('reveal'); revObs.observe(el); });

  /* Foto yang belum ada: sembunyikan <img>, emoji pengganti tetap tampil */
  $$('#gallery img').forEach(function (img) {
    img.addEventListener('error', function () { img.style.display = 'none'; });
  });

  /* Filter galeri */
  $$('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      $$('.chip').forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      var f = chip.dataset.filter;
      $$('#gallery figure').forEach(function (fig) {
        fig.classList.toggle('hide', f !== 'all' && fig.dataset.cat !== f);
      });
    });
  });

  /* Lightbox */
  var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), idx = 0;
  function visible() { return $$('#gallery figure').filter(function (f) { return !f.classList.contains('hide'); }); }
  function show(i) {
    var list = visible(); if (!list.length) return;
    idx = (i + list.length) % list.length;
    var fig = list[idx], img = $('img', fig);
    lbCap.textContent = $('figcaption', fig).textContent;
    if (img && img.style.display !== 'none' && img.complete && img.naturalWidth) {
      lbImg.textContent = ''; lbImg.style.backgroundImage = 'url("' + img.src + '")';
    } else {
      lbImg.style.backgroundImage = 'none';
      lbImg.style.background = getComputedStyle(fig).backgroundColor;
      lbImg.textContent = $('i', fig).textContent;
    }
    lb.hidden = false; document.body.style.overflow = 'hidden';
  }
  function close() { lb.hidden = true; document.body.style.overflow = ''; }
  $$('#gallery figure').forEach(function (fig) {
    fig.tabIndex = 0;
    fig.addEventListener('click', function () { show(visible().indexOf(fig)); });
    fig.addEventListener('keydown', function (e) { if (e.key === 'Enter') show(visible().indexOf(fig)); });
  });
  $('.lb-close').addEventListener('click', close);
  $('.prev').addEventListener('click', function () { show(idx - 1); });
  $('.next').addEventListener('click', function () { show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  /* Formulir pendaftaran → WhatsApp */
  var form = $('#ppdbForm'), note = $('#formNote');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    $$('input', form).forEach(function (i) {
      var bad = !i.value.trim() || (i.name === 'wa' && !/^[0-9+\-\s]{9,}$/.test(i.value));
      i.classList.toggle('err', bad); if (bad) ok = false;
    });
    if (!ok) { note.style.color = '#d4574a'; note.textContent = 'Mohon lengkapi semua kolom dengan benar.'; return; }
    var d = new FormData(form);
    var teks = 'Assalamu’alaikum, saya ingin mendaftarkan anak ke SDIT Daarul Mughni.\n' +
      'Nama calon siswa: ' + d.get('anak') + '\nNama orang tua: ' + d.get('ortu') + '\nNo. WhatsApp: ' + d.get('wa');
    note.style.color = ''; note.textContent = 'Membuka WhatsApp…';
    window.open('https://wa.me/' + WA_SEKOLAH + '?text=' + encodeURIComponent(teks), '_blank', 'noopener');
    form.reset();
  });
})();
