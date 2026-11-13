import os, re, shutil
# 학습 화면(/study) 생성기: source/index.html(기본 시안)에 문자열 패치를 차례로 적용해 ../../study/index.html 을 만든다.
# 실행: python3 tools/study-generator/make_study.py  (저장소 어디서 실행해도 됨)
import os as _os
_HERE = _os.path.dirname(_os.path.abspath(__file__))
SRC = _os.path.join(_HERE, 'source')
DST = _os.path.join(_HERE, '..', '..', 'study')
os.makedirs(DST + '/img', exist_ok=True)
for f in os.listdir(SRC + '/img'):
    if not f.startswith('.'): shutil.copy(SRC + '/img/' + f, DST + '/img/' + f)
s = open(SRC + '/index.html', encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (a, s.count(a))
    s = s.replace(a, b)
# 시안 전환 띠 제거
i = s.index('<nav class="demo"'); j = s.index('</nav>', i) + len('</nav>')
s = s[:i] + s[j:]
# 머리: 사이트 메뉴와 같은 구성
i = s.index('<header class="top">'); j = s.index('</header>', i) + len('</header>')
s = s[:i] + '''<header class="top">
  <div class="top-in">
    <a href="/" class="logo" aria-label="오르샤 홈">오르샤</a>
    <nav class="nav" aria-label="주 메뉴">
      <a href="/">서비스 소개</a>
      <a href="/programs" class="on" aria-current="page">학습 프로그램</a>
      <a href="/support/inquiry">고객센터</a>
    </nav>
    <div class="tright">
      <a href="#" class="mychip" data-s="s5" title="내 등급 보기"><span class="badge g mini on"><svg><use href="#star"/></svg></span><b>골드 레벨</b></a>
      <span class="who"><i>김</i>김올샤 님</span>
      <button type="button" class="authbtn" id="authbtn">로그아웃</button>
      <a href="/programs" class="startbtn">학습 시작</a>
      <button type="button" class="hamb" id="hamb" aria-label="전체 메뉴" aria-expanded="false" aria-controls="mdrawer"><i></i><i></i></button>
    </div>
  </div>
</header>
<div class="mdrawer" id="mdrawer" hidden>
  <nav aria-label="전체 메뉴">
    <div><a href="/" class="dtop">서비스 소개</a></div>
    <div><a href="/programs" class="dtop">학습 프로그램</a>
      <ul>
        <li><a href="/study/?p=0">초등 어휘력 완성</a></li>
        <li><a href="/study/?p=1">중고등 어휘력 완성</a></li>
        <li><a href="/study/?p=2">모두의 문법</a></li>
        <li><a href="/study/?p=3">문해력 등급</a></li>
        <li><a href="/study/?p=4">한자성어</a></li>
      </ul>
    </div>
    <div><a href="/support/inquiry" class="dtop">고객센터</a></div>
    <div class="dauth"><span id="dwho">김올샤 님</span><button type="button" id="dauthbtn">로그아웃</button></div>
  </nav>
</div>''' + s[j:]
GNB_CSS = """
/* GNB = 사이트(allga-online-ab-review) 헤더와 같은 크기·위치 (2026-11-13) */
.top { position: sticky; top: 0; z-index: 45; background: rgba(253,252,252,.86); -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px); border-bottom: 0; }
.top-in { width: min(1280px, calc(100% - 80px)); max-width: none; margin: 0 auto; height: 72px; padding: 0; display: flex; align-items: center; gap: 0; }
.top .logo { color: #101010; text-decoration: none; font-size: 24px; font-weight: 800; letter-spacing: -0.04em; line-height: 38px; }
.top .nav { margin: 0 0 0 40px; display: flex; gap: 4px; }
.top .nav a { position: relative; height: 40px; padding: 0 16px; border: 0; border-radius: 999px; background: none; font-size: 15px; font-weight: 500; color: #686e5f; white-space: nowrap; }
.top .nav a:hover { color: #101010; }
.top .nav a.on { background: none; border: 0; color: #101010; font-weight: 500; }
.top .nav a.on::after { content: ""; position: absolute; left: 50%; bottom: 2px; width: 4px; height: 4px; margin-left: -2px; border-radius: 50%; background: #101010; }
.tright { margin-left: auto; display: flex; align-items: center; gap: 14px; }
.top .mychip { height: 36px; padding: 0 12px 0 4px; gap: 6px; border: 1px solid #e3e3e3 !important; border-radius: 999px; background: #fff; }
.top .mychip .badge.mini { width: 28px; height: 28px; }
.top .mychip b { font-size: 13px; font-weight: 600 !important; }
.who { display: inline-flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 500; color: #686e5f; white-space: nowrap; }
.who i { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; background: #101010; color: #fff; font-style: normal; font-size: 13px; font-weight: 600; }
.authbtn { height: 32px; padding: 0 4px; border: 0; background: none; font-size: 14px; color: #686e5f; text-decoration: underline; text-underline-offset: 3px; white-space: nowrap; }
.authbtn:hover { color: #101010; }
.startbtn { display: inline-flex; align-items: center; height: 40px; padding: 0 18px; border-radius: 999px; background: #101010; color: #fff; font-size: 15px; font-weight: 500; text-decoration: none; white-space: nowrap; }
.startbtn:hover { background: #2a2a2a; }
body.loggedout .who, body.loggedout .mychip { display: none; }
@media (max-width: 900px) { .top .nav, .who { display: none; } }
/* 휴대폰 메뉴 (사이트 B안 햄버거 메뉴와 같은 구성, 2026-11-13) */
.hamb { display: none; position: relative; width: 40px; height: 40px; padding: 0; border: 1px solid #e3e3e3; border-radius: 999px; background: #fff; cursor: pointer; }
.hamb i { position: absolute; left: 12px; width: 16px; height: 1.5px; border-radius: 2px; background: #101010; transition: transform .2s ease, top .2s ease; }
.hamb i:first-child { top: 16px; } .hamb i:last-child { top: 22px; }
.hamb[aria-expanded="true"] i:first-child { top: 19px; transform: rotate(45deg); }
.hamb[aria-expanded="true"] i:last-child { top: 19px; transform: rotate(-45deg); }
.mdrawer { position: fixed; left: 0; right: 0; bottom: 0; top: var(--mtop, 72px); z-index: 70; overflow-y: auto; overscroll-behavior: contain; background: #fff; border-top: 1px solid rgba(221,221,221,.5); }
.mdrawer[hidden] { display: none; }
.mdrawer nav { padding: 28px 24px 40px; display: flex; flex-direction: column; gap: 28px; }
.mdrawer .dtop { font-size: 22px; font-weight: 800; letter-spacing: -0.03em; color: #101010; text-decoration: none; }
.mdrawer ul { list-style: none; margin: 10px 0 0; padding: 0; }
.mdrawer ul a { display: block; padding: 10px 0; font-size: 16px; color: #4a4a44; text-decoration: none; }
.mdrawer ul a[aria-current] { color: #101010; font-weight: 600; }
.mdrawer .dauth { margin-top: 8px; padding-top: 24px; border-top: 1px solid rgba(221,221,221,.5); display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 15px; color: #5f5f5f; }
.mdrawer .dauth button { flex: none; height: 44px; padding: 0 20px; border: 0; border-radius: 999px; background: #f6f4ef; color: #101010; font: inherit; font-size: 15px; font-weight: 600; cursor: pointer; }
body.menuopen { overflow: hidden; }
body.menuopen .ftimer, body.menuopen .b-clock { display: none !important; }
@media (max-width: 900px) { .hamb { display: inline-block; } .authbtn { display: none; } }
/* Part 줄 목록 (세종학당 '학습하기' 줄처럼): 흰 바탕·연한 선·베이지 알약, 빨강은 '시작'에만 */
.parts { display: flex !important; flex-direction: column; gap: 10px; margin-top: 40px; }
.part.prow { padding: 0; border: 1px solid #ddd !important; border-radius: 8px; background: #fff; overflow: hidden; }
.prow-head { display: flex; align-items: center; gap: 14px; padding: 16px 16px 16px 18px; }
.pnum { flex: none; display: grid; place-items: center; width: 36px; height: 36px; border-radius: 999px; background: #f6f4ef; font-size: 15px; font-weight: 700; color: #101010; }
.pmeta { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.prow .pmeta h2 { margin: 0; font-size: 17px; font-weight: 700; letter-spacing: -0.02em; white-space: normal; }
.pnext { font-size: 14px; color: #5f5f5f; }
.pnext.is-today { color: #101010; font-weight: 600; }
.prow .pmeta .pdone { margin: 0; font-size: 12px; color: #8a8a84; }
.pact { flex: none; display: flex; align-items: center; gap: 6px; }
.prow .pgo { height: 40px; padding: 0 20px; border: 1px solid #ddd; border-radius: 999px; background: #fff; color: #101010; font-size: 14px; font-weight: 600; }
.prow .pgo:hover { border-color: #101010; background: #fff; }
.prow .pgo.red { border-color: var(--red); background: var(--red); color: #fff; font-weight: 700; }
.prow .pgo.red:hover { background: var(--red-d); border-color: var(--red-d); }
.ptog { display: inline-flex; align-items: center; gap: 4px; height: 40px; padding: 0 12px 0 14px; border: 0; border-radius: 999px; background: #f6f4ef; color: #101010; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.ptog::after { content: ""; width: 6px; height: 6px; margin: -3px 0 0 4px; border-right: 1.5px solid currentColor; border-bottom: 1.5px solid currentColor; transform: rotate(45deg); transition: transform .2s ease, margin .2s ease; }
.ptog[aria-expanded="true"]::after { transform: rotate(-135deg); margin-top: 3px; }
.ptog:hover { background: #eeebe3; }
.prow ul { margin: 0 !important; padding: 4px 16px 8px 18px; border-top: 1px solid #eee !important; }
.prow ul[hidden] { display: none; }
.prow li { min-height: 56px; border-bottom-color: #f0eee9 !important; }
.prow li.now { margin: 4px -8px; padding: 0 8px; border-radius: 6px; background: #f6f4ef; }
.prow li.now b { font-weight: 700; }
.prow li.now small { color: #101010; font-weight: 600; }
.prow li .b3 { height: 36px; padding: 0 14px; border-radius: 999px; font-size: 13px; }
.prow li .b3.red { background: #101010; border-color: #101010; color: #fff; }
.prow li.lock { opacity: .6; }
@media (max-width: 600px) {
  .prow-head { flex-wrap: wrap; gap: 10px 12px; padding: 14px 14px 14px 16px; }
  .pact { width: 100%; padding-left: 48px; }
  .prow ul { padding: 2px 14px 6px 16px; }
}
/* 하루 코스: 오늘 할 것(4단계) · 이번 세트 진행 — 흰 바탕 연한 선, 빨강은 [시작]에만 */
.dayplan, .setplan { margin-top: 36px; padding: 22px 20px; border: 1px solid #ddd; border-radius: 8px; background: #fff; color: #101010; }
.setplan { margin-top: 12px; }
.sp-top p { max-width: 22em; }
.dayplan[hidden], .setplan[hidden], .today[hidden], .parts[hidden] { display: none !important; }
.dp-top { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.dp-where { margin: 0; display: flex; align-items: baseline; gap: 8px; font-size: 14px; color: #5f5f5f; }
.dp-where b { font-size: 15px; font-weight: 700; color: #101010; }
.dp-time { font-size: 13px; color: #5f5f5f; }
.dp-count { margin-top: 10px; display: flex; align-items: baseline; gap: 6px; }
.dp-count > b { font-size: 40px; font-weight: 800; line-height: 1; letter-spacing: -0.03em; }
.dp-count span { font-size: 17px; color: #5f5f5f; }
.dp-count em { margin-left: auto; font-style: normal; font-size: 14px; font-weight: 600; }
.dp-segs { margin-top: 12px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
.dp-segs i { height: 6px; border-radius: 6px; background: #fbe3e1; transition: background .3s ease; }
.dp-segs i.on { background: var(--red); }
.steps { list-style: none; margin: 18px 0 0; padding: 0; border-top: 1px solid #eee; }
.steps li { display: flex; align-items: center; gap: 14px; min-height: 64px; border-bottom: 1px solid #f0eee9; }
.steps li:last-child { border-bottom: 0; }
.steps .sn { flex: none; display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; font-size: 14px; font-weight: 700; }
.steps .sn svg.i { width: 16px; height: 16px; stroke-width: 3; }
.steps .sx { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.steps .sx b { font-size: 16px; font-weight: 600; }
.steps .sx small { font-size: 13px; color: #8a8a84; }
.steps li.done .sn { background: #101010; color: #fff; }
.steps li.done .sx b { color: #9a9a94; font-weight: 500; }
.steps li.now .sn { border: 1.5px solid #101010; color: #101010; }
.steps li.now .sx b { font-weight: 700; }
.steps li.now .sx small { color: #5f5f5f; }
.steps li.wait .sn { border: 1.5px dashed #c9c6be; color: #a8a59d; }
.steps li.wait .sx b { color: #5f5f5f; font-weight: 500; }
.steps .sgo { flex: none; height: 42px; padding: 0 22px; border: 0; border-radius: 999px; background: var(--red); color: #fff; font-size: 15px; font-weight: 700; }
.steps .sgo:hover { background: var(--red-d); }
.dp-next { margin: 14px 0 0; font-size: 14px; color: #5f5f5f; }
.sp-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.sp-top h2 { margin: 0; font-size: 17px; font-weight: 700; letter-spacing: -0.02em; }
.sp-top p { margin: 4px 0 0; font-size: 13px; color: #8a8a84; }
.sp-n { margin-left: 6px; font-size: 17px; font-weight: 700; white-space: nowrap; }
.days { flex: none; list-style: none; margin: 0; padding: 0; display: flex; gap: 6px; }
.days .dc { display: grid; place-items: center; box-sizing: border-box; width: 30px; height: 30px; border-radius: 50%; font-size: 13px; font-weight: 700; }
.days .dc svg.i { width: 14px; height: 14px; stroke-width: 3; }
.days li.done .dc { background: #101010; color: #fff; }
.days li.now .dc { border: 2px solid #101010; color: #101010; background: #fff; }
.days li.wait .dc { border: 1px solid #e3e3e3; color: #a8a39a; background: #fff; }
.sptog { margin-top: 18px; width: 100%; justify-content: center; }
.sp-detail { margin-top: 8px; }
.sp-detail[hidden] { display: none; }
.sd { padding-top: 14px; }
.sd h3 { margin: 0 0 2px; display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 48px; padding: 0 10px 0 16px; border-radius: 8px; background: #f6f4ef; font-size: 17px; font-weight: 800; letter-spacing: -0.02em; }
.sd h3 .dst { flex: none; display: inline-flex; align-items: center; height: 28px; padding: 0 12px; border-radius: 999px; font-size: 13px; font-weight: 700; }
.sd h3 .dst.ok { background: #e7f5ee; color: #2f9a6a; }
.sd h3 .dst.is-today { background: #fff; color: #101010; border: 1px solid #ddd; }
.sd ul { padding-left: 12px !important; }
.sd li b { display: flex !important; align-items: center; gap: 8px; font-size: 15px !important; font-weight: 600 !important; }
.sd li small { padding-left: 28px; }
.sd .sk { flex: none; display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; border: 1px solid #d6d3cb; font-style: normal; font-size: 11px; font-weight: 700; color: #5f5f5f; }
.sd ul { list-style: none; margin: 0; padding: 0; }
.sd li { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-height: 52px; border-bottom: 1px solid #f0eee9; }
.sd li b { display: block; font-size: 14px; font-weight: 600; }
.sd li small { font-size: 12px; color: #8a8a84; }
.sd li small em { font-style: normal; color: var(--red-t); }
.sd li.now b, .sd li.now small { color: #101010; }
.sd li.lock { opacity: .55; }
.sd li > div { flex: 1; min-width: 0; }
.sd li > .lk, .sd li > button { flex: none; }
.sd li .lk { display: inline-flex; align-items: center; gap: 6px; padding-right: 4px; font-size: 13px; color: #85807a; }
.sd li .lk svg.i { width: 14px; height: 14px; }
.sd .sre { height: 34px; padding: 0 14px; border-radius: 999px; font-size: 13px; }
.sd .donechip { height: 32px; font-size: 13px; }
@media (min-width: 761px) { .dayplan, .setplan { padding: 28px 32px; } .sptog { width: auto; padding: 0 18px; } }
/* 오늘 할 차례 카드: 흰 카드·연한 선, 빨강은 버튼과 진행 막대에만 (학습 프로그램의 '학습 이어하기' 카드와 같은 톤) */
.today { display: grid; grid-template-columns: minmax(0, 1fr) 260px; grid-auto-rows: auto; column-gap: 48px; row-gap: 0; align-items: center; padding: 28px 32px; border: 1px solid #ddd; border-radius: 8px; background: #fff; color: #101010; }
.today > * { grid-column: 1; }
.today .t-where { margin: 0; display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; font-size: 14px; color: #5f5f5f; }
.today .t-where b { font-weight: 600; color: #101010; }
.today .t-count { margin-top: 14px; display: flex; align-items: baseline; gap: 6px; }
.today .t-count > b { font-size: 44px; font-weight: 800; line-height: 1; letter-spacing: -0.03em; color: #101010; }
.today .t-count span { font-size: 18px; color: #5f5f5f; } .today .t-count span i { font-style: normal; }
.today .t-count em { margin-left: auto; font-style: normal; font-size: 14px; font-weight: 600; color: #101010; }
.today .barrow { margin-top: 12px; }
.today .bar { height: 8px; border-radius: 8px; background: #fbe3e1; }
.today .bar i { border-radius: 8px; background: var(--red); }
.today .bar-end { min-width: 38px; text-align: right; font-size: 13px; color: #5f5f5f; }
.today .t-last { margin: 12px 0 0; font-size: 14px; color: #5f5f5f; }
.today .t-last:empty { display: none; }
.today .t-go { grid-column: 2; grid-row: 1 / span 4; width: 100%; height: 64px; padding: 0 24px; border: 0; border-radius: 999px; background: var(--red); color: #fff; font-size: 18px; font-weight: 700; }
.today .t-go:hover { background: var(--red-d); }
@media (max-width: 760px) {
  .today { grid-template-columns: minmax(0, 1fr); padding: 22px 20px; }
  .today .t-go { grid-column: 1; grid-row: auto; margin-top: 20px; height: 58px; font-size: 17px; }
  .today .t-count > b { font-size: 40px; }
}
@media (max-width: 600px) { .top-in { width: calc(100% - 40px); } .top .mychip b { display: none; } .top .mychip { padding: 0 4px; } .startbtn { height: 36px; padding: 0 14px; font-size: 14px; } .tright { gap: 8px; } }
"""
s = s.replace('</style>', GNB_CSS + '</style>', 1)
# 로그인/로그아웃 (시안: 이 브라우저에 상태 저장, 사이트 헤더와 같은 키 allga.login)
s = s.replace('</body>', """<script>
(function () {
  var b = document.getElementById('authbtn'); if (!b) return;
  var db = document.getElementById('dauthbtn'), dw = document.getElementById('dwho');
  function get() { try { return localStorage.getItem('allga.login') !== 'out'; } catch (e) { return true; } }
  function draw() { var on = get(); document.body.classList.toggle('loggedout', !on); b.textContent = db.textContent = on ? '로그아웃' : '로그인'; dw.textContent = on ? '김올샤 님' : '로그인하면 이어서 학습할 수 있어요'; }
  function flip(e) { e.stopPropagation(); try { localStorage.setItem('allga.login', get() ? 'out' : 'in'); } catch (x) {} draw(); }
  b.addEventListener('click', flip); db.addEventListener('click', flip);
  draw();
  // 어떤 단계의 '시작'을 눌렀는지 기억 (문제를 끝내면 그 단계 완료)
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-s]'); if (!b) return;
    if (b.dataset.step) window.pendingStep = +b.dataset.step; else if (b.dataset.s === 's4' && b.id !== 'retry') window.pendingStep = 0;
  }, true);
  // 이번 세트 진행: 전체 보기/접기
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.sptog'); if (!t) return;
    var open = t.getAttribute('aria-expanded') !== 'true', box = document.getElementById('spdetail');
    window.SETOPEN = open; t.setAttribute('aria-expanded', open ? 'true' : 'false'); t.textContent = open ? '접기' : '전체 보기'; if (box) box.hidden = !open;
  });
  // Part 줄 펼치기/접기 (다시 그려도 상태 유지)
  window.OPENP = window.OPENP || {};
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.ptog'); if (!t || t.classList.contains('sptog')) return;
    var i = t.dataset.i, open = t.getAttribute('aria-expanded') !== 'true', row = t.closest('.prow'), ul = document.getElementById(t.getAttribute('aria-controls'));
    window.OPENP[i] = open; t.setAttribute('aria-expanded', open ? 'true' : 'false'); t.textContent = open ? '접기' : '전체 보기';
    if (ul) ul.hidden = !open; if (row) row.classList.toggle('open', open);
  });
  // 휴대폰 메뉴
  var hb = document.getElementById('hamb'), md = document.getElementById('mdrawer');
  var pn = new URLSearchParams(location.search).get('p') || '0';
  md.querySelectorAll('ul a').forEach(function (a) { if (a.getAttribute('href') === '/study/?p=' + pn) a.setAttribute('aria-current', 'page'); });
  function setMenu(open) {
    if (open) { var h = document.querySelector('header.top'); md.style.setProperty('--mtop', Math.max(0, h.getBoundingClientRect().bottom) + 'px'); }
    md.hidden = !open; hb.setAttribute('aria-expanded', open ? 'true' : 'false'); document.body.classList.toggle('menuopen', open);
  }
  hb.addEventListener('click', function (e) { e.stopPropagation(); setMenu(md.hidden); });
  md.addEventListener('click', function (e) { e.stopPropagation(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !md.hidden) { setMenu(false); hb.focus(); } });
  window.addEventListener('resize', function () { if (!md.hidden && innerWidth > 900) setMenu(false); });
})();
</script>
</body>""", 1)
# 이미지 경로 (주소가 /study 로 열려도 깨지지 않게)
s = s.replace('src="img/', 'src="/study/img/').replace("'img/", "'/study/img/")
# 프로그램 고르는 화면(s1)은 사이트의 /programs 를 씀 → 학습 리스트부터
rep('<section class="screen on" id="s1">', '<section class="screen" id="s1" hidden>')
rep('<section class="screen" id="s2">', '<section class="screen on" id="s2">')
rep("  var cur = 's1';", "  var cur = 's2';")
rep("  setProg(0);\n", "  var P0 = +(new URLSearchParams(location.search).get('p') || 0); setProg(PROGS[P0] ? P0 : 0);\n")
rep("function fromHash() { var h = location.hash.replace('#', ''); if (/^s[1-5]$/.test(h)) show(h); }",
    "function fromHash() { var h = location.hash.replace('#', ''); if (/^s[2-5]$/.test(h)) show(h); }")
rep("    $('#crumb').textContent = crumb(id);", "    var cb = $('#crumb'); if (cb) cb.textContent = crumb(id);")
i = s.index('<div class="today">'); j = s.index('<div class="review" id="review">', i)
s = s[:i] + '''<div class="today">
      <p class="t-where"><span>오늘 할 차례</span><b id="todayh"></b></p>
      <div class="t-count"><b id="tdone">0</b><span>/ <i id="ttotal">0</i></span><em id="tleft"></em></div>
      <div class="barrow"><div class="bar"><i id="todaybar" style="width:4%"></i></div><span class="bar-end" id="tpct">0%</span></div>
      <p class="t-last" id="todaylast"></p>
      <button class="b3 red t-go" data-s="s3">학습 시작</button>
    </div>
    ''' + s[j:]
rep("""    $('#todayh').innerHTML = '오늘 할 차례: Part 1 ' + (today === p1 ? '<b>' + p1 + '</b>' : p1 + ' <b>' + today + '</b>');
    $('#todayp').textContent = total + '개 중 ' + done + '개를 마쳤어요.';
    $('#todaybar').style.width = (total ? Math.max(4, done / total * 100) : 0) + '%';""",
"""    var pct = total ? Math.round(done / total * 100) : 0, dm = /^Day (\\d+)$/.exec(today);
    $('#todayh').textContent = 'Part 1 ' + p1 + (today && today !== p1 ? ' · ' + today : '');
    $('#tdone').textContent = done; $('#ttotal').textContent = total;
    $('#tleft').textContent = total - done > 0 ? (total - done) + '개 남았어요' : '모두 마쳤어요';
    $('#todaybar').style.width = Math.max(4, pct) + '%'; $('#tpct').textContent = pct + '%';
    $('#todaylast').textContent = dm && +dm[1] > 1 ? '어제 Day ' + (dm[1] - 1) + '를 끝냈어요.' : '';""")
# 세트 선택(예: 201세트)은 카드에서 빼고 위쪽 선택 줄 끝으로
rep("""    box.innerHTML = prog.pick.slice(0, last).map(pkHtml).join('');
    $('#setpick').innerHTML = last >= 0 ? pkHtml(prog.pick[last], last) : '';""",
"""    box.innerHTML = prog.pick.map(pkHtml).join('');""")
# Part 줄 목록: Part마다 한 줄(이름 + 할 차례 Day 하나 + 시작), [펼치기]로 Day 1~5 (2026-11-13)
rep("""      return '<div class="part"><div class="phead"><span class="ppill">Part ' + (i + 1) + '</span><h2>' + nm + '</h2>' + (pd ? '<p class="pdone">' + pd + '</p>' : '') + '</div><ul>' + rows.join('') + '</ul></div>';""",
"""      var nxr = rows.filter(function (r) { return /<li class="now"/.test(r); })[0] || rows.filter(function (r) { return /풀 수 있어요/.test(r); })[0];
      var nxt = nxr ? /<b>(.*?)<\\/b>/.exec(nxr)[1] : '', nxa = nxr ? (/<button class="b3 [a-z]+"([^>]*)>/.exec(nxr) || ['', ''])[1] : '', isNow = !!(nxr && /<li class="now"/.test(nxr));
      var opn = !!(window.OPENP && window.OPENP[i]), lid = 'pdays' + i;
      var meta = nxr ? '<span class="pnext' + (isNow ? ' is-today' : '') + '">' + nxt + (isNow ? ' · 오늘 할 차례' : P.day ? ' · 다음 차례' : '') + '</span>' : '<span class="pnext">모두 마쳤어요</span>';
      return '<div class="part prow' + (opn ? ' open' : '') + '"><div class="prow-head"><span class="pnum">' + (i + 1) + '</span>' +
        '<div class="pmeta"><h2>' + nm + '</h2>' + meta + (pd ? '<small class="pdone">' + pd + '</small>' : '') + '</div>' +
        '<div class="pact">' + (nxr ? '<button class="b3 pgo' + (isNow ? ' red' : ' white') + '"' + nxa + '>시작</button>' : '') +
        '<button type="button" class="ptog" data-i="' + i + '" aria-expanded="' + opn + '" aria-controls="' + lid + '">' + (opn ? '접기' : '전체 보기') + '</button></div></div>' +
        '<ul id="' + lid + '"' + (opn ? '' : ' hidden') + '>' + rows.join('') + '</ul></div>';""")

# ---- 하루 코스 구성 (2026-11-13, 랜딩 세션 요청): Day 하나 = 4단계 × 약 5분 = 20분, Day 1~5 = 1세트 ----
# 어휘처럼 Day가 있는 과정(P.day)만 적용. 문법·문해력은 Part 줄 목록 그대로.
rep('<div class="today">', '<div class="dayplan" id="dayplan" hidden></div>\n    <div class="setplan" id="setplan" hidden></div>\n    <div class="today">')
rep("\n  function setProg(i) {", """
  // 오늘 Day의 진행: step = 끝낸 단계 수 (시안 예시: Day 1·2 완료, 오늘 Day 3에서 ①② 완료)
  window.DS = window.DS || { day: 3, step: 2 };
  window.SETOPEN = window.SETOPEN || false;
  var _rl = renderList; renderList = function () { _rl(); dayView(); };
  function dayView() {
    var P = prog, on = !!(P.day && P.parts.length), dp = $('#dayplan'), sp = $('#setplan');
    dp.hidden = sp.hidden = !on; $('.today').hidden = on; $('#parts').hidden = on;
    if (!on) return;
    var DS = window.DS, D = '오늘 학습', ST = P.parts, n = ST.length;
    function nth(d) { return 'Day ' + d; }
    function act(k, d) { return k === 1 ? ' data-s="s3" data-step="' + k + '"' : ' data-s="s4" data-q="p' + Math.min(k, 4) + '" data-d="' + d + '" data-step="' + k + '"'; }
    var steps = ST.map(function (nm, i) {
      var k = i + 1, st = k <= DS.step ? 'done' : k === DS.step + 1 ? 'now' : 'wait';
      return '<li class="' + st + '"><span class="sn" aria-hidden="true">' + (st === 'done' ? ICON('check') : k) + '</span>' +
        '<div class="sx"><b>' + nm + '</b><small>약 5분</small></div>' +
        (st === 'now' ? '<button class="b3 red sgo"' + act(k, D) + '>시작</button>' : '') + '</li>';
    }).join('');
    var all = DS.step >= n, pct = Math.round(DS.step / n * 100);
    var segs = ''; for (var g = 1; g <= n; g++) segs += '<i class="' + (g <= DS.step ? 'on' : g === DS.step + 1 && !all ? 'cur' : '') + '"></i>';
    dp.innerHTML = '<div class="dp-top"><p class="dp-where"><b>' + (all ? '오늘 학습 완료' : '오늘 학습') + '</b></p><span class="dp-time">약 20분</span></div>' +
      '<div class="dp-count"><b>' + DS.step + '</b><span>/ ' + n + ' 단계</span><em>' + (all ? '오늘 20분을 채웠어요' : '다음 · ' + ST[DS.step]) + '</em></div>' +
      '<div class="dp-segs" aria-hidden="true">' + segs + '</div>' +
      '<ol class="steps">' + steps + '</ol>' + (all ? '<p class="dp-next">이번 세트의 Day 한 칸을 채웠어요. 다음 Day도 같은 네 단계로 이어져요.</p>' : '');
    // 이번 세트 진행: Day 1~5
    var setName = ($$('#pickers .pick').slice(-1)[0] || {}).textContent || '';
    var days = [], rows = [];
    for (var d = 1; d <= 5; d++) {
      var ds = d < DS.day || (d === DS.day && all) ? 'done' : d === DS.day ? 'now' : 'wait';
      days.push('<li class="' + ds + '"><span class="dc">' + (ds === 'done' ? ICON('check') : d) + '</span></li>');
      var srows = ST.map(function (nm, i) {
        var k = i + 1, dd = nth(d), txt, btn = '';
        if (d < DS.day) {
          var miss = d === 2 && (k === 2 || k === 3) && !fixed[k];
          txt = miss ? '<em>1개 틀림</em>' : '';
          btn = miss ? '<button class="b3 white sre" data-s="s4" data-q="w' + k + '" data-d="' + dd + '">재학습</button>' : DONE(act(k, dd).replace(/ data-step="\\d"/, ''), '다시 풀기');
        } else if (d === DS.day) {
          txt = k <= DS.step ? '' : k === DS.step + 1 ? '지금 할 차례' : '약 5분';
          btn = k <= DS.step ? DONE(act(k, dd).replace(/ data-step="\\d"/, ''), '다시 풀기') : '';
        } else { txt = ''; btn = LOCK; }
        return '<li class="' + (d > DS.day ? 'lock' : d < DS.day || k <= DS.step ? 'done' : k === DS.step + 1 ? 'now' : '') + '"><div><b><i class="sk">' + k + '</i>' + nm + '</b>' + (txt ? '<small>' + txt + '</small>' : '') + '</div>' + btn + '</li>';
      }).join('');
      rows.push('<div class="sd"><h3>Day ' + d + '</h3><ul>' + srows + '</ul></div>');
    }
    var doneDays = Math.min(5, DS.day - 1 + (all ? 1 : 0)), op = window.SETOPEN;
    sp.innerHTML = '<div class="sp-top"><div><h2>이번 세트 <b class="sp-n">Day ' + doneDays + ' / 5</b></h2><p>' + (doneDays >= 5 ? '이번 세트를 완료했어요. 등급은 세트로 올라가요.' : '남은 Day를 마치면 세트 완료') + '</p></div>' +
      '<ol class="days" aria-label="이번 세트 Day 5개 중 ' + doneDays + '개 완료">' + days.join('') + '</ol></div>' +
      '<button type="button" class="ptog sptog" aria-expanded="' + op + '" aria-controls="spdetail">' + (op ? '접기' : '전체 보기') + '</button>' +
      '<div class="sp-detail" id="spdetail"' + (op ? '' : ' hidden') + '>' + rows.join('') + '</div>';
  }
  function setProg(i) {""")
# 문제를 끝내면 그 단계 완료 → 네 단계 다 끝나면 '오늘 20분 완료'
rep("""    show('s5');
    // 다 맞히면 폭죽만""", """    var dayDone = false, ps = window.pendingStep || 0;
    if (ps && !redo && prog.day) {
      if (ps === window.DS.step + 1) window.DS.step = ps;
      dayDone = ps === prog.parts.length && window.DS.step >= prog.parts.length;
      window.pendingStep = 0; renderList();
      if (dayDone) {
        $('#endh').textContent = '오늘 20분 완료!';
        $('#endsum').innerHTML = '오늘 네 단계를 모두 마쳤어요.<br>이번 세트의 Day 한 칸을 채웠어요.' + (wrong.length ? '<br>틀린 낱말은 아래에서 다시 볼 수 있어요.' : '');
        tl.textContent = '학습 리스트로';
      } else if (ps < prog.parts.length) {
        tl.textContent = '다음 단계 하러 가기';
      }
    }
    show('s5');
    // 다 맞히면 폭죽만""")
rep("    if (right === n) setTimeout(function () { var r = $('#endh')", "    if (right === n || dayDone) setTimeout(function () { var r = $('#endh')")
rep('<span>Day 3 · <b id="wcount">', '<span><b id="wcount">')
# 문제 화면 머리: 'Part 3' 대신 '3단계' (단위는 오늘 학습 단계·세트 두 가지만)
s = s.replace("'Part ' + q.p + ' ' + PNAME[q.p]", "q.p + '단계 ' + PNAME[q.p]")

# ---- 등급 기준 (2026-11-13, 사용자 최종): 브론즈 0 · 실버 5 · 골드 15 · 플래티넘 30 · 다이아 50 · 마스터 80 · 그랜드마스터 120세트. 예시 학생 22세트 ----
i = s.index('<div class="medals">'); j = s.index('</ol>', i); j = s.index('</div>', j) + len('</div>')
TIERS = [('bronze', '브론즈', 0), ('silver', '실버', 5), ('gold', '골드', 15), ('platinum', '플래티넘', 30), ('diamond', '다이아', 50), ('master', '마스터', 80), ('grandmaster', '그랜드마스터', 120)]
TCOL = {'gold': '--tier:linear-gradient(90deg,#d9b45a,#b88a2e);--tier-bg:#f1e9d6'}  # 등급 막대 = 현재 등급 엠블럼 색 (확인된 색만)
ME = 22  # 예시 학생: 22세트 완료(골드), 지금 하는 세트는 23세트
cur = max(k for k, t in enumerate(TIERS) if ME >= t[2]); nxt = TIERS[cur + 1] if cur + 1 < len(TIERS) else None
lis = ''.join('<li class="%s"><img src="/media/allga/tiers/tier-%s.png" alt="%s 엠블럼"><b>%s</b><small>%s</small>%s</li>' % (
    'done' if k < cur else 'now' if k == cur else 'lock', t[0], t[1], t[1], ('%d세트' % t[2]) if t[2] else '시작', '<span class="me">지금</span>' if k == cur else '') for k, t in enumerate(TIERS))
pct = round((ME - TIERS[cur][2]) / ((nxt[2] if nxt else ME) - TIERS[cur][2] or 1) * 100)
s = s[:i] + ('<div class="medals">\n'
  '        <div class="mhead"><h2>세트를 마칠수록 등급이 올라가요</h2><div class="mnow"><img src="/media/allga/tiers/tier-%s.png" alt=""><div><span>지금 내 등급</span><b>%s · %d세트</b></div></div></div>\n'
  '        <p>%s</p>\n'
  '        <div class="mbar" style="%s"><i style="width:%d%%"></i></div><div class="mbar-lab"><span>%s %d세트</span><span>%s</span></div>\n'
  '        <div class="mscroll"><ol class="mtrack">%s</ol></div>\n'
  '      </div>') % (TIERS[cur][0], TIERS[cur][1], ME,
  ('다음 등급 <em>%s</em>까지 <em>%d세트</em> 남았어요. 1세트는 Day 1~5예요.' % (nxt[1], nxt[2] - ME)) if nxt else '가장 높은 등급이에요.',
  TCOL.get(TIERS[cur][0], ''), max(3, pct), TIERS[cur][1], TIERS[cur][2], ('%s %d세트' % (nxt[1], nxt[2])) if nxt else '', lis) + s[j:]
rep("seq(288, function (i) { return i + '세트'; })], day: true, at: 200,", "seq(288, function (i) { return i + '세트'; })], day: true, at: 21,")
rep('등급 기준(50·100·200세트)은 예시예요.', '등급 기준(브론즈 0 · 실버 5 · 골드 15 · 플래티넘 30 · 다이아 50 · 마스터 80 · 그랜드마스터 120세트)은 사용자 확정 기준이고, 22세트 진행 중(22/30)은 예시 학생이에요.')
rep('<span class="badge g mini on"><svg><use href="#star"/></svg></span><b>골드 레벨</b>', '<img class="tmini" src="/media/allga/tiers/tier-gold.png" alt=""><b>골드</b>')
rep("  var TIER = { 50: '브론즈 레벨', 100: '실버 레벨', 200: '골드 레벨' };", "  var TIER = { 5: '실버', 15: '골드', 30: '플래티넘', 50: '다이아', 80: '마스터', 120: '그랜드마스터' };")
s = s.replace('</style>', """
/* 등급 7단계 (엠블럼 이미지, 2026-11-13) */
.medals { border: 1px solid #ddd !important; border-radius: 8px; background: #fff; }
.medals h2 { font-size: 18px; }
.mnow { gap: 12px; padding: 0; border-radius: 0; background: none; }
.mnow img { flex: none; width: 56px; height: 56px; object-fit: contain; }
.mnow span { font-size: 12px; color: #5f5f5f; }
.mnow b { margin-top: 2px; font-size: 17px; font-weight: 800; letter-spacing: -0.02em; }
.medals > p { margin-top: 14px; font-size: 14px; }
.mbar { margin-top: 12px; height: 6px; border-radius: 6px; background: var(--tier-bg, #eceae4); overflow: hidden; }
.mbar i { display: block; height: 100%; border-radius: 6px; background: var(--tier, #101010); }
.mbar-lab { margin-top: 6px; display: flex; justify-content: space-between; font-size: 12px; color: #8a8a84; }
.mscroll { margin: 20px -18px 0; padding: 0 18px 4px; overflow-x: auto; scrollbar-width: none; }
.mscroll::-webkit-scrollbar { display: none; }
.medals .mtrack { margin: 0; display: grid; grid-template-columns: repeat(7, minmax(72px, 1fr)); column-gap: 6px; }
.medals .mtrack li { position: relative; display: flex; flex-direction: column; align-items: center; gap: 2px; padding-top: 24px; text-align: center; }
.medals .mtrack img { width: 64px; height: 64px; object-fit: contain; }
.medals .mtrack b { font-size: 13px; font-weight: 600; white-space: nowrap; }
.medals .mtrack small { font-size: 11px; color: #8a8a84; }
.medals .mtrack li.lock img { filter: grayscale(1); opacity: .35; }
.medals .mtrack li.lock b { color: #8a8a84; font-weight: 500; }
.medals .mtrack li.now img { width: 72px; height: 72px; margin-top: -4px; }
.medals .mtrack li.now b { font-weight: 800; }
.medals .me { position: absolute; top: 0; left: 50%; bottom: auto; transform: translateX(-50%); background: #101010; }
.medals .me::after { background: #101010; }
.top .mychip .tmini { width: 28px; height: 28px; object-fit: contain; }
/* 둥글기 기준 (2026-11-13): 박스·카드 8px, 작은 칸 6px, 버튼·막대는 알약 */
:root { --r-panel: 8px; }
.bub, .cheer, .wronglist li, .rv-list li { border-radius: 8px; }
.pick, .menu li, .seg, .seg button, .word, .card .syn b, .opts.chips .opt { border-radius: 6px; }
.part .b3, .rv-list .b3, .qclose { border-radius: 999px; }
/* 끝 화면 문구: 문장 단위로만 줄바꿈 */
#endsum { word-break: keep-all; }
/* 틀린 문제 다시 풀기: 베이지 박스 없이 제목 한 줄 + 버튼 (사용자 요청) */
.review { padding: 0 21px !important; background: none !important; border: 0 !important; margin-top: 28px; }
/* [다시 풀기] = '이번 세트' [전체 보기]와 같은 크기 (색만 검정) */
.review .rv-head .b3 { width: 100%; height: 40px; padding: 0 12px 0 14px; font-size: 14px; font-weight: 600; border-radius: 999px; }
@media (min-width: 761px) { .review { padding: 0 33px !important; } .review .rv-head .b3 { width: auto; min-width: 103px; padding: 0 18px; } }
/* 끝낸 기록(완료 체크) = 검정 */
.donechip, .donechip:hover, .menu li .ck, .okc { color: #101010; }
/* 이번 세트 목록의 완료 = 초록 알약 (사용자 요청 2026-11-13) */
.sd .donechip, .sd .donechip:hover { height: 30px; padding: 0 12px; border: 0; background: #e7f5ee; color: #2f9a6a; font-weight: 700; }
</style>""", 1)
# 2026-11-13 사용자: 학습 화면에서는 'Part'라는 말을 쓰지 않음 → '단계'로 (단계 = 기존 Part)
rep('<div class="lhead"><h2>Part 1 단어 익히기</h2>', '<div class="lhead"><h2>1단계 단어 익히기</h2>')
rep('<span id="qctx">Part 2~4 문제</span>', '<span id="qctx">2~4단계 문제</span>')
rep("s3: ' · Part 1',", "s3: ' · 1단계',")
rep("review.push({ label: 'Part ' + (i + 1) + ' ' + nm + ' · ' + day, q: wq });", "review.push({ label: (i + 1) + '단계 ' + nm + ' · ' + day, q: wq });")
rep("$('#todayh').textContent = 'Part 1 ' + p1", "$('#todayh').textContent = '1단계 ' + p1")
rep("var r = t.getBoundingClientRect(); burst(r.left + 22, r.top + r.height / 2, 46, true);", "/* 20분 채움: 꽃가루 없음(승급 때만) */")
# 2026-11-13 사용자: 꽃가루는 승급 때만, 완료는 '빗금'(제목 위 짧은 선 깜빡임)만 → 끝 화면 폭죽 대신 빗금
rep("if (right === n || dayDone) setTimeout(function () { var r = $('#endh').getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 60, false); }, 250);",
    "if (right === n || dayDone) setTimeout(function () { var h = $('#endh'); if (h.querySelector('.tickrs')) return; var rs = document.createElement('span'); rs.className = 'tickrs'; rs.setAttribute('aria-hidden', 'true'); rs.innerHTML = '<i style=\"--a:-34deg;--d:0s\"></i><i style=\"--a:-17deg;--d:.25s\"></i><i style=\"--a:0deg;--d:.1s\"></i><i style=\"--a:17deg;--d:.35s\"></i><i style=\"--a:34deg;--d:.18s\"></i>'; h.prepend(rs); }, 250);")
s = s.replace('</style>', """
/* 완료 빗금 (꽃가루 대신) */
#endh { position: relative; }
.tickrs { position: absolute; left: 50%; top: -4px; width: 0; height: 0; pointer-events: none; }
.tickrs i { position: absolute; left: -1.5px; top: 0; width: 3px; height: 11px; border-radius: 3px; background: #e0b25a; transform-origin: 1.5px 30px; transform: rotate(var(--a)) translateY(-20px); animation: tickblink 1.1s ease-in-out infinite; animation-delay: var(--d); }
.tickrs i:nth-child(2n) { background: #ec1c24; height: 8px; }
@keyframes tickblink { 0%, 100% { opacity: 1; transform: rotate(var(--a)) translateY(-20px) scaleY(1); } 50% { opacity: .15; transform: rotate(var(--a)) translateY(-17px) scaleY(.6); } }
@media (prefers-reduced-motion: reduce) { .tickrs i { animation: none; } }
</style>""", 1)
s = re.sub(r'<title>.*?</title>', '<title>학습하기 · 오르샤</title>', s, count=1)
# 랜딩 세션이 추가한 내 상태 줄 스크립트 — 다시 만들어도 유지
if '/b-me.js' not in s:
    s = s.replace('</head>', '<script src="/b-me.js" defer></script>\n</head>', 1)
open(DST + '/index.html', 'w', encoding='utf-8').write(s)
print('ok', len(s))
