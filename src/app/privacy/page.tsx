import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "How MAMEN collects, uses, and protects user data.",
};

export default function PrivacyPage() {
    return (
        <section className="bg-mamen-black py-16 md:py-20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="font-headline text-4xl md:text-5xl font-black text-mamen-white uppercase">
                    Privacy <span className="text-mamen-purple">Policy</span>
                </h1>
                <div className="mt-8 space-y-6 text-sm leading-relaxed text-mamen-gray-200">
                    <p>
                        MAMEN collects account, profile, newsletter, comment, message, Barengan, analytics, and affiliate click data so we can run the site, protect users, improve content, and measure launch performance.
                    </p>
                    <p>
                        We use Google login, Supabase, Cloudinary, Google Analytics, Google AdSense, and affiliate partners. These services may process technical information such as IP address, browser, device, cookies, referrer, and interaction events.
                    </p>
                    <p>
                        We do not sell personal data. We may disclose data when required by law, to prevent abuse, to secure the platform, or to vendors who help operate MAMEN under appropriate safeguards.
                    </p>
                    <p>
                        Users can request access, correction, or deletion of their personal data by contacting hello@mamen.id. Some records may be retained where needed for security, legal compliance, dispute handling, or financial reporting.
                    </p>
                    <p>
                        By using MAMEN, you agree that your data may be processed for the purposes above in line with Indonesia&apos;s personal data protection principles.
                    </p>
                </div>
            </div>
        </section>
    );
}
