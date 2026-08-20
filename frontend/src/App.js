import React, { useState, useEffect, useMemo } from "react";
import api from "./services/api";
import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { ptBR, esES } from "@material-ui/core/locale";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { useMediaQuery } from "@material-ui/core";
import ColorModeContext from "./layout/themeContext";
import { ActiveMenuProvider } from "./context/ActiveMenuContext";
import Favicon from "react-favicon";
import { getBackendUrl } from "./config";
import Routes from "./routes";
import useSettings from "./hooks/useSettings";

const defaultLogoLight = "/logo-light.png";
const defaultLogoDark = "/logo-dark.png";
const defaultLogoFavicon = "/favicon.png";

const queryClient = new QueryClient();

const App = () => {
  const [locale, setLocale] = useState();
  const appColorLocalStorage = localStorage.getItem("primaryColorLight") || localStorage.getItem("primaryColorDark") || "#06b6d4";
  const appNameLocalStorage = localStorage.getItem("appName") || "Gissap CRM";
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const preferredTheme = window.localStorage.getItem("preferredTheme");
  const [mode, setMode] = useState(preferredTheme ? preferredTheme : "dark");
  const [primaryColorLight, setPrimaryColorLight] = useState(appColorLocalStorage);
  const [primaryColorDark, setPrimaryColorDark] = useState(appColorLocalStorage);
  const [appLogoLight, setAppLogoLight] = useState(defaultLogoLight);
  const [appLogoDark, setAppLogoDark] = useState(defaultLogoDark);
  const [appLogoFavicon, setAppLogoFavicon] = useState(defaultLogoFavicon);
  const [appName, setAppName] = useState(appNameLocalStorage);
  const { getPublicSetting } = useSettings();
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        document.body.classList.add("theme-transitioning");
        setMode((prevMode) => {
          const newMode = prevMode === "light" ? "dark" : "light";
          window.localStorage.setItem("preferredTheme", newMode);
          return newMode;
        });
        setTimeout(() => {
          document.body.classList.remove("theme-transitioning");
        }, 400);
      },
      setPrimaryColorLight,
      setPrimaryColorDark,
      setAppLogoLight,
      setAppLogoDark,
      setAppLogoFavicon,
      setAppName,
      appLogoLight,
      appLogoDark,
      appLogoFavicon,
      appName,
      mode,
    }),
    [appLogoLight, appLogoDark, appLogoFavicon, appName, mode]
  );

  const theme = useMemo(
    () =>
      createTheme(
        {
          typography: {
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            h6: { fontWeight: 600 },
            subtitle1: { fontWeight: 500 },
            body1: { fontSize: "0.875rem" },
            body2: { fontSize: "0.8125rem" },
            button: { textTransform: "none", fontWeight: 600 },
          },
          shape: {
            borderRadius: 12,
          },
          scrollbarStyles: {
            "&::-webkit-scrollbar": {
              width: "6px",
              height: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              borderRadius: "999px",
              backgroundColor: mode === "light" ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.18)",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#06b6d4",
            },
          },
          scrollbarStylesSoft: {
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              borderRadius: "999px",
              backgroundColor: mode === "light" ? "#e2e8f0" : "#1f1f2e",
            },
          },
          palette: {
            type: mode,
            primary: {
              main: mode === "light" ? primaryColorLight : primaryColorDark,
              light: "#38bdf8",
              dark: "#0284c7",
              contrastText: "#ffffff",
            },
            secondary: {
              main: "#8b5cf6",
              light: "#a78bfa",
              dark: "#7c3aed",
            },
            background: {
              default: mode === "light" ? "#f8fafc" : "#0a0a0f",
              paper: mode === "light" ? "#ffffff" : "#12121c",
            },
            textPrimary: mode === "light" ? "#0f172a" : "#f8fafc",
            borderPrimary: mode === "light" ? "#e2e8f0" : "rgba(255, 255, 255, 0.08)",
            dark: { main: mode === "light" ? "#1e293b" : "#f8fafc" },
            light: { main: mode === "light" ? "#f1f5f9" : "#1a1a2e" },
            fontColor: mode === "light" ? "#0f172a" : "#f8fafc",
            tabHeaderBackground: mode === "light" ? "#f1f5f9" : "#161626",
            optionsBackground: mode === "light" ? "#f8fafc" : "#12121c",
            fancyBackground: mode === "light" ? "#f8fafc" : "#0a0a0f",
            total: mode === "light" ? "#ffffff" : "#12121c",
            messageIcons: mode === "light" ? "#64748b" : "#94a3b8",
            inputBackground: mode === "light" ? "#ffffff" : "#161626",
            barraSuperior: mode === "light" ? "#ffffff" : "#0a0a0f",
          },
          overrides: {
            MuiPaper: {
              rounded: {
                borderRadius: 14,
              },
              elevation1: {
                boxShadow: mode === "light"
                  ? "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)"
                  : "0 4px 20px rgba(0,0,0,0.4)",
                border: mode === "light"
                  ? "1px solid #e2e8f0"
                  : "1px solid rgba(255, 255, 255, 0.08)",
              },
            },
            MuiCard: {
              root: {
                borderRadius: 16,
                backgroundColor: mode === "light" ? "#ffffff" : "#12121c",
                border: mode === "light" ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: mode === "light" ? "0 2px 8px rgba(0,0,0,0.04)" : "0 4px 24px rgba(0,0,0,0.4)",
              },
            },
            MuiButton: {
              root: {
                borderRadius: 10,
                textTransform: "none",
                fontWeight: 600,
                letterSpacing: "-0.01em",
              },
              containedPrimary: {
                background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)",
                boxShadow: "0 4px 14px rgba(6, 182, 212, 0.25)",
                "&:hover": {
                  boxShadow: "0 6px 20px rgba(6, 182, 212, 0.35)",
                  filter: "brightness(1.08)",
                },
              },
            },
            MuiChip: {
              root: {
                borderRadius: 8,
                fontWeight: 600,
              },
            },
            MuiTab: {
              root: {
                borderRadius: 8,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
                transition: "all 0.2s ease",
              },
            },
            MuiTabs: {
              indicator: {
                backgroundColor: "#06b6d4",
                height: 3,
                borderRadius: "3px 3px 0 0",
              },
            },
            MuiSwitch: {
              colorPrimary: {
                "&$checked": {
                  color: "#06b6d4",
                },
                "&$checked + $track": {
                  backgroundColor: "#06b6d4",
                },
              },
            },
            MuiOutlinedInput: {
              root: {
                borderRadius: 12,
                "&:hover $notchedOutline": {
                  borderColor: "rgba(6, 182, 212, 0.4)",
                },
                "&$focused $notchedOutline": {
                  borderColor: "#06b6d4",
                  borderWidth: "1.5px",
                },
              },
            },
            MuiTableCell: {
              root: {
                borderColor: mode === "light" ? "#f1f5f9" : "rgba(255, 255, 255, 0.06)",
              },
              head: {
                fontWeight: 700,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: mode === "light" ? "#64748b" : "#94a3b8",
              },
            },
            MuiDialog: {
              paper: {
                borderRadius: 18,
                backgroundColor: mode === "light" ? "#ffffff" : "#12121c",
                border: mode === "light" ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 24px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(6, 182, 212, 0.1)",
              },
            },
            MuiTooltip: {
              tooltip: {
                borderRadius: 8,
                fontSize: "0.75rem",
                backgroundColor: mode === "light" ? "#0f172a" : "#1a1a2e",
                border: "1px solid rgba(6, 182, 212, 0.25)",
              },
            },
          },
          mode,
          appLogoLight,
          appLogoDark,
          appLogoFavicon,
          appName,
          calculatedLogoDark: () => {
            if (appLogoDark === defaultLogoDark && appLogoLight !== defaultLogoLight) {
              return appLogoLight;
            }
            return appLogoDark;
          },
          calculatedLogoLight: () => {
            if (appLogoDark !== defaultLogoDark && appLogoLight === defaultLogoLight) {
              return appLogoDark;
            }
            return appLogoLight;
          },
        },
        locale
      ),
    [appLogoLight, appLogoDark, appLogoFavicon, appName, locale, mode, primaryColorDark, primaryColorLight]
  );

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => {
        showInstallPrompt();
      }, 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const showInstallPrompt = () => {
    if (deferredPrompt) {
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          setDeferredPrompt(null);
        });
      }
    }
  };

  useEffect(() => {
    try {
      const i18nlocale = localStorage.getItem("i18nextLng") || "es";
      const browserLocale = i18nlocale.substring(0, 2);

      if (browserLocale === "es") {
        setLocale(esES);
      } else if (browserLocale === "pt") {
        setLocale(ptBR);
      }
    } catch (e) {
      setLocale(esES);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("preferredTheme", mode);
  }, [mode]);

  useEffect(() => {
    const loadWhiteLabelSettings = async () => {
      const settingsConfig = [
        { key: 'appName', setter: setAppName, defaultValue: 'Gissap CRM', cache: true },
        { key: 'primaryColorLight', setter: setPrimaryColorLight, defaultValue: '#06b6d4', cache: true },
        { key: 'primaryColorDark', setter: setPrimaryColorDark, defaultValue: '#06b6d4', cache: true },
        { key: 'appLogoLight', setter: setAppLogoLight, defaultValue: defaultLogoLight, cache: true, isFile: true },
        { key: 'appLogoDark', setter: setAppLogoDark, defaultValue: defaultLogoDark, cache: true, isFile: true },
        { key: 'appLogoFavicon', setter: setAppLogoFavicon, defaultValue: defaultLogoFavicon, cache: true, isFile: true }
      ];

      settingsConfig.forEach(({ key, setter, defaultValue, cache, isFile }) => {
        if (cache) {
          const cachedValue = localStorage.getItem(key);
          if (cachedValue && cachedValue !== 'null' && cachedValue !== 'undefined') {
            const value = isFile && !cachedValue.startsWith('http') && !cachedValue.startsWith('/')
              ? getBackendUrl() + "/public/" + cachedValue
              : cachedValue;

            setter(value);

            if (key === 'appName') {
              document.title = cachedValue;
            }
          }
        }
      });

      const promises = settingsConfig.map(({ key }) =>
        getPublicSetting(key).catch(error => null)
      );

      const results = await Promise.allSettled(promises);

      results.forEach((result, index) => {
        const { key, setter, defaultValue, cache, isFile } = settingsConfig[index];

        if (result.status === 'fulfilled' && result.value !== null) {
          let value = result.value || defaultValue;

          if (isFile && value && !value.startsWith('http') && !value.startsWith('/')) {
            value = getBackendUrl() + "/public/" + value;
          } else if (isFile && !value) {
            value = defaultValue;
          }

          setter(value);

          if (cache) {
            localStorage.setItem(key, result.value || defaultValue);
          }

          if (key === 'appName') {
            document.title = result.value || defaultValue;
          }
        } else {
          const cachedValue = localStorage.getItem(key);
          if (!cachedValue) {
            let value = defaultValue;
            setter(value);
          }
        }
      });
    };

    loadWhiteLabelSettings();
  }, []);

  useEffect(() => {
    if (appName && appName !== 'null' && appName !== 'undefined') {
      document.title = appName;
    }
  }, [appName]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primaryColor", mode === "light" ? primaryColorLight : primaryColorDark);
  }, [primaryColorLight, primaryColorDark, mode]);

  useEffect(() => {
    async function fetchVersionData() {
      try {
        const response = await api.get("/version");
        const { data } = response;
        window.localStorage.setItem("frontendVersion", data.version);
      } catch (error) {}
    }
    fetchVersionData();
  }, []);

  return (
    <>
      <Favicon url={appLogoFavicon ? (appLogoFavicon.startsWith('/') ? appLogoFavicon : getBackendUrl() + "/public/" + appLogoFavicon) : defaultLogoFavicon} />
      <ColorModeContext.Provider value={{ colorMode }}>
        <ThemeProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <ActiveMenuProvider>
              <div style={{ position: "relative", overflow: "hidden", zIndex: 0, height: "100vh" }}>
                <Routes />
              </div>
            </ActiveMenuProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </>
  );
};

export default App;