//app/Popups1/page.tsx
"use client";

import React, { useState } from "react";
import "./popup1.css";

export default function Popups1() {
  const [show, setShow] = useState(false);
  const [note, setNote] = useState("");

  return (
    <div>
      <button className="add-note-btn" onClick={() => setShow(true)}>
        + Add your Note
      </button>
      {show && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Add your Note</h2>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Enter your note here"
            />
            <div className="popup-actions">
              <button onClick={() => setShow(false)}>Cancel</button>
              <button onClick={() => {/* save note logic */ setShow(false);}}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
