/**
 * luum-sidebar.js — 공통 사이드바 + 유저 팝오버
 * LuumSidebar.init(selector, opts)
 * LuumSidebar.openUserPopover(event, opts)
 */
(function (global) {
  'use strict';

  /* ── SVG assets ── */
  const LOGO = `<svg class="lsb-logo" width="68" height="12" viewBox="0 0 51 9" fill="none" xmlns="http://www.w3.org/2000/svg" onclick="location.href='luum-index.html'" style="cursor:pointer;flex-shrink:0">
    <path class="ll" fill="#111827" d="M0 8.544V0H2.4V8.544H0ZM1.956 8.544V6.504H5.952V8.544H1.956Z"/>
    <path fill="#8361FF" d="M15.922 8.688c-.752 0-1.408-.152-1.968-.456-.56-.312-.996-.74-1.308-1.284C12.334 6.404 12.178 5.78 12.178 5.076V0h2.4v5.292c0 .272.06.504.18.696.12.192.28.34.48.444.208.096.436.144.684.144.256 0 .48-.048.672-.144.2-.096.356-.24.468-.424.112-.192.168-.424.168-.692V0h2.412v5.088c0 .704-.156 1.328-.468 1.872-.304.536-.736.96-1.296 1.272-.552.304-1.204.456-1.956.456Z"/>
    <path fill="#8361FF" d="M30.249 8.688c-.752 0-1.408-.152-1.968-.456-.56-.312-.996-.74-1.308-1.284-.312-.544-.468-1.168-.468-1.872V0h2.4v5.292c0 .272.06.504.18.696.12.192.28.34.48.444.208.096.436.144.684.144.256 0 .48-.048.672-.144.2-.096.356-.24.468-.424.112-.192.168-.424.168-.692V0h2.412v5.088c0 .704-.156 1.328-.468 1.872-.304.536-.736.96-1.296 1.272-.552.304-1.204.456-1.956.456Z"/>
    <path class="lm" fill="#111827" d="M40.987 8.544V0h1.74l3.18 4.656h-.756L48.319 0h1.74v8.544H47.683V3.936l.348.096-1.74 2.496h-1.536L43.027 4.032l.336-.096v4.608H40.987Z"/>
  </svg>`;

  const FOLD_BTN = `<button class="lsb-tog" id="lsb-fold-btn" onclick="LuumSidebar.toggleFold()" title="사이드바 접기">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
  </button>`;

  /* ── Sidebar CSS ── */
  const SIDEBAR_CSS = `
.lsb-ws {
  height: 52px; flex-shrink: 0;
  display: flex; align-items: center; gap: 8px; padding: 0 12px;
  overflow: hidden; white-space: nowrap;
}
.lsb-logo path.ll { fill: #111827; }
.lsb-logo path.lm { fill: #111827; }
[data-theme="dark"] .lsb-logo path.ll { fill: #F0EDE8; }
[data-theme="dark"] .lsb-logo path.lm { fill: #F0EDE8; }
.lsb-tog {
  width: 28px; height: 28px; border-radius: 6px;
  border: 1px solid var(--bdr, var(--bd, #E9E8E8));
  background: none; display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--mu, #9CA3AF);
  transition: background .1s, color .1s; flex-shrink: 0; margin-left: auto;
}
.lsb-tog:hover { background: var(--nav-ho-bg, var(--s2, #F3F4F6)); color: var(--tx, var(--wh, #111827)); }
.lsb-bot {
  flex-shrink: 0; padding: 8px 8px 16px;
  display: flex; flex-direction: column; gap: 3px;
}
.lsb-user {
  background: var(--fa, var(--s2, #F9FAFB));
  border-radius: 8px; border: 1px solid var(--bdr, var(--bd, #E9E8E8));
  padding: 10px 11px; display: flex; align-items: center; gap: 10px;
  cursor: pointer; transition: background .12s, border-color .12s; overflow: hidden;
}
.lsb-user:hover { background: var(--nav-ho-bg, var(--s3, #F3F4F6)); border-color: var(--bdr2, var(--bd2, #D1D5DB)); }
.lsb-av {
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #8361FF, #5B3FD4);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; color: #fff; overflow: hidden;
}
.lsb-av img { width: 100%; height: 100%; object-fit: cover; }
.lsb-uinfo { display: flex; flex-direction: column; gap: 1px; overflow: hidden; }
.lsb-uname { font-size: 12px; font-weight: 600; color: var(--tx, var(--wh, #111827)); white-space: nowrap; }
.lsb-uemail { font-size: 11px; color: var(--mu, #9CA3AF); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Collapsed state */
.sidebar.col .lsb-ws { justify-content: center; }
.sidebar.col .lsb-logo { display: none; }
.sidebar.col .lsb-user { justify-content: center; padding: 10px 0; border: none; background: none; }
.sidebar.col .lsb-uinfo { display: none; }
`;

  /* ── User Popover CSS ── */
  const POPOVER_CSS = `
.lup-overlay {
  position: fixed; inset: 0; z-index: 9998;
}
.lup-pop {
  position: fixed; z-index: 9999;
  width: 244px;
  background: var(--sur, var(--s1, #fff));
  border: 1px solid var(--bdr, var(--bd, #E9E8E8));
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.06);
  font-family: 'Inter', 'Pretendard', -apple-system, sans-serif;
  font-size: 13px;
  color: var(--tx, #111827);
  overflow: hidden;
}
[data-theme="dark"] .lup-pop {
  box-shadow: 0 8px 32px rgba(0,0,0,.5), 0 2px 8px rgba(0,0,0,.3);
}
/* Header */
.lup-header {
  padding: 12px 12px 10px;
  display: flex; align-items: center; gap: 10px;
}
.lup-av {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #8361FF, #5B3FD4);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: #fff; overflow: hidden;
}
.lup-av img { width: 100%; height: 100%; object-fit: cover; }
.lup-info { flex: 1; min-width: 0; }
.lup-name { font-size: 13px; font-weight: 600; color: var(--tx, #111827); line-height: 1.2; }
.lup-email { font-size: 11px; color: var(--mu, #9CA3AF); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lup-gear {
  width: 28px; height: 28px; border-radius: 7px; border: none;
  background: none; display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--mu, #9CA3AF); flex-shrink: 0;
  transition: background .1s, color .1s;
}
.lup-gear:hover { background: var(--fa, #F9FAFB); color: var(--tx, #111827); }
[data-theme="dark"] .lup-gear:hover { background: rgba(255,255,255,.08); }
/* Divider */
.lup-sep { height: 1px; background: var(--bdr, var(--bd, #E9E8E8)); margin: 0 6px; }
/* Menu */
.lup-menu { padding: 4px; }
.lup-item {
  display: flex; align-items: center; gap: 10px;
  height: 38px; padding: 0 8px; border-radius: 8px;
  cursor: pointer; color: var(--tx, #111827);
  transition: background .1s; user-select: none;
}
.lup-item:hover { background: var(--fa, #F9FAFB); }
[data-theme="dark"] .lup-item:hover { background: rgba(255,255,255,.06); }
.lup-item-icon { width: 16px; height: 16px; color: var(--sub, #6B7280); flex-shrink: 0; }
.lup-item-label { flex: 1; font-size: 13px; }
.lup-item-arrow { color: var(--mu, #9CA3AF); flex-shrink: 0; transition: transform .15s; }
.lup-item.open .lup-item-arrow { transform: rotate(90deg); }
/* Theme sub */
.lup-theme-sub { display: none; padding: 2px 4px 6px; }
.lup-theme-sub.open { display: block; }
.lup-th-row {
  display: flex; gap: 1px;
  background: var(--fa, #F3F4F6); border-radius: 8px; padding: 2px;
}
[data-theme="dark"] .lup-th-row { background: rgba(255,255,255,.06); }
.lup-th-btn {
  flex: 1; height: 30px; border: none; background: none; border-radius: 6px;
  cursor: pointer; color: var(--mu, #9CA3AF);
  display: flex; align-items: center; justify-content: center; gap: 5px;
  font-family: inherit; font-size: 11px; font-weight: 500;
  transition: background .1s, color .1s;
}
.lup-th-btn:hover { color: var(--tx, #111827); }
.lup-th-btn.on {
  background: #fff; color: var(--tx, #111827);
  box-shadow: 0 1px 3px rgba(0,0,0,.1);
}
[data-theme="dark"] .lup-th-btn.on { background: rgba(255,255,255,.14); }
/* Footer */
.lup-foot { padding: 2px 4px 8px; }
.lup-logout {
  display: flex; align-items: center; gap: 4px;
  padding: 8px 8px 2px; font-size: 13px; font-weight: 500;
  color: var(--sub, #6B7280); cursor: pointer;
  transition: color .1s;
}
.lup-logout:hover { color: var(--tx, #111827); }
.lup-logout svg { opacity: .6; }
`;

  /* ── State ── */
  var _sb = null;
  var _globalOpts = { userName: 'Brian', userEmail: 'brian@edencrew.com' };

  /* ── Theme ── */
  function _storedTheme() {
    var s = localStorage.getItem('luum-theme');
    return (s === 'dark' || s === 'light' || s === 'system') ? s : 'light';
  }

  function applyTheme(t) {
    var sys = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var effective = t === 'system' ? (sys ? 'dark' : 'light') : t;
    if (effective === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('luum-theme', t);
    /* update any open popover buttons */
    document.querySelectorAll('.lup-th-btn').forEach(function (btn) {
      btn.classList.toggle('on', btn.dataset.ltt === t);
    });
    /* update legacy sidebar buttons if any */
    document.querySelectorAll('.lsb-tt-btn').forEach(function (btn) {
      btn.classList.toggle('on', btn.dataset.tt === t);
    });
  }

  /* ── Fold ── */
  function toggleFold() {
    if (!_sb) _sb = document.querySelector('.sidebar, aside.sidebar');
    if (!_sb) return;
    var isCol = _sb.classList.toggle('col');
    localStorage.setItem('luum-sb-col', isCol ? '1' : '0');
    var btn = document.getElementById('lsb-fold-btn');
    if (btn) btn.title = isCol ? '사이드바 펼치기' : '사이드바 접기';
  }

  /* ── User Popover ── */
  function _ensurePopoverCSS() {
    if (!document.getElementById('luum-popover-css')) {
      var s = document.createElement('style');
      s.id = 'luum-popover-css';
      s.textContent = POPOVER_CSS;
      document.head.appendChild(s);
    }
  }

  function openUserPopover(triggerOrEvent, opts) {
    _ensurePopoverCSS();
    var trigger = (triggerOrEvent && triggerOrEvent.currentTarget)
      ? triggerOrEvent.currentTarget
      : (triggerOrEvent instanceof Element ? triggerOrEvent : null);
    if (!trigger && triggerOrEvent && triggerOrEvent.target) trigger = triggerOrEvent.target;

    opts = opts || {};
    var uName  = opts.userName  || _globalOpts.userName  || 'Brian';
    var uEmail = opts.userEmail || _globalOpts.userEmail || '';
    var initial = uName.charAt(0).toUpperCase();

    closeUserPopover();

    /* Overlay */
    var ov = document.createElement('div');
    ov.className = 'lup-overlay';
    ov.id = 'lup-overlay';
    ov.onclick = closeUserPopover;
    document.body.appendChild(ov);

    /* Popover */
    var pop = document.createElement('div');
    pop.className = 'lup-pop';
    pop.id = 'lup-pop';
    pop.onclick = function (e) { e.stopPropagation(); };

    pop.innerHTML =
      '<div class="lup-header">' +
        '<div class="lup-av">' + initial + '</div>' +
        '<div class="lup-info">' +
          '<div class="lup-name">' + uName + '</div>' +
          '<div class="lup-email">' + uEmail + '</div>' +
        '</div>' +
        '<button class="lup-gear" title="설정" onclick="LuumSidebar._noop()">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>' +
            '<circle cx="12" cy="12" r="3"/>' +
          '</svg>' +
        '</button>' +
      '</div>' +
      '<div class="lup-sep"></div>' +
      '<div class="lup-menu">' +
        /* 테마 */
        '<div class="lup-item" id="lup-theme-row" onclick="LuumSidebar._toggleThemeSub()">' +
          '<svg class="lup-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>' +
          '<span class="lup-item-label">테마</span>' +
          '<svg class="lup-item-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>' +
        '</div>' +
        '<div class="lup-theme-sub" id="lup-theme-sub">' +
          '<div class="lup-th-row">' +
            '<button class="lup-th-btn" data-ltt="light" onclick="LuumSidebar.applyTheme(\'light\')">' +
              '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>' +
              '라이트' +
            '</button>' +
            '<button class="lup-th-btn" data-ltt="system" onclick="LuumSidebar.applyTheme(\'system\')">' +
              '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>' +
              '시스템' +
            '</button>' +
            '<button class="lup-th-btn" data-ltt="dark" onclick="LuumSidebar.applyTheme(\'dark\')">' +
              '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' +
              '다크' +
            '</button>' +
          '</div>' +
        '</div>' +
        /* 언어 */
        '<div class="lup-item">' +
          '<svg class="lup-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><line x1="2" y1="12" x2="22" y2="12"/></svg>' +
          '<span class="lup-item-label">언어</span>' +
          '<svg class="lup-item-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>' +
        '</div>' +
        /* 가이드 */
        '<div class="lup-item">' +
          '<svg class="lup-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>' +
          '<span class="lup-item-label">가이드</span>' +
        '</div>' +
        /* 홈페이지 */
        '<div class="lup-item">' +
          '<svg class="lup-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' +
          '<span class="lup-item-label">홈페이지</span>' +
        '</div>' +
        /* 공식 포럼 */
        '<div class="lup-item">' +
          '<svg class="lup-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
          '<span class="lup-item-label">공식 포럼</span>' +
        '</div>' +
      '</div>' +
      '<div class="lup-sep"></div>' +
      '<div class="lup-foot">' +
        '<div class="lup-logout" onclick="location.href=\'luum-login.html\'">' +
          '로그아웃' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>' +
        '</div>' +
      '</div>';

    document.body.appendChild(pop);

    /* Position */
    _positionPop(pop, trigger);

    /* Mark current theme */
    var t = _storedTheme();
    pop.querySelectorAll('.lup-th-btn').forEach(function (btn) {
      btn.classList.toggle('on', btn.dataset.ltt === t);
    });
  }

  function _positionPop(pop, trigger) {
    if (!trigger) {
      pop.style.top = '60px';
      pop.style.right = '16px';
      return;
    }
    var r = trigger.getBoundingClientRect();
    var pw = 244;
    var ph = 380; /* estimated */
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    /* Horizontal: align left edge with trigger, clamp to viewport */
    var left = r.left;
    if (left + pw > vw - 8) left = vw - pw - 8;
    if (left < 8) left = 8;

    /* Vertical: prefer above if near bottom, else below */
    var top;
    if (r.top > vh / 2) {
      top = r.top - ph - 8;
      if (top < 8) top = r.bottom + 8;
    } else {
      top = r.bottom + 8;
      if (top + ph > vh - 8) top = r.top - ph - 8;
    }

    pop.style.left = left + 'px';
    pop.style.top  = Math.max(8, top) + 'px';
  }

  function closeUserPopover() {
    var pop = document.getElementById('lup-pop');
    var ov  = document.getElementById('lup-overlay');
    if (pop) pop.remove();
    if (ov)  ov.remove();
  }

  function _toggleThemeSub() {
    var sub = document.getElementById('lup-theme-sub');
    var row = document.getElementById('lup-theme-row');
    if (!sub) return;
    var isOpen = sub.classList.toggle('open');
    if (row) row.classList.toggle('open', isOpen);
  }

  function _noop() {}

  /* ── Init ── */
  function init(selector, opts) {
    opts = opts || {};
    var sb = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!sb) return;
    _sb = sb;

    /* Store opts globally so openUserPopover can use them */
    if (opts.userName)  _globalOpts.userName  = opts.userName;
    if (opts.userEmail) _globalOpts.userEmail  = opts.userEmail;

    /* Inject sidebar CSS once */
    if (!document.getElementById('luum-sidebar-css')) {
      var style = document.createElement('style');
      style.id = 'luum-sidebar-css';
      style.textContent = SIDEBAR_CSS;
      document.head.appendChild(style);
    }

    var foldable   = opts.foldable   !== undefined ? opts.foldable   : false;
    var showUser   = opts.showUser   !== undefined ? opts.showUser   : false;
    var showHeader = opts.showHeader !== undefined ? opts.showHeader : true;
    var userName   = opts.userName  || 'Brian';
    var userEmail  = opts.userEmail || '';
    var initial    = userName.charAt(0).toUpperCase();

    /* Header (로고 + 선택적 폴드 버튼) */
    if (showHeader) {
      var ws = document.createElement('div');
      ws.className = 'lsb-ws';
      ws.innerHTML = LOGO + (foldable ? FOLD_BTN : '');
      sb.insertBefore(ws, sb.firstChild);
    }

    /* Bottom — user card only (theme is in popover) */
    if (showUser) {
      var bot = document.createElement('div');
      bot.className = 'lsb-bot';
      bot.innerHTML =
        '<div class="lsb-user" ' +
          'onclick="LuumSidebar.openUserPopover(event, {userName:\'' + userName + '\', userEmail:\'' + userEmail + '\'})" ' +
          'title="프로필">' +
          '<div class="lsb-av">' + initial + '</div>' +
          '<div class="lsb-uinfo">' +
            '<div class="lsb-uname">' + userName + '</div>' +
            '<div class="lsb-uemail">' + userEmail + '</div>' +
          '</div>' +
        '</div>';
      sb.appendChild(bot);
    }

    /* Restore fold state */
    if (foldable && localStorage.getItem('luum-sb-col') === '1') {
      sb.classList.add('col');
    }
  }

  global.LuumSidebar = {
    init:             init,
    applyTheme:       applyTheme,
    toggleFold:       toggleFold,
    openUserPopover:  openUserPopover,
    closeUserPopover: closeUserPopover,
    _toggleThemeSub:  _toggleThemeSub,
    _noop:            _noop
  };
})(window);
