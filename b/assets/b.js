/* ALLGA 온라인 학습 B안 — 공통 스크립트 (머리·바닥, 학습 기록, 문제 엔진, 페이지별 화면) */
(function () {
  'use strict';
  var D = window.ALLGA_DATA || { order: [], programs: {} };
  var BASE = '/b';

  /* ---------- 작은 도구 ---------- */
  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    (kids || []).forEach(function (c) { if (c == null) return; el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return el;
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function param(name) { return new URLSearchParams(location.search).get(name); }
  function store(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }
  function save(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* 저장이 막혀도 화면은 동작 */ } }
  function norm(s) { return String(s || '').replace(/[\s"'“”‘’.,·()]/g, '').toLowerCase(); }
  var CIRCLED = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'];

  /* ---------- 학습 기록 ---------- */
  var PKEY = 'allga.b.progress.v1';
  function progressKey(c, r, p, a) { return [c, r == null ? '-' : r, p, a || '-'].join('|'); }
  function getProgress(k) { return store(PKEY, {})[k] || null; }
  function setProgress(k, v) { var all = store(PKEY, {}); all[k] = v; save(PKEY, all); }
  function statusOf(k) {
    var p = getProgress(k);
    if (!p) return { tone: 'todo', label: '시작 전' };
    if (p.wrong && p.wrong.length) return { tone: 'retry', label: '복습 ' + p.wrong.length + '문제' };
    return { tone: 'done', label: p.total ? '완료 ' + p.score + '/' + p.total : '완료' };
  }
  function dotFor(tone) { return h('span', { class: 'dot' + (tone === 'done' ? ' green' : tone === 'retry' ? ' red' : ''), 'aria-hidden': 'true' }); }

  /* ---------- 머리·바닥 ---------- */
  function header(active) {
    var links = [['소개', BASE + '/', 'home'], ['학습 프로그램', BASE + '/programs/', 'programs'], ['고객센터', BASE + '/support/', 'support']];
    var mobile = h('nav', { class: 'mobile-menu', id: 'mobile-menu', 'aria-label': '전체 메뉴', 'data-open': 'false' },
      links.map(function (l) { return h('a', { href: l[1], 'aria-current': l[2] === active ? 'page' : null, text: l[0] }); }));
    var toggle = h('button', { class: 'menu-toggle', type: 'button', 'aria-label': '전체 메뉴', 'aria-expanded': 'false', 'aria-controls': 'mobile-menu', onclick: function () {
      var open = mobile.getAttribute('data-open') !== 'true';
      mobile.setAttribute('data-open', String(open)); toggle.setAttribute('aria-expanded', String(open));
    } }, [h('span'), h('span'), h('span')]);
    return h('header', { class: 'site-header' }, [
      h('div', { class: 'util' }, [h('div', { class: 'wrap' }, [
        h('a', { href: '/', text: 'A안 보기' }), h('a', { href: BASE + '/support/', text: '문의하기' }), h('a', { href: BASE + '/support/?t=bug', text: '버그신고' })
      ])]),
      h('div', { class: 'nav' }, [h('div', { class: 'wrap' }, [
        h('a', { class: 'brand', href: BASE + '/', 'aria-label': '올가교육 홈' }, [h('img', { src: '/media/allga-ci.svg', alt: '올가교육', width: '132', height: '38' })]),
        h('nav', { class: 'menu', 'aria-label': '주 메뉴' }, links.map(function (l) { return h('a', { href: l[1], 'aria-current': l[2] === active ? 'page' : null, text: l[0] }); })),
        h('div', { class: 'nav-cta' }, [h('a', { class: 'btn btn-black btn-sm', href: BASE + '/learn/?c=elem-vocab', text: '학습 시작' }), toggle])
      ])]),
      mobile
    ]);
  }
  function footer() {
    var progs = D.order.map(function (id) { return h('li', {}, [h('a', { href: BASE + '/learn/?c=' + id, text: D.programs[id].name })]); });
    return h('footer', { class: 'site-footer' }, [h('div', { class: 'top' }, [h('div', { class: 'wrap' }, [
      h('div', {}, [h('img', { class: 'footer-logo', src: '/media/allga-ci.svg', alt: '올가교육' }), h('p', { class: 'slogan', text: '꿈이 이루어지는 교육.' }), h('p', { class: 'muted', style: 'margin:8px 0 0;font-size:15px;color:#bdbdbd', text: '국어의 모든 갈래를 하나의 지도로 잇습니다.' })]),
      h('div', {}, [h('h2', { text: '학습 프로그램' }), h('ul', {}, progs)]),
      h('div', {}, [h('h2', { text: '고객센터' }), h('ul', {}, [h('li', {}, [h('a', { href: BASE + '/support/', text: '문의하기' })]), h('li', {}, [h('a', { href: BASE + '/support/?t=bug', text: '버그신고' })])])]),
      h('div', {}, [h('h2', { text: '바로가기' }), h('ul', {}, [h('li', {}, [h('a', { href: BASE + '/programs/', text: '전체 프로그램' })]), h('li', {}, [h('a', { href: BASE + '/learn/?c=elem-vocab', text: '초등 어휘 Day 1' })])])]),
      h('p', { class: 'copy', text: '© 2026 올가교육 · 서체 Pretendard' })
    ])])]);
  }
  function mountLayout() {
    var active = document.body.getAttribute('data-page');
    var hs = $('[data-layout="header"]'); if (hs) hs.replaceWith(header(active));
    var fs = $('[data-layout="footer"]'); if (fs) fs.replaceWith(footer());
  }

  /* ---------- 영상: 움직임 줄이기 설정이면 멈춤 ---------- */
  function tuneVideos() {
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('video[data-auto]').forEach(function (v) {
      v.muted = true; v.playsInline = true; v.loop = true;
      if (reduce) { v.removeAttribute('autoplay'); v.pause(); return; }
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); }); }, { threshold: 0.2 }).observe(v);
      }
    });
  }

  /* ---------- 망원경 렌즈: 스크롤에 맞춰 원 → 알약으로 커짐 ---------- */
  function lensScroll() {
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('[data-lens]').forEach(function (el) {
      if (reduce) { el.style.setProperty('--t', '1'); return; }
      var ticking = false;
      function update() {
        ticking = false;
        var r = el.getBoundingClientRect();
        var run = el.offsetHeight - window.innerHeight;          // 고정돼 있는 동안 스크롤 거리
        var p = run > 0 ? Math.min(1, Math.max(0, -r.top / (run * 0.8))) : 1;
        var eased = p * p * (3 - 2 * p);                          // 천천히 시작 → 가운데서 열림 → 부드럽게 멈춤
        el.style.setProperty('--t', eased.toFixed(4));
      }
      function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      update();
    });
  }

  /* ---------- 문제 엔진 ---------- */
  function choiceView(q, done) {
    var answered = false;
    var wrap = h('div', { class: 'qbox' });
    if (q.prompt) wrap.appendChild(h('p', { class: 'q-prompt', text: q.prompt }));
    if (q.stimulus) wrap.appendChild(h('p', { class: 'q-stim', text: q.stimulus }));
    var long = q.options.some(function (o) { return o.length > 18; });
    var list = h('div', { class: 'options' + (long ? ' one-col' : ''), role: 'group', 'aria-label': '보기' });
    var fb = h('div', { 'aria-live': 'polite' });
    q.options.forEach(function (o, i) {
      var b = h('button', { class: 'opt', type: 'button', onclick: function () {
        if (answered) return; answered = true;
        var ok = i === q.answer;
        list.querySelectorAll('.opt').forEach(function (x, j) { x.disabled = true; if (j === q.answer) x.classList.add('is-right'); });
        if (!ok) b.classList.add('is-wrong');
        fb.appendChild(h('div', { class: 'feedback ' + (ok ? 'ok' : 'no') }, [h('b', { text: ok ? '정답입니다. ' : '아쉬워요. 정답은 ' + (CIRCLED[q.answer] || q.answer + 1) + ' ' + q.options[q.answer] + '. ' }), q.explanation || '']));
        done(ok ? 1 : 0, 1);
      } }, [h('span', { class: 'n', text: String(i + 1) }), h('span', { text: o })]);
      list.appendChild(b);
    });
    wrap.appendChild(list); wrap.appendChild(fb);
    return wrap;
  }

  function fillView(q, done, opts) {
    var wrap = h('div', { class: 'qbox' });
    if (q.prompt) wrap.appendChild(h('p', { class: 'q-prompt', text: q.prompt }));
    var text = h('div', { class: 'fill-text' + (q.segments.join('').length < 120 ? ' big' : '') });
    var inputs = [];
    q.segments.forEach(function (s) {
      if (s === null) {
        var n = inputs.length;
        var inp = h('input', { class: 'blank', type: 'text', autocomplete: 'off', 'aria-label': '빈칸 ' + (n + 1), size: Math.max(6, String(q.answers[n] || '').length + 3) });
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); var nx = inputs[n + 1]; if (nx) nx.focus(); else check(); } });
        inputs.push(inp); text.appendChild(inp);
      } else text.appendChild(document.createTextNode(s));
    });
    wrap.appendChild(text);
    if (q.hint) wrap.appendChild(h('p', { class: 'hintline', text: '힌트 · ' + q.hint }));
    var fb = h('div', { 'aria-live': 'polite' });
    var btn = h('button', { class: 'btn btn-black', type: 'button', text: (opts && opts.label) || '확인', onclick: check });
    var checked = false;
    function check() {
      if (checked) return; checked = true;
      var right = 0;
      inputs.forEach(function (inp, i) {
        var ans = String(q.answers[i]);
        var alts = ans.split(/\s*[\/|]\s*/);
        var given = norm(inp.value);
        var ok = alts.some(function (a) { return norm(a) === given; }) || (ans.indexOf(',') > -1 && norm(ans) === given);
        inp.classList.add(ok ? 'is-right' : 'is-wrong'); inp.readOnly = true;
        if (ok) right++;
      });
      var all = right === inputs.length;
      fb.appendChild(h('div', { class: 'feedback ' + (all ? 'ok' : 'no') }, [h('b', { text: all ? '정답입니다. ' : '정답 · ' }), all ? (q.explanation || '') : q.answers.join(', ') + (q.explanation ? ' — ' + q.explanation : '')]));
      btn.remove();
      done(all ? 1 : 0, 1);
    }
    wrap.appendChild(h('div', { class: 'q-actions' }, [btn]));
    wrap.appendChild(fb);
    setTimeout(function () { if (inputs[0]) inputs[0].focus({ preventScroll: true }); }, 30);
    return wrap;
  }

  function graspView(q, done) {
    var wrap = h('div', { class: 'qbox' });
    var picks = [];
    var list = h('ul', { class: 'yn' });
    q.items.forEach(function (it, i) {
      var pair = h('div', { class: 'pair', role: 'group', 'aria-label': (i + 1) + '번 답' });
      (q.options || ['예', '아니오']).forEach(function (o, j) {
        pair.appendChild(h('button', { class: 'opt', type: 'button', 'aria-pressed': 'false', text: o, onclick: function (e) {
          picks[i] = j; pair.querySelectorAll('.opt').forEach(function (x, k) { x.setAttribute('aria-pressed', String(k === j)); });
          btn.disabled = picks.filter(function (x) { return x != null; }).length < q.items.length;
        } }));
      });
      list.appendChild(h('li', {}, [h('span', { text: (CIRCLED[i] || i + 1) + ' ' + it.text }), pair]));
    });
    var fb = h('div', { 'aria-live': 'polite' });
    var btn = h('button', { class: 'btn btn-black', type: 'button', disabled: true, text: '정답 확인', onclick: function () {
      var right = 0;
      list.querySelectorAll('li').forEach(function (li, i) {
        var ok = picks[i] === q.items[i].answer; if (ok) right++;
        li.querySelectorAll('.opt').forEach(function (x, k) { x.disabled = true; x.setAttribute('aria-pressed', 'false'); if (k === q.items[i].answer) x.classList.add('is-right'); else if (k === picks[i]) x.classList.add('is-wrong'); });
      });
      fb.appendChild(h('div', { class: 'feedback ' + (right === q.items.length ? 'ok' : 'no'), text: q.items.length + '문장 중 ' + right + '문장을 맞혔어요.' }));
      btn.remove();
      done(right, q.items.length);
    } });
    wrap.appendChild(list); wrap.appendChild(h('div', { class: 'q-actions' }, [btn])); wrap.appendChild(fb);
    return wrap;
  }

  function pickView(q, done) {
    var wrap = h('div', { class: 'qbox' });
    if (q.prompt) wrap.appendChild(h('p', { class: 'q-prompt', text: q.prompt }));
    var list = h('div', { class: 'sentences options one-col' });
    var fb = h('div', { 'aria-live': 'polite' });
    var answered = false;
    q.sentences.forEach(function (s, i) {
      var b = h('button', { class: 'opt', type: 'button', onclick: function () {
        if (answered) return; answered = true;
        var ok = i === q.answer;
        list.querySelectorAll('.opt').forEach(function (x, j) { x.disabled = true; if (j === q.answer) x.classList.add('is-right'); });
        if (!ok) b.classList.add('is-wrong');
        fb.appendChild(h('div', { class: 'feedback ' + (ok ? 'ok' : 'no') }, [h('b', { text: ok ? '정답입니다. ' : '아쉬워요. ' }), q.explanation || '']));
        done(ok ? 1 : 0, 1);
      } }, [h('span', { class: 'n', text: String(i + 1) }), h('span', { text: s })]);
      list.appendChild(b);
    });
    wrap.appendChild(list); wrap.appendChild(fb);
    return wrap;
  }

  function orderView(q, done) {
    var wrap = h('div', { class: 'qbox' });
    if (q.prompt) wrap.appendChild(h('p', { class: 'q-prompt', text: q.prompt }));
    var seq = [];
    var list = h('div', { class: 'sentences options one-col' });
    var picked = h('p', { class: 'order-picked', text: '고른 순서 · 아직 없음' });
    var fb = h('div', { 'aria-live': 'polite' });
    var finished = false;
    function paint() {
      list.querySelectorAll('.opt').forEach(function (b, i) {
        var pos = seq.indexOf(i + 1);
        b.setAttribute('aria-pressed', String(pos > -1));
        b.querySelector('.n').textContent = pos > -1 ? String(pos + 1) : '·';
      });
      picked.textContent = '고른 순서 · ' + (seq.length ? seq.map(function (x) { return '(' + x + ')'; }).join(' → ') : '아직 없음');
      check.disabled = seq.length !== q.sentences.length;
    }
    q.sentences.forEach(function (s, i) {
      list.appendChild(h('button', { class: 'opt', type: 'button', 'aria-pressed': 'false', onclick: function () {
        if (finished) return;
        var at = seq.indexOf(i + 1);
        if (at > -1) seq.splice(at, 1); else seq.push(i + 1);
        paint();
      } }, [h('span', { class: 'n', text: '·' }), h('span', { text: '(' + (i + 1) + ') ' + s })]));
    });
    var reset = h('button', { class: 'btn btn-ghost btn-sm', type: 'button', text: '다시 고르기', onclick: function () { if (!finished) { seq = []; paint(); } } });
    var check = h('button', { class: 'btn btn-black', type: 'button', disabled: true, text: '정답 확인', onclick: function () {
      finished = true;
      var ok = seq.join(',') === q.correctOrder.join(',');
      fb.appendChild(h('div', { class: 'feedback ' + (ok ? 'ok' : 'no') }, [h('b', { text: ok ? '정답입니다. ' : '정답 순서 · ' }), ok ? '' : q.correctOrder.map(function (x) { return '(' + x + ')'; }).join(' → ')]));
      check.remove(); reset.remove();
      done(ok ? 1 : 0, 1);
    } });
    wrap.appendChild(list); wrap.appendChild(picked);
    wrap.appendChild(h('div', { class: 'q-actions' }, [reset, check])); wrap.appendChild(fb);
    paint();
    return wrap;
  }

  function ontologyView(q, done) {
    var wrap = h('div', { class: 'qbox', style: 'max-width:none' });
    var fills = {}; var active = null; var finished = false;
    var board = h('div', { class: 'onto' });
    var byId = {}; q.nodes.forEach(function (n) { byId[n.id] = n; });
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('aria-hidden', 'true');
    q.edges.forEach(function (e) {
      var a = byId[e[0]], b = byId[e[1]]; if (!a || !b) return;
      var l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', a.x); l.setAttribute('y1', a.y); l.setAttribute('x2', b.x); l.setAttribute('y2', b.y);
      l.setAttribute('stroke', '#bdbdb4'); l.setAttribute('stroke-width', '0.3'); l.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(l);
    });
    board.appendChild(svg);
    var nodeEls = {};
    q.nodes.forEach(function (n) {
      var isRoot = !n.slot;
      var el = h('button', { class: 'node' + (isRoot ? ' root' : ''), type: 'button', style: 'left:' + n.x + '%;top:' + n.y + '%;width:' + n.w + '%', 'aria-pressed': 'false', disabled: isRoot ? true : null,
        text: isRoot ? (n.label || q.prompt) : n.slot + '번',
        onclick: function () { if (finished) return; active = n.slot; Object.keys(nodeEls).forEach(function (k) { nodeEls[k].setAttribute('aria-pressed', String(Number(k) === active)); }); } });
      if (!isRoot) nodeEls[n.slot] = el;
      board.appendChild(el);
    });
    var chips = h('div', { class: 'onto-choices', role: 'group', 'aria-label': '넣을 내용' });
    q.choices.forEach(function (c, ci) {
      chips.appendChild(h('button', { class: 'opt', type: 'button', text: c, onclick: function () {
        if (finished) return;
        if (active == null) { var first = Object.keys(nodeEls).map(Number).filter(function (s) { return fills[s] == null; })[0]; active = first; }
        if (active == null) return;
        Object.keys(fills).forEach(function (s) { if (fills[s] === ci) delete fills[s]; });
        fills[active] = ci; nodeEls[active].textContent = active + '. ' + c;
        var next = Object.keys(nodeEls).map(Number).filter(function (s) { return fills[s] == null; })[0];
        active = next == null ? null : next;
        Object.keys(nodeEls).forEach(function (k) { nodeEls[k].setAttribute('aria-pressed', String(Number(k) === active)); if (fills[k] == null) nodeEls[k].textContent = k + '번'; });
        chips.querySelectorAll('.opt').forEach(function (x, j) { x.classList.toggle('used', Object.keys(fills).some(function (s) { return fills[s] === j; })); });
        btn.disabled = Object.keys(fills).length < Object.keys(nodeEls).length;
      } }));
    });
    var fb = h('div', { 'aria-live': 'polite' });
    var btn = h('button', { class: 'btn btn-black', type: 'button', disabled: true, text: '정답 확인', onclick: function () {
      finished = true; var right = 0;
      Object.keys(nodeEls).forEach(function (k) {
        var ok = fills[k] === q.answers[Number(k) - 1]; if (ok) right++;
        nodeEls[k].classList.add(ok ? 'is-right' : 'is-wrong');
        if (!ok) nodeEls[k].textContent = k + '. ' + q.choices[q.answers[Number(k) - 1]];
      });
      var total = Object.keys(nodeEls).length;
      fb.appendChild(h('div', { class: 'feedback ' + (right === total ? 'ok' : 'no'), text: total + '칸 중 ' + right + '칸을 맞혔어요. 틀린 칸에는 정답을 보여 드려요.' }));
      btn.remove();
      done(right, total);
    } });
    wrap.appendChild(h('p', { class: 'hintline', style: 'margin:0 0 14px', text: '번호 칸을 누른 뒤 아래에서 알맞은 내용을 고르세요. 칸을 고르지 않으면 빈 칸에 차례로 들어갑니다.' }));
    wrap.appendChild(board); wrap.appendChild(chips);
    wrap.appendChild(h('div', { class: 'q-actions' }, [btn])); wrap.appendChild(fb);
    return wrap;
  }

  function questionView(q, done, opts) {
    switch (q.kind) {
      case 'choice': return choiceView(q, done);
      case 'fill': return fillView(q, done, opts);
      case 'grasp-set': return graspView(q, done);
      case 'pick-sentence': return pickView(q, done);
      case 'order': return orderView(q, done);
      case 'ontology': return ontologyView(q, done);
      default: return h('p', { class: 'muted', text: '이 문제 유형은 아직 준비 중입니다.' });
    }
  }

  /* 여러 문제를 하나씩 푸는 흐름 */
  function quizRunner(root, questions, ctx) {
    var i = 0, score = 0, total = 0, wrong = [];
    var head = ctx.progressEl;
    function setBar() {
      if (!head) return;
      head.querySelector('.count').textContent = Math.min(i + 1, questions.length) + ' / ' + questions.length;
      head.querySelector('.bar i').style.width = (i / questions.length * 100) + '%';
    }
    function step() {
      root.innerHTML = '';
      if (i >= questions.length) return finish();
      setBar();
      var q = questions[i].q;
      var next = h('button', { class: 'btn btn-red', type: 'button', text: i + 1 < questions.length ? '다음 문제' : '결과 보기', onclick: function () { i++; step(); window.scrollTo({ top: 0, behavior: 'smooth' }); } });
      next.hidden = true;
      var view = questionView(q, function (got, of) {
        score += got; total += of; if (got < of) wrong.push(questions[i].idx);
        next.hidden = false; setTimeout(function () { next.focus({ preventScroll: true }); }, 30);
      });
      root.appendChild(view);
      root.appendChild(h('div', { class: 'q-actions' }, [h('span', { class: 'muted', style: 'font-size:15px', text: ctx.instruction || '' }), next]));
    }
    function finish() {
      if (head) { head.querySelector('.count').textContent = questions.length + ' / ' + questions.length; head.querySelector('.bar i').style.width = '100%'; }
      ctx.onFinish(score, total, wrong);
    }
    step();
  }

  /* ---------- 단어 카드 ---------- */
  function studyDrill(root, vocab, onDone) {
    var i = 0, open = false, seen = {};
    var card = h('button', { class: 'flash', type: 'button', 'aria-live': 'polite' });
    var count = h('span', { class: 'count' });
    var list = h('ul', { class: 'word-list' });
    var finishBtn = h('button', { class: 'btn btn-red', type: 'button', text: '학습 완료', onclick: onDone });
    function paint() {
      var v = vocab[i]; seen[i] = true;
      card.innerHTML = '';
      card.appendChild(h('span', { class: 'term', text: v.term }));
      if (v.reading && v.term.indexOf(v.reading) !== 0) card.appendChild(h('span', { class: 'reading', text: v.reading }));
      if (open) {
        card.appendChild(h('span', { class: 'meaning', text: v.meaning.replace(/\//g, ' / ') }));
        var dl = h('dl');
        if (v.synonym) { dl.appendChild(h('dt', { text: '유의어' })); dl.appendChild(h('dd', { text: v.synonym })); }
        if (v.example) { dl.appendChild(h('dt', { text: '예문' })); dl.appendChild(h('dd', { text: v.example })); }
        card.appendChild(dl);
      } else card.appendChild(h('span', { class: 'hint', text: '카드를 누르면 뜻이 보여요' }));
      card.setAttribute('aria-label', v.term + (open ? ', 뜻 보는 중' : ', 눌러서 뜻 보기'));
      count.textContent = (i + 1) + ' / ' + vocab.length;
      prev.disabled = i === 0;
      next.textContent = i + 1 < vocab.length ? '다음' : '처음으로';
      list.querySelectorAll('button').forEach(function (b, j) { b.setAttribute('aria-current', String(j === i)); b.querySelector('.st').textContent = seen[j] ? '확인' : ''; });
    }
    card.addEventListener('click', function () { open = !open; paint(); });
    var prev = h('button', { class: 'btn btn-ghost btn-sm', type: 'button', text: '이전', onclick: function () { if (i > 0) { i--; open = false; paint(); } } });
    var next = h('button', { class: 'btn btn-black btn-sm', type: 'button', text: '다음', onclick: function () { i = (i + 1) % vocab.length; open = false; paint(); } });
    vocab.forEach(function (v, j) {
      list.appendChild(h('li', {}, [h('button', { type: 'button', onclick: function () { i = j; open = false; paint(); } }, [h('span', { text: v.term }), h('span', { class: 'st muted', style: 'font-size:14px' })])]));
    });
    root.appendChild(h('div', { class: 'card-stage' }, [
      h('div', {}, [card, h('div', { class: 'card-nav' }, [prev, count, next])]),
      h('div', {}, [h('p', { class: 'q-prompt', text: '오늘의 단어 ' + vocab.length + '개' }), list, h('div', { style: 'margin-top:20px' }, [finishBtn])])
    ]));
    paint();
  }

  function grammarNote(root, note, onDone) {
    var box = h('div', { class: 'lines' });
    note.lines.forEach(function (l) {
      if (!l.trim()) return box.appendChild(h('p', { html: '&nbsp;' }));
      var cls = /^\*/.test(l) ? 'star' : /^\d+\.\s/.test(l) ? 'sec' : /^예\)/.test(l) ? 'ex' : '';
      box.appendChild(h('p', { class: cls, text: l.replace(/^\*\s*/, '') }));
    });
    root.appendChild(h('article', { class: 'note' }, [h('h2', { text: note.title }), box, h('div', { class: 'q-actions' }, [h('span'), h('button', { class: 'btn btn-red', type: 'button', text: '학습 완료', onclick: onDone })])]));
  }

  function passageView(p) {
    return h('aside', { class: 'passage', 'aria-label': '지문' }, [h('h2', { text: p.title })].concat(p.paragraphs.map(function (t) { return h('p', { text: t }); })));
  }

  /* ---------- 홈: 들여다보기 (초등 어휘 Day 1 실제 데이터로 학습 단계를 차례로) ---------- */
  function homePeek() {
    var frame = $('#peek'), tabs = $('#peek-tabs');
    var day = D.programs['elem-vocab'] && D.programs['elem-vocab'].rows[0];
    if (!frame || !tabs || !day) return;
    var v = day.parts['1'].vocab[0];
    var q = day.parts['2'].questions[0];
    var wrongAt = q.answer === 0 ? 1 : 0;
    function opts(mode) {
      return h('div', { class: 'pk-opts' }, q.options.map(function (o, i) {
        var cls = 'pk-opt';
        if (mode === 'graded' && i === q.answer) cls += ' is-right';
        if (mode === 'graded' && i === wrongAt) cls += ' is-wrong';
        return h('span', { class: cls }, [h('span', { class: 'n', text: String(i + 1) }), o]);
      }));
    }
    var slides = [
      { tab: '단어 카드', note: 'Part 1 · 학습', body: function () {
        return h('div', { class: 'pk-card' }, [h('p', { class: 'pk-term', text: v.term }), h('p', { class: 'pk-mean', text: v.meaning }),
          h('p', { class: 'pk-ex' }, [h('b', { text: '유의어 ' }), v.synonym || '', h('br'), h('b', { text: '예문 ' }), v.example])]);
      } },
      { tab: '문제', note: 'Part 2 · 뜻 → 단어', body: function () {
        return h('div', {}, [h('p', { class: 'pk-q', text: '이 뜻을 가진 낱말은?' }), h('p', { class: 'pk-stim', text: '“' + q.stimulus + '”' }), opts('ask')]);
      } },
      { tab: '채점', note: '그 자리에서 채점', body: function () {
        return h('div', {}, [h('p', { class: 'pk-q', text: '이 뜻을 가진 낱말은?' }), h('p', { class: 'pk-stim', text: '“' + q.stimulus + '”' }), opts('graded'),
          h('p', { class: 'pk-fb', text: '정답은 ' + q.options[q.answer] + '. 틀린 문제는 다시 풀 목록에 담깁니다.' })]);
      } },
      { tab: '다시 풀기', note: '모두 알 때까지', body: function () {
        return h('div', { class: 'pk-result' }, [h('p', { class: 'pk-score' }, ['4', h('small', { text: ' / 5' })]),
          h('div', { class: 'pk-row' }, [h('span', { class: 'h-chip h-chip-red', text: '틀린문제 1' }), h('span', { class: 'pk-arrow', text: '→' }), h('span', { class: 'h-chip h-chip-black', text: '다시 풀기' }), h('span', { class: 'pk-arrow', text: '→' }), h('span', { class: 'h-chip h-chip-done', text: '완료 5/5' })])]);
      } }
    ];
    var i = 0, timer = null, paused = false;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var btns = slides.map(function (s, k) {
      var b = h('button', { class: 'pk-tab', type: 'button', role: 'tab', 'aria-selected': 'false', text: s.tab, onclick: function () { stop(); show(k); } });
      tabs.appendChild(b); return b;
    });
    function show(k) {
      i = k;
      btns.forEach(function (b, j) { b.setAttribute('aria-selected', String(j === k)); });
      frame.innerHTML = '';
      frame.appendChild(h('div', { class: 'pk-slide' }, [h('p', { class: 'pk-note', text: slides[k].note }), slides[k].body()]));
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() { if (reduce || timer) return; timer = setInterval(function () { if (!paused) show((i + 1) % slides.length); }, 4200); }
    frame.addEventListener('mouseenter', function () { paused = true; });
    frame.addEventListener('mouseleave', function () { paused = false; });
    frame.addEventListener('focusin', function () { paused = true; });
    show(0);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) start(); else stop(); }); }, { threshold: 0.35 }).observe(frame);
    } else start();
  }

  /* ---------- 페이지: 홈 ---------- */
  function pageHome() {
    homePeek();
    var host = $('#try'); if (!host) return;
    var day = D.programs['elem-vocab'] && D.programs['elem-vocab'].rows[0];
    var qs = (day && day.parts['2'] && day.parts['2'].questions || []).slice(0, 5);
    var i = 0;
    var counter = $('#try-count');
    function show() {
      host.innerHTML = '';
      counter.textContent = (i + 1) + ' / ' + qs.length;
      var q = qs[i];
      host.appendChild(h('p', { class: 'try-q', text: '이 뜻을 가진 낱말은?' }));
      host.appendChild(h('p', { class: 'try-stim', text: '“' + q.stimulus + '”' }));
      var view = choiceView({ kind: 'choice', options: q.options, answer: q.answer }, function () { nextBtn.hidden = false; });
      host.appendChild(view);
      var nextBtn = h('button', { class: 'btn btn-black btn-sm', type: 'button', text: i + 1 < qs.length ? '다음 문제' : '처음부터', onclick: function () { i = (i + 1) % qs.length; show(); } });
      nextBtn.hidden = true;
      host.appendChild(h('div', { class: 'try-foot' }, [h('span', { text: '보기를 누르면 바로 채점돼요.' }), nextBtn]));
    }
    if (qs.length) show();
  }

  /* ---------- 페이지: 프로그램 ---------- */
  function pagePrograms() {
    var list = $('#plist'); var tabs = $('#ptabs'); if (!list) return;
    var groups = ['전체', '어휘', '문법', '문해력'];
    var cur = '전체';
    function paint() {
      list.innerHTML = '';
      D.order.forEach(function (id) {
        var p = D.programs[id];
        if (cur !== '전체' && p.group !== cur) return;
        var units = p.rows ? p.rows.length : Object.keys(p.activities || {}).length;
        var unitWord = id === 'grammar' ? '단원' : id === 'literacy' ? '활동' : 'Day';
        list.appendChild(h('article', { class: 'prow' }, [
          h('span', { class: 'grp', text: p.group }),
          h('div', {}, [h('h2', { text: p.name }), h('p', { class: 'tl', text: p.tagline })]),
          h('div', {}, [h('p', { class: 'desc', text: p.description.replace(/\s—\s/g, ', ') }), h('div', { class: 'meta' }, [h('span', { text: 'Part ' + p.parts.length + '개' }), h('span', { text: unitWord + ' ' + units + '개' })])]),
          h('a', { class: 'btn btn-black btn-sm', href: BASE + '/learn/?c=' + id }, ['학습하기 ', h('span', { class: 'arrow', 'aria-hidden': 'true', text: '→' })])
        ]));
      });
    }
    groups.forEach(function (g) {
      tabs.appendChild(h('button', { class: 'tab', type: 'button', role: 'tab', 'aria-selected': String(g === cur), text: g, onclick: function (e) {
        cur = g; tabs.querySelectorAll('.tab').forEach(function (t) { t.setAttribute('aria-selected', String(t.textContent === g)); }); paint();
      } }));
    });
    paint();
  }

  /* ---------- 페이지: 과정 ---------- */
  function pageCourse() {
    var id = param('c') || 'elem-vocab';
    var p = D.programs[id]; var host = $('#course'); if (!host) return;
    if (!p) { host.appendChild(h('p', { class: 'empty', text: '과정을 찾을 수 없어요. 학습 프로그램에서 다시 골라 주세요.' })); return; }
    document.title = p.name + ' · 올가교육 B안';
    $('#c-name').textContent = p.name;
    $('#c-crumb').textContent = p.name;
    $('#c-lead').textContent = p.description.replace(/\s—\s/g, ', ');
    var grid = h('div', { class: 'course-grid', role: 'table', 'aria-label': p.name + ' 학습 목록' });
    var done = 0, totalCells = 0, retry = 0;
    if (id === 'literacy') {
      grid.style.setProperty('--parts', 3);
      grid.appendChild(h('div', { class: 'crow head', role: 'row' }, [h('span', { role: 'columnheader', text: 'Part' }), h('span', { role: 'columnheader', text: '활동 1' }), h('span', { role: 'columnheader', text: '활동 2' }), h('span', { role: 'columnheader', text: '활동 3' })]));
      p.parts.forEach(function (part) {
        var cells = [h('span', { class: 'rlabel', role: 'rowheader', text: 'Part ' + part.no + ' ' + part.caption })];
        for (var k = 0; k < 3; k++) {
          var a = part.activities[k];
          if (!a) { cells.push(h('span', { role: 'cell' })); continue; }
          var key = progressKey(id, null, part.no, a.key); var st = statusOf(key); totalCells++;
          if (st.tone === 'done') done++; if (st.tone === 'retry') retry++;
          cells.push(h('a', { class: 'cell', role: 'cell', href: BASE + '/learn/play/?c=' + id + '&p=' + part.no + '&a=' + a.key }, [h('b', { text: a.name }), h('span', { class: 'st' }, [dotFor(st.tone), st.label])]));
        }
        grid.appendChild(h('div', { class: 'crow', role: 'row' }, cells));
      });
    } else {
      grid.style.setProperty('--parts', p.parts.length);
      grid.appendChild(h('div', { class: 'crow head', role: 'row' }, [h('span', { role: 'columnheader', text: id === 'grammar' ? '단원' : '매일 학습' })].concat(p.parts.map(function (part) { return h('span', { role: 'columnheader', text: 'Part ' + part.no + ' · ' + part.caption }); }))));
      p.rows.forEach(function (row, r) {
        var cells = [h('span', { class: 'rlabel', role: 'rowheader', text: row.label })];
        p.parts.forEach(function (part) {
          var key = progressKey(id, r, part.no); var st = statusOf(key); totalCells++;
          if (st.tone === 'done') done++; if (st.tone === 'retry') retry++;
          cells.push(h('a', { class: 'cell', role: 'cell', href: BASE + '/learn/play/?c=' + id + '&r=' + r + '&p=' + part.no, 'aria-label': row.label + ' Part ' + part.no + ' ' + part.caption + ', ' + st.label }, [h('b', { text: 'Part ' + part.no }), h('span', { class: 'st' }, [dotFor(st.tone), st.label])]));
        });
        grid.appendChild(h('div', { class: 'crow', role: 'row' }, cells));
      });
    }
    host.appendChild(h('p', { class: 'course-summary' }, [h('span', {}, ['완료 ', h('b', { text: done + '' }), ' / ' + totalCells]), h('span', {}, ['복습할 Part ', h('b', { text: retry + '' })]), h('span', { text: '초록 점은 완료, 빨간 점은 틀린 문제가 남은 Part예요.' })]));
    host.appendChild(grid);
  }

  /* ---------- 페이지: 학습 ---------- */
  function pagePlay() {
    var id = param('c'); var p = D.programs[id]; var host = $('#play'); if (!host) return;
    if (!p) { host.appendChild(h('p', { class: 'empty', text: '학습을 찾을 수 없어요.' })); return; }
    var partNo = Number(param('p') || 1); var part = p.parts.filter(function (x) { return x.no === partNo; })[0] || p.parts[0];
    var r = param('r') == null ? null : Number(param('r'));
    var actKey = param('a'); var act = null; var content, passage = null, title, sub, instruction;
    if (id === 'literacy') {
      act = (part.activities || []).filter(function (a) { return a.key === actKey; })[0] || part.activities[0];
      var c = p.activities[act.key] || { questions: [] };
      content = { questions: c.questions }; if (c.usesPassage) passage = p.passage;
      title = act.title; sub = p.name; instruction = act.instruction;
    } else {
      var row = p.rows[r || 0]; if (r == null) r = 0;
      content = row.parts[String(part.no)] || {};
      title = part.title; sub = p.name + ' · ' + row.label;
    }
    var key = progressKey(id, id === 'literacy' ? null : r, part.no, act && act.key);
    var retryMode = param('retry') === '1';
    var listHref = BASE + '/learn/?c=' + id;
    document.title = title + ' · ' + p.name + ' · 올가교육 B안';
    $('#p-crumb-course').textContent = p.name; $('#p-crumb-course').href = listHref;
    $('#p-crumb-part').textContent = title;

    var progressEl = h('div', { class: 'progress' }, [h('span', { class: 'count', text: '' }), h('span', { class: 'bar', 'aria-hidden': 'true' }, [h('i', { style: 'width:0' })])]);
    var head = h('div', { class: 'play-head' }, [h('div', {}, [h('h1', { text: title + (retryMode ? ' · 틀린 문제' : '') }), h('p', { class: 'sub', text: sub })]), progressEl]);
    host.appendChild(head);
    var body = h('div'); var stage = h('div');
    if (passage) { body.className = 'with-passage'; body.appendChild(passageView(passage)); }
    body.appendChild(stage); host.appendChild(body);
    if (instruction) stage.appendChild(h('p', { class: 'instruction', text: instruction }));
    var qroot = h('div'); stage.appendChild(qroot);

    function studyDone() { setProgress(key, { done: true, at: Date.now() }); showResult(null); }
    function showResult(res) {
      host.removeChild(body);
      var box = h('section', { class: 'result', 'aria-live': 'polite' });
      if (!res) {
        box.appendChild(h('p', { class: 'score', text: '완료' }));
        box.appendChild(h('p', { text: '오늘 학습을 마쳤어요. 다음 Part에서 문제로 확인해 보세요.' }));
      } else {
        box.appendChild(h('p', { class: 'score' }, [String(res.score), h('small', { text: ' / ' + res.total })]));
        box.appendChild(h('p', { text: res.wrong.length ? '틀린 문제 ' + res.wrong.length + '개는 다시 풀 목록에 담았어요. 모두 맞히면 완료로 바뀝니다.' : '모두 맞혔어요. 이 Part는 완료예요.' }));
      }
      var nextPart = p.parts.filter(function (x) { return x.no === part.no + 1; })[0];
      var actions = h('div', { class: 'actions' });
      if (res && res.wrong.length) actions.appendChild(h('a', { class: 'btn btn-red', href: location.pathname + '?' + qs({ retry: 1 }), text: '틀린 문제 다시 풀기' }));
      if (nextPart && id !== 'literacy') actions.appendChild(h('a', { class: 'btn btn-black', href: BASE + '/learn/play/?c=' + id + '&r=' + r + '&p=' + nextPart.no }, ['다음 Part ', h('span', { class: 'arrow', 'aria-hidden': 'true', text: '→' })]));
      actions.appendChild(h('a', { class: 'btn btn-ghost', href: listHref, text: '학습 목록으로' }));
      box.appendChild(actions);
      host.appendChild(box);
      progressEl.querySelector('.count').textContent = '끝';
      progressEl.querySelector('.bar i').style.width = '100%';
    }
    function qs(extra) { var u = new URLSearchParams(location.search); for (var k in extra) u.set(k, extra[k]); return u.toString(); }

    if (content.vocab && part.engine === 'study-drill') { progressEl.querySelector('.count').textContent = '단어 ' + content.vocab.length + '개'; return studyDrill(qroot, content.vocab, studyDone); }
    if (content.note && part.engine === 'grammar-note') { progressEl.querySelector('.count').textContent = '개념 읽기'; return grammarNote(qroot, content.note, studyDone); }
    var all = (content.questions || []).map(function (q, idx) { return { q: q, idx: idx }; });
    if (retryMode) {
      var prev = getProgress(key);
      var keep = prev && prev.wrong || [];
      all = all.filter(function (x) { return keep.indexOf(x.idx) > -1; });
      if (!all.length) { qroot.appendChild(h('p', { class: 'empty', text: '다시 풀 문제가 없어요.' })); return; }
    }
    if (!all.length) { qroot.appendChild(h('p', { class: 'empty', text: '이 Part의 문제는 준비 중이에요.' })); return; }
    quizRunner(qroot, all, { progressEl: progressEl, onFinish: function (score, total, wrong) {
      var prev = getProgress(key) || {};
      var stillWrong = retryMode ? (prev.wrong || []).filter(function (x) { return wrong.indexOf(x) > -1; }) : wrong;
      // 다시 풀기에서는 처음 점수에 새로 맞힌 문제만 더합니다(문항 기준).
      var fullTotal = retryMode ? (prev.total || total) : total;
      var fullScore = retryMode ? Math.min(fullTotal, (prev.score || 0) + ((prev.wrong || []).length - stillWrong.length)) : score;
      setProgress(key, { done: true, score: fullScore, total: fullTotal, wrong: stillWrong, at: Date.now() });
      showResult({ score: retryMode ? score : fullScore, total: total, wrong: stillWrong });
    } });
  }

  /* ---------- 페이지: 고객센터 ---------- */
  function pageSupport() {
    var host = $('#support'); if (!host) return;
    var TKEY = 'allga.b.tickets.v1';
    var type = param('t') === 'bug' ? 'bug' : 'inquiry';
    var tabs = $('#stabs');
    var formHost = $('#sform'); var listHost = $('#slist');
    function paintTabs() {
      tabs.innerHTML = '';
      [['inquiry', '문의하기'], ['bug', '버그신고']].forEach(function (t) {
        tabs.appendChild(h('button', { class: 'tab', type: 'button', role: 'tab', 'aria-selected': String(type === t[0]), text: t[1], onclick: function () { type = t[0]; history.replaceState(null, '', type === 'bug' ? '?t=bug' : location.pathname); paintTabs(); paintForm(); paintList(); } }));
      });
    }
    function field(label, el, id) { el.id = id; return h('div', { class: 'field' }, [h('label', { for: id, text: label }), el]); }
    function paintForm() {
      formHost.innerHTML = '';
      var title = h('input', { type: 'text', name: 'title', maxlength: '80', placeholder: type === 'bug' ? '예) Part 2에서 다음 버튼이 눌리지 않아요' : '예) 수강 기간이 궁금해요' });
      var kind = h('select', { name: 'kind' }, (type === 'bug' ? ['학습 화면', '로그인·계정', '기타'] : ['학습', '결제', '계정', '기타']).map(function (o) { return h('option', { text: o }); }));
      var body = h('textarea', { name: 'body', placeholder: type === 'bug' ? '어떤 화면에서, 무엇을 눌렀을 때 생겼는지 적어 주세요.' : '궁금한 점을 자유롭게 적어 주세요.' });
      var err = h('p', { class: 'err', role: 'alert' });
      var f = h('form', { class: 'form', novalidate: true, onsubmit: function (e) {
        e.preventDefault();
        if (!title.value.trim() || !body.value.trim()) { err.textContent = '제목과 내용을 모두 적어 주세요.'; (title.value.trim() ? body : title).focus(); return; }
        var all = store(TKEY, []);
        all.unshift({ type: type, title: title.value.trim(), kind: kind.value, body: body.value.trim(), at: new Date().toISOString().slice(0, 10) });
        save(TKEY, all); f.reset(); err.textContent = ''; paintList();
        $('#sdone').textContent = '남겼어요. 시안이라 실제로 보내지지는 않고 이 브라우저에만 저장돼요.';
      } }, [field('제목', title, 's-title'), field('구분', kind, 's-kind'), field('내용', body, 's-body'), err, h('div', {}, [h('button', { class: 'btn btn-red', type: 'submit', text: type === 'bug' ? '버그 신고하기' : '문의 남기기' })]), h('p', { id: 'sdone', class: 'muted', 'aria-live': 'polite', style: 'margin:0;font-size:15px' })]);
      formHost.appendChild(f);
      $('#s-heading').textContent = type === 'bug' ? '버그신고' : '문의하기';
      $('#s-lead').textContent = type === 'bug' ? '학습 중 이상한 점을 발견하면 알려 주세요. 화면 이름과 상황을 적어 주시면 빨리 고칠 수 있어요.' : '학습·결제·계정에 관한 질문을 남겨 주세요.';
    }
    function paintList() {
      listHost.innerHTML = '';
      var all = store(TKEY, []).filter(function (t) { return t.type === type; });
      listHost.appendChild(h('h2', { class: 'h3', style: 'color:var(--black);font-weight:700;margin-bottom:16px', text: (type === 'bug' ? '신고' : '문의') + ' 내역 ' + all.length + '건' }));
      if (!all.length) { listHost.appendChild(h('p', { class: 'empty', text: '아직 남긴 ' + (type === 'bug' ? '신고가' : '문의가') + ' 없어요.' })); return; }
      listHost.appendChild(h('ul', { class: 'tickets' }, all.map(function (t) { return h('li', {}, [h('span', { class: 'kind', text: t.kind }), h('span', { text: t.title }), h('span', { class: 'date', text: t.at })]); })));
    }
    paintTabs(); paintForm(); paintList();
  }

  /* ---------- 시작 ---------- */
  function boot() {
    mountLayout();
    tuneVideos();
    lensScroll();
    var page = document.body.getAttribute('data-page');
    ({ home: pageHome, programs: pagePrograms, course: pageCourse, play: pagePlay, support: pageSupport }[page] || function () {})();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
