// 2026-11-13 모바일 스크롤 흔들림 방지 (사용자 요청, 학습 화면 세션)
// 휴대폰은 내릴 때 주소창이 줄었다 늘며 화면 높이(innerHeight)가 바뀜 → 스크롤 연출이 그때마다 다시 계산되어 덜컹거림.
// 터치 기기에서는 화면 높이를 CSS 100vh와 같은 값으로 고정하고, 가로 폭이 그대로인 resize(주소창 변화)는 무시.
(function () {
  try {
    if (!window.matchMedia || !matchMedia('(pointer: coarse)').matches) return;
    // 100vh 높이를 잠깐 재고 바로 지움 (페이지 구조에 남기지 않음)
    var desc = Object.getOwnPropertyDescriptor(window, 'innerHeight') || Object.getOwnPropertyDescriptor(Window.prototype, 'innerHeight');
    var realH = function () { return desc && desc.get ? desc.get.call(window) : 0; };
    var measure = function () {
      var probe = document.createElement('div');
      probe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100vh;visibility:hidden;pointer-events:none';
      document.documentElement.appendChild(probe);
      var v = probe.offsetHeight; probe.remove();
      return v || realH();
    };
    var w = document.documentElement.clientWidth, h = measure();
    Object.defineProperty(window, 'innerHeight', { configurable: true, get: function () { return h; } });
    window.addEventListener('resize', function (e) {
      var nw = document.documentElement.clientWidth;
      if (nw === w) { e.stopImmediatePropagation(); return; }
      w = nw; h = measure();
    }, true);
  } catch (e) {}
})();
// A안·B안 바꾸기 버튼(오른쪽 아래 배지) 숨김 — 사용자 요청 (2026-11-13). 화면 전환은 주소의 ?skin=a/b 로만
(function () { try { var st = document.createElement('style'); st.textContent = '.allga-skin-badge{display:none!important}'; (document.head || document.documentElement).appendChild(st); } catch (e) {} })();
// 이전 이름(olga.*)으로 저장된 학습 기록을 새 키(allga.*)로 옮깁니다.
// (A안·B안 전환 버튼은 B안을 진행하지 않기로 해서 2026-11-10에 제거했습니다.)
(function () {
  try {
    ['progress', 'ui', 'filters', 'boards'].forEach(function (name) {
      var legacy = 'olga.' + name + '.v1', next = 'allga.' + name + '.v1';
      var value = localStorage.getItem(legacy);
      if (value !== null && localStorage.getItem(next) === null) localStorage.setItem(next, value);
      localStorage.removeItem(legacy);
    });
  } catch (e) { /* 저장소가 막혀도 화면은 엽니다. */ }
})();

// A안 정리 스타일(allga-tune.css)을 붙입니다.
// HTML의 <link>는 화면을 다시 그릴 때 빠질 수 있어서, 빠지지 않는 방식(adoptedStyleSheets)으로도 한 번 더 붙입니다.
(function () {
  try {
    if (!('adoptedStyleSheets' in document)) return;
    fetch('/allga-tune.css').then(function (r) { return r.text(); }).then(function (css) {
      var sheet = new CSSStyleSheet();
      sheet.replaceSync(css);
      document.adoptedStyleSheets = document.adoptedStyleSheets.concat(sheet);
    }).catch(function () {});
  } catch (e) { /* 스타일을 못 붙여도 화면은 엽니다. */ }
})();

