import { Supplier, PartSpec, MatchResult } from '@/types/domain';

// Simple synonym mapping for semantic matching
const synonyms: Record<string, string[]> = {
  'cnc milling': ['3-axis milling', '5-axis milling', 'cnc machining'],
  'machining': ['cnc milling', 'cnc turning', 'milling', 'turning'],
  'aluminum': ['al', 'aluminium'],
  'steel': ['carbon steel', 'mild steel'],
  'stainless': ['stainless steel', 'ss']
};

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

function getTokens(text: string): string[] {
  return normalizeText(text).split(/\s+/).filter(t => t.length > 1);
}

function expandWithSynonyms(tokens: string[]): string[] {
  const expanded = new Set(tokens);
  
  tokens.forEach(token => {
    Object.entries(synonyms).forEach(([key, values]) => {
      if (values.includes(token) || key.includes(token)) {
        expanded.add(key);
        values.forEach(v => expanded.add(v));
      }
    });
  });
  
  return Array.from(expanded);
}

function jaccardSimilarity(set1: string[], set2: string[]): number {
  const s1 = new Set(set1);
  const s2 = new Set(set2);
  const intersection = new Set([...s1].filter(x => s2.has(x)));
  const union = new Set([...s1, ...s2]);
  
  return union.size === 0 ? 0 : intersection.size / union.size;
}

function semanticMatch(query: string, target: string): number {
  const queryTokens = expandWithSynonyms(getTokens(query));
  const targetTokens = expandWithSynonyms(getTokens(target));
  
  return jaccardSimilarity(queryTokens, targetTokens);
}

function calculateCapabilityFit(part: PartSpec, supplier: Supplier): number {
  // Process matching (40% of capability)
  const processScore = Math.max(
    ...supplier.processes.map(p => semanticMatch(part.process, p))
  );
  
  // Material matching (35% of capability)
  const materialScore = Math.max(
    ...supplier.materials.map(m => semanticMatch(part.material, m))
  );
  
  // Category matching (25% of capability)
  const categoryScore = Math.max(
    ...supplier.categories.map(c => semanticMatch(part.process, c))
  );
  
  return (processScore * 0.4 + materialScore * 0.35 + categoryScore * 0.25) * 100;
}

function calculateComplianceFit(part: PartSpec, supplier: Supplier): number {
  const requiredCerts = ['ISO9001'];
  
  // For automotive parts, IATF16949 is highly valued
  if (part.description.toLowerCase().includes('automotive') || 
      part.criticality === 'A') {
    requiredCerts.push('IATF16949');
  }
  
  const hasRequired = requiredCerts.every(cert => 
    supplier.certifications.some(c => c.code === cert)
  );
  
  const certScore = supplier.certifications.length * 10;
  const baseScore = hasRequired ? 80 : 40;
  
  return Math.min(100, baseScore + certScore);
}

function calculateProximityScore(supplier: Supplier): number {
  // EU-27 proximity bonus
  const euCountries = ['DE', 'PL', 'CZ', 'SK', 'HU', 'RO', 'IT', 'ES', 'FR', 'NL', 'SE'];
  const isEU = euCountries.includes(supplier.country);
  
  // Tier 1 countries (Germany, Netherlands) get highest score
  const tier1 = ['DE', 'NL'];
  // Tier 2 countries (Poland, Czech, etc.) get medium score
  const tier2 = ['PL', 'CZ', 'SK', 'HU'];
  
  if (!isEU) return 30;
  if (tier1.includes(supplier.country)) return 100;
  if (tier2.includes(supplier.country)) return 85;
  return 70; // Other EU countries
}

function calculateLogisticsFit(part: PartSpec, supplier: Supplier): number {
  // MOQ fit (50% of logistics)
  const moqFit = part.annual_volume >= supplier.moq ? 100 : 
                 (part.annual_volume / supplier.moq) * 100;
  
  // Lead time fit (50% of logistics)
  const idealLeadTime = 14; // days
  const leadTimeFit = Math.max(0, 100 - Math.abs(supplier.lead_time_days - idealLeadTime) * 5);
  
  return (moqFit * 0.5 + leadTimeFit * 0.5);
}

