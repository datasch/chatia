import React, { useState, useContext, useEffect, useMemo } from "react";
import clsx from "clsx";

import {
  makeStyles,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  MenuItem,
  IconButton,
  Menu,
  useTheme,
  useMediaQuery,
  Avatar,
  Badge,
  withStyles,
  Chip,
} from "@material-ui/core";

// Custom menu icon (hamburger)
const CustomMenuIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 6L20 6" />
    <path d="M4 12L16 12" />
    <path d="M4 18L12 18" />
  </svg>
);

// Custom refresh icon
const RefreshIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20.5 5.5H9.5C5.78672 5.5 3 8.18503 3 12" />
    <path d="M3.5 18.5H14.5C18.2133 18.5 21 15.815 21 12" />
    <path d="M18.5 3C18.5 3 21 4.84122 21 5.50002C21 6.15882 18.5 8 18.5 8" />
    <path d="M5.49998 16C5.49998 16 3.00001 17.8412 3 18.5C2.99999 19.1588 5.5 21 5.5 21" />
  </svg>
);

import MainListItems from "./MainListItems";
import NotificationsPopOver from "../components/NotificationsPopOver";
import NotificationsVolume from "../components/NotificationsVolume";
import UserModal from "../components/UserModal";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";
import { i18n } from "../translate/i18n";
import toastError from "../errors/toastError";
import AnnouncementsPopover from "../components/AnnouncementsPopover";
import ChatPopover from "../pages/Chat/ChatPopover";

import { useDate } from "../hooks/useDate";
import UserLanguageSelector from "../components/UserLanguageSelector";

import ColorModeContext from "./themeContext";
import { getBackendUrl } from "../config";
import useSettings from "../hooks/useSettings";
import VersionControl from "../components/VersionControl";

const logo = "/logo-light.png";
const logoDark = "/logo-dark.png";

