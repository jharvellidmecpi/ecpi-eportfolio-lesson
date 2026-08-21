    const screens = Array.from(document.querySelectorAll('.screen'));
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
    const progressText = document.getElementById('progressText');
    const progressFill = document.getElementById('progressFill');
    const screenCount = document.getElementById('screenCount');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const sidebar = document.getElementById('sidebar');
    const menuButton = document.getElementById('menuButton');

    let currentScreen = 0;
    const completed = new Set([0]);

    function showScreen(index) {
      if (index < 0 || index >= screens.length) return;

      currentScreen = index;
      completed.add(index);

      screens.forEach((screen, i) => {
        screen.classList.toggle('active', i === index);
      });

      navLinks.forEach((link, i) => {
        link.classList.toggle('active', i === index);
        link.classList.toggle('completed', completed.has(i) && i !== index);
      });

      const current = index + 1;
      const percent = (current / screens.length) * 100;

      progressText.textContent = `${Math.round(percent)}% complete`;
      progressFill.style.width = `${percent}%`;
      screenCount.textContent = `Screen ${current} of ${screens.length}`;
      prevButton.disabled = index === 0;
      nextButton.disabled = index === screens.length - 1;

      window.scrollTo({ top: 0, behavior: 'auto' });

      if (window.innerWidth <= 900) {
        sidebar.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
      }
    }

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        showScreen(Number(link.dataset.screen));
      });
    });

    document.querySelectorAll('[data-jump]').forEach(button => {
      button.addEventListener('click', () => showScreen(Number(button.dataset.jump)));
    });

    prevButton.addEventListener('click', () => showScreen(currentScreen - 1));
    nextButton.addEventListener('click', () => showScreen(currentScreen + 1));

    menuButton.addEventListener('click', () => {
      const open = sidebar.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });

    // Reveal cards (Section 2): only one open at a time, like an accordion.
    document.querySelectorAll('.reveal-card button').forEach(button => {
      button.addEventListener('click', () => {
        const card = button.closest('.reveal-card');
        const willOpen = !card.classList.contains('open');

        card.parentElement.querySelectorAll('.reveal-card').forEach(otherCard => {
          if (otherCard !== card) {
            otherCard.classList.remove('open');
            otherCard.querySelector('button').setAttribute('aria-expanded', 'false');
          }
        });

        card.classList.toggle('open', willOpen);
        button.setAttribute('aria-expanded', String(willOpen));
      });
    });

    document.querySelectorAll('.accordion-trigger').forEach(button => {
      button.addEventListener('click', () => {
        const expanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!expanded));
        button.querySelector('span').textContent = expanded ? '+' : '–';
      });
    });

    // Inline knowledge-check buttons: feedback text is read from each button's
    // own data attributes so the message always matches the question asked.
    document.querySelectorAll('.check-inline').forEach(button => {
      button.addEventListener('click', () => {
        const question = button.closest('.quiz-question');
        const selected = question.querySelector('input[type="radio"]:checked');
        const feedback = question.querySelector('.feedback');

        if (!selected) {
          feedback.className = 'feedback show bad';
          feedback.textContent = 'Select an answer first.';
          return;
        }

        const correct = selected.value === button.dataset.answer;
        feedback.className = `feedback show ${correct ? 'good' : 'bad'}`;
        feedback.textContent = correct
          ? (button.dataset.correctFeedback || 'Correct.')
          : (button.dataset.incorrectFeedback || 'Not quite. Review the section above and try again.');
      });
    });

    // Color and Design (Section 6) sub-stepper: chunks the page into
    // Palette / Typography / Accessibility so the screen isn't one long scroll.
    const designSubsteps = document.getElementById('designSubsteps');
    if (designSubsteps) {
      const substeps = Array.from(designSubsteps.querySelectorAll('.design-substep'));

      function goToSubstep(index) {
        substeps.forEach((step, i) => step.classList.toggle('active', i === index));
        designSubsteps.scrollIntoView({ behavior: 'auto', block: 'start' });
      }

      designSubsteps.querySelectorAll('.substep-next').forEach(button => {
        button.addEventListener('click', () => {
          const current = substeps.findIndex(step => step.classList.contains('active'));
          goToSubstep(Math.min(current + 1, substeps.length - 1));
        });
      });

      designSubsteps.querySelectorAll('.substep-prev').forEach(button => {
        button.addEventListener('click', () => {
          const current = substeps.findIndex(step => step.classList.contains('active'));
          goToSubstep(Math.max(current - 1, 0));
        });
      });
    }

    // Color and Design (Section 6) palette preview: selecting a palette
    // updates the live preview panel and the status text below it.
    const paletteButtons = Array.from(document.querySelectorAll('.palette-option'));
    const portfolioPreview = document.getElementById('portfolioPreview');
    const paletteStatus = document.getElementById('paletteStatus');

    paletteButtons.forEach(button => {
      button.addEventListener('click', () => {
        const palette = button.dataset.palette;
        const paletteName = button.querySelector('.palette-name').textContent.trim();

        paletteButtons.forEach(other => {
          other.classList.toggle('selected', other === button);
          other.setAttribute('aria-pressed', String(other === button));
        });

        if (portfolioPreview) {
          portfolioPreview.className = `portfolio-preview preview-${palette}`;
        }

        if (paletteStatus) {
          paletteStatus.textContent = `Previewing the ${paletteName} palette.`;
        }
      });
    });

    // Final Knowledge Check (last section)
    const submitQuizButton = document.getElementById('submitQuizButton');
    if (submitQuizButton) {
      submitQuizButton.addEventListener('click', () => {
        const answers = { q1: 'b', q2: 'a', q3: 'c', q4: 'b', q5: 'a' };
        let score = 0;
        let answered = 0;

        Object.entries(answers).forEach(([name, correct]) => {
          const selected = document.querySelector(`input[name="${name}"]:checked`);
          if (selected) {
            answered += 1;
            if (selected.value === correct) score += 1;
          }
        });

        const result = document.getElementById('quizResult');

        if (answered < 5) {
          result.className = 'feedback show bad';
          result.textContent = `You answered ${answered} of 5 questions. Complete every question before submitting.`;
          return;
        }

        const passed = score >= 4;
        result.className = `feedback show ${passed ? 'good' : 'bad'}`;
        result.textContent = passed
          ? `${score} of 5 correct. You are ready to begin building your ePortfolio.`
          : `${score} of 5 correct. Review the lesson sections, then try again.`;
      });
    }

    showScreen(0);
