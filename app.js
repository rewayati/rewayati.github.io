// روايتي - التطبيق الرئيسي v2

// ==================== Firebase Configuration ====================
const firebaseConfig = {
    apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "rewayati.firebaseapp.com",
    projectId: "rewayati",
    storageBucket: "rewayati.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
let firebaseApp = null;
let auth = null;
let db = null;

// ==================== Service Worker Registration ====================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed:', err));
    });
}

// ==================== Navigation ====================
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

function scrollToFeatures() {
    const el = document.getElementById('features');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ==================== Authentication Modal ====================
function showAuth() {
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'block';
}

function closeAuth() {
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'none';
}

function switchTab(tab) {
    const tabs = document.querySelectorAll('.tab-btn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'login') {
        if (tabs[0]) tabs[0].classList.add('active');
        if (loginForm) loginForm.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
    } else {
        if (tabs[1]) tabs[1].classList.add('active');
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'block';
    }
}

// ==================== Firebase Auth Functions ====================
async function initializeFirebase() {
    if (!firebaseApp) {
        try {
            const firebaseScript = document.createElement('script');
            firebaseScript.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js';
            document.head.appendChild(firebaseScript);
            
            const authScript = document.createElement('script');
            authScript.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js';
            document.head.appendChild(authScript);
            
            const firestoreScript = document.createElement('script');
            firestoreScript.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js';
            document.head.appendChild(firestoreScript);
            
            await new Promise(resolve => {
                firestoreScript.onload = resolve;
            });
            
            firebaseApp = firebase.initializeApp(firebaseConfig);
            auth = firebase.auth();
            db = firebase.firestore();
            
            console.log('Firebase initialized successfully');
        } catch (error) {
            console.error('Firebase initialization error:', error);
            alert('حدث خطأ في تحميل التطبيق. يرجى تحديث الصفحة.');
        }
    }
}

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        alert('يرجى إدخال البريد الإلكتروني وكلمة السر');
        return;
    }
    
    try {
        await initializeFirebase();
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('Logged in:', userCredential.user);
        closeAuth();
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('Login error:', error);
        alert('خطأ في تسجيل الدخول: ' + error.message);
    }
}

async function register() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!email || !password || !confirmPassword) {
        alert('يرجى ملء جميع الحقول');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('كلمتا السر غير متطابقتين');
        return;
    }
    
    if (password.length < 6) {
        alert('كلمة السر يجب أن تكون 6 أحرف على الأقل');
        return;
    }
    
    try {
        await initializeFirebase();
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        console.log('Registered:', userCredential.user);
        closeAuth();
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('Registration error:', error);
        alert('خطأ في إنشاء الحساب: ' + error.message);
    }
}

async function loginWithGoogle() {
    try {
        await initializeFirebase();
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        console.log('Google login:', result.user);
        closeAuth();
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('Google login error:', error);
        alert('خطأ في الدخول بحساب جوجل: ' + error.message);
    }
}

// ==================== Close Modal on Outside Click ====================
window.onclick = function(event) {
    const modal = document.getElementById('authModal');
    if (event.target === modal) {
        closeAuth();
    }
}

// ==================== Initialize App ====================
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('userToken')) {
        console.log('User already logged in');
    }
});

// ==================== Export Functions ====================
window.showAuth = showAuth;
window.closeAuth = closeAuth;
window.switchTab = switchTab;
window.login = login;
window.register = register;
window.loginWithGoogle = loginWithGoogle;
window.scrollToFeatures = scrollToFeatures;