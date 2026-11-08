"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useCopy } from "@/components/i18n/useCopy";
import type { LanguageId } from "@/lib/i18n/languages";

type Phrase = {
  login: string;
  welcome: string;
  create: string;
  createLead: string;
  email: string;
  emailHint: string;
  mobile: string;
  mobileHint: string;
  password: string;
  passwordHint: string;
  passwordCreate: string;
  forgot: string;
  socialIn: string;
  socialUp: string;
  noAccount: string;
  createNow: string;
  hasAccount: string;
  loginNow: string;
  guest: string;
  back: string;
  show: string;
  hide: string;
  onlyGoogle: string;
  badEmail: string;
};

const PHRASES: Record<LanguageId, Phrase> = {
  en: {
    login: "Login",
    welcome: "Welcome back! Please login to continue",
    create: "Create Account",
    createLead: "Enter your information below or continue with social media account",
    email: "Email Address",
    emailHint: "Your email address",
    mobile: "Mobile Number",
    mobileHint: "Your mobile number",
    password: "Password",
    passwordHint: "Enter your password",
    passwordCreate: "Create password",
    forgot: "Forgot Password",
    socialIn: "Or Continue with Social Accounts",
    socialUp: "Or Register with Social Accounts",
    noAccount: "Don't have an account?",
    createNow: "Create Now",
    hasAccount: "Already have an account?",
    loginNow: "Login Now",
    guest: "Continue as guest",
    back: "Back",
    show: "Show password",
    hide: "Hide password",
    onlyGoogle: "Only Google is connected on this app. Use Google, or continue as guest.",
    badEmail: "Enter the email address for this account.",
  },
  fr: {
    login: "Connexion",
    welcome: "Bon retour ! Connectez-vous pour continuer",
    create: "Créer un compte",
    createLead: "Entrez vos informations ci-dessous ou continuez avec un compte social",
    email: "Adresse e-mail",
    emailHint: "Votre adresse e-mail",
    mobile: "Numéro de mobile",
    mobileHint: "Votre numéro de mobile",
    password: "Mot de passe",
    passwordHint: "Entrez votre mot de passe",
    passwordCreate: "Créer un mot de passe",
    forgot: "Mot de passe oublié",
    socialIn: "Ou continuer avec un compte social",
    socialUp: "Ou s'inscrire avec un compte social",
    noAccount: "Pas encore de compte ?",
    createNow: "Créer maintenant",
    hasAccount: "Vous avez déjà un compte ?",
    loginNow: "Se connecter",
    guest: "Continuer en invité",
    back: "Retour",
    show: "Afficher le mot de passe",
    hide: "Masquer le mot de passe",
    onlyGoogle: "Seul Google est relié à cette application. Utilisez Google, ou continuez en invité.",
    badEmail: "Entrez l'adresse e-mail de ce compte.",
  },
  es: {
    login: "Entrar",
    welcome: "¡Bienvenido de nuevo! Inicie sesión para continuar",
    create: "Crear cuenta",
    createLead: "Escriba sus datos abajo o continúe con una cuenta social",
    email: "Correo electrónico",
    emailHint: "Su correo electrónico",
    mobile: "Número de móvil",
    mobileHint: "Su número de móvil",
    password: "Contraseña",
    passwordHint: "Escriba su contraseña",
    passwordCreate: "Crear contraseña",
    forgot: "Olvidé la contraseña",
    socialIn: "O continuar con una cuenta social",
    socialUp: "O registrarse con una cuenta social",
    noAccount: "¿No tiene una cuenta?",
    createNow: "Crear ahora",
    hasAccount: "¿Ya tiene una cuenta?",
    loginNow: "Entrar ahora",
    guest: "Continuar como invitado",
    back: "Volver",
    show: "Mostrar contraseña",
    hide: "Ocultar contraseña",
    onlyGoogle: "Solo Google está conectado en esta aplicación. Use Google o continúe como invitado.",
    badEmail: "Escriba el correo de esta cuenta.",
  },
  pt: {
    login: "Entrar",
    welcome: "Bem-vindo de volta! Entre para continuar",
    create: "Criar conta",
    createLead: "Preencha os dados abaixo ou continue com uma conta social",
    email: "E-mail",
    emailHint: "O seu e-mail",
    mobile: "Número de telemóvel",
    mobileHint: "O seu número de telemóvel",
    password: "Palavra-passe",
    passwordHint: "Introduza a palavra-passe",
    passwordCreate: "Criar palavra-passe",
    forgot: "Esqueci a palavra-passe",
    socialIn: "Ou continuar com uma conta social",
    socialUp: "Ou registar com uma conta social",
    noAccount: "Não tem conta?",
    createNow: "Criar agora",
    hasAccount: "Já tem conta?",
    loginNow: "Entrar agora",
    guest: "Continuar como convidado",
    back: "Voltar",
    show: "Mostrar palavra-passe",
    hide: "Ocultar palavra-passe",
    onlyGoogle: "Só o Google está ligado nesta aplicação. Use o Google ou continue como convidado.",
    badEmail: "Introduza o e-mail desta conta.",
  },
  de: {
    login: "Anmelden",
    welcome: "Willkommen zurück! Melden Sie sich an, um fortzufahren",
    create: "Konto erstellen",
    createLead: "Geben Sie Ihre Angaben ein oder fahren Sie mit einem sozialen Konto fort",
    email: "E-Mail-Adresse",
    emailHint: "Ihre E-Mail-Adresse",
    mobile: "Handynummer",
    mobileHint: "Ihre Handynummer",
    password: "Passwort",
    passwordHint: "Passwort eingeben",
    passwordCreate: "Passwort erstellen",
    forgot: "Passwort vergessen",
    socialIn: "Oder mit einem sozialen Konto fortfahren",
    socialUp: "Oder mit einem sozialen Konto registrieren",
    noAccount: "Noch kein Konto?",
    createNow: "Jetzt erstellen",
    hasAccount: "Schon ein Konto?",
    loginNow: "Jetzt anmelden",
    guest: "Als Gast fortfahren",
    back: "Zurück",
    show: "Passwort zeigen",
    hide: "Passwort verbergen",
    onlyGoogle: "Nur Google ist in dieser App verbunden. Nutzen Sie Google oder fahren Sie als Gast fort.",
    badEmail: "Geben Sie die E-Mail-Adresse dieses Kontos ein.",
  },
  zh: {
    login: "登录",
    welcome: "欢迎回来！请登录后继续",
    create: "创建账户",
    createLead: "在下面填写信息，或使用社交账户继续",
    email: "电子邮箱",
    emailHint: "你的电子邮箱",
    mobile: "手机号码",
    mobileHint: "你的手机号码",
    password: "密码",
    passwordHint: "输入密码",
    passwordCreate: "创建密码",
    forgot: "忘记密码",
    socialIn: "或使用社交账户继续",
    socialUp: "或使用社交账户注册",
    noAccount: "还没有账户？",
    createNow: "立即创建",
    hasAccount: "已经有账户？",
    loginNow: "立即登录",
    guest: "以访客身份继续",
    back: "返回",
    show: "显示密码",
    hide: "隐藏密码",
    onlyGoogle: "这个应用只连接了 Google。请使用 Google，或以访客身份继续。",
    badEmail: "请输入这个账户的电子邮箱。",
  },
  hi: {
    login: "लॉग इन",
    welcome: "वापसी पर स्वागत है! जारी रखने के लिए लॉग इन करें",
    create: "खाता बनाएँ",
    createLead: "नीचे जानकारी भरें या सोशल खाते से आगे बढ़ें",
    email: "ईमेल पता",
    emailHint: "आपका ईमेल पता",
    mobile: "मोबाइल नंबर",
    mobileHint: "आपका मोबाइल नंबर",
    password: "पासवर्ड",
    passwordHint: "अपना पासवर्ड लिखें",
    passwordCreate: "पासवर्ड बनाएँ",
    forgot: "पासवर्ड भूल गए",
    socialIn: "या सोशल खाते से जारी रखें",
    socialUp: "या सोशल खाते से रजिस्टर करें",
    noAccount: "खाता नहीं है?",
    createNow: "अभी बनाएँ",
    hasAccount: "पहले से खाता है?",
    loginNow: "अभी लॉग इन करें",
    guest: "अतिथि के रूप में जारी रखें",
    back: "वापस",
    show: "पासवर्ड दिखाएँ",
    hide: "पासवर्ड छिपाएँ",
    onlyGoogle: "इस ऐप पर केवल Google जुड़ा है। Google का उपयोग करें, या अतिथि के रूप में जारी रखें।",
    badEmail: "इस खाते का ईमेल पता लिखें।",
  },
  ar: {
    login: "دخول",
    welcome: "مرحبًا بعودتك! سجّل الدخول للمتابعة",
    create: "إنشاء حساب",
    createLead: "أدخل معلوماتك أدناه أو تابع بحساب اجتماعي",
    email: "البريد الإلكتروني",
    emailHint: "بريدك الإلكتروني",
    mobile: "رقم الجوال",
    mobileHint: "رقم جوالك",
    password: "كلمة المرور",
    passwordHint: "أدخل كلمة المرور",
    passwordCreate: "أنشئ كلمة مرور",
    forgot: "نسيت كلمة المرور",
    socialIn: "أو المتابعة بحساب اجتماعي",
    socialUp: "أو التسجيل بحساب اجتماعي",
    noAccount: "ليس لديك حساب؟",
    createNow: "أنشئ الآن",
    hasAccount: "لديك حساب بالفعل؟",
    loginNow: "ادخل الآن",
    guest: "المتابعة كضيف",
    back: "رجوع",
    show: "إظهار كلمة المرور",
    hide: "إخفاء كلمة المرور",
    onlyGoogle: "حساب Google فقط هو المتصل في هذا التطبيق. استخدم Google أو تابع كضيف.",
    badEmail: "أدخل البريد الإلكتروني لهذا الحساب.",
  },
};

