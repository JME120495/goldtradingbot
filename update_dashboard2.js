const fs = require('fs');

const translations = {
  en: {
    Dashboard: {
      loading: "Loading..."
    }
  },
  fr: {
    Dashboard: {
      loading: "Chargement..."
    }
  },
  es: {
    Dashboard: {
      loading: "Cargando..."
    }
  },
  pt: {
    Dashboard: {
      loading: "Carregando..."
    }
  },
  ar: {
    Dashboard: {
      loading: "جاري التحميل..."
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
