import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('http://localhost:3000/api/:rest*', () =>
    HttpResponse.json({ error: 'Wrong prefix' }, { status: 404 })
  ),

  http.get('http://localhost:3000/backend/api/users/me/', () =>
    HttpResponse.json({ id: 'u1', email: 'user@example.com' })
  ),
  http.get('http://localhost:3000/backend/api/projects/:id/', ({ params }) =>
    HttpResponse.json({ id: params.id })
  ),
  http.get('http://localhost:3000/backend/api/projects/:id/flashcard-sets/', () =>
    HttpResponse.json([{ id: 'fs1', name: 'Default' }])
  ),
];


