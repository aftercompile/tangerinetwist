import { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Refund Policy",
  description: "How and when refunds are processed for TangerineTwist orders, cancellations and returns.",
  path: "/refunds",
});

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout eyebrow="Legal" title="Refund Policy" updated="August 5, 2026">
      <LegalSection title="1. When you're eligible for a refund">
        <ul>
          <li>Your return is inspected and approved under our <Link href="/returns">Return &amp; Exchange Policy</Link>.</li>
          <li>An item arrives damaged, defective or wrong, and you choose a refund over a replacement.</li>
          <li>You cancel an order before it&apos;s dispatched (see section 4).</li>
          <li>We cancel or decline an order — for example due to a pricing error or an item turning out to be unavailable.</li>
          <li>An online payment is charged more than once for the same order, or fails after your money was deducted.</li>
        </ul>
      </LegalSection>

      <LegalSection title="2. How refunds are paid">
        <p>
          <strong>Prepaid orders</strong> (card, UPI, netbanking or wallet, processed via our checkout partner
          Fastrr) are refunded to the original payment method used at checkout — we can&apos;t redirect a refund
          to a different card or account.
        </p>
        <p>
          <strong>Cash on Delivery orders</strong> have no original online payment to reverse, so if a COD order
          turns out to be refundable (for example, a damaged item paid for on delivery), we&apos;ll ask for your
          bank account or UPI ID and transfer the refund directly.
        </p>
      </LegalSection>

      <LegalSection title="3. Refund timeline">
        <p>
          We process approved refunds within <strong>5–7 business days</strong> of approval. Once we&apos;ve
          initiated it, however long it takes to actually reflect in your account is out of our hands — Fastrr
          and your bank or card network typically take a further 2–7 business days, occasionally longer for
          netbanking or some card issuers. If it&apos;s been more than 10 business days since we confirmed your
          refund was processed, contact us and we&apos;ll help chase it up.
        </p>
      </LegalSection>

      <LegalSection title="4. Cancellations">
        <p>
          We don&apos;t currently have a self-service cancel button, since most orders move into production
          quickly — but if you email us before an order has shipped, we&apos;ll cancel it and refund it in full
          (or simply not collect payment, for Cash on Delivery). Once an order has shipped, it can no longer be
          cancelled; you&apos;re welcome to return it instead once it arrives, under our{" "}
          <Link href="/returns">Return &amp; Exchange Policy</Link>.
        </p>
      </LegalSection>

      <LegalSection title="5. Non-refundable items">
        <p>
          Made-to-order and personalised items (such as engraved name plates) follow the same exception as our
          return policy — they&apos;re final sale and non-refundable unless they arrive defective or damaged.
        </p>
      </LegalSection>

      <LegalSection title="6. Partial refunds">
        <p>
          If your order had multiple items and only some are being returned, cancelled or found damaged, we refund
          only those items (plus a proportional share of any shipping charge you paid, where applicable) rather
          than the full order.
        </p>
      </LegalSection>

      <LegalSection title="7. Duplicate or failed payments">
        <p>
          If our checkout system shows a payment as deducted but your order wasn&apos;t placed, or you were charged
          twice for the same order, this is almost always reversed automatically within a few business days
          without needing anything from you. If it hasn&apos;t resolved after 7 business days, contact us with the
          payment reference ID from your bank or card statement and we&apos;ll investigate.
        </p>
      </LegalSection>

      <LegalSection title="8. Changes to this policy">
        <p>
          We may update this policy from time to time; the &quot;Last updated&quot; date above will reflect the
          most recent change.
        </p>
      </LegalSection>

      <LegalSection title="9. Contact us">
        <p>
          Questions about a refund? Reach us at <a href="mailto:hello@tangerinetwist.in">hello@tangerinetwist.in</a>{" "}
          or through our <Link href="/contact">Contact page</Link>, with your order number handy.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