// 푸터의 제작 표기('이미지·영상 Higgsfield 생성 · 서체 Pretendard') 숨김 — A·B 모든 페이지 (2026-11-11 사용자 요청)
// A안 원본 빌드는 고치지 않고, 화면에서 그 줄만 안 보이게 함(React가 다시 그려도 다시 숨김)
(function () {
  try {
    var hide = function () {
      Array.prototype.forEach.call(document.querySelectorAll('footer p'), function (p) {
        if (/Higgsfield|서체 Pretendard/.test(p.textContent) && p.style.display !== 'none') p.style.display = 'none';
      });
    };
    var start = function () {
      hide();
      var mo = new MutationObserver(hide); mo.observe(document.body, { childList: true, subtree: true });
      setTimeout(function () { mo.disconnect(); hide(); }, 8000);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
    window.addEventListener('load', hide);
  } catch (e) {}
})();

// B안(올가 스타일) 옷 입히기 — 주소에 ?skin=b 를 붙이면 켜지고 ?skin=a 로 꺼집니다.
// 켠 뒤에는 다른 페이지로 이동해도 유지됩니다. 기본(A안)에는 아무것도 바뀌지 않습니다.
(function () {
  try {
    var q = new URLSearchParams(location.search).get('skin');
    if (q === 'a' || q === 'b' || q === 'c') localStorage.setItem('allga.skin', q);
    var saved = localStorage.getItem('allga.skin');
    if (saved !== 'b' && saved !== 'c') {
      // A안에서도 오른쪽 아래 버튼으로 B안을 볼 수 있게(2026-11-11). A안에는 allga-b.css가 없으니 스타일을 직접 붙임
      var aBadge = function () {
        if (!document.body || document.querySelector('.allga-skin-badge')) return;
        var b = document.createElement('div');
        b.className = 'allga-skin-badge';
        b.setAttribute('style', 'position:fixed;right:16px;bottom:16px;z-index:9999;display:inline-flex;align-items:center;gap:10px;height:44px;padding:0 8px 0 18px;border-radius:999px;background:#101010;color:#fff;font:700 14px/1 Pretendard,system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.18)');
        b.innerHTML = 'A안 보는 중 <a href="?skin=b" style="display:inline-flex;align-items:center;height:32px;padding:0 14px;border-radius:999px;background:#ec1c24;color:#fff;text-decoration:none">B안</a>';
        document.body.appendChild(b);
      };
      window.addEventListener('load', function () { aBadge(); setTimeout(aBadge, 1500); setTimeout(aBadge, 4000); });
      return;
    }
    // 2026-11-11: 옛 B안 삭제, 옛 C안이 새 B안. ?skin=b 와 ?skin=c 둘 다 새 B안(= data-skin b + data-variant c)
    var isC = true;
    var root = document.documentElement;
    // 새로고침 때 A안이 잠깐 보이던 문제: B/C 스타일 파일이 도착할 때까지 화면을 숨겼다가 도착하면 부드럽게 보여 줌.
    // 스타일을 못 받아도 2.5초 뒤에는 반드시 보이게 함(화면이 멈춰 보이지 않도록)
    var ready = false;
    var hide = document.createElement('style');
    hide.textContent = 'html[data-skin="b"]:not([data-skin-ready]) body{opacity:0!important}html[data-skin-ready] body{transition:opacity .28s ease-out}';
    (document.head || root).appendChild(hide);
    var on = function () {
      if (root.getAttribute('data-skin') !== 'b') root.setAttribute('data-skin', 'b');
      if (isC && root.getAttribute('data-variant') !== 'c') root.setAttribute('data-variant', 'c');
      if (ready && !root.hasAttribute('data-skin-ready')) root.setAttribute('data-skin-ready', '');
    };
    var reveal = function () { if (ready) return; ready = true; on(); };
    // 스타일 파일 + 첫 화면 문구 바꾸기가 둘 다 끝나야 보여 줌(새로고침 때 A안 문구 '국어가 잡히면…'이 잠깐 보이던 문제)
    var cssOk = false, copyOk = false, pageLoaded = false, quietT = 0;
    window.addEventListener('load', function () { pageLoaded = true; });
    var tryReveal = function () { if (cssOk && copyOk) requestAnimationFrame(reveal); };
    on();
    new MutationObserver(on).observe(root, { attributes: true, attributeFilter: ['data-skin', 'data-variant', 'data-skin-ready'] });
    setTimeout(reveal, 3500);
    if ('adoptedStyleSheets' in document) {
      fetch('/allga-b.css?v=172').then(function (r) { return r.text(); }).then(function (css) {
        var sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        document.adoptedStyleSheets = document.adoptedStyleSheets.concat(sheet);
        cssOk = true; tryReveal();
      }).catch(reveal);
    } else reveal();
    // B안 이미지·영상 교체: A안 파일 이름 → 올가 스타일(Higgsfield 생성 영상, 오일파스텔) 파일
    var MAP = [
      [/\/media\/poster-silk[^,\s"]*/, '/media/allga/lens.jpg'],
      [/\/media\/poster-book\.webp/, '/media/allga/lens.jpg'],
      [/\/media\/poster-desk\.webp/, '/media/allga/writing.jpg'],
      [/\/media\/program-elem-vocab-[a-z0-9]+\.webp/, '/media/allga/course-elem.jpg'],
      [/\/media\/program-mid-high-vocab-[a-z0-9]+\.webp/, '/media/allga/course-midhigh.jpg'],
      [/\/media\/program-grammar-[a-z0-9]+\.webp/, '/media/allga/course-grammar.jpg'],
      [/\/media\/program-literacy-[a-z0-9]+\.webp/, '/media/allga/course-literacy.jpg'],
      [/\/media\/program-idiom-[a-z0-9]+\.webp/, '/media/allga/course-idiom.jpg'],
      [/\/media\/program-olga-[a-z0-9]+\.webp/, '/media/allga/academy-oilpastel-back-1007.jpg'],
      [/\/media\/book-map-scrub\.mp4/, '/media/allga/lens.mp4'],
      [/\/media\/desk-loop\.mp4/, '/media/allga/writing.mp4']
    ];
    var swapUrl = function (v) {
      if (!v) return v;
      for (var i = 0; i < MAP.length; i++) if (MAP[i][0].test(v)) return MAP[i][1];
      return v;
    };
    var swapEl = function (el) {
      var tag = el.tagName;
      if (tag === 'IMG' || tag === 'SOURCE') {
        var ss = el.getAttribute('srcset');
        if (ss) { var n = swapUrl(ss.split(',')[0].trim().split(' ')[0]); if (n !== ss.split(',')[0].trim().split(' ')[0]) el.setAttribute('srcset', n); }
        var s = el.getAttribute('src');
        if (s) { var n2 = swapUrl(s); if (n2 !== s) el.setAttribute('src', n2); }
      }
      if (tag === 'VIDEO') {
        var p = el.getAttribute('poster');
        if (p) { var n3 = swapUrl(p); if (n3 !== p) el.setAttribute('poster', n3); }
        var vs = el.getAttribute('src');
        if (vs) { var n4 = swapUrl(vs); if (n4 !== vs) { el.setAttribute('src', n4); try { el.load(); } catch (e) {} } }
        el.querySelectorAll('source').forEach(function (so) {
          var a = so.getAttribute('src'); var n5 = swapUrl(a);
          if (a && n5 !== a) { so.setAttribute('src', n5); try { el.load(); } catch (e) {} }
        });
      }
    };
    var swapAll = function (root) { (root.querySelectorAll ? root : document).querySelectorAll('img, source, video').forEach(swapEl); };
    var startSwap = function () {
      swapAll(document);
      new MutationObserver(function (ms) {
        ms.forEach(function (m) {
          if (m.type === 'attributes') swapEl(m.target);
          else m.addedNodes.forEach(function (nd) { if (nd.nodeType === 1) { if (/^(IMG|SOURCE|VIDEO)$/.test(nd.tagName)) swapEl(nd); swapAll(nd); } });
        });
      }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['src', 'srcset', 'poster'] });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startSwap); else startSwap();

    // B안 문구 교체 (A안 원문은 그대로 두고 B안에서만 바꿔 끼움)
    var COPY = [
      { // 첫 화면 제목
        find: function () { var s = document.querySelector('main > section'); return s && s.querySelector('h1'); },
        // 문구는 그대로. C안에서는 두 줄 사이에 알약 사진이 들어가도록 줄마다 감쌈 (글자 내용은 B안과 같음)
        html: '<span class="b-copy"><span class="c-l1">매일의 20분이,</span><br><span class="c-l2">국어의 힘이 됩니다<span class="b-period">.</span></span></span>',
        mark: '매일의 20분이'
      },
      { // 첫 화면 설명
        find: function () {
          var s = document.querySelector('main > section'); if (!s) return null;
          return Array.prototype.find.call(s.querySelectorAll('p'), function (p) { return /독서와 글쓰기에서|스스로 익히고/.test(p.textContent); });
        },
        html: '어휘, 문법, 문해력, 한자성어까지.<br>스스로 익히고, 다시 풀며 완성합니다.',
        mark: '다시 풀며 완성합니다'
      },
      { // 01 생각: 원장님 교육 철학 + 어휘 문장
        find: function () { return pick('올가교육의 생각', 'p', /어휘는 문장을 열고|진짜 교육/); },
        html: '<span class="b-belief">우리는 스스로 생각하고 표현하는 힘을 기르는 것이 진짜 교육이라고 믿습니다.</span>' +
              '<span class="b-belief-sub">그 힘은 한 단어를 정확히 아는 데서 시작합니다. 어휘는 문장을 열고, 문장은 문단을, 문단은 한 편의 글을 엽니다.</span>',
        mark: '진짜 교육'
      },
      { find: function () { return pick('글이 지도가 되는 순간', 'h2'); },
        html: '그 힘은 한 단어를 정확히 아는 데서 시작합니다.<br>단어에서 문장으로, 문장에서 한 편의 글로.', mark: '그 힘은 한 단어' },
      { find: function () { return pick('다섯 갈래의 학습', 'h2'); },
        html: '어휘에서 문해력까지,<br>국어의 다섯 과정.', mark: '국어의 다섯 과정' },
      { find: function () { return pick('다섯 갈래의 학습', 'p', /무엇부터 시작해도|빠짐없이/); },
        html: '초등 어휘부터 학교 문법, 지문 독해, 한자성어까지. 학교 공부와 시험에 필요한 국어를 빠짐없이 다룹니다.', mark: '빠짐없이' },
      { find: function () { return pick('읽기의 해부', 'h2'); },
        html: '한 편의 글을, 네 단계로 깊이 읽습니다.', mark: '깊이 읽습니다' },
      { find: function () { return pick('학습의 순환', 'h2'); },
        html: '실수는 지나가지 않고,<br>실력으로 남습니다.', mark: '실력으로 남습니다' }, // 2026-11-11 덜 직설적인 문구(사용자 선택 4번)
      { find: function () { return pick('학습의 순환', 'p', /그 자리에서 채점|바로 채점|채점은 바로/); },
        html: '채점은 바로 하고, 같은 실수를 두 번 하지 않도록<br>틀린 문제만 모아 한 번 더 만납니다.', mark: '한 번 더 만납니다' }, // 2026-11-11 사용자 선택
      { find: function () { return pick('하루 20분', 'p', /차 한 잔|매일 쌓인/); },
        html: '어휘 5분, 문법 5분, 문해력 10분. 매일 쌓인 20분이 실력이 됩니다.', mark: '매일 쌓인' },
      { find: function () { return pick('시작하기', 'p', /로그인한 상태라면|처음이라면/); },
        html: '처음이라면 내 학년에 맞는 과정의 Day 1부터. 로그인하면 이어서 학습할 수 있습니다.', mark: '처음이라면' }
    ];
    function pick(label, tag, re) {
      var s = document.querySelector('section[aria-label="' + label + '"]'); if (!s) return null;
      var list = s.querySelectorAll(tag);
      if (!re) return list[0] || null;
      return Array.prototype.find.call(list, function (el) { return re.test(el.textContent); }) || null;
    }

    // B안 푸터: 올가교육 홈페이지 푸터와 같은 구성 (A안 푸터는 B안에서만 숨김)
    var FOOTER_HTML =
      '<div class="b-footer-inner">' +
        '<p class="b-footer-heading">읽는 힘이 자라면,<br><strong>가능성도 자랍니다.</strong></p>' +
        '<div class="b-footer-navs">' +
          '<nav aria-label="올가교육 안내">' +
            '<a href="https://xn--o39a890c.com" target="_blank" rel="noopener">올가의 교육</a>' +
            '<a href="https://xn--o39a890c.com" target="_blank" rel="noopener">교육과정</a>' +
            '<a href="http://xn--o39a890c.kr" target="_blank" rel="noopener">올가 아카데미</a>' +
            '<a href="https://xn--o39a890c.com" target="_blank" rel="noopener">소식·상담</a>' +
          '</nav>' +
          '<nav aria-label="온라인 학습">' +
            '<a href="/programs">학습 프로그램</a>' +
            '<a href="/support/inquiry">문의하기</a>' +
            '<a href="/support/bug">버그신고</a>' +
            '<a href="/support/inquiry/new">빠른 상담 신청</a>' +
          '</nav>' +
        '</div>' +
        '<div class="b-footer-info">' +
          '<p>주식회사 에이아이세종 · 대표 김홍중<br>경기도 화성시 동탄구 동탄순환대로 689 삼성프라자 303호<br>사업자등록번호 306-88-03581 · 통신판매업 신고번호 제2026-화성동탄-3150호<br>개인정보 관리책임자 김홍중 · 대표문의 1577-3498</p>' +
          '<p><a href="https://xn--o39a890c.com/bbs/content.php?co_id=provision" target="_blank" rel="noreferrer">이용약관</a><a href="https://xn--o39a890c.com/bbs/content.php?co_id=privacy" target="_blank" rel="noreferrer">개인정보처리방침</a></p>' +
          '<p>© ALLGA EDUCATION Think. Express. Grow.</p>' +
        '</div>' +
      '</div>' +
      '<div class="b-footer-wordmark" aria-hidden="true"><div class="b-footer-track"><span>THINK&nbsp; EXPRESS&nbsp; GROW&nbsp;</span><span>THINK&nbsp; EXPRESS&nbsp; GROW&nbsp;</span></div></div>';
    var applyFooter = function () {
      var a = document.querySelector('footer:not(.b-footer)');
      if (!a || (a.nextElementSibling && a.nextElementSibling.classList.contains('b-footer'))) return;
      var old = document.querySelector('footer.b-footer'); if (old) old.remove();
      var f = document.createElement('footer');
      f.className = 'b-footer';
      f.innerHTML = FOOTER_HTML;
      a.after(f);
    };
    // 03 다섯 과정: 올가교육 홈페이지 첫 화면 띠(hero-gallery)와 같은 구조로 새로 만들어 A안 03 자리에 넣음 (A안 03은 CSS로 숨김)
    var GALLERY_HTML = (function () {
      var items = [
        ['초등 어휘력 완성', '/media/allga/course-elem.jpg', '/learn/elem-vocab', '매일 다섯 단어를 네 번에 걸쳐 익힙니다.'],
        ['중고등 어휘력 완성', '/media/allga/course-midhigh.jpg', '/learn/mid-high-vocab', '시험에 나오는 어휘를 한자로 이해합니다.'],
        ['모두의 문법', '/media/allga/course-grammar.jpg', '/learn/grammar', '설명, 확인, 적용의 세 단계로 문법을 익힙니다.'],
        ['문해력 등급', '/media/allga/course-literacy.jpg', '/learn/literacy', '한 편의 지문을 아홉 가지 활동으로 읽습니다.'],
        ['한자성어', '/media/allga/course-idiom.jpg', '/learn/idiom', '하루 세 개의 성어를 뜻과 쓰임까지 익힙니다.']
      ];
      var h = '<div class="b-gallery-pin"><div class="b-gallery-stage"><div class="b-gallery-track">' +
        '<div class="b-gallery-col"><div class="b-gallery-slide b-gallery-statement"><span>' + (isC ? '어휘에서<br>문해력까지' : '어휘에서<br>문해력까지,<br>다섯 과정.') + '</span>' +
        '<p>초등 어휘부터 학교 문법, 지문 독해, 한자성어까지.<br>학교 공부와 시험에 필요한 국어를 빠짐없이 다룹니다.</p></div></div>';
      items.forEach(function (it, i) {
        h += '<a class="b-gallery-col" href="' + it[2] + '"><div class="b-gallery-slide ' + (i % 2 ? 'is-right' : 'is-left') + '">' +
             '<div class="b-gallery-window"><img src="' + it[1] + '" alt="">' +
             '<div class="b-gallery-text"><span class="b-gallery-num">0' + (i + 1) + '</span><strong class="b-gallery-caption">' + it[0] + '</strong>' +
             '<p>' + it[3] + '</p><span class="b-gallery-go">들어가기 →</span></div></div></div></a>';
      });
      h += '<a class="b-gallery-col" href="/programs"><div class="b-gallery-slide b-gallery-statement"><span>전체<br>프로그램<br>보기 →</span>' +
           '<p>과정별 학습 단계와 분량을 확인하세요.</p></div></a>';
      h += '</div></div><div class="b-gallery-foot"><span>초등 어휘부터 한자성어까지</span><span aria-hidden="true">SCROLL TO EXPLORE ↓</span></div></div>';
      return h;
    })();
    var applyGallery = function () {
      var a = document.querySelector('section[aria-label="다섯 갈래의 학습"]');
      if (!a || (a.nextElementSibling && a.nextElementSibling.classList.contains('b-gallery'))) return;
      var old = document.querySelector('.b-gallery'); if (old) old.remove();
      var g = document.createElement('section');
      g.className = 'b-gallery';
      g.setAttribute('aria-label', '다섯 과정');
      g.innerHTML = GALLERY_HTML;
      a.after(g);
      sizeGallery();
    };
    var sizeGallery = function () {
      var g = document.querySelector('.b-gallery'); if (!g) return;
      var t = g.querySelector('.b-gallery-track');
      g.style.setProperty('--b-track', t.scrollWidth + 'px');
      moveGallery();
    };
    // C안: 스크롤 값에 바로 붙지 않고 관성으로 따라감(매 프레임 12%) → 부드럽게 미끄러지며 멈춤
    var galS = { x: null, frame: 0 };
    var moveGallery = function () {
      galS.frame = 0;
      var g = document.querySelector('.b-gallery'); if (!g) return;
      var t = g.querySelector('.b-gallery-track');
      if (window.matchMedia && matchMedia('(max-width: 760px)').matches) { t.style.transform = ''; galS.x = null; return; }
      var max = Math.max(0, t.scrollWidth - window.innerWidth);
      var top = g.getBoundingClientRect().top;
      var range = g.offsetHeight - window.innerHeight;
      var p = range > 0 ? Math.min(1, Math.max(0, -top / range)) : 0;
      var x = -max * p;
      if (isC && !reducedMQ.matches) {
        galS.x = galS.x == null ? x : galS.x + (x - galS.x) * 0.12;
        if (Math.abs(x - galS.x) > 0.3) galS.frame = requestAnimationFrame(moveGallery); else galS.x = x;
        x = galS.x;
      }
      t.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
    };
    window.addEventListener('scroll', function () { if (!galS.frame) galS.frame = requestAnimationFrame(moveGallery); }, { passive: true });
    window.addEventListener('resize', sizeGallery);
    // 2026-11-13: 휴대폰(760px 이하)에서는 빨강 띠를 세로 스크롤과 떼어 손가락으로 좌우로 넘기는 가로 띠로 씀(allga-b.css 끝). 세로 스크롤로 옆으로 움직이는 건 PC만.
    // 첫 화면 빨강 동그라미: 스크롤하면 커져서 화면 전체를 덮음
    var applyHeroCircle = function () {
      var st = document.querySelector('main > section:first-of-type > div.sticky');
      if (!st || st.querySelector('.b-hero-circle')) return;
      var d = document.createElement('div'); d.className = 'b-hero-circle'; d.setAttribute('aria-hidden', 'true');
      st.insertBefore(d, st.firstChild);
      moveHero();
    };
    var moveHero = function () {
      var sec = document.querySelector('main > section:first-of-type');
      var c = sec && sec.querySelector('.b-hero-circle'); if (!c) return;
      var range = Math.max(1, sec.offsetHeight - window.innerHeight);
      var p = Math.min(1, Math.max(0, -sec.getBoundingClientRect().top / range));
      var r = c.offsetWidth / 2;
      var box = c.getBoundingClientRect(), cx = box.left + box.width / 2, cy = box.top + box.height / 2;
      var cur = parseFloat(getComputedStyle(c).getPropertyValue('--b-hero-scale')) || 1;
      cx = (box.left + box.right) / 2; cy = (box.top + box.bottom) / 2;
      var far = Math.max(Math.hypot(cx, cy), Math.hypot(cx - window.innerWidth, cy), Math.hypot(cx, cy - window.innerHeight), Math.hypot(cx - window.innerWidth, cy - window.innerHeight));
      var maxScale = far / r + 0.05;
      var e = p * p * (3 - 2 * p);
      sec.style.setProperty('--b-hero-text', String(Math.max(0, 1 - p * 2.2)));
      c.style.setProperty('--b-hero-scale', String(1 + (maxScale - 1) * e));
    };
    window.addEventListener('scroll', moveHero, { passive: true });
    window.addEventListener('resize', moveHero);
    // 스크롤 라인: 가는 선(#171717 1.5px)이 스크롤만큼 그려지고 선 끝 빨간 점이 함께 내려옴 (B안만)
    // - 선은 main 안 맨 아래층: 흰 영역에서는 보이고, 빨강·검정 패널 뒤로는 지나감(내용을 가리지 않음)
    // - PC는 왼쪽 여백에서 섹션 경계마다 살짝 휘는 길, 모바일은 왼쪽 여백 세로선
    // - 첫 화면에서는 점이 깜빡이며 대기, '동작 줄이기' 설정이면 선 전체 표시·점 숨김
    var NS = 'http://www.w3.org/2000/svg';
    // '어'의 ㅇ 위치·크기 (Pretendard 굵은 글씨 실측: 글자 상자 기준 가로 32.8%, 세로 43.7%, 지름 0.62em)
    var trail = { total: 0, samples: [], frame: 0, h: 0, w: 0 };
    var reducedMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
    // 선 전체를 '가상 좌표' 한 줄로 설계함: 원장님 문장 장면(화면 고정)을 화면 한 장 높이로 접어서 앞·장면·뒤를 이어 붙인 좌표
    //   같은 길을 세 곳에 그리고 잘라서 보여 줌 → 문서 앞부분(첫 화면) / 고정된 장면 안 / 문서 뒷부분(03 띠)
    //   그래서 장면 경계를 지나는 곡선도 끊기지 않고 하나로 이어짐
    var applyTrail = function () {
      if (isC) return; // C안은 스크롤 선을 쓰지 않음(대신 '점 → 선' 이야기). 숨긴 채로 돌며 오류를 내던 것 막음
      var main = document.querySelector('main'); if (!main) return;
      if (main.querySelector(':scope > .b-trail')) { ensureStage(); return; }
      var mk = function (cls) { var e = document.createElementNS(NS, 'svg'); e.setAttribute('class', cls); e.setAttribute('aria-hidden', 'true'); e.setAttribute('focusable', 'false'); return e; };
      var mkClip = function (svg, id) {
        var defs = svg.querySelector('defs') || svg.appendChild(document.createElementNS(NS, 'defs'));
        var c = document.createElementNS(NS, 'clipPath'); c.setAttribute('id', id); c.setAttribute('clipPathUnits', 'userSpaceOnUse');
        var r = document.createElementNS(NS, 'rect'); c.appendChild(r); defs.appendChild(c); return r;
      };
      var mkSeg = function (svg, cls, clipId) {
        var g = document.createElementNS(NS, 'g'); if (clipId) g.setAttribute('clip-path', 'url(#' + clipId + ')');
        var p = document.createElementNS(NS, 'path'); p.setAttribute('class', 'b-trail-line ' + cls); g.appendChild(p); svg.appendChild(g); return p;
      };
      var line = mk('b-trail');
      mkClip(line, 'b-clip-a'); mkClip(line, 'b-clip-b');
      mkSeg(line, 'b-trail-a', 'b-clip-a'); mkSeg(line, 'b-trail-b', 'b-clip-b');
      var top = mk('b-trail b-trail-top');
      mkClip(top, 'b-clip-hero');
      mkSeg(top, 'b-trail-light', 'b-clip-hero');
      var CIRCLE = 'M0,-1 A1,1 0 1,1 0,1 A1,1 0 1,1 0,-1Z';
      var g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'b-trail-dot');
      var spin = document.createElementNS(NS, 'g'); spin.setAttribute('class', 'b-trail-spin');
      ['b-trail-pulse', 'b-trail-star'].forEach(function (c) { var p = document.createElementNS(NS, 'path'); p.setAttribute('class', c); p.setAttribute('d', CIRCLE); p.setAttribute('vector-effect', 'non-scaling-stroke'); spin.appendChild(p); });
      g.appendChild(spin); top.appendChild(g);
      main.appendChild(line); main.appendChild(top);
      ensureStage();
      buildTrail();
    };
    var ensureStage = function () {
      var st = document.querySelector('section[aria-label="글이 지도가 되는 순간"] > div.sticky');
      if (!st || st.querySelector(':scope > .b-trail-stage')) return;
      var sv = document.createElementNS(NS, 'svg'); sv.setAttribute('class', 'b-trail-stage'); sv.setAttribute('aria-hidden', 'true');
      var g = document.createElementNS(NS, 'g');
      var sp = document.createElementNS(NS, 'path'); sp.setAttribute('class', 'b-trail-line b-trail-s'); g.appendChild(sp); sv.appendChild(g);
      st.insertBefore(sv, st.firstChild);
      trail.h = -1;
    };
    // 글자 하나(마침표)를 실제 글꼴로 그려서 잉크 위치·크기를 잼
    var measureGlyph = function (el) {
      var cs = getComputedStyle(el), fs = parseFloat(cs.fontSize);
      var W = Math.ceil(fs * 1.2), H = Math.ceil(fs * 1.8), ox = Math.round(fs * 0.2), base = Math.round(fs * 1.3);
      var c = document.createElement('canvas'); c.width = W; c.height = H;
      var x = c.getContext('2d'); x.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily; x.fillText(el.textContent, ox, base);
      var m = x.measureText(el.textContent), asc = m.fontBoundingBoxAscent || fs * 0.95;
      var d = x.getImageData(0, 0, W, H).data, minx = W, maxx = -1, miny = H, maxy = -1;
      for (var py = 0; py < H; py++) for (var px = 0; px < W; px++) if (d[(py * W + px) * 4 + 3] > 120) { if (px < minx) minx = px; if (px > maxx) maxx = px; if (py < miny) miny = py; if (py > maxy) maxy = py; }
      if (maxx < 0) return { cx: el.offsetWidth / 2, cy: el.offsetHeight * 0.75, r: fs * 0.07 };
      var lh = el.getBoundingClientRect().height, content = asc + (m.fontBoundingBoxDescent || fs * 0.25);
      var baselineInBox = (lh - content) / 2 + asc;
      return { cx: (minx + maxx) / 2 - ox, cy: baselineInBox + (miny + maxy) / 2 - base, r: Math.max(maxx - minx, maxy - miny) / 2 * 1.12 + 0.5 };
    };
    // 첫 화면은 화면 고정(sticky)이라 스크롤하면 마침표의 문서 위치가 계속 바뀜 → 고정이 풀린 상태(스크롤 0) 기준 위치로 잼
    var stuckY = function (el, r) {
      var st = el.closest('.sticky'), sec = st && st.parentElement; if (!st || !sec) return r.top;
      return r.top - st.getBoundingClientRect().top + sec.getBoundingClientRect().top + (st.offsetTop || 0);
    };
    var docY = function (el, main) { return el.getBoundingClientRect().top - main.getBoundingClientRect().top; };
    // 글줄마다 왼쪽·오른쪽·아래 위치 (stage 기준)
    var linesOf = function (el, root) {
      var r0 = root.getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(el); var m = {};
      Array.prototype.forEach.call(rg.getClientRects(), function (x) {
        if (x.width < 1) return;
        var kk = Math.round(x.top - r0.top), o = m[kk] || (m[kk] = { l: 1e9, r: -1e9, t: kk, b: 0 });
        o.l = Math.min(o.l, x.left - r0.left); o.r = Math.max(o.r, x.right - r0.left); o.b = Math.max(o.b, x.bottom - r0.top);
      });
      return Object.keys(m).map(function (kk) { return m[kk]; }).sort(function (a, b) { return a.t - b.t; });
    };
    // 알약 곡선: 가로·세로로만 이어진 점들을, 꺾이는 곳마다 가능한 가장 큰 원호로 연결
    //   안쪽 모서리는 양쪽 선분의 절반까지, 처음·끝 선분은 전체 길이까지 반지름을 씀
    //   → 두 가로선 사이를 잇는 세로선이 짧으면 두 원호가 맞붙어 반원(알약 끝)이 됨
    var pillPath = function (pts) {
      var f = function (n) { return n.toFixed(1); }, n = pts.length;
      var d = 'M' + f(pts[0].x) + ',' + f(pts[0].y);
      for (var i = 1; i < n - 1; i++) {
        var a = pts[i - 1], p = pts[i], b = pts[i + 1];
        var la = Math.hypot(p.x - a.x, p.y - a.y), lb = Math.hypot(b.x - p.x, b.y - p.y);
        if (la < 0.5 || lb < 0.5) continue;
        var ax = (p.x - a.x) / la, ay = (p.y - a.y) / la, bx = (b.x - p.x) / lb, by = (b.y - p.y) / lb;
        var r = Math.min(i - 1 === 0 ? la : la / 2, i + 1 === n - 1 ? lb : lb / 2), sweep = (ax * by - ay * bx) > 0 ? 1 : 0;
        d += ' L' + f(p.x - ax * r) + ',' + f(p.y - ay * r) + ' A' + f(r) + ',' + f(r) + ' 0 0 ' + sweep + ' ' + f(p.x + bx * r) + ',' + f(p.y + by * r);
      }
      var z = pts[n - 1]; return d + ' L' + f(z.x) + ',' + f(z.y);
    };
    var clamp01 = function (n) { return Math.min(1, Math.max(0, n)); };
    var easeOutCubic = function (t) { return 1 - Math.pow(1 - t, 3); };
    var easeInOut = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
    var setClip = function (svg, id, x, y, w, h) { var r = svg.querySelector('#' + id + ' rect'); r.setAttribute('x', x); r.setAttribute('y', y); r.setAttribute('width', w); r.setAttribute('height', Math.max(0, h)); };
    var buildTrail = function () {
      var main = document.querySelector('main'); if (!main) return;
      var line = main.querySelector(':scope > .b-trail:not(.b-trail-top)'), top = main.querySelector(':scope > .b-trail-top');
      if (!line || !top) return;
      var pA = line.querySelector('.b-trail-a'), pB = line.querySelector('.b-trail-b'), light = top.querySelector('.b-trail-light');
      var W = main.clientWidth, H = main.scrollHeight, vh = window.innerHeight, mr = main.getBoundingClientRect();
      trail.w = W; trail.h = H;
      line.setAttribute('viewBox', '0 0 ' + W + ' ' + H); top.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      line.style.height = top.style.height = H + 'px';
      var mobile = W < 1024;
      var ref = document.querySelector('section[aria-label="읽기의 해부"] .shell'), contentLeft = 24;
      if (ref) contentLeft = ref.getBoundingClientRect().left - mr.left + parseFloat(getComputedStyle(ref).paddingLeft || 0);
      var X = W < 768 ? Math.max(8, Math.min(12, contentLeft / 2)) : Math.round(contentLeft / 2);
      var hero = main.querySelector(':scope > section');
      var heroEnd = hero ? docY(hero, main) + hero.offsetHeight : vh;
      // 시작점: 첫 화면 제목 끝 마침표
      var dotEl = hero && hero.querySelector('.b-period'), start;
      if (dotEl && dotEl.offsetWidth) {
        var zr = dotEl.getBoundingClientRect(), gm = measureGlyph(dotEl);
        start = { x: zr.left - mr.left + gm.cx, y: stuckY(dotEl, zr) - mr.top + gm.cy }; trail.Ridle = gm.r; trail.gOff = { x: gm.cx, y: gm.cy };
      } else { start = { x: W / 2, y: heroEnd - 64 }; trail.Ridle = 0; trail.gOff = null; }
      trail.start = start;
      // 끝점: 03 띠 첫 칸(빨강 문구 칸) 가운데
      var gal = main.querySelector('.b-gallery'), stmt = gal && gal.querySelector('.b-gallery-statement'), pin = gal && gal.querySelector('.b-gallery-pin');
      var drop = null;
      if (stmt && pin) {
        var so = stmt.getBoundingClientRect(), po = pin.getBoundingClientRect();
        var trk = gal.querySelector('.b-gallery-track'), tr0 = trk.getBoundingClientRect();
        // 띠가 가로로 움직이기 전(처음 위치) 기준: 칸의 띠 안 위치 + 띠 시작 위치(고정 영역 왼쪽)
        drop = { x: (so.left - tr0.left) + (po.left - mr.left) + so.width / 2, y: docY(gal, main) + (so.top - po.top) + so.height / 2, el: stmt };
      }
      trail.drop = drop;
      // 장면
      var sec = main.querySelector('section[aria-label="글이 지도가 되는 순간"]');
      var stage = sec && sec.querySelector(':scope > div.sticky'), sv = stage && stage.querySelector(':scope > .b-trail-stage');
      var head = sec && sec.querySelector('.b-merge-head'), lis = sec ? Array.prototype.slice.call(sec.querySelectorAll('li')) : [];
      trail.scene = null;
      var P, mTop = 0, mH = 0, shh = vh, fold = 0;
      if (!mobile && sec && stage && sv && head && lis.length && sec.offsetHeight && drop) {
        mTop = docY(sec, main); mH = sec.offsetHeight; shh = stage.clientHeight; fold = mH - shh;
        var sl = stage.getBoundingClientRect().left - mr.left;
        var HL = linesOf(head, stage).map(function (o) { return { l: o.l + sl, r: o.r + sl, b: o.b + mTop }; });
        var h2 = sec.querySelector('h2'), H2 = h2 ? linesOf(h2, stage) : [];
        var h2R = H2.length ? Math.max.apply(null, H2.map(function (o) { return o.r; })) + sl : HL[HL.length - 1].r;
        var h2B = H2.length ? H2[H2.length - 1].b + mTop : HL[HL.length - 1].b + 60;
        var LI = lis.map(function (li) {
          var ls = linesOf(li, stage); var l = 1e9, r = -1e9, b = 0;
          ls.forEach(function (o) { l = Math.min(l, o.l); r = Math.max(r, o.r); b = Math.max(b, o.b); });
          return { l: l + sl, r: r + sl, b: b + mTop, t: (ls[0] ? ls[0].t : 0) + mTop };
        });
        // 가상 좌표의 점들 (가로 밑줄 + 반원으로 꺾임)
        var minL = Math.min.apply(null, HL.map(function (o) { return o.l; })), maxR = Math.max.apply(null, HL.map(function (o) { return o.r; }));
        var U = HL.map(function (o) { return o.b + 1; });
        var rH = HL.length > 1 ? (U[1] - U[0]) / 2 : 40;
        var leftC = minL - 6 - rH, rightC = maxR + 6 + rH;
        // 첫 화면 → 1줄: 왼쪽 큰 반원 (화면 왼쪽 끝 12px 안쪽까지)
        var bigL = 12, bigR = (minL - 6) - bigL;
        var yh = U[0] - bigR * 2;
        P = [start, { x: start.x, y: yh }, { x: bigL, y: yh }, { x: bigL, y: U[0] }];
        HL.forEach(function (o, i) {
          var ltr = i % 2 === 0, endX = ltr ? rightC : leftC;
          P.push({ x: endX, y: U[i] });
          if (i < HL.length - 1) P.push({ x: endX, y: U[i + 1] });
        });
        // 마지막 제목 줄 → 가운데 문장 아래(문장·목록 사이)로 반원 → 목록 1줄 밑줄 쪽으로 반원
        var lastLTR = (HL.length - 1) % 2 === 0;
        var yG = (h2B + LI[0].t) / 2;
        var LU = LI.map(function (o) { return o.b + 1; });
        var listL = Math.min.apply(null, LI.map(function (o) { return o.l; })), listR = Math.max.apply(null, LI.map(function (o) { return o.r; }));
        var rLst = LI.length > 1 ? (LU[1] - LU[0]) / 2 : 24;
        if (lastLTR) {
          var cx = Math.max(rightC, h2R + 6 + (yG - U[U.length - 1]) / 2);
          P[P.length - 1] = { x: cx, y: U[U.length - 1] };
          P.push({ x: cx, y: yG });
          var lx = listL - 6 - (LU[0] - yG) / 2;
          P.push({ x: lx, y: yG }); P.push({ x: lx, y: LU[0] });
        } else {
          var lx2 = Math.min(leftC, listL - 6 - (LU[0] - U[U.length - 1]) / 2);
          P[P.length - 1] = { x: lx2, y: U[U.length - 1] }; P.push({ x: lx2, y: LU[0] });
        }
        // 목록 01·02·03 밑줄 지그재그
        var marks = [];
        LI.forEach(function (o, i) {
          var ltr = i % 2 === 0, endX = ltr ? listR + 6 + rLst : listL - 6 - rLst;
          marks.push({ y: LU[i], x0: ltr ? listL : listR, x1: ltr ? listR : listL });
          P.push({ x: endX, y: LU[i] });
          if (i < LI.length - 1) P.push({ x: endX, y: LU[i + 1] });
        });
        // 목록 끝 → 오른쪽으로 크게 휘어 내려가 → 03 띠 첫 칸 가운데로 들어감 (뒤쪽은 접힌 높이만큼 뺀 가상 좌표)
        var lastX = P[P.length - 1].x, dropV = drop.y - fold;
        var vx = Math.max(lastX + 120, W * 0.5);
        P[P.length - 1] = { x: vx, y: LU[LU.length - 1] };
        P.push({ x: vx, y: dropV }); P.push({ x: drop.x, y: dropV });
        // 제목 단어를 줄별로 묶음 (밑줄이 그 줄을 지나가면 회색 → 검정으로 채움, C안)
        var words = Array.prototype.slice.call(head.querySelectorAll('.b-w')), tops = [];
        words.forEach(function (wd) { var t = Math.round(wd.getBoundingClientRect().top); if (tops.indexOf(t) < 0) tops.push(t); });
        tops.sort(function (a, b) { return a - b; });
        var hmarks = HL.map(function (o, i) { var ltr = i % 2 === 0; return { y: U[i], x0: ltr ? o.l : o.r, x1: ltr ? o.r : o.l }; });
        trail.scene = { top: mTop, h: mH, sh: shh, fold: fold, stage: stage, lis: lis, marks: marks, sl: sl,
          words: words.map(function (wd) { return { el: wd, line: tops.indexOf(Math.round(wd.getBoundingClientRect().top)) }; }), hmarks: hmarks };
      } else {
        // 모바일: 마침표 → 반원으로 왼쪽 여백 → 여백을 따라 내려가 → 큰 곡선으로 빨강 문구 칸
        var yh2 = heroEnd - vh * 0.1;
        P = [start, { x: start.x, y: yh2 }, { x: X, y: yh2 }];
        if (drop) { var gy = drop.y - Math.min(260, (drop.y - yh2) * 0.3); P.push({ x: X, y: gy }); P.push({ x: drop.x, y: gy }); P.push({ x: drop.x, y: drop.y }); }
        else P.push({ x: X, y: H - 40 });
      }
      var d = pillPath(P);
      [pA, pB, light].forEach(function (p) { p.setAttribute('d', d); });
      var L = pA.getTotalLength(); trail.L = L;
      // 가상 좌표 길이 표: 장면 시작·끝을 지나는 길이 (끝점에 닿는 길이 = 전체)
      var samples = []; for (var si = 0; si <= 1200; si++) { var ll = L * si / 1200, pp = pA.getPointAtLength(ll); samples.push({ l: ll, x: pp.x, y: pp.y }); }
      trail.samples = samples;
      var firstAt = function (yy) { for (var t = 0; t < samples.length; t++) if (samples[t].y >= yy) return samples[t].l; return L; };
      if (trail.scene) {
        var sc = trail.scene;
        sc.lA = firstAt(sc.top); sc.lS = firstAt(sc.top + sc.sh);
        // 목록 줄마다: 밑줄 가운데를 지나는 길이에서 켜짐
        var markAt = function (mk) {
          var mx = mk.x0 + (mk.x1 - mk.x0) * 0.15;
          for (var t = 0; t < samples.length; t++) { var s = samples[t]; if (Math.abs(s.y - mk.y) < 1.5 && ((mk.x1 > mk.x0 && s.x >= mx) || (mk.x1 < mk.x0 && s.x <= mx))) return s.l; }
          return L;
        };
        sc.hlit = sc.hmarks.map(markAt);
        sc.lit = sc.marks.map(function (mk) {
          var mx = (mk.x0 + mk.x1) / 2;
          for (var t = 0; t < samples.length; t++) { var s = samples[t]; if (Math.abs(s.y - mk.y) < 1.5 && ((mk.x1 > mk.x0 && s.x >= mx) || (mk.x1 < mk.x0 && s.x <= mx))) return s.l; }
          return L;
        });
        // 세 곳에 나눠 보여 줌: 문서 앞(장면 위) / 장면 안(가상 y를 장면 기준으로 옮김) / 문서 뒤(접힌 높이만큼 아래로)
        setClip(line, 'b-clip-a', 0, 0, W, sc.top);
        setClip(line, 'b-clip-b', 0, sc.top + sc.h, W, H);
        pB.setAttribute('transform', 'translate(0,' + sc.fold.toFixed(1) + ')');
        var sp = sv.querySelector('path'); sp.setAttribute('d', d); sp.setAttribute('transform', 'translate(' + (-sc.sl).toFixed(1) + ',' + (-sc.top).toFixed(1) + ')');
        sv.setAttribute('viewBox', '0 0 ' + stage.clientWidth + ' ' + sc.sh);
        sc.path = sp;
        sp.style.strokeDasharray = L + ' ' + L;
      } else {
        setClip(line, 'b-clip-a', 0, 0, W, H); setClip(line, 'b-clip-b', 0, 0, 0, 0);
        pB.removeAttribute('transform');
      }
      if (hero) setClip(top, 'b-clip-hero', 0, docY(hero, main), W, hero.offsetHeight);
      pA.style.strokeDasharray = pB.style.strokeDasharray = light.style.strokeDasharray = L + ' ' + L;
      main.classList.toggle('b-scene-on', !!trail.scene);
      trail.LA = L;
      trail.cy = null;
      updateTrail();
    };
    var updateTrail = function () {
      trail.frame = 0;
      var main = document.querySelector('main'); if (!main || !trail.L) return;
      var line = main.querySelector(':scope > .b-trail:not(.b-trail-top)'), top = main.querySelector(':scope > .b-trail-top');
      if (!line || !top) return;
      if (Math.abs(main.scrollHeight - trail.h) > 4 || Math.abs(main.clientWidth - trail.w) > 2) { buildTrail(); return; }
      var reduced = reducedMQ.matches, vh = window.innerHeight, mr = main.getBoundingClientRect(), sy = -mr.top;
      // 마침표의 지금 위치가 처음 잰 위치와 다르면 다시 그림 → 점이 항상 마침표에 정확히 들어감
      var pe = trail.gOff && main.querySelector(':scope > section .b-period');
      if (pe && sy < 4) {
        var pr = pe.getBoundingClientRect(), lx = pr.left - mr.left + trail.gOff.x, ly = stuckY(pe, pr) - mr.top + trail.gOff.y;
        if (Math.abs(lx - trail.start.x) > 1.5 || Math.abs(ly - trail.start.y) > 1.5) { buildTrail(); return; }
      }
      var pA = line.querySelector('.b-trail-a'), pB = line.querySelector('.b-trail-b'), light = top.querySelector('.b-trail-light');
      var dot = top.querySelector('.b-trail-dot'), spin = top.querySelector('.b-trail-spin');
      // 목표: 점이 있어야 할 문서 높이 (첫 화면에서는 마침표 높이에서 화면 62%로 서서히)
      var s0 = trail.start.y, anchor = s0 + (vh * 0.62 - s0) * easeInOut(clamp01(sy / (vh * 0.9)));
      var tY = sy + anchor, tK = clamp01(sy / (vh * 0.4));
      if (reduced) { tY = 1e9; tK = 1; }
      if (trail.cy == null || Math.abs(tY - trail.cy) > vh * 1.5) { trail.cy = tY; trail.ck = tK; }
      var f = reduced ? 1 : 0.14;
      trail.cy += (tY - trail.cy) * f; trail.ck += (tK - trail.ck) * f;
      var Y = trail.cy, ck = trail.ck, sc = trail.scene, L = trail.L, dr = trail.drop;
      // 스크롤 → 길이: 앞(마침표~장면 입구) / 장면(고정된 동안) / 뒤(장면 출구~빨강 칸)를 각각 일정한 속도로
      var l;
      if (sc) {
        var endY = dr ? dr.y : sc.top + sc.h + vh;
        if (Y < sc.top) l = sc.lA * clamp01((Y - trail.start.y) / Math.max(1, sc.top - trail.start.y));
        else if (Y < sc.top + sc.h) l = sc.lA + (sc.lS - sc.lA) * clamp01((Y - sc.top) / sc.h);
        else l = sc.lS + (L - sc.lS) * clamp01((Y - sc.top - sc.h) / Math.max(1, endY - sc.top - sc.h));
      } else {
        l = L * clamp01((Y - trail.start.y) / Math.max(1, (dr ? dr.y : trail.h) - trail.start.y));
      }
      if (reduced) l = L;
      var off = String(L - l);
      pA.style.strokeDashoffset = pB.style.strokeDashoffset = light.style.strokeDashoffset = off;
      if (sc) sc.path.style.strokeDashoffset = off;
      // 점 위치: 가상 좌표 → 실제 화면 (장면 구간은 고정된 장면 기준, 뒤 구간은 접힌 높이만큼 아래)
      var vp = pA.getPointAtLength(l), pt;
      if (sc && vp.y >= sc.top && vp.y <= sc.top + sc.sh + 0.5) {
        var str = sc.stage.getBoundingClientRect();
        pt = { x: vp.x, y: str.top - mr.top + (vp.y - sc.top) };
      } else if (sc && vp.y > sc.top + sc.sh) pt = { x: vp.x, y: vp.y + sc.fold };
      else pt = { x: vp.x, y: vp.y };
      if (sc) sc.lis.forEach(function (li, i) { li.classList.toggle('b-lit', l >= sc.lit[i]); });
      if (!isC && sc && sc.words) sc.words.forEach(function (w) { w.el.classList.toggle('b-ink', w.line >= 0 && l >= (sc.hlit[w.line] || L)); });
      // 끝: 빨강 칸에 떨어져 퍼짐, 그동안 선과 점은 사라짐
      var spread = 0;
      if (dr) {
        var endAt = dr.y;
        spread = reduced ? 1 : clamp01((Y - endAt) / (vh * 0.35));
        if (Y >= endAt || reduced) { var rr2 = dr.el.getBoundingClientRect(); pt = { x: rr2.left - mr.left + rr2.width / 2, y: rr2.top - mr.top + rr2.height / 2 }; }
        dr.el.style.setProperty('--b-spread', easeOutCubic(spread).toFixed(4));
      }
      var Rm = trail.w < 768 ? 6 : 12, Ri = trail.Ridle || Rm;
      var R = (Ri + (Rm - Ri) * easeOutCubic(ck)) * (1 + easeOutCubic(spread) * 5);
      dot.setAttribute('transform', 'translate(' + pt.x.toFixed(2) + ',' + pt.y.toFixed(2) + ')');
      spin.setAttribute('transform', 'scale(' + R.toFixed(3) + ')');
      dot.style.opacity = String(clamp01(1 - spread * 2.5));
      var lineOp = String(clamp01(1 - spread * 1.6));
      line.style.opacity = lineOp; light.style.opacity = lineOp; if (sc) sc.path.style.opacity = lineOp;
      top.classList.toggle('is-letter', ck < 0.02);
      top.classList.toggle('is-idle', !reduced && ck < 0.02);
      if (!reduced && (Math.abs(tY - Y) > 0.3 || Math.abs(tK - ck) > 0.001)) trail.frame = requestAnimationFrame(updateTrail);
    };
    var onTrailScroll = function () { if (!trail.frame) trail.frame = requestAnimationFrame(updateTrail); };
    window.addEventListener('scroll', onTrailScroll, { passive: true });
    window.addEventListener('resize', function () { buildTrail(); });
    window.addEventListener('load', function () { buildTrail(); });
    if (reducedMQ.addEventListener) reducedMQ.addEventListener('change', updateTrail);
    // 상단 메뉴(GNB): 펼침 메뉴를 해당 메뉴 바로 아래에 이름만 세로로 (그림·설명·화살표 아이콘 없음)
    var placeDropdown = function () {
      var h = document.querySelector('header'); if (!h) return;
      var panel = h.querySelector(':scope > div.anim-fade'); if (!panel) return;
      var title = panel.querySelector('p'); if (!title) return;
      var name = title.textContent.trim();
      var link = Array.prototype.find.call(h.querySelectorAll('nav a'), function (a) { return a.textContent.trim() === name; });
      if (!link) return;
      var hr = h.getBoundingClientRect(), lr = link.getBoundingClientRect();
      panel.style.left = (lr.left - hr.left) + 'px';
      panel.classList.add('b-dd');
    };
    var startDropdown = function () {
      var h = document.querySelector('header'); if (!h || h.__bdd) return; h.__bdd = true;
      new MutationObserver(placeDropdown).observe(h, { childList: true, subtree: false });
      placeDropdown();
    };
    // 04 읽기의 해부: 오른쪽 글을 한 단계씩 고정해서 보여 주고, 아래에 01·02·03·04 단계 막대 (PC)
    var steps = { idx: -1, frame: 0 };
    var applySteps = function () {
      var sec = document.querySelector('section[aria-label="읽기의 해부"]'); if (!sec) return;
      var ol = sec.querySelector('ol'); if (!ol || ol.querySelector('.b-steps')) return;
      var lis = Array.prototype.slice.call(ol.querySelectorAll(':scope > li')); if (!lis.length) return;
      var box = document.createElement('div'); box.className = 'b-steps';
      var inner = '<div class="b-steps-inner"><div class="b-steps-body" aria-hidden="true"><p class="b-steps-label"></p><p class="b-steps-title"></p><p class="b-steps-desc"></p></div><div class="b-steps-bar">';
      lis.forEach(function (li, i) {
        var name = (li.querySelector('h3') || {}).textContent || '';
        inner += '<button type="button" data-i="' + i + '" aria-label="' + (i + 1) + '단계 ' + name + '로 이동"><i></i><span>0' + (i + 1) + '</span><em>' + name + '</em></button>';
      });
      box.innerHTML = inner + '</div></div>';
      // 상자를 목록 높이 전체의 레일 안에 넣음 → 상자가 실제 높이를 갖고 마지막 그림과 함께 위로 빠짐 (B·C 공통)
      var rail = document.createElement('div'); rail.className = 'c-steps-rail'; rail.appendChild(box); ol.insertBefore(rail, ol.firstChild);
      box.querySelector('.b-steps-bar').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        var li = lis[+b.getAttribute('data-i')]; var r = li.getBoundingClientRect();
        window.scrollTo({ top: window.scrollY + r.top + r.height / 2 - window.innerHeight / 2, behavior: reducedMQ.matches ? 'auto' : 'smooth' });
      });
      steps.idx = -1; updateSteps();
    };
    var updateSteps = function () {
      steps.frame = 0;
      var sec = document.querySelector('section[aria-label="읽기의 해부"]'); if (!sec) return;
      var box = sec.querySelector('.b-steps'); if (!box) return;
      var lis = Array.prototype.slice.call(sec.querySelectorAll('ol > li'));
      var panel = sec.querySelector('.aspect-square'); if (panel) box.style.setProperty('--b-panel-h', panel.offsetHeight + 'px');
      // 지금 단계: 화면 가운데를 지나는 단계
      var mid = window.innerHeight / 2, idx = 0;
      lis.forEach(function (li, i) { if (li.getBoundingClientRect().top < mid) idx = i; });
      if (idx === steps.idx) return;
      var first = steps.idx < 0; steps.idx = idx;
      var li = lis[idx], body = box.querySelector('.b-steps-body');
      var fill = function () {
        body.querySelector('.b-steps-label').textContent = '0' + (idx + 1) + ' / 0' + lis.length;
        body.querySelector('.b-steps-title').textContent = (li.querySelector('h3') || {}).textContent || '';
        body.querySelector('.b-steps-desc').textContent = (li.querySelector('p') || {}).textContent || '';
        body.classList.remove('is-out');
      };
      Array.prototype.forEach.call(box.querySelectorAll('.b-steps-bar button'), function (b, i) { b.classList.toggle('is-on', i === idx); b.classList.toggle('is-done', i < idx); b.setAttribute('aria-current', i === idx ? 'step' : 'false'); });
      if (first || reducedMQ.matches) { fill(); return; }
      body.classList.add('is-out');
      setTimeout(fill, 220);
    };
    window.addEventListener('scroll', function () { if (!steps.frame) steps.frame = requestAnimationFrame(updateSteps); }, { passive: true });
    // C안 첫 화면 도형: 원·알약·반알약·고리·점무늬가 한데 모였다가 흩어지기를 반복 (빨강·검정 두 색, 은은한 그라데이션)
    var applyShapes = function () {
      if (!isC) return;
      var st = document.querySelector('main > section:first-of-type > div.sticky');
      if (!st || st.querySelector(':scope > .c-shapes')) return;
      var w = document.createElement('div'); w.className = 'c-shapes'; w.setAttribute('aria-hidden', 'true');
      w.innerHTML = '<i class="c-s c-big"></i><i class="c-s c-pill"></i><i class="c-s c-half"></i><i class="c-s c-small"></i><i class="c-s c-ring"></i>';
      st.insertBefore(w, st.firstChild);
      // union-tec 방식: 화면 양 끝에서 잘리는 거대한 '올가국어' 글자(국어 사이트라 영문 대신 한글) + 그 위를 가로지르는 가로 알약 사진 창
      var word = document.createElement('div'); word.className = 'c-word'; word.setAttribute('aria-hidden', 'true'); word.textContent = '올가국어';
      var photo = document.createElement('div'); photo.className = 'c-photo'; photo.setAttribute('aria-hidden', 'true');
      // 첫 화면 알약 창 = 올가 홈페이지 하단(ClosingStory) 영상 closing-book-coffee-1008을 가져와 흑백으로 (2026-11-11)
      photo.innerHTML = '<video src="/media/allga/closing-book.mp4" poster="/media/allga/closing-book.jpg" autoplay muted loop playsinline preload="auto"></video>';
      st.insertBefore(word, w);
      // 사진은 제목과 같은 상자 안에 넣음 → 스크롤하면 제목과 함께 올라가며 흐려짐(사진이 제목을 덮지 않음)
      // 사진(영상)은 고정 화면에 직접 둠 → 스크롤하면 화면 가득 커지며 밝아짐(updateHeroGrow). 제목은 움직이지 않고 사라지기만 함
      st.insertBefore(photo, w.nextSibling);
      updateHeroGrow();
    };
    // 07 하루 20분: 스크롤하면 바깥에서부터 검정이 조여 들어와 가운데 타원 창만 남고, 그 안에 어휘·문법·문해력 알약 3개가 차례로 올라옴
    var vig = { frame: 0 };
    var applyVignette = function () {
      var sec = document.querySelector('section[aria-label="하루 20분"]'); if (!sec) return;
      var st = sec.querySelector(':scope > div.sticky'); if (!st || st.querySelector(':scope > .b-vig')) return;
      var v = document.createElement('div'); v.className = 'b-vig'; v.setAttribute('aria-hidden', 'true');
      var media = st.querySelector(':scope > div.absolute');
      if (media && media.nextSibling) st.insertBefore(v, media.nextSibling); else st.appendChild(v);
      var pills = document.createElement('ul'); pills.className = 'b-pills';
      pills.innerHTML = [['어휘', '5분'], ['문법', '5분'], ['문해력', '10분']].map(function (x) { return '<li><i></i><b>' + x[0] + '</b><span>' + x[1] + '</span></li>'; }).join('');
      st.appendChild(pills);
      if (isC) {
        // C안: 07과 마지막 '시작하기'를 한 장면으로 — 영상 창 안에 어두운 막 + 마지막 문구·버튼
        var shade = document.createElement('div'); shade.className = 'c-shade'; shade.setAttribute('aria-hidden', 'true');
        if (media) media.appendChild(shade);
        var src = document.querySelector('section[aria-label="시작하기"] .max-w-4xl');
        if (src) {
          var cc = document.createElement('div'); cc.className = 'c-close'; cc.innerHTML = src.innerHTML; st.appendChild(cc);
          var ch = cc.querySelector('h2'); if (ch) ch.innerHTML = '오늘의 20분을<br>지금 시작하세요<span class="c-endp">.</span>'; // C안 문구 (2026-11-11)
        }
      }
      updateVignette();
    };
    var updateVignette = function () {
      vig.frame = 0;
      var sec = document.querySelector('section[aria-label="하루 20분"]'); if (!sec) return;
      var st = sec.querySelector(':scope > div.sticky'); if (!st || !st.querySelector('.b-vig')) return;
      var vh = window.innerHeight, r = sec.getBoundingClientRect();
      // C안: 마지막 '지금 시작하세요' 화면이 나온 뒤 바로 푸터로 넘어가지 않게, 구간 끝 80vh는 다 끝난 상태로 머묾
      var hold = isC ? vh * 0.8 : 0;
      var p = reducedMQ.matches ? 1 : clamp01(-r.top / Math.max(1, sec.offsetHeight - vh - hold));
      if (isC && !reducedMQ.matches) { // 관성
        vig.p = vig.p == null ? p : vig.p + (p - vig.p) * 0.12;
        if (Math.abs(p - vig.p) > 0.0004) vig.frame = requestAnimationFrame(updateVignette); else vig.p = p;
        p = vig.p;
      }
      var c = easeInOut(clamp01((p - 0.08) / 0.45));
      // 타원 반지름: 화면보다 큰 상태(검정 없음) → 가로 34vw·세로 41vh
      st.style.setProperty('--b-rx', (34 + (95 - 34) * (1 - c)).toFixed(2) + 'vw');
      st.style.setProperty('--b-ry', (41 + (115 - 41) * (1 - c)).toFixed(2) + 'vh');
      st.style.setProperty('--b-dark', c.toFixed(3));
      Array.prototype.forEach.call(st.querySelectorAll('.b-pills li'), function (li, i) {
        var t = easeOutCubic(clamp01((p - 0.5 - i * 0.07) / 0.14));
        // C안: 알약은 먼저 위로 빠져나감(0.76~0.82, 위쪽 알약부터) → 그다음 원이 닫힘
        var out = isC ? easeInOut(clamp01((p - 0.76 - i * 0.012) / 0.05)) : 0;
        li.style.opacity = (t * (1 - out)).toFixed(3); li.style.transform = 'translateY(' + ((1 - t) * 36 - out * 40).toFixed(1) + 'px)';
      });
      // C안: 알약 3개 다음에 '오늘의 20분을 시작하세요.'·버튼이 이어서 올라옴 (영상은 조금 더 어두워짐)
      if (isC) {
        var e = clamp01((p - 0.88) / 0.1); // 원이 다 닫힌 뒤 시작 (문구·설명·버튼 차례로 — CSS에서 나눔)
        st.style.setProperty('--c-e', e.toFixed(3));
        // 처음: '하루 20분.'·설명이 영상 가운데 → 0.30~0.42 위로 빠지고 그다음 알약 3개
        st.style.setProperty('--c-hs', (1 - easeInOut(clamp01((p - 0.3) / 0.12))).toFixed(3));
        // union-tec 방식: 꽉 찬 영상 위로 바깥에서 검정이 '정원'으로 조여 듦. 끝 크기 = 화면 폭의 96% 지름(좌우가 둥글게 잘리고 위아래는 화면 밖)
        var cvw = window.innerWidth, cvh = window.innerHeight;
        var R0 = Math.hypot(cvw / 2, cvh / 2) + 40, R1 = Math.max(cvw * 0.48, cvh * 0.46);
        // 알약이 빠진 뒤(0.81~0.89) 원이 조리개처럼 점점 빨라지며 끝까지 닫혀 화면 전체 검정 → 그 위에 시작하기 문구
        // 끝: 원을 확 닫지 않고, 원은 살짝만 좁아지면서 영상이 천천히 어두워져 검정으로 녹아듦(0.78~0.92) → 그 위에 시작하기 문구
        var dim = easeInOut(clamp01((p - 0.78) / 0.14));
        var Rc = (R0 + (R1 - R0) * c) * (1 - dim * 0.35);
        st.style.setProperty('--c-dim', dim.toFixed(4));
        st.style.setProperty('--b-rx', Rc.toFixed(1) + 'px'); st.style.setProperty('--b-ry', Rc.toFixed(1) + 'px');
        var cc = st.querySelector('.c-close'); if (cc) { cc.style.pointerEvents = e > 0.6 ? 'auto' : 'none'; cc.style.visibility = e > 0.01 ? 'visible' : 'hidden'; }
      }
    };
    window.addEventListener('scroll', function () { if (!vig.frame) vig.frame = requestAnimationFrame(updateVignette); }, { passive: true });
    // C안 격자 표시 (참고: union-tec.jp 실제 코드 분석)
    // - 선이 만나는 자리마다 아주 작은 글자(10px을 20%로 축소 → 점처럼 보임)가 놓이고, 1초마다 한 글자씩 바뀌며 은은하게 반짝임(질감)
    //   글자 순서는 자리마다 (열×7 + 행×13)으로 어긋나게. union-tec은 영문 회사 문구, 우리는 원장님 문장의 한글
    // - 가운데 알약 사진 위에는 흰 격자선이 같은 자리로 겹쳐 보임(사진 뒤로 격자가 끊기지 않고 이어지는 느낌)
    var GRID_TEXT = '스스로생각하고표현하는힘을기르는것이진짜교육';
    var gm = { el: null, spans: [], cols: 0, rows: 0, step: 0, timer: 0 };
    var gridCache = null;
    window.addEventListener('resize', function () { gridCache = null; });
    // 격자 크기: allga-b.css 35번과 같은 식 (본문 최대 1280px·좌우 최소 40px, PC 4칸 / 모바일 24px·2칸)
    var gridVars = function () {
      var vw = window.innerWidth, mob = vw <= 760;
      var cw = mob ? vw - 48 : Math.min(1280, vw - 80);
      return { col: cw / (mob ? 2 : 4), cl: (vw - cw) / 2, cw: cw };
    };
    var buildGridMarks = function () {
      if (!isC) return;
      var main = document.querySelector('main'); if (!main) return;
      if (!gm.el || !gm.el.isConnected) {
        gm.el = document.createElement('div'); gm.el.className = 'c-grid-marks'; gm.el.setAttribute('aria-hidden', 'true');
        main.insertBefore(gm.el, main.firstChild); gm.spans = []; gm.cols = gm.rows = 0;
      }
      var v = gridVars(); if (!v.col) return;
      var x0 = v.cl - Math.ceil(v.cl / v.col) * v.col; // 화면 왼쪽 밖 첫 세로선
      var cols = Math.ceil((window.innerWidth - x0) / v.col) + 1, rows = Math.ceil(window.innerHeight / v.col) + 1;
      if (cols !== gm.cols || rows !== gm.rows) {
        gm.el.textContent = ''; gm.spans = [];
        for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
          var sp = document.createElement('span'); sp.dataset.k = String((c * 7 + r * 13) % GRID_TEXT.length);
          gm.el.appendChild(sp); gm.spans.push(sp);
        }
        gm.cols = cols; gm.rows = rows;
      }
      gm.spans.forEach(function (sp, i) {
        var c = i % cols, r = (i / cols) | 0;
        sp.style.transform = 'translate(' + (x0 + c * v.col - 0.5).toFixed(1) + 'px,' + (r * v.col - 0.5).toFixed(1) + 'px) translate(-50%,-50%) scale(.2)';
      });
      tickGridMarks();
      if (!gm.timer && !reducedMQ.matches) gm.timer = setInterval(tickGridMarks, 1000);
      placePhotoGrid();
    };
    var tickGridMarks = function () {
      var n = GRID_TEXT.length; gm.step = (gm.step + 1) % n;
      if (document.hidden) return;
      gm.spans.forEach(function (sp) { sp.textContent = GRID_TEXT[(gm.step + (+sp.dataset.k)) % n]; });
    };
    // 가운데 사진 위 흰 격자: 사진 안에서도 화면 격자와 같은 자리에 선이 오도록 위치를 맞춤
    var placePhotoGrid = function () {
      if (!isC) return;
      var ph = document.querySelector('.c-photo'); if (!ph) return;
      var v = gridVars(); if (!v.col) return;
      var r = ph.getBoundingClientRect();
      var ox = ((v.cl - r.left) % v.col + v.col) % v.col, oy = ((0 - r.top) % v.col + v.col) % v.col;
      ph.style.setProperty('--c-gx', (ox - 0.5).toFixed(2) + 'px'); ph.style.setProperty('--c-gy', (oy - 0.5).toFixed(2) + 'px');
    };
    if (isC) {
      window.addEventListener('resize', function () { buildGridMarks(); });
      var pgFrame = 0;
      window.addEventListener('scroll', function () { if (!pgFrame) pgFrame = requestAnimationFrame(function () { pgFrame = 0; if (window.scrollY < window.innerHeight * 1.5) placePhotoGrid(); }); }, { passive: true });
    }
    // C안 04 도입 = union-tec Capabilities 그대로 (코드 값 확인함)
    // - 왼쪽: 제목(질문 → 답)과 검정 알약 버튼이 화면에 붙어 있음
    // - 오른쪽: 큐브 4개(면 6개짜리 정육면체)가 지그재그로 놓이고, 스크롤로 각 큐브 윗변이 화면 아래→위로 지나는 동안
    //   아래에서 올라오며(translateY 100%→0) 뒤에서 앞으로(Z -500→-50, 큐브 폭 1%=1단위) 반 바퀴 돌아(rotateY -180°→0°) 정면에 섬. 감속 easeOutCubic
    // 큐브 앞면 그림 = 올가 홈페이지 카드처럼 사진을 도형으로: 위가 둥근 반알약 → 원 → 아래가 둥근 반알약 → 원 (C안이라 흑백)
    var HOOK_CARDS = [
      ['지문 읽기', '글 전체를<br>처음부터 끝까지', '/media/allga/closing-book.jpg', 's-arch'],
      ['문장 독해', '한 문장씩<br>정확하게', '/media/allga/writing.jpg', 's-circle'],
      ['문단 독해', '문단의 중심을<br>찾아서', '/media/allga/study.jpg', 's-arch-down'],
      ['지문 독해', '글 전체의 구조를<br>한 그림으로', '/media/allga/lens.jpg', 's-circle']
    ];
    var hook = { frame: 0 };
    var applyHook = function () {
      if (!isC) return;
      var sec = document.querySelector('section[aria-label="읽기의 해부"]'); if (!sec || sec.querySelector('.c-hook')) return;
      var h2 = sec.querySelector('h2'); if (!h2) return;
      var head = h2.parentElement, shell = head.parentElement;
      var wrap = document.createElement('div'); wrap.className = 'c-hook';
      shell.insertBefore(wrap, head);
      var left = document.createElement('div'); left.className = 'c-hook-text'; left.appendChild(head); wrap.appendChild(left);
      // 질문 두 줄: 원장님 문장과 같은 효과(스크롤하면 줄마다 빨강 밑줄 + 지나간 낱말이 회색 → 검정)
      var qHtml = ['한 편의 글은', '어떻게 읽어야 할까요?'].map(function (l) { return '<span class="c-ql">' + l.split(' ').map(function (w) { return '<b class="c-w">' + w + '</b>'; }).join(' ') + '<i class="c-uline" aria-hidden="true"></i></span>'; }).join('<br>');
      h2.innerHTML = '<span class="c-q">' + qHtml + '</span><span class="c-a">우리는 <span class="c-circ">4단계<svg viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M16 60 C10 30 54 8 104 7 C154 6 194 24 192 52 C190 82 148 96 100 95 C52 94 12 82 12 56 C12 36 34 22 64 15"/></svg></span>로,<br>깊이 읽습니다.</span>';
      // 아래 네 단계 목록은 C안에서 숨기고(큐브와 중복) 버튼은 네 단계로 읽는 문해력 과정으로 연결
      var btn = document.createElement('a'); btn.className = 'c-hook-btn'; btn.href = '/learn/literacy'; btn.innerHTML = '<i></i>문해력 과정 보기';
      left.appendChild(btn);
      var cubes = document.createElement('div'); cubes.className = 'c-cubes'; cubes.setAttribute('aria-hidden', 'true');
      // 큐브 앞면 = 아래 목록의 실제 내용(단계 이름·설명)을 그대로 옮겨 담음
      var lis = Array.prototype.slice.call(sec.querySelectorAll('ol > li'));
      cubes.innerHTML = HOOK_CARDS.map(function (c, i) {
        var li = lis[i], name = li && li.querySelector('h3') ? li.querySelector('h3').textContent.trim() : c[0];
        var desc = li && li.querySelector('p') ? li.querySelector('p').textContent.trim() : '';
        return '<div class="c-cube"><div class="c-cube-scene"><div class="c-cube-cube">' +
          '<div class="c-face c-face--front"><div class="c-cube-body"><p class="c-cube-label"><span>0' + (i + 1) + ' / 04</span><i></i></p>' +
          '<div class="c-cube-shape ' + c[3] + '"><img src="' + c[2] + '" alt="" loading="lazy"></div>' +
          '<div class="c-cube-photo" style="background-image:url(' + c[2] + ')"></div>' +
          '<div class="c-cube-copy"><p class="c-cube-text">' + name + '</p><p class="c-cube-desc">' + desc + '</p></div></div></div>' +
          // 아치형 블록: 앞·뒤 = 아치 모양, 두께 = 얇은 아치 판 14장을 겹쳐 둥근 옆면을 만듦
          '<div class="c-face c-face--back"></div>' + (function () { var h = ''; for (var z = 0; z < 14; z++) h += '<div class="c-layer" style="--z:' + z + '"></div>'; return h; })() +
          '</div></div></div>';
      }).join('');
      wrap.appendChild(cubes);
      updateHook();
    };
    var updateHook = function () {
      hook.frame = 0;
      var wrap = document.querySelector('.c-hook'); if (!wrap) return;
      var vh = window.innerHeight, reduced = reducedMQ.matches, first = null, again = false;
      Array.prototype.forEach.call(wrap.querySelectorAll('.c-cube'), function (cb, i) {
        var r = cb.getBoundingClientRect();
        var topP = (vh - r.top) / vh; if (i === 0) first = topP;
        var target = clamp01(topP);
        if (!reduced) { // 관성: 큐브마다 목표 진행값을 12%씩 따라감
          cb._p = cb._p == null ? target : cb._p + (target - cb._p) * 0.12;
          if (Math.abs(target - cb._p) > 0.0006) again = true; else cb._p = target;
          target = cb._p;
        }
        var e = reduced ? 1 : easeOutCubic(target);
        var cube = cb.querySelector('.c-cube-cube');
        cube.style.transform = 'translate3d(0,' + (100 * (1 - e)).toFixed(2) + '%,' + ((-500 + 450 * e) * r.width / 100).toFixed(1) + 'px) rotateY(' + (-180 * (1 - e)).toFixed(2) + 'deg)';
        cb.classList.toggle('is-show', r.top < vh && r.bottom > 0);
      });
      // 질문 → 답: 첫 큐브가 화면 절반쯤 올라오면 부드럽게 전환(CSS 전환 0.9초), 다시 올리면 질문으로
      wrap.classList.toggle('is-answer', (first || 0) > 0.04);
      var q = wrap.querySelector('.c-q');
      if (q) {
        var qr = q.getBoundingClientRect(), qk = reduced ? 1 : clamp01((vh * 0.85 - qr.top) / (vh * 0.4)), qls = q.querySelectorAll('.c-ql');
        Array.prototype.forEach.call(qls, function (l, i) {
          var f = clamp01(qk * qls.length - i), lw = l.offsetWidth, u = l.querySelector('.c-uline');
          if (u) u.style.transform = 'scaleX(' + f.toFixed(4) + ')';
          Array.prototype.forEach.call(l.querySelectorAll('.c-w'), function (w) { w.classList.toggle('b-ink', f >= 1 || (f > 0 && w.offsetLeft + w.offsetWidth / 2 <= lw * f)); });
        });
      } // 첫 큐브가 화면 아래에서 올라오기 시작할 때 = 답이 나올 때
      if (again) hook.frame = requestAnimationFrame(updateHook);
    };
    if (isC) window.addEventListener('scroll', function () { if (!hook.frame) hook.frame = requestAnimationFrame(updateHook); }, { passive: true });
    // C안 06 순환: 원형 그림 대신 알약 모양 트랙. 스크롤하면 빨강 점이 트랙을 한 바퀴 돌고, 지나간 단계 알약이 빨강으로 켜짐(관성)
    // 트랙은 상자의 실제 픽셀 크기로 그림(늘이지 않음) → 선 길이 계산이 정확, 선 두께·모서리도 일정
    var loopS = { p: null, frame: 0, L: 0, at: [], w: 0, h: 0 };
    // 단계마다 MEDIUM식 사진 도형: 학습=돔(위 반원), 틀린 문제=보울(아래 반원), 재학습=원. 꺼져 있을 땐 작은 회색 원, 켜지면 도형으로 펼쳐지며 사진이 나옴
    var LOOP_IMG = ['study.jpg', 'writing.jpg', 'pages.jpg'];
    var LOOP_NODES = [['학습', '처음 만나는 낱말'], ['틀린 문제', '오답만 모아 다시'], ['재학습', '모두 맞히면 완료']];
    var layoutLoop = function () {
      var el = document.querySelector('.c-loop'); if (!el) return;
      var w = el.clientWidth, h = el.clientHeight; if (!w || !h) return;
      if (el.classList.contains('is-bar')) { loopS.w = w; loopS.h = h; loopS.L = 1; return; } // 2026-11-12 진행 막대형: 경로 계산 없음
      var pad = 14, r = (h - pad * 2) / 2;
      // 시작 = 위 가운데(학습) → 시계 방향: 오른쪽 끝(틀린 문제) → 아래 → 왼쪽 끝(재학습) → 다시 위
      var d = 'M' + (w / 2) + ' ' + pad + 'H' + (w - pad - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (w - pad - r) + ' ' + (h - pad) + 'H' + (pad + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (pad + r) + ' ' + pad + 'Z';
      var svg = el.querySelector('svg'); svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      Array.prototype.forEach.call(el.querySelectorAll('path'), function (pth) { pth.setAttribute('d', d); });
      var path = el.querySelector('.c-loop-run'); loopS.L = path.getTotalLength(); loopS.w = w; loopS.h = h;
      path.style.strokeDasharray = loopS.L + ' ' + loopS.L;
      var targets = [[w / 2, pad], [w - pad, h / 2], [pad, h / 2]];
      loopS.at = targets.map(function (t) { var best = 0, bd = 1e9; for (var l = 0; l <= loopS.L; l += 2) { var pt = path.getPointAtLength(l), dd = Math.hypot(pt.x - t[0], pt.y - t[1]); if (dd < bd) { bd = dd; best = l; } } return best; });
    };
    var applyLoop = function () {
      if (!isC) return;
      if (STAIR) return applyStair();
      var sec = document.querySelector('section[aria-label="학습의 순환"]'); if (!sec || sec.querySelector('.c-loop')) return;
      var shell = sec.querySelector('.shell'); if (!shell) return;
      var el = document.createElement('div'); el.className = 'c-loop'; el.setAttribute('aria-hidden', 'true');
      el.innerHTML = '<svg><defs><linearGradient id="c-loop-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f59347"/><stop offset=".55" stop-color="#f06a3d"/><stop offset="1" stop-color="#ec1c24"/></linearGradient></defs><path class="c-loop-base" id="c-loop-path"/><path class="c-loop-run"/></svg>' +
        '<p class="c-loop-center">모두 알 때까지</p>' +
        LOOP_NODES.map(function (n, i) { return '<div class="c-loop-node n' + i + '"><div class="c-shape" style="--img:url(/media/allga/' + LOOP_IMG[i] + ')"><em></em><em></em></div><b><i></i>' + n[0] + '</b><span>' + n[1] + '</span></div>'; }).join('');
      shell.appendChild(el);
      // 왼쪽에 있던 제목·설명을 트랙 가운데로 옮김 ('모두 알 때까지' 자리)
      var txt = shell.querySelector(':scope > div.space-y-10');
      if (txt) { var c = el.querySelector('.c-loop-center'); c.textContent = ''; c.appendChild(txt); }
      // 2026-11-12 사용자: 원형 대신 글 아래 가로 진행 막대. 학습(0%) → 틀린 문제(50%) → 재학습(100%, 끝나면 '완료')
      el.classList.add('is-bar');
      var bar = document.createElement('div'); bar.className = 'c-bar'; bar.innerHTML = '<div class="c-bar-track"><i></i></div>';
      Array.prototype.forEach.call(el.querySelectorAll('.c-loop-node'), function (n, i) { n.style.left = ['0%', '50%', '100%'][i]; n.style.top = '0'; bar.appendChild(n); });
      el.appendChild(bar);
      layoutLoop(); updateLoop();
      // 등장(union-tec 알약 창 열림): 영역이 화면에 들어오면 가운데 작은 알약에서 트랙 크기로 열림, 위로 되돌아가면 다시 닫힘
      // (열림·닫힘은 updateLoop에서 스크롤 위치로 판단)
    };
    // C안 06 계단(bethebuzz 선 + MEDIUM 도형): 도형 세 개가 왼쪽 아래 → 오른쪽 위로 계단. 빨강 선이 도형 꼭대기에서 꼭대기로 반원 아치를 그리며 뛰어오르고, 선 끝의 점이 닿은 단계가 켜짐(관성)
    // 계단 시안은 주소에 &loop=stair
    var STAIR = isC && /[?&]loop=stair\b/.test(location.search); // 기본은 순환형(사용자: 순환형이 낫다)
    var stS = { p: null, frame: 0, L: 0, at: [], key: '' };
    var STAIR_STEPS = [['학습', '처음 만나는 낱말', 'study.jpg', 'arch'], ['틀린 문제', '오답만 모아 다시', 'writing.jpg', 'bowl'], ['재학습', '모두 맞히면 완료', 'pages.jpg', 'circle']];
    var layoutStair = function () {
      var st = document.querySelector('.c-stair'); if (!st) return;
      var W = st.clientWidth, H = st.clientHeight; if (!W || !H) return;
      var key = W + 'x' + H; if (stS.key === key) return; stS.key = key;
      var mob = W < 768, cw = mob ? W - 32 : Math.min(1280, W - 80), cl = (W - cw) / 2;
      var fx = mob ? [0.2, 0.5, 0.8] : [0.47, 0.70, 0.93], fy = mob ? [0.8, 0.66, 0.52] : [0.68, 0.53, 0.38];
      var sw = mob ? cw * 0.27 : Math.min(250, cw * 0.195), lift = H * (mob ? 0.05 : 0.065);
      var P = fx.map(function (f, i) { return [cl + cw * f - (mob ? 0 : sw / 2) + (mob ? 0 : sw / 2), H * fy[i]]; });
      // 도형 자리: 꼭대기 가운데가 선이 닿는 점
      Array.prototype.forEach.call(st.querySelectorAll('.c-step'), function (n, i) {
        var h = STAIR_STEPS[i][3] === 'circle' ? sw : sw * 0.8;
        n.style.left = (P[i][0] - sw / 2) + 'px'; n.style.top = P[i][1] + 'px'; n.style.width = sw + 'px'; n.style.height = h + 'px';
        n.style.setProperty('--r', (sw / 2) + 'px');
      });
      // 선: 첫 도형 꼭대기에서 시작 → 위로 → 반원 아치 → 다음 도형 꼭대기로 내려앉음 → 반복
      var d = 'M' + P[0][0] + ' ' + P[0][1];
      for (var i = 0; i < 2; i++) {
        var a = P[i], b = P[i + 1], top = b[1] - lift, r = (b[0] - a[0]) / 2;
        d += ' V' + top + ' A' + r + ' ' + r + ' 0 0 1 ' + b[0] + ' ' + top + ' V' + b[1];
      }
      var svg = st.querySelector('svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      var path = st.querySelector('.c-stair-line'); path.setAttribute('d', d);
      stS.L = path.getTotalLength(); path.style.strokeDasharray = stS.L + ' ' + stS.L;
      // 각 도형 꼭대기에 닿는 선 길이(켜지는 시점)
      stS.at = P.map(function (t) { var best = 0, bd = 1e9; for (var l = 0; l <= stS.L; l += 2) { var pt = path.getPointAtLength(l), dd = Math.hypot(pt.x - t[0], pt.y - t[1]); if (dd < bd - 0.01) { bd = dd; best = l; } } return best; });
      stS.at[0] = 0;
      var txt = st.querySelector('.c-stair-text'); txt.style.left = cl + 'px'; txt.style.width = (mob ? cw : cw * 0.46) + 'px';
    };
    var applyStair = function () {
      var sec = document.querySelector('section[aria-label="학습의 순환"]'); if (!sec || sec.querySelector('.c-stair')) return;
      var sticky = sec.querySelector(':scope > div'), shell = sec.querySelector('.shell'); if (!sticky || !shell) return;
      var txt = shell.querySelector(':scope > div.space-y-10'); if (!txt) return;
      var st = document.createElement('div'); st.className = 'c-stair';
      st.innerHTML = '<div class="c-stair-text"></div>' +
        STAIR_STEPS.map(function (s, i) { return '<div class="c-step s' + i + ' is-' + s[3] + '"><div class="c-step-img" style="background-image:url(/media/allga/' + s[2] + ')"></div><b>' + s[0] + '</b></div>'; }).join('') +
        '<svg aria-hidden="true"><path class="c-stair-line"/><circle class="c-stair-dot" r="7"/></svg>';
      st.querySelector('.c-stair-text').appendChild(txt);
      sticky.appendChild(st); sec.classList.add('is-stair');
      stS.key = ''; layoutStair(); updateStair();
    };
    var updateStair = function () {
      stS.frame = 0;
      var sec = document.querySelector('section[aria-label="학습의 순환"]'), st = sec && sec.querySelector('.c-stair'); if (!st) return;
      layoutStair(); if (!stS.L) return;
      var vh = window.innerHeight, r = sec.getBoundingClientRect();
      var p = reducedMQ.matches ? 1 : clamp01(-r.top / Math.max(1, sec.offsetHeight - vh));
      if (!reducedMQ.matches) { stS.p = stS.p == null ? p : stS.p + (p - stS.p) * 0.12; if (Math.abs(p - stS.p) > 0.0004) stS.frame = requestAnimationFrame(updateStair); else stS.p = p; p = stS.p; }
      var k = easeInOut(clamp01((p - 0.1) / 0.75)), l = stS.L * k;
      var path = st.querySelector('.c-stair-line'), dot = st.querySelector('.c-stair-dot');
      path.style.strokeDashoffset = String(stS.L - l);
      var q = path.getPointAtLength(l); dot.setAttribute('cx', q.x.toFixed(1)); dot.setAttribute('cy', q.y.toFixed(1));
      st.classList.toggle('is-in', r.top < vh * 0.6);
      Array.prototype.forEach.call(st.querySelectorAll('.c-step'), function (n, i) { n.classList.toggle('is-on', i === 0 ? r.top < vh * 0.3 || k > 0 : l >= stS.at[i] - 4); });
      st.classList.toggle('is-done', k > 0.995);
    };
    if (STAIR) window.addEventListener('resize', function () { stS.key = ''; if (!stS.frame) stS.frame = requestAnimationFrame(updateStair); });
    if (STAIR) window.addEventListener('scroll', function () { if (!stS.frame) stS.frame = requestAnimationFrame(updateStair); }, { passive: true });
    var updateLoop = function () {
      loopS.frame = 0;
      var sec = document.querySelector('section[aria-label="학습의 순환"]'), el = sec && sec.querySelector('.c-loop'); if (!el) return;
      if (el.clientWidth !== loopS.w || el.clientHeight !== loopS.h) layoutLoop();
      if (!loopS.L) return;
      var vh = window.innerHeight, r = sec.getBoundingClientRect();
      if (r.top < vh * 0.75) el.classList.add('is-open'); else if (r.top > vh * 0.9) el.classList.remove('is-open');
      var p = reducedMQ.matches ? 1 : clamp01(-r.top / Math.max(1, sec.offsetHeight - vh));
      if (!reducedMQ.matches) { loopS.p = loopS.p == null ? p : loopS.p + (p - loopS.p) * 0.12; if (Math.abs(p - loopS.p) > 0.0004) loopS.frame = requestAnimationFrame(updateLoop); else loopS.p = p; p = loopS.p; }
      var k = easeInOut(clamp01((p - 0.06) / 0.82)), l = loopS.L * k;
      if (el.classList.contains('is-bar')) {
        el.style.setProperty('--k', k.toFixed(4));
        Array.prototype.forEach.call(el.querySelectorAll('.c-loop-node'), function (n, i) { n.classList.toggle('is-on', k >= [0.01, 0.5, 0.995][i]); });
        el.classList.toggle('is-done', k > 0.995);
        return;
      }
      var path = el.querySelector('.c-loop-run');
      path.style.strokeDashoffset = String(loopS.L - l);
      // 2026-11-12 순서 바로잡기(사용자: 학습 → 틀린 문제 → 재학습): 알약이 선과 함께 돌면 뒤 단계(재학습)가 위로 올라와 순서가 거꾸로 읽힘
      // → 알약은 제자리(위·오른쪽·왼쪽)에 두고, 빨간 선이 시계 방향으로 자라며 닿는 순서대로 켜짐
      Array.prototype.forEach.call(el.querySelectorAll('.c-loop-node'), function (n, i) {
        var q = path.getPointAtLength(loopS.at[i]);
        n.style.left = (q.x / loopS.w * 100).toFixed(3) + '%'; n.style.top = (q.y / loopS.h * 100).toFixed(3) + '%';
        n.classList.toggle('is-on', l >= Math.max(loopS.L * 0.02, loopS.at[i] - 4));
      });
      el.classList.toggle('is-done', k > 0.995);
    };
    if (isC) window.addEventListener('resize', function () { loopS.w = 0; if (!loopS.frame) loopS.frame = requestAnimationFrame(updateLoop); });
    if (isC) window.addEventListener('scroll', function () { if (!loopS.frame) loopS.frame = requestAnimationFrame(updateLoop); }, { passive: true });
    // C안 첫 화면 → 원장님 문장: 알약 영상이 화면 가득 커지고(모서리 펴짐) 밝아져 흰색이 되면, 다음 영역 흰 바탕으로 이어짐 (관성)
    var heroG = { p: null, frame: 0 };
    var updateHeroGrow = function () {
      heroG.frame = 0;
      if (!isC) return;
      var sec = document.querySelector('main > section:first-of-type'), st = sec && sec.querySelector(':scope > div.sticky'); if (!st) return;
      var vh = window.innerHeight, r = sec.getBoundingClientRect();
      var p = clamp01(-r.top / Math.max(1, sec.offsetHeight - vh));
      if (!reducedMQ.matches) { heroG.p = heroG.p == null ? p : heroG.p + (p - heroG.p) * 0.12; if (Math.abs(p - heroG.p) > 0.0004) heroG.frame = requestAnimationFrame(updateHeroGrow); else heroG.p = p; p = heroG.p; }
      var e = easeInOut(clamp01((p - 0.04) / 0.6)), wh = easeInOut(clamp01((p - 0.45) / 0.38));
      st.style.setProperty('--hx', e.toFixed(4)); st.style.setProperty('--hw', wh.toFixed(4));
    };
    if (isC) { window.addEventListener('scroll', function () { if (!heroG.frame) heroG.frame = requestAnimationFrame(updateHeroGrow); }, { passive: true }); window.addEventListener('resize', updateHeroGrow); }
    // C안 이야기 '점 → 선' (원장님 비유: 글자가 모이면 길이 되고, 길이 모이면 지도가 됩니다)
    // ① 점: 첫 화면 제목 끝 빨강 마침표가 그 자리에 남고(제목·영상이 하얗게 사라지는 동안)
    // ② 원장님 문장 영역이 올라오면 점이 첫 줄 시작으로 미끄러져 내려옴
    // ③ 스크롤하면 점이 줄마다 빨강 밑줄을 그으며 지나가고, 지나간 낱말이 회색 → 검정으로 채워짐
    // ④ 마지막 줄 끝('믿습니다.')에 점이 머물렀다가 영역과 함께 올라감. 페이지 맨 끝 '지금 시작하세요.'의 마침표도 빨강
    var story = { el: null, lines: [], x: null, y: null, r: 0, frame: 0, cache: null, g: null };
    var layoutStory = function () {
      var mh = document.querySelector('.b-merge-head'); if (!mh) return;
      Array.prototype.forEach.call(mh.querySelectorAll('.c-uline'), function (u) { u.remove(); });
      var words = Array.prototype.slice.call(mh.querySelectorAll('.b-w')), rows = [];
      words.forEach(function (w) {
        var t = w.offsetTop, row = rows.filter(function (r) { return Math.abs(r.t - t) < 4; })[0];
        if (!row) { row = { t: t, words: [] }; rows.push(row); } row.words.push(w);
      });
      rows.sort(function (a, b) { return a.t - b.t; });
      story.lines = rows.map(function (r) {
        var first = r.words[0], last = r.words[r.words.length - 1];
        var x0 = first.offsetLeft, x1 = last.offsetLeft + last.offsetWidth, y = r.t + first.offsetHeight * 0.96;
        var u = document.createElement('i'); u.className = 'c-uline'; u.setAttribute('aria-hidden', 'true');
        u.style.left = x0 + 'px'; u.style.top = y + 'px'; u.style.width = (x1 - x0) + 'px'; mh.appendChild(u);
        return { x0: x0, x1: x1, y: y, u: u, words: r.words.map(function (w) { return { el: w, cx: w.offsetLeft + w.offsetWidth / 2, x: w.offsetLeft, w: w.offsetWidth }; }) };
      });
      var pe = document.querySelector('main > section:first-of-type .b-period');
      if (pe) story.g = measureGlyph(pe);
      // 2026-11-13 사용자 요청: 점이 첫 글자('우') 가운데로 쏙 들어가며 사라지고, 거기서 빨강 채움이 시작
      story.fc = null;
      if (rows.length) {
        var fw = rows[0].words[0], tn = document.createTreeWalker(fw, NodeFilter.SHOW_TEXT).nextNode();
        while (tn && !tn.nodeValue.trim()) tn = tn.nextSibling;
        if (tn) {
          var i0 = tn.nodeValue.search(/\S/), rg = document.createRange(); rg.setStart(tn, i0); rg.setEnd(tn, i0 + 1);
          var cr = rg.getBoundingClientRect(), hr0 = mh.getBoundingClientRect();
          if (cr.width) story.fc = { x: cr.left - hr0.left + cr.width / 2, y: cr.top - hr0.top + cr.height * 0.55 };
        }
        if (!story.fc) story.fc = { x: fw.offsetLeft + fw.offsetHeight * 0.45, y: fw.offsetTop + fw.offsetHeight * 0.55 };
      }
    };
    var applyStory = function () {
      if (!isC) return;
      if (story.el) { if (!story.el.isConnected) { document.body.appendChild(story.el); layoutStory(); updateStory(); } return; } // 화면 다시 그리기로 빠지면 다시 붙임
      if (!document.querySelector('.b-merge-head') || !document.querySelector('main > section:first-of-type .b-period')) return;
      story.el = document.createElement('i'); story.el.className = 'c-sdot'; story.el.setAttribute('aria-hidden', 'true');
      document.body.appendChild(story.el);
      layoutStory(); updateStory();
    };
    var updateStory = function () {
      story.frame = 0;
      if (!story.el || !story.lines.length) return;
      var vh = window.innerHeight, mh = document.querySelector('.b-merge-head'); if (!mh) return;
      if (!story.lines[0].u.isConnected) { layoutStory(); if (!story.lines.length) return; } // 문장이 다시 만들어지면 밑줄도 다시
      var S = mh.closest('section');
      var hero = document.querySelector('main > section:first-of-type'), hr = hero.getBoundingClientRect();
      var pe = hero.querySelector('.b-period'), pr = pe.getBoundingClientRect(), g = story.g || { cx: pr.width / 2, cy: pr.height * .75, r: 6 };
      var mr = mh.getBoundingClientRect(), sr = S.getBoundingClientRect();
      var tx, ty, tr, drawing = false, L = story.lines, first = L[0], last = L[L.length - 1];
      var pS = clamp01(-sr.top / Math.max(1, S.offsetHeight - vh));
      if (hr.bottom >= vh - 1) { // ① 첫 화면이 고정된 동안: 제목 마침표 자리
        story.cache = { x: pr.left + g.cx, y: pr.top + g.cy, r: g.r };
        tx = story.cache.x; ty = story.cache.y; tr = story.cache.r;
      } else if (sr.top > 0) { // ② 다음 영역이 올라오는 동안: 마침표 자리 → 첫 줄 시작으로
        var c = story.cache || { x: pr.left + g.cx, y: vh * .3, r: g.r }, a = easeInOut(clamp01(1 - sr.top / vh));
        // 내려오면서 점이 밑줄 두께(지름 4px)로 줄어듦 → 도착하면 그대로 선이 됨
        var fc = story.fc || { x: first.x0, y: first.y };
        tx = c.x + (mr.left + fc.x - c.x) * a; ty = c.y + (mr.top + fc.y - c.y) * a; tr = c.r; // 크기 그대로 '우' 글자 가운데까지 내려옴
      } else { // ③④ 밑줄 긋기 (영역이 고정된 0.04~0.72 동안 줄마다 차례로)
        var span = 0.68 / L.length, k = clamp01((pS - 0.04) / 0.68), idx = Math.min(L.length - 1, Math.floor(k / (1 / L.length))), lt = clamp01((k - idx / L.length) * L.length);
        if (k >= 1) { idx = L.length - 1; lt = 1; }
        var ln = L[idx]; tx = mr.left + ln.x0 + (ln.x1 - ln.x0) * lt; ty = mr.top + ln.y; tr = 2; drawing = true;
        if (k <= 0 && story.fc) { // 채움이 시작되기 전: 점이 '우' 안에 머묾 → 채움이 시작되면 사라짐
          tx = mr.left + story.fc.x; ty = mr.top + story.fc.y; tr = (story.cache && story.cache.r) || (story.g && story.g.r) || 3; drawing = false;
        }
        L.forEach(function (l, i) {
          var f = i < idx ? 1 : i > idx ? 0 : lt;
          l.u.style.transform = 'scaleX(' + f.toFixed(4) + ')';
          var hx = l.x0 + (l.x1 - l.x0) * f;
          l.words.forEach(function (w) { w.el.classList.toggle('b-ink', f >= 1 || (f > 0 && w.cx <= hx)); w.el.style.setProperty('--fill', (f >= 1 ? 100 : clamp01((hx - w.x) / Math.max(1, w.w)) * 100).toFixed(2) + '%'); });
        });
      }
      if (sr.top > 0) L.forEach(function (l) { l.u.style.transform = 'scaleX(0)'; l.words.forEach(function (w) { w.el.classList.remove('b-ink'); w.el.style.setProperty('--fill', '0%'); }); });
      // 관성으로 따라감
      if (reducedMQ.matches || story.x == null) { story.x = tx; story.y = ty; story.r = tr; }
      else { story.x += (tx - story.x) * 0.22; story.y += (ty - story.y) * 0.22; story.r += (tr - story.r) * 0.22; }
      var moving = Math.abs(tx - story.x) > 0.3 || Math.abs(ty - story.y) > 0.3;
      story.el.style.transform = 'translate3d(' + story.x.toFixed(2) + 'px,' + story.y.toFixed(2) + 'px,0) translate(-50%,-50%)';
      story.el.style.width = story.el.style.height = (story.r * 2).toFixed(2) + 'px';
      // 밑줄을 긋는 동안에는 점을 따로 보이지 않음(점이 선이 된 것). 화면 밖이어도 숨김
      story.el.style.opacity = (drawing || story.y < -20 || story.y > vh + 20) ? '0' : '1';
      // 첫 화면에서는 진짜 마침표 대신 이 점이 보임(겹침 방지)
      pe.style.opacity = '0';
      if (moving) story.frame = requestAnimationFrame(updateStory);
    };
    if (isC) {
      window.addEventListener('scroll', function () { if (!story.frame) story.frame = requestAnimationFrame(updateStory); }, { passive: true });
      window.addEventListener('resize', function () { if (story.el) { layoutStory(); updateStory(); } });
      window.addEventListener('load', function () { if (story.el) { layoutStory(); updateStory(); } });
    }
    // C안 05 직접 풀어 보기 제목·서브 문구 (2026-11-11). 실제 체험 내용(낱말 뜻 5문제, 누르면 바로 채점)만 말함
    var applyQuizCopy = function () {
      if (!isC) return;
      var sec = document.querySelector('section[aria-label="직접 풀어 보기"]'); if (!sec) return;
      var h2 = sec.querySelector('h2'); if (!h2) return;
      if (h2.textContent.indexOf('한 단어부터') === -1) h2.textContent = '한 단어부터, 지금 시작해 보세요.';
      if (!sec.querySelector('.c-quiz-sub')) {
        var sub = document.createElement('p'); sub.className = 'c-quiz-sub';
        sub.textContent = '뜻·비슷한 말·예문으로 낱말을 익혀요. 초·중·고 누구나 다섯 문제로 먼저 풀어 보세요.';
        h2.after(sub);
      }
    };
    // 2026-11-12 C안 05 직접 풀어 보기 → 게임형 퀴즈 미리보기(사용자 요청, 듀오링고 구조 참고·올가 옷)
    // 맨 위 진행 막대+연속 정답, 문제 형식 섞기(고르기·짝짓기·빈칸·문장 만들기), 아래 확인→계속하기 피드백 바, 끝나면 틀린 문제만 재학습
    // 문제는 올가 프로그램 '초등 어휘력 완성 · 어휘력기초 1레벨 1세트' Day 1·2의 실제 문제(Part 2 뜻→단어, Part 3 유의어, Part 4 예문 완성) 첫 문제를 그대로 씀. 짝짓기 등 프로그램에 없는 유형은 넣지 않음
    var GQ = [
      { t: 'choose', tag: '2단계 · 뜻·단어 고르기', ins: '뜻에 맞는 낱말을 고르세요', q: '“헤아려서 갖추다.”', opts: ['창공', '마련하다', '충직하다', '마지막'], a: 1, why: '‘마련하다’는 헤아려서 갖춘다는 뜻이에요.' },
      { t: 'choose', tag: '3단계 · 비슷한 말 찾기', ins: '비슷한 말을 고르세요', q: '충직하다', opts: ['충성스럽다', '조달되다', '최후', '하늘'], a: 0, why: '‘충직하다’는 충성스럽고 정직하다는 뜻이라 ‘충성스럽다’와 비슷해요.' },
      { t: 'choose', tag: '2단계 · 뜻·단어 고르기', ins: '뜻에 맞는 낱말을 고르세요', q: '“굳고 단단하다.”', opts: ['만남', '마침내', '견고하다', '만끽하다'], a: 2, why: '‘견고하다’는 굳고 단단하다는 뜻이에요.' },
      { t: 'fill', tag: '4단계 · 예문 완성하기', ins: '빈칸에 알맞은 말을 고르세요', pre: '새 학기를 맞아 깨끗한 교실과 새 책상이 ', post: ' 학생들의 마음도 산뜻해졌습니다.', opts: ['마련하여', '창공', '충직한', '마련되어'], a: 3, why: '교실과 책상이 ‘갖추어진’ 것이라 ‘마련되어’가 맞아요. ‘마련하여’는 누가 갖출 때 써요.' },
      { t: 'choose', tag: '3단계 · 비슷한 말 찾기', ins: '비슷한 말을 고르세요', q: '만남', opts: ['즐기다', '결국', '교제', '공고하다'], a: 2, why: '‘만남’과 ‘교제’는 서로 사귀어 오가는 일을 뜻해 비슷한 말이에요.' }
    ];
    var GQ_PRAISE = ['정확해요!', '문맥을 잘 읽었어요!', '어휘력 +1', '좋아요, 그대로!', '훌륭해요!'];
    var gq = { el: null, list: [], i: 0, ok: 0, streak: 0, best: 0, wrong: [], sel: null, state: 'ask', round: 1 };
    var gqShuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
    var gqEsc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    // 2026-11-12 마스코트(책 캐릭터, Higgsfield 생성): 문제 중·정답·오답·완료마다 표정과 말풍선이 바뀜
    var GQ_FACE = { ask: '/media/allga/mascot-ask.png', ok: '/media/allga/mascot-ok.png', bad: '/media/allga/mascot-oops.png', end: '/media/allga/mascot-done.png' };
    var gqMood = function (m, say) {
      var img = gq.pal.querySelector('.gq-mascot'), b = gq.pal.querySelector('.gq-say');
      if (img.getAttribute('src') !== GQ_FACE[m]) img.setAttribute('src', GQ_FACE[m]);
      b.textContent = say; var sb = gq.el.querySelector('.gq-bub.is-say'); if (sb) sb.textContent = say; var pal = gq.pal; pal.classList.remove('is-hop'); void pal.offsetWidth; pal.classList.add('is-hop');
    };
    var gqStart = function (list, round) { gq.list = list; gq.i = 0; gq.ok = 0; gq.streak = 0; gq.best = 0; gq.wrong = []; gq.round = round || 1; var st = gq.el.querySelector('.gq-streak'); st.textContent = ''; st.classList.remove('is-on'); gqRender(); };
    var gqRender = function () {
      var el = gq.el, q = gq.list[gq.i]; gq.sel = null; gq.state = 'ask';
      el.classList.remove('is-ok', 'is-bad', 'is-end');
      var pct = gq.i / gq.list.length * 100;
      el.querySelector('.gq-bar i').style.width = pct + '%';
      el.querySelector('.gq-count').textContent = (gq.round > 1 ? '재학습 ' : '') + (gq.i + 1) + ' / ' + gq.list.length;
      var body = el.querySelector('.gq-body'), h = '<p class="gq-ins">' /* 2026-11-13 사용자 요청: 문제 위 꼬리표(n단계·Part) 표시 뺌 */ + gqEsc(q.ins) + '</p>';
      if (q.t === 'choose') {
        h += '<p class="gq-q">' + gqEsc(q.q) + '</p><div class="gq-opts">' + q.opts.map(function (o, k) { return '<button type="button" class="gq-opt" data-k="' + k + '"><span>' + (k + 1) + '</span>' + gqEsc(o) + '</button>'; }).join('') + '</div>';
      } else if (q.t === 'match') {
        var L = gqShuffle(q.pairs.map(function (p, k) { return k; })), R = gqShuffle(L);
        h += '<div class="gq-match"><div>' + L.map(function (k) { return '<button type="button" class="gq-chip gq-l" data-k="' + k + '">' + gqEsc(q.pairs[k][0]) + '</button>'; }).join('') + '</div><div>' + R.map(function (k) { return '<button type="button" class="gq-chip gq-r" data-k="' + k + '">' + gqEsc(q.pairs[k][1]) + '</button>'; }).join('') + '</div></div>';
        gq.mDone = 0; gq.mMiss = 0;
      } else if (q.t === 'fill') {
        h += '<p class="gq-sent">' + gqEsc(q.pre) + '<button type="button" class="gq-blank" aria-label="빈칸"></button>' + gqEsc(q.post) + '</p><div class="gq-bank">' + q.opts.map(function (o, k) { return '<button type="button" class="gq-chip gq-w" data-k="' + k + '">' + gqEsc(o) + '</button>'; }).join('') + '</div>';
      } else if (q.t === 'order') {
        var W = gqShuffle(q.words.map(function (w, k) { return k; }));
        if (W.join() === q.words.map(function (w, k) { return k; }).join()) W.reverse();
        h += '<div class="gq-line" aria-label="만든 문장"></div><div class="gq-bank">' + W.map(function (k) { return '<button type="button" class="gq-chip gq-w" data-k="' + k + '">' + gqEsc(q.words[k]) + '</button>'; }).join('') + '</div>';
      }
      body.innerHTML = h;
      // 2026-11-12 (사용자) 캐릭터를 문제 옆으로: 라벨·지시문·문제 글을 묶어 캐릭터와 한 줄에
      // 2026-11-12 (사용자 듀오링고 예시) 위: 라벨·지시문 / 아래: 캐릭터 + 오른쪽 말풍선(문제 글. 문제 글 없는 형식은 캐릭터 한마디)
      var head = document.createElement('div'), bub = document.createElement('div'), qq = body.querySelector(':scope > .gq-q'); head.className = 'gq-head'; bub.className = 'gq-bub';
      if (qq) bub.appendChild(qq); else bub.classList.add('is-say');
      head.appendChild(gq.pal); head.appendChild(bub);
      var ins = body.querySelector(':scope > .gq-ins'); ins.after(head);
      gqMood('ask', q.t === 'match' ? '같은 뜻끼리 이어 볼까요?' : q.t === 'fill' ? '문장에 꼭 맞는 말은?' : /비슷한/.test(q.tag || '') ? '비슷한 말을 찾아봐요!' : (gq.round > 1 ? '이번엔 맞힐 수 있어요!' : '이 낱말, 알고 있나요?'));
      el.querySelector('.gq-go').textContent = '확인';
      gqCanCheck();
    };
    var gqCanCheck = function () {
      var q = gq.list[gq.i], ok = false, el = gq.el;
      if (q.t === 'choose' || q.t === 'fill') ok = gq.sel != null;
      else if (q.t === 'order') ok = el.querySelectorAll('.gq-line .gq-chip').length === q.words.length;
      var go = el.querySelector('.gq-go'); go.disabled = !ok && gq.state === 'ask'; go.hidden = q.t === 'match' && gq.state === 'ask';
    };
    var gqFeedback = function (good, msg) {
      var el = gq.el, q = gq.list[gq.i]; gq.state = 'fb';
      if (good) { gq.ok++; gq.streak++; gq.best = Math.max(gq.best, gq.streak); } else { gq.streak = 0; gq.wrong.push(q); }
      el.classList.add(good ? 'is-ok' : 'is-bad');
      gqMood(good ? 'ok' : 'bad', good ? (gq.streak >= 2 ? gq.streak + '연속! 대단해요!' : '맞았어요!') : '괜찮아요, 틀린 문제에 담아 둘게요.');
      // 2026-11-13 학습 화면과 같은 문구 (단계별 칭찬 / 정답 알려 주기)
      var GQ_OK = { '2': '뜻을 정확히 알고 있네요!', '3': '비슷한 말을 잘 찾았어요!', '4': '문맥에 딱 맞는 말이에요!' }, step = ((q.tag || '').match(/^(\d)단계/) || [])[1];
      el.querySelector('.gq-fb b').textContent = good ? (GQ_OK[step] || GQ_PRAISE[(gq.i + gq.ok) % GQ_PRAISE.length]) : (q.opts && q.a != null ? '정답은 ‘' + q.opts[q.a] + '’예요' : '조금 헷갈렸어요');
      el.querySelector('.gq-fb span').textContent = msg || '';
      var st = el.querySelector('.gq-streak'); st.textContent = gq.streak >= 2 ? gq.streak + '문제 연속 정답' : ''; st.classList.toggle('is-on', gq.streak >= 2);
      el.querySelector('.gq-bar i').style.width = ((gq.i + 1) / gq.list.length * 100) + '%';
      var go = el.querySelector('.gq-go'); go.hidden = false; go.disabled = false; go.textContent = '계속하기'; go.focus({ preventScroll: true });
    };
    var gqCheck = function () {
      var q = gq.list[gq.i], el = gq.el, good;
      if (q.t === 'choose' || q.t === 'fill') {
        good = gq.sel === q.a;
        Array.prototype.forEach.call(el.querySelectorAll(q.t === 'choose' ? '.gq-opt' : '.gq-w'), function (b) { var k = +b.dataset.k; if (k === q.a) b.classList.add('is-right'); else if (k === gq.sel) b.classList.add('is-wrong'); b.disabled = true; });
        if (q.t === 'fill') { var bl = el.querySelector('.gq-blank'); bl.textContent = q.opts[q.a]; bl.classList.add(good ? 'is-right' : 'is-wrong'); bl.disabled = true; }
        gqFeedback(good, good ? '' : (q.t === 'choose' ? '정답: ' + q.opts[q.a] + ' — ' : '') + q.why);
      } else if (q.t === 'order') {
        var got = Array.prototype.map.call(el.querySelectorAll('.gq-line .gq-chip'), function (b) { return +b.dataset.k; });
        good = got.join() === q.words.map(function (w, k) { return k; }).join();
        Array.prototype.forEach.call(el.querySelectorAll('.gq-chip'), function (b) { b.disabled = true; });
        el.querySelector('.gq-line').classList.add(good ? 'is-right' : 'is-wrong');
        gqFeedback(good, good ? '' : '정답: ' + q.hint);
      }
    };
    var gqNext = function () {
      gq.i++;
      if (gq.i < gq.list.length) return gqRender();
      var el = gq.el; el.classList.remove('is-ok', 'is-bad'); el.classList.add('is-end'); gq.state = 'end';
      el.querySelector('.gq-bar i').style.width = '100%';
      var miss = gq.wrong.length, body = el.querySelector('.gq-body');
      // 2026-11-13 사용자 요청 "체험이 재미있어 보여야 본학습도 한다": 성취감 → 얻은 것(낱말) → 본 학습 미리보기 → [본 학습 시작하기]
      var palKeep = gq.pal, n = gq.list.length, ok = n - miss;
      var head = gq.round > 1 ? (miss ? '한 번 더 하면 끝!' : '재학습 완료!') : ok === n ? '완벽해요!' : ok >= 3 ? '감 잡았어요!' : '좋은 출발이에요!';
      var sub = gq.round > 1 ? '틀렸던 낱말을 다시 익혔어요.' : '낱말 ' + n + '개 중 <b>' + ok + '개</b>를 맞혔어요.';
      var ans = function (q) { return q.opts && q.a != null ? q.opts[q.a] : (q.ans || q.q || ''); };
      var words = gq.list.map(function (q) { var bad = gq.wrong.indexOf(q) > -1; return '<li class="' + (bad ? 'is-x' : 'is-o') + '"><i aria-hidden="true">' + (bad ? '!' : '✓') + '</i>' + gqEsc(ans(q)) + '</li>'; }).join('');
      var conf = ''; /* 꽃가루는 승급 때만 → 끝 화면은 제목 위 빗금만 */
      body.innerHTML = '<div class="gq-end">' + (conf ? '<div class="gq-conf" aria-hidden="true">' + conf + '</div>' : '') +
        '<p class="gq-end-tag">' + (gq.round > 1 ? '재학습' : '오늘의 체험 완료') + '</p><p class="gq-end-h"><span class="gq-tick" aria-hidden="true"><i style="--a:-34deg;--d:0s"></i><i style="--a:-17deg;--d:.25s"></i><i style="--a:0deg;--d:.1s"></i><i style="--a:17deg;--d:.35s"></i><i style="--a:34deg;--d:.18s"></i></span>' + head + '</p><p class="gq-end-sub">' + sub + '</p>' +
        '<div class="gq-words"><p>오늘 만난 낱말</p><ul>' + words + '</ul></div>' +
        '<div class="gq-next"><p class="gq-next-t">본 학습에서는 이렇게 이어져요</p>' +
          '<ol class="gq-next-steps"><li><b>1</b>단어 익히기</li><li><b>2</b>뜻·단어 고르기</li><li><b>3</b>비슷한 말 찾기</li><li><b>4</b>예문 완성하기</li></ol>' +
          '<p class="gq-next-p">하루 <b>4단계 · 약 20분</b>. 마칠 때마다 Day 한 칸이 채워지고, Day 5개면 세트 1개, 세트가 쌓이면 등급이 올라요.</p>' +
          '<div class="gq-next-tier"><img src="/media/allga/tiers/tier-bronze.png" alt="브론즈"><span class="gq-next-days" aria-hidden="true"><i class="on"></i><i></i><i></i><i></i><i></i></span><img src="/media/allga/tiers/tier-silver.png" alt="실버"></div>' +
          '<p class="gq-next-cap">첫 Day부터 브론즈 · 5세트면 실버</p></div>' +
        (miss ? '<button type="button" class="gq-retry">틀린 낱말 ' + miss + '개 다시 풀기</button>' : '<button type="button" class="gq-retry">처음부터 다시 풀기</button>') + '</div>';
      var endEl = body.querySelector('.gq-end'); endEl.insertBefore(palKeep, endEl.querySelector('.gq-end-tag'));
      gqMood('end', ok >= 3 ? '오늘 체험 끝! 잘했어요!' : '첫걸음 축하해요!');
      var go = el.querySelector('.gq-go'); go.hidden = false; go.disabled = false; go.textContent = '본 학습 시작하기 →';
      el.querySelector('.gq-count').textContent = ''; var st = el.querySelector('.gq-streak'); st.textContent = ''; st.classList.remove('is-on');
    };
    var gqClick = function (e) {
      var b = e.target.closest('button'); if (!b || b.disabled || !gq.el.contains(b)) return;
      var q = gq.list[gq.i], el = gq.el;
      if (b.classList.contains('gq-go')) {
        if (gq.state === 'ask') return gqCheck();
        if (gq.state === 'fb') return gqNext();
        if (gq.state === 'end') { location.href = '/study/?p=0'; return; }
      }
      if (b.classList.contains('gq-retry')) { if (gq.state === 'end') { var again = gq.wrong.slice(); return again.length ? gqStart(again, gq.round + 1) : gqStart(GQ.slice(), 1); } return; }
      if (b.classList.contains('gq-skip')) { if (gq.state === 'ask') { gq.streak = 0; gq.wrong.push(q); gqNext(); } return; }
      if (gq.state !== 'ask') return;
      if (q.t === 'choose' && b.classList.contains('gq-opt')) {
        Array.prototype.forEach.call(el.querySelectorAll('.gq-opt'), function (o) { o.classList.toggle('is-sel', o === b); });
        gq.sel = +b.dataset.k;
      } else if (q.t === 'fill') {
        var bl = el.querySelector('.gq-blank');
        if (b.classList.contains('gq-w')) { Array.prototype.forEach.call(el.querySelectorAll('.gq-w'), function (o) { o.classList.toggle('is-used', o === b); }); gq.sel = +b.dataset.k; bl.textContent = q.opts[gq.sel]; bl.classList.add('is-full'); }
        else if (b === bl) { gq.sel = null; bl.textContent = ''; bl.classList.remove('is-full'); Array.prototype.forEach.call(el.querySelectorAll('.gq-w'), function (o) { o.classList.remove('is-used'); }); }
      } else if (q.t === 'order' && b.classList.contains('gq-w')) {
        var line = el.querySelector('.gq-line'), bank = el.querySelector('.gq-bank');
        (b.parentNode === line ? bank : line).appendChild(b);
      } else if (q.t === 'match') {
        if (b.classList.contains('is-done')) return;
        var side = b.classList.contains('gq-l') ? 'gq-l' : 'gq-r';
        Array.prototype.forEach.call(el.querySelectorAll('.' + side), function (o) { o.classList.toggle('is-sel', o === b && !o.classList.contains('is-sel')); });
        var l = el.querySelector('.gq-l.is-sel'), r = el.querySelector('.gq-r.is-sel');
        if (l && r) {
          if (l.dataset.k === r.dataset.k) { [l, r].forEach(function (o) { o.classList.remove('is-sel'); o.classList.add('is-done'); o.disabled = true; }); gq.mDone++; }
          else { gq.mMiss++; [l, r].forEach(function (o) { o.classList.remove('is-sel'); o.classList.add('is-shake'); setTimeout(function () { o.classList.remove('is-shake'); }, 450); }); }
          if (gq.mDone === q.pairs.length) setTimeout(function () { gqFeedback(gq.mMiss === 0, gq.mMiss ? '모두 짝지었어요. ' + gq.mMiss + '번 헷갈렸으니 재학습에서 한 번 더!' : ''); }, 350);
        }
      }
      gqCanCheck();
    };
    var applyGameQuiz = function () {
      if (!isC) return;
      var sec = document.querySelector('section[aria-label="직접 풀어 보기"]'); if (!sec) return;
      var host = sec.querySelector('.max-w-4xl'); if (!host) return;
      if (gq.el && gq.el.isConnected) return;
      sec.classList.add('has-gq');
      var el = document.createElement('div'); el.className = 'gq';
      el.innerHTML = '<div class="gq-top"><div class="gq-bar" role="progressbar" aria-label="진행"><i></i></div><span class="gq-streak" aria-live="polite"></span><span class="gq-count" aria-live="polite"></span></div>' +
        '<div class="gq-main"><div class="gq-pal" aria-hidden="true"><p class="gq-say"></p><img class="gq-mascot" alt="" src="' + GQ_FACE.ask + '"></div><div class="gq-body" aria-live="polite"></div></div>' +
        '<div class="gq-foot"><div class="gq-fb" aria-live="assertive"><em aria-hidden="true"></em><div><b></b><span></span></div></div><button type="button" class="gq-skip">건너뛰기</button><button type="button" class="gq-go">확인</button></div>';
      host.appendChild(el); gq.el = el; gq.pal = el.querySelector('.gq-pal');
      ['ok', 'bad', 'end'].forEach(function (k) { var im = new Image(); im.src = GQ_FACE[k]; });
      el.addEventListener('click', gqClick);
      gqStart(GQ.slice(), 1);
    };
    var applyCopy = function () {
      COPY.forEach(function (c) {
        var el = c.find();
        if (el && el.textContent.indexOf(c.mark) === -1) el.innerHTML = c.html;
      });
      // React가 페이지를 다시 그리며(하이드레이션) A안 문구로 잠깐 되돌리는 일이 끝날 때까지 기다림:
      // 페이지 로드가 끝났고, 마지막 문구 바꾸기 뒤 0.2초 동안 더 바뀌는 게 없고, C/B 문구가 들어가 있으면 보여 줌
      if (!copyOk) { clearTimeout(quietT); quietT = setTimeout(function () {
        if (pageLoaded && document.querySelector('main > section:first-of-type h1 .b-copy')) { copyOk = true; tryReveal(); }
      }, 200); }
      applyFooter();
      applyMerge();
      applyGallery();
      applyHeroCircle();
      applyTrail();
      startDropdown();
      applySteps();
      applyShapes();
      applyVignette();
      if (isC && (!gm.el || !gm.el.isConnected)) buildGridMarks();
      applyHook();
      applyLoop();
      applyStory();
      applyQuizCopy();
      applyGameQuiz();
    };
    // 01 생각 + 02 지도 합치기: 원장님 문장을 02 영역 맨 위 큰 제목으로 옮기고 01 영역은 B안에서 숨김(CSS)
    var applyMerge = function () {
      var h = pick('글이 지도가 되는 순간', 'h2');
      if (!h || (h.previousElementSibling && h.previousElementSibling.classList.contains('b-merge-head'))) return;
      var old = document.querySelector('.b-merge-head'); if (old) old.remove();
      var p = document.createElement('p');
      p.className = 'b-merge-head';
      p.innerHTML = '우리는 스스로 생각하고 표현하는 힘을 기르는 것이 진짜 교육이라고 믿습니다.'.split(' ').map(function (w) { return '<span class="b-w">' + w + '</span>'; }).join(' ');
      h.before(p);
    };
    var startCopy = function () {
      applyCopy();
      var t = null;
      new MutationObserver(function () { if (t) return; t = setTimeout(function () { t = null; applyCopy(); }, 50); })
        .observe(document.body, { subtree: true, childList: true, characterData: true });
      window.addEventListener('load', applyCopy);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startCopy); else startCopy();

    var badge = function () {
      if (!document.body || document.querySelector('.allga-skin-badge')) return;
      var b = document.createElement('div');
      b.className = 'allga-skin-badge';
      b.innerHTML = 'B안 보는 중 <a href="?skin=a">A안</a>';
      document.body.appendChild(b);
    };
    window.addEventListener('load', function () { badge(); setTimeout(badge, 1500); });
  } catch (e) { /* 스킨을 못 켜도 화면은 엽니다. */ }
})();

// B안: '학습하기'와 /learn/* 학습 화면을 학습 프로그램 시안(/study)으로 연결 (2026-11-13, 로컬 작업)
// /study 는 작업원본/allga-program-시안 을 옮긴 화면. ?p= 는 프로그램 순서(초등 어휘 0 … 올가국어 5)
(function () {
  try {
    var skin = localStorage.getItem('allga.skin');
    var q = new URLSearchParams(location.search).get('skin');
    if (q) skin = q;
    if (skin !== 'b' && skin !== 'c') return;
    var MAP = { 'elem-vocab': 0, 'mid-high-vocab': 1, 'grammar': 2, 'literacy': 3, 'idiom': 4, 'olga': 5 };
    var toStudy = function (path) {
      var m = /^\/learn\/([^\/?#]+)/.exec(path || '');
      if (!m || !(m[1] in MAP)) return null;
      return '/study/?p=' + MAP[m[1]];
    };
    var here = toStudy(location.pathname);
    if (here) { location.replace(here); return; }
    window.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || !e.target.closest) return;
      var olga = e.target.closest('main article[data-hue="olga"] a');
      if (olga && document.querySelector('section[data-hue="programs"]')) { e.preventDefault(); e.stopPropagation(); location.href = '/study/?p=5'; return; }
      var a = e.target.closest('a[href^="/learn/"]');
      if (!a) return;
      var to = toStudy(a.getAttribute('href'));
      if (!to) return;
      e.preventDefault(); e.stopPropagation();
      location.href = to;
    }, true);
  } catch (e) {}
})();

