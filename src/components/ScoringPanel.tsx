import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Target, RotateCcw, TrendingUp } from 'lucide-react';
import { Supplier } from '@/types/domain';

interface ScoringCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
  scoreCalculator: (supplier: Supplier) => number;
}

interface ScoringPanelProps {
  suppliers: Supplier[];
  onScoreUpdate: (scores: Array<{ supplier: Supplier; totalScore: number; breakdown: Record<string, number> }>) => void;
}

export default function ScoringPanel({ suppliers, onScoreUpdate }: ScoringPanelProps) {
  const [criteria, setCriteria] = useState<ScoringCriteria[]>([
    {
      id: 'price',
      name: 'Price Competitiveness',
      description: 'Lower price index is better',
      weight: 25,
      scoreCalculator: (supplier) => Math.max(0, Math.min(100, (2.0 - supplier.price_index) * 50))
    },
    {
      id: 'quality',
      name: 'Quality Performance',
      description: 'Based on on-time rate and defect rate',
      weight: 30,
      scoreCalculator: (supplier) => {
        const onTimeScore = supplier.quality.on_time_rate * 100;
        const defectScore = Math.max(0, 100 - (supplier.quality.defect_rate_ppm / 50));
        return (onTimeScore + defectScore) / 2;
      }
    },
    {
      id: 'delivery',
      name: 'Delivery Speed',
      description: 'Shorter lead times score higher',
      weight: 20,
      scoreCalculator: (supplier) => Math.max(0, Math.min(100, (60 - supplier.lead_time_days) * 2))
    },
    {
      id: 'certifications',
      name: 'Certifications',
      description: 'More certifications score higher',
      weight: 15,
      scoreCalculator: (supplier) => Math.min(100, supplier.certifications.length * 20)
    },
    {
      id: 'capacity',
      name: 'Production Capacity',
      description: 'Higher capacity scores better',
      weight: 10,
      scoreCalculator: (supplier) => Math.min(100, (supplier.capacity.value / 1000) * 10)
    }
  ]);

  const handleWeightChange = (criteriaId: string, newWeight: number[]) => {
    setCriteria(prev => 
      prev.map(c => 
        c.id === criteriaId 
          ? { ...c, weight: newWeight[0] }
          : c
      )
    );
  };

  const resetWeights = () => {
    setCriteria(prev => 
      prev.map(c => ({
        ...c,
        weight: c.id === 'price' ? 25 : c.id === 'quality' ? 30 : c.id === 'delivery' ? 20 : c.id === 'certifications' ? 15 : 10
      }))
    );
  };

  const calculateScores = () => {
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    
    const scores = suppliers.map(supplier => {
      const breakdown: Record<string, number> = {};
      let totalScore = 0;

      criteria.forEach(criterion => {
        const rawScore = criterion.scoreCalculator(supplier);
        const weightedScore = (rawScore * criterion.weight) / totalWeight;
        breakdown[criterion.id] = rawScore;
        totalScore += weightedScore;
      });

      return {
        supplier,
        totalScore: Math.round(totalScore),
        breakdown
      };
    });

    // Sort by total score descending
    scores.sort((a, b) => b.totalScore - a.totalScore);
    onScoreUpdate(scores);
  };

  // Calculate scores whenever criteria change
  React.useEffect(() => {
    if (suppliers.length > 0) {
      calculateScores();
    }
  }, [criteria, suppliers]);

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Scoring Criteria</CardTitle>
              <CardDescription>Customize weights to match your priorities</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={resetWeights}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weight Total Indicator */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">Total Weight:</span>
          <Badge variant={totalWeight === 100 ? "default" : "secondary"}>
            {totalWeight}%
          </Badge>
        </div>

        <Separator />

        {/* Criteria Controls */}
        <div className="space-y-6">
          {criteria.map((criterion) => (
            <div key={criterion.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">{criterion.name}</Label>
                  <p className="text-xs text-muted-foreground">{criterion.description}</p>
                </div>
                <Badge variant="outline">{criterion.weight}%</Badge>
              </div>
              
              <Slider
                value={[criterion.weight]}
                onValueChange={(value) => handleWeightChange(criterion.id, value)}
                max={50}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
          ))}
        </div>

        <Separator />

        {/* Recalculate Button */}
        <Button onClick={calculateScores} className="w-full" size="sm">
          <TrendingUp className="h-4 w-4 mr-2" />
          Update Rankings
        </Button>

        {totalWeight !== 100 && (
          <p className="text-xs text-muted-foreground text-center">
            💡 Tip: Total weight should equal 100% for accurate scoring
          </p>
        )}
      </CardContent>
    </Card>
  );
}