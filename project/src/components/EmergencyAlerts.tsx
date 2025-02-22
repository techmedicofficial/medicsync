import React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { EmergencyAlert } from '../types/database';
import { AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function EmergencyAlerts() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      const { data, error } = await supabase
        .from('emergency_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching alerts:', error);
        return;
      }

      setAlerts(data || []);
    };

    fetchAlerts();

    const subscription = supabase
      .channel('emergency_alerts_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'emergency_alerts' },
        fetchAlerts
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getAlertColor = (severity: number) => {
    if (severity >= 9) return 'bg-red-100 border-red-500 text-red-800';
    if (severity >= 7) return 'bg-orange-100 border-orange-500 text-orange-800';
    return 'bg-yellow-100 border-yellow-500 text-yellow-800';
  };

  return (
    <div className="overflow-hidden">
      {alerts.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No active emergency alerts</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className={`p-4 border-l-4 ${getAlertColor(alert.severity)} ${
                alert.status === 'pending' ? 'animate-pulse' : ''
              }`}
            >
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <div>
                  <p className="text-sm font-medium">
                    Severity Level {alert.severity} - {alert.description}
                  </p>
                  <p className="text-xs mt-1">
                    {format(new Date(alert.created_at), 'HH:mm')} -{' '}
                    <span
                      className={`font-medium ${
                        alert.status === 'pending'
                          ? 'text-red-800'
                          : alert.status === 'acknowledged'
                          ? 'text-yellow-800'
                          : 'text-green-800'
                      }`}
                    >
                      {alert.status.toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}