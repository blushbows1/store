let usernameRef = document.getElementById("username");
let emailRef = document.getElementById("email");
let passwordRef = document.getElementById("password");
let confirmPasswordRef = document.getElementById("confirm-password");
let eyeL = document.querySelector(".eyeball-l");
let eyeR = document.querySelector(".eyeball-r");
let handL = document.querySelector(".hand-l");
let handR = document.querySelector(".hand-r");
let container = document.querySelector(".container");
let formTitle = document.getElementById("form-title");
let submitBtn = document.getElementById("submit-btn");
let toggleText = document.getElementById("toggle-text");

let normalEyeStyle = () => {
    eyeL.style.cssText = "left: 0.6em; top: 0.6em;";
    eyeR.style.cssText = "right: 0.6em; top: 0.6em;";
};

let normalHandStyle = () => {
    handL.style.cssText =
        "height: 2.81em; top: 8.4em; left: 7.5em; transform: rotate(0deg);";
    handR.style.cssText =
        "height: 2.81em; top: 8.4em; right: 7.5em; transform: rotate(0deg);";
};

// When clicked on username input
usernameRef.addEventListener("focus", () => {
    eyeL.style.cssText = "left: 0.75em; top: 1.12em;";
    eyeR.style.cssText = "right: 0.75em; top: 1.12em;";
    normalHandStyle();
});

// When clicked on email input
emailRef.addEventListener("focus", () => {
    eyeL.style.cssText = "left: 0.75em; top: 1.12em;";
    eyeR.style.cssText = "right: 0.75em; top: 1.12em;";
    normalHandStyle();
});

// When clicked on password input
passwordRef.addEventListener("focus", () => {
    handL.style.cssText =
        "height: 6.56em; top: 3.87em; left: 11.75em; transform: rotate(-155deg);";
    handR.style.cssText =
        "height: 6.56em; top: 3.87em; right: 11.75em; transform: rotate(155deg);";
    normalEyeStyle();
});

// When clicked on confirm password input
confirmPasswordRef.addEventListener("focus", () => {
    handL.style.cssText =
        "height: 6.56em; top: 3.87em; left: 11.75em; transform: rotate(-155deg);";
    handR.style.cssText =
        "height: 6.56em; top: 3.87em; right: 11.75em; transform: rotate(155deg);";
    normalEyeStyle();
});

// When clicked outside username, email, password, and confirm password inputs
document.addEventListener("click", (e) => {
    let clickedElem = e.target;
    if (
        clickedElem != usernameRef &&
        clickedElem != emailRef &&
        clickedElem != passwordRef &&
        clickedElem != confirmPasswordRef
    ) {
        normalEyeStyle();
        normalHandStyle();
    }
});

// Handle Login / Sign Up Toggle
document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "toggle-link") {
        e.preventDefault();
        container.classList.toggle("signup-mode");
        let isSignup = container.classList.contains("signup-mode");

        if (isSignup) {
            formTitle.innerText = "Register";
            submitBtn.innerText = "Sign Up";
            emailRef.setAttribute("required", "");
            confirmPasswordRef.setAttribute("required", "");
            toggleText.innerHTML = 'Already have an account? <a href="#" id="toggle-link">Login</a>';
        } else {
            formTitle.innerText = "Login";
            submitBtn.innerText = "Login";
            emailRef.removeAttribute("required");
            confirmPasswordRef.removeAttribute("required");
            toggleText.innerHTML = 'Don\'t have an account? <a href="#" id="toggle-link">Sign Up</a>';
        }
    }
});

// Handle form submission and mock log in state
const form = document.querySelector("form");
form.addEventListener("submit", (e) => {
    e.preventDefault();
    let isSignup = container.classList.contains("signup-mode");
    let username = usernameRef.value.trim();
    
    if (isSignup) {
        let password = passwordRef.value;
        let confirmPassword = confirmPasswordRef.value;
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        alert(`Welcome, ${username}! Your account has been registered successfully.`);
    } else {
        alert(`Logged in successfully as ${username}!`);
    }
    
    // Save state and redirect to store home
    localStorage.setItem("blush_username", username);
    window.location.href = "../main.html";
});

// Check URL mode on page load to set correct form layout
function checkURLMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get("mode");
    if (mode === "signup") {
        container.classList.add("signup-mode");
        formTitle.innerText = "Register";
        submitBtn.innerText = "Sign Up";
        emailRef.setAttribute("required", "");
        confirmPasswordRef.setAttribute("required", "");
        toggleText.innerHTML = 'Already have an account? <a href="#" id="toggle-link">Login</a>';
    }
}
checkURLMode();