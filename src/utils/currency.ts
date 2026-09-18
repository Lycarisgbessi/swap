// Taux de change fixes basés sur l'Euro (EUR)
const RATES = {
  EUR: 1,
  XOF: 655.957, // FCFA
  USD: 1.08,
  GNF: 9300,
};

// Fonction pour extraire le montant numérique d'un prix en chaîne (ex: "10 000 FCFA" -> 10000)
export function parsePrice(priceString: string): number {
  const match = priceString.replace(/[\s.,]/g, '').match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

// Fonction pour détecter la devise de base dans la chaîne (par défaut XOF)
export function detectBaseCurrency(priceString: string): 'XOF' | 'GNF' | 'EUR' | 'USD' {
  const upper = priceString.toUpperCase();
  if (upper.includes('GNF')) return 'GNF';
  if (upper.includes('EUR') || upper.includes('€')) return 'EUR';
  if (upper.includes('USD') || upper.includes('$')) return 'USD';
  return 'XOF'; // FCFA par défaut
}

// Format un nombre pour affichage
function formatNumber(num: number): string {
  if (num % 1 !== 0) {
    return num.toFixed(2).replace('.', ',');
  }
  return num.toLocaleString('fr-FR');
}

// Calcule les autres devises à partir d'un prix de base
export function getConvertedPrices(rawPrice: string, globalCurrency: string = 'XOF') {
  const amount = parsePrice(rawPrice);
  const baseCurrency = detectBaseCurrency(rawPrice);

  if (amount === 0) return null;

  // Convertir le montant en Euro d'abord
  const amountInEur = amount / RATES[baseCurrency];

  // Calculer toutes les devises
  const values = {
    XOF: Math.round(amountInEur * RATES.XOF),
    GNF: Math.round(amountInEur * RATES.GNF),
    EUR: Number((amountInEur).toFixed(2)),
    USD: Number((amountInEur * RATES.USD).toFixed(2))
  };

  const targetCurrency = globalCurrency as 'XOF' | 'GNF' | 'EUR' | 'USD';
  const mainAmount = values[targetCurrency];
  
  let mainPrice = `${formatNumber(mainAmount)} ${targetCurrency}`;
  if (targetCurrency === 'XOF') mainPrice = `${formatNumber(mainAmount)} FCFA`;
  else if (targetCurrency === 'EUR') mainPrice = `${formatNumber(mainAmount)} €`;
  else if (targetCurrency === 'USD') mainPrice = `${formatNumber(mainAmount)} $`;

  // Ne pas afficher la devise de base dans les "autres" devises
  const others = [];
  if (targetCurrency !== 'XOF') others.push(`${formatNumber(values.XOF)} FCFA`);
  if (targetCurrency !== 'GNF') others.push(`${formatNumber(values.GNF)} GNF`);
  if (targetCurrency !== 'EUR') others.push(`${formatNumber(values.EUR)} €`);
  if (targetCurrency !== 'USD') others.push(`${formatNumber(values.USD)} $`);

  return {
    baseAmount: amount,
    baseCurrency,
    mainPrice,
    values,
    othersString: others.join(' | ')
  };
}
