/* ================= ICON REDIRECT ================= */

const loginIcon = document.getElementById("loginIcon");

if (loginIcon) {
    loginIcon.addEventListener("click", function () {
        window.location.href = "../components/login.html";
    });
}


/* ================= FORM REFERENCES ================= */

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const goRegister = document.getElementById("goRegister");
const goLogin = document.getElementById("goLogin");


/* ================= TOGGLE FORMS ================= */

if (goRegister) {
    goRegister.addEventListener("click", () => {
        loginForm.style.display = "none";
        registerForm.style.display = "block";
    });
}

if (goLogin) {
    goLogin.addEventListener("click", () => {
        registerForm.style.display = "none";
        loginForm.style.display = "block";
    });
}


/* ================= REGISTER ================= */

if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;

        const error = document.getElementById("registerError");
        const successMsg = document.getElementById("registerSuccess");

        error.textContent = "";
        successMsg.textContent = "";

        try {

            const response = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok) {

                successMsg.textContent = "Registration Successful!✅ ";
                successMsg.style.color = "green";

                registerForm.reset();

                setTimeout(() => {

                    successMsg.textContent = "";

                    registerForm.style.display = "none";
                    loginForm.style.display = "block";

                }, 2000);

            } else {

                error.textContent = data.message || "❌ Registration failed!";
                error.style.color = "red";

            }

        } catch (err) {

            error.textContent = "❌ Server error. Please try again.";
            error.style.color = "red";

        }

    });
}


/* ================= LOGIN ================= */

if (loginForm) {

    loginForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        const errorMsg = document.getElementById("loginError");
        const successMsg = document.getElementById("loginSuccess");

        errorMsg.textContent = "";
        successMsg.textContent = "";

        try {

            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                console.log("login data", data)
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("moonUser", JSON.stringify(data.user));
                localStorage.setItem("token", data.token);
                successMsg.textContent = "Login Successful! Redirecting ✅ ...";
                successMsg.style.color = "green";

                setTimeout(() => {

                    const user = data.user;

                    console.log("Logged in user:", user);

                    // 🔥 ROLE BASED REDIRECT
                    if (user && user.role === "admin") {
                        window.location.href = "admin/dashboard.html";
                    } else {
                        window.location.href = "home.html";
                    }

                }, 1500);

            } else {

                errorMsg.textContent = data.message || "❌ Invalid email or password!";
                errorMsg.style.color = "red";

            }

        } catch (err) {

            errorMsg.textContent = "❌ Server error. Please try again.";
            errorMsg.style.color = "red";

        }

    });

}


/* ================= NAVBAR PROFILE ================= */

const profileImg = document.getElementById("profileImg");
const dropdownMenu = document.getElementById("dropdownMenu");
const logoutBtn = document.getElementById("logoutBtn");

const user = JSON.parse(localStorage.getItem("moonUser"));
console.log("user:", user)
const isLoggedIn = localStorage.getItem("isLoggedIn");


if (isLoggedIn === "true" && user) {

    if (loginIcon) {
        loginIcon.style.display = "none";
    }

    if (profileImg) {
        profileImg.style.display = "block";

        if (user.avatar) {
            profileImg.src = user.avatar;
        } else {
            profileImg.src = "../assets/login/profile.jpg";
        }
    }

}

/* ================= DROPDOWN ================= */

if (profileImg && dropdownMenu) {

    profileImg.addEventListener("click", function () {

        dropdownMenu.classList.toggle("show");

    });

}

/* CLOSE WHEN CLICK OUTSIDE */

document.addEventListener("click", function (e) {

    if (!e.target.closest(".user-menu")) {
        dropdownMenu.classList.remove("show");
    }

});
/* ================= LOGOUT ================= */

if (logoutBtn) {

    logoutBtn.addEventListener("click", function () {

        localStorage.removeItem("moonUser");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("token");

        alert("Logged out successfully");

        window.location.href = "login.html";

    });

}

document.addEventListener("DOMContentLoaded", async () => {

    const loginIcon = document.getElementById("loginIcon");
    const profileImg = document.getElementById("profileImg");

    const token = localStorage.getItem("token");

    if (!token) return;

    try {
        const response = await fetch("http://localhost:5000/api/auth/profile", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {

            const user = data.user;

            // 🔥 update localStorage (IMPORTANT)
            localStorage.setItem("moonUser", JSON.stringify(user));

            if (loginIcon) loginIcon.style.display = "none";

            if (profileImg) {
                profileImg.style.display = "block";

                // 🔥 cache fix
                profileImg.src = user.avatar
                    ? user.avatar + "?t=" + new Date().getTime()
                    : "../assets/login/profile.jpg";
            }
        }

    } catch (err) {
        console.log("Profile load error:", err);
    }

});