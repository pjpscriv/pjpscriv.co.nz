const log = m => console.log(m);
const $ = q => document.querySelector(q);
const $$ = q => document.querySelectorAll(q);

// Variables defined in dark-mode.html
//  →  DARK_MODE_CLASS, LIGHT_MODE_CLASS, LOCAL_STORAGE_KEY, darkModeEnabled
const GRADIENT_CLASSES = ['', 'blue-grad', 'green-yellow-grad', 'lime-grad', 'green-grad'];
// TODO: Add more gradient classes


/***************** First Load *****************/
const randomGradient = GRADIENT_CLASSES[Math.floor(Math.random() * (GRADIENT_CLASSES.length))]
if(!!randomGradient) {
  document.body.classList.add(randomGradient)
}
setSyntaxHighlightingTheme(darkModeEnabled)


/***************** Click functionality *****************/
function addDarkModeToggle() {
  const container = document.body
  const switcher = document.getElementById('dark-mode-toggle')
  switcher.addEventListener('click', () => {
    const darkModeActive = container.classList.contains(DARK_MODE_CLASS)
    if (darkModeActive) {
      container.classList.remove(DARK_MODE_CLASS)
    } else {
      container.classList.add(DARK_MODE_CLASS)
    }
    setSyntaxHighlightingTheme(!darkModeActive)
    const saveData = {
      darkMode: !darkModeActive,
      savedAt: Math.floor(Date.now() / 1000)
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(saveData));
  })
}

/* *
function addSectionScrolls() {
  const links = $$('.header__links a')
  links.forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault()
      const targetSelector = el.getAttribute('href');
      const target = $(targetSelector);
      target.scrollIntoView({ behavior: 'smooth' });
      
      const openNavbar = $('.header__links--open')
      if (openNavbar) {
        openNavbar.classList.remove('header__links--open')
      }
    })
  })
}
/* */

/* */
function addNavbarLinksToggle() {
  const menuToggle = $('#menu-toggle')
  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation()
    const navbar = $('.header__links')
    const languages = $('.header__languages')
    languages.classList.remove('header__languages--open')
    navbar.classList.toggle('header__links--open')
  })
}
/* */

function addLanguageSwitcher() {
  const languageToggle = $('#language-toggle')
  languageToggle.addEventListener('click', (e) => {
    e.stopPropagation()
    const languages = $('.header__languages')
    const navbar = $('.header__links')
    navbar.classList.remove('header__links--open')
    languages.classList.toggle('header__languages--open')
  })
}

function closeNavbarsOnClickOutside() {
  document.addEventListener('click', (event) => {
    const languages = $('.header__languages')
    const navbar = $('.header__links')

    if (!languages.contains(event.target)) {
      languages.classList.remove('header__languages--open')
    }
    if (!navbar.contains(event.target)) {
      navbar.classList.remove('header__links--open')
    }
  })
}

function getStyleSheet(filename) {
  for (let i = 0; i < document.styleSheets.length; i++) {
    const sheet = document.styleSheets[i];
    if (sheet.href && sheet.href.includes(filename)) {
      return sheet;
    }
  }
  return null;
}

function setSyntaxHighlightingTheme(isDark) {
  lightSheet = getStyleSheet('syntax-light.css');
  darkSheet = getStyleSheet('syntax-dark.css');
  lightSheet.disabled = isDark;
  darkSheet.disabled = !isDark;
}

/***************** Header Links *****************/
function addHeaderPoundLinks() {
  const headers = $$('h2[id], h3[id], h4[id], h5[id], h6[id]')
  headers.forEach(header => {
    const link = document.createElement('a')
    link.href = `#${header.id}`
    link.className = 'header-pound-link'
    link.textContent = '#'
    header.prepend(link)
  })
}

/***************** Copy Code Buttons *****************/
const COPY_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'
const COPY_ICON_SUCCESS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'

function addCopyCodeButtons() {
  const blocks = $$('.highlight')
  blocks.forEach(block => {
    const code = block.querySelector('pre code')
    if (!code) return

    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'copy-code-button'
    button.setAttribute('aria-label', 'Copy code to clipboard')
    button.innerHTML = COPY_ICON

    const copyCodeFn = (e) => {
      e.preventDefault()
      navigator.clipboard.writeText(code.textContent).then(() => {
        button.innerHTML = COPY_ICON_SUCCESS
        button.classList.add('copy-code-button--copied')
        setTimeout(() => {
          button.innerHTML = COPY_ICON
          button.classList.remove('copy-code-button--copied')
        }, 1500)
      })
    }

    button.addEventListener('click', copyCodeFn)
    button.addEventListener('touchend', copyCodeFn)

    block.prepend(button)
  })
}

function main() {
  addDarkModeToggle();
  addLanguageSwitcher();
  addNavbarLinksToggle();
  closeNavbarsOnClickOutside();
  addHeaderPoundLinks();
  addCopyCodeButtons();
}

window.onload = main()
