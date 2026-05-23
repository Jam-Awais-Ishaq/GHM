import { siteConfig } from "@/config/site";

/** Shown when no custom policy has been saved yet. */
export function getDefaultPrivacyPolicyContent(): string {
  return `${siteConfig.name} helps you discover community-ranked cheap eats. This policy explains what information we collect and how we use it.

## Information we collect
When you sign in, we store your email address and nickname to personalise your experience, including saved places, feed posts, and comments.

## How we use it
We use your account details to operate the app, show your activity, and keep the community safe. We do not sell your personal information to third parties.

## Contact
Questions about this policy? Reach out through the app or your usual support channel for ${siteConfig.name}.`;
}
