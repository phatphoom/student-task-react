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
            router.push('/Manages');
        } catch (err) {
            setError('เกิดข้อผิดพลาด');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2 className="login-title">เข้าสู่ระบบ</h2>
                <form
                    onSubmit={handleSubmit}
                    className="login-form"
                >
                    <div className="password-wrapper">
                        <label
                            htmlFor="password"
                            className="login-label"
                        >
                            รหัสผ่าน
                        </label>
                        <div className="input-with-icon">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'} // ✅ แสดงหรือซ่อนรหัส
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="login-input"
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? '🙈' : '👁️'}{' '}
                                {/* คุณสามารถแทนด้วย SVG ก็ได้ */}
                            </button>
                        </div>
                    </div>
                    {error && <p className="login-error">{error}</p>}
                    {success && (
                        <p className="login-success">เข้าสู่ระบบสำเร็จ!</p>
                    )}
                    <button
                        type="submit"
                        className="login-button"
                    >
                        ยืนยัน
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
