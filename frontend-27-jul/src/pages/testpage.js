import React from "react";
import Cursor from "./practice";

const ColorfulPage = () => {
  const colors = ["black", "white", "red", "blue", "yellow"];

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Cursor />
      <div style={{ display: "flex", height: "100%" }}>
        {colors.map((color, i) => (
          <div
            key={i}
            className="hover-this"
            style={{ flex: 1, background: color, position: "relative" }}
          >
            <div
              className="hover-anim"
              style={{ width: "100%", height: "100%" }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorfulPage;
