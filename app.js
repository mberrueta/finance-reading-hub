// ==========================================
// Finance Reading Hub - Single Page App
// ==========================================
// Carga dinámicamente todos los YAML de data/
// Maneja routing con hash (#, #book/:id, #book/:id/chapter/:chapterId)
// Renderiza vistas: Home, Libro, Capítulo

// ==========================================
// 1. ESTADO GLOBAL
// ==========================================
const AppState = {
  books: [], // Lista de libros cargados desde YAMLs
  currentView: 'home',
  currentBook: null,
  currentChapter: null
};

// ==========================================
// 2. CARGADOR DE DATOS YAML
// ==========================================
class YAMLLoader {
  /**
   * Descubre y carga todos los archivos YAML de la carpeta data/
   * Intenta primero cargar desde manifest.json, si no usa lista hardcodeada
   */
  static async loadAllBooks() {
    // Intentar cargar desde manifest primero
    try {
      const response = await fetch('data/manifest.json');
      if (response.ok) {
        return await this.loadBooksFromManifest();
      }
    } catch (err) {
      console.log('Manifest no disponible, usando lista hardcodeada');
    }

    // Fallback: lista hardcodeada
    try {
      const bookFiles = [
        'psychology-of-money.yml'
        // Añadir más archivos aquí según los agregues
      ];

      const books = [];

      for (const file of bookFiles) {
        try {
          const response = await fetch(`data/${file}`);
          if (!response.ok) continue;

          const yamlText = await response.text();
          const bookData = jsyaml.load(yamlText);

          // Validar que tenga la estructura mínima
          if (bookData && bookData.id && bookData.title) {
            books.push(bookData);
          }
        } catch (err) {
          console.warn(`Error cargando ${file}:`, err);
        }
      }

      return books;
    } catch (error) {
      console.error('Error cargando libros:', error);
      return [];
    }
  }

  /**
   * Alternativa: si creas un manifest.json en data/ con la lista de archivos
   */
  static async loadBooksFromManifest() {
    try {
      const response = await fetch('data/manifest.json');
      const manifest = await response.json();

      const books = [];
      for (const file of manifest.files) {
        const bookResponse = await fetch(`data/${file}`);
        const yamlText = await bookResponse.text();
        const bookData = jsyaml.load(yamlText);
        books.push(bookData);
      }

      return books;
    } catch (error) {
      console.warn('Manifest no disponible, usando lista hardcodeada');
      return this.loadAllBooks();
    }
  }
}

// ==========================================
// 3. ROUTER (Hash-based)
// ==========================================
class Router {
  /**
   * Parsea el hash actual y retorna el route objeto
   * Ejemplos:
   * #                          -> { view: 'home' }
   * #book/psychology-of-money  -> { view: 'book', bookId: 'psychology-of-money' }
   * #book/psychology-of-money/chapter/1 -> { view: 'chapter', bookId: '...', chapterId: '1' }
   */
  static parseHash() {
    const hash = window.location.hash.slice(1); // Quitar el #

    if (!hash || hash === '') {
      return { view: 'home' };
    }

    const parts = hash.split('/');

    // #book/:bookId
    if (parts[0] === 'book' && parts.length === 2) {
      return {
        view: 'book',
        bookId: parts[1]
      };
    }

    // #book/:bookId/chapter/:chapterId
    if (parts[0] === 'book' && parts[2] === 'chapter' && parts.length === 4) {
      return {
        view: 'chapter',
        bookId: parts[1],
        chapterId: parts[3]
      };
    }

    // Por defecto, home
    return { view: 'home' };
  }

  /**
   * Navegar a una ruta específica
   */
  static navigate(path) {
    window.location.hash = path;
  }

  /**
   * Inicializa el router y escucha cambios de hash
   */
  static init(renderCallback) {
    // Escuchar cambios en el hash
    window.addEventListener('hashchange', () => {
      const route = this.parseHash();
      renderCallback(route);
    });

    // Renderizar la ruta inicial
    const route = this.parseHash();
    renderCallback(route);
  }
}

