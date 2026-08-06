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

      window.scrollTo({ top: 0, behavior: 'smooth' });

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

    document.querySelectorAll('.reveal-card button').forEach(button => {
      button.addEventListener('click', () => {
        const card = button.closest('.reveal-card');
        const open = card.classList.toggle('open');
        button.setAttribute('aria-expanded', String(open));
      });
    });

    document.querySelectorAll('.accordion-trigger').forEach(button => {
      button.addEventListener('click', () => {
        const expanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!expanded));
        button.querySelector('span').textContent = expanded ? '+' : '–';
      });
    });

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
          ? 'Correct. The résumé summarizes qualifications, while the ePortfolio provides supporting evidence and context.'
          : 'Not quite. Review the comparison above and try again.';
      });
    });

    const checklist = document.getElementById('professionalChecklist');
    const checklistBoxes = Array.from(checklist.querySelectorAll('input[type="checkbox"]'));
    const checklistFill = document.getElementById('checklistFill');
    const checklistText = document.getElementById('checklistText');

    function updateChecklist() {
      const checked = checklistBoxes.filter(box => box.checked).length;
      checklistFill.style.width = `${(checked / checklistBoxes.length) * 100}%`;
      checklistText.textContent = `${checked} of ${checklistBoxes.length}`;
    }

    checklistBoxes.forEach(box => box.addEventListener('change', updateChecklist));

    document.getElementById('copyPromptButton').addEventListener('click', async (event) => {
      const text = document.getElementById('starterPrompt').innerText;
      try {
        await navigator.clipboard.writeText(text);
        event.currentTarget.textContent = 'Prompt Copied';
      } catch {
        event.currentTarget.textContent = 'Select and copy manually';
      }
    });

    document.getElementById('copyReflectionButton').addEventListener('click', async (event) => {
      const text = document.getElementById('reflectionText').value;
      if (!text.trim()) {
        event.currentTarget.textContent = 'Write a reflection first';
        return;
      }
      try {
        await navigator.clipboard.writeText(text);
        event.currentTarget.textContent = 'Reflection Copied';
      } catch {
        event.currentTarget.textContent = 'Select and copy manually';
      }
    });

    document.getElementById('clearReflectionButton').addEventListener('click', () => {
      document.getElementById('reflectionText').value = '';
    });

    document.getElementById('submitQuizButton').addEventListener('click', () => {
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
      result.innerHTML = passed
        ? `<strong>${score} of 5 correct.</strong> You are ready to begin building your ePortfolio skeleton.`
        : `<strong>${score} of 5 correct.</strong> Review the lesson sections, then try again.`;
    });



    const buildReflectionButton = document.getElementById('buildReflectionButton');
    const clearBuilderButton = document.getElementById('clearBuilderButton');
    const copyBuiltReflectionButton = document.getElementById('copyBuiltReflectionButton');
    const reflectionDraft = document.getElementById('reflectionDraft');

    if (buildReflectionButton) {
      buildReflectionButton.addEventListener('click', () => {
        const parts = [
          document.getElementById('reflectDescribe').value.trim(),
          document.getElementById('reflectAnalyze').value.trim(),
          document.getElementById('reflectEvaluate').value.trim(),
          document.getElementById('reflectImprove').value.trim(),
          document.getElementById('reflectConnect').value.trim()
        ].filter(Boolean);

        if (!parts.length) {
          reflectionDraft.value = 'Complete at least one reflection prompt before building your draft.';
          return;
        }

        reflectionDraft.value = parts.join(' ');
      });
    }

    if (clearBuilderButton) {
      clearBuilderButton.addEventListener('click', () => {
        ['reflectDescribe','reflectAnalyze','reflectEvaluate','reflectImprove','reflectConnect','reflectionDraft']
          .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
      });
    }

    if (copyBuiltReflectionButton) {
      copyBuiltReflectionButton.addEventListener('click', async (event) => {
        const text = reflectionDraft.value.trim();
        if (!text) {
          event.currentTarget.textContent = 'Build a draft first';
          return;
        }
        try {
          await navigator.clipboard.writeText(text);
          event.currentTarget.textContent = 'Draft Copied';
        } catch {
          event.currentTarget.textContent = 'Select and copy manually';
        }
      });
    }

    showScreen(0);