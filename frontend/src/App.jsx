import { useState } from "react";
import Tabs from "./components/Tabs";
import MatchList from "./components/MatchList";
import useFeed from "./hooks/useFeed";

export default function App() {
  const tabs = ["Tous", "Toulouse", "Formule 1", "Moto GP"];
  const [activeTab, setActiveTab] = useState("Tous"); // ← ici

  const { events } = useFeed(activeTab);

  return (
    <>
      <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main style={{ padding: "1rem" }}>
        <h1>Matchs – {activeTab}</h1>
        <MatchList events={events} />
      </main>
    </>
  );
}
