import { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Shipping Policy",
  description: "Dispatch times, delivery estimates, shipping charges and order tracking for TangerineTwist.",
  path: "/shipping",
});

export default function ShippingPolicyPage() {
  return (
    <LegalPageLayout eyebrow="Legal" title="Shipping Policy" updated="August 5, 2026">
      <LegalSection title="1. Where we ship">
        <p>
          We currently ship anywhere within India. We don&apos;t offer international shipping yet — if that
          changes, we&apos;ll update this page.
        </p>
      </LegalSection>

      <LegalSection title="2. Processing time">
        <p>
          Every piece is 3D printed and hand-finished to order rather than pulled off a shelf, so orders are
          typically dispatched within <strong>2–4 business days</strong> of being placed. Personalised items (such
          as engraved name plates) may take a little longer, since printing only starts once your customisation
          text is confirmed. Business days are Monday–Saturday, excluding public holidays.
        </p>
      </LegalSection>

      <LegalSection title="3. Delivery time">
        <p>
          Once dispatched, orders are delivered within <strong>4–7 business days</strong> via our courier partner,
          Shiprocket — so most orders arrive within 6–11 business days of being placed. Metro cities are usually at
          the faster end of that range; remote or non-serviceable pin codes can take a little longer. These are our
          best estimates, not a guarantee — occasional delays can happen once a shipment is with the courier
          (weather, regional courier network disruptions, festive-season volume, and similar).
        </p>
      </LegalSection>

      <LegalSection title="4. Shipping charges">
        <p>
          Shipping is <strong>free on prepaid orders above ₹799</strong>. Below that, and on all Cash on Delivery
          orders, a flat shipping fee of <strong>₹79</strong> applies. Any applicable shipping charge is shown at
          checkout before you pay, and all items in one order ship together as a single shipment.
        </p>
      </LegalSection>

      <LegalSection title="5. Tracking your order">
        <p>
          Once your order ships, we&apos;ll email you an AWB (tracking) number and courier name. If you have an
          account, the full tracking timeline — every checkpoint Shiprocket reports, from pickup to
          delivery — is also visible on your{" "}
          <Link href="/account">order history page</Link>. Placed as a guest? Contact us with your order number and
          we&apos;ll look it up for you.
        </p>
      </LegalSection>

      <LegalSection title="6. Delivery address and failed delivery attempts">
        <p>
          Please double-check your shipping address, pin code and phone number at checkout — we ship to exactly
          what&apos;s entered there. If a delivery attempt fails because no one was available, or the address was
          incomplete, our courier will usually attempt redelivery; if the shipment is eventually returned to us
          (RTO), we&apos;ll contact you to arrange a reshipment, which may involve an additional shipping charge for
          the second attempt.
        </p>
      </LegalSection>

      <LegalSection title="7. Damaged or missing items">
        <p>
          If a package arrives visibly damaged, or an item inside is damaged or missing, please see our{" "}
          <Link href="/returns">Return &amp; Exchange Policy</Link> for how to report it and get a replacement.
        </p>
      </LegalSection>

      <LegalSection title="8. Changes to this policy">
        <p>
          We may update this policy as our shipping process or courier partners change; the &quot;Last
          updated&quot; date above will reflect the most recent change.
        </p>
      </LegalSection>

      <LegalSection title="9. Contact us">
        <p>
          Questions about a shipment? Reach us at <a href="mailto:hello@tangerinetwist.in">hello@tangerinetwist.in</a>{" "}
          or through our <Link href="/contact">Contact page</Link>, with your order number handy.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
