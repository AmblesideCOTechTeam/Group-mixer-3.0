import { X, Settings as SettingsIcon, Palette, Volume2, Clock, BarChart3, Keyboard, Users, Sliders, Upload, Plus } from 'lucide-react';
import { Settings } from '../types';
import { ForcePairingPanel } from './ForcePairingPanel';
import { CustomizationPanel } from './CustomizationPanel';
import { ImportPanel } from './ImportPanel';
import { AppearancePanel } from './AppearancePanel';
import { SoundsPanel } from './SoundsPanel';
import { HistoryPanel } from './HistoryPanel';
import { AnalyticsPanel } from './AnalyticsPanel';
import { HelpPanel } from './HelpPanel';
import { GroupColorsPanel } from './GroupColorsPanel';
import { ConfettiToggle } from './ConfettiToggle';
import { QuickAddStudent } from './QuickAddStudent';
import { ThemeMode, LayoutDensity, BackgroundConfig } from '../hooks/useTheme';
import { SoundConfig } from '../hooks/useSound';
import { HistoryEntry } from '../hooks/useHistory';
import { PairFrequency } from '../hooks/useAnalytics';
import { Student } from '../types';
import { useState } from 'react';
import { Minus, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  onReset: () => void;
  themeMode: ThemeMode;
  density: LayoutDensity;
  background: BackgroundConfig;
  onThemeModeChange: (mode: ThemeMode) => void;
  onDensityChange: (density: LayoutDensity) => void;
  onBackgroundChange: (background: BackgroundConfig) => void;
  soundConfig: SoundConfig;
  onSoundConfigChange: (updates: Partial<SoundConfig>) => void;
  history: HistoryEntry[];
  onHistoryRestore: (entry: HistoryEntry) => void;
  onHistoryDelete: (id: string) => void;
  onHistoryClear: () => void;
  pairFrequencies: PairFrequency[];
  onAnalyticsReset: () => void;
  groupColors: Record<number, string>;
  onGroupColorChange: (groupIndex: number, color: string) => void;
  onGroupColorsRandomize: () => void;
  confettiEnabled: boolean;
  onConfettiToggle: (enabled: boolean) => void;
  students: Student[];
  onImport: (students: Student[]) => void;
  onAddStudent: (student: Student) => void;
  themeColors: { card: string; text: string; accent: string; background: string };
  effectiveTheme: 'light' | 'dark';
}

