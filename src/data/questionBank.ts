export type TournamentQuestion = {
  id: string;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  category:
    | "threat-vectors"
    | "phishing-control"
    | "credential-hygiene"
    | "social-engineering"
    | "incident-response";
  difficulty: "easy" | "medium" | "hard";
};

/**
 * The full question bank for the Cyber Survival Tournament.
 * IDs are stable slugs so questions can be tracked.
 *
 * Categories map directly to the presentation topics:
 *   - threat-vectors      → "Threat Vectors"
 *   - phishing-control    → "Phishing Control"
 *   - credential-hygiene  → "Credential Hygiene"
 *   - social-engineering  → "Social Engineering"
 *   - incident-response   → "Countermeasures / Incident Response"
 *
 * NOTE: If TournamentQuestion.category is a union type elsewhere in the
 * codebase, update it to match these five slugs.
 */
export const QUESTION_BANK: TournamentQuestion[] = [
  // ── THREAT VECTORS ──────────────────────────────────────────────────────
  {
    id: "tv-01",
    prompt: "Ransomware is malware that primarily:",
    options: [
      "Steals your contacts",
      "Encrypts your files and demands payment for the key",
      "Slows down your computer",
      "Sends spam from your email account",
    ],
    correctIndex: 1,
    category: "threat-vectors",
    difficulty: "easy",
  },
  {
    id: "tv-02",
    prompt: "A Trojan horse differs from a virus because it:",
    options: [
      "Self-replicates across the network",
      "Disguises itself as legitimate software to trick users into installing it",
      "Only attacks mobile devices",
      "Requires physical access to install",
    ],
    correctIndex: 1,
    category: "threat-vectors",
    difficulty: "medium",
  },
  {
    id: "tv-03",
    prompt: "A keylogger is malware that:",
    options: [
      "Locks your keyboard",
      "Records every keystroke and sends it to an attacker",
      "Generates random keystrokes to confuse users",
      "Only runs on mobile devices",
    ],
    correctIndex: 1,
    category: "threat-vectors",
    difficulty: "easy",
  },
  {
    id: "tv-04",
    prompt: "What is a botnet?",
    options: [
      "A network of security cameras",
      "A group of infected devices controlled remotely by an attacker",
      "A type of firewall configuration",
      "An automated patching system",
    ],
    correctIndex: 1,
    category: "threat-vectors",
    difficulty: "medium",
  },
  {
    id: "tv-05",
    prompt: "Using public Wi-Fi without a VPN is risky primarily because:",
    options: [
      "The internet is slower",
      "Others on the same network may intercept unencrypted traffic",
      "It drains your battery faster",
      "Public Wi-Fi blocks HTTPS",
    ],
    correctIndex: 1,
    category: "threat-vectors",
    difficulty: "easy",
  },
  {
    id: "tv-06",
    prompt: "What does a firewall primarily do?",
    options: [
      "Encrypts your hard drive",
      "Filters network traffic based on rules to block unauthorised access",
      "Scans emails for viruses",
      "Backs up your files",
    ],
    correctIndex: 1,
    category: "threat-vectors",
    difficulty: "easy",
  },
  {
    id: "tv-07",
    prompt: "What is a man-in-the-middle (MitM) attack?",
    options: [
      "An attacker physically sits between two people",
      "An attacker secretly intercepts and possibly alters communication between two parties",
      "A type of denial-of-service attack",
      "An attack on the middle tier of a three-tier application",
    ],
    correctIndex: 1,
    category: "threat-vectors",
    difficulty: "medium",
  },
  {
    id: "tv-08",
    prompt: "A 'zero-day' threat is dangerous because:",
    options: [
      "It was discovered exactly at midnight",
      "It's a flaw attackers can exploit before the vendor has released a fix",
      "It only affects systems that are zero days old",
      "It takes zero seconds to detect",
    ],
    correctIndex: 1,
    category: "threat-vectors",
    difficulty: "hard",
  },
  {
    id: "tv-09",
    prompt: "A Distributed Denial-of-Service (DDoS) attack works by:",
    options: [
      "Stealing sensitive files from a server",
      "Flooding a system with traffic until it becomes unavailable to real users",
      "Encrypting files and demanding a ransom",
      "Silently recording user keystrokes",
    ],
    correctIndex: 1,
    category: "threat-vectors",
    difficulty: "medium",
  },
  {
    id: "tv-10",
    prompt: "Adware is software that primarily:",
    options: [
      "Displays intrusive ads and may track your browsing habits",
      "Encrypts your files for ransom",
      "Locks your keyboard and mouse",
      "Builds a botnet of infected devices",
    ],
    correctIndex: 0,
    category: "threat-vectors",
    difficulty: "easy",
  },

  // ── PHISHING CONTROL ─────────────────────────────────────────────────────
  {
    id: "pc-01",
    prompt: "What is the most common delivery method for a phishing attack?",
    options: ["Email", "USB Drive", "Bluetooth", "Physical mail"],
    correctIndex: 0,
    category: "phishing-control",
    difficulty: "easy",
  },
  {
    id: "pc-02",
    prompt:
      "You receive an email from 'support@paypa1.com' asking you to verify your account. What is the red flag?",
    options: [
      "The email has a logo",
      "The domain uses a digit instead of a letter",
      "The email mentions your account",
      "The email has a footer",
    ],
    correctIndex: 1,
    category: "phishing-control",
    difficulty: "easy",
  },
  {
    id: "pc-03",
    prompt: "A spear-phishing attack differs from a regular phishing attack because it:",
    options: [
      "Uses phone calls instead of email",
      "Targets a specific individual or organisation",
      "Only attacks corporate networks",
      "Requires physical access",
    ],
    correctIndex: 1,
    category: "phishing-control",
    difficulty: "medium",
  },
  {
    id: "pc-04",
    prompt:
      "You hover over a link in an email and the status bar shows a different URL than the link text. You should:",
    options: [
      "Click it — hover previews are often wrong",
      "Not click it and report the email",
      "Copy the URL and paste it in a browser",
      "Forward it to a colleague for a second opinion",
    ],
    correctIndex: 1,
    category: "phishing-control",
    difficulty: "easy",
  },
  {
    id: "pc-05",
    prompt: "What is 'vishing'?",
    options: [
      "Phishing via video call",
      "Phishing via voice call or voicemail",
      "Phishing via virtual reality",
      "A type of malware",
    ],
    correctIndex: 1,
    category: "phishing-control",
    difficulty: "medium",
  },
  {
    id: "pc-06",
    prompt:
      "An email urges you to act immediately or your account will be closed. This tactic is called:",
    options: [
      "Pretexting",
      "Baiting",
      "Creating a sense of urgency",
      "Tailgating",
    ],
    correctIndex: 2,
    category: "phishing-control",
    difficulty: "easy",
  },
  {
    id: "pc-07",
    prompt: "Smishing is phishing conducted via which channel?",
    options: ["Email", "SMS / text message", "Social media", "QR codes"],
    correctIndex: 1,
    category: "phishing-control",
    difficulty: "medium",
  },
  {
    id: "pc-08",
    prompt:
      "Which of the following is the BEST first step when you suspect a phishing email?",
    options: [
      "Delete it immediately",
      "Click the unsubscribe link",
      "Report it to your IT/security team",
      "Reply asking if it is legitimate",
    ],
    correctIndex: 2,
    category: "phishing-control",
    difficulty: "easy",
  },
  {
    id: "pc-09",
    prompt:
      "An attacker registers the domain 'microsoft-support.net' to mimic Microsoft. This is known as:",
    options: [
      "Domain squatting / typosquatting",
      "DNS poisoning",
      "ARP spoofing",
      "Man-in-the-middle",
    ],
    correctIndex: 0,
    category: "phishing-control",
    difficulty: "medium",
  },
  {
    id: "pc-10",
    prompt:
      "Business Email Compromise (BEC) typically involves an attacker:",
    options: [
      "Sending mass spam to random addresses",
      "Impersonating an executive or vendor to trick an employee into a fraudulent payment or data transfer",
      "Installing a virus through a USB drive",
      "Flooding a company's email server with traffic",
    ],
    correctIndex: 1,
    category: "phishing-control",
    difficulty: "medium",
  },
  {
    id: "pc-11",
    prompt:
      "You receive an unexpected 'invoice' attachment that asks you to 'enable macros' to view it. This is risky because:",
    options: [
      "Enabling macros can let malicious code run on your computer",
      "It's safe as long as antivirus scanned the file",
      "Macros only ever add formatting to documents",
      "All attachments automatically enable macros",
    ],
    correctIndex: 0,
    category: "phishing-control",
    difficulty: "easy",
  },

  // ── CREDENTIAL HYGIENE ───────────────────────────────────────────────────
  {
    id: "ch-01",
    prompt: "Which of the following is the strongest password?",
    options: [
      "P@ssword1",
      "correct-horse-battery-staple",
      "Admin123!",
      "12345678",
    ],
    correctIndex: 1,
    category: "credential-hygiene",
    difficulty: "easy",
  },
  {
    id: "ch-02",
    prompt: "Why is reusing passwords across multiple sites dangerous?",
    options: [
      "It makes passwords easier to guess",
      "A breach on one site exposes all accounts using the same password",
      "It violates most terms of service",
      "It slows down login servers",
    ],
    correctIndex: 1,
    category: "credential-hygiene",
    difficulty: "easy",
  },
  {
    id: "ch-03",
    prompt: "What is a credential stuffing attack?",
    options: [
      "Guessing passwords using a dictionary",
      "Using leaked username/password pairs from one breach to access other services",
      "Flooding a login page with requests",
      "Installing a keylogger to capture passwords",
    ],
    correctIndex: 1,
    category: "credential-hygiene",
    difficulty: "medium",
  },
  {
    id: "ch-04",
    prompt: "What is the recommended minimum length for a secure password today?",
    options: ["6 characters", "8 characters", "12 characters", "4 characters"],
    correctIndex: 2,
    category: "credential-hygiene",
    difficulty: "easy",
  },
  {
    id: "ch-05",
    prompt: "A password manager is useful because it:",
    options: [
      "Shares passwords with your team automatically",
      "Generates and stores unique strong passwords for each site",
      "Stores passwords in plain text for easy access",
      "Resets your passwords every 30 days",
    ],
    correctIndex: 1,
    category: "credential-hygiene",
    difficulty: "easy",
  },
  {
    id: "ch-06",
    prompt:
      "If your organisation forces you to change your password every 30 days, current best-practice guidance says this policy:",
    options: [
      "Is best practice and should be kept",
      "Is outdated and often leads to weaker, more predictable passwords",
      "Should be shortened to every 7 days",
      "Only applies to admin accounts",
    ],
    correctIndex: 1,
    category: "credential-hygiene",
    difficulty: "medium",
  },
  {
    id: "ch-07",
    prompt:
      "A passphrase like 'correct-horse-battery-staple' is often more secure than a short complex password because it:",
    options: [
      "Is always case-insensitive",
      "Doesn't need to be unique per site",
      "Bypasses the need for MFA",
      "Is longer, making it much harder to brute-force, while staying memorable",
    ],
    correctIndex: 3,
    category: "credential-hygiene",
    difficulty: "easy",
  },
  {
    id: "ch-08",
    prompt: "Locking an account after several failed login attempts primarily helps to:",
    options: [
      "Punish the legitimate user for typos",
      "Slow down or prevent attackers from guessing passwords via brute force",
      "Make the user reset their device",
      "Speed up the login process",
    ],
    correctIndex: 1,
    category: "credential-hygiene",
    difficulty: "medium",
  },

  // ── SOCIAL ENGINEERING ───────────────────────────────────────────────────
  {
    id: "se-01",
    prompt: "A stranger follows you through a secure door without badging in. This is called:",
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
    prompt: "Which psychological principle do social engineers most commonly exploit?",
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
    prompt: "Searching through discarded documents and media for sensitive information is called:",
    options: ["Shoulder surfing", "Tailgating", "Dumpster diving", "Baiting"],
    correctIndex: 2,
    category: "social-engineering",
    difficulty: "medium",
  },
  {
    id: "se-07",
    prompt: "A watering hole attack targets:",
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
  {
    id: "se-08",
    prompt: "A 'quid pro quo' social engineering attack works by:",
    options: [
      "Following someone through a locked door",
      "Offering a service or benefit (like 'free IT help') in exchange for information or access",
      "Searching through someone's trash",
      "Sending a mass phishing email to a whole company",
    ],
    correctIndex: 1,
    category: "social-engineering",
    difficulty: "medium",
  },
  {
    id: "se-09",
    prompt:
      "An attacker creates a fake social media profile of your colleague to message you and build trust. This is:",
    options: [
      "A form of social engineering used to gain trust and extract information",
      "Always just a harmless marketing account",
      "Automatically verified and blocked by the platform",
      "Not a security concern since profiles are public",
    ],
    correctIndex: 0,
    category: "social-engineering",
    difficulty: "easy",
  },

  // ── INCIDENT RESPONSE / COUNTERMEASURES ─────────────────────────────────
  {
    id: "ir-01",
    prompt: "What does MFA stand for?",
    options: [
      "Multiple Firewall Access",
      "Multi-Factor Authentication",
      "Managed File Access",
      "Monitored Firewall Activity",
    ],
    correctIndex: 1,
    category: "incident-response",
    difficulty: "easy",
  },
  {
    id: "ir-02",
    prompt: "The principle of least privilege means:",
    options: [
      "Giving every user admin rights for efficiency",
      "Granting users only the minimum access required for their role",
      "Restricting internet access for all users",
      "Requiring two people to approve every action",
    ],
    correctIndex: 1,
    category: "incident-response",
    difficulty: "medium",
  },
  {
    id: "ir-03",
    prompt: "Why should software be patched promptly?",
    options: [
      "To add new features",
      "To close known vulnerabilities before attackers can exploit them",
      "To improve performance only",
      "Patches are optional security theatre",
    ],
    correctIndex: 1,
    category: "incident-response",
    difficulty: "easy",
  },
  {
    id: "ir-04",
    prompt: "What is the '3-2-1 backup rule'?",
    options: [
      "3 passwords, 2 devices, 1 cloud account",
      "3 copies of data, on 2 different media, with 1 stored offsite",
      "Back up every 3 days, keep 2 versions, 1 encrypted",
      "3 users approving backups, 2 locations, 1 weekly test",
    ],
    correctIndex: 1,
    category: "incident-response",
    difficulty: "medium",
  },
  {
    id: "ir-05",
    prompt: "Locking your screen when you step away from your desk is important because:",
    options: [
      "It saves battery",
      "It prevents unauthorised access to your open sessions and files",
      "It is required by all operating systems",
      "It speeds up your computer",
    ],
    correctIndex: 1,
    category: "incident-response",
    difficulty: "easy",
  },
  {
    id: "ir-06",
    prompt: "If you suspect your account has been compromised, what should you do FIRST?",
    options: [
      "Wait to see if anything bad happens",
      "Change your password and enable MFA immediately, then report it",
      "Delete the account",
      "Reformat your computer",
    ],
    correctIndex: 1,
    category: "incident-response",
    difficulty: "easy",
  },
  {
    id: "ir-07",
    prompt: "You discover ransomware on your machine. The FIRST thing you should do is:",
    options: [
      "Pay the ransom immediately",
      "Disconnect the device from the network to contain the spread",
      "Reboot the computer",
      "Email your IT team from the infected machine",
    ],
    correctIndex: 1,
    category: "incident-response",
    difficulty: "medium",
  },
  {
    id: "ir-08",
    prompt: "Why is it important to report security incidents quickly?",
    options: [
      "To avoid personal blame",
      "Early reporting limits damage and allows faster containment",
      "It is not important — IT will find it eventually",
      "Only major incidents need reporting",
    ],
    correctIndex: 1,
    category: "incident-response",
    difficulty: "easy",
  },
  {
    id: "ir-09",
    prompt: "A 'data breach' is best defined as:",
    options: [
      "Any system outage affecting data access",
      "Unauthorised access to or disclosure of protected data",
      "Accidental deletion of files",
      "A failed login attempt",
    ],
    correctIndex: 1,
    category: "incident-response",
    difficulty: "medium",
  },
  {
    id: "ir-10",
    prompt: "Which of the following is the strongest form of multi-factor authentication?",
    options: [
      "SMS one-time code",
      "Email link",
      "A physical security key you carry",
      "A security question",
    ],
    correctIndex: 2,
    category: "incident-response",
    difficulty: "hard",
  },
  {
    id: "ir-11",
    prompt: "Having a written incident response plan mainly helps an organisation to:",
    options: [
      "Guarantee it is never attacked",
      "Respond quickly, consistently, and effectively when an incident does occur",
      "Replace the need for backups",
      "Avoid ever having to report an incident",
    ],
    correctIndex: 1,
    category: "incident-response",
    difficulty: "easy",
  },
  {
    id: "ir-12",
    prompt:
      "You click a link during a company phishing-awareness simulation and realise it wasn't a real threat. What should you do?",
    options: [
      "Ignore it and hope no one noticed",
      "Complete any follow-up training and treat it as a learning opportunity, as intended",
      "Clear your browser history",
      "Blame IT for running the test",
    ],
    correctIndex: 1,
    category: "incident-response",
    difficulty: "easy",
  },
];

// ── Helper utilities ──────────────────────────────────────────────────────────

/**
 * Returns `count` questions chosen at random from the bank,
 * with no repeats where possible. Optionally filter by category or difficulty.
 *
 * If the pool of *unused* questions (after `exclude`) is smaller than
 * `count`, this recycles previously-used questions instead of returning
 * fewer than requested. That's a deliberate trade-off: a repeated question
 * late in a bracket is far better than a live match silently stalling
 * because `buildNextQuestion` got `undefined` back.
 */
export function pickRandomQuestions(
  count: number,
  opts?: {
    exclude?: string[]; // question IDs already used in this session
    categories?: TournamentQuestion["category"][];
    difficulties?: TournamentQuestion["difficulty"][];
  },
): TournamentQuestion[] {
  // Base pool after category/difficulty filters only — this is what we
  // fall back to if we run out of "fresh" (unused) questions.
  let basePool = QUESTION_BANK;
  if (opts?.categories?.length) {
    const cats = new Set(opts.categories);
    basePool = basePool.filter((q) => cats.has(q.category));
  }
  if (opts?.difficulties?.length) {
    const diffs = new Set(opts.difficulties);
    basePool = basePool.filter((q) => diffs.has(q.difficulty));
  }

  let pool = basePool;
  if (opts?.exclude?.length) {
    const excluded = new Set(opts.exclude);
    pool = pool.filter((q) => !excluded.has(q.id));
  }

  // Not enough unused questions left to fill this request — recycle from
  // the full (filtered) pool rather than silently returning too few and
  // stalling a live match.
  if (pool.length < count) {
    console.warn(
      `[questionBank] Only ${pool.length} unused question(s) available but ${count} requested — recycling previously used questions.`,
    );
    pool = basePool;
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