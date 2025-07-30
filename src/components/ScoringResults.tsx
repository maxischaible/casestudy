import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award, Eye } from 'lucide-react';
import { Supplier } from '@/types/domain';
import { useNavigate } from 'react-router-dom';

interface ScoredSupplier {
  supplier: Supplier;
  totalScore: number;
  breakdown: Record<string, number>;
}

interface ScoringResultsProps {
  scoredSuppliers: ScoredSupplier[];
}

const criteriaLabels: Record<string, string> = {
  price: 'Price',
  quality: 'Quality',
  delivery: 'Delivery',
  certifications: 'Certs',
  capacity: 'Capacity'
};

export default function ScoringResults({ scoredSuppliers }: ScoringResultsProps) {
  const navigate = useNavigate();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="h-5 w-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  if (scoredSuppliers.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No suppliers to score</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Supplier Rankings
        </CardTitle>
        <CardDescription>
          Ranked by weighted score based on your criteria
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {scoredSuppliers.map((scored, index) => {
            const rank = index + 1;
            return (
              <div 
                key={scored.supplier.id}
                className={`p-4 border rounded-lg ${
                  rank === 1 
                    ? 'border-yellow-200 bg-yellow-50/50' 
                    : rank <= 3 
                    ? 'border-primary/20 bg-primary/5' 
                    : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getRankIcon(rank)}
                    <div>
                      <h3 className="font-medium">{scored.supplier.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {scored.supplier.city}, {scored.supplier.country}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={getScoreBadgeVariant(scored.totalScore)} className="px-3 py-1">
                      <span className="font-bold">{scored.totalScore}</span>/100
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/supplier/${scored.supplier.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>

                {/* Overall Score Bar */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Overall Score</span>
                    <span className={`font-medium ${getScoreColor(scored.totalScore)}`}>
                      {scored.totalScore}/100
                    </span>
                  </div>
                  <Progress value={scored.totalScore} className="h-2" />
                </div>

                {/* Score Breakdown */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Score Breakdown</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(scored.breakdown).map(([criteriaId, score]) => (
                      <div key={criteriaId} className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">
                          {criteriaLabels[criteriaId] || criteriaId}
                        </div>
                        <div className={`text-sm font-medium ${getScoreColor(score)}`}>
                          {Math.round(score)}
                        </div>
                        <Progress value={score} className="h-1 mt-1" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}