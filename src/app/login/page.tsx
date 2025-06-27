'use client'; 

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/login`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ hintword: password }),
                },
            );

            if (!res.ok) {
                setError('รหัสผ่านไม่ถูกต้อง');
                return;
            }

            const data = await res.json();
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('adminId', data.id); // <-- เก็บ id ไว้
            localStorage.setItem('adminName', data.username);
            setSuccess(true);
            setError('');
            router.push('/manage');
        } catch (err) {
            setError('เกิดข้อผิดพลาด');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-xl rounded-3xl p-10 w-full max-w-sm text-center">
                <h2 className="text-2xl font-bold text-blue-600 mb-8">เข้าสู่ระบบ</h2>
                <form onSubmit={handleSubmit} className="text-left space-y-6">
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    รหัสผ่าน
                    </label>
                    <div className="relative mt-2">
                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500"
                        aria-label="Toggle password visibility"
                    >
                        {showPassword ? "🙈" : "👁️"}
                    </button>
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-600 text-sm">เข้าสู่ระบบสำเร็จ!</p>}

                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition duration-200"
                >
                    ยืนยัน
                </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