// B안 헤더: 사용자 이름 옆 로그아웃 / 로그아웃 상태면 '로그인' (2026-11-13, 시안: 이 브라우저에만 저장, 학습 화면 /study 와 같은 키)
(function () {
  try {
    var skin = new URLSearchParams(location.search).get('skin') || localStorage.getItem('allga.skin');
    if (skin !== 'b' && skin !== 'c') return;
    var isOn = function () { try { return localStorage.getItem('allga.login') !== 'out'; } catch (e) { return true; } };
    var apply = function () {
      var h = document.querySelector('header'); if (!h) return;
      var who = Array.prototype.find.call(h.querySelectorAll('span'), function (s) { return /님\s*$/.test(s.textContent.trim()) && s.children.length > 0; });
      if (!who) return;
      var btn = h.querySelector('.b-auth');
      if (!btn) {
        btn = document.createElement('button'); btn.type = 'button'; btn.className = 'b-auth';
        btn.setAttribute('style', 'height:32px;padding:0 4px;border:0;background:none;font:inherit;font-size:14px;color:#686e5f;text-decoration:underline;text-underline-offset:3px;white-space:nowrap;cursor:pointer;margin-left:6px');
        btn.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); try { localStorage.setItem('allga.login', isOn() ? 'out' : 'in'); } catch (x) {} apply(); });
        who.insertAdjacentElement('afterend', btn);
      }
      var on = isOn();
      btn.textContent = on ? '로그아웃' : '로그인';
      who.style.display = on ? '' : 'none';
    };
    var start = function () { apply(); new MutationObserver(function () { if (!document.querySelector('header .b-auth')) apply(); }).observe(document.body, { childList: true, subtree: true }); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
    window.addEventListener('load', apply);
  } catch (e) {}
})();

