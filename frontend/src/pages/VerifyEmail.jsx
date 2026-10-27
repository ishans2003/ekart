import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userApi } from "@/lib/api";

const VerifyEmail = () => {
    const {token} = useParams();
    const [status, setStatus] = useState("Verifying...");
    const navigate = useNavigate();

    useEffect(() => {
        let isActive = true;
        let redirectTimer;
        const confirmEmail = async () => {
            try {
                const response = await userApi.post("/verify", {}, { headers: { Authorization: `Bearer ${token}` } });
                if (!isActive) return;
                if (response.data.success) {
                    setStatus("Email verified successfully! You can now log in.");
                    redirectTimer = setTimeout(() => navigate("/login"), 3000);
                } else {
                    setStatus(response.data.message || "Email verification failed. Please request a new verification email.");
                }
            } catch (error) {
                if (!isActive) return;
                console.error("Email verification failed:", error.response?.data?.message || error.message);
                setStatus(error.response?.data?.message || "Email verification failed. Please request a new verification email.");
            }
        };
        confirmEmail();
        return () => {
            isActive = false;
            clearTimeout(redirectTimer);
        };
    }, [token, navigate]);

  return (
    <div className='relative w-full min-h-screen overflow-hidden bg-pink-100'>
        <div className='min-h-screen flex items-center justify-center'>
            <div className='bg-white p-6 rounded-2xl shadow-md text-center w-[90%] max-w-md'>
                <h2 className='text-xl font-semibold text-gray-800'>{status}</h2>
            </div>
        </div>
    </div>
  )
}

export default VerifyEmail
