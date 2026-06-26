export type TournamentQuestion = {
  id: string;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  category:
    | "phishing"
    | "passwords"
    | "social-engineering"
    | "malware"
    | "network"
    | "best-practices"
    | "incidents";
  difficulty: "easy" | "medium" | "hard";
};

/** The full question bank. IDs are stable slugs so questions can be tracked. */
export const QUESTION_BANK: TournamentQuestion[] = [
  // ── PHISHING ────────────────────────────────────────────────────────────
  {
    id: "ph-01",
    prompt: "What is the most common delivery method for a phishing attack?",
    options: ["Email", "USB Drive", "Bluetooth", "Physical mail"],
    correctIndex: 0,
    category: "phishing",
    difficulty: "easy",
  },
  {
    id: "ph-02",
    prompt:
      "You receive an email from 'support@paypa1.com' asking you to verify your account. What is the red flag?",
    options: [
      "The email has a logo",
      "The domain uses a digit instead of a letter",
      "The email mentions your account",
      "The email has a footer",
    ],
    correctIndex: 1,
    category: "phishing",
    difficulty: "easy",
  },
  {
    id: "ph-03",
    prompt:
      "A spear-phishing attack differs from a regular phishing attack because it:",
    options: [
      "Uses phone calls instead of email",
      "Targets a specific individual or organisation",
      "Only attacks corporate networks",
      "Requires physical access",
    ],
    correctIndex: 1,
    category: "phishing",
    difficulty: "medium",
  },
  {
    id: "ph-04",
    prompt:
      "Which technique do attackers use to make a phishing URL look legitimate?",
    options: [
      "URL encoding the path",
      "Using HTTPS",
      "Homograph attacks — swapping characters that look identical",
      "Shortening the URL",
    ],
    correctIndex: 2,
    category: "phishing",
    difficulty: "hard",
  },
  {
    id: "ph-05",
    prompt:
      "You hover over a link in an email and the status bar shows a different URL than the link text. You should:",
    options: [
      "Click it — hover previews are often wrong",
      "Not click it and report the email",
      "Copy the URL and paste it in a browser",
      "Forward it to a colleague for a second opinion",
    ],
    correctIndex: 1,
    category: "phishing",
    difficulty: "easy",
  },
  {
    id: "ph-06",
    prompt: "What is 'vishing'?",
    options: [
      "Phishing via video call",
      "Phishing via voice call or voicemail",
      "Phishing via virtual reality",
      "A type of malware",
    ],
    correctIndex: 1,
    category: "phishing",
    difficulty: "medium",
  },
  {
    id: "ph-07",
    prompt:
      "An email urges you to act immediately or your account will be closed. This tactic is called:",
    options: [
      "Pretexting",
      "Baiting",
      "Creating a sense of urgency",
      "Tailgating",
    ],
    correctIndex: 2,
    category: "phishing",
    difficulty: "easy",
  },
  {
    id: "ph-08",
    prompt:
      "Smishing is phishing conducted via which channel?",
    options: ["Email", "SMS / text message", "Social media", "QR codes"],
    correctIndex: 1,
    category: "phishing",
    difficulty: "medium",
  },
  {
    id: "ph-09",
    prompt:
      "Which of the following is the BEST first step when you suspect a phishing email?",
    options: [
      "Delete it immediately",
      "Click the unsubscribe link",
      "Report it to your IT/security team",
      "Reply asking if it is legitimate",
    ],
    correctIndex: 2,
    category: "phishing",
    difficulty: "easy",
  },
  {
    id: "ph-10",
    prompt:
      "An attacker registers the domain 'microsoft-support.net' to mimic Microsoft. This is known as:",
    options: [
      "Domain squatting / typosquatting",
      "DNS poisoning",
      "ARP spoofing",
      "Man-in-the-middle",
    ],
    correctIndex: 0,
    category: "phishing",
    difficulty: "medium",
  },

  // ── PASSWORDS ────────────────────────────────────────────────────────────
  {
    id: "pw-01",
    prompt: "Which of the following is the strongest password?",
    options: [
      "P@ssword1",
      "correct-horse-battery-staple",
      "Admin123!",
      "12345678",
    ],
    correctIndex: 1,
    category: "passwords",
    difficulty: "easy",
  },
  {
    id: "pw-02",
    prompt:
      "Why is reusing passwords across multiple sites dangerous?",
    options: [
      "It makes passwords easier to guess",
      "A breach on one site exposes all accounts using the same password",
      "It violates most terms of service",
      "It slows down login servers",
    ],
    correctIndex: 1,
    category: "passwords",
    difficulty: "easy",
  },
  {
    id: "pw-03",
    prompt:
      "What is a credential stuffing attack?",
    options: [
      "Guessing passwords using a dictionary",
      "Using leaked username/password pairs from one breach to access other services",
      "Flooding a login page with requests",
      "Installing a keylogger to capture passwords",
    ],
    correctIndex: 1,
    category: "passwords",
    difficulty: "medium",
  },
  {
    id: "pw-04",
    prompt:
      "What is the recommended minimum length for a secure password today?",
    options: ["6 characters", "8 characters", "12 characters", "4 characters"],
    correctIndex: 2,
    category: "passwords",
    difficulty: "easy",
  },
  {
    id: "pw-05",
    prompt:
      "A password manager is useful because it:",
    options: [
      "Shares passwords with your team automatically",
      "Generates and stores unique strong passwords for each site",
      "Stores passwords in plain text for easy access",
      "Resets your passwords every 30 days",
    ],
    correctIndex: 1,
    category: "passwords",
    difficulty: "easy",
  },
  {
    id: "pw-06",
    prompt:
      "Which hashing algorithm should NOT be used to store passwords today?",
    options: ["bcrypt", "Argon2", "MD5", "scrypt"],
    correctIndex: 2,
    category: "passwords",
    difficulty: "hard",
  },
  {
    id: "pw-07",
    prompt:
      "What does 'salting' a password hash protect against?",
    options: [
      "Brute-force attacks via network",
      "Rainbow table attacks",
      "Keyloggers",
      "Phishing",
    ],
    correctIndex: 1,
    category: "passwords",
    difficulty: "hard",
  },
  {
    id: "pw-08",
    prompt:
      "If your organisation forces you to change your password every 30 days, current NIST guidance says this policy:",
    options: [
      "Is best practice and should be kept",
      "Is outdated and often leads to weaker passwords",
      "Should be shortened to every 7 days",
      "Only applies to admin accounts",
    ],
    correctIndex: 1,
    category: "passwords",
    difficulty: "medium",
  },

  // ── SOCIAL ENGINEERING ────────────────────────────────────────────────────
  {
    id: "se-01",
    prompt:
      "A stranger follows you through a secure door without badging in. This is called:",
    options: ["Piggybacking / Tailgating", "Shoulder surfing", "Dumpster diving", "Pretexting"],
    correctIndex: 0,
    category: "social-engineering",
    difficulty: "easy",
  },
  {
    id: "se-02",
    prompt:
      "An attacker calls your helpdesk pretending to be the CEO to reset an account password. This is:",
    options: ["Phishing", "Pretexting", "Baiting", "Watering hole"],
    correctIndex: 1,
    category: "social-engineering",
    difficulty: "medium",
  },
  {
    id: "se-03",
    prompt:
      "You find a USB drive in the car park labelled 'Salary Review 2024'. What should you do?",
    options: [
      "Plug it in to see the contents",
      "Hand it to IT security — never plug in unknown drives",
      "Give it to your manager",
      "Format it and reuse it",
    ],
    correctIndex: 1,
    category: "social-engineering",
    difficulty: "easy",
  },
  {
    id: "se-04",
    prompt:
      "A caller claims to be from IT and says they need your password to fix an urgent system issue. You should:",
    options: [
      "Give the password since it's urgent",
      "Ask for their employee number first",
      "Never share your password — IT does not need it",
      "Email the password so there is a record",
    ],
    correctIndex: 2,
    category: "social-engineering",
    difficulty: "easy",
  },
  {
    id: "se-05",
    prompt:
      "Which psychological principle do social engineers most commonly exploit?",
    options: [
      "Logical reasoning",
      "Authority, urgency, and fear",
      "Curiosity alone",
      "Financial incentives",
    ],
    correctIndex: 1,
    category: "social-engineering",
    difficulty: "medium",
  },
  {
    id: "se-06",
    prompt:
      "Searching through discarded documents and media for sensitive information is called:",
    options: ["Shoulder surfing", "Tailgating", "Dumpster diving", "Baiting"],
    correctIndex: 2,
    category: "social-engineering",
    difficulty: "medium",
  },
  {
    id: "se-07",
    prompt:
      "A watering hole attack targets:",
    options: [
      "Email inboxes of executives",
      "Websites frequently visited by the target group",
      "Water utility infrastructure",
      "Cloud storage services",
    ],
    correctIndex: 1,
    category: "social-engineering",
    difficulty: "hard",
  },

  // ── MALWARE ───────────────────────────────────────────────────────────────
  {
    id: "mw-01",
    prompt:
      "Ransomware is malware that primarily:",
    options: [
      "Steals your contacts",
      "Encrypts your files and demands payment for the key",
      "Slows down your computer",
      "Sends spam from your email account",
    ],
    correctIndex: 1,
    category: "malware",
    difficulty: "easy",
  },
  {
    id: "mw-02",
    prompt:
      "A Trojan horse differs from a virus because it:",
    options: [
      "Self-replicates across the network",
      "Disguises itself as legitimate software to trick users into installing it",
      "Only attacks mobile devices",
      "Requires physical access to install",
    ],
    correctIndex: 1,
    category: "malware",
    difficulty: "medium",
  },
  {
    id: "mw-03",
    prompt:
      "Which of the following BEST reduces the damage if ransomware infects a system?",
    options: [
      "Paying the ransom quickly",
      "Keeping offline, tested backups of all critical data",
      "Disabling antivirus to speed up the computer",
      "Using only cloud storage",
    ],
    correctIndex: 1,
    category: "malware",
    difficulty: "medium",
  },
  {
    id: "mw-04",
    prompt:
      "A keylogger is malware that:",
    options: [
      "Locks your keyboard",
      "Records every keystroke and sends it to an attacker",
      "Generates random keystrokes to confuse users",
      "Only runs on mobile devices",
    ],
    correctIndex: 1,
    category: "malware",
    difficulty: "easy",
  },
  {
    id: "mw-05",
    prompt:
      "What is a botnet?",
    options: [
      "A network of security cameras",
      "A group of infected devices controlled remotely by an attacker",
      "A type of firewall configuration",
      "An automated patching system",
    ],
    correctIndex: 1,
    category: "malware",
    difficulty: "medium",
  },
  {
    id: "mw-06",
    prompt:
      "Zero-day vulnerability means:",
    options: [
      "The vulnerability was discovered today",
      "A flaw unknown to the vendor with no patch available yet",
      "A vulnerability that has been patched for zero days",
      "An exploit that takes zero seconds to execute",
    ],
    correctIndex: 1,
    category: "malware",
    difficulty: "hard",
  },

  // ── NETWORK ───────────────────────────────────────────────────────────────
  {
    id: "nw-01",
    prompt:
      "Using public Wi-Fi without a VPN is risky primarily because:",
    options: [
      "The internet is slower",
      "Others on the same network may intercept unencrypted traffic",
      "It drains your battery faster",
      "Public Wi-Fi blocks HTTPS",
    ],
    correctIndex: 1,
    category: "network",
    difficulty: "easy",
  },
  {
    id: "nw-02",
    prompt:
      "What does a firewall primarily do?",
    options: [
      "Encrypts your hard drive",
      "Filters network traffic based on rules to block unauthorised access",
      "Scans emails for viruses",
      "Backs up your files",
    ],
    correctIndex: 1,
    category: "network",
    difficulty: "easy",
  },
  {
    id: "nw-03",
    prompt:
      "HTTPS protects data in transit by:",
    options: [
      "Compressing the data",
      "Encrypting the connection between your browser and the server",
      "Verifying the content of a website",
      "Blocking malware downloads",
    ],
    correctIndex: 1,
    category: "network",
    difficulty: "easy",
  },
  {
    id: "nw-04",
    prompt:
      "What is a man-in-the-middle (MitM) attack?",
    options: [
      "An attacker physically sits between two people",
      "An attacker secretly intercepts and possibly alters communication between two parties",
      "A type of denial-of-service attack",
      "An attack on the middle tier of a three-tier application",
    ],
    correctIndex: 1,
    category: "network",
    difficulty: "medium",
  },
  {
    id: "nw-05",
    prompt:
      "Which port does HTTPS use by default?",
    options: ["80", "8080", "443", "22"],
    correctIndex: 2,
    category: "network",
    difficulty: "medium",
  },

  // ── BEST PRACTICES ─────────────────────────────────────────────────────────
  {
    id: "bp-01",
    prompt: "What does MFA stand for?",
    options: [
      "Multiple Firewall Access",
      "Multi-Factor Authentication",
      "Managed File Access",
      "Monitored Firewall Activity",
    ],
    correctIndex: 1,
    category: "best-practices",
    difficulty: "easy",
  },
  {
    id: "bp-02",
    prompt:
      "The principle of least privilege means:",
    options: [
      "Giving every user admin rights for efficiency",
      "Granting users only the minimum access required for their role",
      "Restricting internet access for all users",
      "Requiring two people to approve every action",
    ],
    correctIndex: 1,
    category: "best-practices",
    difficulty: "medium",
  },
  {
    id: "bp-03",
    prompt:
      "Why should software be patched promptly?",
    options: [
      "To add new features",
      "To close known vulnerabilities before attackers can exploit them",
      "To improve performance only",
      "Patches are optional security theatre",
    ],
    correctIndex: 1,
    category: "best-practices",
    difficulty: "easy",
  },
  {
    id: "bp-04",
    prompt:
      "Which is the most secure way to share a sensitive document with a colleague?",
    options: [
      "Email it as an attachment",
      "Post it on a public cloud link",
      "Use an encrypted, access-controlled platform and revoke access after",
      "Print it and leave it on their desk",
    ],
    correctIndex: 2,
    category: "best-practices",
    difficulty: "medium",
  },
  {
    id: "bp-05",
    prompt:
      "What is the '3-2-1 backup rule'?",
    options: [
      "3 passwords, 2 devices, 1 cloud account",
      "3 copies of data, on 2 different media, with 1 stored offsite",
      "Back up every 3 days, keep 2 versions, 1 encrypted",
      "3 users approving backups, 2 locations, 1 weekly test",
    ],
    correctIndex: 1,
    category: "best-practices",
    difficulty: "medium",
  },
  {
    id: "bp-06",
    prompt:
      "Locking your screen when you step away from your desk is important because:",
    options: [
      "It saves battery",
      "It prevents unauthorised access to your open sessions and files",
      "It is required by all operating systems",
      "It speeds up your computer",
    ],
    correctIndex: 1,
    category: "best-practices",
    difficulty: "easy",
  },
  {
    id: "bp-07",
    prompt:
      "Which of the following is the strongest form of MFA?",
    options: [
      "SMS one-time code",
      "Email link",
      "Security key (FIDO2 / hardware token)",
      "Security question",
    ],
    correctIndex: 2,
    category: "best-practices",
    difficulty: "hard",
  },
  {
    id: "bp-08",
    prompt:
      "Social media oversharing can assist attackers by:",
    options: [
      "Slowing down your device",
      "Providing details used to craft targeted phishing or guess security questions",
      "Exposing your IP address directly",
      "Giving attackers physical access",
    ],
    correctIndex: 1,
    category: "best-practices",
    difficulty: "medium",
  },

  // ── INCIDENTS ──────────────────────────────────────────────────────────────
  {
    id: "inc-01",
    prompt:
      "If you suspect your account has been compromised, what should you do FIRST?",
    options: [
      "Wait to see if anything bad happens",
      "Change your password and enable MFA immediately, then report it",
      "Delete the account",
      "Reformat your computer",
    ],
    correctIndex: 1,
    category: "incidents",
    difficulty: "easy",
  },
  {
    id: "inc-02",
    prompt:
      "You discover ransomware on your machine. The FIRST thing you should do is:",
    options: [
      "Pay the ransom immediately",
      "Disconnect the device from the network to contain the spread",
      "Reboot the computer",
      "Email your IT team from the infected machine",
    ],
    correctIndex: 1,
    category: "incidents",
    difficulty: "medium",
  },
  {
    id: "inc-03",
    prompt:
      "Why is it important to report security incidents quickly?",
    options: [
      "To avoid personal blame",
      "Early reporting limits damage, allows faster containment, and is often legally required",
      "It is not important — IT will find it eventually",
      "Only major incidents need reporting",
    ],
    correctIndex: 1,
    category: "incidents",
    difficulty: "easy",
  },
  {
    id: "inc-04",
    prompt:
      "A 'data breach' is defined as:",
    options: [
      "Any system outage affecting data access",
      "Unauthorised access to or disclosure of protected data",
      "Accidental deletion of files",
      "A failed login attempt",
    ],
    correctIndex: 1,
    category: "incidents",
    difficulty: "medium",
  },
  {
    id: "inc-05",
    prompt:
      "Under GDPR, organisations must report a personal data breach to the relevant supervisory authority within:",
    options: ["24 hours", "72 hours", "7 days", "30 days"],
    correctIndex: 1,
    category: "incidents",
    difficulty: "hard",
  },
];

