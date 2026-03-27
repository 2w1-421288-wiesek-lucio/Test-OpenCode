import Game from "@/components/Game";

export default function GamePage() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1a1a2e",
      }}
    >
      <Game />
    </div>
  );
}
