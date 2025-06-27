'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

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
    const [selectedAnnouncement, setSelectedAnnouncement] =
        useState<Announcement | null>(null);

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
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/announcements`,
            );
            const data = await res.json();

            const formatted = data.map((item: any) => ({
                id: item.announcement_id.toString(),
                date: formatDate(item.announcement_date),
                subject: item.subject,
                details: item.details,
                fileUrl: item.fileUrl,
            }));

            setAnnouncements(formatted);
        } catch (err) {
            console.error('Fetch error:', err);
            setAnnouncements([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const addAnnouncement = async (
        newAnnouncement: Omit<Announcement, 'id'>,
    ) => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/announcements`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        announcement_date: new Date(
                            newAnnouncement.date,
                        ).toISOString(),
                        subject: newAnnouncement.subject,
                        details: newAnnouncement.details,
                    }),
                },
            );

            if (!res.ok) throw new Error('API Error');
            await fetchAnnouncements();
        } catch (err) {
            console.error('Failed to add announcement', err);
            alert('Failed to save announcement');
        }
    };

    return (
        <main className="font-kanit min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="px-8 py-6">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-6 rounded-xl bg-blue-50 p-6">
                    <div className="max-w-full flex-1">
                        <h1 className="m-0 text-2xl font-bold text-slate-800">
                            Program SK149CNS - ฉันรักการบ้านที่ซู้ด V1.0
                            Build20250611
                        </h1>
                        <h2 className="m-2 mt-3 text-xl text-gray-800">
                            Class Room EP105
                        </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-6">
                        <Link
                            href="/room-announcement"
                            className="rounded-full bg-white px-6 py-3 text-base font-bold text-black transition duration-200 hover:bg-blue-100 hover:shadow-md"
                        >
                            <span className="text-base font-bold whitespace-nowrap text-blue-600">
                                Room Announcement
                            </span>
                        </Link>
                        <Link
                            href="/Manages"
                            className="rounded-md bg-pink-200 px-6 py-3 text-base font-bold text-black transition duration-200 hover:bg-pink-300 hover:shadow-md"
                        >
                            Manage Due
                        </Link>
                        <Link
                            href="/"
                            className="rounded-md bg-blue-200 px-6 py-3 text-base font-bold text-black transition duration-200 hover:bg-blue-300 hover:shadow-md"
                        >
                            Work on Due Report
                        </Link>
                        <Link
                            href="/my-student-plan"
                            className="rounded-md bg-emerald-200 px-6 py-3 text-base font-bold text-black transition duration-200 hover:bg-emerald-300 hover:shadow-md"
                        >
                            My Study plan
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-8 pb-8">
                {/* Add Button and Title Section */}
                <div className="mb-8 flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-blue-800">
                        Room Announcement
                    </h3>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-3 rounded-lg bg-green-500 px-5 py-2.5 text-white transition hover:bg-green-600 hover:shadow-md"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Add Announcement
                    </button>
                </div>

                {/* Announcements Table */}
                <div className="overflow-hidden rounded-xl bg-white shadow-lg">
                    <table className="w-full">
                        <thead className="bg-blue-700 text-white">
                            <tr>
                                <th className="px-8 py-4 text-left font-semibold">
                                    Announcement
                                </th>
                                <th className="px-8 py-4 text-left font-semibold">
                                    Subject
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={2}
                                        className="px-6 py-4 text-center"
                                    >
                                        <div className="flex justify-center">
                                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : announcements.length > 0 ? (
                                announcements.map(a => (
                                    <tr
                                        key={a.id || `${a.date}-${a.subject}`}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-8 py-4">{a.date}</td>
                                        <td
                                            className="cursor-pointer px-8 py-4 font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                            onClick={() =>
                                                setSelectedAnnouncement(a)
                                            }
                                        >
                                            {a.subject}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={2}
                                        className="px-6 py-4 text-center text-gray-500"
                                    >
                                        No announcements found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Popup */}
            {selectedAnnouncement && (
                <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                    <div className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-2xl">
                        <div className="mb-6 flex items-start justify-between border-b pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-blue-800">
                                    {selectedAnnouncement.subject}
                                </h2>
                                <p className="mt-2 text-gray-600">
                                    Posted on: {selectedAnnouncement.date}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedAnnouncement(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                        <div className="mb-6 whitespace-pre-line text-gray-800">
                            {selectedAnnouncement.details}
                        </div>
                        {selectedAnnouncement.fileUrl && (
                            <div className="mt-6">
                                <a
                                    href={selectedAnnouncement.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Download Attachment
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add Announcement Modal */}
            {isModalOpen && (
                <div className="bg-opacity-30 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
                        <div className="mb-8 border-b pb-4">
                            <h2 className="text-xl font-bold text-gray-800">
                                Add New Announcement
                            </h2>
                            <p className="mt-2 text-gray-600">
                                Class Room EP105
                            </p>
                        </div>
                        <form
                            onSubmit={e => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                addAnnouncement({
                                    date: formData.get('date') as string,
                                    subject: formData.get('subject') as string,
                                    details: formData.get('details') as string,
                                });
                                setIsModalOpen(false);
                            }}
                        >
                            <div className="space-y-6">
                                <div>
                                    <label className="mb-2 block font-medium text-gray-700">
                                        Announcement Date
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block font-medium text-gray-700">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        name="subject"
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block font-medium text-gray-700">
                                        Details
                                    </label>
                                    <textarea
                                        name="details"
                                        rows={5}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    ></textarea>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-lg bg-gray-200 px-5 py-2.5 font-medium text-gray-800 hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-lg bg-green-500 px-5 py-2.5 font-medium text-white hover:bg-green-600"
                                >
                                    Save Announcement
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