function LeafArt() {
  return (
    <svg aria-hidden="true" viewBox="0 0 280 120" className="pointer-events-none absolute end-0 top-0 h-28 w-52 text-[#d9d3cc]">
      <path d="M210 8c18 22 8 48-12 62-16 12-36 10-44-4 18-6 34-22 38-40 2-8 8-16 18-18z" fill="currentColor" opacity="0.9" />
      <path d="M168 18c22 8 34 28 30 46-10-14-28-24-46-26 4-8 10-16 16-20z" fill="currentColor" />
      <path d="M236 36c16 18 10 40-8 50-8-16-10-32-4-46 4-2 8-4 12-4z" fill="currentColor" opacity="0.75" />
      <path d="M120 6c2 18-8 28-22 34" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M148 4c8 16 6 30-4 42" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="8" y="3.5" width="8" height="17" rx="2" />
      <path d="M11 17.5h2" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="5.5" y="10.5" width="13" height="9" rx="2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </svg>
  );
}

function EyeIcon({ off }: { off: boolean }) {
  return off ? (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 3l18 18" />
      <path d="M10.5 10.7A3 3 0 0 0 13.3 13.5" />
      <path d="M9.1 5.6A10 10 0 0 1 12 5c5 0 8.5 4.2 9.5 7-0.4 1.1-1.2 2.4-2.3 3.6" />
      <path d="M6.2 6.8C4.4 8.1 3.2 10 2.5 12c1 2.8 4.5 7 9.5 7 1.4 0 2.7-.3 3.8-.8" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M2.5 12C3.5 8.2 7 4 12 4s8.5 4.2 9.5 8c-1 3.8-4.5 8-9.5 8s-8.5-4.2-9.5-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
      <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7C21.7 18.8 23 15.8 23 12.3z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.2-6.9-5.1H1.3v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.1 14.3A7.2 7.2 0 0 1 4.7 12c0-.8.1-1.6.4-2.3V6.6H1.3A12 12 0 0 0 0 12c0 1.9.5 3.8 1.3 5.4l3.8-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l3.8 3.1C6.1 7 8.8 4.8 12 4.8z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-[#1877F2]">
      <path d="M14.5 8.5V6.7c0-.7.5-1 1.2-1H17V3h-2.1C12.4 3 11 4.4 11 6.5v2H9v2.6h2V21h3.5v-9.9h2.3l.4-2.6h-2.7z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-[#111]">
      <path d="M16.4 12.6c0-2.2 1.8-3.2 1.9-3.3-1-1.5-2.6-1.7-3.2-1.7-1.3-.1-2.6.8-3.3.8s-1.7-.8-2.8-.8c-1.5 0-2.8.9-3.6 2.2-1.5 2.7-.4 6.6 1.1 8.8.7 1.1 1.6 2.3 2.7 2.2 1.1 0 1.5-.7 2.8-.7s1.6.7 2.8.7 1.9-1.1 2.6-2.1c.8-1.2 1.1-2.3 1.2-2.4-.1 0-2.2-.8-2.2-3.7zM14.7 6.7c.6-.7 1-1.7.9-2.7-0.9 0-1.9.6-2.5 1.3-.6.6-1.1 1.6-.9 2.6 1 .1 1.9-.5 2.5-1.2z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-[#1DA1F2]">
      <path d="M21 6.5c-.6.3-1.3.5-2 .6.7-.4 1.3-1.1 1.5-2-.7.4-1.4.7-2.2.9A3.4 3.4 0 0 0 12 8.6c0 .3 0 .5.1.8-2.8-.1-5.3-1.5-7-3.6-.3.5-.4 1.1-.4 1.7 0 1.2.6 2.2 1.5 2.8-.5 0-1.1-.2-1.5-.4 0 1.6 1.2 3 2.7 3.3-.3.1-.6.1-.9.1-.2 0-.4 0-.6-.1.4 1.3 1.6 2.2 3 2.3A6.8 6.8 0 0 1 3 17.6 9.6 9.6 0 0 0 8.3 19c6.3 0 9.7-5.2 9.7-9.7v-.4c.7-.5 1.3-1.1 1.8-1.8-.6.3-1.3.5-2 .6z" />
    </svg>
  );
}

function SocialButton({ label, children, href, onClick }: { label: string; children: ReactNode; href?: string; onClick?: () => void }) {
  const className = "inline-flex size-12 items-center justify-center rounded-2xl border border-[#ece7e2] bg-white shadow-[0_6px_16px_rgba(60,40,20,0.04)]";
  if (href) {
    return (
      <a href={href} aria-label={label} className={className}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" aria-label={label} onClick={onClick} className={className}>
      {children}
    </button>
  );
}

export function AuthPanel({ mode }: { mode: "login" | "signup" }) {
  const copy = useCopy();
  const { language } = useLanguage();
  const text = PHRASES[language];
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [socialNote, setSocialNote] = useState<string | null>(null);
  const emailHref = mode === "signup" ? "/api/auth/auth0/login?screen=signup" : "/api/auth/auth0/login";
  const googleHref =
    mode === "signup"
      ? "/api/auth/auth0/login?screen=signup&connection=google-oauth2"
      : "/api/auth/auth0/login?connection=google-oauth2";

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("error");
    if (code === "google") setNotice(copy.auth.errorGoogle);
    else if (code === "mfa") setNotice(copy.auth.errorMfa);
    else if (code === "config") setNotice(copy.auth.errorConfig);
    else if (code) setNotice(copy.auth.errorAuth);
    else setNotice(null);
  }, [copy]);

  function continueWithEmail(event: FormEvent) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setNotice(text.badEmail);
      return;
    }
    const join = emailHref.includes("?") ? "&" : "?";
    window.location.assign(`${emailHref}${join}login_hint=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="mx-auto w-full max-w-[440px]">
      <section className="relative overflow-hidden rounded-[28px] bg-white px-7 pt-6 pb-8 text-[#2b241c] shadow-[0_24px_60px_rgba(70,50,30,0.08)] sm:px-9">
        <LeafArt />
        <Link
          href="/"
          aria-label={text.back}
          className="relative z-10 inline-flex size-10 items-center justify-center rounded-full border border-[#ece7e2] text-[#2b241c]"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </Link>
        <div className="relative mt-8 space-y-2">
          <h1 className="font-heading text-[42px] leading-none">{mode === "signup" ? text.create : text.login}</h1>
          <p className="max-w-xs text-sm leading-6 text-[#8d867f]">{mode === "signup" ? text.createLead : text.welcome}</p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={continueWithEmail}>
          <label className="flex items-center gap-3 rounded-2xl border border-[#ece7e2] px-4 py-3">
            <span className="text-[#c4896a]">
              <MailIcon />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-semibold">{text.email}</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={text.emailHint}
                autoComplete="email"
                className="bg-transparent text-sm outline-none placeholder:text-[#b7b1aa]"
              />
            </span>
          </label>
          {mode === "signup" ? (
            <label className="flex items-center gap-3 rounded-2xl border border-[#ece7e2] px-4 py-3">
              <span className="text-[#c4896a]">
                <PhoneIcon />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-semibold">{text.mobile}</span>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(event) => setMobile(event.target.value)}
                  placeholder={text.mobileHint}
                  autoComplete="tel"
                  className="bg-transparent text-sm outline-none placeholder:text-[#b7b1aa]"
                />
              </span>
            </label>
          ) : null}
          <label className="flex items-center gap-3 rounded-2xl border border-[#ece7e2] px-4 py-3">
            <span className="text-[#c4896a]">
              <LockIcon />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-semibold">{text.password}</span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={mode === "signup" ? text.passwordCreate : text.passwordHint}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="bg-transparent text-sm outline-none placeholder:text-[#b7b1aa]"
              />
            </span>
            <button
              type="button"
              aria-label={showPassword ? text.hide : text.show}
              onClick={() => setShowPassword((current) => !current)}
              className="text-[#8d867f]"
            >
              <EyeIcon off={showPassword} />
            </button>
          </label>
          <button type="submit" className="mt-2 h-12 w-full rounded-xl bg-[#c4896a] text-sm font-semibold text-white">
            {mode === "signup" ? text.create : text.login}
          </button>
        </form>
        {mode === "login" ? (
          <p className="mt-4 text-center">
            <a href={emailHref} className="text-sm font-semibold text-[#c4896a]">
              {text.forgot}
            </a>
          </p>
        ) : null}
        {notice ? <p className="mt-4 text-sm leading-6 text-[#9f2d2d]">{notice}</p> : null}
        <p className="mt-8 text-center text-sm text-[#8d867f]">{mode === "signup" ? text.socialUp : text.socialIn}</p>
        <div className="mt-4 flex items-center justify-center gap-4">
          <SocialButton label="Google" href={googleHref}>
            <GoogleIcon />
          </SocialButton>
          <SocialButton label="Facebook" onClick={() => setSocialNote(text.onlyGoogle)}>
            <FacebookIcon />
          </SocialButton>
          <SocialButton label="Apple" onClick={() => setSocialNote(text.onlyGoogle)}>
            <AppleIcon />
          </SocialButton>
          <SocialButton label="Twitter" onClick={() => setSocialNote(text.onlyGoogle)}>
            <TwitterIcon />
          </SocialButton>
        </div>
        {socialNote ? <p className="mt-4 text-center text-sm leading-6 text-[#8d867f]">{socialNote}</p> : null}
        <Link
          href="/"
          className="mt-6 flex h-12 w-full items-center justify-center rounded-xl border border-[#c4896a] text-sm font-semibold text-[#c4896a]"
        >
          {text.guest}
        </Link>
        <p className="mt-6 text-center text-sm text-[#8d867f]">
          {mode === "signup" ? (
            <>
              {text.hasAccount}{" "}
              <Link href="/login" className="font-semibold text-[#c4896a]">
                {text.loginNow}
              </Link>
            </>
          ) : (
            <>
              {text.noAccount}{" "}
              <Link href="/signup" className="font-semibold text-[#c4896a]">
                {text.createNow}
              </Link>
            </>
          )}
        </p>
      </section>
    </div>
  );
}