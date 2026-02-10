
import React, { useState, useRef, useCallback, memo, useEffect } from 'react';
import { 
  Upload, Sparkles, History, Settings2, Trash2, Download, Box, 
  Image as ImageIcon, AlertCircle, Loader2, Sofa, Palette, Zap, 
  StickyNote, X, RefreshCw, ChevronLeft, ChevronRight, Check, Type,
  Sun, TreePine, Paintbrush, LayoutDashboard, MousePointer2
} from 'lucide-react';
import { 
  RenderStatus, RenderHistory, RenderingSettings, TimeOfDay, 
  DesignTheme, FurniturePolicy, LandscapingPolicy, 
  WatermarkCorner, WatermarkSize, WatermarkOpacity 
} from './types';
import { generateArchitecturalRender } from './services/geminiService';
import ImageSlider from './components/ImageSlider';

// Função para gerar 3 tons harmônicos a partir de um HEX
const generateColorPalette = (hex: string): string[] => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const lighten = (factor: number) => {
    const nr = Math.min(255, Math.floor(r + (255 - r) * factor));
    const ng = Math.min(255, Math.floor(g + (255 - g) * factor));
    const nb = Math.min(255, Math.floor(b + (255 - b) * factor));
    return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
  };

  const darken = (factor: number) => {
    const nr = Math.max(0, Math.floor(r * (1 - factor)));
    const ng = Math.max(0, Math.floor(g * (1 - factor)));
    const nb = Math.max(0, Math.floor(b * (1 - factor)));
    return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
  };

  return [lighten(0.3), hex, darken(0.3)]; // Tom Claro, Base, Tom Escuro
};

const LogoIdeal = memo(({ className = "h-12", light = false }: { className?: string, light?: boolean }) => {
  const color = light ? "#FFFFFF" : "#0F172A";
  const subColor = light ? "rgba(255,255,255,0.6)" : "rgba(15,23,42,0.5)";
  return (
    <div className={`flex items-center select-none ${className}`}>
      <svg viewBox="0 0 350 120" className="h-full w-auto" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="45" fill={color} style={{ font: '900 48px Montserrat, sans-serif', letterSpacing: '-1px' }}>IDEAL</text>
        <text x="0" y="92" fill={color} style={{ font: '400 52px Montserrat, sans-serif', letterSpacing: '1px' }}>PROJETOS<tspan fill={color} style={{ font: '900 52px Montserrat, sans-serif' }}>.</tspan></text>
        <rect x="0" y="105" width="350" height="1.5" fill={subColor} />
        <text x="0" y="118" fill={subColor} style={{ font: '400 12px Montserrat, sans-serif', letterSpacing: '6px' }}>ARQUITETURA | ENGENHARIA</text>
      </svg>
    </div>
  );
});

