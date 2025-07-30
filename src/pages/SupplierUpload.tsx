import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  Building,
  Shield
} from 'lucide-react';

interface UploadItem {
  id: string;
  name: string;
  description: string;
  required: boolean;
  uploaded: boolean;
  fileName?: string;
}

export default function SupplierUpload() {
  const { toast } = useToast();
  
  // Mock audit request data
  const auditDetails = {
    companyName: "TechFlow Industries",
    supplierName: "Precision Metal Works",
    auditId: "AUD-2024-001",
    deadline: "2024-08-15",
    requestDate: "2024-08-01"
  };

  const [uploadItems, setUploadItems] = useState<UploadItem[]>([
    {
      id: 'certifications',
      name: 'Quality Certifications',
      description: 'Current ISO certifications (ISO 9001, IATF 16949, etc.) in PDF format',
      required: true,
      uploaded: false
    },
    {
      id: 'financial',
      name: 'Financial Statements',
      description: 'Latest annual financial statements and credit report',
      required: true,
      uploaded: false
    },
    {
      id: 'quality_docs',
      name: 'Quality Management Documentation',
      description: 'Quality manual, procedures, and process capability studies',
      required: true,
      uploaded: false
    },
    {
      id: 'safety_compliance',
      name: 'Safety & Compliance Records',
      description: 'Safety certifications, environmental compliance, REACH/RoHS declarations',
      required: true,
      uploaded: false
    },
    {
      id: 'capacity_reports',
      name: 'Process Capability Reports',
      description: 'Equipment list, capacity analysis, and capability studies',
      required: false,
      uploaded: false
    },
    {
      id: 'references',
      name: 'Customer References',
      description: 'Contact information for 3-5 recent customers',
      required: false,
      uploaded: false
    }
  ]);

  const handleFileUpload = (itemId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, uploaded: true, fileName: file.name }
            : item
        )
      );
      
      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`
      });
    }
  };

  const requiredItems = uploadItems.filter(item => item.required);
  const uploadedRequired = requiredItems.filter(item => item.uploaded).length;
  const completionPercentage = (uploadedRequired / requiredItems.length) * 100;
  const isComplete = uploadedRequired === requiredItems.length;

  const handleSubmitAudit = () => {
    toast({
      title: "Audit Submitted",
      description: "Your audit documentation has been submitted for review. You will receive confirmation within 24 hours."
    });
  };

  const daysRemaining = Math.ceil((new Date(auditDetails.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">Supplier Audit Portal</CardTitle>
                <CardDescription>
                  Secure document upload for {auditDetails.supplierName}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="font-medium">Requesting Company:</span>
                  <br />
                  <span>{auditDetails.companyName}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="font-medium">Deadline:</span>
                  <br />
                  <span>{new Date(auditDetails.deadline).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="font-medium">Days Remaining:</span>
                  <br />
                  <Badge variant={daysRemaining <= 3 ? "destructive" : daysRemaining <= 7 ? "secondary" : "default"}>
                    {daysRemaining} days
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className={`h-5 w-5 ${isComplete ? 'text-green-600' : 'text-muted-foreground'}`} />
              Audit Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Required Documents Uploaded</span>
                <span className="font-medium">{uploadedRequired} / {requiredItems.length}</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {isComplete 
                  ? "All required documents uploaded. You can now submit your audit."
                  : `Upload ${requiredItems.length - uploadedRequired} more required document(s) to complete the audit.`
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upload Items */}
        <div className="space-y-4">
          {uploadItems.map((item) => (
            <Card key={item.id} className={item.uploaded ? "border-green-200 bg-green-50/50" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${item.uploaded ? 'bg-green-100' : 'bg-muted'}`}>
                      {item.uploaded ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.required && <Badge variant="secondary">Required</Badge>}
                    {item.uploaded && <Badge variant="default" className="bg-green-600">Uploaded</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {item.uploaded ? (
                  <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">{item.fileName}</span>
                    </div>
                    <label className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>Replace File</span>
                      </Button>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload(item.id, e)}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <div className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary/50 transition-colors">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <div className="text-center">
                        <p className="font-medium">Click to upload file</p>
                        <p className="text-sm text-muted-foreground">PDF, DOC, DOCX up to 10MB</p>
                      </div>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload(item.id, e)}
                    />
                  </label>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Submit Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                By submitting this audit, you confirm that all information provided is accurate and up-to-date.
              </p>
              <Button 
                onClick={handleSubmitAudit}
                disabled={!isComplete}
                size="lg"
                className="w-full md:w-auto"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit Audit Documentation
              </Button>
              {!isComplete && (
                <p className="text-sm text-muted-foreground">
                  Please upload all required documents before submitting.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>• Accepted file formats: PDF, DOC, DOCX</p>
              <p>• Maximum file size: 10MB per document</p>
              <p>• All files are encrypted and securely stored</p>
              <p>• For technical support, contact: audit-support@techflow.com</p>
              <p>• Audit ID: {auditDetails.auditId}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}