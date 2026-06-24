import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Link2, 
  FileText, 
  FileCode, 
  Copy, 
  Check, 
  RefreshCw, 
  Layers, 
  Eye, 
  AlertCircle,
  FileDown,
  Flame,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Info,
  ClipboardCheck,
  ArrowRight,
  Compass,
  ArrowLeft,
  Plus,
  Lock,
  Mail,
  User,
  LogOut,
  Settings,
  Key,
  Clock,
  Users,
  Ban,
  Activity,
  X,
  UserPlus,
  Sparkles,
  Database
} from 'lucide-react';

const loadExternalLibraries = () => {
  return new Promise((resolve) => {
    let mammothLoaded = !!window.mammoth;
    let jspdfLoaded = !!window.jspdf;

    const checkAndResolve = () => {
      if (window.mammoth && window.jspdf) {
        resolve(true);
      }
    };

    if (mammothLoaded && jspdfLoaded) {
      resolve(true);
      return;
    }

    if (!window.mammoth) {
      const mammothScript = document.createElement('script');
      mammothScript.src = "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.21/mammoth.browser.min.js";
      mammothScript.onload = () => {
        mammothLoaded = true;
        checkAndResolve();
      };
      document.head.appendChild(mammothScript);
    }

    if (!window.jspdf) {
      const jspdfScript = document.createElement('script');
      jspdfScript.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      jspdfScript.onload = () => {
        jspdfLoaded = true;
        checkAndResolve();
      };
      document.head.appendChild(jspdfScript);
    }
  });
};

