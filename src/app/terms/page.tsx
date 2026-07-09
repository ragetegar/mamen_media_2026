import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service",
    description: "Rules for using MAMEN, including community, content, and affiliate terms.",
};

export default function TermsPage() {
    return (
        <section className="bg-mamen-black py-16 md:py-20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="font-headline text-4xl md:text-5xl font-black text-mamen-white uppercase">
                    Terms <span className="text-mamen-lime">of Service</span>
                </h1>
                <div className="mt-8 space-y-6 text-sm leading-relaxed text-mamen-gray-200">
                    <p>
                        MAMEN is a media and concert-community platform. You are responsible for the content you post, the accuracy of your profile, and your interactions with other users.
                    </p>
                    <p>
                        Do not post illegal, abusive, defamatory, harassing, spammy, infringing, or misleading content. We may remove content, limit features, or suspend accounts to protect the community and comply with the law.
                    </p>
                    <p>
                        Barengan helps users coordinate around events, but MAMEN is not responsible for offline meetings, ticket transactions, or third-party event changes. Meet safely, verify details, and use your own judgment.
                    </p>
                    <p>
                        Some links may be affiliate links, and MAMEN may earn a commission. Editorial coverage is not guaranteed to include every event, brand, or product.
                    </p>
                    <p>
                        We may update these terms as the service grows. Continued use of MAMEN means you accept the latest version.
                    </p>
                </div>
            </div>
        </section>
    );
}
