import React, { useContext, useState } from "react";
import { Popover, Typography, useTheme } from "@material-ui/core";
import { makeStyles, alpha } from "@material-ui/core/styles";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const CheckIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 12L10 17L20 7" />
  </svg>
);

const useStyles = makeStyles((theme) => ({
  triggerButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: "6px 8px",
    borderRadius: 8,
    transition: "all 0.15s ease",
    background: theme.mode === "dark" ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)",
    border: theme.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
    "&:hover": {
      borderColor: "#06b6d4",
      background: theme.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
    },
  },
  triggerFlag: {
    width: 24,
    height: 16,
    objectFit: "cover",
    borderRadius: 3,
    display: "block",
  },
  popoverPaper: {
    borderRadius: 14,
    minWidth: 220,
    overflow: "hidden",
    boxShadow: "0 10px 36px rgba(0,0,0,0.3)",
    border: theme.mode === "dark"
      ? "1px solid rgba(255,255,255,0.08)"
      : "1px solid #e2e8f0",
    background: theme.mode === "dark" ? "#12121c" : "#ffffff",
    backdropFilter: "blur(16px)",
  },
  header: {
    padding: "12px 16px 8px",
    borderBottom: theme.mode === "dark"
      ? "1px solid rgba(255,255,255,0.06)"
      : "1px solid rgba(0,0,0,0.06)",
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    color: theme.mode === "dark" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
  },
  optionsList: {
    padding: 6,
  },
  optionItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.15s ease",
    "&:hover": {
      background: theme.mode === "dark"
        ? "rgba(255,255,255,0.06)"
        : "rgba(0,0,0,0.04)",
    },
  },
  optionItemSelected: {
    background: theme.mode === "dark"
      ? "rgba(6, 182, 212, 0.15)"
      : "rgba(6, 182, 212, 0.08)",
    "&:hover": {
      background: theme.mode === "dark"
        ? "rgba(6, 182, 212, 0.22)"
        : "rgba(6, 182, 212, 0.12)",
    },
  },
  flagImg: {
    width: 24,
    height: 16,
    objectFit: "cover",
    borderRadius: 3,
    flexShrink: 0,
  },
  optionName: {
    fontSize: 13,
    fontWeight: 500,
    color: theme.mode === "dark" ? "#ffffff" : "#0f172a",
    flex: 1,
  },
  checkWrapper: {
    width: 16,
    height: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#06b6d4",
    flexShrink: 0,
  },
}));

const UserLanguageSelector = () => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const { user } = useContext(AuthContext);

  const languageOptions = [
    { code: "es", shortCode: "es", flag: "/flags/es.png", name: "Español" },
    { code: "en", shortCode: "en", flag: "/flags/us.png", name: "English" },
    { code: "pt-BR", shortCode: "pt", flag: "/flags/br.png", name: "Português" },
    { code: "tr", shortCode: "tr", flag: "/flags/tr.png", name: "Türkçe" },
    { code: "ar", shortCode: "ar", flag: "/flags/sa.png", name: "العربية" },
  ];

  let currentLanguage = "es";
  try {
    currentLanguage = localStorage.getItem("i18nextLng") || "es";
  } catch (e) {
    currentLanguage = "es";
  }

  if (currentLanguage === "es" && i18n.language && i18n.language !== "es") {
    currentLanguage = i18n.language;
  }

  const selectedLanguage = languageOptions.find(
    lang => lang.code === currentLanguage || lang.shortCode === currentLanguage
  ) || languageOptions[0];

  const isSelected = (lang) =>
    lang.code === currentLanguage || lang.shortCode === currentLanguage;

  const headerLabel = (() => {
    const l = (currentLanguage || "es").split("-")[0];
    return l === "en" ? "Language" : l === "pt" ? "Idioma" : l === "tr" ? "Dil" : l === "ar" ? "اللغة" : "Idioma";
  })();

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleChangeLanguage = async (language) => {
    try {
      await i18n.changeLanguage(language);
      localStorage.setItem("i18nextLng", language);
      if (user?.id) {
        await api.put(`/users/${user.id}`, { language });
      }
      window.location.reload();
    } catch (err) {
      toastError(err);
    }
    handleClose();
  };

  return (
    <>
      <div className={classes.triggerButton} onClick={handleOpen}>
        <img
          src={selectedLanguage.flag}
          alt={selectedLanguage.name}
          className={classes.triggerFlag}
        />
      </div>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        PaperProps={{ className: classes.popoverPaper }}
        disableScrollLock
      >
        <div className={classes.header}>
          <Typography className={classes.headerTitle}>
            {headerLabel}
          </Typography>
        </div>

        <div className={classes.optionsList}>
          {languageOptions.map((lang) => {
            const selected = isSelected(lang);
            return (
              <div
                key={lang.code}
                className={`${classes.optionItem} ${selected ? classes.optionItemSelected : ""}`}
                onClick={() => handleChangeLanguage(lang.code)}
              >
                <img
                  src={lang.flag}
                  alt={lang.name}
                  className={classes.flagImg}
                />
                <Typography className={classes.optionName}>
                  {lang.name}
                </Typography>
                <div className={classes.checkWrapper}>
                  {selected && <CheckIcon />}
                </div>
              </div>
            );
          })}
        </div>
      </Popover>
    </>
  );
};

export default UserLanguageSelector;
