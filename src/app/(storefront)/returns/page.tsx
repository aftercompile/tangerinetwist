import { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Return & Exchange Policy",
  description: "Eligibility, timelines and process for returning or exchanging a TangerineTwist order.",
  path: "/returns",
});

export default function ReturnsPolicyPage() {
  return (
    <LegalPageLayout eyebrow="Legal" title="Return & Exchange Policy" updated="August 5, 2026">
      <LegalSection title="1. Return window">
        <p>
          You can return an eligible item within <strong>7 days of delivery</strong>. To qualify, it needs to be
          unused, undamaged, and in its original packaging with any tags or protective wrapping intact — essentially
          the same condition it arrived in.
        </p>
      </LegalSection>

      <LegalSection title="2. What can't be returned">
        <ul>
          <li>
            <strong>Made-to-order and personalised items</strong> (such as engraved name plates) are printed
            specifically for your order and are final sale — unless they arrive defective or damaged, in which case
            section 3 below applies.
          </li>
          <li>Items that have been used, altered, or damaged after delivery through normal wear or misuse.</li>
          <li>Items returned without their original packaging, where that materially affects resale condition.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Damaged, defective or wrong items">
        <p>
          If your order arrives damaged, defective, or isn&apos;t what you ordered, email us a photo within{" "}
          <strong>48 hours of delivery</strong> and we&apos;ll arrange a free replacement or a full refund — your
          choice. This is the one case where the usual return-shipping cost (section 5) doesn&apos;t apply to you;
          we cover it.
        </p>
      </LegalSection>

      <LegalSection title="4. How to start a return or exchange">
        <p>Email us at <a href="mailto:hello@tangerinetwist.in">hello@tangerinetwist.in</a> with:</p>
        <ul>
          <li>Your order number,</li>
          <li>Which item(s) you&apos;d like to return or exchange, and</li>
          <li>For damaged or defective items, a photo showing the issue.</li>
        </ul>
        <p>
          We&apos;ll confirm your return is eligible and share pickup or drop-off instructions. Please don&apos;t
          send an item back before we&apos;ve confirmed the return — we can&apos;t guarantee a refund or exchange
          for anything sent to us unannounced.
        </p>
      </LegalSection>

      <LegalSection title="5. Who pays for return shipping">
        <p>
          For change-of-mind returns (an eligible item you simply no longer want), return shipping is at your cost.
          For damaged, defective or incorrect items, we cover it — see section 3. Any return-shipping cost you&apos;re
          responsible for will be clearly stated before you send the item back, and may be deducted from your
          refund if we arrange the pickup on your behalf.
        </p>
      </LegalSection>

      <LegalSection title="6. Exchanges">
        <p>
          Want a different product, colourway or a replacement of the same item, rather than a refund? Let us know
          when you contact us — exchanges are subject to availability. If the replacement costs more than your
          original item, we&apos;ll ask you to pay the difference; if it costs less, we&apos;ll refund the
          difference under our <Link href="/refunds">Refund Policy</Link>.
        </p>
      </LegalSection>

      <LegalSection title="7. Inspection and approval">
        <p>
          Once we receive a returned item, we inspect it to confirm it meets the conditions in section 1. We&apos;ll
          email you once it&apos;s approved. If it isn&apos;t — for example if it shows signs of use — we&apos;ll
          contact you before deciding how to proceed, rather than simply declining it without explanation.
        </p>
      </LegalSection>

      <LegalSection title="8. What happens next">
        <p>
          Once a return is approved, you&apos;ll either receive a refund or your exchange will be dispatched,
          depending on what you chose. See our <Link href="/refunds">Refund Policy</Link> for how and when refunds
          are processed.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes to this policy">
        <p>
          We may update this policy from time to time; the &quot;Last updated&quot; date above will reflect the
          most recent change.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact us">
        <p>
          Questions about a return or exchange? Reach us at{" "}
          <a href="mailto:hello@tangerinetwist.in">hello@tangerinetwist.in</a> or through our{" "}
          <Link href="/contact">Contact page</Link>.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
