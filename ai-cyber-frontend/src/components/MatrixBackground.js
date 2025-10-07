import React, { useEffect, useRef } from "react";

function MatrixBackground({ darkMode }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    const letters = "01#@$%&*ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array.from({ length: columns }).map(() => 1);

    function drawDark() {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00f7ff"; // neon blue
      ctx.font = `${fontSize}px monospace`;
      drops.forEach((y, i) => {
        const text = letters.charAt(Math.floor(Math.random() * letters.length));
        ctx.fillText(text, i * fontSize, y * fontSize);
        drops[i] = y * fontSize > canvas.height && Math.random() > 0.975 ? 0 : y + 1;
      });
    }

    function drawLight() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Light mode particle background
      const particles = 80;
      for (let i = 0; i < particles; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 2 + 1;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fill();
      }
    }

    const interval = setInterval(() => (darkMode ? drawDark() : drawLight()), 40);
    return () => clearInterval(interval);
  }, [darkMode]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -2,
        width: "100%",
        height: "100%",
        transition: "background 0.5s",
      }}
    />
  );
}

export default MatrixBackground;
