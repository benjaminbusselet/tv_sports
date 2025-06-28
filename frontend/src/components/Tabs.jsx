export default function Tabs({ tabs, activeTab, setActiveTab }) {
  return (
    <nav style={{ background: "#f0f0f0", padding: "0.5rem 1rem" }}>
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          gap: "1rem",
        }}
      >
        {tabs.map((tab) => (
          <li
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              cursor: "pointer",
              fontWeight: activeTab === tab ? "bold" : "normal",
              borderBottom: activeTab === tab ? "2px solid #333" : "none",
            }}
          >
            {tab}
          </li>
        ))}
      </ul>
    </nav>
  );
}
