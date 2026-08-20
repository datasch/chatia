import { i18n } from "../../translate/i18n";
import React, { useState, useEffect, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Button, TextField, Typography, Popover, Switch, IconButton } from "@material-ui/core";
import { makeStyles, useTheme, alpha } from "@material-ui/core/styles";
import { AuthContext } from "../../context/Auth/AuthContext";
import ColorModeContext from "../../layout/themeContext";
import { BACKEND_URL } from "../../config/env";

const EmailSvgIcon = ({ color = "#94a3b8", size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 7C3 5.89543 3.89543 5 5 5H19C20.1046 5 21 5.89543 21 7V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 7L12 13L21 7"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LockSvgIcon = ({ color = "#94a3b8", size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth="1.6" />
    <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="12" cy="16" r="1.5" fill={color} />
  </svg>
);

const VisibilitySvgIcon = ({ color = "#94a3b8", size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const VisibilityOffSvgIcon = ({ color = "#94a3b8", size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12A18.45 18.45 0 0 1 5.06 6.06L17.94 17.94Z" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4C19 4 23 12 23 12A18.5 18.5 0 0 1 19.82 16.14L9.9 4.24Z" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M1 1L23 23" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 12L10 17L20 7" />
  </svg>
);

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    width: "100vw",
    height: "100vh",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    backgroundColor: theme.mode === "light" ? "#f8fafc" : "#0a0a0f",
    transition: "background-color 0.3s ease",
  },
  // Ambient neon glow backgrounds
  ambientGlowTop: {
    position: "absolute",
    width: "550px",
    height: "550px",
    top: "-150px",
    left: "-100px",
    background: "radial-gradient(circle, rgba(6, 182, 212, 0.18) 0%, rgba(59, 130, 246, 0.08) 50%, transparent 70%)",
    borderRadius: "50%",
    filter: "blur(60px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  ambientGlowBottom: {
    position: "absolute",
    width: "600px",
    height: "600px",
    bottom: "-150px",
    right: "-100px",
    background: "radial-gradient(circle, rgba(139, 92, 246, 0.16) 0%, rgba(236, 72, 153, 0.08) 50%, transparent 70%)",
    borderRadius: "50%",
    filter: "blur(70px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  topLeftControls: {
    position: "absolute",
    top: "24px",
    left: "24px",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  langTriggerButton: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    padding: "6px 10px",
    borderRadius: 10,
    transition: "all 0.2s ease",
    background: theme.mode === "dark" ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)",
    backdropFilter: "blur(8px)",
    border: theme.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.08)",
    "&:hover": {
      borderColor: "#06b6d4",
      background: theme.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
    },
  },
  langTriggerFlag: {
    width: 22,
    height: 15,
    objectFit: "cover",
    borderRadius: 3,
    display: "block",
  },
  langPopoverPaper: {
    borderRadius: 14,
    minWidth: 220,
    overflow: "hidden",
    boxShadow: "0 12px 36px rgba(0,0,0,0.35)",
    border: theme.mode === "dark"
      ? "1px solid rgba(255,255,255,0.1)"
      : "1px solid rgba(0,0,0,0.08)",
    background: theme.mode === "dark" ? "#12121c" : "#ffffff",
    backdropFilter: "blur(16px)",
  },
  langHeader: {
    padding: "12px 16px 8px",
    borderBottom: theme.mode === "dark"
      ? "1px solid rgba(255,255,255,0.06)"
      : "1px solid rgba(0,0,0,0.06)",
  },
  langHeaderTitle: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    color: theme.mode === "dark" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
  },
  langOptionsList: {
    padding: 6,
  },
  langOptionItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.15s ease",
    "&:hover": {
      background: theme.mode === "dark"
        ? "rgba(255,255,255,0.08)"
        : "rgba(0,0,0,0.04)",
    },
  },
  langOptionItemSelected: {
    background: theme.mode === "dark"
      ? "rgba(6, 182, 212, 0.15)"
      : "rgba(6, 182, 212, 0.08)",
    "&:hover": {
      background: theme.mode === "dark"
        ? "rgba(6, 182, 212, 0.22)"
        : "rgba(6, 182, 212, 0.12)",
    },
  },
  langFlagImg: {
    width: 24,
    height: 16,
    objectFit: "cover",
    borderRadius: 3,
    flexShrink: 0,
  },
  langOptionName: {
    fontSize: 13,
    fontWeight: 500,
    color: theme.mode === "dark" ? "#ffffff" : "#0f172a",
    flex: 1,
  },
  langCheckWrapper: {
    width: 16,
    height: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#06b6d4",
    flexShrink: 0,
  },
  themeToggle: {
    background: theme.mode === "dark" ? "rgba(255, 255, 255, 0.06) !important" : "rgba(0, 0, 0, 0.05) !important",
    border: theme.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.1) !important" : "1px solid rgba(0, 0, 0, 0.08) !important",
    borderRadius: "10px !important",
    padding: "6px !important",
    transition: "all 0.2s ease !important",
    width: "36px",
    height: "36px",
    boxShadow: "none !important",
    "&:hover": {
      borderColor: "#06b6d4 !important",
      background: theme.mode === "dark" ? "rgba(255, 255, 255, 0.1) !important" : "rgba(0, 0, 0, 0.08) !important",
    },
  },
  formSide: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px",
    zIndex: 1,
  },
  formContainer: {
    width: "100%",
    maxWidth: "420px",
    background: theme.mode === "light"
      ? "rgba(255, 255, 255, 0.95)"
      : "linear-gradient(135deg, rgba(20, 20, 32, 0.85) 0%, rgba(14, 14, 22, 0.95) 100%)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "20px",
    boxShadow: theme.mode === "light"
      ? "0 20px 40px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0,0,0,0.05)"
      : "0 24px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(6, 182, 212, 0.1)",
    padding: "36px 32px",
    border: theme.mode === "dark"
      ? "1px solid rgba(255, 255, 255, 0.1)"
      : "1px solid rgba(226, 232, 240, 0.8)",
    transition: "all 0.3s ease",
    [theme.breakpoints.down("xs")]: { maxWidth: "340px", padding: "28px 20px" },
  },
  brandHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "24px",
  },
  logoImg: {
    display: "block",
    margin: "0 auto 12px",
    maxWidth: "180px",
    height: "auto",
    filter: theme.mode === "dark" ? "drop-shadow(0 4px 12px rgba(6, 182, 212, 0.2))" : "none",
  },
  brandSubtitle: {
    fontSize: "12px",
    fontWeight: 500,
    letterSpacing: "0.04em",
    color: theme.mode === "dark" ? "#94a3b8" : "#64748b",
    textAlign: "center",
  },
  submitBtn: {
    marginTop: "22px",
    background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%) !important",
    color: "#ffffff !important",
    borderRadius: "12px !important",
    padding: "12px 16px !important",
    fontWeight: "700 !important",
    fontSize: "14px !important",
    letterSpacing: "0.02em !important",
    width: "100%",
    cursor: "pointer",
    border: "none !important",
    boxShadow: "0 4px 18px rgba(6, 182, 212, 0.3) !important",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important",
    "&:hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 8px 26px rgba(6, 182, 212, 0.45) !important",
      filter: "brightness(1.08)",
    },
  },
  signupText: {
    marginTop: "18px",
    textAlign: "center",
    fontSize: "13px",
    color: theme.mode === "light" ? "#64748b" : "#94a3b8",
  },
  signupLink: {
    color: "#06b6d4",
    textDecoration: "none",
    fontWeight: "600",
    marginLeft: "4px",
    "&:hover": { textDecoration: "underline", color: "#38bdf8" },
  },
  forgotPassword: { marginTop: "14px", textAlign: "center" },
  forgotPasswordLink: {
    color: theme.mode === "light" ? "#64748b" : "#94a3b8",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: "500",
    transition: "color 0.2s ease",
    "&:hover": { color: "#06b6d4", textDecoration: "underline" },
  },
  rememberMeContainer: {
    display: "flex",
    alignItems: "center",
    marginTop: "12px",
    "& .MuiTypography-root": {
      color: theme.mode === "dark" ? "#cbd5e1" : "#475569",
      fontSize: "13px",
      fontWeight: 500,
    },
  },
  textFieldPrimary: {
    "&& label": {
      color: theme.mode === "dark" ? "#94a3b8 !important" : "#64748b !important",
      fontSize: "14px",
    },
    "&& label.Mui-focused": {
      color: "#06b6d4 !important",
    },
    "&& .MuiOutlinedInput-root": {
      backgroundColor: theme.mode === "dark" ? "rgba(10, 10, 15, 0.6)" : "#ffffff",
      borderRadius: "12px",
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    },
    "&& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.mode === "dark" ? "rgba(255, 255, 255, 0.12) !important" : "#e2e8f0 !important",
      borderRadius: "12px",
    },
    "&&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.mode === "dark" ? "rgba(6, 182, 212, 0.4) !important" : "#cbd5e1 !important",
    },
    "&& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#06b6d4 !important",
      borderWidth: "1.5px",
    },
    "&& .MuiOutlinedInput-input": {
      paddingLeft: "44px",
      color: theme.mode === "dark" ? "#f8fafc" : "#0f172a",
      fontSize: "14px",
    },
    "&& .MuiInputLabel-outlined": {
      transform: "translate(44px, 18px) scale(1)",
    },
    "&& .MuiInputLabel-outlined.MuiInputLabel-shrink": {
      transform: "translate(14px, -6px) scale(0.75)",
    },
  },
  textFieldWithEndIcon: {
    "&& label": {
      color: theme.mode === "dark" ? "#94a3b8 !important" : "#64748b !important",
      fontSize: "14px",
    },
    "&& label.Mui-focused": {
      color: "#06b6d4 !important",
    },
    "&& .MuiOutlinedInput-root": {
      backgroundColor: theme.mode === "dark" ? "rgba(10, 10, 15, 0.6)" : "#ffffff",
      borderRadius: "12px",
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    },
    "&& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.mode === "dark" ? "rgba(255, 255, 255, 0.12) !important" : "#e2e8f0 !important",
      borderRadius: "12px",
    },
    "&&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.mode === "dark" ? "rgba(6, 182, 212, 0.4) !important" : "#cbd5e1 !important",
    },
    "&& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#06b6d4 !important",
      borderWidth: "1.5px",
    },
    "&& .MuiOutlinedInput-input": {
      paddingLeft: "44px",
      paddingRight: "44px",
      color: theme.mode === "dark" ? "#f8fafc" : "#0f172a",
      fontSize: "14px",
    },
    "&& .MuiInputLabel-outlined": {
      transform: "translate(44px, 18px) scale(1)",
    },
    "&& .MuiInputLabel-outlined.MuiInputLabel-shrink": {
      transform: "translate(14px, -6px) scale(0.75)",
    },
  },
  inputContainer: {
    position: "relative",
    width: "100%",
  },
  inputIconLeft: {
    position: "absolute",
    left: "14px",
    top: "33px",
    zIndex: 1,
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputIconRight: {
    position: "absolute",
    right: "12px",
    top: "25px",
    zIndex: 1,
    cursor: "pointer",
    padding: "8px",
    borderRadius: "6px",
    transition: "opacity 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": {
      opacity: 0.7,
    },
  },
  footerBrand: {
    marginTop: "20px",
    textAlign: "center",
    fontSize: "11px",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: theme.mode === "dark" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.35)",
  },
}));

