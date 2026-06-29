// utils/csrf.js

export function getCsrfToken() {
    const djangoApi = import.meta.env.VITE_DJANGO_API;

    return fetch(`${djangoApi}/api/v1/auth/csrf-token/`, {
      method: 'GET',
      credentials: 'include', // Include cookies in the request
    })
      .then(response => response.json())
      .then(data => data.csrfToken);
  }
  