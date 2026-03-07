import { createFileRoute } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicyPage,
})

function PrivacyPolicyPage() {
  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="mb-8 flex items-center gap-2">
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        <h1 className="mb-8 text-4xl font-bold">Privacy Policy</h1>

        <div className="text-muted-foreground space-y-8">
          <section>
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              1. Introduction
            </h2>
            <p>
              This Privacy Policy explains how Monq ("we", "us", or "our")
              collects, uses, discloses, and safeguards your information when
              you use our web application. We are committed to protecting your
              privacy and ensuring you have a positive experience using our
              service.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              2. Information We Collect
            </h2>
            <h3 className="text-foreground mb-2 text-lg font-medium">
              Personal Information
            </h3>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Account information (name, email address) when you register
              </li>
              <li>Profile information you provide</li>
              <li>Content you submit (reviews, comments, photos)</li>
              <li>Communications with us</li>
            </ul>

            <h3 className="text-foreground mt-4 mb-2 text-lg font-medium">
              Automatically Collected Information
            </h3>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Device information (IP address, browser type, operating system)
              </li>
              <li>Usage data (pages visited, features used, time spent)</li>
              <li>Location data (if you choose to share it)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              3. How We Use Your Information
            </h2>
            <p className="mb-4">We use your information to:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Provide and maintain our services</li>
              <li>Process your transactions</li>
              <li>Improve and personalize your experience</li>
              <li>Send you important updates and notifications</li>
              <li>Respond to your comments and questions</li>
              <li>Detect and prevent fraud and abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              4. Information Sharing
            </h2>
            <p>We may share your information with:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Service providers who assist in our operations</li>
              <li>Business partners with your consent</li>
              <li>Legal authorities when required by law</li>
            </ul>
            <p className="mt-4">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              5. Data Security
            </h2>
            <p>
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              alteration, disclosure, or destruction. However, no method of
              transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              6. Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              7. Cookies and Tracking Technologies
            </h2>
            <p>
              We use cookies and similar tracking technologies to enhance your
              experience. You can control cookies through your browser settings,
              but disabling them may affect functionality.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              8. Children's Privacy
            </h2>
            <p>
              Our service is not intended for children under 13. We do not
              knowingly collect personal information from children under 13. If
              you believe we have collected information from a child, please
              contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              9. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of any material changes by posting the new policy on
              this page and updating the "last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              10. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at: <strong>support@monq.app</strong>
            </p>
          </section>

          <p className="pt-8 text-sm">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