// ── Helper utilities ──────────────────────────────────────────────────────────

/**
 * Returns `count` questions chosen at random from the bank,
 * with no repeats. Optionally filter by category or difficulty.
 */
export function pickRandomQuestions(
  count: number,
  opts?: {
    exclude?: string[]; // question IDs already used in this session
    categories?: TournamentQuestion["category"][];
    difficulties?: TournamentQuestion["difficulty"][];
  },
): TournamentQuestion[] {
  let pool = QUESTION_BANK;

  if (opts?.exclude?.length) {
    const excluded = new Set(opts.exclude);
    pool = pool.filter((q) => !excluded.has(q.id));
  }
  if (opts?.categories?.length) {
    const cats = new Set(opts.categories);
    pool = pool.filter((q) => cats.has(q.category));
  }
  if (opts?.difficulties?.length) {
    const diffs = new Set(opts.difficulties);
    pool = pool.filter((q) => diffs.has(q.difficulty));
  }

  // Fisher-Yates shuffle then slice
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.slice(0, count);
}

/** Returns how many questions are in the bank matching optional filters. */
export function questionBankSize(opts?: {
  categories?: TournamentQuestion["category"][];
  difficulties?: TournamentQuestion["difficulty"][];
}): number {
  let pool = QUESTION_BANK;
  if (opts?.categories?.length) {
    const cats = new Set(opts.categories);
    pool = pool.filter((q) => cats.has(q.category));
  }
  if (opts?.difficulties?.length) {
    const diffs = new Set(opts.difficulties);
    pool = pool.filter((q) => diffs.has(q.difficulty));
  }
  return pool.length;
}