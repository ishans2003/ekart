import React from "react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link , useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeOff } from "lucide-react";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
// import { useAuth } from "@/context/AuthContext.jsx";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/userSlice";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const dispatch =useDispatch()
  // const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const submitHandler = async(e) => {
      e.preventDefault();
      setLoading(true);
      try{
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const res = await axios.post(`${apiUrl}/api/v1/user/login`, formData,{
          headers: {
            "Content-Type": "application/json",
          }
        })
        if(res.data.success){
          // login();
          navigate("/");
          dispatch(setUser(res.data.user))
          localStorage.setItem("accessToken", res.data.accessToken);
          localStorage.setItem("refreshToken", res.data.refreshToken);
          
          toast.success(res.data.message);
        } else {
          toast.error(res.data.message || "Login failed");
        }
      }catch(err){
        console.error("Login failed:", err);
        toast.error(err.response?.data?.message || err.message || "Login failed");
      } finally {
        setLoading(false);
      }
  }
  return (
    <div className="flex justify-center items-center min-h-screen bg-pink-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Log in to your account</CardTitle>
          <CardDescription>
            Enter your email and password to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
                {showPassword ? (
                  <EyeOff
                    className="w-5 h-5 absolute text-gray-700 right-5 bottom-2"
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <Eye
                    className="w-5 h-5 absolute text-gray-700 right-5 bottom-2"
                    onClick={() => setShowPassword(true)}
                  />
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button onClick={submitHandler} disabled={loading} className="w-full cursor-pointer bg-pink-500" >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Please wait...</> : "Log In"}
          </Button>
          <p className="text-gray-700 text-sm">Don&apos;t have an account? <Link to={"/signup"} className="text-pink-800 hover:underline cursor-pointer">
            Sign up
          </Link></p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
