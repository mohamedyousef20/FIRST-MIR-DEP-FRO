import TermsAndConditionsPage from "@/components/legal/terms-and-conditions-page"

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <main className="flex-1">
        <div className="container px-4 py-10">
          <TermsAndConditionsPage />
        </div>
      </main>
    </div>
  )
}
