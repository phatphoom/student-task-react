// app/room-announcement/page.tsx
"use client";
import Link from "next/link";
import "./RoomAnnouncement.css"
import "../reports.css";

const announcements = [
  { date: "10.06.2025", subject: "Annoucement 11111" },
  { date: "09.06.2025", subject: "Annoucement abjbjbjdkdkdk" },
  { date: "08.06.2025", subject: "ddxxkxkxkkskskskdsfdsf" },
];

export default function RoomAnnouncementPage() {
  return (
    <main className="container">
      <div className="p-4">
        <div className="group-button-and-text">
          <div>
            <h1 className="title">
              Program SK149CNS - ฉันรักการบ้านที่ซู้ด V1.0 Build20250611
            </h1>
            <h2 className="title">Class Room EP105</h2>
          </div>
          <div className="top-right-button">

            <Link href="/room-announcement" className="nav-btn3">
                Room Announcement
            </Link>
            <Link href="/Logins" className="nav-btn">
                Manage Due
            </Link>
            <Link href="/" className="nav-btn2">
                Work on Due Report
            </Link>

          </div>
        </div>
      </div>

      <h3 className="section-title">Room Announcement</h3>
      <div className="table-container">
        <table className="announcement-table">
          <thead>
            <tr>
              <th>Announcement</th>
              <th>Subject</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((a, idx) => (
              <tr key={idx}>
                <td>{a.date}</td>
                <td className="subject-link">{a.subject}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link href="/room-announcement/add" className="add-button">+Add</Link>
    </main>
  );
}
