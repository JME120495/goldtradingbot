const fs = require('fs');

const translations = {
  en: {
    Footer: {
      rights: "All rights reserved.",
      terms: "Terms and Conditions",
      privacy: "Privacy Policy",
      risk: "Risk Warning",
      disclaimer: "⚠️ Trading Forex and precious metals (gold / XAU/USD) carries a high risk of capital loss. Past performance does not guarantee future results. This software does not constitute investment advice. Only invest funds you can afford to lose.",
      learn_more: "Learn more"
    }
  },
  fr: {
    Footer: {
      rights: "Tous droits réservés.",
      terms: "Conditions Générales",
      privacy: "Confidentialité",
      risk: "Avertissement Risques",
      disclaimer: "⚠️ Le trading sur le Forex et les métaux précieux (or / XAU/USD) comporte un risque élevé de perte en capital. Les performances passées ne garantissent pas les résultats futurs. Ce logiciel ne constitue pas un conseil en investissement. N'investissez que des fonds que vous pouvez vous permettre de perdre.",
      learn_more: "En savoir plus"
    }
  },
  es: {
    Footer: {
      rights: "Todos los derechos reservados.",
      terms: "Términos y Condiciones",
      privacy: "Política de Privacidad",
      risk: "Advertencia de Riesgos",
      disclaimer: "⚠️ Operar en Forex y metales preciosos (oro / XAU/USD) conlleva un alto riesgo de pérdida de capital. Los rendimientos pasados no garantizan resultados futuros. Este software no constituye asesoramiento de inversión. Solo invierta fondos que pueda permitirse perder.",
      learn_more: "Saber más"
    }
  },
  pt: {
    Footer: {
      rights: "Todos os direitos reservados.",
      terms: "Termos e Condições",
      privacy: "Política de Privacidade",
      risk: "Aviso de Risco",
      disclaimer: "⚠️ A negociação em Forex e metais preciosos (ouro / XAU/USD) acarreta um alto risco de perda de capital. O desempenho passado não garante resultados futuros. Este software não constitui aconselhamento de investimento. Invista apenas fundos que você pode se dar ao luxo de perder.",
      learn_more: "Saiba mais"
    }
  },
  ar: {
    Footer: {
      rights: "جميع الحقوق محفوظة.",
      terms: "الشروط والأحكام",
      privacy: "سياسة الخصوصية",
      risk: "تحذير من المخاطر",
      disclaimer: "⚠️ ينطوي تداول الفوركس والمعادن الثمينة (الذهب / XAU/USD) على خطر كبير بفقدان رأس المال. الأداء السابق لا يضمن النتائج المستقبلية. هذا البرنامج لا يشكل نصيحة استثمارية. استثمر فقط الأموال التي يمكنك تحمل خسارتها.",
      learn_more: "اعرف المزيد"
    }
  }
};

for (const [lang, t] of Object.entries(translations)) {
  const filePath = `c:/DEV/gold-trading-bot/messages/${lang}.json`;
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.Footer = t.Footer;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }
}
