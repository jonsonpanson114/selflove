'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NotificationSettings } from '../types/notification';
import { subscribeToPushNotifications } from '../lib/notificationService';

export const NotificationSettingsUI = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    morning: { enabled: true, hour: 8, minute: 0 },
    evening: { enabled: true, hour: 21, minute: 0 },
    permissionRequested: false,
  });

  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem('notification-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const saveSettings = async (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem('notification-settings', JSON.stringify(newSettings));
    
    if (newSettings.enabled) {
      setStatus('Subscribing...');
      const sub = await subscribeToPushNotifications(newSettings);
      if (sub) {
        setStatus('Successfully subscribed!');
      } else {
        setStatus('Failed to subscribe. Check permissions.');
      }
    }
  };

  const handleToggle = () => {
    const newSettings = { ...settings, enabled: !settings.enabled };
    saveSettings(newSettings);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold mb-4">通知設定</h2>
      
      <div className="flex items-center justify-between mb-6">
        <span>プッシュ通知を有効にする</span>
        <button 
          onClick={handleToggle}
          className={`relative w-12 h-6 rounded-full transition-colors ${settings.enabled ? 'bg-indigo-500' : 'bg-gray-600'}`}
        >
          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
      </div>

      {settings.enabled && (
        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="text-lg font-medium mb-2">朝の呼びかけ (レン)</h3>
            <div className="flex items-center space-x-2">
              <input 
                type="number" 
                value={settings.morning.hour} 
                onChange={(e) => saveSettings({...settings, morning: {...settings.morning, hour: parseInt(e.target.value)}})}
                min="0" max="23"
                className="bg-black/20 border border-white/10 rounded px-2 py-1 w-16"
              />
              <span>:</span>
              <input 
                type="number" 
                value={settings.morning.minute}
                onChange={(e) => saveSettings({...settings, morning: {...settings.morning, minute: parseInt(e.target.value)}})}
                min="0" max="59"
                className="bg-black/20 border border-white/10 rounded px-2 py-1 w-16"
              />
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="text-lg font-medium mb-2">夜の呼びかけ (ソラ)</h3>
            <div className="flex items-center space-x-2">
              <input 
                type="number" 
                value={settings.evening.hour}
                onChange={(e) => saveSettings({...settings, evening: {...settings.evening, hour: parseInt(e.target.value)}})}
                min="0" max="23"
                className="bg-black/20 border border-white/10 rounded px-2 py-1 w-16"
              />
              <span>:</span>
              <input 
                type="number" 
                value={settings.evening.minute}
                onChange={(e) => saveSettings({...settings, evening: {...settings.evening, minute: parseInt(e.target.value)}})}
                min="0" max="59"
                className="bg-black/20 border border-white/10 rounded px-2 py-1 w-16"
              />
            </div>
          </div>
        </div>
      )}

      {status && (
        <p className="mt-4 text-xs text-indigo-300 transition-opacity">
          {status}
        </p>
      )}
    </motion.div>
  );
};
