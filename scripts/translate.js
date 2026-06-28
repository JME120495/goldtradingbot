const fs = require('fs');
const path = require('path');

const newKeys = {
  en: {
    "Admin": {
      "dashboard": "Dashboard",
      "affiliates": "Affiliates",
      "licenses": "Licenses",
      "admin_panel": "Admin Panel",
      "back_to_client": "Back to Dashboard",
      "manage_affiliates": "Manage Affiliates",
      "affiliate_name": "Affiliate Name",
      "code": "Code",
      "total_earned": "Total Earned",
      "commission_rate": "Commission Rate",
      "actions": "Actions",
      "loading": "Loading...",
      "delete": "Delete",
      "confirm_delete_affiliate": "Are you sure you want to delete this affiliate?",
      "manage_licenses": "Manage Licenses (Remote Control)",
      "user": "User",
      "plan": "Plan",
      "lot_allowed": "Lot Limit",
      "status": "Status",
      "block": "Block",
      "unblock": "Unblock",
      "confirm_toggle": "Are you sure you want to switch status to"
    }
  },
  fr: {
    "Admin": {
      "dashboard": "Tableau de Bord",
      "affiliates": "Parrains",
      "licenses": "Licences (Robots)",
      "admin_panel": "Espace Administrateur",
      "back_to_client": "Retour à l'Espace Client",
      "manage_affiliates": "Gestion des Parrains",
      "affiliate_name": "Nom du Parrain",
      "code": "Code Promo",
      "total_earned": "Gains Totaux",
      "commission_rate": "Taux de Commission",
      "actions": "Actions",
      "loading": "Chargement...",
      "delete": "Supprimer",
      "confirm_delete_affiliate": "Êtes-vous sûr de vouloir supprimer ce parrain ?",
      "manage_licenses": "Contrôle des Licences à Distance",
      "user": "Utilisateur",
      "plan": "Plan",
      "lot_allowed": "Limite de Lot",
      "status": "Statut",
      "block": "Bloquer",
      "unblock": "Réactiver",
      "confirm_toggle": "Confirmer le passage au statut :"
    }
  },
  es: {
    "Admin": {
      "dashboard": "Panel de Control",
      "affiliates": "Afiliados",
      "licenses": "Licencias",
      "admin_panel": "Panel de Administración",
      "back_to_client": "Volver al Cliente",
      "manage_affiliates": "Gestionar Afiliados",
      "affiliate_name": "Nombre",
      "code": "Código",
      "total_earned": "Ganancias",
      "commission_rate": "Tasa de Comisión",
      "actions": "Acciones",
      "loading": "Cargando...",
      "delete": "Eliminar",
      "confirm_delete_affiliate": "¿Eliminar este afiliado?",
      "manage_licenses": "Control de Licencias Remoto",
      "user": "Usuario",
      "plan": "Plan",
      "lot_allowed": "Límite de Lote",
      "status": "Estado",
      "block": "Bloquear",
      "unblock": "Desbloquear",
      "confirm_toggle": "¿Cambiar estado a"
    }
  },
  pt: {
    "Admin": {
      "dashboard": "Painel",
      "affiliates": "Afiliados",
      "licenses": "Licenças",
      "admin_panel": "Painel de Administração",
      "back_to_client": "Voltar ao Cliente",
      "manage_affiliates": "Gerenciar Afiliados",
      "affiliate_name": "Nome",
      "code": "Código",
      "total_earned": "Ganhos",
      "commission_rate": "Taxa de Comissão",
      "actions": "Ações",
      "loading": "Carregando...",
      "delete": "Excluir",
      "confirm_delete_affiliate": "Excluir afiliado?",
      "manage_licenses": "Controle de Licenças Remoto",
      "user": "Usuário",
      "plan": "Plano",
      "lot_allowed": "Limite de Lote",
      "status": "Status",
      "block": "Bloquear",
      "unblock": "Desbloquear",
      "confirm_toggle": "Mudar status para"
    }
  },
  ar: {
    "Admin": {
      "dashboard": "لوحة القيادة",
      "affiliates": "الشركاء",
      "licenses": "التراخيص",
      "admin_panel": "لوحة الإدارة",
      "back_to_client": "العودة",
      "manage_affiliates": "إدارة الشركاء",
      "affiliate_name": "الاسم",
      "code": "الكود",
      "total_earned": "الأرباح",
      "commission_rate": "نسبة العمولة",
      "actions": "إجراءات",
      "loading": "جاري التحميل...",
      "delete": "حذف",
      "confirm_delete_affiliate": "هل أنت متأكد من الحذف؟",
      "manage_licenses": "إدارة التراخيص عن بعد",
      "user": "المستخدم",
      "plan": "الخطة",
      "lot_allowed": "حد العقد",
      "status": "الحالة",
      "block": "حظر",
      "unblock": "إلغاء الحظر",
      "confirm_toggle": "تأكيد التغيير إلى"
    }
  }
};

const langs = ['en', 'fr', 'es', 'pt', 'ar'];
for (const lang of langs) {
  const file = path.join(__dirname, '..', 'messages', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data['Admin'] = newKeys[lang]['Admin'];
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
console.log("Admin translation keys added to all JSON files.");
