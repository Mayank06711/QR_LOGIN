import React, { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState("")
 
  const handleLogin = async (event) => {
    event.preventDefault();

   try {
     const response = await fetch("https://localhost:5000/login", {
       method: "POST",
       credentials:"include",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify({ email, password }),
         // Add the following to ignore SSL errors (Development only)
       mode: 'cors',
       rejectUnauthorized: false
     });
 
     if (response.ok) {
       const data = await response.json();
       console.log(data.userId, "\n data")
       // userId = response.
       sessionStorage.setItem('userId', data.userId);
       setSuccess(true)
       setName(data.name)
     } else {
       const result = await response.json();
       alert(result.msg, "error");
     }
   } catch (error) {
    console.log(error, "error");
   }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Login</h2>
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
        <button type="submit">Login</button>
      </form>
      {success && (
        <div className="qr-code">
          <h1>Hello Ji {name} Now you can scan the qr-code, to log in to other tab</h1>
          {/* <div id="qr-code-container" dangerouslySetInnerHTML={{ __html: qrCodeSVG }} /> */}
        </div>
      )}
    </div>
  );
};

export default Login;
