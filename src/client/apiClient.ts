const GUEST_STORAGE_KEY = 'luteroll_guest_id_v1';
let memoryGuestId: string | null = null;

function generateGuestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `guest_${crypto.randomUUID()}`;
  }
  const rand =
    Math.random().toString(36).slice(2) +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2);
  return `guest_${rand.slice(0, 24)}`;
}

export function getGuestId(): string {
  if (memoryGuestId) return memoryGuestId;
  if (typeof window !== 'undefined') {
    try {
      const existing = window.localStorage.getItem(GUEST_STORAGE_KEY);
      if (existing && /^guest_[a-zA-Z0-9-]{12,48}$/.test(existing)) {
        memoryGuestId = existing;
        return existing;
      }
      const created = generateGuestId();
      window.localStorage.setItem(GUEST_STORAGE_KEY, created);
      memoryGuestId = created;
      return created;
    } catch {
      try {
        const existing = window.sessionStorage.getItem(GUEST_STORAGE_KEY);
        if (existing && /^guest_[a-zA-Z0-9-]{12,48}$/.test(existing)) {
          memoryGuestId = existing;
          return existing;
        }
        const created = generateGuestId();
        window.sessionStorage.setItem(GUEST_STORAGE_KEY, created);
        memoryGuestId = created;
        return created;
      } catch {
        // Sandboxed iframe with storage disabled
      }
    }
  }
  memoryGuestId = generateGuestId();
  return memoryGuestId;
}

export function apiFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set('X-Guest-Id', getGuestId());
  return fetch(input, {
    ...init,
    headers,
  });
}
