import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { DEFAULT_VENDOR_MAPPINGS, GenieACSVendorMapping } from '@/lib/genieacs';

export async function GET() {
  try {
    const rows = await query('SELECT * FROM genieacs_vendor_mappings ORDER BY sortOrder ASC') as any[];
    if (rows.length > 0) {
      const mappings = rows.map((r: any) => ({
        id: r.id, name: r.name, manufacturerPattern: r.manufacturerPattern, modelPattern: r.modelPattern,
        wlanIndexes: JSON.parse(r.wlanIndexes), wlanBandMapping: JSON.parse(r.wlanBandMapping),
        readPaths: r.readPaths ? JSON.parse(r.readPaths) : undefined,
        writePaths: r.writePaths ? JSON.parse(r.writePaths) : undefined,
      }));
      return NextResponse.json({ success: true, mappings });
    }
    return NextResponse.json({ success: true, mappings: DEFAULT_VENDOR_MAPPINGS });
  } catch (e: any) {
    return NextResponse.json({ success: true, mappings: DEFAULT_VENDOR_MAPPINGS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { mappings } = await request.json();
    await query('DELETE FROM genieacs_vendor_mappings');
    for (let i = 0; i < mappings.length; i++) {
      const m = mappings[i];
      await query('INSERT INTO genieacs_vendor_mappings (id, name, manufacturerPattern, modelPattern, wlanIndexes, wlanBandMapping, readPaths, writePaths, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [m.id, m.name, m.manufacturerPattern, m.modelPattern, JSON.stringify(m.wlanIndexes), JSON.stringify(m.wlanBandMapping),
         m.readPaths ? JSON.stringify(m.readPaths) : null, m.writePaths ? JSON.stringify(m.writePaths) : null, i]);
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await query('DELETE FROM genieacs_vendor_mappings');
    return NextResponse.json({ success: true, mappings: DEFAULT_VENDOR_MAPPINGS });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
