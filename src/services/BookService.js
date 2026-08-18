// src/services/BookService.js
// Улучшенная реализация; сохраняет оригинальные имена методов/эндпоинтов.

export default class BookService {
  constructor(url, app, auth, options = {}) {
    this.url = (url || '').replace(/\/\/+$/, ''); // remove trailing slash
    this.app = app || '';
    this.auth = auth || {};
    this.timeout = options.timeout || 10000; // ms
    this.cacheKey = options.cacheKey || '_'; // cache-busting param name
  }

  _email() {
    return (this.auth && this.auth.user && this.auth.user.email) || '';
  }

  _buildUrl(endpoint, params = {}) {
    const base = `${this.url}/${this.app}/${endpoint}`;
    // Use a dummy base for URL constructor in non-browser envs
    const u = new URL(base, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    const sp = new URLSearchParams(params);

    if (this._email() && !sp.has('email')) sp.set('email', this._email());
    if (!sp.has(this.cacheKey)) sp.set(this.cacheKey, Date.now());

    u.search = sp.toString();
    return u.toString();
  }

  async _fetchJson(endpoint, params = {}, fetchOptions = {}) {
    const url = this._buildUrl(endpoint, params);
    const controller = new AbortController();
    const timeout = fetchOptions.timeout || this.timeout;
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, {
        method: fetchOptions.method || 'GET',
        headers: fetchOptions.headers || { 'Accept': 'application/json' },
        signal: controller.signal,
        // credentials: fetchOptions.credentials || 'same-origin', // enable if needed
      });

      if (!res.ok) {
        let text = '';
        try { text = await res.text(); } catch (e) { /* ignore */ }
        throw new Error(`Request failed ${res.status} ${res.statusText}${text ? ' — ' + text : ''}`);
      }

      // Try parse JSON; propagate nicer error if invalid JSON
      try {
        return await res.json();
      } catch (e) {
        throw new Error(`Failed to parse JSON from ${endpoint}: ${e.message}`);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error(`Request to ${endpoint} aborted after ${timeout}ms`);
      }
      throw err;
    } finally {
      clearTimeout(id);
    }
  }

  // Сохранены оригинальные имена методов и эндпоинтов (на случай, если бэкенд рассчитывает на них)

  async serarchBooks(searchText){
    return this._fetchJson('serarchBooks', { search: String(searchText || '') });
  }

  async getBookList() {
    return this._fetchJson('getBookList');
  }

  async getLastPlay() {
    return this._fetchJson('getLastTime');
  }

  async getLastTenBooks() {
    return this._fetchJson('getLastTenBooks');
  }

  async getLastTenNotOppenedBooks() {
    return this._fetchJson('getLastTenNotOppenedBooks');
  }

  async getlastTenOpened() {
    return this._fetchJson('getlastTenOpened');
  }

  async getCurrentCycleBooks() {
    return this._fetchJson('getCurrentCycleBooks');
  }

  async getPlayList(bookId) {
    return this._fetchJson('getPlayList', { id: String(bookId || '') });
  }

  async setPlayTime(bookid, filenum, time) {
    return this._fetchJson('setPlayTime', {
      bookId: String(bookid || ''),
      fileNum: String(filenum || ''),
      time: String(time || '')
    });
  }
}
