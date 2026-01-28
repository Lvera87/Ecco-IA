import React, { useState } from 'react';
import { X, Plus, Refrigerator, AirVent, Tv, WashingMachine, Lightbulb, Microwave, Fan, Monitor, Droplets, Flame } from 'lucide-react';
import { useEnergy, iconMap } from '../../context/EnergyContext';
import Button from './Button';

const applianceCategories = [
    { id: 'cocina', name: 'Cocina', icon: Refrigerator },
    { id: 'climatizacion', name: 'Climatización', icon: AirVent },
    { id: 'entretenimiento', name: 'Entretenimiento', icon: Tv },
    { id: 'lavanderia', name: 'Lavandería', icon: WashingMachine },
    { id: 'iluminacion', name: 'Iluminación', icon: Lightbulb },
    { id: 'otros', name: 'Otros', icon: Monitor },
];

const applianceTypes = [
    { name: 'Nevera', icon: 'Refrigerator', consumption: 0.18, category: 'cocina' }, // ~180W Media
    { name: 'Freezer', icon: 'Refrigerator', consumption: 0.25, category: 'cocina' },
    { name: 'Microondas', icon: 'Microwave', consumption: 1.2, category: 'cocina' }, // Uso corto
    { name: 'Aire Acondicionado', icon: 'AirVent', consumption: 1.0, category: 'climatizacion' }, // ~1000W Inverter/Pequeño
    { name: 'Ventilador', icon: 'Fan', consumption: 0.06, category: 'climatizacion' }, // 60W
    { name: 'Calentador', icon: 'Flame', consumption: 1.5, category: 'climatizacion' },
    { name: 'Televisor', icon: 'Tv', consumption: 0.08, category: 'entretenimiento' }, // 80W LED
    { name: 'Consola de Juegos', icon: 'Monitor', consumption: 0.15, category: 'entretenimiento' },
    { name: 'Computador', icon: 'Monitor', consumption: 0.15, category: 'entretenimiento' }, // Laptop/Office
    { name: 'Lavadora', icon: 'WashingMachine', consumption: 0.5, category: 'lavanderia' },
    { name: 'Secadora', icon: 'WashingMachine', consumption: 2.5, category: 'lavanderia' }, // Alta potencia
    { name: 'Lámpara LED', icon: 'Lightbulb', consumption: 0.01, category: 'iluminacion' }, // 10W
    { name: 'Bombilla Tradicional', icon: 'Lightbulb', consumption: 0.06, category: 'iluminacion' },
    { name: 'Calentador de Agua', icon: 'Droplets', consumption: 2.0, category: 'otros' },
];

const AddApplianceModal = ({ isOpen, onClose }) => {
    const { addAppliance } = useEnergy();
    const [step, setStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [customName, setCustomName] = useState('');
    const [usageHours, setUsageHours] = useState(4);
    const [quantity, setQuantity] = useState(1);

    const filteredTypes = selectedCategory
        ? applianceTypes.filter(t => t.category === selectedCategory)
        : applianceTypes;

    const handleSubmit = async () => {
        if (selectedType) {
            const success = await addAppliance({
                name: customName || selectedType.name,
                icon: selectedType.icon,
                consumption: selectedType.consumption,
                usageHours,
                category: selectedType.category,
                quantity: quantity // Enviamos la cantidad al contexto
            });
            if (success) handleClose();
        }
    };

    const handleClose = () => {
        setStep(1);
        setSelectedCategory(null);
        setSelectedType(null);
        setCustomName('');
        setUsageHours(4);
        setQuantity(1);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Añadir Dispositivo</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Paso {step} de 2</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-slate-100 dark:bg-slate-800">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${(step / 2) * 100}%` }}
                    />
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {step === 1 && (
                        <div className="space-y-6">
                            {/* Category filter */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                                    Filtrar por categoría
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all
                      ${!selectedCategory
                                                ? 'bg-primary text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                    >
                                        Todos
                                    </button>
                                    {applianceCategories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2
                        ${selectedCategory === cat.id
                                                    ? 'bg-primary text-white'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                        >
                                            <cat.icon size={16} />
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Appliance types */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                                    Selecciona el tipo de dispositivo
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {filteredTypes.map((type, idx) => {
                                        const Icon = iconMap[type.icon] || Monitor;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedType(type)}
                                                className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all
                          ${selectedType?.name === type.name
                                                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                        : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'}`}
                                            >
                                                <div className={`size-10 rounded-lg flex items-center justify-center
                          ${selectedType?.name === type.name ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                                    <Icon size={20} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-bold text-sm text-slate-800 dark:text-white">{type.name}</p>
                                                    <p className="text-xs text-slate-500">{type.consumption} kWh/h</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && selectedType && (
                        <div className="space-y-6">
                            {/* Selected device preview */}
                            <div className="p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 flex items-center gap-4">
                                <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-white">
                                    {(() => {
                                        const Icon = iconMap[selectedType.icon] || Monitor;
                                        return <Icon size={24} />;
                                    })()}
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Dispositivo seleccionado</p>
                                    <p className="font-bold text-slate-800 dark:text-white">{selectedType.name}</p>
                                </div>
                            </div>

                            {/* Custom name */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Nombre personalizado (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    placeholder={`Ej: ${selectedType.name} de la cocina`}
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary focus:border-primary py-3"
                                />
                            </div>

                            {/* Quantity Selector */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Cantidad
                                </label>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-700"
                                    >
                                        -
                                    </button>
                                    <span className="text-xl font-black text-slate-900 dark:text-white w-8 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(10, quantity + 1))}
                                        className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-700"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Usage hours */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        Horas de uso diarias estimadas
                                    </label>
                                    <span className="text-primary font-black">{usageHours}h</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="24"
                                    value={usageHours}
                                    onChange={(e) => setUsageHours(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex justify-between mt-1 text-xs text-slate-400">
                                    <span>1h</span>
                                    <span>24h</span>
                                </div>
                            </div>

                            {/* Estimated consumption */}
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Consumo estimado mensual ({quantity} equipos)</p>
                                <p className="text-2xl font-black text-slate-800 dark:text-white">
                                    {((selectedType.consumption * usageHours * 30 * quantity).toFixed(1))} <span className="text-sm font-normal text-slate-400">kWh/mes</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-between">
                    {step > 1 ? (
                        <Button variant="ghost" onClick={() => setStep(step - 1)}>
                            Anterior
                        </Button>
                    ) : (
                        <Button variant="ghost" onClick={handleClose}>
                            Cancelar
                        </Button>
                    )}

                    {step < 2 ? (
                        <Button
                            variant="primary"
                            onClick={() => setStep(2)}
                            disabled={!selectedType}
                        >
                            Siguiente
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            icon={Plus}
                        >
                            Añadir dispositivo
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddApplianceModal;