// ==========================================
// 4. VISTAS (Rendering)
// ==========================================
class Views {
  /**
   * Renderiza la vista HOME con todos los libros
   */
  static renderHome(books) {
    const container = document.getElementById('app-container');

    const booksHTML = books.map(book => `
      <a class="book-card" href="#book/${book.id}">
        <div class="book-cover" style="${book.cover ? `background-image: url(${book.cover}); background-size: cover;` : ''}"></div>
        <div class="book-info">
          <div>
            <h2>${book.title}</h2>
            <span>${book.author}</span>
          </div>
          <span class="cta">Continuar leyendo →</span>
        </div>
      </a>
    `).join('');

    container.innerHTML = `
      <header>
        <h1>Finance Reading Hub</h1>
        <p>Ideas clave de libros de finanzas, inversiones y comportamiento económico.
           Diseñado para leer un poco cada día y recordar solo lo que importa.</p>
      </header>

      <main>
        <section class="books">
          ${booksHTML}
        </section>
      </main>

      <footer>
        Proyecto personal · lectura consciente · sin ruido
      </footer>
    `;
  }

  /**
   * Renderiza la vista de un LIBRO específico con su lista de capítulos
   */
  static renderBook(book) {
    const container = document.getElementById('app-container');

    const chaptersHTML = book.chapters.map((chapter, index) => `
      <a class="chapter-card" href="#book/${book.id}/chapter/${chapter.id}">
        <span class="chapter-num">${String(index + 1).padStart(2, '0')}</span>
        <div>
          <h3>${chapter.title}</h3>
          <p>${chapter.core}</p>
        </div>
      </a>
    `).join('');

    const bookCoverHTML = book.cover ? `
      <img src="${book.cover}" alt="${book.title}"
           style="width: 100%; max-width: 300px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);" />
    ` : '';

    const summaryHTML = book.summary ? `
      <p style="margin-top: 1rem; color: var(--text); font-size: 1.05rem; line-height: 1.7;">
        ${book.summary}
      </p>
    ` : '';

    const audiobookHTML = book.audiobook ? `
      <div style="margin-top: 1.5rem; padding: 1rem; background: var(--panel); border-radius: 12px; border: 1px solid var(--border);">
        <p style="margin: 0; color: var(--text); font-size: 0.9rem;">
          🎧 <a href="${book.audiobook.url}" target="_blank" style="color: var(--accent); text-decoration: none;">Audiolibro disponible</a>
          <span style="color: var(--text);">(${book.audiobook.duration})</span>
        </p>
      </div>
    ` : '';

    container.innerHTML = `
      <header>
        <a href="#" style="display: inline-block; margin-bottom: 1rem; color: var(--accent); text-decoration: none; font-size: 0.9rem;">← Volver al inicio</a>
        <h1>${book.title}</h1>

        <div class="book-info-layout" style="display: flex; gap: 2rem; align-items: flex-start; margin-top: 1rem;">
          <div style="flex: 1; min-width: 0;">
            <p style="color: var(--muted); margin: 0;">${book.author}</p>
            ${summaryHTML}
            ${audiobookHTML}
          </div>
          ${book.cover ? `<div style="flex-shrink: 0;">${bookCoverHTML}</div>` : ''}
        </div>
      </header>

      <main>
        <div class="chapters">
          ${chaptersHTML}
        </div>
      </main>
    `;
  }

