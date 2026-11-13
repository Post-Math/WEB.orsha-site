// B안 '내 상태 줄' + 학습 시간 (2026-11-13, 시안)
// 학습 프로그램(/programs)과 학습 화면(/study) 헤더 바로 아래에 항상: 등급 · 세트 막대 · 오늘 학습 시간
// 등급 = 완료한 세트 수(브론즈 0 · 실버 5 · 골드 15 · 플래티넘 30 · 다이아 50 · 마스터 80 · 그랜드마스터 120). 세트 수는 아직 예시 값(22)
// 학습 시간: '학습 시작'을 누르거나 학습 화면에 들어간 순간부터 흐름(오늘 날짜 기준, 이 브라우저에 저장)
(function () {
  try {
    var KEY = 'allga.study.start';
    var today = function () { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
    var read = function () { try { var v = JSON.parse(localStorage.getItem(KEY) || 'null'); return v && v.d === today() ? v.t : null; } catch (e) { return null; } };
    var DEMO_DONE = 18 * 60 * 1000; // 시안 확인용: 이미 18분 했다고 보고 '2분 남음'부터 시작 (실서비스에서는 0)
    var start = function () { if (read()) return; try { localStorage.setItem(KEY, JSON.stringify({ d: today(), t: Date.now() - DEMO_DONE })); } catch (e) {} };
    window.allgaStudyStart = start;
    var on = function () { try { return localStorage.getItem('allga.login') !== 'out'; } catch (e) { return true; } };
    if (/^\/study/.test(location.pathname)) start();

    var TIERS = [['브론즈', 0], ['실버', 5], ['골드', 15], ['플래티넘', 30], ['다이아', 50], ['마스터', 80], ['그랜드마스터', 120]]; // 2026-11-13 확정: 22/30 기준
    var SETS = 22;
    var EN = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MASTER', 'GRANDMASTER'];
    var ti = 0; TIERS.forEach(function (t, i) { if (SETS >= t[1]) ti = i; });
    // 세트 막대 색 = 현재 등급 엠블럼 색 (2026-11-13)
    var TC = [['#d9a184','#a8664c','#f4e6de'],['#cdd1d6','#969ba3','#eef0f2'],['#d9b45a','#b88a2e','#f1e9d6'],['#bcc3e4','#808ac4','#eceef8'],['#cdb9ec','#9b80d4','#f1eafa'],['#dbaacb','#a8678f','#f6e8f1'],['#f2877a','#cf4237','#fbe5e1']];
    var cur = TIERS[ti], nxt = TIERS[ti + 1];
    var pct = nxt ? Math.round(SETS / nxt[1] * 100) : 100; // 표시 '22/30'과 같게 (22÷30)

    // 등급 메달: 육각형 + 별, 등급마다 색 (브론즈·실버·골드·플래티넘·다이아·마스터·그랜드마스터)
    // 고급스럽게 (2026-11-13 사용자 '키치해짐'): 사이트의 아치 모양 메달, 등급별 금속 톤 + 얇은 흰 선 아치 + 가는 별. 날개·리본 없음
    var MC = [['#d9b08c', '#a8754d'], ['#d8dadd', '#9aa0a6'], ['#e6c77a', '#b8913a'], ['#bfe0da', '#6fa59c'], ['#c4d4f2', '#5f7fc4'], ['#d4c6ee', '#7c62b8'], ['#f19a9d', '#c8141b']];
    var medal = function (i) {
      var c = MC[i];
      var svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 56'><defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='" + c[0] + "'/><stop offset='1' stop-color='" + c[1] + "'/></linearGradient></defs>" +
        "<path d='M4 54V24a20 20 0 0 1 40 0v30z' fill='url(%23g)'/>" +
        "<path d='M8.5 50.5V24a15.5 15.5 0 0 1 31 0v26.5z' fill='none' stroke='white' stroke-opacity='.75' stroke-width='1.2'/>" +
        "<path d='M24 22.5l2.3 4.9 5.3.6-3.9 3.6 1.1 5.2-4.8-2.7-4.8 2.7 1.1-5.2-3.9-3.6 5.3-.6z' fill='none' stroke='white' stroke-width='1.3' stroke-linejoin='round'/>" +
        (i >= 3 ? "<circle cx='24' cy='44' r='1.3' fill='white'/>" : '') + (i >= 5 ? "<circle cx='19.5' cy='44' r='1.3' fill='white'/><circle cx='28.5' cy='44' r='1.3' fill='white'/>" : '') +
        "</svg>";
      return 'url("data:image/svg+xml;utf8,' + svg.replace(/#/g, '%23').replace(/"/g, "'") + '")';
    };
    window.allgaTier = { name: cur[0], idx: ti, sets: SETS, next: nxt, pct: pct };
    if (!document.getElementById('b-me-style')) {
      var st = document.createElement('style'); st.id = 'b-me-style';
      st.textContent =
        '.b-me{border-top:1px solid rgba(221,221,221,.5);background:#fff}' +
        '.b-me>div{display:flex;align-items:center;gap:10px;height:44px;width:min(1280px,calc(100% - 48px));margin:0 auto}' +
        '.b-me-tier{flex:none;display:inline-flex;align-items:center;gap:6px;height:28px;padding:0;border-radius:0;background:none;color:#101010!important;font-size:13px;font-weight:800;text-decoration:none!important}' +
        '.b-me-tier i{width:20px;height:20px;border-radius:50%;background:#ec1c24;display:grid;place-items:center;font-style:normal;font-size:11px}' +
        '.b-me-xp{flex:1;min-width:0;display:flex;align-items:center;gap:8px}' +
        '.b-me-xp b{flex:1;height:8px;border-radius:999px;background:' + TC[ti][2] + ';overflow:hidden}' +
        '.b-me-xp b i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,' + TC[ti][0] + ',' + TC[ti][1] + ')}' +
        '.b-me-xp span{flex:none;font-size:12px;font-weight:700;color:#5f5f5f}' +
        '.b-me-time{flex:none;display:inline-flex;align-items:center;gap:5px;font-size:13px;font-weight:800;color:#101010;font-variant-numeric:tabular-nums}' +
        '.b-me-time svg{width:22px;height:22px;transform:rotate(-90deg)}.b-me-time circle{fill:none;stroke:#eceae4;stroke-width:5}.b-me-time circle.tv{stroke:#101010;stroke-linecap:round;transition:stroke-dasharray 1s linear}' +
        '.b-me-time.is-off{color:#a8a39a}' +
        'body:has(header>#site-drawer) header .b-me{display:none}' +
        'html.b-band-in header .b-me{display:none}' +
        'header.top .mychip{display:none!important}' +
        '.b-medal{display:inline-block;flex:none;width:24px;height:24px;background:center/contain no-repeat}' +
        ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster'].map(function (n, i) { return '.b-medal.t' + i + '{background-image:url(/media/allga/tiers/tier-' + n + '.png?v=4)}'; }).join('') + // 2026-11-13 v3: 같은 육각 틀·파스텔 금속·살짝 광

        '.b-me-tier{padding-left:0!important;gap:4px!important}.b-me-tier .b-medal{width:30px;height:30px;margin:-3px 0}' +
        '.b-lv-badge.b-lv-badge{background:none!important;box-shadow:none!important;width:76px!important;height:76px!important;border-radius:0!important}' +
        '.b-lv-badge .b-medal{width:88px;height:88px;filter:none}' +
        '.b-float-consult{display:none!important}' +
        '.b-clock{position:fixed;right:28px;bottom:28px;z-index:60;display:flex;align-items:center;gap:10px;padding:8px 18px 8px 8px;border:1.5px solid #e6e4df;border-radius:999px;background:#fff;box-shadow:0 10px 30px -12px rgba(40,30,20,.25)}' +
        '.b-clock svg{width:44px;height:44px;transform:rotate(-90deg)}.b-clock circle{fill:none;stroke:#f1efe5;stroke-width:5}.b-clock circle.tv{stroke:#101010;stroke-linecap:round;transition:stroke-dasharray 1s linear,stroke .4s}.b-clock.is-low circle.tv{stroke:#f59347}.b-clock.is-low b{color:#c2410c}' +
        '.b-clock span{font-size:14px;color:#5f5f5f;line-height:1.25}.b-clock small{display:block;font-size:12px}.b-clock b{font-size:18px;color:#101010;font-variant-numeric:tabular-nums}' +
        '.b-clock.is-off b{color:#a8a39a}' +
        'body:has(header>#site-drawer) .b-clock{display:none}' +
        '.b-cheer{position:fixed;inset:0;z-index:100;display:grid;place-items:center;background:rgba(16,16,16,.45);animation:bchFade .25s ease}' +
        '.b-cheer-card{position:relative;width:min(340px,calc(100% - 40px));padding:36px 24px 24px;border-radius:28px;background:#fff;text-align:center;animation:bchPop .5s cubic-bezier(.22,1.4,.36,1)}' +
        '.b-medal.t2{filter:saturate(1.25) brightness(1.08) contrast(1.08)}' +
        '.b-cheer-medal{width:132px;height:132px;margin:-8px auto 6px;animation:bchBounce 1.2s cubic-bezier(.22,1.4,.36,1) .2s both}' +
        '.b-cheer h2{margin:0;font-size:26px;font-weight:800;letter-spacing:-.03em;color:#101010}' +
        '.b-cheer p{margin:8px 0 0;font-size:15px;line-height:1.55;color:#5f5f5f;word-break:keep-all}.b-cheer p em{font-style:normal;color:#ec1c24;font-weight:800}' +
        '.b-cheer-btns{display:grid;gap:8px;margin-top:22px}.b-cheer-btns button{height:52px;border:0;border-radius:999px;font:inherit;font-size:16px;font-weight:700;cursor:pointer}' +
        '.b-cheer-btns .go{background:#ec1c24;color:#fff}.b-cheer-btns .ok{background:#f6f4ef;color:#101010}' +
        '.b-cheer-btns .ok{background:#101010;color:#fff}' +
        '.b-cheer-days{position:relative;display:flex;justify-content:center;gap:8px;width:max-content;margin:6px auto 26px}' +
        '.b-cheer-days span{position:relative;z-index:1;display:grid;justify-items:center;gap:8px}' +
        '.b-cheer-days small{font-size:11px;font-weight:600;color:#a8a39a;letter-spacing:0}' +
        '.b-cheer-days i{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-style:normal;font-size:13px;font-weight:700;color:#a8a39a;background:#fff;box-shadow:inset 0 0 0 1px #e6e4df}' +
        '.b-cheer-days .on i,.b-cheer-days .now i{background:none;box-shadow:none}' +
        '.b-cheer-days .on i::after,.b-cheer-days .now i::after{content:"";width:7px;height:12px;margin-top:-3px;border:solid #fff;border-width:0 2px 2px 0;transform:rotate(45deg)}' +
        '.b-cheer-days .now i::after{animation:bchTick .35s ease-out .75s both}' +
        '.b-cheer-days .now small{color:#2f9a6a;font-weight:800}' +
        '.b-cheer-run{position:absolute;left:0;top:0;height:40px;width:var(--to);border-radius:999px;background:linear-gradient(90deg,#3fae7c,#2f9a6a);animation:bchRun .7s cubic-bezier(.65,0,.35,1) .25s both}' +
        '@keyframes bchRun{from{width:var(--from)}}@keyframes bchTick{from{opacity:0;transform:rotate(45deg) scale(.4)}}' +
        '.b-cheer .b-cheer-sub{margin-top:4px;font-size:14px;color:#a8a39a}' +
        '.b-cheer p em{color:#101010!important}' +
        '.b-confetti{position:fixed;width:7px;height:12px;margin:-6px 0 0 -3px;border-radius:2px;z-index:101;pointer-events:none;'+
        '}.b-confetti.s1{width:14px;height:5px;border-radius:3px}.b-confetti.s2{width:8px;height:8px;border-radius:50%}.b-confetti{animation:bchFly 1s cubic-bezier(.2,.6,.6,1) forwards}' +
        '@keyframes bchFade{from{opacity:0}}@keyframes bchPop{from{transform:scale(.8);opacity:0}}' +
        '@keyframes bchBounce{0%{transform:translateY(30px) scale(.4);opacity:0}60%{transform:translateY(-12px) scale(1.12);opacity:1}100%{transform:none}}' +
        '@keyframes bchFly{0%{opacity:1}80%{opacity:1}100%{transform:translate(var(--dx),var(--dy)) rotate(var(--r));opacity:0}}' +
        '@media (prefers-reduced-motion:reduce){.b-cheer,.b-cheer-card,.b-cheer-medal{animation:none}.b-confetti{display:none}}' +
        '.b-clock{cursor:pointer}' +
        '.b-tier-en{display:block;font-size:11px;font-weight:800;letter-spacing:.18em;color:#9a7a2e;text-align:center;line-height:1}.b-me-tier .b-tier-en{display:inline;font-size:11px}' +
        '.b-tier-en.b-pill{position:relative;z-index:1;display:inline-flex;align-items:center;height:20px;padding:0 10px 0 calc(10px + .18em);border-radius:999px;color:#fff;font-size:10.5px;letter-spacing:.18em;box-shadow:0 2px 6px rgba(120,90,40,.25),inset 0 1px 0 rgba(255,255,255,.5)}' +
        ['linear-gradient(#e3b3a3,#a8645a)','linear-gradient(#e9ebee,#9aa0a8)','linear-gradient(#efd28c,#b8893f)','linear-gradient(#cfdcf6,#6b84c8)','linear-gradient(#e2d6f7,#8467c4)','linear-gradient(#e0c3de,#7a4a7e)','linear-gradient(#f4b0a8,#c2453d)'].map(function (g, i) { return '.b-pill.t' + i + '{background:' + g + '}'; }).join('') +
        '.b-promo-stage{position:relative;width:132px;height:132px;margin:-8px auto 4px}.b-promo-stage .b-medal{position:absolute;inset:0;width:100%;height:100%}' +
        '.b-promo-old{animation:bprOut .6s ease-in forwards}.b-promo-new{opacity:0;animation:bprIn .7s cubic-bezier(.22,1.4,.36,1) .55s forwards}' +
        '@keyframes bprOut{to{transform:scale(.4) rotate(-12deg);opacity:0}}@keyframes bprIn{from{transform:scale(.3);opacity:0}to{transform:none;opacity:1}}' +
        '.b-promo-kicker{margin:0 0 4px!important;font-size:13px!important;font-weight:700;color:#5f5f5f!important}' +
        '.b-promo-next{display:inline-flex;align-items:center;gap:8px;margin-top:14px;padding:6px 14px 6px 6px;border-radius:999px;background:#f6f4ef;font-size:13px;font-weight:700;color:#5f5f5f}' +
        '.b-promo-next .b-medal{width:32px;height:32px;filter:grayscale(1) opacity(.45)}' +
        '.b-lv-week{position:relative;z-index:0}.b-lv-week .b-run{position:absolute;z-index:-1;border-radius:999px;background:#101010}' +
        '@media (prefers-reduced-motion:reduce){.b-promo-old{display:none}.b-promo-new{opacity:1;animation:none}}' +
        '@media (max-width:767px){.b-me>div{width:calc(100% - 32px)}.b-clock{right:16px;bottom:16px}}';
      document.head.appendChild(st);
    }
    // 오늘 20분 완료 축하: 등급 엠블럼이 튀어 오르고 색종이 + 오늘 요일 원 체크 (참고: Quizlet 학습 완료 화면)
    var CHEER = 'allga.study.cheer';
    var markToday = function () {
      var td = document.querySelector('.b-lv-week span.today');
      if (td && !td.classList.contains('on')) {
        td.classList.add('on');
        var n = document.querySelectorAll('.b-lv-week span.on').length, st = document.querySelector('.b-lv-streak');
        if (st) st.innerHTML = '<em>23번째 세트</em> 진행 중';
      }
    };
    var confetti = function (cx, cy) {
      var C = ['#ec1c24', '#f59347', '#ffc83d', '#2f5bd3', '#6cc4a1']; // 사이트 손그림 아이콘 색 (맑게)
      for (var k = 0; k < 80; k++) {
        var c = document.createElement('i'); c.className = 'b-confetti' + (k % 3 ? ' s' + (k % 3) : '');
        var a = Math.PI * (1.0 + Math.random()) , d = 110 + Math.random() * 170; // 엠블럼 주변으로, 위쪽 위주
        c.style.cssText = 'left:' + cx + 'px;top:' + cy + 'px;background:' + C[k % C.length] + ';--dx:' + Math.round(Math.cos(a) * d) + 'px;--dy:' + Math.round(Math.sin(a) * d * .8 + 260) + 'px;--r:' + Math.round(Math.random() * 720 - 360) + 'deg;animation-delay:' + (Math.random() * .06) + 's';
        document.body.appendChild(c); setTimeout(function (el) { return function () { el.remove(); }; }(c), 1300);
      }
    };
    var cheer = function () {
      if (document.querySelector('.b-cheer')) return;
      markToday();
      // 학습 화면엔 상단 띠가 없으니 '이번 세트' 목록의 끝낸 Day 수 + 오늘(1)로 계산
      var n = document.querySelectorAll('.b-lv-week span.on').length || Math.min(5, document.querySelectorAll('.days li.done').length + 1) || 1;
      var o = document.createElement('div'); o.className = 'b-cheer'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', '오늘 20분 완료');
      // 2026-11-13: 이미 가진 등급 엠블럼 대신 '오늘 채운 Day 칸'을 크게 보여 줌 (오늘 해낸 일이 주인공)
      var days = '';
      for (var d = 1; d <= 5; d++) days += '<span class="' + (d < n ? 'on' : d === n ? 'now' : '') + '"><i>' + (d <= n ? '' : d) + '</i><small>Day ' + d + '</small></span>';
      var W = 40, G = 8;
      o.innerHTML = '<div class="b-cheer-card"><div class="b-cheer-days" style="--from:' + ((n - 1) * W + Math.max(0, n - 2) * G) + 'px;--to:' + (n * W + (n - 1) * G) + 'px"><b class="b-cheer-run"></b>' + days + '</div><h2>Day ' + n + ' 완료!</h2>' +
        '<p class="b-cheer-sub">오늘 20분을 채웠어요</p>' +
        '<p>이번 세트 <em>Day ' + n + ' / 5</em><br>' + (n >= 5 ? '세트 완료! 세트 막대가 한 칸 찼어요.' : 'Day ' + (5 - n) + '개만 더 하면 세트 완료예요.') + '<br>' + (nxt ? nxt[0] + '까지 ' + (nxt[1] - SETS) + '세트 남았어요.' : '최고 등급이에요!') + '</p>' +
        '<div class="b-cheer-btns"><button type="button" class="ok">확인</button></div></div>';
      var close = function () { o.remove(); };
      o.addEventListener('click', function (e) { if (e.target === o || e.target.closest('button')) close(); });
      document.body.appendChild(o);
      // 2026-11-13 사용자: 꽃가루는 승급 때만 → 오늘 20분 완료 팝업엔 꽃가루 없음
    };
    // 승급 화면 (골드 → 플래티넘): 지금 엠블럼이 작아지며 사라지고 다음 엠블럼이 커지며 등장 + 그다음 등급은 잠긴 회색으로 미리 보기. 시안: 상단 띠의 엠블럼을 누르면 미리 보기
    var promote = function () {
      if (!nxt || document.querySelector('.b-cheer')) return;
      var ni = ti + 1, after = TIERS[ni + 1];
      var o = document.createElement('div'); o.className = 'b-cheer b-promo'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', nxt[0] + ' 승급');
      o.innerHTML = '<div class="b-cheer-card"><div class="b-promo-stage"><span class="b-medal t' + ti + ' b-promo-old"></span><span class="b-medal t' + ni + ' b-promo-new"></span></div>' +
        '<p class="b-promo-kicker">' + cur[0] + ' → ' + nxt[0] + '</p><h2>' + nxt[0] + ' 승급!</h2>' +
        '<p>' + nxt[1] + '세트를 완료했어요.' + (after ? '<br>다음 등급 <em>' + after[0] + '</em>까지 ' + (after[1] - nxt[1]) + '세트 남았어요.' : '<br>최고 등급이에요!') + '</p>' +
        (after ? '<div class="b-promo-next"><span class="b-medal t' + (ni + 1) + '"></span><span>' + after[0] + ' · 잠김</span></div>' : '') +
        '<div class="b-cheer-btns"><button type="button" class="go">계속 학습하기</button><button type="button" class="ok">확인</button></div></div>';
      o.addEventListener('click', function (e) { if (e.target === o || e.target.closest('button')) o.remove(); });
      document.body.appendChild(o);
      setTimeout(function () { var r = o.querySelector('.b-promo-new').getBoundingClientRect(); if (!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) confetti(r.left + r.width / 2, r.top + r.height / 2); }, 700);
    };
    window.allgaPromote = promote;
    // 연속으로 학습한 날끼리 이어진 띠 (참고: Duolingo 달력)
    var runBand = function () {
      var wk = document.querySelector('.b-lv-week'); if (!wk) return;
      Array.prototype.forEach.call(wk.querySelectorAll('.b-run'), function (x) { x.remove(); });
      var sp = Array.prototype.slice.call(wk.querySelectorAll('span')), st = -1;
      sp.concat([null]).forEach(function (x, i) {
        var on = x && x.classList.contains('on');
        if (on && st < 0) st = i;
        if (!on && st >= 0) {
          if (i - st > 1) { var a = sp[st], b = sp[i - 1], r = document.createElement('i'); r.className = 'b-run'; r.style.left = a.offsetLeft + 'px'; r.style.top = a.offsetTop + 'px'; r.style.width = (b.offsetLeft + b.offsetWidth - a.offsetLeft) + 'px'; r.style.height = a.offsetHeight + 'px'; wk.insertBefore(r, wk.firstChild); }
          st = -1;
        }
      });
    };
    var fmt = function (ms) { var s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; var p = function (n) { return (n < 10 ? '0' : '') + n; }; return (h ? h + ':' : '') + p(m) + ':' + p(x); };
    var tick = function () {
      // 오른쪽 아래 시계: 학습 화면은 자체 시계(.ftimer)가 있으니 그곳에선 만들지 않음
      if (document.querySelector('.ftimer')) return;
      var el = document.querySelector('.b-clock');
      if (!el && document.body) {
        el = document.createElement('aside'); el.className = 'b-clock'; el.setAttribute('role', 'timer'); el.setAttribute('aria-label', '오늘 학습 시간');
        el.innerHTML = '<svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="18"/><circle class="tv" cx="22" cy="22" r="18" pathLength="1200" style="stroke-dasharray:1200 1200"/></svg><span><small>남은 시간</small><b>20:00</b></span>';
        document.body.appendChild(el);
      }
      if (!el) return;
      // 오늘 20분 카운트다운: '학습 시작' 누른 뒤부터 20:00 → 00:00 (학습 화면 '남은 시간' 시계와 같은 방식)
      var t = read();
      el.classList.toggle('is-off', !t);
      var left = Math.max(0, 1200 - (t ? Math.floor((Date.now() - t) / 1000) : 0));
      el.querySelector('small').textContent = left > 0 ? '남은 시간' : '오늘 20분';
      el.querySelector('b').textContent = left > 0 ? fmt(left * 1000) : '완료!';
      el.querySelector('.tv').style.strokeDasharray = left + ' 1200';
      el.classList.toggle('is-low', !!t && left > 0 && left <= 120);
      el.setAttribute('aria-label', '오늘 20분 중 남은 시간');
      if (t && left <= 0) {
        markToday();
        var done = null; try { done = localStorage.getItem(CHEER); } catch (e) {}
        if (done !== today()) { try { localStorage.setItem(CHEER, today()); } catch (e) {} cheer(); }
      }
      if (!el.__cheerClick) { el.__cheerClick = true; el.addEventListener('click', function () { var tt = read(); if (tt && Date.now() - tt >= 1200000) cheer(); }); } // 시안: 완료 뒤 시계를 누르면 축하 다시 보기
    };
    var put = function () {
      var h = document.querySelector('header'); if (!h) return;
      var bar = h.querySelector('.b-me');
      if (!on()) { if (bar) bar.remove(); return; }
      if (bar) return;
      bar = document.createElement('div'); bar.className = 'b-me';
      bar.innerHTML = '<div><a class="b-me-tier" href="/programs"><span class="b-medal t' + ti + '"></span><span class="b-tier-en">' + EN[ti] + '</span></a>' +
        '<span class="b-me-xp" title="' + (nxt ? nxt[0] + '까지 ' + (nxt[1] - SETS) + '세트' : '') + '"><b><i style="width:' + pct + '%"></i></b><span>' + SETS + '/' + (nxt ? nxt[1] : SETS) + '세트</span></span>' +
        '</div>';
      var chip = h.querySelector('.mychip');
      if (chip) bar.querySelector('.b-me-tier').addEventListener('click', function (e) { e.preventDefault(); chip.click(); });
      var first = h.firstElementChild; if (first) first.insertAdjacentElement('afterend', bar); else h.appendChild(bar);
      tick();
      var lv = document.querySelector('.b-lv-badge');
      if (lv && !lv.querySelector('.b-medal')) lv.innerHTML = '<span class="b-medal t' + ti + '" role="img" aria-label="' + cur[0] + ' 메달"></span>';
    };
    // 학습 프로그램 페이지: 맨 위 상태 띠(.b-lv)가 보이는 동안은 상단 상태 줄을 숨김 (C안)
    var watchBand = function () {
      var lv = document.querySelector('.b-lv'); if (!lv || lv.__watch || !window.IntersectionObserver) return;
      lv.__watch = true;
      new IntersectionObserver(function (es) { document.documentElement.classList.toggle('b-band-in', es[0].isIntersecting); }, { rootMargin: '-120px 0px 0px 0px' }).observe(lv);
    };
    // 시안 표시 이름 (학습 화면용): snallga_test → 김올샤
    var rename = function () {
      if (!/^\/study/.test(location.pathname)) return;
      var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), n;
      while ((n = w.nextNode())) {
        if (n.textContent.indexOf('snallga_test') > -1) n.textContent = n.textContent.replace(/snallga_test/g, '김올샤');
        else if (n.textContent.trim() === 'S' && n.parentElement && n.parentElement.tagName === 'I' && n.parentElement.closest('.who, header')) n.textContent = '김';
      }
    };
    var go = function () {
      rename(); setInterval(rename, 1500);
      put(); setInterval(function () {
        tick(); watchBand();
        var lv = document.querySelector('.b-lv-badge');
        if (lv && !lv.querySelector('.b-medal')) { lv.innerHTML = '<span class="b-medal t' + ti + '" role="img" aria-label="' + cur[0] + ' 메달"></span><span class="b-tier-en b-pill t' + ti + '">' + EN[ti] + '</span>'; lv.style.cursor = 'pointer'; lv.title = '시안: 누르면 승급 화면 미리 보기'; lv.addEventListener('click', promote); }
        runBand();
      }, 1000);
      window.addEventListener('resize', runBand);
      new MutationObserver(function () { var h = document.querySelector('header'); if (h && (!!h.querySelector('.b-me')) !== on()) put(); }).observe(document.body, { childList: true, subtree: true });
      window.addEventListener('click', function () { setTimeout(put, 50); });
    };
    if (document.readyState === 'complete') setTimeout(go, 300); else window.addEventListener('load', function () { setTimeout(go, 300); });
  } catch (e) {}
})();
