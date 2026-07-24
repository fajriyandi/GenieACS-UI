import { NextRequest, NextResponse } from 'next/server';
import { getGenieACSCredentials } from '@/app/api/settings/genieacs/route';

export async function POST(request: NextRequest, { params }: { params: Promise<{ deviceId: string }> }) {
  try {
    const { deviceId } = await params;
    const body = await request.json();
    const { action, path, name, connectionType, username, password, vlanId, bindingPorts, serviceList } = body;
    const credentials = await getGenieACSCredentials();
    if (!credentials) return NextResponse.json({ success: false, error: 'Not configured' }, { status: 400 });
    const { host, username: u, password: p } = credentials;
    const authHeader = 'Basic ' + Buffer.from(`${u}:${p}`).toString('base64');
    const tasks: any[] = [];
    if (action === 'edit' && path) {
      if (connectionType === 'PPPoE' && username) {
        tasks.push({ name: 'setParameterValues', device: deviceId, parameterValues: [[`${path}.Username`, username]] });
        if (password) tasks.push({ name: 'setParameterValues', device: deviceId, parameterValues: [[`${path}.Password`, password]] });
      }
      if (vlanId) tasks.push({ name: 'setParameterValues', device: deviceId, parameterValues: [[`${path}.VLANIDMarkingConfiguration.1.VLANID`, parseInt(vlanId)]] });
      if (serviceList) tasks.push({ name: 'setParameterValues', device: deviceId, parameterValues: [[`${path}.ServiceList`, serviceList]] });
      if (bindingPorts?.length) {
        for (const port of bindingPorts) tasks.push({ name: 'addObject', device: deviceId, parameterPath: `${path}.WANConnectionDevice.1.WANPPPConnection.1.` });
      }
    } else if (action === 'add') {
      tasks.push({
        name: 'addObject', device: deviceId,
        parameterPath: 'InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANPPPConnection.',
        parameterValues: [
          ['Name', name || 'INTERNET'],
          ['ConnectionType', connectionType === 'PPPoE' ? 'PPPoE' : 'IP_Routed'],
          ['ServiceList', serviceList || 'INTERNET'],
          ...(username ? [['Username', username]] : []),
          ...(password ? [['Password', password]] : []),
        ],
      });
    } else if (action === 'delete' && path) {
      tasks.push({ name: 'deleteObject', device: deviceId, parameterPath: path });
    }
    const results = [];
    for (const task of tasks) {
      const res = await fetch(`${host}/tasks`, {
        method: 'POST', headers: { Authorization: authHeader, 'Content-Type': 'application/json' }, body: JSON.stringify(task),
      });
      const data = await res.json();
      results.push(data);
    }
    return NextResponse.json({ success: true, tasks: results });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
