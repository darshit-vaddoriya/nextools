import { BlogPost } from '../types';

export const SECURITY_POSTS: BlogPost[] = [
  {
    slug: 'what-makes-a-password-strong',
    title: 'What actually makes a password strong (it is not the special characters)',
    description: 'Password strength is measured in entropy bits. Length dominates; complexity rules mostly produce predictable passwords people cannot remember.',
    excerpt: 'P@ssw0rd! satisfies every complexity rule ever written and is one of the first things any cracking tool tries. Here is what the maths actually says.',
    category: 'security',
    tags: ['passwords', 'entropy', 'authentication'],
    published: '2026-09-09',
    relatedTools: ['password-generator', 'passphrase-gen', 'password-strength', 'random-string'],
    takeaways: [
      'Entropy is length multiplied by the log of the alphabet size, so length dominates and complexity rules barely register.',
      'The formula only holds if the password was chosen randomly. A human-chosen one with substitutions is near worthless.',
      'Modern guidance drops forced rotation and composition rules, and checks against breach lists instead.',
      'Uniqueness matters more than strength, because credential stuffing is the likeliest way an account is taken.',
    ],
    words: 718,
  },

  {
    slug: 'hashing-vs-encryption-vs-encoding',
    title: 'Hashing, encryption and encoding are three different things',
    description: 'One is one-way, one is reversible with a key, one is reversible by anyone. Confusing them is behind a large share of real security failures.',
    excerpt: 'If a system can email you your existing password, it is not hashing them. That single observation tells you a lot about how a service is built.',
    category: 'security',
    tags: ['hashing', 'encryption', 'bcrypt', 'sha-256'],
    published: '2026-09-09',
    relatedTools: ['hash-generator', 'file-checksum', 'base64', 'password-strength'],
    takeaways: [
      'Encoding is reversible by anyone, encryption is reversible with a key, and hashing is not reversible at all.',
      'If a service can email you your existing password, it is not hashing them.',
      'Password hashes should be deliberately slow. bcrypt, scrypt and Argon2 exist for that reason; SHA-256 alone does not.',
      'MD5 and SHA-1 are broken for anything an attacker touches, and remain fine only as accident checks.',
    ],
    words: 641,
  },

  {
    slug: 'verify-a-download-with-checksums',
    title: 'Verifying a download with a checksum: how, and what it actually proves',
    description: 'Comparing SHA-256 hashes catches corrupted and tampered files. Understanding its limits tells you when you need a signature instead.',
    excerpt: 'Checking a hash takes fifteen seconds and catches both a truncated download and a compromised mirror. It does not catch everything, here is the boundary.',
    category: 'security',
    tags: ['checksum', 'sha-256', 'integrity'],
    published: '2026-09-09',
    relatedTools: ['file-checksum', 'hash-generator', 'zip-extractor'],
    takeaways: [
      'A matching checksum proves the bytes you have are the bytes that were published, and nothing more.',
      'It catches truncated downloads, a compromised mirror and bit rot. It does not prove the publisher is honest.',
      'If the checksum and the file come from the same place, whoever controls that place controls both.',
      'Fetch the checksum over HTTPS from the canonical domain, ideally not the same host as the download.',
    ],
    words: 654,
  },

  {
    slug: 'signing-a-pdf-what-it-proves',
    title: 'Signing a PDF: what a signature image proves, and what it does not',
    description: 'Pasting a picture of your signature onto a PDF and applying a digital signature are unrelated operations. One is a drawing; the other is cryptography.',
    excerpt: 'Most documents people call "signed" contain a JPEG of a name. That is often fine, and it is worth knowing exactly what it is, because it proves almost nothing on its own.',
    category: 'security',
    tags: ['pdf', 'signatures', 'verification'],
    published: '2026-09-16',
    relatedTools: ['pdf-sign', 'pdf-flatten', 'file-checksum', 'pdf-redact'],
    takeaways: [
      'A signature image is a picture. It proves nothing about who placed it or whether the text above it changed afterwards.',
      'A digital signature proves the bytes have not changed and that a specific key signed them, and nothing about intent or authority.',
      'Editing a signed PDF invalidates the signature. That is the mechanism working, not a defect.',
      'Sign last: compress, merge, redact and flatten first, because all of them change the bytes.',
    ],
    words: 1095,
  },

  {
    slug: 'random-strings-and-tokens',
    title: 'Generating a random string that is actually random',
    description: 'Math.random is not a source of secrets. The difference between a pseudo-random generator and a cryptographic one decides whether a token is guessable.',
    excerpt: 'Two generators produce strings that look equally random. One of them lets an attacker predict every future value after seeing a few.',
    category: 'security',
    tags: ['randomness', 'tokens', 'entropy'],
    published: '2026-09-16',
    relatedTools: ['random-string', 'password-generator', 'uuid-generator', 'hash-generator'],
    takeaways: [
      'Math.random is a predictable algorithm. Observing enough output reveals its state and every value it will produce next.',
      'Anything acting as a secret needs crypto.getRandomValues or an equivalent CSPRNG.',
      'Entropy is log2(alphabet size) x length. A shorter string from a bigger alphabet is often weaker than it looks.',
      'Taking a random value modulo the alphabet size introduces bias unless the sampling is rejected and retried.',
    ],
    words: 835,
  },

];
