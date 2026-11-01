document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.querySelector('.theme-toggle');
  const themeIcon = themeToggle?.querySelector('.theme-toggle-icon');
  const themeLabel = themeToggle?.querySelector('.theme-toggle-label');
  let savedTheme = null;

  try {
    savedTheme = window.localStorage.getItem('heoiscode-theme');
  } catch (error) {
    console.warn('Unable to load the saved color theme.', error);
  }

  const setTheme = (theme) => {
    const isDark = theme === 'dark';
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';

    if (themeToggle && themeIcon && themeLabel) {
      themeIcon.textContent = isDark ? '☀' : '☾';
      themeLabel.textContent = isDark ? 'Light' : 'Dark';
      themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
      themeToggle.setAttribute('aria-pressed', String(isDark));
    }
  };

  setTheme(savedTheme === 'dark' ? 'dark' : 'light');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      setTheme(nextTheme);

      try {
        window.localStorage.setItem('heoiscode-theme', nextTheme);
      } catch (error) {
        console.warn('Unable to save the color theme preference.', error);
      }
    });
  }

  window.setTimeout(() => {
    document.body.classList.add('loaded');
  }, 850);

  const year = document.querySelector('#year');
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const visitorCount = document.querySelector('#visitor-count');

  if (visitorCount) {
    fetch('/api/visitor-count', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) {
          const errorResult = await response.json().catch(() => ({}));
          const upstreamStatus = Number.isInteger(errorResult.upstreamStatus)
            ? ` CounterAPI status: ${errorResult.upstreamStatus}.`
            : '';
          throw new Error(`Visitor counter request failed with status ${response.status}.${upstreamStatus}`);
        }

        const result = await response.json();

        if (!Number.isSafeInteger(result.value) || result.value < 0) {
          throw new Error('Visitor counter returned an invalid count.');
        }

        visitorCount.textContent = `PAGE VIEWS // ${new Intl.NumberFormat('en-PH').format(result.value)}`;
      })
      .catch((error) => {
        console.error('Unable to load the visitor count.', error);
        visitorCount.textContent = 'PAGE VIEWS // UNAVAILABLE';
      });
  }

  const customCursor = document.querySelector('.custom-cursor');
  const supportsCustomCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (customCursor instanceof HTMLElement && supportsCustomCursor) {
    const updateCursor = (event) => {
      if (event.pointerType !== 'mouse') {
        return;
      }

      document.documentElement.classList.add('has-custom-cursor');
      customCursor.classList.add('is-visible');
      customCursor.classList.remove('is-hidden');
      customCursor.style.setProperty('--cursor-x', `${event.clientX}px`);
      customCursor.style.setProperty('--cursor-y', `${event.clientY}px`);

      const target = event.target instanceof Element ? event.target : null;
      const isTextEntry = target?.closest('input, textarea, [contenteditable="true"]');
      const isInteractive = target?.closest('a, button, select, summary, [role="button"], .hero-mascot');
      customCursor.classList.toggle('is-hidden', Boolean(isTextEntry));
      customCursor.classList.toggle('is-hovering', Boolean(isInteractive));
    };

    const hideCursor = () => {
      customCursor.classList.remove('is-visible');
    };

    document.addEventListener('pointermove', updateCursor);
    document.addEventListener('pointerdown', updateCursor);
    document.addEventListener('pointerout', (event) => {
      if (event.relatedTarget === null) {
        hideCursor();
      }
    });
    document.addEventListener('keydown', () => {
      customCursor.classList.add('is-hidden');
      hideCursor();
      document.documentElement.classList.remove('has-custom-cursor');
    });
  }

  const mascot = document.querySelector('.hero-mascot');

  if (mascot instanceof HTMLElement) {
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    const placeMascot = (left, top) => {
      const bounds = mascot.getBoundingClientRect();
      const maxLeft = Math.max(0, window.innerWidth - bounds.width);
      const maxTop = Math.max(0, window.innerHeight - bounds.height);
      mascot.style.left = `${Math.max(0, Math.min(left, maxLeft))}px`;
      mascot.style.top = `${Math.max(0, Math.min(top, maxTop))}px`;
      mascot.style.right = 'auto';
      mascot.style.bottom = 'auto';
    };

    mascot.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) {
        return;
      }

      event.preventDefault();
      mascot.classList.add('is-moved');
      mascot.classList.add('is-dragging');
      const bounds = mascot.getBoundingClientRect();
      dragOffsetX = event.clientX - bounds.left;
      dragOffsetY = event.clientY - bounds.top;
      placeMascot(bounds.left, bounds.top);
      mascot.setPointerCapture(event.pointerId);
    });

    mascot.addEventListener('pointermove', (event) => {
      if (mascot.hasPointerCapture(event.pointerId)) {
        placeMascot(event.clientX - dragOffsetX, event.clientY - dragOffsetY);
      }
    });

    const stopDragging = (event) => {
      if (mascot.hasPointerCapture(event.pointerId)) {
        mascot.releasePointerCapture(event.pointerId);
      }
      mascot.classList.remove('is-dragging');
    };

    mascot.addEventListener('pointerup', stopDragging);
    mascot.addEventListener('pointercancel', stopDragging);

    mascot.addEventListener('keydown', (event) => {
      const movement = event.shiftKey ? 40 : 16;
      if (event.key.startsWith('Arrow')) {
        mascot.classList.add('is-moved');
      }
      const bounds = mascot.getBoundingClientRect();
      const positions = {
        ArrowUp: [bounds.left, bounds.top - movement],
        ArrowDown: [bounds.left, bounds.top + movement],
        ArrowLeft: [bounds.left - movement, bounds.top],
        ArrowRight: [bounds.left + movement, bounds.top]
      };
      const nextPosition = positions[event.key];

      if (nextPosition) {
        event.preventDefault();
        placeMascot(...nextPosition);
      }
    });

    window.addEventListener('resize', () => {
      if (mascot.style.left && mascot.style.top) {
        const bounds = mascot.getBoundingClientRect();
        placeMascot(bounds.left, bounds.top);
      }
    });
  }

  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.navlinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const projectModal = document.querySelector('#pickle-social-modal');
  const projectCard = document.querySelector('.project-card');

  if (projectModal instanceof HTMLDialogElement && projectCard) {
    projectCard.addEventListener('click', () => {
      projectModal.showModal();
    });

    projectModal.addEventListener('click', (event) => {
      if (event.target === projectModal) {
        projectModal.close();
      }
    });
  }

  const inquiryForm = document.querySelector('#project-inquiry-form');
  const inquiryStatus = document.querySelector('#inquiry-status');

  if (inquiryForm instanceof HTMLFormElement && inquiryStatus) {
    inquiryForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const formData = new FormData(inquiryForm);
      const getValue = (name) => String(formData.get(name) || '').trim();
      const name = getValue('name');
      const email = getValue('email');
      const project = getValue('project');
      const budget = getValue('budget') || 'Not specified';
      const timeline = getValue('timeline') || 'Not specified';
      const subject = `Project inquiry from ${name}`;
      const body = [
        `Name: ${name}`,
        `Email: ${email}`,
        `Budget: ${budget}`,
        `Ideal timeline: ${timeline}`,
        '',
        'Project details:',
        project
      ].join('\n');

      inquiryStatus.textContent = 'Your email app should open with the message ready. If it doesn’t, use the direct email link above.';
      window.location.href = `mailto:heoiscod@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/\\[]{}-_+=*#@$&';
  const shuffleHeadings = document.querySelectorAll('.scroll-shuffle');

  shuffleHeadings.forEach((heading) => {
    const text = heading.textContent.trim();
    heading.textContent = '';

    [...text].forEach((char, index) => {
      const span = document.createElement('span');
      span.className = 'letter';
      span.style.setProperty('--i', index);
      span.dataset.target = char === ' ' ? '\u00A0' : char;
      span.textContent = char === ' ' ? '\u00A0' : char;
      heading.appendChild(span);
    });
  });

  const scrambleHeading = (heading) => {
    const letters = heading.querySelectorAll('.letter');

    letters.forEach((letter, index) => {
      const target = letter.dataset.target;
      const fixedText = target === '\u00A0' ? ' ' : target;
      let iteration = 0;
      let settles = fixedText.length + 6 + Math.floor(Math.random() * 5);

      setTimeout(() => {
        const scrambleInterval = setInterval(() => {
          if (target === '\u00A0') {
            letter.textContent = '\u00A0';
          } else {
            letter.textContent = [...fixedText]
              .map((_, charIndex) => {
                if (charIndex < Math.min(iteration, fixedText.length)) {
                  return fixedText[charIndex];
                }
                return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
              })
              .join('');
          }

          iteration += 1;

          if (iteration >= settles) {
            clearInterval(scrambleInterval);
            letter.textContent = fixedText;
          }
        }, 60);
      }, index * 80);
    });
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const heading = entry.target;

      if (entry.isIntersecting) {
        heading.classList.add('is-visible');
        scrambleHeading(heading);
      } else {
        heading.classList.remove('is-visible');
      }
    });
  }, {
    threshold: 0.35
  });

  shuffleHeadings.forEach((heading) => revealObserver.observe(heading));
});
