import { useEffect } from "react";
import { ChecklistModal } from "../checklist";
import { TopHero } from "./TopHero";
import { DragonEvolution } from "../dragon/DragonEvolution";
import { useAppStore, calculateContinuousDays } from "../../lib/store/appStore";

const HomePage = () => {
  const dailyRecords = useAppStore((state) => state.dailyRecords);
  const user = useAppStore((state) => state.user);
  const ensureChecklist = useAppStore((state) => state.ensureDailyChecklist);
  const setSelectedDate = useAppStore((state) => state.setSelectedDate);
  const modalOpen = useAppStore((state) => state.modalOpen);
  const setModalOpen = useAppStore((state) => state.setModalOpen);

  const continuousDays = calculateContinuousDays(dailyRecords);
  const progressRatio = user?.goalDays ? Math.min(continuousDays / user.goalDays, 1) : 0;

  useEffect(() => {
    if (!modalOpen) {
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    ensureChecklist(today).catch(console.error);
  }, [modalOpen, ensureChecklist]);


  return (
    <div className="flex flex-col gap-8">
      <TopHero />
      <DragonEvolution progressRatio={progressRatio} />


      <ChecklistModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default HomePage;
