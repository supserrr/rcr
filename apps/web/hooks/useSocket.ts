/**
 * React hook for Socket.IO client
 * 
 * Provides Socket.IO client functionality with automatic connection management
 */

import { useEffect, useRef, useState } from 'react';
import { getSocket, disconnectSocket, reconnectSocket, type ServerToClientEvents } from '@/lib/socket/client';
import type { Socket } from 'socket.io-client';

/**
 * Socket.IO hook options
 */
export interface UseSocketOptions {
  /**
   * Whether to automatically connect on mount
   */
  autoConnect?: boolean;

  /**
   * Whether to automatically disconnect on unmount
   */
  autoDisconnect?: boolean;

  /**
   * Event listeners to attach
   */
  listeners?: {
    [K in keyof ServerToClientEvents]?: ServerToClientEvents[K];
  };
}

/**
 * Socket.IO hook return value
 */
export interface UseSocketReturn {
  /**
   * Socket instance
   */
  socket: Socket | null;

  /**
   * Whether socket is connected
   */
  connected: boolean;

  /**
   * Whether socket is connecting
   */
  connecting: boolean;

  /**
   * Last error
   */
  error: Error | null;

  /**
   * Manually connect
   */
  connect: () => void;

  /**
   * Manually disconnect
   */
  disconnect: () => void;

  /**
   * Reconnect with new token
   */
  reconnect: (token: string) => void;
}

/**
 * Use Socket.IO hook
 */
export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const {
    autoConnect = true,
    autoDisconnect = true,
    listeners = {},
  } = options;

  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const listenersRef = useRef<Map<string, (...args: unknown[]) => void>>(new Map());

  useEffect(() => {
    if (!autoConnect) {
      return;
    }

    const socket = getSocket();
    if (!socket) {
      return;
    }

    socketRef.current = socket;
    setConnecting(true);

    // Handle connection state
    const onConnect = () => {
      setConnected(true);
      setConnecting(false);
      setError(null);
    };

    const onDisconnect = () => {
      setConnected(false);
      setConnecting(false);
    };

    const onError = (err: Error) => {
      setError(err);
      setConnecting(false);
    };

    // Attach connection listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('error', onError as any);

    // Attach custom listeners
    Object.entries(listeners).forEach(([event, handler]) => {
      if (handler) {
        const wrappedHandler = (...args: unknown[]) => {
          try {
            (handler as any)(...args);
          } catch (err) {
            console.error(`Error in socket listener for ${event}:`, err);
          }
        };
        socket.on(event as keyof ServerToClientEvents, wrappedHandler);
        listenersRef.current.set(event, wrappedHandler);
      }
    });

    // Set initial connection state
    if (socket.connected) {
      setConnected(true);
      setConnecting(false);
    }

    // Cleanup
    return () => {
      if (socket) {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off('error', onError as any);

        // Remove custom listeners
        listenersRef.current.forEach((handler, event) => {
          socket.off(event as keyof ServerToClientEvents, handler);
        });
        listenersRef.current.clear();
      }

      if (autoDisconnect) {
        disconnectSocket();
      }
    };
  }, [autoConnect, autoDisconnect, listeners]);

  const connect = () => {
    const socket = getSocket();
    if (socket && !socket.connected) {
      socket.connect();
    }
  };

  const disconnect = () => {
    disconnectSocket();
    setConnected(false);
    setConnecting(false);
  };

  const reconnect = (token: string) => {
    reconnectSocket(token);
    setConnected(false);
    setConnecting(true);
  };

  return {
    socket: socketRef.current,
    connected,
    connecting,
    error,
    connect,
    disconnect,
    reconnect,
  };
}