const Login = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { handleLogin } = useContext(AuthContext);
  const { colorMode } = useContext(ColorModeContext);

  const [user, setUser] = useState({ email: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [userCreationEnabled, setUserCreationEnabled] = useState(true);
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState(null);
  const [mounted, setMounted] = useState(false);

  const languageOptions = [
    { code: "es", shortCode: "es", flag: "/flags/es.png", name: "Español" },
    { code: "en", shortCode: "en", flag: "/flags/us.png", name: "English" },
    { code: "pt-BR", shortCode: "pt", flag: "/flags/br.png", name: "Português" },
    { code: "tr", shortCode: "tr", flag: "/flags/tr.png", name: "Türkçe" },
    { code: "ar", shortCode: "ar", flag: "/flags/sa.png", name: "العربية" },
  ];

  const currentLanguage = localStorage.getItem("i18nextLng") || "es";
  const selectedLanguage = languageOptions.find(
    lang => lang.code === currentLanguage || lang.shortCode === currentLanguage
  ) || languageOptions[0];

  const isLangSelected = (lang) =>
    lang.code === currentLanguage || lang.shortCode === currentLanguage;

  const langHeaderLabel = (() => {
    const l = (currentLanguage || "es").split("-")[0];
    return l === "en" ? "Language" : l === "pt" ? "Idioma" : l === "tr" ? "Dil" : l === "ar" ? "اللغة" : "Idioma";
  })();

  const backendUrl =
    BACKEND_URL === "https://localhost:8090"
      ? "https://localhost:8090"
      : BACKEND_URL;

  const getLogoPath = () => {
    const isDark = theme.mode === 'dark';
    return isDark
      ? colorMode.appLogoDark || "/logo-dark.png"
      : colorMode.appLogoLight || "/logo-light.png";
  };

  useEffect(() => {
    document.title = "Gissap CRM · Iniciar Sesión";
    document.body.classList.add("login-page");
    requestAnimationFrame(() => setMounted(true));
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  useEffect(() => {
    const fetchUserCreationStatus = async () => {
      try {
        const response = await fetch(`${backendUrl}/settings/userCreation`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Failed to fetch user creation status");
        const data = await response.json();
        setUserCreationEnabled(data.userCreation === "enabled");
      } catch (err) {
        setUserCreationEnabled(false);
      }
    };
    fetchUserCreationStatus();
  }, [backendUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const lang = localStorage.getItem("i18nextLng") || "es";
    i18n.changeLanguage(lang);
    handleLogin(user);
  };

  const handleLanguageOpen = (event) => {
    setLanguageMenuAnchor(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLanguageMenuAnchor(null);
  };

  const handleLanguageChange = async (languageCode) => {
    try {
      await i18n.changeLanguage(languageCode);
      localStorage.setItem("i18nextLng", languageCode);
      handleLanguageClose();
      window.location.reload();
    } catch (err) {
      console.error("Error al cambiar idioma:", err);
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.ambientGlowTop}></div>
      <div className={classes.ambientGlowBottom}></div>

      {/* Top Controls */}
      <div className={classes.topLeftControls}>
        <div className={classes.langTriggerButton} onClick={handleLanguageOpen}>
          <img
            src={selectedLanguage.flag}
            alt={selectedLanguage.name}
            className={classes.langTriggerFlag}
          />
        </div>

        <IconButton
          className={classes.themeToggle}
          onClick={colorMode.toggleColorMode}
          title={theme.mode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {theme.mode === 'dark' ? (
            <img
              src="/theme/sol.png"
              alt="Modo claro"
              style={{ width: '20px', height: '20px' }}
            />
          ) : (
            <img
              src="/theme/lua.png"
              alt="Modo oscuro"
              style={{ width: '20px', height: '20px' }}
            />
          )}
        </IconButton>
      </div>

      {/* Language Popover */}
      <Popover
        open={Boolean(languageMenuAnchor)}
        anchorEl={languageMenuAnchor}
        onClose={handleLanguageClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        PaperProps={{ className: classes.langPopoverPaper }}
        disableScrollLock
      >
        <div className={classes.langHeader}>
          <Typography className={classes.langHeaderTitle}>
            {langHeaderLabel}
          </Typography>
        </div>
        <div className={classes.langOptionsList}>
          {languageOptions.map((lang) => {
            const selected = isLangSelected(lang);
            return (
              <div
                key={lang.code}
                className={`${classes.langOptionItem} ${selected ? classes.langOptionItemSelected : ""}`}
                onClick={() => handleLanguageChange(lang.code)}
              >
                <img
                  src={lang.flag}
                  alt={lang.name}
                  className={classes.langFlagImg}
                />
                <Typography className={classes.langOptionName}>
                  {lang.name}
                </Typography>
                <div className={classes.langCheckWrapper}>
                  {selected && <CheckIcon />}
                </div>
              </div>
            );
          })}
        </div>
      </Popover>

      {/* Form Card */}
      <div className={classes.formSide}>
        <form
          className={classes.formContainer}
          onSubmit={handleSubmit}
          style={!mounted ? { opacity: 0, transform: "translateY(16px)" } : { opacity: 1, transform: "translateY(0)", transition: "opacity 0.5s ease, transform 0.5s ease" }}
        >
          <div className={classes.brandHeader}>
            <img src={getLogoPath()} alt="Gissap CRM" className={classes.logoImg} />
            <Typography className={classes.brandSubtitle}>
              SISTEMA INTELIGENTE DE ATENCIÓN Y CLIENTES
            </Typography>
          </div>

          <div className={classes.inputContainer}>
            <TextField
              className={classes.textFieldPrimary}
              label={i18n.t("login.emailLabel")}
              variant="outlined"
              fullWidth
              margin="normal"
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
            <div className={classes.inputIconLeft}>
              <EmailSvgIcon color={theme.mode === "light" ? "#64748b" : "#94a3b8"} size={19} />
            </div>
          </div>

          <div className={classes.inputContainer}>
            <TextField
              className={classes.textFieldWithEndIcon}
              label={i18n.t("login.passwordLabel")}
              variant="outlined"
              fullWidth
              margin="normal"
              type={showPassword ? "text" : "password"}
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
            />
            <div className={classes.inputIconLeft}>
              <LockSvgIcon color={theme.mode === "light" ? "#64748b" : "#94a3b8"} size={19} />
            </div>
            <div
              className={classes.inputIconRight}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <VisibilityOffSvgIcon color={theme.mode === "light" ? "#64748b" : "#94a3b8"} size={19} />
              ) : (
                <VisibilitySvgIcon color={theme.mode === "light" ? "#64748b" : "#94a3b8"} size={19} />
              )}
            </div>
          </div>

          <div className={classes.rememberMeContainer}>
            <Switch
              checked={user.remember}
              onChange={(e) =>
                setUser({ ...user, remember: e.target.checked })
              }
              name="remember"
              color="primary"
            />
            <Typography>{i18n.t("login.rememberMe")}</Typography>
          </div>

          <div>
            <Button
              type="submit"
              variant="contained"
              className={classes.submitBtn}
            >
              {i18n.t("login.loginButton")}
            </Button>

            {userCreationEnabled && (
              <div className={classes.signupText}>
                {i18n.t("login.noAccount")}{" "}
                <RouterLink to="/signup" className={classes.signupLink}>
                  {i18n.t("login.signupButton")}
                </RouterLink>
              </div>
            )}
          </div>

          <div className={classes.forgotPassword}>
            <RouterLink
              to="/forgot-password"
              className={classes.forgotPasswordLink}
            >
              {i18n.t("login.forgotPassword")}
            </RouterLink>
          </div>
        </form>

        <Typography className={classes.footerBrand}>
          © Giantucchi Ecosystem · Gissap CRM
        </Typography>
      </div>
    </div>
  );
};

export default Login;
