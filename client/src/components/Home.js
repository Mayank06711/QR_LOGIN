import React from "react";


const Home = () => {
    const userId = localStorage.getItem('userId');
    if(!userId) return;
    return (
        <div>
            <h1>Welcome to Qr-Scan PlatForm</h1>
            <p>This is a platform for connecting and collaborating on various projects. Sign up or log in to get started.</p>
        </div>
    );
}

export default Home;