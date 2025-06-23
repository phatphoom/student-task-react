"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import "./RoomAnnouncement.css";

type Announcement = {
  id: string;
  date: string;
  subject: string;
  details: string;
  fileUrl?: string;
};

export default function RoomAnnouncementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-GB');
    } catch {
      return dateString;
    }
  };

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements`);
      const data = await res.json();
      
      const formatted = data.map((item: any) => ({
        id: item.announcement_id.toString(),
        date: formatDate(item.announcement_date),
        subject: item.subject,
        details: item.details,
        fileUrl: item.fileUrl
      }));
      
      setAnnouncements(formatted);
    } catch (err) {
      console.error("Fetch error:", err);
      setAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const addAnnouncement = async (newAnnouncement: Omit<Announcement, "id">) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          announcement_date: new Date(newAnnouncement.date).toISOString(),
          subject: newAnnouncement.subject,
          details: newAnnouncement.details,
        }),
      });

      if (!res.ok) throw new Error("API Error");
      await fetchAnnouncements();
    } catch (err) {
      console.error("Failed to add announcement", err);
      alert("Failed to save announcement");
    }
  };

  return (
    <main className="container">
      <div className="p-4-2">
        <div className="group-button-and-text">
          <div>
            <h1 className="title">Program SK149CNS - ฉันรักการบ้านที่ซู้ด V1.0 Build20250611</h1>
            <h2 className="title">Class Room EP105</h2>
          </div>
          <div className="top-right-button">
            <Link href="/room-announcement" className="nav-btn3">Room Announcement</Link>
            <Link href="/Logins" className="nav-btn">Manage Due</Link>
            <Link href="/" className="nav-btn2">Work on Due Report</Link>
          </div>
        </div>
      </div>

      <button onClick={() => setIsModalOpen(true)} className="add-button">
        Add
      </button>

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
            {isLoading ? (
              <tr>
                <td colSpan={2}>Loading announcements...</td>
              </tr>
            ) : announcements.length > 0 ? (
              announcements.map((a) => (
                <tr key={a.id || `${a.date}-${a.subject}-${Math.random().toString(36).substring(2, 9)}`}>
                  <td>{a.date}</td>
                  <td 
                    className="subject-link" 
                    onClick={() => setSelectedAnnouncement(a)}
                  >
                    {a.subject}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2}>No announcements found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Details Popup */}
      <DetailsPopup 
        announcement={selectedAnnouncement} 
        onClose={() => setSelectedAnnouncement(null)} 
      />

      {/* Add Announcement Modal */}
      {isModalOpen && (
        <AddAnnouncementModal
          onClose={() => setIsModalOpen(false)}
          onSave={addAnnouncement}
        />
      )}
    </main>
  );
}

function DetailsPopup({
  announcement,
  onClose,
}: {
  announcement: Announcement | null;
  onClose: () => void;
}) {
  if (!announcement) return null;

  return (
    <div className={`details-modal ${announcement ? 'active' : ''}`}>
      <div className="details-content">
        <div className="details-header">
          <div>
            <h2 className="details-title">{announcement.subject}</h2>
            <p className="details-date">Posted on: {announcement.date}</p>
          </div>
          <button className="details-close-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
        <div className="details-body">
          {announcement.details}
          {announcement.fileUrl && (
            <a 
              href={announcement.fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="file-download"
            >
              <svg className="file-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                <path fill="currentColor" d="M8,15V12H10V15H12L9,18L6,15H8Z" />
              </svg>
              Download Attachment
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function AddAnnouncementModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (announcement: Omit<Announcement, "id">) => void;
}) {
  const [date, setDate] = useState("");
  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave({
        date,
        subject: topic,
        details,
      });
      onClose();
    } catch (error) {
      console.error("Error saving announcement:", error);
      alert("Failed to save announcement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
    <div className="modal-content">
      <div className="form-header">
        <div>
          <h1 className="title">Program SK149CNS - ฉันรักการบ้านที่ชู้ด V1.0 Build20250611</h1>
          <h2 className="title">Class Room EP105</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="announcement-form">
      <div className="form-row">
            <label>Announcement Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label>Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </div>
          <div className="form-buttons">
            <button 
              type="button" 
              className="btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-save" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}