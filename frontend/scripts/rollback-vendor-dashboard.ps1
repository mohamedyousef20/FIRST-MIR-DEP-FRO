# Check if the file exists
$filePath = "C:\Users\HPz\Downloads\Mirvory-Project\frontend\app\vendor\dashboard\products\new\page.tsx"

if (Test-Path $filePath) {
    Write-Host "File found. Starting rollback process..."
    
    # Create backup directory if it doesn't exist
    $backupPath = Join-Path (Split-Path $filePath -Parent) "backup"
    if (-not (Test-Path $backupPath)) {
        New-Item -ItemType Directory -Path $backupPath | Out-Null
    }
    
    # Create backup of current file
    $backupFile = Join-Path $backupPath "page.tsx.backup"
    Copy-Item $filePath -Destination $backupFile
    
    # Restore original content
    $originalContent = @'
'use client';

import { Button } from '@/components/ui/button';
import AddProductForm from '@/components/vendor/AddProductForm';
import { useLanguage } from "@/components/language-provider";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const { language } = useLanguage();
  const { data: session } = useSession();
  const router = useRouter();

  // Check if user is a vendor
  if (!session?.user?.isVendor) {
    router.push('/');
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {language === 'ar' ? 'إضافة منتج جديد' : 'Add New Product'}
        </h1>
        <Button onClick={() => router.back()} variant="outline">
          {language === 'ar' ? 'رجوع' : 'Back'}
        </Button>
      </div>

      <AddProductForm onClose={() => router.back()} />
    </div>
  );
}
'@
    
    # Write original content to file
    Set-Content -Path $filePath -Value $originalContent -Encoding UTF8
    
    Write-Host "Rollback completed successfully. Original content restored."
} else {
    Write-Host "File not found at specified path. No rollback needed."
}
