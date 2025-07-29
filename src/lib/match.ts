import { Supplier, PartSpec, MatchResult, CertCode } from '@/types/domain';

// Simple synonym mapping for fuzzy matching
const SYNONYM_MAP: Record<string, string[]> = {
  'cnc milling': ['3-axis milling', '5-axis milling', 'cnc machining', 'machining'],
  'machining': ['cnc milling', 'cnc turning', 'milling', 'turning'],
  'aluminum': ['al', 'aluminium', 'al 6061', 'al 7075', 'al 5083'],
  'steel': ['carbon steel', 'mild steel', 's235', 's355'],
  'stainless': ['stainless steel', 'ss', '304', '316'],
  'injection molding': ['molding', 'plastic molding'],
  'wire harness': ['harness', 'cable assembly', 'wiring'],
  'casting': ['die casting', 'investment casting', 'sand casting']
};

interface MatchOptions {
  regionScope?: 'EU-27' | 'DACH' | 'Global';
  requiredCerts?: CertCode[];
  maxResults?: number;
}

function normalizeText(text: string): string {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getTokens(text: string): string[] {
  return normalizeText(text)
    .split(' ')
    .filter(token => token.length > 1);
}

function expandWithSynonyms(tokens: string[]): Set<string> {
  const expanded = new Set(tokens);
  
  tokens.forEach(token => {
    // Check if token matches any synonym key or value
    Object.entries(SYNONYM_MAP).forEach(([key, synonyms]) => {
      if (key.includes(token) || token.includes(key)) {
        expanded.add(key);
        synonyms.forEach(syn => expanded.add(syn));
      }
      
      synonyms.forEach(synonym => {
        if (synonym.includes(token) || token.includes(synonym)) {
          expanded.add(key);
          synonyms.forEach(syn => expanded.add(syn));
        }
      });
    });
  });
  
  return expanded;
}

function calculateSimilarity(query: string, targets: string[]): number {
  const queryTokens = getTokens(query);
  const queryExpanded = expandWithSynonyms(queryTokens);
  
  let maxScore = 0;
  
  targets.forEach(target => {
    const targetTokens = getTokens(target);
    const targetExpanded = expandWithSynonyms(targetTokens);
    
    // Jaccard similarity with synonym expansion
    const intersection = new Set([...queryExpanded].filter(x => targetExpanded.has(x)));
    const union = new Set([...queryExpanded, ...targetExpanded]);
    
    const jaccardScore = union.size > 0 ? intersection.size / union.size : 0;
    
    // Exact match bonus
    const exactMatch = normalizeText(query) === normalizeText(target) ? 0.3 : 0;
    
    // Substring match bonus  
    const substringBonus = normalizeText(target).includes(normalizeText(query)) ? 0.2 : 0;
    
    const score = Math.min(1.0, jaccardScore + exactMatch + substringBonus);
    maxScore = Math.max(maxScore, score);
  });
  
  return maxScore;
}

function calculateCapabilityFit(part: PartSpec, supplier: Supplier): number {
  // Process matching (40% of capability score)
  const processScore = calculateSimilarity(part.process, supplier.processes);
  
  // Material matching (35% of capability score)  
  const materialScore = calculateSimilarity(part.material, supplier.materials);
  
  // Category matching (25% of capability score)
  const categoryScore = calculateSimilarity(part.process, supplier.categories);
  
  return (processScore * 0.4 + materialScore * 0.35 + categoryScore * 0.25) * 100;
}

function calculateComplianceFit(part: PartSpec, supplier: Supplier, requiredCerts?: CertCode[]): number {
  const now = new Date();
  const validCerts = supplier.certifications.filter(cert => 
    new Date(cert.expiry) > now
  );
  
  const validCertCodes = new Set(validCerts.map(c => c.code));
  
  // Default automotive requirements
  const defaultRequired: CertCode[] = ['ISO9001'];
  if (part.criticality === 'A' || part.description.toLowerCase().includes('automotive')) {
    defaultRequired.push('IATF16949');
  }
  
  const required = requiredCerts || defaultRequired;
  
  let score = 0;
  let requiredMet = 0;
  
  required.forEach(certCode => {
    if (validCertCodes.has(certCode)) {
      requiredMet++;
      if (certCode === 'IATF16949') {
        score += 50; // IATF16949 is highly valued
      } else if (certCode === 'ISO9001') {
        score += 30; // ISO9001 is baseline
      } else {
        score += 20; // Other certs
      }
    }
  });
  
  // Partial credit for having ISO9001 when IATF16949 is required
  if (required.includes('IATF16949') && !validCertCodes.has('IATF16949') && validCertCodes.has('ISO9001')) {
    score += 25; // Partial credit
  }
  
  // Bonus points for additional relevant certifications
  const bonusCerts: CertCode[] = ['ISO14001', 'RoHS', 'REACH', 'ISO13485'];
  bonusCerts.forEach(cert => {
    if (validCertCodes.has(cert)) {
      score += 10;
    }
  });
  
  return Math.min(100, score);
}

function calculateProximityScore(supplier: Supplier, regionScope: string = 'EU-27'): number {
  const dachCountries = ['DE', 'AT', 'CH'];
  const eu27Countries = ['DE', 'PL', 'CZ', 'SK', 'HU', 'RO', 'IT', 'ES', 'FR', 'NL', 'SE', 'AT', 'BE', 'BG', 'HR', 'CY', 'DK', 'EE', 'FI', 'GR', 'IE', 'LV', 'LT', 'LU', 'MT', 'PT', 'SI'];
  
  switch (regionScope) {
    case 'DACH':
      if (dachCountries.includes(supplier.country)) return 100;
      if (eu27Countries.includes(supplier.country)) return 70;
      return 30;
      
    case 'EU-27':
      if (dachCountries.includes(supplier.country)) return 100;
      if (eu27Countries.includes(supplier.country)) return 85;
      return 40;
      
    case 'Global':
    default:
      if (dachCountries.includes(supplier.country)) return 90;
      if (eu27Countries.includes(supplier.country)) return 75;
      return 60;
  }
}

function calculateLogisticsFit(part: PartSpec, supplier: Supplier): number {
  // MOQ fit (60% of logistics score)
  const monthlyVolume = part.annual_volume / 12;
  const moqFit = monthlyVolume >= supplier.moq ? 100 : 
                 (monthlyVolume / supplier.moq) * 100;
  
  // Lead time fit (40% of logistics score)
  const idealLeadTime = 14; // days
  const leadTimeFit = supplier.lead_time_days <= 21 ? 
    Math.max(0, 100 - (supplier.lead_time_days - idealLeadTime) * 3) : 
    Math.max(0, 100 - (supplier.lead_time_days - 21) * 5);
  
  return moqFit * 0.6 + leadTimeFit * 0.4;
}

function calculateQualityScore(supplier: Supplier): number {
  // On-time delivery rate (70% of quality score)
  const onTimeScore = supplier.quality.on_time_rate * 100;
  
  // Defect rate (30% of quality score)
  // Convert PPM to score (lower PPM = higher score)
  const defectScore = Math.max(0, 100 - (supplier.quality.defect_rate_ppm / 10));
  
  return onTimeScore * 0.7 + defectScore * 0.3;
}

function calculateAuditReadiness(supplier: Supplier): 'Audit-ready' | 'Minor gaps' | 'Major gaps' {
  const now = new Date();
  const sixMonthsFromNow = new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
  
  const validCerts = supplier.certifications.filter(cert => 
    new Date(cert.expiry) > sixMonthsFromNow
  );
  
  const validCertCodes = new Set(validCerts.map(c => c.code));
  const hasValidISO9001 = validCertCodes.has('ISO9001');
  const hasValidIATF = validCertCodes.has('IATF16949');
  
  // Check for expiring certificates (within 6 months)
  const expiringCerts = supplier.certifications.filter(cert => {
    const expiryDate = new Date(cert.expiry);
    return expiryDate > now && expiryDate <= sixMonthsFromNow;
  });
  
  if (hasValidISO9001 && hasValidIATF && expiringCerts.length === 0) {
    return 'Audit-ready';
  }
  
  if (hasValidISO9001 && (hasValidIATF || expiringCerts.length <= 1)) {
    return 'Minor gaps';
  }
  
  return 'Major gaps';
}

function generateReasons(
  part: PartSpec, 
  supplier: Supplier, 
  scores: {
    capability: number;
    compliance: number;
    proximity: number;
    logistics: number;
    quality: number;
  }
): string[] {
  const reasons: string[] = [];
  
  if (scores.capability > 80) {
    reasons.push(`Excellent process match for ${part.process}`);
  } else if (scores.capability > 60) {
    reasons.push(`Good capability fit for required processes`);
  }
  
  if (scores.compliance > 90) {
    reasons.push('Complete certification portfolio including IATF16949');
  } else if (scores.compliance > 70) {
    reasons.push('Strong quality certifications');
  } else if (scores.compliance > 50) {
    reasons.push('Basic quality standards with ISO9001');
  }
  
  if (scores.proximity > 85) {
    reasons.push('Optimal European location for logistics');
  } else if (scores.proximity > 70) {
    reasons.push('Good regional proximity');
  }
  
  if (supplier.price_index < 0.9) {
    const savings = ((1.0 - supplier.price_index) * 100).toFixed(0);
    reasons.push(`Significant cost advantage (~${savings}% savings potential)`);
  } else if (supplier.price_index < 1.0) {
    reasons.push('Competitive pricing vs current supplier');
  }
  
  if (supplier.quality.on_time_rate > 0.95) {
    reasons.push(`Excellent delivery performance (${(supplier.quality.on_time_rate * 100).toFixed(1)}% on-time)`);
  }
  
  if (supplier.quality.defect_rate_ppm < 50) {
    reasons.push(`Superior quality metrics (${supplier.quality.defect_rate_ppm} PPM defect rate)`);
  }
  
  if (supplier.past_clients && supplier.past_clients.length > 0) {
    reasons.push(`Proven automotive experience with ${supplier.past_clients.slice(0, 2).join(', ')}`);
  }
  
  if (scores.logistics > 80) {
    reasons.push('MOQ and lead time well-suited for volume requirements');
  }
  
  if (supplier.sustainability?.co2e_class === 'A') {
    reasons.push('Outstanding sustainability rating (Class A)');
  }
  
  return reasons;
}

export function matchSuppliers(
  part: PartSpec, 
  suppliers: Supplier[], 
  options: MatchOptions = {}
): MatchResult[] {
  const {
    regionScope = 'EU-27',
    requiredCerts,
    maxResults = 50
  } = options;
  
  const results: MatchResult[] = suppliers.map(supplier => {
    // Calculate component scores
    const capability = calculateCapabilityFit(part, supplier);
    const compliance = calculateComplianceFit(part, supplier, requiredCerts);
    const proximity = calculateProximityScore(supplier, regionScope);
    const logistics = calculateLogisticsFit(part, supplier);
    const quality = calculateQualityScore(supplier);
    
    // Calculate weighted switching cost score
    const switching_cost_score = Math.round(
      capability * 0.40 +
      compliance * 0.25 +
      proximity * 0.15 +
      logistics * 0.10 +
      quality * 0.10
    );
    
    // Calculate estimated savings rate
    const estimated_savings_rate = Math.max(0, 
      Math.min(0.35, (1.0 - supplier.price_index))
    );
    
    // Determine audit readiness
    const audit_readiness = calculateAuditReadiness(supplier);
    
    // Generate human-readable reasons
    const reasons = generateReasons(part, supplier, {
      capability, compliance, proximity, logistics, quality
    });
    
    return {
      supplier,
      switching_cost_score,
      estimated_savings_rate,
      audit_readiness,
      reasons: reasons.slice(0, 4) // Limit to top 4 reasons
    };
  });
  
  // Sort by switching cost score (descending) and return top results
  return results
    .sort((a, b) => b.switching_cost_score - a.switching_cost_score)
    .slice(0, maxResults);
}