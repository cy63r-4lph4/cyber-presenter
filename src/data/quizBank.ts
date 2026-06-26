export type QuizTemplate = {
  id: string;
  category: "phishing" | "password" | "social-engineering" | "incident-response" | "threat-vectors";
  difficulty: "easy" | "medium" | "hard";
  prompt: string;
  options: string[];
  correctIndex: number;
};

export const QUIZ_BANK: QuizTemplate[] = [
  // ── Phishing ───────────────────────────────────────────────────────────────
  {
    id: "ph-01",
    category: "phishing",
    difficulty: "easy",
    prompt: "An email from 'support@paypa1.com' asks you to verify your account urgently. What's the biggest red flag?",
    options: [
      "The email has a logo",
      "The sender domain uses the number '1' instead of the letter 'l'",
      "The email mentions your account",
      "It arrived on a Monday",
    ],
    correctIndex: 1,
  },
  {
    id: "ph-02",
    category: "phishing",
    difficulty: "medium",
    prompt: "You receive a WhatsApp message from your CEO asking you to buy gift cards urgently and send the codes. What should you do first?",
    options: [
      "Buy the cards — it's the CEO",
      "Ignore it completely",
      "Verify by calling the CEO directly on a known number",
      "Reply asking for more details",
    ],
    correctIndex: 2,
  },
  {
    id: "ph-03",
    category: "phishing",
    difficulty: "medium",
    prompt: "A phishing email tries to create a sense of urgency. Why is urgency such an effective tactic?",
    options: [
      "It makes the email look more professional",
      "It bypasses spam filters",
      "It pressures victims into acting before thinking critically",
      "It increases email open rates",
    ],
    correctIndex: 2,
  },
  {
    id: "ph-04",
    category: "phishing",
    difficulty: "hard",
    prompt: "What distinguishes spear phishing from regular phishing?",
    options: [
      "Spear phishing uses more malware",
      "Spear phishing is targeted at specific individuals using personalised information",
      "Spear phishing only happens via SMS",
      "Spear phishing always involves fake login pages",
    ],
    correctIndex: 1,
  },
  {
    id: "ph-05",
    category: "phishing",
    difficulty: "hard",
    prompt: "A link in an email shows 'https://bank.com.verify-login.ru/secure'. Which part tells you this is NOT a legitimate bank site?",
    options: [
      "The use of HTTPS",
      "The word 'secure' in the path",
      "The actual domain is 'verify-login.ru', not 'bank.com'",
      "The path contains a hyphen",
    ],
    correctIndex: 2,
  },

  // ── Password Security ──────────────────────────────────────────────────────
  {
    id: "pw-01",
    category: "password",
    difficulty: "easy",
    prompt: "Why is reusing the same password across multiple sites dangerous?",
    options: [
      "It makes your password easier to forget",
      "If one site is breached, attackers can access all your other accounts",
      "It slows down your internet connection",
      "It violates most websites' terms of service",
    ],
    correctIndex: 1,
  },
  {
    id: "pw-02",
    category: "password",
    difficulty: "easy",
    prompt: "Which of these is the strongest password?",
    options: [
      "Password123!",
      "MyDog2015",
      "Tr0ub4dor&3",
      "correct-horse-battery-staple-76",
    ],
    correctIndex: 3,
  },
  {
    id: "pw-03",
    category: "password",
    difficulty: "medium",
    prompt: "What is a credential stuffing attack?",
    options: [
      "Guessing passwords using a dictionary of common words",
      "Using leaked username/password pairs from one breach to log into other sites",
      "Installing a keylogger to capture passwords as they're typed",
      "Flooding a login page with requests to lock out users",
    ],
    correctIndex: 1,
  },
  {
    id: "pw-04",
    category: "password",
    difficulty: "medium",
    prompt: "A colleague says they use the same strong password everywhere because 'it's too hard to remember many passwords'. What's the best advice?",
    options: [
      "That's fine as long as the password is complex enough",
      "Use a password manager to generate and store unique passwords for each site",
      "Write the passwords in a notebook kept at their desk",
      "Add the site name to the end of the password for each account",
    ],
    correctIndex: 1,
  },
  {
    id: "pw-05",
    category: "password",
    difficulty: "hard",
    prompt: "Multi-factor authentication (MFA) is enabled on your account. An attacker has your correct password. What do they still need to gain access?",
    options: [
      "Nothing — the password is sufficient",
      "Your email address",
      "A second factor such as a one-time code, hardware key, or biometric",
      "Your security question answer",
    ],
    correctIndex: 2,
  },

  // ── Social Engineering ─────────────────────────────────────────────────────
  {
    id: "se-01",
    category: "social-engineering",
    difficulty: "easy",
    prompt: "Someone calls claiming to be from IT support and asks for your password to fix a problem. What should you do?",
    options: [
      "Give it to them — IT needs it to help you",
      "Refuse. Legitimate IT staff will never ask for your password",
      "Give them a fake password first to test them",
      "Ask them to email you instead",
    ],
    correctIndex: 1,
  },
  {
    id: "se-02",
    category: "social-engineering",
    difficulty: "medium",
    prompt: "What is 'pretexting' in the context of social engineering?",
    options: [
      "Sending a text message with a malicious link",
      "Creating a fabricated scenario to manipulate someone into giving up information",
      "Previewing a phishing email before sending it",
      "Intercepting text messages between two parties",
    ],
    correctIndex: 1,
  },
  {
    id: "se-03",
    category: "social-engineering",
    difficulty: "medium",
    prompt: "An attacker leaves a USB drive labelled 'Salary Review 2024' in your office car park. What's the likely goal?",
    options: [
      "To lose the drive accidentally",
      "To trick a curious employee into plugging it in, installing malware",
      "To test the company's USB recycling policy",
      "To deliver legitimate files without using email",
    ],
    correctIndex: 1,
  },
  {
    id: "se-04",
    category: "social-engineering",
    difficulty: "hard",
    prompt: "Which psychological principle do social engineers exploit when they say 'Your manager asked me to send this over urgently'?",
    options: [
      "Reciprocity",
      "Scarcity",
      "Authority",
      "Social proof",
    ],
    correctIndex: 2,
  },
  {
    id: "se-05",
    category: "social-engineering",
    difficulty: "hard",
    prompt: "Tailgating is a physical social engineering technique. What does it involve?",
    options: [
      "Following someone's social media to gather information for an attack",
      "Following an authorised person through a secure door without using your own credentials",
      "Tracking someone's vehicle using GPS malware",
      "Copying someone's keycard signal wirelessly",
    ],
    correctIndex: 1,
  },

  // ── Incident Response ──────────────────────────────────────────────────────
  {
    id: "ir-01",
    category: "incident-response",
    difficulty: "easy",
    prompt: "You notice your computer is acting strangely and suspect malware. What's the first thing you should do?",
    options: [
      "Restart the computer and hope it fixes itself",
      "Try to find and delete the malware yourself",
      "Disconnect from the network and report it to IT immediately",
      "Continue working — it's probably nothing",
    ],
    correctIndex: 2,
  },
  {
    id: "ir-02",
    category: "incident-response",
    difficulty: "easy",
    prompt: "You accidentally clicked a phishing link. What should you do?",
    options: [
      "Close the browser tab and forget about it",
      "Report it to your security team immediately, even if nothing seems wrong",
      "Run a quick antivirus scan and carry on",
      "Change just the password for that site",
    ],
    correctIndex: 1,
  },
  {
    id: "ir-03",
    category: "incident-response",
    difficulty: "medium",
    prompt: "What is the primary purpose of isolating an infected machine during an incident?",
    options: [
      "To make it easier for IT to access",
      "To prevent the malware from spreading to other systems on the network",
      "To preserve evidence for legal proceedings",
      "To speed up the reinstallation process",
    ],
    correctIndex: 1,
  },
  {
    id: "ir-04",
    category: "incident-response",
    difficulty: "medium",
    prompt: "A ransomware message appears on your screen demanding payment. Which action could make the situation worse?",
    options: [
      "Disconnecting from the network",
      "Paying the ransom immediately without notifying IT",
      "Taking a photo of the screen for documentation",
      "Calling your IT/security team",
    ],
    correctIndex: 1,
  },
  {
    id: "ir-05",
    category: "incident-response",
    difficulty: "hard",
    prompt: "What does the 'containment' phase of incident response primarily aim to achieve?",
    options: [
      "Permanently removing the threat from all systems",
      "Identifying who was responsible for the attack",
      "Limiting the damage and stopping the incident from spreading further",
      "Restoring systems to normal operation",
    ],
    correctIndex: 2,
  },

  // ── Threat Vectors ─────────────────────────────────────────────────────────
  {
    id: "tv-01",
    category: "threat-vectors",
    difficulty: "easy",
    prompt: "What is a 'man-in-the-middle' (MitM) attack?",
    options: [
      "An attacker physically standing between two computers",
      "An attacker secretly intercepting and potentially altering communication between two parties",
      "A rogue employee stealing data from a shared drive",
      "A brute-force attack on a server's middleware",
    ],
    correctIndex: 1,
  },
  {
    id: "tv-02",
    category: "threat-vectors",
    difficulty: "medium",
    prompt: "You connect to 'FREE_AIRPORT_WIFI' without a VPN. What's the main risk?",
    options: [
      "Slow internet speeds",
      "Higher roaming charges",
      "An attacker on the same network could intercept your unencrypted traffic",
      "Your battery will drain faster",
    ],
    correctIndex: 2,
  },
  {
    id: "tv-03",
    category: "threat-vectors",
    difficulty: "medium",
    prompt: "What makes zero-day vulnerabilities particularly dangerous?",
    options: [
      "They can only be exploited on the first day a system is set up",
      "There is no patch available yet because the vendor is unaware of the flaw",
      "They always result in total data loss",
      "They only affect legacy operating systems",
    ],
    correctIndex: 1,
  },
  {
    id: "tv-04",
    category: "threat-vectors",
    difficulty: "hard",
    prompt: "A supply chain attack compromises software before it reaches the end user. Which real-world incident is an example of this?",
    options: [
      "The WannaCry ransomware outbreak",
      "The SolarWinds Orion breach",
      "The Yahoo email data breach",
      "The Equifax database hack",
    ],
    correctIndex: 1,
  },
  {
    id: "tv-05",
    category: "threat-vectors",
    difficulty: "hard",
    prompt: "What is the core principle behind 'defence in depth'?",
    options: [
      "Having one very strong firewall at the network perimeter",
      "Training all staff to be the primary line of defence",
      "Layering multiple security controls so that if one fails, others still protect the system",
      "Encrypting all data stored on company servers",
    ],
    correctIndex: 2,
  },
];

export const QUIZ_CATEGORIES = [
  { id: "phishing",           label: "Phishing",           color: "text-rose-400    border-rose-400/20    bg-rose-950/20"    },
  { id: "password",           label: "Password Security",  color: "text-cyan-400    border-cyan-400/20    bg-cyan-950/20"    },
  { id: "social-engineering", label: "Social Engineering", color: "text-amber-400   border-amber-400/20   bg-amber-950/20"   },
  { id: "incident-response",  label: "Incident Response",  color: "text-emerald-400 border-emerald-400/20 bg-emerald-950/20" },
  { id: "threat-vectors",     label: "Threat Vectors",     color: "text-violet-400  border-violet-400/20  bg-violet-950/20"  },
] as const;

export type QuizCategory = typeof QUIZ_CATEGORIES[number]["id"];