const backendUrl = getBackendUrl();
const drawerWidth = 240;
const drawerWidthCollapsed = 72;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100vh",
    [theme.breakpoints.down("sm")]: {
      height: "calc(100vh - 56px)",
    },
    backgroundColor: theme.palette.background.default,
  },

  chip: {
    background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
    color: "white",
    fontWeight: 600,
    fontSize: "11px",
    borderRadius: 6,
  },
  avatar: { width: "100%" },

  toolbar: {
    paddingRight: 24,
    color: theme.mode === "light" ? "#0f172a" : "#f8fafc",
    background: "transparent",
    gap: theme.spacing(1),
    overflow: "visible",
    position: "relative",
    zIndex: 1,
    minHeight: 56,
    [theme.breakpoints.down("sm")]: {
      paddingRight: theme.spacing(1),
      paddingLeft: theme.spacing(1),
      minHeight: 48,
      gap: theme.spacing(0.5),
      display: "flex",
      alignItems: "center",
      flexWrap: "nowrap",
    },
  },

  topbarScroller: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flex: "1 1 0%",
    minWidth: 0,
    maxWidth: "100%",
    flexWrap: "nowrap",
    justifyContent: "flex-end",
    overflowX: "visible",
    "& > *": { flex: "0 0 auto" },
    [theme.breakpoints.down("sm")]: {
      justifyContent: "flex-start",
      overflowX: "auto",
      overflowY: "hidden",
      WebkitOverflowScrolling: "touch",
      touchAction: "pan-x",
      overscrollBehaviorX: "contain",
      msOverflowStyle: "none",
      scrollbarWidth: "none",
      "&::-webkit-scrollbar": { display: "none" },
    },
  },

  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px",
    minHeight: "56px",
    borderBottom: theme.mode === "light" ? "1px solid #f1f5f9" : "1px solid rgba(255, 255, 255, 0.06)",
    [theme.breakpoints.down("sm")]: { height: "48px" },
  },

  appBar: {
    zIndex: theme.zIndex.drawer - 1,
    marginLeft: drawerWidthCollapsed,
    width: `calc(100% - ${drawerWidthCollapsed}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    backgroundColor: theme.mode === "light" ? "rgba(255, 255, 255, 0.9)" : "rgba(10, 10, 15, 0.85)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderBottom: theme.mode === "light" ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: theme.mode === "light" ? "0 1px 4px rgba(0,0,0,0.04)" : "0 4px 20px rgba(0,0,0,0.4)",
    [theme.breakpoints.down("sm")]: {
      marginLeft: 0,
      width: "100%",
    },
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.down("sm")]: {
      marginLeft: 0,
      width: "100%",
    },
  },

  title: {
    flexGrow: 0,
    fontSize: 14,
    fontWeight: 500,
    color: theme.mode === "light" ? "#1e293b" : "#f8fafc",
    marginLeft: theme.spacing(1),
    "& b": {
      fontWeight: 600,
      color: theme.mode === "light" ? "#0284c7" : "#06b6d4",
    },
    [theme.breakpoints.down("sm")]: { display: "none" },
  },

  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    height: "100vh",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
    overflowY: "hidden",
    backgroundColor: theme.mode === "light" ? "#ffffff" : "#0d0d16",
    borderRight: theme.mode === "light" ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
    zIndex: theme.zIndex.drawer + 2,
    display: "flex",
    flexDirection: "column",
  },
  drawerPaperClose: {
    overflowX: "hidden",
    overflowY: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: { width: theme.spacing(9) },
  },

  appBarSpacer: { minHeight: 56 },

  content: { flex: 1, overflow: "hidden", position: "relative" },

  containerWithScroll: {
    flex: 1,
    overflowY: "scroll",
    overflowX: "hidden",
    ...theme.scrollbarStyles,
    "&::-webkit-scrollbar": { display: "none" },
    "-ms-overflow-style": "none",
    "scrollbar-width": "none",
  },

  logoImg: {
    height: 38,
    maxWidth: 160,
    objectFit: "contain",
    filter: theme.mode === "dark" ? "drop-shadow(0 2px 8px rgba(6, 182, 212, 0.25))" : "none",
  },

  logoMini: {
    width: 32,
    height: 32,
    objectFit: "contain",
    filter: theme.mode === "dark" ? "drop-shadow(0 2px 8px rgba(6, 182, 212, 0.35))" : "none",
  },

  avatar2: {
    width: 34,
    height: 34,
    cursor: "pointer",
    borderRadius: "50%",
    border: "2px solid #06b6d4",
    boxShadow: "0 0 10px rgba(6, 182, 212, 0.3)",
  },

  iconButtonModern: {
    padding: 8,
    borderRadius: 10,
    color: theme.mode === "light" ? "#475569" : "#cbd5e1",
    transition: "all 0.2s ease",
    "&:hover": {
      background: theme.mode === "light" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.08)",
      color: "#06b6d4",
    },
  },
}));

const StyledBadge = withStyles((theme) => ({
  badge: {
    backgroundColor: "#10b981",
    color: "#10b981",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "$ripple 1.4s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": { transform: "scale(.8)", opacity: 1 },
    "100%": { transform: "scale(2.4)", opacity: 0 },
  },
}))(Badge);

const LoggedInLayout = ({ children }) => {
  const classes = useStyles();
  const [userToken, setUserToken] = useState("disabled");
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { handleLogout, loading } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(() => {
    const saved = localStorage.getItem("drawerOpen");
    if (saved !== null) return saved === "true";
    return document.body.offsetWidth > 600;
  });
  const [drawerVariant, setDrawerVariant] = useState("permanent");
  const { user, socket } = useContext(AuthContext);

  const theme = useTheme();
  const { colorMode } = useContext(ColorModeContext);
  const greaterThenSm = useMediaQuery(theme.breakpoints.up("sm"));

  const [volume, setVolume] = useState(localStorage.getItem("volume") || 1);
  const { dateToClient } = useDate();
  const [profileUrl, setProfileUrl] = useState(null);

  const mainListItems = useMemo(
    () => <MainListItems drawerOpen={drawerOpen} collapsed={!drawerOpen} />,
    [user, drawerOpen]
  );

  const settings = useSettings();

  useEffect(() => {
    const getSetting = async () => {
      if (!user || !user.id) return;
      try {
        await settings.get("wtV");
        setUserToken("disabled");
      } catch (error) {
        if (error?.response?.status !== 401) {
          console.error("Error al buscar setting wtV:", error);
        }
      }
    };
    getSetting();
  }, []);

  useEffect(() => {
    if (document.body.offsetWidth > 600 && localStorage.getItem("drawerOpen") === null) {
      if (user.defaultMenu === "closed") setDrawerOpen(false);
      else setDrawerOpen(true);
    }
    if (user.defaultTheme === "dark" && theme.mode === "light") {
      colorMode.toggleColorMode();
    }
  }, [user.defaultMenu]);

  useEffect(() => {
    if (document.body.offsetWidth < 600) setDrawerVariant("temporary");
    else setDrawerVariant("permanent");
  }, [drawerOpen]);

  useEffect(() => {
    const companyId = user.companyId;
    const userId = user.id;
    if (companyId) {
      const ImageUrl = user.profileImage;
      if (ImageUrl !== undefined && ImageUrl !== null)
        setProfileUrl(`${backendUrl}/public/avatar/${ImageUrl}`);
      else setProfileUrl(`${process.env.FRONTEND_URL}/nopicture.png`);

      const onCompanyAuthLayout = (data) => {
        if (data.user.id === +userId) {
          toastError("Tu cuenta ha sido iniciada en otro dispositivo.");
          setTimeout(() => {
            localStorage.clear();
            window.location.reload();
          }, 1000);
        }
      };

      socket.on(`company-${companyId}-auth`, onCompanyAuthLayout);
      socket.emit("userStatus");
      const interval = setInterval(() => {
        socket.emit("userStatus");
      }, 1000 * 60 * 5);

      return () => {
        socket.off(`company-${companyId}-auth`, onCompanyAuthLayout);
        clearInterval(interval);
      };
    }
  }, [socket]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };
  const handleOpenUserModal = () => {
    setUserModalOpen(true);
    handleCloseMenu();
  };
  const handleClickLogout = () => {
    handleCloseMenu();
    handleLogout();
  };
  const drawerClose = () => {
    if (document.body.offsetWidth < 600) {
      setDrawerOpen(false);
    }
  };
  const handleRefreshPage = () => window.location.reload(false);

  if (loading) return <BackdropLoading />;

  const logoSrc =
    theme.mode === "light"
      ? (typeof theme.calculatedLogoLight === "function"
          ? theme.calculatedLogoLight()
          : logo)
      : (typeof theme.calculatedLogoDark === "function"
          ? theme.calculatedLogoDark()
          : logoDark);

  return (
    <div className={classes.root}>
      <Drawer
        variant={drawerVariant}
        className={drawerOpen ? classes.drawerPaper : classes.drawerPaperClose}
        classes={{
          paper: clsx(classes.drawerPaper, !drawerOpen && classes.drawerPaperClose),
        }}
        open={drawerOpen}
      >
        <div className={classes.toolbarIcon} style={drawerOpen ? { justifyContent: "space-between" } : { justifyContent: "center" }}>
          {drawerOpen ? (
            <img
              src={logoSrc}
              alt="Gissap CRM"
              className={classes.logoImg}
            />
          ) : (
            <img
              src="/giantucchi-ico.png"
              alt="Gissap"
              className={classes.logoMini}
            />
          )}
          <IconButton
            onClick={() => {
              const next = !drawerOpen;
              setDrawerOpen(next);
              localStorage.setItem("drawerOpen", String(next));
            }}
            className={classes.iconButtonModern}
            style={{ flexShrink: 0 }}
          >
            <CustomMenuIcon style={{ color: theme.mode === "dark" ? "#ffffff" : "#475569" }} />
          </IconButton>
        </div>
        <List className={classes.containerWithScroll} style={{ flex: 1, padding: "8px 0" }}>
          <MainListItems collapsed={!drawerOpen} />
        </List>
        <Divider style={{ backgroundColor: theme.mode === "dark" ? "rgba(255,255,255,0.08)" : "#e2e8f0" }} />
      </Drawer>

      <AppBar
        position="fixed"
        className={clsx(classes.appBar, drawerOpen && classes.appBarShift)}
        elevation={0}
      >
        <Toolbar variant="dense" className={classes.toolbar}>
          <Typography component="h2" variant="h6" noWrap className={classes.title}>
            {greaterThenSm && user?.profile === "admin" && user?.company?.dueDate ? (
              <>
                {i18n.t("mainDrawer.appBar.user.message")} <b>{user.name}</b>,{" "}
                {i18n.t("mainDrawer.appBar.user.messageEnd")} <b>{user?.company?.name}</b> (
                {i18n.t("mainDrawer.appBar.user.active")} {dateToClient(user?.company?.dueDate)})
              </>
            ) : (
              <>
                {i18n.t("mainDrawer.appBar.user.message")} <b>{user.name}</b>,{" "}
                {i18n.t("mainDrawer.appBar.user.messageEnd")} <b>{user?.company?.name}</b>
              </>
            )}
          </Typography>

          <div className={classes.topbarScroller}>
            {userToken === "enabled" && user?.companyId === 1 && (
              <Chip className={classes.chip} label={i18n.t("mainDrawer.appBar.user.token")} />
            )}

            <VersionControl />
            <UserLanguageSelector />

            <IconButton
              onClick={colorMode.toggleColorMode}
              className={classes.iconButtonModern}
              title={theme.mode === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {theme.mode === "dark" ? (
                <img
                  src="/theme/sol.png"
                  alt="Modo claro"
                  style={{ width: "20px", height: "20px" }}
                />
              ) : (
                <img
                  src="/theme/lua-clara.png"
                  alt="Modo oscuro"
                  style={{ width: "20px", height: "20px" }}
                />
              )}
            </IconButton>

            <NotificationsVolume setVolume={setVolume} volume={volume} />

            <IconButton
              onClick={handleRefreshPage}
              aria-label={i18n.t("mainDrawer.appBar.refresh")}
              className={classes.iconButtonModern}
            >
              <RefreshIcon style={{ color: theme.mode === "dark" ? "#cbd5e1" : "#475569" }} />
            </IconButton>

            {user.id && <NotificationsPopOver volume={volume} />}

            <AnnouncementsPopover />
            <ChatPopover />

            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
              onClick={handleMenu}
            >
              <Avatar alt="Gissap" className={classes.avatar2} src={profileUrl} />
            </StyledBadge>

            <UserModal
              open={userModalOpen}
              onClose={() => setUserModalOpen(false)}
              onImageUpdate={(newProfileUrl) => setProfileUrl(newProfileUrl)}
              userId={user?.id}
            />
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              getContentAnchorEl={null}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              open={menuOpen}
              onClose={handleCloseMenu}
              PaperProps={{
                style: {
                  borderRadius: 14,
                  backgroundColor: theme.mode === "dark" ? "#12121c" : "#ffffff",
                  border: theme.mode === "dark" ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                },
              }}
            >
              <MenuItem onClick={handleOpenUserModal}>{i18n.t("mainDrawer.appBar.user.profile")}</MenuItem>
              <MenuItem onClick={handleClickLogout}>{i18n.t("mainDrawer.appBar.user.logout")}</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>

      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        {children ? children : null}
      </main>
    </div>
  );
};

export default LoggedInLayout;
