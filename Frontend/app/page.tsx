export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>
        UPSC Answer Evaluator
      </h1>
      <p>Prototype frontend deployed from iPad.</p>
    </main>
  );
}