// B안 메인 05 '직접 풀어 보기' 설명 아래 '학습 바로가기' 버튼 (2026-11-13 사용자)
(function () {
  try {
    var skin = new URLSearchParams(location.search).get('skin') || localStorage.getItem('allga.skin');
    if (skin !== 'b' && skin !== 'c') return;
    var add = function () {
      var h = Array.prototype.find.call(document.querySelectorAll('main h2'), function (x) { return /한 단어부터/.test(x.textContent); });
      if (!h || document.querySelector('.b-golearn')) return;
      var p = h.nextElementSibling && h.nextElementSibling.tagName === 'P' ? h.nextElementSibling : h;
      var a = document.createElement('a'); a.className = 'b-golearn'; a.href = '/programs'; a.textContent = '학습 바로가기';
      p.insertAdjacentElement('afterend', a);
    };
    var start = function () { add(); new MutationObserver(function () { if (!document.querySelector('.b-golearn')) add(); }).observe(document.body, { childList: true, subtree: true }); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  } catch (e) {}
})();

// B안: '상담 문의하기'를 오른쪽 아래 고정 버튼으로 (2026-11-13)
(function () {
  try {
    var skin = localStorage.getItem('allga.skin');
    var q = new URLSearchParams(location.search).get('skin');
    if (q) skin = q;
    if (skin !== 'b' && skin !== 'c') return;
    var add = function () {
      if (!document.body || document.querySelector('.b-float-consult')) return;
      var a = document.createElement('a');
      a.className = 'b-float-consult'; a.href = '/support/inquiry/new'; a.textContent = '상담 문의하기';
      document.body.appendChild(a);
      sync();
    };
    // 2026-11-13 사용자 요청: 홈 첫 화면에서는 숨기고(학습 시작하기 버튼과 겹침), 아래로 내리면 나타남
    var sync = function () {
      var el = document.querySelector('.b-float-consult'); if (!el) return;
      var home = location.pathname === '/' || location.pathname === '/index.html';
      el.classList.toggle('is-away', home && window.scrollY < window.innerHeight * 0.8);
    };
    window.addEventListener('scroll', sync, { passive: true });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add); else add();
    window.addEventListener('load', function () { add(); setTimeout(add, 1500); });
  } catch (e) {}
})();