  /**
   * Renderiza la vista de un CAPÍTULO específico con navegación prev/next
   */
  static renderChapter(book, chapter, chapterIndex) {
    const container = document.getElementById('app-container');

    const bulletsHTML = chapter.bullets
      ? `<ul style="margin-top: 1rem;">${chapter.bullets.map(b => `<li>${b}</li>`).join('')}</ul>`
      : '';

    const expandHTML = chapter.expand
      ? `<div style="margin-top: 1.5rem; padding: 1rem; background: var(--panel); border-radius: 12px;">
           <p style="color: var(--text); margin: 0;">${chapter.expand}</p>
         </div>`
      : '';

    const summaryHTML = chapter.summary
      ? `<div style="margin-top: 1.5rem; padding: 1.25rem; background: var(--card); border-left: 3px solid var(--accent); border-radius: 8px;">
           <p style="color: var(--text); margin: 0; line-height: 1.7;">${chapter.summary}</p>
         </div>`
      : '';

    const imageHTML = chapter.image
      ? `<img src="${chapter.image}" alt="${chapter.title}"
             style="width: 100%; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);" />`
      : '';

    const audioHTML = chapter.audio
      ? `<div style="margin-top: 1.5rem; padding: 1rem; background: var(--panel); border-radius: 12px; border: 1px solid var(--border);">
           <p style="margin: 0; color: var(--text); font-size: 0.9rem;">
             🎧 <a href="${book.audiobook?.url || '#'}?t=${chapter.audio.start}" target="_blank" style="color: var(--accent); text-decoration: none;">
               Escuchar este capítulo (${chapter.audio.duration})
             </a>
           </p>
         </div>`
      : '';

    // Navegación prev/next
    const prevChapter = chapterIndex > 0 ? book.chapters[chapterIndex - 1] : null;
    const nextChapter = chapterIndex < book.chapters.length - 1 ? book.chapters[chapterIndex + 1] : null;

    const navigationHTML = `
      <div style="display: flex; justify-content: space-between; margin-top: 2rem; gap: 1rem;">
        ${prevChapter
          ? `<a href="#book/${book.id}/chapter/${prevChapter.id}"
               style="color: var(--accent); text-decoration: none; font-weight: 600;">
               ← ${prevChapter.title}
             </a>`
          : '<span></span>'
        }
        ${nextChapter
          ? `<a href="#book/${book.id}/chapter/${nextChapter.id}"
               style="color: var(--accent); text-decoration: none; font-weight: 600; text-align: right;">
               ${nextChapter.title} →
             </a>`
          : '<span></span>'
        }
      </div>
    `;

    container.innerHTML = `
      <header>
        <a href="#book/${book.id}" style="display: inline-block; margin-bottom: 1rem; color: var(--accent); text-decoration: none; font-size: 0.9rem;">
          ← Volver a capítulos
        </a>
        <h1>Capítulo ${chapterIndex + 1} · ${chapter.title}</h1>
      </header>

      <main>
        <div class="chapter">
          <div class="chapter-content-layout" style="display: flex; gap: 3rem; align-items: flex-start;">
            <div style="flex: 1; min-width: 0;">
              <p class="core">${chapter.core}</p>
              ${bulletsHTML}
              ${expandHTML}
              ${summaryHTML}
              ${audioHTML}
            </div>
            ${chapter.image ? `<div style="flex: 0 0 400px; max-width: 400px;">${imageHTML}</div>` : ''}
          </div>
          ${navigationHTML}
        </div>
      </main>
    `;

    // Scroll al inicio al cargar capítulo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Vista de error cuando no se encuentra algo
   */
  static renderNotFound(message = 'Página no encontrada') {
    const container = document.getElementById('app-container');
    container.innerHTML = `
      <header>
        <h1>Error 404</h1>
        <p>${message}</p>
      </header>
      <main>
        <a href="#" style="color: var(--accent); font-weight: 600;">← Volver al inicio</a>
      </main>
    `;
  }
}

// ==========================================
// 5. CONTROLADOR PRINCIPAL
// ==========================================
class App {
  /**
   * Inicializa la aplicación
   */
  static async init() {
    console.log('🚀 Inicializando Finance Reading Hub...');

    // Cargar todos los libros desde YAMLs
    AppState.books = await YAMLLoader.loadAllBooks();
    console.log(`📚 ${AppState.books.length} libro(s) cargado(s)`);

    // Iniciar el router
    Router.init((route) => this.handleRoute(route));
  }

  /**
   * Maneja el cambio de ruta y renderiza la vista correspondiente
   */
  static handleRoute(route) {
    console.log('🔀 Navegando a:', route);

    switch (route.view) {
      case 'home':
        Views.renderHome(AppState.books);
        break;

      case 'book': {
        const book = AppState.books.find(b => b.id === route.bookId);
        if (!book) {
          Views.renderNotFound('Libro no encontrado');
          return;
        }
        Views.renderBook(book);
        break;
      }

      case 'chapter': {
        const book = AppState.books.find(b => b.id === route.bookId);
        if (!book) {
          Views.renderNotFound('Libro no encontrado');
          return;
        }

        const chapterIndex = book.chapters.findIndex(
          c => String(c.id) === String(route.chapterId)
        );

        if (chapterIndex === -1) {
          Views.renderNotFound('Capítulo no encontrado');
          return;
        }

        const chapter = book.chapters[chapterIndex];
        Views.renderChapter(book, chapter, chapterIndex);
        break;
      }

      default:
        Views.renderHome(AppState.books);
    }
  }
}

// ==========================================
// 6. INICIAR LA APP
// ==========================================
// Esperar a que el DOM esté listo y que js-yaml esté cargado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
