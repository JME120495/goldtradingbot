const fs = require('fs');
const path = require('path');

const newKeys = {
  en: {
    "Auth": {
      "login_title": "Welcome Back",
      "login_subtitle": "Sign in to access your MT5 licenses",
      "email": "Email Address",
      "password": "Password",
      "signin": "Sign in",
      "no_account": "Don't have an account?",
      "create_account": "Create one",
      "register_title": "Create Account",
      "register_subtitle": "Start your gold trading journey",
      "name": "Full Name",
      "register": "Register",
      "has_account": "Already have an account?"
    }
  },
  fr: {
    "Auth": {
      "login_title": "Bon retour",
      "login_subtitle": "Connectez-vous pour accéder à vos licences MT5",
      "email": "Adresse Email",
      "password": "Mot de passe",
      "signin": "Se connecter",
      "no_account": "Pas encore de compte ?",
      "create_account": "Créer un compte",
      "register_title": "Créer un compte",
      "register_subtitle": "Démarrez votre aventure de trading",
      "name": "Nom Complet",
      "register": "S'inscrire",
      "has_account": "Déjà un compte ?"
    }
  },
  es: {
    "Auth": {
      "login_title": "Bienvenido de nuevo",
      "login_subtitle": "Inicie sesión para acceder a sus licencias MT5",
      "email": "Correo electrónico",
      "password": "Contraseña",
      "signin": "Iniciar sesión",
      "no_account": "¿No tiene una cuenta?",
      "create_account": "Crear una",
      "register_title": "Crear cuenta",
      "register_subtitle": "Inicie su viaje de trading",
      "name": "Nombre completo",
      "register": "Registrarse",
      "has_account": "¿Ya tiene una cuenta?"
    }
  },
  pt: {
    "Auth": {
      "login_title": "Bem-vindo de volta",
      "login_subtitle": "Faça login para acessar suas licenças MT5",
      "email": "Endereço de E-mail",
      "password": "Senha",
      "signin": "Entrar",
      "no_account": "Não tem uma conta?",
      "create_account": "Criar uma",
      "register_title": "Criar conta",
      "register_subtitle": "Comece sua jornada de trading",
      "name": "Nome Completo",
      "register": "Registrar-se",
      "has_account": "Já tem uma conta?"
    }
  },
  ar: {
    "Auth": {
      "login_title": "مرحباً بعودتك",
      "login_subtitle": "سجل الدخول للوصول إلى تراخيص MT5",
      "email": "البريد الإلكتروني",
      "password": "كلمة المرور",
      "signin": "تسجيل الدخول",
      "no_account": "ليس لديك حساب؟",
      "create_account": "إنشاء حساب",
      "register_title": "إنشاء حساب",
      "register_subtitle": "ابدأ رحلتك في تداول الذهب",
      "name": "الاسم الكامل",
      "register": "تسجيل",
      "has_account": "لديك حساب بالفعل؟"
    }
  }
};

const langs = ['en', 'fr', 'es', 'pt', 'ar'];
for (const lang of langs) {
  const file = path.join(__dirname, '..', 'messages', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data['Auth'] = newKeys[lang]['Auth'];
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
console.log("Auth translation keys added.");
