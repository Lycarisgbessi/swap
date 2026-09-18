import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, Shield, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../../services/api';
import { useToast } from '../../components/Toast';

export default function AdminSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('Général');
  const [isSaving, setIsSaving] = useState(false);

  // — Paramètres Généraux
  const [platformName, setPlatformName] = useState('Plateforme de Formation');
  const [platformDesc, setPlatformDesc] = useState("La plateforme propulsée par la passion de l'apprentissage.");
  const [currency, setCurrency] = useState('GNF');

  // — Sécurité
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    getSettings().then(s => {
      if (s.platformName)    setPlatformName(s.platformName);
      if (s.platformDesc)    setPlatformDesc(s.platformDesc);
      if (s.currency)        setCurrency(s.currency);
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: Record<string, string> = {
        platformName,
        platformDesc,
        currency,
      };

      if (currentPassword && newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      await saveSettings(payload);

      toast('success', 'Paramètres enregistrés avec succès !');

      // Clear password fields after save
      setCurrentPassword('');
      setNewPassword('');
    } catch (e: any) {
      toast('error', e.message || 'Erreur lors de la sauvegarde.');
    }
    setIsSaving(false);
  };

  const tabs = [
    { icon: SettingsIcon, label: 'Général' },
    { icon: Shield,       label: 'Sécurité' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-8 max-w-5xl mx-auto"
    >
      <div>
        <h2 className="text-3xl font-heading font-extrabold tracking-tight text-white">Paramètres</h2>
        <p className="mt-1 font-medium" style={{ color: 'var(--ink-soft)' }}>Configurez votre plateforme de formation, les paiements et les intégrations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Settings Navigation Sidebar */}
        <div className="space-y-2">
          {tabs.map((item, idx) => (
            <button 
              key={idx}
              onClick={() => setActiveTab(item.label)}
              className="w-full flex items-center justify-start space-x-3 px-5 py-3.5 rounded-xl text-sm font-bold transition-all"
              style={
                activeTab === item.label
                  ? { background: 'rgba(255,199,44,0.1)', color: '#FFC72C', border: '1px solid rgba(255,199,44,0.2)' }
                  : { color: 'rgba(248,250,252,0.5)', border: '1px solid transparent' }
              }
              onMouseEnter={e => {
                if (activeTab !== item.label) {
                  (e.currentTarget as HTMLElement).style.background = '#F4FBF3';
                  (e.currentTarget as HTMLElement).style.color = '#f8fafc';
                }
              }}
              onMouseLeave={e => {
                if (activeTab !== item.label) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(15,23,42,0.5)';
                }
              }}
            >
              <item.icon className="w-5 h-5" style={{ color: activeTab === item.label ? '#FFC72C' : 'var(--ink-soft)' }} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Content Area */}
        <div className="md:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {activeTab === 'Général' && (
                <div className="dashboard-card p-8">
                  <h3 className="text-xl font-bold mb-8" style={{ color: 'var(--ink)' }}>Informations de la Plateforme</h3>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--ink-soft)' }}>Nom de la plateforme</label>
                        <input type="text" value={platformName} onChange={e => setPlatformName(e.target.value)} className="input-swap w-full rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--ink-soft)' }}>URL par défaut</label>
                        <input type="text" value={window.location.origin} className="w-full rounded-xl px-4 py-3 font-medium cursor-not-allowed" style={{ background: '#F4FBF3', border: '1px solid var(--border)', color: 'var(--ink-soft)' }} disabled />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--ink-soft)' }}>Description Globale</label>
                      <textarea rows={3} value={platformDesc} onChange={e => setPlatformDesc(e.target.value)} className="input-swap w-full rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-primary resize-y"></textarea>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--ink-soft)' }}>Devise Principale</label>
                      <select value={currency} onChange={e => setCurrency(e.target.value)} className="input-swap w-full rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer appearance-none">
                        <option value="EUR">Euro (€)</option>
                        <option value="USD">Dollar Américain ($)</option>
                        <option value="XOF">Franc CFA (FCFA)</option>
                        <option value="GNF">Franc Guinéen (GNF)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Sécurité' && (
                <div className="dashboard-card p-8">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="p-2.5 rounded-lg" style={{ background: 'rgba(22,163,74,0.12)' }}>
                       <Shield className="w-6 h-6" style={{ color: '#149352' }} />
                    </div>
                    <h3 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>Sécurité de la plateforme</h3>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-3">
                       <label className="text-sm font-bold uppercase tracking-wider block" style={{ color: 'var(--ink-soft)' }}>Modification du mot de passe Administrateur</label>
                       <input 
                         type="password" 
                         value={currentPassword} 
                         onChange={e => setCurrentPassword(e.target.value)} 
                         placeholder="Mot de passe actuel" 
                         className="input-swap w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary mb-3" 
                       />
                       <input 
                         type="password" 
                         value={newPassword} 
                         onChange={e => setNewPassword(e.target.value)} 
                         placeholder="Nouveau mot de passe" 
                         className="input-swap w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" 
                       />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <motion.button 
                  onClick={handleSave}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSaving}
                  className="btn-gold flex items-center space-x-2 px-8 py-3.5 shadow-lg disabled:opacity-50 text-base"
                >
                  <Save className="w-5 h-5" />
                  <span className="font-bold">{isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
