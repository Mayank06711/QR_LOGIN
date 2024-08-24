import React, { useState } from "react";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleSignup = async (event) => {
    event.preventDefault();

    const response = await fetch("http://localhost:5000/signUp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password, fullName }),
    });

    if (response.ok) {
      alert("Signup successful! Please login.");
      window.location.href = "/login";
    } else {
      const result = await response.json();
      alert(result.msg);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSignup} className="signup-form">
        <h2>Signup</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <button type="submit">Signup</button>
      </form>
    </div>
  );
};

export default Signup;
