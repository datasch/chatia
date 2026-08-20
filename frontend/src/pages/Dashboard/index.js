import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Paper,
  Stack,
  SvgIcon,
  Tab,
  Tabs,
  Grid,
  Divider
} from "@mui/material";
import {
  Groups,
  Call as CallIcon,
  HourglassEmpty as HourglassEmptyIcon,
  CheckCircle as CheckCircleIcon,
  RecordVoiceOver as RecordVoiceOverIcon,
  GroupAdd as GroupAddIcon,
  Star,
} from "@mui/icons-material";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { isArray } from "lodash";
import { AuthContext } from "../../context/Auth/AuthContext";
import useDashboard from "../../hooks/useDashboard";
import { ChatsUser } from "./ChartsUser";
import ChartDonut from "./ChartDonut";
import { ChartsDate } from "./ChartsDate";
import ForbiddenPage from "../../components/ForbiddenPage";
import { i18n } from "../../translate/i18n";
import { useTheme as useThemeV4 } from "@material-ui/core/styles";
import { useTheme as useThemeV5 } from "@mui/material/styles";

const StatCard = ({ title, value, icon, gradient, color }) => (
  <Card
    sx={{
      height: "100%",
      borderRadius: 3,
      background: (theme) =>
        theme.palette.mode === "dark"
          ? "linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(18, 18, 28, 0.8) 100%)"
          : "#ffffff",
      backdropFilter: "blur(12px)",
      border: (theme) =>
        theme.palette.mode === "dark"
          ? "1px solid rgba(255, 255, 255, 0.08)"
          : "1px solid #e2e8f0",
      boxShadow: (theme) =>
        theme.palette.mode === "dark"
          ? "0 4px 20px rgba(0,0,0,0.3)"
          : "0 2px 8px rgba(0,0,0,0.04)",
      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        transform: "translateY(-3px)",
        borderColor: color || "#06b6d4",
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? `0 8px 30px rgba(0,0,0,0.5), 0 0 15px ${color}33`
            : "0 8px 24px rgba(0,0,0,0.08)",
      }
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
        <Box>
          <Typography
            variant="overline"
            sx={{
              fontWeight: 700,
              letterSpacing: "0.6px",
              color: "text.secondary",
              fontSize: "0.7rem",
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.02em",
              mt: 0.5,
            }}
          >
            {value}
          </Typography>
        </Box>
        <Avatar
          sx={{
            background: gradient || color || "#06b6d4",
            color: "#fff",
            width: 50,
            height: 50,
            boxShadow: `0 4px 14px ${color}40`,
          }}
        >
          <SvgIcon>{icon}</SvgIcon>
        </Avatar>
      </Stack>
    </CardContent>
  </Card>
);

const NpsMetricCard = ({ title, value, color }) => (
  <Card
    sx={{
      height: "100%",
      textAlign: "center",
      p: 2.5,
      borderRadius: 3,
      background: (theme) =>
        theme.palette.mode === "dark"
          ? "rgba(18, 18, 28, 0.7)"
          : "#ffffff",
      border: (theme) =>
        theme.palette.mode === "dark"
          ? "1px solid rgba(255, 255, 255, 0.08)"
          : "1px solid #e2e8f0",
      boxShadow: "none",
    }}
  >
    <Typography variant="overline" color="text.secondary" fontWeight={600}>{title}</Typography>
    <Typography variant="h3" fontWeight={800} sx={{ color, my: 1 }}>{value}%</Typography>
    <Box sx={{ height: 6, backgroundColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "grey.200", borderRadius: 3, overflow: "hidden" }}>
      <Box sx={{ height: "100%", width: `${value}%`, backgroundColor: color, borderRadius: 3 }} />
    </Box>
  </Card>
);

const Dashboard = () => {
  const themeV5 = useThemeV5();
  const themeV4 = useThemeV4();

  const PRIMARY_MAIN = themeV4?.palette?.primary?.main || "#06b6d4";

  const [counters, setCounters] = useState({});
  const [attendants, setAttendants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const { find } = useDashboard();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {
          date_from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
          date_to: new Date().toISOString().slice(0, 10)
        };
        const data = await find(params);
        setCounters(data.counters);
        if (isArray(data.attendants)) setAttendants(data.attendants);
      } catch (error) {
        toast.error(i18n.t("dashboard.errors.loadData"));
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const getOnlineUsersCount = () => attendants.filter(u => u.online).length;

  if (user.profile === "user" && user.showDashboard === "disabled") {
    return <ForbiddenPage />;
  }

  const statCards = [
    {
      title: i18n.t("dashboard.cards.inAttendance"),
      value: counters.supportHappening || 0,
      icon: <CallIcon />,
      color: "#06b6d4",
      gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
    },
    {
      title: i18n.t("dashboard.cards.waiting"),
      value: counters.supportPending || 0,
      icon: <HourglassEmptyIcon />,
      color: "#f97316",
      gradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
    },
    {
      title: i18n.t("dashboard.cards.finalized"),
      value: counters.supportFinished || 0,
      icon: <CheckCircleIcon />,
      color: "#10b981",
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    },
    {
      title: i18n.t("dashboard.cards.groups"),
      value: counters.supportGroups || 0,
      icon: <Groups />,
      color: "#8b5cf6",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    },
    {
      title: i18n.t("dashboard.cards.activeAttendants"),
      value: `${getOnlineUsersCount()}/${attendants.length}`,
      icon: <RecordVoiceOverIcon />,
      color: "#3b82f6",
      gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    },
    {
      title: i18n.t("dashboard.cards.newContacts"),
      value: counters.leads || 0,
      icon: <GroupAddIcon />,
      color: "#ec4899",
      gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
    }
  ];

  const npsData = {
    score: counters.npsScore || 0,
    promoters: counters.npsPromotersPerc || 0,
    passives: counters.npsPassivePerc || 0,
    detractors: counters.npsDetractorsPerc || 0,
    totalTickets: counters.tickets || 0,
    withRating: counters.withRating || 0,
    percRating: counters.percRating || 0
  };

  const npsColors = {
    [i18n.t("dashboard.assessments.prosecutors")]: "#10b981",
    [i18n.t("dashboard.assessments.detractors")]: "#ef4444",
    [i18n.t("dashboard.assessments.neutral")]: "#eab308"
  };
  const npsChartData = [
    { name: i18n.t("dashboard.assessments.prosecutors"), value: npsData.promoters },
    { name: i18n.t("dashboard.assessments.detractors"), value: npsData.detractors },
    { name: i18n.t("dashboard.assessments.neutral"), value: npsData.passives }
  ].sort((a, b) => a.name.localeCompare(b.name));
  const sortedNpsColors = npsChartData.map(item => npsColors[item.name]);

  return (
    <Box
      sx={{
        backgroundColor: "background.default",
        minHeight: "100vh",
        py: 4,
        px: { xs: 1, sm: 2 }
      }}
    >
      <Container maxWidth="xl">
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {i18n.t("dashboard.title") || "Dashboard"}
        </Typography>

        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
              <StatCard {...card} />
            </Grid>
          ))}
        </Grid>

        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 3,
            bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(18, 18, 28, 0.6)" : "#ffffff",
            border: (theme) => theme.palette.mode === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
            p: 0.5,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, nv) => setActiveTab(nv)}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                fontWeight: 700,
                textTransform: "uppercase",
                fontSize: "0.85rem",
                letterSpacing: "0.04em",
                borderRadius: 2,
                color: "text.secondary",
                transition: "all 0.2s ease",
                "&.Mui-selected": {
                  color: "#06b6d4",
                  background: (theme) => theme.palette.mode === "dark" ? "rgba(6, 182, 212, 0.12)" : "rgba(6, 182, 212, 0.08)",
                }
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#06b6d4",
                height: 3,
                borderRadius: "2px",
              }
            }}
          >
            <Tab label={i18n.t("dashboard.tabs.performance")} />
            <Tab label="NPS" />
            <Tab label={i18n.t("dashboard.tabs.attendants")} />
          </Tabs>
        </Paper>

        <Box>
          {activeTab === 0 && (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                bgcolor: "background.paper",
                border: (theme) => theme.palette.mode === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
              }}
            >
              <ChartsDate />
            </Paper>
          )}

          {activeTab === 1 && (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                bgcolor: "background.paper",
                border: (theme) => theme.palette.mode === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar sx={{ bgcolor: "rgba(6, 182, 212, 0.15)", color: "#06b6d4", mr: 2, width: 44, height: 44 }}>
                  <Star />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">{i18n.t("dashboard.tabs.assessments")}</Typography>
              </Box>
              <Divider sx={{ my: 2, borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "#e2e8f0" }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      p: 3,
                      borderRadius: 3,
                      bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(18, 18, 28, 0.6)" : "#ffffff",
                      border: (theme) => theme.palette.mode === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
                    }}
                  >
                    <Typography variant="overline" color="text.secondary" fontWeight={700}>
                      {i18n.t("dashboard.assessments.generalScore")}
                    </Typography>
                    <ChartDonut data={npsChartData} value={npsData.score} colors={sortedNpsColors} />
                  </Card>
                </Grid>

                <Grid item container xs={12} md={8} spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <NpsMetricCard title={i18n.t("dashboard.assessments.prosecutors")} value={npsData.promoters} color={npsColors[i18n.t("dashboard.assessments.prosecutors")]} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <NpsMetricCard title={i18n.t("dashboard.assessments.neutral")} value={npsData.passives} color={npsColors[i18n.t("dashboard.assessments.neutral")]} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <NpsMetricCard title={i18n.t("dashboard.assessments.detractors")} value={npsData.detractors} color={npsColors[i18n.t("dashboard.assessments.detractors")]} />
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          )}

          {activeTab === 2 && (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                bgcolor: "background.paper",
                border: (theme) => theme.palette.mode === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
              }}
            >
              <ChatsUser />
            </Paper>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;
