'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'TN') {
        localStorage.setItem('loggedIn', 'true');  // <-- เพิ่มตรงนี้
        setSuccess(true);
        setError('');
        router.push('/Manages');
        } else {
        setError('รหัสผ่านไม่ถูกต้อง');
        setSuccess(false);
        }
    };

    return (
        <div className="login-container">
        <div className="login-box">
            <h2 className="login-title">เข้าสู่ระบบ</h2>
            <form onSubmit={handleSubmit} className="login-form">
            <div className="password-wrapper">
                <label htmlFor="password" className="login-label">
                รหัสผ่าน
                </label>
                <div className="input-with-icon">
                <input
                    id="password"
                    type={showPassword ? 'text' : 'password'} // ✅ แสดงหรือซ่อนรหัส
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input"
                    required
                />
                <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                >
                    {showPassword ? '🙈' : '👁️'} {/* คุณสามารถแทนด้วย SVG ก็ได้ */}
                </button>
                </div>
            </div>
            {error && <p className="login-error">{error}</p>}
            {success && <p className="login-success">เข้าสู่ระบบสำเร็จ!</p>}
            <button type="submit" className="login-button">
                ยืนยัน
            </button>
            </form>
        </div>
        </div>
    );
};

export default LoginPage;
