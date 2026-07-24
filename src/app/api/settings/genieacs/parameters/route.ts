import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { GENIEACS_PARAMETER_PATHS } from '@/lib/genieacs';

export async function GET() {
  try {
    const rows = await query('SELECT paramKey, paths FROM genieacs_parameter_mappings') as any[];
    const saved: Record<string, string[]> = {};
    for (const row of rows) saved[row.paramKey] = JSON.parse(row.paths);
    const result = { ...GENIEACS_PARAMETER_PATHS, ...saved };
    return NextResponse.json({ success: true, mappings: result });
  } catch (e: any) {
    return NextResponse.json({ success: true, mappings: GENIEACS_PARAMETER_PATHS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { mappings } = await request.json();
    await query('DELETE FROM genieacs_parameter_mappings WHERE paramKey != ?', ['__internal']);
    for (const [key, paths] of Object.entries(mappings)) {
      if (key in GENIEACS_PARAMETER_PATHS) {
        const defaultPaths = (GENIEACS_PARAMETER_PATHS as any)[key];
        if (JSON.stringify(paths) === JSON.stringify(defaultPaths)) continue;
      }
      await query('INSERT INTO genieacs_parameter_mappings (paramKey, paths) VALUES (?, ?) ON DUPLICATE KEY UPDATE paths = VALUES(paths)', [key, JSON.stringify(paths)]);
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await query('DELETE FROM genieacs_parameter_mappings WHERE paramKey != ?', ['__internal']);
    return NextResponse.json({ success: true, mappings: GENIEACS_PARAMETER_PATHS });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