// B안 06 학습 순환: 단계마다 카드(작은 학습 화면 그림 + 제목 + 설명) 붙이기 (2026-11-13)
(function () {
  try {
    var skin = localStorage.getItem('allga.skin');
    var q = new URLSearchParams(location.search).get('skin');
    if (q) skin = q;
    if (skin !== 'b' && skin !== 'c') return;
    var CARDS = [
      ['<div class="b-mini m1"><div class="w"><b>마련하다</b><em>헤아려서 갖추다.</em></div></div>', '학습', '처음 만나는 낱말을 뜻·예문·문제로 익혀요.'],
      ['<div class="b-mini m2"><span>견고하다</span><span>충직하다</span></div>', '틀린 문제', '틀린 문제만 따로 모아 한 번 더 풀어요.'],
      ['<div class="b-mini m3"><i class="bar"></i><span class="ok">모두 맞혔어요</span></div>', '재학습', '모두 맞히면 그 단계가 완료돼요.']
    ];
    var build = function () {
      var nodes = document.querySelectorAll('.c-loop .c-bar .c-loop-node');
      Array.prototype.forEach.call(nodes, function (n, i) {
        if (!CARDS[i] || n.querySelector('.b-lcard')) return;
        var c = document.createElement('div'); c.className = 'b-lcard';
        c.innerHTML = CARDS[i][0] + '<p class="b-lt">' + CARDS[i][1] + '</p><p class="b-ld">' + CARDS[i][2] + '</p>';
        n.appendChild(c);
      });
    };
    var t = null;
    var start = function () {
      build();
      new MutationObserver(function () { if (t) return; t = setTimeout(function () { t = null; build(); }, 80); })
        .observe(document.body, { subtree: true, childList: true });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  } catch (e) {}
})();

// B안 06 학습 순환: 카드가 화면 60% 높이를 지나면 그 단계 켜짐 (2026-11-13)
(function () {
  try {
    var skin = localStorage.getItem('allga.skin');
    var q = new URLSearchParams(location.search).get('skin');
    if (q) skin = q;
    if (skin !== 'b' && skin !== 'c') return;
    var f = 0;
    var tick = function () {
      f = 0;
      var vh = window.innerHeight;
      Array.prototype.forEach.call(document.querySelectorAll('.c-loop .c-bar .c-loop-node'), function (n) {
        n.classList.toggle('b-on', n.getBoundingClientRect().top < vh * 0.6);
      });
    };
    var req = function () { if (!f) f = requestAnimationFrame(tick); };
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    window.addEventListener('load', req);
    setTimeout(req, 1500);
  } catch (e) {}
})();

// B안 모바일 줄바꿈: 뜻 단위로 끊기 (휴대폰에서만 보이는 <br class="m-br">) (2026-11-13)
(function () {
  try {
    var skin = localStorage.getItem('allga.skin');
    var q = new URLSearchParams(location.search).get('skin');
    if (q) skin = q;
    if (skin !== 'b' && skin !== 'c') return;
    // [바꿀 문장, 줄 나눌 자리 앞에 오는 글자들]
    var RULES = [
      ['한 단어부터, 지금 시작해 보세요.', ['한 단어부터,']],
      ['그 힘은 한 단어를 정확히 아는 데서 시작합니다.', ['그 힘은 한 단어를']],
      ['매일 다섯 단어를 네 번에 걸쳐 익힙니다.', ['매일 다섯 단어를']],
      ['시험에 나오는 어휘를 한자로 이해합니다.', ['시험에 나오는 어휘를']],
      ['한 편의 지문을 아홉 가지 활동으로 읽습니다.', ['한 편의 지문을']],
      ['하루 세 개의 성어를 뜻과 쓰임까지 익힙니다.', ['하루 세 개의 성어를']],
      ['초등 어휘부터 학교 문법, 지문 독해, 한자성어까지.', ['초등 어휘부터 학교 문법,']],
      ['뜻·비슷한 말·예문으로 낱말을 익혀요.', ['뜻·비슷한 말·예문으로 낱말을 익혀요.']],
      ['어휘 5분, 문법 5분, 문해력 10분.', ['어휘 5분, 문법 5분, 문해력 10분.']],
      ['다섯 문장의 참과 거짓을 가립니다.', ['지문을 읽고,', '거짓을 가립니다.']],
      ['흩어진 문장을 원래의 순서로 되돌립니다.', ['핵심 문장을 고르고,']],
      ['그림으로 그리고, 문제를 풀며', ['그림으로 그리고,']]
    ];
    var norm = function (s) { return s.replace(/\s+/g, ' ').trim(); };
    var walk = function () {
      var tw = document.createTreeWalker(document.querySelector('main') || document.body, NodeFilter.SHOW_TEXT);
      var n, hits = [];
      while ((n = tw.nextNode())) {
        var t = norm(n.textContent); if (t.length < 8) continue;
        RULES.forEach(function (r) {
          if (t.indexOf(r[0]) === -1) return;
          r[1].forEach(function (pre) {
            var i = n.textContent.indexOf(pre); if (i === -1) return;
            var end = i + pre.length;
            var next = n.nextSibling;
            if (next && next.nodeType === 1 && next.classList && next.classList.contains('m-br')) return;
            hits.push([n, end]);
          });
        });
      }
      hits.sort(function (x, y) { return y[1] - x[1]; }); // 같은 글에서 뒤쪽부터 나눠야 앞 위치가 안 바뀜
      hits.forEach(function (h) {
        var node = h[0], end = h[1];
        if (!node.parentNode || end >= node.textContent.length) return;
        var rest = node.splitText(end);
        rest.textContent = rest.textContent.replace(/^\s+/, ' ');
        var br = document.createElement('br'); br.className = 'm-br';
        node.parentNode.insertBefore(br, rest);
      });
      // 원장님 문장(빨강 채움): 단어 사이에 줄 나눔 → [우리는 스스로][생각하고 표현하는 힘을][기르는 것이 진짜][교육이라고 믿습니다.]
      var mh = document.querySelector('.b-merge-head');
      if (mh && !mh.querySelector('.m-br')) {
        var ws = mh.querySelectorAll('.b-w');
        if (ws.length === 10) {
          [2, 5, 8].forEach(function (k) { var br = document.createElement('br'); br.className = 'm-br'; ws[k].before(br); });
          window.dispatchEvent(new Event('resize'));
        }
      }
    };
    var t = null;
    var safe = function () { try { walk(); } catch (e) {} };
    var start = function () {
      safe();
      new MutationObserver(function () { if (t) return; t = setTimeout(function () { t = null; safe(); }, 120); })
        .observe(document.body, { subtree: true, childList: true, characterData: true });
    };
    // React가 화면을 다 그린 뒤(load + 0.6초)에 적용 — 그 전에 글을 나누면 React가 다시 그리며 충돌
    if (document.readyState === 'complete') setTimeout(start, 600); else window.addEventListener('load', function () { setTimeout(start, 600); });
  } catch (e) {}
})();

// B안 휴대폰 메뉴: 맨 아래에 '○○ 님 · 로그아웃' (헤더의 로그아웃 버튼과 같은 동작) (2026-11-13)
(function () {
  try {
    var skin = new URLSearchParams(location.search).get('skin') || localStorage.getItem('allga.skin');
    if (skin !== 'b' && skin !== 'c') return;
    var put = function () {
      var nav = document.querySelector('header #site-drawer > nav'); if (!nav) return;
      var src = document.querySelector('header .b-auth'); if (!src) return;
      var box = nav.querySelector('.b-drawer-auth');
      if (!box) {
        box = document.createElement('div'); box.className = 'b-drawer-auth';
        box.innerHTML = '<span></span><button type="button"></button>';
        box.querySelector('button').addEventListener('click', function (e) { e.preventDefault(); src = document.querySelector('header .b-auth'); if (src) src.click(); put(); });
        nav.appendChild(box);
      }
      var name = Array.prototype.find.call(document.querySelectorAll('header span'), function (s) { return /님\s*$/.test(s.textContent.trim()) && !s.children.length; });
      var on = src.textContent.trim() === '로그아웃';
      box.querySelector('span').textContent = on && name ? name.textContent.trim() : '로그인하면 이어서 학습할 수 있어요';
      box.querySelector('button').textContent = src.textContent.trim();
    };
    var go = function () { put(); new MutationObserver(function () { if (!document.querySelector('header #site-drawer .b-drawer-auth')) put(); }).observe(document.body, { childList: true, subtree: true }); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  } catch (e) {}
})();

// B안 학습 프로그램: 맨 위 '내 레벨' 카드 (2026-11-13, 시안 — 값은 예시. 실제 진도 저장이 생기면 연결)
(function () {
  try {
    var skin = new URLSearchParams(location.search).get('skin') || localStorage.getItem('allga.skin');
    if (skin !== 'b' && skin !== 'c') return;
    var DAYS = ['월', '화', '수', '목', '금', '토', '일'];
    var put = function () {
      var hl = document.querySelector('section.hl[data-hue="programs"]'); if (!hl || document.querySelector('.b-lv')) return;
      var name = (Array.prototype.find.call(document.querySelectorAll('header span'), function (s) { return /님\s*$/.test(s.textContent.trim()) && !s.children.length; }) || {}).textContent || '';
      var t = (new Date().getDay() + 6) % 7; // 월=0
      // 세트 기준 (2026-11-13 사용자): 이번 세트 5칸 = 오늘 학습 5번. 예시: 2번 끝, 3번째가 오늘
      var DONE = 2; t = DONE;
      var week = [1, 2, 3, 4, 5].map(function (d, i) { return '<span class="' + (i < DONE ? 'on' : i === DONE ? 'today' : '') + '"><i></i>' + d + '</span>'; }).join('');
      var box = document.createElement('div'); box.className = 'b-lv';
      // C안 (2026-11-13): 왼쪽 큰 등급 엠블럼, 오른쪽 등급·세트 막대·이번 주 요일, 아래 연속 일수
      box.className = 'b-lv b-lv-c';
      box.innerHTML = '<div class="b-lv-top"><div class="b-lv-badge"></div>' +
        '<div class="b-lv-info"><div class="b-lv-row"><span class="b-lv-lab">세트</span><div class="b-lv-bar"><i></i></div><span class="b-lv-sets">22/30</span></div>' +
        '<div class="b-lv-row"><span class="b-lv-lab">Day</span><div class="b-lv-week">' + week + '</div></div></div></div>' +
        '<p class="b-lv-streak"><em>23번째 세트</em> 진행 중</p>';
      hl.insertAdjacentElement('afterend', box);
      requestAnimationFrame(function () { setTimeout(function () { box.classList.add('is-in'); }, 200); });
    };
    var go = function () { put(); new MutationObserver(function () { if (!document.querySelector('.b-lv')) put(); }).observe(document.body, { childList: true, subtree: true }); };
    if (document.readyState === 'complete') setTimeout(go, 400); else window.addEventListener('load', function () { setTimeout(go, 400); });
  } catch (e) {}
})();

// B안 내 상태 줄 + 학습 시간: b-me.js (학습 프로그램 페이지에서 불러옴). '학습 시작'을 누르면 오늘 학습 시간이 흐르기 시작 (2026-11-13)
(function () {
  try {
    var skin = new URLSearchParams(location.search).get('skin') || localStorage.getItem('allga.skin');
    if (skin !== 'b' && skin !== 'c') return;
    var KEY = 'allga.study.start';
    var startNow = function () {
      try {
        var d = new Date(), k = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
        var v = JSON.parse(localStorage.getItem(KEY) || 'null');
        if (!v || v.d !== k) localStorage.setItem(KEY, JSON.stringify({ d: k, t: Date.now() - 18 * 60 * 1000 })); // 시안: 2분 남음부터
      } catch (e) {}
    };
    window.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a'); if (!a) return;
      if (/학습\s*시작/.test(a.textContent) || a.closest('main article[data-hue]')) startNow();
    }, true);
    if (/^\/programs/.test(location.pathname) && !document.querySelector('script[src="/b-me.js"]')) {
      var sc = document.createElement('script'); sc.src = '/b-me.js'; document.head.appendChild(sc);
    }
  } catch (e) {}
})();