function calculateQualityRisk(supplier: Supplier): number {
  // Higher quality metrics = lower risk = higher score
  const onTimeScore = supplier.quality.on_time_rate * 100;
  const defectScore = Math.max(0, 100 - supplier.quality.defect_rate_ppm / 5);
  
  return (onTimeScore * 0.6 + defectScore * 0.4);
}

function calculateAuditReadiness(supplier: Supplier): 'Audit-ready' | 'Minor gaps' | 'Major gaps' {
  const hasISO9001 = supplier.certifications.some(c => c.code === 'ISO9001');
  const hasIATF = supplier.certifications.some(c => c.code === 'IATF16949');
  
  // Check if certifications are current (not expiring within 6 months)
  const now = new Date();
  const sixMonthsFromNow = new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
  
  const validCerts = supplier.certifications.filter(c => 
    new Date(c.expiry) > sixMonthsFromNow
  );
  
  const hasValidISO9001 = validCerts.some(c => c.code === 'ISO9001');
  const hasValidIATF = validCerts.some(c => c.code === 'IATF16949');
  
  if (hasValidISO9001 && hasValidIATF) return 'Audit-ready';
  if (hasISO9001 && (hasIATF || hasValidISO9001)) return 'Minor gaps';
  return 'Major gaps';
}

function generateReasons(part: PartSpec, supplier: Supplier, scores: any): string[] {
  const reasons: string[] = [];
  
  if (scores.capability > 80) {
    reasons.push(`Strong process match for ${part.process}`);
  }
  
  if (scores.compliance > 80) {
    reasons.push('Excellent certification portfolio');
  }
  
  if (scores.proximity > 80) {
    reasons.push('Optimal EU location for logistics');
  }
  
  if (supplier.price_index < 0.9) {
    reasons.push('Cost advantage vs current supplier');
  }
  
  if (supplier.quality.on_time_rate > 0.95) {
    reasons.push('Proven delivery performance');
  }
  
  if (supplier.past_clients && supplier.past_clients.length > 0) {
    reasons.push(`Experience with ${supplier.past_clients.join(', ')}`);
  }
  
  return reasons;
}

export function matchSuppliers(
  part: PartSpec, 
  suppliers: Supplier[],
  options: {
    maxResults?: number;
    minScore?: number;
    currentSupplierPriceIndex?: number;
  } = {}
): MatchResult[] {
  const { maxResults = 50, minScore = 30, currentSupplierPriceIndex = 1.0 } = options;
  
  const results: MatchResult[] = suppliers.map(supplier => {
    // Calculate component scores
    const capability = calculateCapabilityFit(part, supplier);
    const compliance = calculateComplianceFit(part, supplier);
    const proximity = calculateProximityScore(supplier);
    const logistics = calculateLogisticsFit(part, supplier);
    const quality = calculateQualityRisk(supplier);
    
    // Overall switching cost score (weighted)
    const switching_cost_score = Math.round(
      capability * 0.40 +
      compliance * 0.25 +
      proximity * 0.15 +
      logistics * 0.10 +
      quality * 0.10
    );
    
    // Estimated savings rate
    const estimated_savings_rate = Math.max(0, 
      Math.min(0.35, (currentSupplierPriceIndex - supplier.price_index) / currentSupplierPriceIndex)
    );
    
    const audit_readiness = calculateAuditReadiness(supplier);
    
    const reasons = generateReasons(part, supplier, {
      capability, compliance, proximity, logistics, quality
    });
    
    return {
      supplier,
      switching_cost_score,
      estimated_savings_rate,
      audit_readiness,
      reasons
    };
  });
  
  return results
    .filter(r => r.switching_cost_score >= minScore)
    .sort((a, b) => b.switching_cost_score - a.switching_cost_score)
    .slice(0, maxResults);
}