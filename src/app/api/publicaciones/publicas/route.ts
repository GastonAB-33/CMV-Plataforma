import { NextResponse } from 'next/server';
import { buildPublicFeed } from '@/lib/eventos/public-feed';
import { EventosService } from '@/lib/sheets/services/eventos.service';

export async function GET() {
  const eventosService = new EventosService();
  const eventos = await eventosService.list();
  return NextResponse.json(buildPublicFeed(eventos));
}
