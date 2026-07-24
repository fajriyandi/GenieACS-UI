import { NextRequest, NextResponse } from 'next/server';
import { getGenieACSCredentials } from '../route';
import { getParameterValue, getAllProjectionPaths, GENIEACS_PARAMETER_PATHS, getDeviceStatus, safeString } from '@/lib/genieacs';
import { getCache, setCache, clearCache } from '@/lib/cache';

const CACHE_KEY = 'device_list';
const CACHE_KEY_STATS = 'device_stats';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const bypass = url.searchParams.get('no_cache') === '1';
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '50')));
    const skip = (page - 1) * limit;

    // Cuma cache untuk page 1 tanpa filter
    const useCache = !search && !status && page === 1 && !bypass;
    if (useCache) {
      const cached = getCache(CACHE_KEY);
      const cachedStats = getCache(CACHE_KEY_STATS);
      if (cached && cachedStats) {
        const totalPages = Math.ceil(cachedStats.total / limit);
        return NextResponse.json({ success: true, devices: cached, total: cachedStats.total, totalPages, page, limit, statistics: cachedStats });
      }
    }

    const credentials = await getGenieACSCredentials();
    if (!credentials) return NextResponse.json({ success: false, error: 'GenieACS not configured', devices: [], statistics: { total: 0, online: 0, offline: 0 } });
    const { host, username, password } = credentials;
    const authHeader = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

    const projection = getAllProjectionPaths();
    const projParam = ['_id', '_deviceId', '_lastInform',
      ...projection.filter(p => p.startsWith('VirtualParameters.')),
      'InternetGatewayDevice.LANDevice.1.WLANConfiguration.1.SSID',
      'InternetGatewayDevice.LANDevice.1.WLANConfiguration.5.SSID',
    ].join(',');

    // Hitung total dulu
    const countRes = await fetch(`${host}/devices?limit=1`, { headers: { Authorization: authHeader, Accept: 'application/json' } });
    const rawTotal = parseInt(countRes.headers.get('total') || '0');

    // Kalo ada status filter, fetch ALL devices (tanpa skip/limit) biar filter akurat
    if (status) {
      const allRes = await fetch(`${host}/devices?limit=${Math.min(rawTotal, 2000)}&projection=${encodeURIComponent(projParam)}`,
        { headers: { Authorization: authHeader, Accept: 'application/json' } });
      if (!allRes.ok) throw new Error(`GenieACS returned ${allRes.status}`);
      const allDevicesRaw = await allRes.json();
      const allArr = Array.isArray(allDevicesRaw) ? allDevicesRaw : [];

      // Filter by status
      const filteredAll = allArr.filter((d: any) => getDeviceStatus(d._lastInform || null).toLowerCase() === status.toLowerCase());

      // Paginate the filtered result
      const paginated = filteredAll.slice(skip, skip + limit);

      const mappedDevices = paginated.map((d: any) => {
        const deviceId = d._deviceId || {};
        return {
          _id: d._id,
          serialNumber: safeString(deviceId._SerialNumber) !== '-' ? safeString(deviceId._SerialNumber) : getParameterValue(d, GENIEACS_PARAMETER_PATHS.serialNumber),
          manufacturer: safeString(deviceId._Manufacturer) !== '-' ? safeString(deviceId._Manufacturer) : getParameterValue(d, GENIEACS_PARAMETER_PATHS.manufacturer),
          model: safeString(deviceId._ProductClass) !== '-' ? safeString(deviceId._ProductClass) : getParameterValue(d, GENIEACS_PARAMETER_PATHS.model),
          pppoeUsername: getParameterValue(d, GENIEACS_PARAMETER_PATHS.pppUsername),
          pppoeIP: getParameterValue(d, GENIEACS_PARAMETER_PATHS.pppoeIP),
          tr069IP: getParameterValue(d, GENIEACS_PARAMETER_PATHS.tr069IP),
          rxPower: getParameterValue(d, GENIEACS_PARAMETER_PATHS.rxPower),
          ponMode: getParameterValue(d, GENIEACS_PARAMETER_PATHS.ponMode),
          uptime: getParameterValue(d, GENIEACS_PARAMETER_PATHS.uptime),
          status: getDeviceStatus(d._lastInform || null),
          lastInform: d._lastInform || null,
          ssid: getParameterValue(d, GENIEACS_PARAMETER_PATHS.ssid),
        };
      });

      // Re-count stats for consistency
      let online = 0, offline = 0;
      for (const d of allArr) {
        const s = getDeviceStatus(d._lastInform || null);
        if (s === 'Online') online++;
        else if (s === 'Offline') offline++;
      }

      const totalPages = Math.ceil(filteredAll.length / limit);

      return NextResponse.json({
        success: true,
        devices: mappedDevices,
        total: filteredAll.length,
        totalPages,
        page,
        limit,
        statistics: { total: rawTotal, online, offline },
      });
    }

    // Normal flow (no status filter)
    const fetchDevices = async (pageLimit: number, pageSkip: number) => {
      let queryObj: any = {};
      if (search) {
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        queryObj = { $or: [
          { _id: `/${escaped}/i` },
          { '_deviceId._SerialNumber': `/${escaped}/i` },
          { '_deviceId._Manufacturer': `/${escaped}/i` },
          ...GENIEACS_PARAMETER_PATHS.serialNumber.map(p => ({ [p]: `/${escaped}/i` })),
          ...GENIEACS_PARAMETER_PATHS.pppUsername.map(p => ({ [p]: `/${escaped}/i` })),
          ...GENIEACS_PARAMETER_PATHS.model.map(p => ({ [p]: `/${escaped}/i` })),
        ]};
      }
      const queryStr = encodeURIComponent(JSON.stringify(queryObj));
      const urlStr = `${host}/devices?query=${queryStr}&limit=${pageLimit}&skip=${pageSkip}&projection=${encodeURIComponent(projParam)}`;
      const res = await fetch(urlStr, { headers: { Authorization: authHeader, Accept: 'application/json' } });
      if (!res.ok) throw new Error(`GenieACS returned ${res.status}`);
      const devices = await res.json();
      const totalCount = parseInt(res.headers.get('total') || '0');
      return { devices, totalCount };
    };

    const fetchStats = async () => {
      const idsRes = await fetch(`${host}/devices?limit=${Math.min(rawTotal, 1000)}&projection=_id,_lastInform`,
        { headers: { Authorization: authHeader, Accept: 'application/json' } });
      const allDevices = await idsRes.json();
      let online = 0, offline = 0;
      if (Array.isArray(allDevices)) {
        for (const d of allDevices) {
          const s = getDeviceStatus(d._lastInform || null);
          if (s === 'Online') online++;
          else if (s === 'Offline') offline++;
        }
      }
      return { total: rawTotal, online, offline };
    };

    const [{ devices, totalCount }, stats] = await Promise.all([fetchDevices(limit, skip), fetchStats()]);

    const mappedDevices = (Array.isArray(devices) ? devices : []).map((d: any) => {
      const deviceId = d._deviceId || {};
      return {
        _id: d._id,
        serialNumber: safeString(deviceId._SerialNumber) !== '-' ? safeString(deviceId._SerialNumber) : getParameterValue(d, GENIEACS_PARAMETER_PATHS.serialNumber),
        manufacturer: safeString(deviceId._Manufacturer) !== '-' ? safeString(deviceId._Manufacturer) : getParameterValue(d, GENIEACS_PARAMETER_PATHS.manufacturer),
        model: safeString(deviceId._ProductClass) !== '-' ? safeString(deviceId._ProductClass) : getParameterValue(d, GENIEACS_PARAMETER_PATHS.model),
        pppoeUsername: getParameterValue(d, GENIEACS_PARAMETER_PATHS.pppUsername),
        pppoeIP: getParameterValue(d, GENIEACS_PARAMETER_PATHS.pppoeIP),
        tr069IP: getParameterValue(d, GENIEACS_PARAMETER_PATHS.tr069IP),
        rxPower: getParameterValue(d, GENIEACS_PARAMETER_PATHS.rxPower),
        ponMode: getParameterValue(d, GENIEACS_PARAMETER_PATHS.ponMode),
        uptime: getParameterValue(d, GENIEACS_PARAMETER_PATHS.uptime),
        status: getDeviceStatus(d._lastInform || null),
        lastInform: d._lastInform || null,
        ssid: getParameterValue(d, GENIEACS_PARAMETER_PATHS.ssid),
      };
    });

    // Cache page 1 tanpa filter
    if (useCache) {
      setCache(CACHE_KEY, mappedDevices);
      setCache(CACHE_KEY_STATS, stats);
    }

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      devices: mappedDevices,
      total: totalCount,
      totalPages,
      page,
      limit,
      statistics: stats,
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message, devices: [], statistics: { total: 0, online: 0, offline: 0 } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceIds = searchParams.get('ids') || '';
    const ids = deviceIds.split(',').filter(Boolean);
    if (ids.length === 0) return NextResponse.json({ success: false, error: 'No device IDs' }, { status: 400 });

    const credentials = await getGenieACSCredentials();
    if (!credentials) return NextResponse.json({ success: false, error: 'Not configured' });
    const { host, username, password } = credentials;
    const authHeader = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

    const results = [];
    for (const id of ids) {
      const res = await fetch(`${host}/devices/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { Authorization: authHeader } });
      results.push({ id, status: res.status });
    }
    // Hapus cache setelah delete
    clearCache();
    return NextResponse.json({ success: true, results });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
