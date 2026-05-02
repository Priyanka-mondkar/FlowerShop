const form = document.getElementById("contactForm");

form.addEventListener("submit", async function(e){

    e.preventDefault();

    const token = localStorage.getItem("token");

    const formData = new FormData(form);

    const data = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        message: formData.get("message")
    };

    try{

        const res = await fetch("http://localhost:5000/api/contact",{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer " + token
            },
            body:JSON.stringify(data)
        });

        const result = await res.json();

        alert(result.message);

        form.reset();

    }
    catch(err){
        console.log(err);
    }

});