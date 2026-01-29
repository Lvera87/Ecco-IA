import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Plus, Award, Menu } from 'lucide-react';
import { useUser } from '../context/UserContext';
import Button from './ui/Button';
import NotificationsPanel from './ui/NotificationsPanel';
import AddApplianceModal from './ui/AddApplianceModal';

const ResidentialHeader = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { userProfile } = useUser();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <header className="h-20 bg-slate-950 border-b border-slate-900 px-4 md:px-8 flex items-center justify-between shrink-0 relative z-40">
      <div className="flex items-center gap-4 md:gap-6">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-slate-400 hover:text-white xl:hidden"
        >
          <Menu size={24} />
        </button>

        <div className="flex items-center gap-4">
          <div
            className="relative cursor-pointer"
            onClick={() => navigate('/profile')}
          >
            <div className="size-12 rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-800 shadow-inner group hover:border-emerald-500/50 transition-colors">
              <User size={24} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div className="absolute -bottom-1 -right-1 size-5 bg-emerald-500 text-slate-950 rounded-lg flex items-center justify-center text-[10px] font-bold border-2 border-slate-950 shadow-lg">
              {userProfile.level}
            </div>
          </div>
          <div className="flex flex-col md:block min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-white tracking-tight text-sm md:text-base truncate max-w-[120px] md:max-w-none">{userProfile.name}</h2>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                <Award size={10} />
                <span className="hidden md:inline">Nivel</span> {userProfile.level}
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3 mt-1.5">
              <div className="w-32 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] transition-all duration-300"
                  style={{ width: `${(userProfile.xp / userProfile.xpToNext) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{userProfile.xp} / {userProfile.xpToNext} XP</span>
            </div>
          </div>
        </div>
      </div>


      <div className="flex items-center gap-2 md:gap-4">
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-lg shadow-emerald-500/20 px-3 md:px-4"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={18} className="md:mr-2" />
          <span className="hidden md:inline text-sm font-bold">Añadir Dispositivo</span>
        </Button>

        <NotificationsPanel />
      </div>

      {/* Add Appliance Modal */}
      <AddApplianceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </header >
  );
};

export default ResidentialHeader;
