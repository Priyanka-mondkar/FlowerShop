document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("accountForm");
    const successMsg = document.getElementById("successMsg");

    const avatarInput = document.getElementById("avatarInput");
    const avatarPreview = document.getElementById("avatarPreview");

    const saveBtn = document.querySelector(".save-btn");

    /* ================= LOAD USER PROFILE ================= */

    loadProfile();

    async function loadProfile() {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch("http://localhost:5000/api/auth/profile", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {

                const user = data.user;

                document.getElementById("name").value = user.name || "";
                document.getElementById("email").value = user.email || "";
                document.getElementById("phone").value = user.phone || "";

                document.getElementById("flat").value = user.flat || "";
                document.getElementById("area").value = user.area || "";
                document.getElementById("city").value = user.city || "";
                document.getElementById("state").value = user.state || "";
                document.getElementById("pincode").value = user.pincode || "";

                avatarPreview.src = user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
            }

        } catch (error) {
            console.log("Error loading profile:", error);
        }
    }

    /* ================= AVATAR PREVIEW ================= */

    avatarInput.addEventListener("change", function () {
        const file = this.files[0];

        if (file) {

            // 🔥 size validation (2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert("Image size should be less than 2MB");
                avatarInput.value = "";
                return;
            }

            avatarPreview.src = URL.createObjectURL(file);
        }
    });

    /* ================= SAVE PROFILE ================= */

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        // 🔥 LOADING START
        saveBtn.innerText = "Saving...";
        saveBtn.disabled = true;
        successMsg.textContent = "";

        const formData = new FormData();

        formData.append("name", document.getElementById("name").value);
        formData.append("email", document.getElementById("email").value);
        formData.append("phone", document.getElementById("phone").value);

        formData.append("flat", document.getElementById("flat").value);
        formData.append("area", document.getElementById("area").value);
        formData.append("city", document.getElementById("city").value);
        formData.append("state", document.getElementById("state").value);
        formData.append("pincode", document.getElementById("pincode").value);

        const file = avatarInput.files[0];
        if (file) {
            formData.append("avatar", file);
        }

        try {
            const token = localStorage.getItem("token");

            const response = await fetch("http://localhost:5000/api/auth/profile", {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Upload failed");
            }

            // ✅ SUCCESS
            successMsg.innerHTML =
                "<i class='fa-solid fa-circle-check'></i> Changes saved successfully.";

            if (data.user.avatar) {
                avatarPreview.src = data.user.avatar;
            }

            localStorage.setItem("moonUser", JSON.stringify(data.user));

        } catch (error) {

            console.log("Error saving profile:", error);

            successMsg.innerHTML =
                "<i class='fa-solid fa-circle-xmark'></i> Upload failed. Try again.";

        } finally {

            // 🔥 LOADING END
            saveBtn.innerText = "Save Changes";
            saveBtn.disabled = false;

            setTimeout(() => {
                successMsg.textContent = "";
            }, 3000);
        }
    });

});


/* ================= BACK BUTTON ================= */

function goBack() {
    window.location.href = "home.html";
}