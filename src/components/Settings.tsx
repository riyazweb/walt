import React, { useState } from 'react';

interface SettingSection {
  title: string;
  description: string;
  settings: Setting[];
}

interface Setting {
  id: string;
  label: string;
  description?: string;
  type: 'toggle' | 'select' | 'input';
  value: any;
  options?: string[];
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, any>>({
    darkMode: false,
    notifications: true,
    autoSync: true,
    imageQuality: 'High',
    storageLimit: '10',
    emailNotifications: true,
    pushNotifications: false,
  });

  const handleToggle = (id: string) => {
    setSettings(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleChange = (id: string, value: any) => {
    setSettings(prev => ({ ...prev, [id]: value }));
  };

  const sections: SettingSection[] = [
    {
      title: 'General',
      description: 'Basic app settings and preferences',
      settings: [
        { id: 'autoSync', label: 'Auto Sync', description: 'Automatically sync wallpapers across devices', type: 'toggle', value: settings.autoSync },
        { id: 'imageQuality', label: 'Image Quality', description: 'Default quality for uploaded images', type: 'select', value: settings.imageQuality, options: ['Low', 'Medium', 'High', 'Original'] },
      ],
    },
    {
      title: 'Storage',
      description: 'Manage your storage settings',
      settings: [
        { id: 'storageLimit', label: 'Storage Limit (GB)', description: 'Maximum storage allocation', type: 'input', value: settings.storageLimit },
      ],
    },
    {
      title: 'Notifications',
      description: 'Configure how you receive notifications',
      settings: [
        { id: 'emailNotifications', label: 'Email Notifications', description: 'Receive updates via email', type: 'toggle', value: settings.emailNotifications },
        { id: 'pushNotifications', label: 'Push Notifications', description: 'Receive browser push notifications', type: 'toggle', value: settings.pushNotifications },
      ],
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-[800px] mx-auto flex flex-col gap-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your app preferences and configurations</p>
        </div>

        {/* Settings Sections */}
        {sections.map((section, sIndex) => (
          <div key={sIndex} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">{section.title}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{section.description}</p>
            </div>
            <div className="divide-y divide-slate-100">
              {section.settings.map((setting) => (
                <div key={setting.id} className="p-5 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{setting.label}</p>
                    {setting.description && (
                      <p className="text-sm text-slate-500 mt-0.5">{setting.description}</p>
                    )}
                  </div>
                  <div className="ml-4">
                    {setting.type === 'toggle' && (
                      <button
                        onClick={() => handleToggle(setting.id)}
                        className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                          settings[setting.id] ? 'bg-primary' : 'bg-slate-200'
                        }`}
                      >
                        <span 
                          className={`absolute top-1 size-5 bg-white rounded-full shadow transition-transform ${
                            settings[setting.id] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    )}
                    {setting.type === 'select' && (
                      <select
                        value={settings[setting.id]}
                        onChange={(e) => handleChange(setting.id, e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                      >
                        {setting.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                    {setting.type === 'input' && (
                      <input
                        type="text"
                        value={settings[setting.id]}
                        onChange={(e) => handleChange(setting.id, e.target.value)}
                        className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Danger Zone */}
        <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
          <div className="p-5 border-b border-red-100 bg-red-50">
            <h3 className="font-bold text-red-600">Danger Zone</h3>
            <p className="text-sm text-red-500 mt-0.5">Irreversible actions - proceed with caution</p>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="font-medium" style={{ color: '#1e293b' }}>Delete All Wallpapers</p>
              <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>Permanently remove all uploaded wallpapers</p>
            </div>
            <button 
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold text-sm transition-colors cursor-pointer"
              style={{ color: '#ffffff' }}
            >
              Delete All
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button 
          className="w-full bg-primary hover:bg-blue-700 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
          style={{ color: '#ffffff !important' } as React.CSSProperties}
        >
          <span className="material-symbols-outlined">save</span>
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;
