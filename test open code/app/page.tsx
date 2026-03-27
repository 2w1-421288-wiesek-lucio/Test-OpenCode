"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #87ceeb 0%, #e0f7fa 50%, #8bc34a 50%, #689f38 100%)",
      }}
    >
      <h1
        style={{
          fontSize: "72px",
          fontWeight: "bold",
          color: "white",
          textShadow: "4px 4px 8px rgba(0, 0, 0, 0.4)",
          marginBottom: "40px",
          letterSpacing: "2px",
        }}
      >
        Flappy Bird
      </h1>
      <Link href="/game">
        <button
          style={{
            padding: "20px 60px",
            fontSize: "28px",
            fontWeight: "bold",
            color: "white",
            background: "#4caf50",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            transition: "transform 0.2s, background 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#388e3c";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#4caf50";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          Jugar
        </button>
      </Link>
      <p
        style={{
          marginTop: "20px",
          fontSize: "16px",
          color: "rgba(0, 0, 0, 0.4)",
        }}
      >
        Presiona ESPACIO o haz click para volar
      </p>
    </div>
  );
}
