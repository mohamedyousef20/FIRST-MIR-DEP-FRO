import PrivacyPolicyPage from "@/components/legal/privacy-policy-page"

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <main className="flex-1">
        <div className="container px-4 py-10">
          <PrivacyPolicyPage />
        </div>
      </main>
    </div>
  )
}