// B안 학습 프로그램: '이어서 하기' 카드 + 오늘의 퀘스트 (2026-11-13, 시안 값). 참고: 세종학당 학습 이어하기, Duolingo 오늘의 퀘스트
(function () {
  try {
    var skin = new URLSearchParams(location.search).get('skin') || localStorage.getItem('allga.skin');
    if (skin !== 'b' && skin !== 'c') return;
    if (!/^\/programs/.test(location.pathname)) return;
    var put = function () {
      var grid = document.getElementById('program-grid'); if (!grid || document.querySelector('.b-resume')) return;
      var w = document.createElement('div'); w.className = 'shell b-today';
      w.innerHTML =
        '<section class="b-resume" aria-label="학습 이어하기"><p class="b-sec">학습 이어하기</p>' +
        '<a class="b-resume-card" href="/study/?p=0"><span class="b-resume-ring" role="img" aria-label="오늘 4단계 중 2단계 완료"><svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="34" pathLength="100" class="on" style="stroke-dasharray:22 78;stroke-dashoffset:-1.5"/><circle cx="40" cy="40" r="34" pathLength="100" class="on" style="stroke-dasharray:22 78;stroke-dashoffset:-26.5"/><circle cx="40" cy="40" r="34" pathLength="100" class="now" style="stroke-dasharray:22 78;stroke-dashoffset:-51.5"/><circle cx="40" cy="40" r="34" pathLength="100" class="" style="stroke-dasharray:22 78;stroke-dashoffset:-76.5"/></svg><span><b>2</b>/4<small>단계</small></span></span><span class="b-resume-body">' +
        '<span class="b-resume-course">초등 어휘력 완성</span><span class="b-resume-where">비슷한 말 찾기</span>' +
        '<span class="b-resume-go">이어하기</span></span>' +
        '</a></section>' +
        '<section class="b-quest" aria-label="오늘의 퀘스트"><p class="b-sec">오늘의 퀘스트</p>' +
        '<ul><li><span>새 낱말 10개 익히기</span><b>6 / 10</b><div class="b-q-bar"><i style="width:0%"></i></div></li>' +
        '<li><span>틀린 문제 다시 풀기</span><b>2 / 2</b><div class="b-q-bar"><i style="width:100%"></i></div><em>완료</em></li></ul></section>';
      grid.before(w);
    };
    var go = function () { put(); new MutationObserver(function () { if (!document.querySelector('.b-resume')) put(); }).observe(document.body, { childList: true, subtree: true }); };
    if (document.readyState === 'complete') setTimeout(go, 300); else window.addEventListener('load', function () { setTimeout(go, 300); });
  } catch (e) {}
})();

