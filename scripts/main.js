/**
 * Aaron Bandado - Portfolio
 * Navigation, theme, project rendering, deep-linkable case-study modal,
 * carousel, and scroll reveal. No dependencies, no build step.
 */
(function () {
    'use strict';

    var projects = [];
    var current = null;
    var slide = 0;
    var workSlide = 0;
    var workCount = 0;
    var lastFocused = null;
    var touchStartX = 0;
    var workTouchStartX = 0;

    var el = {};

    document.addEventListener('DOMContentLoaded', function () {
        cache();
        initNav();
        initTheme();
        initReveal();
        initModalControls();
        loadProjects();
    });

    function cache() {
        el = {
            hamburger: byId('hamburger'),
            mobileNav: byId('mobile-nav'),
            themeToggle: byId('theme-toggle'),
            workTrack: byId('work-track'),
            workPrev: byId('work-prev'),
            workNext: byId('work-next'),
            workIndicators: byId('work-indicators'),
            workCarousel: document.querySelector('.work-carousel'),
            moreWork: byId('more-work'),
            overlay: byId('modal-overlay'),
            close: byId('modal-close'),
            track: byId('carousel-track'),
            indicators: byId('carousel-indicators'),
            prev: byId('carousel-prev'),
            next: byId('carousel-next'),
            eyebrow: byId('modal-eyebrow'),
            title: byId('modal-title'),
            overview: byId('modal-overview'),
            tech: byId('modal-tech'),
            repo: byId('modal-repo'),
            live: byId('modal-live'),
            trapStart: byId('focus-trap-start'),
            trapEnd: byId('focus-trap-end')
        };
    }

    function byId(id) { return document.getElementById(id); }

    function esc(text) {
        var d = document.createElement('div');
        d.textContent = text == null ? '' : text;
        return d.innerHTML;
    }

    /* ---------------------------------------------------------------- Nav */
    function initNav() {
        if (!el.hamburger || !el.mobileNav) return;

        el.hamburger.addEventListener('click', function () {
            var open = el.hamburger.getAttribute('aria-expanded') === 'true';
            el.hamburger.setAttribute('aria-expanded', String(!open));
            el.mobileNav.hidden = open;
            if (!open) {
                var first = el.mobileNav.querySelector('.nav-mobile-link');
                if (first) first.focus();
            }
        });

        el.mobileNav.querySelectorAll('.nav-mobile-link').forEach(function (link) {
            link.addEventListener('click', closeMobileNav);
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !el.mobileNav.hidden) closeMobileNav();
        });
    }

    function closeMobileNav() {
        if (!el.hamburger) return;
        el.hamburger.setAttribute('aria-expanded', 'false');
        el.mobileNav.hidden = true;
    }

    /* -------------------------------------------------------------- Theme */
    function initTheme() {
        if (!el.themeToggle) return;
        el.themeToggle.addEventListener('click', function () {
            var dark = document.documentElement.getAttribute('data-theme') === 'dark';
            var next = dark ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            try { localStorage.setItem('theme', next); } catch (e) {}
        });
    }

    /* ------------------------------------------------------------- Reveal */
    function initReveal() {
        var items = document.querySelectorAll('.reveal');
        if (!('IntersectionObserver' in window)) {
            items.forEach(function (i) { i.classList.add('is-visible'); });
            return;
        }
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -10% 0px' });
        items.forEach(function (i) { obs.observe(i); });
    }

    /* ------------------------------------------------------------ Projects */
    function loadProjects() {
        if (Array.isArray(window.PORTFOLIO_PROJECTS)) {
            projects = window.PORTFOLIO_PROJECTS;
            renderFeatured();
            renderSecondary();
            openFromHash();
            return;
        }

        fetch('./data/projects.json')
            .then(function (r) { if (!r.ok) throw new Error('load failed'); return r.json(); })
            .then(function (data) {
                projects = data;
                renderFeatured();
                renderSecondary();
                openFromHash();
            })
            .catch(function (err) {
                console.error('Error loading projects:', err);
                if (el.workTrack) {
                    el.workTrack.innerHTML = '<p style="color:var(--text-muted);padding:var(--space-4) 0">Projects are unavailable right now.</p>';
                }
            });
    }

    function tags(list, max) {
        return list.slice(0, max).map(function (t) {
            return '<span class="tag">' + esc(t) + '</span>';
        }).join('');
    }

    function frame(p) {
        var hasImage = p.images && p.images.length > 0;
        var placard =
            '<div class="frame-placard">' +
                '<span class="placard-title">' + esc(p.title) + '</span>' +
                '<span class="placard-meta">' + esc(p.tech.slice(0, 3).join(' · ')) + '</span>' +
            '</div>';
        var img = hasImage
            ? '<img class="frame-img" src="' + esc(p.images[0]) + '" alt="' + esc(p.title) +
              ' screenshot" loading="lazy" onerror="this.remove()">'
            : '';
        return '<div class="project-frame">' + placard + img + '</div>';
    }

    function renderFeatured() {
        if (!el.workTrack) return;
        var featured = projects.filter(function (p) { return p.featured; });
        workCount = featured.length;
        workSlide = 0;

        el.workTrack.innerHTML = featured.map(function (p, i) {
            var meta = [p.year, p.role, p.status].filter(Boolean).map(esc).join('</span><span class="dot">/</span><span>');
            return '' +
                '<article class="work-carousel-slide project-row" role="tabpanel" ' +
                'aria-hidden="' + (i === 0 ? 'false' : 'true') + '" data-index="' + i + '">' +
                '<div class="project-body">' +
                    '<div class="project-eyebrow"><span>' + meta + '</span></div>' +
                    '<h3 class="project-title">' + esc(p.title) + '</h3>' +
                    '<p class="project-desc">' + esc(p.shortDescription) + '</p>' +
                    '<div class="tag-row">' + tags(p.tech, 5) + '</div>' +
                    '<div class="project-actions">' +
                        '<button class="project-cta" type="button" data-id="' + esc(p.id) + '" ' +
                        'aria-label="View more about ' + esc(p.title) + '">' +
                            'View more ' +
                            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' +
                        '</button>' +
                        (p.liveUrl
                            ? '<a href="' + esc(p.liveUrl) + '" class="btn btn-primary btn-sm" target="_blank" rel="noopener noreferrer" ' +
                              'aria-label="Open ' + esc(p.title) + ' live demo">' +
                                '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
                                    '<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>' +
                                '</svg>Live demo' +
                              '</a>'
                            : '') +
                    '</div>' +
                '</div>' +
                frame(p) +
            '</article>';
        }).join('');

        el.workTrack.querySelectorAll('.project-cta').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                openModal(btn.dataset.id);
            });
        });

        initWorkCarousel(featured);
    }

    function initWorkCarousel(featured) {
        if (!el.workTrack || !workCount) return;

        var showControls = workCount > 1;
        if (el.workPrev) el.workPrev.style.display = showControls ? '' : 'none';
        if (el.workNext) el.workNext.style.display = showControls ? '' : 'none';

        if (el.workIndicators) {
            el.workIndicators.innerHTML = showControls ? featured.map(function (p, i) {
                return '<button class="work-carousel-indicator' + (i === 0 ? ' active' : '') + '" type="button" ' +
                    'role="tab" aria-selected="' + (i === 0 ? 'true' : 'false') + '" ' +
                    'data-index="' + i + '" aria-label="' + esc(p.title) + '"></button>';
            }).join('') : '';

            el.workIndicators.querySelectorAll('.work-carousel-indicator').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    goToWorkSlide(parseInt(btn.dataset.index, 10));
                });
            });
        }

        if (el.workPrev) {
            el.workPrev.onclick = function () { changeWorkSlide(-1); };
        }
        if (el.workNext) {
            el.workNext.onclick = function () { changeWorkSlide(1); };
        }

        if (el.workCarousel && showControls) {
            el.workCarousel.onkeydown = onWorkCarouselKey;
        }

        setupWorkSwipe();
        updateWorkCarousel();
    }

    function onWorkCarouselKey(e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); changeWorkSlide(-1); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); changeWorkSlide(1); }
    }

    function changeWorkSlide(dir) {
        if (workCount < 2) return;
        workSlide = (workSlide + dir + workCount) % workCount;
        updateWorkCarousel();
    }

    function goToWorkSlide(i) {
        workSlide = i;
        updateWorkCarousel();
    }

    function updateWorkCarousel() {
        if (!el.workTrack) return;
        el.workTrack.style.transform = 'translateX(-' + (workSlide * 100) + '%)';

        el.workTrack.querySelectorAll('.work-carousel-slide').forEach(function (slideEl, i) {
            slideEl.setAttribute('aria-hidden', i === workSlide ? 'false' : 'true');
        });

        if (el.workIndicators) {
            el.workIndicators.querySelectorAll('.work-carousel-indicator').forEach(function (btn, i) {
                btn.classList.toggle('active', i === workSlide);
                btn.setAttribute('aria-selected', i === workSlide ? 'true' : 'false');
            });
        }
    }

    function setupWorkSwipe() {
        if (!el.workCarousel || workCount < 2) return;
        var viewport = el.workCarousel.querySelector('.work-carousel-viewport');
        if (!viewport) return;

        viewport.addEventListener('touchstart', function (e) {
            workTouchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        viewport.addEventListener('touchend', function (e) {
            var diff = workTouchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) changeWorkSlide(diff > 0 ? 1 : -1);
        }, { passive: true });
    }

    function renderSecondary() {
        if (!el.moreWork) return;
        var secondary = projects.filter(function (p) { return !p.featured; });
        if (!secondary.length) { el.moreWork.remove(); return; }

        el.moreWork.innerHTML = secondary.map(function (p) {
            return '' +
                '<a class="more-card" href="' + esc(p.repoUrl) + '" target="_blank" rel="noopener noreferrer">' +
                    '<h4>' + esc(p.title) + '</h4>' +
                    '<p>' + esc(p.shortDescription) + '</p>' +
                    '<div class="tag-row">' + tags(p.tech, 3) + '</div>' +
                '</a>';
        }).join('');
    }

    /* -------------------------------------------------------------- Modal */
    function openModal(id, fromHistory) {
        var p = projects.find(function (x) { return x.id === id; });
        if (!p) return;
        current = p;
        slide = 0;
        lastFocused = document.activeElement;

        el.eyebrow.textContent = [p.year, p.role, p.status].filter(Boolean).join('  ·  ');
        el.title.textContent = p.title;
        el.overview.textContent = (p.caseStudy && p.caseStudy.overview) || p.longDescription || p.shortDescription || '';
        el.tech.innerHTML = tags(p.tech, p.tech.length);

        el.repo.href = p.repoUrl || '#';
        el.repo.style.display = p.repoUrl ? 'inline-flex' : 'none';
        if (p.liveUrl) {
            el.live.href = p.liveUrl;
            el.live.style.display = 'inline-flex';
        } else {
            el.live.style.display = 'none';
        }

        setupCarousel(p.images && p.images.length ? p.images : null);

        el.overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        el.close.focus();
        document.addEventListener('keydown', onModalKey);

        if (!fromHistory) {
            try { history.pushState({ caseId: id }, '', '#' + id); } catch (e) {}
        }
    }

    function closeModal(fromHistory) {
        el.overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        document.removeEventListener('keydown', onModalKey);
        if (lastFocused && lastFocused.focus) lastFocused.focus();
        current = null;

        if (!fromHistory && history.state && history.state.caseId) {
            try { history.back(); } catch (e) {}
        }
    }

    function isOpen() { return el.overlay.getAttribute('aria-hidden') === 'false'; }

    function onModalKey(e) {
        switch (e.key) {
            case 'Escape': closeModal(); break;
            case 'ArrowLeft': changeSlide(-1); break;
            case 'ArrowRight': changeSlide(1); break;
            case 'Tab': trapFocus(e); break;
        }
    }

    function trapFocus(e) {
        var focusables = el.overlay.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
        var visible = Array.prototype.filter.call(focusables, function (n) {
            return n.offsetParent !== null || n === el.trapStart || n === el.trapEnd;
        });
        var first = visible[0];
        var last = visible[visible.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault(); first.focus();
        }
    }

    /* ------------------------------------------------------------ Carousel */
    function setupCarousel(images) {
        if (!images) {
            el.track.innerHTML = '<div class="carousel-empty"><span>' + esc(current.title) + '</span><span>Screenshot coming soon</span></div>';
            el.indicators.innerHTML = '';
            toggleCarouselControls(false);
            return;
        }
        toggleCarouselControls(images.length > 1);

        el.track.innerHTML = images.map(function (img, i) {
            return '<div class="carousel-slide' + (i === 0 ? ' active' : '') + '">' +
                '<img src="' + esc(img) + '" alt="' + esc(current.title) + ' screenshot ' + (i + 1) + '" ' +
                'onerror="this.closest(\'.carousel-slide\').innerHTML=\'<div class=&quot;carousel-empty&quot;>Image unavailable</div>\'">' +
                '</div>';
        }).join('');

        el.indicators.innerHTML = images.length > 1 ? images.map(function (_, i) {
            return '<button class="carousel-indicator' + (i === 0 ? ' active' : '') + '" type="button" data-index="' + i + '" aria-label="Screenshot ' + (i + 1) + '"></button>';
        }).join('') : '';

        el.indicators.querySelectorAll('.carousel-indicator').forEach(function (btn) {
            btn.addEventListener('click', function () { goToSlide(parseInt(btn.dataset.index, 10)); });
        });

        setupSwipe();
    }

    function toggleCarouselControls(show) {
        var display = show ? '' : 'none';
        el.prev.style.display = display;
        el.next.style.display = display;
    }

    function changeSlide(dir) {
        if (!current || !current.images || current.images.length < 2) return;
        slide = (slide + dir + current.images.length) % current.images.length;
        updateCarousel();
    }

    function goToSlide(i) { slide = i; updateCarousel(); }

    function updateCarousel() {
        el.track.querySelectorAll('.carousel-slide').forEach(function (s, i) {
            s.classList.toggle('active', i === slide);
        });
        el.indicators.querySelectorAll('.carousel-indicator').forEach(function (b, i) {
            b.classList.toggle('active', i === slide);
        });
    }

    function setupSwipe() {
        var region = el.track.parentElement;
        region.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        region.addEventListener('touchend', function (e) {
            var diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) changeSlide(diff > 0 ? 1 : -1);
        }, { passive: true });
    }

    /* ------------------------------------------------------ Modal controls */
    function initModalControls() {
        if (el.close) el.close.addEventListener('click', function () { closeModal(); });
        if (el.prev) el.prev.addEventListener('click', function () { changeSlide(-1); });
        if (el.next) el.next.addEventListener('click', function () { changeSlide(1); });
        if (el.overlay) {
            el.overlay.addEventListener('click', function (e) {
                if (e.target === el.overlay) closeModal();
            });
        }
        window.addEventListener('popstate', function (e) {
            var caseId = e.state && e.state.caseId;
            if (caseId) {
                openModal(caseId, true);
            } else if (isOpen()) {
                closeModal(true);
            }
        });
    }

    function openFromHash() {
        var id = decodeURIComponent((location.hash || '').replace(/^#/, ''));
        if (!id) return;
        var match = projects.find(function (p) { return p.id === id && p.featured; });
        if (match) {
            try { history.replaceState({ caseId: id }, '', '#' + id); } catch (e) {}
            openModal(id, true);
        }
    }
})();
