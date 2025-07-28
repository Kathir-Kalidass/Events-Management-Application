import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../../styles/AuthForm.css";

const ForgotPassword = () => {
  const { role } = useParams();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://10.5.12.1:4000/api/auth/forgot-password", { email, role });
      setMessage(res.data.message);
    } catch (err) {
      setMessage("Email not registered or server error.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{role.toUpperCase()} - Forgot Password</h2>
        <form onSubmit={handleSend}>
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send Password</button>
        </form>
        {message && <p style={{ marginTop: "10px", textAlign: "center", color: "green" }}>{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;
