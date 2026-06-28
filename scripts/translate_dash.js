const fs = require('fs');
const path = require('path');

const newKeys = {
  en: {
    "Dashboard": {
      "overview": "Overview",
      "billing": "Billing",
      "accounts": "MT5 Accounts",
      "downloads": "Downloads",
      "affiliates": "Affiliates",
      "logout": "Logout",
      "welcome": "Welcome",
      "active_licenses": "Active Licenses",
      "no_licenses": "You don't have any active licenses.",
      "subscribe": "Subscribe to a Plan",
      "plan": "Plan",
      "max_lot": "Max Lot",
      "expires": "Expires",
      "status": "Status",
      "mt5_account": "MT5 Account",
      "manage": "Manage",
      "add_account": "Add Account",
      "download_ea": "Download EA",
      "your_affiliate_link": "Your Affiliate Link",
      "sales": "Total Sales",
      "commission": "Commission Earned",
      "become_partner": "Become a Partner"
    }
  },
  fr: {
    "Dashboard": {
      "overview": "Vue d'ensemble",
      "billing": "Facturation",
      "accounts": "Comptes MT5",
      "downloads": "Téléchargements",
      "affiliates": "Programme Partenaire",
      "logout": "Se déconnecter",
      "welcome": "Bienvenue",
      "active_licenses": "Licences Actives",
      "no_licenses": "Vous n'avez aucune licence active.",
      "subscribe": "Souscrire à un Plan",
      "plan": "Plan",
      "max_lot": "Lot Maximum",
      "expires": "Expire le",
      "status": "Statut",
      "mt5_account": "Compte MT5",
      "manage": "Gérer",
      "add_account": "Ajouter un Compte",
      "download_ea": "Télécharger l'EA",
      "your_affiliate_link": "Votre Lien d'Affiliation",
      "sales": "Ventes Totales",
      "commission": "Commissions Gagnées",
      "become_partner": "Devenir Partenaire"
    }
  },
  es: {
    "Dashboard": {
      "overview": "Resumen",
      "billing": "Facturación",
      "accounts": "Cuentas MT5",
      "downloads": "Descargas",
      "affiliates": "Afiliados",
      "logout": "Cerrar Sesión",
      "welcome": "Bienvenido",
      "active_licenses": "Licencias Activas",
      "no_licenses": "No tiene licencias activas.",
      "subscribe": "Suscribirse a un Plan",
      "plan": "Plan",
      "max_lot": "Lote Máximo",
      "expires": "Expira",
      "status": "Estado",
      "mt5_account": "Cuenta MT5",
      "manage": "Gestionar",
      "add_account": "Añadir Cuenta",
      "download_ea": "Descargar EA",
      "your_affiliate_link": "Su Enlace de Afiliado",
      "sales": "Ventas Totales",
      "commission": "Comisiones Ganadas",
      "become_partner": "Convertirse en Socio"
    }
  },
  pt: {
    "Dashboard": {
      "overview": "Visão Geral",
      "billing": "Faturamento",
      "accounts": "Contas MT5",
      "downloads": "Downloads",
      "affiliates": "Afiliados",
      "logout": "Sair",
      "welcome": "Bem-vindo",
      "active_licenses": "Licenças Ativas",
      "no_licenses": "Você não tem licenças ativas.",
      "subscribe": "Assinar um Plano",
      "plan": "Plano",
      "max_lot": "Lote Máximo",
      "expires": "Expira em",
      "status": "Status",
      "mt5_account": "Conta MT5",
      "manage": "Gerenciar",
      "add_account": "Adicionar Conta",
      "download_ea": "Baixar EA",
      "your_affiliate_link": "Seu Link de Afiliado",
      "sales": "Vendas Totais",
      "commission": "Comissões Ganhas",
      "become_partner": "Tornar-se Parceiro"
    }
  },
  ar: {
    "Dashboard": {
      "overview": "نظرة عامة",
      "billing": "الفواتير",
      "accounts": "حسابات MT5",
      "downloads": "التنزيلات",
      "affiliates": "برنامج الشركاء",
      "logout": "تسجيل الخروج",
      "welcome": "مرحباً",
      "active_licenses": "التراخيص النشطة",
      "no_licenses": "ليس لديك أي تراخيص نشطة.",
      "subscribe": "اشترك في خطة",
      "plan": "الخطة",
      "max_lot": "الحد الأقصى للعقد",
      "expires": "ينتهي في",
      "status": "الحالة",
      "mt5_account": "حساب MT5",
      "manage": "إدارة",
      "add_account": "إضافة حساب",
      "download_ea": "تنزيل EA",
      "your_affiliate_link": "رابط الإحالة الخاص بك",
      "sales": "إجمالي المبيعات",
      "commission": "العمولات المكتسبة",
      "become_partner": "كن شريكاً"
    }
  }
};

const langs = ['en', 'fr', 'es', 'pt', 'ar'];
for (const lang of langs) {
  const file = path.join(__dirname, '..', 'messages', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data['Dashboard'] = newKeys[lang]['Dashboard'];
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
console.log("Dashboard translation keys added.");