export default function App() {
  const [viewState, setViewState] = useState(() => {
    const savedLocal = localStorage.getItem('copySurge_currentUser');
    const savedSession = sessionStorage.getItem('copySurge_currentUser');
    return (savedLocal || savedSession) ? 'home' : 'auth';
  }); 
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [currentUser, setCurrentUser] = useState(() => {
    const savedLocal = localStorage.getItem('copySurge_currentUser');
    const savedSession = sessionStorage.getItem('copySurge_currentUser');
    return savedLocal ? JSON.parse(savedLocal) : (savedSession ? JSON.parse(savedSession) : null);
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTool, setActiveTool] = useState('funnels'); 
  const [libsReady, setLibsReady] = useState(false);

  // ==========================================
  // AGENCY ACCESS CONTROL & API KEYS
  // ==========================================
  const MASTER_PASSCODE = "spasurge2026"; 

  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem('copySurge_geminiApiKey') || '';
  });

  const [selectedModel, setSelectedModel] = useState(() => {
    return localStorage.getItem('copySurge_selectedModel') || 'gemini-1.5-flash';
  });

  const [settingsTab, setSettingsTab] = useState('api'); // default to 'api' to let them paste their key instantly

  const initialUsers = {
    "jm@spasurgemarketing.com": { name: "Jm", password: "$p@$urg3@lph@$2026!", role: "admin", status: "active" },
    "kyleigh@spasurgemarketing.com": { name: "Kyleigh", password: "$p@$urg3@lph@$2026!", role: "user", status: "active" },
    "garen@spasurgemarketing.com": { name: "Garen", password: "$p@$urg3@lph@$2026!", role: "user", status: "active" },
    "garen.spasurge@gmail.com": { name: "Garen", password: "$p@$urg3@lph@$2026!", role: "user", status: "active" }
  };

  const [userDB, setUserDB] = useState(() => {
    const saved = localStorage.getItem('copySurge_userDB');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [activityLogs, setActivityLogs] = useState(() => {
    const saved = localStorage.getItem('copySurge_activityLogs');
    return saved ? JSON.parse(saved) : [];
  });

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ old: '', new: '', confirm: '' });
  const [adminTab, setAdminTab] = useState('activity'); 
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', password: '', role: 'user' });
  // ==========================================

  // Global inputs shared between both tools
  const [clientName, setClientName] = useState('');
  const [product, setProduct] = useState(['Hot Tub']); // Multi-select array
  const [category, setCategory] = useState('Evergreen'); 
  const [holidayName, setHolidayName] = useState('');
  const [customAngle, setCustomAngle] = useState('');
  const [referenceText, setReferenceText] = useState('');
  const [urls, setUrls] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  // Specific toggles
  const [includeFinancing, setIncludeFinancing] = useState(false);

  // Drag-and-drop state indicators
  const [isDragging, setIsDragging] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [apiError, setApiError] = useState(null);
  const [successToast, setSuccessToast] = useState('');

  // Funnels Architecture Data Output Structures
  const [funnelsGenerated, setFunnelsGenerated] = useState(false);
  const [funnelsCopy, setFunnelsCopy] = useState({
    optIn: {
      preHeadline: "",
      headline: "",
      subheadline: "",
      introText: "",
      valueHook: "",
      benefits: ["", "", ""],
      productShowcase: {
        headline: "",
        subheadline: "",
        item1: "",
        item2: ""
      },
      urgencyText: "",
      ctaButtonText: ""
    },
    popUpForm: {
      headline: "",
      subheadline: "",
      nameFieldLabel: "",
      emailFieldLabel: "",
      phoneFieldLabel: "",
      complianceLabel: "",
      buttonText: ""
    },
    thankYou: {
      headline: "",
      subheadline: "",
      nextSteps: "",
      calendarBooking: {
        headline: "",
        subheadline: "",
        ctaButtonText: ""
      }
    }
  });

  // Ads Suite Output Structures
  const [adsGenerated, setAdsGenerated] = useState(false);
  const [adsSuite, setAdsSuite] = useState([]);

  const [regenIndices, setRegenIndices] = useState({});
  const [copiedBlock, setCopiedBlock] = useState(null);
  const [activeFunnelTab, setActiveFunnelTab] = useState('optIn');

  const logActivity = (toolName, actionDesc, clientData) => {
    if (!currentUser) return;
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      userName: currentUser.name,
      email: currentUser.email,
      tool: toolName,
      action: actionDesc,
      client: clientData || 'Unspecified Client'
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      triggerToast("New passwords do not match.");
      return;
    }
    const userRecord = userDB[currentUser.email];
    if (userRecord.password !== passwordForm.old) {
      triggerToast("Incorrect current password.");
      return;
    }
    
    setUserDB(prev => ({
      ...prev,
      [currentUser.email]: {
        ...prev[currentUser.email],
        password: passwordForm.new
      }
    }));
    
    triggerToast("Password successfully updated!");
    setShowSettingsModal(false);
    setPasswordForm({ old: '', new: '', confirm: '' });
  };

  const handleToggleUserStatus = (email) => {
    setUserDB(prev => {
      const user = prev[email];
      return {
        ...prev,
        [email]: {
          ...user,
          status: user.status === 'active' ? 'suspended' : 'active'
        }
      };
    });
    triggerToast(`Account status updated for ${email}`);
  };

  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    const emailKey = newUserForm.email.toLowerCase();
    
    if (userDB[emailKey]) {
      triggerToast("A user with this email already exists.");
      return;
    }

    setUserDB(prev => ({
      ...prev,
      [emailKey]: {
        name: newUserForm.name,
        password: newUserForm.password,
        role: newUserForm.role,
        status: 'active'
      }
    }));
    
    triggerToast(`Successfully added user: ${newUserForm.name}`);
    setShowAddUserModal(false);
    setNewUserForm({ name: '', email: '', password: '', role: 'user' });
  };

  useEffect(() => {
    loadExternalLibraries().then(() => {
      setLibsReady(true);
    });
  }, []);

  // Persist local database states
  useEffect(() => {
    localStorage.setItem('copySurge_userDB', JSON.stringify(userDB));
  }, [userDB]);

  useEffect(() => {
    localStorage.setItem('copySurge_activityLogs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('copySurge_geminiApiKey', geminiApiKey);
  }, [geminiApiKey]);

  useEffect(() => {
    localStorage.setItem('copySurge_selectedModel', selectedModel);
  }, [selectedModel]);

  const triggerToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast('');
    }, 4000);
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (authMode === 'login') {
      if (!authForm.email || !authForm.password) {
        triggerToast("Please enter both email and password.");
        return;
      }
      
      const emailKey = authForm.email.toLowerCase();
      const userRecord = userDB[emailKey];

      const saveSession = (userData) => {
        if (rememberMe) {
          localStorage.setItem('copySurge_currentUser', JSON.stringify(userData));
        } else {
          sessionStorage.setItem('copySurge_currentUser', JSON.stringify(userData));
        }
      };

      if (userRecord) {
        if (userRecord.status !== 'active') {
          triggerToast("Access Denied: Your account has been suspended by the Admin.");
          return;
        }
        if (userRecord.password === authForm.password || authForm.password === MASTER_PASSCODE) {
          const userData = { name: userRecord.name, email: emailKey, role: userRecord.role };
          setCurrentUser(userData);
          saveSession(userData);
          triggerToast(`Hey, ${userRecord.name}!`);
          setViewState('home');
          return;
        }
      } else if (authForm.password === MASTER_PASSCODE) {
        let finalName = emailKey.split('@')[0];
        finalName = finalName.charAt(0).toUpperCase() + finalName.slice(1);
        const userData = { name: finalName, email: authForm.email, role: 'user' };
        setCurrentUser(userData);
        saveSession(userData);
        triggerToast(`Hey, ${finalName}!`);
        setViewState('home');
        return;
      }
      
      triggerToast("Access Denied: Invalid credentials.");
    } else {
      if (!authForm.name || !authForm.email || !authForm.password) {
        triggerToast("Please fill in all registration fields.");
        return;
      }
      
      triggerToast(`Access request recorded for ${authForm.email}. The Admin will review this shortly.`);
      setAuthMode('login');
      setAuthForm({ name: '', email: '', password: '' });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('copySurge_currentUser');
    sessionStorage.removeItem('copySurge_currentUser');
    setAuthForm({ name: '', email: '', password: '' });
    setViewState('auth');
    setFunnelsGenerated(false);
    setAdsGenerated(false);
    triggerToast("Logged out successfully.");
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
    e.target.value = '';
  };

  const processFiles = async (files) => {
    if (!files.length) return;

    for (const file of files) {
      const fileObj = {
        name: file.name,
        type: file.type,
        size: (file.size / 1024).toFixed(1) + ' KB',
        content: null,
        base64: null,
        isPDF: file.type === 'application/pdf'
      };

      try {
        if (file.type === 'text/plain') {
          const text = await readFileAsText(file);
          fileObj.content = text;
          setUploadedFiles(prev => [...prev, fileObj]);
        } else if (file.type === 'application/pdf') {
          const base64 = await readFileAsDataURL(file);
          const cleanBase64 = base64.split(',')[1];
          fileObj.base64 = cleanBase64;
          setUploadedFiles(prev => [...prev, fileObj]);
        } else if (file.name.endsWith('.docx')) {
          if (!window.mammoth) {
            triggerToast("Document parser is loading... please drop again in a second.");
            continue;
          }
          const arrayBuffer = await readFileAsArrayBuffer(file);
          const result = await window.mammoth.extractRawText({ arrayBuffer });
          fileObj.content = result.value;
          setUploadedFiles(prev => [...prev, fileObj]);
        } else {
          const text = await readFileAsText(file);
          fileObj.content = text;
          setUploadedFiles(prev => [...prev, fileObj]);
        }
        triggerToast(`Imported context: ${file.name}`);
      } catch (err) {
        console.error("File loading error:", err);
        triggerToast(`Failed reading system file: ${file.name}`);
      }
    }
  };

  const readFileAsText = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });

  const readFileAsDataURL = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const readFileAsArrayBuffer = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const triggerCopyGeneration = async () => {
    if (product.length === 0) {
      triggerToast("Please select at least one Product Range.");
      return;
    }

    const apiKey = geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || "";
    if (!apiKey) {
      setApiError("Configuration Missing: Google Gemini API Key is missing. Click on settings in the top right to paste your Gemini API Key.");
      return;
    }

    setIsGenerating(true);
    setApiError(null);
    setGenerationStep('Booting copywriting context models...');

    try {
      const textReferences = uploadedFiles
        .filter(f => !f.isPDF)
        .map(f => `FILE: ${f.name}\nCONTENT:\n${f.content}`)
        .join('\n\n');

      const mergedReferences = [referenceText, urls, textReferences].filter(Boolean).join('\n\n');
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

      const clientNameText = clientName || '[Client Name]';
      const targetProducts = product.join(' & ');

      let promptPayload = "";
      let systemInstruction = "";

      if (activeTool === 'funnels') {
        setGenerationStep('Drafting high-ticket sensory funnel blueprints...');
        
        systemInstruction = `
You are an elite, world-class conversion copywriting specialist drafting direct-response architectures for luxury and home wellness dealers.

STRATEGIC DIRECTIVES:
1. TARGET FOCUS: Products: ${targetProducts}. Blend psychological outcomes precisely for these items (e.g. decompression for hot tubs, fitness for swim spas, cryo/dopamine for cold plunge, heat-shock/detox for sauna).
2. REQUIRED FUNNEL STRUCTURE:
   - Part 1: Opt-In Landing Page. MUST include a pre-headline (kicker), main headline, and subheadline. The kicker and headline must summarize the subheadline and content compellingly. MUST include a Product Showcase section promoting specific units.
   - Part 1.A: Form Pop-Out designed for fast opt-ins. MUST enforce compliance check labels (Privacy policy/SMS consent).
   - Part 2: Thank You Page. MUST include a calendar booking module for a physical showroom visit.
3. DO NOT invent absolute prices or regional discounts unless detailed in reference text, otherwise utilize clean brackets like [INSERT DEALER SPECIAL].

Return strictly clean, valid, parseable JSON only matching the schema below. No markdown blocks.
`;

        promptPayload = `
Generate a complete Funnel Copy Suite for:
- Client Dealer: ${clientNameText}
- Core Product Range: ${targetProducts}
- Theme Hook: ${category} (Holiday: ${holidayName}, Custom Angle: ${customAngle})

REFERENCE ASSETS:
${mergedReferences || 'Use generic premium wellness specs with bracketed dealer instructions.'}

JSON EXPECTED STRUCTURE:
{
  "optIn": {
    "preHeadline": "SHORT ALL-CAPS SUMMARIZED VALUE KICKER",
    "headline": "COMPELLING HEADLINE SUMMARIZING ENTIRE DEAL DETAILS",
    "subheadline": "Benefit-driven supporting subheadline",
    "introText": "First body paragraph capturing emotional/physical state.",
    "valueHook": "Second body paragraph displaying the high-ticket outcome.",
    "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
    "productShowcase": {
      "headline": "Showcase Series Title",
      "subheadline": "Showcase supporting line",
      "item1": "Dynamic benefits highlighting product 1",
      "item2": "Dynamic benefits highlighting product 2"
    },
    "urgencyText": "Supply boundaries or deadlines.",
    "ctaButtonText": "Urgent call to action"
  },
  "popUpForm": {
    "headline": "Clear Form Header",
    "subheadline": "Zero-friction statement",
    "nameFieldLabel": "Full name input label",
    "emailFieldLabel": "Primary email input label",
    "phoneFieldLabel": "Mobile contact label",
    "complianceLabel": "By checking, you agree to our privacy policy and receive SMS updates.",
    "buttonText": "Action-oriented form submission"
  },
  "thankYou": {
    "headline": "Excited Confirmation",
    "subheadline": "Next-step emails explanation",
    "nextSteps": "Direct call-to-action urging physical wet-test booking.",
    "calendarBooking": {
      "headline": "Calendar Booking Hook Headline",
      "subheadline": "Benefits of booking immediately",
      "ctaButtonText": "Calendar submission CTA"
    }
  }
}
`;
      } else {
        setGenerationStep('Formatting conversion concepts and high-impact overlay text rules...');
        
        systemInstruction = `
You are an elite, conversion-focused direct-response advertising copywriter drafting copy strictly for Static Image Ads.
No captions, no hashtags. Return ONLY high-impact copy layers that will live directly inside the graphic designer's ad canvas template.

CONSTRAINTS:
1. Stripped Copy Structure: Headline overlay, Subheadline overlay, and CTA. DO NOT output design instructions or strategy rationales in the final arrays—only the pure text overlays and conversion strategy mapping.
2. Provide exactly 4 high-converting variations mapping to diverse buyer psychology angles for the products: ${targetProducts}.
3. ${includeFinancing ? "CRITICAL: You MUST include angles heavily highlighting FINANCING, LOW MONTHLY PAYMENTS, or 0% APR." : "Focus on physical benefits and wellness outcomes."}

Return strictly valid JSON array of objects. No markdown frames. No preamble.
`;

        promptPayload = `
Generate exactly 4 distinct Static Ad variations for:
- Client Dealer: ${clientNameText}
- Core Product Range: ${targetProducts} 
- Theme Hook: ${category} (Holiday: ${holidayName}, Custom Angle: ${customAngle})

REFERENCE ASSETS:
${mergedReferences || 'Use generic premium specs with bracketed dealer instructions.'}

JSON STRUCTURE REQUIRED (List of exactly 4 ad components):
[
  {
    "id": "ad_v1",
    "angle": "Specific psychological angle focus",
    "framework": "PAS, AIDA, BAB, etc",
    "headline": "HIGH IMPACT HEADLINE OVERLAY",
    "subheadline": "Short emotional supporting overlay text",
    "cta": "URGENT CTA TEXT",
    "copyReco": "Explains the psychological conversion logic and why this copy triggers clicks."
  }
]
`;
      }

      setGenerationStep('Analyzing reference datasets...');
      const pdfFiles = uploadedFiles.filter(f => f.isPDF);
      const promptParts = [promptPayload];

      pdfFiles.forEach(f => {
        promptParts.push({
          inlineData: {
            mimeType: "application/pdf",
            data: f.base64
          }
        });
        promptParts.push(`Accompanying native client PDF spec file named "${f.name}". Ground details to this source.`);
      });

      const payload = {
        contents: [{
          role: "user",
          parts: promptParts.map(p => typeof p === 'string' ? { text: p } : p)
        }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3
        },
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        }
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Access forbidden (403). Your API Key might be invalid, expired, or restricted to certain models. Please check your settings.");
        } else if (response.status === 404) {
          throw new Error(`Model not found (404). The selected model "${selectedModel}" may not be available on your API key yet. Try switching to "gemini-1.5-flash" in settings.`);
        }
        throw new Error(`Google API returned status ${response.status}`);
      }
      
      const result = await response.json();
      const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!jsonText) throw new Error("No payload parsed from the copy engine.");

      const parsedData = JSON.parse(jsonText.trim());

      if (activeTool === 'funnels') {
        setFunnelsCopy({
          optIn: {
            preHeadline: parsedData.optIn?.preHeadline || "",
            headline: parsedData.optIn?.headline || "",
            subheadline: parsedData.optIn?.subheadline || "",
            introText: parsedData.optIn?.introText || "",
            valueHook: parsedData.optIn?.valueHook || "",
            productShowcase: {
              headline: parsedData.optIn?.productShowcase?.headline || "Premium Showroom Lineup",
              subheadline: parsedData.optIn?.productShowcase?.subheadline || "Discover absolute physical decompression",
              item1: parsedData.optIn?.productShowcase?.item1 || "",
              item2: parsedData.optIn?.productShowcase?.item2 || ""
            },
            benefits: parsedData.optIn?.benefits || [],
            urgencyText: parsedData.optIn?.urgencyText || "",
            ctaButtonText: parsedData.optIn?.ctaButtonText || ""
          },
          popUpForm: {
            headline: parsedData.popUpForm?.headline || "",
            subheadline: parsedData.popUpForm?.subheadline || "",
            nameFieldLabel: parsedData.popUpForm?.nameFieldLabel || "",
            emailFieldLabel: parsedData.popUpForm?.emailFieldLabel || "",
            phoneFieldLabel: parsedData.popUpForm?.phoneFieldLabel || "",
            complianceLabel: parsedData.popUpForm?.complianceLabel || "Privacy policy & SMS consent required.",
            buttonText: parsedData.popUpForm?.buttonText || ""
          },
          thankYou: {
            headline: parsedData.thankYou?.headline || "",
            subheadline: parsedData.thankYou?.subheadline || "",
            nextSteps: parsedData.thankYou?.nextSteps || "",
            calendarBooking: parsedData.thankYou?.calendarBooking || { headline: "", subheadline: "", ctaButtonText: "" }
          }
        });
        setFunnelsGenerated(true);
        logActivity('Funnels', 'Generated Funnels Suite', clientNameText);
        triggerToast("Funnels structural copy drafted successfully!");
      } else {
        const adsData = Array.isArray(parsedData) ? parsedData : (parsedData.ads || []);
        setAdsSuite(adsData.map((ad, i) => ({
          id: ad.id || `ad_${i}_${Date.now()}`,
          angle: ad.angle || "Ad Angle",
          framework: ad.framework || "PAS",
          headline: ad.headline || "",
          subheadline: ad.subheadline || "",
          cta: ad.cta || "",
          copyReco: ad.copyReco || "Standard conversion structure."
        })));
        setAdsGenerated(true);
        logActivity('Static Ads', 'Generated Ad Suite', clientNameText);
        triggerToast("Static Ad suite drafted successfully!");
      }

    } catch (err) {
      console.error(err);
      setApiError(`Generation Interruption: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateSingleAd = async (index, specificAngle) => {
    const apiKey = geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || "";
    if (!apiKey) {
      triggerToast("API Key is missing. Add it under Settings.");
      return;
    }

    setRegenIndices(prev => ({ ...prev, [index]: true }));
    try {
      const clientNameText = clientName || '[Client Name]';
      const targetProducts = product.join(' & ');
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

      const sysMsg = `You are an elite copywriting expert drafting ONE Static Ad Card overlay. Return ONLY raw JSON.`;
      const query = `
Generate ONE premium direct-response static image ad overlay targeting:
Angle Focus: ${specificAngle}
Client Name: ${clientNameText}
Product Targets: ${targetProducts}
${includeFinancing ? "Prominently feature a financing or monthly payment plan hook." : ""}

Return raw JSON schema ONLY:
{
  "headline": "CLEAN ULTRA HIGH IMPACT OVERLAY",
  "subheadline": "Emotional benefit text overlay",
  "cta": "CTA BUTTON OVERLAY TEXT",
  "copyReco": "Psychological strategy used"
}
`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: query }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
          systemInstruction: { parts: [{ text: sysMsg }] }
        })
      });

      if (!response.ok) throw new Error();
      const rawRes = await response.json();
      const textVal = rawRes.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textVal) {
        const adObj = JSON.parse(textVal.trim());
        setAdsSuite(prev => {
          const fresh = [...prev];
          fresh[index] = {
            ...fresh[index],
            headline: adObj.headline || fresh[index].headline,
            subheadline: adObj.subheadline || fresh[index].subheadline,
            cta: adObj.cta || fresh[index].cta,
            copyReco: adObj.copyReco || fresh[index].copyReco
          };
          return fresh;
        });
        logActivity('Static Ads', `Regenerated Ad Variation (${specificAngle})`, clientNameText);
        triggerToast(`Regenerated Ad Variation #${index + 1}!`);
      }
    } catch (err) {
      console.error(err);
      triggerToast("Failed to refresh individual variation.");
    } finally {
      setRegenIndices(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleFunnelFieldChange = (section, key, val) => {
    setFunnelsCopy(prev => {
      const draft = { ...prev };
      if (!key) draft[section] = val;
      else draft[section] = { ...draft[section], [key]: val };
      return draft;
    });
  };

  const handleAdFieldChange = (index, key, val) => {
    setAdsSuite(prev => {
      const fresh = [...prev];
      fresh[index] = { ...fresh[index], [key]: val };
      return fresh;
    });
  };

  const addCustomAdCard = () => {
    setAdsSuite(prev => [
      ...prev,
      {
        id: `custom_ad_${Date.now()}`,
        angle: "Custom Promotional Angle",
        framework: "AIDA",
        headline: "CUSTOM CONVERSION STATEMENT HERE",
        subheadline: "Explain what they get or what pain drops here instantly.",
        cta: "RESERVE MY VOUCHER TODAY",
        copyReco: "Direct value connection."
      }
    ]);
    triggerToast("Created new customized ad slot!");
  };

  const assembleFunnelsPlainText = () => {
    return `===================================================================
COPYSURGE — THE ULTIMATE AI COPY ENGINE
CLIENT: ${(clientName || 'PROSPECT DEALER').toUpperCase()}
TARGET FOCUS: ${product.join(', ').toUpperCase()}
CAMPAIGN ANGLE: ${category.toUpperCase()}
===================================================================

1. OPT-IN PAGE DRAFT
-------------------------------------------------------------------
[PRE-HEADLINE / KICKER]
${funnelsCopy.optIn.preHeadline}

[MAIN HEADLINE]
${funnelsCopy.optIn.headline}

[SUBHEADLINE]
${funnelsCopy.optIn.subheadline}

[PAGE HOOK INTRO]
${funnelsCopy.optIn.introText}

${funnelsCopy.optIn.valueHook}

[CORE OUTCOME BENEFITS]
${funnelsCopy.optIn.benefits.map((b) => `• ${b}`).join('\n')}

[ALWAYS-ON PRODUCT SHOWCASE]
- ${funnelsCopy.optIn.productShowcase.headline}: ${funnelsCopy.optIn.productShowcase.subheadline}
• ${funnelsCopy.optIn.productShowcase.item1}
• ${funnelsCopy.optIn.productShowcase.item2}

[URGENCY & BOUNDS]
${funnelsCopy.optIn.urgencyText}

[CTA BUTTON TEXT]
${funnelsCopy.optIn.ctaButtonText}

1.A. FORM POP-OUT COORDINATES
-------------------------------------------------------------------
[FORM HEADER]
${funnelsCopy.popUpForm.headline}

[FORM TRUST SUBHEADER]
${funnelsCopy.popUpForm.subheadline}

[INPUT LABELS]
- Name field: ${funnelsCopy.popUpForm.nameFieldLabel}
- Email address field: ${funnelsCopy.popUpForm.emailFieldLabel}
- Mobile phone field: ${funnelsCopy.popUpForm.phoneFieldLabel}

[PRIVACY POLICY COMPLIANCE VALUE]
${funnelsCopy.popUpForm.complianceLabel}

[POP-UP FORM SUBMIT]
${funnelsCopy.popUpForm.buttonText}

2. THANK YOU PAGE & SCHEDULER
-------------------------------------------------------------------
[VOUCHER VALIDATION HEADLINE]
${funnelsCopy.thankYou.headline}

[CONFIRMATION ROUTE SUBHEADER]
${funnelsCopy.thankYou.subheadline}

[NEXT STEPS VALUE HOOK]
${funnelsCopy.thankYou.nextSteps}

[OPTIONAL WALKTHROUGH CALENDAR BLOCK]
- Title: ${funnelsCopy.thankYou.calendarBooking.headline}
- Description: ${funnelsCopy.thankYou.calendarBooking.subheadline}
- Action button: ${funnelsCopy.thankYou.calendarBooking.ctaButtonText}

===================================================================
DRAFT COMPLETED BY COPYSURGE
===================================================================`;
  };

  const assembleFunnelsRichHTML = () => {
    return `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1.6; color: #1e293b; max-width: 650px; margin: 0 auto; padding: 30px; background-color: #ffffff;">
        <h1 style="font-size: 24pt; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 15px;">Funnels Architecture Blueprint</h1>
        <p style="font-size: 10pt; color: #64748b; margin-top: 0; margin-bottom: 30px;"><strong>Client:</strong> ${(clientName || 'Prospect Partner').toUpperCase()} | <strong>Focus:</strong> ${product.join(', ')} | <strong>Theme:</strong> ${category}</p>
        
        <h2 style="font-size: 16pt; color: #0d9488; text-transform: uppercase; margin-bottom: 15px;">1. Opt-In Landing Page</h2>
        <p style="font-size: 10pt; color: #64748b; margin-bottom: 2px;">[PRE-HEADLINE / KICKER]</p>
        <p style="font-size: 11pt; color: #0d9488; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.15em;">${funnelsCopy.optIn.preHeadline}</p>
        
        <p style="font-size: 10pt; color: #64748b; margin-bottom: 2px;">[MAIN HEADLINE]</p>
        <h3 style="font-size: 20pt; color: #0f172a; font-weight: 800; margin-top: 0; margin-bottom: 15px; line-height: 1.2;">${funnelsCopy.optIn.headline}</h3>
        
        <p style="font-size: 10pt; color: #64748b; margin-bottom: 2px;">[SUBHEADLINE]</p>
        <p style="font-size: 14pt; color: #475569; font-style: italic; margin-bottom: 20px;">${funnelsCopy.optIn.subheadline}</p>
        
        <p style="font-size: 12pt; margin-bottom: 15px;">${funnelsCopy.optIn.introText}</p>
        <p style="font-size: 12pt; margin-bottom: 25px;">${funnelsCopy.optIn.valueHook}</p>
        
        <h4 style="font-size: 12pt; color: #0f172a; margin-bottom: 10px; text-transform: uppercase; font-weight: bold;">Core Therapeutic Outcomes</h4>
        <ul style="padding-left: 20px; margin-bottom: 25px; font-size: 12pt;">
          ${funnelsCopy.optIn.benefits.map(b => `<li style="margin-bottom: 8px;">${b}</li>`).join('')}
        </ul>

        <h4 style="font-size: 12pt; color: #0f172a; margin-bottom: 10px; text-transform: uppercase; font-weight: bold;">Featured Showcase Range</h4>
        <p style="font-size: 12pt; font-weight: bold; color: #0f172a; margin-bottom: 5px;">${funnelsCopy.optIn.productShowcase.headline}</p>
        <p style="font-size: 11pt; color: #475569; margin-bottom: 10px; font-style: italic;">${funnelsCopy.optIn.productShowcase.subheadline}</p>
        <ul style="padding-left: 20px; margin-bottom: 25px; font-size: 12pt;">
          <li style="margin-bottom: 8px;">${funnelsCopy.optIn.productShowcase.item1}</li>
          <li style="margin-bottom: 8px;">${funnelsCopy.optIn.productShowcase.item2}</li>
        </ul>
        
        <p style="font-size: 12pt; font-weight: bold; margin-bottom: 10px;">${funnelsCopy.optIn.urgencyText}</p>
        <p style="font-size: 12pt; color: #0d9488; font-weight: bold; text-decoration: underline;">[CTA BUTTON]: ${funnelsCopy.optIn.ctaButtonText}</p>
        
        <hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 30px 0;" />
        
        <h2 style="font-size: 14pt; color: #0f172a; text-transform: uppercase; margin-bottom: 15px;">1.A. Form Pop-Out</h2>
        <p style="font-size: 14pt; font-weight: bold; margin-bottom: 5px;">${funnelsCopy.popUpForm.headline}</p>
        <p style="font-size: 12pt; color: #475569; margin-bottom: 15px;">${funnelsCopy.popUpForm.subheadline}</p>
        
        <ul style="padding-left: 20px; margin-bottom: 15px; font-size: 12pt; color: #475569;">
          <li>Label 1: ${funnelsCopy.popUpForm.nameFieldLabel}</li>
          <li>Label 2: ${funnelsCopy.popUpForm.emailFieldLabel}</li>
          <li>Label 3: ${funnelsCopy.popUpForm.phoneFieldLabel}</li>
        </ul>
        <p style="font-size: 11pt; color: #64748b; font-style: italic; margin-bottom: 15px;">[Compliance Checkbox]: ${funnelsCopy.popUpForm.complianceLabel}</p>
        <p style="font-size: 12pt; color: #0d9488; font-weight: bold; text-decoration: underline;">[SUBMIT CTA BUTTON]: ${funnelsCopy.popUpForm.buttonText}</p>
        
        <hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 30px 0;" />
        
        <h2 style="font-size: 16pt; color: #0d9488; text-transform: uppercase; margin-bottom: 15px;">2. Thank You Page</h2>
        <h3 style="font-size: 20pt; color: #0f172a; margin-bottom: 5px; font-weight: bold;">${funnelsCopy.thankYou.headline}</h3>
        <p style="font-size: 14pt; color: #475569; font-style: italic; margin-bottom: 15px;">${funnelsCopy.thankYou.subheadline}</p>
        <p style="font-size: 12pt; margin-bottom: 25px;">${funnelsCopy.thankYou.nextSteps}</p>
        
        <div style="background-color: #f0fdfa; border-left: 4px solid #0d9488; padding: 15px; margin-bottom: 20px;">
          <p style="font-size: 12pt; font-weight: bold; margin-top: 0; margin-bottom: 5px; color: #0f172a;">${funnelsCopy.thankYou.calendarBooking.headline}</p>
          <p style="font-size: 11pt; color: #475569; margin-bottom: 10px;">${funnelsCopy.thankYou.calendarBooking.subheadline}</p>
          <p style="font-size: 12pt; color: #0d9488; font-weight: bold; text-decoration: underline; margin-bottom: 0;">[CALENDAR BUTTON]: ${funnelsCopy.thankYou.calendarBooking.ctaButtonText}</p>
        </div>
      </div>
    `;
  };

  const copyFunnelsToClipboard = () => {
    const plainText = assembleFunnelsPlainText();
    const richHTML = assembleFunnelsRichHTML();

    setCopiedBlock(null);
    try {
      if (navigator.clipboard && typeof ClipboardItem === "function") {
        const textBlob = new Blob([plainText], { type: "text/plain" });
        const htmlBlob = new Blob([richHTML], { type: "text/html" });
        const copyItem = new ClipboardItem({ "text/plain": textBlob, "text/html": htmlBlob });
        navigator.clipboard.write([copyItem]).then(() => {
          setCopiedBlock('funnel_copy');
          triggerToast("HTML Funnel copy loaded to Clipboard! Paste inside Google Docs seamlessly.");
        });
        return;
      }
    } catch (e) {
      console.warn("Direct clipboard compilation failed, using legacy backup.");
    }
    const legacyArea = document.createElement('textarea');
    legacyArea.value = plainText;
    document.body.appendChild(legacyArea);
    legacyArea.select();
    document.execCommand('copy');
    document.body.removeChild(legacyArea);
    setCopiedBlock('funnel_copy');
    triggerToast("Plain text Funnel draft successfully copied.");
  };

  const exportFunnelsPDF = () => {
    if (!window.jspdf) {
      triggerToast("PDF script assets are initializing. Please re-trigger.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const clientTitle = clientName ? clientName : "Dealer Partner";
    let y = 20;
    const margin = 20;
    const w = doc.internal.pageSize.getWidth();
    const maxW = w - (margin * 2);

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, w, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.text("COPYSURGE - THE ULTIMATE AI COPY ENGINE", margin, 8);

    y = 25;
    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.text("Funnels Blueprint Draft", margin, y);
    y += 6;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Client: ${clientTitle}  |  Product Focus: ${product.join(', ')}  |  Category: ${category}`, margin, y);
    y += 15;

    const printBlock = (header, value, isTitle=false) => {
      if (y > 250) { doc.addPage(); y = 25; }
      if (header) {
        doc.setTextColor(13, 148, 136);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(isTitle ? 11 : 9);
        doc.text(header.toUpperCase(), margin, y);
        y += isTitle ? 7 : 5;
      }
      doc.setTextColor(51, 51, 51);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      const split = doc.splitTextToSize(value, maxW);
      split.forEach(line => {
        if (y > 270) { doc.addPage(); y = 25; }
        doc.text(line, margin, y);
        y += 5.5;
      });
      y += 6;
    };

    printBlock("1. OPT-IN LANDING PAGE COPY", "", true);
    printBlock("[Pre-Headline]", funnelsCopy.optIn.preHeadline);
    printBlock("[Main Headline]", funnelsCopy.optIn.headline);
    printBlock("[Subheadline]", funnelsCopy.optIn.subheadline);
    printBlock("[Intro Hook]", funnelsCopy.optIn.introText + "\n\n" + funnelsCopy.optIn.valueHook);

    doc.setTextColor(13, 148, 136);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text("[CORE OUTCOME BENEFITS]", margin, y);
    y += 5;
    funnelsCopy.optIn.benefits.forEach(b => {
      const splitBenefit = doc.splitTextToSize(`• ${b}`, maxW);
      splitBenefit.forEach(line => {
        if (y > 270) { doc.addPage(); y = 25; }
        doc.setTextColor(51, 51, 51);
        doc.setFont('Helvetica', 'normal');
        doc.text(line, margin, y);
        y += 5.5;
      });
    });
    y += 8;

    printBlock("[Featured Showcase Series]", `${funnelsCopy.optIn.productShowcase.headline}\n${funnelsCopy.optIn.productShowcase.subheadline}\n• ${funnelsCopy.optIn.productShowcase.item1}\n• ${funnelsCopy.optIn.productShowcase.item2}`);
    printBlock("[Urgency Parameter]", funnelsCopy.optIn.urgencyText);
    printBlock("[CTA Button text]", funnelsCopy.optIn.ctaButtonText);

    if (y > 240) { doc.addPage(); y = 25; }
    doc.line(margin, y, w - margin, y);
    y += 10;

    printBlock("1.A. FORM POP-OUT", "", true);
    printBlock("[Form Header]", funnelsCopy.popUpForm.headline);
    printBlock("[Form Subtitle]", funnelsCopy.popUpForm.subheadline);
    printBlock("[Form Labels]", `Name: ${funnelsCopy.popUpForm.nameFieldLabel}\nEmail: ${funnelsCopy.popUpForm.emailFieldLabel}\nPhone: ${funnelsCopy.popUpForm.phoneFieldLabel}`);
    printBlock("[Privacy Policy Checkbox]", funnelsCopy.popUpForm.complianceLabel);
    printBlock("[Submit Button]", funnelsCopy.popUpForm.buttonText);

    if (y > 240) { doc.addPage(); y = 25; }
    doc.line(margin, y, w - margin, y);
    y += 10;

    printBlock("2. THANK YOU PAGE", "", true);
    printBlock("[Voucher Validation Header]", funnelsCopy.thankYou.headline);
    printBlock("[Voucher Delivery Status]", funnelsCopy.thankYou.subheadline);
    printBlock("[Next Step Value Directions]", funnelsCopy.thankYou.nextSteps);
    printBlock("[Walkthrough Schedulers]", `${funnelsCopy.thankYou.calendarBooking.headline}\n${funnelsCopy.thankYou.calendarBooking.subheadline}\nCTA Button: ${funnelsCopy.thankYou.calendarBooking.ctaButtonText}`);

    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Exported via CopySurge System Architecture", margin, 285);
      doc.text(`Page ${i} of ${pages}`, w - margin - 15, 285);
    }
    doc.save(`Funnels_Architecture_${clientTitle.replace(/\s+/g, '_')}.pdf`);
    triggerToast("System PDF downloaded successfully!");
  };

  const exportAdsPDF = () => {
    if (!window.jspdf) {
      triggerToast("PDF Generator loading...");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const clientTitle = clientName ? clientName : "Dealer Partner";
    let y = 20;
    const margin = 20;
    const w = doc.internal.pageSize.getWidth();
    const maxW = w - (margin * 2);

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, w, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.text("COPYSURGE - THE ULTIMATE AI COPY ENGINE", margin, 8);

    y = 25;
    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.text("Static Ad Suite Overlay Drafts", margin, y);
    y += 6;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Client: ${clientTitle}  |  Product Focus: ${product.join(', ')}  |  Category: ${category}`, margin, y);
    y += 15;

    adsSuite.forEach((ad, i) => {
      if (y > 240) { doc.addPage(); y = 25; }
      doc.setFillColor(244, 63, 94);
      doc.rect(margin, y, 4, 18, 'F');
      doc.setTextColor(15, 23, 42);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`AD VARIATION #${i + 1}`, margin + 8, y + 5);
      y += 15;

      const printValue = (valText) => {
        if (!valText) return;
        if (y > 270) { doc.addPage(); y = 25; }
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(51, 51, 51);
        const textSplit = doc.splitTextToSize(valText, maxW - 12);
        textSplit.forEach(line => {
          if (y > 270) { doc.addPage(); y = 25; }
          doc.text(line, margin + 8, y);
          y += 5.5;
        });
        y += 4;
      };

      printValue(ad.headline);
      printValue(ad.subheadline);
      printValue(`[CTA]: ${ad.cta}`);
      y += 10;
    });

    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Exported via CopySurge Static Graphics Module", margin, 285);
      doc.text(`Page ${i} of ${pages}`, w - margin - 15, 285);
    }
    doc.save(`Static_Ads_Suite_${clientTitle.replace(/\s+/g, '_')}.pdf`);
    triggerToast("Static Ad PDF saved successfully.");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between antialiased text-slate-800">
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        body, * {
          font-family: 'Plus Jakarta Sans', sans-serif !important;
        }

        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeReverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .animate-marqueeReverse { animation: marqueeReverse 30s linear infinite; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-float { animation: float 2.5s ease-in-out infinite; }
        
        @keyframes flameFlicker {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          25% { transform: scale(1.1) rotate(-3deg); opacity: 0.8; }
          50% { transform: scale(0.95) rotate(3deg); opacity: 0.9; }
          75% { transform: scale(1.05) rotate(-1deg); opacity: 1; }
        }
        .animate-flame { animation: flameFlicker 1.5s infinite alternate ease-in-out; }
      `}} />

      {successToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center bg-slate-900 text-white border-l-4 border-emerald-400 px-4 py-3.5 rounded-lg shadow-xl transition-all duration-300 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mr-2 flex-shrink-0" />
          <span className="text-sm font-medium">{successToast}</span>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn border border-slate-200">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Settings className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold tracking-wide">Workspace System Configuration</h3>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Config Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-100">
              <button onClick={() => setSettingsTab('api')} className={`flex-1 py-3 text-center text-[11px] font-bold uppercase tracking-wider transition-all ${settingsTab === 'api' ? 'bg-white text-slate-900 border-b-2 border-teal-600' : 'text-slate-500 hover:text-slate-800'}`}>
                API Connection Configuration
              </button>
              <button onClick={() => setSettingsTab('security')} className={`flex-1 py-3 text-center text-[11px] font-bold uppercase tracking-wider transition-all ${settingsTab === 'security' ? 'bg-white text-slate-900 border-b-2 border-teal-600' : 'text-slate-500 hover:text-slate-800'}`}>
                Passcode Lock
              </button>
            </div>

            {settingsTab === 'api' ? (
              <div className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] flex items-center gap-1">
                    <Database className="w-3.5 h-3.5 text-teal-600" /> Google Gemini API Key
                  </label>
                  <input 
                    type="password" 
                    value={geminiApiKey} 
                    onChange={e => setGeminiApiKey(e.target.value)} 
                    placeholder="AIzaSy..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:border-teal-500 focus:outline-none font-mono" 
                  />
                  <p className="text-[10px] text-slate-400">Gets safely stored on your browser's private local storage.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em]">Select Core Generative Model</label>
                  <select 
                    value={selectedModel} 
                    onChange={e => setSelectedModel(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:border-teal-500 focus:outline-none cursor-pointer"
                  >
                    <option value="gemini-1.5-flash">gemini-1.5-flash (Ultra Stable Fallback)</option>
                    <option value="gemini-2.5-flash">gemini-2.5-flash (High speed)</option>
                    <option value="gemini-3.5-flash">gemini-3.5-flash (Frontier reasoning)</option>
                    <option value="gemini-3-flash-preview">gemini-3-flash-preview (Creative preview)</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end">
                  <button onClick={() => { setShowSettingsModal(false); triggerToast("Workspace settings saved."); }} className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] uppercase tracking-[0.15em] px-5 py-2.5 rounded-lg shadow-md transition-colors">
                    Save Connections
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em]">Current Password</label>
                  <div className="relative">
                    <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="password" value={passwordForm.old} onChange={e => setPasswordForm({...passwordForm, old: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-9 pr-4 text-sm focus:border-teal-500 focus:outline-none" required />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em]">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="password" value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-9 pr-4 text-sm focus:border-teal-500 focus:outline-none" required />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em]">Confirm New Password</label>
                  <div className="relative">
                    <CheckCircle2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-9 pr-4 text-sm focus:border-teal-500 focus:outline-none" required />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-[0.15em] px-5 py-2.5 rounded-lg shadow-md transition-colors">
                    Update Security Key
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn border border-slate-200">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <UserPlus className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold tracking-wide">Add New User</h3>
              </div>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddUserSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em]">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={newUserForm.name} onChange={e => setNewUserForm({...newUserForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-9 pr-4 text-sm focus:border-teal-500 focus:outline-none" required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em]">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" value={newUserForm.email} onChange={e => setNewUserForm({...newUserForm, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-9 pr-4 text-sm focus:border-teal-500 focus:outline-none" required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em]">Temporary Password</label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={newUserForm.password} onChange={e => setNewUserForm({...newUserForm, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-9 pr-4 text-sm focus:border-teal-500 focus:outline-none" required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em]">Access Role</label>
                <select value={newUserForm.role} onChange={e => setNewUserForm({...newUserForm, role: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 text-sm focus:border-teal-500 focus:outline-none cursor-pointer">
                  <option value="user">Standard User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end">
                <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-[0.15em] px-5 py-2.5 rounded-lg shadow-md transition-colors">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewState === 'auth' ? (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white relative overflow-hidden px-4">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-lg border border-slate-800 p-8 rounded-3xl shadow-2xl z-10">
            <div className="flex flex-col items-center mb-8">
              <img src="https://assets.cdn.filesafe.space/YceksrXqLDfhNRnla44c/media/6a3b3bcb6a4144419056580e.png" alt="CopySurge" className="h-16 object-contain mb-4" />
              <p className="text-[11px] text-slate-400 font-bold tracking-[0.15em] uppercase mt-1">Agency Access Portal</p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="text" value={authForm.name} onChange={(e) => setAuthForm({...authForm, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors" />
                  </div>
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="email" value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="password" value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors" />
                </div>
              </div>

              {authMode === 'login' && (
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-4 h-4 rounded border border-slate-600 bg-slate-900 group-hover:border-teal-500 transition-colors">
                      <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="absolute opacity-0 w-full h-full cursor-pointer" />
                      {rememberMe && <Check className="w-3 h-3 text-teal-400" />}
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-300 transition-colors">Remember my device</span>
                  </label>
                </div>
              )}

              <button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all uppercase tracking-[0.15em] text-[11px] mt-4">
                {authMode === 'login' ? 'Secure Login' : 'Submit Access Request'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-[11px] tracking-wide text-slate-400 hover:text-white transition-colors">
                {authMode === 'login' ? "Don't have an agency account? Request Access" : "Already approved? Return to secure login"}
              </button>
            </div>
          </div>
          <div className="mt-8 text-[10px] text-slate-500 uppercase tracking-[0.15em] font-bold">
            Dev: Jm Acuña
          </div>
        </div>
      ) : viewState === 'home' ? (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-white relative overflow-hidden">
          
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <header className="max-w-7xl w-full mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between border-b border-slate-800/60 z-10 gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <img src="https://assets.cdn.filesafe.space/YceksrXqLDfhNRnla44c/media/6a3b3bcb6a4144419056580e.png" alt="CopySurge" className="h-8 sm:h-10 object-contain" />
              <div className="hidden sm:block h-6 w-[1px] bg-slate-700"></div>
              <span className="text-[10px] sm:text-[11px] font-bold text-teal-400 uppercase tracking-[0.15em]">
                The Ultimate AI-Powered Copywriting Engine
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {currentUser && (
                <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
                  <div className="w-6 h-6 bg-teal-900 text-teal-300 rounded-full flex items-center justify-center text-[10px] font-bold uppercase">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="text-[11px] text-slate-300 font-bold uppercase tracking-[0.1em]">{currentUser.name}</span>
                </div>
              )}

              {currentUser?.email === 'jm@spasurgemarketing.com' && (
                <button onClick={() => setViewState('admin')} className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-[0.15em] bg-amber-950/30 px-3 py-1.5 rounded-lg border border-amber-900/50">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin Panel</span>
                </button>
              )}

              <button onClick={() => setShowSettingsModal(true)} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-[0.15em]">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>

              <button onClick={handleLogout} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-rose-400 transition-colors uppercase tracking-[0.15em]">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </header>

          <main className="max-w-7xl w-full mx-auto px-6 py-12 flex flex-col items-center justify-center text-center z-10 flex-grow">
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight max-w-4xl text-white leading-none mt-8 animate-fadeIn">
              Hey, <span className="text-teal-400">{currentUser ? currentUser.name : 'Guest'}</span>!
            </h1>
            <p className="text-slate-300 text-lg md:text-2xl max-w-2xl mt-4 font-medium tracking-wide animate-fadeIn">
              What do you want to do today?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mt-12 px-4">
              
              <div className="relative rounded-2xl group border border-slate-800/80 hover:border-teal-500 transition-colors duration-500 shadow-xl hover:shadow-teal-500/20 bg-slate-900/80 overflow-hidden cursor-pointer"
                   onClick={() => { setActiveTool('funnels'); setViewState('workspace'); }}>
                <div className="absolute top-0 left-0 right-0 h-2 bg-teal-500 z-20 transform origin-left transition-transform duration-300 group-hover:scale-y-150" />
                <div className="p-8 pb-16 text-left flex flex-col justify-between relative z-10 h-full">
                  <div className="space-y-4">
                    <div className="bg-teal-950 border border-teal-800 text-teal-400 p-3 rounded-lg w-fit">
                      <Layers className="w-8 h-8 animate-float" />
                    </div>
                    <h3 className="font-bold text-2xl text-white group-hover:text-teal-300 transition-colors">
                      Create Landing Page Copy
                    </h3>
                    <p className="text-base text-slate-400 leading-relaxed">
                      Generate multi-part high-ticket sensory copies complete with opt-in pages, product showcases, compliant pop-up forms, and calendar schedulers.
                    </p>
                  </div>

                  <div className="mt-12 flex items-center text-sm text-teal-400 font-bold gap-2 group-hover:gap-6 transition-all duration-500 ease-out">
                    <span className="uppercase tracking-[0.1em]">Open Funnel Workspace</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="relative rounded-2xl group border border-slate-800/80 hover:border-rose-500 transition-colors duration-500 shadow-xl hover:shadow-rose-500/20 bg-slate-900/80 overflow-hidden cursor-pointer"
                   onClick={() => { setActiveTool('ads'); setViewState('workspace'); }}>
                <div className="absolute top-0 left-0 right-0 h-2 bg-rose-500 z-20 transform origin-left transition-transform duration-300 group-hover:scale-y-150" />
                <div className="p-8 pb-16 text-left flex flex-col justify-between relative z-10 h-full">
                  <div className="space-y-4">
                    <div className="bg-rose-950 border border-rose-900 text-rose-400 p-3 rounded-lg w-fit">
                      <Flame className="w-8 h-8 animate-flame" />
                    </div>
                    <h3 className="font-bold text-2xl text-white group-hover:text-rose-300 transition-colors">
                      Generate Static Ad Copy
                    </h3>
                    <p className="text-base text-slate-400 leading-relaxed">
                      Draft diverse direct-response templates mapped specifically to graphic template ratios with clean, unpolluted text boxes for safe copy-pasting.
                    </p>
                  </div>

                  <div className="mt-12 flex items-center text-sm text-rose-400 font-bold gap-2 group-hover:gap-6 transition-all duration-500 ease-out">
                    <span className="uppercase tracking-[0.1em]">Open Ad Workspace</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>

            </div>

            <div className="w-full relative mt-20 py-6 border-y border-slate-800/40 overflow-hidden select-none pointer-events-none">
              <div className="flex w-[200%] animate-marquee whitespace-nowrap gap-12 text-[11px] font-bold tracking-[0.2em] uppercase text-slate-500">
                <span>PAS Framework Activation</span><span>•</span>
                <span>104° Spinal Decompression</span><span>•</span>
                <span>Cryotherapy Rejuvenation</span><span>•</span>
                <span>Objection-Buster Optimization</span><span>•</span>
                <span>Screen-Free Sanctuary Focus</span><span>•</span>
                <span>Heat-Shock Protein Induction</span><span>•</span>
                <span>PAS Framework Activation</span><span>•</span>
                <span>104° Spinal Decompression</span><span>•</span>
                <span>Cryotherapy Rejuvenation</span><span>•</span>
                <span>Objection-Buster Optimization</span>
              </div>
              <div className="flex w-[200%] animate-marqueeReverse whitespace-nowrap gap-12 text-[11px] font-bold tracking-[0.2em] uppercase text-slate-500 mt-2">
                <span>Detoxification Protocol</span><span>•</span>
                <span>AIDA Emotional Formula</span><span>•</span>
                <span>Friction-Free Compliance Safeguards</span><span>•</span>
                <span>Showroom VIP Scheduling</span><span>•</span>
                <span>Direct Copy-Paste Mockups</span><span>•</span>
                <span>Detoxification Protocol</span><span>•</span>
                <span>AIDA Emotional Formula</span><span>•</span>
                <span>Friction-Free Compliance Safeguards</span><span>•</span>
                <span>Showroom VIP Scheduling</span><span>•</span>
                <span>Direct Copy-Paste Mockups</span>
              </div>
            </div>

          </main>

          <footer className="w-full border-t border-slate-800/60 bg-slate-950/80 py-6 text-center text-xs text-slate-500 z-10">
            <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="font-bold tracking-[0.15em] text-slate-400 uppercase">Dev: Jm Acuña</span>
              <span className="text-slate-600 font-medium">SpaSurge Internal Confidential Suite</span>
            </div>
          </footer>
        </div>
      ) : viewState === 'admin' ? (
        <div className="min-h-screen flex flex-col bg-slate-50">
          <header className="bg-slate-900 text-white border-b border-slate-800 py-4 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setViewState('home')} className="hover:bg-white/10 p-2 rounded-lg text-slate-300 hover:text-white transition-all flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <span className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  Security & Admin Portal
                </span>
                <span className="text-[10px] tracking-[0.15em] font-bold text-amber-500/80 uppercase block mt-0.5">
                  Authorized Access Only: {currentUser.name}
                </span>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-rose-400 transition-colors uppercase tracking-[0.15em]">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </header>

          <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-grow">
            <div className="flex gap-4 border-b border-slate-200 mb-8">
              <button onClick={() => setAdminTab('activity')} className={`pb-3 px-2 text-[11px] font-bold tracking-[0.15em] uppercase transition-all border-b-2 flex items-center gap-2 ${adminTab === 'activity' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                <Activity className="w-4 h-4" /> Team Activity Logs
              </button>
              <button onClick={() => setAdminTab('users')} className={`pb-3 px-2 text-[11px] font-bold tracking-[0.15em] uppercase transition-all border-b-2 flex items-center gap-2 ${adminTab === 'users' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                <Users className="w-4 h-4" /> Manage Users
              </button>
            </div>

            {adminTab === 'activity' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fadeIn">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-lg">Recent Generation Activity</h3>
                  <span className="text-[11px] font-bold bg-teal-100 text-teal-800 px-3 py-1 rounded-full">{activityLogs.length} Events</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold">
                        <th className="p-4">Timestamp</th>
                        <th className="p-4">User</th>
                        <th className="p-4">Tool Used</th>
                        <th className="p-4">Action Taken</th>
                        <th className="p-4">Client Target</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-100">
                      {activityLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 text-slate-500 text-xs flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> {log.timestamp}</td>
                          <td className="p-4 font-bold text-slate-800">{log.userName} <span className="text-[11px] text-slate-400 font-medium block">{log.email}</span></td>
                          <td className="p-4"><span className={`text-[9px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-md ${log.tool === 'Funnels' ? 'bg-teal-100 text-teal-800' : 'bg-rose-100 text-rose-800'}`}>{log.tool}</span></td>
                          <td className="p-4 text-slate-600 font-medium">{log.action}</td>
                          <td className="p-4 text-slate-800 font-bold">{log.client}</td>
                        </tr>
                      ))}
                      {activityLogs.length === 0 && (
                        <tr><td colSpan="5" className="p-8 text-center text-slate-500 text-sm font-medium">No activity recorded in this session.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {adminTab === 'users' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Agency Access Management</h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Add, suspend, or manage roles for your team members.</p>
                  </div>
                  <button onClick={() => setShowAddUserModal(true)} className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-4 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-[0.15em] flex items-center gap-2 shadow-md transition-colors w-full sm:w-auto justify-center">
                    <UserPlus className="w-4 h-4" /> Add New User
                  </button>
                </div>
                <div className="grid gap-4">
                  {Object.entries(userDB).map(([email, user]) => (
                    <div key={email} className={`bg-white rounded-xl shadow-sm border p-5 flex flex-col sm:flex-row items-center justify-between gap-4 ${user.status === 'suspended' ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-inner ${user.status === 'suspended' ? 'bg-slate-400' : user.role === 'admin' ? 'bg-amber-500' : 'bg-teal-600'}`}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 flex items-center gap-2 text-base">
                            {user.name}
                            {user.role === 'admin' && <span className="bg-amber-100 text-amber-800 text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 rounded font-bold">Admin</span>}
                            {user.status === 'suspended' && <span className="bg-rose-100 text-rose-800 text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 rounded font-bold flex items-center gap-1"><Ban className="w-3 h-3"/> Suspended</span>}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">{email}</p>
                        </div>
                      </div>
                      {user.email !== 'jm@spasurgemarketing.com' && email !== 'jm@spasurgemarketing.com' && (
                        <button onClick={() => handleToggleUserStatus(email)} className={`text-[10px] font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-lg border transition-colors flex items-center gap-1.5 w-full sm:w-auto justify-center ${user.status === 'active' ? 'border-rose-200 text-rose-600 hover:bg-rose-50' : 'border-teal-200 text-teal-600 hover:bg-teal-50'}`}>
                          {user.status === 'active' ? <><Ban className="w-4 h-4"/> Suspend Access</> : <><CheckCircle2 className="w-4 h-4"/> Restore Access</>}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      ) : (
        <div className="flex-grow flex flex-col justify-between">
          <header className={`py-4 px-4 md:px-8 text-white border-b flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-500 ${activeTool === 'funnels' ? 'bg-teal-950 border-teal-800/30' : 'bg-slate-900 border-rose-800/30'}`}>
            <div className="flex items-center gap-4">
              <button onClick={() => setViewState('home')} className="hover:bg-white/10 p-2 rounded-lg text-slate-300 hover:text-white transition-all flex items-center gap-1 border border-white/5">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="h-6 w-[1px] bg-slate-200/20 hidden sm:block" />
              <div className="flex flex-col justify-center">
                <img src="https://assets.cdn.filesafe.space/YceksrXqLDfhNRnla44c/media/6a3b3bcb6a4144419056580e.png" alt="CopySurge" className="h-6 sm:h-8 object-contain" />
                <span className="text-[9px] tracking-[0.15em] font-bold text-slate-300 uppercase block mt-1">
                  The Ultimate AI-Powered Copywriting Engine
                </span>
              </div>
            </div>

            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
              <button onClick={() => setActiveTool('funnels')} className={`px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] rounded-lg transition-all flex items-center gap-2 ${activeTool === 'funnels' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                <Layers className="w-4 h-4" />
                <span>Funnels</span>
              </button>
              <button onClick={() => setActiveTool('ads')} className={`px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] rounded-lg transition-all flex items-center gap-2 ${activeTool === 'ads' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                <Flame className="w-4 h-4" />
                <span>Static Ads</span>
              </button>
            </div>
          </header>

          <div className="max-w-7xl w-full mx-auto px-4 md:px-8 py-8 flex-grow">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
              <div className="border-b border-slate-100 pb-4 mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Campaign Parameters</h2>
                  <p className="text-sm text-slate-500 font-medium">Settings and contexts propagate to both tools.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.15em] bg-slate-100 text-slate-500 font-bold px-2.5 py-1 rounded">
                    Active Model: <span className="text-teal-600">{selectedModel}</span>
                  </span>
                </div>
              </div>

              {apiError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm">System Conflict</h5>
                    <p className="text-xs mt-1 font-medium">{apiError}</p>
                    <button onClick={() => setShowSettingsModal(true)} className="mt-3 text-xs font-bold text-red-700 underline flex items-center gap-1 hover:text-red-900">
                      Configure Settings
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-5 space-y-6">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-slate-700 mb-2">
                      Client Name
                    </label>
                    <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. Apex Leisure, Hot Springs Spa Outlet" className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium focus:border-slate-800 focus:outline-none bg-slate-50" />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-slate-700 mb-2">
                      Product Range Target
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Hot Tub', 'Swim Spa', 'Cold Plunge', 'Sauna'].map(opt => (
                        <button key={opt} type="button" onClick={() => setProduct(prev => prev.includes(opt) ? prev.filter(p => p !== opt) : [...prev, opt])} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${product.includes(opt) ? 'bg-slate-800 text-white border-slate-800 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-300 hover:border-slate-400'}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-slate-700 mb-2">
                      Campaign Category Angle
                    </label>
                    <select value={category} onChange={(e) => { setCategory(e.target.value); if (e.target.value !== 'Holiday') setHolidayName(''); if (e.target.value !== 'Custom') setCustomAngle(''); }} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium focus:border-slate-800 focus:outline-none bg-slate-50 cursor-pointer text-slate-800">
                      <option value="Evergreen">Evergreen (Showroom validation, value, trust)</option>
                      <option value="Holiday">Holiday Event (Seasonal schedules, local savings)</option>
                      <option value="Events">Promo Event (Warehouse open house, clearouts)</option>
                      <option value="Custom">Custom Direct-Response Focus Angle</option>
                    </select>
                  </div>

                  {category === 'Holiday' && (
                    <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg animate-fadeIn shadow-sm">
                      <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-teal-900 mb-2">Specific Holiday Title</label>
                      <input type="text" value={holidayName} onChange={(e) => setHolidayName(e.target.value)} placeholder="e.g. Memorial Day, Black Friday Sale" className="w-full rounded border border-teal-300 px-3 py-2 text-sm font-medium focus:outline-none bg-white text-slate-800" />
                    </div>
                  )}

                  {category === 'Custom' && (
                    <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg animate-fadeIn shadow-sm">
                      <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-teal-900 mb-2">Specify Custom Angle</label>
                      <input type="text" value={customAngle} onChange={(e) => setCustomAngle(e.target.value)} placeholder="e.g. Back-Pain Relief, Veteran Credit Trade-ins" className="w-full rounded border border-teal-300 px-3 py-2 text-sm font-medium focus:outline-none bg-white text-slate-800" />
                    </div>
                  )}

                  {activeTool === 'ads' && (
                    <div className="p-4 bg-rose-50/50 border-2 border-rose-400 rounded-lg animate-fadeIn shadow-sm">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={includeFinancing} onChange={(e) => setIncludeFinancing(e.target.checked)} className="w-5 h-5 text-rose-600 border-rose-400 rounded focus:ring-rose-500 accent-rose-600 cursor-pointer" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-rose-900">
                          Include Financing / Payment Hooks
                        </span>
                      </label>
                      <p className="text-[11px] text-rose-700/80 mt-2 ml-8 font-medium leading-relaxed">
                        When enabled, ad variations heavily anchor on affordable monthly payments and 0% APR financing offers.
                      </p>
                    </div>
                  )}
                </div>

                <div className="md:col-span-7 space-y-6">
                  <div className="space-y-2">
                    <span className="block text-[11px] font-bold uppercase tracking-[0.15em] text-slate-700 mb-2">
                      Upload Context File
                    </span>
                    <label onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer block w-full py-10 ${isDragging ? 'border-teal-500 bg-teal-50 shadow-inner' : 'border-slate-300 hover:border-slate-400 bg-slate-50/80 hover:bg-slate-100'}`}>
                      <Upload className={`w-8 h-8 mb-2 transition-transform ${isDragging ? 'scale-110 text-teal-600 animate-pulse' : 'text-slate-400'}`} />
                      <span className="text-sm font-bold text-slate-700">Click or Drag & Drop files here</span>
                      <span className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-widest">PDF (Native), DOCX, or TXT</span>
                      <input type="file" multiple accept=".pdf,.docx,.txt" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>

                  <div className="space-y-2">
                    <span className="block text-[11px] font-bold uppercase tracking-[0.15em] text-slate-700 mb-2">
                      Manual References & Custom Directives
                    </span>
                    <textarea value={referenceText} onChange={(e) => setReferenceText(e.target.value)} rows={5} placeholder="Paste promo sheets, custom CTA wording, target towns, or exact structural pricing rules here..." className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium focus:border-slate-800 focus:outline-none bg-slate-50 resize-none text-slate-800" />
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-700 mb-2">
                      <Link2 className="w-4 h-4" /> <span>Reference Link</span>
                    </div>
                    <input type="text" value={urls} onChange={(e) => setUrls(e.target.value)} placeholder="Paste website URL or public Google Docs link..." className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium focus:border-slate-800 focus:outline-none bg-slate-50 text-slate-800" />
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {uploadedFiles.map((f, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-full px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm">
                          {f.isPDF ? <FileCode className="w-4 h-4 text-red-500" /> : <FileText className="w-4 h-4 text-teal-600" />}
                          <span className="truncate max-w-[200px]">{f.name}</span>
                          <button onClick={() => removeFile(idx)} className="text-slate-400 hover:text-red-600 transition-colors ml-1">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
                <button onClick={triggerCopyGeneration} disabled={isGenerating} className={`px-10 py-4 rounded-xl font-bold tracking-[0.15em] text-xs uppercase flex items-center gap-3 text-white shadow-lg transition-all duration-300 select-none ${activeTool === 'funnels' ? 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800' : 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'}`}>
                  {isGenerating ? (
                    <><RefreshCw className="w-5 h-5 animate-spin text-white" /> <span>{generationStep}</span></>
                  ) : (
                    <><Sparkles className="w-5 h-5 text-white" /> <span>Generate {activeTool === 'funnels' ? 'Funnels Suite' : 'Static Ad Suite'}</span></>
                  )}
                </button>
              </div>
            </div>

            {activeTool === 'funnels' ? (
              <div>
                {!funnelsGenerated ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center max-w-xl mx-auto space-y-6 shadow-sm">
                    <div className="bg-teal-50 text-teal-600 p-5 rounded-full w-fit mx-auto border border-teal-100">
                      <Layers className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">Configure & Launch Funnels</h3>
                    <p className="text-base text-slate-500 font-medium leading-relaxed">
                      Enter the client details in the parameters panel above and click "Generate Funnels Suite" to unlock the clean three-part copywriting canvas.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
                    <div className="lg:col-span-8 space-y-4">
                      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Eye className="w-5 h-5 text-teal-600" />
                          <span className="text-sm font-bold text-slate-900">Funnels Copy Editor</span>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button onClick={copyFunnelsToClipboard} className="flex-1 sm:flex-initial bg-teal-950 hover:bg-teal-900 text-white text-[11px] font-bold uppercase tracking-[0.15em] px-4 py-3 rounded shadow flex items-center justify-center gap-2">
                            {copiedBlock === 'funnel_copy' ? <Check className="w-4 h-4 text-emerald-400" /> : <ClipboardCheck className="w-4 h-4 text-teal-300" />}
                            <span>{copiedBlock === 'funnel_copy' ? 'HTML Copied!' : 'Copy to Google Docs'}</span>
                          </button>
                          <button onClick={exportFunnelsPDF} className="flex-1 sm:flex-initial bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold uppercase tracking-[0.15em] px-4 py-3 rounded shadow flex items-center justify-center gap-2">
                            <FileDown className="w-4 h-4 text-slate-300" />
                            <span>Download PDF</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex border-b border-slate-200 bg-white p-2 rounded-t-xl shadow-sm">
                        <button onClick={() => setActiveFunnelTab('optIn')} className={`flex-1 py-3 text-center text-[11px] uppercase tracking-[0.15em] font-bold transition-all rounded ${activeFunnelTab === 'optIn' ? 'bg-teal-50 text-teal-900 border-b-2 border-teal-600' : 'text-slate-500 hover:text-slate-800'}`}>1. Opt-In Page</button>
                        <button onClick={() => setActiveFunnelTab('popUpForm')} className={`flex-1 py-3 text-center text-[11px] uppercase tracking-[0.15em] font-bold transition-all rounded ${activeFunnelTab === 'popUpForm' ? 'bg-teal-50 text-teal-900 border-b-2 border-teal-600' : 'text-slate-500 hover:text-slate-800'}`}>1.A. Form Pop-Out</button>
                        <button onClick={() => setActiveFunnelTab('thankYou')} className={`flex-1 py-3 text-center text-[11px] uppercase tracking-[0.15em] font-bold transition-all rounded ${activeFunnelTab === 'thankYou' ? 'bg-teal-50 text-teal-900 border-b-2 border-teal-600' : 'text-slate-500 hover:text-slate-800'}`}>2. Thank You Page</button>
                      </div>

                      <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-8 md:p-12 min-h-[600px] shadow-sm text-slate-800">
                        {activeFunnelTab === 'optIn' && (
                          <div className="space-y-8">
                            <div className="space-y-2">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] block">[Pre-Headline / Value Kicker]</span>
                              <input type="text" value={funnelsCopy.optIn.preHeadline} onChange={(e) => handleFunnelFieldChange('optIn', 'preHeadline', e.target.value)} className="w-full font-bold text-lg text-teal-900 bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:outline-none focus:border-teal-500 uppercase tracking-widest py-1" />
                            </div>
                            <div className="space-y-2">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] block">[Main Headline Summarizing Content]</span>
                              <textarea value={funnelsCopy.optIn.headline} onChange={(e) => handleFunnelFieldChange('optIn', 'headline', e.target.value)} rows={2} className="w-full font-black text-3xl md:text-4xl text-slate-900 bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:outline-none focus:border-teal-500 resize-none leading-tight py-1" />
                            </div>
                            <div className="space-y-2">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] block">[Subheadline Outcome Focus]</span>
                              <textarea value={funnelsCopy.optIn.subheadline} onChange={(e) => handleFunnelFieldChange('optIn', 'subheadline', e.target.value)} rows={2} className="w-full italic font-medium text-lg md:text-xl text-slate-600 bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:outline-none focus:border-teal-500 resize-none py-1 leading-relaxed" />
                            </div>
                            <div className="space-y-2">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] block">[Introductory Paragraph]</span>
                              <textarea value={funnelsCopy.optIn.introText} onChange={(e) => handleFunnelFieldChange('optIn', 'introText', e.target.value)} rows={3} className="w-full text-base md:text-lg font-medium text-slate-800 bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:outline-none focus:border-teal-500 resize-none py-1 leading-relaxed" />
                            </div>
                            <div className="space-y-2">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] block">[Outcome Decompression Pitch]</span>
                              <textarea value={funnelsCopy.optIn.valueHook} onChange={(e) => handleFunnelFieldChange('optIn', 'valueHook', e.target.value)} rows={3} className="w-full text-base md:text-lg font-medium text-slate-800 bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:outline-none focus:border-teal-500 resize-none py-1 leading-relaxed" />
                            </div>
                            <div className="space-y-3">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] block">[Bulleted Direct Outcome Benefits]</span>
                              <div className="space-y-3">
                                {funnelsCopy.optIn.benefits.map((b, bIdx) => (
                                  <div key={bIdx} className="flex gap-3 items-start pl-2">
                                    <span className="text-teal-600 text-2xl select-none font-bold mt-1">•</span>
                                    <textarea value={b} onChange={(e) => { const r = [...funnelsCopy.optIn.benefits]; r[bIdx] = e.target.value; handleFunnelFieldChange('optIn', 'benefits', r); }} rows={2} className="w-full text-base md:text-lg font-medium text-slate-800 bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:outline-none focus:border-teal-500 resize-none py-0.5 leading-relaxed" />
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] block">[Product Showcase Section]</span>
                              <input type="text" value={funnelsCopy.optIn.productShowcase.headline} onChange={(e) => handleFunnelFieldChange('optIn', 'productShowcase', { ...funnelsCopy.optIn.productShowcase, headline: e.target.value })} className="w-full font-extrabold text-lg md:text-xl text-slate-900 bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:outline-none focus:border-teal-500 py-1" />
                              <input type="text" value={funnelsCopy.optIn.productShowcase.subheadline} onChange={(e) => handleFunnelFieldChange('optIn', 'productShowcase', { ...funnelsCopy.optIn.productShowcase, subheadline: e.target.value })} className="w-full text-base md:text-lg font-medium text-slate-600 italic bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:outline-none focus:border-teal-500 py-1" />
                              <div className="space-y-3 text-base md:text-lg font-medium text-slate-800 leading-relaxed pl-2 mt-4">
                                <div className="flex gap-2 items-start">
                                  <span className="mt-1 font-bold">•</span>
                                  <textarea value={funnelsCopy.optIn.productShowcase.item1} onChange={(e) => handleFunnelFieldChange('optIn', 'productShowcase', { ...funnelsCopy.optIn.productShowcase, item1: e.target.value })} rows={2} className="w-full bg-transparent focus:outline-none border-b border-dashed border-transparent hover:border-slate-300 resize-none leading-relaxed" />
                                </div>
                                <div className="flex gap-2 items-start">
                                  <span className="mt-1 font-bold">•</span>
                                  <textarea value={funnelsCopy.optIn.productShowcase.item2} onChange={(e) => handleFunnelFieldChange('optIn', 'productShowcase', { ...funnelsCopy.optIn.productShowcase, item2: e.target.value })} rows={2} className="w-full bg-transparent focus:outline-none border-b border-dashed border-transparent hover:border-slate-300 resize-none leading-relaxed" />
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] block">[Urgency limits & deadlines]</span>
                              <textarea value={funnelsCopy.optIn.urgencyText} onChange={(e) => handleFunnelFieldChange('optIn', 'urgencyText', e.target.value)} rows={2} className="w-full font-bold text-base md:text-lg text-slate-900 bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:outline-none focus:border-teal-500 resize-none py-1 leading-relaxed" />
                            </div>
                            <div className="space-y-2 pt-4">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] block">[Landing Page Primary CTA text]</span>
                              <input type="text" value={funnelsCopy.optIn.ctaButtonText} onChange={(e) => handleFunnelFieldChange('optIn', 'ctaButtonText', e.target.value)} className="w-full font-bold text-lg md:text-xl text-teal-600 underline bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:outline-none focus:border-teal-500 py-1" />
                            </div>
                          </div>
                        )}
                        {activeFunnelTab === 'popUpForm' && (
                          <div className="space-y-8">
                            <div className="space-y-2">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] block">[Form Pop-Out Header]</span>
                              <input type="text" value={funnelsCopy.popUpForm.headline} onChange={(e) => handleFunnelFieldChange('popUpForm', 'headline', e.target.value)} className="w-full font-extrabold text-2xl text-slate-900 bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:outline-none focus:border-teal-500 py-1" />
                            </div>
                            <div className="space-y-2">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] block">[Form Pop-Out Trust Subheading]</span>
                              <textarea value={funnelsCopy.popUpForm.subheadline} onChange={(e) => handleFunnelFieldChange('popUpForm', 'subheadline', e.target.value)} rows={2} className="w-full text-lg font-medium text-slate-700 bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:outline-none focus:border-teal-500 resize-none py-1 leading-relaxed" />
                            </div>
                            <div className="space-y-4 pl-4 border-l-4 border-teal-500 bg-slate-50 p-6 rounded-r-xl">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] block mb-4">Form Inputs Configured</span>
                              <div className="flex items-center gap-4 text-base">
                                <span className="font-bold text-slate-600 w-24">Field 1:</span>
                                <input type="text" value={funnelsCopy.popUpForm.nameFieldLabel} onChange={(e) => handleFunnelFieldChange('popUpForm', 'nameFieldLabel', e.target.value)} className="flex-1 bg-transparent border-b border-slate-300 focus:outline-none text-slate-800 font-medium py-1" />
                              </div>
                              <div className="flex items-center gap-4 text-base">
                                <span className="font-bold text-slate-600 w-24">Field 2:</span>
                                <input type="text" value={funnelsCopy.popUpForm.emailFieldLabel} onChange={(e) => handleFunnelFieldChange('popUpForm', 'emailFieldLabel', e.target.value)} className="flex-1 bg-transparent border-b border-slate-300 focus:outline-none text-slate-800 font-medium py-1" />
                              </div>
                              <div className="flex items-center gap-4 text-base">
                                <span className="font-bold text-slate-600 w-24">Field 3:</span>
                                <input type="text" value={funnelsCopy.popUpForm.phoneFieldLabel} onChange={(e) => handleFunnelFieldChange('popUpForm', 'phoneFieldLabel', e.target.value)} className="flex-1 bg-transparent border-b border-slate-300 focus:outline-none text-slate-800 font-medium py-1" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] block">[Required Privacy/SMS Opt-In Checkbox Label]</span>
                              <div className="flex items-start gap-4 p-5 bg-rose-50 border border-rose-200 rounded-xl">
                                <input type="checkbox" checked={true} readOnly className="mt-1 h-5 w-5 text-teal-600 border-slate-300 rounded focus:ring-teal-500" />
                                <textarea value={funnelsCopy.popUpForm.complianceLabel} onChange={(e) => handleFunnelFieldChange('popUpForm', 'complianceLabel', e.target.value)} rows={2} className="w-full bg-transparent text-base font-medium text-slate-700 focus:outline-none resize-none leading-relaxed" />
                              </div>
                            </div>
                            <div className="space-y-2 pt-4">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] block">[Submit CTA button Text]</span>
                              <input type="text" value={funnelsCopy.popUpForm.buttonText} onChange={(e) => handleFunnelFieldChange('popUpForm', 'buttonText', e.target.value)} className="w-full font-bold text-lg text-teal-600 underline bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:outline-none focus:border-teal-500 py-1" />
                            </div>
                          </div>
                        )}
                        {activeFunnelTab === 'thankYou' && (
                          <div className="space-y-8">
                            <div className="space-y-2">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] block">[Confirmation Headline]</span>
                              <input type="text" value={funnelsCopy.thankYou.headline} onChange={(e) => handleFunnelFieldChange('thankYou', 'headline', e.target.value)} className="w-full font-bold text-2xl md:text-3xl text-slate-900 bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:outline-none focus:border-teal-500 py-1" />
                            </div>
                            <div className="space-y-2">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] block">[Confirmation Subtitle]</span>
                              <textarea value={funnelsCopy.thankYou.subheadline} onChange={(e) => handleFunnelFieldChange('thankYou', 'subheadline', e.target.value)} rows={2} className="w-full italic font-medium text-lg text-slate-700 bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:outline-none focus:border-teal-500 resize-none py-1 leading-relaxed" />
                            </div>
                            <div className="space-y-2">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] block">[Next Steps Instructions & Value Hook]</span>
                              <textarea value={funnelsCopy.thankYou.nextSteps} onChange={(e) => handleFunnelFieldChange('thankYou', 'nextSteps', e.target.value)} rows={3} className="w-full text-lg font-medium text-slate-800 bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:outline-none focus:border-teal-500 resize-none py-1 leading-relaxed" />
                            </div>
                            <div className="p-6 bg-teal-50 border border-teal-200 rounded-2xl space-y-5">
                              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-[0.15em] block">[Calendar Walkthrough Booking Module]</span>
                              <div className="space-y-2">
                                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-[0.15em]">[Calendar Block Title]</span>
                                <textarea value={funnelsCopy.thankYou.calendarBooking.headline} onChange={(e) => handleFunnelFieldChange('thankYou', 'calendarBooking', { ...funnelsCopy.thankYou.calendarBooking, headline: e.target.value })} rows={2} className="w-full font-bold text-lg md:text-xl text-slate-900 bg-transparent border-b border-dashed border-transparent hover:border-teal-500 focus:outline-none resize-none leading-snug" />
                              </div>
                              <div className="space-y-2">
                                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-[0.15em]">[Calendar Subtitle Benefits]</span>
                                <textarea value={funnelsCopy.thankYou.calendarBooking.subheadline} onChange={(e) => handleFunnelFieldChange('thankYou', 'calendarBooking', { ...funnelsCopy.thankYou.calendarBooking, subheadline: e.target.value })} rows={3} className="w-full text-base font-medium text-slate-700 bg-transparent border-b border-dashed border-transparent hover:border-teal-500 focus:outline-none resize-none leading-relaxed" />
                              </div>
                              <div className="space-y-2">
                                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-[0.15em]">[Booking CTA button text]</span>
                                <input type="text" value={funnelsCopy.thankYou.calendarBooking.ctaButtonText} onChange={(e) => handleFunnelFieldChange('thankYou', 'calendarBooking', { ...funnelsCopy.thankYou.calendarBooking, ctaButtonText: e.target.value })} className="w-full text-base font-bold text-teal-700 bg-transparent border-b border-dashed border-transparent hover:border-teal-500 focus:outline-none underline py-1" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="lg:col-span-4 bg-teal-950 text-teal-100 rounded-2xl p-6 md:p-8 shadow-xl border border-teal-900/40 space-y-6">
                      <div className="flex items-center gap-2 text-teal-300 border-b border-teal-900 pb-4">
                        <Compass className="w-6 h-6 text-teal-400" />
                        <h4 className="font-bold text-sm uppercase tracking-[0.15em]">Funnels Directives</h4>
                      </div>
                      <div className="space-y-6 text-sm leading-relaxed font-medium">
                        <div>
                          <span className="text-[11px] font-bold text-teal-300 uppercase tracking-[0.15em] block mb-1">High-Ticket Outcomes</span>
                          <p className="text-teal-200/80">Home wellness purchases are driven by physical stress relief. Never showcase simple product specs without immediate sensory results.</p>
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-teal-300 uppercase tracking-[0.15em] block mb-1">Frictionless Flow Rules</span>
                          <p className="text-teal-200/80">The Pop-up form is optimized to prevent drop-off. By including explicit checkboxes, legal SMS validation is covered safely.</p>
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-teal-300 uppercase tracking-[0.15em] block mb-1">Zero-Bounce Calendar</span>
                          <p className="text-teal-200/80">Providing the calendar booking option immediately on the confirmation page captures up to 40% of warm leads who would otherwise drop off.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {!adsGenerated ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center max-w-xl mx-auto space-y-6 shadow-sm">
                    <div className="bg-rose-50 text-rose-600 p-5 rounded-full w-fit mx-auto border border-rose-100">
                      <Flame className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">Configure & Launch Ad Suite</h3>
                    <p className="text-base text-slate-500 font-medium leading-relaxed">
                      Enter context parameters in the top workspace panel and click "Generate Static Ad Suite" to display all visual design templates.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8 animate-fadeIn bg-slate-50 p-4 md:p-8 rounded-2xl border border-slate-200 shadow-inner">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap items-center justify-between gap-4 max-w-5xl mx-auto">
                      <div className="flex items-center gap-2">
                        <Eye className="w-5 h-5 text-rose-600" />
                        <span className="text-sm font-bold text-slate-900">Static Ads Panel</span>
                      </div>
                      <button onClick={exportAdsPDF} className="flex-1 sm:flex-initial bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold uppercase tracking-[0.15em] px-4 py-3 rounded shadow flex items-center justify-center gap-2">
                        <FileDown className="w-4 h-4 text-slate-300" />
                        <span>Download Ad Matrix PDF</span>
                      </button>
                    </div>

                    <div className="max-w-5xl mx-auto space-y-8">
                      {adsSuite.map((ad, idx) => (
                        <div key={ad.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12">
                          <div className="md:col-span-8 p-6 md:p-8 flex flex-col justify-between">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                              <div>
                                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-[0.15em] block mb-1">Variation Card #{idx + 1}</span>
                                <input type="text" value={ad.angle} onChange={(e) => handleAdFieldChange(idx, 'angle', e.target.value)} className="block font-bold text-base md:text-lg text-slate-900 bg-transparent focus:outline-none w-full" />
                              </div>
                              <button disabled={regenIndices[idx]} onClick={() => regenerateSingleAd(idx, ad.angle)} className="text-[11px] text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded uppercase tracking-[0.1em] font-bold transition flex items-center gap-1.5 disabled:opacity-50 shadow-sm">
                                <RefreshCw className={`w-3.5 h-3.5 ${regenIndices[idx] ? 'animate-spin' : ''}`} />
                                <span>{regenIndices[idx] ? 'Drafting...' : 'Regen Angle'}</span>
                              </button>
                            </div>

                            <div className="bg-slate-900 rounded-xl p-8 relative aspect-[16/9] flex flex-col justify-between text-white overflow-hidden shadow-inner select-all">
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 z-0" />
                              <div className="absolute inset-0 border border-white/5 z-0 rounded-xl pointer-events-none" />
                              <div className="absolute right-4 bottom-4 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none z-0" />

                              <div className="z-10 relative flex justify-between items-start mb-4">
                                <span className="bg-rose-500/20 text-rose-300 font-medium text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded border border-rose-500/30">
                                  Simulated Banner Text
                                </span>
                                <button onClick={() => {
                                  const plainSingle = `${ad.headline.toUpperCase()}\n${ad.subheadline}\n${ad.cta}`;
                                  navigator.clipboard.writeText(plainSingle);
                                  triggerToast(`Copied Ad Card #${idx + 1} Overlay Texts!`);
                                }} className="text-[10px] text-white hover:text-rose-200 uppercase font-bold tracking-[0.15em] flex items-center gap-1.5 transition-colors bg-white/10 px-3 py-1.5 rounded hover:bg-white/20 backdrop-blur-sm">
                                  <Copy className="w-3.5 h-3.5" /> <span>Copy Text</span>
                                </button>
                              </div>

                              <div className="z-10 relative space-y-4 my-auto">
                                <textarea value={ad.headline} onChange={(e) => handleAdFieldChange(idx, 'headline', e.target.value)} rows={2} className="w-full bg-transparent font-black text-2xl md:text-3xl text-white tracking-tight uppercase focus:outline-none border-b border-dashed border-transparent hover:border-white/30 resize-none leading-tight py-1" />
                                <textarea value={ad.subheadline} onChange={(e) => handleAdFieldChange(idx, 'subheadline', e.target.value)} rows={2} className="w-full bg-transparent text-base md:text-lg font-medium text-slate-200 focus:outline-none border-b border-dashed border-transparent hover:border-white/20 resize-none leading-relaxed py-1" />
                              </div>

                              <div className="z-10 relative flex justify-start pt-6">
                                <input type="text" value={ad.cta} onChange={(e) => handleAdFieldChange(idx, 'cta', e.target.value)} className="bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-[11px] md:text-sm font-bold tracking-[0.15em] uppercase px-6 py-3.5 rounded shadow-lg transition-colors duration-300 cursor-pointer text-center w-full sm:w-auto outline-none" />
                              </div>
                            </div>
                          </div>

                          <div className="md:col-span-4 bg-slate-900 text-rose-100 p-6 md:p-8 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col justify-center">
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 text-rose-400 border-b border-slate-800 pb-3 mb-4">
                                <Compass className="w-5 h-5" />
                                <span className="text-[11px] uppercase font-bold tracking-[0.15em]">Conversion Strategy</span>
                              </div>
                              <textarea value={ad.copyReco} onChange={(e) => handleAdFieldChange(idx, 'copyReco', e.target.value)} rows={12} className="w-full bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg p-4 text-sm font-medium text-slate-300 focus:outline-none focus:border-rose-700 leading-relaxed resize-none" />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button onClick={addCustomAdCard} className="w-full border-2 border-dashed border-rose-300/60 hover:border-rose-500 rounded-xl py-6 bg-white text-rose-900 font-bold tracking-[0.15em] text-[11px] uppercase flex items-center justify-center gap-2 transition-all duration-300 shadow-sm">
                        <Plus className="w-5 h-5 text-rose-700" />
                        <span>Add Custom Ad Variation</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <footer className="bg-slate-900 border-t border-slate-800 py-6 px-4 md:px-8 text-center text-xs text-slate-500 mt-12">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="font-bold uppercase tracking-[0.15em] text-slate-400">Dev: Jm Acuña</span>
              <span className="text-slate-600 font-medium tracking-wide">CopySurge Internal System Utility Suite</span>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}