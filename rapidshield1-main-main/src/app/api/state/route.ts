import { NextRequest, NextResponse } from 'next/server';
import { serverState, broadcastState, syncSpeakersWithEmployees } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    
    if (update.type === 'UPDATE_EMPLOYEES') {
      serverState.employees = update.employees;
      // Auto-sync speakers when employees change
      syncSpeakersWithEmployees();
    } else if (update.type === 'UPDATE_CONFIG') {
      serverState.config = update.config;
    } else if (update.type === 'UPDATE_CAMERAS') {
      serverState.cameras = update.cameras;
    } else if (update.type === 'UPDATE_SENSORS') {
      serverState.sensors = update.sensors;
    } else if (update.type === 'UPDATE_SPEAKERS') {
      serverState.speakers = update.speakers;
    } else if (update.type === 'CLEAR_ACTIVE_ALERT') {
      serverState.activeAlert = null;
    } else if (update.type === 'CANCEL_ALERT') {
      serverState.activeAlert = null;
      if (serverState.logs.length > 0) {
        serverState.logs[0].resolution = 'False Alarm / Cancelled';
      }
      // Reset speaker alert states
      serverState.speakers = serverState.speakers.map(s => ({
        ...s,
        lastAlertPlayed: null,
        lastAlertMessage: null,
        sosPressed: false,
      }));
    } else if (update.type === 'CLEAR_SOS') {
      serverState.sosDispatches = [];
      serverState.speakers = serverState.speakers.map(s => ({ ...s, sosPressed: false }));
    }

    broadcastState();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}

