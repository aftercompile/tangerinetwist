import { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How TangerineTwist collects, uses and protects your personal information.",
  path: "/privacy",
});

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout eyebrow="Legal" title="Privacy Policy" updated="August 3, 2026">
      <LegalSection title="1. Who we are">
        <p>
          TangerineTwist Design Studio (&quot;TangerineTwist&quot;, &quot;we&quot;, &quot;us&quot;) designs and sells
          3D-printed home décor — lamps, idols, desk organizers and home accents — through{" "}
          <strong>tangerinetwist.in</strong>. This policy explains what personal information we collect when you
          browse or buy from us, why we collect it, and the choices you have.
        </p>
      </LegalSection>

      <LegalSection title="2. Information we collect">
        <p>We collect information in a few different ways:</p>
        <ul>
          <li>
            <strong>Account information</strong> — if you create an account (by email/password or by signing in
            with Google), we store your name, email address and, if you provide one, phone number.
          </li>
          <li>
            <strong>Order and shipping information</strong> — when you place an order, we collect the shipping
            name, address, phone number, and the items and prices in that order, so we can fulfil and deliver it.
          </li>
          <li>
            <strong>Payment information</strong> — checkout is handled by Fastrr Checkout (by Shiprocket), our
            checkout and payments partner. If you pay online, your card, UPI or netbanking details are entered
            directly into their secure hosted checkout. We never see or store your full card number; we only
            receive confirmation of whether a payment succeeded, along with an order reference ID.
          </li>
          <li>
            <strong>Reviews</strong> — if you submit a product review while signed in, we store the rating and
            text you write, associated with your account.
          </li>
          <li>
            <strong>Usage data</strong> — we use Google Analytics to understand how visitors use our site (pages
            viewed, general location at a city/country level, device type). This is aggregated and not used to
            identify you personally.
          </li>
          <li>
            <strong>Cart, wishlist and recently viewed items</strong> — these are stored only in your own
            browser&apos;s local storage. We don&apos;t receive or store this on our servers unless it becomes part
            of an actual order you place.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. How we use your information">
        <ul>
          <li>To process, pack, ship and provide support for your orders.</li>
          <li>To create and maintain your account, including showing your order history.</li>
          <li>To respond to messages you send us via email or our contact form.</li>
          <li>To detect and prevent fraud or abuse of our checkout and admin systems.</li>
          <li>To understand overall site usage and improve the shopping experience.</li>
        </ul>
        <p>
          We do not sell your personal information to anyone, and we do not use your data for third-party
          advertising.
        </p>
      </LegalSection>

      <LegalSection title="4. Who we share it with">
        <p>We share only what&apos;s necessary with the following service providers, so they can do their job:</p>
        <ul>
          <li>
            <strong>Fastrr Checkout (by Shiprocket)</strong> — handles our checkout end-to-end, including address
            and shipping selection, online payments (cards, UPI, netbanking, wallets), and Cash on Delivery.
          </li>
          <li>
            <strong>Shiprocket</strong> — our courier and logistics partner, which receives the shipping name,
            address and phone number needed to deliver your order and share tracking updates.
          </li>
          <li>
            <strong>Supabase</strong> — hosts our database and handles account sign-in/authentication securely.
          </li>
          <li>
            <strong>Google</strong> — provides Google Analytics (site usage) and, if you choose to use it, the
            &quot;Sign in with Google&quot; option (which shares your Google name and email with us).
          </li>
        </ul>
        <p>
          We may also disclose information if required by law, or to protect the rights, property or safety of
          TangerineTwist, our customers, or others.
        </p>
      </LegalSection>

      <LegalSection title="5. Cookies and local storage">
        <p>
          We use a small number of essential cookies to keep you signed in (both for customer accounts and our
          admin panel) and Google Analytics cookies to measure site usage. Your cart, wishlist and recently viewed
          items are kept in your browser&apos;s local storage rather than a cookie, and never leave your device
          unless you place an order. You can clear cookies and local storage at any time through your browser
          settings — doing so will sign you out and clear your saved cart/wishlist.
        </p>
      </LegalSection>

      <LegalSection title="6. How long we keep your information">
        <p>
          We retain order records for as long as needed to meet tax, accounting and consumer-protection
          obligations under Indian law. Account information is kept until you ask us to delete it, subject to any
          orders we&apos;re still legally required to keep records of.
        </p>
      </LegalSection>

      <LegalSection title="7. Your rights">
        <p>
          You can review and update your name, phone number and saved addresses at any time from your account
          page. To request a copy of your data, ask us to correct it, or ask us to delete your account, email{" "}
          <a href="mailto:hello@tangerinetwist.in">hello@tangerinetwist.in</a> from the address on your account
          and we&apos;ll respond within a reasonable time.
        </p>
      </LegalSection>

      <LegalSection title="8. Children's privacy">
        <p>
          TangerineTwist is not directed at children, and we don&apos;t knowingly collect personal information
          from anyone under 18. If you believe a child has provided us with personal information, please contact
          us and we&apos;ll remove it.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes to this policy">
        <p>
          We may update this policy from time to time as our practices or the law changes. We&apos;ll update the
          &quot;Last updated&quot; date above whenever we do, and material changes will be reflected here before
          they take effect.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact us">
        <p>
          Questions about this policy or how we handle your information? Reach us at{" "}
          <a href="mailto:hello@tangerinetwist.in">hello@tangerinetwist.in</a> or through our{" "}
          <Link href="/contact">Contact page</Link>.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
