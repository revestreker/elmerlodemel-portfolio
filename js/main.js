/* =============================================================================
   Elmer Lødemel - portfolio
   Shared script for index.html (hero + category cards + contact) and
   work.html (one category's projects + lightbox).
   No dependencies, no build step.
   ========================================================================== */

(function () {
  'use strict';

  var FALLBACK_EMAIL = 'elmer@revestreker.com';

  /* Data comes from data/categories.js + data/projects.js, loaded as plain
     scripts before this one. They set globals rather than being fetched so the
     site also works opened straight off the disk, where fetch() is blocked. */
  var CATEGORIES = window.CATEGORIES || [];
  var PROJECTS   = (window.PROJECTS || []).map(normalizeProject);

  /* --- helpers ------------------------------------------------------------ */

  function slug(s) {
    return String(s)
      .toLowerCase()
      .trim()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function el(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text != null) n.textContent = text;
    return n;
  }

  function svg(markup, className) {
    var wrapper = document.createElement('span');
    wrapper.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"' +
      (className ? ' class="' + className + '"' : '') + '>' + markup + '</svg>';
    return wrapper.firstChild;
  }

  function plural(n, word) {
    return n + ' ' + word + (n === 1 ? '' : 's');
  }

  /* Images may be plain paths or { src, alt } objects. */
  function normalizeImage(img) {
    if (typeof img === 'string') return { src: img, alt: '' };
    return { src: img.src || '', alt: img.alt || '' };
  }

  /* An item is either an image or a piece of embedded media. Strings and
     {src, alt} objects stay images; anything with a `type` is media. */
  function normalizeItem(item) {
    if (typeof item === 'string') return { kind: 'image', src: item, alt: '' };
    if (!item.type) return { kind: 'image', src: item.src || '', alt: item.alt || '' };
    item.kind = item.type;
    return item;
  }

  function normalizeProject(p) {
    var items = (p.items || p.images || []).map(normalizeItem)
      .filter(function (i) { return i.kind !== 'image' || i.src; });

    return {
      title: p.title || 'Untitled',
      category: p.category || '',
      items: items,
      /* the lightbox only pages through the stills */
      images: items.filter(function (i) { return i.kind === 'image'; })
    };
  }

  function missingData(node) {
    if (node) node.textContent =
      'Could not find the work data - check that data/categories.js and ' +
      'data/projects.js are next to this page.';
    console.error('[portfolio] window.CATEGORIES / window.PROJECTS not set');
  }

  /* ==========================================================================
     Social icons - drawn inline so they inherit currentColor
     ========================================================================== */

  var SOCIALS = [
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/revestreken/',
      icon: '<rect x="2.8" y="2.8" width="18.4" height="18.4" rx="5.4" stroke="currentColor" stroke-width="1.7"/>' +
            '<circle cx="12" cy="12" r="4.3" stroke="currentColor" stroke-width="1.7"/>' +
            '<circle cx="17.3" cy="6.7" r="1.25" fill="currentColor"/>'
    },
    {
      name: 'YouTube',
      href: 'https://www.youtube.com/@revestreken',
      icon: '<rect x="2.2" y="5.2" width="19.6" height="13.6" rx="4.4" stroke="currentColor" stroke-width="1.7"/>' +
            '<path d="M10.3 9.4 15.4 12l-5.1 2.6z" fill="currentColor"/>'
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/in/elmerlodemel/',
      icon: '<rect x="2.8" y="2.8" width="18.4" height="18.4" rx="5" stroke="currentColor" stroke-width="1.7"/>' +
            '<circle cx="7.6" cy="7.9" r="1.35" fill="currentColor"/>' +
            '<path d="M6.5 10.9h2.2v6.9H6.5z" fill="currentColor"/>' +
            '<path d="M11.1 10.9h2.1v.97a2.63 2.63 0 0 1 2.31-1.17c1.79 0 2.89 1.12 2.89 3.18v3.9h-2.2v-3.5c0-.98-.4-1.6-1.29-1.6-.87 0-1.51.66-1.51 1.68v3.42h-2.2z" fill="currentColor"/>'
    },
    {
      name: 'Email',
      href: 'mailto:' + FALLBACK_EMAIL,
      icon: '<rect x="2.5" y="4.6" width="19" height="14.8" rx="3.6" stroke="currentColor" stroke-width="1.7"/>' +
            '<path d="m4.4 8 7.6 5.3L19.6 8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>'
    }
  ];

  function renderSocials(list) {
    if (!list) return;

    SOCIALS.forEach(function (s) {
      var li = el('li');
      var a = el('a', 'social');
      a.href = s.href;
      a.setAttribute('aria-label', s.name);
      a.title = s.name;
      if (s.href.indexOf('http') === 0) {
        a.rel = 'me noopener';
        a.target = '_blank';
      }
      a.appendChild(svg(s.icon));
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  /* ==========================================================================
     Indigo bar - one link per category, on every page
     ========================================================================== */

  /* The bar wraps to two or three rows on narrow screens, so the space the rest
     of the page has to leave for it isn't a constant. Measure it. */
  function syncBarHeight() {
    var bar = document.querySelector('.topbar');
    if (!bar) return;

    function apply() {
      document.documentElement.style.setProperty('--bar-offset', bar.offsetHeight + 'px');
    }

    apply();
    if (window.ResizeObserver) new ResizeObserver(apply).observe(bar);
    else window.addEventListener('resize', apply);
  }

  function renderTopbar(list) {
    if (!list) return;

    var here = new URLSearchParams(location.search).get('c');

    CATEGORIES.forEach(function (category) {
      var li = el('li');
      var a = el('a', null, category.title);
      a.href = 'work.html?c=' + encodeURIComponent(category.slug);
      if (category.slug === here) a.setAttribute('aria-current', 'page');
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  /* ==========================================================================
     Hero - autoplaying reel
     ========================================================================== */

  function initHero() {
    var video = document.querySelector('.hero-video');
    var button = document.getElementById('hero-sound');
    if (!video || !button) return;

    var label = button.querySelector('.hero-sound-label');
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)');

    /* The reel opens on its own title card; data-start skips past it, on the
       first play and again every time `loop` sends us back to zero. */
    var start = parseFloat(video.dataset.start || 0) || 0;

    function toStart() {
      if (!start) return;
      if (video.duration && start >= video.duration - 1) return;
      try { video.currentTime = start; } catch (e) { /* not seekable yet */ }
    }

    if (start) {
      if (video.readyState >= 1) toStart();
      video.addEventListener('loadedmetadata', toStart);
      video.addEventListener('timeupdate', function () {
        if (video.currentTime < start - 0.25) toStart();
      });
    }

    /* Reduced motion: don't loop video in the background - hand over a play toggle. */
    if (calm.matches) {
      video.removeAttribute('autoplay');
      video.pause();

      label.textContent = 'Play reel';
      button.addEventListener('click', function () {
        if (video.paused) { video.play(); label.textContent = 'Pause reel'; }
        else { video.pause(); label.textContent = 'Play reel'; }
        button.setAttribute('aria-pressed', String(!video.paused));
      });
      return;
    }

    /* Autoplay only works muted; the button hands the sound back. */
    button.addEventListener('click', function () {
      video.muted = !video.muted;
      if (!video.muted && video.paused) video.play();
      label.textContent = video.muted ? 'Sound off' : 'Sound on';
      button.setAttribute('aria-pressed', String(!video.muted));
    });

    /* Some browsers refuse even a muted autoplay - fall back to the poster. */
    var attempt = video.play();
    if (attempt && attempt.catch) {
      attempt.catch(function () {
        label.textContent = 'Play reel';
        button.addEventListener('click', function () { video.play(); }, { once: true });
      });
    }
  }

  /* ==========================================================================
     Home - category cards
     ========================================================================== */

  function initHome(cardsRoot) {
    if (!CATEGORIES.length) return missingData(cardsRoot.querySelector('.status') || cardsRoot);

    cardsRoot.innerHTML = '';

    CATEGORIES.forEach(function (category) {
      var mine = PROJECTS.filter(function (p) { return slug(p.category) === category.slug; });
      var images = mine.reduce(function (n, p) { return n + p.images.length; }, 0);

      var a = el('a', 'card');
      a.href = 'work.html?c=' + encodeURIComponent(category.slug);

      var frame = el('div', 'card-frame');

      var img = new Image();
      img.src = category.cover;
      img.alt = category.title;
      img.loading = 'lazy';
      img.decoding = 'async';
      frame.appendChild(img);

      frame.appendChild(el('span', 'card-count',
        plural(mine.length, 'project') + ' · ' + plural(images, 'image')));

      var body = el('div', 'card-body');
      body.appendChild(el('h3', 'card-title', category.title));
      body.appendChild(svg(
        '<path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round"/>', 'card-arrow'));

      a.appendChild(frame);
      a.appendChild(body);

      cardsRoot.appendChild(a);
    });
  }

  /* ==========================================================================
     Category page - every project in one category
     ========================================================================== */

  var projectsInView = [];   // what the lightbox pages through

  function initCategory(listRoot) {
    var status = document.getElementById('status');
    var wanted = new URLSearchParams(location.search).get('c');

    if (!CATEGORIES.length) return missingData(status);

    var category = CATEGORIES.filter(function (c) { return c.slug === wanted; })[0] || CATEGORIES[0];

    document.title = category.title + ' - Elmer Lødemel';
    document.getElementById('work-title').textContent = category.title;

    /* sibling categories as chips */
    var chips = document.getElementById('chips');
    CATEGORIES.forEach(function (c) {
      var a = el('a', 'chip', c.title);
      a.href = 'work.html?c=' + encodeURIComponent(c.slug);
      if (c.slug === category.slug) a.setAttribute('aria-current', 'page');
      chips.appendChild(a);
    });

    projectsInView = PROJECTS.filter(function (p) { return slug(p.category) === category.slug; });

    if (status) status.remove();

    if (!projectsInView.length) {
      listRoot.appendChild(el('p', 'status', 'Nothing here yet.'));
      return;
    }

    projectsInView.forEach(function (project, projectIndex) {
      var section = el('section', 'project');

      var head = el('div', 'project-head');
      head.appendChild(el('h2', 'project-title', project.title));
      if (project.images.length) {
        head.appendChild(el('span', 'project-count', plural(project.images.length, 'image')));
      }
      section.appendChild(head);

      /* Walk the items in order. Runs of stills collect into one masonry
         block; everything else gets its own block. `frames` hands each still
         its index in the project so the lightbox opens on the right one. */
      var gallery = null;
      var frames = { next: 0 };

      project.items.forEach(function (item) {
        if (item.kind === 'image') {
          if (!gallery) { gallery = el('ul', 'shots'); section.appendChild(gallery); }
          gallery.appendChild(buildShot(project, item, projectIndex, frames.next++));
          return;
        }

        gallery = null;
        var block = buildMedia(item, project, projectIndex, frames);
        if (block) section.appendChild(block);
      });

      listRoot.appendChild(section);
    });
  }

  /* ==========================================================================
     The pieces a project is made of
     ========================================================================== */

  function buildShot(project, image, projectIndex, frameIndex) {
    var li = el('li');
    var button = el('button', 'shot');
    button.type = 'button';
    button.dataset.project = String(projectIndex);
    button.dataset.frame = String(frameIndex);
    button.setAttribute('aria-label', 'Open ' + project.title + ', image ' + (frameIndex + 1));

    var img = new Image();
    img.src = image.src;
    img.alt = image.alt || project.title;
    img.loading = 'lazy';
    img.decoding = 'async';

    button.appendChild(img);
    li.appendChild(button);
    return li;
  }

  function frame(src, title, ratio) {
    var wrap = el('div', 'embed');
    if (ratio) wrap.style.aspectRatio = ratio;

    var iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.title = title || 'Embedded video';
    iframe.loading = 'lazy';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';

    wrap.appendChild(iframe);
    return wrap;
  }

  function media(className, inner, caption, text) {
    var block = el('div', 'feature ' + className);
    block.appendChild(inner);
    if (caption) block.appendChild(el('p', 'feature-caption', caption));
    if (text) block.appendChild(el('p', 'feature-text', text));
    return block;
  }

  /* Items laid out across one row instead of stacked. */
  function buildRow(item, project, projectIndex, frames) {
    var row = el('div', 'feature row');
    var kids = (item.items || []).map(normalizeItem);
    row.style.setProperty('--row-cols', item.columns || kids.length);

    kids.forEach(function (kid) {
      var cell = el('div', 'row-cell');

      if (kid.kind === 'image') {
        var list = el('ul', 'shots shots-plain');
        list.appendChild(buildShot(project, kid, projectIndex, frames.next++));
        cell.appendChild(list);
      } else {
        var block = buildMedia(kid, project, projectIndex, frames);
        if (block) { block.classList.remove('feature'); cell.appendChild(block); }
      }

      row.appendChild(cell);
    });

    return row;
  }

  /* YouTube refuses to embed on pages with no real origin - opening the site
     as a local file gives "Error 153". So show a poster first: on a served
     page clicking swaps in the player, from disk it opens YouTube instead. */
  function buildYouTube(item) {
    var block = el('div', 'feature feature-video');
    var shell = el('div', 'embed');

    var button = el('button', 'facade');
    button.type = 'button';
    button.setAttribute('aria-label', 'Play ' + (item.title || 'video'));

    if (item.poster) {
      var img = new Image();
      img.src = item.poster;
      img.alt = '';
      img.loading = 'lazy';
      button.appendChild(img);
    }
    button.appendChild(svg(
      '<circle cx="12" cy="12" r="11" fill="rgba(0,0,0,.55)"/>' +
      '<path d="M9.8 8.2 16 12l-6.2 3.8z" fill="currentColor"/>', 'facade-play'));

    button.addEventListener('click', function () {
      if (location.protocol === 'file:') {
        window.open(item.href || ('https://www.youtube.com/watch?v=' + item.id), '_blank', 'noopener');
        return;
      }
      shell.replaceChild(
        frame('https://www.youtube-nocookie.com/embed/' + item.id +
              '?autoplay=1' + (item.start ? '&start=' + item.start : ''),
              item.title).firstChild,
        button);
    });

    shell.appendChild(button);
    block.appendChild(shell);
    if (item.title) block.appendChild(el('p', 'feature-caption', item.title));
    return block;
  }

  /* A deck of panels: one big frame, arrows, counter, scrubbable strip. */
  function buildDeck(item) {
    var images = item.images || [];
    if (!images.length) return null;

    var block = el('div', 'feature deck');
    var stage = el('div', 'deck-stage');
    if (item.ratio) stage.style.aspectRatio = item.ratio;

    var img = new Image();
    img.className = 'deck-image';
    img.src = images[0];
    img.alt = (item.title || 'Panel') + ' 1';
    img.decoding = 'async';
    stage.appendChild(img);

    var prev = el('button', 'deck-nav deck-prev', '‹');
    var next = el('button', 'deck-nav deck-next', '›');
    prev.type = next.type = 'button';
    prev.setAttribute('aria-label', 'Previous panel');
    next.setAttribute('aria-label', 'Next panel');
    stage.appendChild(prev);
    stage.appendChild(next);

    var bar = el('div', 'deck-bar');
    var counter = el('span', 'deck-counter', '1 / ' + images.length);
    var label = el('span', 'deck-title', item.title || '');
    bar.appendChild(label);
    bar.appendChild(counter);

    var at = 0;
    function show(i) {
      at = (i + images.length) % images.length;
      img.src = images[at];
      img.alt = (item.title || 'Panel') + ' ' + (at + 1);
      counter.textContent = (at + 1) + ' / ' + images.length;
      range.value = String(at);
      var ahead = new Image(); ahead.src = images[(at + 1) % images.length];
    }

    prev.addEventListener('click', function () { show(at - 1); });
    next.addEventListener('click', function () { show(at + 1); });

    var range = document.createElement('input');
    range.type = 'range';
    range.className = 'deck-range';
    range.min = '0';
    range.max = String(images.length - 1);
    range.value = '0';
    range.setAttribute('aria-label', 'Panel');
    range.addEventListener('input', function () { show(Number(range.value)); });

    stage.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') { event.preventDefault(); show(at + 1); }
      else if (event.key === 'ArrowLeft') { event.preventDefault(); show(at - 1); }
    });
    stage.tabIndex = 0;

    block.appendChild(stage);
    block.appendChild(bar);
    block.appendChild(range);
    return block;
  }

  function buildMedia(item, project, projectIndex, frames) {
    switch (item.kind) {

      case 'row':
        return buildRow(item, project, projectIndex, frames);

      case 'deck':
        return buildDeck(item);

      case 'vimeo':
        return media('feature-video',
          frame('https://player.vimeo.com/video/' + item.id +
                (item.hash ? '?h=' + item.hash : ''), item.title),
          item.title, item.text);

      case 'youtube':
        return buildYouTube(item);

      case 'video': {
        var video = document.createElement('video');
        video.className = 'feature-player';
        video.controls = true;
        video.playsInline = true;
        video.preload = 'metadata';
        if (item.poster) video.poster = item.poster;

        var source = document.createElement('source');
        source.src = item.src;
        source.type = 'video/mp4';
        video.appendChild(source);

        return media('feature-video', video, item.title);
      }

      case 'link': {
        var a = el('a', 'feature-tile');
        a.href = item.href;
        a.target = '_blank';
        a.rel = 'noopener';

        var img = new Image();
        img.src = item.image;
        img.alt = item.label || 'Open';
        img.loading = 'lazy';
        a.appendChild(img);
        a.appendChild(el('span', 'feature-badge', item.label || 'Open →'));

        var wrap = el('div', 'feature' + (item.feature ? ' feature-wide' : ''));
        wrap.appendChild(a);
        return wrap;
      }

      case 'locked':
        return buildLocked(item);
    }
    return null;
  }

  /* A client-side gate. It hides the note below from casual view - it is NOT
     security, and nothing secret should ever be put behind it. */
  function buildLocked(item) {
    var block = el('div', 'feature locked');
    if (item.name) block.appendChild(el('h3', 'locked-name', item.name));

    var form = el('form', 'locked-form');
    form.appendChild(svg(
      '<rect x="4.5" y="10.5" width="15" height="10" rx="3" stroke="currentColor" stroke-width="1.8"/>' +
      '<path d="M8.2 10.4V8a3.8 3.8 0 0 1 7.6 0v2.4" stroke="currentColor" stroke-width="1.8"/>',
      'locked-icon'));

    var input = document.createElement('input');
    input.type = 'password';
    input.placeholder = 'Password';
    input.autocomplete = 'off';
    input.setAttribute('aria-label', 'Password');

    var button = el('button', 'locked-go', 'Unlock');
    button.type = 'submit';

    form.appendChild(input);
    form.appendChild(button);

    var note = el('p', 'locked-note');
    note.hidden = true;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (input.value === item.password) {
        note.textContent = item.note || 'Unlocked.';
        note.hidden = false;
        form.hidden = true;
      } else {
        form.classList.remove('shake');
        void form.offsetWidth;             /* restart the animation */
        form.classList.add('shake');
        input.select();
      }
    });

    block.appendChild(form);
    block.appendChild(note);
    return block;
  }

  /* ==========================================================================
     Lightbox - scoped to one project
     ========================================================================== */

  function initLightbox(listRoot) {
    var lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    var lbImage = document.getElementById('lb-image');
    var lbTitle = document.getElementById('lb-title');
    var lbCount = document.getElementById('lb-counter');
    var lbStrip = document.getElementById('lb-strip');
    var lbClose = document.getElementById('lb-close');

    var current = null;
    var frame = 0;
    var lastFocused = null;

    function preload(src) { if (src) { var i = new Image(); i.src = src; } }

    function showFrame(index) {
      if (!current) return;

      var total = current.images.length;
      frame = (index + total) % total;

      var image = current.images[frame];
      lbImage.src = image.src;
      lbImage.alt = image.alt || (current.title + ' - image ' + (frame + 1) + ' of ' + total);
      lbCount.textContent = (frame + 1) + ' / ' + total;

      Array.prototype.forEach.call(lbStrip.children, function (thumb, i) {
        var on = i === frame;
        thumb.setAttribute('aria-selected', on ? 'true' : 'false');
        if (on) thumb.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      });

      if (total > 1) {
        preload(current.images[(frame + 1) % total].src);
        preload(current.images[(frame - 1 + total) % total].src);
      }
    }

    function open(projectIndex, startFrame) {
      var project = projectsInView[projectIndex];
      if (!project || !project.images.length) return;

      lastFocused = document.activeElement;
      current = project;

      lbTitle.textContent = project.title;
      lightbox.dataset.single = project.images.length === 1 ? 'true' : 'false';

      lbStrip.innerHTML = '';
      project.images.forEach(function (image, i) {
        var thumb = el('button', 'lb-thumb');
        thumb.type = 'button';
        thumb.setAttribute('role', 'tab');
        thumb.setAttribute('aria-label', 'Image ' + (i + 1));
        thumb.dataset.frame = String(i);

        var img = new Image();
        img.src = image.src;
        img.alt = '';
        img.loading = 'lazy';
        thumb.appendChild(img);

        lbStrip.appendChild(thumb);
      });

      showFrame(startFrame || 0);

      lightbox.hidden = false;
      document.body.classList.add('lb-open');
      lbClose.focus();
    }

    function close() {
      lightbox.hidden = true;
      document.body.classList.remove('lb-open');
      lbImage.removeAttribute('src');
      current = null;
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    listRoot.addEventListener('click', function (event) {
      var shot = event.target.closest ? event.target.closest('.shot') : null;
      if (shot) open(Number(shot.dataset.project), Number(shot.dataset.frame));
    });

    lbStrip.addEventListener('click', function (event) {
      var thumb = event.target.closest ? event.target.closest('.lb-thumb') : null;
      if (thumb) showFrame(Number(thumb.dataset.frame));
    });

    lbClose.addEventListener('click', close);
    document.getElementById('lb-prev').addEventListener('click', function () { showFrame(frame - 1); });
    document.getElementById('lb-next').addEventListener('click', function () { showFrame(frame + 1); });

    document.addEventListener('keydown', function (event) {
      if (lightbox.hidden) return;
      if (event.key === 'Escape') close();
      else if (event.key === 'ArrowRight') showFrame(frame + 1);
      else if (event.key === 'ArrowLeft') showFrame(frame - 1);
    });

    /* keep tabbing inside the dialog while it's open */
    lightbox.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab') return;

      var visible = Array.prototype.filter.call(
        lightbox.querySelectorAll('button:not([disabled])'),
        function (n) { return n.offsetParent !== null; });
      if (!visible.length) return;

      var first = visible[0];
      var last = visible[visible.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    });
  }

  /* ==========================================================================
     Contact form
     ========================================================================== */

  function initForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var formStatus = document.getElementById('form-status');

    function setStatus(message, state) {
      formStatus.textContent = message;
      if (state) formStatus.dataset.state = state;
      else delete formStatus.dataset.state;
    }

    form.addEventListener('submit', function (event) {
      var fields = form.elements;

      if (fields.company.value) {          // honeypot tripped - silently drop it
        event.preventDefault();
        return;
      }

      if (!form.checkValidity()) {
        event.preventDefault();
        setStatus('Please fill in name, a valid email, and a message.', 'error');
        form.reportValidity();
        return;
      }

      /* No endpoint configured yet: fall back to a pre-filled mail draft. */
      if (!form.getAttribute('action')) {
        event.preventDefault();
        var subject = 'Portfolio enquiry from ' + fields.name.value;
        var body = fields.message.value + '\n\n- ' + fields.name.value + ' (' + fields.email.value + ')';
        window.location.href = 'mailto:' + FALLBACK_EMAIL +
          '?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(body);
        setStatus('Opening your mail app…');
        return;
      }

      setStatus('Sending…');
    });
  }

  /* ==========================================================================
     Boot - same script, both pages
     ========================================================================== */

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  renderTopbar(document.getElementById('topbar-links'));
  syncBarHeight();

  var toTop = document.getElementById('to-top');
  if (toTop) toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  renderSocials(document.getElementById('socials'));
  initHero();
  initForm();

  var cards = document.getElementById('cards');
  if (cards) initHome(cards);

  var list = document.getElementById('project-list');
  if (list) {
    initCategory(list);
    initLightbox(list);
  }
})();
