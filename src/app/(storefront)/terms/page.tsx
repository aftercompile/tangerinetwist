import { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service",
  description: "The terms that govern buying from and using the TangerineTwist website.",
  path: "/terms",
});

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout eyebrow="Legal" title="Terms of Service" updated="August 3, 2026">
      <LegalSection title="1. Agreement to these terms">
        <p>
          These terms govern your use of tangerinetwist.in and any order you place with TangerineTwist Design
          Studio (&quot;TangerineTwist&quot;, &quot;we&quot;, &quot;us&quot;). By browsing the site or placing an
          order, you agree to these terms. If you don&apos;t agree with them, please don&apos;t use the site.
        </p>
      </LegalSection>

      <LegalSection title="2. Orders">
        <p>
          Placing an order is an offer to buy, which we may accept or decline — for example if an item turns out
          to be unavailable, if there&apos;s a pricing or listing error, or if we suspect fraud. If we decline or
          cancel an order after payment, we&apos;ll refund it in full. All prices are listed in Indian Rupees (₹)
          and are inclusive of applicable taxes unless stated otherwise.
        </p>
        <p>
          Every piece is 3D printed and hand-finished to order rather than pulled from a shelf, so small
          variations in texture or finish between units of the same product are part of its handmade character,
          not a defect.
        </p>
      </LegalSection>

      <LegalSection title="3. Payment">
        <p>
          We accept payment online (card, UPI, netbanking and wallets via Razorpay) or Cash on Delivery, where
          available for your location. For online payments, your order is placed once payment is confirmed; for
          Cash on Delivery, payment is collected by our courier partner at the time of delivery.
        </p>
      </LegalSection>

      <LegalSection title="4. Shipping and delivery">
        <p>
          Orders are typically dispatched within 2–4 business days and delivered within 4–7 business days across
          India, via our courier partner Shiprocket. Shipping is free on prepaid orders above ₹799; a flat shipping
          fee applies below that. Delivery estimates are our best expectation, not a guarantee — occasional delays
          can happen once a shipment is with the courier. See our full <Link href="/shipping">Shipping Policy</Link>{" "}
          for details.
        </p>
      </LegalSection>

      <LegalSection title="5. Returns, replacements and refunds">
        <ul>
          <li>Unused, undamaged items can be returned within 7 days of delivery.</li>
          <li>
            If your order arrives damaged, share a photo with us within 48 hours of delivery and we&apos;ll send a
            replacement.
          </li>
          <li>
            Made-to-order and personalised items (such as name plates) are final sale and cannot be returned
            unless they arrive defective or damaged.
          </li>
          <li>Approved refunds are processed to your original payment method within 5–7 business days.</li>
        </ul>
        <p>
          To start a return or report a damaged item, contact us at{" "}
          <a href="mailto:hello@tangerinetwist.in">hello@tangerinetwist.in</a>. See our full{" "}
          <Link href="/returns">Return &amp; Exchange Policy</Link> and <Link href="/refunds">Refund Policy</Link>{" "}
          for details.
        </p>
      </LegalSection>

      <LegalSection title="6. Product descriptions and images">
        <p>
          We do our best to describe and photograph every product accurately, but actual colour can vary slightly
          from photos depending on your screen and lighting. Dimensions and weight are listed per product; if
          precise sizing matters for where a piece will go, please check the listed dimensions before ordering.
        </p>
      </LegalSection>

      <LegalSection title="7. Accounts">
        <p>
          If you create an account, you&apos;re responsible for keeping your login credentials secure and for any
          activity under your account. Please let us know right away if you believe your account has been accessed
          without your permission.
        </p>
      </LegalSection>

      <LegalSection title="8. Intellectual property">
        <p>
          The TangerineTwist name, logo, product designs, photography and site content are owned by TangerineTwist
          Design Studio and may not be copied, reproduced or used commercially without our written permission.
        </p>
      </LegalSection>

      <LegalSection title="9. Limitation of liability">
        <p>
          To the extent permitted by law, TangerineTwist&apos;s liability for any claim relating to an order is
          limited to the amount you paid for that order. We&apos;re not liable for indirect or consequential losses
          arising from your use of the site or your purchase.
        </p>
      </LegalSection>

      <LegalSection title="10. Governing law">
        <p>
          These terms are governed by the laws of India, and any dispute arising from them will be subject to the
          exclusive jurisdiction of the courts in Vadodara, Gujarat.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes to these terms">
        <p>
          We may update these terms from time to time; the &quot;Last updated&quot; date above will reflect the
          most recent change. Continuing to use the site after an update means you accept the revised terms.
        </p>
      </LegalSection>

      <LegalSection title="12. Contact us">
        <p>
          Questions about these terms? Reach us at <a href="mailto:hello@tangerinetwist.in">hello@tangerinetwist.in</a>{" "}
          or through our <Link href="/contact">Contact page</Link>. See also our{" "}
          <Link href="/privacy">Privacy Policy</Link> for how we handle your personal information.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
