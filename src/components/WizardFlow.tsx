import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { WizardData } from '../types/mood';
import Step1Event from './wizard/Step1Event';
import Step2Feeling from './wizard/Step2Feeling';
import Step3Category from './wizard/Step3Category';
import Step4Mirror from './wizard/Step4Mirror';

export default function WizardFlow() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState('');
  const [wizardData, setWizardData] = useState<WizardData>({
    event: '',
    mood: null,
    intensity: 5,
    category: null,
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSave = async () => {
    if (!wizardData.event.trim() || !wizardData.mood || !wizardData.category) return;

    setLoading(true);
    setStep(4);

    try {
      const { generateInitialAdvice } = await import('../api/chat');
      const advice = await generateInitialAdvice({
        event: wizardData.event,
        mood: wizardData.mood,
        intensity: wizardData.intensity,
        category: wizardData.category,
      });

      setAiAdvice(advice);
    } catch (error) {
      console.error('生成建议失败:', error);
      setAiAdvice('很抱歉，暂时无法生成建议，但我在这里陪着你。');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setWizardData({
      event: '',
      mood: null,
      intensity: 5,
      category: null,
    });
    setAiAdvice('');
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F5' }}>
      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3" style={{ color: '#9BA896' }}>
            <Calendar size={20} />
            <p className="text-sm font-medium">{getCurrentDate()}</p>
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#5A5A5A' }}>
            今天感觉怎么样？
          </h1>
          <div className="w-16 h-1 mx-auto rounded-full" style={{ backgroundColor: '#D4A59A' }}></div>
        </header>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Step1Event
                value={wizardData.event}
                onChange={(value) => setWizardData({ ...wizardData, event: value })}
                onNext={handleNext}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Step2Feeling
                mood={wizardData.mood}
                intensity={wizardData.intensity}
                onMoodChange={(mood) => setWizardData({ ...wizardData, mood })}
                onIntensityChange={(intensity) => setWizardData({ ...wizardData, intensity })}
                onNext={handleNext}
                onPrev={handlePrev}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Step3Category
                category={wizardData.category}
                onCategoryChange={(category) => setWizardData({ ...wizardData, category })}
                onSave={handleSave}
                onPrev={handlePrev}
                loading={loading}
              />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Step4Mirror
                advice={aiAdvice}
                loading={loading}
                onReset={handleReset}
                initialContext={
                  wizardData.mood && wizardData.category
                    ? {
                        event: wizardData.event,
                        mood: wizardData.mood,
                        intensity: wizardData.intensity,
                        category: wizardData.category,
                      }
                    : undefined
                }
              />
            </motion.div>
          )}
        </AnimatePresence>

        {step <= 3 && (
          <div className="mt-6 flex justify-between items-center" style={{ color: '#9BA896' }}>
            <span className="text-sm">第 {step} / 3 步</span>
            <div className="flex gap-1">
              {[1, 2, 3].map((dot) => (
                <div
                  key={dot}
                  className="w-2 h-2 rounded-full transition-colors"
                  style={{
                    backgroundColor: dot <= step ? '#D4A59A' : '#E8E5E0',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* 历史记录功能已移除，因为不再使用数据库 */}
      </div>
    </div>
  );
}
