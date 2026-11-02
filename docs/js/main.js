(function () {
  'use strict';

  var EN = document.documentElement.lang === 'en';
  var t = function (es, en) { return EN ? en : es; };

  // ---------- Cuenta regresiva (4 de noviembre de 2026, 6 p. m., hora de Lima) ----------
  var cd = document.getElementById('cuenta-regresiva');
  if (cd) {
    var objetivo = new Date('2026-11-04T18:00:00-05:00');
    var celdas = {};
    Array.prototype.forEach.call(cd.querySelectorAll('[data-cd]'), function (el) { celdas[el.getAttribute('data-cd')] = el; });
    var dos = function (n) { return (n < 10 ? '0' : '') + n; };
    var ultimoMin = -1;
    var timer = null;
    var tick = function () {
      var ms = objetivo - new Date();
      if (ms <= 0) {
        cd.innerHTML = '<p class="cd-title">' + t('El conversatorio ya se realizó.', 'The event has already taken place.') + '</p>';
        if (timer) clearInterval(timer);
        return;
      }
      var s = Math.floor(ms / 1000);
      var d = Math.floor(s / 86400);
      var h = Math.floor((s % 86400) / 3600);
      var m = Math.floor((s % 3600) / 60);
      var seg = s % 60;
      celdas.d.textContent = d;
      celdas.h.textContent = dos(h);
      celdas.m.textContent = dos(m);
      celdas.s.textContent = dos(seg);
      if (m !== ultimoMin && celdas.sr) {
        ultimoMin = m;
        celdas.sr.textContent = t('Faltan ' + d + ' días, ' + h + ' horas y ' + m + ' minutos.', d + ' days, ' + h + ' hours and ' + m + ' minutes remaining.');
      }
    };
    tick();
    timer = setInterval(tick, 1000);
  }

  // ---------- Pestañas accesibles: [data-tabs] ----------
  Array.prototype.forEach.call(document.querySelectorAll('[data-tabs]'), function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;
    var paneles = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
    var vivo = root.querySelector('[data-live]');
    var actual = 0;
    var seleccionar = function (i, enfocar, anunciar) {
      actual = (i + tabs.length) % tabs.length;
      tabs.forEach(function (t, j) {
        var on = j === actual;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        if (paneles[j]) paneles[j].hidden = !on;
      });
      if (enfocar) tabs[actual].focus();
      if (anunciar && vivo) {
        var t = paneles[actual] && paneles[actual].querySelector('[data-live-text]');
        vivo.textContent = t ? t.textContent : tabs[actual].textContent.trim();
      }
      var ant = root.querySelector('[data-prev]');
      var sig = root.querySelector('[data-next]');
      if (ant) ant.disabled = actual === 0;
      if (sig) sig.disabled = actual === tabs.length - 1;
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { seleccionar(i, false, true); });
      t.addEventListener('keydown', function (e) {
        var k = e.key;
        if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); seleccionar(Math.min(i + 1, tabs.length - 1), true, true); }
        else if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); seleccionar(Math.max(i - 1, 0), true, true); }
        else if (k === 'Home') { e.preventDefault(); seleccionar(0, true, true); }
        else if (k === 'End') { e.preventDefault(); seleccionar(tabs.length - 1, true, true); }
      });
    });
    var botAnt = root.querySelector('[data-prev]');
    var botSig = root.querySelector('[data-next]');
    if (botAnt) botAnt.addEventListener('click', function () { seleccionar(Math.max(actual - 1, 0), false, true); });
    if (botSig) botSig.addEventListener('click', function () { seleccionar(Math.min(actual + 1, tabs.length - 1), false, true); });
    var inicial = root.getAttribute('data-start');
    seleccionar(inicial ? parseInt(inicial, 10) : 0, false, false);
  });

  // ---------- Ideas clave que resaltan frases de la misión y la visión ----------
  Array.prototype.forEach.call(document.querySelectorAll('[data-keys]'), function (panel) {
    var teclas = Array.prototype.slice.call(panel.querySelectorAll('.key'));
    var frases = Array.prototype.slice.call(panel.querySelectorAll('mark.kw'));
    var fijada = null;
    var vista = null;
    var pintar = function () {
      var k = vista || fijada;
      frases.forEach(function (f) { f.classList.toggle('on', !!k && f.getAttribute('data-kw') === k); });
      teclas.forEach(function (t) {
        var id = t.getAttribute('data-kw');
        t.setAttribute('aria-pressed', fijada === id ? 'true' : 'false');
        t.classList.toggle('peek', vista === id && fijada !== id);
      });
    };
    teclas.forEach(function (t) {
      var id = t.getAttribute('data-kw');
      t.addEventListener('click', function () { fijada = (fijada === id) ? null : id; pintar(); });
      t.addEventListener('mouseenter', function () { vista = id; pintar(); });
      t.addEventListener('mouseleave', function () { vista = null; pintar(); });
      t.addEventListener('focus', function () { vista = id; pintar(); });
      t.addEventListener('blur', function () { vista = null; pintar(); });
    });
    frases.forEach(function (f) {
      f.addEventListener('click', function () {
        var id = f.getAttribute('data-kw');
        fijada = (fijada === id) ? null : id;
        pintar();
      });
    });
  });

  // ---------- Ampliar fotos (ventana nativa <dialog>) ----------
  var fotos = Array.prototype.slice.call(document.querySelectorAll('.fig img'));
  if (fotos.length && typeof HTMLDialogElement === 'function') {
    var dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.setAttribute('aria-label', t('Foto ampliada', 'Enlarged photo'));
    dlg.innerHTML = '<figure class="lb-fig"><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="btn small lb-close">' + t('Cerrar', 'Close') + '</button>';
    document.body.appendChild(dlg);
    var lbImg = dlg.querySelector('img');
    var lbCap = dlg.querySelector('figcaption');
    var cerrar = dlg.querySelector('.lb-close');
    cerrar.addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    fotos.forEach(function (img) {
      var boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'fig-btn';
      var fig = img.closest('figure');
      var cap = fig && fig.querySelector('figcaption');
      boton.setAttribute('aria-label', t('Ampliar foto', 'Enlarge photo') + (cap ? ': ' + cap.textContent.trim() : ''));
      img.parentNode.insertBefore(boton, img);
      boton.appendChild(img);
      boton.addEventListener('click', function () {
        lbImg.src = img.currentSrc || img.src;
        lbImg.alt = img.alt;
        lbCap.textContent = cap ? cap.textContent : '';
        dlg.showModal();
        cerrar.focus();
      });
    });
  }

  // ---------- Barra de años de Historia: marca el año que se está leyendo ----------
  var barra = document.querySelector('.yearbar');
  if (barra && 'IntersectionObserver' in window) {
    var enlaces = Array.prototype.slice.call(barra.querySelectorAll('a'));
    var porId = {};
    enlaces.forEach(function (a) { porId[a.getAttribute('href').slice(1)] = a; });
    var marcar = function (id) {
      enlaces.forEach(function (a) { a.removeAttribute('aria-current'); });
      if (porId[id]) {
        porId[id].setAttribute('aria-current', 'true');
        var r = porId[id].getBoundingClientRect();
        var b = barra.getBoundingClientRect();
        if (r.left < b.left || r.right > b.right) {
          barra.scrollLeft += (r.left - b.left) - (b.width / 2) + (r.width / 2);
        }
      }
    };
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) { if (en.isIntersecting) marcar(en.target.id); });
    }, { rootMargin: '-30% 0px -60% 0px' });
    Object.keys(porId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  // ---------- Buscador, filtros y mapa de regiones (página de miembros) ----------
  var filtro = document.getElementById('filtro');
  var lista = document.getElementById('lista-miembros');
  var estado = document.getElementById('filtro-estado');
  if (filtro && lista) {
    var items = Array.prototype.slice.call(lista.querySelectorAll('li'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('.chip[data-tipo]'));
    var quitarReg = document.getElementById('quitar-region');
    var pines = Array.prototype.slice.call(document.querySelectorAll('.pin'));
    var regiones = Array.prototype.slice.call(document.querySelectorAll('.region'));
    var botonesReg = Array.prototype.slice.call(document.querySelectorAll('.region-btn'));
    var nombresReg = { tumbes: 'Tumbes', piura: 'Piura', lima: 'Lima', arequipa: 'Arequipa' };
    var tipo = 'todas';
    var region = '';
    var reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var quitar = function (txt) {
      return txt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };
    var aplicar = function () {
      var q = quitar(filtro.value.trim());
      var visibles = 0;
      items.forEach(function (li) {
        var okTexto = !q || quitar(li.textContent).indexOf(q) !== -1;
        var okTipo = tipo === 'todas' || li.getAttribute('data-tipo') === tipo;
        var okReg = !region || li.getAttribute('data-region') === region;
        var ok = okTexto && okTipo && okReg;
        li.hidden = !ok;
        if (ok) visibles++;
      });
      botonesReg.forEach(function (bt) { bt.setAttribute('aria-pressed', bt.getAttribute('data-region') === region ? 'true' : 'false'); });
      regiones.forEach(function (r) { r.classList.toggle('on', r.getAttribute('data-region') === region); });
      pines.forEach(function (p) { p.classList.toggle('on', p.getAttribute('data-region') === region); });
      if (quitarReg) quitarReg.hidden = !region;
      if (estado) {
        if (!q && tipo === 'todas' && !region) {
          estado.textContent = '';
        } else if (visibles === 0) {
          estado.textContent = t('No hay instituciones con ese criterio.', 'No institutions match that search.');
        } else {
          var cuenta = EN
            ? visibles + (visibles === 1 ? ' institution found.' : ' institutions found.')
            : visibles + (visibles === 1 ? ' institución encontrada.' : ' instituciones encontradas.');
          estado.textContent = (region ? t('Región: ', 'Region: ') + nombresReg[region] + '. ' : '') + cuenta;
        }
      }
    };
    var elegirRegion = function (r, ir) {
      region = (region === r) ? '' : r;
      aplicar();
      if (region && ir) {
        var destino = document.getElementById('t-partes');
        if (destino) destino.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'start' });
      }
    };
    var resaltar = function (r, on) {
      pines.concat(regiones).forEach(function (el) {
        if (el.getAttribute('data-region') === r) el.classList.toggle('hl', on);
      });
    };
    filtro.addEventListener('input', aplicar);
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        tipo = c.getAttribute('data-tipo');
        chips.forEach(function (o) { o.setAttribute('aria-pressed', o === c ? 'true' : 'false'); });
        aplicar();
      });
    });
    if (quitarReg) quitarReg.addEventListener('click', function () { region = ''; aplicar(); });
    pines.forEach(function (p) {
      var r = p.getAttribute('data-region');
      p.addEventListener('click', function () { elegirRegion(r, true); });
      p.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegirRegion(r, true); }
      });
      p.addEventListener('mouseenter', function () { resaltar(r, true); });
      p.addEventListener('mouseleave', function () { resaltar(r, false); });
      p.addEventListener('focus', function () { resaltar(r, true); });
      p.addEventListener('blur', function () { resaltar(r, false); });
    });
    botonesReg.forEach(function (bt) {
      var r = bt.getAttribute('data-region');
      bt.addEventListener('click', function () { elegirRegion(r, true); });
      bt.addEventListener('mouseenter', function () { resaltar(r, true); });
      bt.addEventListener('mouseleave', function () { resaltar(r, false); });
      bt.addEventListener('focus', function () { resaltar(r, true); });
      bt.addEventListener('blur', function () { resaltar(r, false); });
    });
  }

  // ---------- Botones "Copiar correo" ----------
  Array.prototype.forEach.call(document.querySelectorAll('[data-copy]'), function (boton) {
    var texto = boton.getAttribute('data-copy');
    var original = boton.textContent;
    var aviso = document.createElement('span');
    aviso.className = 'sr-only';
    aviso.setAttribute('aria-live', 'polite');
    boton.parentNode.insertBefore(aviso, boton.nextSibling);
    var listo = function (ok) {
      boton.textContent = ok ? t('Correo copiado', 'Email copied') : t('No se pudo copiar', 'Could not copy');
      aviso.textContent = ok ? t('Correo copiado: ', 'Email copied: ') + texto : t('No se pudo copiar. El correo es ', 'Could not copy. The email is ') + texto;
      setTimeout(function () { boton.textContent = original; aviso.textContent = ''; }, 2400);
    };
    var plan_b = function () {
      var t = document.createElement('textarea');
      t.value = texto;
      t.setAttribute('readonly', '');
      t.style.position = 'absolute';
      t.style.left = '-9999px';
      document.body.appendChild(t);
      t.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(t);
      listo(ok);
    };
    boton.addEventListener('click', function () {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(texto).then(function () { listo(true); }, plan_b);
      } else {
        plan_b();
      }
    });
  });

  // ---------- Concurso: estado de las inscripciones y días que faltan (hora de Lima) ----------
  var concursos = document.querySelectorAll('[data-concurso]');
  if (concursos.length) {
    var ABRE = new Date('2026-11-02T00:00:00-05:00');
    var CIERRA = new Date('2027-01-15T23:59:59-05:00');
    var diaLima = function (d) { return Math.floor((d.getTime() - 5 * 3600000) / 86400000); };
    var hoy = diaLima(new Date());
    var diaAbre = diaLima(ABRE);
    var diaCierra = diaLima(CIERRA);
    var estado, dias;
    if (hoy < diaAbre) { estado = 'antes'; dias = diaAbre - hoy; }
    else if (hoy === diaAbre) { estado = 'hoy'; dias = diaCierra - hoy; }
    else if (hoy < diaCierra) { estado = 'abierto'; dias = diaCierra - hoy; }
    else if (hoy === diaCierra) { estado = 'ultimo'; dias = 0; }
    else { estado = 'cerrado'; dias = 0; }
    var plural = function (n, uno, varios) { return n === 1 ? uno : varios; };
    var mensaje = {
      antes: {
        badge: t('Las inscripciones inician el 2 de noviembre', 'Registration opens on November 2'),
        label: EN ? plural(dias, 'day until registration opens', 'days until registration opens')
                  : plural(dias, 'día para que abran las inscripciones', 'días para que abran las inscripciones'),
        num: dias
      },
      hoy: {
        badge: t('¡Las inscripciones inician hoy!', 'Registration opens today!'),
        label: EN ? plural(dias, 'day left to register (until January 15)', 'days left to register (until January 15)')
                  : plural(dias, 'día para inscribirte (hasta el 15 de enero)', 'días para inscribirte (hasta el 15 de enero)'),
        num: dias
      },
      abierto: {
        badge: t('Inscripciones abiertas', 'Registration is open'),
        label: EN ? plural(dias, 'day left to register (until January 15)', 'days left to register (until January 15)')
                  : plural(dias, 'día para inscribirte (hasta el 15 de enero)', 'días para inscribirte (hasta el 15 de enero)'),
        num: dias
      },
      ultimo: {
        badge: t('¡Último día para inscribirte!', 'Last day to register!'),
        label: t('Hoy cierran las inscripciones', 'Registration closes today'),
        num: null
      },
      cerrado: {
        badge: t('Inscripciones cerradas', 'Registration closed'),
        label: '',
        num: null
      }
    }[estado];
    Array.prototype.forEach.call(concursos, function (c) {
      var badge = c.querySelector('[data-c="badge"]');
      var cuenta = c.querySelector('[data-c="cuenta"]');
      var num = c.querySelector('[data-c="num"]');
      var label = c.querySelector('[data-c="label"]');
      var boton = c.querySelector('[data-c="boton"]');
      if (badge) {
        badge.textContent = mensaje.badge;
        badge.classList.toggle('hoy', estado === 'hoy' || estado === 'ultimo');
        badge.classList.toggle('cerrado', estado === 'cerrado');
      }
      if (cuenta) {
        if (mensaje.label) {
          cuenta.hidden = false;
          cuenta.classList.toggle('solo-texto', mensaje.num === null);
          if (num) num.textContent = mensaje.num === null ? '' : mensaje.num;
          if (label) label.textContent = mensaje.label;
        } else {
          cuenta.hidden = true;
        }
      }
      if (boton) boton.hidden = (estado === 'antes' || estado === 'cerrado');
    });
  }
})();
