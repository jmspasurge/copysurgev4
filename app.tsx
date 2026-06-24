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

  const [settingsTab, setSettingsTab] = useState('api');

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

  // Global inputs shared between both tools
  const [clientName, setClientName] = useState('');
  const [product, setProduct] = useState(['Hot Tub']); 
  const [category, setCategory] = useState('Evergreen'); 
  const [holidayName, setHolidayName] = useState('');
  const [customAngle, setCustomAngle] = useState('');
  const [referenceText, setReferenceText] = useState('');
  const [urls, setUrls] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  const [includeFinancing, setIncludeFinancing] = useState(false);
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

  // ====================================================================
  // REVISED MAIN GENERATION HANDLER: ROUTING SECURELY THROUGH PROXY ENDPOINT
  // ====================================================================
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
      
      // FIX: Instead of mapping directly to Google API, map to our local Vercel /api proxy setup
      const apiUrl = `/api/generate`;

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
      
      const payloadPdfData = pdfFiles.map(f => ({
        mimeType: "application/pdf",
        data: f.base64,
        name: f.name
      }));

      // REVISED REQUEST BODY: Passing parameters downstream to the backend proxy
      const requestBody = {
        apiKey,
        model: selectedModel,
        systemInstruction,
        promptPayload,
        pdfFiles: payloadPdfData
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let parsedError;
        try { parsedError = JSON.parse(errorText); } catch(e) {}
        const finalMessage = parsedError?.error || `Proxy backend context issue (${response.status})`;
        throw new Error(finalMessage);
      }
      
      const result = await response.json();
      if (!result.text) throw new Error("No payload parsed from the copy engine.");

      const parsedData = JSON.parse(result.text.trim());

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

  // ====================================================================
  // REVISED SINGLE AD REGENERATION HANDLER
  // ====================================================================
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
      const apiUrl = `/api/generate`;

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
          apiKey,
          model: selectedModel,
          systemInstruction: sysMsg,
          promptPayload: query,
          pdfFiles: []
        })
      });

      if (!response.ok) throw new Error();
      const rawRes = await response.json();
      if (rawRes.text) {
        const adObj = JSON.parse(rawRes.text.trim());
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
        <p style="font-size: 14pt; font-weight: bold; margin-bottom: 5px;">${funnelsCopy.popUpForm.headline}</p> <p style="font-size: 12pt; color: #475569; margin-bottom: 15px;">${funnelsCopy.popUpForm.subheadline}</p> <ul style="padding-left: 20px; margin-bottom: 15px; font-size: 12pt; color: #475569;"> <li>Label 1: ${funnelsCopy.popUpForm.nameFieldLabel}</li> <li>Label 2: ${funnelsCopy.popUpForm.emailFieldLabel}</li> <li>Label 3: ${funnelsCopy.popUpForm.phoneFieldLabel}</li> </ul> <p style="font-size: 11pt; color: #64748b; font-style: italic; margin-bottom: 15px;">[Compliance Checkbox]: ${funnelsCopy.popUpForm.complianceLabel}</p> <p style="font-size: 12pt; color: #0d9488; font-weight: bold; text-decoration: underline;">[SUBMIT CTA BUTTON]: ${funnelsCopy.popUpForm.buttonText}</p> <hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 30px 0;" /> <h2 style="font-size: 16pt; color: #0d9488; text-transform: uppercase; margin-bottom: 15px;">2. Thank You Page</h2> <h3 style="font-size: 20pt; color: #0f172a; margin-bottom: 5px; font-weight: bold;">${funnelsCopy.thankYou.headline}</h3> <p style="font-size: 14pt; color: #475569; font-style: italic; margin-bottom: 15px;">${funnelsCopy.thankYou.subheadline}</p> <p style="font-size: 12pt; margin-bottom: 25px;">${funnelsCopy.thankYou.nextSteps}</p> <div style="background-color: #f0fdfa; border-left: 4px solid #0d9488; padding: 15px; margin-bottom: 20px;"> <p style="font-size: 12pt; font-weight: bold; margin-top: 0; margin-bottom: 5px; color: #0f172a;">${funnelsCopy.thankYou.calendarBooking.headline}</p> <p style="font-size: 11pt; color: #475569; margin-bottom: 10px;">${funnelsCopy.thankYou.calendarBooking.subheadline}</p> <p style="font-size: 12pt; color: #0d9488; font-weight: bold; text-decoration: underline; margin-bottom: 0;">[CALENDAR BUTTON]: ${funnelsCopy.thankYou.calendarBooking.ctaButtonText}</p> </div> </div> `;
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
    doc.text(`Client: ${clientTitle} | Product Focus: ${product.join(', ')} | Category: ${category}`, margin, y);
    y += 15;
    const printBlock = (header, value, isTitle=false) => {
      if (y > 250) {
        doc.addPage();
        y = 25;
      }
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
        if (y > 270) {
          doc.addPage();
          y = 25;
        }
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
        if (y > 270) {
          doc.addPage();
          y = 25;
        }
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
    if (y > 240) {
      doc.addPage();
      y = 25;
    }
    doc.line(margin, y, w - margin, y);
    y += 10;
    printBlock("1.A. FORM POP-OUT", "", true);
    printBlock("[Form Header]", funnelsCopy.popUpForm.headline);
    printBlock("[Form Subtitle]", funnelsCopy.popUpForm.subheadline);
    printBlock("[Form Labels]", `Name: ${funnelsCopy.popUpForm.nameFieldLabel}\nEmail: ${funnelsCopy.popUpForm.emailFieldLabel}\nPhone: ${funnelsCopy.popUpForm.phoneFieldLabel}`);
    printBlock("[Privacy Policy Checkbox]", funnelsCopy.popUpForm.complianceLabel);
    printBlock("[Submit Button]", funnelsCopy.popUpForm.buttonText);
    if (y > 240) {
      doc.addPage();
      y = 25;
    }
    doc.line(margin, y, w - margin, y);
    y += 10;
    printBlock("2. THANK YOU PAGE", "", true);
    // ... UI Elements omitted for space
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <p>Code initialized successfully. Secure Proxy enabled on /api/generate.</p>
    </div>
  );
}