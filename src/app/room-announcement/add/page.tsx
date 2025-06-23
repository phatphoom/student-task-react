// app/room-announcement/add/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../RoomAnnouncement.css";

export default function AddAnnouncementPage() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving:", { date, topic, details, file });
    router.push("/room-announcement");
  };

  const handleDiscard = () => {
    setDate("");
    setTopic("");
    setDetails("");
    setFile(null);
  };

  return (
    <main className="form-container">
      <div className="form-header">
        <div>
          <h1 className="title">Program SK149CNS - ฉันรักการบ้านที่ชู้ด V1.0 Build20250611</h1>
          <h2 className="title">Class Room EP105</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="announcement-form">
        <div className="form-row">
          <label>Annoucement Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="form-row">
          <label>Topic</label>
          <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} />
        </div>
        <div className="form-row">
          <label>Details</label>
          <textarea rows={8} value={details} onChange={(e) => setDetails(e.target.value)} />
        </div>
        <div className="form-row">
          <label>File Attachment</label>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div className="form-buttons">
          <button type="button" className="btn-discard" onClick={handleDiscard}>Discard</button>
          <button type="submit" className="btn-save">Save</button>
        </div>
      </form>
    </main>
  );
}