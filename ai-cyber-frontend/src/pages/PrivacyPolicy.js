import React from "react";
import { Helmet } from "react-helmet";

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy — AI Cyber Assistant</title>
        <meta
          name="description"
          content="AI Cyber Assistant Privacy Policy — Learn how we collect, use, and protect your personal information while using our cybersecurity tools."
        />
      </Helmet>

      <div className="container mx-auto p-6 md:p-12">
        <h1 className="text-3xl font-bold mb-6 text-center">Privacy Policy</h1>
        <p className="mb-4">
          At AI Cyber Assistant, your privacy is our top priority. This Privacy
          Policy outlines how we collect, use, and protect your information when
          you use our tools and services.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-2">Information We Collect</h2>
        <p>
          We may collect non-personal information such as your IP address,
          browser type, and pages visited. This helps us improve site performance
          and security.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Cookies</h2>
        <p>
          We use cookies and similar technologies to enhance your browsing
          experience and serve relevant ads via Google AdSense.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">AdSense Policy</h2>
        <p>
          Third-party vendors, including Google, use cookies to serve ads based
          on your prior visits to our website. You can opt out of personalized
          advertising by visiting{" "}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            Google Ad Settings
          </a>
          .
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Data Protection</h2>
        <p>
          We use advanced security measures to prevent unauthorized access,
          alteration, disclosure, or destruction of your personal data.
        </p>

        <p className="mt-6">
          If you have any questions about this Privacy Policy, please contact us
          via the form on our Contact page.
        </p>
      </div>
    </>
  );
};

export default PrivacyPolicy;