// B안 학습 프로그램: 로그인했을 때 / 안 했을 때 화면 나누기 (2026-11-13)
// 로그인: 등급 띠 + 학습 이어하기 + 오늘의 퀘스트 + 학습하기 / 비로그인: 제목 + 로그인 안내 + 학습하기 (상태 줄·시계 숨김)
(function () {
  try {
    var skin = new URLSearchParams(location.search).get('skin') || localStorage.getItem('allga.skin');
    if (skin !== 'b' && skin !== 'c') return;
    if (!/^\/programs/.test(location.pathname)) return;
    var isOn = function () { try { return localStorage.getItem('allga.login') !== 'out'; } catch (e) { return true; } };
    var sync = function () {
      document.documentElement.classList.toggle('b-out', !isOn());
      // 로그인: 상단 띠 제목 = 인사, '오늘은 어떤 학습을 할까요?'는 학습 이어하기 위 제목으로
      var h1 = document.querySelector('section.hl[data-hue="programs"] h1');
      var who = (Array.prototype.find.call(document.querySelectorAll('header span'), function (x) { return /님\s*$/.test(x.textContent.trim()) && !x.children.length; }) || {}).textContent || '';
      if (h1) h1.setAttribute('data-greet', (who ? who.trim() + ', ' : '') + '오늘도 이어 가요');
      var td = document.querySelector('.b-today');
      if (td && !td.querySelector('.b-today-h')) { var hh = document.createElement('h2'); hh.className = 'b-today-h'; hh.textContent = '오늘은 어떤 학습을 할까요?'; td.insertBefore(hh, td.querySelector('.b-resume')); }
      var today = document.querySelector('.b-today');
      if (today && !today.querySelector('.b-guest')) {
        var g = document.createElement('section'); g.className = 'b-guest'; g.setAttribute('aria-label', '로그인 안내');
        g.innerHTML = '<p class="b-guest-t">로그인하면 이어서 학습하고<br>등급을 모을 수 있어요</p><p class="b-guest-d">어디까지 했는지, 이번 주 연속 기록, 완료한 세트가 저장돼요.</p><button type="button" class="b-guest-go">로그인</button>';
        g.querySelector('button').addEventListener('click', function () { var b = document.querySelector('header .b-auth'); if (b && !isOn()) b.click(); setTimeout(sync, 60); });
        today.insertBefore(g, today.firstChild);
      }
    };
    var go = function () { sync(); new MutationObserver(function () { if (document.querySelector('.b-today') && (!document.querySelector('.b-guest') || !document.querySelector('.b-today-h'))) sync(); }).observe(document.body, { childList: true, subtree: true }); window.addEventListener('click', function () { setTimeout(sync, 80); }); };
    if (document.readyState === 'complete') setTimeout(go, 500); else window.addEventListener('load', function () { setTimeout(go, 500); });
  } catch (e) {}
})();

