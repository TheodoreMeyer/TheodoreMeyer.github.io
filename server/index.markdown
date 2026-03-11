---
layout: default
title: Server Portal
permalink: /server/
---

<h1>Server Portal</h1>

<div id="portal" class="portal">Authenticating...</div>

<script src="/server/js/auth.js"></script>

<script>
requireAuth(function(user){
    const portal = document.getElementById("portal");
    portal.innerHTML = `
    <div class="welcome-banner">
        <h2>Welcome, ${user.email}</h2>
        <p>Role: <strong>${user.role}</strong></p>
    </div>

    <div class="cards-container">
        <div class="card">
            <a href="/server/votes/">Votes</a>
        </div>
        <div class="card">
            <a href="/server/rules/">Rules</a>
        </div>
        <div class="card">
            <a href="/server/hall-of-fame/">Hall of Fame</a>
        </div>
        <div class="card">
            <a href="/server/gallery/">Gallery</a>
        </div>
        ${user.role === "Admin" ? `
        <div class="card admin-card">
            <a href="/server/votes/admin">Admin Panel</a>
        </div>` : ''}
    </div>
    `;
});
</script>

<style>
/* Container */
.portal {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

/* Welcome banner */
.welcome-banner {
    background: #007bff;
    color: #fff;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 10px;
    text-align: center;
}

.welcome-banner h2 {
    margin: 0 0 5px 0;
}

.welcome-banner p {
    margin: 0;
}

/* Cards container */
.cards-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
}

/* Individual card */
.card {
    background: #f9f9f9;
    padding: 20px;
    border-radius: 10px;
    width: 200px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    transition: transform 0.2s, box-shadow 0.2s;
}

.card a {
    text-decoration: none;
    color: #007bff;
    font-weight: bold;
    font-size: 1.1rem;
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 18px rgba(0,0,0,0.12);
}

/* Admin card */
.admin-card {
    background: #ffe8e8;
}

.admin-card a {
    color: #dc3545;
}
</style>