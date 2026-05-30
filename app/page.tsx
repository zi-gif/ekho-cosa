import { getCuratedDealers } from "@/lib/snapshots";
import { ScenarioBanner } from "@/components/ScenarioBanner";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { Workspace } from "@/components/Workspace";

export default async function Page() {
  const dealers = await getCuratedDealers();
  return (
    <>
      <ScenarioBanner />
      <TopBar />
      <main>
        <Workspace curated={dealers} />
      </main>
      <Footer />
    </>
  );
}