type ActiveTab = 'general' | 'appearance' | 'colors' | 'sounds' | 'history' | 'analytics' | 'help' | 'pairing' | 'customize' | 'import' | 'add-student';

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  onReset,
  themeMode,
  density,
  background,
  onThemeModeChange,
  onDensityChange,
  onBackgroundChange,
  soundConfig,
  onSoundConfigChange,
  history,
  onHistoryRestore,
  onHistoryDelete,
  onHistoryClear,
  pairFrequencies,
  onAnalyticsReset,
  groupColors,
  onGroupColorChange,
  onGroupColorsRandomize,
  confettiEnabled,
  onConfettiToggle,
  students,
  onImport,
  onAddStudent,
  themeColors,
  effectiveTheme
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('general');

  if (!isOpen) return null;

  const updateNumGroups = (delta: number) => {
    const newNum = Math.max(1, Math.min(12, settings.numGroups + delta));
    const newNames = [...settings.groupNames];

    while (newNames.length < newNum) {
      newNames.push(`Group ${newNames.length + 1}`);
    }

    onSettingsChange({
      ...settings,
      numGroups: newNum,
      groupNames: newNames.slice(0, newNum)
    });
  };

  const updateGroupName = (index: number, name: string) => {
    const newNames = [...settings.groupNames];
    newNames[index] = name;
    onSettingsChange({ ...settings, groupNames: newNames });
  };

  const tabs: Array<{ id: ActiveTab; label: string; icon: any }> = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'sounds', label: 'Sounds', icon: Volume2 },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'pairing', label: 'Force Pairing', icon: Users },
    { id: 'customize', label: 'Customization', icon: Sliders },
    { id: 'add-student', label: 'Add Student', icon: Plus },
    { id: 'import', label: 'Import', icon: Upload },
    { id: 'help', label: 'Help', icon: Keyboard }
  ];

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <div
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl z-50"
        style={{ backgroundColor: themeColors.card }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: effectiveTheme === 'dark' ? '#374151' : '#e5e7eb' }}>
          <h2 className="text-2xl font-bold" style={{ color: themeColors.text }}>Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: themeColors.text }}
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-wrap gap-1 p-3 border-b bg-opacity-50" style={{ borderColor: effectiveTheme === 'dark' ? '#374151' : '#e5e7eb', backgroundColor: effectiveTheme === 'dark' ? '#1e293b' : '#f9fafb' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id ? 'text-white shadow-md' : ''
                }`}
                style={activeTab === tab.id ? { backgroundColor: themeColors.accent } : { backgroundColor: effectiveTheme === 'dark' ? '#0f172a' : '#ffffff', color: themeColors.text }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 160px)' }}>
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                  Number of Groups
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateNumGroups(-1)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ backgroundColor: effectiveTheme === 'dark' ? '#374151' : '#e5e7eb', color: themeColors.text }}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-2xl font-bold w-12 text-center" style={{ color: themeColors.text }}>
                    {settings.numGroups}
                  </span>
                  <button
                    onClick={() => updateNumGroups(1)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ backgroundColor: effectiveTheme === 'dark' ? '#374151' : '#e5e7eb', color: themeColors.text }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                  Group Names
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {settings.groupNames.map((name, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={name}
                      onChange={(e) => updateGroupName(idx, e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                      style={{
                        borderColor: effectiveTheme === 'dark' ? '#374151' : '#d1d5db',
                        backgroundColor: effectiveTheme === 'dark' ? '#1f2937' : '#ffffff',
                        color: themeColors.text
                      }}
                      placeholder={`Group ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              <ConfettiToggle enabled={confettiEnabled} onToggle={onConfettiToggle} />

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                  Animation Duration: {(settings.animationDuration || 0.4).toFixed(1)}s
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  value={settings.animationDuration || 0.4}
                  onChange={(e) => onSettingsChange({ ...settings, animationDuration: parseFloat(e.target.value) })}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{ backgroundColor: effectiveTheme === 'dark' ? '#374151' : '#e5e7eb' }}
                />
                <div className="flex justify-between text-xs mt-1" style={{ color: themeColors.text + '80' }}>
                  <span>Fast (0.1s)</span>
                  <span>Slow (2.0s)</span>
                </div>
              </div>

              <button
                onClick={onReset}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                <RotateCcw size={18} />
                Reset All Settings
              </button>
            </div>
          )}

          {activeTab === 'appearance' && (
            <AppearancePanel
              themeMode={themeMode}
              density={density}
              background={background}
              onThemeModeChange={onThemeModeChange}
              onDensityChange={onDensityChange}
              onBackgroundChange={onBackgroundChange}
            />
          )}

          {activeTab === 'colors' && (
            <GroupColorsPanel
              groupNames={settings.groupNames}
              groupColors={groupColors}
              onColorChange={onGroupColorChange}
              onRandomize={onGroupColorsRandomize}
            />
          )}

          {activeTab === 'sounds' && (
            <SoundsPanel config={soundConfig} onConfigChange={onSoundConfigChange} />
          )}

          {activeTab === 'history' && (
            <HistoryPanel
              history={history}
              onRestore={onHistoryRestore}
              onDelete={onHistoryDelete}
              onClearAll={onHistoryClear}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPanel frequencies={pairFrequencies} onReset={onAnalyticsReset} />
          )}

          {activeTab === 'help' && <HelpPanel />}

          {activeTab === 'pairing' && (
            <ForcePairingPanel
              students={students}
              forcePairings={settings.forcePairings}
              forceAssignments={settings.forceAssignments}
              numGroups={settings.numGroups}
              groupNames={settings.groupNames}
              onForcePairingsChange={(pairings) =>
                onSettingsChange({ ...settings, forcePairings: pairings })
              }
              onForceAssignmentsChange={(assignments) =>
                onSettingsChange({ ...settings, forceAssignments: assignments })
              }
            />
          )}

          {activeTab === 'customize' && (
            <CustomizationPanel
              colors={settings.colors}
              onColorsChange={(colors) =>
                onSettingsChange({ ...settings, colors })
              }
            />
          )}

          {activeTab === 'add-student' && (
            <QuickAddStudent
              onAdd={onAddStudent}
              themeColors={themeColors}
              effectiveTheme={effectiveTheme}
            />
          )}

          {activeTab === 'import' && (
            <ImportPanel onImport={onImport} />
          )}
        </div>
      </div>
    </>
  );
}
