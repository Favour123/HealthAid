import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config';
import { useAuth } from './AuthContext';
import { Incident } from '../types';

interface ToastState {
  incident: Incident;
  key: number;
}

interface SocketContextValue {
  latestIncident: Incident | null;
  toast: ToastState | null;
  dismissToast: () => void;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [latestIncident, setLatestIncident] = useState<Incident | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('incident:new', (incident: Incident) => {
      setLatestIncident(incident);
      if (incident.reporterId !== user.id) {
        setToast({ incident, key: Date.now() });
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  const value = useMemo<SocketContextValue>(
    () => ({
      latestIncident,
      toast,
      dismissToast: () => setToast(null),
    }),
    [latestIncident, toast],
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return ctx;
}
