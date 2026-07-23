const fs = require('fs');

const translations = {
  en: {
    Dashboard: {
      profile: "Profile",
      admin_panel: "Admin Panel"
    }
  },
  fr: {
    Dashboard: {
      profile: "Profil",
      admin_panel: "Panneau Admin"
    }
  },
  es: {
    Dashboard: {
      profile: "Perfil",
      admin_panel: "Panel de Admin"
    }
  },
  pt: {
    Dashboard: {
      profile: "Perfil",
      admin_panel: "Painel de Admin"
    }
  },
  ar: {
    Dashboard: {
      profile: "الملف الشخصي",
      admin_panel: "لوحة الإدارة"
    }
  }
};

for (const [lang, obj] of Object.entries(translations)) {
  const filePath = `c:/DEV/gold-trading-bot/messages/${lang}.json`;
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.Dashboard = { ...data.Dashboard, ...obj.Dashboard };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }
}
