//CHAT
'use client';

import { useEffect } from 'react';
import { pusherClient } from '@/lib/models/pusher-client';

export default function usePusher(channelName, eventName, callback) {
  useEffect(() => {
    if (typeof callback !== 'function') return;

    const channel = pusherClient.subscribe(channelName);
    const safeCallback = (data) => {
      try {
        callback(data);
      } catch (err) {
        console.error('Callback error:', err);
      }
    };

    channel.bind(eventName, safeCallback);

    return () => {
      channel.unbind(eventName, safeCallback);
      pusherClient.unsubscribe(channelName);
    };
  }, [channelName, eventName, callback]);
}
