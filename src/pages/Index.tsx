
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AuthPage from "../components/auth/AuthPage";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/games");
    }
  }, [user, navigate]);

  return <AuthPage />;
};

export default Index;