// B안 시안 표시 이름: snallga_test → 김올샤 (2026-11-13 사용자). 헤더·메뉴·인사 모두, 아바타 첫 글자 '김'
(function () {
  try {
    var skin = new URLSearchParams(location.search).get('skin') || localStorage.getItem('allga.skin');
    if (skin !== 'b' && skin !== 'c') return;
    var fix = function () {
      var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), n;
      while ((n = w.nextNode())) {
        if (n.textContent.indexOf('snallga_test') > -1) n.textContent = n.textContent.replace(/snallga_test/g, '김올샤');
        else if (n.textContent.trim() === 'S' && n.parentElement && n.parentElement.closest('header') && /rounded-full/.test(n.parentElement.className)) n.textContent = '김';
      }
      Array.prototype.forEach.call(document.querySelectorAll('[data-greet*="snallga_test"]'), function (e) { e.setAttribute('data-greet', e.getAttribute('data-greet').replace(/snallga_test/g, '김올샤')); });
    };
    var t = null;
    var go = function () { fix(); new MutationObserver(function () { if (t) return; t = setTimeout(function () { t = null; fix(); }, 60); }).observe(document.body, { subtree: true, childList: true, characterData: true }); };
    if (document.readyState === 'complete') setTimeout(go, 200); else window.addEventListener('load', function () { setTimeout(go, 200); });
  } catch (e) {}
})();
