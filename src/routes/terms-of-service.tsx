import { createFileRoute } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"

export const Route = createFileRoute("/terms-of-service")({
  component: TermsOfServicePage,
})

function TermsOfServicePage() {
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

        <h1 className="mb-8 text-4xl font-bold">Terms of Service</h1>

        <div className="text-muted-foreground space-y-8">
          <section>
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using Monq ("the Service"), you accept and agree
              to be bound by the terms and provision of this agreement. If you
              do not agree to abide by these terms, please do not use this
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              2. Description of Service
            </h2>
            <p>
              Monq is a web application that allows users to discover, review,
              and share information about places. The Service includes features
              such as user accounts, place listings, ratings, reviews, comments,
              and related content.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              3. User Accounts
            </h2>
            <h3 className="text-foreground mb-2 text-lg font-medium">
              Registration
            </h3>
            <p className="mb-4">
              To use certain features, you must create an account. You agree to:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Promptly update any changes to your information</li>
              <li>
                Accept responsibility for all activities under your account
              </li>
            </ul>

            <h3 className="text-foreground mt-4 mb-2 text-lg font-medium">
              Account Termination
            </h3>
            <p>
              We reserve the right to terminate or suspend your account at any
              time for violation of these terms or for any other reason at our
              sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              4. User Content
            </h2>
            <h3 className="text-foreground mb-2 text-lg font-medium">
              Your Contributions
            </h3>
            <p className="mb-4">
              You may submit reviews, comments, photos, and other content ("User
              Content"). By submitting User Content, you:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Grant us a worldwide, royalty-free license to use, modify, and
                display such content
              </li>
              <li>
                Confirm you have all necessary rights to submit the content
              </li>
              <li>Agree that you are responsible for your contributions</li>
            </ul>

            <h3 className="text-foreground mt-4 mb-2 text-lg font-medium">
              Prohibited Content
            </h3>
            <p className="mb-4">You agree not to submit content that:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Is unlawful, harmful, threatening, or abusive</li>
              <li>Contains false or misleading information</li>
              <li>Infringes on intellectual property rights</li>
              <li>Contains viruses or malicious code</li>
              <li>Spams or engages in repetitive behavior</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              5. Code of Conduct
            </h2>
            <p>When using our Service, you agree to:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Respect other users and their opinions</li>
              <li>Not engage in harassment, hate speech, or discrimination</li>
              <li>Not spam or manipulate the platform</li>
              <li>Not attempt to gain unauthorized access to our systems</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              6. Intellectual Property
            </h2>
            <p>
              The Service and its original content, features, and functionality
              are owned by Monq and are protected by international copyright,
              trademark, patent, trade secret, and other intellectual property
              laws.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              7. Disclaimers
            </h2>
            <p>
              THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. WE
              MAKE NO WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
              TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
              PURPOSE, AND NON-INFRINGEMENT.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              8. Limitation of Liability
            </h2>
            <p>
              IN NO EVENT SHALL MONQ BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR
              RELATED TO YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL NOT
              EXCEED THE AMOUNT YOU PAID, IF ANY, FOR USING THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              9. Indemnification
            </h2>
            <p>
              You agree to indemnify, defend, and hold harmless Monq and its
              officers, directors, employees, and agents from any claims,
              damages, losses, liabilities, costs, or expenses arising out of or
              related to your use of the Service or any violation of these
              terms.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              10. Third-Party Links
            </h2>
            <p>
              Our Service may contain links to third-party websites or services.
              We are not responsible for the content, privacy practices, or
              accuracy of any third-party sites. Your interactions with
              third-party sites are governed by their own terms and policies.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              11. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of the jurisdiction in which Monq operates, without
              regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              12. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these terms at any time. We will
              provide notice of material changes by posting the updated terms on
              this page. Your continued use of the Service after such changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              13. Severability
            </h2>
            <p>
              If any provision of these Terms is found to be unenforceable or
              invalid, that provision shall be limited or eliminated to the
              minimum extent necessary so that the remaining provisions remain
              in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              14. Entire Agreement
            </h2>
            <p>
              These Terms constitute the entire agreement between you and Monq
              regarding the Service and supersede all prior agreements and
              understandings, whether written or oral.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              15. Contact Us
            </h2>
            <p>
              If you have any questions about these Terms, please contact us at:{" "}
              <strong>support@monq.app</strong>
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
