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
