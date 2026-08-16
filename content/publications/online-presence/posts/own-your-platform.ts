export const ownYourPlatform = `
# Own your platform

On someone else's platform you are a tenant. Not a complaint about any company: a description of the arrangement, worth understanding before another five years on it.

## What actually goes wrong

Censorship is the dramatic version. Real, but not the common case, and leading with it makes the argument easy to dismiss. What actually happens is duller and more frequent.

**A policy changes.** Not aimed at you, but your work now sits on the wrong side of it. No one to appeal to with the authority to care.

**An automated system flags you.** A model decides your post breaks a rule. The appeal goes to another model. You are correct and it does not matter.

**Reach quietly stops.** Nothing removed. Ranking changed, external links demoted, and the audience you spent years assembling no longer sees you. Nobody told you: from the platform's side, nothing happened.

**The business pivots.** The feature you built around is deprecated, payout terms change, the free tier that made it viable ends.

**The company sells, or closes.** Your archive becomes someone else's asset, or a download link with an expiry date.

None of this requires anyone to wrong you. Only that the decision was never yours.

## The part most people get wrong

Running your own site does not make you invulnerable. Anyone claiming otherwise is selling something.

You still depend on a chain of other people:

- **Registrar**: can be pressured into taking your domain.
- **DNS**: resolves your name into an address.
- **Host**: serves your files. Vercel, Netlify, and Cloudflare all have acceptable-use policies and enforce them.
- **CDN**: sits in front of your host.
- **Search engines and social networks**: still decide whether anyone finds you.

Owning a blog does not exit the system.

## So what do you actually gain

**Portability.** Not immunity: portability. Smaller claim, and a real one.

The question is not "can this be taken away" but "what would it cost me to leave". On a platform, leaving means abandoning:

- archive addresses
- formatting
- subscriber list
- every inbound link anyone ever made to your work

That is lock-in: not that you cannot go, but that going costs everything you built.

Own content and code, and leaving costs a deployment. The writing is a directory of files on your machine and in version control; the renderer reads those files. Host suspends you tonight: point the domain elsewhere, deploy the same files. An afternoon, not a rebuild.

This site makes that literally true: the writing lives in one directory with no dependency on the framework that renders it, documented in [the content contract](/blog-platform-docs/content-contract). Delete the website, rewrite it in something else, and not a word of the writing changes.

## Two things worth owning above all

**Your domain.** Highest value on the list, and the cheapest. Your address, and the one part of the arrangement genuinely yours for as long as you renew it. Work living at someone-else.com/yourname means every link, citation, and search result you earned belongs to them, and moving breaks all of it. Own the domain and host, framework, and publishing tool all become swappable: every link keeps working.

One thing to take from this post: buy the domain. Even if you keep writing where you write now, point it there.

**Your archive, as files.** Not an export button you have never tested. Check what the export actually contains: images at full size? Post addresses? Drafts? Comments? A ZIP of unformatted text is not an archive, it is a gesture at one.

## The honest cost

Running your own site costs what a platform gives away:

- The built-in audience. Nobody hands you readers.
- The frictionless writing experience, unless you build one.
- Uptime, upgrades, and security patches become yours.
- Nobody to complain to when it breaks, because it is yours.

For plenty of people that trade is wrong. This post does not argue everyone should self-host, only that you should know which you are choosing, and that the domain is worth owning either way.

## Where to start

Three routes, by how much you want to do yourself: [Build your own blog](/online-presence/build-your-own-blog).
`
