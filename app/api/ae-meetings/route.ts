export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// TODO: integrar Google Calendar OAuth (consultar README sección "Integraciones futuras")
// Por ahora devolvemos un payload vacío con la misma forma que el endpoint original.
export async function GET() {
  return Response.json({
    meetings: [],
    byAE: {},
    fetchedAt: new Date().toISOString(),
  });
}