const App: React.FC = () => {
  // Fix missing fileInputRef
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [renderedImage, setRenderedImage] = useState<string | null>(null);
  const [status, setStatus] = useState<RenderStatus>(RenderStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<RenderHistory[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [settings, setSettings] = useState<RenderingSettings>({
    aspectRatio: "16:9",
    designTheme: "Moderno",
    baseColor: "#576574",
    palette: ["#8395a7", "#576574", "#222f3e"],
    creativityLevel: 75,
    furniturePolicy: "Manter Original",
    landscapingPolicy: "Adicionar Paisagismo (IA)",
    timeOfDay: "Hora Dourada (Quente)",
    designObservations: "",
    watermark: {
      enabled: true,
      corner: 'Bottom Right',
      size: 'Medium',
      opacity: 'Medium'
    }
  });

  // Atualiza paleta sempre que a cor base mudar
  useEffect(() => {
    const newPalette = generateColorPalette(settings.baseColor);
    setSettings(prev => ({ ...prev, palette: newPalette }));
  }, [settings.baseColor]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target?.result as string);
        setRenderedImage(null);
        setErrorMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyWatermarkAndDownload = async () => {
    if (!renderedImage) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      if (settings.watermark.enabled) {
        const scale = settings.watermark.size === 'Small' ? 0.15 : settings.watermark.size === 'Medium' ? 0.25 : 0.4;
        const wSize = canvas.width * scale; const hSize = wSize * 0.35;
        const margin = canvas.width * 0.04;
        let x = margin, y = margin;
        if (settings.watermark.corner.includes('Right')) x = canvas.width - wSize - margin;
        if (settings.watermark.corner.includes('Bottom')) y = canvas.height - hSize - margin;
        const alpha = settings.watermark.opacity === 'Low' ? 0.25 : settings.watermark.opacity === 'Medium' ? 0.55 : 0.85;
        ctx!.save(); ctx!.globalAlpha = alpha;
        ctx!.fillStyle = "#FFFFFF"; ctx!.font = `bold ${hSize * 0.4}px Montserrat, sans-serif`;
        ctx!.fillText("IDEAL", x, y + hSize * 0.35);
        ctx!.font = `400 ${hSize * 0.45}px Montserrat, sans-serif`; ctx!.fillText("PROJETOS.", x, y + hSize * 0.75);
        ctx!.fillStyle = "rgba(255,255,255,0.5)"; ctx!.fillRect(x, y + hSize * 0.85, wSize, 1);
        ctx!.font = `400 ${hSize * 0.1}px Montserrat, sans-serif`; ctx!.fillText("ARQUITETURA | ENGENHARIA", x, y + hSize * 0.98);
        ctx!.restore();
      }
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png', 0.95);
      link.download = `ideal-render-${Date.now()}.png`;
      link.click();
    };
    img.src = renderedImage;
  };

  const handleRender = async (isRegenerate: boolean = false) => {
    if (!originalImage) return;
    setStatus(RenderStatus.LOADING);
    setErrorMessage(null);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
    try {
      const result = await generateArchitecturalRender(originalImage, "", settings, isRegenerate);
      setRenderedImage(result);
      setStatus(RenderStatus.SUCCESS);
      setHistory(prev => [{ id: Date.now().toString(), original: originalImage, rendered: result, prompt: `${settings.designTheme} - ${settings.timeOfDay}`, timestamp: Date.now() }, ...prev].slice(0, 10));
    } catch (error: any) {
      setErrorMessage(error.message || "Erro de processamento AI.");
      setStatus(RenderStatus.ERROR);
    }
  };

  const updateSetting = useCallback(<K extends keyof RenderingSettings>(key: K, value: RenderingSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateWatermark = useCallback(<K extends keyof RenderingSettings['watermark']>(key: K, value: RenderingSettings['watermark'][K]) => {
    setSettings(prev => ({ ...prev, watermark: { ...prev.watermark, [key]: value } }));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-slate-900 font-sans">
      <header className="h-24 px-8 flex items-center justify-between sticky top-0 bg-white border-b border-slate-200 z-[60] shadow-sm">
        <LogoIdeal className="h-14" />
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end mr-4">
             <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Painel do Arquiteto</span>
             <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">IDEAL PROJETOS AI v4.2</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-4 bg-slate-950 rounded-2xl text-white shadow-xl active:scale-95 transition-all">
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Settings2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar Configurações */}
        <aside className={`
          fixed lg:relative top-24 lg:top-0 bottom-0 left-0 z-[56]
          w-[360px] sm:w-[440px] bg-white border-r border-slate-200
          transition-transform duration-300 transform
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto p-10 flex flex-col gap-10 shadow-2xl lg:shadow-none
        `}>
          
          {/* 1. UPLOAD */}
          <section>
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
              <Upload className="w-4 h-4" /> 1. Upload do Modelo
            </h3>
            <div onClick={() => fileInputRef.current?.click()} className={`group border-2 border-dashed rounded-3xl p-6 cursor-pointer h-44 overflow-hidden relative flex flex-col items-center justify-center transition-all ${originalImage ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-200 bg-slate-50 hover:border-indigo-300'}`}>
              {originalImage ? (
                <div className="relative w-full h-full">
                  <img src={originalImage} className="w-full h-full object-cover rounded-2xl" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                    <RefreshCw className="text-white w-6 h-6" />
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-10 h-10 text-indigo-200 mx-auto mb-3"/>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Clique para importar 3D</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            </div>
          </section>

          {/* 2. ACABAMENTOS */}
          <section className="space-y-6">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Paintbrush className="w-4 h-4" /> 2. Acabamentos
            </h3>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Escolha o Tema do Design</label>
              <select 
                value={settings.designTheme} 
                onChange={(e) => updateSetting('designTheme', e.target.value as DesignTheme)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-600/10 appearance-none cursor-pointer"
              >
                {['Moderno', 'Industrial', 'Natural', 'Amadeirado', 'Minimalista', 'Mediterrâneo', 'Escandinavo', 'Brutalista'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Paleta Cromática (3 Tons)</label>
                <div className="flex gap-2">
                  {settings.palette.map((c, i) => (
                    <div key={i} className="w-6 h-6 rounded-lg border-2 border-white shadow-sm transition-transform hover:scale-110" style={{ backgroundColor: c }} title={`Tom ${i+1}`} />
                  ))}
                </div>
              </div>
              <div className="relative">
                <input 
                  type="color" 
                  value={settings.baseColor} 
                  onChange={(e) => updateSetting('baseColor', e.target.value)}
                  className="w-full h-14 bg-transparent border-none cursor-pointer rounded-2xl overflow-hidden p-0"
                />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <MousePointer2 className="w-4 h-4 text-white drop-shadow-md" />
                </div>
              </div>
            </div>
          </section>

          {/* 3. MARCA D'ÁGUA */}
          <section className="bg-slate-50 p-8 rounded-[40px] border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[11px] font-black text-slate-500 uppercase flex items-center gap-2"><Type className="w-4 h-4" /> Marca d'Água</h3>
              <button onClick={() => updateWatermark('enabled', !settings.watermark.enabled)} className={`w-12 h-6 rounded-full relative transition-all ${settings.watermark.enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.watermark.enabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            {settings.watermark.enabled && (
              <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                <select value={settings.watermark.corner} onChange={(e) => updateWatermark('corner', e.target.value as WatermarkCorner)} className="p-3 text-[10px] font-bold rounded-xl border bg-white">{['Top Left', 'Top Right', 'Bottom Left', 'Bottom Right'].map(c => <option key={c} value={c}>{c}</option>)}</select>
                <select value={settings.watermark.size} onChange={(e) => updateWatermark('size', e.target.value as WatermarkSize)} className="p-3 text-[10px] font-bold rounded-xl border bg-white">{['Small', 'Medium', 'Large'].map(s => <option key={s} value={s}>{s}</option>)}</select>
              </div>
            )}
          </section>

          {/* 4. CRIATIVIDADE */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-black text-slate-400 uppercase flex items-center gap-2"><Zap className="w-4 h-4" /> Intensidade Criativa</h3>
              <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">{settings.creativityLevel}%</span>
            </div>
            <input type="range" min="0" max="100" step="5" value={settings.creativityLevel} onChange={(e) => updateSetting('creativityLevel', parseInt(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            <div className="flex justify-between mt-3 text-[9px] font-black text-slate-300 uppercase tracking-widest"><span>Realista</span><span>Conceitual</span></div>
          </section>

          {/* 5. ELEMENTOS (CONSOLIDADO) */}
          <section className="space-y-8 bg-indigo-50/20 p-8 rounded-[40px] border border-indigo-100/30">
            <h3 className="text-[11px] font-black text-indigo-600/60 uppercase tracking-[0.2em] flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" /> 3. Elementos do Render
            </h3>
            
            <div className="space-y-6">
              {/* Iluminação */}
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-2"><Sun className="w-3.5 h-3.5"/> Configuração de Luz & Céu</label>
                <select value={settings.timeOfDay} onChange={(e) => updateSetting('timeOfDay', e.target.value as TimeOfDay)} className="w-full p-4 bg-white border border-slate-100 rounded-2xl text-[11px] font-bold outline-none shadow-sm focus:ring-2 focus:ring-indigo-600/10">
                  {['Nascer do Sol (Suave)', 'Meio-dia (Sol Pleno)', 'Hora Dourada (Quente)', 'Nublado (Céu Dramático)', 'Noite (Luz Artificial)', 'Crepúsculo (Blue Hour)'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Mobiliário */}
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-2"><Sofa className="w-3.5 h-3.5"/> Mobiliário (Interior/Exterior)</label>
                <div className="grid grid-cols-1 gap-2">
                  {(['Manter Original', 'Adicionar Mobília (IA)', 'Remover Mobília'] as FurniturePolicy[]).map(p => (
                    <button 
                      key={p} 
                      onClick={() => updateSetting('furniturePolicy', p)} 
                      className={`py-3 px-4 text-[9px] font-black border rounded-xl transition-all text-left flex items-center justify-between
                        ${settings.furniturePolicy === p ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                    >
                      {p}
                      {settings.furniturePolicy === p && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Paisagismo */}
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-2"><TreePine className="w-3.5 h-3.5"/> Paisagismo & Natureza</label>
                <div className="grid grid-cols-1 gap-2">
                  {(['Manter Original', 'Adicionar Paisagismo (IA)', 'Remover Paisagismo'] as LandscapingPolicy[]).map(p => (
                    <button 
                      key={p} 
                      onClick={() => updateSetting('landscapingPolicy', p)} 
                      className={`py-3 px-4 text-[9px] font-black border rounded-xl transition-all text-left flex items-center justify-between
                        ${settings.landscapingPolicy === p ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                    >
                      {p}
                      {settings.landscapingPolicy === p && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 6. OBSERVAÇÕES */}
          <section>
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
              <StickyNote className="w-4 h-4" /> 4. Observações Técnicas
            </h3>
            <textarea 
              value={settings.designObservations} 
              onChange={(e) => updateSetting('designObservations', e.target.value)}
              className="w-full h-36 bg-slate-50 border border-slate-200 rounded-[32px] p-6 text-[11px] font-medium resize-none focus:ring-2 focus:ring-indigo-600/10 outline-none placeholder-slate-300 leading-relaxed"
              placeholder="Ex: Textura frontal de tijolinhos aparentes, caminho de pedras no chão levando à porta de entrada, iluminação em fita de LED embutida no forro..."
            />
          </section>

          <div className="sticky bottom-0 bg-white pt-6 pb-6 border-t border-slate-50 mt-auto">
            <button
              onClick={() => handleRender(false)}
              disabled={!originalImage || status === RenderStatus.LOADING}
              className={`w-full py-7 rounded-[32px] flex items-center justify-center gap-4 font-black text-xs tracking-[0.3em] uppercase transition-all shadow-2xl
                ${!originalImage || status === RenderStatus.LOADING 
                  ? 'bg-slate-100 text-slate-300 shadow-none cursor-not-allowed' 
                  : 'bg-slate-950 text-white hover:bg-indigo-700 active:scale-95 shadow-indigo-500/10'}`}
            >
              {status === RenderStatus.LOADING ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
              GERAR RENDER PROFISSIONAL
            </button>
          </div>
        </aside>

        {/* Workspace Central */}
        <div className="flex-1 p-8 lg:p-14 overflow-y-auto bg-slate-50/40">
          <div className="max-w-6xl mx-auto h-full flex flex-col items-center justify-center">
            {status === RenderStatus.ERROR && (
                <div className="mb-10 p-6 bg-red-50 border-l-4 border-red-500 rounded-2xl flex items-center gap-6 text-red-600 w-full shadow-lg animate-in slide-in-from-top-4">
                  <AlertCircle className="w-6 h-6 shrink-0" />
                  <p className="text-xs font-black uppercase tracking-widest">{errorMessage}</p>
                </div>
            )}

            {!originalImage ? (
              <div className="text-center animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div className="w-44 h-44 bg-white rounded-[60px] flex items-center justify-center mx-auto mb-14 shadow-2xl shadow-slate-200/50 border border-slate-50">
                   <LogoIdeal className="h-16 grayscale opacity-10" />
                </div>
                <h2 className="text-5xl font-black text-slate-900 mb-8 tracking-tighter">IDEAL PROJETOS <span className="text-indigo-600">AI</span></h2>
                <p className="text-slate-400 font-bold max-w-lg mx-auto text-lg leading-relaxed mb-16 italic">Visualização arquitetônica de luxo com precisão computacional.</p>
                <button onClick={() => fileInputRef.current?.click()} className="px-16 py-7 bg-slate-950 text-white rounded-full font-black text-xs tracking-[0.4em] uppercase hover:bg-indigo-600 transition-all shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] active:scale-95">Importar Novo Projeto</button>
              </div>
            ) : renderedImage ? (
              <div className="w-full space-y-12 animate-in fade-in zoom-in-95 duration-1000">
                 <div className="relative group bg-white p-5 rounded-[72px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden">
                    <ImageSlider before={originalImage} after={renderedImage} />
                    
                    {/* Watermark Live Preview */}
                    {settings.watermark.enabled && (
                      <div className={`absolute pointer-events-none transition-all duration-700 z-20
                        ${settings.watermark.corner === 'Top Left' ? 'top-14 left-14' : 
                          settings.watermark.corner === 'Top Right' ? 'top-14 right-14' : 
                          settings.watermark.corner === 'Bottom Left' ? 'bottom-14 left-14' : 'bottom-14 right-14'}`}
                      >
                        <LogoIdeal 
                          className={settings.watermark.size === 'Small' ? 'h-14' : settings.watermark.size === 'Medium' ? 'h-24' : 'h-40'} 
                          light 
                        />
                      </div>
                    )}
                 </div>
                 
                 <div className="flex flex-wrap items-center justify-center gap-8">
                    <button onClick={applyWatermarkAndDownload} className="px-16 py-7 bg-slate-950 text-white rounded-full font-black text-[12px] tracking-[0.3em] uppercase flex items-center gap-5 shadow-2xl hover:bg-slate-800 transition-all active:scale-95">
                       <Download className="w-6 h-6" /> Download 8K
                    </button>
                    <button onClick={() => handleRender(true)} disabled={status === RenderStatus.LOADING} className="px-16 py-7 bg-indigo-600 text-white rounded-full font-black text-[12px] tracking-[0.3em] uppercase flex items-center gap-5 shadow-2xl hover:bg-indigo-700 transition-all active:scale-95">
                       <RefreshCw className={`w-6 h-6 ${status === RenderStatus.LOADING ? 'animate-spin' : ''}`} /> Recriar Versão
                    </button>
                    <button onClick={() => setRenderedImage(null)} className="px-12 py-7 bg-white border-2 border-slate-200 rounded-full font-black text-[12px] tracking-[0.3em] uppercase text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all">
                       Novo Teste
                    </button>
                 </div>
              </div>
            ) : (
              <div className="w-full aspect-video rounded-[72px] bg-white overflow-hidden relative shadow-2xl group border border-slate-100 p-8">
                <img src={originalImage} alt="Input" className="w-full h-full object-contain opacity-40 grayscale" />
                
                {status === RenderStatus.LOADING ? (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-3xl flex flex-col items-center justify-center gap-12">
                     <div className="w-40 h-40 relative">
                        <div className="absolute inset-0 border-[6px] border-indigo-600/5 rounded-full"></div>
                        <div className="absolute inset-0 border-t-[6px] border-indigo-600 rounded-full animate-[spin_1.5s_linear_infinite]"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                           <LogoIdeal className="h-10 opacity-30" />
                        </div>
                     </div>
                     <div className="text-center">
                        <p className="font-black text-[14px] tracking-[0.7em] uppercase text-slate-900 mb-4">Calculando Geometria & Luz</p>
                        <div className="flex gap-8 justify-center text-[11px] text-indigo-500 font-black uppercase tracking-widest">
                            <span className="animate-pulse">Ray-Tracing</span>
                            <span className="animate-pulse delay-150">PBR Materials</span>
                            <span className="animate-pulse delay-300">Global Illumination</span>
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/5 backdrop-blur-[4px] opacity-0 group-hover:opacity-100 transition-all duration-700">
                    <button onClick={() => fileInputRef.current?.click()} className="px-20 py-8 bg-white rounded-full shadow-[0_35px_70px_-15px_rgba(0,0,0,0.3)] flex items-center gap-6 font-black text-[14px] tracking-[0.5em] uppercase text-slate-950 hover:scale-105 active:scale-95 transition-all">
                      <Sparkles className="w-7 h-7 text-indigo-600" /> Iniciar Renderização
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        input[type="range"]::-webkit-slider-thumb {
          width: 26px; height: 26px;
          border-radius: 50%;
          background: #4f46e5;
          cursor: pointer; -webkit-appearance: none;
          box-shadow: 0 0 30px rgba(79, 70, 229, 0.4);
          border: 5px solid white;
        }
      `}</style>
    </div>
  );
};

export default App;
